"""
GrapeGuard - Model Training Script
------------------------------------
Trains a MobileNetV3-Small on your grape leaf dataset.

Dataset folder structure expected:
  dataset/
    healthy/          ← healthy leaf images
    powdery_mildew/   ← images of this disease
    downy_mildew/
    leaf_blight/
    anthracnose/
    botrytis/

Usage:
  python train.py --data ./dataset --epochs 20 --output model/grape_disease_model.pth
"""

import argparse, os, time
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import datasets, models
from torch.utils.data import DataLoader, random_split

CLASSES = ["healthy", "powdery_mildew", "downy_mildew", "leaf_blight", "anthracnose", "botrytis"]


def train(data_dir, epochs, output_path, batch_size=32, lr=0.001):
    # ── Transforms ──────────────────────────────────────────────
    train_tf = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    # ── Dataset ─────────────────────────────────────────────────
    full_ds = datasets.ImageFolder(data_dir, transform=train_tf)
    val_size = int(0.2 * len(full_ds))
    train_ds, val_ds = random_split(full_ds, [len(full_ds) - val_size, val_size])
    val_ds.dataset.transform = val_tf

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,  num_workers=2)
    val_loader   = DataLoader(val_ds,   batch_size=batch_size, shuffle=False, num_workers=2)

    print(f"📊 Train: {len(train_ds)} | Val: {len(val_ds)} | Classes: {full_ds.classes}")

    # ── Model ────────────────────────────────────────────────────
    device = torch.device("mps" if torch.backends.mps.is_available()
                          else "cuda" if torch.cuda.is_available() else "cpu")
    print(f"🖥️  Device: {device}")

    model = models.mobilenet_v3_small(pretrained=True)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(full_ds.classes))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)

    best_acc = 0.0

    # ── Training loop ────────────────────────────────────────────
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        # Validation
        model.eval()
        correct = total = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = outputs.max(1)
                total   += labels.size(0)
                correct += predicted.eq(labels).sum().item()

        acc = 100. * correct / total
        scheduler.step()
        print(f"Epoch [{epoch+1}/{epochs}]  Loss: {running_loss/len(train_loader):.3f}  Val Acc: {acc:.1f}%")

        if acc > best_acc:
            best_acc = acc
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            torch.save(model.state_dict(), output_path)
            print(f"  💾 Saved best model → {output_path}")

    print(f"\n✅ Training complete! Best accuracy: {best_acc:.1f}%")
    print(f"   Model saved to: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data",    default="./dataset",                        help="Dataset folder")
    parser.add_argument("--epochs",  type=int, default=20,                       help="Number of epochs")
    parser.add_argument("--output",  default="model/grape_disease_model.pth",    help="Output model path")
    parser.add_argument("--batch",   type=int, default=32,                       help="Batch size")
    parser.add_argument("--lr",      type=float, default=0.001,                  help="Learning rate")
    args = parser.parse_args()
    train(args.data, args.epochs, args.output, args.batch, args.lr)

