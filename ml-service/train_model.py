import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

# 1. THE DATASET (Flashcards for the AI)
# In a real startup, this would come from a CSV file with thousands of rows.
data = [
    # Road / Transport
    ("Deep pothole on main street causing accidents", "Road"),
    ("Traffic light not working at huge intersection", "Road"),
    ("The road is broken and very dangerous", "Road"),
    ("Street sign fell down blocking the path", "Road"),
    ("Zebra crossing paint has faded away", "Road"),
    
    # Electricity
    ("Electric wire hanging loose sparks coming out", "Electricity"),
    ("Power cut in our area for 24 hours", "Electricity"),
    ("Transformer caught fire near my house", "Electricity"),
    ("Voltage fluctuation damaged my appliances", "Electricity"),
    ("Street light not working its very dark", "Electricity"),
    
    # Water / Sanitation
    ("Dirty water coming from the tap smells bad", "Water"),
    ("Pipeline burst and water is wasting", "Water"),
    ("No water supply since morning", "Water"),
    ("Sewage blocked and overflowing on road", "Water"),
    ("Drainage is clogged and mosquitoes breeding", "Water"),

    # Police / Safety
    ("Loud noise from neighbors late at night", "Police"),
    ("Suspicious people loitering in the park", "Police"),
    ("Theft happened in my shop yesterday", "Police"),
    ("Fighting and shouting in the street", "Police"),
]

# Convert to DataFrame (Table format)
df = pd.DataFrame(data, columns=["text", "category"])

# 2. CREATE THE PIPELINE (The Learning Process)
# Step A: TfidfVectorizer -> Turns words into numbers (Math)
# Step B: LogisticRegression -> Finds the line that separates categories
model = make_pipeline(TfidfVectorizer(), LogisticRegression())

# 3. TRAIN THE MODEL (Teaching)
print("🧠 Training the model...")
model.fit(df["text"], df["category"])
print("✅ Model Trained!")

# 4. SAVE THE MODEL (Freezing the Brain)
# We save it as a file so the API can load it later
joblib.dump(model, "complaint_model.pkl")
print("💾 Model saved to 'complaint_model.pkl'")