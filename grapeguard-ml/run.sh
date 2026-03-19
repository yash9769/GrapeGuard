#!/bin/bash
# run.sh - Start the GrapeGuard ML API

echo "🍇 Starting GrapeGuard ML API..."
cd "$(dirname "$0")"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Install from python.org"
    exit 1
fi

# Create venv if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate and install
source venv/bin/activate
pip install -q -r requirements.txt

# Run server
echo "✅ API running at http://localhost:8000"
echo "   Test: http://localhost:8000/health"
echo "   Docs: http://localhost:8000/docs"
echo ""
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

