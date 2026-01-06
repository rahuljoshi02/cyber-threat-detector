import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib
import os

from load_data import X, y, SIMPLE_FIELDS

categorical_cols = ["protocol_type", "service", "flag"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

#Create a preprocessor for categorical features
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols)
    ],
    remainder="passthrough"
)

# --- Create a pipeline ---
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        random_state=42,
        n_jobs=-1
    ))
])

#Train pipeline
print("Training model with pipeline...")
print(f"Training samples: {len(X_train)}")
print(f"Features: {SIMPLE_FIELDS}")
pipeline.fit(X_train, y_train)

#Evaluate
y_pred = pipeline.predict(X_test)
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

y_probs = pipeline.predict_proba(X_test)[:, 1]
print("\nSample threat probabilities:")
print(y_probs[:10])

#Save model and feature columns
os.makedirs("model", exist_ok=True)
joblib.dump(pipeline, "model/threat_detector_simple.pkl")
joblib.dump(SIMPLE_FIELDS, "model/feature_columns_simple.pkl")
print("\nModel and feature columns saved successfully!")
print(f"Saved to: model/threat_detector_simple.pkl")