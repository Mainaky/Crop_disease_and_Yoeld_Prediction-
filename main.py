import os
import io
import traceback
import joblib
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from crop_pipeline import CropDiseasePipeline

# Initialize FastAPI app
app = FastAPI(
    title="Crop Health & Yield Prediction API",
    description="Unified API for Rice & Wheat crop disease diagnosis, infection severity estimation, and crop yield forecasting.",
    version="2.0.0"
)

# CORS Middleware (Allows mobile apps, emulators, and web frontends)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Disease Classification Pipeline
RICE_DISEASES = [
    "Bacterial Leaf Blight",
    "Brown Spot",
    "Healthy Rice Leaf",
    "Leaf Blast",
    "Leaf scald",
    "Sheath Blight"
]

WHEAT_DISEASES = [
    "Aphid",
    "Black Rust",
    "Blast",
    "Brown Rust",
    "Common Root Rot",
    "Fusarium Head Blight",
    "Healthy",
    "Leaf Blight",
    "Mildew",
    "Mite",
    "Septoria",
    "Smut",
    "Stem fly",
    "Tan spot",
    "Yellow Rust"
]

print("[INFO] Initializing Disease Classification Pipeline...")
pipeline = CropDiseasePipeline(
    rice_model_path="model/rice_model.h5",
    wheat_model_path="model/wheat_model.h5",
    rice_labels=RICE_DISEASES,
    wheat_labels=WHEAT_DISEASES
)
print("[SUCCESS] Disease Pipeline ready")

# Load Crop Yield Prediction Model
yield_model = None
yield_model_path = "model/yield_model.pkl"
if os.path.exists(yield_model_path):
    try:
        yield_model = joblib.load(yield_model_path)
        print("[SUCCESS] Yield prediction model loaded from", yield_model_path)
    except Exception as e:
        print("[WARNING] Could not load yield model:", str(e))
else:
    print("[WARNING] Yield model file not found at", yield_model_path)


# Agricultural Advisory & Treatment Database
ADVISORY_DB = {
    "Bacterial Leaf Blight": {
        "treatment": "Spray Copper Oxychloride (2.5 g/L) or Streptocycline (100 ppm).",
        "prevention": "Ensure field drainage, avoid excessive nitrogen fertilization, and use disease-tolerant cultivars.",
        "severity_impact": "High (Can reduce yield by up to 20-50% if untreated)"
    },
    "Brown Spot": {
        "treatment": "Apply Mancozeb (2 g/L) or Carbendazim (1 g/L) at first symptom appearance.",
        "prevention": "Perform seed treatment with Thiram, balance soil NPK, and ensure adequate potassium.",
        "severity_impact": "Moderate to High"
    },
    "Leaf Blast": {
        "treatment": "Apply Tricyclazole 75 WP (0.6 g/L) or Isoprothiolane 40 EC (1.5 mL/L).",
        "prevention": "Avoid high doses of nitrogen, practice uniform field flooding, and avoid moisture stress.",
        "severity_impact": "Very High (Rapid spread during humid, overcast weather)"
    },
    "Leaf scald": {
        "treatment": "Spray Benomyl (1 g/L) or Propiconazole (1 mL/L).",
        "prevention": "Rotate crops and use certified clean seeds.",
        "severity_impact": "Moderate"
    },
    "Sheath Blight": {
        "treatment": "Foliar spray with Hexaconazole 5% EC (2 mL/L) or Validamycin 3L (2.5 mL/L).",
        "prevention": "Wider plant spacing to improve aeration, destroy infected straw residues.",
        "severity_impact": "High in dense, humid canopies"
    },
    "Healthy Rice Leaf": {
        "treatment": "No treatment required. Crop is in good condition.",
        "prevention": "Maintain regular scouting, optimal irrigation, and standard balanced nutrient supply.",
        "severity_impact": "None (Healthy crop)"
    },
    "Aphid": {
        "treatment": "Spray Imidacloprid 17.8 SL (0.3 mL/L) or Neem seed kernel extract (5%).",
        "prevention": "Encourage natural bio-control predators (ladybugs, lacewings).",
        "severity_impact": "Moderate"
    },
    "Black Rust": {
        "treatment": "Apply Propiconazole 25 EC (1 mL/L) or Tebuconazole (1 mL/L) immediately upon detection.",
        "prevention": "Eradicate alternate host bushes (Barberry), sow resistant early cultivars.",
        "severity_impact": "Severe"
    },
    "Blast": {
        "treatment": "Apply Azoxystrobin (1 mL/L) or Tricyclazole.",
        "prevention": "Use clean, treated certified seeds and avoid late sowing.",
        "severity_impact": "High"
    },
    "Brown Rust": {
        "treatment": "Foliar spray with Propiconazole (0.1%) or Mancozeb (0.2%).",
        "prevention": "Use rust-resistant wheat varieties.",
        "severity_impact": "Moderate to High"
    },
    "Common Root Rot": {
        "treatment": "Seed dressing with Carboxin + Thiram (2 g/kg seed).",
        "prevention": "Ensure good soil aeration, rotate with non-host crops.",
        "severity_impact": "Moderate"
    },
    "Fusarium Head Blight": {
        "treatment": "Foliar application of Triazole fungicides at early anthesis.",
        "prevention": "Avoid planting wheat right after maize/corn, till crop residues.",
        "severity_impact": "Severe (Causes grain shriveling and mycotoxin risk)"
    },
    "Healthy": {
        "treatment": "No treatment needed. Crop is in excellent condition.",
        "prevention": "Continue standard crop management and IPM monitoring.",
        "severity_impact": "None (Healthy crop)"
    },
    "Leaf Blight": {
        "treatment": "Apply Mancozeb (2.5 g/L) or Zineb (2 g/L).",
        "prevention": "Timely sowing and proper fertilizer balance.",
        "severity_impact": "Moderate"
    },
    "Mildew": {
        "treatment": "Spray wettable sulfur (2 g/L) or Triadimefon (1 g/L).",
        "prevention": "Avoid overcrowded plant density, maintain dry canopy conditions.",
        "severity_impact": "Moderate"
    },
    "Mite": {
        "treatment": "Spray Dicofol or wettable sulfur (2.5 g/L).",
        "prevention": "Keep field borders weed-free, avoid water deficit.",
        "severity_impact": "Low to Moderate"
    },
    "Septoria": {
        "treatment": "Spray Chlorothalonil or Propiconazole.",
        "prevention": "Crop rotation and clean residue disposal.",
        "severity_impact": "Moderate"
    },
    "Smut": {
        "treatment": "Seed treatment with Carboxin 75 WP (2.5 g/kg seed).",
        "prevention": "Use certified disease-free seed stocks.",
        "severity_impact": "High for infected heads"
    },
    "Stem fly": {
        "treatment": "Soil application of Phorate 10G or spray Chlorpyrifos.",
        "prevention": "Early sowing to escape peak pest incidence.",
        "severity_impact": "Moderate"
    },
    "Tan spot": {
        "treatment": "Apply Propiconazole at flag leaf emergence.",
        "prevention": "Bury crop residues, adopt 2-year crop rotation.",
        "severity_impact": "Moderate"
    },
    "Yellow Rust": {
        "treatment": "Spray Propiconazole 25 EC (0.1%) at first stripe detection.",
        "prevention": "Adopt resistant wheat genotypes, avoid excessive irrigation in cold weather.",
        "severity_impact": "High (Rapid spread in cool weather)"
    }
}


