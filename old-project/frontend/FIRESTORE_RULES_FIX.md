# Firestore Rules Fix for Signup Permission Error

## Problem
Getting "Missing or insufficient permissions" error during signup.

## Solution

The Firestore rules have been updated, but you need to **deploy them to Firebase**.

### Option 1: Deploy via Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use the existing `firestore.rules` file

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option 2: Manual Deployment via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy the entire content from `firestore.rules` file
5. Paste it into the rules editor
6. Click **Publish**

### Option 3: Temporary Test Mode (NOT for Production)

If you need to test quickly, you can temporarily use these rules (⚠️ **INSECURE - Only for testing**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING:** This allows any authenticated user to read/write any document. Only use for testing, then switch back to proper rules!

## Verify Rules Are Deployed

1. Go to Firebase Console → Firestore Database → Rules
2. Check the timestamp - it should show when rules were last updated
3. Try signing up again

## Updated Rules

The rules now explicitly check:
- User is authenticated (`isAuthenticated()`)
- Auth token exists (`request.auth != null`)
- User ID matches (`request.auth.uid == userId`)

This should allow users to create their own user document during signup.

## Still Having Issues?

1. **Check Firebase Console → Authentication:**
   - Verify the user was created
   - Note the UID

2. **Check Firebase Console → Firestore:**
   - Go to Rules tab
   - Verify rules are deployed
   - Check the timestamp

3. **Test the rules:**
   - Try creating a document manually in Firestore Console
   - See if you get permission errors

4. **Check browser console:**
   - Look for detailed error messages
   - Check Network tab for Firestore requests

5. **Verify project settings:**
   - Make sure you're using the correct Firebase project
   - Check `src/lib/firebase.js` has the correct config

## Common Issues

### Issue: Rules not deployed
**Solution:** Deploy rules using Firebase CLI or Console

### Issue: Wrong Firebase project
**Solution:** Check `firebase.js` config matches your Firebase project

### Issue: Auth not ready
**Solution:** The code now waits 100ms after auth creation before writing to Firestore

### Issue: Rules syntax error
**Solution:** Check Firebase Console → Rules for syntax errors (will show in red)



