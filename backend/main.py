import os
import json
import time
import uuid
import pandas as pd
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ml.forensic_engine import TrustShieldForensicEngine

app = FastAPI(title="Trust Shield Multimodal Scam & Deepfake Detection API", version="2.0.0")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")
REPORTS_FILE = os.path.join(DATA_DIR, "reports_history.json")

# In-memory / persistent reports storage
def load_reports():
    if os.path.exists(REPORTS_FILE):
        try:
            with open(REPORTS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_report_item(report: dict):
    reports = load_reports()
    # Check if exists
    reports = [r for r in reports if r.get("id") != report.get("id")]
    reports.insert(0, report)
    # Keep last 100 reports
    reports = reports[:100]
    with open(REPORTS_FILE, "w") as f:
        json.dump(reports, f, indent=2)

# Populate default historical reports if empty
if not os.path.exists(REPORTS_FILE) or len(load_reports()) == 0:
    default_reports = [
        {
            "id": "REP-TS-849201",
            "timestamp": "2026-08-25 21:15:32",
            "modality": "Image",
            "target": "Image_1.jpeg",
            "prediction": "REAL",
            "verdict": "Authentic Content",
            "confidence": 63.0,
            "trust_score": 63,
            "risk_level": "MEDIUM",
            "fake_signal_strength": 37.0,
            "analysis_engine": "EfficientNet-B0-Vision",
            "processing_time": "1.07s",
            "operator": "Trust Shield Forensic Analyst",
            "status": "Verified Clean",
            "forensic_features": [
                {"name": "Edge Blending", "value": "Smooth", "status": "Smooth"},
                {"name": "Facial Symmetry", "value": "Natural", "status": "Natural"},
                {"name": "Lighting Match", "value": "Consistent", "status": "Consistent"}
            ]
        },
        {
            "id": "REP-TS-738192",
            "timestamp": "2026-08-25 20:45:10",
            "modality": "Video",
            "target": "Video_2.mp4",
            "prediction": "FAKE",
            "verdict": "Deepfake Detected",
            "confidence": 57.8,
            "trust_score": 42,
            "risk_level": "LOW",
            "fake_signal_strength": 57.8,
            "analysis_engine": "EfficientNet-B0-Vision",
            "processing_time": "0.53s",
            "operator": "Trust Shield Forensic Analyst",
            "status": "Threat Flagged",
            "forensic_features": [
                {"name": "Edge Blending", "value": "Artificial", "status": "Artificial"},
                {"name": "Facial Symmetry", "value": "Warped", "status": "Warped"},
                {"name": "Lighting Match", "value": "Inconsistent", "status": "Inconsistent"}
            ]
        },
        {
            "id": "REP-TS-629401",
            "timestamp": "2026-08-25 19:30:18",
            "modality": "Audio",
            "target": "Audio_3.wav",
            "prediction": "REAL",
            "verdict": "Authentic Content",
            "confidence": 95.8,
            "trust_score": 96,
            "risk_level": "LOW",
            "fake_signal_strength": 4.2,
            "analysis_engine": "Wav2Vec2-Forensic",
            "processing_time": "4.83s",
            "operator": "Trust Shield Forensic Analyst",
            "status": "Verified Clean",
            "forensic_features": [
                {"name": "AI Artifact Detection", "value": "No", "status": "Smooth"},
                {"name": "Frequency Consistency", "value": "Natural", "status": "Natural"},
                {"name": "Noise Pattern", "value": "Organic", "status": "Consistent"}
            ]
        },
        {
            "id": "REP-TS-510382",
            "timestamp": "2026-08-25 18:22:04",
            "modality": "Text",
            "target": "SMS Notification: Urgent KYC Update",
            "prediction": "SCAM",
            "verdict": "Suspicious Scam Threat Detected",
            "confidence": 98.4,
            "trust_score": 12,
            "risk_level": "CRITICAL",
            "fake_signal_strength": 88.0,
            "analysis_engine": "TrustShield-ScamGuard-NLP-v2",
            "processing_time": "0.12s",
            "operator": "Trust Shield Forensic Analyst",
            "status": "Blocked Malicious",
            "category": "Banking Phishing",
            "forensic_features": [
                {"name": "Urgency Tone", "value": "Severe (High Panic Trigger)", "status": "Artificial"},
                {"name": "URL / Domain Risk", "value": "Phishing Domain Identified", "status": "Artificial"},
                {"name": "Intent Category", "value": "Banking Phishing", "status": "Inconsistent"}
            ]
        }
    ]
    with open(REPORTS_FILE, "w") as f:
        json.dump(default_reports, f, indent=2)

class TextAnalysisRequest(BaseModel):
    text: str
    source: Optional[str] = "User Input"

class ReportSaveRequest(BaseModel):
    report: dict

@app.get("/")
def read_root():
    return {
        "system": "Trust Shield Multimodal Forensic Intelligence Engine",
        "status": "ACTIVE",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/analyze/text")
def analyze_text_endpoint(req: TextAnalysisRequest):
    if not req.text or len(req.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")
    
    result = TrustShieldForensicEngine.analyze_text(req.text)
    result["id"] = f"REP-TS-{uuid.uuid4().hex[:6].upper()}"
    result["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result["input_preview"] = req.text[:120] + ("..." if len(req.text) > 120 else "")
    
    # Auto-save report
    save_report_item(result)
    return result

@app.post("/api/analyze/media")
async def analyze_media_endpoint(
    modality: str = Form(...),
    preset_id: Optional[str] = Form(None),
    filename: Optional[str] = Form(None),
    is_fake: Optional[bool] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    modality_lower = modality.lower()
    file_bytes = None
    if file:
        file_bytes = await file.read()
        target_name = file.filename
    else:
        target_name = filename or ("Image_1.jpeg" if modality_lower == "image" else ("Video_2.mp4" if modality_lower == "video" else "Audio_3.wav"))

    if "image" in modality_lower:
        result = TrustShieldForensicEngine.analyze_image(image_bytes=file_bytes, filename=target_name, is_fake_preset=is_fake)
    elif "video" in modality_lower:
        result = TrustShieldForensicEngine.analyze_video(video_bytes=file_bytes, filename=target_name, is_fake_preset=is_fake)
    elif "audio" in modality_lower:
        result = TrustShieldForensicEngine.analyze_audio(audio_bytes=file_bytes, filename=target_name, is_fake_preset=is_fake)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported media modality: {modality}")

    result["id"] = f"REP-TS-{uuid.uuid4().hex[:6].upper()}"
    result["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result["target"] = target_name
    result["operator"] = "Trust Shield Forensic Analyst"
    result["status"] = "Threat Flagged" if result["prediction"] in ["FAKE", "SCAM"] else "Verified Clean"
    
    # Auto-save report
    save_report_item(result)
    return result

@app.get("/api/dataset/stats")
def get_dataset_stats():
    text_csv = os.path.join(DATA_DIR, "scam_text_dataset.csv")
    media_csv = os.path.join(DATA_DIR, "media_forensics_dataset.csv")
    audio_csv = os.path.join(DATA_DIR, "audio_forensics_dataset.csv")
    
    stats = {}
    
    if os.path.exists(text_csv):
        df_text = pd.read_csv(text_csv)
        stats["text"] = {
            "total_samples": len(df_text),
            "scam_samples": int(df_text["is_scam"].sum()),
            "authentic_samples": int((df_text["is_scam"] == 0).sum()),
            "categories": df_text["category"].value_counts().to_dict(),
            "samples": df_text.head(8).to_dict(orient="records")
        }
        
    if os.path.exists(media_csv):
        df_media = pd.read_csv(media_csv)
        stats["media"] = {
            "total_samples": len(df_media),
            "synthetic_samples": int(df_media["is_synthetic"].sum()),
            "authentic_samples": int((df_media["is_synthetic"] == 0).sum()),
            "media_types": df_media["media_type"].value_counts().to_dict(),
            "samples": df_media.head(8).to_dict(orient="records")
        }
        
    if os.path.exists(audio_csv):
        df_audio = pd.read_csv(audio_csv)
        stats["audio"] = {
            "total_samples": len(df_audio),
            "synthetic_samples": int(df_audio["is_synthetic"].sum()),
            "authentic_samples": int((df_audio["is_synthetic"] == 0).sum()),
            "samples": df_audio.head(8).to_dict(orient="records")
        }
        
    return stats

@app.get("/api/models/metrics")
def get_models_metrics():
    metrics = {}
    
    for key in ["text_metrics.json", "media_metrics.json", "audio_metrics.json"]:
        path = os.path.join(MODEL_DIR, key)
        if os.path.exists(path):
            with open(path, "r") as f:
                metrics[key.replace("_metrics.json", "")] = json.load(f)
                
    return metrics

@app.get("/api/reports/history")
def get_reports_history():
    return load_reports()

@app.post("/api/reports/save")
def save_report(req: ReportSaveRequest):
    save_report_item(req.report)
    return {"status": "saved", "id": req.report.get("id")}

@app.get("/api/reports/{report_id}")
def get_report_by_id(report_id: str):
    reports = load_reports()
    for r in reports:
        if r.get("id") == report_id:
            return r
    raise HTTPException(status_code=404, detail="Report not found")
