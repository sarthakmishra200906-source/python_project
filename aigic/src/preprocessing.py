"""
preprocessing.py
Data cleaning, imputation, high-value feature engineering, and pipeline transformations
for the Telecom Customer Churn dataset.
"""

import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

RAW_DATA_PATH = os.path.join("data", "raw", "WA_Fn-UseC_-Telco-Customer-Churn.csv")
PROCESSED_DIR = os.path.join("data", "processed")
METADATA_PATH = os.path.join("models", "feature_metadata.json")

ACTIVE_SERVICES = [
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
]

def engineer_features(df: pd.DataFrame, median_total_charges: float = None) -> tuple[pd.DataFrame, float]:
    """
    Applies data hygiene and high-value feature engineering:
      - Coerces TotalCharges to numeric and imputes missing/blank values using median.
      - Calculates Avg_Monthly_Cost = TotalCharges / (tenure + 1).
      - Extracts Is_Automatic_Payment binary flag.
      - Counts active subscribed services (Service_Count).
      - Creates household stability feature (Has_Partner_and_Dependents).
      - Converts Contract to numerical duration (Contract_Months) and computes Contract_Tenure_Ratio.
      - Creates binned Tenure_Group intervals.
    """
    df = df.copy()

    # Drop customerID if present
    if "customerID" in df.columns:
        df = df.drop(columns=["customerID"])

    # 1. Clean and impute TotalCharges
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    if median_total_charges is None:
        median_total_charges = float(df["TotalCharges"].median())
    df["TotalCharges"] = df["TotalCharges"].fillna(median_total_charges)

    # 2. Avg Monthly Cost (Historical billing consistency)
    df["Avg_Monthly_Cost"] = df["TotalCharges"] / (df["tenure"] + 1)

    # 3. Automatic Payment Flag
    if "PaymentMethod" in df.columns:
        df["Is_Automatic_Payment"] = df["PaymentMethod"].astype(str).str.contains("automatic", case=False).astype(int)
    else:
        df["Is_Automatic_Payment"] = 0

    # 4. Service Count (Breadth of telecom adoption)
    service_count = np.zeros(len(df), dtype=int)
    for s in ACTIVE_SERVICES:
        if s in df.columns:
            if s == "InternetService":
                service_count += (df[s] != "No").astype(int)
            else:
                service_count += (df[s] == "Yes").astype(int)
    df["Service_Count"] = service_count

    # 5. Household stability (Partner & Dependents)
    if "Partner" in df.columns and "Dependents" in df.columns:
        df["Has_Partner_and_Dependents"] = ((df["Partner"] == "Yes") & (df["Dependents"] == "Yes")).astype(int)
    else:
        df["Has_Partner_and_Dependents"] = 0

    # 6. Contract Duration & Tenure Ratio
    contract_mapping = {"Month-to-month": 1, "One year": 12, "Two year": 24}
    if "Contract" in df.columns:
        df["Contract_Months"] = df["Contract"].map(contract_mapping).fillna(1).astype(int)
    else:
        df["Contract_Months"] = 1
    df["Contract_Tenure_Ratio"] = df["tenure"] / (df["Contract_Months"] + 1)

    # 7. Tenure Groups (Cohorts)
    df["Tenure_Group"] = pd.cut(
        df["tenure"],
        bins=[-1, 12, 24, 48, 72],
        labels=["0-12m", "13-24m", "25-48m", "49-72m"]
    ).astype(str)

    return df, median_total_charges


def get_feature_lists():
    """
    Returns lists of categorical and numerical features used in model training.
    """
    categorical_cols = [
        "gender",
        "SeniorCitizen",
        "Partner",
        "Dependents",
        "PhoneService",
        "MultipleLines",
        "InternetService",
        "OnlineSecurity",
        "OnlineBackup",
        "DeviceProtection",
        "TechSupport",
        "StreamingTV",
        "StreamingMovies",
        "Contract",
        "PaperlessBilling",
        "PaymentMethod",
        "Tenure_Group",
    ]

    numerical_cols = [
        "tenure",
        "MonthlyCharges",
        "TotalCharges",
        "Avg_Monthly_Cost",
        "Is_Automatic_Payment",
        "Service_Count",
        "Has_Partner_and_Dependents",
        "Contract_Months",
        "Contract_Tenure_Ratio",
    ]

    return categorical_cols, numerical_cols


def create_preprocessor():
    """
    Builds a scikit-learn ColumnTransformer for one-hot encoding and scaling.
    """
    categorical_cols, numerical_cols = get_feature_lists()
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
        ]
    )
    return preprocessor


def prepare_and_split_data(raw_path: str = RAW_DATA_PATH, test_size: float = 0.20, random_state: int = 42):
    """
    Loads raw data, performs cleaning, engineering, and stratified train/test split.
    Saves processed datasets to data/processed/.
    """
    print(f"Loading raw dataset from {raw_path}...")
    df = pd.read_csv(raw_path)

    # Encode target variable Churn: Yes -> 1, No -> 0
    if "Churn" not in df.columns:
        raise ValueError("Target column 'Churn' not found in dataset.")
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0}).astype(int)

    # Engineer features and compute median TotalCharges on training data only
    # First split raw to prevent data leakage in median calculation
    train_raw, test_raw = train_test_split(
        df, test_size=test_size, random_state=random_state, stratify=df["Churn"]
    )

    # Fit median on training set and transform both
    train_df, median_val = engineer_features(train_raw)
    test_df, _ = engineer_features(test_raw, median_total_charges=median_val)

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs("models", exist_ok=True)

    train_out = os.path.join(PROCESSED_DIR, "train.csv")
    test_out = os.path.join(PROCESSED_DIR, "test.csv")
    train_df.to_csv(train_out, index=False)
    test_df.to_csv(test_out, index=False)

    categorical_cols, numerical_cols = get_feature_lists()
    metadata = {
        "median_total_charges": median_val,
        "categorical_cols": categorical_cols,
        "numerical_cols": numerical_cols,
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "churn_rate_train": float(train_df["Churn"].mean()),
        "churn_rate_test": float(test_df["Churn"].mean()),
    }
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Data successfully preprocessed and split:")
    print(f" - Train set: {len(train_df)} rows (Churn rate: {metadata['churn_rate_train']:.2%}) -> {train_out}")
    print(f" - Test set:  {len(test_df)} rows (Churn rate: {metadata['churn_rate_test']:.2%}) -> {test_out}")
    print(f" - Median TotalCharges: ${median_val:.2f}")
    print(f" - Metadata saved to {METADATA_PATH}")

    return train_df, test_df, metadata


if __name__ == "__main__":
    prepare_and_split_data()
