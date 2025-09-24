#!/usr/bin/env python3
"""
Incremental Training Script for MacBook Air
Train in small segments to work around memory limitations
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, Subset
import json
import time
from datetime import datetime
from pathlib import Path
import numpy as np
from tqdm import tqdm

class IncrementalTrainer:
    def __init__(self, config_file="training_config.json"):
        self.config_file = config_file
        self.load_config()
        self.setup_model()
        self.setup_device()
        
    def load_config(self):
        """Load or create training configuration"""
        default_config = {
            "dataset_path": "datasets_balanced", 
            "model_save_path": "models/efficientnet_incremental.pth",
            "backup_path": "model_backups",
            "batch_size": 16,  # Small batch for MacBook Air
            "segment_size": 5000,  # Train 5K images at a time
            "learning_rate": 0.001,
            "num_epochs_per_segment": 3,  # Few epochs per segment
            "current_segment": 0,
            "total_segments_completed": 0,
            "best_accuracy": 0.0,
            "training_history": []
        }
        
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                self.config = json.load(f)
            print(f"📄 Loaded existing config: {self.config_file}")
        else:
            self.config = default_config
            self.save_config()
            print(f"📄 Created new config: {self.config_file}")
    
    def save_config(self):
        """Save current configuration"""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def setup_device(self):
        """Setup device for MacBook Air"""
        if torch.backends.mps.is_available():
            self.device = torch.device("mps")
            print("🚀 Using Apple Metal Performance Shaders (MPS)")
        else:
            self.device = torch.device("cpu")
            print("💻 Using CPU")
            
        print(f"📱 Device: {self.device}")
    
    def setup_model(self):
        """Setup EfficientNet model"""
        self.classes = ['ai_generated', 'natural', 'ai_enhanced']
        
        # Create model
        self.model = models.efficientnet_b0(pretrained=True)
        num_ftrs = self.model.classifier[1].in_features
        self.model.classifier[1] = nn.Linear(num_ftrs, len(self.classes))
        
        # Load existing model if available
        model_path = self.config["model_save_path"]
        if os.path.exists(model_path):
            print(f"📥 Loading existing model: {model_path}")
            self.model.load_state_dict(torch.load(model_path, map_location='cpu'))
        
        self.model.to(self.device)
        
        # Setup optimizer and criterion
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.config["learning_rate"])
        self.criterion = nn.CrossEntropyLoss()
    
    def backup_model(self):
        """Create backup of current model"""
        backup_dir = Path(self.config["backup_path"])
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = backup_dir / f"efficientnet_segment_{self.config['total_segments_completed']}_{timestamp}.pth"
        
        torch.save(self.model.state_dict(), backup_path)
        print(f"💾 Model backed up to: {backup_path}")
    
    def create_data_loaders(self, segment_indices=None):
        """Create data loaders for current segment"""
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(10),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
        
        val_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(), 
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
        
        # Load full dataset
        try:
            train_dataset = datasets.ImageFolder(
                root=os.path.join(self.config["dataset_path"], "train"),
                transform=transform
            )
            val_dataset = datasets.ImageFolder(
                root=os.path.join(self.config["dataset_path"], "val"), 
                transform=val_transform
            )
        except FileNotFoundError:
            # If train/val split doesn't exist, create it
            print("📁 No train/val split found. Using full dataset...")
            full_dataset = datasets.ImageFolder(
                root=self.config["dataset_path"],
                transform=transform
            )
            
            # Split dataset 80/20
            total_size = len(full_dataset)
            train_size = int(0.8 * total_size)
            val_size = total_size - train_size
            
            train_dataset, val_dataset = torch.utils.data.random_split(
                full_dataset, [train_size, val_size]
            )
        
        # Create segment subset if specified
        if segment_indices is not None:
            train_dataset = Subset(train_dataset, segment_indices)
        
        # Create data loaders
        train_loader = DataLoader(
            train_dataset,
            batch_size=self.config["batch_size"],
            shuffle=True,
            num_workers=2,  # Reduced for MacBook Air
            pin_memory=True if self.device.type == 'mps' else False
        )
        
        val_loader = DataLoader(
            val_dataset,
            batch_size=self.config["batch_size"],
            shuffle=False,
            num_workers=2,
            pin_memory=True if self.device.type == 'mps' else False
        )
        
        return train_loader, val_loader
    
    def get_segment_indices(self, dataset_size):
        """Get indices for current training segment"""
        segment_size = self.config["segment_size"]
        current_segment = self.config["current_segment"]
        
        start_idx = current_segment * segment_size
        end_idx = min(start_idx + segment_size, dataset_size)
        
        if start_idx >= dataset_size:
            return None  # No more segments
            
        return list(range(start_idx, end_idx))
    
    def train_segment(self, train_loader, val_loader):
        """Train one segment"""
        print(f"\n🎯 Training Segment {self.config['current_segment'] + 1}")
        print(f"📊 Batch size: {self.config['batch_size']}")
        print(f"📈 Epochs per segment: {self.config['num_epochs_per_segment']}")
        
        self.model.train()
        segment_history = []
        
        for epoch in range(self.config["num_epochs_per_segment"]):
            running_loss = 0.0
            correct = 0
            total = 0
            
            pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}")
            
            for batch_idx, (inputs, labels) in enumerate(pbar):
                inputs, labels = inputs.to(self.device), labels.to(self.device)
                
                # Zero gradients
                self.optimizer.zero_grad()
                
                # Forward pass
                outputs = self.model(inputs)
                loss = self.criterion(outputs, labels)
                
                # Backward pass
                loss.backward()
                self.optimizer.step()
                
                # Statistics
                running_loss += loss.item()
                _, predicted = outputs.max(1)
                total += labels.size(0)
                correct += predicted.eq(labels).sum().item()
                
                # Update progress bar
                pbar.set_postfix({
                    'Loss': f'{loss.item():.4f}',
                    'Acc': f'{100.*correct/total:.2f}%'
                })
                
                # Memory cleanup for MacBook Air
                if batch_idx % 50 == 0:
                    if self.device.type == 'mps':
                        torch.mps.empty_cache()
            
            # Validate after each epoch
            val_acc = self.validate(val_loader)
            epoch_acc = 100. * correct / total
            
            segment_history.append({
                "epoch": epoch + 1,
                "train_loss": running_loss / len(train_loader),
                "train_acc": epoch_acc,
                "val_acc": val_acc
            })
            
            print(f"Epoch {epoch+1}: Train Acc: {epoch_acc:.2f}%, Val Acc: {val_acc:.2f}%")
        
        return segment_history
    
    def validate(self, val_loader):
        """Validate model"""
        self.model.eval()
        correct = 0
        total = 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(self.device), labels.to(self.device)
                outputs = self.model(inputs)
                _, predicted = outputs.max(1)
                total += labels.size(0)
                correct += predicted.eq(labels).sum().item()
        
        accuracy = 100. * correct / total
        return accuracy
    
    def run_incremental_training(self):
        """Run incremental training process"""
        print("🚀 Starting Incremental Training for MacBook Air")
        print("=" * 60)
        
        # Check if dataset exists
        if not os.path.exists(self.config["dataset_path"]):
            print(f"❌ Dataset not found at: {self.config['dataset_path']}")
            print("💡 Run the balanced_dataset_downloader.py first!")
            return
        
        # Get total dataset size
        try:
            temp_dataset = datasets.ImageFolder(self.config["dataset_path"])
            total_size = len(temp_dataset)
        except:
            print("❌ Could not load dataset!")
            return
        
        total_segments = (total_size + self.config["segment_size"] - 1) // self.config["segment_size"]
        
        print(f"📊 Dataset size: {total_size:,} images")
        print(f"🔢 Segment size: {self.config['segment_size']:,} images")
        print(f"📈 Total segments: {total_segments}")
        print(f"🎯 Current segment: {self.config['current_segment'] + 1}")
        
        while True:
            # Get current segment indices
            segment_indices = self.get_segment_indices(total_size)
            
            if segment_indices is None:
                print("✅ All segments completed!")
                break
            
            print(f"\n📦 Segment {self.config['current_segment'] + 1}/{total_segments}")
            print(f"📊 Training on images {segment_indices[0]}-{segment_indices[-1]}")
            
            # Ask user if they want to continue
            if self.config['current_segment'] > 0:
                response = input(f"\n⏸️  Continue with segment {self.config['current_segment'] + 1}? (y/n/q): ")
                if response.lower() == 'n':
                    print("⏸️  Training paused. Run again to continue.")
                    break
                elif response.lower() == 'q':
                    print("🛑 Training stopped.")
                    break
            
            # Backup model before training
            if self.config['current_segment'] > 0:
                self.backup_model()
            
            # Create data loaders for this segment
            train_loader, val_loader = self.create_data_loaders(segment_indices)
            
            # Train this segment
            start_time = time.time()
            segment_history = self.train_segment(train_loader, val_loader)
            training_time = time.time() - start_time
            
            # Update config
            self.config["current_segment"] += 1
            self.config["total_segments_completed"] += 1
            self.config["training_history"].extend(segment_history)
            
            # Save model
            torch.save(self.model.state_dict(), self.config["model_save_path"])
            
            # Save config
            self.save_config()
            
            print(f"⏱️  Segment completed in {training_time:.1f} seconds")
            print(f"💾 Model saved to: {self.config['model_save_path']}")
            
            # Memory cleanup
            if self.device.type == 'mps':
                torch.mps.empty_cache()
        
        print("\n🎉 Incremental training session completed!")
        print(f"📊 Total segments completed: {self.config['total_segments_completed']}")

def main():
    """Main function"""
    print("🎯 ForensicX Incremental Training for MacBook Air")
    print("=" * 50)
    
    trainer = IncrementalTrainer()
    
    print("\n📋 Training Options:")
    print("1. Start/Continue incremental training")
    print("2. Reset training (start from scratch)")
    print("3. Show training status")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        trainer.run_incremental_training()
    elif choice == "2":
        response = input("⚠️  Reset training? This will lose progress! (y/n): ")
        if response.lower() == 'y':
            trainer.config["current_segment"] = 0
            trainer.config["total_segments_completed"] = 0
            trainer.config["training_history"] = []
            trainer.save_config()
            print("🔄 Training reset!")
        trainer.run_incremental_training()
    elif choice == "3":
        print(f"\n📊 Training Status:")
        print(f"   Current segment: {trainer.config['current_segment']}")
        print(f"   Segments completed: {trainer.config['total_segments_completed']}")
        print(f"   Best accuracy: {trainer.config['best_accuracy']:.2f}%")
    else:
        print("❌ Invalid choice!")

if __name__ == "__main__":
    main()