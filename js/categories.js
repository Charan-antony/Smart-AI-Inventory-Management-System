/**
 * Smart AI Inventory Management System - Category Controller
 * Handles Category CRUD operations, icon selection, and product count updates.
 */

document.addEventListener('DOMContentLoaded', () => {
    renderCategoryGrid();
    initCategorySearch();
    initCategoryFormSubmission();
});

let editingCategoryId = null;

/* ==========================================================================
   RENDER CATEGORIES GRID & TABLE
   ========================================================================== */
function renderCategoryGrid(searchTerm = '') {
    const gridContainer = document.getElementById('categories-grid');
    if (!gridContainer) return;

    let categories = window.storage.getCategories();
    const products = window.storage.getProducts();

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        categories = categories.filter(c => c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term));
    }

    if (categories.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: span 3; text-align:center; padding:3rem; color:var(--text-muted);">
                <i class="fa-solid fa-layer-group fa-3x" style="margin-bottom:1rem; opacity:0.5;"></i>
                <h4>No categories found</h4>
            </div>
        `;
        return;
    }

    gridContainer.innerHTML = categories.map(c => {
        // Calculate product count live
        const prodCount = products.filter(p => p.category === c.name).length;
        const iconClass = c.icon || 'fa-boxes-stacked';

        return `
            <div class="glass-card" style="padding:1.8rem; position:relative; overflow:hidden;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.2rem;">
                    <div style="width:50px; height:50px; border-radius:var(--radius-md); background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <span class="badge-ai">${prodCount} Products</span>
                </div>
                <h3 style="font-size:1.25rem; margin-bottom:0.4rem;">${c.name}</h3>
                <p style="color:var(--text-muted); font-size:0.88rem; margin-bottom:1.5rem; min-height:42px;">${c.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--border-color);">
                    <span style="font-size:0.78rem; color:var(--text-dim);">ID: ${c.id}</span>
                    <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-icon btn-sm" onclick="openEditCategoryModal('${c.id}')" title="Edit Category">
                            <i class="fa-solid fa-pen" style="color:var(--primary);"></i>
                        </button>
                        <button class="btn btn-icon btn-sm" onclick="confirmDeleteCategory('${c.id}', '${c.name}')" title="Delete Category">
                            <i class="fa-solid fa-trash" style="color:var(--accent-rose);"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function initCategorySearch() {
    const searchInput = document.getElementById('category-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderCategoryGrid(searchInput.value);
        });
    }
}

/* ==========================================================================
   MODALS & CRUD
   ========================================================================== */
window.openAddCategoryModal = function () {
    editingCategoryId = null;
    document.getElementById('category-modal-title').innerHTML = `<i class="fa-solid fa-layer-group" style="color:var(--primary);"></i> Add Category`;
    document.getElementById('category-form').reset();
    document.getElementById('cat-id').value = 'CAT-' + Math.floor(10 + Math.random() * 90);
    window.openModal('category-modal');
};

window.openEditCategoryModal = function (id) {
    editingCategoryId = id;
    const categories = window.storage.getCategories();
    const category = categories.find(c => c.id === id);
    if (!category) return;

    document.getElementById('category-modal-title').innerHTML = `<i class="fa-solid fa-pen" style="color:var(--primary);"></i> Edit Category: ${category.id}`;
    document.getElementById('cat-id').value = category.id;
    document.getElementById('cat-name').value = category.name;
    document.getElementById('cat-desc').value = category.description;
    document.getElementById('cat-icon').value = category.icon || 'fa-layer-group';

    window.openModal('category-modal');
};

window.confirmDeleteCategory = function (id, name) {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
        window.storage.deleteCategory(id);
        window.showToast(`Category "${name}" removed.`, 'success', 'Category Deleted');
        renderCategoryGrid();
    }
};

function initCategoryFormSubmission() {
    const form = document.getElementById('category-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('cat-id').value.trim();
        const name = document.getElementById('cat-name').value.trim();
        const description = document.getElementById('cat-desc').value.trim();
        const icon = document.getElementById('cat-icon').value.trim() || 'fa-layer-group';

        const categoryObj = { id, name, description, icon };
        window.storage.saveCategory(categoryObj);
        window.showToast(`Category "${name}" saved successfully!`, 'success');
        window.closeModal('category-modal');
        renderCategoryGrid();
    });
}
