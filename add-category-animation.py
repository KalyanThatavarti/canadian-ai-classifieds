with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add the slide-in-right-down animation at the end before responsive section
animation_css = '''
/* Slide In Right Down Animation for Category Title */
.slide-in-right-down {
    opacity: 0;
    transform: translate(100px, -50px);
    transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-in-right-down.animate {
    opacity: 1;
    transform: translate(0, 0);
}
'''

# Insert before the responsive section
css = css.replace('/* ===== Responsive Design ===== */', animation_css + '\n/* ===== Responsive Design ===== */')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Update index.html to add the script
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add the script before closing body tag
html = html.replace(
    '<script src="js/hero-slider.js"></script>',
    '<script src="js/hero-slider.js"></script>\n    <script src="js/category-title-animation.js"></script>'
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Added gliding slide-in animation for 'Popular Categories Across Canada'!")
print("")
print("Animation details:")
print("- Slides from top-right (100px right, 50px up)")
print("- Glides down to final position")
print("- Smooth bouncy easing (cubic-bezier)")
print("- 1 second duration")
print("- Triggers when scrolled into view")
print("")
print("Refresh your browser and scroll down to see the effect!")
