/**
 * Admin Settings Management
 * Handles global system settings and limits
 */

// Redundant 'db' declaration removed - using global 'db' from firebase-config.js

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await requireAdmin();
    await loadSettings();
    setupEventListeners();
});

/**
 * Load global settings from Firestore
 */
async function loadSettings() {
    try {
        const settingsDoc = await db.collection('system_settings').doc('limits').get();
        if (settingsDoc.exists) {
            const data = settingsDoc.data();
            document.getElementById('defaultDailyAdLimit').value = data.defaultDailyAdLimit || '';
            document.getElementById('defaultDailyScanLimit').value = data.defaultDailyScanLimit || '';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    document.getElementById('saveLimitsBtn').addEventListener('click', saveLimits);
}

/**
 * Save global limits to Firestore
 */
async function saveLimits() {
    const adLimit = document.getElementById('defaultDailyAdLimit').value;
    const scanLimit = document.getElementById('defaultDailyScanLimit').value;

    const btn = document.getElementById('saveLimitsBtn');
    const originalText = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        await db.collection('system_settings').doc('limits').set({
            defaultDailyAdLimit: adLimit ? parseInt(adLimit) : 5,
            defaultDailyScanLimit: scanLimit ? parseInt(scanLimit) : 3,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: firebase.auth().currentUser.uid
        }, { merge: true });

        // Log admin action
        await logAdminAction('update_global_settings', {
            action: 'update_global_limits',
            adLimit: adLimit,
            scanLimit: scanLimit
        });

        if (window.UIComponents) {
            window.UIComponents.showSuccessToast('Global limits updated successfully!', 'Settings Saved', 10000);
            // Refresh after toast shows for a bit longer
            setTimeout(() => location.reload(), 10500);
        } else {
            alert('Global limits updated successfully!');
            location.reload();
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}
