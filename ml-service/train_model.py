import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

# 1. THE EXPANDED DATASET
data = [
    # --- ROAD / TRANSPORT ---
    ("Deep pothole on main road causing accidents", "Road"),
    ("Traffic light signal stuck on red", "Road"),
    ("The asphalt is broken and dangerous", "Road"),
    ("Zebra crossing paint has faded away", "Road"),
    ("Huge crack in the middle of the highway", "Road"),
    ("School bus stuck in traffic due to bad road", "Road"),
    ("Manhole cover is missing on the footpath", "Road"),
    ("Speed breaker is too high and unpainted", "Road"),
    
    # --- ELECTRICITY ---
    ("Street light pole is rusted and falling", "Electricity"),
    ("Street light not working at night", "Electricity"),
    ("Electric wire hanging loose sparks coming out", "Electricity"),
    ("Transformer caught fire near my house", "Electricity"),
    ("No power supply in the colony", "Electricity"),
    ("Voltage fluctuation damaged appliances", "Electricity"),
    ("Live wire touching the school fence", "Electricity"),
    ("Meter box is sparking continuously", "Electricity"),

    # --- WATER / SANITATION ---
    ("Dirty water coming from the tap smells bad", "Water"),
    ("Pipeline burst and water is wasting", "Water"),
    ("No water supply since morning", "Water"),
    ("Sewage blocked and overflowing on road", "Water"),
    ("Drainage is clogged and mosquitoes breeding", "Water"),
    ("Water tank leaking on the roof", "Water"),
    ("Contaminated water causing illness", "Water"),

    # --- POLICE / CRIME ---
    ("Loud noise from neighbors late at night", "Police"),
    ("Suspicious people loitering in the park", "Police"),
    ("Theft happened in my shop yesterday", "Police"),
    ("Fighting and shouting in the street", "Police"),
    ("Drunk people creating nuisance", "Police"),
    ("Chain snatching incident near market", "Police"),
    ("Domestic violence reported next door", "Police"),

    # --- FIRE / DISASTER (NEW) ---
    ("Gas leak smell coming from neighbor's house", "Fire"),
    ("Huge fire broke out in the garbage dump", "Fire"),
    ("Cylinder blast in the kitchen", "Fire"),
    ("Smoke coming from the basement", "Fire"),
    ("Building collapse near the construction site", "Fire"),

    # --- MEDICAL / EMERGENCY (NEW) ---
    ("Child accident near school gate bleeding", "Medical"),
    ("Old man collapsed on the road unconscious", "Medical"),
    ("Dengue outbreak in the society", "Medical"),
    ("Stray dog bit a child severely", "Medical"),
    ("Food poisoning case in the hostel", "Medical"),
    ("Ambulance stuck in traffic jam", "Medical"),
]

# Convert to DataFrame
df = pd.DataFrame(data, columns=["text", "category"])

# 2. CREATE THE PIPELINE
# FIXED: Removed 'solver=liblinear' so it works for multiple categories automatically
model = make_pipeline(
    TfidfVectorizer(ngram_range=(1, 2)), 
    LogisticRegression(C=10.0) 
)

# 3. TRAIN THE MODEL
print("🧠 Training the model on enhanced dataset...")
model.fit(df["text"], df["category"])
print("✅ Model Trained!")

# 4. SAVE THE MODEL
joblib.dump(model, "complaint_model.pkl")
print("💾 Model saved to 'complaint_model.pkl'")