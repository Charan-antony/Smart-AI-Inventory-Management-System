/**
 * Smart AI Inventory Management System - Stock In & Stock Out Controller
 * Handles inward stock receipts, outward customer sales dispatches, and table logs.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Determine page context
    const isStockInPage = !!document.getElementById('stockin-form');
    const isStockOutPage = !!document.getElementById('stockout-form');

    if (isStockInPage) {
        initStockInPage();
    } else if (isStockOutPage) {
        initStockOutPage();
    }
});

/* ==========================================================================
   STOCK IN LOGIC
   ========================================================================== */
function initStockInPage() {
    populateProductDropdown('stockin-product-select');
    populateSupplierDropdown('stockin-supplier-select');
    renderStockInTable();

    // Default today's date
    const dateInput = document.getElementById('stockin-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const form = document.getElementById('stockin-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const productId = document.getElementById('stockin-product-select').value;
            const quantity = parseInt(document.getElementById('stockin-quantity').value, 10);
            const supplier = document.getElementById('stockin-supplier-select').value;
            const date = document.getElementById('stockin-date').value;
            const invoiceNo = document.getElementById('stockin-invoice').value.trim() || 'INV-IN-' + Date.now().toString().slice(-4);
            const notes = document.getElementById('stockin-notes').value.trim() || 'Inward stock purchase replenishment.';

            if (!productId || quantity <= 0) {
                window.showToast('Please select a product and enter a positive quantity.', 'danger', 'Validation Error');
                return;
            }

            const products = window.storage.getProducts();
            const product = products.find(p => p.id === productId);

            const transaction = {
                id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
                type: 'in',
                productId,
                productName: product ? product.name : 'Unknown Product',
                quantity,
                price: product ? product.purchasePrice : 0,
                supplierOrCustomer: supplier,
                invoiceNo,
                date,
                notes
            };

            window.storage.addTransaction(transaction);
            window.showToast(`Stock In Recorded! +${quantity} units added to ${product.name}.`, 'success', 'Inventory Replenished');

            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            renderStockInTable();
        });
    }
}

function renderStockInTable() {
    const tableBody = document.getElementById('stockin-table-body');
    if (!tableBody) return;

    const transactions = window.storage.getTransactions().filter(t => t.type === 'in');

    if (transactions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No stock in logs recorded yet.</td></tr>`;
        return;
    }

    tableBody.innerHTML = transactions.map(t => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td><strong>${t.invoiceNo}</strong></td>
            <td>${t.productName}</td>
            <td><span class="status-pill status-in-stock">+${t.quantity} Pcs</span></td>
            <td>${t.supplierOrCustomer}</td>
            <td>${t.date}</td>
            <td style="color:var(--text-muted); font-size:0.85rem;">${t.notes}</td>
        </tr>
    `).join('');
}

/* ==========================================================================
   STOCK OUT LOGIC
   ========================================================================== */
function initStockOutPage() {
    populateProductDropdown('stockout-product-select');
    renderStockOutTable();

    const dateInput = document.getElementById('stockout-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    // Product Select listener to display max available quantity
    const prodSelect = document.getElementById('stockout-product-select');
    if (prodSelect) {
        prodSelect.addEventListener('change', () => {
            const productId = prodSelect.value;
            const product = window.storage.getProducts().find(p => p.id === productId);
            const stockHelp = document.getElementById('stockout-available-help');
            if (stockHelp && product) {
                stockHelp.textContent = `Available Stock: ${product.quantity} ${product.unit}`;
                stockHelp.style.color = product.quantity === 0 ? 'var(--accent-rose)' : 'var(--accent-teal)';
            }
        });
    }

    const form = document.getElementById('stockout-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const productId = document.getElementById('stockout-product-select').value;
            const quantity = parseInt(document.getElementById('stockout-quantity').value, 10);
            const customer = document.getElementById('stockout-customer').value.trim() || 'General Customer';
            const invoiceNo = document.getElementById('stockout-invoice').value.trim() || 'INV-OUT-' + Date.now().toString().slice(-4);
            const date = document.getElementById('stockout-date').value;
            const notes = document.getElementById('stockout-notes').value.trim() || 'Customer sale dispatch.';

            const products = window.storage.getProducts();
            const product = products.find(p => p.id === productId);

            if (!product) {
                window.showToast('Please select a valid product.', 'danger', 'Error');
                return;
            }

            if (quantity <= 0) {
                window.showToast('Quantity must be greater than 0.', 'danger', 'Validation Error');
                return;
            }

            if (quantity > product.quantity) {
                window.showToast(`Insufficient stock! Only ${product.quantity} units available.`, 'danger', 'Out of Stock Warning');
                return;
            }

            const transaction = {
                id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
                type: 'out',
                productId,
                productName: product.name,
                quantity,
                price: product.sellingPrice,
                supplierOrCustomer: customer,
                invoiceNo,
                date,
                notes
            };

            window.storage.addTransaction(transaction);
            window.showToast(`Stock Out Recorded! -${quantity} units dispatched to ${customer}.`, 'success', 'Stock Dispatched');

            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            renderStockOutTable();
        });
    }
}

function renderStockOutTable() {
    const tableBody = document.getElementById('stockout-table-body');
    if (!tableBody) return;

    const transactions = window.storage.getTransactions().filter(t => t.type === 'out');

    if (transactions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No stock out sales recorded yet.</td></tr>`;
        return;
    }

    tableBody.innerHTML = transactions.map(t => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td><strong>${t.invoiceNo}</strong></td>
            <td>${t.productName}</td>
            <td><span class="status-pill status-out-stock">-${t.quantity} Pcs</span></td>
            <td>$${(Number(t.price) * Number(t.quantity)).toFixed(2)}</td>
            <td>${t.supplierOrCustomer}</td>
            <td>${t.date}</td>
        </tr>
    `).join('');
}

/* Helper Option Populate */
function populateProductDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const products = window.storage.getProducts();
    select.innerHTML = `<option value="">-- Select Product --</option>` +
        products.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.quantity} ${p.unit})</option>`).join('');
}

function populateSupplierDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const suppliers = window.storage.getSuppliers();
    select.innerHTML = suppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
}
