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
    generateId
};

console.log('✅ Utility functions loaded - Sanitization and helpers ready');
