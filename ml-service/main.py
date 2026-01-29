import joblib
import numpy as np
import pandas as pd
import os
import re
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

# Import our custom training logic
from train_model import train_and_save

# --- CONFIGURATION ---
MODEL_FILE = "complaint_model.pkl"
FEEDBACK_FILE = "feedback.csv"

# Global Variable to hold the model in memory
classification_model = None
semantic_model = None

# --- LIFESPAN MANAGER (Startup/Shutdown Logic) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. LOAD MODELS ON STARTUP
    global classification_model, semantic_model
    print("🚀 System Startup: Loading Models...")
    
    # Load Semantic Model (Downloads if not present)
    semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Load Classification Model
    if os.path.exists(MODEL_FILE):
        classification_model = joblib.load(MODEL_FILE)
        print("✅ Classification Model Loaded from Disk.")
    else:
        print("⚠️ No model found. Training from scratch now...")
        classification_model = train_and_save() # Auto-train if missing

    # 2. START SCHEDULER (Weekly Retraining)
    scheduler = BackgroundScheduler()
    # Schedules the 'scheduled_retrain' function to run every 7 days
    scheduler.add_job(scheduled_retrain, 'interval', days=7)
    scheduler.start()
    print("⏰ Weekly Retraining Scheduler Started (Every 7 Days)")

    yield # App runs here

    # 3. SHUTDOWN
    scheduler.shutdown()
    print("🛑 Scheduler Shut Down.")

app = FastAPI(lifespan=lifespan)

# --- SCHEDULER FUNCTION ---
def scheduled_retrain():
    print("⏰ AUTOMATIC TASK: Weekly Retraining Started...")
    perform_retraining()

# --- HELPER: CORE RETRAINING LOGIC ---
def perform_retraining():
    global classification_model
    
    # 1. Check if feedback exists
    if not os.path.exists(FEEDBACK_FILE):
        print("ℹ️ No feedback data found. Skipping retrain.")
        return {"message": "No new data to train on."}
    
    try:
        # 2. Load Feedback Data
        df_feedback = pd.read_csv(FEEDBACK_FILE)
        
        # 3. Train (Base Data + Feedback)
        # This function (from train_model.py) handles the merging and saving
        new_model = train_and_save(df_feedback)
        
        # 4. Hot Swap the Model in Memory
        classification_model = new_model
        print("✅ HOT RELOAD: System is now using the updated brain!")
        return {"message": "Retraining Successful & Model Reloaded"}
        
    except Exception as e:
        print(f"❌ Retraining Failed: {e}")
        return {"error": str(e)}

# --- INPUT SCHEMAS ---
class ComplaintInput(BaseModel):
    text: str

class DuplicateCheckInput(BaseModel):
    new_complaint: str
    existing_complaints: list[str]

class FeedbackInput(BaseModel):
    text: str
    correct_category: str

# --- PRIORITY LOGIC (Keep as is) ---
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

# --- API ENDPOINTS ---

@app.get("/")
def home():
    return {"message": "AI Grievance System V4.0 (Self-Learning) is Online 🤖"}

@app.post("/predict")
def predict_complaint(data: ComplaintInput):
    # Use the global model loaded in memory
    prediction = classification_model.predict([data.text])[0]
    probs = classification_model.predict_proba([data.text])
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
    if not data.existing_complaints:
        return {"is_duplicate": False, "score": 0.0}

    new_vector = semantic_model.encode([data.new_complaint])
    existing_vectors = semantic_model.encode(data.existing_complaints)

    scores = cosine_similarity(new_vector, existing_vectors)[0]
    max_score = float(np.max(scores))

    # Debug print
    print(f"🔍 Check: {data.new_complaint[:30]}... Score: {max_score:.3f}")

    return {
        "is_duplicate": max_score > 0.55,
        "score": max_score
    }

# 1. FEEDBACK ENDPOINT (Collects mistakes)
@app.post("/feedback")
def submit_feedback(data: FeedbackInput):
    try:
        # Create a DataFrame for the new entry
        new_entry = pd.DataFrame([[data.text, data.correct_category]], columns=["text", "category"])
        
        # Append to CSV (create if doesn't exist)
        if not os.path.exists(FEEDBACK_FILE):
            new_entry.to_csv(FEEDBACK_FILE, index=False)
        else:
            new_entry.to_csv(FEEDBACK_FILE, mode='a', header=False, index=False)
            
        print(f"📝 Feedback Saved: '{data.text}' -> Should be '{data.correct_category}'")
        return {"message": "Feedback saved. Will be included in next weekly training."}
    except Exception as e:
        return {"error": str(e)}

# 2. MANUAL RETRAIN ENDPOINT (The Button)
@app.post("/retrain")
def manual_retrain(background_tasks: BackgroundTasks):
    # Runs in background so the UI doesn't freeze
    background_tasks.add_task(perform_retraining)
    return {"message": "Retraining process started in background."}