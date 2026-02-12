/**
 * Usage Limits Utility
 * Handles fetching and enforcing platform limits for ads and scans
 */

const UsageLimits = {
    /**
     * Get current user's limits (merging global and user-specific)
     */
    async getUserLimits(userId) {
        console.log(`📊 UsageLimits: Fetching limits for user: ${userId}`);
        try {
            // 1. Get Global Limits
            const globalDoc = await firebase.firestore().collection('system_settings').doc('limits').get();
            const globalData = globalDoc.exists ? globalDoc.data() : { defaultDailyAdLimit: 5, defaultDailyScanLimit: 3 };

            // 2. Get User Custom Limits
            const userDoc = await firebase.firestore().collection('users').doc(userId).get();
            const userData = userDoc.exists ? userDoc.data() : {};

            const adLimitSource = userData.customAdLimit !== undefined ? 'User-Specific' : 'Global Default';
            const scanLimitSource = userData.customScanLimit !== undefined ? 'User-Specific' : 'Global Default';

            const limits = {
                adLimit: userData.customAdLimit !== undefined ? parseInt(userData.customAdLimit) :
                    (globalData.defaultDailyAdLimit !== undefined ? parseInt(globalData.defaultDailyAdLimit) : 5),
                scanLimit: userData.customScanLimit !== undefined ? parseInt(userData.customScanLimit) :
                    (globalData.defaultDailyScanLimit !== undefined ? parseInt(globalData.defaultDailyScanLimit) : 3)
            };

            console.log(`📊 UsageLimits: adLimit: ${limits.adLimit} (${adLimitSource})`);
            console.log(`📊 UsageLimits: scanLimit: ${limits.scanLimit} (${scanLimitSource})`);
            console.log('📊 UsageLimits: Raw Data:', { global: globalData, user: userData });

            return limits;
        } catch (error) {
            console.error('Error fetching limits:', error);
            return { adLimit: 5, scanLimit: 3 }; // Fallback
        }
    },

    /**
     * Get user's current usage for today
     */
    async getTodayUsage(userId) {
        const today = new Date().toISOString().split('T')[0];
        const usageId = `${userId}_${today}`;

        try {
            const usageDoc = await firebase.firestore().collection('usage_tracking').doc(usageId).get();
            if (usageDoc.exists) {
                const data = usageDoc.data();
                console.log(`📊 UsageLimits: Usage for ${usageId}:`, data);
                return data;
            }
            console.log(`📊 UsageLimits: No usage found for ${usageId}, returning zeros`);
            return { adCount: 0, scanCount: 0 };
        } catch (error) {
            console.error('Error fetching usage:', error);
            return { adCount: 0, scanCount: 0 };
        }
    },

    /**
     * Check if user can post an ad
     */
    async canPostAd(userId) {
        const [limits, usage] = await Promise.all([
            this.getUserLimits(userId),
            this.getTodayUsage(userId)
        ]);

        return {
            allowed: (usage.adCount || 0) < limits.adLimit,
            current: usage.adCount || 0,
            limit: limits.adLimit
        };
    },

    /**
     * Check if user can perform a scan
     */
    async canPerformScan(userId) {
        const [limits, usage] = await Promise.all([
            this.getUserLimits(userId),
            this.getTodayUsage(userId)
        ]);

        return {
            allowed: (usage.scanCount || 0) < limits.scanLimit,
            current: usage.scanCount || 0,
            limit: limits.scanLimit
        };
    },

    /**
     * Increment usage count
     */
    async incrementUsage(userId, type) {
        const today = new Date().toISOString().split('T')[0];
        const usageId = `${userId}_${today}`;
        const field = type === 'ad' ? 'adCount' : 'scanCount';

        try {
            await firebase.firestore().collection('usage_tracking').doc(usageId).set({
                [field]: firebase.firestore.FieldValue.increment(1),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId,
                date: today
            }, { merge: true });
            return true;
        } catch (error) {
            console.error(`Error incrementing ${type} usage:`, error);
            return false;
        }
    }
};

window.UsageLimits = UsageLimits;
