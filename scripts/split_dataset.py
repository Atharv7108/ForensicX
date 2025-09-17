import os
import shutil
import random
from pathlib import Path
from collections import Counter

# Config
DATASET_DIR = "datasets"   # root folder where your 3 classes are
OUTPUT_DIR = "datasets_split"
CLASSES = ["natural", "ai_generated", "ai_enhanced"]

SPLIT_RATIOS = {
    "train": 0.7,
    "val": 0.15,
    "test": 0.15
}

IMG_EXTENSIONS = [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]

def is_image_file(filename):
    return any(filename.lower().endswith(ext) for ext in IMG_EXTENSIONS)

def collect_images(class_dir):
    """Recursively collect all image paths from a class directory"""
    image_paths = []
    for root, _, files in os.walk(class_dir):
        for file in files:
            if is_image_file(file):
                image_paths.append(os.path.join(root, file))
    return image_paths

def split_and_copy():
    random.seed(42)  # reproducibility
    split_counts = { "train": Counter(), "val": Counter(), "test": Counter() }

    # Remove old split dir if exists
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for class_name in CLASSES:
        class_dir = os.path.join(DATASET_DIR, class_name)
        images = collect_images(class_dir)
        print(f"{class_name}: {len(images)} images found")

        random.shuffle(images)
        n_total = len(images)
        n_train = int(SPLIT_RATIOS["train"] * n_total)
        n_val = int(SPLIT_RATIOS["val"] * n_total)

        splits = {
            "train": images[:n_train],
            "val": images[n_train:n_train+n_val],
            "test": images[n_train+n_val:]
        }

        for split, split_imgs in splits.items():
            for img_path in split_imgs:
                rel_path = os.path.relpath(img_path, class_dir)  # keep subfolder structure
                dest_path = os.path.join(OUTPUT_DIR, split, class_name, rel_path)
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                shutil.copy2(img_path, dest_path)
                split_counts[split][class_name] += 1

    print("\n📊 Split Summary:")
    for split in ["train", "val", "test"]:
        print(f"--- {split.upper()} ---")
        for class_name in CLASSES:
            print(f"{class_name:12}: {split_counts[split][class_name]} images")

if __name__ == "__main__":
    split_and_copy()
