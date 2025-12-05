with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add zoom-in animation CSS (opposite of zoom-out)
zoom_in_css = '''
/* Zoom In Animation for Safety Title */
.zoom-in-effect {
    opacity: 0;
}

.zoom-in-effect.animate {
    animation: zoomIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes zoomIn {
    0% {
        opacity: 0;
        transform: scale(0.3) translateY(20px);
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
'''

# Insert before zoom-out animation
css = css.replace('/* Zoom Out Animation for Listings Title */', zoom_in_css + '\n/* Zoom Out Animation for Listings Title */')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Changed 'A Safer Marketplace for Canadians' to zoom-in effect!")
print("")
print("Animation:")
print("- Starts at 30% normal size (small)")
print("- Zooms IN smoothly to normal size")
print("- Fades in while zooming")
print("- 1 second duration")
print("")
print("Now you have 3 different effects:")
print("- Popular Categories: Tumbles (spin)")
print("- Safer Marketplace: Zooms IN (small to normal)")
print("- Find Deals: Zooms OUT (large to normal)")
print("")
print("Refresh your browser to see all 3 unique animations!")
