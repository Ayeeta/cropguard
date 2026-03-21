"""Static knowledge base for crop care recommendations."""

WATERING_SCHEDULES = {
    "Tomato": {"schedule": "Water deeply every 2-3 days", "amount_ml": 500},
    "Wheat": {"schedule": "Water every 5-7 days during dry spells", "amount_ml": 300},
    "Maize": {"schedule": "Water deeply every 3-4 days", "amount_ml": 600},
    "Potato": {"schedule": "Water every 2-3 days, keep soil consistently moist", "amount_ml": 450},
    "Rice": {"schedule": "Maintain 2-5cm standing water during vegetative stage", "amount_ml": 1000},
    "Pepper": {"schedule": "Water every 2-3 days, avoid waterlogging", "amount_ml": 400},
    "Cassava": {"schedule": "Water weekly once established, drought tolerant", "amount_ml": 350},
}

NUTRIENT_TREATMENTS = {
    "Nitrogen": {
        "symptom": "Yellowing of lower/older leaves, stunted growth",
        "treatment": "Apply balanced NPK fertilizer (10-10-10) at 200g per plant",
        "frequency": "Every 2 weeks during growing season",
        "organic_option": "Fish emulsion or composted manure side-dressed around base",
    },
    "Phosphorus": {
        "symptom": "Purple or dark tint on leaves, poor root development",
        "treatment": "Apply superphosphate (0-46-0) at 100g per plant",
        "frequency": "Once at planting, again at flowering",
        "organic_option": "Bone meal worked into top 5cm of soil",
    },
    "Potassium": {
        "symptom": "Brown scorching on leaf edges, weak stems",
        "treatment": "Apply potassium sulfate (0-0-50) at 150g per plant",
        "frequency": "Every 3 weeks during fruiting",
        "organic_option": "Wood ash or kelp meal top-dressed around base",
    },
    "Calcium": {
        "symptom": "Blossom end rot, distorted new growth",
        "treatment": "Apply calcium nitrate foliar spray (5g per liter)",
        "frequency": "Weekly spray during fruiting stage",
        "organic_option": "Crushed eggshells or gypsum worked into soil",
    },
    "Magnesium": {
        "symptom": "Interveinal chlorosis on older leaves",
        "treatment": "Apply Epsom salt foliar spray (20g per liter)",
        "frequency": "Bi-weekly foliar application",
        "organic_option": "Dolomitic lime if pH also needs raising",
    },
    "Iron": {
        "symptom": "Interveinal chlorosis on young leaves, green veins with yellow tissue",
        "treatment": "Apply chelated iron (Fe-EDDHA) at label rate",
        "frequency": "Monthly during active growth",
        "organic_option": "Compost tea with added sulfur to lower pH",
    },
}

PEST_TREATMENTS = {
    "Aphids": {
        "treatment": [
            "Spray neem oil solution (5ml per liter) on affected areas",
            "Repeat every 5 days for 3 applications",
            "Introduce ladybugs as biological control",
            "Remove heavily infested leaves by hand",
        ],
        "severity": "Mild to Moderate",
    },
    "Whiteflies": {
        "treatment": [
            "Install yellow sticky traps around plants",
            "Spray insecticidal soap on leaf undersides",
            "Repeat every 3 days until population drops",
            "Encourage natural predators (lacewings, parasitic wasps)",
        ],
        "severity": "Moderate",
    },
    "Spider Mites": {
        "treatment": [
            "Spray plants with strong water jet to dislodge mites",
            "Apply miticide or neem oil every 5 days",
            "Increase humidity around plants",
            "Remove and destroy heavily infested leaves",
        ],
        "severity": "Moderate to Severe",
    },
    "Caterpillars": {
        "treatment": [
            "Hand-pick visible caterpillars",
            "Apply Bacillus thuringiensis (Bt) spray",
            "Repeat Bt after rain or every 7 days",
            "Use row covers to prevent moth egg-laying",
        ],
        "severity": "Moderate",
    },
    "Fungal Gnats": {
        "treatment": [
            "Allow soil surface to dry between waterings",
            "Apply mosquito dunks (Bti) to soil",
            "Use yellow sticky traps near soil level",
            "Top-dress with sand to prevent egg-laying",
        ],
        "severity": "Mild",
    },
}

