/**
 * Email template for new message notifications
 */
function getMessageNotificationTemplate({ recipientName, senderName, listingTitle, messagePreview, conversationUrl }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px; background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">
                                🍁 Canadian AI Classifieds
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
                                Hi ${recipientName},
                            </h2>
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                <strong>${senderName}</strong> sent you a message about "<strong>${listingTitle}</strong>":
                            </p>
                            <div style="background-color: #f9fafb; border-left: 4px solid #4A90E2; padding: 16px; margin: 0 0 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px; font-style: italic;">
                                    "${messagePreview}..."
                                </p>
                            </div>
                            <a href="${conversationUrl}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                View Message
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                Don't want these emails? <a href="https://canadian-ai-classifieds.web.app/pages/notification-settings.html" style="color: #4A90E2;">Manage preferences</a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © 2026 Canadian AI Classifieds. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}

/**
 * Email template for price drop alerts
 */
function getPriceDropTemplate({ recipientName, listingTitle, oldPrice, newPrice, priceDropAmount, priceDropPercent, listingUrl, listingImage }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Price Drop Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">
                                💰 Price Drop Alert!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
                                Hi ${recipientName},
                            </h2>
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                Great news! An item you favorited just dropped in price:
                            </p>
                            
                            <!-- Listing Card -->
                            <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
                                <img src="${listingImage}" alt="${listingTitle}" style="width: 100%; height: 250px; object-fit: cover;">
                                <div style="padding: 20px;">
                                    <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">
                                        ${listingTitle}
                                    </h3>
                                    <div style="margin-bottom: 15px;">
                                        <span style="font-size: 28px; font-weight: bold; color: #10b981; margin-right: 12px;">
                                            $${newPrice.toLocaleString()}
                                        </span>
                                        <span style="font-size: 18px; color: #9ca3af; text-decoration: line-through;">
                                            $${oldPrice.toLocaleString()}
                                        </span>
                                    </div>
                                    <div style="background-color: #d1fae5; color: #065f46; padding: 8px 12px; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">
                                        Save $${priceDropAmount.toLocaleString()} (${priceDropPercent}% off!)
                                    </div>
                                </div>
                            </div>
                            
                            <a href="${listingUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                View Listing
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                Don't want price alerts? <a href="https://canadian-ai-classifieds.web.app/pages/notification-settings.html" style="color: #10b981;">Manage preferences</a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © 2026 Canadian AI Classifieds. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}

/**
 * Email template for weekly digest
 */
function getWeeklyDigestTemplate({ recipientName, listings, totalNewListings }) {
    const listingsHTML = listings.map(listing => {
        const price = typeof listing.price === 'number' ? listing.price : 0;
        const imageUrl = listing.images && listing.images[0] ? listing.images[0] : 'https://via.placeholder.com/300x200?text=No+Image';
        const city = listing.location?.city || 'Unknown';
        const province = listing.location?.province || 'Unknown';

        return `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
        <img src="${imageUrl}" alt="${listing.title}" style="width: 100%; height: 180px; object-fit: cover;">
        <div style="padding: 16px;">
            <h4 style="margin: 0 0 8px 0; color: #111827; font-size: 16px;">
                ${listing.title}
            </h4>
            <p style="margin: 0 0 12px 0; color: #10b981; font-size: 20px; font-weight: bold;">
                $${price.toLocaleString()}
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                📍 ${city}, ${province}
            </p>
        </div>
    </div>
  `;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">
                                📬 Your Weekly Digest
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
                                Hi ${recipientName},
                            </h2>
                            <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                Here are ${totalNewListings} new listings from this week that might interest you:
                            </p>
                            
                            ${listingsHTML}
                            
                            <a href="https://canadian-ai-classifieds.web.app/pages/browse-listings.html" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 20px;">
                                Browse All Listings
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                Don't want weekly digests? <a href="https://canadian-ai-classifieds.web.app/pages/notification-settings.html" style="color: #6366f1;">Unsubscribe</a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © 2026 Canadian AI Classifieds. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}

module.exports = {
    getMessageNotificationTemplate,
    getPriceDropTemplate,
    getWeeklyDigestTemplate
};
