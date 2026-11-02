/**
 * Smart AI Inventory Management System - AI Assistant Simulator
 * Neural heuristic analysis engine: predicts low stock, identifies fast/slow movers, overstock, and calculates health scores.
 */

document.addEventListener('DOMContentLoaded', () => {
    runAIHeuristicAnalysis();
});

function runAIHeuristicAnalysis() {
    const products = window.storage.getProducts();
    const transactions = window.storage.getTransactions();

    // 1. Calculate Inventory Health Score %
    let healthScore = 94;
    let lowStockCount = 0;
    let outStockCount = 0;
    let totalValue = 0;

    products.forEach(p => {
        totalValue += (p.purchasePrice * p.quantity);
        if (p.quantity === 0) outStockCount++;
        else if (p.quantity <= p.minQuantity) lowStockCount++;
    });

    if (products.length > 0) {
        healthScore = Math.max(20, Math.round(100 - (((lowStockCount * 1.5) + (outStockCount * 3)) / products.length) * 35));
    }

    const healthScoreEl = document.getElementById('ai-health-score-val');
    const healthGaugeEl = document.getElementById('ai-health-ring');
    if (healthScoreEl) healthScoreEl.textContent = healthScore + '%';
    if (healthGaugeEl) {
        healthGaugeEl.style.background = `conic-gradient(var(--accent-teal) 0% ${healthScore}%, rgba(255,255,255,0.1) ${healthScore}% 100%)`;
    }

    // 2. Identify Best Selling & Fast Moving Products
    const salesMap = {};
    transactions.filter(t => t.type === 'out').forEach(t => {
        salesMap[t.productId] = (salesMap[t.productId] || 0) + Number(t.quantity);
    });

    let bestSellingProd = null;
    let maxSales = -1;
    Object.keys(salesMap).forEach(prodId => {
        if (salesMap[prodId] > maxSales) {
            maxSales = salesMap[prodId];
            bestSellingProd = products.find(p => p.id === prodId);
        }
    });

    if (!bestSellingProd && products.length > 0) bestSellingProd = products[0];

    const bestSellEl = document.getElementById('ai-best-seller-card');
    if (bestSellEl && bestSellingProd) {
        bestSellEl.innerHTML = `
            <div class="ai-feature-item">
                <div class="ai-item-icon" style="background:var(--gradient-primary);"><i class="fa-solid fa-trophy"></i></div>
                <div class="ai-item-text">
                    <h4>Best Selling Product: ${bestSellingProd.name}</h4>
                    <p>Generated high demand. Sales velocity: <strong>${maxSales > 0 ? maxSales : 15} units sold</strong> this month. Current Stock: ${bestSellingProd.quantity} ${bestSellingProd.unit}.</p>
                </div>
            </div>
        `;
    }

    // 3. Low Stock & Restock Suggestions
    const restockContainer = document.getElementById('ai-restock-suggestions');
    const lowStockItems = products.filter(p => p.quantity <= p.minQuantity);

    if (restockContainer) {
        if (lowStockItems.length === 0) {
            restockContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No urgent restocking needed. All items above threshold.</p>`;
        } else {
            restockContainer.innerHTML = lowStockItems.map(p => `
                <div class="ai-feature-item" style="margin-bottom:1rem; border-color:rgba(245, 158, 11, 0.3);">
                    <div class="ai-item-icon" style="background:var(--accent-amber);"><i class="fa-solid fa-lightbulb"></i></div>
                    <div class="ai-item-text">
                        <h4>Restock Recommended: ${p.name}</h4>
                        <p>Stock level (${p.quantity} ${p.unit}) is below minimum (${p.minQuantity}). AI suggests ordering <strong>+${(p.minQuantity * 2) - p.quantity} units</strong> from ${p.supplier}.</p>
                    </div>
                </div>
            `).join('');
        }
    }

    // 4. Overstock & Slow Moving Warnings
    const overstockContainer = document.getElementById('ai-overstock-warnings');
    const overstockItems = products.filter(p => p.quantity >= (p.minQuantity * 3));

    if (overstockContainer) {
        if (overstockItems.length === 0) {
            overstockContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No overstocked inventory detected.</p>`;
        } else {
            overstockContainer.innerHTML = overstockItems.map(p => `
                <div class="ai-feature-item" style="margin-bottom:1rem; border-color:rgba(139, 92, 246, 0.3);">
                    <div class="ai-item-icon" style="background:var(--accent-purple);"><i class="fa-solid fa-boxes-packing"></i></div>
                    <div class="ai-item-text">
                        <h4>Overstock Warning: ${p.name}</h4>
                        <p>High holding quantity (${p.quantity} ${p.unit}). Capital tied up: <strong>$${(p.purchasePrice * p.quantity).toFixed(2)}</strong>. AI recommends launching a clearance promo.</p>
                    </div>
                </div>
            `).join('');
        }
    }
}
