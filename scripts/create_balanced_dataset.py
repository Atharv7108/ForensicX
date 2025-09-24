#!/usr/bin/env python3
"""
Deprecated: This script was used to build balanced dataset splits during model development.
Kept for reference; not required for running the app.
"""

import os
import shutil
import random
from pathlib import Path
import json
from PIL import Image
import numpy as np
from collections import defaultdict

def count_images_in_directory(directory):
    """Count images in a directory."""
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
                count += 1
    return count

def get_all_image_paths(directory):
    """Get all image paths from a directory."""
    image_paths = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
                image_paths.append(os.path.join(root, file))
    return image_paths

def create_balanced_splits(source_dirs, output_dir, samples_per_class=7000, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15):
    """
    Create balanced train/test/validation splits.
    
    Args:
        source_dirs: Dict of {class_name: source_directory}
        output_dir: Output directory for organized dataset
        samples_per_class: Number of samples to use per class
        train_ratio: Ratio for training set (0.7 = 70%)
        val_ratio: Ratio for validation set (0.15 = 15%)
        test_ratio: Ratio for test set (0.15 = 15%)
    """
    
    print("🎯 Creating balanced dataset splits...")
    print("=" * 60)
    
    # Calculate split sizes
    train_size = int(samples_per_class * train_ratio)
    val_size = int(samples_per_class * val_ratio)
    test_size = samples_per_class - train_size - val_size
    
    print(f"📊 Split Configuration:")
    print(f"   Samples per class: {samples_per_class:,}")
    print(f"   Train: {train_size:,} ({train_ratio:.1%})")
    print(f"   Validation: {val_size:,} ({val_ratio:.1%})")
    print(f"   Test: {test_size:,} ({test_ratio:.1%})")
    
    # Create output structure
    splits = ['train', 'val', 'test']
    for split in splits:
        for class_name in source_dirs.keys():
            split_dir = os.path.join(output_dir, split, class_name)
            os.makedirs(split_dir, exist_ok=True)
    
    dataset_info = {
        'total_samples': 0,
        'classes': {},
        'splits': {
            'train': {'total': 0, 'per_class': train_size},
            'val': {'total': 0, 'per_class': val_size},
            'test': {'total': 0, 'per_class': test_size}
        },
        'image_stats': {
            'sizes': defaultdict(int),
            'formats': defaultdict(int)
        }
    }
    
    # Process each class
    for class_name, source_dir in source_dirs.items():
        print(f"\n🔍 Processing: {class_name}")
        print(f"📁 Source: {source_dir}")
        
        # Get all image paths
        all_images = get_all_image_paths(source_dir)
        total_available = len(all_images)
        
        print(f"   Available images: {total_available:,}")
        
        if total_available < samples_per_class:
            print(f"   ⚠️  Warning: Only {total_available} images available, using all")
            selected_images = all_images
            # Recalculate splits for this class
            actual_train = int(total_available * train_ratio)
            actual_val = int(total_available * val_ratio)
            actual_test = total_available - actual_train - actual_val
        else:
            # Randomly sample images
            selected_images = random.sample(all_images, samples_per_class)
            actual_train, actual_val, actual_test = train_size, val_size, test_size
        
        # Shuffle for random distribution
        random.shuffle(selected_images)
        
        # Split images
        train_images = selected_images[:actual_train]
        val_images = selected_images[actual_train:actual_train + actual_val]
        test_images = selected_images[actual_train + actual_val:actual_train + actual_val + actual_test]
        
        # Copy images to respective folders
        splits_data = [
            ('train', train_images),
            ('val', val_images),
            ('test', test_images)
        ]
        
        class_stats = {'train': 0, 'val': 0, 'test': 0, 'total': 0}
        
        for split_name, image_list in splits_data:
            split_dir = os.path.join(output_dir, split_name, class_name)
            
            for i, src_path in enumerate(image_list):
                # Create new filename
                file_ext = os.path.splitext(src_path)[1]
                dst_filename = f"{class_name}_{split_name}_{i+1:05d}{file_ext}"
                dst_path = os.path.join(split_dir, dst_filename)
                
                # Copy file
                try:
                    shutil.copy2(src_path, dst_path)
                    class_stats[split_name] += 1
                    class_stats['total'] += 1
                    dataset_info['total_samples'] += 1
                    dataset_info['splits'][split_name]['total'] += 1
                    
                    # Collect image stats
                    try:
                        with Image.open(dst_path) as img:
                            size_key = f"{img.width}x{img.height}"
                            dataset_info['image_stats']['sizes'][size_key] += 1
                            dataset_info['image_stats']['formats'][img.format] += 1
                    except Exception as e:
                        print(f"   Warning: Could not read image stats for {dst_filename}: {e}")
                        
                except Exception as e:
                    print(f"   Error copying {src_path}: {e}")
            
            print(f"   ✅ {split_name}: {len(image_list):,} images copied")
        
        dataset_info['classes'][class_name] = class_stats
    
    # Save dataset info
    info_path = os.path.join(output_dir, 'dataset_info.json')
    with open(info_path, 'w') as f:
        json.dump(dataset_info, f, indent=2, default=str)
    
    # Create dataset summary
    create_dataset_summary(output_dir, dataset_info)
    
    print(f"\n🎉 Dataset creation completed!")
    print(f"📁 Output directory: {output_dir}")
    print(f"📊 Total samples: {dataset_info['total_samples']:,}")

