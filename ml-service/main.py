import joblib
import numpy as np
import re  # <--- NEW: Import Regex for finding numbers
from fastapi import FastAPI
from pydantic import BaseModel

# 1. Load the Trained Model
model = joblib.load("complaint_model.pkl")

app = FastAPI()

class ComplaintInput(BaseModel):
    text: str

# --- SEVERITY LOGIC ---
def analyze_height_severity(text):
    """
    Looks for "X floor" or "X storey" in the text.
    Returns extra points based on height.
    """
    # Regex to find numbers before 'floor', 'storey', 'building'
    # Matches: "10th floor", "10 floor", "floor 10"
    pattern = r"(\d+)(?:st|nd|rd|th)?\s*(?:floor|storey|story|building)"
    match = re.search(pattern, text.lower())
    
    if match:
        floor = int(match.group(1))
        if floor > 3: return 40 # Critical boost (High Fall)
        if floor > 0: return 20 # Moderate boost (Low Fall)
        if floor == 0: return 5 # Ground level fall
    
    return 0

def calculate_priority(text, category):
    text_lower = text.lower()
    score = 0
    
    # 1. NEW BASE SCORES (Lowered to allow logic to work)
    # We lower these so "context" can push them up or keep them down.
    category_weights = {
        "Fire": 85,        # Fire is always bad
        "Medical": 60,     # Medical varies (cut finger vs heart attack)
        "Electricity": 50,
        "Police": 40,
        "Road": 30,
        "Water": 30
    }
    score = category_weights.get(category, 30)

    # 2. HEIGHT / FALL LOGIC (The Fix for your issue)
    if "fall" in text_lower or "fell" in text_lower or "jump" in text_lower:
        # Check how high?
        height_points = analyze_height_severity(text)
        if height_points > 0:
            score += height_points
        else:
            # Fall mentioned but no height? Default to +15
            score += 15

    # 3. CRITICAL KEYWORDS (Instant Max)
    # These override everything.
    critical_keywords = [
        "death", "dead", "blood", "explosion", "blast", "gas leak", 
        "collapse", "unconscious", "not breathing", "severe head injury"
    ]
    if any(word in text_lower for word in critical_keywords):
        return 100, "Critical"

    # 4. URGENT KEYWORDS
    urgent_keywords = [
        "fire", "spark", "wire", "current", "accident", "injury", 
        "broken", "fracture", "bleeding", "attack", "emergency"
    ]
    matches = sum(1 for word in urgent_keywords if word in text_lower)
    score += (matches * 10) 

    # 5. CAP SCORE
    score = min(score, 100)

    # 6. DETERMINE LABEL
    if score >= 90: level = "Critical"
    elif score >= 70: level = "High"
    elif score >= 40: level = "Medium"
    else: level = "Low"

    return score, level

@app.post("/predict")
def predict_complaint(data: ComplaintInput):
    prediction = model.predict([data.text])[0]
    
    # Get Probability just for info
    probs = model.predict_proba([data.text])
    confidence = float(np.max(probs))
    
    # Calculate Smart Priority
    score, level = calculate_priority(data.text, prediction)
    
    return {
        "category": prediction,
        "priority_score": score,
        "priority_level": level,
        "ai_confidence": f"{confidence:.2f}"
    }

@app.get("/")
def home():
    return {"message": "AI Grievance System V3.0 (Context-Aware) is Online 🤖"}