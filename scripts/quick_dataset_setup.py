#!/usr/bin/env python3
"""
Quick dataset collection from online sources for immediate training
"""

import os
import requests
import random
from pathlib import Path
import time
from PIL import Image
import io

class QuickDatasetCollector:
    def __init__(self, base_dir="datasets_quick"):
        self.base_dir = base_dir
        self.setup_directories()
        
    def setup_directories(self):
        """Setup directory structure."""
        categories = ["natural", "ai_generated", "ai_enhanced"]
        
        for category in categories:
            os.makedirs(f"{self.base_dir}/{category}", exist_ok=True)
            
    def download_unsplash_images(self, query, count=100, category="natural"):
        """Download images from Unsplash API (requires API key)."""
        
        # Note: You need to sign up for Unsplash API and get an access key
        access_key = "YOUR_UNSPLASH_ACCESS_KEY"  # Replace with actual key
        
        if access_key == "YOUR_UNSPLASH_ACCESS_KEY":
            print("⚠️  Unsplash API key needed. Sign up at https://unsplash.com/developers")
            return
            
        print(f"📥 Downloading {count} '{query}' images from Unsplash...")
        
        for i in range(count):
            try:
                # Random photo API
                url = f"https://api.unsplash.com/photos/random"
                params = {
                    'query': query,
                    'orientation': 'landscape',
                    'client_id': access_key
                }
                
                response = requests.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    image_url = data['urls']['regular']
                    
                    # Download image
                    img_response = requests.get(image_url)
                    if img_response.status_code == 200:
                        # Save image
                        filename = f"{category}_{query}_{i+1:04d}.jpg"
                        filepath = f"{self.base_dir}/{category}/{filename}"
                        
                        with open(filepath, 'wb') as f:
                            f.write(img_response.content)
                            
                        print(f"   ✅ Downloaded: {filename}")
                        
                # Rate limiting
                time.sleep(1)
                        
            except Exception as e:
                print(f"   ❌ Error downloading image {i+1}: {e}")
                
    def create_ai_enhanced_samples(self, source_dir="datasets_quick/natural", count=50):
        """Create AI-enhanced samples by applying filters to natural images."""
        
        try:
            from PIL import ImageFilter, ImageEnhance
            
            natural_images = list(Path(source_dir).glob("*.jpg"))
            if not natural_images:
                print("❌ No natural images found to enhance")
                return
                
            print(f"🎨 Creating {count} AI-enhanced samples...")
            
            for i in range(min(count, len(natural_images))):
                source_path = random.choice(natural_images)
                
                try:
                    with Image.open(source_path) as img:
                        # Apply various enhancements
                        enhanced = img.copy()
                        
                        # Random enhancement
                        enhancement_type = random.choice(['blur', 'sharpen', 'brightness', 'contrast'])
                        
                        if enhancement_type == 'blur':
                            enhanced = enhanced.filter(ImageFilter.GaussianBlur(radius=2))
                        elif enhancement_type == 'sharpen':
                            enhanced = enhanced.filter(ImageFilter.SHARPEN)
                        elif enhancement_type == 'brightness':
                            enhancer = ImageEnhance.Brightness(enhanced)
                            enhanced = enhancer.enhance(1.5)
                        elif enhancement_type == 'contrast':
                            enhancer = ImageEnhance.Contrast(enhanced)
                            enhanced = enhancer.enhance(1.3)
                        
                        # Save enhanced image
                        filename = f"enhanced_{enhancement_type}_{i+1:04d}.jpg"
                        save_path = f"{self.base_dir}/ai_enhanced/{filename}"
                        enhanced.save(save_path, quality=90)
                        
                        print(f"   ✅ Created: {filename}")
                        
                except Exception as e:
                    print(f"   ❌ Error enhancing {source_path}: {e}")
                    
        except ImportError:
            print("❌ PIL/Pillow required for image enhancement")
            
    def create_sample_dataset(self):
        """Create a quick sample dataset for immediate testing."""
        
        print("🚀 Creating Quick Sample Dataset")
        print("=" * 50)
        
        # Sample image URLs (public domain / creative commons)
        sample_images = {
            "natural": [
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",  # Mountain
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",  # Forest
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",  # Ocean
            ],
            "ai_generated": [
                # Note: You'll need to find actual AI-generated image URLs
                # These are placeholders
            ]
        }
        
        # Download sample images
        for category, urls in sample_images.items():
            print(f"📁 Processing {category} images...")
            
            for i, url in enumerate(urls):
                try:
                    response = requests.get(url)
                    if response.status_code == 200:
                        filename = f"{category}_sample_{i+1:03d}.jpg"
                        filepath = f"{self.base_dir}/{category}/{filename}"
                        
                        with open(filepath, 'wb') as f:
                            f.write(response.content)
                            
                        print(f"   ✅ Downloaded: {filename}")
                        
                except Exception as e:
                    print(f"   ❌ Error downloading from {url}: {e}")
        
        # Create enhanced samples
        self.create_ai_enhanced_samples(count=20)
        
        print("\n📊 Dataset Summary:")
        for category in ["natural", "ai_generated", "ai_enhanced"]:
            count = len(list(Path(f"{self.base_dir}/{category}").glob("*.jpg")))
            print(f"   {category}: {count} images")

