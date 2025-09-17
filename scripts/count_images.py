import os

# Define your dataset paths
dataset_paths = {
    "natural": "datasets/Natural/Real",
    "ai_generated": "datasets/AI_Generated/AI",
    "ai_enhanced": "datasets/ai_enhanced",
}

def count_images_in_subfolders(root_dir):
    count = 0
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
                count += 1
    return count

if __name__ == "__main__":
    # Count for each class
    for class_name, path in dataset_paths.items():
        print(f"{class_name}: {count_images_in_subfolders(path)} images")
