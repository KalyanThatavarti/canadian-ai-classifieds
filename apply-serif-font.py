import re

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update Google Fonts link to include Playfair Display (serif font)
html = re.sub(
    r'family=Inter:wght@300;400;500;600;700;800',
    'family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Read main styles.css
with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add serif font variable
css = re.sub(
    r"(--font-family: 'Inter'[^;]+;)",
    r"\1\n    --font-family-serif: 'Playfair Display', Georgia, serif;",
    css
)

# Update section titles and hero heading to use serif font
css = re.sub(
    r'(\.section-title\s*{[^}]*font-weight:[^;]+;)',
    r'\1\n    font-family: var(--font-family-serif);',
    css
)

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Update hero-slider.css to use serif for heading
with open('css/hero-slider.css', 'r', encoding='utf-8') as f:
    hero_css = f.read()

hero_css = hero_css.replace(
    '/* Hero Heading */',
    "/* Hero Heading */\n/* Uses elegant serif font like Element Cannabis */"
)

hero_css = re.sub(
    r'(\.hero-heading\s*{[^}]*)',
    r"\1\n    font-family: 'Playfair Display', Georgia, serif;",
    hero_css
)

with open('css/hero-slider.css', 'w', encoding='utf-8') as f:
    f.write(hero_css)

print("Added Playfair Display serif font!")
print("Updated:")
print("- HTML: Added Google Font link")
print("- Main CSS: Added serif variable + applied to section titles")  
print("- Hero CSS: Applied serif to hero heading")
print("\nRefresh your browser to see elegant serif headlines!")
