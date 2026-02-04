/**
 * Notification Settings Page
 * Handles loading and saving user email notification preferences
 */

let currentUser = null;
let authInitialized = false;

// Wait for Firebase Auth to initialize
firebase.auth().onAuthStateChanged(async (user) => {
    const loading = document.getElementById('loading');
    const settingsContent = document.getElementById('settings-content');

    console.log('Auth state changed:', user ? user.uid : 'null', 'Initialized:', authInitialized);

    // Mark as initialized after first call
    if (!authInitialized) {
        authInitialized = true;
    }

    if (!user) {
        // Only redirect if this is not the initial load
        // Give Firebase a moment to restore the session
        setTimeout(() => {
            const currentUserCheck = firebase.auth().currentUser;
            if (!currentUserCheck) {
                console.log('User not authenticated after delay, redirecting to login');
                window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }
        }, 500);
        return;
    }

    // Store current user
    currentUser = user;
    console.log('User authenticated:', user.uid);

    try {
        // Load current preferences from Firestore
        console.log('Fetching user document from Firestore...');
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();

        if (!userDoc.exists) {
            console.error('User document does not exist in Firestore');
            throw new Error('User profile not found');
        }

        const userData = userDoc.data();
        const preferences = userData.emailNotifications || {
            messages: true,
            priceDrops: true,
            weeklyDigest: false,
            marketing: false
        };

        console.log('Loaded preferences:', preferences);

        // Populate toggles with current preferences
        document.getElementById('notifyMessages').checked = preferences.messages !== false;
        document.getElementById('notifyPriceDrops').checked = preferences.priceDrops !== false;
        document.getElementById('notifyWeeklyDigest').checked = preferences.weeklyDigest === true;
        document.getElementById('notifyMarketing').checked = preferences.marketing === true;

        // Hide loading, show content
        loading.style.display = 'none';
        settingsContent.style.display = 'block';

        console.log('✅ Notification preferences loaded successfully');

    } catch (error) {
        console.error('❌ Error loading preferences:', error);

        if (window.UIComponents) {
            window.UIComponents.showErrorToast(
                'Failed to load your notification settings. Please try again.',
                'Error'
            );
        }

        // Still show the form with defaults
        loading.style.display = 'none';
        settingsContent.style.display = 'block';
    }
});

// Setup save button listener after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveSettings');

    // Save preferences
    saveButton.addEventListener('click', async () => {
        if (!currentUser) {
            console.error('No user authenticated');
            return;
        }

        try {
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';

            const newPreferences = {
                messages: document.getElementById('notifyMessages').checked,
                priceDrops: document.getElementById('notifyPriceDrops').checked,
                weeklyDigest: document.getElementById('notifyWeeklyDigest').checked,
                marketing: document.getElementById('notifyMarketing').checked
            };

            console.log('Saving preferences:', newPreferences);

            // Update Firestore
            await firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .update({
                    emailNotifications: newPreferences,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            console.log('✅ Preferences saved successfully');

            if (window.UIComponents) {
                window.UIComponents.showSuccessToast(
                    'Your notification preferences have been saved!',
                    'Settings Updated'
                );
            }

            // Reset button
            saveButton.disabled = false;
            saveButton.textContent = 'Save Preferences';

        } catch (error) {
            console.error('❌ Error saving preferences:', error);

            if (window.UIComponents) {
                window.UIComponents.showErrorToast(
                    'Failed to save your preferences. Please try again.',
                    'Save Failed'
                );
            }

            saveButton.disabled = false;
            saveButton.textContent = 'Save Preferences';
        }
    });

    // Track changes to show visual feedback
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            // Add subtle visual feedback
            if (saveButton) {
                saveButton.style.animation = 'pulse 0.5s';
                setTimeout(() => {
                    saveButton.style.animation = '';
                }, 500);
            }
        });
    });
});
