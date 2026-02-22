# Firestore Debugging Guide

If data is not being stored in Firestore, follow these steps:

## 1. Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database
4. Check if the `users` collection exists
5. Check if documents are being created

## 2. Check Browser Console

Open browser DevTools (F12) and check for errors:
- Look for Firestore permission errors
- Check for network errors
- Verify authentication status

## 3. Verify Firestore Rules

Make sure your Firestore rules allow writes. The rules should include:

```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && request.auth.uid == userId;
  allow update: if isAuthenticated() && request.auth.uid == userId;
}
```

## 4. Test Firestore Connection

Run this in your browser console while logged in:

```javascript
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db, auth } from './src/lib/firebase'

// Test write
const testDoc = doc(db, 'test', 'test123')
await setDoc(testDoc, { test: 'data', timestamp: new Date() })
console.log('✅ Write successful')

// Test read
const readDoc = await getDoc(testDoc)
console.log('✅ Read successful:', readDoc.data())

// Test user document
if (auth.currentUser) {
  const userDoc = doc(db, 'users', auth.currentUser.uid)
  const userData = await getDoc(userDoc)
  console.log('✅ User document:', userData.exists() ? userData.data() : 'NOT FOUND')
}
```

## 5. Common Issues

### Issue: Permission Denied
**Solution:** Check Firestore rules and ensure they allow authenticated users to write

### Issue: User document not created
**Solution:** 
- Check if signup function is being called
- Verify error handling in signup
- Check browser console for errors

### Issue: Role not saved
**Solution:**
- Verify role is being passed correctly to signup function
- Check Firestore rules allow role field updates
- Ensure user document exists before updating

## 6. Manual Fix

If data is missing, you can manually create user documents:

1. Go to Firestore Console
2. Create collection `users`
3. Add document with user's UID (from Authentication)
4. Add fields:
   - `email`: user's email
   - `role`: 'professor', 'ta', 'student', or 'organization_representative'
   - `firstName`: user's first name
   - `lastName`: user's last name
   - `displayName`: full name
   - `createdAt`: timestamp
   - `updatedAt`: timestamp

## 7. Enable Firestore Logging

Add this to your code temporarily to see what's happening:

```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore'

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support all of the features required for persistence')
  }
})
```

## 8. Check Network Tab

1. Open DevTools → Network tab
2. Filter by "firestore"
3. Look for failed requests
4. Check request/response details

## Still Having Issues?

1. Check Firebase project settings
2. Verify API keys are correct
3. Check if Firestore is enabled in Firebase Console
4. Verify billing is enabled (if required)
5. Check Firebase status page for outages



