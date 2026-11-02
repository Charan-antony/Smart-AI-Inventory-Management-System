/**
 * Smart AI Inventory Management System - Low Stock & Expiry Alerts Controller
 * Detects items reaching critical thresholds and renders alert cards & quick restock modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    renderAlertCards();
    initRestockModalSubmission();
});

function renderAlertCards() {
    const lowStockContainer = document.getElementById('low-stock-cards');
    const expiryContainer = document.getElementById('expiry-cards');
    if (!lowStockContainer) return;

    const products = window.storage.getProducts();

    // 1. Low Stock & Out of Stock Products
    const alertProducts = products.filter(p => Number(p.quantity) <= Number(p.minQuantity));

    if (alertProducts.length === 0) {
        lowStockContainer.innerHTML = `
            <div style="grid-column: span 2; text-align:center; padding:3rem; color:var(--accent-teal);">
                <i class="fa-solid fa-circle-check fa-3x" style="margin-bottom:1rem;"></i>
                <h4>All Inventory Healthy!</h4>
                <p style="color:var(--text-muted); font-size:0.9rem;">No products are currently below safety minimum stock levels.</p>
            </div>
        `;
    } else {
        lowStockContainer.innerHTML = alertProducts.map(p => {
            const isOutOfStock = Number(p.quantity) === 0;
            const cardBorder = isOutOfStock ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)';
            const cardBg = isOutOfStock ? 'rgba(244, 63, 94, 0.05)' : 'rgba(245, 158, 11, 0.05)';
            const statusText = isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK CRITICAL';

            return `
                <div class="glass-card" style="padding:1.5rem; border-color:${cardBorder}; background:${cardBg};">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <span class="status-pill ${isOutOfStock ? 'status-out-stock' : 'status-low-stock'}">
                            <i class="fa-solid fa-triangle-exclamation"></i> ${statusText}
                        </span>
                        <span style="font-size:0.8rem; color:var(--text-dim);">Min Threshold: ${p.minQuantity} ${p.unit}</span>
                    </div>

                    <div class="product-cell" style="margin-bottom:1rem;">
                        <img src="${p.image}" alt="${p.name}" style="width:48px; height:48px; border-radius:var(--radius-md); object-fit:cover;">
                        <div>
                            <h4 style="font-size:1.1rem;">${p.name}</h4>
                            <span style="font-size:0.8rem; color:var(--text-muted);">${p.category} | Supplier: ${p.supplier}</span>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--border-color);">
                        <div>
                            <span style="font-size:0.78rem; color:var(--text-muted);">Current Quantity:</span>
                            <h3 style="color:${isOutOfStock ? 'var(--accent-rose)' : 'var(--accent-amber)'};">${p.quantity} ${p.unit}</h3>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="openQuickRestockModal('${p.id}')">
                            <i class="fa-solid fa-cart-plus"></i> Quick Restock
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. Near Expiry Products
    const now = new Date();
    const expiryAlertProducts = products.filter(p => {
        if (!p.expiryDate) return false;
        const exp = new Date(p.expiryDate);
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        return diffDays <= 60; // Expiring in next 60 days
    });

    if (expiryContainer) {
        if (expiryAlertProducts.length === 0) {
            expiryContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No items expiring within the next 60 days.</p>`;
        } else {
            expiryContainer.innerHTML = expiryAlertProducts.map(p => `
                <div class="glass-card" style="padding:1.2rem; margin-bottom:1rem; border-color:rgba(6, 182, 212, 0.4);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="font-size:1rem;">${p.name}</h4>
                            <span style="font-size:0.8rem; color:var(--text-muted);">Expiry Date: <strong>${p.expiryDate}</strong></span>
                        </div>
                        <span class="badge-ai" style="color:var(--accent-cyan);"><i class="fa-solid fa-clock"></i> Expiring Soon</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

/* QUICK RESTOCK MODAL */
window.openQuickRestockModal = function (id) {
    const product = window.storage.getProducts().find(p => p.id === id);
    if (!product) return;

    document.getElementById('restock-prod-id').value = product.id;
    document.getElementById('restock-prod-name').value = product.name;
    document.getElementById('restock-supplier').value = product.supplier;
    document.getElementById('restock-qty').value = Math.max(20, (product.minQuantity * 2) - product.quantity);

    window.openModal('quick-restock-modal');
};

function initRestockModalSubmission() {
    const form = document.getElementById('quick-restock-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const productId = document.getElementById('restock-prod-id').value;
        const productName = document.getElementById('restock-prod-name').value;
        const supplier = document.getElementById('restock-supplier').value;
        const quantity = parseInt(document.getElementById('restock-qty').value, 10);

        const products = window.storage.getProducts();
        const product = products.find(p => p.id === productId);

        const transaction = {
            id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
            type: 'in',
            productId,
            productName,
            quantity,
            price: product ? product.purchasePrice : 0,
            supplierOrCustomer: supplier,
            invoiceNo: 'PO-ALERT-' + Date.now().toString().slice(-4),
            date: new Date().toISOString().split('T')[0],
            notes: 'Quick restock triggered from low stock alert dashboard.'
        };

        window.storage.addTransaction(transaction);
        window.showToast(`Restock Order Placed! +${quantity} units added for ${productName}.`, 'success', 'Restock Completed');

        window.closeModal('quick-restock-modal');
        renderAlertCards();
    });
}