SOIL_RECOMMENDATIONS = {
    "Tomato": {
        "ph_range": "6.0–6.8",
        "amendments": [
            "Add agricultural lime if pH below 6.0",
            "Mix in compost at 30% volume for organic matter",
            "Add perlite for drainage in heavy clay soils",
        ],
        "drainage": "Ensure raised beds or well-draining soil",
    },
    "Wheat": {
        "ph_range": "6.0–7.0",
        "amendments": [
            "Apply gypsum to break up clay soils",
            "Add sulfur if pH above 7.5",
        ],
        "drainage": "Good natural drainage required, avoid waterlogged fields",
    },
    "Maize": {
        "ph_range": "5.8–7.0",
        "amendments": [
            "Incorporate well-rotted manure before planting",
            "Add lime if pH below 5.8",
        ],
        "drainage": "Moderate drainage, tolerates heavier soils",
    },
    "Potato": {
        "ph_range": "5.0–6.0",
        "amendments": [
            "Add sulfur to lower pH if above 6.5 (reduces scab risk)",
            "Incorporate compost for moisture retention",
        ],
        "drainage": "Well-draining loose soil essential, hill up as plants grow",
    },
    "Rice": {
        "ph_range": "5.5–6.5",
        "amendments": [
            "Apply zinc sulfate at 25kg per hectare if deficient",
            "Incorporate rice straw from previous season",
        ],
        "drainage": "Controlled flooding — bund fields to retain water",
    },
    "Pepper": {
        "ph_range": "6.0–6.8",
        "amendments": [
            "Add compost for moisture retention",
            "Apply lime if pH below 6.0",
        ],
        "drainage": "Well-draining soil, avoid standing water",
    },
    "Cassava": {
        "ph_range": "5.5–6.5",
        "amendments": [
            "Minimal amendments needed — cassava tolerates poor soil",
            "Light compost application improves yields on sandy soil",
        ],
        "drainage": "Must have good drainage, does not tolerate waterlogging",
    },
}


def get_watering_schedule(crop_type: str) -> dict:
    default = {"schedule": "Water every 3-4 days, adjust based on soil moisture", "amount_ml": 400}
    return WATERING_SCHEDULES.get(crop_type, default)


def get_nutrient_plan(deficiencies: list[str]) -> list[dict]:
    recommendations = []
    for nutrient in deficiencies:
        info = NUTRIENT_TREATMENTS.get(nutrient)
        if info:
            recommendations.append({"nutrient": nutrient, **info})
        else:
            recommendations.append({
                "nutrient": nutrient,
                "symptom": f"Visual signs of {nutrient} deficiency",
                "treatment": f"Apply fertilizer containing {nutrient} at recommended rate",
                "frequency": "Every 2 weeks",
                "organic_option": "Consult local agricultural extension office",
            })
    return recommendations


def get_pest_treatment(pest_type: str) -> dict:
    default = {
        "treatment": [
            "Identify pest species accurately before treatment",
            "Try manual removal first",
            "Apply appropriate organic pesticide",
            "Monitor and repeat treatment as needed",
        ],
        "severity": "Unknown",
    }
    return PEST_TREATMENTS.get(pest_type, default)


def get_soil_recommendations(crop_type: str) -> dict:
    default = {
        "ph_range": "6.0–7.0",
        "amendments": ["Add compost to improve soil structure", "Test soil pH and adjust accordingly"],
        "drainage": "Ensure adequate drainage for crop type",
    }
    return SOIL_RECOMMENDATIONS.get(crop_type, default)


def build_care_plan(diagnosis: dict) -> dict:
    """Build a care plan from a diagnosis dict returned by Gemini Vision."""
    immediate = []
    this_week = []
    ongoing = []

    # Disease actions
    disease = diagnosis.get("disease", {})
    severity = disease.get("severity", "Mild")
    disease_name = disease.get("name", "Unknown")

    if severity in ("Severe", "Critical"):
        immediate.append(f"Urgently treat {disease_name} — apply appropriate fungicide within 24 hours")
        immediate.append("Remove and destroy all heavily infected plant material")
    elif severity == "Moderate":
        immediate.append(f"Apply treatment for {disease_name} within 48 hours")
        immediate.append("Remove visibly infected leaves to slow spread")
    else:
        this_week.append(f"Monitor {disease_name} — apply preventive treatment if spreading")

    # Nutrient actions
    deficiencies = diagnosis.get("nutrients", {}).get("deficiencies", [])
    if deficiencies:
        this_week.append(f"Address nutrient deficiencies: {', '.join(deficiencies)}")
        ongoing.append("Follow fertilization schedule for identified deficiencies")

    # Pest actions
    pests = diagnosis.get("pests", {})
    if pests.get("detected"):
        pest_type = pests.get("type", "pests")
        this_week.append(f"Begin {pest_type} treatment plan")
        ongoing.append(f"Monitor for {pest_type} reinfestation weekly")

    # Watering
    watering = diagnosis.get("watering", {})
    if "Underwatered" in watering.get("current_status", ""):
        immediate.append("Increase watering frequency immediately")
    elif "Overwatered" in watering.get("current_status", ""):
        immediate.append("Reduce watering and improve drainage")

    # General ongoing
    ongoing.append("Inspect plants every 3 days for new symptoms")
    ongoing.append("Maintain consistent watering schedule")

    # Use Gemini's care plan if provided, as override
    gemini_plan = diagnosis.get("care_plan", {})
    if gemini_plan.get("immediate"):
        immediate = gemini_plan["immediate"]
    if gemini_plan.get("this_week"):
        this_week = gemini_plan["this_week"]
    if gemini_plan.get("ongoing"):
        ongoing = gemini_plan["ongoing"]

    return {
        "immediate": immediate or ["No immediate action required"],
        "this_week": this_week or ["Continue regular care routine"],
        "ongoing": ongoing or ["Monitor plant health weekly"],
    }
