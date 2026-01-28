import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

# 1. THE MASSIVE DATASET (Balanced & Context-Aware)
data = [
    # =========================================================
    # 1. ROAD (Keywords: Pothole, Tarmac, Asphalt, Divider)
    # =========================================================
    ("Deep pothole on the main road causing accidents", "Road"),
    ("The asphalt is broken and dangerous to drive", "Road"),
    ("Huge crack in the middle of the highway", "Road"),
    ("Speed breaker is too high and unpainted", "Road"),
    ("Manhole cover is missing on the footpath", "Road"),
    ("Zebra crossing paint has completely faded away", "Road"),
    ("Street sign fell down blocking the lane", "Road"),
    ("Divider broken on the main street", "Road"),
    ("Road surface is uneven and bumpy", "Road"),
    ("Traffic light signal stuck on red causing jam", "Road"),
    ("School bus stuck in traffic due to bad road condition", "Road"),
    ("Construction material dumped on the road blocking traffic", "Road"),
    ("The road is waterlogged and slippery", "Road"), # Road issue caused by water
    ("Big crater on the street near the market", "Road"),
    ("Footpath is broken and unsafe for pedestrians", "Road"),
    ("Road widening work left incomplete", "Road"),

    # =========================================================
    # 2. ELECTRICITY (Keywords: Wire, Pole, Spark, Current, Voltage)
    # =========================================================
    ("Street light pole is rusted and falling", "Electricity"),
    ("Street light not working at night", "Electricity"),
    ("Electric wire hanging loose sparks coming out", "Electricity"),
    ("Transformer caught fire near the colony", "Electricity"), 
    ("No power supply in the area since morning", "Electricity"),
    ("Voltage fluctuation damaged my appliances", "Electricity"),
    ("Live wire touching the school fence", "Electricity"),
    ("Meter box is sparking continuously", "Electricity"),
    ("Power cut in the apartment for 5 hours", "Electricity"),
    ("Electric pole leaning dangerously", "Electricity"),
    ("High tension wire fell on the ground", "Electricity"),
    ("Sparks coming from the transformer in the park", "Electricity"), # TRAP: Park + Spark = Electricity
    ("Electric pole inside the park is giving shock", "Electricity"), # TRAP: Park + Shock = Electricity
    ("Street light flickering constantly", "Electricity"),
    ("Exposed underground cable on the footpath", "Electricity"),

    # =========================================================
    # 3. WATER (Keywords: Leak, Supply, Dirty, Pipe, Pressure)
    # =========================================================
    ("Dirty water coming from the tap smells bad", "Water"),
    ("Pipeline burst and water is wasting", "Water"),
    ("No water supply since yesterday", "Water"),
    ("Water pressure is very low in our area", "Water"),
    ("Main water pipe leaking on the street", "Water"), # TRAP: Street + Leak = Water
    ("Water tank leaking on the roof", "Water"),
    ("Contaminated water causing illness", "Water"),
    ("Tap water is muddy and brown", "Water"),
    ("Sewage water mixing with drinking water line", "Water"),
    ("Water meter is broken and leaking", "Water"),
    ("Supply water has a chemical smell", "Water"),
    ("Handpump is broken and not giving water", "Water"),
    ("Water pipe burst flooding the road", "Water"), # TRAP: Road + Flood = Water issue

    # =========================================================
    # 4. SANITATION (Keywords: Garbage, Trash, Drain, Smell, Dustbin)
    # =========================================================
    ("Garbage truck did not come today", "Sanitation"),
    ("Dustbins are overflowing in the park", "Sanitation"),
    ("Sewage blocked and overflowing on road", "Sanitation"),
    ("Drainage is clogged and mosquitoes breeding", "Sanitation"),
    ("Bad smell coming from open drain", "Sanitation"),
    ("Sweepers are not cleaning the streets", "Sanitation"),
    ("Public toilet is very dirty and unusable", "Sanitation"),
    ("Heaps of trash lying on the corner", "Sanitation"),
    ("Dead rat smell coming from the gutter", "Sanitation"),
    ("Waste is piling up near the school", "Sanitation"),
    ("Open sewer manhole causing smell", "Sanitation"),
    ("Cleaning staff is burning plastic waste", "Sanitation"),
    ("Garbage dump is attracting stray dogs", "Sanitation"),
    ("Toilet facility is locked and dirty", "Sanitation"),

    # =========================================================
    # 5. POLICE (Keywords: Theft, Fight, Noise, Harassment)
    # =========================================================
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
    ("Drug peddling suspected in the alley", "Police"),
    ("Lost my wallet and phone", "Police"),
    ("Cyber crime money deducted from account", "Police"),

    # =========================================================
    # 6. FIRE (Keywords: Fire, Smoke, Blast, Gas)
    # =========================================================
    ("Gas leak smell coming from neighbor's house", "Fire"),
    ("Huge fire broke out in the garbage dump", "Fire"),
    ("Cylinder blast in the kitchen", "Fire"),
    ("Smoke coming from the basement", "Fire"),
    ("Fire in the chemical factory nearby", "Fire"),
    ("Short circuit caused fire in the building", "Fire"),
    ("Car caught fire on the road", "Fire"),
    ("Fire extinguisher not working during fire", "Fire"),
    ("Bonfire spreading to nearby trees", "Fire"),
    ("Electrical panel caught fire", "Fire"),

    # =========================================================
    # 7. URBAN PLANNING (Keywords: Illegal, Encroachment, Zoning)
    # =========================================================
    ("Illegal construction happening without permit", "URBAN PLANNING & REGULATION"),
    ("Neighbor is encroaching on public land", "URBAN PLANNING & REGULATION"),
    ("Shop extended onto the footpath illegally", "URBAN PLANNING & REGULATION"),
    ("Building violates zoning regulations", "URBAN PLANNING & REGULATION"),
    ("Illegal basement digging impacting my house", "URBAN PLANNING & REGULATION"),
    ("Unauthorised floor added to the building", "URBAN PLANNING & REGULATION"),
    ("Commercial shop running in residential area", "URBAN PLANNING & REGULATION"),
    ("Hoardings and banners blocking the view", "URBAN PLANNING & REGULATION"),
    ("Construction happening at night disturbing sleep", "URBAN PLANNING & REGULATION"),
    ("Park land is being captured by builders", "URBAN PLANNING & REGULATION"),

    # =========================================================
    # 8. ENVIRONMENTAL (Keywords: Pollution, Smoke, Trees, River)
    # =========================================================
    ("Factory releasing black smoke causing air pollution", "Environmental Protection"),
    ("Chemicals being dumped into the river", "Environmental Protection"),
    ("Someone is cutting down green trees illegally", "Environmental Protection"),
    ("Burning plastic and tires in the open", "Environmental Protection"),
    ("Noise pollution from industrial generator", "Environmental Protection"),
    ("Illegal dumping of hazardous waste", "Environmental Protection"),
    ("Construction dust causing breathing issues", "Environmental Protection"),
    ("Lake water is turning green and toxic", "Environmental Protection"),
    ("Cutting of old banyan tree", "Environmental Protection"),
    ("Factory discharging untreated water", "Environmental Protection"),

    # =========================================================
    # 9. ANIMAL CONTROL (Keywords: Dog, Cow, Monkey, Bite)
    # =========================================================
    ("Stray dog bit a child in the colony", "Animal Control & Veterinary"),
    ("Herd of cows blocking the traffic", "Animal Control & Veterinary"),
    ("Dead animal lying on the road needs removal", "Animal Control & Veterinary"),
    ("Monkey menace destroying crops and plants", "Animal Control & Veterinary"),
    ("Someone is beating a dog cruelly", "Animal Control & Veterinary"),
    ("Aggressive stray dogs chasing bikes", "Animal Control & Veterinary"),
    ("Injured cow needs medical attention", "Animal Control & Veterinary"),
    ("Snake found in the residential compound", "Animal Control & Veterinary"),
    ("Dog barking aggressively at night", "Animal Control & Veterinary"),
    ("Cat stuck on a tall tree", "Animal Control & Veterinary"),
    ("Wild boar entered the society", "Animal Control & Veterinary"),

    # =========================================================
    # 10. DISASTER MANAGEMENT (Keywords: Flood, Quake, Collapse)
    # =========================================================
    ("Flood water entering houses after heavy rain", "Disaster Management"),
    ("Building collapsed trapping people inside", "Disaster Management"),
    ("Landslide blocked the mountain road", "Disaster Management"),
    ("Earthquake cracks seen on the bridge", "Disaster Management"),
    ("River level rising dangerously above danger mark", "Disaster Management"),
    ("Cyclone relief shelter needed immediately", "Disaster Management"),
    ("Cloudburst washed away the shops", "Disaster Management"),
    ("Dam gates opened causing flood risk", "Disaster Management"),
    ("Tsunami warning siren malfunction", "Disaster Management"),
]

# Convert to DataFrame
df = pd.DataFrame(data, columns=["text", "category"])

# 2. CREATE THE PIPELINE
# ngram_range=(1,2) is CRITICAL. It lets AI see "Gas Leak" as one concept, not just "Gas" and "Leak" separately.
model = make_pipeline(
    TfidfVectorizer(ngram_range=(1, 2)), 
    LogisticRegression(C=10.0, max_iter=1000) 
)

# 3. TRAIN THE MODEL
print(f"🧠 Training on {len(data)} detailed examples across 10 Departments...")
model.fit(df["text"], df["category"])
print("✅ Model Trained Successfully!")

# 4. SAVE THE MODEL
joblib.dump(model, "complaint_model.pkl")
print("💾 Model saved to 'complaint_model.pkl'")