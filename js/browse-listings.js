// Browse Listings Page JavaScript
// Handles listing display, filtering, search, and sorting

document.addEventListener('DOMContentLoaded', function () {
    // Get all listings from sample data
    let allListings = [...sampleListings];
    let filteredListings = [...allListings];
    let currentView = 'grid';

    // DOM Elements
    const listingsGrid = document.getElementById('listingsGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilters = document.getElementById('categoryFilters');
    const conditionFilters = document.getElementById('conditionFilters');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const locationFilter = document.getElementById('locationFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortSelect = document.getElementById('sortSelect');
    const resultsCount = document.getElementById('resultsCount');
    const activeFiltersContainer = document.getElementById('activeFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const clearAllFiltersBtn = document.getElementById('clearAllFilters');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const filterToggleBtn = document.getElementById('filterToggle');
    const filtersSidebar = document.getElementById('filtersSidebar');
    const viewBtns = document.querySelectorAll('.view-btn');

    // Active filters state
    let activeFilters = {
        search: '',
        categories: [],
        conditions: [],
        minPrice: null,
        maxPrice: null,
        location: '',
        date: '',
        sort: 'newest'
    };

    // Initialize page
    init();

    function init() {
        renderCategoryFilters();
        renderListings();
        updateResultsCount();
        setupEventListeners();
    }

    // Render category filter options
    function renderCategoryFilters() {
        const categoryHTML = Object.entries(categories).map(([key, data]) => `
            <label class="filter-checkbox">
                <input type="checkbox" value="${key}" data-filter="category">
                <span>${data.icon} ${data.name}</span>
            </label>
        `).join('');
        categoryFilters.innerHTML = categoryHTML;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search input with debounce
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                activeFilters.search = e.target.value.toLowerCase();
                applyFilters();
            }, 300);
        });

        // Category checkboxes
        categoryFilters.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                updateCheckboxFilter('categories', e.target.value, e.target.checked);
            }
        });

        // Condition checkboxes
        conditionFilters.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                updateCheckboxFilter('conditions', e.target.value, e.target.checked);
            }
        });

        // Price inputs
        minPriceInput.addEventListener('input', debounce(() => {
            activeFilters.minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
            applyFilters();
        }, 500));

        maxPriceInput.addEventListener('input', debounce(() => {
            activeFilters.maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
            applyFilters();
        }, 500));

        // Location filter
        locationFilter.addEventListener('change', (e) => {
            activeFilters.location = e.target.value;
            applyFilters();
        });

        // Date filter
        dateFilter.addEventListener('change', (e) => {
            activeFilters.date = e.target.value;
            applyFilters();
        });

        // Sort select
        sortSelect.addEventListener('change', (e) => {
            activeFilters.sort = e.target.value;
            applyFilters();
        });

        // Clear filters
        clearFiltersBtn.addEventListener('click', clearAllFilters);
        clearAllFiltersBtn.addEventListener('click', clearAllFilters);

        // Filter toggle (mobile)
        filterToggleBtn.addEventListener('click', () => {
            filtersSidebar.classList.toggle('active');
        });

        // View toggle
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = btn.dataset.view;
                toggleView(currentView);
            });
        });

        // Close filters sidebar when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                filtersSidebar.classList.contains('active') &&
                !filtersSidebar.contains(e.target) &&
                !filterToggleBtn.contains(e.target)) {
                filtersSidebar.classList.remove('active');
            }
        });
    }

    // Update checkbox filter array
    function updateCheckboxFilter(filterKey, value, checked) {
        if (checked) {
            activeFilters[filterKey].push(value);
        } else {
            activeFilters[filterKey] = activeFilters[filterKey].filter(v => v !== value);
        }
        applyFilters();
    }

    // Apply all filters
    function applyFilters() {
        showLoading();

        // Simulate slight delay for better UX
        setTimeout(() => {
            filteredListings = allListings.filter(listing => {
                // Search filter
                if (activeFilters.search) {
                    const searchLower = activeFilters.search;
                    const matchesSearch =
                        listing.title.toLowerCase().includes(searchLower) ||
                        listing.description.toLowerCase().includes(searchLower) ||
                        listing.category.toLowerCase().includes(searchLower);
                    if (!matchesSearch) return false;
                }

                // Category filter
                if (activeFilters.categories.length > 0) {
                    if (!activeFilters.categories.includes(listing.category)) return false;
                }

                // Condition filter
                if (activeFilters.conditions.length > 0) {
                    if (!activeFilters.conditions.includes(listing.condition)) return false;
                }

                // Price filter
                if (activeFilters.minPrice !== null && listing.price < activeFilters.minPrice) {
                    return false;
                }
                if (activeFilters.maxPrice !== null && listing.price > activeFilters.maxPrice) {
                    return false;
                }

                // Location filter
                if (activeFilters.location) {
                    const [city, province] = activeFilters.location.split(',');
                    if (listing.location.city !== city || listing.location.province !== province) {
                        return false;
                    }
                }

                // Date filter
                if (activeFilters.date) {
                    const now = new Date();
                    const listingDate = new Date(listing.createdAt);
                    const diffMs = now - listingDate;
                    const diffHours = diffMs / (1000 * 60 * 60);
                    const diffDays = diffMs / (1000 * 60 * 60 * 24);

                    if (activeFilters.date === '24h' && diffHours > 24) return false;
                    if (activeFilters.date === '7d' && diffDays > 7) return false;
                    if (activeFilters.date === '30d' && diffDays > 30) return false;
                }

                return true;
            });

            // Sort listings
            sortListings();

            // Update UI
            renderListings();
            updateResultsCount();
            updateActiveFiltersChips();
            hideLoading();
        }, 200);
    }

    // Sort listings based on selected option
    function sortListings() {
        const sortOption = activeFilters.sort;

        switch (sortOption) {
            case 'newest':
                filteredListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'price-low':
                filteredListings.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredListings.sort((a, b) => b.price - a.price);
                break;
            case 'distance':
                // For now, sort by views as a proxy (in real app, use geolocation)
                filteredListings.sort((a, b) => b.views - a.views);
                break;
        }
    }

    // Render listings to grid
    function renderListings() {
        if (filteredListings.length === 0) {
            showEmptyState();
            return;
        }

        hideEmptyState();

        const listingsHTML = filteredListings.map(listing => createListingCard(listing)).join('');
        listingsGrid.innerHTML = listingsHTML;

        // Add click handlers to cards
        document.querySelectorAll('.listing-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking favorite button
                if (!e.target.closest('.listing-card-favorite-btn')) {
                    const listingId = card.dataset.id;
                    window.location.href = `listing-detail.html?id=${listingId}`;
                }
            });
        });

        // Attach favorite button handlers using utility function
        if (window.Utils && window.Utils.attachFavoriteHandlers) {
            window.Utils.attachFavoriteHandlers(listingsGrid);
        }
    }

    // Create listing card HTML
    function createListingCard(listing) {
        const isNew = isListingNew(listing.createdAt);
        const timeAgo = getTimeAgo(listing.createdAt);

        return `
            <div class="listing-card" data-id="${listing.id}">
                <img src="${listing.images[0]}" alt="${listing.title}" class="listing-image" loading="lazy">
                <div class="listing-badges">
                    <div>
                        ${listing.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
                        ${isNew ? '<span class="badge badge-new">New</span>' : ''}
                    </div>
                </div>
                ${window.Utils ? window.Utils.createFavoriteButton(listing.id, false) : ''}
                <div class="listing-info">
                    <div class="listing-category">${categories[listing.category].icon} ${categories[listing.category].name}</div>
                    <h3 class="listing-title">${listing.title}</h3>
                    <div class="listing-price">$${listing.price.toLocaleString()}</div>
                    <div class="listing-location">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>${listing.location.city}, ${listing.location.province}</span>
                    </div>
                    <div class="listing-meta">
                        <div class="listing-seller">
                            <img src="${listing.seller.avatar}" alt="${listing.seller.name}" class="seller-avatar">
                            <span class="seller-name">${listing.seller.name}</span>
                            ${listing.seller.verified ? '<span class="verified-badge"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>' : ''}
                        </div>
                        <span class="listing-time">${timeAgo}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Update results count
    function updateResultsCount() {
        const count = filteredListings.length;
        const total = allListings.length;
        resultsCount.textContent = `Showing ${count} of ${total} listings`;
    }

    // Update active filter chips
    function updateActiveFiltersChips() {
        const chips = [];

        // Search chip
        if (activeFilters.search) {
            chips.push({
                label: `Search: "${activeFilters.search}"`,
                type: 'search'
            });
        }

        // Category chips
        activeFilters.categories.forEach(cat => {
            chips.push({
                label: categories[cat].name,
                type: 'category',
                value: cat
            });
        });

        // Condition chips
        activeFilters.conditions.forEach(cond => {
            chips.push({
                label: `Condition: ${cond}`,
                type: 'condition',
                value: cond
            });
        });

        // Price chip
        if (activeFilters.minPrice || activeFilters.maxPrice) {
            const priceLabel = activeFilters.minPrice && activeFilters.maxPrice
                ? `$${activeFilters.minPrice} - $${activeFilters.maxPrice}`
                : activeFilters.minPrice
                    ? `Min: $${activeFilters.minPrice}`
                    : `Max: $${activeFilters.maxPrice}`;
            chips.push({
                label: priceLabel,
                type: 'price'
            });
        }

        // Location chip
        if (activeFilters.location) {
            chips.push({
                label: activeFilters.location,
                type: 'location'
            });
        }

        // Date chip
        if (activeFilters.date) {
            const dateLabels = {
                '24h': 'Last 24 hours',
                '7d': 'Last 7 days',
                '30d': 'Last 30 days'
            };
            chips.push({
                label: dateLabels[activeFilters.date],
                type: 'date'
            });
        }

        // Render chips
        if (chips.length === 0) {
            activeFiltersContainer.innerHTML = '';
            activeFiltersContainer.style.display = 'none';
            return;
        }

        activeFiltersContainer.style.display = 'flex';
        activeFiltersContainer.innerHTML = chips.map(chip => `
            <div class="filter-chip">
                <span>${chip.label}</span>
                <button onclick="removeFilter('${chip.type}', '${chip.value || ''}')">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    // Remove individual filter
    window.removeFilter = function (type, value) {
        switch (type) {
            case 'search':
                searchInput.value = '';
                activeFilters.search = '';
                break;
            case 'category':
                activeFilters.categories = activeFilters.categories.filter(c => c !== value);
                document.querySelector(`input[value="${value}"][data-filter="category"]`).checked = false;
                break;
            case 'condition':
                activeFilters.conditions = activeFilters.conditions.filter(c => c !== value);
                document.querySelector(`input[value="${value}"]`).checked = false;
                break;
            case 'price':
                minPriceInput.value = '';
                maxPriceInput.value = '';
                activeFilters.minPrice = null;
                activeFilters.maxPrice = null;
                break;
            case 'location':
                locationFilter.value = '';
                activeFilters.location = '';
                break;
            case 'date':
                dateFilter.value = '';
                activeFilters.date = '';
                break;
        }
        applyFilters();
    };

    // Clear all filters
    function clearAllFilters() {
        // Reset search
        searchInput.value = '';
        activeFilters.search = '';

        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        activeFilters.categories = [];
        activeFilters.conditions = [];

        // Reset price
        minPriceInput.value = '';
        maxPriceInput.value = '';
        activeFilters.minPrice = null;
        activeFilters.maxPrice = null;

        // Reset selects
        locationFilter.value = '';
        dateFilter.value = '';
        activeFilters.location = '';
        activeFilters.date = '';

        // Reset sort
        sortSelect.value = 'newest';
        activeFilters.sort = 'newest';

        applyFilters();
    }

    // Toggle view (grid/list)
    function toggleView(view) {
        if (view === 'list') {
            listingsGrid.classList.add('list-view');
        } else {
            listingsGrid.classList.remove('list-view');
        }
    }

    // Show loading state
    function showLoading() {
        loadingState.style.display = 'block';
        listingsGrid.style.display = 'none';
        emptyState.style.display = 'none';
    }

    // Hide loading state
    function hideLoading() {
        loadingState.style.display = 'none';
        listingsGrid.style.display = 'grid';
    }

    // Show empty state
    function showEmptyState() {
        emptyState.style.display = 'block';
        listingsGrid.style.display = 'none';
        loadingState.style.display = 'none';
    }

    // Hide empty state
    function hideEmptyState() {
        emptyState.style.display = 'none';
    }

    // Utility: Check if listing is new (< 24 hours)
    function isListingNew(createdAt) {
        const now = new Date();
        const listingDate = new Date(createdAt);
        const diffHours = (now - listingDate) / (1000 * 60 * 60);
        return diffHours < 24;
    }

    // Utility: Get time ago string
    function getTimeAgo(date) {
        const now = new Date();
        const createdDate = new Date(date);
        const diffMs = now - createdDate;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 30) return `${diffDays}d ago`;
        return createdDate.toLocaleDateString();
    }

    // Utility: Debounce function
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
});
