// ================================================================
// Profile Page JavaScript
// Handles profile viewing, editing, listings, and favorites
// ================================================================

document.addEventListener('DOMContentLoaded', async function () {
    // Get user ID from URL or use current user
    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get('userId');

    let currentUser = null;
    let profileUser = null;
    let isOwnProfile = false;

    // Wait for Firebase to be ready
    await waitForFirebase();

    // Wait for auth state to be initialized properly
    window.FirebaseAPI.auth.onAuthStateChanged(async (user) => {
        if (!user) {
            // Not logged in - redirect to home without showing alert
            window.location.href = '/index.html';
            return;
        }

        // Set current user
        currentUser = user;

        // Determine whose profile to show
        const targetUserId = profileUserId || currentUser.uid;
        isOwnProfile = (targetUserId === currentUser.uid);

        // Load profile data
        try {
            profileUser = await window.FirebaseAPI.getUserProfile(targetUserId);
            renderProfile(profileUser, isOwnProfile);
            await loadListings(targetUserId);

            if (isOwnProfile) {
                await loadFavorites(targetUserId);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            alert('Failed to load profile. Please try again.');
            window.location.href = '../index.html';
        }

        // Initialize event listeners
        setupEventListeners();
    });

    // ===== Render Functions =====

    function renderProfile(user, isOwn) {
        // Avatar
        document.getElementById('profileAvatar').src = user.photoURL || 'https://i.pravatar.cc/150';

        // Name
        document.getElementById('profileName').textContent = user.displayName || 'Anonymous User';

        // Location - show complete address if available
        let locationText = 'Location not specified';
        if (user.location) {
            const parts = [];
            if (user.location.street) parts.push(user.location.street);
            if (user.location.apartment) parts.push(user.location.apartment);
            if (user.location.city && user.location.province) {
                parts.push(`${user.location.city}, ${user.location.province}`);
            }
            if (user.location.postalCode) parts.push(user.location.postalCode);

            if (parts.length > 0) {
                locationText = parts.join(', ');
            }
        }
        document.getElementById('profileLocation').textContent = locationText;

        // Join date
        if (user.createdAt) {
            const joinDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
            const formatted = joinDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
            document.getElementById('profileJoinDate').textContent = `Member since ${formatted}`;
        }

        // Verification badges
        const badgesContainer = document.getElementById('verificationBadges');
        badgesContainer.innerHTML = '';

        if (user.emailVerified) {
            badgesContainer.innerHTML += `
                <span class="verification-badge">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Email
                </span>
            `;
        }

        if (user.phoneVerified) {
            badgesContainer.innerHTML += `
                <span class="verification-badge">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Phone
                </span>
            `;
        }

        if (user.idVerified) {
            badgesContainer.innerHTML += `
                <span class="verification-badge">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    ID
                </span>
            `;
        }

        // Bio
        document.getElementById('profileBio').textContent = user.bio || 'No bio provided.';

        // Show edit button only for own profile
        if (isOwn) {
            document.getElementById('editProfileBtn').style.display = 'flex';
            document.getElementById('uploadAvatarBtn').style.display = 'flex';
        }

        // Hide favorites tab if viewing someone else's profile
        if (!isOwn) {
            const favoritesTab = document.querySelector('[data-tab="favorites"]');
            if (favoritesTab) {
                favoritesTab.style.display = 'none';
            }
        }
    }

    async function loadStatistics(userId, allListings = []) {
        // Calculate real-time statistics from listings
        const activeListings = allListings.filter(l => l.status === 'active').length;
        const soldListings = allListings.filter(l => l.status === 'sold').length;
        const totalListings = allListings.length;

        console.log('loadStatistics - Total:', totalListings, 'Active:', activeListings, 'Sold:', soldListings);

        // Set statistics
        document.getElementById('statListings').textContent = totalListings;
        document.getElementById('statSales').textContent = soldListings;
        document.getElementById('statRating').textContent = profileUser.rating ? profileUser.rating.toFixed(1) : '-';
        document.getElementById('statTrust').textContent = profileUser.trustScore || 0;
    }

    async function loadListings(userId) {
        try {
            let allListings = [];

            // Check localStorage first (for current user only)
            if (userId === currentUser.uid) {
                try {
                    const storageKey = `myListings_${userId}`;
                    const stored = localStorage.getItem(storageKey);
                    if (stored) {
                        allListings = JSON.parse(stored);
                        console.log('Loading listings from localStorage');
                    }
                } catch (e) {
                    console.log('localStorage check failed:', e);
                }
            }

            // If no localStorage data, fetch from Firestore
            if (allListings.length === 0) {
                allListings = await window.FirebaseAPI.getUserListings(userId, 'all');

                // If no listings in Firestore, use sample data for testing
                if (allListings.length === 0 && typeof sampleListings !== 'undefined') {
                    console.log('No Firestore listings, using sample data');
                    allListings = sampleListings.slice(0, 3).map(listing => ({
                        ...listing,
                        userId: userId
                    }));
                }
            }

            // Separate by status
            const activeListings = allListings.filter(l => l.status === 'active');
            const soldListings = allListings.filter(l => l.status === 'sold');

            // Update counts
            document.getElementById('activeCount').textContent = `(${activeListings.length})`;
            document.getElementById('soldCount').textContent = `(${soldListings.length})`;

            // Update statistics with real listing data
            await loadStatistics(userId, allListings);

            // Render active listings
            renderListingsGrid(activeListings, 'activeListings', 'activeEmpty');

            // Render sold listings
            renderListingsGrid(soldListings, 'soldListings', 'soldEmpty');

        } catch (error) {
            console.error('Error loading listings:', error);
            // Show empty state on error
            document.getElementById('activeCount').textContent = '(0)';
            document.getElementById('soldCount').textContent = '(0)';
        }
    }

    async function loadFavorites(userId) {
        try {
            const favorites = await window.FirebaseAPI.getUserFavorites(userId);

            // Update count
            document.getElementById('favoritesCount').textContent = `(${favorites.length})`;

            // Render favorites
            renderListingsGrid(favorites, 'favoriteListings', 'favoritesEmpty');

        } catch (error) {
            // Silently handle permissions errors (expected if Firestore rules not set up)
            console.log('Could not load favorites (this is normal if Firestore rules are not configured)');

            // Show empty state
            const favCount = document.getElementById('favoritesCount');
            const favListings = document.getElementById('favoriteListings');
            const favEmpty = document.getElementById('favoritesEmpty');

            if (favCount) favCount.textContent = '(0)';
            if (favListings) favListings.style.display = 'none';
            if (favEmpty) favEmpty.style.display = 'block';
        }
    }

    function renderListingsGrid(listings, containerID, emptyID) {
        const container = document.getElementById(containerID);
        const emptyState = document.getElementById(emptyID);

        if (listings.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        container.innerHTML = listings.map(listing => createListingCard(listing)).join('');

        // Add click handlers
        container.querySelectorAll('.listing-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking favorite button
                if (!e.target.closest('.listing-card-favorite-btn')) {
                    const listingId = card.dataset.id;
                    window.location.href = `listing-detail.html?id=${listingId}`;
                }
            });
        });

        // Attach favorite button handlers using utility function
        if (window.Utils && window.Utils.attachFavoriteHandlers) {
            window.Utils.attachFavoriteHandlers(container);
        }
    }

    function createListingCard(listing) {
        const categoryData = categories[listing.category] || { icon: '📦', name: 'Other' };
        // Use listing's first image if available, otherwise use a consistent fallback based on listing ID
        const imageUrl = listing.images && listing.images[0] ? listing.images[0] : `https://picsum.photos/400/300?seed=${listing.id}`;

        return `
            <div class="listing-card" data-id="${listing.id}" style="background: white; border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(229, 221, 213, 0.3); position: relative;">
                <img src="${imageUrl}" alt="${listing.title}" style="width: 100%; height: 200px; object-fit: cover;">
                ${window.Utils ? window.Utils.createFavoriteButton(listing.id, false) : ''}
                <div style="padding: 1rem;">
                    <div style="font-size: 0.75rem; color: #4a90e2; text-transform: uppercase; font-weight: 600; margin-bottom: 0.5rem;">
                        ${categoryData.icon} ${categoryData.name}
                    </div>
                    <h3 style="font-size: 1rem; font-weight: 600; color: #2C2C2C; margin: 0 0 0.5rem 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${listing.title}
                    </h3>
                    <div style="font-size: 1.25rem; font-weight: 600; color: #2F5D3A; margin: 0.5rem 0;">
                        $${listing.price.toLocaleString()}
                    </div>
                    <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
                        ${listing.location.city}, ${listing.location.province}
                    </div>
                </div>
            </div>
        `;
    }

    // ===== Event Listeners =====

    function setupEventListeners() {
        // Edit profile button
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', showEditForm);
        }

        // Cancel edit button
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideEditForm);
        }

        // Profile edit form submission
        const editForm = document.getElementById('profileEditForm');
        if (editForm) {
            editForm.addEventListener('submit', handleProfileUpdate);
        }

        // Bio character count
        const bioInput = document.getElementById('editBio');
        if (bioInput) {
            bioInput.addEventListener('input', updateBioCount);
        }

        // Avatar upload
        const avatarInput = document.getElementById('avatarInput');
        const uploadBtn = document.getElementById('uploadAvatarBtn');

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => avatarInput.click());
        }

        if (avatarInput) {
            avatarInput.addEventListener('change', handleAvatarUpload);
        }

        // Tab navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                switchTab(tabName);
            });
        });

        // Postal code auto-formatting
        const postalCodeInput = document.getElementById('editPostalCode');
        if (postalCodeInput) {
            postalCodeInput.addEventListener('input', function (e) {
                let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (value.length > 3) {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6);
                }
                e.target.value = value;
            });
        }
    }

    function showEditForm() {
        // Pre-fill form with current data
        document.getElementById('editName').value = profileUser.displayName || '';
        document.getElementById('editBio').value = profileUser.bio || '';
        document.getElementById('editStreet').value = profileUser.location?.street || '';
        document.getElementById('editApartment').value = profileUser.location?.apartment || '';
        document.getElementById('editCity').value = profileUser.location?.city || '';
        document.getElementById('editProvince').value = profileUser.location?.province || '';
        document.getElementById('editPostalCode').value = profileUser.location?.postalCode || '';
        document.getElementById('editPhone').value = profileUser.phoneNumber || '';

        updateBioCount();

        // Hide view mode, show edit mode
        document.getElementById('aboutSection').style.display = 'none';
        document.getElementById('editForm').style.display = 'block';
        document.getElementById('editProfileBtn').style.display = 'none';
    }

    function hideEditForm() {
        // Show view mode, hide edit mode
        document.getElementById('aboutSection').style.display = 'block';
        document.getElementById('editForm').style.display = 'none';
        document.getElementById('editProfileBtn').style.display = 'flex';
    }

    async function handleProfileUpdate(e) {
        e.preventDefault();

        if (window.UIComponents) {
            window.UIComponents.showLoading('Updating profile...');
        }

        try {
            // Get postal code and format it
            const postalCode = document.getElementById('editPostalCode').value.trim().toUpperCase();

            // Validate Canadian postal code format
            const postalCodeRegex = /^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/;
            if (postalCode && !postalCodeRegex.test(postalCode)) {
                throw new Error('Please enter a valid Canadian postal code (e.g., A1A 1A1)');
            }

            // Format postal code with space if not already present
            const formattedPostalCode = postalCode.replace(/^([A-Z][0-9][A-Z])([0-9][A-Z][0-9])$/, '$1 $2');

            const updates = {
                displayName: document.getElementById('editName').value.trim(),
                bio: document.getElementById('editBio').value.trim(),
                phoneNumber: document.getElementById('editPhone').value.trim() || null,
                location: {
                    street: document.getElementById('editStreet').value.trim(),
                    apartment: document.getElementById('editApartment').value.trim(),
                    city: document.getElementById('editCity').value.trim(),
                    province: document.getElementById('editProvince').value,
                    postalCode: formattedPostalCode
                }
            };

            await window.FirebaseAPI.updateUserProfile(currentUser.uid, updates);

            // Refresh profile data
            profileUser = await window.FirebaseAPI.getUserProfile(currentUser.uid);
            renderProfile(profileUser, true);

            hideEditForm();

            if (window.UIComponents) {
                window.UIComponents.hideLoading();
                window.UIComponents.showSuccessToast('Profile updated successfully!', 'Success');
            } else {
                alert('Profile updated successfully!');
            }

        } catch (error) {
            console.error('Error updating profile:', error);

            if (window.UIComponents) {
                window.UIComponents.hideLoading();
                window.UIComponents.showErrorToast(error.message || 'Failed to update profile. Please try again.', 'Error');
            } else {
                alert(error.message || 'Failed to update profile. Please try again.');
            }
        }
    }

    async function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be smaller than 5MB');
            return;
        }

        if (window.UIComponents) {
            window.UIComponents.showLoading('Uploading photo...');
        }

        try {
            const photoURL = await window.FirebaseAPI.uploadProfilePhoto(file, currentUser.uid);

            // Update avatar display
            document.getElementById('profileAvatar').src = photoURL;

            if (window.UIComponents) {
                window.UIComponents.hideLoading();
                window.UIComponents.showSuccessToast('Profile photo updated!', 'Success');
            } else {
                alert('Profile photo updated!');
            }

        } catch (error) {
            console.error('Error uploading avatar:', error);

            if (window.UIComponents) {
                window.UIComponents.hideLoading();
                window.UIComponents.showErrorToast('Failed to upload photo. Please try again.', 'Error');
            } else {
                alert('Failed to upload photo. Please try again.');
            }
        }
    }

    function updateBioCount() {
        const bio = document.getElementById('editBio').value;
        document.getElementById('bioCount').textContent = bio.length;
    }

    function switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Reload favorites when switching to favorites tab
        if (tabName === 'favorites' && isOwnProfile && currentUser) {
            loadFavorites(currentUser.uid);
        }
    }

    // ===== Helper Functions =====

    function waitForFirebase(timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (window.FirebaseAPI && window.FirebaseAPI.auth) {
                resolve(true);
                return;
            }

            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (window.FirebaseAPI && window.FirebaseAPI.auth) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error('Firebase initialization timeout'));
                }
            }, 100);
        });
    }

    console.log('✅ Profile page loaded');
});
