// ================================
//   Search Engine - Client-Side Full-Text Search
//   Handles keyword search, filtering, and result ranking
// ================================

/**
 * Search Engine Class
 * Provides full-text search capabilities for listings
 */
class SearchEngine {
    constructor() {
        this.searchIndex = new Map();
        this.listings = [];
    }

    /**
     * Build search index from listings
     * @param {Array} listings - Array of listing objects
     */
    buildIndex(listings) {
        this.listings = listings;
        this.searchIndex.clear();

        listings.forEach((listing, index) => {
            // Create searchable text from title, description, category
            const searchableText = [
                listing.title || '',
                listing.description || '',
                listing.category || '',
                listing.location?.city || '',
                listing.location?.province || ''
            ].join(' ').toLowerCase();

            // Store in index
            this.searchIndex.set(listing.id || index, {
                text: searchableText,
                listing: listing
            });
        });
    }

    /**
     * Search listings by query
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Array} Filtered and ranked listings
     */
    search(query, options = {}) {
        if (!query || query.trim() === '') {
            return this.listings;
        }

        const keywords = this.extractKeywords(query);
        const results = [];

        // Search through index
        this.searchIndex.forEach((indexEntry, id) => {
            const score = this.calculateRelevanceScore(indexEntry.text, keywords);

            if (score > 0) {
                results.push({
                    ...indexEntry.listing,
                    _searchScore: score,
                    _matchedKeywords: keywords.filter(kw => indexEntry.text.includes(kw))
                });
            }
        });

        // Sort by relevance score (highest first)
        results.sort((a, b) => b._searchScore - a._searchScore);

        return results;
    }

    /**
     * Extract keywords from query
     * @param {string} query - Search query
     * @returns {Array} Array of keywords
     */
    extractKeywords(query) {
        return query
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0)
            .map(word => word.replace(/[^\w]/g, '')); // Remove special chars
    }

    /**
     * Calculate relevance score for a text against keywords
     * @param {string} text - Text to search in
     * @param {Array} keywords - Keywords to search for
     * @returns {number} Relevance score
     */
    calculateRelevanceScore(text, keywords) {
        let score = 0;

        keywords.forEach(keyword => {
            // Exact match in title (highest priority)
            if (text.includes(keyword)) {
                score += 10;
            }

            // Partial match (substring)
            const regex = new RegExp(keyword, 'gi');
            const matches = text.match(regex);
            if (matches) {
                score += matches.length * 5;
            }
        });

        return score;
    }

    /**
     * Highlight search terms in text
     * @param {string} text - Original text
     * @param {string} query - Search query
     * @returns {string} HTML with highlighted terms
     */
    highlightMatches(text, query) {
        if (!query || !text) return text;

        const keywords = this.extractKeywords(query);
        let highlightedText = text;

        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            highlightedText = highlightedText.replace(
                regex,
                '<mark class="search-highlight">$1</mark>'
            );
        });

        return highlightedText;
    }

    /**
     * Get search suggestions based on query
     * @param {string} query - Partial search query
     * @param {number} limit - Max number of suggestions
     * @returns {Array} Array of suggestions
     */
    getSuggestions(query, limit = 5) {
        if (!query || query.length < 2) {
            return [];
        }

        const queryLower = query.toLowerCase();
        const suggestions = new Set();

        this.searchIndex.forEach((indexEntry) => {
            const listing = indexEntry.listing;

            // Check title for matches
            if (listing.title && listing.title.toLowerCase().includes(queryLower)) {
                suggestions.add(listing.title);
            }

            // Check category for matches
            if (listing.category && listing.category.toLowerCase().includes(queryLower)) {
                suggestions.add(listing.category);
            }
        });

        return Array.from(suggestions).slice(0, limit);
    }
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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

/**
 * Filter listings by various criteria
 */
class ListingFilter {
    /**
     * Apply all filters to listings
     * @param {Array} listings - Array of listings
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered listings
     */
    static applyFilters(listings, filters) {
        let filtered = [...listings];

        // Category filter
        if (filters.categories && filters.categories.length > 0) {
            filtered = filtered.filter(listing =>
                filters.categories.includes(listing.category)
            );
        }

        // Price range filter
        if (filters.priceMin !== null && filters.priceMin !== undefined) {
            filtered = filtered.filter(listing =>
                listing.price >= filters.priceMin
            );
        }
        if (filters.priceMax !== null && filters.priceMax !== undefined) {
            filtered = filtered.filter(listing =>
                listing.price <= filters.priceMax
            );
        }

        // Location filter
        if (filters.location) {
            filtered = filtered.filter(listing => {
                const listingLocation = `${listing.location?.city},${listing.location?.province}`;
                return listingLocation === filters.location;
            });
        }

        // Condition filter
        if (filters.conditions && filters.conditions.length > 0) {
            filtered = filtered.filter(listing =>
                filters.conditions.includes(listing.condition)
            );
        }

        // Date posted filter
        if (filters.dateRange) {
            const now = new Date();
            const cutoffDate = this.getDateCutoff(now, filters.dateRange);

            filtered = filtered.filter(listing => {
                const listingDate = listing.createdAt?.toDate ?
                    listing.createdAt.toDate() :
                    new Date(listing.createdAt);
                return listingDate >= cutoffDate;
            });
        }

        return filtered;
    }

    /**
     * Sort listings by criteria
     * @param {Array} listings - Array of listings
     * @param {string} sortBy - Sort criteria
     * @returns {Array} Sorted listings
     */
    static sortListings(listings, sortBy) {
        const sorted = [...listings];

        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB - dateA;
                });
                break;

            case 'price-low':
                sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;

            case 'price-high':
                sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;

            case 'distance':
                // TODO: Implement geolocation sorting
                // For now, fallback to newest
                sorted.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB - dateA;
                });
                break;

            default:
                // Default to newest
                sorted.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB - dateA;
                });
        }

        return sorted;
    }

    /**
     * Get date cutoff based on range
     * @param {Date} now - Current date
     * @param {string} range - Date range (24h, 7d, 30d)
     * @returns {Date} Cutoff date
     */
    static getDateCutoff(now, range) {
        const cutoff = new Date(now);

        switch (range) {
            case '24h':
                cutoff.setHours(cutoff.getHours() - 24);
                break;
            case '7d':
                cutoff.setDate(cutoff.getDate() - 7);
                break;
            case '30d':
                cutoff.setDate(cutoff.getDate() - 30);
                break;
            default:
                cutoff.setFullYear(cutoff.getFullYear() - 10); // All time
        }

        return cutoff;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SearchEngine, ListingFilter, debounce };
}
