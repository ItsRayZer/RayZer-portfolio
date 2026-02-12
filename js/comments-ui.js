import { addComment, subscribeToComments, deleteComment } from './db-service.js';
import { getAuthenticatedUser } from './auth-ui.js';

let activeProjectUnsubscribe = null;

export function initCommentsUI() {
    console.log("💬 Comments UI initialized");
    setupProjectClickHandlers();
}

function setupProjectClickHandlers() {
    const projectRows = document.querySelectorAll('.project-row');

    projectRows.forEach(row => {
        // Add click listener to expand/collapse
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
            // Prevent triggering when clicking external links
            if (e.target.tagName === 'A') return;

            toggleCommentsSection(row);
        });
    });
}

function toggleCommentsSection(projectRow) {
    const nextSibling = projectRow.nextElementSibling;
    const isCommentsRow = nextSibling && nextSibling.classList.contains('comments-row');

    // Close any currently open comments
    document.querySelectorAll('.comments-row').forEach(row => row.remove());
    if (activeProjectUnsubscribe) {
        activeProjectUnsubscribe();
        activeProjectUnsubscribe = null;
    }

    // If we just clicked the one that was open, we are done (it toggled off)
    if (isCommentsRow) return;

    // Create new comments row
    const projectId = projectRow.cells[0].textContent.trim().replace(/\s+/g, '-').toLowerCase();
    const projectName = projectRow.cells[0].textContent.trim();

    const commentsRow = document.createElement('tr');
    commentsRow.className = 'comments-row';

    const commentsCell = document.createElement('td');
    commentsCell.colSpan = 4; // Span across all columns
    commentsCell.className = 'comments-cell';

    commentsCell.innerHTML = `
        <div class="comments-container">
            <h4 class="comments-title">Discussion: <span class="highlight-gold">${projectName}</span></h4>
            <div id="commentsList-${projectId}" class="comments-list">
                <div class="loading-comments">Loading comments...</div>
            </div>
            <div class="comment-form-container">
                <form id="commentForm-${projectId}" class="comment-form">
                    <input type="text" class="comment-input" placeholder="Join the discussion..." required>
                    <button type="submit" class="comment-submit">POST</button>
                </form>
            </div>
        </div>
    `;

    commentsRow.appendChild(commentsCell);
    projectRow.parentNode.insertBefore(commentsRow, projectRow.nextSibling);

    // Initialize comments for this project
    loadComments(projectId);
    setupCommentForm(projectId);

    // Animate open
    gsap.from(commentsCell, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.out' });
}

function loadComments(projectId) {
    const listContainer = document.getElementById(`commentsList-${projectId}`);

    // Subscribe to real-time updates
    activeProjectUnsubscribe = subscribeToComments(projectId, (comments) => {
        renderCommentsList(listContainer, comments);
    });
}

function renderCommentsList(container, comments) {
    if (comments.length === 0) {
        container.innerHTML = '<p class="no-comments">No comments yet. Be the first to start the discussion!</p>';
        return;
    }

    const currentUser = getAuthenticatedUser();

    container.innerHTML = comments.map(comment => {
        const isAuthor = currentUser && currentUser.uid === comment.userId;
        const isAdmin = currentUser && currentUser.isAdmin;
        const canDelete = isAuthor || isAdmin;

        const date = comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : 'Just now';

        return `
            <div class="comment-item">
                <img src="${comment.userPhoto || 'https://via.placeholder.com/40'}" class="comment-avatar" alt="${comment.userName}">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.userName}</span>
                        <span class="comment-date">${date}</span>
                        ${canDelete ? `<button class="delete-comment-btn" onclick="window.handleDeleteComment('${comment.id}')">×</button>` : ''}
                    </div>
                    <p class="comment-text">${comment.text}</p>
                </div>
            </div>
        `;
    }).join('');
}

function setupCommentForm(projectId) {
    const form = document.getElementById(`commentForm-${projectId}`);
    const input = form.querySelector('.comment-input');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = getAuthenticatedUser();
        if (!user) {
            alert('Please sign in to post a comment.');
            return;
        }

        const text = input.value.trim();
        if (!text) return;

        input.disabled = true;
        try {
            await addComment(projectId, text, user);
            input.value = '';
        } catch (error) {
            alert('Failed to post comment. Please try again.');
        } finally {
            input.disabled = false;
            input.focus();
        }
    });
}

// Handle delete (exposed globally)
window.handleDeleteComment = async function (commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
        await deleteComment(commentId);
    } catch (error) {
        alert('Failed to delete comment.');
    }
};

// Expose init globally
window.initCommentsUICallback = initCommentsUI;
