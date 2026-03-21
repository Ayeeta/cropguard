#!/bin/bash
# CropGuard Demo Launcher
# Starts both the FastAPI backend and FiftyOne App

echo "🌱 Starting CropGuard Demo..."
echo ""

# Start FastAPI server
echo "→ Starting FastAPI on port 8000..."
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 &
UVICORN_PID=$!

# Start FiftyOne App
echo "→ Starting FiftyOne App on port 5151..."
python -c "
import fiftyone as fo
try:
    dataset = fo.load_dataset('cropguard')
except:
    dataset = fo.Dataset('cropguard', persistent=True)
session = fo.launch_app(dataset, port=5151, address='0.0.0.0')
print('FiftyOne App running at http://localhost:5151')
session.wait()
" &
FIFTYONE_PID=$!

cd ..

echo ""
echo "✅ CropGuard is running!"
echo "   FastAPI docs → http://localhost:8000/docs"
echo "   FiftyOne App → http://localhost:5151"
echo ""
echo "Press Ctrl+C to stop all services."

# Cleanup on exit
trap "kill $UVICORN_PID $FIFTYONE_PID 2>/dev/null; echo 'Stopped.'" EXIT

wait
