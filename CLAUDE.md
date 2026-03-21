# 🌱 CropGuard — AI-Powered Crop Care & Disease Detection

## What This App Is

CropGuard is a mobile-first platform that gives farmers and gardeners a
full-spectrum plant health companion. It goes beyond simple disease detection —
it is the complete TLC (Tender Loving Care) system for crops. A farmer points
their phone at a plant and gets back not just a diagnosis, but a full care
plan: what disease is present, how severe it is, what nutrients the plant
needs, how to fix the soil, when to water, what pests to watch for, and how
to nurse the plant back to full health.

The two "wow moments" in the demo:
1. SAM3 draws a precise segmentation mask around the diseased tissue in real time
2. Gemini Vision reads that mask and returns a complete plant care prescription

---

## Core Feature Set

### 1. Disease Detection
- Camera capture → SAM3 segmentation → pixel-level mask of affected tissue
- Gemini Vision identifies the disease (e.g. late blight, powdery mildew, rust)
- Severity score: Mild / Moderate / Severe / Critical
- Affected tissue percentage calculated from mask area
- Historical tracking: same plant over time shows disease progression

### 2. Nutrient Analysis & Recommendations
- Identify nutrient deficiencies from visual symptoms (yellowing = nitrogen,
  purple tint = phosphorus, brown edges = potassium, etc.)
- Gemini Vision maps leaf color patterns to deficiency profiles
- Specific fertilizer recommendations: type, quantity, application frequency
- Organic vs synthetic options presented side by side
- Soil amendment suggestions (compost, lime, sulfur, etc.)

### 3. Watering Care
- Crop-specific watering schedules based on identified plant type
- Soil moisture guidance (visual cues: soil color, leaf droop indicators)
- Overwatering vs underwatering diagnosis from leaf appearance
- Weather-aware adjustments (sunny, cloudy, rainy) if location is shared
- Root rot risk assessment

### 4. Pest Management
- Visual identification of pest damage patterns from images
- Pest-specific treatment plans: biological, chemical, mechanical
- Companion planting suggestions to repel common pests
- Infestation severity rating and urgency flag

### 5. Soil Health
- pH recommendations based on crop type and observed symptoms
- Drainage and aeration guidance
- Organic matter improvement plans
- Cover crop suggestions for off-season

### 6. Growth Tracking (Over Time)
- Each analyzed image stored in FiftyOne dataset with timestamp
- Side-by-side comparison of plant health across sessions
- Recovery tracking: did the treatment work?
- Growth milestones by crop type (seedling → vegetative → flowering → harvest)

### 7. Harvest Readiness
- Visual maturity indicators by crop type
- Optimal harvest window recommendations
- Post-harvest care and storage tips

### 8. Care Calendar
- Weekly care plan generated per crop
- Push notification reminders (watering, fertilizing, pest checks)
- Seasonal planting guides

---

## Tech Stack

### Mobile (Frontend)
- **Framework**: React Native with Expo
- **Camera**: expo-camera for live capture
- **Image Picker**: expo-image-picker for gallery uploads
- **Navigation**: Expo Router (file-based)
- **State**: Zustand
- **UI Components**: Custom components — NO generic UI kits
- **Notifications**: expo-notifications

### Backend
- **API Server**: Python + FastAPI
- **CV Pipeline**: FiftyOne (dataset management + plugin orchestration)
- **Segmentation**: SAM3 plugin (`@harpreetsahota/sam3_images`)
  - Install: `fiftyone plugins download https://github.com/harpreetsahota204/sam3_images`
  - NOT a pip package — uses FiftyOne plugin CLI
- **Vision AI**: Gemini Vision plugin (`@AdonaiVera/gemini-vision-plugin`)
  - Install: `fiftyone plugins download https://github.com/AdonaiVera/gemini-vision-plugin`
  - NOT a pip package — uses FiftyOne plugin CLI
- **Image Storage**: Local filesystem (hackathon) → S3 (production)
- **Database**: SQLite via SQLModel (hackathon) → PostgreSQL (production)

### Infrastructure
- **Local Dev Tunnel**: ngrok (mobile ↔ local backend)
- **FiftyOne App**: Runs on port 5151 (judge demo view)
- **FastAPI Server**: Runs on port 8000

---

## ✅ TASK LIST — Complete Build Checklist

Work through these in order. Each task is a prompt you can hand directly
to Claude Code. Tasks marked [BACKEND] are Elijah's. Tasks marked [MOBILE]
are the collaborator's. Tasks marked [SHARED] require both.

---

### PHASE 0 — Environment Setup

