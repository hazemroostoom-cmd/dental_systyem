# Firebase Setup Guide

This guide will help you set up Firebase for the Dental Lab Platform.

## Prerequisites

1. A Google account
2. Node.js installed (v16 or higher)
3. Firebase CLI installed globally: `npm install -g firebase-tools`

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "dental-lab-platform")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider
5. (Optional) Enable other providers like Google, but Email/Password is sufficient for now

### Firestore Database
1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (you can change this later)
4. Select a location for your database (choose the one closest to your users)
5. Click "Done"

### Storage
1. Go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" (you can change this later)
4. Click "Done"

## Step 3: Get Firebase Configuration

1. In your Firebase project, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the "</>" icon to add a web app
4. Enter an app nickname (e.g., "Dental Lab Web App")
5. Check "Also set up Firebase Hosting" if you plan to deploy there
6. Click "Register app"
7. Copy the config object - you'll need this for the next step

## Step 4: Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   On Windows PowerShell, use:
   ```powershell
   copy .env.local.example .env.local
   ```

2. Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Step 5: Deploy Security Rules

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select "Firestore" and "Storage"
   - Choose your existing Firebase project
   - Accept the default file locations

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

## Step 6: Create Demo Users

You can create demo users through the Firebase Console or programmatically. The app includes demo credentials that you can use to create test accounts:

- **Dentist**: doctor@dental.com / password123
- **Technician**: technician@dental.com / password123
- **Admin**: admin@dental.com / password123

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/login`
3. Try signing up with a new account or using the demo credentials

## Troubleshooting

### Common Issues

1. **"Project not found" error**: Make sure your `.env.local` has the correct project ID
2. **Authentication not working**: Check that Email/Password provider is enabled in Firebase Console
3. **Firestore permission denied**: Make sure the security rules are deployed correctly
4. **Storage upload fails**: Check storage rules and ensure the bucket name is correct

### Firebase Console Debugging

- **Authentication**: Check the "Users" tab to see registered users
- **Firestore**: Use the data viewer to see your collections and documents
- **Storage**: Check uploaded files in the storage browser
- **Functions**: Monitor function logs if you deploy Cloud Functions

## Security Notes

- The security rules provided are role-based and restrict access appropriately
- In production, you should:
  - Change Firestore and Storage from "test mode" to "production mode"
  - Review and tighten security rules
  - Enable Firebase Security features like App Check
  - Set up proper monitoring and alerts

## Next Steps

Once Firebase is set up, you can:
1. Test all CRUD operations for cases
2. Implement real-time listeners for live updates
3. Add file upload functionality
4. Deploy Cloud Functions for server-side logic
5. Set up Firebase Hosting for production deployment