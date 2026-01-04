from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

model = joblib.load("model/threat_detector.pkl")
feature_columns = joblib.load("model/feature_columns.pkl")

app = FastAPI()

class ThreatInput(BaseModel):
    duration: float
    protocol_type: str
    service: str
    flag: str
    src_bytes: float
    dst_bytes: float
    land: float
    wrong_fragment: float
    urgent: float
    hot: float
    num_failed_logins: float
    logged_in: float
    num_compromised: float
    root_shell: float
    su_attempted: float
    num_root: float
    num_file_creations: float
    num_shells: float
    num_access_files: float
    num_outbound_cmds: float
    is_host_login: float
    is_guest_login: float
    count: float
    srv_count: float
    serror_rate: float
    srv_serror_rate: float
    rerror_rate: float
    srv_rerror_rate: float
    same_srv_rate: float
    diff_srv_rate: float
    srv_diff_host_rate: float
    dst_host_count: float
    dst_host_srv_count: float
    dst_host_same_srv_rate: float
    dst_host_diff_srv_rate: float
    dst_host_same_src_port_rate: float
    dst_host_srv_diff_host_rate: float
    dst_host_serror_rate: float
    dst_host_srv_serror_rate: float
    dst_host_rerror_rate: float
    dst_host_srv_rerror_rate: float

@app.post("/predict")
def predict_threat(input_data: ThreatInput):
    df = pd.DataFrame([input_data.dict()])
    
    df = pd.get_dummies(df, columns=["protocol_type", "service", "flag"])
    
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0
    df = df[feature_columns]

    is_threat = model.predict(df)[0]
    prob = model.predict_proba(df)[0][1]

    if prob > 0.8:
        risk = "High"
    elif prob > 0.5:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "is_threat": int(is_threat),
        "threat_probability": float(prob),
        "risk_level": risk
    }
