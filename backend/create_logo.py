from PIL import Image, ImageDraw, ImageFont

# Create a blank image with white background
img = Image.new('RGB', (200, 80), color = (255, 255, 255))
d = ImageDraw.Draw(img)

# Draw a simple rectangle and some text
rectangle_color = (0, 120, 255)
d.rectangle([10, 10, 190, 70], outline=rectangle_color, width=4)

# Add text (use default font)
d.text((40, 30), "LOGO", fill=rectangle_color)

# Save as logo.png
img.save("logo.png")
print("logo.png created in backend/ directory.")
