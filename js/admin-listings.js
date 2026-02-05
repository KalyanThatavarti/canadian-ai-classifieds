/**
 * Admin Listings Management JavaScript
 * Handles listing moderation, filtering, and deletion
 */

let allListings = [];
let currentDeleteListingId = null;

// Init page
document.addEventListener('DOMContentLoaded', async () => {
    // Check admin access
    const hasAccess = await requireAdmin();
    if (!hasAccess) return;

    // Load listings
    await loadListings();

    // Set up filters
    setupFilters();

    // Hide loading, show table
    document.getElementById('loading').style.display = 'none';
    document.getElementById('listingsContainer').style.display = 'block';
});

/**
 * Load all listings from Firestore
 */
async function loadListings() {
    try {
        const db = firebase.firestore();
        const listingsSnapshot = await db.collection('listings')
            .orderBy('createdAt', 'desc')
            .get();

        allListings = [];

        for (const doc of listingsSnapshot.docs) {
            const listing = {
                id: doc.id,
                ...doc.data()
            };
            allListings.push(listing);
        }

        console.log(`✅ Loaded ${allListings.length} listings`);

        displayListings(allListings);
    } catch (error) {
        console.error('❌ Error loading listings:', error);

        if (window.UIComponents) {
            window.UIComponents.showErrorToast(
                'Failed to load listings',
                'Error'
            );
        }
    }
}

/**
 * Display listings in table
 */
function displayListings(listings) {
    const tbody = document.getElementById('listingsTableBody');
    const noResults = document.getElementById('noResults');

    if (listings.length === 0) {
        tbody.innerHTML = '';
        document.getElementById('listingsContainer').style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    document.getElementById('listingsContainer').style.display = 'block';
    noResults.style.display = 'none';

    tbody.innerHTML = listings.map(listing => createListingRow(listing)).join('');
}

/**
 * Create table row HTML for a listing
 */
function createListingRow(listing) {
    const imageUrl = listing.images && listing.images.length > 0
        ? listing.images[0]
        : '/images/placeholder.png';

    const statusClass = listing.status === 'active' ? 'status-active' :
        listing.status === 'sold' ? 'status-sold' :
            listing.isFlagged ? 'status-flagged' : 'status-active';

    const statusText = listing.isFlagged ? 'flagged' : listing.status || 'active';

    const postedDate = listing.createdAt
        ? formatDate(listing.createdAt)
        : 'Unknown';

    return `
        <tr>
            <td>
                <img src="${imageUrl}" alt="${listing.title}" class="listing-image">
            </td>
            <td>
                <div class="listing-title">${listing.title || 'Untitled'}</div>
                <div class="listing-meta">
                    ${listing.category || 'Uncategorized'} • ${listing.location || 'Unknown location'}
                </div>
                <div class="listing-meta">
                    By: ${listing.userName || 'Unknown user'} (${listing.userId})
                </div>
            </td>
            <td>
                <div class="price">$${listing.price?.toLocaleString() || '0'}</div>
            </td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${statusText}
                </span>
                ${listing.isFlagged ? `<div class="listing-meta" style="margin-top: 4px;">Reports: ${listing.reportCount || 0}</div>` : ''}
            </td>
            <td>
                <div class="listing-meta">${postedDate}</div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewListing('${listing.id}')">
                        View
                    </button>
                    <button class="btn-action btn-delete" onclick="openDeleteModal('${listing.id}')">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Setup filter event listeners
 */
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
}

/**
 * Apply all filters
 */
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;

    let filtered = allListings;

    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(listing =>
            listing.title?.toLowerCase().includes(searchTerm) ||
            listing.description?.toLowerCase().includes(searchTerm)
        );
    }

    // Category filter
    if (category) {
        filtered = filtered.filter(listing => listing.category === category);
    }

    // Status filter
    if (status) {
        if (status === 'flagged') {
            filtered = filtered.filter(listing => listing.isFlagged === true);
        } else {
            filtered = filtered.filter(listing => listing.status === status);
        }
    }

    displayListings(filtered);
}

/**
 * View listing details
 */
function viewListing(listingId) {
    window.open(`/pages/listing-detail.html?id=${listingId}`, '_blank');
}

/**
 * Open delete confirmation modal
 */
function openDeleteModal(listingId) {
    currentDeleteListingId = listingId;
    document.getElementById('deleteReason').value = '';
    document.getElementById('deleteModal').classList.add('active');
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
    currentDeleteListingId = null;
    document.getElementById('deleteModal').classList.remove('active');
}

/**
 * Confirm and execute deletion
 */
async function confirmDelete() {
    if (!currentDeleteListingId) return;

    const reason = document.getElementById('deleteReason').value.trim();

    if (!reason) {
        if (window.UIComponents) {
            window.UIComponents.showErrorToast(
                'Please provide a reason for deletion',
                'Reason Required'
            );
        }
        return;
    }

    try {
        const db = firebase.firestore();

        // Delete the listing
        await db.collection('listings').doc(currentDeleteListingId).delete();

        // Log the action
        await logAdminAction('delete_listing', currentDeleteListingId, reason);

        console.log(`✅ Listing ${currentDeleteListingId} deleted`);

        if (window.UIComponents) {
            window.UIComponents.showSuccessToast(
                'Listing deleted successfully',
                'Success'
            );
        }

        // Remove from local array
        allListings = allListings.filter(l => l.id !== currentDeleteListingId);

        // Refresh display
        applyFilters();

        // Close modal
        closeDeleteModal();

    } catch (error) {
        console.error('❌ Error deleting listing:', error);

        if (window.UIComponents) {
            window.UIComponents.showErrorToast(
                'Failed to delete listing',
                'Error'
            );
        }
    }
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Close modal on outside click
document.getElementById('deleteModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'deleteModal') {
        closeDeleteModal();
    }
});
