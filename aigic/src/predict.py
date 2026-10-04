"""
predict.py
Continuous Churn Risk Scoring Engine (0% to 100%).
Performs single-customer and batch predictions, extracts individual factor attributions,
and generates tailored, high-ROI retention offers.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np

from src.preprocessing import engineer_features, get_feature_lists, METADATA_PATH
from src.retention_strategy import recommend_retention_plan, get_risk_tier

MODEL_PATH = os.path.join("models", "model.pkl")


class ChurnRiskPredictor:
    """
    Production-ready Risk Scoring Engine for Telecom Customer Churn.
    """

    def __init__(self, model_path: str = MODEL_PATH, metadata_path: str = METADATA_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found at {model_path}. Run 'python -m src.train' first.")
        if not os.path.exists(metadata_path):
            raise FileNotFoundError(f"Metadata not found at {metadata_path}. Run 'python -m src.preprocessing' first.")

        self.pipeline = joblib.load(model_path)
        with open(metadata_path, "r") as f:
            self.metadata = json.load(f)

        self.median_total_charges = self.metadata.get("median_total_charges", 1398.0)
        self.categorical_cols, self.numerical_cols = get_feature_lists()
        self.all_features = self.numerical_cols + self.categorical_cols

    def _format_input(self, raw_data) -> pd.DataFrame:
        if isinstance(raw_data, dict):
            df = pd.DataFrame([raw_data])
        elif isinstance(raw_data, pd.DataFrame):
            df = raw_data.copy()
        elif isinstance(raw_data, list):
            df = pd.DataFrame(raw_data)
        else:
            raise TypeError("Input data must be a dictionary, pandas DataFrame, or list of dictionaries.")

        # Ensure required columns exist, populate sensible defaults if missing
        defaults = {
            "gender": "Female",
            "SeniorCitizen": 0,
            "Partner": "No",
            "Dependents": "No",
            "tenure": 1,
            "PhoneService": "Yes",
            "MultipleLines": "No",
            "InternetService": "DSL",
            "OnlineSecurity": "No",
            "OnlineBackup": "No",
            "DeviceProtection": "No",
            "TechSupport": "No",
            "StreamingTV": "No",
            "StreamingMovies": "No",
            "Contract": "Month-to-month",
            "PaperlessBilling": "Yes",
            "PaymentMethod": "Electronic check",
            "MonthlyCharges": 50.0,
            "TotalCharges": 50.0,
        }
        for col, default_val in defaults.items():
            if col not in df.columns:
                df[col] = default_val

        # Engineer features using verified training median
        df_engineered, _ = engineer_features(df, median_total_charges=self.median_total_charges)
        return df_engineered

    def explain_individual_drivers(self, row: pd.Series) -> list[dict]:
        """
        Determines key risk drivers that pushed this individual customer's
        score higher (risk factors) or lower (protective factors).
        """
        drivers = []
        contract = str(row.get("Contract", "Month-to-month"))
        tenure = float(row.get("tenure", 1))
        monthly = float(row.get("MonthlyCharges", 50))
        internet = str(row.get("InternetService", "DSL"))
        tech_support = str(row.get("TechSupport", "No"))
        online_security = str(row.get("OnlineSecurity", "No"))
        payment = str(row.get("PaymentMethod", "Electronic check"))

        # 1. Contract Driver
        if contract == "Month-to-month":
            drivers.append({"factor": "Month-to-month Contract", "impact": "High Risk (+)", "detail": "Lack of commitment allows instant churn."})
        elif contract in ["One year", "Two year"]:
            drivers.append({"factor": f"{contract} Contract", "impact": "Protective (-)", "detail": "Long-term agreement locks in retention."})

        # 2. Tenure Driver
        if tenure <= 12:
            drivers.append({"factor": f"New Customer ({int(tenure)} months tenure)", "impact": "High Risk (+)", "detail": "Highest attrition occurs in year 1."})
        elif tenure >= 36:
            drivers.append({"factor": f"Established Account ({int(tenure)} months tenure)", "impact": "Protective (-)", "detail": "Long relationship builds brand loyalty."})

        # 3. Monthly Charges Driver
        if monthly >= 80:
            drivers.append({"factor": f"High Monthly Bill (${monthly:.2f})", "impact": "Moderate Risk (+)", "detail": "Price sensitivity increases churn hazard."})
        elif monthly <= 35:
            drivers.append({"factor": f"Low Monthly Bill (${monthly:.2f})", "impact": "Protective (-)", "detail": "Affordable service keeps switching costs high."})

        # 4. Internet Service & Support Add-ons
        if internet == "Fiber optic" and tech_support == "No":
            drivers.append({"factor": "Fiber Optic without Tech Support", "impact": "High Risk (+)", "detail": "High-speed users facing unresolved issues churn rapidly."})

        if online_security == "No" and tech_support == "No" and internet != "No":
            drivers.append({"factor": "Missing Digital Support Add-ons", "impact": "Moderate Risk (+)", "detail": "Lack of sticky digital services lowers switching friction."})

        # 5. Payment Method
        if "automatic" in payment.lower():
            drivers.append({"factor": "Automatic Payment Active", "impact": "Protective (-)", "detail": "Frictionless payment reduces voluntary churn."})
        elif "electronic check" in payment.lower():
            drivers.append({"factor": "Electronic Check Billing", "impact": "Moderate Risk (+)", "detail": "Manual payment prompts monthly reassessment of value."})

        return drivers

    def predict(self, raw_data) -> list[dict]:
        """
        Executes prediction pipeline on customer profile(s).
        Returns continuous probability, risk tier, explanations, and retention recommendation.
        """
        df_clean = self._format_input(raw_data)
        X = df_clean[self.all_features]

        probabilities = self.pipeline.predict_proba(X)[:, 1]
        binary_predictions = self.pipeline.predict(X)

        results = []
        for idx, prob in enumerate(probabilities):
            prob_float = float(prob)
            row_dict = df_clean.iloc[idx].to_dict()
            drivers = self.explain_individual_drivers(df_clean.iloc[idx])
            retention_plan = recommend_retention_plan(row_dict, prob_float)

            results.append({
                "churn_probability": round(prob_float, 4),
                "churn_probability_pct": f"{prob_float * 100:.2f}%",
                "predicted_churn_binary": int(binary_predictions[idx]),
                "risk_tier": get_risk_tier(prob_float),
                "individual_drivers": drivers,
                "retention_plan": retention_plan,
            })

        return results


def run_demo_predictions():
    """
    Demonstrates the Risk Scoring Engine on High, Medium, and Low risk customer profiles.
    """
    print("=" * 60)
    print("CONTINUOUS CHURN RISK SCORING ENGINE DEMONSTRATION")
    print("=" * 60)

    predictor = ChurnRiskPredictor()

    test_profiles = [
        {
            "name": "Profile A: High Risk New Fiber User",
            "data": {
                "gender": "Female",
                "SeniorCitizen": 0,
                "Partner": "No",
                "Dependents": "No",
                "tenure": 2,
                "PhoneService": "Yes",
                "MultipleLines": "No",
                "InternetService": "Fiber optic",
                "OnlineSecurity": "No",
                "OnlineBackup": "No",
                "DeviceProtection": "No",
                "TechSupport": "No",
                "StreamingTV": "Yes",
                "StreamingMovies": "Yes",
                "Contract": "Month-to-month",
                "PaperlessBilling": "Yes",
                "PaymentMethod": "Electronic check",
                "MonthlyCharges": 94.85,
                "TotalCharges": 189.70,
            }
        },
        {
            "name": "Profile B: Medium Risk Growing Account",
            "data": {
                "gender": "Male",
                "SeniorCitizen": 0,
                "Partner": "Yes",
                "Dependents": "No",
                "tenure": 18,
                "PhoneService": "Yes",
                "MultipleLines": "Yes",
                "InternetService": "DSL",
                "OnlineSecurity": "No",
                "OnlineBackup": "Yes",
                "DeviceProtection": "No",
                "TechSupport": "No",
                "StreamingTV": "No",
                "StreamingMovies": "No",
                "Contract": "Month-to-month",
                "PaperlessBilling": "Yes",
                "PaymentMethod": "Credit card (automatic)",
                "MonthlyCharges": 58.20,
                "TotalCharges": 1047.60,
            }
        },
        {
            "name": "Profile C: Low Risk Loyal Family Account",
            "data": {
                "gender": "Male",
                "SeniorCitizen": 0,
                "Partner": "Yes",
                "Dependents": "Yes",
                "tenure": 60,
                "PhoneService": "Yes",
                "MultipleLines": "Yes",
                "InternetService": "DSL",
                "OnlineSecurity": "Yes",
                "OnlineBackup": "Yes",
                "DeviceProtection": "Yes",
                "TechSupport": "Yes",
                "StreamingTV": "Yes",
                "StreamingMovies": "Yes",
                "Contract": "Two year",
                "PaperlessBilling": "No",
                "PaymentMethod": "Bank transfer (automatic)",
                "MonthlyCharges": 72.40,
                "TotalCharges": 4344.00,
            }
        }
    ]

    for item in test_profiles:
        name = item["name"]
        customer = item["data"]
        res = predictor.predict(customer)[0]

        print(f"\n{'-' * 50}")
        print(f"CUSTOMER: {name}")
        print(f"{'-' * 50}")
        print(f"  Continuous Churn Probability: {res['churn_probability_pct']}")
        print(f"  Assigned Risk Tier:          [{res['risk_tier']}]")
        print(f"  Predicted Classification:    {'CHURN (1)' if res['predicted_churn_binary'] == 1 else 'RETAINED (0)'}")

        print("\n  Top Contributing Drivers:")
        for d in res["individual_drivers"]:
            print(f"   * [{d['impact']}] {d['factor']}: {d['detail']}")

        plan = res["retention_plan"]
        print("\n  Actionable Retention Strategy:")
        print(f"   * Urgency Level:      {plan['urgency']}")
        print(f"   * Revenue at Risk:    ${plan['annual_revenue_at_risk']:.2f}/year")
        print(f"   * Recommended Offer:  {plan['primary_retention_offer']}")
        print(f"   * Est. Budget Cost:   ${plan['estimated_intervention_cost']:.2f}")
        print(f"   * Strategic Expected ROI: {plan['expected_roi']}")


if __name__ == "__main__":
    run_demo_predictions()
