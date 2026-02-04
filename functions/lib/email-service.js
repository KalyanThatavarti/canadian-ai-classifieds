const { Resend } = require('resend');
const functions = require('firebase-functions');
const { getMessageNotificationTemplate, getPriceDropTemplate, getWeeklyDigestTemplate } = require('./email-templates');

// Initialize Resend with API key
// TODO: Move to Firebase Secrets after first deployment
const apiKey = 're_BaCpufdQ_GaZRUMyPyevXPcNFVicfNCEq';
const resend = new Resend(apiKey);

// Use Resend's onboarding email for now (can be customized later with your domain)
const FROM_EMAIL = 'Canadian Classifieds <onboarding@resend.dev>';

/**
 * Send message notification email
 */
async function sendMessageNotification({ recipientEmail, recipientName, senderName, listingTitle, messagePreview, conversationUrl }) {
    try {
        console.log(`📧 Sending message notification to ${recipientEmail}`);

        const html = getMessageNotificationTemplate({
            recipientName,
            senderName,
            listingTitle,
            messagePreview,
            conversationUrl
        });

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject: `💬 New message from ${senderName} about "${listingTitle}"`,
            html: html
        });

        if (error) {
            console.error('Resend API error:', error);
            throw error;
        }

        console.log('✅ Message notification sent successfully. Email ID:', data.id);
        return data;
    } catch (error) {
        console.error('❌ Failed to send message notification:', error);
        throw error;
    }
}

/**
 * Send price drop alert email
 */
async function sendPriceDropAlert({ recipientEmail, recipientName, listingTitle, oldPrice, newPrice, priceDropAmount, priceDropPercent, listingUrl, listingImage }) {
    try {
        console.log(`💰 Sending price drop alert to ${recipientEmail}`);

        const html = getPriceDropTemplate({
            recipientName,
            listingTitle,
            oldPrice,
            newPrice,
            priceDropAmount,
            priceDropPercent,
            listingUrl,
            listingImage
        });

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject: `💰 Price drop alert: ${listingTitle} is now $${newPrice} (${priceDropPercent}% off!)`,
            html: html
        });

        if (error) {
            console.error('Resend API error:', error);
            throw error;
        }

        console.log('✅ Price drop alert sent successfully. Email ID:', data.id);
        return data;
    } catch (error) {
        console.error('❌ Failed to send price drop alert:', error);
        throw error;
    }
}

/**
 * Send weekly digest email
 */
async function sendWeeklyDigest({ recipientEmail, recipientName, listings, totalNewListings }) {
    try {
        console.log(`📬 Sending weekly digest to ${recipientEmail}`);

        const html = getWeeklyDigestTemplate({
            recipientName,
            listings,
            totalNewListings
        });

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject: `📬 Your weekly digest: ${totalNewListings} new listings this week`,
            html: html
        });

        if (error) {
            console.error('Resend API error:', error);
            throw error;
        }

        console.log('✅ Weekly digest sent successfully. Email ID:', data.id);
        return data;
    } catch (error) {
        console.error('❌ Failed to send weekly digest:', error);
        throw error;
    }
}

module.exports = {
    sendMessageNotification,
    sendPriceDropAlert,
    sendWeeklyDigest
};
