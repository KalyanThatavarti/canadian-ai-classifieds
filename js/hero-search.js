// ================================
//   Hero Banner Search Functionality
//   Handles search from homepage hero section
// ================================

document.addEventListener('DOMContentLoaded', function () {
    // Hero search elements
    const heroSearchInput = document.getElementById('heroSearchInput');
    const heroSearchCategory = document.getElementById('heroSearchCategory');
    const heroLocationInput = document.getElementById('heroLocationInput');
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    const postAdBtn = document.getElementById('postAdBtn');
    const browseListingsBtn = document.getElementById('browseListingsBtn');

    /**
     * Perform hero search
     */
    function performHeroSearch(e) {
        if (e) e.preventDefault();

        const searchQuery = heroSearchInput?.value.trim() || '';
        const category = heroSearchCategory?.value || '';
        const location = heroLocationInput?.value.trim() || '';

        // Build URL with query parameters
        let url = 'pages/browse-listings.html';
        const params = new URLSearchParams();

        if (searchQuery) {
            params.append('search', searchQuery);
        }
        if (category) {
            params.append('category', category);
        }
        if (location) {
            params.append('location', location);
        }

        // Navigate to browse listings with filters
        if (params.toString()) {
            url += '?' + params.toString();
        }

        window.location.href = url;
    }

    /**
     * Navigate to post ad page
     */
    function navigateToPostAd() {
        window.location.href = 'pages/post-ad.html';
    }

    /**
     * Navigate to browse listings
     */
    function navigateToBrowseListings() {
        window.location.href = 'pages/browse-listings.html';
    }

    // Event Listeners
    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', performHeroSearch);
    }

    // Allow Enter key to search
    if (heroSearchInput) {
        heroSearchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performHeroSearch(e);
            }
        });
    }

    // Category change triggers immediate search
    if (heroSearchCategory) {
        heroSearchCategory.addEventListener('change', function () {
            // Optional: Auto-search on category change
            // Uncomment if you want immediate navigation
            // performHeroSearch();
        });
    }

    // Post Ad button
    if (postAdBtn) {
        postAdBtn.addEventListener('click', navigateToPostAd);
    }

    // Browse Listings button
    if (browseListingsBtn) {
        browseListingsBtn.addEventListener('click', navigateToBrowseListings);
    }

    // CTA Section buttons (bottom of homepage)
    const ctaPostAdBtn = document.getElementById('ctaPostAdBtn');
    const ctaSignupBtn = document.getElementById('ctaSignupBtn');

    if (ctaPostAdBtn) {
        ctaPostAdBtn.addEventListener('click', navigateToPostAd);
    }

    if (ctaSignupBtn) {
        ctaSignupBtn.addEventListener('click', function () {
            window.location.href = 'pages/auth/signup.html';
        });
    }

    // Handle URL parameters on browse listings page
    // This will be used by browse-listings.js to pre-fill filters
    if (window.location.pathname.includes('browse-listings.html')) {
        const urlParams = new URLSearchParams(window.location.search);

        // Store in sessionStorage for browse-listings.js to use
        if (urlParams.has('search')) {
            sessionStorage.setItem('heroSearch', urlParams.get('search'));
        }
        if (urlParams.has('category')) {
            sessionStorage.setItem('heroCategory', urlParams.get('category'));
        }
        if (urlParams.has('location')) {
            sessionStorage.setItem('heroLocation', urlParams.get('location'));
        }
    }
});
