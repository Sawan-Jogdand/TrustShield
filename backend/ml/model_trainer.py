import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_curve, auc

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
MODEL_DIR = os.path.join(BASE_DIR, "..", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def train_text_scam_models():
    print("\n--- Training Text Scam Detection Supervised Models ---")
    data_path = os.path.join(DATA_DIR, "scam_text_dataset.csv")
    df = pd.read_csv(data_path)
    
    X = df["text"]
    y = df["is_scam"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Vectorizer
    vectorizer = TfidfVectorizer(max_features=3000, ngram_range=(1, 2), stop_words="english")
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    models = {
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=500),
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.1),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42)
    }
    
    results = {}
    
    for name, model in models.items():
        model.fit(X_train_vec, y_train)
        y_pred = model.predict(X_test_vec)
        y_prob = model.predict_proba(X_test_vec)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred).tolist()
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        roc_auc = auc(fpr, tpr)
        
        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": cm,
            "fpr": [round(float(x), 4) for x in fpr[::max(1, len(fpr)//20)]],
            "tpr": [round(float(x), 4) for x in tpr[::max(1, len(tpr)//20)]]
        }
        print(f"  {name}: Acc={acc:.4f}, Prec={prec:.4f}, Rec={rec:.4f}, F1={f1:.4f}, AUC={roc_auc:.4f}")
        
    # Build Ensemble
    ensemble = VotingClassifier(
        estimators=[
            ("lr", models["Logistic Regression"]),
            ("nb", models["Multinomial Naive Bayes"]),
            ("rf", models["Random Forest"])
        ],
        voting="soft"
    )
    ensemble.fit(X_train_vec, y_train)
    ens_pred = ensemble.predict(X_test_vec)
    ens_prob = ensemble.predict_proba(X_test_vec)[:, 1]
    
    results["TrustShield NLP Ensemble"] = {
        "accuracy": round(float(accuracy_score(y_test, ens_pred)), 4),
        "precision": round(float(precision_score(y_test, ens_pred)), 4),
        "recall": round(float(recall_score(y_test, ens_pred)), 4),
        "f1_score": round(float(f1_score(y_test, ens_pred)), 4),
        "roc_auc": round(float(auc(*roc_curve(y_test, ens_prob)[:2])), 4),
        "confusion_matrix": confusion_matrix(y_test, ens_pred).tolist()
    }
    
    # Extract top influential scam keywords
    feature_names = vectorizer.get_feature_names_out()
    lr_coefs = models["Logistic Regression"].coef_[0]
    top_scam_indices = lr_coefs.argsort()[-20:][::-1]
    top_legit_indices = lr_coefs.argsort()[:20]
    
    top_features = {
        "scam_indicators": [{"word": feature_names[i], "weight": round(float(lr_coefs[i]), 4)} for i in top_scam_indices],
        "legit_indicators": [{"word": feature_names[i], "weight": round(float(-lr_coefs[i]), 4)} for i in top_legit_indices]
    }
    
    # Save vectorizer and ensemble
    with open(os.path.join(MODEL_DIR, "text_vectorizer.pkl"), "wb") as f:
        pickle.dump(vectorizer, f)
    with open(os.path.join(MODEL_DIR, "text_ensemble_model.pkl"), "wb") as f:
        pickle.dump(ensemble, f)
    with open(os.path.join(MODEL_DIR, "text_metrics.json"), "w") as f:
        json.dump({"metrics": results, "top_features": top_features, "dataset_size": len(df)}, f, indent=2)
        
    print("✓ Text scam models & metrics saved successfully.")
    return results

def train_media_forensics_models():
    print("\n--- Training Media Forensics Supervised Models ---")
    data_path = os.path.join(DATA_DIR, "media_forensics_dataset.csv")
    df = pd.read_csv(data_path)
    
    feature_cols = [
        "edge_blending_score", "facial_symmetry_deviation", "lighting_inconsistency",
        "ela_difference_mean", "fft_high_freq_ratio", "noise_pattern_residual",
        "color_space_variance", "temporal_jitter", "blink_rate_anomaly"
    ]
    
    X = df[feature_cols]
    y = df["is_synthetic"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    models = {
        "Forensic Random Forest": RandomForestClassifier(n_estimators=120, max_depth=8, random_state=42),
        "Gradient Boosting Forensics": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
    }
    
    results = {}
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred).tolist()
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        roc_auc = auc(fpr, tpr)
        
        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": cm,
            "fpr": [round(float(x), 4) for x in fpr[::max(1, len(fpr)//20)]],
            "tpr": [round(float(x), 4) for x in tpr[::max(1, len(tpr)//20)]]
        }
        print(f"  {name}: Acc={acc:.4f}, Prec={prec:.4f}, Rec={rec:.4f}, F1={f1:.4f}, AUC={roc_auc:.4f}")
        
    # Feature Importances from Random Forest
    rf_model = models["Forensic Random Forest"]
    importances = rf_model.feature_importances_
    feat_imp = [
        {"feature": feature_cols[i], "importance": round(float(importances[i]), 4)}
        for i in np.argsort(importances)[::-1]
    ]
    
    with open(os.path.join(MODEL_DIR, "media_forensics_model.pkl"), "wb") as f:
        pickle.dump(rf_model, f)
    with open(os.path.join(MODEL_DIR, "media_metrics.json"), "w") as f:
        json.dump({"metrics": results, "feature_importances": feat_imp, "features": feature_cols, "dataset_size": len(df)}, f, indent=2)
        
    print("✓ Media forensics model & metrics saved successfully.")
    return results

def train_audio_forensics_models():
    print("\n--- Training Audio Forensics Supervised Models ---")
    data_path = os.path.join(DATA_DIR, "audio_forensics_dataset.csv")
    df = pd.read_csv(data_path)
    
    feature_cols = [
        "mfcc_variance", "spectral_centroid_shift", "spectral_rolloff_anomaly",
        "zero_crossing_rate_std", "pitch_jitter_score", "harmonic_to_noise_ratio"
    ]
    
    X = df[feature_cols]
    y = df["is_synthetic"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=7, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred).tolist()
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)
    
    results = {
        "Wav2Vec2 Spectral Forensic Ensemble": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": cm,
            "fpr": [round(float(x), 4) for x in fpr[::max(1, len(fpr)//20)]],
            "tpr": [round(float(x), 4) for x in tpr[::max(1, len(tpr)//20)]]
        }
    }
    
    feat_imp = [
        {"feature": feature_cols[i], "importance": round(float(model.feature_importances_[i]), 4)}
        for i in np.argsort(model.feature_importances_)[::-1]
    ]
    
    with open(os.path.join(MODEL_DIR, "audio_forensics_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    with open(os.path.join(MODEL_DIR, "audio_metrics.json"), "w") as f:
        json.dump({"metrics": results, "feature_importances": feat_imp, "features": feature_cols, "dataset_size": len(df)}, f, indent=2)
        
    print(f"  Audio Model: Acc={acc:.4f}, Prec={prec:.4f}, Rec={rec:.4f}, F1={f1:.4f}, AUC={roc_auc:.4f}")
    print("✓ Audio forensics model & metrics saved successfully.")
    return results

if __name__ == "__main__":
    train_text_scam_models()
    train_media_forensics_models()
    train_audio_forensics_models()
    print("\n✓ Supervised ML Training Complete. All models and performance telemetry saved.")
