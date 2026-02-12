// Dashboard Logic
import { onAuthChange } from './auth-service.js';
import { getUserFavorites, toggleFavorite } from './db-service.js';

let currentUser = null;

// Auth Guard
onAuthChange(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = user;
    renderUserInfo(user);
    loadFavorites(user.uid);
});

function renderUserInfo(user) {
    const welcome = document.getElementById('userWelcome');
    welcome.innerHTML = `
        <div class="welcome-name">${user.displayName}</div>
        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.4);">${user.email}</div>
    `;
}

async function loadFavorites(userId) {
    const grid = document.getElementById('favoritesList');

    try {
        const favorites = await getUserFavorites(userId);

        if (favorites.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💔</div>
                    <p style="color: rgba(255,255,255,0.5); font-family: 'Space Grotesk', sans-serif; margin-bottom: 1rem;">
                        You haven't saved any projects yet.
                    </p>
                    <a href="index.html#work" style="color: #d4af37; text-decoration: none; border-bottom: 1px solid #d4af37;">
                        Discover Projects
                    </a>
                </div>
            `;
            return;
        }

        grid.innerHTML = favorites.map(fav => `
            <div class="favorite-card">
                <button class="remove-fav-btn" onclick="window.removeFavorite('${fav.id}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <div class="fav-project-name">${fav.projectName}</div>
                <div class="fav-meta">
                    <span>${fav.projectRole}</span>
                    <span>${fav.projectYear}</span>
                </div>
                <div class="fav-tech">${fav.projectTech}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error loading favorites:", error);
        grid.innerHTML = '<p style="color: red; text-align: center;">Error loading favorites.</p>';
    }
}

// Global handler for removing favorite
window.removeFavorite = async function (projectId) {
    if (!currentUser) return;

    if (confirm('Remove from favorites?')) {
        // We pass empty project data because we are just removing
        await toggleFavorite(projectId, {}, currentUser);
        // Reload list
        loadFavorites(currentUser.uid);
    }
};
