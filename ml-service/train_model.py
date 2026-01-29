import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

# --- 1. DEFINE BASE DATA AS A FUNCTION ---
# We wrap this in a function so main.py can call it later during retraining
def get_base_dataset():
    data = [
        # === ROAD ===
        ("Deep pothole on the main road causing accidents", "Road"),
        ("The asphalt is broken and dangerous to drive", "Road"),
        ("Huge crack in the middle of the highway", "Road"),
        ("Speed breaker is too high and unpainted", "Road"),
        ("Manhole cover is missing on the footpath", "Road"),
        ("Street sign fell down blocking the lane", "Road"),
        ("Divider broken on the main street", "Road"),
        ("Road surface is uneven and bumpy", "Road"),
        ("Traffic light signal stuck on red", "Road"),
        ("The road is waterlogged and slippery", "Road"), 
        ("Big crater on the street near the market", "Road"),
        ("Footpath is broken and unsafe", "Road"),

        # === ELECTRICITY ===
        ("Street light pole is rusted and falling", "Electricity"),
        ("Street light not working at night", "Electricity"),
        ("Electric wire hanging loose sparks coming out", "Electricity"),
        ("Transformer caught fire near the colony", "Electricity"), 
        ("No power supply in the area", "Electricity"),
        ("Voltage fluctuation damaged appliances", "Electricity"),
        ("Live wire touching the school fence", "Electricity"),
        ("Meter box is sparking continuously", "Electricity"),
        ("Electric pole leaning dangerously", "Electricity"),
        ("Sparks coming from the transformer in the park", "Electricity"), 
        ("Electric pole inside the park is giving shock", "Electricity"), 
        ("Street light flickering constantly", "Electricity"),

        # === WATER ===
        ("Dirty water coming from the tap smells bad", "Water"),
        ("Pipeline burst and water is wasting", "Water"),
        ("No water supply since yesterday", "Water"),
        ("Water pressure is very low", "Water"),
        ("Main water pipe leaking on the street", "Water"), 
        ("Water tank leaking on the roof", "Water"),
        ("Contaminated water causing illness", "Water"),
        ("Tap water is muddy and brown", "Water"),
        ("Water pipe burst flooding the road", "Water"),

        # === SANITATION ===
        ("Garbage truck did not come today", "Sanitation"),
        ("Dustbins are overflowing in the park", "Sanitation"),
        ("Sewage blocked and overflowing on road", "Sanitation"),
        ("Drainage is clogged and mosquitoes breeding", "Sanitation"),
        ("Bad smell coming from open drain", "Sanitation"),
        ("Sweepers are not cleaning the streets", "Sanitation"),
        ("Public toilet is very dirty", "Sanitation"),
        ("Heaps of trash lying on the corner", "Sanitation"),
        ("Dead rat smell coming from the gutter", "Sanitation"),
        ("Waste is piling up near the school", "Sanitation"),
        ("Garbage dump is attracting stray dogs", "Sanitation"),

        # === POLICE ===
        ("Loud noise from neighbors late at night", "Police"),
        ("Suspicious people loitering in the park", "Police"),
        ("Theft happened in my shop", "Police"),
        ("Fighting and shouting in the street", "Police"),
        ("Drunk people creating nuisance", "Police"),
        ("Chain snatching incident", "Police"),
        ("Domestic violence reported next door", "Police"),
        ("Theft occurred at my house", "Police"),
        ("Burglary attempt at home", "Police"),
        ("Huge noise pollution from next door party", "Police"), 
        ("Loud DJ music causing noise disturbance", "Police"),
        ("Neighbors creating noise pollution with speakers", "Police"),
        ("Noise disturbance from late night party", "Police"),

        # === FIRE ===
        ("Gas leak smell coming from neighbor's house", "Fire"),
        ("Huge fire broke out in the garbage dump", "Fire"),
        ("Cylinder blast in the kitchen", "Fire"),
        ("Smoke coming from the basement", "Fire"),
        ("Fire in the chemical factory", "Fire"),
        ("Short circuit caused fire", "Fire"),
        ("Car caught fire on the road", "Fire"),

        # === URBAN PLANNING ===
        ("Illegal construction happening without permit", "URBAN PLANNING & REGULATION"),
        ("Neighbor is encroaching on public land", "URBAN PLANNING & REGULATION"),
        ("Shop extended onto the footpath illegally", "URBAN PLANNING & REGULATION"),
        ("Building violates zoning regulations", "URBAN PLANNING & REGULATION"),
        ("Illegal basement digging", "URBAN PLANNING & REGULATION"),
        ("Unauthorised floor added to the building", "URBAN PLANNING & REGULATION"),
        ("Commercial shop running in residential area", "URBAN PLANNING & REGULATION"),

        # === ENVIRONMENTAL ===
        ("Factory releasing black smoke causing air pollution", "Environmental Protection"),
        ("Chemicals being dumped into the river", "Environmental Protection"),
        ("Someone is cutting down green trees illegally", "Environmental Protection"),
        ("Burning plastic and tires in the open", "Environmental Protection"),
        ("Noise pollution from industrial generator", "Environmental Protection"), 
        ("Factory causing unbearable noise pollution", "Environmental Protection"), 
        ("Construction dust causing breathing issues", "Environmental Protection"),
        ("Lake water is turning green and toxic", "Environmental Protection"),

        # === ANIMAL CONTROL ===
        ("Stray dog bit a child in the colony", "Animal Control & Veterinary"),
        ("Herd of cows blocking the traffic", "Animal Control & Veterinary"),
        ("Dead animal lying on the road", "Animal Control & Veterinary"),
        ("Monkey menace destroying crops", "Animal Control & Veterinary"),
        ("Someone is beating a dog cruelly", "Animal Control & Veterinary"),
        ("Aggressive stray dogs chasing bikes", "Animal Control & Veterinary"),
        ("Injured cow needs medical attention", "Animal Control & Veterinary"),
        ("Snake found in the residential compound", "Animal Control & Veterinary"),

        # === DISASTER MANAGEMENT ===
        ("Flood water entering houses after heavy rain", "Disaster Management"),
        ("Building collapsed trapping people inside", "Disaster Management"),
        ("Landslide blocked the mountain road", "Disaster Management"),
        ("Earthquake cracks seen on the bridge", "Disaster Management"),
        ("River level rising dangerously", "Disaster Management"),
        ("Cyclone relief shelter needed", "Disaster Management"),
        ("Cloudburst washed away the shops", "Disaster Management"),
    ]
    return pd.DataFrame(data, columns=["text", "category"])

def train_and_save(custom_df=None):
    """
    Main Logic: Loads base data, optionally adds custom data (feedback), 
    trains the model, and saves it.
    """
    print("🔄 Loading Base Dataset...")
    df_base = get_base_dataset()

    # If we have feedback data, combine it
    if custom_df is not None and not custom_df.empty:
        print(f"➕ Merging {len(custom_df)} new feedback samples...")
        df_final = pd.concat([df_base, custom_df], ignore_index=True)
    else:
        df_final = df_base

    # Create Pipeline
    model = make_pipeline(
        TfidfVectorizer(ngram_range=(1, 2)), 
        LogisticRegression(C=10.0, max_iter=1000) 
    )

    # Train
    print(f"🧠 Training on {len(df_final)} total examples...")
    model.fit(df_final["text"], df_final["category"])
    
    # Save
    joblib.dump(model, "complaint_model.pkl")
    print("✅ Model Trained & Saved to 'complaint_model.pkl'")
    return model

# If run directly (python train_model.py), just train on base data
if __name__ == "__main__":
    train_and_save()