/**
 * Smart AI Inventory Management System - Storage Engine
 * Handles all LocalStorage interactions, data seeding, and CRUD operations.
 */

const STORAGE_KEYS = {
    PRODUCTS: 'smart_inv_products',
    CATEGORIES: 'smart_inv_categories',
    SUPPLIERS: 'smart_inv_suppliers',
    TRANSACTIONS: 'smart_inv_transactions',
    USER: 'smart_inv_user',
    SETTINGS: 'smart_inv_settings',
    NOTIFICATIONS: 'smart_inv_notifications'
};

// Initial Seed Data for Instant Demonstration
const INITIAL_SEED = {
    user: {
        id: 'USR-1001',
        name: 'Alex Mercer',
        email: 'alex.mercer@inventoryai.com',
        phone: '+1 (555) 234-5678',
        role: 'Senior Inventory Manager',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        password: 'password123'
    },
    categories: [
        { id: 'CAT-1', name: 'Electronics & Gadgets', description: 'Smartphones, Laptops, Components & Accessories', icon: 'fa-laptop-code' },
        { id: 'CAT-2', name: 'Industrial Hardware', description: 'Motors, Sensors, Power Supplies & Tools', icon: 'fa-microchip' },
        { id: 'CAT-3', name: 'Office Supplies', description: 'Stationery, Furniture & Consumables', icon: 'fa-briefcase' },
        { id: 'CAT-4', name: 'Smart Home Devices', description: 'IoT Sensors, Smart Lighting & Security Cameras', icon: 'fa-house-signal' },
        { id: 'CAT-5', name: 'Perishable Consumables', description: 'Chemicals, Reagents & Cleanroom Supplies', icon: 'fa-flask' }
    ],
    suppliers: [
        { id: 'SUP-101', name: 'CyberTech Components Ltd', company: 'CyberTech Global', phone: '+1 800 555 0192', email: 'orders@cybertech.com', address: '742 Evergreen Terrace, Silicon Valley, CA' },
        { id: 'SUP-102', name: 'Apex Logistics & Supplies', company: 'Apex Group Inc', phone: '+1 800 555 0834', email: 'contact@apexlogistics.io', address: '120 Industrial Pkwy, Chicago, IL' },
        { id: 'SUP-103', name: 'Nexus Microelectronics', company: 'Nexus Semiconductor', phone: '+1 888 443 1120', email: 'sales@nexusmicro.com', address: '88 Innovation Way, Austin, TX' },
        { id: 'SUP-104', name: 'Omni Supply Chain Solutions', company: 'Omni Group', phone: '+1 800 992 4810', email: 'support@omnisupply.com', address: '45 Freight Blvd, Seattle, WA' }
    ],
    products: [
        {
            id: 'PRD-1001',
            name: 'AI Edge Vision Sensor Module X1',
            barcode: '8901234567890',
            category: 'Electronics & Gadgets',
            supplier: 'CyberTech Components Ltd',
            purchasePrice: 120.00,
            sellingPrice: 189.99,
            quantity: 45,
            minQuantity: 15,
            unit: 'Pcs',
            expiryDate: '2027-12-31',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
            description: 'High performance edge AI camera module with real-time target tracking capabilities.'
        },
        {
            id: 'PRD-1002',
            name: 'Quantum Core Smart Router Pro',
            barcode: '8901234567891',
            category: 'Smart Home Devices',
            supplier: 'Nexus Microelectronics',
            purchasePrice: 210.00,
            sellingPrice: 329.50,
            quantity: 8, // Low Stock Trigger
            minQuantity: 12,
            unit: 'Pcs',
            expiryDate: '2028-06-15',
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
            description: 'Wi-Fi 7 Enterprise Smart Mesh Router with integrated AI traffic prioritization.'
        },
        {
            id: 'PRD-1003',
            name: 'Ultra-Precision Servo Motor 500W',
            barcode: '8901234567892',
            category: 'Industrial Hardware',
            supplier: 'Apex Logistics & Supplies',
            purchasePrice: 85.50,
            sellingPrice: 145.00,
            quantity: 0, // Out of Stock Trigger
            minQuantity: 10,
            unit: 'Units',
            expiryDate: '2029-01-01',
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
            description: 'Brushless high torque industrial motor engineered for robotic arm integration.'
        },
        {
            id: 'PRD-1004',
            name: 'Ergonomic Executive Mesh Chair V2',
            barcode: '8901234567893',
            category: 'Office Supplies',
            supplier: 'Omni Supply Chain Solutions',
            purchasePrice: 150.00,
            sellingPrice: 249.99,
            quantity: 28,
            minQuantity: 8,
            unit: 'Units',
            expiryDate: '2030-10-10',
            image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=300&auto=format&fit=crop&q=80',
            description: 'Lumbar support gaming and executive chair with dynamic weight tension controls.'
        },
        {
            id: 'PRD-1005',
            name: 'Thermal Heat Dissipation Compound',
            barcode: '8901234567894',
            category: 'Perishable Consumables',
            supplier: 'CyberTech Components Ltd',
            purchasePrice: 12.50,
            sellingPrice: 24.99,
            quantity: 5, // Low Stock & Near Expiry Trigger
            minQuantity: 20,
            unit: 'Tubes',
            expiryDate: '2026-08-30',
            image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
            description: 'Nano-diamond high thermal conductivity paste for CPU/GPU cooling.'
        },
        {
            id: 'PRD-1006',
            name: 'Smart IoT Temperature & Humidity Node',
            barcode: '8901234567895',
            category: 'Smart Home Devices',
            supplier: 'Nexus Microelectronics',
            purchasePrice: 35.00,
            sellingPrice: 59.99,
            quantity: 92,
            minQuantity: 25,
            unit: 'Pcs',
            expiryDate: '2028-11-20',
            image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300&auto=format&fit=crop&q=80',
            description: 'Battery powered wireless Zigbee 3.0 sensor for climate control automation.'
        }
    ],
    transactions: [
        { id: 'TXN-5001', type: 'in', productId: 'PRD-1001', productName: 'AI Edge Vision Sensor Module X1', quantity: 30, price: 120.00, supplierOrCustomer: 'CyberTech Components Ltd', invoiceNo: 'INV-2026-001', date: '2026-07-20', notes: 'Initial quarterly bulk shipment received.' },
        { id: 'TXN-5002', type: 'out', productId: 'PRD-1002', productName: 'Quantum Core Smart Router Pro', quantity: 5, price: 329.50, supplierOrCustomer: 'Acme Technologies', invoiceNo: 'INV-2026-002', date: '2026-07-22', notes: 'Client order for office network upgrade.' },
        { id: 'TXN-5003', type: 'in', productId: 'PRD-1006', productName: 'Smart IoT Temperature & Humidity Node', quantity: 50, price: 35.00, supplierOrCustomer: 'Nexus Microelectronics', invoiceNo: 'INV-2026-003', date: '2026-07-24', notes: 'Restock order delivered.' },
        { id: 'TXN-5004', type: 'out', productId: 'PRD-1003', productName: 'Ultra-Precision Servo Motor 500W', quantity: 10, price: 145.00, supplierOrCustomer: 'Robotics Innovations Corp', invoiceNo: 'INV-2026-004', date: '2026-07-25', notes: 'Sold out remaining stock.' }
    ],
    notifications: [
        { id: 'NOTIF-1', title: 'Low Stock Alert', message: 'Quantum Core Smart Router Pro has reached critical level (8 remaining).', time: '10 mins ago', type: 'warning', read: false },
        { id: 'NOTIF-2', title: 'Out of Stock Alert', message: 'Ultra-Precision Servo Motor 500W is completely out of stock!', time: '1 hour ago', type: 'danger', read: false },
        { id: 'NOTIF-3', title: 'AI Prediction', message: 'Thermal Heat Dissipation Compound predicted to expire in 35 days. Consider promo clearance.', time: '2 hours ago', type: 'info', read: false },
        { id: 'NOTIF-4', title: 'Stock Received', message: '50 units of Smart IoT Sensor Node added by Alex Mercer.', time: '1 day ago', type: 'success', read: true }
    ],
    settings: {
        theme: 'dark',
        notifications: true,
        currency: '$'
    }
};

