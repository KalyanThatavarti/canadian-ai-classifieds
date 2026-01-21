// ================================
// 🔥 Canadian AI Classifieds - Firebase Configuration
// ================================

// ⚠️ STEP 1: Replace this config with YOUR values from Firebase Console
// Get your config from: https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
const firebaseConfig = {
    apiKey: "AIzaSyCRKj_NwastndKYdfIkfYDy_Q7Ox5OVaSc",
    authDomain: "canadian-ai-classifieds.firebaseapp.com",
    projectId: "canadian-ai-classifieds",
    storageBucket: "canadian-ai-classifieds.firebasestorage.app",
    messagingSenderId: "1016245908858",
    appId: "1:1016245908858:web:f787299038dad64f7ad2c3"
};

// ⚠️ STEP 2: After adding your config above, UNCOMMENT the code below (remove the /* and */)

// ===== Initialize Firebase =====
console.log('🔥 Initializing Firebase...');

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log('✅ Firebase initialized successfully!');
console.log('✅ Authentication ready');
console.log('✅ Firestore ready');
console.log('✅ Storage ready');

// ===== Authentication Helper Functions =====

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @returns {Promise<Object>} User object
 */
async function signUpWithEmail(email, password, displayName) {
    try {
        // Create authentication account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update display name
        await user.updateProfile({ displayName: displayName });

        // Send email verification
        await user.sendEmailVerification();

        // Create user profile in Firestore
        await db.collection('users').doc(user.uid).set({
            email: email,
            displayName: displayName,
            emailVerified: false,
            phoneVerified: false,
            idVerified: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            trustScore: 0,
            totalListings: 0,
            totalSales: 0
        });

        console.log('✅ User signed up:', user.uid);
        return user;
    } catch (error) {
        console.error('❌ Sign up error:', error.message);
        throw error;
    }
}

/**
 * Sign in existing user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object
 */
async function signInWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ User signed in:', userCredential.user.uid);
        return userCredential.user;
    } catch (error) {
        console.error('❌ Sign in error:', error.message);
        throw error;
    }
}

/**
 * Sign in with Google OAuth
 * @returns {Promise<Object>} User object
 */
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Check if this is a new user
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
            // Create profile for new Google user
            await db.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                phoneVerified: false,
                idVerified: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                trustScore: 10, // Google users get slight boost
                totalListings: 0,
                totalSales: 0
            });
        }

        console.log('✅ User signed in with Google:', user.uid);
        return user;
    } catch (error) {
        console.error('❌ Google sign in error:', error.message);
        throw error;
    }
}

/**
 * Sign out current user
 */
async function signOut() {
    try {
        await auth.signOut();
        console.log('✅ User signed out');
        // Redirect to home page
        window.location.href = '/index.html';
    } catch (error) {
        console.error('❌ Sign out error:', error.message);
        throw error;
    }
}

/**
 * Send password reset email
 * @param {string} email - User's email
 */
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('✅ Password reset email sent to:', email);
        return true;
    } catch (error) {
        console.error('❌ Password reset error:', error.message);
        throw error;
    }
}

// ===== Firestore Helper Functions =====

/**
 * Create a new listing
 * @param {Object} listingData - Listing data
 * @returns {Promise<string>} Listing ID
 */
