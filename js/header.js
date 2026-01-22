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

    // User Menu Toggle - Enhanced for authentication
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    if (userMenuToggle) {
        // Create user dropdown menu
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        userDropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            min-width: 200px;
            margin-top: 0.5rem;
            display: none;
            z-index: 1000;
        `;

        // Update menu based on auth state
        function updateUserMenu(user) {
            if (user) {
                // User is logged in - show profile menu
                userDropdown.innerHTML = `
                    <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
                        <div style="font-weight: 600; color: #111827;">${user.displayName || 'User'}</div>
                        <div style="font-size: 0.85rem; color: #6b7280; margin-top: 0.25rem;">${user.email}</div>
                    </div>
                    <div style="padding: 0.5rem;">
                        <a href="/pages/profile.html" style="display: block; padding: 0.75rem; color: #374151; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                            My Profile
                        </a>
                        <a href="/pages/my-listings.html" style="display: block; padding: 0.75rem; color: #374151; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                            My Listings
                        </a>
                        <a href="#" id="signOutBtn" style="display: block; padding: 0.75rem; color: #dc2626; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='transparent'">
                            Sign Out
                        </a>
                    </div>
                `;
            } else {
                // User is not logged in - show login/signup
                userDropdown.innerHTML = `
                    <div style="padding: 0.5rem;">
                        <a href="/pages/auth/login.html" style="display: block; padding: 0.75rem; color: #374151; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                            Sign In
                        </a>
                        <a href="/pages/auth/signup.html" style="display: block; padding: 0.75rem; color: #667eea; font-weight: 600; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#eef2ff'" onmouseout="this.style.background='transparent'">
                            Create Account
                        </a>
                    </div>
                `;
            }
        }

        // Add dropdown to DOM
        userMenuToggle.parentElement.style.position = 'relative';
        userMenuToggle.parentElement.appendChild(userDropdown);

        // Toggle dropdown on click
        userMenuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            userDropdown.style.display = 'none';
        });

        // Handle sign out
        document.addEventListener('click', function (e) {
            if (e.target && e.target.id === 'signOutBtn') {
                e.preventDefault();
                if (window.FirebaseAPI) {
                    window.FirebaseAPI.signOut();
                }
            }
        });

        // Wait for Firebase to be ready before setting up auth listener
        function waitForFirebase(callback, maxAttempts = 50) {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.FirebaseAPI && window.FirebaseAPI.auth) {
                    clearInterval(checkInterval);
                    console.log('✅ Firebase ready, setting up auth listener');
                    callback();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('⚠️ Firebase not ready after', maxAttempts * 100, 'ms - showing guest menu');
                    updateUserMenu(null);
                }
            }, 100);
        }

        // Initialize auth listener when Firebase is ready
        waitForFirebase(() => {
            window.FirebaseAPI.auth.onAuthStateChanged(updateUserMenu);
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
