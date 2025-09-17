from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="This PDF contains an image below.", ln=True, align='L')

# Add an image (use a small placeholder image from the web or local)
# You can use any small PNG/JPG in your backend/ directory, e.g., logo.png
try:
    pdf.image("logo.png", x=10, y=30, w=50)  # Make sure logo.png exists in backend/
except RuntimeError:
    print("logo.png not found. Please add an image named 'logo.png' in backend/ to test image extraction.")

pdf.output("sample_with_image.pdf")
print("sample_with_image.pdf created.")
