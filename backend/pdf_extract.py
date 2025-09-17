import fitz  # PyMuPDF
import os

def extract_text_and_images(pdf_path, images_dir="extracted_images"):
    doc = fitz.open(pdf_path)
    text = ""
    images = []
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)
    for page_num in range(len(doc)):
        page = doc[page_num]
        text += page.get_text()
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = f"page{page_num+1}_img{img_index+1}.{image_ext}"
            image_path = os.path.join(images_dir, image_filename)
            with open(image_path, "wb") as img_file:
                img_file.write(image_bytes)
            images.append(image_path)
    return text, images

if __name__ == "__main__":
    # Example usage
    pdf_file = "sample.pdf"  # Replace with your PDF file path
    text, images = extract_text_and_images(pdf_file)
    print("Extracted text:\n", text[:500], "...\n")
    print("Extracted images:", images)
