# 🔐 Security Setup for Public Repository

## Overview

This repository uses Firebase and Resend for backend services. To keep your API keys secure, sensitive configuration files are excluded from version control.

## 📋 Setup Instructions

### 1. Firebase Configuration

**Create your Firebase config file:**

```bash
# Copy the example file
cp js/firebase-config.example.js js/firebase-config.js
```

**Get your Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Settings** → **General**
4. Scroll to **"Your apps"** → **Web app**
5. Copy the config object

**Update `js/firebase-config.js`** with your credentials:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### 2. Cloud Functions Environment Variables

**Create environment file for Cloud Functions:**

```bash
cd functions
cp .env.example .env
```

**Get your Resend API key:**
1. Go to [Resend Dashboard](https://resend.com)
2. Navigate to **API Keys**
3. Create a new API key
4. Copy the key

**Update `functions/.env`:**
```
RESEND_API_KEY=re_your_actual_api_key_here
```

### 3. Deploy Cloud Functions

**Set your Resend API key in Firebase:**
```bash
firebase functions:secrets:set RESEND_API_KEY
# Paste your Resend API key when prompted
```

**Deploy your functions:**
```bash
firebase deploy --only functions
```

## 🔒 Security Notes

### What's Hidden from Git:
- ✅ `js/firebase-config.js` - Contains Firebase API keys
- ✅ `functions/.env` - Contains Resend API key
- ✅ `.firebaserc` - Contains project configuration

### What's Safe to Commit:
- ✅ `js/firebase-config.example.js` - Template file
- ✅ `functions/.env.example` - Template file
- ✅ All source code and HTML/CSS

### Important:
- **Firebase Client API Keys** are technically safe to expose (protected by Firestore Security Rules), but we gitignore them as best practice
- **Resend API Key** must NEVER be committed - it grants full access to send emails
- **Firebase Service Account Keys** must NEVER be committed (not used in this project)

## 🚀 Quick Start for Contributors

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourUsername/canadian-ai-classifieds.git
   ```

2. **Set up Firebase config**
   ```bash
   cp js/firebase-config.example.js js/firebase-config.js
   # Edit firebase-config.js with your Firebase credentials
   ```

3. **Set up Cloud Functions**
   ```bash
   cd functions
   npm install
   cp .env.example .env
   # Edit .env with your Resend API key
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

## 📝 Environment Variables Reference

| Variable | Location | Required | Description |
|----------|----------|----------|-------------|
| `RESEND_API_KEY` | `functions/.env` | Yes | Resend API key for sending emails |
| Firebase Config | `js/firebase-config.js` | Yes | Firebase project configuration |

## ⚠️ If You Accidentally Committed Secrets

If you accidentally committed API keys:

1. **Immediately revoke/regenerate the exposed keys**:
   - Firebase: Create new web app in Firebase Console
   - Resend: Delete and create new API key

2. **Remove from Git history**:
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch js/firebase-config.js" \
   --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

3. **Update your local files** with new credentials

## 📧 Support

If you need help setting up, please open an issue or contact the maintainers.
