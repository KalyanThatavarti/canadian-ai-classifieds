/**
 * Admin Reports Management
 * Handles viewing, filtering, resolving, and dismissing user reports
 */

let allReports = [];
let filteredReports = [];
let currentReportToProcess = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await requireAdmin();
    await loadReports();
    setupEventListeners();
});

/**
 * Load all reports from Firestore
 */
async function loadReports() {
    try {
        showLoading(true);

        const reportsSnapshot = await db.collection('reports').get();
        allReports = [];

        for (const doc of reportsSnapshot.docs) {
            const reportData = doc.data();

            // Get listing details
            let listingTitle = 'Unknown';
            let listingId = reportData.listingId;
            if (listingId) {
                try {
                    const listingDoc = await db.collection('listings').doc(listingId).get();
                    if (listingDoc.exists) {
                        listingTitle = listingDoc.data().title;
                    }
                } catch (error) {
                    console.error('Error fetching listing:', error);
                }
            }

            // Get reporter name
            let reporterName = 'Anonymous';
            if (reportData.reporterId) {
                try {
                    const userDoc = await db.collection('users').doc(reportData.reporterId).get();
                    if (userDoc.exists) {
                        reporterName = userDoc.data().displayName || userDoc.data().email;
                    }
                } catch (error) {
                    console.error('Error fetching reporter:', error);
                }
            }

            allReports.push({
                id: doc.id,
                ...reportData,
                listingTitle,
                reporterName,
                status: reportData.status || 'pending',
                priority: calculatePriority(reportData)
            });
        }

        filteredReports = [...allReports];
        updateStats();
        displayReports();
        showLoading(false);

    } catch (error) {
        console.error('Error loading reports:', error);
        alert('Failed to load reports. Please refresh the page.');
        showLoading(false);
    }
}

/**
 * Calculate priority based on report type and age
 */
function calculatePriority(report) {
    const highPriorityTypes = ['scam', 'inappropriate'];
    const reportAge = Date.now() - (report.createdAt?.toMillis() || Date.now());
    const daysSinceReport = reportAge / (1000 * 60 * 60 * 24);

    if (highPriorityTypes.includes(report.type)) {
        return 'high';
    } else if (daysSinceReport > 7) {
        return 'high'; // Old reports become high priority
    } else if (daysSinceReport > 3) {
        return 'medium';
    } else {
        return 'low';
    }
}

/**
 * Display reports in table
 */
function displayReports() {
    const tbody = document.getElementById('reportsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (filteredReports.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = filteredReports.map(report => {
        const reportDate = report.createdAt ?
            new Date(report.createdAt.toDate()).toLocaleDateString() : 'N/A';

        const statusBadge = getStatusBadge(report.status);
        const priorityBadge = getPriorityBadge(report.priority);

        return `
            <tr data-report-id="${report.id}">
                <td>
                    <div class="report-info">
                        <span class="reporter-name">${report.reporterName}</span>
                        <span class="report-reason">${truncateText(report.reason, 60)}</span>
                    </div>
                </td>
                <td>
                    <a href="/pages/listing-detail.html?id=${report.listingId}" 
                       class="listing-link" target="_blank" title="View Listing">
                        ${truncateText(report.listingTitle, 30)}
                    </a>
                </td>
                <td>${formatReportType(report.type)}</td>
                <td>${priorityBadge}</td>
                <td>${statusBadge}</td>
                <td>${reportDate}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="viewReportDetails('${report.id}')" class="btn-icon" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${report.status === 'pending' ? `
                            <button onclick="openResolveModal('${report.id}')" class="btn-icon btn-success" title="Resolve">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="openDismissModal('${report.id}')" class="btn-icon btn-warning" title="Dismiss">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
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
        pending: '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Pending</span>',
        resolved: '<span class="status-badge status-resolved"><i class="fas fa-check-circle"></i> Resolved</span>',
        dismissed: '<span class="status-badge status-dismissed"><i class="fas fa-times-circle"></i> Dismissed</span>'
    };
    return badges[status] || badges.pending;
}

/**
 * Get priority badge HTML
 */