class StorageManager {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_SEED.products));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_SEED.categories));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
            localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SEED.suppliers));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_SEED.transactions));
        }
        if (!localStorage.getItem(STORAGE_KEYS.USER)) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_SEED.user));
        }
        if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_SEED.notifications));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SEED.settings));
        }
    }

    // Generic Getter & Setter
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Storage Read Error:', e);
            return [];
        }
    }

    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage Write Error:', e);
            return false;
        }
    }

    // Products CRUD
    getProducts() {
        return this.get(STORAGE_KEYS.PRODUCTS);
    }

    saveProduct(product) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === product.id);
        if (index >= 0) {
            products[index] = product;
        } else {
            products.unshift(product);
        }
        this.set(STORAGE_KEYS.PRODUCTS, products);
        return product;
    }

    deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id !== id);
        return this.set(STORAGE_KEYS.PRODUCTS, products);
    }

    // Categories CRUD
    getCategories() {
        return this.get(STORAGE_KEYS.CATEGORIES);
    }

    saveCategory(category) {
        const categories = this.getCategories();
        const index = categories.findIndex(c => c.id === category.id);
        if (index >= 0) {
            categories[index] = category;
        } else {
            categories.unshift(category);
        }
        return this.set(STORAGE_KEYS.CATEGORIES, categories);
    }

    deleteCategory(id) {
        const categories = this.getCategories().filter(c => c.id !== id);
        return this.set(STORAGE_KEYS.CATEGORIES, categories);
    }

    // Suppliers CRUD
    getSuppliers() {
        return this.get(STORAGE_KEYS.SUPPLIERS);
    }

    saveSupplier(supplier) {
        const suppliers = this.getSuppliers();
        const index = suppliers.findIndex(s => s.id === supplier.id);
        if (index >= 0) {
            suppliers[index] = supplier;
        } else {
            suppliers.unshift(supplier);
        }
        return this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
    }

    deleteSupplier(id) {
        const suppliers = this.getSuppliers().filter(s => s.id !== id);
        return this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
    }

    // Transactions
    getTransactions() {
        return this.get(STORAGE_KEYS.TRANSACTIONS);
    }

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transactions.unshift(transaction);
        this.set(STORAGE_KEYS.TRANSACTIONS, transactions);

        // Update product quantity automatically
        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === transaction.productId);
        if (productIndex >= 0) {
            if (transaction.type === 'in') {
                products[productIndex].quantity += Number(transaction.quantity);
            } else if (transaction.type === 'out') {
                products[productIndex].quantity = Math.max(0, products[productIndex].quantity - Number(transaction.quantity));
            }
            this.set(STORAGE_KEYS.PRODUCTS, products);
        }
        return transaction;
    }

    // Notifications
    getNotifications() {
        return this.get(STORAGE_KEYS.NOTIFICATIONS);
    }

    addNotification(notif) {
        const notifs = this.getNotifications();
        notifs.unshift({
            id: 'NOTIF-' + Date.now(),
            title: notif.title,
            message: notif.message,
            time: 'Just now',
            type: notif.type || 'info',
            read: false
        });
        return this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }

    markAllNotificationsRead() {
        const notifs = this.getNotifications().map(n => ({ ...n, read: true }));
        return this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }

    // User Profile
    getUser() {
        return this.get(STORAGE_KEYS.USER) || INITIAL_SEED.user;
    }

    saveUser(user) {
        return this.set(STORAGE_KEYS.USER, user);
    }

    // Settings
    getSettings() {
        return this.get(STORAGE_KEYS.SETTINGS) || INITIAL_SEED.settings;
    }

    saveSettings(settings) {
        return this.set(STORAGE_KEYS.SETTINGS, settings);
    }

    // Helper: Reset database to initial state
    resetToSeed() {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_SEED.products));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_SEED.categories));
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SEED.suppliers));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_SEED.transactions));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_SEED.user));
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_SEED.notifications));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SEED.settings));
        return true;
    }
}

// Global Export
window.storage = new StorageManager();
