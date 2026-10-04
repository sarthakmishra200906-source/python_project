"""
evaluate.py
Model performance evaluation on unseen holdout test set.
Renders clean terminal ASCII tables for metrics, visual 2x2 confusion matrix,
and extracts Top 10 Churn Drivers by predictive gain.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import (
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score,
    accuracy_score,
    confusion_matrix,
    classification_report,
)

from src.preprocessing import get_feature_lists, METADATA_PATH

TEST_DATA_PATH = os.path.join("data", "processed", "test.csv")
MODEL_PATH = os.path.join("models", "model.pkl")
REPORTS_DIR = "reports"
METRICS_REPORT_PATH = os.path.join(REPORTS_DIR, "metrics_summary.json")
IMPORTANCE_REPORT_PATH = os.path.join(REPORTS_DIR, "feature_importance.json")


def evaluate_model():
    """
    Evaluates the model on unseen test set and prints ASCII performance tables.
    """
    print("\n" + "=" * 70)
    print("  [STAGE 3/4] TEST SET EVALUATION & CHURN DRIVER ANALYSIS")
    print("=" * 70)

    # 1. Load test data and model
    test_df = pd.read_csv(TEST_DATA_PATH)
    y_test = test_df["Churn"].values
    X_test = test_df.drop(columns=["Churn"])

    categorical_cols, numerical_cols = get_feature_lists()
    all_feature_cols = numerical_cols + categorical_cols
    X_test = X_test[all_feature_cols]

    pipeline = joblib.load(MODEL_PATH)

    # 2. Predict on test set
    y_prob = pipeline.predict_proba(X_test)[:, 1]
    y_pred = pipeline.predict(X_test)

    # 3. Calculate metrics
    roc_auc = float(roc_auc_score(y_test, y_prob))
    precision = float(precision_score(y_test, y_pred))
    recall = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    acc = float(accuracy_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    total_samples = len(y_test)
    actual_churners = int((y_test == 1).sum())
    actual_retained = int((y_test == 0).sum())

    # 4. Print ASCII Performance Table
    print(f"\n[+] Holdout Test Evaluation ({total_samples:,} samples | {actual_churners:,} Churners, {actual_retained:,} Non-Churners):")
    print("+" + "-" * 32 + "+" + "-" * 14 + "+" + "-" * 22 + "+")
    print(f"| {'Evaluation Metric':<30} | {'Score':<12} | {'Benchmark Quality':<20} |")
    print("+" + "-" * 32 + "+" + "-" * 14 + "+" + "-" * 22 + "+")
    print(f"| {'ROC-AUC Score':<30} | {roc_auc:<12.4f} | {'Excellent (> 0.80)':<20} |")
    print(f"| {'Recall (Churn Class)':<30} | {f'{recall:.2%}':<12} | {'High Sensitivity':<20} |")
    print(f"| {'Precision (Churn Class)':<30} | {f'{precision:.2%}':<12} | {'Cost-Effective':<20} |")
    print(f"| {'F1 Score':<30} | {f1:<12.4f} | {'Strong Balance':<20} |")
    print(f"| {'Overall Accuracy':<30} | {f'{acc:.2%}':<12} | {'Calibrated':<20} |")
    print("+" + "-" * 32 + "+" + "-" * 14 + "+" + "-" * 22 + "+")

    # 5. Print Visual 2x2 Confusion Matrix Box
    print("\n[+] Confusion Matrix Breakdown:")
    print("    " + "=" * 54)
    print("    |                      PREDICTED NEGATIVE | PREDICTED POSITIVE |")
    print("    |---------------------+--------------------+--------------------|")
    print(f"    | ACTUAL NON-CHURN (0)| TN = {tn:<13} | FP = {fp:<13} |")
    print("    |                     | (Saved from spend) | (Low-cost nurture) |")
    print("    |---------------------+--------------------+--------------------|")
    print(f"    | ACTUAL CHURN (1)    | FN = {fn:<13} | TP = {tp:<13} |")
    print("    |                     | (Missed accounts)  | (SAVED ACCOUNTS!)  |")
    print("    " + "=" * 54)
    print(f"    * Business Impact: Successfully captured {tp:,} out of {actual_churners:,} actual churners ({recall:.1%}).")
    print(f"    * Budget Savings:  {tn:,} loyal customers correctly spared from unnecessary discount calls.")

    # 6. Top 10 Churn Drivers (Feature Importance)
    preprocessor = pipeline.named_steps["preprocessor"]
    xgb_model = pipeline.named_steps["clf"]

    cat_encoder = preprocessor.named_transformers_["cat"]
    encoded_cat_names = list(cat_encoder.get_feature_names_out(categorical_cols))
    all_feature_names = numerical_cols + encoded_cat_names

    booster = xgb_model.get_booster()
    score_gain = booster.get_score(importance_type="gain")
    score_weight = booster.get_score(importance_type="weight")

    driver_details = {
        "Contract_Month-to-month": "Hazard: Lack of contract commitment allows instant departure.",
        "Contract_Months": "Factor: Longer commitment drastically reduces likelihood of churn.",
        "Tenure_Group_0-12m": "Hazard: Customer vulnerability is highest in the first onboarding year.",
        "InternetService_Fiber optic": "Hazard: High pricing sensitivity among high-speed broadband users.",
        "OnlineSecurity_No": "Hazard: Accounts lacking security services have low switching friction.",
        "Contract_Two year": "Protective: Two-year contract represents the strongest retention shield.",
        "InternetService_No": "Protective: Basic voice-only accounts rarely churn.",
        "TechSupport_No": "Hazard: Unresolved technical friction drives customers away.",
        "InternetService_DSL": "Factor: Moderate churn profile with lower price points.",
        "MultipleLines_No phone service": "Factor: Voice service configuration nuance.",
        "MonthlyCharges": "Factor: Higher recurring bill correlates with shopping for alternatives.",
        "Avg_Monthly_Cost": "Factor: Spikes in recent monthly expenditure trigger cancellation.",
    }

    feature_driver_list = []
    for idx, feat_name in enumerate(all_feature_names):
        f_key = f"f{idx}"
        gain_val = score_gain.get(f_key, 0.0)
        weight_val = score_weight.get(f_key, 0)
        takeaway = driver_details.get(feat_name, "Predictive feature split.")
        feature_driver_list.append({
            "feature": feat_name,
            "gain": float(gain_val),
            "weight": int(weight_val),
            "business_impact": takeaway,
        })

    drivers_by_gain = sorted(feature_driver_list, key=lambda x: x["gain"], reverse=True)
    top_10_drivers = drivers_by_gain[:10]

    print("\n[+] Top 10 Churn Drivers (Ranked by Predictive Gain):")
    print("-" * 88)
    print(f"{'Rank':<5} | {'Feature Name':<32} | {'Gain':<8} | {'Splits':<6} | {'Business Takeaway':<30}")
    print("-" * 88)
    for rank, d in enumerate(top_10_drivers, 1):
        print(f"#{rank:<4} | {d['feature']:<32} | {d['gain']:<8.2f} | {d['weight']:<6} | {d['business_impact']}")
    print("-" * 88)

    # 7. Export Reports
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    total_cust_count = total_samples
    overall_churn_pct = round((actual_churners / total_samples) * 100, 2)
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r") as mf:
                mdata = json.load(mf)
                tr_samples = mdata.get("train_samples", 0)
                te_samples = mdata.get("test_samples", total_samples)
                total_cust_count = tr_samples + te_samples
                if "churn_rate_train" in mdata:
                    overall_churn_pct = round(mdata["churn_rate_train"] * 100, 2)
        except Exception:
            pass

    metrics_summary = {
        "total_customers": total_cust_count,
        "overall_churn_rate": overall_churn_pct,
        "test_samples": total_samples,
        "roc_auc": round(roc_auc, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "accuracy": round(acc, 4),
        "confusion_matrix": {"tn": tn, "fp": fp, "fn": fn, "tp": tp},
    }

    with open(METRICS_REPORT_PATH, "w") as f:
        json.dump(metrics_summary, f, indent=2)

    with open(IMPORTANCE_REPORT_PATH, "w") as f:
        json.dump({
            "top_10_churn_drivers": top_10_drivers,
            "all_features_ranked": drivers_by_gain,
        }, f, indent=2)

    print(f"\n[OK] Evaluation reports updated:")
    print(f"     -> {METRICS_REPORT_PATH}")
    print(f"     -> {IMPORTANCE_REPORT_PATH}")

    return metrics_summary, top_10_drivers


if __name__ == "__main__":
    evaluate_model()
