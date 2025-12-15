// ================================
// Premium Header JavaScript
// ================================

document.addEventListener('DOMContentLoaded', function () {

    // Sticky Header on Scroll
    const header = document.querySelector('.site-header');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('active');
            body.classList.toggle('menu-open');

            // Toggle hamburger icon to X
            const icon = this.querySelector('.hamburger-icon');
            if (mainNav.classList.contains('active')) {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                `;
            } else {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                `;
            }
        });
    }

    // Close mobile menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                body.classList.remove('menu-open');

                // Reset hamburger icon
                const icon = mobileMenuToggle.querySelector('.hamburger-icon');
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                `;
            }
        });
    });

    // Search Toggle (placeholder for future implementation)
    const searchToggle = document.querySelector('.search-toggle');
    if (searchToggle) {
        searchToggle.addEventListener('click', function () {
            // Future: Open search modal or expand search bar
            console.log('Search clicked - implement search functionality');
        });
    }

    // User Menu Toggle (placeholder for future implementation)
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    if (userMenuToggle) {
        userMenuToggle.addEventListener('click', function () {
            // Future: Open user dropdown menu
            console.log('User menu clicked - implement user menu');
        });
    }

    // Location Selector (placeholder for future implementation)
    const locationSelector = document.querySelector('.location-selector');
    if (locationSelector) {
        locationSelector.addEventListener('click', function () {
            // Future: Open location selection modal
            console.log('Location selector clicked - implement location picker');
        });
    }

    // Language Toggle
    const languageToggle = document.querySelector('.language-toggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', function (e) {
            if (e.target.classList.contains('lang-option')) {
                // Remove active class from all
                const allLangs = this.querySelectorAll('.lang-option');
                allLangs.forEach(lang => lang.classList.remove('active-lang'));

                // Add active to clicked
                e.target.classList.add('active-lang');

                // Future: Implement actual language switching
                console.log('Language switched to:', e.target.textContent);
            }
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Prevent body scroll when mobile menu is open
    const style = document.createElement('style');
    style.textContent = `
        body.menu-open {
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});
