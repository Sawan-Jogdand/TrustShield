import os
import csv
import random
import numpy as np
import pandas as pd

# Define output directory
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

# 1. TEXT SCAM DATASET GENERATION
def generate_text_dataset(n_samples=1200):
    scam_templates = [
        # Banking & KYC Scams
        ("URGENT: Your {bank} account has been suspended due to suspicious activity. Verify immediately at {url} to avoid permanent deactivation.", "Banking Phishing", 1),
        ("Dear Customer, Your debit card ending in {digits} is locked. Click {url} to update KYC within 24 hours.", "Banking Phishing", 1),
        ("ALERT: An unauthorized transaction of ${amount} was attempted on your account. If this was not you, cancel it now at {url}.", "Banking Phishing", 1),
        ("{bank} Security: Unusual login from {country}. Confirm your identity now at {url} to prevent account freeze.", "Banking Phishing", 1),
        
        # Crypto & Investment Fraud
        ("Guaranteed 450% return in 48 hours! Join our automated crypto arbitrage pool today. Send {crypto_amount} ETH to {wallet} and start earning.", "Crypto Investment Scam", 1),
        ("Congratulations! You've been whitelisted for the Exclusive {crypto} Airdrop. Claim your free $5,000 token grant at {url}.", "Crypto Investment Scam", 1),
        ("Invest $200 today and receive $3,500 daily guaranteed passive income! Contact our VIP forex manager on Telegram @{handle}.", "Crypto Investment Scam", 1),
        ("Tesla & Elon Musk 100M Crypto Giveaway! Send 0.1 BTC to receive 0.5 BTC back immediately: {url}", "Crypto Investment Scam", 1),
        
        # Lottery, Prize & Gift Fraud
        ("WINNER! You have won the {country} Mega Millions International Draw of ${lottery_amount}! Call {phone} immediately with code WIN{digits} to claim.", "Lottery / Prize Fraud", 1),
        ("Amazon Notification: Your mobile number was selected for an iPhone 15 Pro giveaway. Claim within 10 minutes at {url}.", "Lottery / Prize Fraud", 1),
        ("Walmart Reward: You have a pending voucher worth $1,000. Complete this short survey at {url} before expiration.", "Lottery / Prize Fraud", 1),
        
        # Job & Work-from-Home Scams
        ("Part-time Online Job Offer: Earn $300-$800 daily by rating hotels/apps on your phone for 1 hour. No experience required. WhatsApp: {phone}", "Fake Job Offer", 1),
        ("HR Global Recruiter: You have been shortlisted for Remote Data Entry role paying $65/hr. Pay registration fee $49 at {url} to get started.", "Fake Job Offer", 1),
        ("Immediate hiring for Amazon Product Reviewer. Daily payout $500. Message Telegram @{handle} for instant onboarding.", "Fake Job Offer", 1),
        
        # Impersonation & Extortion
        ("IRS / Tax Notice: A federal warrant is issued for tax evasion. Call {phone} immediately or law enforcement will be dispatched.", "Impersonation / Extortion", 1),
        ("This is the Chief Financial Officer. I am in an urgent meeting and need you to purchase 5x $100 Apple Gift Cards and email the codes.", "Executive Impersonation", 1),
        ("Package Delivery Failed: USPS tracking #{tracking} is held at terminal due to unpaid duty fees of $2.30. Pay at {url}.", "Delivery Phishing", 1),
        ("Netflix Member Alert: We could not process your latest payment. Update billing details at {url} to avoid service cancellation.", "Subscription Phishing", 1)
    ]
    
    authentic_templates = [
        ("Hi team, please find the quarterly performance slide deck attached for tomorrow's review meeting.", "Legitimate Business", 0),
        ("Your verification code for {service} is {otp}. This code will expire in 10 minutes. Do not share it with anyone.", "Legitimate OTP", 0),
        ("Your order #{order_id} has been shipped via FedEx. Expected delivery is Friday by 5:00 PM. Track at official app.", "Legitimate E-commerce", 0),
        ("Reminder: Your dentist appointment with Dr. Smith is scheduled for tomorrow at 2:30 PM. Reply 1 to confirm, 2 to reschedule.", "Legitimate Service", 0),
        ("Your monthly bank statement for account ending in {digits} is now ready to view in the official mobile banking app.", "Legitimate Banking", 0),
        ("Hey, are we still meeting for lunch at the cafeteria around 1:00 PM today?", "Legitimate Personal", 0),
        ("GitHub: A new security advisory was published for your repository. Check security tab for details.", "Legitimate Notification", 0),
        ("Google Calendar: Standup meeting starts in 10 minutes (10:00 AM - 10:15 AM).", "Legitimate Calendar", 0),
        ("Thanks for reaching out to customer support. Your ticket #{ticket} has been resolved. Please rate our service.", "Legitimate Support", 0),
        ("Here is the updated recipe for the chocolate cake we discussed last weekend. Let me know if you need vanilla extract.", "Legitimate Personal", 0),
        ("Payment received: You paid $42.50 at Trader Joe's using Apple Pay on {date}.", "Legitimate Transaction", 0),
        ("Zoom meeting invitation: Weekly Engineering Sync on Thursday at 3:00 PM EST. Join with meeting ID {digits}.", "Legitimate Work", 0)
    ]

    banks = ["Chase", "Bank of America", "Wells Fargo", "Citibank", "Barclays", "HSBC", "HDFC", "State Bank", "Capital One"]
    urls = ["http://secure-verify-auth2.xyz", "https://login-update-online-service.top", "http://claim-crypto-giveaway.net", "http://usps-delivery-portal.cc", "https://bank-security-center.ru", "http://kyc-urgent-support.info"]
    services = ["Google", "Microsoft", "Amazon", "Apple ID", "PayPal", "Twitter", "Instagram", "Uber"]
    countries = ["United States", "Nigeria", "Russia", "Singapore", "United Kingdom", "Germany"]
    
    rows = []
    
    # Generate scam samples
    for _ in range(n_samples // 2):
        tmpl, category, label = random.choice(scam_templates)
        text = tmpl.format(
            bank=random.choice(banks),
            url=random.choice(urls),
            digits=f"{random.randint(1000, 9999)}",
            amount=f"{random.randint(500, 8900)}",
            country=random.choice(countries),
            crypto_amount=round(random.uniform(0.5, 5.0), 2),
            crypto=random.choice(["Bitcoin", "Solana", "Ethereum", "Ripple"]),
            wallet=f"0x{random.randint(10000000, 99999999):x}",
            handle=f"CryptoProf_{random.randint(100, 999)}",
            lottery_amount=f"{random.randint(1, 15)},000,000",
            phone=f"+1-{random.randint(200,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}",
            tracking=f"US{random.randint(10000000, 99999999)}P"
        )
        rows.append({
            "text": text,
            "category": category,
            "is_scam": 1,
            "urgency_score": round(random.uniform(0.75, 0.99), 3),
            "threat_level": random.choice(["HIGH", "CRITICAL"])
        })
        
    # Generate authentic samples
    for _ in range(n_samples // 2):
        tmpl, category, label = random.choice(authentic_templates)
        text = tmpl.format(
            service=random.choice(services),
            otp=f"{random.randint(100000, 999999)}",
            order_id=f"ORD-{random.randint(100000, 999999)}",
            digits=f"{random.randint(1000, 9999)}",
            ticket=f"{random.randint(10000, 99999)}",
            date="Aug 25",
            meeting_id=f"{random.randint(100,999)} {random.randint(100,999)} {random.randint(1000,9999)}"
        )
        rows.append({
            "text": text,
            "category": category,
            "is_scam": 0,
            "urgency_score": round(random.uniform(0.05, 0.35), 3),
            "threat_level": "LOW"
        })

    random.shuffle(rows)
    df = pd.DataFrame(rows)
    csv_path = os.path.join(DATA_DIR, "scam_text_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"✓ Generated text dataset with {len(df)} samples at {csv_path}")
    return df

# 2. MEDIA (IMAGE & VIDEO) FORENSICS DATASET GENERATION
def generate_media_forensics_dataset(n_samples=1500):
    rows = []
    np.random.seed(42)
    
    for i in range(n_samples):
        is_synthetic = np.random.choice([0, 1], p=[0.48, 0.52])
        media_type = np.random.choice(["Image", "Video"], p=[0.6, 0.4])
        
        if is_synthetic == 1:
            # Synthetic / Deepfake distribution
            edge_blending_score = np.random.beta(2, 6) # Low natural blending (artificial edges)
            facial_symmetry_deviation = np.random.normal(0.68, 0.15) # Warped / unnatural symmetry
            lighting_inconsistency = np.random.normal(0.72, 0.14) # Inconsistent shadows
            ela_difference_mean = np.random.normal(38.5, 12.0) # High compression/manipulation residuals
            fft_high_freq_ratio = np.random.normal(0.18, 0.08) # AI generators often lack high freq details
            noise_pattern_residual = np.random.normal(0.65, 0.16) # Inconsistent PRNU noise pattern
            color_space_variance = np.random.normal(0.58, 0.12)
            temporal_jitter = np.random.normal(0.62, 0.18) if media_type == "Video" else 0.0
            blink_rate_anomaly = np.random.normal(0.70, 0.15) if media_type == "Video" else 0.0
            
            fake_prob = np.clip(np.random.normal(0.85, 0.10), 0.51, 0.99)
            risk_level = np.random.choice(["HIGH", "CRITICAL"], p=[0.4, 0.6])
            verdict = "Deepfake Detected"
            trust_score = int(np.clip(100 - (fake_prob * 100) + np.random.normal(0, 5), 5, 45))
        else:
            # Authentic / Organic media distribution
            edge_blending_score = np.random.beta(6, 2) # Smooth natural edges
            facial_symmetry_deviation = np.random.normal(0.15, 0.08) # Natural human asymmetry
            lighting_inconsistency = np.random.normal(0.18, 0.09) # Consistent physical lighting
            ela_difference_mean = np.random.normal(8.2, 3.5) # Uniform JPEG compression
            fft_high_freq_ratio = np.random.normal(0.52, 0.12) # Natural sensor optics frequency response
            noise_pattern_residual = np.random.normal(0.12, 0.06) # Consistent sensor noise
            color_space_variance = np.random.normal(0.20, 0.08)
            temporal_jitter = np.random.normal(0.10, 0.05) if media_type == "Video" else 0.0
            blink_rate_anomaly = np.random.normal(0.12, 0.06) if media_type == "Video" else 0.0
            
            fake_prob = np.clip(np.random.normal(0.08, 0.06), 0.01, 0.45)
            risk_level = "LOW" if fake_prob < 0.25 else "MEDIUM"
            verdict = "Authentic Content"
            trust_score = int(np.clip(100 - (fake_prob * 100) + np.random.normal(0, 4), 60, 99))
            
        rows.append({
            "sample_id": f"MED-{10000+i}",
            "media_type": media_type,
            "edge_blending_score": round(float(np.clip(edge_blending_score, 0, 1)), 4),
            "facial_symmetry_deviation": round(float(np.clip(facial_symmetry_deviation, 0, 1)), 4),
            "lighting_inconsistency": round(float(np.clip(lighting_inconsistency, 0, 1)), 4),
            "ela_difference_mean": round(float(np.clip(ela_difference_mean, 0, 100)), 3),
            "fft_high_freq_ratio": round(float(np.clip(fft_high_freq_ratio, 0, 1)), 4),
            "noise_pattern_residual": round(float(np.clip(noise_pattern_residual, 0, 1)), 4),
            "color_space_variance": round(float(np.clip(color_space_variance, 0, 1)), 4),
            "temporal_jitter": round(float(np.clip(temporal_jitter, 0, 1)), 4),
            "blink_rate_anomaly": round(float(np.clip(blink_rate_anomaly, 0, 1)), 4),
            "is_synthetic": is_synthetic,
            "synthetic_confidence": round(float(fake_prob), 4),
            "trust_score": trust_score,
            "risk_level": risk_level,
            "verdict": verdict
        })
        
    df = pd.DataFrame(rows)
    csv_path = os.path.join(DATA_DIR, "media_forensics_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"✓ Generated media forensics dataset with {len(df)} samples at {csv_path}")
    return df

# 3. AUDIO FORENSICS DATASET GENERATION
def generate_audio_forensics_dataset(n_samples=1000):
    rows = []
    np.random.seed(84)
    
    for i in range(n_samples):
        is_synthetic = np.random.choice([0, 1], p=[0.5, 0.5])
        
        if is_synthetic == 1:
            # Synthetic / Voice Cloned Audio
            mfcc_variance = np.random.normal(42.0, 10.5) # Robotic / unnatural smoothness in MFCCs
            spectral_centroid_shift = np.random.normal(0.68, 0.14)
            spectral_rolloff_anomaly = np.random.normal(0.72, 0.12)
            zero_crossing_rate_std = np.random.normal(0.025, 0.008) # Low variation in pitch/ZCR
            pitch_jitter_score = np.random.normal(0.12, 0.04) # Lack of natural vocal micro-tremors
            harmonic_to_noise_ratio = np.random.normal(28.5, 4.2)
            frequency_consistency = np.random.choice(["Synthetic Phase", "Anomalous Harmonic", "Vocoder Residual"])
            noise_pattern = np.random.choice(["Digital Void", "Synthetic Floor", "Artificial Dither"])
            ai_artifact_detected = "Yes (Neural Vocoder)"
            
            fake_prob = np.clip(np.random.normal(0.88, 0.08), 0.55, 0.99)
            risk_level = "HIGH" if fake_prob < 0.85 else "CRITICAL"
            verdict = "Synthetic Voice / Deepfake Audio"
            trust_score = int(np.clip(100 - (fake_prob * 100) + np.random.normal(0, 5), 4, 38))
        else:
            # Organic Human Voice
            mfcc_variance = np.random.normal(85.0, 18.0) # Natural rich human resonance
            spectral_centroid_shift = np.random.normal(0.22, 0.08)
            spectral_rolloff_anomaly = np.random.normal(0.18, 0.07)
            zero_crossing_rate_std = np.random.normal(0.085, 0.022) # Rich dynamic pitch variation
            pitch_jitter_score = np.random.normal(0.48, 0.11) # Natural biomechanical vocal cord jitter
            harmonic_to_noise_ratio = np.random.normal(16.8, 3.5)
            frequency_consistency = "Natural"
            noise_pattern = "Organic"
            ai_artifact_detected = "No"
            
            fake_prob = np.clip(np.random.normal(0.06, 0.05), 0.01, 0.35)
            risk_level = "LOW"
            verdict = "Authentic Voice Content"
            trust_score = int(np.clip(100 - (fake_prob * 100) + np.random.normal(0, 3), 75, 99))
            
        rows.append({
            "sample_id": f"AUD-{20000+i}",
            "mfcc_variance": round(float(mfcc_variance), 3),
            "spectral_centroid_shift": round(float(np.clip(spectral_centroid_shift, 0, 1)), 4),
            "spectral_rolloff_anomaly": round(float(np.clip(spectral_rolloff_anomaly, 0, 1)), 4),
            "zero_crossing_rate_std": round(float(np.clip(zero_crossing_rate_std, 0, 1)), 4),
            "pitch_jitter_score": round(float(np.clip(pitch_jitter_score, 0, 1)), 4),
            "harmonic_to_noise_ratio": round(float(harmonic_to_noise_ratio), 2),
            "frequency_consistency": frequency_consistency,
            "noise_pattern": noise_pattern,
            "ai_artifact_detected": ai_artifact_detected,
            "is_synthetic": is_synthetic,
            "synthetic_confidence": round(float(fake_prob), 4),
            "trust_score": trust_score,
            "risk_level": risk_level,
            "verdict": verdict
        })
        
    df = pd.DataFrame(rows)
    csv_path = os.path.join(DATA_DIR, "audio_forensics_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"✓ Generated audio forensics dataset with {len(df)} samples at {csv_path}")
    return df

if __name__ == "__main__":
    print("Generating Multimodal Supervised Scam & Forensic Datasets...")
    generate_text_dataset()
    generate_media_forensics_dataset()
    generate_audio_forensics_dataset()
    print("All datasets generated successfully!")
