# CropGuard — AI-Powered Crop Care & Disease Detection

CropGuard is a mobile-first platform that gives farmers and gardeners a full-spectrum plant health companion. Point your phone at a plant and get back not just a diagnosis, but a complete care plan: disease identification, nutrient analysis, watering schedule, pest alerts, soil recommendations, and a step-by-step recovery timeline.

## How It Works

1. **Capture** — Take a photo of your plant or upload from gallery
2. **Segment** — SAM3 draws a pixel-level mask around affected tissue
3. **Diagnose** — Gemini Vision AI analyzes the image and returns a full health assessment
4. **Care Plan** — Get actionable recommendations: what to treat, when to water, what to fertilize

## Features

- **Disease Detection** — Identifies diseases with confidence scores and severity ratings (Mild → Critical)
- **Nutrient Analysis** — Maps visual symptoms to deficiency profiles with organic and synthetic treatment options
- **Watering Guidance** — Crop-specific schedules with amounts and overwatering/underwatering diagnosis
- **Pest Management** — Visual pest damage identification with treatment plans
- **Soil Health** — pH recommendations, amendments, and drainage guidance
- **Care Timeline** — Checkable action items organized by Today / This Week / Ongoing
- **Scan History** — Track plant health over time with side-by-side comparisons
- **Recovery Outlook** — Prognosis for how long treatment should take

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native + Expo (TypeScript) |
| **Camera** | expo-camera + expo-image-picker |
| **Navigation** | Expo Router (file-based) |
| **State** | Zustand |
| **Backend** | Python + FastAPI |
| **Segmentation** | SAM3 (via FiftyOne plugin) |
| **Vision AI** | Google Gemini 2.5 Flash |
| **Dataset** | FiftyOne (dataset management + visualization) |
| **Database** | SQLite via SQLModel |

## Project Structure

```
cropguard/
├── backend/
│   ├── server.py          # FastAPI endpoints
│   ├── pipeline.py        # SAM3 segmentation + Gemini Vision
│   ├── care_engine.py     # Static crop care knowledge base
│   ├── models.py          # Pydantic response schemas
│   ├── dataset.py         # FiftyOne dataset management
│   └── .env               # API keys (not committed)
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx    # Root layout with fonts
│   │   ├── index.tsx      # Camera / upload screen
│   │   ├── result.tsx     # Results with care cards
│   │   └── history.tsx    # Scan history grid
│   ├── components/
│   │   ├── DiagnosisCard.tsx
│   │   ├── NutrientSection.tsx
│   │   ├── WateringCard.tsx
│   │   ├── PestCard.tsx
│   │   ├── SoilCard.tsx
│   │   ├── CareTimeline.tsx
│   │   └── MaskOverlay.tsx
│   ├── stores/
│   │   └── scanStore.ts   # Zustand state management
│   └── constants/
│       ├── api.ts         # Backend URL config
│       └── theme.ts       # Colors and fonts
├── data/
│   └── sample_images/     # Test images for demo
├── start-demo.sh          # Launches backend + FiftyOne App
└── CLAUDE.md              # Full project spec
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Backend Setup

```bash
cd backend
pip install fiftyone fastapi uvicorn python-multipart sqlmodel python-dotenv pillow numpy requests google-genai

# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env

# Start the server
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

### Mobile Setup

```bash
cd mobile
npm install --legacy-peer-deps

# Start Expo
npx expo start
```

### Run Both (Demo Mode)

```bash
bash start-demo.sh
```

- FastAPI docs: http://localhost:8000/docs
- FiftyOne App: http://localhost:5151

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Upload image → get full diagnosis |
| GET | `/masks/{scan_id}.png` | SAM3 segmentation mask |
| GET | `/history` | Last 20 scan summaries |
| GET | `/history/{scan_id}` | Full result for one scan |
| GET | `/health` | Server and plugin status |

## What Makes CropGuard Different

| Feature | Traditional Apps | CropGuard |
|---------|-----------------|-----------|
| Disease label | Yes | Yes |
| Pixel-level segmentation mask | No | Yes (SAM3) |
| Affected tissue percentage | No | Yes |
| Full nutrient deficiency analysis | Partial | Yes |
| Watering schedule + amounts | No | Yes |
| Soil pH + amendments | No | Yes |
| Weekly care timeline | No | Yes |
| Dataset grows with every scan | No | Yes (FiftyOne) |

## Design

Dark soil tones with precision diagnostic energy. Zilla Slab Bold for headings, DM Sans for body text.

| Token | Value |
|-------|-------|
| Background | `#1C1A14` |
| Surface | `#2A2820` |
| Primary | `#76C442` |
| Accent | `#F5A623` |
| Mild | `#4CAF50` |
| Moderate | `#FFC107` |
| Severe | `#FF9800` |
| Critical | `#F44336` |

## Team

Built at a hackathon with AI-assisted development using Claude Code.

## License

MIT