# Severity Calculation Function
def calculate_severity(image: Image.Image) -> float:
    img = image.resize((224, 224))
    img_array = np.array(img)

    # Convert to grayscale
    gray = np.mean(img_array, axis=2)

    # Threshold (detect dark/infected areas)
    infected_pixels = np.sum(gray < 100)
    total_pixels = gray.size

    severity = infected_pixels / total_pixels
    return round(float(severity), 4)


# Pydantic Schemas
class YieldFeaturesRequest(BaseModel):
    features: List[float]  # [crop_type, moisture, pH, temp, rain, humidity, N, P, K, severity]

class YieldDirectRequest(BaseModel):
    crop_type: int = 1         # 1: Rice, 2: Wheat, 3: Other
    soil_moisture: float = 30.0 # %
    soil_pH: float = 6.5
    temperature: float = 25.0  # C
    rainfall: float = 120.0    # mm
    humidity: float = 75.0     # %
    nitrogen: float = 80.0     # N
    phosphorus: float = 40.0   # P
    potassium: float = 40.0    # K
    severity: float = 0.0      # 0.0 - 1.0


def predict_yield_from_features(features: List[float]) -> float:
    if yield_model is None:
        # Fallback heuristic calculation if model file is unavailable
        base_yield = 4000.0
        crop_mult = 1.0 if features[0] == 1 else (0.9 if features[0] == 2 else 0.85)
        severity = features[9] if len(features) > 9 else 0.0
        loss = severity * 1500.0
        return max(1200.0, round((base_yield * crop_mult) - loss, 2))

    feat_array = np.array([features])
    pred = float(yield_model.predict(feat_array)[0])
    return round(pred, 2)


# ========================================================
# 🚀 API ENDPOINTS
# ========================================================

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "Crop Health & Yield Prediction API",
        "version": "2.0.0",
        "endpoints": {
            "disease_predict_compat": "POST /predict/",
            "disease_predict": "POST /predict/disease",
            "yield_predict": "POST /predict/yield",
            "full_predict": "POST /predict/full"
        }
    }


