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

    const statusBadge = getListingStatusBadge(listing);
    const postedDate = listing.createdAt ? formatDate(listing.createdAt) : 'Unknown';

    const locationStr = typeof listing.location === 'object' && listing.location !== null
        ? (listing.location.city ? `${listing.location.city}, ${listing.location.province || ''}` : listing.location.name || 'Canada')
        : (listing.location || 'Canada');

    return `
        <tr>
            <td>
                <div style="position: relative; width: 64px; height: 64px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05);">
                    <img src="${imageUrl}" alt="${listing.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </td>
            <td>
                <div style="display:flex; flex-direction:column; gap: 4px;">
                    <div style="font-weight: 700; color: #111827; font-size: 1.05rem; letter-spacing: -0.01em;">${listing.title || 'Untitled Listing'}</div>
                    <div style="display:flex; align-items:center; gap: 8px; font-size: 0.8rem;">
                        <span style="background: #eef2ff; color: #4338ca; padding: 2px 8px; border-radius: 6px; font-weight: 700;">${listing.category || 'Legacy'}</span>
                        <span style="color: #64748b; font-weight: 500;"><i class="fas fa-map-marker-alt" style="margin-right: 4px; color: #94a3b8;"></i>${locationStr}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">
                        By <span style="font-weight: 600; color: #475569;">${listing.seller?.name || listing.userName || 'Anonymous'}</span>
                    </div>
                </div>
            </td>
            <td>
                <div style="font-weight: 800; color: #111827; font-size: 1.1rem; font-variant-numeric: tabular-nums;">
                    $${listing.price?.toLocaleString() || '0'}
                </div>
            </td>
            <td>
                ${statusBadge}
                ${listing.isFlagged ? `<div style="font-size: 0.7rem; color: #ea580c; font-weight: 600; margin-top: 6px;"><i class="fas fa-flag"></i> ${listing.reportCount || 0} Reports</div>` : ''}
            </td>
            <td>
                <div style="font-size: 0.85rem; color: #64748b; font-weight: 500;">${postedDate}</div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewListing('${listing.id}')" title="View Details">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="openDeleteModal('${listing.id}')" title="Delete Listing">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Get listing status badge
 */
function getListingStatusBadge(listing) {
    if (listing.isFlagged) {
        return '<span class="status-badge status-flagged" style="border: 1px solid #fecaca;"><i class="fas fa-flag"></i> Flagged</span>';
    }

    if (listing.status === 'sold') {
        return '<span class="status-badge status-sold" style="border: 1px solid #fde68a;"><i class="fas fa-tag"></i> Sold</span>';
    }

    return '<span class="status-badge status-active" style="border: 1px solid #bdf2d5;"><i class="fas fa-check-circle"></i> Active</span>';
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
    document.getElementById('deleteModal').style.display = 'block';
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
    currentDeleteListingId = null;
    document.getElementById('deleteModal').style.display = 'none';
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
        await logAdminAction('delete_listing', {
            targetId: currentDeleteListingId,
            targetName: allListings.find(l => l.id === currentDeleteListingId)?.title || 'Unknown Listing',
            reason: reason
        });

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
