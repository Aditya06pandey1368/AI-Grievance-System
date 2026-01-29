import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

# --- 1. DEFINE BASE DATASETS ---
# Format: ("Complaint Text", "Department Label", "Priority Label")

def get_base_dataset():
    data = [
        # =========================================================
        # 1. ROAD (Department: Road)
        # =========================================================
        ("Deep pothole on the main road causing accidents", "Road", "High"),
        ("The asphalt is broken and dangerous to drive", "Road", "High"),
        ("Huge crack in the middle of the highway", "Road", "High"),
        ("Speed breaker is too high and unpainted", "Road", "Medium"),
        ("Manhole cover is missing on the footpath", "Road", "Critical"), # Critical safety risk
        ("Street sign fell down blocking the lane", "Road", "Medium"),
        ("Divider broken on the main street", "Road", "Medium"),
        ("Road surface is uneven and bumpy", "Road", "Low"),
        ("Traffic light signal stuck on red", "Road", "High"),
        ("The road is waterlogged and slippery", "Road", "Medium"), 
        ("Big crater on the street near the market", "Road", "High"),
        ("Footpath is broken and unsafe", "Road", "Medium"),
        ("Child fell into open manhole", "Road", "Critical"), # Added for Priority training
        ("Major accident on highway due to pothole", "Road", "Critical"),

        # =========================================================
        # 2. ELECTRICITY (Department: Electricity)
        # =========================================================
        ("Street light pole is rusted and falling", "Electricity", "High"),
        ("Street light not working at night", "Electricity", "Medium"),
        ("Electric wire hanging loose sparks coming out", "Electricity", "Critical"),
        ("Transformer caught fire near the colony", "Electricity", "Critical"), 
        ("No power supply in the area", "Electricity", "High"),
        ("Voltage fluctuation damaged appliances", "Electricity", "High"),
        ("Live wire touching the school fence", "Electricity", "Critical"),
        ("Meter box is sparking continuously", "Electricity", "High"),
        ("Electric pole leaning dangerously", "Electricity", "High"),
        ("Sparks coming from the transformer in the park", "Electricity", "High"), 
        ("Electric pole inside the park is giving shock", "Electricity", "Critical"), 
        ("Street light flickering constantly", "Electricity", "Low"),

        # =========================================================
        # 3. WATER (Department: Water)
        # =========================================================
        ("Dirty water coming from the tap smells bad", "Water", "High"),
        ("Pipeline burst and water is wasting", "Water", "High"),
        ("No water supply since yesterday", "Water", "High"),
        ("Water pressure is very low", "Water", "Medium"),
        ("Main water pipe leaking on the street", "Water", "High"), 
        ("Water tank leaking on the roof", "Water", "Medium"),
        ("Contaminated water causing illness", "Water", "Critical"),
        ("Tap water is muddy and brown", "Water", "High"),
        ("Water pipe burst flooding the road", "Water", "High"),
        ("Dirty water mixing with sewage causing disease", "Water", "Critical"),

        # =========================================================
        # 4. SANITATION (Department: Sanitation)
        # =========================================================
        ("Garbage truck did not come today", "Sanitation", "Medium"),
        ("Dustbins are overflowing in the park", "Sanitation", "Medium"),
        ("Sewage blocked and overflowing on road", "Sanitation", "High"), # Health Risk
        ("Drainage is clogged and mosquitoes breeding", "Sanitation", "High"),
        ("Bad smell coming from open drain", "Sanitation", "Medium"),
        ("Sweepers are not cleaning the streets", "Sanitation", "Low"),
        ("Public toilet is very dirty", "Sanitation", "Medium"),
        ("Heaps of trash lying on the corner", "Sanitation", "Medium"),
        ("Dead rat smell coming from the gutter", "Sanitation", "Medium"),
        ("Waste is piling up near the school", "Sanitation", "High"),
        ("Garbage dump is attracting stray dogs", "Sanitation", "Medium"),

        # =========================================================
        # 5. POLICE (Department: Police)
        # =========================================================
        ("Loud noise from neighbors late at night", "Police", "Medium"),
        ("Suspicious people loitering in the park", "Police", "Medium"),
        ("Theft happened in my shop", "Police", "High"),
        ("Fighting and shouting in the street", "Police", "High"),
        ("Drunk people creating nuisance", "Police", "Medium"),
        ("Chain snatching incident", "Police", "High"),
        ("Domestic violence reported next door", "Police", "Critical"),
        ("Theft occurred at my house", "Police", "High"),
        ("Burglary attempt at home", "Police", "High"),
        ("Huge noise pollution from next door party", "Police", "Medium"), 
        ("Loud DJ music causing noise disturbance", "Police", "Medium"),
        ("Neighbors creating noise pollution with speakers", "Police", "Medium"),
        ("Noise disturbance from late night party", "Police", "Medium"),

        # =========================================================
        # 6. FIRE (Department: Fire)
        # =========================================================
        ("Gas leak smell coming from neighbor's house", "Fire", "Critical"),
        ("Huge fire broke out in the garbage dump", "Fire", "Critical"),
        ("Cylinder blast in the kitchen", "Fire", "Critical"),
        ("Smoke coming from the basement", "Fire", "High"),
        ("Fire in the chemical factory", "Fire", "Critical"),
        ("Short circuit caused fire", "Fire", "High"),
        ("Car caught fire on the road", "Fire", "Critical"),

        # =========================================================
        # 7. URBAN PLANNING (Department: URBAN PLANNING & REGULATION)
        # =========================================================
        ("Illegal construction happening without permit", "URBAN PLANNING & REGULATION", "Medium"),
        ("Neighbor is encroaching on public land", "URBAN PLANNING & REGULATION", "Medium"),
        ("Shop extended onto the footpath illegally", "URBAN PLANNING & REGULATION", "Medium"),
        ("Building violates zoning regulations", "URBAN PLANNING & REGULATION", "Medium"),
        ("Illegal basement digging", "URBAN PLANNING & REGULATION", "High"),
        ("Unauthorised floor added to the building", "URBAN PLANNING & REGULATION", "High"),
        ("Commercial shop running in residential area", "URBAN PLANNING & REGULATION", "Low"),
        ("Building collapsed trapping people inside", "Disaster Management", "Critical"), # Disaster Case

        # =========================================================
        # 8. ENVIRONMENTAL (Department: Environmental Protection)
        # =========================================================
        ("Factory releasing black smoke causing air pollution", "Environmental Protection", "High"),
        ("Chemicals being dumped into the river", "Environmental Protection", "Critical"),
        ("Someone is cutting down green trees illegally", "Environmental Protection", "Medium"),
        ("Burning plastic and tires in the open", "Environmental Protection", "Medium"),
        ("Noise pollution from industrial generator", "Environmental Protection", "Medium"), 
        ("Factory causing unbearable noise pollution", "Environmental Protection", "Medium"), 
        ("Construction dust causing breathing issues", "Environmental Protection", "High"),
        ("Lake water is turning green and toxic", "Environmental Protection", "High"),

        # =========================================================
        # 9. ANIMAL CONTROL (Department: Animal Control & Veterinary)
        # =========================================================
        ("Stray dog bit a child in the colony", "Animal Control & Veterinary", "High"),
        ("Herd of cows blocking the traffic", "Animal Control & Veterinary", "Medium"),
        ("Dead animal lying on the road", "Animal Control & Veterinary", "Medium"),
        ("Monkey menace destroying crops", "Animal Control & Veterinary", "Medium"),
        ("Someone is beating a dog cruelly", "Animal Control & Veterinary", "Medium"),
        ("Aggressive stray dogs chasing bikes", "Animal Control & Veterinary", "High"),
        ("Injured cow needs medical attention", "Animal Control & Veterinary", "Medium"),
        ("Snake found in the residential compound", "Animal Control & Veterinary", "High"),

        # =========================================================
        # 10. DISASTER MANAGEMENT (Department: Disaster Management)
        # =========================================================
        ("Flood water entering houses after heavy rain", "Disaster Management", "Critical"),
        ("Building collapsed trapping people inside", "Disaster Management", "Critical"),
        ("Landslide blocked the mountain road", "Disaster Management", "Critical"),
        ("Earthquake cracks seen on the bridge", "Disaster Management", "Critical"),
        ("River level rising dangerously", "Disaster Management", "High"),
        ("Cyclone relief shelter needed", "Disaster Management", "High"),
        ("Cloudburst washed away the shops", "Disaster Management", "Critical"),
    ]
    # Creates 3 Columns: Text | Category | Priority
    return pd.DataFrame(data, columns=["text", "category", "priority"])

