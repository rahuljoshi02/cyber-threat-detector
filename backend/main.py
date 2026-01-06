from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model", "threat_detector_simple.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "model", "feature_columns_simple.pkl")

print(f"Loading model from: {MODEL_PATH}")
print(f"Loading features from: {FEATURES_PATH}")

# Load the pipeline (includes preprocessor and classifier)
try:
    pipeline = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURES_PATH)
    print(f"Model loaded successfully!")
    print(f"Expected features: {feature_columns}")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Define input schema for better validation
class ThreatDetectionRequest(BaseModel):
    protocol_type: str
    service: str
    flag: str
    duration: float
    src_bytes: float
    dst_bytes: float
    wrong_fragment: int
    urgent: int
    hot: int
    num_failed_logins: int
    count: int
    logged_in: int


@app.post("/api/detect")
async def detect_threat(data: ThreatDetectionRequest):
    try:
        print(f"Received data: {data.model_dump()}")
        
        input_dict = data.model_dump()
        df = pd.DataFrame([input_dict])
        
        print(f"DataFrame columns: {df.columns.tolist()}")
        print(f"Expected columns: {feature_columns}")
        
        df = df[feature_columns]
        
        print(f"DataFrame shape: {df.shape}")
        print(f"DataFrame values:\n{df}")
        
        # Make prediction using the pipeline
        prediction = pipeline.predict(df)[0]
        probability = pipeline.predict_proba(df)[0]
        
        print(f"Raw prediction: {prediction}")
        print(f"Raw probabilities: {probability}")
        
        threat_prob = float(probability[1])
        
        # Map probability to risk level
        if threat_prob < 0.3:
            risk = "Low"
        elif threat_prob < 0.6:
            risk = "Medium"
        elif threat_prob < 0.85:
            risk = "High"
        else:
            risk = "Critical"
        
        result = {
            "is_threat": int(prediction),
            "threat_probability": threat_prob,
            "risk_level": risk
        }
        
        print(f"Returning result: {result}")
        return result
    
    except Exception as e:
        print(f"Error during prediction:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "Threat Detection API is running",
        "model_loaded": pipeline is not None,
        "features": feature_columns
    }