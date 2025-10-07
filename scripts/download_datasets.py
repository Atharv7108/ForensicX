#!/usr/bin/env python3
"""
Download diverse datasets for AI vs Natural image classification
"""

import os
import requests
import zipfile
import tarfile
from pathlib import Path
import shutil
from tqdm import tqdm

def download_file(url, local_filename):
    """Download a file with progress bar."""
    print(f"📥 Downloading: {local_filename}")
    
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        total_size = int(r.headers.get('content-length', 0))
        
        with open(local_filename, 'wb') as f:
            with tqdm(total=total_size, unit='B', unit_scale=True) as pbar:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))
    
    print(f"✅ Downloaded: {local_filename}")

def setup_dataset_directories():
    """Create dataset directory structure."""
    base_dir = "datasets_fresh"
    
    categories = [
        "natural/real_photos",
        "natural/photography", 
        "ai_generated/dalle",
        "ai_generated/midjourney",
        "ai_generated/stable_diffusion",
        "ai_enhanced/upscaled",
        "ai_enhanced/filtered",
        "ai_enhanced/stylized"
    ]
    
    for category in categories:
        os.makedirs(f"{base_dir}/{category}", exist_ok=True)
    
    return base_dir

def download_sample_datasets():
    """Download sample datasets for training."""
    
    base_dir = setup_dataset_directories()
    
    # Sample dataset sources (you'll need to replace with actual URLs)
    datasets = {
        "natural_images": {
            "url": "https://www.kaggle.com/datasets/prasunroy/natural-images",
            "description": "Natural photography dataset",
            "category": "natural"
        },
        "ai_generated_art": {
            "url": "https://huggingface.co/datasets/poloclub/diffusiondb", 
            "description": "AI-generated images from various models",
            "category": "ai_generated"
        }
    }
    
    print("🎯 Setting up fresh dataset collection...")
    print("=" * 60)
    
    # Note: This is a template - you'll need actual dataset URLs
    print("📋 Dataset Collection Plan:")
    print("1. Natural Images:")
    print("   - COCO dataset (real photos)")
    print("   - Unsplash photos")
    print("   - Flickr commons")
    print()
    print("2. AI Generated:")
    print("   - DALL-E generated images")
    print("   - Midjourney outputs")
    print("   - Stable Diffusion samples")
    print()
    print("3. AI Enhanced:")
    print("   - Upscaled images")
    print("   - Style-transferred photos")
    print("   - AI-filtered content")
    
    return base_dir

def create_manual_collection_guide():
    """Create a guide for manual dataset collection."""
    
    guide_content = """# ForensicX Dataset Collection Guide

## 🎯 Goal: Balanced Multi-Class Image Dataset

### Target Distribution:
- **Natural Images**: 10,000+ samples
- **AI Generated**: 10,000+ samples  
- **AI Enhanced**: 10,000+ samples

## 📁 Collection Sources

### Natural Images (Real Photos)
1. **COCO Dataset**: http://cocodataset.org/
   - Download: http://images.cocodataset.org/zips/train2017.zip
   - Category: Real photography

2. **Unsplash Dataset**: https://unsplash.com/data
   - High-quality photography
   - Diverse subjects and styles

3. **Open Images**: https://storage.googleapis.com/openimages/web/index.html
   - Google's image dataset
   - Creative Commons licensed

### AI Generated Images
1. **DiffusionDB**: https://huggingface.co/datasets/poloclub/diffusiondb
   - Large collection of Stable Diffusion outputs
   - Various prompts and styles

2. **LAION-Aesthetics**: https://laion.ai/blog/laion-aesthetics/
   - AI-generated aesthetic images
   - High-quality samples

3. **Generated.photos**: https://generated.photos/
   - AI-generated human faces
   - Consistent quality

### AI Enhanced Images
1. **Real-ESRGAN Samples**: Create by upscaling natural images
2. **Style Transfer Results**: Apply neural style transfer to photos
3. **AI Filters**: Use apps like Prisma, FaceApp on natural photos

## 🔧 Collection Commands

### 1. Download COCO (Natural)
```bash
mkdir -p datasets_fresh/natural
cd datasets_fresh/natural
wget http://images.cocodataset.org/zips/train2017.zip
unzip train2017.zip
```

### 2. Download DiffusionDB (AI Generated)  
```bash
# Using Hugging Face datasets
pip install datasets
python -c "
from datasets import load_dataset
dataset = load_dataset('poloclub/diffusiondb', '2m_random_1k')
# Process and save images
"
```

### 3. Create AI Enhanced
```bash
# Install Real-ESRGAN for upscaling
pip install realesrgan
# Apply to subset of natural images
```

## 📊 Quality Checks
- Resolution: 224x224 minimum
- Format: JPG/PNG
- Quality: No corrupted files
- Balance: Equal samples per class
- Diversity: Various subjects, styles, and sources

## 🚀 Next Steps
1. Run collection scripts
2. Verify data quality  
3. Create balanced splits
4. Train new model
5. Evaluate performance
"""
    
    with open("DATASET_COLLECTION_GUIDE.md", "w") as f:
        f.write(guide_content)
    
    print("📋 Created: DATASET_COLLECTION_GUIDE.md")
    print("   Follow this guide to collect diverse training data")

def main():
    """Main dataset download orchestrator."""
    
    print("🔄 ForensicX Dataset Refresh")
    print("=" * 50)
    
    # Create manual collection guide
    create_manual_collection_guide()
    
    # Setup directories
    base_dir = setup_dataset_directories()
    print(f"✅ Created directory structure: {base_dir}/")
    
    print("\n💡 Next Steps:")
    print("1. Follow DATASET_COLLECTION_GUIDE.md")
    print("2. Collect diverse images from multiple sources")
    print("3. Run create_balanced_dataset.py for splits")
    print("4. Train model with train.py")

if __name__ == "__main__":
    main()