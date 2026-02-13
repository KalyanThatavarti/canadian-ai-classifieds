// Post Ad Page Script
document.addEventListener('DOMContentLoaded', async function () {
    // State
    const uploadedImages = []; // Stores File objects or base64 strings
    let editListingId = null;

    // Reliable Auth Check using onAuthStateChanged
    const initAuth = () => {
        if (window.FirebaseAPI && window.FirebaseAPI.auth) {
            window.FirebaseAPI.auth.onAuthStateChanged(async (user) => {
                if (!user) {
                    // Not logged in
                    if (window.UIComponents) {
                        window.UIComponents.showInfoToast('Please sign in to post an ad', 'Redirecting...');
                    }
                    setTimeout(() => window.location.href = 'auth/login.html', 1500);
                } else {
                    // Check for Edit Mode
                    const urlParams = new URLSearchParams(window.location.search);
                    editListingId = urlParams.get('edit');
                    if (editListingId) {
                        await loadListingData(editListingId);
                    }
                }
            });
        } else {
            // Wait for FirebaseAPI to be available
            setTimeout(initAuth, 100);
        }
    };
    initAuth();

    async function loadListingData(listingId) {
        try {
            console.log('Loading listing for edit:', listingId);
            const doc = await window.FirebaseAPI.db.collection('listings').doc(listingId).get();
            if (!doc.exists) {
                window.UIComponents.showErrorToast('Listing not found', 'Error');
                return;
            }
            const data = doc.data();

            // Check ownership
            const user = window.FirebaseAPI.auth.currentUser;
            if (data.userId !== user.uid) {
                window.UIComponents.showErrorToast('You do not have permission to edit this listing', 'Unauthorized');
                setTimeout(() => window.location.href = 'my-listings.html', 2000);
                return;
            }

            // Update UI
            document.getElementById('pageTitle').textContent = 'Edit Your Listing';
            document.getElementById('pageSubtitle').textContent = 'Update your listing details below';
            document.getElementById('submitBtn').innerHTML = 'Save Changes';

            // Fill Form
            document.getElementById('adTitle').value = data.title || '';
            document.getElementById('adCategory').value = data.category || '';
            document.getElementById('adPrice').value = data.price || '';
            document.getElementById('adDescription').value = data.description || '';
            document.getElementById('adLocation').value = data.location?.city || '';

            // Condition
            if (data.condition) {
                const radio = document.querySelector(`input[name="condition"][value="${data.condition}"]`);
                if (radio) radio.checked = true;
            }

            // Load Images
            if (data.images && Array.isArray(data.images)) {
                data.images.forEach(img => uploadedImages.push(img));
                renderPreviews();
            }

        } catch (error) {
            console.error('Error loading listing:', error);
            window.UIComponents.showErrorToast('Failed to load listing data', 'Error');
        }
    }

    // Auto-Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                // In a real app, use reverse geocoding. Here we'll mock it for Canadian regions.
                // We'll default to a high-density area if we get a hit.
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Very basic box check for major Canadian Cities
                let detectedLocation = "Toronto, ON"; // Default
                if (lat > 43.1 && lat < 43.4 && lng > -80.0 && lng < -79.7) detectedLocation = "Hamilton, ON";
                else if (lat > 43.5 && lat < 44.0 && lng > -79.6 && lng < -79.2) detectedLocation = "Toronto, ON";
                else if (lat > 49 && lat < 50 && lng > -124 && lng < -122) detectedLocation = "Vancouver, BC";
                else if (lat > 45 && lat < 46 && lng > -74 && lng < -73) detectedLocation = "Montreal, QC";
                else if (lat > 50 && lat < 52 && lng > -115 && lng < -113) detectedLocation = "Calgary, AB";

                const adLocation = document.getElementById('adLocation');
                if (adLocation && !adLocation.value) {
                    adLocation.value = detectedLocation;
                    if (window.UIComponents) {
                        window.UIComponents.showInfoToast(`Detected location: ${detectedLocation}`, 'Smart Fill');
                    }
                }
            } catch (err) {
                console.warn('Geolocation failed:', err);
            }
        });
    }


    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const imagePreviewGrid = document.getElementById('imagePreviewGrid');
    const postAdForm = document.getElementById('postAdForm');
    const aiGenerateBtn = document.getElementById('aiGenerateBtn');
    const adTitle = document.getElementById('adTitle');
    const adCategory = document.getElementById('adCategory');
    const adDescription = document.getElementById('adDescription');
    const submitBtn = document.getElementById('submitBtn');
    const previewBtn = document.getElementById('previewBtn');
    const previewModal = document.getElementById('previewModal');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const publishFromPreviewBtn = document.getElementById('publishFromPreviewBtn');
    const previewContent = document.getElementById('previewContent');

    // === Image Upload Handling ===

    // Trigger file input on click
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag & Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('dragover');
    }

    function unhighlight() {
        dropZone.classList.remove('dragover');
    }

    // Handle File Drop
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle File Input Selection
    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (uploadedImages.length + files.length > 5) {
            alert('You can only upload up to 5 photos.');
            return;
        }

        [...files].forEach(file => {
            if (file.type.startsWith('image/')) {
                // Read and compress
                compressImage(file, 800, 0.7).then(base64 => {
                    uploadedImages.push(base64);
                    addImageToPreview(base64, uploadedImages.length - 1);

                    // Trigger Smart Scan for the first image
                    if (uploadedImages.length === 1) {
                        triggerSmartScan(file.name);
                    }
                }).catch(err => {
                    console.error('Compression error:', err);
                    alert('Error processing image');
                });
            }
        });
    }

    // Smart Scan Mock Logic (Simulates AI Vision)
    async function triggerSmartScan(filename) {
        const user = window.FirebaseAPI.auth.currentUser;
        if (!user) return;

        // Firestore Usage Limit Check
        const scanCheck = await window.UsageLimits.canPerformScan(user.uid);
        if (!scanCheck.allowed) {
            if (window.UIComponents) {
                // Modified message to be less intrusive for automatic scans but stay long
                window.UIComponents.showInfoToast(`AI Smart Scan skipped (Daily limit reached: ${scanCheck.limit}). You can still fill details manually.`, 'Scan Limit Reached', 60000);
            }
            return;
        }

        const name = filename.toLowerCase();
        let suggestedCategory = "";
        let suggestedTitle = "";

        // Show "Scanning" toast for feedback
        if (window.UIComponents) {
            window.UIComponents.showInfoToast('AI is scanning your image...', 'Smart Scan');
        }

        // Increment scan count in Firestore
        await window.UsageLimits.incrementUsage(user.uid, 'scan');

        // Keywords (Expanded simulation)
        const scanCategories = {
            electronics: ['iphone', 'samsung', 'phone', 'laptop', 'tablet', 'ipad', 'watch', 'camera', 'tv', 'sony', 'apple', '86d', 'screenshot', 'electronic', 'macbook', 'mouse', 'keyboard', 'monitor', 'headphones', 'earbuds', 'gaming', 'console', 'pc', 'speaker'],
            vehicles: ['car', 'honda', 'toyota', 'ford', 'suv', 'truck', 'bike', 'motorcycle', 'vehicle', 'automotive', 'tire', 'rim', 'bmw', 'mercedes', 'tesla', 'audi', 'jeep'],
            furniture: ['chair', 'table', 'sofa', 'desk', 'bed', 'shelf', 'couch', 'furniture', 'decor', 'dining', 'lamp', 'rug', 'cabinet', 'dresser'],
            fashion: ['shirt', 'shoes', 'dress', 'jeans', 'watch', 'bag', 'clothing', 'fashion', 'accessory', 'jacket', 'boots', 'sneakers', 'hoodie', 'hat'],
            realestate: ['house', 'condo', 'apartment', 'home', 'listing', 'property', 'land', 'rent', 'lease'],
            hobbies: ['guitar', 'piano', 'instrument', 'game', 'playstation', 'xbox', 'nintendo', 'book', 'sport', 'gym', 'toy', 'board game', 'bicycle'],
            services: ['repair', 'cleaning', 'plumbing', 'moving', 'consulting', 'tutor', 'service', 'help', 'handyman'],
            jobs: ['hiring', 'work', 'job', 'recruitment', 'career', 'resume', 'apply']
        };

        // Check for matches
        for (const [cat, keywords] of Object.entries(scanCategories)) {
            if (keywords.some(kw => name.includes(kw))) {
                suggestedCategory = cat;
                break;
            }
        }

        // Expanded Fallback Mechanism
        if (!suggestedCategory) {
            if (name.includes('img') || name.includes('86d') || name.includes('photo') || name.includes('image')) {
                suggestedCategory = "electronics"; // Generic mobile upload default
            } else {
                // If it's a completely unknown name, default to 'other' so the field is populated
                suggestedCategory = "other";
            }
        }

        if (suggestedCategory) {
            // Pick a title based on category if one isn't matched
            const titles = {
                electronics: "Electronics Item",
                vehicles: "Vehicle for Sale",
                furniture: "Quality Furniture",
                fashion: "Fashion Item",
                realestate: "Property Listing",
                hobbies: "Hobby Item",
                services: "Professional Service",
                jobs: "Job Opportunity",
                other: "New Listing"
            };
            suggestedTitle = titles[suggestedCategory] || "New Listing";

            setTimeout(() => {
                adCategory.value = suggestedCategory;
                // Explicitly trigger change event so any listeners (or UI browsers) catch it
                adCategory.dispatchEvent(new Event('change', { bubbles: true }));

                if (!adTitle.value) adTitle.value = suggestedTitle;

                if (window.UIComponents) {
                    window.UIComponents.showSuccessToast(`Smart Scan identified: ${suggestedCategory}`, 'AI Magic');
                }
            }, 1000);
        } else {
            // Even if it fails, show that it tried
            setTimeout(() => {
                if (window.UIComponents) {
                    window.UIComponents.showInfoToast('Scan complete. Please select category manually.', 'Smart Scan');
                }
            }, 1200);
        }
    }

    // Client-side Image Compression
    function compressImage(file, maxWidth, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = error => reject(error);
            };
            reader.onerror = error => reject(error);
        });
    }

    function addImageToPreview(src, index) {
        // Just re-render everything to keep it clean, as we need badges
        renderPreviews();
    }

    // Expose removeImage globally
    window.removeImage = function (index) {
        uploadedImages.splice(index, 1);
        renderPreviews();
    };

    // Reordering Logic
    let draggedItem = null;
    let draggedIndex = null;

    function renderPreviews() {
        imagePreviewGrid.innerHTML = '';

        uploadedImages.forEach((img, idx) => {
            const div = document.createElement('div');
            div.className = 'preview-item fade-in-up';
            div.draggable = true;
            div.dataset.index = idx;

            const badgeText = idx === 0 ? 'Cover Photo' : `Photo ${idx + 1}`;

            div.innerHTML = `
                <span class="preview-badge">${badgeText}</span>
                <img src="${img}" alt="Preview ${idx + 1}">
                <button type="button" class="preview-remove" onclick="removeImage(${idx})">×</button>
            `;

            // Drag Events
            div.addEventListener('dragstart', function (e) {
                draggedItem = this;
                draggedIndex = idx;
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', this.innerHTML);
            });

            div.addEventListener('dragend', function () {
                this.classList.remove('dragging');
                draggedItem = null;
                draggedIndex = null;
            });

            div.addEventListener('dragover', function (e) {
                e.preventDefault();
                return false;
            });

            div.addEventListener('drop', function (e) {
                e.stopPropagation();
                if (draggedItem !== this) {
                    const dropIndex = idx;

                    // Reorder array
                    const item = uploadedImages[draggedIndex];
                    uploadedImages.splice(draggedIndex, 1);
                    uploadedImages.splice(dropIndex, 0, item);

                    // Re-render
                    renderPreviews();
                }
                return false;
            });

            imagePreviewGrid.appendChild(div);
            // Trigger animation immediately
            setTimeout(() => div.classList.add('visible'), 10);
        });
    }


    // Tone Selection Logic
    const toneBtns = document.querySelectorAll('.tone-btn');
    let selectedTone = 'professional';

    toneBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toneBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTone = btn.dataset.tone;
        });
    });

    // === AI Description Generator ===
    aiGenerateBtn.addEventListener('click', async () => {
        const user = window.FirebaseAPI.auth.currentUser;
        if (!user) return;

        // Firestore Usage Limit Check
        const aiCheck = await window.UsageLimits.canPerformScan(user.uid);
        if (!aiCheck.allowed) {
            if (window.UIComponents) {
                window.UIComponents.showInfoToast(`AI feature limit reached (${aiCheck.limit}). You can still write your description manually.`, 'AI Limit Reached', 60000);
            }
            return;
        }

        const title = adTitle.value.trim();
        const category = adCategory.value;
        const condition = document.querySelector('input[name="condition"]:checked').value;
        const location = document.getElementById('adLocation').value || "your area";

        if (!title) {
            if (window.UIComponents) {
                window.UIComponents.showInfoToast('Please enter a title first', 'AI Needs Input');
            } else {
                alert('Please enter a title first');
            }
            adTitle.focus();
            return;
        }

        // Increment usage count in Firestore
        await window.UsageLimits.incrementUsage(user.uid, 'scan');

        // Simulating AI Loading
        aiGenerateBtn.classList.add('loading');
        aiGenerateBtn.innerHTML = `
            <svg class="sparkles-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
            Generating...
        `;
        adDescription.setAttribute('placeholder', 'AI is thinking...');

        // Artificial Delay for realism
        await new Promise(r => setTimeout(r, 1200));

        // Enhanced AI Logic based on Tone
        const toneTemplates = {
            professional: [
                `Up for sale is a ${title} in ${condition.toLowerCase()} condition. This item has been meticulously maintained and functions perfectly. Ideal for those seeking high-quality performance. Available for pickup in ${location}.`,
                `Professional-grade ${title} available. Rated ${condition}. Includes all original components and features. Excellent value for the price. Location: ${location}.`
            ],
            friendly: [
                `Hi there! I'm selling my ${title}. It's served me well and is currently in ${condition.toLowerCase()} condition. Really hoping it finds a good new home! Let me know if you have any questions. Local pickup in ${location} preferred.`,
                `Selling this great ${title}! It's ${condition.toLowerCase()} and ready for someone else to enjoy. A really nice addition to any home. Message me if you're interested!`
            ],
            direct: [
                `${title} for sale. Condition: ${condition}. Price is firm. Pickup in ${location}.`,
                `${condition} ${title}. Works as expected. Cash only. DM if interested.`
            ]
        };

        const templates = toneTemplates[selectedTone] || toneTemplates.professional;
        const generatedText = templates[Math.floor(Math.random() * templates.length)];

        adDescription.value = generatedText;

        // Reset Button
        aiGenerateBtn.classList.remove('loading');
        aiGenerateBtn.innerHTML = `
            <svg class="sparkles-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
            AI Rewrite
        `;

        if (window.UIComponents) {
            window.UIComponents.showSuccessToast('Description generated!', 'AI Magic');
        }
    });

    // === Ad Preview Logic ===

    previewBtn.addEventListener('click', showAdPreview);
    closePreviewBtn.addEventListener('click', () => previewModal.classList.remove('active'));
    publishFromPreviewBtn.addEventListener('click', () => {
        previewModal.classList.remove('active');
        postAdForm.dispatchEvent(new Event('submit'));
    });

    async function showAdPreview() {
        const title = adTitle.value.trim();
        const price = document.getElementById('adPrice').value;
        const description = adDescription.value.trim();
        const category = adCategory.value;
        const condition = document.querySelector('input[name="condition"]:checked').value;
        const location = document.getElementById('adLocation').value.trim();

        if (!title || !price || !category || uploadedImages.length === 0) {
            window.UIComponents.showInfoToast('Please add a title, price, category, and at least one photo to preview', 'Incomplete Form');
            return;
        }

        const user = window.FirebaseAPI.auth.currentUser;
        const formattedPrice = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(price);
        const categoryLabel = adCategory.options[adCategory.selectedIndex].text;

        // Populate Preview Content
        previewContent.innerHTML = `
            <div class="detail-content">
                <!-- Main Column -->
                <div class="main-column">
                    <!-- Image Gallery -->
                    <div class="image-gallery">
                        <div class="main-image-container">
                            <img src="${uploadedImages[0]}" alt="Preview" class="main-image" id="previewMainImage">
                            <div class="image-counter" id="previewImageCounter">1 / ${uploadedImages.length}</div>
                        </div>
                        ${uploadedImages.length > 1 ? `
                        <div style="display: flex; gap: 10px; margin-top: 10px; overflow-x: auto; padding-bottom: 5px;">
                            ${uploadedImages.map((img, i) => `
                                <img src="${img}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid ${i === 0 ? '#4a90e2' : 'transparent'}" 
                                     onclick="document.getElementById('previewMainImage').src='${img}'; document.getElementById('previewImageCounter').innerText='${i + 1} / ${uploadedImages.length}'; this.parentElement.querySelectorAll('img').forEach(el=>el.style.borderColor='transparent'); this.style.borderColor='#4a90e2'">
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>

                    <!-- Listing Information -->
                    <div class="listing-information">
                        <div class="listing-category">${categoryLabel}</div>
                        <h1 class="listing-title">${title}</h1>
                        <div class="price">${formattedPrice}</div>

                        <div class="details-grid">
                            <div class="detail-item">
                                <span class="detail-label">Condition</span>
                                <span class="detail-value">${condition}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Location</span>
                                <span class="detail-value">${location || 'Canada'}</span>
                            </div>
                        </div>

                        <div class="description-section">
                            <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">Description</h2>
                            <div class="description-text">${description || 'No description provided.'}</div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <aside class="sidebar-column">
                    <div class="seller-card">
                        <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">Seller Information</h3>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <img src="${user ? (user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || 'User')) : 'https://ui-avatars.com/api/?name=User'}" style="width: 50px; height: 50px; border-radius: 50%;">
                            <div>
                                <div style="font-weight: 600;">${user ? (user.displayName || 'You') : 'You'}</div>
                                <div style="font-size: 0.8rem; color: #666;">Member since today</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        `;

        // Show Modal
        previewModal.classList.add('active');
    }

    // === Form Submission ===
    postAdForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic Validation
        if (uploadedImages.length === 0) {
            if (window.UIComponents) {
                window.UIComponents.showErrorToast('Please add at least one photo', 'Missing Photos');
            } else {
                alert('Please add at least one photo');
            }
            return;
        }

        const user = window.FirebaseAPI.auth.currentUser;
        if (!user) {
            alert('You must be logged in.');
            return;
        }

        // Firestore Daily Ad Limit Check - Skip for Edits
        if (!editListingId) {
            const adCheck = await window.UsageLimits.canPostAd(user.uid);
            if (!adCheck.allowed) {
                if (window.UIComponents) {
                    window.UIComponents.showErrorToast(`Daily ad posting limit reached (${adCheck.limit}). Please try again tomorrow.`, 'Ad Posting Limit', 60000);
                }
                return;
            }
        }

        // Prepare Data
        const listingData = {
            userId: user.uid,
            seller: {
                name: user.displayName || 'Anonymous User',
                avatar: user.photoURL || 'https://ui-avatars.com/api/?name=User',
                rating: 5.0, // Default for new users
                verified: true
            },
            title: adTitle.value,
            price: parseFloat(document.getElementById('adPrice').value),
            description: adDescription.value,
            category: adCategory.value,
            condition: document.querySelector('input[name="condition"]:checked').value,
            location: {
                city: document.getElementById('adLocation').value,
                province: 'ON' // Hardcoded for MVP or extract from input
            },
            images: uploadedImages,
            updatedAt: new Date().toISOString()
        };

        if (!editListingId) {
            listingData.createdAt = new Date().toISOString();
            listingData.views = 0;
            listingData.featured = false;
        }

        // UI Loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Posting...';

        try {
            // Save to Firestore
            if (editListingId) {
                await window.FirebaseAPI.db.collection('listings').doc(editListingId).update(listingData);
                if (window.UIComponents) {
                    window.UIComponents.showSuccessToast('Listing updated successfully!', 'Updated', 4000);
                }
            } else {
                await window.FirebaseAPI.db.collection('listings').add(listingData);
                // Increment Ad count in Firestore
                await window.UsageLimits.incrementUsage(user.uid, 'ad');
                if (window.UIComponents) {
                    window.UIComponents.showSuccessToast('Your ad is now live!', 'Success', 4000);
                }
            }

            // Redirect after allowing user to read the toast
            setTimeout(() => {
                window.location.href = editListingId ? 'my-listings.html' : 'browse-listings.html';
            }, 4500);

        } catch (error) {
            console.error('Error posting ad:', error);
            let errorMsg = 'Failed to post ad. Try again.';
            if (error.code === 'permission-denied') {
                errorMsg = 'Permission denied. Ensure you are logged in.';
            } else if (error.message && error.message.includes('exceeds the maximum allowed size')) {
                errorMsg = 'Images are still too large. Try fewer photos.';
            } else if (error.message) {
                errorMsg = `Error: ${error.message}`;
            }

            if (window.UIComponents) {
                window.UIComponents.showErrorToast(errorMsg, 'Error');
            } else {
                alert(errorMsg);
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Post My Ad';
        }
    });

    // === Init Animations (Make elements visible) ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
});
