import os
from pathlib import Path

SPLIT_PATH = "datasets_split"  # path where split dataset is stored

def count_images(base_path):
    exts = [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]
    count = 0
    for root, _, files in os.walk(base_path):
        for f in files:
            if any(f.lower().endswith(ext) for ext in exts):
                count += 1
    return count

def main():
    splits = ["train", "val", "test"]
    classes = ["natural", "ai_generated", "ai_enhanced"]

    print("\n📊 Dataset Split Summary:\n")
    for split in splits:
        print(f"--- {split.upper()} ---")
        for cls in classes:
            path = Path(SPLIT_PATH) / split / cls
            n = count_images(path)
            print(f"{cls:12s}: {n} images")
        print("")

if __name__ == "__main__":
    main()
