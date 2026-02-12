// ================================================================
// My Listings Page JavaScript
// Handles listing management, editing, status updates
// ================================================================

document.addEventListener('DOMContentLoaded', async function () {
    let currentUser = null;
    let allListings = [];
    let currentFilter = 'all';

    // Wait for Firebase
    await waitForFirebase();

    // Wait for auth state to be initialized
    window.FirebaseAPI.auth.onAuthStateChanged(async (user) => {
        if (!user) {
            // Not logged in - redirect to login without showing alert
            window.location.href = '/index.html';
            return;
        }

        currentUser = user;

        // Load listings
        await loadListings();

        // Setup event listeners
        setupEventListeners();
    });

    // ===== localStorage Helpers =====

    function saveListingsToLocalStorage() {
        try {
            const storageKey = `myListings_${currentUser.uid}`;
            localStorage.setItem(storageKey, JSON.stringify(allListings));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    function loadListingsFromLocalStorage() {
        try {
            const storageKey = `myListings_${currentUser.uid}`;
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    // ===== Load Listings =====

    async function loadListings() {
        console.log('loadListings called');

        try {
            // Always try to fetch fresh data from Firestore first
            console.log('Fetching listings from Firestore...');
            try {
                // Try to get listings from Firestore
                const firestoreListings = await window.FirebaseAPI.getUserListings(currentUser.uid, 'all');
                console.log('Firestore returned:', firestoreListings.length, 'listings');

                // If we got data (or empty array) from Firestore, use it
                allListings = firestoreListings;

                // Save fresh data to localStorage
                saveListingsToLocalStorage();
            } catch (firestoreError) {
                console.log('Firestore error:', firestoreError);
                console.warn('Falling back to localStorage due to network error');

                // Fallback to localStorage only on error
                const savedListings = loadListingsFromLocalStorage();
                if (savedListings) {
                    allListings = savedListings;
                } else {
                    allListings = [];
                }
            }

            // Sample data fallback removed. No listings = Empty State.
            if (allListings.length === 0) {
                console.log('No listings found (fresh fetch).');
            }

            console.log('Final allListings:', allListings.length);

            // Update counts
            updateCounts();

            // Render listings
            renderListings(currentFilter);

        } catch (error) {
            console.error('Error loading listings:', error);
            allListings = [];
            updateCounts();
            renderListings(currentFilter);
        } finally {
            // ALWAYS hide loading, no matter what
            if (window.UIComponents) {
                window.UIComponents.hideLoading();
            }
            console.log('Loading complete');
        }
    }

    function updateCounts() {
        const active = allListings.filter(l => l.status === 'active').length;
        const sold = allListings.filter(l => l.status === 'sold').length;
        const deleted = allListings.filter(l => l.status === 'deleted').length;

        console.log('updateCounts - Total:', allListings.length, 'Active:', active, 'Sold:', sold, 'Deleted:', deleted);
        console.log('updateCounts - Listing statuses:', allListings.map(l => `${l.id}: ${l.status}`));

        document.getElementById('allCount').textContent = `(${allListings.length})`;
        document.getElementById('activeCount').textContent = `(${active})`;
        document.getElementById('soldCount').textContent = `(${sold})`;
        document.getElementById('deletedCount').textContent = `(${deleted})`;

        console.log('updateCounts - DOM updated');
    }

    function renderListings(filter) {
        console.log('renderListings called with filter:', filter);
        const container = document.getElementById('listingsContainer');
        const emptyState = document.getElementById('emptyState');

        // Filter listings
        let filtered = allListings;
        if (filter !== 'all') {
            filtered = allListings.filter(l => l.status === filter);
        }

        console.log('Filtered listings count:', filtered.length);

        // Show empty state if no listings
        if (filtered.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        // Render listing cards
        container.innerHTML = filtered.map(listing => createListingCard(listing)).join('');
        console.log('HTML rendered, container has', container.children.length, 'cards');

        // Add event listeners to action buttons
        attachListingActions();
    }

    function createListingCard(listing) {
        const categoryData = categories[listing.category] || { icon: '📦', name: 'Other' };
        // Use listing's first image if available, otherwise use a consistent fallback based on listing ID
        const imageUrl = listing.images && listing.images[0] ? listing.images[0] : `https://picsum.photos/400/300?seed=${listing.id}`;

        const statusBadge = {
            'active': '<span style="background: #E8F5E9; color: #2F5D3A; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Active</span>',
            'sold': '<span style="background: #FFF3E0; color: #E65100; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Sold</span>',
            'deleted': '<span style="background: #FFEBEE; color: #C62828; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Deleted</span>'
        };

        return `
            <div class="listing-card" data-id="${listing.id}" style="background: white; border-radius: 12px; overflow: hidden; border: 1px solid rgba(229, 221, 213, 0.3);">
                <div style="position: relative;">
                    <img src="${imageUrl}" alt="${listing.title}" style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="position: absolute; top: 0.75rem; right: 0.75rem;">
                        ${statusBadge[listing.status] || ''}
                    </div>
                </div>
                <div style="padding: 1rem;">
                    <div style="font-size: 0.75rem; color: #4a90e2; text-transform: uppercase; font-weight: 600; margin-bottom: 0.5rem;">
                        ${categoryData.icon} ${categoryData.name}
                    </div>
                    <h3 style="font-size: 1rem; font-weight: 600; color: #2C2C2C; margin: 0 0 0.5rem 0;">
                        ${listing.title}
                    </h3>
                    <div style="font-size: 1.25rem; font-weight: 600; color: #2F5D3A; margin: 0.5rem 0;">
                        $${listing.price.toLocaleString()}
                    </div>
                    
                    <!-- Stats -->
                    <div style="display: flex; gap: 1rem; margin: 1rem 0; padding-top: 1rem; border-top: 1px solid #f0f0f0;">
                        <div style="display: flex; align-items: center; gap: 0.25rem; color: #666; font-size: 0.875rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            ${listing.views || 0}
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.25rem; color: #666; font-size: 0.875rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                            ${listing.favorites || 0}
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.5rem; position: relative; z-index: 10;">
                        ${listing.status !== 'deleted' ? `
                            <button class="action-btn edit-listing-btn" data-id="${listing.id}" style="padding: 0.5rem; background: #EEF2FF; color: #4338CA; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.875rem; pointer-events: auto; position: relative; z-index: 100;">
                                Edit
                            </button>
                        ` : ''}
                        ${listing.status === 'active' ? `
                            <button class="action-btn mark-sold-btn" data-id="${listing.id}" style="padding: 0.5rem; background: #FFF3E0; color: #E65100; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.875rem; pointer-events: auto; position: relative; z-index: 100;">
                                Mark Sold
                            </button>
                        ` : ''}
                        ${listing.status === 'sold' || listing.status === 'deleted' ? `
                            <button class="action-btn reactivate-btn" data-id="${listing.id}" style="padding: 0.5rem; background: #E8F5E9; color: #2F5D3A; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.875rem; pointer-events: auto; position: relative; z-index: 100;">
                                Reactivate
                            </button>
                        ` : ''}
                        <button class="action-btn delete-btn" data-id="${listing.id}" style="padding: 0.5rem; background: #FFEBEE; color: #C62828; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.875rem; pointer-events: auto; position: relative; z-index: 100;">
                            ${listing.status === 'deleted' ? 'Delete Forever' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function attachListingActions() {
        console.log('attachListingActions called');

        // Edit Listing
        const editBtns = document.querySelectorAll('.edit-listing-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const listingId = btn.dataset.id;
                window.location.href = `/pages/post-ad.html?edit=${listingId}`;
            });
        });

        // Mark as sold
        const markSoldBtns = document.querySelectorAll('.mark-sold-btn');
        console.log('Found', markSoldBtns.length, 'mark-sold buttons');
        markSoldBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                console.log('🔴 CLICK DETECTED on mark-sold button!');
                e.preventDefault();
                e.stopPropagation();
                console.log('Mark sold clicked for:', btn.dataset.id);
                const listingId = btn.dataset.id;
                await markAsSold(listingId);
            });
        });

        // Reactivate
        const reactivateBtns = document.querySelectorAll('.reactivate-btn');
        console.log('Found', reactivateBtns.length, 'reactivate buttons');
        reactivateBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Reactivate clicked for:', btn.dataset.id);
                const listingId = btn.dataset.id;
                await reactivateListing(listingId);
            });
        });

        // Delete
        const deleteBtns = document.querySelectorAll('.delete-btn');
        console.log('Found', deleteBtns.length, 'delete buttons');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                console.log('🔴 CLICK DETECTED on delete button!');
                e.preventDefault();
                e.stopPropagation();
                console.log('Delete clicked for:', btn.dataset.id);
                const listingId = btn.dataset.id;
                const listing = allListings.find(l => l.id === listingId);

                if (listing && listing.status === 'deleted') {
                    if (confirm('Permanently delete this listing? This cannot be undone.')) {
                        await permanentlyDeleteListing(listingId);
                    }
                } else {
                    await softDeleteListing(listingId);
                }
            });
        });

        // Card click - Redirect to details
        const cards = document.querySelectorAll('.listing-card');
        cards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const listingId = card.dataset.id;
                window.location.href = `/pages/listing-detail.html?id=${listingId}`;
            });
        });

        console.log('All event listeners attached');
    }

    // ===== Actions =====

    async function markAsSold(listingId) {
        try {
            console.log('markAsSold - Looking for listing:', listingId);
            const listing = allListings.find(l => l.id === listingId);
            if (!listing) {
                console.error('Listing not found:', listingId);
                return;
            }

            console.log('markAsSold - Found listing, current status:', listing.status);

            // Try to update in Firestore first
            try {
                await window.FirebaseAPI.updateListing(listingId, { status: 'sold' });
                console.log('markAsSold - Firestore updated successfully');
            } catch (firestoreError) {
                console.log('Firestore update failed (expected for sample data), updating locally');
            }

            // Update local data
            listing.status = 'sold';
            console.log('markAsSold - Status updated to:', listing.status);

            // Save to localStorage for persistence
            saveListingsToLocalStorage();
            console.log('markAsSold - Saved to localStorage');

            // Update counts and re-render
            updateCounts();
            console.log('markAsSold - Counts updated');

            renderListings(currentFilter);
            console.log('markAsSold - Rendered with filter:', currentFilter);

            if (window.UIComponents) {
                window.UIComponents.showSuccessToast('Listing marked as sold!', 'Success');
            }
        } catch (error) {
            console.error('Error marking as sold:', error);
            if (window.UIComponents) {
                window.UIComponents.showErrorToast('Failed to update listing', 'Error');
            }
        }
    }

    async function reactivateListing(listingId) {
        try {
            const listing = allListings.find(l => l.id === listingId);
            if (!listing) return;

            // Try to update in Firestore first
            try {
                await window.FirebaseAPI.updateListing(listingId, { status: 'active' });
            } catch (firestoreError) {
                console.log('Firestore update failed (expected for sample data), updating locally');
            }

            listing.status = 'active';

            // Save to localStorage for persistence
            saveListingsToLocalStorage();

            updateCounts();
            renderListings(currentFilter);

            if (window.UIComponents) {
                window.UIComponents.showSuccessToast('Listing reactivated!', 'Success');
            }
        } catch (error) {
            console.error('Error reactivating:', error);
            if (window.UIComponents) {
                window.UIComponents.showErrorToast('Failed to reactivate listing', 'Error');
            }
        }
    }

    async function softDeleteListing(listingId) {
        try {
            console.log('softDeleteListing - Looking for listing:', listingId);
            const listing = allListings.find(l => l.id === listingId);
            if (!listing) {
                console.error('Listing not found:', listingId);
                return;
            }

            console.log('softDeleteListing - Found listing, current status:', listing.status);

            // Try to update in Firestore first
            try {
                await window.FirebaseAPI.deleteListing(listingId);
                console.log('softDeleteListing - Firestore deleted successfully');
            } catch (firestoreError) {
                console.log('Firestore delete failed (expected for sample data), updating locally');
            }

            listing.status = 'deleted';
            console.log('softDeleteListing - Status updated to:', listing.status);

            // Save to localStorage for persistence
            saveListingsToLocalStorage();
            console.log('softDeleteListing - Saved to localStorage');

            // Update counts and re-render
            updateCounts();
            console.log('softDeleteListing - Counts updated');

            renderListings(currentFilter);
            console.log('softDeleteListing - Rendered with filter:', currentFilter);

            if (window.UIComponents) {
                window.UIComponents.showSuccessToast('Listing deleted', 'Deleted');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            if (window.UIComponents) {
                window.UIComponents.showErrorToast('Failed to delete listing', 'Error');
            }
        }
    }

    async function permanentlyDeleteListing(listingId) {
        // Remove from local array
        allListings = allListings.filter(l => l.id !== listingId);

        // Save to localStorage for persistence
        saveListingsToLocalStorage();

        updateCounts();
        renderListings(currentFilter);

        if (window.UIComponents) {
            window.UIComponents.showSuccessToast('Listing permanently deleted', 'Deleted');
        }
    }

    // ===== Event Listeners =====

    function setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                currentFilter = filter;

                // Update active tab
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Render filtered listings
                renderListings(filter);
            });
        });
    }

    // ===== Helper Functions =====

    function waitForFirebase(timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (window.FirebaseAPI && window.FirebaseAPI.auth) {
                resolve(true);
                return;
            }

            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (window.FirebaseAPI && window.FirebaseAPI.auth) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error('Firebase initialization timeout'));
                }
            }, 100);
        });
    }

    console.log('✅ My Listings page loaded');
});
