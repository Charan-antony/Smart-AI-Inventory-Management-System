/**
 * Smart AI Inventory Management System - Supplier Controller
 * Handles Supplier CRUD operations, directory list rendering, and modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    renderSupplierList();
    initSupplierSearch();
    initSupplierFormSubmission();
});

let editingSupplierId = null;

/* ==========================================================================
   RENDER SUPPLIER LIST
   ========================================================================== */
function renderSupplierList(searchTerm = '') {
    const container = document.getElementById('suppliers-list');
    if (!container) return;

    let suppliers = window.storage.getSuppliers();
    const products = window.storage.getProducts();

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        suppliers = suppliers.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.company.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term) ||
            s.phone.includes(term)
        );
    }

    if (suppliers.length === 0) {
        container.innerHTML = `
            <div style="grid-column: span 2; text-align:center; padding:3rem; color:var(--text-muted);">
                <i class="fa-solid fa-truck-field fa-3x" style="margin-bottom:1rem; opacity:0.5;"></i>
                <h4>No suppliers found</h4>
            </div>
        `;
        return;
    }

    container.innerHTML = suppliers.map(s => {
        const suppliedProds = products.filter(p => p.supplier === s.name);
        
        return `
            <div class="glass-card" style="padding:1.8rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
                        <div style="width:46px; height:46px; border-radius:var(--radius-md); background:rgba(245,158,11,0.15); color:var(--accent-amber); display:flex; align-items:center; justify-content:center; font-size:1.3rem;">
                            <i class="fa-solid fa-truck-ramp-box"></i>
                        </div>
                        <span class="badge-ai" style="font-size:0.78rem;">${suppliedProds.length} Products</span>
                    </div>
                    
                    <h3 style="font-size:1.25rem; margin-bottom:0.2rem;">${s.name}</h3>
                    <p style="color:var(--text-muted); font-size:0.88rem; font-weight:600; margin-bottom:1.2rem;">${s.company}</p>

                    <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.88rem; color:var(--text-muted);">
                        <div><i class="fa-solid fa-phone" style="width:20px; color:var(--primary);"></i> ${s.phone}</div>
                        <div><i class="fa-solid fa-envelope" style="width:20px; color:var(--accent-cyan);"></i> ${s.email}</div>
                        <div><i class="fa-solid fa-location-dot" style="width:20px; color:var(--accent-rose);"></i> ${s.address}</div>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                    <span style="font-size:0.78rem; color:var(--text-dim);">Supplier ID: ${s.id}</span>
                    <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-icon btn-sm" onclick="openEditSupplierModal('${s.id}')" title="Edit Supplier">
                            <i class="fa-solid fa-pen" style="color:var(--primary);"></i>
                        </button>
                        <button class="btn btn-icon btn-sm" onclick="confirmDeleteSupplier('${s.id}', '${s.name}')" title="Delete Supplier">
                            <i class="fa-solid fa-trash" style="color:var(--accent-rose);"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function initSupplierSearch() {
    const input = document.getElementById('supplier-search-input');
    if (input) {
        input.addEventListener('input', () => {
            renderSupplierList(input.value);
        });
    }
}

/* ==========================================================================
   MODALS & CRUD
   ========================================================================== */
window.openAddSupplierModal = function () {
    editingSupplierId = null;
    document.getElementById('supplier-modal-title').innerHTML = `<i class="fa-solid fa-truck-field" style="color:var(--primary);"></i> Add Supplier`;
    document.getElementById('supplier-form').reset();
    document.getElementById('sup-id').value = 'SUP-' + Math.floor(100 + Math.random() * 900);
    window.openModal('supplier-modal');
};

window.openEditSupplierModal = function (id) {
    editingSupplierId = id;
    const suppliers = window.storage.getSuppliers();
    const s = suppliers.find(sup => sup.id === id);
    if (!s) return;

    document.getElementById('supplier-modal-title').innerHTML = `<i class="fa-solid fa-pen" style="color:var(--primary);"></i> Edit Supplier: ${s.id}`;
    document.getElementById('sup-id').value = s.id;
    document.getElementById('sup-name').value = s.name;
    document.getElementById('sup-company').value = s.company;
    document.getElementById('sup-phone').value = s.phone;
    document.getElementById('sup-email').value = s.email;
    document.getElementById('sup-address').value = s.address;

    window.openModal('supplier-modal');
};

window.confirmDeleteSupplier = function (id, name) {
    if (confirm(`Are you sure you want to delete supplier "${name}"?`)) {
        window.storage.deleteSupplier(id);
        window.showToast(`Supplier "${name}" deleted.`, 'success', 'Supplier Removed');
        renderSupplierList();
    }
};

function initSupplierFormSubmission() {
    const form = document.getElementById('supplier-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('sup-id').value.trim();
        const name = document.getElementById('sup-name').value.trim();
        const company = document.getElementById('sup-company').value.trim();
        const phone = document.getElementById('sup-phone').value.trim();
        const email = document.getElementById('sup-email').value.trim();
        const address = document.getElementById('sup-address').value.trim();

        const supplierObj = { id, name, company, phone, email, address };
        window.storage.saveSupplier(supplierObj);

        window.showToast(`Supplier "${name}" saved successfully!`, 'success');
        window.closeModal('supplier-modal');
        renderSupplierList();
    });
}
