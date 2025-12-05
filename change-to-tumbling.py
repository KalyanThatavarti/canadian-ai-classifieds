with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Remove old animation
css = css.replace('''
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
''', '')

# Add tumbling animation
tumbling_css = '''
/* Tumbling Animation for Category Title */
.slide-in-right-down {
    opacity: 0;
    display: inline-block;
}

.slide-in-right-down.animate {
    animation: tumbleIn 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

@keyframes tumbleIn {
    0% {
        opacity: 0;
        transform: translateX(200px) translateY(-100px) rotate(180deg) scale(0.3);
    }
    60% {
        opacity: 1;
        transform: translateX(-20px) translateY(10px) rotate(-10deg) scale(1.1);
    }
    80% {
        transform: translateX(10px) translateY(-5px) rotate(5deg) scale(0.95);
    }
    100% {
        opacity: 1;
        transform: translateX(0) translateY(0) rotate(0deg) scale(1);
    }
}
'''

# Insert before responsive section
css = css.replace('/* ===== Responsive Design ===== */', tumbling_css + '\n/* ===== Responsive Design ===== */')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Changed to TUMBLING effect!")
print("")
print("Animation:")
print("- Text spins 180 degrees while tumbling in")
print("- Comes from top-right (200px right, 100px up)")
print("- Bounces and wobbles before settling")
print("- Scales from small (0.3x) to normal size")
print("- 1.2 second duration with elastic easing")
print("")
print("Refresh your browser and scroll to categories - it will tumble in!")
