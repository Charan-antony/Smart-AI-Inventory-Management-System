/**
 * Smart AI Inventory Management System - Product Controller
 * Handles Product CRUD operations, table rendering, search, category filtering & modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Load of Products
    renderProductTable();

    // 2. Populate Dropdowns (Categories & Suppliers) in Form
    populateProductFormOptions();

    // 3. Search and Category Filter Event Listeners
    initProductFilters();

    // 4. Form Submission Listener (Add/Edit)
    initProductFormSubmission();
});

let editingProductId = null;

/* ==========================================================================
   RENDER PRODUCT DATA TABLE
   ========================================================================== */
function renderProductTable(searchTerm = '', categoryFilter = '') {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;

    let products = window.storage.getProducts();

    // Apply URL Query Parameter Search if available
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && !searchTerm) {
        searchTerm = searchParam;
        const searchInput = document.getElementById('product-search-input');
        if (searchInput) searchInput.value = searchParam;
    }

    // Apply Filter Logic
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        products = products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.id.toLowerCase().includes(term) ||
            p.barcode.includes(term) ||
            p.category.toLowerCase().includes(term) ||
            p.supplier.toLowerCase().includes(term)
        );
    }

    if (categoryFilter) {
        products = products.filter(p => p.category === categoryFilter);
    }

    // Check Empty State
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
                    <i class="fa-solid fa-box-open fa-3x" style="margin-bottom:1rem; opacity:0.5;"></i>
                    <h4>No products found</h4>
                    <p style="font-size:0.88rem;">Try adjusting your search criteria or add a new product.</p>
                </td>
            </tr>
        `;
        return;
    }

    // Build Table Rows
    tableBody.innerHTML = products.map(p => {
        let statusBadge = `<span class="status-pill status-in-stock"><i class="fa-solid fa-check"></i> In Stock</span>`;
        if (Number(p.quantity) === 0) {
            statusBadge = `<span class="status-pill status-out-stock"><i class="fa-solid fa-xmark"></i> Out of Stock</span>`;
        } else if (Number(p.quantity) <= Number(p.minQuantity)) {
            statusBadge = `<span class="status-pill status-low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>`;
        }

        const fallbackImg = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80';
        const imgUrl = p.image || fallbackImg;

        return `
            <tr>
                <td><strong>${p.id}</strong></td>
                <td>
                    <div class="product-cell">
                        <img src="${imgUrl}" alt="${p.name}" onerror="this.src='${fallbackImg}'">
                        <div class="product-info">
                            <h5>${p.name}</h5>
                            <span>UPC: ${p.barcode}</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge-ai" style="font-size:0.75rem;">${p.category}</span></td>
                <td>${p.supplier}</td>
                <td>$${Number(p.purchasePrice).toFixed(2)}</td>
                <td><strong>$${Number(p.sellingPrice).toFixed(2)}</strong></td>
                <td><strong>${p.quantity}</strong> ${p.unit}</td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-icon btn-sm" onclick="viewProductDetails('${p.id}')" title="View Details">
                            <i class="fa-solid fa-eye" style="color:var(--accent-cyan);"></i>
                        </button>
                        <button class="btn btn-icon btn-sm" onclick="openEditProductModal('${p.id}')" title="Edit Product">
                            <i class="fa-solid fa-pen" style="color:var(--primary);"></i>
                        </button>
                        <button class="btn btn-icon btn-sm" onclick="confirmDeleteProduct('${p.id}')" title="Delete Product">
                            <i class="fa-solid fa-trash" style="color:var(--accent-rose);"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/* ==========================================================================
   POPULATE DROPDOWNS IN PRODUCT FORM
   ========================================================================== */
function populateProductFormOptions() {
    const catSelect = document.getElementById('prod-category');
    const filterCatSelect = document.getElementById('product-category-filter');
    const supSelect = document.getElementById('prod-supplier');

    const categories = window.storage.getCategories();
    const suppliers = window.storage.getSuppliers();

    if (catSelect) {
        catSelect.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }

    if (filterCatSelect) {
        filterCatSelect.innerHTML = `<option value="">All Categories</option>` +
            categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }

    if (supSelect) {
        supSelect.innerHTML = suppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }
}

/* ==========================================================================
   FILTERS
   ========================================================================== */
function initProductFilters() {
    const searchInput = document.getElementById('product-search-input');
    const categorySelect = document.getElementById('product-category-filter');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderProductTable(searchInput.value, categorySelect ? categorySelect.value : '');
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            renderProductTable(searchInput ? searchInput.value : '', categorySelect.value);
        });
    }
}

/* ==========================================================================
   OPEN MODALS (ADD / EDIT / VIEW / DELETE)
   ========================================================================== */
window.openAddProductModal = function () {
    editingProductId = null;
    document.getElementById('product-modal-title').innerHTML = `<i class="fa-solid fa-box-archive" style="color:var(--primary);"></i> Add New Product`;
    document.getElementById('product-form').reset();
    
    // Auto generate ID
    document.getElementById('prod-id').value = 'PRD-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('prod-barcode').value = '890' + Math.floor(1000000000 + Math.random() * 9000000000);
    
    window.openModal('product-form-modal');
};

window.openEditProductModal = function (id) {
    editingProductId = id;
    const products = window.storage.getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('product-modal-title').innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:var(--primary);"></i> Edit Product: ${product.id}`;
    
    document.getElementById('prod-id').value = product.id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-barcode').value = product.barcode;
    document.getElementById('prod-category').value = product.category;
    document.getElementById('prod-supplier').value = product.supplier;
    document.getElementById('prod-purchase-price').value = product.purchasePrice;
    document.getElementById('prod-selling-price').value = product.sellingPrice;
    document.getElementById('prod-quantity').value = product.quantity;
    document.getElementById('prod-min-quantity').value = product.minQuantity || 10;
    document.getElementById('prod-unit').value = product.unit;
    document.getElementById('prod-expiry').value = product.expiryDate || '';
    document.getElementById('prod-image').value = product.image || '';
    document.getElementById('prod-desc').value = product.description || '';

    window.openModal('product-form-modal');
};