function getPriorityBadge(priority) {
    const badges = {
        high: '<span class="priority-badge priority-high"><i class="fas fa-exclamation-circle"></i> High</span>',
        medium: '<span class="priority-badge priority-medium"><i class="fas fa-exclamation-triangle"></i> Medium</span>',
        low: '<span class="priority-badge priority-low"><i class="fas fa-info-circle"></i> Low</span>'
    };
    return badges[priority] || badges.low;
}

/**
 * Format report type for display
 */
function formatReportType(type) {
    const types = {
        spam: 'Spam',
        inappropriate: 'Inappropriate',
        scam: 'Scam/Fraud',
        duplicate: 'Duplicate',
        other: 'Other'
    };
    return types[type] || type;
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Update statistics
 */
function updateStats() {
    document.getElementById('totalReports').textContent = allReports.length;
    document.getElementById('pendingReports').textContent =
        allReports.filter(r => r.status === 'pending').length;
    document.getElementById('resolvedReports').textContent =
        allReports.filter(r => r.status === 'resolved').length;
    document.getElementById('dismissedReports').textContent =
        allReports.filter(r => r.status === 'dismissed').length;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search
    document.getElementById('reportSearch').addEventListener('input', filterReports);

    // Filters
    document.getElementById('statusFilter').addEventListener('change', filterReports);
    document.getElementById('typeFilter').addEventListener('change', filterReports);
    document.getElementById('sortBy').addEventListener('change', sortReports);

    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', loadReports);

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
 * Filter reports based on search, status, and type
 */
function filterReports() {
    const searchTerm = document.getElementById('reportSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    filteredReports = allReports.filter(report => {
        // Search filter
        const matchesSearch = !searchTerm ||
            report.listingTitle?.toLowerCase().includes(searchTerm) ||
            report.reporterName?.toLowerCase().includes(searchTerm) ||
            report.reason?.toLowerCase().includes(searchTerm);

        // Status filter
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

        // Type filter
        const matchesType = typeFilter === 'all' || report.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    sortReports();
}

/**
 * Sort filtered reports
 */
function sortReports() {
    const sortBy = document.getElementById('sortBy').value;

    switch (sortBy) {
        case 'newest':
            filteredReports.sort((a, b) =>
                (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
            );
            break;
        case 'oldest':
            filteredReports.sort((a, b) =>
                (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)
            );
            break;
        case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            filteredReports.sort((a, b) =>
                priorityOrder[b.priority] - priorityOrder[a.priority]
            );
            break;
    }

    displayReports();
}

/**
 * View report details
 */
function viewReportDetails(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;

    const reportDate = report.createdAt ?
        new Date(report.createdAt.toDate()).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';

    const content = `
        <div class="user-details">
            <div class="detail-section">
                <h4><i class="fas fa-info-circle"></i> Report Information</h4>
                <dl>
                    <dt>Report ID:</dt>
                    <dd><code>${report.id}</code></dd>
                    
                    <dt>Status:</dt>
                    <dd>${getStatusBadge(report.status)}</dd>
                    
                    <dt>Priority:</dt>
                    <dd>${getPriorityBadge(report.priority)}</dd>
                    
                    <dt>Type:</dt>
                    <dd>${formatReportType(report.type)}</dd>
                    
                    <dt>Submitted:</dt>
                    <dd>${reportDate}</dd>
                </dl>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-user"></i> Reporter Details</h4>
                <dl>
                    <dt>Reporter:</dt>
                    <dd>${report.reporterName}</dd>
                    
                    <dt>Reporter ID:</dt>
                    <dd><code>${report.reporterId || 'N/A'}</code></dd>
                </dl>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-box"></i> Listing Details</h4>
                <dl>
                    <dt>Listing Title:</dt>
                    <dd>
                        <a href="/pages/listing-detail.html?id=${report.listingId}" 
                           class="listing-link" target="_blank">
                            ${report.listingTitle}
                        </a>
                    </dd>
                    
                    <dt>Listing ID:</dt>
                    <dd><code>${report.listingId || 'N/A'}</code></dd>
                </dl>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-comment"></i> Report Reason</h4>
                <p style="color: #1f2937; margin-top: 0.5rem;">${report.reason || 'No reason provided'}</p>
            </div>

            ${report.status !== 'pending' ? `
                <div class="detail-section ${report.status === 'resolved' ? '' : 'warning'}">
                    <h4><i class="fas fa-clipboard-check"></i> Resolution Details</h4>
                    <dl>
                        <dt>Resolved By:</dt>
                        <dd>${report.resolvedBy || report.dismissedBy || 'N/A'}</dd>
                        
                        <dt>Resolved At:</dt>
                        <dd>${report.resolvedAt ? new Date(report.resolvedAt.toDate()).toLocaleString() : 'N/A'}</dd>
                        
                        ${report.resolutionNotes ? `
                            <dt>Notes:</dt>
                            <dd>${report.resolutionNotes}</dd>
                        ` : ''}
                        
                        ${report.dismissalReason ? `
                            <dt>Dismissal Reason:</dt>
                            <dd>${report.dismissalReason}</dd>
                        ` : ''}
                    </dl>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('reportDetailsContent').innerHTML = content;
    document.getElementById('reportDetailsModal').style.display = 'block';
}

/**
 * Close report details modal
 */
function closeReportDetailsModal() {
    document.getElementById('reportDetailsModal').style.display = 'none';
}

/**
 * Open resolve modal
 */
function openResolveModal(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;

    currentReportToProcess = report;
    document.getElementById('resolveNotes').value = '';
    document.getElementById('deleteListing').checked = false;
    document.getElementById('resolveModal').style.display = 'block';
}

/**
 * Close resolve modal
 */
function closeResolveModal() {
    document.getElementById('resolveModal').style.display = 'none';
    currentReportToProcess = null;
}

/**
 * Confirm resolve report
 */
async function confirmResolve() {
    if (!currentReportToProcess) return;

    const notes = document.getElementById('resolveNotes').value.trim();
    if (!notes) {
        alert('Please provide resolution notes.');
        return;
    }

    const deleteListing = document.getElementById('deleteListing').checked;

    try {
        const currentAdmin = auth.currentUser;

        // Update report status
        await db.collection('reports').doc(currentReportToProcess.id).update({
            status: 'resolved',
            resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            resolvedBy: currentAdmin.displayName || currentAdmin.email,
            resolutionNotes: notes
        });

        // Delete listing if requested
        if (deleteListing && currentReportToProcess.listingId) {
            await db.collection('listings').doc(currentReportToProcess.listingId).delete();
        }

        // Log admin action
        await logAdminAction('resolve_report', {
            reportId: currentReportToProcess.id,
            listingId: currentReportToProcess.listingId,
            listingTitle: currentReportToProcess.listingTitle,
            notes: notes,
            deletedListing: deleteListing
        });

        alert('Report has been resolved successfully.');
        closeResolveModal();
        await loadReports();

    } catch (error) {
        console.error('Error resolving report:', error);
        alert('Failed to resolve report. Please try again.');
    }
}

/**
 * Open dismiss modal
 */
function openDismissModal(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;

    currentReportToProcess = report;
    document.getElementById('dismissReason').value = '';
    document.getElementById('dismissModal').style.display = 'block';
}

/**
 * Close dismiss modal
 */
function closeDismissModal() {
    document.getElementById('dismissModal').style.display = 'none';
    currentReportToProcess = null;
}

/**
 * Confirm dismiss report
 */
async function confirmDismiss() {
    if (!currentReportToProcess) return;

    const reason = document.getElementById('dismissReason').value.trim();
    if (!reason) {
        alert('Please provide a reason for dismissal.');
        return;
    }

    try {
        const currentAdmin = auth.currentUser;

        // Update report status
        await db.collection('reports').doc(currentReportToProcess.id).update({
            status: 'dismissed',
            dismissedAt: firebase.firestore.FieldValue.serverTimestamp(),
            dismissedBy: currentAdmin.displayName || currentAdmin.email,
            dismissalReason: reason
        });

        // Log admin action
        await logAdminAction('dismiss_report', {
            reportId: currentReportToProcess.id,
            listingId: currentReportToProcess.listingId,
            listingTitle: currentReportToProcess.listingTitle,
            reason: reason
        });

        alert('Report has been dismissed.');
        closeDismissModal();
        await loadReports();

    } catch (error) {
        console.error('Error dismissing report:', error);
        alert('Failed to dismiss report. Please try again.');
    }
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
    document.getElementById('loadingState').style.display = show ? 'flex' : 'none';
}
