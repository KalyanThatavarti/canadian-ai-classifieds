// ================================
//   Recently Viewed Items Tracker
//   Track and display user's browsing history
// ================================

class RecentlyViewed {
    constructor(options = {}) {
        this.options = {
            storageKey: 'recentlyViewed',
            maxItems: 10,
            ...options
        };
    }

    /**
     * Add a listing to recently viewed
     * @param {Object} listing - Listing object
     */
    add(listing) {
        if (!listing || !listing.id) return;

        try {
            let items = this.getAll();

            // Create simplified version of listing for storage
            const viewedItem = {
                id: listing.id,
                title: listing.title,
                price: listing.price,
                category: listing.category,
                images: listing.images ? listing.images.slice(0, 1) : [], // Store only first image
                location: listing.location,
                viewedAt: new Date().toISOString()
            };

            // Remove if already exists (to update position)
            items = items.filter(item => item.id !== listing.id);

            // Add to beginning
            items.unshift(viewedItem);

            // Keep only max items
            items = items.slice(0, this.options.maxItems);

            // Save to localStorage
            localStorage.setItem(this.options.storageKey, JSON.stringify(items));

            // Dispatch custom event for UI updates
            window.dispatchEvent(new CustomEvent('recentlyViewedUpdated', {
                detail: { items }
            }));
        } catch (e) {
            console.error('Error adding to recently viewed:', e);
        }
    }

    /**
     * Get all recently viewed items
     * @returns {Array} Recently viewed items
     */
    getAll() {
        try {
            const items = localStorage.getItem(this.options.storageKey);
            return items ? JSON.parse(items) : [];
        } catch (e) {
            console.error('Error loading recently viewed:', e);
            return [];
        }
    }

    /**
     * Get specific number of recent items
     * @param {number} count - Number of items to get
     * @returns {Array} Recently viewed items
     */
    getRecent(count = 6) {
        return this.getAll().slice(0, count);
    }

    /**
     * Check if a listing was recently viewed
     * @param {string} listingId - Listing ID
     * @returns {boolean} True if recently viewed
     */
    hasViewed(listingId) {
        const items = this.getAll();
        return items.some(item => item.id === listingId);
    }

    /**
     * Remove a specific item from recently viewed
     * @param {string} listingId - Listing ID to remove
     */
    remove(listingId) {
        try {
            let items = this.getAll();
            items = items.filter(item => item.id !== listingId);
            localStorage.setItem(this.options.storageKey, JSON.stringify(items));

            window.dispatchEvent(new CustomEvent('recentlyViewedUpdated', {
                detail: { items }
            }));
        } catch (e) {
            console.error('Error removing from recently viewed:', e);
        }
    }

    /**
     * Clear all recently viewed items
     */
    clear() {
        try {
            localStorage.removeItem(this.options.storageKey);

            window.dispatchEvent(new CustomEvent('recentlyViewedUpdated', {
                detail: { items: [] }
            }));
        } catch (e) {
            console.error('Error clearing recently viewed:', e);
        }
    }

    /**
     * Render recently viewed section on page
     * @param {HTMLElement} container - Container element
     * @param {number} limit - Max items to display
     */
    renderSection(container, limit = 6) {
        if (!container) return;

        const items = this.getRecent(limit);

        if (items.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';

        // Create HTML
        let html = `
            <div class="recently-viewed-header">
                <h2 class="section-title">Recently Viewed</h2>
                <button class="clear-history-btn" type="button">Clear History</button>
            </div>
            <div class="listings-carousel recently-viewed-grid">
        `;

        items.forEach(item => {
            const imageUrl = item.images && item.images.length > 0
                ? item.images[0]
                : 'images/placeholder.png';

            const location = item.location
                ? `${item.location.city}, ${item.location.province}`
                : 'Location N/A';

            html += `
                <div class="listing-card recently-viewed-item" data-listing-id="${item.id}">
                    <div class="listing-image" style="background-image: url('${imageUrl}');">
                        <span class="recently-viewed-badge">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </span>
                    </div>
                    <div class="listing-info">
                        <h4 class="listing-title">${this.escapeHtml(item.title)}</h4>
                        <p class="listing-price">$${item.price.toLocaleString()}</p>
                        <p class="listing-location">${location}</p>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
        `;

        container.innerHTML = html;

        // Add event listeners
        const clearBtn = container.querySelector('.clear-history-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear your recently viewed history?')) {
                    this.clear();
                    this.renderSection(container, limit);
                }
            });
        }

        // Add click handlers for listing cards
        const cards = container.querySelectorAll('.listing-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const listingId = card.dataset.listingId;
                window.location.href = `pages/listing-detail.html?id=${listingId}`;
            });
        });
    }

    /**
     * Escape HTML for safe rendering
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
const recentlyViewedManager = new RecentlyViewed();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecentlyViewed;
}
