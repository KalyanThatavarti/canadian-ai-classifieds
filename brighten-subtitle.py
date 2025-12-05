with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make section-subtitle brighter with better contrast
css = css.replace(
    '''.section-subtitle {
    font-size: 1.125rem;
    font-weight: var(--font-weight-regular);
    color: var(--text-light);
    text-align: center;
    margin-bottom: var(--spacing-lg);
}''',
    '''.section-subtitle {
    font-size: 1.125rem;
    font-weight: var(--font-weight-medium);
    color: var(--text-charcoal);
    text-align: center;
    margin-bottom: var(--spacing-lg);
}''')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Made section subtitle brighter!")
print("")
print("Changes:")
print("- Color: light gray -> dark charcoal (#333)")
print("- Font weight: 400 (regular) -> 500 (medium)")
print("- Much better visibility and contrast")
print("")
print("Refresh your browser to see the brighter subtitle!")
