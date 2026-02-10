// Listing Detail Page JavaScript
// Handles listing display, image gallery, lightbox, and similar listings

document.addEventListener('DOMContentLoaded', function () {
    // Get listing ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('id');

    if (!listingId) {
        // Redirect to browse if no ID provided
        window.location.href = 'browse-listings.html';
        return;
    }

    // State
    let listing = null;
    let currentImageIndex = 0;

    // Initialize
    loadListingData();

    async function loadListingData() {
        // 1. Try sample data first (fastest)
        listing = sampleListings.find(l => l.id === listingId);

        // 2. If not found, try Firestore
        if (!listing) {
            try {
                // Show loading indicator if defined, or just wait
                if (window.UIComponents) {
                    const loadingOverlay = document.createElement('div');
                    loadingOverlay.id = 'pageLoading';
                    loadingOverlay.className = 'loading-overlay';
                    loadingOverlay.innerHTML = '<div class="spinner"></div>';
                    document.body.appendChild(loadingOverlay);
                }

                await waitForFirebase();

                const doc = await window.FirebaseAPI.db.collection('listings').doc(listingId).get();
                if (doc.exists) {
                    const data = doc.data();
                    listing = {
                        id: doc.id,
                        ...data,
                        // Ensure arrays/types
                        images: data.images || ['../images/placeholder.jpg'],
                        price: Number(data.price)
                    };
                }
            } catch (err) {
                console.error('Error fetching listing:', err);
            } finally {
                const loader = document.getElementById('pageLoading');
                if (loader) loader.remove();
            }
        }

        // 3. If still not found, error
        if (!listing) {
            alert('Listing not found');
            window.location.href = 'browse-listings.html';
            return;
        }

        // 4. Listing found, initialize page
        // Set totalImages here now that listing is loaded
        totalImages = listing.images.length;
        init();
    }

    // Placeholder for totalImages (will be set in loadListingData)
    let totalImages = 0;

    function init() {
        renderListing();
        renderImageGallery();
        renderSimilarListings();
        setupEventListeners();
        updateBreadcrumb();
    }

    function waitForFirebase(timeout = 5000) {
        return new Promise((resolve) => {
            if (window.FirebaseAPI && window.FirebaseAPI.db) {
                return resolve();
            }
            const start = Date.now();
            const interval = setInterval(() => {
                if (window.FirebaseAPI && window.FirebaseAPI.db) {
                    clearInterval(interval);
                    resolve();
                } else if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    console.warn('Firebase timeout');
                    resolve();
                }
            }, 100);
        });
    }

    function init() {
        renderListing();
        renderImageGallery();
        renderSimilarListings();
        setupEventListeners();
        updateBreadcrumb();
    }

    // Render listing information
    function renderListing() {
        // Category
        const categoryData = categories[listing.category];
        document.getElementById('listingCategory').textContent =
            `${categoryData.icon} ${categoryData.name}`;

        // Title
        document.getElementById('listingTitle').textContent = listing.title;

        // Price
        document.getElementById('listingPrice').textContent =
            `$${listing.price.toLocaleString()}`;

        // Badges
        if (listing.featured) {
            document.getElementById('featuredBadge').style.display = 'inline-block';
        }
        if (isListingNew(listing.createdAt)) {
            document.getElementById('newBadge').style.display = 'inline-block';
        }

        // Meta info
        document.getElementById('viewCount').textContent = `${listing.views} views`;
        document.getElementById('postedTime').textContent = getTimeAgo(listing.createdAt);

        // Description
        document.getElementById('listingDescription').textContent = listing.description;

        // Details
        document.getElementById('detailCondition').textContent = listing.condition;
        document.getElementById('detailCategory').textContent = categoryData.name;
        document.getElementById('detailLocation').textContent =
            `${listing.location.city}, ${listing.location.province}`;
        document.getElementById('detailPosted').textContent =
            new Date(listing.createdAt).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });


        // Seller information
        document.getElementById('sellerAvatar').src = listing.seller.avatar;
        document.getElementById('sellerAvatar').alt = listing.seller.name;
        document.getElementById('sellerName').textContent = listing.seller.name;

        // Make seller clickable to view profile
        const sellerAvatar = document.getElementById('sellerAvatar');
        const sellerName = document.getElementById('sellerName');
        const viewProfileBtn = document.querySelector('.view-profile-btn');

        const sellerUserId = listing.seller.id || listing.userId;

        [sellerAvatar, sellerName, viewProfileBtn].forEach(el => {
            if (el) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => {
                    window.location.href = `profile.html?userId=${sellerUserId}`;
                });
            }
        });

        if (listing.seller.verified) {
            document.getElementById('verifiedBadge').style.display = 'inline-flex';
        }

        // Seller rating
        const rating = listing.seller.rating || 5.0;
        const reviewCount = listing.seller.reviewCount || 0;
        const starsHtml = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
        document.querySelector('.rating-stars').textContent = starsHtml;
        document.querySelector('.rating-text').textContent =
            `${rating.toFixed(1)} (${reviewCount} review${reviewCount !== 1 ? 's' : ''})`;
    }


    // Render image gallery
    function renderImageGallery() {
        // Set main image
        updateMainImage();

        // Create thumbnails
        const thumbnailGrid = document.getElementById('thumbnailGrid');
        thumbnailGrid.innerHTML = listing.images.map((img, index) => `
            <img src="${img}" 
                 alt="Listing image ${index + 1}" 
                 class="thumbnail ${index === 0 ? 'active' : ''}"
                 data-index="${index}">
        `).join('');

        // Add click handlers to thumbnails
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function () {
                currentImageIndex = parseInt(this.dataset.index);
                updateMainImage();
                updateActiveThumbnail();
            });
        });

        // Update counter
        updateImageCounter();
    }

    // Update main image
    function updateMainImage() {
        const mainImage = document.getElementById('mainImage');
        mainImage.src = listing.images[currentImageIndex];
        mainImage.alt = listing.title;
    }

    // Update active thumbnail
    function updateActiveThumbnail() {
        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            if (index === currentImageIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    // Update image counter
    function updateImageCounter() {
        document.getElementById('imageCounter').textContent =
            `${currentImageIndex + 1} / ${totalImages}`;
    }

    // Navigate images
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % totalImages;
        updateMainImage();
        updateActiveThumbnail();
        updateImageCounter();
    }

    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
        updateMainImage();
        updateActiveThumbnail();
        updateImageCounter();
    }

    // Render similar listings (same category, different listing)
    function renderSimilarListings() {
        const similarListings = sampleListings
            .filter(l => l.category === listing.category && l.id !== listing.id)
            .slice(0, 4);

        const similarGrid = document.getElementById('similarGrid');

        if (similarListings.length === 0) {
            similarGrid.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No similar listings found</p>';
            return;
        }

        similarGrid.innerHTML = similarListings.map(item => createListingCard(item)).join('');

        // Add click handlers
        similarGrid.querySelectorAll('.listing-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                window.location.href = `listing-detail.html?id=${id}`;
            });
        });
    }

    // Create listing card (reused from browse)
    function createListingCard(item) {
        const isNew = isListingNew(item.createdAt);
        const timeAgo = getTimeAgo(item.createdAt);
        const categoryData = categories[item.category];

        return `
            <div class="listing-card" data-id="${item.id}" style="background: rgba(255, 255, 255, 0.95); border: 1px solid rgba(229, 221, 213, 0.3); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.3s ease;">
                <img src="${item.images[0]}" alt="${item.title}" style="width: 100%; height: 180px; object-fit: cover;">
                <div style="padding: 1rem;">
                    <div style="font-size: 0.75rem; color: #4a90e2; text-transform: uppercase; font-weight: 600; margin-bottom: 0.5rem;">
                        ${categoryData.icon} ${categoryData.name}
                    </div>
                    <h4 style="font-size: 1rem; font-weight: 600; color: #2C2C2C; margin: 0 0 0.5rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${item.title}
                    </h4>
                    <div style="font-size: 1.25rem; font-weight: 600; color: #2F5D3A; margin: 0.5rem 0;">
                        $${item.price.toLocaleString()}
                    </div>
                    <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
                        ${item.location.city}, ${item.location.province}
                    </div>
                </div>
            </div>
        `;
    }

    // Update breadcrumb
    function updateBreadcrumb() {
        const categoryData = categories[listing.category];
        document.getElementById('breadcrumbCategory').textContent = categoryData.name;
        document.getElementById('breadcrumbTitle').textContent =
            listing.title.length > 40 ? listing.title.substring(0, 40) + '...' : listing.title;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Image navigation
        document.getElementById('prevImage').addEventListener('click', prevImage);
        document.getElementById('nextImage').addEventListener('click', nextImage);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        });

        // Main image click - open lightbox
        document.getElementById('mainImage').addEventListener('click', openLightbox);

        // Lightbox controls
        document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
        document.getElementById('lightboxPrev').addEventListener('click', () => {
            prevImage();
            updateLightboxImage();
        });
        document.getElementById('lightboxNext').addEventListener('click', () => {
            nextImage();
            updateLightboxImage();
        });

        // Close lightbox on background click
        document.getElementById('lightboxModal').addEventListener('click', (e) => {
            if (e.target.id === 'lightboxModal') {
                closeLightbox();
            }
        });

        // ESC key to close lightbox
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });

        // Contact button
        document.getElementById('contactBtn').addEventListener('click', async () => {
            const currentUser = window.FirebaseAPI.getCurrentUser();

            if (!currentUser) {
                // Redirect to login
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `auth/login.html?redirect=${returnUrl}`;
                return;
            }

            const sellerId = listing.userId || (listing.seller && listing.seller.id);

            if (currentUser.uid === sellerId) {
                alert('You cannot message yourself!');
                return;
            }

            try {
                // Show loading state on button
                const btn = document.getElementById('contactBtn');
                const originalText = btn.textContent;
                btn.textContent = '...';
                btn.disabled = true;

                const conversationId = await window.FirebaseAPI.createConversation(
                    [currentUser.uid, sellerId],
                    listing.id,
                    {
                        title: listing.title,
                        image: listing.images && listing.images.length > 0 ? listing.images[0] : null
                    }
                );

                window.location.href = `messages/chat.html?id=${conversationId}`;
            } catch (error) {
                console.error('Failed to start conversation:', error);
                // Alert the ACTUAL error message to default to user
                alert('Error: ' + (error.message || 'Could not start conversation'));

                const btn = document.getElementById('contactBtn');
                btn.textContent = 'Contact Seller';
                btn.disabled = false;
            }
        });

        // Favorite buttons - integrate with Firebase
        const favoriteBtns = document.querySelectorAll('.favorite-btn');

        // Wait for Firebase auth to be ready, then check if listing is already favorited
        function checkFavoriteState() {
            if (window.FirebaseAPI && window.FirebaseAPI.getCurrentUser()) {
                const currentUser = window.FirebaseAPI.getCurrentUser();
                window.FirebaseAPI.isFavorited(currentUser.uid, listingId).then(isFav => {
                    favoriteBtns.forEach(btn => {
                        if (window.Utils && window.Utils.updateFavoriteButtonState) {
                            window.Utils.updateFavoriteButtonState(btn, isFav);
                        } else {
                            if (isFav) btn.classList.add('favorited');
                        }
                    });
                }).catch(err => {
                    console.log('Could not check favorite status:', err.message);
                });
            }
        }

        // Check immediately if Firebase is ready
        if (window.FirebaseAPI && window.FirebaseAPI.auth) {
            window.FirebaseAPI.auth.onAuthStateChanged(user => {
                if (user) {
                    checkFavoriteState();
                }
            });
        } else {
            // Wait for Firebase to be ready
            setTimeout(checkFavoriteState, 500);
        }

        // Attach click handlers to all favorite buttons
        favoriteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();

                // Check if user is logged in
                if (!window.FirebaseAPI || !window.FirebaseAPI.getCurrentUser()) {
                    if (window.UIComponents) {
                        window.UIComponents.showModal(
                            'Please sign in to save favorites',
                            'Sign In Required',
                            {
                                confirmText: 'Sign In',
                                cancelText: 'Cancel',
                                onConfirm: () => window.location.href = 'auth/login.html'
                            }
                        );
                    } else {
                        alert('Please sign in to save favorites');
                        window.location.href = 'auth/login.html';
                    }
                    return;
                }

                const currentUser = window.FirebaseAPI.getCurrentUser();

                try {
                    // Toggle favorite in Firebase
                    const isFavorited = await window.FirebaseAPI.toggleFavorite(currentUser.uid, listingId);

                    // Update ALL favorite buttons on the page
                    favoriteBtns.forEach(b => {
                        if (window.Utils && window.Utils.updateFavoriteButtonState) {
                            window.Utils.updateFavoriteButtonState(b, isFavorited);
                        }
                    });

                    // Show toast
                    if (window.UIComponents) {
                        if (isFavorited) {
                            window.UIComponents.showSuccessToast('Added to favorites', 'Success');
                        } else {
                            window.UIComponents.showInfoToast('Removed from favorites', 'Removed');
                        }
                    }
                } catch (error) {
                    console.error('Error toggling favorite:', error);
                    if (window.UIComponents) {
                        window.UIComponents.showErrorToast('Failed to update favorite', 'Error');
                    } else {
                        alert('Failed to update favorite. Please try again.');
                    }
                }
            });
        });

        // Share button
        document.getElementById('shareBtn').addEventListener('click', () => {
            const url = window.location.href;
            if (navigator.share) {
                navigator.share({
                    title: listing.title,
                    text: `Check out this listing: ${listing.title}`,
                    url: url
                }).catch(err => console.log('Error sharing:', err));
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(url).then(() => {
                    alert('Link copied to clipboard!');
                });
            }
        });

        // Report button and Modal Logic
        const reportBtn = document.getElementById('reportBtn');
        const reportBtnSidebar = document.getElementById('reportBtnSidebar');
        const reportModal = document.getElementById('reportModal');
        const closeReportModal = document.getElementById('closeReportModal');
        const cancelReport = document.getElementById('cancelReport');
        const reportForm = document.getElementById('reportForm');

        function handleReportClick() {
            console.log('🚩 Report button clicked');

            if (!window.FirebaseAPI) {
                console.error('❌ FirebaseAPI not found');
                return;
            }

            const user = window.FirebaseAPI.getCurrentUser();
            if (!user) {
                console.log('ℹ️ User not logged in, showing notification');
                if (window.UIComponents) {
                    window.UIComponents.showInfoToast('Please sign in to report this listing.', 'Authentication Required');
                } else {
                    alert('Please sign in to report this listing.');
                }
                return;
            }

            if (reportModal) {
                console.log('✅ Opening report modal');
                reportModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else {
                console.error('❌ Report modal element not found');
            }
        }

        if (reportBtn) {
            reportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleReportClick();
            });
        }

        if (reportBtnSidebar) {
            reportBtnSidebar.addEventListener('click', (e) => {
                e.preventDefault();
                handleReportClick();
            });
        }

        if (closeReportModal && reportModal) {
            closeReportModal.addEventListener('click', () => {
                reportModal.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        if (cancelReport && reportModal) {
            cancelReport.addEventListener('click', () => {
                reportModal.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        // Handle Report Submission
        if (reportForm) {
            reportForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const reportType = document.getElementById('reportType').value;
                const reportDetails = document.getElementById('reportDetails').value;
                const user = window.FirebaseAPI.getCurrentUser();

                if (!user || !listing) return;

                const submitBtn = document.getElementById('submitReportBtn');
                if (window.UIComponents) window.UIComponents.setButtonLoading(submitBtn);

                try {
                    // 1. Create report document
                    const reportData = {
                        listingId: listing.id,
                        listingTitle: listing.title,
                        reporterId: user.uid,
                        reporterName: user.displayName || user.email,
                        type: reportType,
                        reason: reportDetails, // Renamed from details for compatibility
                        status: 'pending',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        priority: reportType === 'scam' || reportType === 'prohibited' ? 'high' : 'medium'
                    };

                    await firebase.firestore().collection('reports').add(reportData);

                    // 2. Update listing metadata
                    await firebase.firestore().collection('listings').doc(listing.id).update({
                        isFlagged: true, // Matching admin-listings.js field
                        flagged: true, // Compatibility
                        reportCount: firebase.firestore.FieldValue.increment(1),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    // 3. Log activity for admins
                    if (window.logAdminAction) {
                        await window.logAdminAction('user_report', {
                            targetId: listing.id,
                            targetName: listing.title,
                            reason: `Listing reported for ${reportType} by ${user.email}`,
                            details: reportDetails
                        });
                    } else {
                        await firebase.firestore().collection('adminLogs').add({
                            action: 'user_report',
                            adminId: 'system',
                            adminName: 'User Report',
                            details: `Listing "${listing.title}" reported for ${reportType} by ${user.email}`,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }

                    if (window.UIComponents) {
                        window.UIComponents.showSuccessToast('Thank you. Our moderators will review this listing shortly.', 'Report Submitted');
                    } else {
                        alert('Report submitted successfully.');
                    }

                    reportModal.style.display = 'none';
                    document.body.style.overflow = '';
                    reportForm.reset();

                } catch (error) {
                    console.error('Error submitting report:', error);
                    if (window.UIComponents) {
                        window.UIComponents.showErrorToast('Failed to submit report. Please try again.');
                    }
                } finally {
                    if (window.UIComponents) window.UIComponents.removeButtonLoading(submitBtn);
                }
            });
        }

        // Touch Swipe Navigation
        let touchstartX = 0;
        let touchendX = 0;

        function handleSwipe(element, onSwipeLeft, onSwipeRight) {
            element.addEventListener('touchstart', e => {
                touchstartX = e.changedTouches[0].screenX;
            }, { passive: true });

            element.addEventListener('touchend', e => {
                touchendX = e.changedTouches[0].screenX;
                checkDirection();
            }, { passive: true });

            function checkDirection() {
                const threshold = 50;
                if (touchendX < touchstartX - threshold) {
                    // Swiped Left -> Next Image
                    onSwipeLeft();
                }
                if (touchendX > touchstartX + threshold) {
                    // Swiped Right -> Prev Image
                    onSwipeRight();
                }
            }
        }

        // Apply swipe to main image and lightbox
        const mainImage = document.getElementById('mainImage');
        const lightboxModal = document.getElementById('lightboxModal');

        if (mainImage) {
            handleSwipe(mainImage, nextImage, prevImage);
        }

        if (lightboxModal) {
            handleSwipe(lightboxModal, () => {
                nextImage();
                updateLightboxImage();
            }, () => {
                prevImage();
                updateLightboxImage();
            });
        }
    }

    // Lightbox functions
    function openLightbox() {
        const lightboxModal = document.getElementById('lightboxModal');
        const lightboxImage = document.getElementById('lightboxImage');
        lightboxImage.src = listing.images[currentImageIndex];
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lightboxModal = document.getElementById('lightboxModal');
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateLightboxImage() {
        const lightboxImage = document.getElementById('lightboxImage');
        lightboxImage.src = listing.images[currentImageIndex];
    }

    // Utility functions
    function isListingNew(createdAt) {
        const now = new Date();
        const listingDate = new Date(createdAt);
        const diffHours = (now - listingDate) / (1000 * 60 * 60);
        return diffHours < 24;
    }

    function getTimeAgo(date) {
        const now = new Date();
        const createdDate = new Date(date);
        const diffMs = now - createdDate;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 30) return `${diffDays}d ago`;
        return createdDate.toLocaleDateString();
    }
});
