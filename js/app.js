/**
 * Smart AI Inventory Management System - Global Application Logic
 * Controls dark/light theme, toast notifications, smooth scrolling, modal windows & animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme
    initTheme();

    // 2. Sticky Navbar & Back-to-Top Listener
    initScrollListeners();

    // 3. Mobile Nav Drawer Toggle
    initMobileNav();

    // 4. Animated Stats Counters
    initAnimatedCounters();

    // 5. Screenshot Tab Switcher
    initScreenshotTabs();

    // 6. Realtime Clock Listener
    initRealtimeClock();

    // 7. Contact Form Handler (if present)
    initContactForm();
});

/* ==========================================================================
   THEME TOGGLE SYSTEM
   ========================================================================== */
function initTheme() {
    const savedTheme = localStorage.getItem('smart_inv_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('smart_inv_theme', newTheme);
            updateThemeIcon(newTheme);
            showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info', 'Theme Changed');
        });
    });
}

function updateThemeIcon(theme) {
    const icons = document.querySelectorAll('.theme-toggle-btn i');
    icons.forEach(icon => {
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    });
}

/* ==========================================================================
   SCROLL LISTENERS & BACK TO TOP
   ========================================================================== */
function initScrollListeners() {
    const navbar = document.querySelector('.navbar');
    const backToTopBtn = document.querySelector('.back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            if (navbar) navbar.classList.add('scrolled');
            if (backToTopBtn) backToTopBtn.classList.add('show');
        } else {
            if (navbar) navbar.classList.remove('scrolled');
            if (backToTopBtn) backToTopBtn.classList.remove('show');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ==========================================================================
   MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.className = navMenu.classList.contains('active') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
        });
    }
}

/* ==========================================================================
   ANIMATED STATS COUNTERS ON SCROLL
   ========================================================================== */
function initAnimatedCounters() {
    const counterElements = document.querySelectorAll('.counter-val');
    if (!counterElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const targetVal = parseInt(el.getAttribute('data-target'), 10) || 0;
                const prefix = el.getAttribute('data-prefix') || '';
                const suffix = el.getAttribute('data-suffix') || '';
                let currentVal = 0;
                const increment = Math.ceil(targetVal / 50);

                const timer = setInterval(() => {
                    currentVal += increment;
                    if (currentVal >= targetVal) {
                        currentVal = targetVal;
                        clearInterval(timer);
                    }
                    el.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;
                }, 30);

                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counterElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   SCREENSHOT TABS SWITCHER
   ========================================================================== */
function initScreenshotTabs() {
    const tabBtns = document.querySelectorAll('.screenshot-tabs .tab-btn');
    const panels = document.querySelectorAll('.tab-content-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const activePanel = document.getElementById(`tab-${targetTab}`);
            if (activePanel) activePanel.classList.add('active');
        });
    });
}

/* ==========================================================================
   REALTIME CLOCK
   ========================================================================== */
function initRealtimeClock() {
    const clockEl = document.getElementById('live-datetime');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        clockEl.textContent = now.toLocaleDateString('en-US', options);
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */
window.showToast = function (message, type = 'info', title = '') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'danger') iconClass = 'fa-triangle-exclamation';
    if (type === 'warning') iconClass = 'fa-bell';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-desc">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

/* ==========================================================================
   MODAL CONTROLLER
   ========================================================================== */
window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
};

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
};

/* ==========================================================================
   CONTACT FORM VALIDATION & SUBMISSION
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (!name || !email || !message) {
            showToast('Please fill out all required contact fields.', 'danger', 'Validation Error');
            return;
        }

        showToast('Thank you for contacting us! Our AI specialists will reply shortly.', 'success', 'Message Sent');
        contactForm.reset();
    });
}
