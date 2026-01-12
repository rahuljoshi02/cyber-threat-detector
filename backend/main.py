from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import traceback
from typing import List
import io
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(BASE_DIR, "model", "threat_detector_simple.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "model", "feature_columns_simple.pkl")

MODEL_URL = "https://drive.google.com/uc?export=download&id=1GlhuCKMPDCVh64rpVLh7J5k0HE88n2-c"
FEATURES_URL = "https://drive.google.com/uc?export=download&id=128_PHq1khnDEmzpmvbBvTxbNbGcz82BC"

print(f"Loading model from: {MODEL_PATH}")
print(f"Loading features from: {FEATURES_PATH}")

def download_if_missing(file_path: str, url: str):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    if not os.path.exists(file_path):
        print(f"Downloading {file_path} from Drive…")
        response = requests.get(url)
        response.raise_for_status()
        with open(file_path, "wb") as f:
            f.write(response.content)
        print(f"Download complete: {file_path}")

try:
    download_if_missing(MODEL_PATH, MODEL_URL)
    download_if_missing(FEATURES_PATH, FEATURES_URL)

    pipeline = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURES_PATH)

    print("Loaded model and feature columns successfully")
except Exception as e:
    print(f"Error loading model or features: {e}")
    raise

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


class CSVResultItem(BaseModel):
    row: int
    data: dict
    is_threat: int
    threat_probability: float
    risk_level: str


def get_risk_level(probability: float) -> str:
    """Convert probability to risk level"""
    if probability < 0.3:
        return "Low"
    elif probability < 0.6:
        return "Medium"
    elif probability < 0.85:
        return "High"
    else:
        return "Critical"


@app.post("/api/detect")
async def detect_threat(data: ThreatDetectionRequest):
    try:
        print(f"Received data: {data.model_dump()}")
        
        input_dict = data.model_dump()
        df = pd.DataFrame([input_dict])
        
        df = df[feature_columns]
        
        prediction = pipeline.predict(df)[0]
        probability = pipeline.predict_proba(df)[0]
        threat_prob = float(probability[1])
        risk = get_risk_level(threat_prob)
        
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


@app.post("/api/detect_csv")
async def detect_csv(file: UploadFile = File(...)):
    """
    Endpoint to handle CSV batch predictions
    """
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read CSV content
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        print(f"CSV uploaded: {file.filename}")
        print(f"Rows: {len(df)}, Columns: {df.columns.tolist()}")
        
        # Validate required columns
        required_cols = set(feature_columns)
        missing_cols = required_cols - set(df.columns)
        if missing_cols:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {missing_cols}"
            )
        
        # Ensure columns are in correct order and types
        df_clean = df[feature_columns].copy()
        
        # Convert types
        categorical_cols = ['protocol_type', 'service', 'flag']
        for col in df_clean.columns:
            if col in categorical_cols:
                df_clean[col] = df_clean[col].astype(str)
            else:
                df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0)
        
        # Batch prediction
        predictions = pipeline.predict(df_clean)
        probabilities = pipeline.predict_proba(df_clean)[:, 1]
        
        # Build results
        results = []
        for idx, (pred, prob) in enumerate(zip(predictions, probabilities)):
            risk_level = get_risk_level(prob)
            
            results.append({
                "row": idx + 1,  # 1-indexed for user display
                "data": df.iloc[idx].to_dict(),
                "is_threat": int(pred),
                "threat_probability": float(prob),
                "risk_level": risk_level
            })
        
        # Calculate summary stats
        total = len(results)
        threats = sum(1 for r in results if r['is_threat'] == 1)
        safe = total - threats
        avg_probability = sum(r['threat_probability'] for r in results) / total if total > 0 else 0
        
        return {
            "total": total,
            "threats": threats,
            "safe": safe,
            "avg_probability": avg_probability,
            "results": results
        }
    
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as e:
        print(f"Error processing CSV:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"CSV processing error: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "Threat Detection API is running",
        "model_loaded": pipeline is not None,
        "features": feature_columns
    }