#!/usr/bin/env python3
"""
Enhanced training script with better data augmentation and model architecture
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, WeightedRandomSampler
from torch.optim.lr_scheduler import ReduceLROnPlateau
from tqdm import tqdm
import json
import numpy as np
from collections import Counter
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

def count_class_samples(dataset_path):
    """Count samples per class for weighted sampling."""
    class_counts = {}
    
    for class_name in os.listdir(dataset_path):
        class_path = os.path.join(dataset_path, class_name)
        if os.path.isdir(class_path):
            count = len([f for f in os.listdir(class_path) 
                        if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
            class_counts[class_name] = count
    
    return class_counts

def create_weighted_sampler(dataset):
    """Create weighted sampler for balanced training."""
    # Count samples per class
    class_counts = Counter(dataset.targets)
    
    # Calculate weights (inverse frequency)
    total_samples = len(dataset)
    class_weights = {cls: total_samples / count for cls, count in class_counts.items()}
    
    # Create sample weights
    sample_weights = [class_weights[target] for target in dataset.targets]
    
    return WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True
    )

def get_enhanced_transforms():
    """Get enhanced data augmentation transforms."""
    
    # Enhanced training transforms with more aggressive augmentation
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomCrop(224),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(
            brightness=0.2,
            contrast=0.2, 
            saturation=0.2,
            hue=0.1
        ),
        transforms.RandomGrayscale(p=0.1),
        transforms.RandomPerspective(distortion_scale=0.2, p=0.3),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        transforms.RandomErasing(p=0.2, scale=(0.02, 0.2))
    ])
    
    # Standard validation transforms
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    return train_transform, val_transform

def create_model(num_classes=3, model_name='efficientnet'):
    """Create model with different architectures."""
    
    if model_name == 'efficientnet':
        model = models.efficientnet_b0(pretrained=True)
        num_ftrs = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_ftrs, num_classes)
        
    elif model_name == 'resnet50':
        model = models.resnet50(pretrained=True)
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, num_classes)
        
    elif model_name == 'mobilenet':
        model = models.mobilenet_v3_large(pretrained=True)
        num_ftrs = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(num_ftrs, num_classes)
    
    return model

def train_model(train_dir, val_dir, config):
    """Enhanced training function."""
    
    print("🔥 Starting Enhanced Model Training")
    print("=" * 60)
    
    # Device setup
    device = torch.device("mps") if torch.backends.mps.is_available() else torch.device("cpu")
    print(f"🖥️  Using device: {device}")
    
    # Get transforms
    train_transform, val_transform = get_enhanced_transforms()
    
    # Load datasets
    print("📁 Loading datasets...")
    train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transform)
    
    print(f"   Train samples: {len(train_dataset):,}")
    print(f"   Val samples: {len(val_dataset):,}")
    print(f"   Classes: {train_dataset.classes}")
    
    # Count class distribution
    train_counts = count_class_samples(train_dir)
    print(f"   Class distribution: {train_counts}")
    
    # Create weighted sampler for balanced training
    train_sampler = create_weighted_sampler(train_dataset)
    
    # Data loaders
    train_loader = DataLoader(
        train_dataset, 
        batch_size=config['batch_size'],
        sampler=train_sampler,
        num_workers=4,
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=config['batch_size'],
        shuffle=False,
        num_workers=4,
        pin_memory=True
    )
    
    # Create model
    print(f"🧠 Creating {config['model_name']} model...")
    model = create_model(
        num_classes=len(train_dataset.classes),
        model_name=config['model_name']
    )
    model = model.to(device)
    
    # Loss function with class weights for imbalanced data
    class_weights = torch.FloatTensor([
        1.0 / train_counts.get(cls, 1) for cls in train_dataset.classes
    ]).to(device)
    
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    
    # Optimizer with different learning rates for different parts
    if config['model_name'] == 'efficientnet':
        optimizer = optim.AdamW([
            {'params': model.features.parameters(), 'lr': config['lr'] * 0.1},  # Lower LR for features
            {'params': model.classifier.parameters(), 'lr': config['lr']}       # Higher LR for classifier
        ], weight_decay=0.01)
    else:
        optimizer = optim.AdamW(model.parameters(), lr=config['lr'], weight_decay=0.01)
    
    # Learning rate scheduler
    scheduler = ReduceLROnPlateau(
        optimizer, 
        mode='max',
        factor=0.5,
        patience=3,
        verbose=True
    )
    
    # Training history
    history = {
        'train_loss': [],
        'train_acc': [],
        'val_loss': [],
        'val_acc': []
    }
    
    best_val_acc = 0.0
    patience_counter = 0
    
    print(f"🚀 Starting training for {config['epochs']} epochs...")
    
    for epoch in range(config['epochs']):
        print(f"\n📅 Epoch {epoch+1}/{config['epochs']}")
        print("-" * 40)
        
        # Training phase
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0
        
        train_pbar = tqdm(train_loader, desc=f"Training")
        for batch_idx, (images, labels) in enumerate(train_pbar):
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()
            
            # Update progress bar
            train_pbar.set_postfix({
                'Loss': f"{loss.item():.4f}",
                'Acc': f"{100*train_correct/train_total:.2f}%"
            })
        
        train_loss = train_loss / len(train_loader)
        train_acc = train_correct / train_total
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            val_pbar = tqdm(val_loader, desc="Validation")
            for images, labels in val_pbar:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
                
                val_pbar.set_postfix({
                    'Loss': f"{loss.item():.4f}",
                    'Acc': f"{100*val_correct/val_total:.2f}%"
                })
        
        val_loss = val_loss / len(val_loader)
        val_acc = val_correct / val_total
        
        # Update history
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        # Update learning rate
        scheduler.step(val_acc)
        
        print(f"📊 Results: Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
        print(f"          Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            
            # Save model
            model_save_path = f"models/{config['model_name']}_enhanced_best.pth"
            torch.save(model.state_dict(), model_save_path)
            
            # Save full model for easier loading
            full_model_path = f"models/{config['model_name']}_enhanced_full.pth"
            torch.save(model, full_model_path)
            
            print(f"💾 Saved best model with Val Acc: {best_val_acc:.4f}")
        else:
            patience_counter += 1
        
        # Early stopping
        if patience_counter >= config['patience']:
            print(f"🛑 Early stopping triggered after {patience_counter} epochs without improvement")
            break
    
    # Save training history
    history_path = f"models/{config['model_name']}_training_history.json"
    with open(history_path, 'w') as f:
        json.dump(history, f, indent=2)
    
    print(f"\n🎉 Training completed!")
    print(f"📈 Best validation accuracy: {best_val_acc:.4f}")
    print(f"💾 Model saved: models/{config['model_name']}_enhanced_best.pth")
    
    return model, history, best_val_acc

def plot_training_history(history, model_name):
    """Plot training history."""
    
    plt.figure(figsize=(12, 4))
    
    # Plot loss
    plt.subplot(1, 2, 1)
    plt.plot(history['train_loss'], label='Train Loss')
    plt.plot(history['val_loss'], label='Val Loss')
    plt.title(f'{model_name} - Training Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True)
    
    # Plot accuracy
    plt.subplot(1, 2, 2)
    plt.plot(history['train_acc'], label='Train Acc')
    plt.plot(history['val_acc'], label='Val Acc')
    plt.title(f'{model_name} - Training Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.grid(True)
    
    plt.tight_layout()
    plt.savefig(f'models/{model_name}_training_history.png', dpi=300, bbox_inches='tight')
    plt.show()

def main():
    """Main training function."""
    
    # Training configuration
    config = {
        'train_dir': 'forensicx_dataset/train',
        'val_dir': 'forensicx_dataset/val',
        'model_name': 'efficientnet',  # efficientnet, resnet50, mobilenet
        'batch_size': 32,
        'lr': 1e-4,
        'epochs': 25,
        'patience': 7
    }
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    # Check if datasets exist
    if not os.path.exists(config['train_dir']):
        print("❌ Training dataset not found!")
        print("   Please run download_datasets.py and create_balanced_dataset.py first")
        return
    
    # Start training
    model, history, best_acc = train_model(
        config['train_dir'],
        config['val_dir'],
        config
    )
    
    # Plot results
    plot_training_history(history, config['model_name'])
    
    print(f"\n✅ Training complete! Best accuracy: {best_acc:.4f}")

if __name__ == "__main__":
    main()