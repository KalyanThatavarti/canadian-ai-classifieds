// Post Ad Page Script
document.addEventListener('DOMContentLoaded', async function () {
    // Auth Check
    const authCheckInterval = setInterval(async () => {
        if (window.FirebaseAPI && window.FirebaseAPI.auth) {
            clearInterval(authCheckInterval);

            // Wait a moment for auth state to resolve
            setTimeout(() => {
                const user = window.FirebaseAPI.auth.currentUser;
                if (!user) {
                    // Not logged in
                    if (window.UIComponents) {
                        window.UIComponents.showInfoToast('Please sign in to post an ad', 'Redrecting...');
                    }
                    setTimeout(() => window.location.href = 'auth/login.html', 1500);
                }
            }, 500);
        }
    }, 100);

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
                }).catch(err => {
                    console.error('Compression error:', err);
                    alert('Error processing image');
                });
            }
        });
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


    // === AI Description Generator ===
    aiGenerateBtn.addEventListener('click', async () => {
        const title = adTitle.value.trim();
        const category = adCategory.value;
        const condition = document.querySelector('input[name="condition"]:checked').value;

        if (!title) {
            if (window.UIComponents) {
                window.UIComponents.showInfoToast('Please enter a title first', 'AI Needs Input');
            } else {
                alert('Please enter a title first');
            }
            adTitle.focus();
            return;
        }

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
        await new Promise(r => setTimeout(r, 1500));

        // Mock AI Logic based on inputs
        const templates = [
            `Selling my ${condition.toLowerCase()} ${title}. It's in great shape and ready for a new owner. Send me a message if interested!`,
            `Check out this ${title}! Condition is ${condition}. Perfectly maintained and works flawlessly. Asking for a reasonable price.`,
            `Ideally located in the city, this ${title} is a must-see. ${condition} condition. Serious buyers only please.`
        ];

        // Pick a random template appropriate for the mock
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
