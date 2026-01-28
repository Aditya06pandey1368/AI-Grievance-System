import joblib
import numpy as np
import re
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# 1. Load Models
print("Loading Classification Model...")
model = joblib.load("complaint_model.pkl")

print("Loading Semantic Search Model...")
semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
print("✅ All Models Loaded!")

app = FastAPI()

class ComplaintInput(BaseModel):
    text: str

class DuplicateCheckInput(BaseModel):
    new_complaint: str
    existing_complaints: list[str]

# --- SEVERITY LOGIC ---
def analyze_height_severity(text):
    pattern = r"(\d+)(?:st|nd|rd|th)?\s*(?:floor|storey|story|building)"
    match = re.search(pattern, text.lower())
    if match:
        floor = int(match.group(1))
        if floor > 3: return 40
        if floor > 0: return 20
        if floor == 0: return 5
    return 0

def calculate_priority(text, category):
    text_lower = text.lower()
    score = 0
    category_weights = {
        "Fire": 85, "Medical": 60, "Electricity": 50,
        "Police": 40, "Road": 30, "Water": 30
    }
    score = category_weights.get(category, 30)

    if "fall" in text_lower or "fell" in text_lower or "jump" in text_lower:
        height_points = analyze_height_severity(text)
        if height_points > 0: score += height_points
        else: score += 15

    critical_keywords = [
        "death", "dead", "blood", "explosion", "blast", "gas leak", 
        "collapse", "unconscious", "not breathing", "severe head injury"
    ]
    if any(word in text_lower for word in critical_keywords):
        return 100, "Critical"

    urgent_keywords = [
        "fire", "spark", "wire", "current", "accident", "injury", 
        "broken", "fracture", "bleeding", "attack", "emergency"
    ]
    matches = sum(1 for word in urgent_keywords if word in text_lower)
    score += (matches * 10) 

    score = min(score, 100)
    if score >= 90: level = "Critical"
    elif score >= 70: level = "High"
    elif score >= 40: level = "Medium"
    else: level = "Low"

    return score, level

# --- ENDPOINTS ---

@app.post("/predict")
def predict_complaint(data: ComplaintInput):
    prediction = model.predict([data.text])[0]
    probs = model.predict_proba([data.text])
    confidence = float(np.max(probs))
    score, level = calculate_priority(data.text, prediction)
    
    return {
        "category": prediction,
        "priority_score": score,
        "priority_level": level,
        "ai_confidence": f"{confidence:.2f}"
    }

@app.post("/check_duplicate")
def check_duplicate(data: DuplicateCheckInput):
    try:
        if not data.existing_complaints:
            return {"is_duplicate": False, "score": 0.0}

        # 1. Vectorize
        new_vector = semantic_model.encode([data.new_complaint])
        existing_vectors = semantic_model.encode(data.existing_complaints)

        # 2. Calculate Similarity
        scores = cosine_similarity(new_vector, existing_vectors)[0]
        max_score = float(np.max(scores))

        # --- DEBUG PRINT ---
        # Watch your Python Terminal when you click Submit!
        print(f"\n🔍 DUPLICATE CHECK:")
        print(f"   New Text: {data.new_complaint}")
        print(f"   Max Similarity Score: {max_score:.4f}")
        print(f"   Result: {'DUPLICATE' if max_score > 0.55 else 'UNIQUE'}\n")

        # --- THRESHOLD SET TO 0.55 (55%) ---
        is_dup = max_score > 0.55

        return {
            "is_duplicate": is_dup,
            "score": max_score
        }
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

@app.get("/")
def home():
    return {"message": "AI Grievance System V3.2 (Context-Aware) is Online 🤖"}