// ================================
// 🔥 Canadian AI Classifieds - Firebase Configuration
// ================================

// ⚠️ IMPORTANT: DO NOT commit firebase-config.js with real values!
// Copy firebase-config.example.js to firebase-config.js and add your values

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

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
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update display name
        await user.updateProfile({
            displayName: displayName
        });

        // Create user profile in Firestore
        await db.collection('users').doc(user.uid).set({
            displayName: displayName,
            email: email,
            photoURL: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailNotifications: {
                messages: true,
                priceDrops: true,
                weeklyDigest: false,
                marketing: false
            }
        });

        console.log('✅ User registered successfully:', user.uid);
        return user;
    } catch (error) {
        console.error('❌ Error signing up:', error);
        throw error;
    }
}

// ... rest of your firebase-config.js code ...
// (Keep all the other functions as they are)
