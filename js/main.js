
// --- GSAP & THREE.JS SETUP (NO MODULES) ---
// We access global variables: THREE, gsap, ScrollTrigger

// Register optimized GSAP plugin
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
} else {
    console.error("GSAP not loaded!");
}

// --- THREE.JS BACKGROUND (PREMIUM STARFIELD EDITION) ---
const initBackground = () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- 1. REALISTIC STARS ---
    const createStarField = (count, size, range, color) => {
        const geometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * range;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const material = new THREE.PointsMaterial({
            size: size,
            color: color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        return new THREE.Points(geometry, material);
    };

    // Layer 1: Distant Background Stars (White/Mixed)
    const starsDistant = createStarField(2000, 0.05, 100, 0xffffff);
    scene.add(starsDistant);

    // Layer 2: Mid-Range Stars (Blue/Cyan - Tech Feel)
    const starsMid = createStarField(800, 0.08, 60, 0x44accf);
    scene.add(starsMid);

    // Layer 3: Close Bright Stars (Gold/Warm - Premium Feel)
    const starsClose = createStarField(100, 0.15, 30, 0xffffee);
    scene.add(starsClose);


    // Initial Camera
    camera.position.z = 5;
    camera.position.y = 0;

    // --- ANIMATION LOOP ---
    const bgState = { zoom: 5, rotate: 0 };

    // WARP EFFECT: Fly past the stars
    gsap.to(bgState, {
        zoom: -50, // Move camera negative Z to fly 'forward' past stars (assuming stars are distributed around 0)
        scrollTrigger: {
            trigger: ".hero-spacer",
            start: "top top",
            end: "bottom top",
            scrub: 1
        },
        ease: "none" // Linear movement for consistent speed
    });

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const animate = () => {
        requestAnimationFrame(animate);

        // Rotate star layers at different speeds for depth
        starsDistant.rotation.y += 0.0001;
        starsMid.rotation.y += 0.0002;
        starsClose.rotation.y += 0.0003;

        // Slight parallax tilt based on mouse
        const targetRotY = mouseX * 0.05;
        const targetRotX = mouseY * 0.05;

        scene.rotation.y += 0.05 * (targetRotY - scene.rotation.y);
        scene.rotation.x += 0.05 * (targetRotX - scene.rotation.x);

        // Camera Scroll Movement (The Warp)
        camera.position.z = bgState.zoom;

        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// --- GSAP ANIMATIONS ---
const initAnimations = () => {
    const logoContainer = document.querySelector('.rayzer-logo');
    const restOfWord = document.querySelector('.rest-of-word');
    const nav = document.querySelector('nav.fixed-nav');
    const heroLabel = document.querySelector('.hero-label');

    console.log("🎬 Initializing logo animations...");
    console.log("Logo container found:", logoContainer);
    console.log("Rest of word found:", restOfWord);
    console.log("Letters found:", document.querySelectorAll('.rest-of-word .letter').length);

    window.onbeforeunload = function () { window.scrollTo(0, 0); }

    const tlIntro = gsap.timeline();
    // Pre-set transforms for GSAP control
    gsap.set(logoContainer, { xPercent: -50, yPercent: -50, transformOrigin: "center center" });

    tlIntro.from(logoContainer, { yPercent: -30, opacity: 0, duration: 1.5, ease: "power4.out" });

    const tlScroll = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-spacer",
            start: "top top",
            end: "+=600",  // Reduced to minimize black space
            scrub: 1,
            pin: true,
            onEnter: () => console.log("📜 Scroll animation started!"),
            onUpdate: (self) => console.log("Scroll progress:", self.progress)
        }
    });

    const letters = document.querySelectorAll('.rest-of-word .letter');

    // 1. Expand Logo
    console.log("✨ Setting up logo expansion animation...");
    // Reveal the container from display: none first
    tlScroll.set('.rest-of-word', { display: 'inline-flex' });
    tlScroll.to('.rest-of-word', { maxWidth: "2500px", opacity: 1, duration: 1.5, ease: "power2.out" });
    tlScroll.to(letters, { x: 0, opacity: 1, duration: 1.5, stagger: 0.1, ease: "power2.out" }, "<");

    // 2. Zoom In & Fade Out (No Move to Header)
    console.log("✨ Updated animation: Zoom & Fade");

    // Reset any transforms or opacity just in case
    gsap.set(logoContainer, { pointerEvents: "auto", opacity: 1 });

    tlScroll.to(logoContainer, {
        scale: 20,          // Restored massive zoom for dramatic effect
        opacity: 0,         // Fade out
        pointerEvents: "none", // Prevent clicking when hidden
        duration: 3,
        ease: "power2.inOut",
        onStart: () => {
            // Ensure it's visible when starting animation
            gsap.set(logoContainer, { pointerEvents: "auto", opacity: 1 });
        },
        onReverseComplete: () => {
            gsap.set(logoContainer, { pointerEvents: "auto", opacity: 1, scale: 1 }); // Hard reset on reverse
        }
    }, ">");

    // 3. Reveal UI (Navigation Bar)
    tlScroll.to(nav, { opacity: 1, duration: 0.5 }, "-=1.0"); // Start fading in nav earlier

    // Reveal hero label
    if (heroLabel) {
        tlScroll.to(heroLabel, { opacity: 1, y: 0, duration: 1 }, "-=1");
    }

    console.log("✅ Logo animation setup complete!");
};

