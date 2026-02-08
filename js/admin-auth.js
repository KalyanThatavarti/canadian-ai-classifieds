/**
 * Admin Authentication Middleware
 * Checks if current user has admin privileges
 */

let adminUser = null;
let isAdminCached = false;

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>} True if user is admin
 */
async function isUserAdmin() {
    const user = firebase.auth().currentUser;

    if (!user) {
        console.log('❌ No user authenticated');
        return false;
    }

    try {
        // Check cache first
        if (adminUser && adminUser.uid === user.uid) {
            console.log('🔄 Using cached admin status:', isAdminCached);
            return isAdminCached;
        }

        console.log('🔍 Fetching user document for:', user.uid);

        // Fetch user document
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();

        if (!userDoc.exists) {
            console.error('❌ User document not found for UID:', user.uid);
            return false;
        }

        const userData = userDoc.data();

        // Debug: Show all fields in user document
        console.log('📄 User document data:', {
            email: userData.email,
            displayName: userData.displayName,
            isAdmin: userData.isAdmin,
            role: userData.role,
            hasIsAdminField: 'isAdmin' in userData,
            isAdminType: typeof userData.isAdmin,
            isAdminValue: userData.isAdmin
        });

        const isAdmin = userData.isAdmin === true;

        // Cache result
        adminUser = user;
        isAdminCached = isAdmin;

        console.log(`🔐 Admin check for ${user.email}:`, isAdmin ? '✅ ADMIN' : '❌ NOT ADMIN');

        return isAdmin;
    } catch (error) {
        console.error('❌ Error checking admin status:', error);
        return false;
    }
}

/**
 * Require admin access - redirect if not authorized
 * Call this on page load for admin pages
 * @returns {Promise<boolean>} True if admin, false and redirects if not
 */
async function requireAdmin() {
    // Wait for auth to be ready
    const user = await new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });

    if (!user) {
        console.warn('⛔ No user logged in');
        setTimeout(() => {
            window.location.href = '/pages/auth/login.html';
        }, 1500);
        return false;
    }

    // Clear cache to force fresh check
    console.log('🔄 Clearing admin cache for fresh check');
    adminUser = null;
    isAdminCached = false;

    const isAdmin = await isUserAdmin();

    if (!isAdmin) {
        console.warn('⛔ Unauthorized access attempt to admin area');

        if (window.UIComponents) {
            window.UIComponents.showErrorToast(
                'You do not have permission to access this page',
                'Access Denied'
            );
        }

        // Redirect to home after a short delay
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);

        return false;
    }

    console.log('✅ Admin access granted');
    return true;
}

/**
 * Show/hide admin menu items based on user role
 * Call this after user authentication
 */
async function toggleAdminUI() {
    const isAdmin = await isUserAdmin();

    // Find admin menu items
    const adminMenuItems = document.querySelectorAll('[data-admin-only]');

    adminMenuItems.forEach(item => {
        if (isAdmin) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Log an admin action to Firebase
 * @param {string} action - The action performed (e.g., 'ban_user', 'delete_listing')
 * @param {string} targetId - ID of the affected resource
 * @param {string} reason - Reason for the action
 * @param {Object} metadata - Additional metadata (e.g., targetName, deletedListings)
 */
async function logAdminAction(action, targetId, reason = '', metadata = {}) {
    const user = firebase.auth().currentUser;

    if (!user) {
        console.error('❌ Cannot log action: No user authenticated');
        return;
    }

    try {
        await firebase.firestore()
            .collection('adminLogs')
            .add({
                adminId: user.uid,
                adminEmail: user.email,
                action: action,
                targetId: targetId,
                targetName: metadata.targetUserName || metadata.targetListingName || targetId,
                reason: reason,
                metadata: metadata,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

        console.log(`📝 Admin action logged: ${action} on ${targetId}`);
    } catch (error) {
        console.error('❌ Error logging admin action:', error);
    }
}

/**
 * Check if a user is banned
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True if user is banned
 */
async function isUserBanned(userId) {
    try {
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .get();

        if (!userDoc.exists) {
            return false;
        }

        return userDoc.data().role === 'banned';
    } catch (error) {
        console.error('❌ Error checking ban status:', error);
        return false;
    }
}

// Listen for auth state changes to update admin UI
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Clear cache on user change
        if (adminUser && adminUser.uid !== user.uid) {
            adminUser = null;
            isAdminCached = false;
        }

        // Update admin UI elements
        toggleAdminUI();
    } else {
        adminUser = null;
        isAdminCached = false;
    }
});
