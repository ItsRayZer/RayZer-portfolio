// Authentication UI Controller
// Manages all auth-related UI components

import { signInWithGoogle, signOutUser, onAuthChange } from './auth-service.js';

let currentUser = null;

/**
 * Initialize authentication UI
 */
export function initAuthUI() {
  createAuthContainer();

  // Listen to auth state changes
  onAuthChange((user) => {
    currentUser = user;
    updateAuthUI(user);

    // Trigger custom event for other parts of the app
    const event = new CustomEvent('authStateChanged', { detail: user });
    document.dispatchEvent(event);
  });

  // Log current domain for Firebase setup
  console.log('🎨 Auth UI initialized');
  console.log('🌐 Current domain:', window.location.hostname);
  console.log('📋 Add this domain to Firebase Console → Authentication → Settings → Authorized domains');
}


/**
 * Create auth container in navigation
 */
function createAuthContainer() {
  // Auth container is already in the HTML inside nav-menu
  // Just verify it exists
  const container = document.getElementById('authContainer');
  if (!container) {
    console.error('Auth container not found in navigation');
  }
}

// Expose initAuthUI globally for non-module scripts
window.initAuthUICallback = initAuthUI;

/**
 * Update UI based on auth state
 * @param {Object|null} user - Current user object or null
 */
function updateAuthUI(user) {
  const container = document.getElementById('authContainer');
  if (!container) return;

  if (user) {
    // User is signed in
    container.innerHTML = `
      ${user.isAdmin ? '<a href="admin.html" class="nav-item admin-panel-nav">⚙️ Admin</a>' : ''}
      <div class="nav-item user-profile-nav">
        <a href="dashboard.html" class="dashboard-link-nav" title="My Dashboard">❤️</a>
        <img src="${user.photoURL}" alt="${user.displayName}" class="user-avatar-nav">
        <span class="user-name-nav">${user.displayName}</span>
        ${user.isAdmin ? '<span class="admin-badge-small">ADMIN</span>' : ''}
      </div>
      <button class="nav-item btn-signout-nav" onclick="window.handleSignOut()">Sign Out</button>
    `;
  } else {
    // User is signed out
    container.innerHTML = `
      <button class="nav-item btn-signin-nav" onclick="window.handleSignIn()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
        </svg>
        Sign In
      </button>
    `;
  }
}

/**
 * Handle sign in button click
 */
window.handleSignIn = async function () {
  try {
    await signInWithGoogle();
  } catch (error) {
    console.error('🔴 Full authentication error:', error);

    let errorMessage = 'Sign-in failed. ';

    // Provide specific error messages based on error code
    switch (error.code) {
      case 'auth/unauthorized-domain':
        errorMessage += 'This domain is not authorized.\n\n';
        errorMessage += '📋 To fix:\n';
        errorMessage += '1. Go to Firebase Console\n';
        errorMessage += '2. Authentication → Settings → Authorized domains\n';
        errorMessage += '3. Add this domain: ' + window.location.hostname;
        break;

      case 'auth/popup-blocked':
        errorMessage += 'Pop-up was blocked by your browser.\n\n';
        errorMessage += '📋 To fix: Allow pop-ups for this site and try again.';
        break;

      case 'auth/popup-closed-by-user':
        errorMessage += 'Sign-in was cancelled.';
        return; // Don't show alert for user cancellation

      case 'auth/network-request-failed':
        errorMessage += 'Network error. Please check your internet connection.';
        break;

      case 'auth/operation-not-allowed':
        errorMessage += 'Google Sign-In is not enabled.\n\n';
        errorMessage += '📋 To fix: Enable Google provider in Firebase Console.';
        break;

      case 'auth/cancelled-popup-request':
        // Multiple popups opened, ignore
        return;

      default:
        errorMessage += 'Error: ' + (error.message || 'Unknown error');
        errorMessage += '\n\nError code: ' + (error.code || 'none');
    }

    alert(errorMessage);
  }
};

/**
 * Handle sign out button click
 */
window.handleSignOut = async function () {
  try {
    await signOutUser();
  } catch (error) {
    alert('Sign-out failed. Please try again.');
  }
};

/**
 * Get current user (for other modules)
 * @returns {Object|null}
 */
export function getAuthenticatedUser() {
  return currentUser;
}
