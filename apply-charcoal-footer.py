with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Update footer background and styling
css = css.replace(
    '''.footer {
    background: linear-gradient(180deg, transparent 0%, rgba(74, 144, 226, 0.03) 100%);
    padding: var(--spacing-xl) 0 var(--spacing-md);
    margin-top: var(--spacing-xxl);
    border-top: 1px solid rgba(74, 144, 226, 0.1);
}''',
    '''.footer {
    background: #1a1a1a;
    padding: var(--spacing-xl) 0 var(--spacing-md);
    margin-top: 0;
    border-top: 3px solid var(--blue-primary);
}''')

# Update footer title color for contrast
css = css.replace(
    '''.footer-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--text-charcoal);
    margin-bottom: var(--spacing-sm);
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--blue-primary);
    display: inline-block;
}''',
    '''.footer-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    color: #ffffff;
    margin-bottom: var(--spacing-sm);
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--blue-primary);
    display: inline-block;
}''')

# Update footer links color
css = css.replace(
    '''.footer-links a {
    color: var(--text-light);
    text-decoration: none;
    font-size: 0.95rem;
    transition: all var(--transition-fast);
}

.footer-links a:hover {
    color: var(--blue-primary);
    padding-left: 0.25rem;
}''',
    '''.footer-links a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.95rem;
    transition: all var(--transition-fast);
}

.footer-links a:hover {
    color: #ffffff;
    padding-left: 0.25rem;
}''')

# Update footer bottom border
css = css.replace(
    '''.footer-bottom {
    text-align: center;
    padding-top: var(--spacing-lg);
    border-top: 1px solid rgba(74, 144, 226, 0.1);
    margin-top: var(--spacing-lg);
}''',
    '''.footer-bottom {
    text-align: center;
    padding-top: var(--spacing-lg);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: var(--spacing-lg);
}''')

# Update copyright text color
css = css.replace(
    '''.footer-copyright {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: 0.5rem;
}''',
    '''.footer-copyright {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 0.5rem;
}''')

# Update footer badge color
css = css.replace(
    '''.footer-badge {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold);
    color: var(--text-charcoal);
}''',
    '''.footer-badge {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold);
    color: #ffffff;
}''')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Applied deep charcoal footer design!")
print("")
print("Changes:")
print("- Background: Deep charcoal (#1a1a1a)")
print("- Top border: Blue accent (3px)")
print("- Titles: Pure white")
print("- Links: Light gray (70% opacity) -> white on hover")
print("- Copyright: Subtle white (60% opacity)")
print("- Badge: Pure white")
print("")
print("Refresh your browser to see the sleek new footer!")
