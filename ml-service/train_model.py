import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

# 1. THE EXPANDED DATASET (10 Distinct Departments)
data = [
    # ---------------------------------------------------------
    # 1. ROAD (Infrastructure, Traffic, Potholes)
    # ---------------------------------------------------------
    ("Deep pothole on main road causing accidents", "Road"),
    ("Traffic light signal stuck on red", "Road"),
    ("The asphalt is broken and dangerous", "Road"),
    ("Zebra crossing paint has faded away", "Road"),
    ("Huge crack in the middle of the highway", "Road"),
    ("School bus stuck in traffic due to bad road condition", "Road"),
    ("Manhole cover is missing on the footpath", "Road"),
    ("Speed breaker is too high and unpainted", "Road"),
    ("Street sign fell down blocking the lane", "Road"),
    ("Divider broken on the main street", "Road"),

    # ---------------------------------------------------------
    # 2. ELECTRICITY (Power, Wires, Poles)
    # ---------------------------------------------------------
    ("Street light pole is rusted and falling", "Electricity"),
    ("Street light not working at night", "Electricity"),
    ("Electric wire hanging loose sparks coming out", "Electricity"),
    ("Transformer caught fire near the colony", "Electricity"), 
    ("No power supply in the area", "Electricity"),
    ("Voltage fluctuation damaged appliances", "Electricity"),
    ("Live wire touching the school fence", "Electricity"),
    ("Meter box is sparking continuously", "Electricity"),
    ("Power cut in the apartment for 5 hours", "Electricity"),
    ("Electric pole leaning dangerously", "Electricity"),

    # ---------------------------------------------------------
    # 3. WATER (Supply, Leakage, Quality)
    # ---------------------------------------------------------
    ("Dirty water coming from the tap smells bad", "Water"),
    ("Pipeline burst and water is wasting", "Water"),
    ("No water supply since morning", "Water"),
    ("Water pressure is very low in our area", "Water"),
    ("Main water pipe leaking on the street", "Water"),
    ("Water tank leaking on the roof", "Water"),
    ("Contaminated water causing illness", "Water"),
    ("Tap water is muddy and brown", "Water"),
    
    # ---------------------------------------------------------
    # 4. SANITATION (Garbage, Drains, Cleaning)
    # ---------------------------------------------------------
    ("Garbage truck did not come today", "Sanitation"),
    ("Dustbins are overflowing in the park", "Sanitation"),
    ("Sewage blocked and overflowing on road", "Sanitation"),
    ("Drainage is clogged and mosquitoes breeding", "Sanitation"),
    ("Bad smell coming from open drain", "Sanitation"),
    ("Sweepers are not cleaning the streets", "Sanitation"),
    ("Public toilet is very dirty and unusable", "Sanitation"),
    ("Heaps of trash lying on the corner", "Sanitation"),
    ("Dead rat smell coming from the gutter", "Sanitation"),

    # ---------------------------------------------------------
    # 5. POLICE (Theft, Crime, Nuisance)
    # ---------------------------------------------------------
    ("Loud noise from neighbors late at night", "Police"),
    ("Suspicious people loitering in the park", "Police"),
    ("Theft happened in my shop yesterday", "Police"),
    ("Fighting and shouting in the street", "Police"),
    ("Drunk people creating nuisance", "Police"),
    ("Chain snatching incident near market", "Police"),
    ("Domestic violence reported next door", "Police"),
    ("Theft occurred at my house", "Police"),
    ("Burglary attempt at home", "Police"),
    ("Someone broke into my house and stole money", "Police"),
    ("Harassment of women near the bus stop", "Police"),
    ("Illegal gambling activity observed", "Police"),

    # ---------------------------------------------------------
    # 6. FIRE (Fire outbreaks, Gas leaks)
    # ---------------------------------------------------------
    ("Gas leak smell coming from neighbor's house", "Fire"),
    ("Huge fire broke out in the garbage dump", "Fire"),
    ("Cylinder blast in the kitchen", "Fire"),
    ("Smoke coming from the basement", "Fire"),
    ("Fire in the chemical factory nearby", "Fire"),
    ("Short circuit caused fire in the building", "Fire"),
    ("Car caught fire on the road", "Fire"),

    # ---------------------------------------------------------
    # 7. URBAN PLANNING & REGULATION (Construction, Encroachment)
    # ---------------------------------------------------------
    ("Illegal construction happening without permit", "Urban Planning"),
    ("Neighbor is encroaching on public land", "Urban Planning"),
    ("Shop extended onto the footpath illegally", "Urban Planning"),
    ("Building violates zoning regulations", "Urban Planning"),
    ("Illegal basement digging impacting my house", "Urban Planning"),
    ("Unauthorised floor added to the building", "Urban Planning"),
    ("Commercial shop running in residential area", "Urban Planning"),
    ("Hoardings and banners blocking the view", "Urban Planning"),

    # ---------------------------------------------------------
    # 8. ENVIRONMENTAL PROTECTION (Pollution, Trees, Dumping)
    # ---------------------------------------------------------
    ("Factory releasing black smoke causing air pollution", "Environmental Protection"),
    ("Chemicals being dumped into the river", "Environmental Protection"),
    ("Someone is cutting down green trees illegally", "Environmental Protection"),
    ("Burning plastic and tires in the open", "Environmental Protection"),
    ("Noise pollution from industrial generator", "Environmental Protection"),
    ("Illegal dumping of hazardous waste", "Environmental Protection"),
    ("Construction dust causing breathing issues", "Environmental Protection"),
    ("Lake water is turning green and toxic", "Environmental Protection"),

    # ---------------------------------------------------------
    # 9. ANIMAL CONTROL & VETERINARY (Stray animals, Cruelty)
    # ---------------------------------------------------------
    ("Stray dog bit a child in the colony", "Animal Control"),
    ("Herd of cows blocking the traffic", "Animal Control"),
    ("Dead animal lying on the road needs removal", "Animal Control"),
    ("Monkey menace destroying crops and plants", "Animal Control"),
    ("Someone is beating a dog cruelly", "Animal Control"),
    ("Aggressive stray dogs chasing bikes", "Animal Control"),
    ("Injured cow needs medical attention", "Animal Control"),
    ("Snake found in the residential compound", "Animal Control"),

    # ---------------------------------------------------------
    # 10. DISASTER MANAGEMENT (Floods, Earthquakes, Major Collapse)
    # ---------------------------------------------------------
    ("Flood water entering houses after heavy rain", "Disaster Management"),
    ("Building collapsed trapping people inside", "Disaster Management"),
    ("Landslide blocked the mountain road", "Disaster Management"),
    ("Earthquake cracks seen on the bridge", "Disaster Management"),
    ("River level rising dangerously above danger mark", "Disaster Management"),
    ("Cyclone relief shelter needed immediately", "Disaster Management"),
    ("Cloudburst washed away the shops", "Disaster Management"),
]

# Convert to DataFrame
df = pd.DataFrame(data, columns=["text", "category"])

# 2. CREATE THE PIPELINE
# Using 'lbfgs' solver (default) which is excellent for multiclass classification
model = make_pipeline(
    TfidfVectorizer(ngram_range=(1, 2)), 
    LogisticRegression(C=10.0, max_iter=1000) 
)

# 3. TRAIN THE MODEL
print("🧠 Training the model on 10 Departments dataset...")
model.fit(df["text"], df["category"])
print("✅ Model Trained Successfully!")

# 4. SAVE THE MODEL
joblib.dump(model, "complaint_model.pkl")
print("💾 Model saved to 'complaint_model.pkl'")