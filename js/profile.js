/**
 * Smart AI Inventory Management System - User Profile Controller
 * Handles reading and updating user profile settings in LocalStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    initProfileFormSubmission();
});

function loadUserProfile() {
    const user = window.storage.getUser();
    if (!user) return;

    const elName = document.getElementById('prof-name');
    const elEmail = document.getElementById('prof-email');
    const elPhone = document.getElementById('prof-phone');
    const elRole = document.getElementById('prof-role');
    const elAvatar = document.getElementById('prof-avatar-url');

    if (elName) elName.value = user.name || '';
    if (elEmail) elEmail.value = user.email || '';
    if (elPhone) elPhone.value = user.phone || '';
    if (elRole) elRole.value = user.role || 'Senior Inventory Manager';
    if (elAvatar) elAvatar.value = user.avatar || '';

    // Update avatar preview card
    const elImg = document.getElementById('prof-preview-img');
    const elHeaderName = document.getElementById('prof-preview-name');
    const elHeaderRole = document.getElementById('prof-preview-role');

    if (elImg && user.avatar) elImg.src = user.avatar;
    if (elHeaderName) elHeaderName.textContent = user.name;
    if (elHeaderRole) elHeaderRole.textContent = user.role;
}

function initProfileFormSubmission() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = window.storage.getUser() || {};

        user.name = document.getElementById('prof-name').value.trim();
        user.email = document.getElementById('prof-email').value.trim();
        user.phone = document.getElementById('prof-phone').value.trim();
        user.role = document.getElementById('prof-role').value.trim();
        user.avatar = document.getElementById('prof-avatar-url').value.trim() || user.avatar;

        const newPwd = document.getElementById('prof-new-password').value;
        if (newPwd && newPwd.length >= 6) {
            user.password = newPwd;
        }

        window.storage.saveUser(user);
        window.showToast('Profile updated successfully!', 'success', 'Settings Saved');
        loadUserProfile();
    });
}
