const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendMessageNotification, sendPriceDropAlert, sendWeeklyDigest } = require('./lib/email-service');

admin.initializeApp();

/**
 * Trigger: New message created
 * Sends email notification to the recipient when someone sends them a message
 */
exports.onMessageCreated = functions.firestore
    .document('conversations/{conversationId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        try {
            const message = snap.data();
            const conversationId = context.params.conversationId;

            console.log(`📧 Processing message notification for conversation: ${conversationId}`);

            // Get conversation details
            const conversation = await admin.firestore()
                .collection('conversations')
                .doc(conversationId)
                .get();

            if (!conversation.exists) {
                console.error('Conversation not found');
                return null;
            }

            const conversationData = conversation.data();

            // Determine recipient (not the sender)
            const recipientId = conversationData.participantIds.find(
                id => id !== message.senderId
            );

            if (!recipientId) {
                console.error('Recipient not found');
                return null;
            }

            // Get recipient's profile and notification preferences
            const recipientDoc = await admin.firestore()
                .collection('users')
                .doc(recipientId)
                .get();

            if (!recipientDoc.exists) {
                console.error('Recipient profile not found');
                return null;
            }

            const recipient = recipientDoc.data();

            // Check if user wants message notifications
            const emailPreferences = recipient.emailNotifications || {};
            if (emailPreferences.messages === false) {
                console.log('📭 User has disabled message notifications');
                return null;
            }

            // Send notification
            await sendMessageNotification({
                recipientEmail: recipient.email,
                recipientName: recipient.displayName || 'there',
                senderName: message.senderName || 'A user',
                listingTitle: conversationData.listing?.title || 'a listing',
                messagePreview: message.text.substring(0, 100),
                conversationUrl: `https://canadian-ai-classifieds.web.app/pages/messages/conversation.html?id=${conversationId}`
            });

            console.log('✅ Message notification sent successfully');
            return null;
        } catch (error) {
            console.error('❌ Error sending message notification:', error);
            return null;
        }
    });

/**
 * Trigger: Listing price changed
 * Sends email alerts to users who favorited the listing when price drops
 */
exports.onListingPriceChanged = functions.firestore
    .document('listings/{listingId}')
    .onUpdate(async (change, context) => {
        try {
            const before = change.before.data();
            const after = change.after.data();
            const listingId = context.params.listingId;

            console.log(`💰 Processing price change for listing: ${listingId}`);

            // Check if price actually decreased
            if (after.price >= before.price) {
                console.log('Price did not decrease, skipping notification');
                return null;
            }

            const priceDropAmount = before.price - after.price;
            const priceDropPercent = Math.round((priceDropAmount / before.price) * 100);

            // Only notify if price dropped by at least 10% or $50
            if (priceDropPercent < 10 && priceDropAmount < 50) {
                console.log('Price drop too small, skipping notification');
                return null;
            }

            console.log(`Price dropped by $${priceDropAmount} (${priceDropPercent}%)`);

            // Find all users who favorited this listing
            const usersSnapshot = await admin.firestore()
                .collectionGroup('favorites')
                .where('listingId', '==', listingId)
                .get();

            if (usersSnapshot.empty) {
                console.log('No users have favorited this listing');
                return null;
            }

            console.log(`Found ${usersSnapshot.size} users who favorited this listing`);

            // Send notification to each user
            const promises = usersSnapshot.docs.map(async (favoriteDoc) => {
                const userId = favoriteDoc.ref.parent.parent.id;

                try {
                    const userDoc = await admin.firestore()
                        .collection('users')
                        .doc(userId)
                        .get();

                    if (!userDoc.exists) {
                        console.error(`User ${userId} not found`);
                        return;
                    }

                    const user = userDoc.data();

                    // Check notification preferences
                    const emailPreferences = user.emailNotifications || {};
                    if (emailPreferences.priceDrops === false) {
                        console.log(`User ${userId} has disabled price drop notifications`);
                        return;
                    }

                    await sendPriceDropAlert({
                        recipientEmail: user.email,
                        recipientName: user.displayName || 'there',
                        listingTitle: after.title,
                        oldPrice: before.price,
                        newPrice: after.price,
                        priceDropAmount,
                        priceDropPercent,
                        listingUrl: `https://canadian-ai-classifieds.web.app/pages/listing-detail.html?id=${listingId}`,
                        listingImage: after.images && after.images[0] ? after.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'
                    });

                    console.log(`✅ Price drop alert sent to ${user.email}`);
                } catch (error) {
                    console.error(`Error sending price drop alert to user ${userId}:`, error);
                }
            });

            await Promise.all(promises);
            console.log('✅ All price drop alerts processed');
            return null;
        } catch (error) {
            console.error('❌ Error processing price change:', error);
            return null;
        }
    });

/**
 * Scheduled: Weekly digest
 * Runs every Monday at 9 AM EST
 * Sends a digest of new listings to opted-in users
 */
exports.sendWeeklyDigest = functions.pubsub
    .schedule('0 9 * * MON')
    .timeZone('America/Toronto')
    .onRun(async (context) => {
        try {
            console.log('📬 Starting weekly digest job');

            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Get all users who opted in for digest
            const usersSnapshot = await admin.firestore()
                .collection('users')
                .where('emailNotifications.weeklyDigest', '==', true)
                .get();

            if (usersSnapshot.empty) {
                console.log('No users opted in for weekly digest');
                return null;
            }

            console.log(`Found ${usersSnapshot.size} users opted in for weekly digest`);

            const promises = usersSnapshot.docs.map(async (userDoc) => {
                const user = userDoc.data();

                try {
                    // Get new listings from the past week
                    const newListingsSnapshot = await admin.firestore()
                        .collection('listings')
                        .where('createdAt', '>', oneWeekAgo)
                        .where('status', '==', 'active')
                        .orderBy('createdAt', 'desc')
                        .limit(10)
                        .get();

                    if (newListingsSnapshot.empty) {
                        console.log(`No new listings for user ${user.email}`);
                        return;
                    }

                    const newListings = newListingsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    await sendWeeklyDigest({
                        recipientEmail: user.email,
                        recipientName: user.displayName || 'there',
                        listings: newListings,
                        totalNewListings: newListings.length
                    });

                    console.log(`✅ Weekly digest sent to ${user.email}`);
                } catch (error) {
                    console.error(`Error sending digest to ${user.email}:`, error);
                }
            });

            await Promise.all(promises);
            console.log('✅ Weekly digest job completed');
            return null;
        } catch (error) {
            console.error('❌ Error in weekly digest job:', error);
            return null;
        }
    });
