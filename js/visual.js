// --- v2 VISUAL LAYER ---
// Pure decoration: scroll reveals, role rotator, hero parallax, card tilt,
// scroll progress. No feature logic lives here — auth, comments, favourites
// and the contact form are all in their own files and untouched.
// Every effect is transform/opacity only and fully disabled under
// prefers-reduced-motion; pointer effects require a fine pointer (no touch).

(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;

    /* ---------- Scroll progress bar (scaleX, rAF-throttled) ---------- */
    var progress = document.getElementById('scrollProgress');
    if (progress) {
        var ticking = false;
        var updateProgress = function () {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
            progress.style.transform = 'scaleX(' + ratio + ')';
            ticking = false;
        };
        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(updateProgress);
            }
        }, { passive: true });
        updateProgress();
    }

    /* ---------- Scroll reveal (IntersectionObserver, once) ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Role rotator (cheap interval, pauses when hidden) ---------- */
    var roleWord = document.getElementById('roleWord');
    if (roleWord && !reduceMotion) {
        var phrases = [
            'run Axofy, my own live product',
            'build MacHub for my college',
            'study BCA at MAC Ramapuram',
            'take on freelance website projects'
        ];
        var idx = 0;
        var timer = null;
        var swap = function () {
            roleWord.classList.add('swap');
            setTimeout(function () {
                idx = (idx + 1) % phrases.length;
                roleWord.textContent = phrases[idx];
                roleWord.classList.remove('swap');
            }, 220);
        };
        var start = function () { if (!timer) timer = setInterval(swap, 2600); };
        var stop = function () { clearInterval(timer); timer = null; };
        start();
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) { stop(); } else { start(); }
        });
    }

    /* ---------- Hero pointer parallax (desktop, fine pointer only) ---------- */
    var orbs = document.querySelectorAll('.orb[data-depth]');
    if (orbs.length && finePointer && !reduceMotion) {
        var hero = document.querySelector('.hero-spacer');
        var rafPending = false;
        var lastX = 0, lastY = 0;
        var applyParallax = function () {
            orbs.forEach(function (orb) {
                var depth = parseFloat(orb.getAttribute('data-depth')) || 10;
                var x = (lastX - 0.5) * depth;
                var y = (lastY - 0.5) * depth;
                orb.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
            });
            rafPending = false;
        };
        if (hero) {
            hero.addEventListener('mousemove', function (e) {
                lastX = e.clientX / window.innerWidth;
                lastY = e.clientY / window.innerHeight;
                if (!rafPending) {
                    rafPending = true;
                    requestAnimationFrame(applyParallax);
                }
            }, { passive: true });
        }
    }

    /* ---------- Card tilt + glow follow (desktop, fine pointer only) ---------- */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('.tilt').forEach(function (card) {
            card.addEventListener('mouseenter', function () {
                // Reveal transition would make the tilt laggy — drop it once hovering.
                card.style.transition = 'box-shadow .35s ease';
            });
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var px = (e.clientX - rect.left) / rect.width;
                var py = (e.clientY - rect.top) / rect.height;
                card.style.setProperty('--mx', (px * 100) + '%');
                card.style.setProperty('--my', (py * 100) + '%');
                card.style.transform =
                    'perspective(900px) rotateX(' + ((0.5 - py) * 5) + 'deg)' +
                    ' rotateY(' + ((px - 0.5) * 5) + 'deg)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }
})();
