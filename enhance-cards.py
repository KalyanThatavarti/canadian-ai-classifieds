with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Enhance glass cards (How It Works section)
css = css.replace(
    '''    box-shadow: 0 8px 32px var(--shadow-light);
    transition: all var(--transition-medium);
}

.glass-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 48px var(--shadow-hover);
    background: rgba(255, 255, 255, 0.85);
}''',
    '''    box-shadow: 0 8px 32px var(--shadow-light);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 20px 60px rgba(74, 144, 226, 0.35), 0 0 0 1px rgba(74, 144, 226, 0.2);
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(74, 144, 226, 0.3);
}''')

# Enhance category tiles
css = css.replace(
    '''    cursor: pointer;
}

.category-tile:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 12px 32px var(--shadow-hover);
    background: rgba(255, 255, 255, 0.95);
    border-color: var(--blue-primary);
}''',
    '''    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.category-tile::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.1), transparent);
    transition: left 0.5s ease;
}

.category-tile:hover::before {
    left: 100%;
}

.category-tile:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 16px 48px rgba(74, 144, 226, 0.4), 0 0 0 2px var(--blue-primary);
    background: rgba(255, 255, 255, 1);
    border-color: var(--blue-primary);
}

.category-tile:hover .category-icon {
    transform: scale(1.15) rotate(5deg);
}''')

# Add transform transition to category icon
css = css.replace(
    '''.category-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
    display: block;
}''',
    '''.category-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
    display: block;
    transition: transform 0.3s ease;
}''')

# Enhance listing cards
css = css.replace(
    '''    cursor: pointer;
}

.listing-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px var(--shadow-hover);
}''',
    '''    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.listing-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.listing-card:hover {
    transform: translateY(-12px) scale(1.03);
    box-shadow: 0 20px 50px rgba(74, 144, 226, 0.35), 0 0 0 1px rgba(74, 144, 226, 0.2);
}

.listing-card:hover::after {
    opacity: 1;
}

.listing-card:hover .listing-badge {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0 .2);
}''')

# Add transform to listing badge
css = css.replace(
    '''    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}''',
    '''    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all 0.3s ease;
}''')

# Enhance safety feature cards
css = css.replace(
    '''.safety-feature:hover {
    background: rgba(255, 255, 255, 0.85);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px var(--shadow-light);
    border-color: var(--blue-primary);
}''',
    '''.safety-feature:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 32px rgba(74, 144, 226, 0.3), 0 0 0 1px var(--blue-primary);
    border-color: var(--blue-primary);
}

.safety-feature:hover .feature-icon {
    transform: scale(1.2) rotate(5deg);
}''')

# Add transform to feature icon
css = css.replace(
    '''.feature-icon {
    font-size: 2rem;
    line-height: 1;
    flex-shrink: 0;
}''',
    '''.feature-icon {
    font-size: 2rem;
    line-height: 1;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}''')

# Enhance card icons with bounce animation
css = css.replace(
    '''.card-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
}''',
    '''.card-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
    transition: transform 0.3s ease;
}

.glass-card:hover .card-icon {
    animation: bounce 0.6s ease;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    25% { transform: translateY(-10px); }
    50% { transform: translateY(-5px); }
    75% { transform: translateY(-8px); }
}''')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Enhanced all cards with poppy, reactive effects!")
print("")
print("Improvements:")
print("- Stronger hover transforms (lift + scale)")
print("- Vibrant blue shadows on hover")
print("- Icon bounce animations")
print("- Shimmer effects on category tiles")
print("- Smooth cubic-bezier transitions")
print("- Glowing borders on hover")
print("")
print("Refresh your browser to see the enhanced cards!")
