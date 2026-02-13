// ================================
// Global Favorites Utilities
// Add this to firebase-config.js or create a separate favorites-utils.js
// ================================

/**
 * Add a listing to user's favorites
 * @param {string} userId - The user's ID
 * @param {string} listingId - The listing ID to favorite
 * @returns {Promise<void>}
 */
async function addToFavorites(userId, listingId) {
    try {
        await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('favorites')
            .doc(listingId)
            .set({
                listingId: listingId,
                addedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        // Update count
        const count = await getFavoritesCount(userId);
        if (window.updateFavoritesCount) {
            window.updateFavoritesCount(count);
        }

        console.log('✅ Added to favorites:', listingId);
        return true;
    } catch (error) {
        console.error('❌ Error adding to favorites:', error);
        throw error;
    }
}

/**
 * Remove a listing from user's favorites
 * @param {string} userId - The user's ID
 * @param {string} listingId - The listing ID to unfavorite
 * @returns {Promise<void>}
 */
async function removeFromFavorites(userId, listingId) {
    try {
        await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('favorites')
            .doc(listingId)
            .delete();

        // Update count
        const count = await getFavoritesCount(userId);
        if (window.updateFavoritesCount) {
            window.updateFavoritesCount(count);
        }

        console.log('✅ Removed from favorites:', listingId);
        return true;
    } catch (error) {
        console.error('❌ Error removing from favorites:', error);
        throw error;
    }
}

/**
 * Check if a listing is favorited
 * @param {string} userId - The user's ID
 * @param {string} listingId - The listing ID to check
 * @returns {Promise<boolean>}
 */
async function isFavorited(userId, listingId) {
    try {
        const doc = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('favorites')
            .doc(listingId)
            .get();

        return doc.exists;
    } catch (error) {
        console.error('Error checking favorite status:', error);
        return false;
    }
}

/**
 * Get total count of user's favorites
 * @param {string} userId - The user's ID
 * @returns {Promise<number>}
 */
async function getFavoritesCount(userId) {
    try {
        const snapshot = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('favorites')
            .get();

        return snapshot.size;
    } catch (error) {
        console.error('Error getting favorites count:', error);
        return 0;
    }
}

/**
 * Setup real-time listener for favorites count
 * @param {string} userId - The user's ID
 * @param {Function} callback - Callback function(count)
 * @returns {Function} Unsubscribe function
 */
function listenToFavoritesCount(userId, callback) {
    return firebase.firestore()
        .collection('users')
        .doc(userId)
        .collection('favorites')
        .onSnapshot((snapshot) => {
            const count = snapshot.size;
            callback(count);
        }, (error) => {
            console.error('Error listening to favorites:', error);
        });
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.FavoritesAPI = {
        add: addToFavorites,
        remove: removeFromFavorites,
        isFavorited: isFavorited,
        getCount: getFavoritesCount,
        listen: listenToFavoritesCount
    };
}
