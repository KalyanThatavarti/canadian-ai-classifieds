// ================================
// Favorites Page JavaScript
// ================================

document.addEventListener('DOMContentLoaded', async function () {
    const favoritesContainer = document.getElementById('favoritesContainer');
    const emptyState = document.getElementById('emptyState');

    // Check authentication
    if (!window.FirebaseAPI) {
        console.error('Firebase API not loaded');
        showEmptyState();
        return;
    }

    // Wait for auth state
    window.FirebaseAPI.auth.onAuthStateChanged(async (user) => {
        if (!user) {
            // Not logged in - redirect to login
            window.location.href = 'auth/login.html';
            return;
        }

        // Load favorites
        await loadFavorites(user.uid);
    });

    async function loadFavorites(userId) {
        try {
            showLoadingState();

            // Get user's favorites from Firestore
            const favoritesSnapshot = await firebase.firestore()
                .collection('users')
                .doc(userId)
                .collection('favorites')
                .orderBy('addedAt', 'desc')
                .get();

            if (favoritesSnapshot.empty) {
                showEmptyState();
                updateFavoritesCount(0);
                return;
            }

            // Get listing details for each favorite
            const favorites = [];
            for (const doc of favoritesSnapshot.docs) {
                const favoriteData = doc.data();
                const listingId = favoriteData.listingId;

                // Fetch listing details
                const listingDoc = await firebase.firestore()
                    .collection('listings')
                    .doc(listingId)
                    .get();

                if (listingDoc.exists) {
                    favorites.push({
                        id: listingDoc.id,
                        ...listingDoc.data(),
                        favoriteDocId: doc.id,
                        addedAt: favoriteData.addedAt
                    });
                }
            }

            if (favorites.length === 0) {
                showEmptyState();
                updateFavoritesCount(0);
            } else {
                displayFavorites(favorites);
                updateFavoritesCount(favorites.length);
            }

        } catch (error) {
            console.error('Error loading favorites:', error);
            showToast('Failed to load favorites', 'error');
            showEmptyState();
        }
    }

    function displayFavorites(favorites) {
        favoritesContainer.innerHTML = '';
        emptyState.style.display = 'none';

        favorites.forEach(listing => {
            const card = createListingCard(listing);
            favoritesContainer.appendChild(card);
        });
    }

    function createListingCard(listing) {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.style.cssText = `
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
            position: relative;
        `;

        const imageUrl = listing.images && listing.images[0] ? listing.images[0] : '../images/placeholder.jpg';
        const price = listing.price ? `$${parseFloat(listing.price).toLocaleString()}` : 'Contact for price';
        const locationText = (typeof listing.location === 'object' && listing.location)
            ? `${listing.location.city || ''}${listing.location.city && listing.location.province ? ', ' : ''}${listing.location.province || ''}` || 'Location not specified'
            : listing.location || 'Location not specified';
        const title = listing.title || 'Untitled';

        card.innerHTML = `
            <div style="position: relative;">
                <img src="${imageUrl}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover;">
                <button class="unfavorite-btn" 
                        data-listing-id="${listing.id}" 
                        style="position: absolute; top: 12px; right: 12px; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: all 0.2s; z-index: 100; pointer-events: auto; outline: none; -webkit-tap-highlight-color: transparent;">
                    <svg style="width: 24px; height: 24px; fill: #ef4444; pointer-events: none;" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
            </div>
            <div class="card-details" style="padding: 1rem;">
                <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: #2C2C2C;">${title}</h3>
                <p style="font-size: 1.25rem; font-weight: 700; color: #2F5D3A; margin-bottom: 0.5rem;">${price}</p>
                <p style="font-size: 0.875rem; color: #666; display: flex; align-items: center; gap: 0.25rem;">
                    <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    ${locationText}
                </p>
            </div>
        `;

        // Unfavorite button handler
        const unfavoriteBtn = card.querySelector('.unfavorite-btn');
        unfavoriteBtn.addEventListener('click', async (e) => {
            console.log('🔴 Unfavorite button clicked! ID:', listing.id);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            await removeFavorite(listing.id, card);
        }, true); // Use capture phase to intercept

        // Card navigation handler (excluding button)
        card.addEventListener('click', (e) => {
            // Robust check: check if click was on button OR any child of button
            if (e.target.closest('.unfavorite-btn')) {
                console.log('⚠️ Click intercepted - stopping navigation');
                return;
            }
            console.log('➡️ Navigating to listing detail:', listing.id);
            window.location.href = `listing-detail.html?id=${listing.id}`;
        });

        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });

        // Hover effect for unfavorite button
        unfavoriteBtn.addEventListener('mouseenter', () => {
            unfavoriteBtn.style.transform = 'scale(1.1)';
        });
        unfavoriteBtn.addEventListener('mouseleave', () => {
            unfavoriteBtn.style.transform = 'scale(1)';
        });

        return card;
    }

    async function removeFavorite(listingId, cardElement) {
        const user = firebase.auth().currentUser;
        if (!user) return;

        try {
            // Delete from Firestore
            await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .collection('favorites')
                .doc(listingId)
                .delete();

            // Animate removal
            cardElement.style.transition = 'opacity 0.3s, transform 0.3s';
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'scale(0.8)';

            setTimeout(() => {
                cardElement.remove();

                // Check if any favorites left
                const remainingCards = favoritesContainer.querySelectorAll('.listing-card');
                if (remainingCards.length === 0) {
                    showEmptyState();
                }

                // Update count
                updateFavoritesCount(remainingCards.length);
            }, 300);

            showToast('Removed from favorites', 'success');

        } catch (error) {
            console.error('Error removing favorite:', error);
            showToast('Failed to remove favorite', 'error');
        }
    }

    function updateFavoritesCount(count) {
        // Call global function from header.js
        if (window.updateFavoritesCount) {
            window.updateFavoritesCount(count);
        }
    }

    function showLoadingState() {
        favoritesContainer.innerHTML = '<div style="text-align: center; padding: 4rem; color: #666;">Loading your favorites...</div>';
        emptyState.style.display = 'none';
    }

    function showEmptyState() {
        favoritesContainer.innerHTML = '';
        emptyState.style.display = 'block';
    }

    function showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
