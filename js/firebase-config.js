// ================================
// Firebase Configuration
// Replace with your actual Firebase project credentials
// ================================

// Your web app's Firebase configuration
// Get this from: https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// ===== Firebase Initialization =====
// Uncomment when you add the Firebase SDK scripts to index.html

/*
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

console.log('🔥 Firebase initialized successfully!');

// ===== Authentication Helpers =====
async function signUpWithEmail(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ User signed up:', userCredential.user.uid);
        return userCredential.user;
    } catch (error) {
        console.error('❌ Sign up error:', error.message);
        throw error;
    }
}

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

async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        console.log('✅ User signed in with Google:', result.user.uid);
        return result.user;
    } catch (error) {
        console.error('❌ Google sign in error:', error.message);
        throw error;
    }
}

async function signOut() {
    try {
        await auth.signOut();
        console.log('✅ User signed out');
    } catch (error) {
        console.error('❌ Sign out error:', error.message);
        throw error;
    }
}

// ===== Firestore Helpers =====
async function createListing(listingData) {
    try {
        const listing = {
            ...listingData,
            userId: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };
        
        const docRef = await db.collection('listings').add(listing);
        console.log('✅ Listing created:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Create listing error:', error.message);
        throw error;
    }
}

async function getListings(category = null, location = null, limit = 20) {
    try {
        let query = db.collection('listings')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(limit);
        
        if (category) {
            query = query.where('category', '==', category);
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

async function getNearbyListings(latitude, longitude, radiusKm = 5) {
    // Note: For production, use Geohash or GeoFirestore for efficient location queries
    try {
        const listings = await getListings();
        
        // Filter by distance (this is a simple implementation)
        const nearbyListings = listings.filter(listing => {
            if (!listing.location) return false;
            const distance = calculateDistance(
                latitude, longitude,
                listing.location.latitude, listing.location.longitude
            );
            return distance <= radiusKm;
        });
        
        console.log(`✅ Found ${nearbyListings.length} listings within ${radiusKm}km`);
        return nearbyListings;
    } catch (error) {
        console.error('❌ Get nearby listings error:', error.message);
        throw error;
    }
}

async function updateListing(listingId, updates) {
    try {
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

async function deleteListing(listingId) {
    try {
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

// ===== Storage Helpers =====
async function uploadListingImages(files) {
    try {
        const uploadPromises = files.map(async (file, index) => {
            const storageRef = storage.ref();
            const fileName = `listings/${auth.currentUser.uid}/${Date.now()}_${index}.jpg`;
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

// ===== Utility Functions =====
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula for calculating distance between two coordinates
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

// ===== Auth State Observer =====
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('✅ User is signed in:', user.uid);
        // Update UI for authenticated user
    } else {
        console.log('❌ No user signed in');
        // Update UI for guest user
    }
});

// Export functions for use in app.js
window.FirebaseAPI = {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    createListing,
    getListings,
    getNearbyListings,
    updateListing,
    deleteListing,
    uploadListingImages
};
*/

// ===== Setup Instructions =====
console.log(`
🔥 Firebase Setup Instructions:

1. Go to https://console.firebase.google.com
2. Create a new project (or select existing)
3. Enable Authentication (Email/Password and Google)
4. Create Firestore Database (start in test mode)
5. Enable Storage for image uploads
6. Copy your Firebase config from Project Settings
7. Replace the firebaseConfig object above
8. Add Firebase SDK scripts to index.html:
   
   <!-- Add before closing </body> tag -->
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>

9. Uncomment the Firebase initialization code in this file
10. Set up Firestore security rules and indexes

📚 Firestore Collections Structure:

listings/
  {listingId}/
    - userId: string
    - title: string
    - description: string
    - price: number
    - category: string
    - location: { latitude: number, longitude: number, city: string, province: string }
    - images: array of URLs
    - status: 'active' | 'sold' | 'deleted'
    - createdAt: timestamp
    - updatedAt: timestamp

users/
  {userId}/
    - email: string
    - displayName: string
    - verified: boolean
    - createdAt: timestamp
    - listings: array of listing IDs
`);
