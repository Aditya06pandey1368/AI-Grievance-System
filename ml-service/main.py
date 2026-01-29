import joblib
import numpy as np
import pandas as pd
import os
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

# Import the training logic we just wrote
from train_model import train_and_save

# --- CONFIGURATION ---
DEPT_MODEL_FILE = "complaint_model.pkl"
PRIORITY_MODEL_FILE = "priority_model.pkl"
FEEDBACK_FILE = "feedback.csv"

# Global Variables to hold models in memory
dept_model = None
priority_model = None
semantic_model = None

# --- LIFESPAN MANAGER (Startup & Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global dept_model, priority_model, semantic_model
    print("🚀 System Startup: Loading AI Models...")
    
    # 1. Load Semantic Search Model (Downloads if missing)
    semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # 2. Load Classification Models (Department & Priority)
    if os.path.exists(DEPT_MODEL_FILE) and os.path.exists(PRIORITY_MODEL_FILE):
        dept_model = joblib.load(DEPT_MODEL_FILE)
        priority_model = joblib.load(PRIORITY_MODEL_FILE)
        print("✅ Models Loaded from Disk.")
    else:
        print("⚠️ Models missing. Training from scratch now...")
        # Auto-train if files are missing
        dept_model, priority_model = train_and_save()

    # 3. Start Weekly Retraining Scheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(scheduled_retrain, 'interval', days=7)
    scheduler.start()
    print("⏰ Weekly Retraining Scheduler Started.")
    
    yield # App runs here
    
    scheduler.shutdown()
    print("🛑 Scheduler Shut Down.")

app = FastAPI(lifespan=lifespan)

# --- HELPER FUNCTIONS ---

def scheduled_retrain():
    """Wrapper for the scheduler"""
    print("⏰ AUTOMATIC TASK: Weekly Retraining Started...")
    perform_retraining()

def perform_retraining():
    """Reads feedback, retrains both models, and updates memory."""
    global dept_model, priority_model
    
    if not os.path.exists(FEEDBACK_FILE):
        print("ℹ️ No feedback data found. Skipping retrain.")
        return {"message": "No new data to train on."}
    
    try:
        # Load feedback (handle potential empty file issues)
        try:
            df_feedback = pd.read_csv(FEEDBACK_FILE)
        except pd.errors.EmptyDataError:
            print("⚠️ Feedback file is empty.")
            return {"message": "Feedback file empty."}

        # Train both models (Base Data + Feedback)
        print("🔄 Retraining started...")
        new_dept, new_prio = train_and_save(df_feedback)
        
        # Hot Swap Models in Memory
        dept_model = new_dept
        priority_model = new_prio
        print("✅ HOT RELOAD: System is using updated brains!")
        return {"message": "Retraining Successful & Models Reloaded"}
        
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
    correct_category: str = None  # Optional (Admin might only change Priority)
    correct_priority: str = None  # Optional (Admin might only change Dept)

# --- ENDPOINTS ---

@app.get("/")
def home():
    return {"message": "AI Grievance System V5.0 (Dual-Brain Learning) is Online 🤖"}

@app.post("/predict")
def predict_complaint(data: ComplaintInput):
    # 1. Predict Department
    cat_pred = dept_model.predict([data.text])[0]
    # Get confidence (probability)
    probs = dept_model.predict_proba([data.text])
    cat_prob = float(np.max(probs))
    
    # 2. Predict Priority (Now using ML Model!)
    prio_pred = priority_model.predict([data.text])[0]
    
    # 3. Convert Priority Label to Score (For Sorting)
    # Critical=95, High=75, Medium=50, Low=25
    score_map = {"Critical": 95, "High": 75, "Medium": 50, "Low": 25}
    prio_score = score_map.get(prio_pred, 50)

    return {
        "category": cat_pred,
        "priority_level": prio_pred,
        "priority_score": prio_score,
        "ai_confidence": f"{cat_prob:.2f}"
    }

@app.post("/check_duplicate")
def check_duplicate(data: DuplicateCheckInput):
    if not data.existing_complaints:
        return {"is_duplicate": False, "score": 0.0}

    # Semantic Similarity Logic
    new_vec = semantic_model.encode([data.new_complaint])
    existing_vectors = semantic_model.encode(data.existing_complaints)

    scores = cosine_similarity(new_vec, existing_vectors)[0]
    max_score = float(np.max(scores))

    # Debug Log
    print(f"🔍 Check: '{data.new_complaint[:20]}...' Score: {max_score:.3f}")

    # Threshold 0.55 (55%)
    return {
        "is_duplicate": max_score > 0.55,
        "score": max_score
    }

@app.post("/feedback")
def submit_feedback(data: FeedbackInput):
    try:
        # Prepare new row
        new_row = {"text": data.text, "category": None, "priority": None}
        
        if data.correct_category: new_row["category"] = data.correct_category
        if data.correct_priority: new_row["priority"] = data.correct_priority

        new_df = pd.DataFrame([new_row])

        # Append to CSV
        if not os.path.exists(FEEDBACK_FILE):
            new_df.to_csv(FEEDBACK_FILE, index=False)
        else:
            new_df.to_csv(FEEDBACK_FILE, mode='a', header=False, index=False)

        print(f"📝 Feedback Saved: {new_row}")
        return {"message": "Feedback recorded. Will be used in next training."}
    except Exception as e:
        return {"error": str(e)}

@app.post("/retrain")
def manual_retrain(background_tasks: BackgroundTasks):
    # Triggers retraining in the background so API doesn't freeze
    background_tasks.add_task(perform_retraining)
    return {"message": "Retraining process started in background."}