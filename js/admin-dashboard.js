/**
 * Admin Dashboard JavaScript
 * Handles stat fetching, charts, and real-time updates
 */

let userGrowthChart = null;
let categoryChart = null;

// Init dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check admin access
    const hasAccess = await requireAdmin();
    if (!hasAccess) return;

    // Load dashboard data
    await loadDashboardStats();
    await loadCharts();
    await loadRecentActivity();

    // Hide loading, show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';

    // Set up real-time listeners
    setupRealTimeListeners();
});

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        const db = firebase.firestore();

        // Get total users
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();

        // Get total active listings
        const listingsSnapshot = await db.collection('listings')
            .where('status', '==', 'active')
            .get();
        const totalListings = listingsSnapshot.size;
        document.getElementById('totalListings').textContent = totalListings.toLocaleString();

        // Get pending reports
        const reportsSnapshot = await db.collection('reports')
            .where('status', '==', 'pending')
            .get();
        const totalReports = reportsSnapshot.size;
        document.getElementById('totalReports').textContent = totalReports.toLocaleString();

        // Calculate this week's new users
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newUsersSnapshot = await db.collection('users')
            .where('createdAt', '>=', oneWeekAgo)
            .get();
        const newUsersCount = newUsersSnapshot.size;
        document.getElementById('usersChange').textContent = `+${newUsersCount} this week`;

        // Calculate this week's new listings
        const newListingsSnapshot = await db.collection('listings')
            .where('createdAt', '>=', oneWeekAgo)
            .get();
        const newListingsCount = newListingsSnapshot.size;
        document.getElementById('listingsChange').textContent = `+${newListingsCount} this week`;

        console.log('✅ Dashboard stats loaded');
    } catch (error) {
        console.error('❌ Error loading dashboard stats:', error);

        if (window.UIComponents) {
            window.UIComponents.showErrorToast(
                'Failed to load dashboard statistics',
                'Error'
            );
        }
    }
}

/**
 * Load and render charts
 */
async function loadCharts() {
    try {
        const db = firebase.firestore();

        // ===== User Growth Chart (OPTIMIZED) =====

        // Fetch all users from last 30 days in ONE query
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        console.log('📊 Fetching user growth data...');
        const usersSnapshot = await db.collection('users')
            .where('createdAt', '>=', thirtyDaysAgo)
            .get();

        // Group users by date on client-side
        const usersByDate = {};
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.createdAt) {
                const date = data.createdAt.toDate();
                const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                usersByDate[dateKey] = (usersByDate[dateKey] || 0) + 1;
            }
        });

        // Build chart data for last 30 days
        const last30Days = [];
        const userCounts = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            last30Days.push(label);
            userCounts.push(usersByDate[dateKey] || 0);
        }

        console.log('✅ User growth data processed');

        const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
        userGrowthChart = new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: last30Days,
                datasets: [{
                    label: 'New Users',
                    data: userCounts,
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });

        // ===== Category Distribution Chart =====

        const categoryCounts = {};
        const listingsSnapshot = await db.collection('listings')
            .where('status', '==', 'active')
            .get();

        listingsSnapshot.forEach(doc => {
            const category = doc.data().category || 'Others';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        const categoryLabels = Object.keys(categoryCounts);
        const categoryData = Object.values(categoryCounts);

        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryData,
                    backgroundColor: [
                        '#4A90E2',
                        '#50C878',
                        '#FF6B6B',
                        '#FFD93D',
                        '#A78BFA',
                        '#FB8500',
                        '#06B6D4',
                        '#EC4899'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });

        console.log('✅ Charts loaded');
    } catch (error) {
        console.error('❌ Error loading charts:', error);
    }
}

/**
 * Load recent activity
 */
async function loadRecentActivity() {
    try {
        const db = firebase.firestore();
        const activityList = document.getElementById('activityList');

        // Get recent admin logs
        const logsSnapshot = await db.collection('adminLogs')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        if (logsSnapshot.empty) {
            activityList.innerHTML = '<li class="activity-item"><div class="activity-text" style="color: var(--text-muted);">No recent activity</div></li>';
            return;
        }

        activityList.innerHTML = '';

        for (const doc of logsSnapshot.docs) {
            const log = doc.data();
            const activityItem = createActivityItem(log);
            activityList.appendChild(activityItem);
        }

        console.log('✅ Recent activity loaded');
    } catch (error) {
        console.error('❌ Error loading activity:', error);
    }
}

/**
 * Create activity item element
 */
function createActivityItem(log) {
    const li = document.createElement('li');
    li.className = 'activity-item';
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.gap = '16px';
    li.style.padding = '12px 0';
    li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';

    const icon = getActivityIcon(log.action);
    const text = getActivityText(log);
    const time = formatTimeAgo(log.createdAt);

    li.innerHTML = `
        <div class="activity-icon" style="width: 36px; height: 36px; background: rgba(255,255,255,0.5); backdrop-filter: blur(4px); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            ${icon}
        </div>
        <div class="activity-content" style="flex-grow: 1;">
            <div class="activity-text" style="font-size: 0.95rem; font-weight: 500; color: #1e293b; line-height: 1.4;">${text}</div>
            <div class="activity-time" style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">${time}</div>
        </div>
    `;

    return li;
}

/**
 * Get icon for activity type
 */
function getActivityIcon(action) {
    const icons = {
        ban_user: '🚫',
        delete_listing: '🗑️',
        approve_listing: '✅',
        suspend_user: '⏸️',
        resolve_report: '✔️',
        dismiss_report: '❌'
    };

    return icons[action] || '📝';
}

/**
 * Get human-readable text for activity
 */
function getActivityText(log) {
    // Use targetName if available, otherwise fall back to targetId
    const target = log.targetName || log.targetId || 'Unknown';

    const actions = {
        ban_user: `Banned user (${target})`,
        delete_listing: `Deleted listing (${target})`,
        approve_listing: `Approved listing (${target})`,
        suspend_user: `Suspended user (${target})`,
        resolve_report: `Resolved report (${target})`,
        dismiss_report: `Dismissed report (${target})`
    };

    const text = actions[log.action] || `Performed action: ${log.action}`;
    const reason = log.reason ? ` - ${log.reason}` : '';

    return `${text}${reason}`;
}

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';

    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
}

/**
 * Set up real-time listeners for live updates
 */
function setupRealTimeListeners() {
    const db = firebase.firestore();

    // Listen for new reports
    db.collection('reports')
        .where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            const reportCount = snapshot.size;
            document.getElementById('totalReports').textContent = reportCount.toLocaleString();
        });

    // Listen for new listings
    db.collection('listings')
        .where('status', '==', 'active')
        .onSnapshot((snapshot) => {
            const listingCount = snapshot.size;
            document.getElementById('totalListings').textContent = listingCount.toLocaleString();
        });

    console.log('✅ Real-time listeners active');
}