- [ ] **[BACKEND] TASK-001**: Install Python dependencies
  ```
  pip install fiftyone fastapi uvicorn python-multipart sqlmodel
  python-dotenv pillow numpy requests
  ```

- [ ] **[BACKEND] TASK-002**: Install FiftyOne plugins (NOT pip — use FiftyOne CLI)
  ```
  fiftyone plugins download https://github.com/harpreetsahota204/sam3_images
  fiftyone plugins download https://github.com/AdonaiVera/gemini-vision-plugin
  fiftyone operators list   ← verify both appear
  ```

- [ ] **[BACKEND] TASK-003**: Create `.env` file in `/backend`
  ```
  GEMINI_API_KEY=your_key_here
  FIFTYONE_DATABASE_URI=mongodb://localhost:27017
  BACKEND_PORT=8000
  DEMO_MODE=true
  ```

- [ ] **[MOBILE] TASK-004**: Initialize Expo project in `/mobile`
  ```
  npx create-expo-app mobile --template blank-typescript
  cd mobile
  npx expo install expo-camera expo-image-picker expo-router
  expo-notifications zustand
  ```

- [ ] **[SHARED] TASK-005**: Create `mobile/constants/api.ts` with backend URL config
  ```typescript
  export const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
  ```

- [ ] **[BACKEND] TASK-006**: Download 5 sample plant disease images into
  `/data/sample_images/` from PlantVillage dataset. Must cover:
  tomato late blight, wheat leaf rust, powdery mildew, healthy leaf,
  nitrogen deficiency (yellowing). These are used for DEMO_MODE caching.

---

### PHASE 1 — Backend Foundation

- [ ] **[BACKEND] TASK-007**: Create `backend/models.py`
  Define all Pydantic response schemas matching the API contract in this
  file exactly. Include: ScanResponse, DiseaseResult, NutrientRecommendation,
  WateringAdvice, PestResult, SoilAdvice, CarePlan. Every field typed.

- [ ] **[BACKEND] TASK-008**: Create `backend/dataset.py`
  Initialize and manage the FiftyOne "cropguard" dataset. Functions:
  `get_or_create_dataset()`, `add_scan_sample(image_path, scan_id)`,
  `attach_mask_to_sample(scan_id, mask_path)`,
  `attach_diagnosis_to_sample(scan_id, diagnosis_dict)`.

- [ ] **[BACKEND] TASK-009**: Create `backend/server.py` with mock responses
  FastAPI app with:
  - POST /analyze → accepts image, saves to /tmp/cropguard/, returns mock
    ScanResponse JSON
  - GET /masks/{scan_id}.png → serves mask image files
  - GET /history → returns last 20 scans from SQLite
  - GET /history/{scan_id} → returns full result for one scan
  - GET /health → returns plugin status
  - CORS middleware allowing all origins
  Test: `curl -X POST http://localhost:8000/analyze -F "image=@test.jpg"`

- [ ] **[BACKEND] TASK-010**: Create `backend/care_engine.py`
  Static knowledge base for crop care. Functions:
  `get_watering_schedule(crop_type)` → returns schedule string + ml amount,
  `get_nutrient_plan(deficiencies: list)` → returns treatment list,
  `get_pest_treatment(pest_type)` → returns treatment steps,
  `get_soil_recommendations(crop_type)` → returns pH range + amendments,
  `build_care_plan(diagnosis: dict)` → returns immediate/this_week/ongoing.
  Covers at minimum: Tomato, Wheat, Maize, Potato, Rice, Pepper, Cassava.

---

### PHASE 2 — CV Pipeline Integration

- [ ] **[BACKEND] TASK-011**: Wire SAM3 into `backend/pipeline.py`
  Function: `run_segmentation(sample, prompt_type="auto")`.
  Calls the SAM3 FiftyOne operator on the sample. Returns mask as numpy
  array. Saves mask PNG to /tmp/cropguard/masks/{scan_id}.png. Test on one
  of the /data/sample_images/ files and confirm mask renders correctly.

- [ ] **[BACKEND] TASK-012**: Wire Gemini Vision into `backend/pipeline.py`
  Function: `run_diagnosis(image_path, mask_path)`.
  Calls Gemini Vision operator using the prompt template in this file.
  Parses JSON response into dict. On parse failure, log the raw response
  and return care_engine.py defaults so the app never crashes mid-demo.