async function createListing(listingData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User must be logged in to create listing');

        const listing = {
            ...listingData,
            userId: user.uid,
            userDisplayName: user.displayName,
            userPhotoURL: user.photoURL || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active',
            views: 0,
            favorites: 0
        };

        const docRef = await db.collection('listings').add(listing);

        // Update user's total listings count
        await db.collection('users').doc(user.uid).update({
            totalListings: firebase.firestore.FieldValue.increment(1),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Listing created:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Create listing error:', error.message);
        throw error;
    }
}

/**
 * Get listings with optional filters
 * @param {Object} filters - Filter options (category, location, maxPrice, etc.)
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Array of listings
 */
async function getListings(filters = {}, limit = 20) {
    try {
        let query = db.collection('listings')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(limit);

        // Apply filters
        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }

        if (filters.minPrice !== undefined) {
            query = query.where('price', '>=', filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
            query = query.where('price', '<=', filters.maxPrice);
        }

        const snapshot = await query.get();
        const listings = [];

        snapshot.forEach(doc => {
            listings.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ Retrieved ${listings.length} listings`);
        return listings;
    } catch (error) {
        console.error('❌ Get listings error:', error.message);
        throw error;
    }
}

/**
 * Get a single listing by ID
 * @param {string} listingId - Listing ID
 * @returns {Promise<Object>} Listing data
 */
async function getListing(listingId) {
    try {
        const doc = await db.collection('listings').doc(listingId).get();

        if (!doc.exists) {
            throw new Error('Listing not found');
        }

        // Increment view count
        await db.collection('listings').doc(listingId).update({
            views: firebase.firestore.FieldValue.increment(1)
        });

        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('❌ Get listing error:', error.message);
        throw error;
    }
}

/**
 * Update listing
 * @param {string} listingId - Listing ID
 * @param {Object} updates - Fields to update
 */
async function updateListing(listingId, updates) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User must be logged in');

        // Verify ownership
        const listing = await db.collection('listings').doc(listingId).get();
        if (listing.data().userId !== user.uid) {
            throw new Error('Unauthorized: Not the listing owner');
        }

        await db.collection('listings').doc(listingId).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Listing updated:', listingId);
    } catch (error) {
        console.error('❌ Update listing error:', error.message);
        throw error;
    }
}

/**
 * Delete listing (soft delete - mark as deleted)
 * @param {string} listingId - Listing ID
 */
async function deleteListing(listingId) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User must be logged in');

        // Verify ownership
        const listing = await db.collection('listings').doc(listingId).get();
        if (listing.data().userId !== user.uid) {
            throw new Error('Unauthorized: Not the listing owner');
        }

        await db.collection('listings').doc(listingId).update({
            status: 'deleted',
            deletedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Listing deleted:', listingId);
    } catch (error) {
        console.error('❌ Delete listing error:', error.message);
        throw error;
    }
}

// ===== Storage Helper Functions =====

/**
 * Upload images for a listing
 * @param {FileList} files - Image files to upload
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of download URLs
 */
async function uploadListingImages(files, userId) {
    try {
        const uploadPromises = Array.from(files).map(async (file, index) => {
            const storageRef = storage.ref();
            const fileName = `listings/${userId}/${Date.now()}_${index}_${file.name}`;
            const fileRef = storageRef.child(fileName);

            await fileRef.put(file);
            const downloadURL = await fileRef.getDownloadURL();

            return downloadURL;
        });

        const imageUrls = await Promise.all(uploadPromises);
        console.log(`✅ Uploaded ${imageUrls.length} images`);
        return imageUrls;
    } catch (error) {
        console.error('❌ Upload images error:', error.message);
        throw error;
    }
}

/**
 * Upload profile photo
 * @param {File} file - Image file
 * @param {string} userId - User ID
 * @returns {Promise<string>} Download URL
 */
async function uploadProfilePhoto(file, userId) {
    try {
        const storageRef = storage.ref();
        const fileName = `profiles/${userId}/avatar_${Date.now()}.jpg`;
        const fileRef = storageRef.child(fileName);

        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();

        // Update user profile
        await auth.currentUser.updateProfile({ photoURL: downloadURL });
        await db.collection('users').doc(userId).update({
            photoURL: downloadURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Profile photo uploaded');
        return downloadURL;
    } catch (error) {
        console.error('❌ Upload profile photo error:', error.message);
        throw error;
    }
}

// ===== Auth State Observer =====
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('✅ User is signed in:', user.uid);

        // Update UI for authenticated user
        updateHeaderForUser(user);

        // Enable restricted features
        document.querySelectorAll('.requires-auth').forEach(el => {
            el.classList.remove('disabled');
        });
    } else {
        console.log('ℹ️ No user signed in');

        // Update UI for guest user
        updateHeaderForGuest();

        // Disable restricted features
        document.querySelectorAll('.requires-auth').forEach(el => {
            el.classList.add('disabled');
        });
    }
});

// ===== UI Helper Functions =====

function updateHeaderForUser(user) {
    // Update "Post Your Ad" button to work
    const postAdButtons = document.querySelectorAll('.post-ad-btn');
    postAdButtons.forEach(btn => {
        btn.onclick = () => window.location.href = '/pages/post-ad.html';
    });

    // Update user menu
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    if (userMenuToggle && user.photoURL) {
        userMenuToggle.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}" style="width: 32px; height: 32px; border-radius: 50%;">`;
    }
}

function updateHeaderForGuest() {
    // Update "Post Your Ad" to require login
    const postAdButtons = document.querySelectorAll('.post-ad-btn');
    postAdButtons.forEach(btn => {
        btn.onclick = () => {
            alert('Please log in to post an ad');
            window.location.href = '/pages/auth/login.html';
        };
    });
}

// ===== Utility Functions =====

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// ===== Export API for use in other files =====
window.FirebaseAPI = {
    // Auth
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    getCurrentUser: () => auth.currentUser,

    // Listings
    createListing,
    getListings,
    getListing,
    updateListing,
    deleteListing,

    // Storage
    uploadListingImages,
    uploadProfilePhoto,

    // Utility
    calculateDistance,

    // Direct access to Firebase services (for advanced use)
    auth,
    db,
    storage
};

console.log('✅ Firebase API ready - access via window.FirebaseAPI');
// End of file
