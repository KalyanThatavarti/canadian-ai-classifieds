// Messages Inbox JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    let currentUser = null;
    let unsubscribeConversations = null;

    // Initialize
    init();

    function init() {
        // Wait for Firebase to be ready
        if (window.FirebaseAPI && window.FirebaseAPI.auth) {
            setupAuthListener();
        } else {
            // Poll for Firebase
            const checkFirebase = setInterval(() => {
                if (window.FirebaseAPI && window.FirebaseAPI.auth) {
                    clearInterval(checkFirebase);
                    setupAuthListener();
                }
            }, 100);
        }
    }

    function setupAuthListener() {
        window.FirebaseAPI.auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                loadConversations();
            } else {
                // Redirect to login
                window.location.href = '../auth/login.html?redirect=../pages/messages/index.html';
            }
        });
    }

    function loadConversations() {
        const listContainer = document.getElementById('conversationList');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');

        if (loadingState) loadingState.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';

        // Subscribe to real-time updates
        unsubscribeConversations = window.FirebaseAPI.getConversations(currentUser.uid, (conversations) => {
            if (loadingState) loadingState.style.display = 'none';

            if (conversations.length === 0) {
                listContainer.innerHTML = '';
                if (emptyState) emptyState.style.display = 'flex';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';
            renderConversations(conversations);
        });
    }

    function renderConversations(conversations) {
        const listContainer = document.getElementById('conversationList');
        listContainer.innerHTML = '';

        conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';

            // Check if unread
            const isRead = conv.readStatus && conv.readStatus[currentUser.uid];
            if (!isRead) {
                item.classList.add('unread');
            }

            // Determine other participant (simple logic: assuming 2 people)
            const otherUserId = conv.participantIds.find(id => id !== currentUser.uid);

            // In a real app, we'd fetch the other user's profile to get name/avatar
            // For now, we might rely on cached data or just show "User" if not available
            // Or better, we could store participant names in the conversation doc itself for preview

            const timeAgo = getTimeAgo(conv.lastMessageTimestamp ? conv.lastMessageTimestamp.toDate() : new Date());

            item.innerHTML = `
                <img src="${'../../images/default-avatar.png'}" alt="User" class="item-avatar">
                <div class="item-content">
                    <div class="item-header">
                        <span class="item-name">User</span> <!-- Placeholder until we fetch profile -->
                        <span class="item-time">${timeAgo}</span>
                    </div>
                    <div class="item-listing">${conv.listingTitle || 'Item'}</div>
                    <div class="item-preview">${conv.lastMessage || 'Sent an image'}</div>
                </div>
            `;

            item.addEventListener('click', () => {
                window.location.href = `chat.html?id=${conv.id}`;
            });

            // Fetch profile for better UX (optional enhancement)
            window.FirebaseAPI.getUserProfile(otherUserId).then(profile => {
                const nameEl = item.querySelector('.item-name');
                const imgEl = item.querySelector('.item-avatar');
                if (profile.displayName) nameEl.textContent = profile.displayName;
                if (profile.photoURL) imgEl.src = profile.photoURL;
            }).catch(() => {
                // Ignore error, keep default
            });

            listContainer.appendChild(item);
        });
    }

    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    }
});
