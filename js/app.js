// ================================
// Canadian AI Classifieds - App JavaScript
// Handles animations, interactions, and UI functionality
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initSmoothScroll();
    initButtonInteractions();
    console.log('🚀 Canadian AI Classifieds loaded successfully!');
});

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add stagger delay for multiple items
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(el => observer.observe(el));
}

// ===== Smooth Scrolling for Anchor Links =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#' || !href) return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Button Interactions =====
function initButtonInteractions() {
    const postAdButtons = document.querySelectorAll('.btn-primary');
    const browseButtons = document.querySelectorAll('.btn-secondary');

    postAdButtons.forEach(btn => {
        // Skip buttons that have specific IDs (they have their own handlers)
        if (!btn.id || btn.id === '') {
            btn.addEventListener('click', handlePostAdClick);
        }
    });

    browseButtons.forEach(btn => {
        // Skip buttons that have specific IDs (they have their own handlers)
        if (!btn.id || btn.id === '') {
            btn.addEventListener('click', handleBrowseClick);
        }
    });

    // Category tile clicks
    const categoryTiles = document.querySelectorAll('.category-tile');
    categoryTiles.forEach(tile => {
        tile.addEventListener('click', handleCategoryClick);
    });

    // Listing card clicks
    const listingCards = document.querySelectorAll('.listing-card');
    listingCards.forEach(card => {
        card.addEventListener('click', handleListingClick);
    });
}

// ===== Event Handlers =====
function handlePostAdClick(e) {
    console.log('📝 Post Ad button clicked');

    // Check if UI components are loaded
    if (window.UIComponents) {
        window.UIComponents.showModal(
            'Create listings in 60 seconds with AI-powered descriptions! This feature will be available soon.',
            '🎉 Post Your Ad',
            {
                confirmText: 'Got it!',
                cancelText: null
            }
        );
    } else {
        alert('🎉 Post Ad feature coming soon! You\'ll be able to create ads in 60 seconds with AI.');
    }
}

function handleBrowseClick(e) {
    console.log('🔍 Browse Listings button clicked');

    // Redirect to browse page
    window.location.href = 'pages/browse-listings.html';
}

function handleCategoryClick(e) {
    const categoryName = e.currentTarget.querySelector('.category-name').textContent;
    console.log(`📂 Category clicked: ${categoryName}`);

    if (window.UIComponents) {
        window.UIComponents.showInfoToast(
            `Filtering listings for ${categoryName}`,
            'Category Selected'
        );
    }

    // TODO: Navigate to browse page with category filter
    // window.location.href = `pages/browse-listings.html?category=${encodeURIComponent(categoryName)}`;
}

function handleListingClick(e) {
    const listingTitle = e.currentTarget.querySelector('.listing-title').textContent;
    const listingPrice = e.currentTarget.querySelector('.listing-price').textContent;
    console.log(`🏷️ Listing clicked: ${listingTitle} - ${listingPrice}`);

    if (window.UIComponents) {
        window.UIComponents.showModal(
            `Price: ${listingPrice}\n\nFull listing details and contact information will be available soon!`,
            listingTitle,
            { confirmText: 'Close' }
        );
    } else {
        alert(`${listingTitle}\n${listingPrice}\n\nFull listing details coming soon!`);
    }
}

// ===== Utility Functions =====

// Add ripple effect to buttons (optional enhancement)
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Firebase Integration Helpers =====
// These will be implemented when Firebase is configured

async function initializeFirebaseListeners() {
    // TODO: Listen to Firestore for real-time listings updates
    console.log('🔥 Firebase listeners will be initialized here');
}

async function fetchNearbyListings(latitude, longitude, radiusKm = 5) {
    // TODO: Query Firestore for listings within radius
    console.log(`📍 Fetching listings within ${radiusKm}km of (${latitude}, ${longitude})`);
}

async function createListing(listingData) {
    // TODO: Add listing to Firestore
    console.log('➕ Creating new listing:', listingData);
}

// ===== Export functions for external use =====
window.CanadianClassifieds = {
    initializeFirebaseListeners,
    fetchNearbyListings,
    createListing
};
