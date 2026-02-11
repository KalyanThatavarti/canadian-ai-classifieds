// Post Ad Page Script
document.addEventListener('DOMContentLoaded', async function () {
    // Reliable Auth Check using onAuthStateChanged
    const initAuth = () => {
        if (window.FirebaseAPI && window.FirebaseAPI.auth) {
            window.FirebaseAPI.auth.onAuthStateChanged((user) => {
                if (!user) {
                    // Not logged in
                    if (window.UIComponents) {
                        window.UIComponents.showInfoToast('Please sign in to post an ad', 'Redirecting...');
                    }
                    setTimeout(() => window.location.href = 'auth/login.html', 1500);
                }
            });
        } else {
            // Wait for FirebaseAPI to be available
            setTimeout(initAuth, 100);
        }
    };
    initAuth();

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
                if (lat > 49 && lat < 50 && lng > -124 && lng < -122) detectedLocation = "Vancouver, BC";
                if (lat > 45 && lat < 46 && lng > -74 && lng < -73) detectedLocation = "Montreal, QC";
                if (lat > 50 && lat < 52 && lng > -115 && lng < -113) detectedLocation = "Calgary, AB";

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

    // State
    const uploadedImages = []; // Stores File objects or base64 strings

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
    function triggerSmartScan(filename) {
        // Usage Limit Check (3 Scans per day)
        const today = new Date().toDateString();
        const lastScanDate = localStorage.getItem('aiScanDate');
        let scanCount = parseInt(localStorage.getItem('aiScanCount') || '0');

        // Reset if it's a new day
        if (lastScanDate !== today) {
            scanCount = 0;
            localStorage.setItem('aiScanDate', today);
        }

        if (scanCount >= 3) {
            if (window.UIComponents) {
                window.UIComponents.showErrorToast('You have reached the limit of 3 AI scans for today.', 'Daily Limit Reached');
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

        // Increment scan count
        localStorage.setItem('aiScanCount', (scanCount + 1).toString());

        // Keywords (Expanded)
        const categories = {
            electronics: ['iphone', 'samsung', 'phone', 'laptop', 'tablet', 'ipad', 'watch', 'camera', 'tv', 'sony', 'apple', '86d'], // 86d is common for iOS uploads
            vehicles: ['car', 'honda', 'toyota', 'ford', 'suv', 'truck', 'bike', 'motorcycle', 'img'],
            furniture: ['chair', 'table', 'sofa', 'desk', 'bed', 'shelf', 'couch'],
            fashion: ['shirt', 'shoes', 'dress', 'jeans', 'watch', 'bag'],
            realestate: ['house', 'condo', 'apartment', 'home', 'listing']
        };

        // Check for matches
        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(kw => name.includes(kw))) {
                suggestedCategory = cat;
                break;
            }
        }

        // Fallback for demo: If it's a generic mobile upload name like "IMG_" or "86D_", guess Electronics
        if (!suggestedCategory && (name.includes('img') || name.includes('86d') || name.includes('photo'))) {
            suggestedCategory = "electronics"; // High volume category for mobile users
        }

        if (suggestedCategory) {
            // Pick a title based on category if one isn't matched
            const titles = {
                electronics: "Electronics Item",
                vehicles: "Vehicle for Sale",
                furniture: "Quality Furniture",
                fashion: "Fashion Item",
                realestate: "Property Listing"
            };
            suggestedTitle = titles[suggestedCategory] || "New Listing";

            setTimeout(() => {
                adCategory.value = suggestedCategory;
                if (!adTitle.value) adTitle.value = suggestedTitle;

                if (window.UIComponents) {
                    window.UIComponents.showSuccessToast(`Smart Scan identified: ${suggestedCategory}`, 'AI Magic');
                }
            }, 1500); // Slightly longer for "AI Thinking" feel
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
        // Usage Limit Check (3 Generations per day)
        const today = new Date().toDateString();
        const lastGenDate = localStorage.getItem('aiGenDate');
        let genCount = parseInt(localStorage.getItem('aiGenCount') || '0');

        // Reset if it's a new day
        if (lastGenDate !== today) {
            genCount = 0;
            localStorage.setItem('aiGenDate', today);
        }

        if (genCount >= 3) {
            if (window.UIComponents) {
                window.UIComponents.showErrorToast('You have reached the limit of 3 AI descriptions for today.', 'Daily Limit Reached');
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

        // Increment generation count
        localStorage.setItem('aiGenCount', (genCount + 1).toString());

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
            images: uploadedImages, // In real app, upload to Storage and get URLs. Here storing Base64 (CAUTION: Size limits)
            createdAt: new Date().toISOString(),
            views: 0,
            featured: false
        };

        // UI Loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Posting...';

        try {
            // Save to Firestore
            await window.FirebaseAPI.db.collection('listings').add(listingData);

            if (window.UIComponents) {
                window.UIComponents.showSuccessToast('Your ad is now live!', 'Success');
            }

            // Redirect
            setTimeout(() => {
                window.location.href = '../index.html'; // Or my-listings.html
            }, 1000);

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
