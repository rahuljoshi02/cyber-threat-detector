import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os


from load_data import df, X_encoded, y

X_train, X_test, y_train, y_test = train_test_split(
    X_encoded,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    random_state=42,
    n_jobs=-1
)

print("Training model...")
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

y_probs = model.predict_proba(X_test)[:, 1]

print("Sample probabilities:")
print(y_probs[:10])

os.makedirs("model", exist_ok=True)

joblib.dump(model, "model/threat_detector.pkl")

joblib.dump(X_encoded.columns.tolist(), "model/feature_columns.pkl")

print("Model and feature columns saved!")