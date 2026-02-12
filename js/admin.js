// Admin Panel JavaScript
// Protects admin panel and displays user info

import { onAuthChange } from './auth-service.js';

// Check authentication on page load
onAuthChange((user) => {
    const welcomeSection = document.getElementById('welcomeSection');

    if (!user) {
        // Not signed in - redirect to home
        console.log('⛔ Not authenticated, redirecting...');
        window.location.href = 'index.html';
        return;
    }

    if (!user.isAdmin) {
        // Signed in but not admin - redirect to home
        console.log('⛔ Not admin, redirecting...');
        alert('Access Denied: Admin privileges required');
        window.location.href = 'index.html';
        return;
    }

    // User is admin - show welcome message
    console.log('✅ Admin access granted');
    welcomeSection.innerHTML = `
        <p class="welcome-text">Welcome back, <span class="user-email">${user.displayName}</span>!</p>
        <p style="font-family: 'Space Grotesk', sans-serif; color: rgba(255, 255, 255, 0.6); margin-top: 0.5rem;">
            Signed in as: ${user.email}
        </p>
    `;
});
