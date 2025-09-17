import os
from fpdf import FPDF
from PIL import Image

def create_pdf_with_images(image_paths, output_pdf):
    pdf = FPDF()
    for img_path in image_paths:
        try:
            # Validate and auto-fix image
            with Image.open(img_path) as cover:
                cover = cover.convert("RGB")
                temp_fixed_path = None
                # Save to temp file as JPEG to ensure compatibility
                temp_fixed_path = img_path + "_temp_for_pdf.jpg"
                cover.save(temp_fixed_path, format="JPEG")
                width, height = cover.size
                width, height = float(width * 0.264583), float(height * 0.264583)
                pdf.add_page()
                pdf.image(temp_fixed_path, 0, 0, width, height)
        except Exception as e:
            print(f"Skipping {img_path}: {e}")
            continue
        finally:
            # Clean up temp file if created
            if 'temp_fixed_path' in locals() and temp_fixed_path and os.path.exists(temp_fixed_path):
                os.remove(temp_fixed_path)
    pdf.output(output_pdf, "F")

if __name__ == "__main__":
    # Example: use logo.png and any other images in the workspace
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    images = [
        os.path.join(base_dir, "logo.png"),
    ]
    # Add more images if available
    for fname in os.listdir(base_dir):
        if fname.lower().endswith(('.png', '.jpg', '.jpeg')) and fname != "logo.png":
            images.append(os.path.join(base_dir, fname))
    output_pdf = os.path.join(base_dir, "sample_with_multiple_images.pdf")
    create_pdf_with_images(images, output_pdf)
    print(f"PDF created: {output_pdf}")