window.viewProductDetails = function (id) {
    const products = window.storage.getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    const modalBody = document.getElementById('view-product-modal-body');
    const fallbackImg = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80';

    modalBody.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1.5fr; gap:1.5rem; align-items:center;">
            <img src="${product.image || fallbackImg}" alt="${product.name}" style="border-radius:var(--radius-md); border:1px solid var(--border-color); width:100%; height:200px; object-fit:cover;">
            <div>
                <span class="badge-ai">${product.category}</span>
                <h3 style="font-size:1.4rem; margin:0.5rem 0;">${product.name}</h3>
                <p style="color:var(--text-muted); font-size:0.88rem; margin-bottom:1rem;">${product.description || 'No detailed description available.'}</p>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.85rem;">
                    <div><strong>Product ID:</strong> ${product.id}</div>
                    <div><strong>Barcode:</strong> ${product.barcode}</div>
                    <div><strong>Purchase Price:</strong> $${Number(product.purchasePrice).toFixed(2)}</div>
                    <div><strong>Selling Price:</strong> $${Number(product.sellingPrice).toFixed(2)}</div>
                    <div><strong>Stock Quantity:</strong> ${product.quantity} ${product.unit}</div>
                    <div><strong>Min Threshold:</strong> ${product.minQuantity || 10} ${product.unit}</div>
                    <div><strong>Supplier:</strong> ${product.supplier}</div>
                    <div><strong>Expiry Date:</strong> ${product.expiryDate || 'N/A'}</div>
                </div>
            </div>
        </div>
    `;

    window.openModal('view-product-modal');
};

window.confirmDeleteProduct = function (id) {
    if (confirm(`Are you sure you want to delete Product ${id}? This action cannot be undone.`)) {
        window.storage.deleteProduct(id);
        window.showToast(`Product ${id} deleted successfully.`, 'success', 'Product Removed');
        renderProductTable();
    }
};

/* ==========================================================================
   FORM SUBMISSION (VALIDATION & SAVE)
   ========================================================================== */
function initProductFormSubmission() {
    const form = document.getElementById('product-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('prod-id').value.trim();
        const name = document.getElementById('prod-name').value.trim();
        const barcode = document.getElementById('prod-barcode').value.trim();
        const category = document.getElementById('prod-category').value;
        const supplier = document.getElementById('prod-supplier').value;
        const purchasePrice = parseFloat(document.getElementById('prod-purchase-price').value);
        const sellingPrice = parseFloat(document.getElementById('prod-selling-price').value);
        const quantity = parseInt(document.getElementById('prod-quantity').value, 10);
        const minQuantity = parseInt(document.getElementById('prod-min-quantity').value, 10) || 10;
        const unit = document.getElementById('prod-unit').value;
        const expiryDate = document.getElementById('prod-expiry').value;
        const image = document.getElementById('prod-image').value.trim();
        const description = document.getElementById('prod-desc').value.trim();

        // Validations
        if (purchasePrice < 0 || sellingPrice < 0) {
            window.showToast('Prices cannot be negative values.', 'danger', 'Validation Error');
            return;
        }

        if (quantity < 0) {
            window.showToast('Stock Quantity cannot be negative.', 'danger', 'Validation Error');
            return;
        }

        // Duplicate ID check if adding new
        if (!editingProductId) {
            const existing = window.storage.getProducts().find(p => p.id === id);
            if (existing) {
                window.showToast(`Product ID ${id} already exists! Choose another ID.`, 'danger', 'Duplicate ID');
                return;
            }
        }

        const productObj = {
            id,
            name,
            barcode,
            category,
            supplier,
            purchasePrice,
            sellingPrice,
            quantity,
            minQuantity,
            unit,
            expiryDate,
            image,
            description
        };

        window.storage.saveProduct(productObj);
        window.showToast(`Product ${name} saved successfully!`, 'success', editingProductId ? 'Product Updated' : 'Product Added');

        window.closeModal('product-form-modal');
        renderProductTable();
    });
}
