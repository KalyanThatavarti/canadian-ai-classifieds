// ================================
// Authentication Handler
// Handles all auth page interactions
// ================================

(function () {
    'use strict';

    // Get current page
    const currentPage = window.location.pathname;
    const isLoginPage = currentPage.includes('login.html');
    const isSignupPage = currentPage.includes('signup.html');
    const isResetPage = currentPage.includes('reset-password.html');

    // DOM Elements
    const alertMessage = document.getElementById('alertMessage');

    // ===== Utility Functions =====

    function showAlert(message, type = 'info') {
        if (!alertMessage) return;

        alertMessage.textContent = message;
        alertMessage.className = `auth-alert ${type} visible`;

        // Auto-hide after 5 seconds for non-success messages
        if (type !== 'success') {
            setTimeout(() => {
                alertMessage.classList.remove('visible');
            }, 5000);
        }
    }

    function hideAlert() {
        if (alertMessage) {
            alertMessage.classList.remove('visible');
        }
    }

    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner"></span> Processing...';
        } else {
            button.disabled = false;
            // Restore original text based on page
            if (isLoginPage) button.textContent = 'Sign In';
            else if (isSignupPage) button.textContent = 'Create Account';
            else if (isResetPage) button.textContent = 'Send Reset Link';
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        // At least 6 characters (Firebase requirement)
        return password.length >= 6;
    }

    // Wait for Firebase to be ready
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


    // ===== Login Page =====
    if (isLoginPage) {
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const googleSignInBtn = document.getElementById('googleSignInBtn');

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                hideAlert();

                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;

                // Validation
                if (!validateEmail(email)) {
                    showAlert('Please enter a valid email address', 'error');
                    return;
                }

                if (!validatePassword(password)) {
                    showAlert('Password must be at least 6 characters', 'error');
                    return;
                }

                setButtonLoading(loginBtn, true);

                try {
                    await window.FirebaseAPI.signInWithEmail(email, password);
                    showAlert('Successfully signed in! Redirecting...', 'success');

                    // Redirect to home page after brief delay
                    setTimeout(() => {
                        window.location.href = '../../index.html';
                    }, 1500);
                } catch (error) {
                    console.error('Login error:', error);

                    let errorMessage = 'Failed to sign in. Please try again.';
                    if (error.code === 'auth/user-not-found') {
                        errorMessage = 'No account found with this email address.';
                    } else if (error.code === 'auth/wrong-password') {
                        errorMessage = 'Incorrect password. Please try again.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email address format.';
                    } else if (error.code === 'auth/user-disabled') {
                        errorMessage = 'This account has been disabled.';
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMessage = 'Too many failed attempts. Please try again later.';
                    }

                    showAlert(errorMessage, 'error');
                    setButtonLoading(loginBtn, false);
                }
            });
        }

        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', async () => {
                hideAlert();
                setButtonLoading(googleSignInBtn, true);

                try {
                    await window.FirebaseAPI.signInWithGoogle();
                    showAlert('Successfully signed in with Google! Redirecting...', 'success');

                    setTimeout(() => {
                        window.location.href = '../../index.html';
                    }, 1500);
                } catch (error) {
                    console.error('Google sign-in error:', error);

                    let errorMessage = 'Failed to sign in with Google. Please try again.';
                    if (error.code === 'auth/popup-closed-by-user') {
                        errorMessage = 'Sign-in popup was closed. Please try again.';
                    } else if (error.code === 'auth/popup-blocked') {
                        errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
                    }

                    showAlert(errorMessage, 'error');
                    setButtonLoading(googleSignInBtn, false);
                }
            });
        }
    }

    // ===== Signup Page =====
    if (isSignupPage) {
        const signupForm = document.getElementById('signupForm');
        const signupBtn = document.getElementById('signupBtn');
        const googleSignInBtn = document.getElementById('googleSignInBtn');
        const passwordInput = document.getElementById('password');
        const passwordStrength = document.getElementById('passwordStrength');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        // Password Strength Checker
        if (passwordInput && passwordStrength) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;

                if (password.length === 0) {
                    passwordStrength.classList.remove('visible');
                    return;
                }

                passwordStrength.classList.add('visible');

                let strength = 'weak';
                let strengthScore = 0;

                // Check various criteria
                if (password.length >= 8) strengthScore++;
                if (password.length >= 12) strengthScore++;
                if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strengthScore++;
                if (/[0-9]/.test(password)) strengthScore++;
                if (/[^a-zA-Z0-9]/.test(password)) strengthScore++;

                if (strengthScore >= 4) {
                    strength = 'strong';
                    strengthText.textContent = 'Strong password';
                } else if (strengthScore >= 2) {
                    strength = 'medium';
                    strengthText.textContent = 'Medium strength';
                } else {
                    strength = 'weak';
                    strengthText.textContent = 'Weak password';
                }

                strengthFill.className = `strength-fill ${strength}`;
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                hideAlert();

                // Wait for Firebase to be ready
                try {
                    await waitForFirebase();
                } catch (error) {
                    showAlert('Firebase is still loading. Please wait a moment and try again.', 'error');
                    return;
                }

                const displayName = document.getElementById('displayName').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const termsAccept = document.getElementById('termsAccept').checked;

                // Validation
                if (!displayName) {
                    showAlert('Please enter your full name', 'error');
                    return;
                }

                if (!validateEmail(email)) {
                    showAlert('Please enter a valid email address', 'error');
                    return;
                }

                if (!validatePassword(password)) {
                    showAlert('Password must be at least 6 characters', 'error');
                    return;
                }

                if (password !== confirmPassword) {
                    showAlert('Passwords do not match', 'error');
                    return;
                }

                if (!termsAccept) {
                    showAlert('Please accept the Terms of Service', 'error');
                    return;
                }

                setButtonLoading(signupBtn, true);

                try {
                    await window.FirebaseAPI.signUpWithEmail(email, password, displayName);

                    showAlert('Account created! A verification email has been sent. Redirecting...', 'success');

                    setTimeout(() => {
                        window.location.href = '../../index.html';
                    }, 2000);
                } catch (error) {
                    console.error('Signup error:', error);
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);

                    let errorMessage = 'Failed to create account. Please try again.';
                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = 'An account with this email already exists. Please sign in instead.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email address format.';
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = 'Password is too weak. Please use a stronger password.';
                    } else if (error.code === 'auth/operation-not-allowed') {
                        errorMessage = 'Email/password sign-up is not enabled in Firebase. Please enable it in the Firebase Console under Authentication > Sign-in method.';
                    } else if (!window.FirebaseAPI) {
                        errorMessage = 'Firebase is not initialized. Please refresh the page.';
                    } else {
                        // Show the actual error for debugging
                        errorMessage = `Error: ${error.message} (Code: ${error.code || 'unknown'})`;
                    }

                    showAlert(errorMessage, 'error');
                    setButtonLoading(signupBtn, false);
                }
            });
        }

        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', async () => {
                hideAlert();
                setButtonLoading(googleSignInBtn, true);

                try {
                    await window.FirebaseAPI.signInWithGoogle();
                    showAlert('Account created with Google! Redirecting...', 'success');

                    setTimeout(() => {
                        window.location.href = '../../index.html';
                    }, 1500);
                } catch (error) {
                    console.error('Google sign-in error:', error);

                    let errorMessage = 'Failed to sign in with Google. Please try again.';
                    if (error.code === 'auth/popup-closed-by-user') {
                        errorMessage = 'Sign-in popup was closed. Please try again.';
                    } else if (error.code === 'auth/popup-blocked') {
                        errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
                    }

                    showAlert(errorMessage, 'error');
                    setButtonLoading(googleSignInBtn, false);
                }
            });
        }
    }

    // ===== Reset Password Page =====
    if (isResetPage) {
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        const resetBtn = document.getElementById('resetBtn');

        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                hideAlert();

                const email = document.getElementById('email').value.trim();

                // Validation
                if (!validateEmail(email)) {
                    showAlert('Please enter a valid email address', 'error');
                    return;
                }

                setButtonLoading(resetBtn, true);

                try {
                    await window.FirebaseAPI.resetPassword(email);

                    showAlert('Password reset email sent! Please check your inbox.', 'success');

                    // Clear form
                    resetPasswordForm.reset();
                    setButtonLoading(resetBtn, false);
                } catch (error) {
                    console.error('Reset password error:', error);

                    let errorMessage = 'Failed to send reset email. Please try again.';
                    if (error.code === 'auth/user-not-found') {
                        errorMessage = 'No account found with this email address.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email address format.';
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMessage = 'Too many requests. Please try again later.';
                    }

                    showAlert(errorMessage, 'error');
                    setButtonLoading(resetBtn, false);
                }
            });
        }
    }

    // ===== Check if User is Already Logged In =====
    // If user is already authenticated and visits auth pages, redirect to home
    if (window.FirebaseAPI && window.FirebaseAPI.auth) {
        window.FirebaseAPI.auth.onAuthStateChanged((user) => {
            if (user && (isLoginPage || isSignupPage)) {
                // User is already logged in, redirect to home
                console.log('User already logged in, redirecting to home...');
                // Comment this out for testing, uncomment for production
                // window.location.href = '../../index.html';
            }
        });
    }

    console.log('✅ Authentication handler loaded');
})();
