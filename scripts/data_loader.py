# data_loader.py
import os
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import matplotlib.pyplot as plt

# Paths to your dataset splits
train_dir = "datasets_split/train"
val_dir   = "datasets_split/val"
test_dir  = "datasets_split/test"

# Image transformations
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

val_test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# Load datasets
train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
val_dataset   = datasets.ImageFolder(val_dir, transform=val_test_transform)
test_dataset  = datasets.ImageFolder(test_dir, transform=val_test_transform)

# Create DataLoaders
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader   = DataLoader(val_dataset, batch_size=32, shuffle=False)
test_loader  = DataLoader(test_dataset, batch_size=32, shuffle=False)

# Print class names
print("Classes:", train_dataset.classes)

# Function to visualize a batch
def show_batch(loader):
    images, labels = next(iter(loader))
    images = images / 2 + 0.5  # unnormalize
    plt.figure(figsize=(10, 10))
    for i in range(min(8, len(images))):
        plt.subplot(2, 4, i+1)
        plt.imshow(images[i].permute(1, 2, 0))
        plt.title(train_dataset.classes[labels[i]])
        plt.axis("off")
    plt.show()

# Verify training data
show_batch(train_loader)

# Check total images per split
print(f"Total train images: {len(train_dataset)}")
print(f"Total val images: {len(val_dataset)}")
print(f"Total test images: {len(test_dataset)}")
