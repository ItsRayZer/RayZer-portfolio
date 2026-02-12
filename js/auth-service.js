// Authentication Service
// Handles all Firebase authentication logic

import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

import { auth, googleProvider, ADMIN_EMAIL } from './firebase-config.js';

/**
 * Sign in with Google
 * @returns {Promise<Object>} User object with isAdmin flag
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        console.log('✅ Sign-in successful:', user.email);

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isAdmin: user.email === ADMIN_EMAIL
        };
    } catch (error) {
        console.error('❌ Sign-in error:', error.code, error.message);
        throw error;
    }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOutUser() {
    try {
        await signOut(auth);
        console.log('✅ Sign-out successful');
    } catch (error) {
        console.error('❌ Sign-out error:', error);
        throw error;
    }
}

/**
 * Get current user
 * @returns {Object|null} Current user object or null
 */
export function getCurrentUser() {
    const user = auth.currentUser;
    if (!user) return null;

    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: user.email === ADMIN_EMAIL
    };
}

/**
 * Check if current user is admin
 * @returns {boolean}
 */
export function isAdmin() {
    const user = getCurrentUser();
    return user ? user.isAdmin : false;
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Called with user object when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                isAdmin: user.email === ADMIN_EMAIL
            };
            callback(userData);
        } else {
            callback(null);
        }
    });
}
