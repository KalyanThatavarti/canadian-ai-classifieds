with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Fix the centering issue - remove inline-block and add proper centering
css = css.replace('''/* Tumbling Animation for Category Title */
.slide-in-right-down {
    opacity: 0;
    display: inline-block;
}''', '''/* Tumbling Animation for Category Title */
.slide-in-right-down {
    opacity: 0;
}''')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Fixed! The text will now be centered after tumbling.")
print("Refresh your browser to see it tumble into the center!")
