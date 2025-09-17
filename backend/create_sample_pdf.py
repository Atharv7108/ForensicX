from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="This is a test PDF for AI detection.", ln=True, align='L')
pdf.cell(200, 10, txt="You can use this file to test the /detect-pdf endpoint.", ln=True, align='L')
pdf.output("sample.pdf")
print("sample.pdf created.")
