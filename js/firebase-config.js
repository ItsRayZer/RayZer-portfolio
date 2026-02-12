// Firebase Configuration
// DO NOT COMMIT THIS FILE TO PUBLIC REPOS (add to .gitignore)

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCufXVIlhrdy07_qe6QZeKx8Hiwjw2culI",
    authDomain: "rayzer-portfolio.firebaseapp.com",
    projectId: "rayzer-portfolio",
    storageBucket: "rayzer-portfolio.firebasestorage.app",
    messagingSenderId: "613212187039",
    appId: "1:613212187039:web:ef7eea7d0fb6ac5aa235aa",
    measurementId: "G-0NXGLVVWTW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Admin email - only this email will have admin privileges
export const ADMIN_EMAIL = 'mrabensojan@gmail.com';
