import { toggleFavorite, checkFavoriteStatus, getUserFavorites } from './db-service.js';
import { getAuthenticatedUser } from './auth-ui.js';

/**
 * Initialize Favorites UI
 * Sets up global handlers and listeners
 */
export function initFavoritesUI() {
    console.log("❤️ Favorites UI initialized");

    // Listen for auth state changes to update button states
    document.addEventListener('authStateChanged', async (event) => {
        const user = event.detail;
        if (user) {
            await updateAllFavoriteButtons(user.uid);
        } else {
            resetAllFavoriteButtons();
        }
    });
}

/**
 * Check and update all heart buttons based on user data
 */
async function updateAllFavoriteButtons(userId) {
    const buttons = document.querySelectorAll('.fav-btn');
    if (!buttons.length) return;

    try {
        // Get all favorites at once for efficiency (read optim)
        const favorites = await getUserFavorites(userId);
        const favIds = new Set(favorites.map(f => f.projectId)); // assuming id is set to projectId in db-service logic or we check doc id

        buttons.forEach(btn => {
            // We need to parse the onclick to get the ID, or better, add data-id to the button
            // The button is inside a tr with data-id, let's use that
            const row = btn.closest('tr');
            const projectId = row ? row.getAttribute('data-id') : null;

            if (projectId && favIds.has(projectId)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    } catch (error) {
        console.error("Error refreshing favorites:", error);
    }
}

function resetAllFavoriteButtons() {
    document.querySelectorAll('.fav-btn').forEach(btn => btn.classList.remove('active'));
}

/**
 * Global handler for clicking the favorite button
 * Exposed as window.handleFavoriteClick
 */
window.handleFavoriteClick = async function (event, projectId, name, role, tech, year) {
    event.stopPropagation(); // Prevent opening comments row

    const user = getAuthenticatedUser();
    if (!user) {
        alert("Please sign in to save projects to your dashboard!");
        return;
    }

    const btn = event.currentTarget;

    // Optimistic UI update
    const isNowActive = !btn.classList.contains('active');
    if (isNowActive) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }

    try {
        const projectData = { name, role, tech, year };
        await toggleFavorite(projectId, projectData, user);
    } catch (error) {
        console.error("Failed to toggle favorite:", error);
        // Revert on error
        if (isNowActive) {
            btn.classList.remove('active');
        } else {
            btn.classList.add('active');
        }
        alert("Failed to save favorite. Please try again.");
    }
};
