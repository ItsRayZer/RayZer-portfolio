import { db } from './firebase-config.js';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    where,
    orderBy,
    deleteDoc,
    getDocs,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Create or update user profile in Firestore
 * @param {Object} user - User object from Auth
 */
export async function createUserProfile(user) {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // New user - create profile
            await setDoc(userRef, {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                role: user.isAdmin ? 'admin' : 'user'
            });
            console.log("👤 User profile created in Firestore");
        } else {
            // Existing user - update last login
            await setDoc(userRef, {
                lastLogin: serverTimestamp()
            }, { merge: true });
            console.log("👤 User profile updated");
        }
    } catch (error) {
        console.error("❌ Error creating user profile:", error);
    }
}

/**
 * Add a comment to a project
 * @param {string} projectId - ID of the project
 * @param {string} text - Comment text
 * @param {Object} user - User object
 */
export async function addComment(projectId, text, user) {
    if (!user || !text.trim()) return;

    try {
        await addDoc(collection(db, "comments"), {
            projectId: projectId,
            text: text,
            userId: user.uid,
            userName: user.displayName,
            userPhoto: user.photoURL,
            createdAt: serverTimestamp()
        });
        console.log("💬 Comment added successfully");
    } catch (error) {
        console.error("❌ Error adding comment:", error);
        throw error;
    }
}

/**
 * Subscribe to comments for a project
 * @param {string} projectId - Project ID
 * @param {function} callback - Function to receive comments array
 * @returns {function} - Unsubscribe function
 */
export function subscribeToComments(projectId, callback) {
    const q = query(
        collection(db, "comments"),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const comments = [];
        snapshot.forEach((doc) => {
            comments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(comments);
    }, (error) => {
        console.error("❌ Error fetching comments:", error);
    });
}

/**
 * Delete a comment
 * @param {string} commentId 
 */
export async function deleteComment(commentId) {
    try {
        await deleteDoc(doc(db, "comments", commentId));
        console.log("🗑️ Comment deleted");
    } catch (error) {
        console.error("❌ Error deleting comment:", error);
        throw error;
    }
}

/**
 * Get recent comments (for Admin)
 * @param {number} limitCount - Number of comments to fetch
 * @returns {Promise<Array>}
 */
export async function getRecentComments(limitCount = 10) {
    try {
        const q = query(
            collection(db, "comments"),
            orderBy("createdAt", "desc"),
            // limit(limitCount) // limit is not imported, let's skip for now or import it
        );

        // Dynamic import to avoid changing top imports if possible, or just fetch all
        // For simplicity in this keyless env, we'll just fetch ordered list
        // and slice client side if needed, or better, add limit to imports.

        const snapshot = await getDocs(q); // getDocs needs import!
        const comments = [];
        snapshot.forEach((doc) => {
            comments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return comments.slice(0, limitCount);
    } catch (error) {
        console.error("❌ Error fetching recent comments:", error);
        return [];
    }
}

/**
 * Toggle a project as favorite for a user
 * @param {string} projectId 
 * @param {Object} projectData 
 * @param {Object} user 
 * @returns {Promise<boolean>} new favorite status (true = favorited, false = unfavorited)
 */
export async function toggleFavorite(projectId, projectData, user) {
    if (!user) return false;

    const favRef = doc(db, "users", user.uid, "favorites", projectId);

    try {
        const favSnap = await getDoc(favRef);

        if (favSnap.exists()) {
            // Already favorited - remove it
            await deleteDoc(favRef);
            console.log("💔 Removed from favorites");
            return false;
        } else {
            // Not favorited - add it
            await setDoc(favRef, {
                projectId: projectId,
                projectName: projectData.name,
                projectRole: projectData.role,
                projectTech: projectData.tech,
                projectYear: projectData.year,
                savedAt: serverTimestamp()
            });
            console.log("❤️ Added to favorites");
            return true;
        }
    } catch (error) {
        console.error("❌ Error toggling favorite:", error);
        throw error;
    }
}

/**
 * Check if a project is favorited by the user
 * @param {string} projectId 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
export async function checkFavoriteStatus(projectId, userId) {
    if (!userId) return false;

    try {
        const favRef = doc(db, "users", userId, "favorites", projectId);
        const favSnap = await getDoc(favRef);
        return favSnap.exists();
    } catch (error) {
        console.error("❌ Error checking favorite status:", error);
        return false;
    }
}

/**
 * Get all favorites for a user
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export async function getUserFavorites(userId) {
    if (!userId) return [];

    try {
        const q = query(
            collection(db, "users", userId, "favorites"),
            orderBy("savedAt", "desc")
        );

        const snapshot = await getDocs(q);
        const favorites = [];
        snapshot.forEach((doc) => {
            favorites.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return favorites;
    } catch (error) {
        console.error("❌ Error fetching favorites:", error);
        return [];
    }
}

/**
 * Submit a contact form message
 * @param {Object} contactData { name, email, message }
 * @returns {Promise<void>}
 */
export async function submitContactMessage(contactData) {
    console.log("📨 Attempting to send message to Firestore...", contactData);

    // Create a timeout promise (10 seconds)
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please check your internet connection.")), 10000)
    );

    try {
        // Race the database write against the timeout
        const docRef = await Promise.race([
            addDoc(collection(db, "messages"), {
                name: contactData.name,
                email: contactData.email,
                message: contactData.message,
                createdAt: serverTimestamp(),
                read: false
            }),
            timeout
        ]);

        console.log("✅ Message sent successfully with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("❌ Error sending message:", error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}

/**
 * Get messages for Admin
 * @param {number} limitCount 
 * @returns {Promise<Array>}
 */
export async function getMessages(limitCount = 20) {
    try {
        const q = query(
            collection(db, "messages"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return messages.slice(0, limitCount);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        return [];
    }
}

/**
 * Mark a message as read
 * @param {string} messageId 
 */
export async function markMessageAsRead(messageId) {
    try {
        const msgRef = doc(db, "messages", messageId);
        await updateDoc(msgRef, {
            read: true
        });
    } catch (error) {
        console.error("❌ Error marking message read:", error);
    }
}

// Expose globally for non-module scripts
window.dbService = {
    createUserProfile,
    addComment,
    subscribeToComments,
    deleteComment,
    getRecentComments,
    toggleFavorite,
    checkFavoriteStatus,
    getUserFavorites,
    submitContactMessage,
    getMessages,
    markMessageAsRead
};
