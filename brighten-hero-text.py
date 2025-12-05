with open('css/hero-slider.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make badge text pure white and add glow
css = css.replace(
    '''    color: #C8E6FF;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}''',
    '''    color: #ffffff;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}''')

# Make hero heading pure white with strong shadow
css = css.replace(
    '''    font-size: clamp(2.5rem, 7vw, 5rem);
    font-weight: 500;
    line-height: 1.1;
    color: white;
    margin-bottom: 1.5rem;
    animation-delay: 0.2s;
}''',
    '''    font-size: clamp(2.5rem, 7vw, 5rem);
    font-weight: 600;
    line-height: 1.1;
    color: #ffffff;
    margin-bottom: 1.5rem;
    animation-delay: 0.2s;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4);
}''')

# Make subheading brighter
css = css.replace(
    '''    display: block;
    color: #C8E6FF;
    font-size: 0.85em;
    margin-top: 1rem;
    font-weight: 300;
}''',
    '''    display: block;
    color: #ffffff;
    font-size: 0.85em;
    margin-top: 1rem;
    font-weight: 400;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}''')

# Make description text brighter
css = css.replace(
    '''    font-size: clamp(1.125rem, 4vw, 1.5rem);
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin-bottom: 2rem;
    font-weight: 300;
    animation-delay: 0.4s;
}''',
    '''    font-size: clamp(1.125rem, 4vw, 1.5rem);
    color: #ffffff;
    line-height: 1.6;
    margin-bottom: 2rem;
    font-weight: 400;
    animation-delay: 0.4s;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}''')

# Make stat icons brighter
css = css.replace(
    '''    width: 20px;
    height: 20px;
    color: #C8E6FF;
}''',
    '''    width: 20px;
    height: 20px;
    color: #ffffff;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}''')

# Make stat text brighter
css = css.replace(
    '''    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
}''',
    '''    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}''')

# Make promo title brighter
css = css.replace(
    '''    color: #C8E6FF;
    font-weight: 500;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}''',
    '''    color: #ffffff;
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}''')

# Make promo text brighter
css = css.replace(
    '''    color: rgba(255, 255, 255, 0.9);
    font-size: 0.875rem;
    line-height: 1.5;
}''',
    '''    color: #ffffff;
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: 400;
}''')

# Make promo icon brighter
css = css.replace(
    '''    width: 16px;
    height: 16px;
    color: #C8E6FF;
}''',
    '''    width: 16px;
    height: 16px;
    color: #ffffff;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}''')

# Enhance badge background for better contrast
css = css.replace(
    '''    background: rgba(74, 144, 226, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);''',
    '''    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);''')

# Enhance promo box background for better contrast
css = css.replace(
    '''    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 1.5rem;
    max-width: 28rem;
    border: 1px solid rgba(255, 255, 255, 0.1);''',
    '''    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 1rem;
    padding: 1.5rem;
    max-width: 28rem;
    border: 1px solid rgba(255, 255, 255, 0.2);''')

with open('css/hero-slider.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Enhanced hero text visibility!")
print("")
print("Improvements:")
print("- All text now pure white (#ffffff)")
print("- Strong text shadows for contrast")
print("- Increased font weights (400-600)")
print("- Darker semi-transparent backgrounds on badge & promo box")
print("- Icon drop shadows for visibility")
print("")
print("Refresh your browser - all hero text is now bright and clearly visible!")