- [ ] **[BACKEND] TASK-013**: Connect full pipeline in `server.py`
  Replace mock /analyze response with real pipeline:
  1. Save uploaded image → /tmp/cropguard/{scan_id}.jpg
  2. add_scan_sample() → FiftyOne dataset
  3. run_segmentation() → mask PNG
  4. attach_mask_to_sample()
  5. run_diagnosis() → parsed dict
  6. build_care_plan() via care_engine
  7. attach_diagnosis_to_sample()
  8. Persist to SQLite
  9. Return full ScanResponse

- [ ] **[BACKEND] TASK-014**: Add DEMO_MODE fast path in `server.py`
  When DEMO_MODE=true, match uploaded filename against /data/demo_cache/.
  If match found, return cached JSON instantly. If no match, run real
  pipeline. Pre-populate cache by running pipeline on all 5 sample images
  during server startup.

- [ ] **[BACKEND] TASK-015**: Add request timing logs
  Every POST /analyze should print to console:
  `[SCAN {scan_id}] received → segmentation: {Xs} → diagnosis: {Xs} → total: {Xs}`
  Visible to judges watching the terminal during demo.

---

### PHASE 3 — Mobile App Screens

- [ ] **[MOBILE] TASK-016**: Build Camera Screen (`app/index.tsx`)
  Full-bleed expo-camera viewfinder. Large circular capture button at bottom
  center. On capture: save photo locally → POST to BACKEND_URL/analyze →
  show "CropGuard is analyzing your crop..." spinner → navigate to
  result.tsx passing scan_id. Also add small "Upload Photo" button using
  expo-image-picker as fallback.

- [ ] **[MOBILE] TASK-017**: Build Results Screen (`app/result.tsx`)
  Receives scan_id via navigation params. Fetches result from
  GET /history/{scan_id}. Layout: photo + mask overlay at top (40% height),
  ScrollView of TLC cards below. Render all 7 care sections. Each section
  card is collapsible with a chevron toggle.

- [ ] **[MOBILE] TASK-018**: Build `components/MaskOverlay.tsx`
  Overlay component that renders the SAM3 mask on top of the original photo.
  Fetches mask image from BACKEND_URL/masks/{scan_id}.png. Renders as
  semi-transparent orange/red tint (opacity 0.5) over affected region only.
  Animates in with Animated.timing fade over 600ms on mount.

- [ ] **[MOBILE] TASK-019**: Build `components/DiagnosisCard.tsx`
  Props: disease (DiseaseResult). Renders: disease name in large slab serif,
  confidence as percentage, severity as color-coded pill badge, affected
  tissue % as a horizontal fill bar, description text. Severity colors:
  Mild=#4CAF50, Moderate=#FFC107, Severe=#FF9800, Critical=#F44336.

- [ ] **[MOBILE] TASK-020**: Build `components/NutrientSection.tsx`
  Props: nutrients (NutrientRecommendation[]). For each deficiency renders:
  nutrient name + deficiency icon, visual symptom description, treatment
  recommendation, frequency, organic alternative. Expandable per nutrient.

- [ ] **[MOBILE] TASK-021**: Build `components/WateringCard.tsx`
  Props: watering (WateringAdvice). Shows: status label, watering schedule,
  ml amount per plant, warning (if any) in amber highlighted box. Include
  a simple animated water fill indicator (0–100% based on current_status).

- [ ] **[MOBILE] TASK-022**: Build `components/CareTimeline.tsx`
  Props: care_plan (CarePlan). Three columns: Today / This Week / Ongoing.
  Each action item is a checkable row. Checked state persists in AsyncStorage
  keyed by scan_id + action text. Checked items show strikethrough.

- [ ] **[MOBILE] TASK-023**: Build History Screen (`app/history.tsx`)
  Fetches GET /history. Renders a 2-column grid of scan thumbnails. Each
  cell: crop image, disease name, severity badge pill, relative timestamp
  ("2 hours ago"). Tap navigates to result.tsx with that scan_id.

- [ ] **[MOBILE] TASK-024**: Build Zustand store (`stores/scanStore.ts`)
  State: currentScanId, currentResult, scanHistory, isAnalyzing, error.
  Actions: startAnalysis(imageUri), setResult(result), loadHistory(),
  clearCurrent(). Camera and Results screens consume this store.

---

### PHASE 4 — Polish & Demo Prep

- [ ] **[MOBILE] TASK-025**: Apply design system across all screens
  Background: #1C1A14. Cards/surfaces: #2A2820. Primary: #76C442.
  Accent: #F5A623. Text: #FFFFFF / #E8E4D9. Apply bold slab serif font
  (e.g. Zilla Slab or Roboto Slab) for headers via expo-google-fonts.
  Geometric sans (e.g. DM Sans) for body text. No Inter, no Roboto, no
  system-ui.

