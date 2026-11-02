/**
 * Smart AI Inventory Management System - Dashboard Analytics Engine
 * Calculates metrics from LocalStorage and renders dynamic Chart.js charts.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Calculate & Populate Metric Cards
    renderDashboardMetrics();

    // 2. Render Recent Transactions Table
    renderRecentTransactions();

    // 3. Render Chart.js Analytics
    initDashboardCharts();
});

/* ==========================================================================
   METRICS CALCULATIONS FROM LOCALSTORAGE
   ========================================================================== */
function renderDashboardMetrics() {
    const products = window.storage.getProducts();
    const categories = window.storage.getCategories();
    const suppliers = window.storage.getSuppliers();
    const transactions = window.storage.getTransactions();

    // Metrics
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const totalSuppliers = suppliers.length;

    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;

    products.forEach(p => {
        totalInventoryValue += (Number(p.purchasePrice) * Number(p.quantity));
        if (p.quantity === 0) {
            outOfStockCount++;
        } else if (p.quantity <= p.minQuantity) {
            lowStockCount++;
        }
    });

    // Today's sales calculation
    const todayStr = new Date().toISOString().split('T')[0];
    let todaysSales = 0;
    let monthlyRevenue = 0;

    transactions.forEach(t => {
        if (t.type === 'out') {
            const amount = Number(t.price) * Number(t.quantity);
            monthlyRevenue += amount;
            if (t.date === todayStr) {
                todaysSales += amount;
            }
        }
    });

    // Inventory Health Score calculation (100 - penalize low & out stock)
    let healthScore = 100;
    if (totalProducts > 0) {
        const problemRatio = (lowStockCount + (outOfStockCount * 2)) / totalProducts;
        healthScore = Math.max(20, Math.round(100 - (problemRatio * 40)));
    }

    // DOM Binding
    const elTotalProducts = document.getElementById('dash-total-products');
    const elCategories = document.getElementById('dash-total-categories');
    const elSuppliers = document.getElementById('dash-total-suppliers');
    const elLowStock = document.getElementById('dash-low-stock');
    const elOutOfStock = document.getElementById('dash-out-of-stock');
    const elTodaysSales = document.getElementById('dash-todays-sales');
    const elMonthlyRevenue = document.getElementById('dash-monthly-revenue');
    const elHealthScore = document.getElementById('dash-health-score');
    const elHealthBar = document.getElementById('dash-health-bar');

    if (elTotalProducts) elTotalProducts.textContent = totalProducts.toLocaleString();
    if (elCategories) elCategories.textContent = totalCategories.toLocaleString();
    if (elSuppliers) elSuppliers.textContent = totalSuppliers.toLocaleString();
    if (elLowStock) elLowStock.textContent = lowStockCount;
    if (elOutOfStock) elOutOfStock.textContent = outOfStockCount;
    if (elTodaysSales) elTodaysSales.textContent = '$' + todaysSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (elMonthlyRevenue) elMonthlyRevenue.textContent = '$' + monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (elHealthScore) elHealthScore.textContent = healthScore + '%';
    if (elHealthBar) elHealthBar.style.width = healthScore + '%';
}

/* ==========================================================================
   RECENT TRANSACTIONS FEED
   ========================================================================== */
function renderRecentTransactions() {
    const tableBody = document.getElementById('recent-transactions-body');
    if (!tableBody) return;

    const transactions = window.storage.getTransactions().slice(0, 5);

    if (transactions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No transactions recorded yet.</td></tr>`;
        return;
    }

    tableBody.innerHTML = transactions.map(t => {
        const isStockIn = t.type === 'in';
        const typeBadge = isStockIn
            ? `<span class="status-pill status-in-stock"><i class="fa-solid fa-arrow-down"></i> Stock In</span>`
            : `<span class="status-pill status-out-stock"><i class="fa-solid fa-arrow-up"></i> Stock Out</span>`;

        return `
            <tr>
                <td><strong>${t.id}</strong></td>
                <td>${t.productName}</td>
                <td>${typeBadge}</td>
                <td><strong>${t.quantity}</strong> Pcs</td>
                <td>$${Number(t.price).toFixed(2)}</td>
                <td>${t.date}</td>
            </tr>
        `;
    }).join('');
}

/* ==========================================================================
   CHART.JS ANALYTICS INITIALIZATION
   ========================================================================== */
function initDashboardCharts() {
    const products = window.storage.getProducts();

    // Chart colors
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const textColor = isDark ? '#9CA3AF' : '#475569';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // Chart 1: Sales & Revenue Trend (Line Chart)
    const ctxSales = document.getElementById('chart-sales-trend');
    if (ctxSales && typeof Chart !== 'undefined') {
        new Chart(ctxSales, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                    {
                        label: 'Sales Revenue ($)',
                        data: [12400, 18500, 15200, 22400, 28900, 31000, 38450],
                        borderColor: '#6366F1',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3
                    },
                    {
                        label: 'Purchase Capital ($)',
                        data: [9000, 12000, 11000, 16000, 19000, 21000, 24000],
                        borderColor: '#06B6D4',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } } }
                },
                scales: {
                    x: { ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { ticks: { color: textColor }, grid: { color: gridColor } }
                }
            }
        });
    }

    // Chart 2: Inventory Status Breakdown (Doughnut Chart)
    const ctxStatus = document.getElementById('chart-inventory-status');
    if (ctxStatus && typeof Chart !== 'undefined') {
        let inStock = 0, lowStock = 0, outStock = 0;
        products.forEach(p => {
            if (p.quantity === 0) outStock++;
            else if (p.quantity <= p.minQuantity) lowStock++;
            else inStock++;
        });

        new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: ['Healthy In-Stock', 'Low Stock Warning', 'Out of Stock'],
                datasets: [{
                    data: [inStock, lowStock, outStock],
                    backgroundColor: ['#10B981', '#F59E0B', '#F43F5E'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } } }
                },
                cutout: '72%'
            }
        });
    }

    // Chart 3: Category Stock Distribution (Bar Chart)
    const ctxCategory = document.getElementById('chart-category-dist');
    if (ctxCategory && typeof Chart !== 'undefined') {
        const categories = window.storage.getCategories();
        const catNames = categories.map(c => c.name);
        const catQuantities = categories.map(c => {
            return products.filter(p => p.category === c.name).reduce((sum, p) => sum + Number(p.quantity), 0);
        });

        new Chart(ctxCategory, {
            type: 'bar',
            data: {
                labels: catNames,
                datasets: [{
                    label: 'Units in Warehouse',
                    data: catQuantities,
                    backgroundColor: ['#6366F1', '#10B981', '#06B6D4', '#8B5CF6', '#F59E0B'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: textColor }, grid: { display: false } },
                    y: { ticks: { color: textColor }, grid: { color: gridColor } }
                }
            }
        });
    }
}
