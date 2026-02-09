// Helper script to debug Unread Status logic
(async function debugUnread() {
    console.clear();
    console.log("🐞 Starting Unread Logic Diagnostics...");

    if (!window.FirebaseAPI || !window.FirebaseAPI.auth) {
        console.error("❌ FirebaseAPI not loaded. Please wait or refresh.");
        return;
    }

    const user = window.FirebaseAPI.auth.currentUser;
    if (!user) {
        console.error("❌ No user logged in. Please log in first.");
        return;
    }

    console.log(`👤 Checking conversations for User: ${user.uid} (${user.email})`);

    try {
        const snapshot = await window.FirebaseAPI.db.collection('conversations')
            .where('participantIds', 'array-contains', user.uid)
            .get();

        if (snapshot.empty) {
            console.log("⚠️ No conversations found for this user.");
            return;
        }

        console.log(`📦 Found ${snapshot.size} conversations.`);

        let unreadCount = 0;
        let malformedCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const readStatus = data.readStatus;

            console.group(`Conversation ID: ${doc.id}`);
            console.log("Full Data:", data);

            if (!readStatus) {
                console.error("❌ Missing 'readStatus' field!");
                malformedCount++;
            } else {
                const userStatus = readStatus[user.uid];
                console.log(`readStatus:`, readStatus);
                console.log(`My Status (${user.uid}):`, userStatus);

                if (!userStatus) {
                    console.log("🔔 This should be UNREAD");
                    unreadCount++;
                } else {
                    console.log("✅ This is READ");
                }
            }
            console.groupEnd();
        });

        console.log("--- SUMMARY ---");
        console.log(`Total Conversations: ${snapshot.size}`);
        console.log(`Calculated Unread: ${unreadCount}`);
        console.log(`Malformed (Missing readStatus): ${malformedCount}`);

        // Check what the UI thinks
        const badge = document.getElementById('header-msg-badge');
        if (badge) {
            console.log(`UI Badge Value: ${badge.textContent}`);
            console.log(`UI Badge Visible: ${badge.style.display !== 'none'}`);
        } else {
            console.error("❌ Header badge element not found in DOM");
        }

    } catch (e) {
        console.error("❌ Error fetching conversations:", e);
    }
})();
