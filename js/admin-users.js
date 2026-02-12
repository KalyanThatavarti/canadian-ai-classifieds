/**
 * Admin Users Management
 * Handles user listing, search, filtering, and moderation actions
 */

let allUsers = [];
let filteredUsers = [];
let currentUserToModerate = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await requireAdmin();
    await loadUsers();
    setupEventListeners();
});

/**
 * Load all users from Firestore
 */
async function loadUsers() {
    try {
        showLoading(true);

        const usersSnapshot = await db.collection('users').get();
        allUsers = [];

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();

            // Count user's listings
            const listingsSnapshot = await db.collection('listings')
                .where('userId', '==', doc.id)
                .get();

            // Get report count
            const reportsSnapshot = await db.collection('reports')
                .where('reportedUserId', '==', doc.id)
                .get();

            allUsers.push({
                id: doc.id,
                ...userData,
                listingsCount: listingsSnapshot.size,
                reportCount: reportsSnapshot.size,
                status: userData.status || 'active'
            });
        }

        filteredUsers = [...allUsers];
        updateStats();
        displayUsers();
        showLoading(false);

    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users. Please refresh the page.');
        showLoading(false);
    }
}

/**
 * Display users in table
 */
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('emptyState');

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = filteredUsers.map(user => {
        let joinDate = 'N/A';
        try {
            if (user.createdAt) {
                // Handle Firestore Timestamp
                if (typeof user.createdAt.toDate === 'function') {
                    joinDate = user.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
                // Handle Date object
                else if (user.createdAt instanceof Date) {
                    joinDate = user.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
                // Handle string or number
                else {
                    joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
            }
        } catch (e) {
            console.warn('Error formatting date for user:', user.id, e);
        }

        const statusBadge = getStatusBadge(user.status);
        const isCurrentAdmin = user.isAdmin;
        const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?');

        return `
            <tr data-user-id="${user.id}">
                <td>
                    <div class="user-info">
                        <div class="user-avatar" style="background: ${isCurrentAdmin ? 'linear-gradient(135deg, #6366f1, #a855f7)' : '#e2e8f0'}; color: ${isCurrentAdmin ? 'white' : '#64748b'}; font-weight: 700;">
                            ${user.photoURL ?
                `<img src="${user.photoURL}" alt="${user.displayName}">` :
                `<span>${initial}</span>`
            }
                        </div>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight: 700; color: #111827;">${user.displayName || 'Anonymous User'}</span>
                            ${isCurrentAdmin ? '<span class="admin-badge" style="width:fit-content; margin-top:2px;"><i class="fas fa-shield-alt"></i> admin</span>' : ''}
                        </div>
                    </div>
                </td>
                <td style="font-family: monospace; color: #64748b;">${user.email}</td>
                <td style="color: #64748b;">${joinDate}</td>
                <td>
                    <span class="count-badge" style="background: #f1f5f9; padding: 4px 10px; border-radius: 8px; font-weight: 600;">
                        <i class="fas fa-box" style="color: #6366f1; margin-right: 4px;"></i> ${user.listingsCount || 0}
                    </span>
                </td>
                <td>
                    <span class="count-badge ${user.reportCount > 0 ? 'warning' : ''}" style="background: ${user.reportCount > 0 ? '#fff7ed' : '#f1f5f9'}; color: ${user.reportCount > 0 ? '#ea580c' : '#64748b'}; padding: 4px 10px; border-radius: 8px; font-weight: 600;">
                        <i class="fas fa-flag" style="margin-right: 4px;"></i> ${user.reportCount || 0}
                    </span>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="viewUserDetails('${user.id}')" class="btn-icon" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!isCurrentAdmin ? getActionButtons(user) : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const badges = {
        active: '<span class="status-badge status-active" style="border: 1px solid #bdf2d5;"><i class="fas fa-check-circle"></i> Active</span>',
        banned: '<span class="status-badge status-banned" style="border: 1px solid #fecaca;"><i class="fas fa-ban"></i> Banned</span>',
        suspended: '<span class="status-badge status-suspended" style="border: 1px solid #fde68a;"><i class="fas fa-pause-circle"></i> Suspended</span>'
    };
    return badges[status] || badges.active;
}

/**
 * Get action buttons based on user status
 */
function getActionButtons(user) {
    if (user.status === 'banned') {
        return `
            <button onclick="unbanUser('${user.id}')" class="btn-icon btn-success" title="Unban User">
                <i class="fas fa-undo"></i>
            </button>
        `;
    } else if (user.status === 'suspended') {
        return `
            <button onclick="unsuspendUser('${user.id}')" class="btn-icon btn-success" title="Unsuspend User">
                <i class="fas fa-play"></i>
            </button>
        `;
    } else {
        return `
            <button onclick="openSuspendModal('${user.id}')" class="btn-icon btn-warning" title="Suspend User">
                <i class="fas fa-pause"></i>
            </button>
            <button onclick="openBanModal('${user.id}')" class="btn-icon btn-danger" title="Ban User">
                <i class="fas fa-user-slash"></i>
            </button>
        `;
    }
}

/**
 * Update statistics
 */
function updateStats() {
    document.getElementById('totalUsers').textContent = allUsers.length;
    document.getElementById('activeUsers').textContent =
        allUsers.filter(u => u.status === 'active').length;
    document.getElementById('bannedUsers').textContent =
        allUsers.filter(u => u.status === 'banned').length;
    document.getElementById('suspendedUsers').textContent =
        allUsers.filter(u => u.status === 'suspended').length;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search
    document.getElementById('userSearch').addEventListener('input', filterUsers);

    // Filters
    document.getElementById('statusFilter').addEventListener('change', filterUsers);
    document.getElementById('sortBy').addEventListener('change', sortUsers);

    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', loadUsers);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

/**
 * Filter users based on search and status
 */
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    filteredUsers = allUsers.filter(user => {
        // Search filter
        const matchesSearch = !searchTerm ||
            user.displayName?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.id.includes(searchTerm);

        // Status filter
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    sortUsers();
}

/**
 * Sort filtered users
 */
function sortUsers() {
    const sortBy = document.getElementById('sortBy').value;

    switch (sortBy) {
        case 'newest':
            filteredUsers.sort((a, b) =>
                (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
            );
            break;
        case 'oldest':
            filteredUsers.sort((a, b) =>
                (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)
            );
            break;
        case 'mostListings':
            filteredUsers.sort((a, b) =>
                (b.listingsCount || 0) - (a.listingsCount || 0)
            );
            break;
        case 'mostReports':
            filteredUsers.sort((a, b) =>
                (b.reportCount || 0) - (a.reportCount || 0)
            );
            break;
    }

    displayUsers();
}

/**
 * Open ban modal
 */
function openBanModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    currentUserToModerate = user;
    document.getElementById('banUserName').textContent = user.displayName || user.email;
    document.getElementById('banReason').value = '';
    document.getElementById('deleteListings').checked = false;
    document.getElementById('banModal').style.display = 'block';
}

/**
 * Close ban modal
 */
function closeBanModal() {
    document.getElementById('banModal').style.display = 'none';
    currentUserToModerate = null;
}

/**
 * Confirm ban user
 */
async function confirmBan() {
    if (!currentUserToModerate) return;

    const reason = document.getElementById('banReason').value.trim();
    if (!reason) {
        alert('Please provide a reason for the ban.');
        return;
    }

    const deleteListings = document.getElementById('deleteListings').checked;

    try {
        const currentAdmin = auth.currentUser;

        // Update user status
        await db.collection('users').doc(currentUserToModerate.id).update({
            status: 'banned',
            bannedAt: firebase.firestore.FieldValue.serverTimestamp(),
            bannedBy: currentAdmin.uid,
            banReason: reason
        });

        // Delete listings if requested
        if (deleteListings) {
            const listingsSnapshot = await db.collection('listings')
                .where('userId', '==', currentUserToModerate.id)
                .get();

            const batch = db.batch();
            listingsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        // Log admin action
        await logAdminAction(
            'ban_user',
            currentUserToModerate.id,
            reason,
            {
                targetUserName: currentUserToModerate.displayName || currentUserToModerate.email,
                deletedListings: deleteListings
            }
        );

        alert('User has been banned successfully.');
        closeBanModal();
        await loadUsers();

    } catch (error) {
        console.error('Error banning user:', error);
        alert('Failed to ban user. Please try again.');
    }
}

/**
 * Open suspend modal
 */
function openSuspendModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    currentUserToModerate = user;
    document.getElementById('suspendUserName').textContent = user.displayName || user.email;
    document.getElementById('suspendDuration').value = '7';
    document.getElementById('suspendReason').value = '';
    document.getElementById('suspendModal').style.display = 'block';
}

/**
 * Close suspend modal
 */
function closeSuspendModal() {
    document.getElementById('suspendModal').style.display = 'none';
    currentUserToModerate = null;
}

/**
 * Confirm suspend user
 */
async function confirmSuspend() {
    if (!currentUserToModerate) return;

    const duration = parseInt(document.getElementById('suspendDuration').value);
    const reason = document.getElementById('suspendReason').value.trim();

    if (!reason) {
        alert('Please provide a reason for the suspension.');
        return;
    }

    try {
        const currentAdmin = auth.currentUser;
        const suspendUntil = new Date();
        suspendUntil.setDate(suspendUntil.getDate() + duration);

        // Update user status
        await db.collection('users').doc(currentUserToModerate.id).update({
            status: 'suspended',
            suspendedAt: firebase.firestore.FieldValue.serverTimestamp(),
            suspendedBy: currentAdmin.uid,
            suspendedUntil: firebase.firestore.Timestamp.fromDate(suspendUntil),
            suspensionReason: reason
        });

        // Log admin action
        await logAdminAction('suspend_user', {
            targetUserId: currentUserToModerate.id,
            targetUserName: currentUserToModerate.displayName || currentUserToModerate.email,
            reason: reason,
            duration: duration
        });

        alert(`User has been suspended for ${duration} days.`);
        closeSuspendModal();
        await loadUsers();

    } catch (error) {
        console.error('Error suspending user:', error);
        alert('Failed to suspend user. Please try again.');
    }
}

/**
 * Unban user
 */
async function unbanUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`Are you sure you want to unban ${user.displayName || user.email}?`)) {
        return;
    }

    try {
        await db.collection('users').doc(userId).update({
            status: 'active',
            bannedAt: firebase.firestore.FieldValue.delete(),
            bannedBy: firebase.firestore.FieldValue.delete(),
            banReason: firebase.firestore.FieldValue.delete()
        });

        await logAdminAction('unban_user', {
            targetUserId: userId,
            targetUserName: user.displayName || user.email
        });

        alert('User has been unbanned successfully.');
        await loadUsers();

    } catch (error) {
        console.error('Error unbanning user:', error);
        alert('Failed to unban user. Please try again.');
    }
}

/**
 * Unsuspend user
 */
async function unsuspendUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`Are you sure you want to unsuspend ${user.displayName || user.email}?`)) {
        return;
    }

    try {
        await db.collection('users').doc(userId).update({
            status: 'active',
            suspendedAt: firebase.firestore.FieldValue.delete(),
            suspendedBy: firebase.firestore.FieldValue.delete(),
            suspendedUntil: firebase.firestore.FieldValue.delete(),
            suspensionReason: firebase.firestore.FieldValue.delete()
        });

        await logAdminAction('unsuspend_user', {
            targetUserId: userId,
            targetUserName: user.displayName || user.email
        });

        alert('User has been unsuspended successfully.');
        await loadUsers();

    } catch (error) {
        console.error('Error unsuspending user:', error);
        alert('Failed to unsuspend user. Please try again.');
    }
}

/**
 * View user details
 */
function viewUserDetails(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const joinDate = user.createdAt ?
        new Date(user.createdAt.toDate()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A';

    const content = `
        <div class="user-details">
            <div class="user-header">
                <div class="user-avatar-large">
                    ${user.photoURL ?
            `<img src="${user.photoURL}" alt="${user.displayName}">` :
            `<i class="fas fa-user-circle"></i>`
        }
                </div>
                <div>
                    <h3>${user.displayName || 'Unknown'}</h3>
                    <p>${user.email}</p>
                    ${getStatusBadge(user.status)}
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-info-circle"></i> Account Information</h4>
                <dl>
                    <dt>User ID:</dt>
                    <dd><code>${user.id}</code></dd>
                    
                    <dt>Joined:</dt>
                    <dd>${joinDate}</dd>
                    
                    <dt>Phone:</dt>
                    <dd>${user.phoneNumber || 'Not provided'}</dd>
                    
                    <dt>Location:</dt>
                    <dd>${user.city || 'Not provided'}</dd>
                    
                    <dt>Email Verified:</dt>
                    <dd>${user.emailVerified ? '<span class="verified">✓ Yes</span>' : '<span class="unverified">✗ No</span>'}</dd>
                </dl>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-chart-bar"></i> Statistics</h4>
                <dl>
                    <dt>Total Listings:</dt>
                    <dd>${user.listingsCount || 0}</dd>
                    
                    <dt>Reports Against User:</dt>
                    <dd>${user.reportCount || 0}</dd>
                </dl>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-sliders-h"></i> User Limits</h4>
                <div class="form-group-row" style="display: flex; gap: 1rem; margin-top: 10px;">
                    <div style="flex: 1;">
                        <label for="customAdLimit" style="font-size: 0.85rem; color: #64748b;">Daily Ad Limit:</label>
                        <input type="number" id="customAdLimit" value="${user.customAdLimit || ''}" placeholder="Default" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                    </div>
                    <div style="flex: 1;">
                        <label for="customScanLimit" style="font-size: 0.85rem; color: #64748b;">Daily Scan Limit:</label>
                        <input type="number" id="customScanLimit" value="${user.customScanLimit || ''}" placeholder="Default" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                    </div>
                </div>
                <button onclick="saveUserLimits('${user.id}')" class="btn-primary" style="margin-top: 15px; width: 100%;">
                    <i class="fas fa-save"></i> Save User Limits
                </button>
            </div>

            <div class="detail-section" style="border-top: 1px solid #fee2e2; margin-top: 2rem; padding-top: 1.5rem;">
                <h4 style="color: #dc2626;"><i class="fas fa-trash-alt"></i> Debug / Reset</h4>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">Resetting usage allows you to test limits from zero for the current day.</p>
                <button onclick="resetUserUsage('${user.id}')" class="btn-secondary" style="width: 100%; border-color: #fecaca; color: #dc2626;">
                    <i class="fas fa-redo"></i> Reset Today's Usage
                </button>
            </div>

            ${user.status !== 'active' ? `
                <div class="detail-section warning">
                    <h4><i class="fas fa-exclamation-triangle"></i> Moderation Info</h4>
                    <dl>
                        ${user.banReason ? `
                            <dt>Ban Reason:</dt>
                            <dd>${user.banReason}</dd>
                            
                            <dt>Banned At:</dt>
                            <dd>${user.bannedAt ? new Date(user.bannedAt.toDate()).toLocaleString() : 'N/A'}</dd>
                        ` : ''}
                        
                        ${user.suspensionReason ? `
                            <dt>Suspension Reason:</dt>
                            <dd>${user.suspensionReason}</dd>
                            
                            <dt>Suspended Until:</dt>
                            <dd>${user.suspendedUntil ? new Date(user.suspendedUntil.toDate()).toLocaleString() : 'N/A'}</dd>
                        ` : ''}
                    </dl>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('userDetailsContent').innerHTML = content;
    document.getElementById('userDetailsModal').style.display = 'block';
}

/**
 * Close user details modal
 */
function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').style.display = 'none';
}

/**
 * Save custom user limits
 */
async function saveUserLimits(userId) {
    const adLimitInput = document.getElementById('customAdLimit');
    const scanLimitInput = document.getElementById('customScanLimit');

    const adLimit = adLimitInput.value ? parseInt(adLimitInput.value) : null;
    const scanLimit = scanLimitInput.value ? parseInt(scanLimitInput.value) : null;

    try {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        const updates = {
            customAdLimit: adLimit,
            customScanLimit: scanLimit
        };

        console.log(`🛡️ Admin: Saving limits for user ${userId}:`, updates);

        // Remove field if null
        if (adLimit === null) updates.customAdLimit = firebase.firestore.FieldValue.delete();
        if (scanLimit === null) updates.customScanLimit = firebase.firestore.FieldValue.delete();

        await db.collection('users').doc(userId).update(updates);

        // Log admin action
        await logAdminAction('update_user_limits', {
            targetUserId: userId,
            targetUserName: user.displayName || user.email,
            adLimit: adLimit,
            scanLimit: scanLimit
        });

        if (window.UIComponents) {
            window.UIComponents.showSuccessToast('User limits updated successfully.', 'Limits Saved', 10000);
            await loadUsers(); // Refresh data
            // Delay updating the detail view slightly to let user read the toast
            setTimeout(() => viewUserDetails(userId), 2500);
        } else {
            alert('User limits updated successfully.');
            await loadUsers();
            viewUserDetails(userId);
        }

    } catch (error) {
        console.error('Error updating user limits:', error);
        alert('Failed to update user limits. Please try again.');
    }
}

/**
 * Reset user's usage for today
 */
async function resetUserUsage(userId) {
    if (!confirm('Are you sure you want to reset this user\'s usage counts for today? This cannot be undone.')) {
        return;
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        const usageId = `${userId}_${today}`;

        await db.collection('usage_tracking').doc(usageId).delete();

        if (window.UIComponents) {
            window.UIComponents.showSuccessToast('Usage counts reset for today.', 'Usage Reset');
        } else {
            alert('Usage counts reset for today.');
        }

        // Refresh details
        viewUserDetails(userId);

    } catch (error) {
        console.error('Error resetting user usage:', error);
        alert('Failed to reset usage. Please try again.');
    }
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
    document.getElementById('loadingState').style.display = show ? 'flex' : 'none';
}
