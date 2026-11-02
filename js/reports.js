/**
 * Smart AI Inventory Management System - Reports & Export Engine
 * Generates interactive reports, CSV spreadsheet exports, and printable views.
 */

document.addEventListener('DOMContentLoaded', () => {
    renderReportTable('inventory');

    const reportSelect = document.getElementById('report-type-select');
    if (reportSelect) {
        reportSelect.addEventListener('change', () => {
            renderReportTable(reportSelect.value);
        });
    }
});

let currentReportData = [];
let currentReportType = 'inventory';

function renderReportTable(type) {
    currentReportType = type;
    const tableHead = document.getElementById('reports-table-head');
    const tableBody = document.getElementById('reports-table-body');
    const reportTitle = document.getElementById('report-display-title');
    if (!tableHead || !tableBody) return;

    const products = window.storage.getProducts();
    const transactions = window.storage.getTransactions();
    const suppliers = window.storage.getSuppliers();

    if (type === 'inventory') {
        reportTitle.textContent = 'Complete Inventory Valuation Report';
        tableHead.innerHTML = `
            <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Quantity</th>
                <th>Total Valuation</th>
            </tr>
        `;

        currentReportData = products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            purchasePrice: `$${Number(p.purchasePrice).toFixed(2)}`,
            sellingPrice: `$${Number(p.sellingPrice).toFixed(2)}`,
            quantity: `${p.quantity} ${p.unit}`,
            totalValue: `$${(p.purchasePrice * p.quantity).toFixed(2)}`
        }));

        tableBody.innerHTML = currentReportData.map(d => `
            <tr>
                <td><strong>${d.id}</strong></td>
                <td>${d.name}</td>
                <td>${d.category}</td>
                <td>${d.purchasePrice}</td>
                <td>${d.sellingPrice}</td>
                <td>${d.quantity}</td>
                <td><strong>${d.totalValue}</strong></td>
            </tr>
        `).join('');

    } else if (type === 'sales') {
        reportTitle.textContent = 'Sales Outward Revenue Report';
        tableHead.innerHTML = `
            <tr>
                <th>Txn ID</th>
                <th>Invoice</th>
                <th>Product Name</th>
                <th>Qty Sold</th>
                <th>Unit Price</th>
                <th>Gross Revenue</th>
                <th>Customer</th>
                <th>Date</th>
            </tr>
        `;

        const sales = transactions.filter(t => t.type === 'out');
        currentReportData = sales.map(t => ({
            id: t.id,
            invoice: t.invoiceNo,
            product: t.productName,
            qty: t.quantity,
            price: `$${Number(t.price).toFixed(2)}`,
            gross: `$${(t.price * t.quantity).toFixed(2)}`,
            customer: t.supplierOrCustomer,
            date: t.date
        }));

        tableBody.innerHTML = currentReportData.map(d => `
            <tr>
                <td><strong>${d.id}</strong></td>
                <td>${d.invoice}</td>
                <td>${d.product}</td>
                <td>${d.qty} Pcs</td>
                <td>${d.price}</td>
                <td><strong>${d.gross}</strong></td>
                <td>${d.customer}</td>
                <td>${d.date}</td>
            </tr>
        `).join('');

    } else if (type === 'suppliers') {
        reportTitle.textContent = 'Supplier Directory & Order Report';
        tableHead.innerHTML = `
            <tr>
                <th>Supplier ID</th>
                <th>Company Name</th>
                <th>Contact Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Products Supplied</th>
            </tr>
        `;

        currentReportData = suppliers.map(s => {
            const count = products.filter(p => p.supplier === s.name).length;
            return {
                id: s.id,
                company: s.company,
                name: s.name,
                phone: s.phone,
                email: s.email,
                count: `${count} Items`
            };
        });

        tableBody.innerHTML = currentReportData.map(d => `
            <tr>
                <td><strong>${d.id}</strong></td>
                <td>${d.company}</td>
                <td>${d.name}</td>
                <td>${d.phone}</td>
                <td>${d.email}</td>
                <td><strong>${d.count}</strong></td>
            </tr>
        `).join('');
    }
}

/* ==========================================================================
   EXPORT CSV & PRINT
   ========================================================================== */
window.exportReportCSV = function () {
    if (!currentReportData.length) {
        window.showToast('No data available to export.', 'danger');
        return;
    }

    const headers = Object.keys(currentReportData[0]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    currentReportData.forEach(row => {
        const values = headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`);
        csvContent += values.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invai_report_${currentReportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.showToast(`Exported ${currentReportType.toUpperCase()} report as CSV!`, 'success', 'CSV Download Complete');
};

window.exportReportPDF = function () {
    window.showToast(`Simulating PDF generation for ${currentReportType.toUpperCase()} report...`, 'info', 'PDF Engine');
    setTimeout(() => {
        window.print();
    }, 500);
};
