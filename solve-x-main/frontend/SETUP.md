# SolveX Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Firebase Setup**
   - Your Firebase configuration is already set in `src/lib/firebase.js`
   - Make sure you have enabled:
     - ✅ Authentication (Email/Password + Google)
     - ✅ Firestore Database
     - ✅ Storage (optional, only for metadata)

3. **Deploy Firestore Rules**
   ```bash
   # If you have Firebase CLI installed
   firebase deploy --only firestore:rules
   ```
   Or manually copy the rules from `firestore.rules` to your Firebase Console.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the App**
   - Open http://localhost:3000
   - Create an account and select your role
   - Start using the platform!

## Firebase Console Setup

### 1. Enable Authentication
- Go to Firebase Console → Authentication
- Enable "Email/Password" provider
- Enable "Google" provider (optional but recommended)

### 2. Create Firestore Database
- Go to Firebase Console → Firestore Database
- Create database in production mode (rules will protect it)
- Deploy the security rules from `firestore.rules`

### 3. Set Up Collections (Optional - will be created automatically)
The following collections will be created automatically when users interact with the app:
- `users/` - User profiles
- `projects/` - Professor/TA projects
- `studentProjects/` - Student projects
- `opportunities/` - Organization opportunities
- `applications/` - Applications
- `reports/` - Weekly reports
- `notifications/` - Notifications

## Testing the Platform

### As a Student:
1. Sign up and select "Student" role
2. Browse opportunities at `/opportunities`
3. Apply to projects
4. Create your own project
5. Submit weekly reports (after being accepted)

### As a Professor/TA:
1. Sign up and select "Professor" or "Teaching Assistant" role
2. Create research projects from your dashboard
3. View and manage applications
4. Track student progress through weekly reports

### As an Organization:
1. Sign up and select "Organization Representative" role
2. Create opportunities (courses, workshops, etc.)
3. Manage applications to your opportunities

## Important Notes

- **File Uploads**: All file uploads must be done via Google Drive links. Users paste Drive links into forms.
- **Security**: All routes are protected and Firestore rules enforce role-based access.
- **Notifications**: In-app notifications are stored in Firestore and displayed in the navbar.

## Troubleshooting

### Firebase Connection Issues
- Verify your Firebase config in `src/lib/firebase.js`
- Check that your Firebase project is active
- Ensure Firestore is enabled

### Authentication Issues
- Make sure Email/Password authentication is enabled
- For Google login, ensure Google provider is configured

### Firestore Permission Errors
- Deploy the security rules from `firestore.rules`
- Check that your user has the correct role in the `users` collection

## Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to Firebase Hosting or any static hosting service.


