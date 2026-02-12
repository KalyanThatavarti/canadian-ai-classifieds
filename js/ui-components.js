// ================================
// UI Components - Toast Notifications & Loading Spinners
// ================================

// ===== Toast Notification System =====

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'warning', 'info'
 * @param {string} title - Optional title
 * @param {number} duration - Duration in ms (default: 3000)
 */
function showToast(message, type = 'info', title = '', duration = 5000) {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    // Build toast HTML
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
        <div class="toast-progress"></div>
    `;

    // Add to container
    container.appendChild(toast);

    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => dismissToast(toast));

    // Auto dismiss
    setTimeout(() => dismissToast(toast), duration);

    return toast;
}

/**
 * Dismiss a toast
 */
function dismissToast(toast) {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
}

/**
 * Show success toast
 */
function showSuccessToast(message, title = 'Success', duration = 10000) {
    return showToast(message, 'success', title, duration);
}

/**
 * Show error toast
 */
function showErrorToast(message, title = 'Error', duration = 60000) {
    return showToast(message, 'error', title, duration);
}

/**
 * Show warning toast
 */
function showWarningToast(message, title = 'Warning', duration = 60000) {
    return showToast(message, 'warning', title, duration);
}

/**
 * Show info toast
 */
function showInfoToast(message, title = '', duration = 10000) {
    return showToast(message, 'info', title, duration);
}

// ===== Loading Spinner System =====

let loadingOverlay = null;

/**
 * Show loading overlay
 * @param {string} text - Loading text to display
 * @param {string} subtext - Optional subtext
 */
function showLoading(text = 'Loading...', subtext = '') {
    // Create overlay if it doesn't exist
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner-container">
                <div class="loading-spinner"></div>
                <div class="loading-text"></div>
                ${subtext ? '<div class="loading-subtext"></div>' : ''}
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    // Update text
    const textEl = loadingOverlay.querySelector('.loading-text');
    const subtextEl = loadingOverlay.querySelector('.loading-subtext');

    textEl.textContent = text;
    if (subtextEl && subtext) {
        subtextEl.textContent = subtext;
    }

    // Show overlay
    setTimeout(() => loadingOverlay.classList.add('active'), 10);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
        setTimeout(() => {
            if (loadingOverlay && !loadingOverlay.classList.contains('active')) {
                loadingOverlay.remove();
                loadingOverlay = null;
            }
        }, 300);
    }

    // Restore body scroll
    document.body.style.overflow = '';
}

/**
 * Set button to loading state
 * @param {HTMLElement} button - Button element
 */
function setButtonLoading(button) {
    button.classList.add('loading');
    button.disabled = true;
    button.dataset.originalText = button.textContent;
}

/**
 * Remove loading state from button
 * @param {HTMLElement} button - Button element
 */
function removeButtonLoading(button) {
    button.classList.remove('loading');
    button.disabled = false;
    if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
    }
}

// ===== Modal Dialog System =====

/**
 * Show a modal dialog (better than alert)
 * @param {string} message - Message to display
 * @param {string} title - Modal title
 * @param {Object} options - { confirmText, cancelText, onConfirm, onCancel }
 */
function showModal(message, title = 'Notice', options = {}) {
    const {
        confirmText = 'OK',
        cancelText = null,
        onConfirm = null,
        onCancel = null
    } = options;

    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'loading-overlay active'; // Reuse overlay styles

    modal.innerHTML = `
        <div class="loading-spinner-container" style="max-width: 400px; padding: 2rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; color: #111827;">${title}</h3>
            <p style="margin: 0 0 1.5rem 0; color: #6b7280; line-height: 1.6;">${message}</p>
            <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                ${cancelText ? `<button class="btn btn-secondary modal-cancel">${cancelText}</button>` : ''}
                <button class="btn btn-primary modal-confirm">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle confirm
    const confirmBtn = modal.querySelector('.modal-confirm');
    confirmBtn.addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });

    // Handle cancel
    if (cancelText) {
        const cancelBtn = modal.querySelector('.modal-cancel');
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            if (onCancel) onCancel();
        });
    }

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    });

    return modal;
}

// ===== Export to window for global access =====
window.UIComponents = {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showLoading,
    hideLoading,
    setButtonLoading,
    removeButtonLoading,
    showModal
};

console.log('✅ UI Components loaded - Toast, Loading, Modal systems ready');
