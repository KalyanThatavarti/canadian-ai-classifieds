// ================================
//   Autocomplete Component
//   Provides search suggestions and recent searches
// ================================

class Autocomplete {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.options = {
            minChars: 2,
            maxSuggestions: 5,
            debounceTime: 300,
            onSelect: null,
            searchEngine: null,
            ...options
        };

        this.dropdown = null;
        this.suggestions = [];
        this.selectedIndex = -1;
        this.isOpen = false;

        this.init();
    }

    /**
     * Initialize autocomplete
     */
    init() {
        // Create dropdown element
        this.createDropdown();

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Create dropdown element
     */
    createDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'autocomplete-dropdown';
        this.dropdown.style.display = 'none';

        // Insert after input element
        this.input.parentNode.insertBefore(this.dropdown, this.input.nextSibling);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Input events
        this.input.addEventListener('input', debounce((e) => {
            this.handleInput(e.target.value);
        }, this.options.debounceTime));

        this.input.addEventListener('focus', () => {
            if (this.input.value.length >= this.options.minChars) {
                this.handleInput(this.input.value);
            } else {
                this.showRecentSearches();
            }
        });

        // Keyboard navigation
        this.input.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
                this.close();
            }
        });
    }

    /**
     * Handle input changes
     * @param {string} value - Input value
     */
    handleInput(value) {
        if (value.length < this.options.minChars) {
            this.close();
            return;
        }

        // Get suggestions from search engine
        if (this.options.searchEngine) {
            this.suggestions = this.options.searchEngine.getSuggestions(
                value,
                this.options.maxSuggestions
            );
        }

        // Get recent searches that match
        const recentSearches = this.getRecentSearches();
        const matchingRecent = recentSearches.filter(search =>
            search.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 3);

        this.render(this.suggestions, matchingRecent);
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        if (!this.isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(
                    this.selectedIndex + 1,
                    this.dropdown.querySelectorAll('.autocomplete-item').length - 1
                );
                this.updateSelection();
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;

            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    const items = this.dropdown.querySelectorAll('.autocomplete-item');
                    if (items[this.selectedIndex]) {
                        this.selectItem(items[this.selectedIndex].textContent);
                    }
                } else {
                    // Submit search with current input value
                    this.selectItem(this.input.value);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }

    /**
     * Update visual selection
     */
    updateSelection() {
        const items = this.dropdown.querySelectorAll('.autocomplete-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    /**
     * Select an item
     * @param {string} value - Selected value
     */
    selectItem(value) {
        this.input.value = value;
        this.saveRecentSearch(value);
        this.close();

        if (this.options.onSelect) {
            this.options.onSelect(value);
        }
    }

    /**
     * Render dropdown with suggestions
     * @param {Array} suggestions - Search suggestions
     * @param {Array} recent - Recent searches
     */
    render(suggestions, recent = []) {
        this.dropdown.innerHTML = '';

        // Recent searches section
        if (recent.length > 0 && this.input.value.length < this.options.minChars) {
            const recentSection = document.createElement('div');
            recentSection.className = 'autocomplete-section';
            recentSection.innerHTML = `
                <div class="autocomplete-section-header">
                    <span>Recent Searches</span>
                    <button class="clear-recent-btn" type="button">Clear</button>
                </div>
            `;

            recent.forEach(search => {
                const item = this.createItem(search, 'recent');
                recentSection.appendChild(item);
            });

            this.dropdown.appendChild(recentSection);

            // Clear recent searches button
            const clearBtn = recentSection.querySelector('.clear-recent-btn');
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearRecentSearches();
                this.close();
            });
        }

        // Suggestions section
        if (suggestions.length > 0) {
            const suggestionsSection = document.createElement('div');
            suggestionsSection.className = 'autocomplete-section';

            if (recent.length > 0) {
                suggestionsSection.innerHTML = `
                    <div class="autocomplete-section-header">Suggestions</div>
                `;
            }

            suggestions.forEach(suggestion => {
                const item = this.createItem(suggestion, 'suggestion');
                suggestionsSection.appendChild(item);
            });

            this.dropdown.appendChild(suggestionsSection);
        }

        // Show/hide dropdown
        if (this.dropdown.children.length > 0) {
            this.open();
        } else {
            this.close();
        }
    }

    /**
     * Create autocomplete item
     * @param {string} text - Item text
     * @param {string} type - Item type (suggestion or recent)
     * @returns {HTMLElement} Item element
     */
    createItem(text, type) {
        const item = document.createElement('div');
        item.className = `autocomplete-item autocomplete-${type}`;

        // Highlight matching text
        const query = this.input.value;
        const regex = new RegExp(`(${query})`, 'gi');
        const highlightedText = text.replace(regex, '<strong>$1</strong>');

        item.innerHTML = `
            <svg class="autocomplete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${type === 'recent' ? `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                ` : `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                `}
            </svg>
            <span>${highlightedText}</span>
        `;

        item.addEventListener('click', () => {
            this.selectItem(text);
        });

        return item;
    }

    /**
     * Show recent searches
     */
    showRecentSearches() {
        const recent = this.getRecentSearches();
        if (recent.length > 0) {
            this.render([], recent);
        }
    }

    /**
     * Get recent searches from localStorage
     * @returns {Array} Recent searches
     */
    getRecentSearches() {
        try {
            const searches = localStorage.getItem('recentSearches');
            return searches ? JSON.parse(searches) : [];
        } catch (e) {
            console.error('Error loading recent searches:', e);
            return [];
        }
    }

    /**
     * Save search to recent searches
     * @param {string} search - Search query
     */
    saveRecentSearch(search) {
        if (!search || search.trim().length < 2) return;

        try {
            let searches = this.getRecentSearches();

            // Remove if already exists
            searches = searches.filter(s => s !== search);

            // Add to beginning
            searches.unshift(search);

            // Keep only last 10
            searches = searches.slice(0, 10);

            localStorage.setItem('recentSearches', JSON.stringify(searches));
        } catch (e) {
            console.error('Error saving recent search:', e);
        }
    }

    /**
     * Clear recent searches
     */
    clearRecentSearches() {
        try {
            localStorage.removeItem('recentSearches');
        } catch (e) {
            console.error('Error clearing recent searches:', e);
        }
    }

    /**
     * Open dropdown
     */
    open() {
        this.dropdown.style.display = 'block';
        this.isOpen = true;
        this.selectedIndex = -1;
    }

    /**
     * Close dropdown
     */
    close() {
        this.dropdown.style.display = 'none';
        this.isOpen = false;
        this.selectedIndex = -1;
    }

    /**
     * Destroy autocomplete
     */
    destroy() {
        if (this.dropdown && this.dropdown.parentNode) {
            this.dropdown.parentNode.removeChild(this.dropdown);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Autocomplete;
}
