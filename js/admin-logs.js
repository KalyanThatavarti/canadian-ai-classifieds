// ================================
// Admin Activity Logs JavaScript
// Handles loading and filtering system logs
// ================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!window.FirebaseAPI) {
        console.error('Firebase API not found');
        return;
    }

    const logsTableBody = document.getElementById('logsTableBody');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const logSearch = document.getElementById('logSearch');
    const adminFilter = document.getElementById('adminFilter');
    const actionFilter = document.getElementById('actionFilter');
    const refreshBtn = document.getElementById('refreshBtn');

    let allLogs = [];
    let unsubscribe = null;

    // Initialize UI
    async function init() {
        showLoading(true);

        try {
            // Wait for admin verification from admin-auth.js
            if (typeof requireAdmin === 'function') {
                const isAdmin = await requireAdmin();
                if (!isAdmin) return; // requireAdmin handles redirect

                setupRealtimeLogs();
            } else {
                // Fallback if admin-auth.js isn't ready
                window.FirebaseAPI.auth.onAuthStateChanged((user) => {
                    if (user) {
                        setupRealtimeLogs();
                    } else {
                        window.location.href = '../auth/login.html';
                    }
                });
            }
        } catch (error) {
            console.error('Error during log initialization:', error);
            showLoading(false);
        }

        // Event Listeners
        logSearch.addEventListener('input', applyFilters);
        adminFilter.addEventListener('change', applyFilters);
        actionFilter.addEventListener('change', applyFilters);
        refreshBtn.addEventListener('click', () => {
            if (unsubscribe) unsubscribe();
            setupRealtimeLogs();
        });
    }

    function setupRealtimeLogs() {
        showLoading(true);

        // Fetch logs (latest 100 for now)
        const logsQuery = firebase.firestore().collection('adminLogs')
            .orderBy('createdAt', 'desc')
            .limit(100);

        unsubscribe = logsQuery.onSnapshot((snapshot) => {
            allLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            populateAdminsFilter(allLogs);
            renderLogs(allLogs);
            showLoading(false);
        }, (error) => {
            console.error('❌ Firestore Error:', error);
            showLoading(false);

            let msg = 'Error loading logs. Please check permissions.';
            if (error.code === 'permission-denied') {
                msg = '🔒 Access Denied: Only administrators can view activity logs.';
            } else if (error.code === 'unavailable') {
                msg = '🔌 Database is temporarily unavailable. Please try again.';
            }

            logsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding: 2rem;">${msg}<br><small>(Error Code: ${error.code})</small></td></tr>`;
        });
    }

    function populateAdminsFilter(logs) {
        const admins = [...new Set(logs.map(log => log.adminName || 'System'))];
        const currentSelection = adminFilter.value;

        adminFilter.innerHTML = '<option value="all">All Admins</option>';
        admins.forEach(admin => {
            adminFilter.innerHTML += `<option value="${admin}">${admin}</option>`;
        });

        adminFilter.value = currentSelection;
    }

    // Render logs into the table
    function renderLogs(logs) {
        if (logs.length === 0) {
            logsTableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        logsTableBody.innerHTML = logs.map(log => {
            const date = log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleString() : 'Just now';
            const adminInitial = log.adminName ? log.adminName.charAt(0).toUpperCase() : '?';
            const typeClass = getActionTypeClass(log.action);

            return `
                <tr>
                    <td style="font-weight: 500; color: #6b7280; font-variant-numeric: tabular-nums; white-space: nowrap;">${date}</td>
                    <td>
                        <div class="admin-meta">
                            <div class="admin-avatar">${adminInitial}</div>
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-weight: 600; color: #111827;">${log.adminName || 'Unknown Admin'}</span>
                                <span style="font-size: 0.75rem; color: #6b7280;">${log.adminEmail || ''}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="log-type-tag ${typeClass}">${formatActionName(log.action)}</span>
                    </td>
                    <td>
                        <div style="max-width: 400px; line-height: 1.5;">
                            ${log.details || log.reason || 'No details provided'}
                            ${log.targetId ? `<div style="font-size: 0.75rem; color: #9ca3af; margin-top: 4px;">ID: ${log.targetId}</div>` : ''}
                        </div>
                    </td>
                    <td><code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; color: #4b5563;">${log.ipAddress || '127.0.0.1'}</code></td>
                </tr>
            `;
        }).join('');
    }

    function applyFilters() {
        const searchTerm = logSearch.value.toLowerCase();
        const adminVal = adminFilter.value;
        const actionVal = actionFilter.value;

        const filtered = allLogs.filter(log => {
            const matchesSearch = !searchTerm ||
                (log.adminName && log.adminName.toLowerCase().includes(searchTerm)) ||
                (log.action && log.action.toLowerCase().includes(searchTerm)) ||
                (log.details && log.details.toLowerCase().includes(searchTerm));

            const matchesAdmin = adminVal === 'all' || log.adminName === adminVal;
            const matchesAction = actionVal === 'all' || log.action === actionVal;

            return matchesSearch && matchesAdmin && matchesAction;
        });

        renderLogs(filtered);
    }

    // Helper functions
    function getActionTypeClass(action) {
        const warningActions = ['ban_user', 'delete_listing', 'flag_listing'];
        const successActions = ['resolve_report', 'verify_user', 'system_login'];

        if (!action) return 'type-info';
        const a = action.toLowerCase();

        if (warningActions.some(wa => a.includes(wa))) return 'type-danger';
        if (successActions.some(sa => a.includes(sa))) return 'type-success';
        return 'type-info';
    }

    function formatActionName(action) {
        if (!action) return 'ACTION';
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function showLoading(show) {
        loadingState.style.display = show ? 'block' : 'none';
        if (show) emptyState.style.display = 'none';
    }

    init();
});
