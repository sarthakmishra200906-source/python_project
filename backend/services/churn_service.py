"""Adapter for the trained aigic churn-risk model."""
import os
import sys
from datetime import datetime

_predictor = None
_predictor_error = None


def _get_predictor():
    global _predictor, _predictor_error
    if _predictor is not None or _predictor_error is not None:
        return _predictor

    project_aigic = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "aigic"))
    sibling_aigic = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "aigic"))
    aigic_path = os.getenv("AIGIC_PATH") or (project_aigic if os.path.exists(project_aigic) else sibling_aigic)
    if aigic_path not in sys.path:
        sys.path.insert(0, aigic_path)
    try:
        from src.predict import ChurnRiskPredictor
        _predictor = ChurnRiskPredictor(
            model_path=os.path.join(aigic_path, "models", "model.pkl"),
            metadata_path=os.path.join(aigic_path, "models", "feature_metadata.json"),
        )
    except Exception as error:
        _predictor_error = str(error)
    return _predictor


def _customer_features(customer: dict) -> dict:
    network = (customer.get("network_type") or "4G").lower()
    plan = (customer.get("plan_name") or "").lower()
    transaction_count = int(customer.get("transaction_count") or 0)
    monthly_charges = float(customer.get("monthly_charges") or 50)
    validity_days = int(customer.get("validity_days") or 28)
    created_at = customer.get("created_at")
    if isinstance(created_at, datetime):
        tenure = max(1, (datetime.now() - created_at).days // 30)
    else:
        tenure = max(1, transaction_count * 3)

    if network == "2g":
        internet_service = "No"
        contract = "Two year"
        tenure = max(36, tenure)
        monthly_charges = min(monthly_charges, 25)
        payment_method = "Bank transfer (automatic)"
        tech_support = "Yes"
    elif network == "3g":
        internet_service = "DSL"
        contract = "One year"
        tenure = max(18, tenure)
        monthly_charges = min(monthly_charges, 45)
        payment_method = "Credit card (automatic)"
        tech_support = "Yes"
    elif "airfiber" in network:
        internet_service = "DSL"
        contract = "One year"
        tenure = max(12, tenure)
        monthly_charges = max(70, monthly_charges)
        payment_method = "Credit card (automatic)"
        tech_support = "Yes"
    elif "fiber" in network or "fiber" in plan:
        internet_service = "Fiber optic"
        contract = "Month-to-month"
        monthly_charges = max(90, monthly_charges)
        payment_method = "Electronic check"
        tech_support = "No"
    elif "air" in network:
        internet_service = "DSL"
        contract = "One year"
        payment_method = "Credit card (automatic)"
        tech_support = "Yes"
    else:
        internet_service = "No" if network in {"2g", "3g"} else "DSL"
        contract = "Two year" if validity_days >= 84 else "One year" if validity_days >= 56 else "Month-to-month"
        payment_method = "Electronic check"
        tech_support = "No"
    return {
        "gender": "Female",
        "SeniorCitizen": 0,
        "Partner": "Yes" if network in {"2g", "3g"} else "No",
        "Dependents": "Yes" if network == "2g" else "No",
        "tenure": tenure,
        "PhoneService": "Yes",
        "MultipleLines": "No",
        "InternetService": internet_service,
        "OnlineSecurity": "Yes" if network in {"2g", "3g"} else "No",
        "OnlineBackup": "No",
        "DeviceProtection": "No",
        "TechSupport": tech_support,
        "StreamingTV": "No",
        "StreamingMovies": "No",
        "Contract": contract,
        "PaperlessBilling": "Yes",
        "PaymentMethod": payment_method,
        "MonthlyCharges": monthly_charges,
        "TotalCharges": monthly_charges * tenure,
    }


def score_customers(customers: list[dict]) -> dict:
    predictor = _get_predictor()
    if predictor is None:
        return {"available": False, "error": _predictor_error, "customers": [], "counts": {}}

    scored = []
    model_inputs = [_customer_features(customer) for customer in customers]
    results = predictor.predict(model_inputs)
    for customer, result in zip(customers, results):
        scored.append({
            "id": customer["id"],
            "name": customer["name"],
            "phone": customer["phone"],
            "network_type": customer.get("network_type") or "4G",
            "plan_name": customer.get("plan_name") or "No Active Plan",
            "churn_probability": result["churn_probability"],
            "churn_probability_pct": result["churn_probability_pct"],
            "risk_tier": result["risk_tier"],
            "retention_plan": result["retention_plan"],
            "individual_drivers": result["individual_drivers"],
        })

    scored.sort(key=lambda item: item["churn_probability"], reverse=True)
    counts = {tier: sum(item["risk_tier"] == tier for item in scored) for tier in ["HIGH", "MEDIUM", "LOW"]}
    return {"available": True, "customers": scored[:20], "counts": counts}