def create_dataset_summary(output_dir, dataset_info):
    """Create a summary file with dataset statistics."""
    summary_path = os.path.join(output_dir, 'DATASET_SUMMARY.md')
    
    with open(summary_path, 'w') as f:
        f.write("# ForensicX Dataset Summary\n\n")
        f.write(f"**Total Samples**: {dataset_info['total_samples']:,}\n")
        f.write(f"**Classes**: {len(dataset_info['classes'])}\n")
        f.write(f"**Created**: {Path.cwd().name} project\n\n")
        
        f.write("## Dataset Structure\n")
        f.write("```\n")
        f.write("forensicx_dataset/\n")
        f.write("├── train/\n")
        f.write("│   ├── ai_generated/\n")
        f.write("│   ├── natural/\n")
        f.write("│   └── ai_enhanced/\n")
        f.write("├── val/\n")
        f.write("│   ├── ai_generated/\n")
        f.write("│   ├── natural/\n")
        f.write("│   └── ai_enhanced/\n")
        f.write("├── test/\n")
        f.write("│   ├── ai_generated/\n")
        f.write("│   ├── natural/\n")
        f.write("│   └── ai_enhanced/\n")
        f.write("├── dataset_info.json\n")
        f.write("└── DATASET_SUMMARY.md\n")
        f.write("```\n\n")
        
        f.write("## Split Distribution\n\n")
        for split_name, split_data in dataset_info['splits'].items():
            f.write(f"### {split_name.title()} Set\n")
            f.write(f"- **Total**: {split_data['total']:,} images\n")
            for class_name, class_data in dataset_info['classes'].items():
                f.write(f"- **{class_name}**: {class_data[split_name]:,} images\n")
            f.write("\n")
        
        f.write("## Class Distribution\n\n")
        for class_name, class_data in dataset_info['classes'].items():
            f.write(f"### {class_name}\n")
            f.write(f"- **Total**: {class_data['total']:,} images\n")
            f.write(f"- **Train**: {class_data['train']:,} images\n")
            f.write(f"- **Validation**: {class_data['val']:,} images\n")
            f.write(f"- **Test**: {class_data['test']:,} images\n\n")
        
        f.write("## Image Statistics\n\n")
        f.write("### Most Common Sizes\n")
        sorted_sizes = sorted(dataset_info['image_stats']['sizes'].items(), 
                            key=lambda x: x[1], reverse=True)[:10]
        for size, count in sorted_sizes:
            f.write(f"- **{size}**: {count:,} images\n")
        
        f.write("\n### Formats\n")
        for format_name, count in dataset_info['image_stats']['formats'].items():
            f.write(f"- **{format_name}**: {count:,} images\n")
        
        f.write("\n## Training Recommendations\n\n")
        f.write("- **Batch Size**: 32-64 (MacBook Air optimized)\n")
        f.write("- **Input Size**: 224x224 or 299x299 (EfficientNet standard)\n")
        f.write("- **Augmentation**: Recommended for training set\n")
        f.write("- **Normalization**: ImageNet statistics\n")
        f.write("- **Learning Rate**: 1e-4 to 1e-3 (start conservative)\n")

def main():
    """Main function to create the balanced dataset."""
    
    # Set random seed for reproducibility
    random.seed(42)
    np.random.seed(42)
    
    print("🚀 ForensicX Dataset Organization")
    print("=" * 60)
    
    # Define source directories
    source_dirs = {
        'ai_generated': 'datasets_balanced/ai_generated',
        'natural': 'datasets_balanced/natural',
        'ai_enhanced': 'datasets_balanced/ai_enhanced'
    }
    
    # Output directory
    output_dir = 'forensicx_dataset'
    
    # Check if source directories exist
    print("📁 Checking source directories...")
    for class_name, source_dir in source_dirs.items():
        if os.path.exists(source_dir):
            count = count_images_in_directory(source_dir)
            print(f"   ✅ {class_name}: {count:,} images")
        else:
            print(f"   ❌ {class_name}: Directory not found - {source_dir}")
            return
    
    # Create balanced dataset
    create_balanced_splits(
        source_dirs=source_dirs,
        output_dir=output_dir,
        samples_per_class=7000,  # Use 7K per class for balance
        train_ratio=0.7,         # 70% training
        val_ratio=0.15,          # 15% validation
        test_ratio=0.15          # 15% testing
    )
    
    print(f"\n💡 Next Steps:")
    print(f"   1. Review dataset in: {output_dir}/")
    print(f"   2. Check summary: {output_dir}/DATASET_SUMMARY.md")
    print(f"   3. Use this structure for training!")
    print(f"   4. Training script will automatically find train/val/test folders")

if __name__ == "__main__":
    main()