- [ ] **[SHARED] TASK-026**: End-to-end integration test on real device
  Full flow: phone camera → capture → upload → SAM3 mask → Gemini diagnosis
  → results screen with overlay. Fix any field name mismatches between
  backend ScanResponse and mobile component props.

- [ ] **[BACKEND] TASK-027**: Pre-cache all 5 demo images
  On server startup, check if /data/demo_cache/{filename}.json exists for
  each sample image. If not, run full pipeline and write cache. Log
  "Demo cache ready: 5/5 images" so we know before the presentation.

- [ ] **[SHARED] TASK-028**: ngrok tunnel smoke test
  `ngrok http 8000` → paste HTTPS URL into mobile .env as EXPO_PUBLIC_API_URL
  → rebuild Expo → confirm phone hits backend over hackathon wifi.
  Document the ngrok command in a `start-demo.sh` script.

- [ ] **[BACKEND] TASK-029**: Open FiftyOne App for judges
  Add `start-demo.sh` script that launches both uvicorn and the FiftyOne
  App in one command. FiftyOne should open on port 5151 showing the
  cropguard dataset with all fields visible in the sidebar.

- [ ] **[MOBILE] TASK-030**: Final demo rehearsal
  Run the full 2-minute judge demo script (bottom of this file) without
  stopping. Time it. Fix any jank in transitions, loading states, or
  card rendering. The mask fade-in must work first try.

---

### PHASE 5 — Stretch Goals (if time permits)

- [ ] **[BACKEND] TASK-031**: Weather-aware watering via Open-Meteo API
  Free, no key required. Use device GPS from mobile request headers.
  Adjust watering frequency based on recent rainfall + next 3 day forecast.

- [ ] **[MOBILE] TASK-032**: Care Calendar screen (`app/calendar.tsx`)
  Weekly view of all care actions across crops. Color coded: 💧blue=water,
  🧪green=fertilize, 🐛yellow=pest check, 🔴red=urgent treatment.

- [ ] **[BACKEND] TASK-033**: Crop comparison endpoint
  GET /compare?a={scan_id}&b={scan_id} returns diff: severity change,
  affected_percent change, which deficiencies resolved. Useful for showing
  recovery over time during the demo.

- [ ] **[MOBILE] TASK-034**: Push notification reminders
  Schedule local notifications from the care_plan using expo-notifications.
  "Time to water your Tomatoes 💧" at the interval specified in watering.schedule.
  No server needed — pure client-side scheduling.

---

## API Contract

### POST /analyze
**Request**: multipart/form-data — field name `image`
**Response**:
```json
{
  "scan_id": "uuid",
  "crop_type": "Tomato",
  "disease": {
    "name": "Late Blight",
    "confidence": 0.94,
    "severity": "Moderate",
    "affected_percent": 23.4,
    "description": "Fungal infection caused by Phytophthora infestans"
  },
  "mask_url": "/masks/uuid.png",
  "nutrients": {
    "deficiencies": ["Nitrogen", "Calcium"],
    "recommendations": [
      {
        "nutrient": "Nitrogen",
        "symptom": "Yellowing of lower leaves",
        "treatment": "Apply balanced NPK fertilizer (10-10-10)",
        "frequency": "Every 2 weeks",
        "organic_option": "Fish emulsion or composted manure"
      }
    ]
  },
  "watering": {
    "current_status": "Slightly Underwatered",
    "schedule": "Water deeply every 3 days",
    "amount_ml_per_plant": 500,
    "warning": "Avoid wetting foliage to prevent further blight spread"
  },
  "pests": {
    "detected": true,
    "type": "Aphids",
    "severity": "Mild",
    "treatment": "Neem oil spray, 3 applications every 5 days"
  },
  "soil": {
    "recommended_ph": "6.0–6.8",
    "amendments": ["Add agricultural lime if pH below 6.0"],
    "drainage": "Ensure raised beds or well-draining soil"
  },
  "care_plan": {
    "immediate": ["Apply copper fungicide within 24 hours", "Remove infected leaves"],
    "this_week": ["Increase plant spacing for airflow", "Apply nitrogen fertilizer"],
    "ongoing": ["Weekly neem oil spray", "Monitor for new infection sites"]
  },
  "recovery_outlook": "Good — with treatment, expect improvement within 10–14 days"
}
```

### GET /history
Returns: `[{ scan_id, timestamp, crop_type, disease_name, severity, thumbnail_url }]`

### GET /history/{scan_id}
Returns: full ScanResponse object

### GET /masks/{scan_id}.png
Returns: PNG image of SAM3 segmentation mask

