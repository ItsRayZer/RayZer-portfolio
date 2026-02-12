# Firebase Authentication Setup Guide

## 🔐 Fixing "Sign-in Failed" Error

If you're seeing "Sign-in failed. Please try again" when clicking the login button, it's because **your deployment domain is not authorized** in Firebase.

---

## ✅ Quick Fix: Add Your Deployment Domain

### Step 1: Find Your Current Domain

When you click "Sign In", the new error message will tell you exactly which domain to add. Look for:

```
This domain is not authorized.

📋 To fix:
1. Go to Firebase Console
2. Authentication → Settings → Authorized domains
3. Add this domain: [YOUR-DOMAIN-HERE]
```

### Step 2: Add the Domain in Firebase Console

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project**: `rayzer-portfolio`
3. **Click "Authentication"** in the left sidebar
4. **Click "Settings"** tab at the top
5. **Click "Authorized domains"** tab
6. **Click "Add domain"** button
7. **Enter your deployment domain**, for example:
   - `your-site.netlify.app`
   - `your-site.vercel.app`
   - `your-custom-domain.com`
   - `127.0.0.1` (for local testing with IP)
   
   > ⚠️ **Note:** `localhost` should already be there for local development

8. **Click "Add"** to save

### Step 3: Test Again

1. Refresh your deployed website
2. Click the "Sign In" button
3. Sign in with your Google account
4. ✅ Success! Your name and email should auto-fill in the contact form

---

## 🔍 Common Errors & Solutions

### Error: `auth/unauthorized-domain`
**Problem:** Your domain is not in the authorized list  
**Solution:** Follow the steps above to add your deployment domain

### Error: `auth/popup-blocked`
**Problem:** Your browser is blocking the Google sign-in popup  
**Solution:** Allow pop-ups for your site in browser settings

### Error: `auth/operation-not-allowed`
**Problem:** Google Sign-In provider is not enabled  
**Solution:** 
1. Go to Firebase Console → Authentication
2. Click "Sign-in method" tab
3. Enable "Google" provider

---

## 📝 Important Notes

### File Protocol (`file://`)
Firebase Authentication **does NOT work** with `file://` protocol (opening HTML directly).

For local development, use a server:
```bash
npx -y serve -p 3000
```

Then open: `http://localhost:3000`

### Multiple Domains
If you deploy to multiple platforms (staging, production, etc.), you need to add **each domain** to the authorized list.

### Wildcards
Firebase does NOT support wildcard domains. You must add each specific subdomain.

---

## 🎯 Admin Access

Only the email `abensojan@gmail.com` has admin privileges. This is configured in `firebase-config.js`:

```javascript
export const ADMIN_EMAIL = 'abensojan@gmail.com';
```

To add more admins, add their emails to this configuration.

---

## 🐛 Debugging

The authentication now includes detailed error logging. Open your browser console (F12) and look for:

- `🔴 Full authentication error:` - Shows the complete error object
- `✅ Sign-in successful:` - Shows the user's email when login works
- `✅ Sign-out successful` - Confirms successful logout

---

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Verify the domain is correctly added in Firebase Console
3. Make sure Google provider is enabled in Firebase Authentication
4. Try in an incognito window to rule out browser cache issues