# 1. Backwards-compatible endpoint for existing code / index.html
@app.post("/predict/")
async def predict_disease_compat(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        result = pipeline.run_inference_image(image)
        severity = calculate_severity(image)
        result["severity"] = severity

        return result
    except Exception as e:
        print("[ERROR] /predict/:", str(e))
        traceback.print_exc()
        return {"error": str(e)}


# 2. Detailed Disease Endpoint
@app.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...), crop: Optional[str] = None):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        result = pipeline.run_inference_image(image, preferred_crop=crop)
        severity = calculate_severity(image)

        disease = result.get("disease", "Healthy")
        is_healthy = result.get("is_healthy", False)
        adjusted_severity = 0.0 if is_healthy else severity

        advisory = ADVISORY_DB.get(disease, {
            "treatment": "Consult local agricultural extension officer.",
            "prevention": "Maintain clean field sanitation and balanced nutrients.",
            "severity_impact": "Unknown"
        })

        return {
            "status": "Success",
            "crop": result["crop"],
            "disease": result["disease"],
            "disease_confidence": result["disease_confidence"],
            "confidence_score": result["confidence_score"],
            "is_healthy": is_healthy,
            "raw_severity": severity,
            "severity": adjusted_severity,
            "severity_percentage": f"{adjusted_severity * 100:.1f}%",
            "advisory": advisory
        }
    except Exception as e:
        print("[ERROR] /predict/disease:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# 3. Yield Prediction Endpoint (supports both features list and json payload)
@app.post("/predict/yield")
async def predict_yield(payload: YieldFeaturesRequest):
    try:
        predicted = predict_yield_from_features(payload.features)
        return {
            "status": "Success",
            "predicted_yield": predicted,
            "predicted_yield_kg_per_ha": predicted,
            "predicted_yield_tons_per_ha": round(predicted / 1000.0, 2),
            "unit": "kg/hectare"
        }
    except Exception as e:
        print("[ERROR] /predict/yield:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# 4. Unified Full Prediction Endpoint (Used by Mobile App)
@app.post("/predict/full")
async def predict_full(
    file: UploadFile = File(...),
    crop_type: int = Form(1),
    soil_moisture: float = Form(30.0),
    soil_pH: float = Form(6.5),
    temperature: float = Form(26.0),
    rainfall: float = Form(120.0),
    humidity: float = Form(75.0),
    nitrogen: float = Form(80.0),
    phosphorus: float = Form(40.0),
    potassium: float = Form(40.0)
):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Map crop_type number to crop name hint
        preferred_crop = "Rice" if crop_type == 1 else ("Wheat" if crop_type == 2 else None)

        # 1. Disease Inference
        disease_res = pipeline.run_inference_image(image, preferred_crop=preferred_crop)
        raw_severity = calculate_severity(image)

        disease = disease_res.get("disease", "Healthy")
        is_healthy = disease_res.get("is_healthy", False)

        # 2. Healthy adjustment
        if is_healthy:
            severity = 0.0
        else:
            severity = raw_severity

        # 3. Yield Inference
        # Features: [crop_type, soil_moisture_%, soil_pH, temperature_C, rainfall_mm, humidity_%, N, P, K, crop_health]
        # In processed_data.csv: crop_health is 0 (Healthy), 1 (Moderate), 2 (Poor)
        if is_healthy:
            health_code = 0
        elif severity < 0.25:
            health_code = 1
        else:
            health_code = 2

        features = [
            float(crop_type),
            float(soil_moisture),
            float(soil_pH),
            float(temperature),
            float(rainfall),
            float(humidity),
            float(nitrogen),
            float(phosphorus),
            float(potassium),
            float(health_code)
        ]

        predicted_yield = predict_yield_from_features(features)

        # Boost yield by 15% if healthy
        if is_healthy:
            final_yield = round(predicted_yield * 1.15, 2)
        else:
            final_yield = predicted_yield

        # 4. Advisory
        advisory = ADVISORY_DB.get(disease, {
            "treatment": "Maintain balanced field nutrition and consult your local agronomist.",
            "prevention": "Ensure weed control, clean farm equipment, and monitor weather alerts.",
            "severity_impact": "Variable"
        })

        return {
            "status": "Success",
            "crop": disease_res["crop"],
            "disease": disease_res["disease"],
            "disease_confidence": disease_res["disease_confidence"],
            "confidence_score": disease_res["confidence_score"],
            "is_healthy": is_healthy,
            "raw_severity": raw_severity,
            "severity": severity,
            "severity_percentage": f"{severity * 100:.1f}%",
            "predicted_yield_kg_per_ha": final_yield,
            "predicted_yield_tons_per_ha": round(final_yield / 1000.0, 2),
            "healthy_yield_boost_applied": is_healthy,
            "advisory": advisory
        }

    except Exception as e:
        print("[ERROR] /predict/full:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)