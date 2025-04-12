# User Authentication and Account Management

This document outlines the authentication and user account management system implemented in BiteBuddy.

## Overview

BiteBuddy uses Supabase for user authentication and data storage. The system provides:

1. User registration and login
2. User profile management
3. Secure data storage per user
4. Session management
5. Individual user preferences and settings

## Authentication Flow

1. **Initial Launch**: The app checks for an existing user session on startup
2. **Login/Signup**: Users can log in with email/password or create a new account
3. **Profile Setup**: After signup, users can complete their profile with personal details
4. **Session Management**: The app maintains the user session using secure storage
5. **Sign Out**: Users can sign out to clear their session

## Database Structure

The following tables are used to store user-related data:

1. **Auth Users**: Managed by Supabase Auth (email, password)
2. **user_profiles**: Stores additional user information:
   - Personal details (display name, age, height, weight)
   - Goal weight and other health metrics
   - Dietary preferences
   - Activity level
3. **food_logs**: Food entries recorded by each user
4. **companions**: Virtual pet data for each user

## Key Components

### Stores

- **authStore.ts**: Manages authentication state and operations
- **userProfileStore.ts**: Handles user profile data operations
- **foodStore.ts**: Controls food logging per user
- **companionStore.ts**: Manages companion data per user

### Screens

- **Login Screen** (`/app/auth/login.tsx`): User authentication
- **Signup Screen** (`/app/auth/signup.tsx`): New user registration
- **Profile Setup Screen** (`/app/auth/profile-setup.tsx`): Complete user profile

### Components

- **LoginForm**: Input fields and validation for login
- **SignUpForm**: Registration form with validation
- **ProfileSetupForm**: Comprehensive profile data collection

## Security Measures

1. **Secure Storage**: User sessions stored using Expo SecureStore
2. **Data Isolation**: Each user's data is access-controlled using user_id
3. **Server-side Validation**: Authentication handled securely by Supabase

## How to Use

### For Users

1. **Login**: Enter email and password
2. **Sign Up**: Create account with email and password
3. **Profile Setup**: Complete personal details for better app experience
4. **Edit Profile**: Update profile information at any time
5. **Settings**: Personalize app behavior and notifications
6. **Sign Out**: Log out from the app

### For Developers

1. **Access Current User**: 
   ```typescript
   const { user } = useAuthStore();
   ```

2. **Get User Profile**:
   ```typescript
   const { profile, fetchProfile } = useUserProfileStore();
   fetchProfile(userId);
   ```

3. **Update User Profile**:
   ```typescript
   const { updateProfile } = useUserProfileStore();
   updateProfile(userId, { display_name: 'New Name' });
   ```

4. **Auth State Check**:
   ```typescript
   const { initialized, user } = useAuthStore();
   if (!initialized) {
     // Show loading
   } else if (user) {
     // User is logged in
   } else {
     // User is not logged in
   }
   ```

## Future Enhancements

- Social login integration (Google, Apple, etc.)
- Email verification
- Password reset functionality
- Two-factor authentication
- Improved profile image handling
- Social connections between users 