// --- 4. CONTENT ANIMATIONS (NEW) ---
const initContentAnimations = () => {

    // A. About Section: Terminal Reveal
    gsap.from(".terminal-loader", {
        scrollTrigger: {
            trigger: "#about",
            start: "top 70%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    });

    // B. Skills: Cards Stagger
    gsap.from(".adventure-card-container", {
        scrollTrigger: {
            trigger: "#skills",
            start: "top 75%",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)"
    });

    // C. Work: Project Rows Slide In
    const projects = document.querySelectorAll('.project-row');
    projects.forEach((proj, i) => {
        const isReverse = proj.classList.contains('reverse');
        gsap.from(proj, {
            scrollTrigger: {
                trigger: proj,
                start: "top 80%",
            },
            x: isReverse ? 100 : -100,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    });

    // D. Footer: Giant Text Reveal
    gsap.from(".huge-text", {
        scrollTrigger: {
            trigger: "#contact",
            start: "top 70%"
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    });
};

// --- 5. NEW SECTIONS ANIMATIONS ---
const initNewSectionAnimations = () => {
    // A. Stats Counter Animation
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateCounter = (element, target) => {
        const duration = 2000; // 2 seconds
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + (element.textContent.includes('%') ? '%' : '+');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + (element.textContent.includes('%') ? '%' : '+');
            }
        }, 16);
    };

    statNumbers.forEach(stat => {
        gsap.from(stat, {
            scrollTrigger: {
                trigger: stat,
                start: "top 80%",
                onEnter: () => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    animateCounter(stat, target);
                }
            }
        });
    });

    // B. Double Banner for continuous scroll
    const bannerContent = document.querySelector('.banner-content');
    if (bannerContent) {
        const bannerText = bannerContent.innerHTML;
        bannerContent.innerHTML = bannerText + bannerText; // Double the content
    }

    // C. Scroll animations for new sections
    // Digital Reality Architect - Smooth reveal from nothing
    gsap.from(".giant-title .word", {
        scrollTrigger: {
            trigger: ".reality-architect-section",
            start: "top 75%",
        },
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out"
    });

    // Architect tagline fade in
    gsap.from(".architect-tagline", {
        scrollTrigger: {
            trigger: ".reality-architect-section",
            start: "top 75%",
        },
        y: 50,
        opacity: 0,
        duration: 1.5,
        delay: 0.6,
        ease: "power3.out"
    });

    gsap.from(".architect-tagline", {
        scrollTrigger: {
            trigger: ".reality-architect-section",
            start: "top 70%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power2.out"
    });

    // D. Arsenal Cards
    gsap.from(".arsenal-card", {
        scrollTrigger: {
            trigger: ".arsenal-section",
            start: "top 75%",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)"
    });

    // E. Ship Cards
    gsap.from(".ship-card", {
        scrollTrigger: {
            trigger: ".deployed-ships-section",
            start: "top 75%",
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.7)"
    });

    // F. Protocol Cards
    gsap.from(".protocol-card", {
        scrollTrigger: {
            trigger: ".protocols-section",
            start: "top 75%",
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
    });

    // G. Contact Form
    gsap.from(".contact-form .form-group", {
        scrollTrigger: {
            trigger: ".contact-section",
            start: "top 70%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
    });
};

// --- 6. FORM HANDLER (Google Forms Integration) ---
function initFormHandler() {
    const form = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccessMessage');
    const iframe = document.getElementById('hidden_iframe');

    if (!form || !iframe) return;

    let isSubmitting = false;

    form.addEventListener('submit', (e) => {
        if (isSubmitting) {
            e.preventDefault();
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        isSubmitting = true;

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Clear previous messages
        if (successMsg) successMsg.style.display = 'none';

        // Listen for iframe load (response received)
        const loadHandler = () => {
            // Google Forms doesn't allow cross-origin access to the iframe content,
            // so we assume success if the iframe loads after submission.
            if (successMsg) {
                successMsg.style.display = 'block';
                successMsg.textContent = 'Message sent successfully! I will be in touch soon.';
            }

            form.reset();

            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            isSubmitting = false;

            console.log('✅ Form submitted to Google Forms');

            // Remove listener to prevent future triggers
            iframe.removeEventListener('load', loadHandler);
        };

        iframe.addEventListener('load', loadHandler);
    });
}


/**
 * Initialize Comments UI
 */
function initComments() {
    // Wait for comments-ui.js module
    const attemptInit = () => {
        if (window.initCommentsUICallback) {
            window.initCommentsUICallback();
        } else {
            setTimeout(attemptInit, 50);
        }
    };
    attemptInit();
}

/**
 * Initialize Favorites UI
 */
function initFavorites() {
    import('./favorites-ui.js').then(module => {
        module.initFavoritesUI();
    }).catch(err => console.error("Failed to load favorites UI", err));
}

/**
 * Initialize Authentication
 */
function initAuth() {
    // Wait for auth-ui.js module to load and expose global callback
    const attemptInit = () => {
        if (window.initAuthUICallback) {
            // Call the global callback exposed by auth-ui.js
            window.initAuthUICallback();

            // Listen for auth state changes to auto-fill contact form
            document.addEventListener('authStateChanged', (event) => {
                const user = event.detail;
                handleContactFormAutoFill(user);

                // Create/Update User Profile in Firestore
                if (user && window.dbService) {
                    window.dbService.createUserProfile(user);
                }
            });

            console.log('🔐 Authentication initialized');
        } else {
            // Module not loaded yet, wait and retry
            setTimeout(attemptInit, 50);
        }
    };

    attemptInit();
}

/**
 * Auto-fill contact form when user is authenticated
 * @param {Object|null} user - Authenticated user object or null
 */
function handleContactFormAutoFill(user) {
    const nameInput = document.querySelector('input[name="entry.731845534"]');
    const emailInput = document.querySelector('input[name="entry.536258546"]');

    if (!nameInput || !emailInput) return;

    if (user) {
        // User signed in - auto-fill
        nameInput.value = user.displayName || '';
        emailInput.value = user.email || '';

        // Add visual indicator that form is pre-filled
        nameInput.style.borderColor = 'rgba(212, 175, 55, 0.5)';
        emailInput.style.borderColor = 'rgba(212, 175, 55, 0.5)';

        console.log('✅ Contact form auto-filled for:', user.email);
    } else {
        // User signed out - clear form
        nameInput.value = '';
        emailInput.value = '';
        nameInput.style.borderColor = '';
        emailInput.style.borderColor = '';

        console.log('🔄 Contact form cleared');
    }
}

// Main initialization on page load
document.addEventListener("DOMContentLoaded", function () {
    // Generate Floating Dots Grid
    const dotsContainer = document.getElementById('dotsBackground');
    const dotCount = 100;

    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';

        // Random size variation
        const rand = Math.random();
        if (rand > 0.7) {
            dot.classList.add('large');
        } else if (rand < 0.3) {
            dot.classList.add('small');
        }

        // Random position
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';

        // Random animation delay
        dot.style.animationDelay = Math.random() * -20 + 's';

        dotsContainer.appendChild(dot);
    }

    // === GSAP & Three.js Animations ===
    initBackground();
    initAnimations();
    initContentAnimations();
    initNewSectionAnimations();
    initFormHandler();
    initComments(); // Initialize Comments System
    initFavorites(); // Initialize Favorites System

    // === Initialize Authentication ===
    initAuth();

    console.log("RayZer Portfolio: Full System Loaded");
});
