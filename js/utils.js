// ================================
// Utility Functions - Input Sanitization & Helpers
// ================================

/**
 * Sanitize HTML input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
function sanitizeHTML(input) {
    if (!input) return '';

    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Sanitize input for use in text fields
 * Removes dangerous characters while preserving normal text
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
    if (!input) return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove inline event handlers
}

/**
 * Sanitize email address
 * @param {string} email - Email address
 * @returns {string|null} Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
    if (!email) return null;

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(trimmed) ? trimmed : null;
}

/**
 * Sanitize phone number (Canadian format)
 * @param {string} phone - Phone number
 * @returns {string} Sanitized phone number
 */
function sanitizePhone(phone) {
    if (!phone) return '';

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX for 10-digit numbers
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return digits;
}

/**
 * Validate and sanitize price input
 * @param {string|number} price - Price value
 * @returns {number|null} Sanitized price or null if invalid
 */
function sanitizePrice(price) {
    if (price === null || price === undefined || price === '') return null;

    // Convert to number
    const num = typeof price === 'string'
        ? parseFloat(price.replace(/[$,]/g, ''))
        : price;

    // Validate
    if (isNaN(num) || num < 0) return null;

    // Round to 2 decimal places
    return Math.round(num * 100) / 100;
}

/**
 * Escape string for use in regex
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Format Canadian currency
 * @param {number} amount - Amount in dollars
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
    }).format(amount);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|number|string} date - Date to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

    return then.toLocaleDateString('en-CA');
}

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
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
 * Throttle function for performance
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate a random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
function generateId(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ===== Favorite Button Utilities =====

/**
 * Create favorite button HTML for listing cards
 * @param {string} listingId - Listing ID
 * @param {boolean} isFavorited - Whether listing is already favorited
 * @returns {string} Favorite button HTML
 */
function createFavoriteButton(listingId, isFavorited = false) {
    const favoritedClass = isFavorited ? 'favorited' : '';
    const heartIcon = isFavorited
        ? '<path stroke="none" fill="currentColor" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>';

    return `
        <button class="listing-card-favorite-btn ${favoritedClass}" 
                data-listing-id="${listingId}" 
                aria-label="Add to favorites"
                onclick="event.stopPropagation();">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${heartIcon}
            </svg>
        </button>
    `;
}

/**
 * Attach favorite button click handlers to listing cards
 * @param {HTMLElement} container - Container element with favorite buttons
 */
function attachFavoriteHandlers(container) {
    const favoriteButtons = container.querySelectorAll('.listing-card-favorite-btn');

    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();

            const listingId = btn.dataset.listingId;

            // Check if user is logged in
            if (!window.FirebaseAPI || !window.FirebaseAPI.getCurrentUser()) {
                if (window.UIComponents) {
                    window.UIComponents.showModal(
                        'Please sign in to save favorites',
                        'Sign In Required',
                        {
                            confirmText: 'Sign In',
                            cancelText: 'Cancel',
                            onConfirm: () => window.location.href = '/pages/auth/login.html'
                        }
                    );
                } else {
                    alert('Please sign in to save favorites');
                }
                return;
            }

            const currentUser = window.FirebaseAPI.getCurrentUser();

            try {
                // Toggle favorite
                const isFavorited = await window.FirebaseAPI.toggleFavorite(currentUser.uid, listingId);

                // Update button state
                updateFavoriteButtonState(btn, isFavorited);

                // Show toast
                if (window.UIComponents) {
                    if (isFavorited) {
                        window.UIComponents.showSuccessToast('Added to favorites', 'Success');
                    } else {
                        window.UIComponents.showInfoToast('Removed from favorites', 'Removed');
                    }
                }
            } catch (error) {
                console.error('Error toggling favorite:', error);
                if (window.UIComponents) {
                    window.UIComponents.showErrorToast('Failed to update favorite', 'Error');
                }
            }
        });
    });
}

/**
 * Update favorite button visual state
 * @param {HTMLElement} button - Favorite button element
 * @param {boolean} isFavorited - Whether listing is favorited
 */
function updateFavoriteButtonState(button, isFavorited) {
    const icon = button.querySelector('svg');

    if (isFavorited) {
        button.classList.add('favorited');
        icon.innerHTML = '<path stroke="none" fill="currentColor" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>';
    } else {
        button.classList.remove('favorited');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>';
    }
}

// ===== Export to window for global access =====
window.Utils = {
    // Sanitization
    sanitizeHTML,
    sanitizeInput,
    sanitizeEmail,
    sanitizePhone,
    sanitizePrice,

    // Formatting
    truncateText,
    formatCurrency,
    formatRelativeTime,
    escapeRegex,

    // Performance
    debounce,
    throttle,

    // Helpers
    generateId,

    // Favorites
    createFavoriteButton,
    attachFavoriteHandlers,
    updateFavoriteButtonState
};

console.log('✅ Utility functions loaded - Sanitization and helpers ready');
