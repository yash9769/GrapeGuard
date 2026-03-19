"""
GrapeGuard ML API
-----------------
FastAPI server that accepts a grape leaf image and returns disease prediction.

Supports two modes:
  1. REAL MODEL  — loads your trained .pth / .h5 model
  2. MOCK MODE   — returns random predictions (for testing without a model)

Set USE_REAL_MODEL = True once you have a trained model file.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io, random, time, os

# ── Config ────────────────────────────────────────────────────────────────────
USE_REAL_MODEL = False          # ← Set True when you have a trained model
MODEL_PATH     = "model/grape_disease_model.pth"

CLASSES = [
    "healthy",
    "powdery_mildew",
    "downy_mildew",
    "leaf_blight",
    "anthracnose",
    "botrytis",
]

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="GrapeGuard ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten this in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load real model (only if USE_REAL_MODEL = True) ──────────────────────────
model = None

if USE_REAL_MODEL:
    try:
        import torch
        import torchvision.transforms as transforms
        from torchvision import models

        model = models.mobilenet_v3_small(pretrained=False)
        model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, len(CLASSES))
        model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
        model.eval()
        print(f"✅ Model loaded from {MODEL_PATH}")

        TRANSFORM = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225]),
        ])
    except Exception as e:
        print(f"❌ Model load failed: {e}")
        USE_REAL_MODEL = False


# ── Helper: run real inference ────────────────────────────────────────────────
def predict_real(image: Image.Image):
    import torch
    tensor = TRANSFORM(image).unsqueeze(0)
    with torch.no_grad():
        outputs = model(tensor)
        probs   = torch.softmax(outputs, dim=1)[0]
        idx     = probs.argmax().item()
    return CLASSES[idx], round(float(probs[idx]) * 100, 1)


# ── Helper: mock prediction (for testing) ────────────────────────────────────
def predict_mock():
    # 60% chance healthy, 40% disease — realistic distribution
    pool = ["healthy", "healthy", "healthy",
            "powdery_mildew", "downy_mildew", "leaf_blight"]
    label      = random.choice(pool)
    confidence = round(random.uniform(72, 97), 1)
    time.sleep(0.8)   # simulate processing time
    return label, confidence


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "name":   "GrapeGuard ML API",
        "status": "running",
        "mode":   "real_model" if USE_REAL_MODEL else "mock",
        "classes": CLASSES,
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": USE_REAL_MODEL}


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    # Validate file type
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read and open image
    try:
        contents = await image.read()
        img      = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Run prediction
    if USE_REAL_MODEL and model is not None:
        label, confidence = predict_real(img)
    else:
        label, confidence = predict_mock()

    return {
        "result":     label,
        "confidence": confidence,
        "is_healthy": label == "healthy",
        "mode":       "real" if USE_REAL_MODEL else "mock",
    }

