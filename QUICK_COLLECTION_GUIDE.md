# Quick Manual Dataset Collection

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
