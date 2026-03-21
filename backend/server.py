"""FastAPI server for CropGuard — Phase 2 with real CV pipeline."""

import logging
import os
import time
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from care_engine import build_care_plan, get_nutrient_plan, get_soil_recommendations, get_watering_schedule
from models import (
    CarePlan,
    DiseaseResult,
    HealthResponse,
    NutrientRecommendation,
    NutrientsResult,
    PestResult,
    ScanResponse,
    ScanSummary,
    SoilAdvice,
    WateringAdvice,
)
from pipeline import build_default_diagnosis, run_diagnosis, run_segmentation

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CropGuard API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "/tmp/cropguard"
MASK_DIR = "/tmp/cropguard/masks"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(MASK_DIR, exist_ok=True)

# In-memory scan history (SQLite later)
scan_history: dict[str, dict] = {}


def diagnosis_to_scan_response(scan_id: str, diagnosis: dict) -> ScanResponse:
    """Convert a raw diagnosis dict into a typed ScanResponse."""
    disease_raw = diagnosis.get("disease", {})
    nutrients_raw = diagnosis.get("nutrients", {})
    watering_raw = diagnosis.get("watering", {})
    pests_raw = diagnosis.get("pests", {})
    soil_raw = diagnosis.get("soil", {})
    crop_type = diagnosis.get("crop_type", "Unknown")

    # Enrich with care_engine if Gemini data is sparse
    care_plan_raw = build_care_plan(diagnosis)

    # Fallback enrichment from static knowledge base
    if not nutrients_raw.get("recommendations"):
        deficiencies = nutrients_raw.get("deficiencies", [])
        nutrients_raw["recommendations"] = get_nutrient_plan(deficiencies)

    if not watering_raw.get("schedule"):
        ws = get_watering_schedule(crop_type)
        watering_raw["schedule"] = ws["schedule"]
        watering_raw["amount_ml_per_plant"] = ws["amount_ml"]

    if not soil_raw.get("recommended_ph"):
        sr = get_soil_recommendations(crop_type)
        soil_raw = sr

    return ScanResponse(
        scan_id=scan_id,
        crop_type=crop_type,
        disease=DiseaseResult(
            name=disease_raw.get("name", "Unknown"),
            confidence=float(disease_raw.get("confidence", 0.0)),
            severity=disease_raw.get("severity", "Mild"),
            affected_percent=float(disease_raw.get("affected_percent", 0.0)),
            description=disease_raw.get("description", "No description available"),
        ),
        mask_url=f"/masks/{scan_id}.png",
        nutrients=NutrientsResult(
            deficiencies=nutrients_raw.get("deficiencies", []),
            recommendations=[
                NutrientRecommendation(**rec)
                for rec in nutrients_raw.get("recommendations", [])
            ],
        ),
        watering=WateringAdvice(
            current_status=watering_raw.get("current_status", "Unknown"),
            schedule=watering_raw.get("schedule", "Water every 3-4 days"),
            amount_ml_per_plant=int(watering_raw.get("amount_ml_per_plant", 400)),
            warning=watering_raw.get("warning"),
        ),
        pests=PestResult(
            detected=pests_raw.get("detected", False),
            type=pests_raw.get("type"),
            severity=pests_raw.get("severity"),
            treatment=pests_raw.get("treatment"),
        ),
        soil=SoilAdvice(
            recommended_ph=soil_raw.get("recommended_ph", "6.0-7.0"),
            amendments=soil_raw.get("amendments", []),
            drainage=soil_raw.get("drainage", "Ensure adequate drainage"),
        ),
        care_plan=CarePlan(**care_plan_raw),
        recovery_outlook=diagnosis.get("recovery_outlook", "Monitor and reassess in 7 days"),
    )


@app.post("/analyze", response_model=ScanResponse)
async def analyze(image: UploadFile = File(...)):
    scan_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()
    total_start = time.time()

    # 1. Save uploaded image
    image_path = os.path.join(UPLOAD_DIR, f"{scan_id}.jpg")
    contents = await image.read()
    with open(image_path, "wb") as f:
        f.write(contents)

    # 2. Run segmentation
    seg_start = time.time()
    mask_path = run_segmentation(image_path, scan_id, MASK_DIR)
    seg_time = time.time() - seg_start

    # 3. Run Gemini Vision diagnosis
    diag_start = time.time()
    diagnosis = run_diagnosis(image_path, mask_path)
    diag_time = time.time() - diag_start

    # 4. Fall back to defaults if Gemini returned nothing useful
    if not diagnosis or not diagnosis.get("disease"):
        diagnosis = build_default_diagnosis()

    # 5. Build typed response with care_engine enrichment
    result = diagnosis_to_scan_response(scan_id, diagnosis)

    total_time = time.time() - total_start
    logger.info(
        f"[SCAN {scan_id}] received → segmentation: {seg_time:.1f}s → "
        f"diagnosis: {diag_time:.1f}s → total: {total_time:.1f}s"
    )

    # 6. Store in history
    scan_history[scan_id] = {
        "result": result.model_dump(),
        "timestamp": timestamp,
        "image_path": image_path,
    }

    return result


@app.get("/masks/{scan_id}.png")
async def get_mask(scan_id: str):
    mask_path = os.path.join(MASK_DIR, f"{scan_id}.png")
    if os.path.exists(mask_path):
        return FileResponse(mask_path, media_type="image/png")
    return JSONResponse(status_code=404, content={"error": "Mask not found"})


@app.get("/history", response_model=list[ScanSummary])
async def get_history():
    summaries = []
    items = list(scan_history.items())[-20:]
    for scan_id, data in items:
        result = data["result"]
        summaries.append(ScanSummary(
            scan_id=scan_id,
            timestamp=data["timestamp"],
            crop_type=result["crop_type"],
            disease_name=result["disease"]["name"],
            severity=result["disease"]["severity"],
            thumbnail_url=f"/masks/{scan_id}.png",
        ))
    return summaries


@app.get("/history/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: str):
    if scan_id not in scan_history:
        return JSONResponse(status_code=404, content={"error": "Scan not found"})
    return ScanResponse(**scan_history[scan_id]["result"])


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        plugins=["sam3_images", "gemini-vision"],
    )