def train_and_save(custom_df=None):
    print("🔄 Loading Base Dataset...")
    df_base = get_base_dataset()

    # Merge Feedback Data if exists
    if custom_df is not None and not custom_df.empty:
        print(f"➕ Merging {len(custom_df)} new feedback samples...")
        # Concatenate and handle any missing columns if partial feedback
        df_final = pd.concat([df_base, custom_df], ignore_index=True)
    else:
        df_final = df_base

    # Handle NaN values (If Admin provided only Category but not Priority, or vice-versa)
    # We fill with "Other" or "Medium" so training doesn't crash
    df_final["category"] = df_final["category"].fillna("Other")
    df_final["priority"] = df_final["priority"].fillna("Medium")

    # --- BRAIN 1: DEPARTMENT CLASSIFIER ---
    print(f"🧠 Training Department Model on {len(df_final)} samples...")
    dept_model = make_pipeline(
        TfidfVectorizer(ngram_range=(1, 2)), 
        LogisticRegression(C=10.0, max_iter=1000) 
    )
    dept_model.fit(df_final["text"], df_final["category"])
    joblib.dump(dept_model, "complaint_model.pkl")

    # --- BRAIN 2: PRIORITY CLASSIFIER ---
    print(f"🔥 Training Priority Model on {len(df_final)} samples...")
    priority_model = make_pipeline(
        TfidfVectorizer(ngram_range=(1, 2)), 
        LogisticRegression(C=5.0, max_iter=1000) 
    )
    priority_model.fit(df_final["text"], df_final["priority"])
    joblib.dump(priority_model, "priority_model.pkl")

    print("✅ Both Models Trained & Saved!")
    return dept_model, priority_model

if __name__ == "__main__":
    train_and_save()