def create_manual_collection_instructions():
    """Create instructions for manual dataset collection."""
    
    instructions = """# Quick Manual Dataset Collection

## 🎯 Immediate Action Plan

### Step 1: Natural Images (Real Photos)
1. **Download from Pixabay** (free, no API needed):
   - Go to https://pixabay.com/
   - Search: "landscape", "portrait", "nature", "city"
   - Download 100-200 high-quality photos
   - Save to: `datasets_quick/natural/`

2. **Download from Pexels**:
   - Go to https://pexels.com/
   - Search similar terms
   - Download another 100-200 photos
   - Mix different subjects and styles

### Step 2: AI Generated Images
1. **Use AI Image Generators** (free options):
   - **Bing Image Creator**: https://www.bing.com/images/create
   - **Craiyon**: https://www.craiyon.com/
   - **Leonardo.ai**: https://leonardo.ai/ (free tier)
   
2. **Generate Prompts**:
   - "Photo realistic portrait of a person"
   - "Landscape painting in digital art style"
   - "Abstract artistic composition"
   - "Realistic looking photograph of architecture"

3. **Download Process**:
   - Generate 50-100 different images
   - Use varied prompts for diversity
   - Save to: `datasets_quick/ai_generated/`

### Step 3: AI Enhanced Images
1. **Use AI Upscaling Tools**:
   - **Waifu2x**: https://waifu2x.udp.jp/
   - **Real-ESRGAN Online**: Various online tools
   
2. **Process Natural Images**:
   - Take 50 images from your natural collection
   - Upscale them using AI tools
   - Apply AI filters/enhancements
   - Save to: `datasets_quick/ai_enhanced/`

### Step 4: Quick Verification
```bash
# Check your collection
find datasets_quick -name "*.jpg" | wc -l  # Total count
ls -la datasets_quick/*/                   # Per category count
```

### Step 5: Train Immediately
```bash
# Create splits and train
python scripts/create_balanced_dataset.py
python scripts/train_enhanced.py
```

## 🚀 Target Numbers (Minimum for Testing)
- **Natural**: 200+ images
- **AI Generated**: 200+ images  
- **AI Enhanced**: 200+ images
- **Total**: 600+ images (minimum viable dataset)

## ⚡ Speed Tips
1. Use batch download tools for Pixabay/Pexels
2. Generate AI images in batches
3. Use command-line tools where possible
4. Focus on variety over quantity initially

## 🎯 Quality Checklist
- [ ] Images are at least 224x224 pixels
- [ ] No corrupted/broken images
- [ ] Good variety in subjects and styles
- [ ] Roughly equal numbers per category
- [ ] Clear distinction between categories
"""
    
    with open("QUICK_COLLECTION_GUIDE.md", "w") as f:
        f.write(instructions)
    
    print("📋 Created: QUICK_COLLECTION_GUIDE.md")

def main():
    """Main function for quick dataset setup."""
    
    print("⚡ Quick Dataset Collection Setup")
    print("=" * 50)
    
    # Create collector
    collector = QuickDatasetCollector()
    
    # Create manual instructions
    create_manual_collection_instructions()
    
    # Check if we can create sample dataset
    create_sample = input("\n🤔 Create sample dataset now? (y/n): ").lower().strip() == 'y'
    
    if create_sample:
        collector.create_sample_dataset()
    
    print("\n💡 Next Steps:")
    print("1. Follow QUICK_COLLECTION_GUIDE.md for manual collection")
    print("2. Collect 200+ images per category minimum")
    print("3. Run: python scripts/create_balanced_dataset.py")
    print("4. Run: python scripts/train_enhanced.py")
    print("5. Test new model in the app!")

if __name__ == "__main__":
    main()