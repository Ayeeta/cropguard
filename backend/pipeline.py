"""CV Pipeline — SAM3 segmentation + Gemini Vision diagnosis."""

import base64
import json
import logging
import os
import time

import numpy as np
from PIL import Image

from google import genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Configure Gemini client
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

GEMINI_PROMPT = """You are an expert agronomist and plant pathologist with 20 years of field
experience. Analyze this crop image and provide a complete plant health
assessment. The segmentation mask highlights the area of concern.

Return ONLY valid JSON — no markdown, no backticks, no explanation text.
Use exactly these keys:

{
  "crop_type": "string — identified plant species",
  "disease": {
    "name": "string",
    "confidence": 0.0,
    "severity": "Mild | Moderate | Severe | Critical",
    "affected_percent": 0.0,
    "description": "string",
    "spread_risk": "Low | Medium | High"
  },
  "nutrients": {
    "deficiencies": ["string"],
    "recommendations": [{
      "nutrient": "string",
      "symptom": "string",
      "treatment": "string",
      "frequency": "string",
      "organic_option": "string"
    }]
  },
  "watering": {
    "current_status": "string",
    "schedule": "string",
    "amount_ml_per_plant": 0,
    "warning": "string or null"
  },
  "pests": {
    "detected": true,
    "type": "string or null",
    "severity": "string or null",
    "treatment": "string or null"
  },
  "soil": {
    "recommended_ph": "string",
    "amendments": ["string"],
    "drainage": "string"
  },
  "care_plan": {
    "immediate": ["string"],
    "this_week": ["string"],
    "ongoing": ["string"]
  },
  "recovery_outlook": "string"
}

Be specific, actionable, and farmer-friendly. Assume the farmer has access
to both local markets and agricultural suppliers."""


def run_segmentation(image_path: str, scan_id: str, mask_dir: str) -> str | None:
    """Run SAM3 segmentation on an image.

    Attempts to use FiftyOne zoo model. Falls back to a simple
    threshold-based mask if SAM3 is unavailable (e.g. not installed,
    no GPU, or model not accessible).

    Returns: path to saved mask PNG, or None on failure.
    """
    mask_path = os.path.join(mask_dir, f"{scan_id}.png")
    start = time.time()

    try:
        import fiftyone.zoo as foz

        model = foz.load_zoo_model("facebook/sam3")
        model.operation = "automatic_segmentation"
        model.auto_kwargs = {
            "points_per_side": 32,
            "quality_threshold": 0.8,
            "iou_threshold": 0.85,
        }

        # Predict on the image
        detections = model.predict(image_path)

        if detections and detections.detections:
            # Pick the largest mask by area
            best = max(detections.detections, key=lambda d: d.mask.sum())
            mask_array = (best.mask * 255).astype(np.uint8)
            mask_img = Image.fromarray(mask_array)
            mask_img.save(mask_path)
            logger.info(f"[SCAN {scan_id}] SAM3 segmentation: {time.time() - start:.1f}s")
            return mask_path
    except Exception as e:
        logger.warning(f"[SCAN {scan_id}] SAM3 unavailable ({e}), using fallback mask")

    # Fallback: generate a simple green-channel threshold mask
    try:
        img = Image.open(image_path).convert("RGB")
        img_array = np.array(img)

        # Simple heuristic: detect non-green / brown / yellow regions as "affected"
        r, g, b = img_array[:, :, 0], img_array[:, :, 1], img_array[:, :, 2]
        # Areas where green channel isn't dominant suggest disease/damage
        mask = ((r.astype(int) - g.astype(int)) > 20) | ((b.astype(int) - g.astype(int)) > 20)
        mask = (mask * 255).astype(np.uint8)

        mask_img = Image.fromarray(mask)
        mask_img.save(mask_path)
        logger.info(f"[SCAN {scan_id}] Fallback mask: {time.time() - start:.1f}s")
        return mask_path
    except Exception as e:
        logger.error(f"[SCAN {scan_id}] Mask generation failed: {e}")
        return None


def run_diagnosis(image_path: str, mask_path: str | None) -> dict:
    """Call Gemini Vision to analyze the crop image.

    Returns parsed diagnosis dict. On failure, returns empty dict
    so care_engine.py defaults can take over.
    """
    start = time.time()

    try:
        # Build content parts
        parts = [GEMINI_PROMPT]

        # Add original image
        with open(image_path, "rb") as f:
            image_data = base64.standard_b64encode(f.read()).decode("utf-8")
        parts.append(genai.types.Part.from_bytes(
            data=base64.standard_b64decode(image_data),
            mime_type="image/jpeg",
        ))

        # Add mask if available
        if mask_path and os.path.exists(mask_path):
            with open(mask_path, "rb") as f:
                mask_bytes = f.read()
            parts.append(genai.types.Part.from_bytes(
                data=mask_bytes,
                mime_type="image/png",
            ))

        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=parts,
        )
        raw_text = response.text.strip()

        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1] if "\n" in raw_text else raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        diagnosis = json.loads(raw_text)
        logger.info(f"Gemini diagnosis: {time.time() - start:.1f}s")
        return diagnosis

    except json.JSONDecodeError as e:
        logger.warning(f"Gemini returned invalid JSON: {e}")
        logger.debug(f"Raw response: {raw_text}")
        return {}
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return {}


def build_default_diagnosis(crop_type: str = "Unknown") -> dict:
    """Return a safe default diagnosis when Gemini fails."""
    return {
        "crop_type": crop_type,
        "disease": {
            "name": "Unable to determine",
            "confidence": 0.0,
            "severity": "Mild",
            "affected_percent": 0.0,
            "description": "Analysis could not complete. Please try again with a clearer image.",
        },
        "nutrients": {"deficiencies": [], "recommendations": []},
        "watering": {
            "current_status": "Unknown",
            "schedule": "Water every 3-4 days as a general guideline",
            "amount_ml_per_plant": 400,
            "warning": None,
        },
        "pests": {"detected": False, "type": None, "severity": None, "treatment": None},
        "soil": {
            "recommended_ph": "6.0-7.0",
            "amendments": ["Test soil pH and adjust accordingly"],
            "drainage": "Ensure adequate drainage",
        },
        "care_plan": {
            "immediate": ["Retake photo in good lighting for accurate diagnosis"],
            "this_week": ["Continue regular care routine"],
            "ongoing": ["Monitor plant health weekly"],
        },
        "recovery_outlook": "Insufficient data — retake image for a proper assessment",
    }
