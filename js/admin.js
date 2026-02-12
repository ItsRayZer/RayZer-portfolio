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

    // Load recent comments
    loadAdminComments();

    // Load messages
    loadAdminMessages();
});

async function loadAdminMessages() {
    const list = document.getElementById('adminMessagesList');
    if (!list) return;

    // Retry if dbService not loaded yet
    if (!window.dbService || !window.dbService.getMessages) {
        // console.log("⏳ Waiting for dbService (Messages)...");
        setTimeout(loadAdminMessages, 500);
        return;
    }

    try {
        const messages = await window.dbService.getMessages(20);

        if (messages.length === 0) {
            list.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 1rem;">No messages yet.</p>';
            return;
        }

        list.innerHTML = messages.map(m => `
            <div style="background: ${m.read ? 'rgba(255,255,255,0.02)' : 'rgba(212, 175, 55, 0.1)'}; padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 3px solid ${m.read ? 'rgba(255,255,255,0.1)' : '#d4af37'}; transition: all 0.3s;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <div>
                        <strong style="color: #fff;">${m.name}</strong>
                        <span style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-left: 0.5rem;"><${m.email}></span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">
                            ${m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </span>
                        ${!m.read ? `<button onclick="window.markRead('${m.id}')" style="background: none; border: 1px solid #d4af37; color: #d4af37; cursor: pointer; padding: 0.1rem 0.4rem; font-size: 0.7rem; border-radius: 2px;">MARK READ</button>` : '✓'}
                    </div>
                </div>
                <div style="font-size: 0.95rem; color: #eee; white-space: pre-wrap;">${m.message}</div>
            </div>
        `).join('');

    } catch (e) {
        console.error("Error loading messages", e);
        list.innerHTML = '<p style="color: red;">Error loading messages.</p>';
    }
}

// Global handler for marking read
window.markRead = async function (id) {
    if (window.dbService && window.dbService.markMessageAsRead) {
        await window.dbService.markMessageAsRead(id);
        loadAdminMessages(); // Reload list
    }
};

async function loadAdminComments() {
    const list = document.getElementById('adminCommentsList');
    if (!list) return;

    // Retry if dbService not loaded yet
    if (!window.dbService || !window.dbService.getRecentComments) {
        setTimeout(loadAdminComments, 500);
        return;
    }

    try {
        const comments = await window.dbService.getRecentComments(10);

        if (comments.length === 0) {
            list.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 1rem;">No recent comments.</p>';
            return;
        }

        list.innerHTML = comments.map(c => `
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 2px solid #d4af37;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong style="color: #d4af37;">${c.userName}</strong>
                    <span style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">
                        ${c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </span>
                </div>
                <div style="font-size: 0.9rem; color: #eee; margin-bottom: 0.5rem;">${c.text}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.75rem; color: rgba(255,255,255,0.3);">Project: ${c.projectId}</span>
                    <button onclick="window.dbService.deleteComment('${c.id}').then(() => loadAdminComments())" 
                            style="background: rgba(255,75,75,0.2); border: 1px solid rgba(255,75,75,0.5); color: #ff4b4b; cursor: pointer; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.8rem;">
                        DELETE
                    </button>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error("Error loading admin comments", e);
        list.innerHTML = '<p style="color: red;">Error loading comments.</p>';
    }
}
