import re

# Read the current HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add hero-slider CSS after styles.css
html = html.replace(
    '<link rel="stylesheet" href="css/styles.css">',
    '<link rel="stylesheet" href="css/styles.css">\n    <link rel="stylesheet" href="css/hero-slider.css">'
)

# 2. Add hero-slider JS before closing body
html = html.replace(
    '</body>',
    '    <script src="js/hero-slider.js"></script>\n</body>'
)

# 3. Replace the hero section
old_hero = '''    <!-- Hero Section -->
    <section class="hero-section" id="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">Canada's AI-Powered Classifieds — Post in 60 Seconds with Verified Safety
                    </h1>
                    <h2 class="hero-subtitle">Create ads instantly with AI, reach local Canadian buyers, and stay
                        protected with secure verification.</h2>
                    <div class="hero-cta">
                        <button class="btn btn-primary">Post Your Ad Now</button>
                        <button class="btn btn-secondary">Browse Listings</button>
                    </div>
                </div>
                <div class="hero-visual">
                    <img src="images/hero-phone.png" alt="AI-powered classifieds app on phone" class="hero-image">
                </div>
            </div>
        </div>
    </section>'''

# Read new hero HTML
with open('NEW-HERO-HTML.html', 'r', encoding='utf-8') as f:
    new_hero = f.read()
    # Extract just the hero section (skip the comments at top)
    new_hero = new_hero[new_hero.find('<!-- Hero Section'):]
    new_hero = new_hero[:new_hero.rfind('</section>') + 10]

html = html.replace(old_hero, new_hero)

# Save
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html with new hero slider!")
print("Refresh your browser to see the changes.")
