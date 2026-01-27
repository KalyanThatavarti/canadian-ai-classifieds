// Chat Interface JavaScript

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('id');

    if (!conversationId) {
        window.location.href = 'index.html';
        return;
    }

    let currentUser = null;
    let unsubscribeMessages = null;
    let conversationData = null;

    init();

    function init() {
        if (window.FirebaseAPI && window.FirebaseAPI.auth) {
            setupAuthListener();
        } else {
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
                loadConversationDetails();
            } else {
                window.location.href = '../auth/login.html?redirect=' + encodeURIComponent(window.location.href);
            }
        });
    }

    async function loadConversationDetails() {
        try {
            // Get conversation metadata directly from Firestore ref since we don't have a direct "getConversation" helper yet
            // usages: window.FirebaseAPI.db.collection('conversations').doc(conversationId).get()
            const doc = await window.FirebaseAPI.db.collection('conversations').doc(conversationId).get();

            if (!doc.exists) {
                alert('Conversation not found');
                window.location.href = 'index.html';
                return;
            }

            conversationData = doc.data();

            // Verify participation
            if (!conversationData.participantIds.includes(currentUser.uid)) {
                alert('Unauthorized');
                window.location.href = 'index.html';
                return;
            }

            updateHeader();
            loadMessages();
            markConversationAsRead();

        } catch (error) {
            console.error('Error loading chat:', error);
        }
    }

    function updateHeader() {
        // Find other user
        const otherUserId = conversationData.participantIds.find(id => id !== currentUser.uid);

        // Listing info
        document.getElementById('listingTitle').textContent = conversationData.listingTitle;
        document.getElementById('listingLink').href = `../listing-detail.html?id=${conversationData.listingId}`;

        // Fetch profile
        window.FirebaseAPI.getUserProfile(otherUserId).then(profile => {
            document.getElementById('chatTitle').textContent = profile.displayName || 'User';
            // Could add avatar to header if UI supported it
        }).catch(() => {
            document.getElementById('chatTitle').textContent = 'User';
        });
    }

    function loadMessages() {
        const messagesArea = document.getElementById('messagesArea');

        unsubscribeMessages = window.FirebaseAPI.getMessages(conversationId, (messages) => {
            messagesArea.innerHTML = '';

            if (messages.length === 0) {
                messagesArea.innerHTML = '<div class="empty-state">No messages yet. Say hi!</div>';
                return;
            }

            // Group messages by date could be done here
            messages.forEach(msg => {
                const bubble = document.createElement('div');
                const isMine = msg.senderId === currentUser.uid;

                bubble.className = `message-bubble ${isMine ? 'sent' : 'received'}`;

                const timeStr = msg.timestamp ?
                    msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                    'Sending...';

                bubble.innerHTML = `
                    ${escapeHtml(msg.text)}
                    <div class="message-time">${timeStr}</div>
                `;

                messagesArea.appendChild(bubble);
            });

            // Scroll to bottom
            scrollToBottom();
        });
    }

    function scrollToBottom() {
        const messagesArea = document.getElementById('messagesArea');
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    function markConversationAsRead() {
        window.FirebaseAPI.markAsRead(conversationId, currentUser.uid);
    }

    // Send Message
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text) return;

        messageInput.value = '';
        messageInput.style.height = 'auto'; // Reset height
        sendBtn.disabled = true;

        try {
            await window.FirebaseAPI.sendMessage(conversationId, text);
            sendBtn.disabled = false;
            // Scroll will happen via listener
        } catch (error) {
            console.error('Send failed:', error);
            alert('Failed to send message');
            sendBtn.disabled = false;
        }
    });

    // Auto-resize input
    messageInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value.trim().length > 0) {
            sendBtn.disabled = false;
        } else {
            sendBtn.disabled = true;
        }
    });

    // Escaping helper
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }
});
