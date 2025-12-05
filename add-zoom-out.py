with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add zoom-out animation CSS
zoom_css = '''
/* Zoom Out Animation for Listings Title */
.zoom-out-effect {
    opacity: 0;
}

.zoom-out-effect.animate {
    animation: zoomOut 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes zoomOut {
    0% {
        opacity: 0;
        transform: scale(3) translateY(-20px);
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

# Insert before tumbling animation
css = css.replace('/* Tumbling Animation for Category Title */', zoom_css + '\n/* Tumbling Animation for Category Title */')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Added zoom-out effect to 'Find Deals Near You'!")
print("")
print("Animation:")
print("- Starts at 3x normal size (300%)")
print("- Zooms out smoothly to normal size")
print("- Fades in while zooming")
print("- 1 second duration with smooth easing")
print("")
print("Refresh your browser and scroll to see the zoom-out effect!")
