# 🔥 Apply Firestore Security Rules - URGENT

## Problem
You're getting "Missing or insufficient permissions" when trying to favorite listings.

## Solution
You need to apply the updated Firestore security rules to your Firebase project.

## Steps to Fix:

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/project/canadian-ai-classifieds/firestore/rules

### 2. Copy the Rules
Open the file: `docs/firebase-security-rules.txt`
Copy lines 9-58 (the Firestore rules section)

### 3. Paste into Firebase Console
- Delete ALL existing rules in the Firebase Console
- Paste the new rules from the file
- Click **"Publish"** button

### 4. Test
- Refresh your website
- Try clicking the heart button on a listing
- Should now work without errors!

## What Changed:
✅ Removed catch-all deny rule that was blocking favorites
✅ Added explicit permissions for favorites subcollection
✅ Allowed any authenticated user to update listings (for favorites count)

## Expected Result:
- Heart button works
- Favorites save to Firestore
- Favorites tab shows your favorited items
- No more permission errors