### GET /health
Returns: `{ "status": "ok", "plugins": ["sam3_images", "gemini-vision"] }`

---

## Gemini Vision Prompt Template

```
You are an expert agronomist and plant pathologist with 20 years of field
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
to both local markets and agricultural suppliers.
```

---

## Key Commands

```bash
# ── One-time setup ──────────────────────────────────────────
pip install fiftyone fastapi uvicorn python-multipart sqlmodel python-dotenv pillow numpy requests
fiftyone plugins download https://github.com/harpreetsahota204/sam3_images
fiftyone plugins download https://github.com/AdonaiVera/gemini-vision-plugin
fiftyone operators list    # both plugins must appear here

# ── Daily dev ───────────────────────────────────────────────
cd backend && uvicorn server:app --reload --port 8000
cd mobile && npx expo start
ngrok http 8000            # paste URL into EXPO_PUBLIC_API_URL

# ── Demo launch (judges watching) ───────────────────────────
bash start-demo.sh         # starts uvicorn + FiftyOne App together
# FiftyOne App → http://localhost:5151
# FastAPI docs → http://localhost:8000/docs
```

---

## FiftyOne Pipeline Flow

```
1. POST /analyze receives image
2. Image saved → /tmp/cropguard/{scan_id}.jpg
3. fo.Dataset("cropguard").add_sample(image_path)
4. SAM3 operator called → segmentation mask generated
5. Mask stored as fo.Segmentation field on sample
6. Masked region + original image → Gemini Vision operator
7. Gemini JSON parsed → stored as fo.Classification + custom fields
8. care_engine.py enriches output with static crop knowledge
9. Result persisted to SQLite
10. ScanResponse returned to mobile app
```

---

## Collaboration

- **Elijah** owns `/backend` — Claude Code should not suggest edits to `/mobile`
- **Collaborator** owns `/mobile` — Claude Code should not suggest edits to `/backend`
- Shared contract: `backend/models.py` — agree before any field changes
- `main` branch is always demo-ready; never push broken code to main
- Branch naming: `feature/backend-*` and `feature/mobile-*`
- Merge only after smoke test passes end-to-end

---

## Design Direction (Mobile UI)

**Aesthetic**: Organic + earthy but modern. Dark soil tones with precise
medical-scanner energy. Think a field notebook crossed with a precision
diagnostic tool used by field agronomists.

**Color tokens**:
```
--bg:         #1C1A14   (dark soil)
--surface:    #2A2820   (card background)
--primary:    #76C442   (healthy green)
--accent:     #F5A623   (harvest amber)
--text-1:     #FFFFFF
--text-2:     #E8E4D9
--severity-1: #4CAF50   (Mild)
--severity-2: #FFC107   (Moderate)
--severity-3: #FF9800   (Severe)
--severity-4: #F44336   (Critical)
```

**Typography**: Zilla Slab Bold for disease names and section headers.
DM Sans for body copy, labels, and data. Load via expo-google-fonts.

**Motion**: Mask overlay fades in over 600ms. Results cards stagger in
with 80ms delay each. Severity badge pulses once on load if Critical.

---

## Demo Script for Judges (2 minutes)

1. Open app on phone → full-bleed camera viewfinder appears
2. Point at pre-loaded tomato blight image / tap capture
3. Spinner: "CropGuard is analyzing your crop..." (1.5–3s)
4. Results screen animates in — SAM3 mask glows over diseased tissue
5. Scroll: Disease card (Late Blight, 23% affected) → Nutrient deficiencies
   → Watering plan → Pest alert → Weekly care timeline
6. Switch to laptop → FiftyOne App on port 5151 shows same image with
   mask rendered and all metadata fields in sidebar
7. Say: "Every scan a farmer takes feeds this dataset automatically.
   Their whole season becomes the training data that makes the next
   recommendation smarter — and the model improves without them
   doing anything extra."

---

## What Makes This Different From Plantix

| Feature | Plantix | CropGuard |
|---|---|---|
| Disease label | ✅ | ✅ |
| Pixel-level segmentation mask | ❌ | ✅ SAM3 |
| Affected tissue % | ❌ | ✅ |
| Nutrient deficiency analysis | Partial | ✅ Full |
| Watering schedule + amount | ❌ | ✅ |
| Pest identification + treatment | ✅ | ✅ |
| Soil pH + amendments | ❌ | ✅ |
| Full weekly care timeline | ❌ | ✅ |
| Historical disease progression | ❌ | ✅ FiftyOne |
| Dataset grows with every scan | ❌ | ✅ |
