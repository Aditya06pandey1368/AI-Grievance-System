import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel

# 1. Load the Trained Model
# We load it once when the server starts so it's fast
model = joblib.load("complaint_model.pkl")

app = FastAPI()

class ComplaintInput(BaseModel):
    text: str

# Helper function to calculate priority
def calculate_priority(text, category, probability):
    # Base score from AI confidence (0-100)
    score = int(probability * 100)
    
    # Boost score for dangerous keywords
    text_lower = text.lower()
    urgent_keywords = ['fire', 'accident', 'blood', 'death', 'spark', 'current', 'attack']
    
    if any(word in text_lower for word in urgent_keywords):
        score = min(score + 20, 100) # Max 100
        
    # Determine Label
    if score > 80: level = "Critical"
    elif score > 60: level = "High"
    elif score > 40: level = "Medium"
    else: level = "Low"
        
    return score, level

@app.post("/predict")
def predict_complaint(data: ComplaintInput):
    # 1. Predict Category
    prediction = model.predict([data.text])[0]
    
    # 2. Get Confidence Score (Probability)
    # This tells us how "sure" the AI is (e.g., 0.95 = 95% sure)
    probs = model.predict_proba([data.text])
    confidence = np.max(probs) 
    
    # 3. Calculate Priority
    score, level = calculate_priority(data.text, prediction, confidence)
    
    return {
        "category": prediction,
        "priority_score": score,
        "priority_level": level
    }

@app.get("/")
def home():
    return {"message": "AI Grievance System is Online 🤖"}