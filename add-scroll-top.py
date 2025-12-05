with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add scroll-to-top script before other scripts
html = html.replace(
    '<script src="js/firebase-config.js"></script>',
    '<script src="js/scroll-to-top.js"></script>\n    <script src="js/firebase-config.js"></script>'
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Added scroll-to-top on page refresh!")
print("")
print("Features:")
print("- Always scrolls to top when you refresh")
print("- Works from any position on the page")
print("- Disables browser scroll position restoration")
print("- Multiple fallbacks for different browsers")
print("")
print("Refresh your browser - it will always start at the top!")
