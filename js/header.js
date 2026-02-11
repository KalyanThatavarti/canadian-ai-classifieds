// ================================
// Premium Header JavaScript
// ================================

document.addEventListener('DOMContentLoaded', function () {

    // Determine relative path depth
    const isInPages = window.location.pathname.includes('/pages/');
    const isInMessages = window.location.pathname.includes('/pages/messages/');
    const isInAdmin = window.location.pathname.includes('/pages/admin/');

    // Inject Header if placeholder exists
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        // Determine relative path depth
        const pathDepth = window.location.pathname.split('/').length - 2; // Rough estimate or just use relative checks

        // Fix home link path based on location
        const homeLink = isInMessages ? '../../index.html' :
            (isInAdmin ? '../../index.html' :
                (isInPages ? '../index.html' : 'index.html'));
        // Fix for logo link in subpages

        headerPlaceholder.innerHTML = `
    <header class="site-header">
        <!-- Top Bar -->
        <div class="top-bar">
            <div class="top-bar-container">
                <div class="top-bar-left">
                    <a href="#" class="location-selector">
                        <svg class="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>Toronto, ON</span>
                    </a>
                </div>
                <div class="top-bar-right">
                    <a href="#" class="help-link">
                        <svg class="help-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                            </path>
                        </svg>
                        <span>Help Center</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Main Header -->
        <div class="main-header">
            <div class="main-header-container">
                <!-- Logo -->
                <a href="${homeLink}" class="header-logo">
                    <div class="logo-text">
                        <span class="logo-icon">🍁</span>
                        <div>
                            Canadian Classifieds
                            <div class="logo-tagline">AI-Powered</div>
                        </div>
                    </div>
                </a>

                <!-- Navigation -->
                <nav class="main-nav">
                    <ul class="nav-menu">
                        <li class="nav-item">
                            <a href="${homeLink}" class="nav-link">
                                Home
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="${isInMessages ? '../browse-listings.html' : (isInAdmin ? '../browse-listings.html' : (isInPages ? 'browse-listings.html' : 'pages/browse-listings.html'))}" class="nav-link">
                                Browse Listings
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="${homeLink}#how-it-works" class="nav-link">How It Works</a>
                        </li>
                        <li class="nav-item">
                            <a href="${homeLink}#safety" class="nav-link">Safety & Trust</a>
                        </li>
                        <li class="nav-item">
                            <a href="${homeLink}#about" class="nav-link">About</a>
                        </li>
                    </ul>
                </nav>

                <!-- Header Actions -->
                <div class="header-actions">
                    <!-- Messages Icon (Visible when logged in) -->
                    <a href="${isInMessages ? '../messages/index.html' : (isInAdmin ? '../messages/index.html' : (isInPages ? 'messages/index.html' : 'pages/messages/index.html'))}" class="messages-icon-link" aria-label="Messages">
                        <div style="position: relative;">
                            <svg class="message-icon-header" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                            </svg>
                            <span id="header-msg-badge" class="notification-badge" style="display: none;">0</span>
                        </div>
                    </a>

                    <!-- Search Toggle -->
                    <button class="search-toggle" aria-label="Search">
                        <svg class="search-icon-header" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </button>

                    <a href="${isInMessages ? '../../pages/post-ad.html' : (isInAdmin ? '../post-ad.html' : (isInPages ? 'post-ad.html' : 'pages/post-ad.html'))}" class="post-ad-btn" style="text-decoration:none;">
                        <svg class="post-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4">
                            </path>
                        </svg>
                        <span>Post Your Ad</span>
                    </a>

                    <div class="user-menu-toggle">
                        <div class="user-avatar-container">
                            <svg class="user-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Mobile Menu Toggle -->
                    <button class="mobile-menu-toggle" aria-label="Toggle menu">
                        <svg class="hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </header>
        `;
    }

    // Sticky Header on Scroll
    const header = document.querySelector('.site-header');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('active');
            body.classList.toggle('menu-open');

            // Toggle hamburger icon to X
            const icon = this.querySelector('.hamburger-icon');
            if (mainNav.classList.contains('active')) {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                `;
            } else {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                `;
            }
        });
    }

    // Close mobile menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                body.classList.remove('menu-open');

                // Reset hamburger icon
                const icon = mobileMenuToggle.querySelector('.hamburger-icon');
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                `;
            }
        });
    });

    // Search Toggle (placeholder for future implementation)
    const searchToggle = document.querySelector('.search-toggle');
    if (searchToggle) {
        searchToggle.addEventListener('click', function () {
            // Future: Open search modal or expand search bar
            console.log('Search clicked - implement search functionality');
        });
    }

    // User Menu Toggle - Enhanced for authentication
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    if (userMenuToggle) {
        // Create user dropdown menu
        const userDropdown = document.createElement('div');
        userDropdown.id = 'userDropdown';
        userDropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            border: 1px solid #e5e7eb;
            min-width: 220px;
            margin-top: 1rem;
            display: none;
            z-index: 1000000;
        `;

        // Update menu based on auth state
        async function updateUserMenu(user) {
            const basePath = isInMessages ? '../../' : (isInAdmin ? '../../' : (isInPages ? '../' : ''));
            const pagesPath = basePath + 'pages/';

            if (user) {
                // Check if user is admin
                let isAdmin = false;
                try {
                    const userDoc = await firebase.firestore()
                        .collection('users')
                        .doc(user.uid)
                        .get();

                    if (userDoc.exists) {
                        isAdmin = userDoc.data().isAdmin === true;
                        console.log('🔐 Admin status:', isAdmin ? 'ADMIN' : 'Regular User');
                    }
                } catch (error) {
                    console.error('Error checking admin status:', error);
                }

                // User is logged in - show profile menu
                userDropdown.innerHTML = `
                    <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
                        <div style="font-weight: 600; color: #111827;">${user.displayName || 'User'}</div>
                        <div style="font-size: 0.85rem; color: #6b7280; margin-top: 0.25rem;">${user.email}</div>
                    </div>
                    <div style="padding: 0.5rem;">
                        <a href="${pagesPath}profile.html" style="display: block; padding: 0.75rem; color: #374151; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                            My Profile
                        </a>
                        <a href="${pagesPath}my-listings.html" style="display: block; padding: 0.75rem; color: #374151; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                            My Listings
                        </a>
                        <a href="${pagesPath}messages/index.html" style="display: block; padding: 0.75rem; color: #374151; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                            Messages
                        </a>
                        <a href="${pagesPath}notification-settings.html" style="display: block; padding: 0.75rem; color: #374151; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                            📧 Notification Settings
                        </a>
                        <a href="${pagesPath}admin/index.html" id="adminMenuLink" style="display: ${isAdmin ? 'block' : 'none'}; padding: 0.75rem; color: #667eea; text-decoration: none; border-radius: 8px; transition: background 0.2s; font-weight: 600; border-top: 1px solid #e5e7eb; margin-top: 0.5rem; padding-top: 0.75rem;" onmouseover="this.style.background='#eef2ff'" onmouseout="this.style.background='transparent'">
                            🛡️ Admin Dashboard
                        </a>
                        <a href="#" id="signOutBtn" style="display: block; padding: 0.75rem; color: #dc2626; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='transparent'">
                            Sign Out
                        </a>
                    </div>
                `;
            } else {
                // User is not logged in - show login/signup
                userDropdown.innerHTML = `
                    <div style="padding: 0.5rem;">
                        <a href="${pagesPath}auth/login.html" style="display: block; padding: 0.75rem; color: #374151; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                            Sign In
                        </a>
                        <a href="${pagesPath}auth/signup.html" style="display: block; padding: 0.75rem; color: #667eea; font-weight: 600; text-decoration: none; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#eef2ff'" onmouseout="this.style.background='transparent'">
                            Create Account
                        </a>
                    </div>
                `;
            }
        }

        // Add dropdown to DOM (Attach to parent for better layout stability)
        const headerActions = userMenuToggle.parentElement;
        if (headerActions) {
            headerActions.style.position = 'relative';
            headerActions.appendChild(userDropdown);
        } else {
            userMenuToggle.style.position = 'relative';
            userMenuToggle.appendChild(userDropdown);
        }

        // Toggle dropdown on click
        userMenuToggle.addEventListener('click', function (e) {
            console.log('👤 User menu clicked');
            e.stopPropagation();
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
            console.log('👤 User menu display set to:', userDropdown.style.display);

            // Close mobile menu if it's open
            if (userDropdown.style.display === 'block' && mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                body.classList.remove('menu-open');
                const icon = mobileMenuToggle?.querySelector('.hamburger-icon');
                if (icon) {
                    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>`;
                }
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            userDropdown.style.display = 'none';
        });

        // Handle sign out
        document.addEventListener('click', function (e) {
            if (e.target && e.target.id === 'signOutBtn') {
                e.preventDefault();
                if (window.FirebaseAPI) {
                    window.FirebaseAPI.signOut();
                }
            }
        });

        // Wait for Firebase to be ready before setting up auth listener
        function waitForFirebase(callback, maxAttempts = 50) {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.FirebaseAPI && window.FirebaseAPI.auth) {
                    clearInterval(checkInterval);
                    console.log('✅ Firebase ready, setting up auth listener');
                    callback();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('⚠️ Firebase not ready after', maxAttempts * 100, 'ms - showing guest menu');
                    updateUserMenu(null).catch(() => { });
                }
            }, 100);
        }

        // Initialize auth listener when Firebase is ready
        waitForFirebase(() => {
            let unsubscribeConversations = null;

            window.FirebaseAPI.auth.onAuthStateChanged((user) => {
                updateUserMenu(user).then(() => {
                    // Update unread count if user is logged in
                    if (user) {
                        if (unsubscribeConversations) unsubscribeConversations();

                        unsubscribeConversations = window.FirebaseAPI.getConversations(user.uid, (conversations) => {
                            // Calculate unread count
                            let unreadCount = 0;
                            conversations.forEach(conv => {
                                const isRead = conv.readStatus && conv.readStatus[user.uid];
                                // console.log(`Debug: Conv ${conv.id} readStatus for ${user.uid}:`, isRead);
                                if (!isRead) {
                                    unreadCount++;
                                }
                            });

                            console.log('🔔 Unread Messages Count:', unreadCount);

                            // Update UI
                            updateStartMessagesCount(unreadCount);
                        });
                    } else {
                        if (unsubscribeConversations) unsubscribeConversations();
                        updateStartMessagesCount(0);
                    }

                    // Toggle Messages Icon visibility based on auth state
                    const messagesIconLink = document.querySelector('.messages-icon-link');
                    if (messagesIconLink) {
                        messagesIconLink.style.display = user ? 'block' : 'none';
                    }
                }).catch(err => {
                    console.error('Error updating user menu:', err);
                    if (user) {
                        // Fallback
                    }
                });
            });
        });

        function updateStartMessagesCount(count) {
            // Update Dropdown Link
            const messagesLink = document.querySelector('a[href*="pages/messages/index.html"]');
            if (messagesLink) {
                if (count > 0) {
                    messagesLink.innerHTML = `Messages <span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.75rem; margin-left: 5px;">${count}</span>`;
                } else {
                    messagesLink.textContent = 'Messages';
                }
            }

            // Update Header Icon (if exists)
            const headerMsgBadge = document.getElementById('header-msg-badge');
            if (headerMsgBadge) {
                if (count > 0) {
                    headerMsgBadge.style.display = 'flex';
                    headerMsgBadge.textContent = count > 99 ? '99+' : count;
                } else {
                    headerMsgBadge.style.display = 'none';
                }
            }
        }
    }


    // Location Selector (placeholder for future implementation)
    const locationSelector = document.querySelector('.location-selector');
    if (locationSelector) {
        locationSelector.addEventListener('click', function () {
            // Future: Open location selection modal
            console.log('Location selector clicked - implement location picker');
        });
    }



    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Prevent body scroll when mobile menu is open
    const style = document.createElement('style');
    style.textContent = `
        body.menu-open {
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});
