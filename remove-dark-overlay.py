with open('css/hero-slider.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the dark overlay with a light one
content = content.replace(
    'rgba(0, 0, 0, 0.85)',
    'rgba(0, 0, 0, 0.15)'
).replace(
    'rgba(0, 0, 0, 0.6)',
    'rgba(0, 0, 0, 0.05)'
)

with open('css/hero-slider.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed dark shading from hero banner!")
print("Refresh your browser to see the changes.")
