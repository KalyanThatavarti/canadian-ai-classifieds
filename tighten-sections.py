with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Reduce section padding from 6rem (var(--spacing-xxl)) to 3rem
css = css.replace(
    '''.section {
    padding: var(--spacing-xxl) 0;
    position: relative;
}''',
    '''.section {
    padding: var(--spacing-lg) 0;
    position: relative;
}''')

# Also reduce the top padding specifically to bring sections closer
# Add reduced spacing between sections
additional_css = '''
/* Tighter section spacing for better flow */
.section + .section {
    padding-top: var(--spacing-md);
}
'''

# Insert before responsive section
css = css.replace('/* ===== Responsive Design ===== */', additional_css + '\n/* ===== Responsive Design ===== */')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Reduced spacing between all sections!")
print("")
print("Changes:")
print("- Section padding: 6rem -> 3rem (50% reduction)")
print("- Adjacent sections: Even tighter spacing (2rem)")
print("- All sections now sit closer together")
print("- Creates a more compact, cohesive layout")
print("")
print("Refresh your browser to see the tighter layout!")
