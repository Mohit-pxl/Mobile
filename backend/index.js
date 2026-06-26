require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mockData = require('./data/mockData');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Auth Routes ---
app.post('/api/auth/send-otp', (req, res) => {
  res.json({ success: true, data: { message: "OTP sent" } });
});

app.post('/api/auth/verify-otp', (req, res) => {
  // Mock login as admin for simplicity
  res.json({
    success: true,
    data: {
      token: "mock-jwt-token",
      user: {
        _id: "u1",
        name: "Test User",
        email: req.body.email || "test@example.com",
        role: "admin",
        permissions: {
          canViewCostPrice: true,
          canEditPrice: true,
          canViewReports: true,
          canManageStaff: true,
        }
      }
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      _id: "u1",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      permissions: {
        canViewCostPrice: true,
        canEditPrice: true,
        canViewReports: true,
        canManageStaff: true,
      }
    }
  });
});

// --- Catalog Routes (Customer App) ---
app.get('/api/catalog/products', (req, res) => {
  let filtered = mockData.products;
  if (req.query.category && req.query.category !== 'All') {
    filtered = filtered.filter(p => p.category === req.query.category);
  }
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s));
  }
  res.json({ success: true, data: filtered });
});

app.get('/api/catalog/products/:id', (req, res) => {
  const product = mockData.products.find(p => p._id === req.params.id);
  if (product) {
    res.json({ success: true, data: product });
  } else {
    res.status(404).json({ success: false, message: "Product not found" });
  }
});

app.get('/api/catalog/categories', (req, res) => {
  res.json({ success: true, data: mockData.categories });
});

// --- Banners ---
app.get('/api/banners', (req, res) => {
  res.json({ success: true, data: mockData.banners || [] });
});

app.post('/api/banners', (req, res) => {
  const newBanner = { _id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  if (!mockData.banners) mockData.banners = [];
  mockData.banners.push(newBanner);
  res.json({ success: true, data: newBanner });
});

app.delete('/api/banners/:id', (req, res) => {
  const index = (mockData.banners || []).findIndex(b => b._id === req.params.id);
  if (index !== -1) {
    mockData.banners.splice(index, 1);
    res.json({ success: true, message: "Banner deleted" });
  } else {
    res.status(404).json({ success: false, message: "Banner not found" });
  }
});

// --- Settings ---
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: mockData.settings || {} });
});

// --- Product Management Routes (Staff App) ---
app.get('/api/products', (req, res) => {
  let filtered = mockData.products;
  if (req.query.lowStock === 'true') {
    filtered = filtered.filter(p => p.stock <= p.lowStockThreshold);
  }
  if (req.query.category && req.query.category !== 'All') {
    filtered = filtered.filter(p => p.category === req.query.category);
  }
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s));
  }
  res.json({ success: true, data: filtered });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockData.products.find(p => p._id === req.params.id);
  if (product) res.json({ success: true, data: product });
  else res.status(404).json({ success: false, message: "Product not found" });
});

app.post('/api/products', (req, res) => {
  const newProduct = { _id: uuidv4(), ...req.body };
  mockData.products.push(newProduct);
  res.json({ success: true, data: newProduct });
});

app.patch('/api/products/:id', (req, res) => {
  const idx = mockData.products.findIndex(p => p._id === req.params.id);
  if (idx !== -1) {
    mockData.products[idx] = { ...mockData.products[idx], ...req.body };
    res.json({ success: true, data: mockData.products[idx] });
  } else {
    res.status(404).json({ success: false, message: "Product not found" });
  }
});

app.get('/api/products/barcode/:data', (req, res) => {
  const product = mockData.products.find(p => p.barcode === req.params.data);
  if (product) res.json({ success: true, data: product });
  else res.status(404).json({ success: false, message: "Product not found" });
});


// --- Customer Management Routes ---
app.get('/api/customers', (req, res) => {
  let filtered = mockData.customers;
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(s) || c.phone.includes(s));
  }
  res.json({ success: true, data: filtered });
});

app.get('/api/customers/:id', (req, res) => {
  const customer = mockData.customers.find(c => c._id === req.params.id);
  if (customer) res.json({ success: true, data: customer });
  else res.status(404).json({ success: false, message: "Customer not found" });
});

app.post('/api/customers', (req, res) => {
  const newCustomer = { _id: uuidv4(), ...req.body, totalDue: 0 };
  mockData.customers.push(newCustomer);
  res.json({ success: true, data: newCustomer });
});

app.delete('/api/customers/:id', (req, res) => {
  const index = mockData.customers.findIndex(c => c._id === req.params.id);
  if (index !== -1) {
    mockData.customers.splice(index, 1);
    res.json({ success: true, message: "Customer deleted" });
  } else {
    res.status(404).json({ success: false, message: "Customer not found" });
  }
});

app.post('/api/customers/:id/payments', (req, res) => {
  const customer = mockData.customers.find(c => c._id === req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  
  const amount = Number(req.body.amount);
  const paymentMode = req.body.paymentMode || "cash";
  
  customer.totalDue = (customer.totalDue || 0) - amount;
  
  // Create a payment record in invoices
  const invoice = {
    _id: uuidv4(),
    invoiceNumber: `PAY-${Date.now().toString().slice(-4)}`,
    customer: { _id: customer._id, name: customer.name, phone: customer.phone },
    items: [],
    subtotal: 0,
    gstAmount: 0,
    total: -amount,
    paymentMode: paymentMode,
    createdAt: new Date().toISOString(),
  };
  mockData.invoices.push(invoice);
  
  res.json({ success: true, data: { customer, invoice } });
});

// --- Billing & Invoices ---
app.get('/api/billing/invoices', (req, res) => {
  let filtered = mockData.invoices;
  if (req.query.customerId) {
    filtered = filtered.filter(i => i.customer && i.customer._id === req.query.customerId);
  }
  res.json({ success: true, data: filtered });
});

app.get('/api/billing/invoices/:id', (req, res) => {
  const invoice = mockData.invoices.find(i => i._id === req.params.id);
  if (invoice) res.json({ success: true, data: invoice });
  else res.status(404).json({ success: false, message: "Invoice not found" });
});

app.post('/api/billing/invoices', (req, res) => {
  const { items = [], paymentMode = 'cash', customerId } = req.body;

  // Build enriched items
  let subtotal = 0;
  let gstAmount = 0;
  const enrichedItems = items.map(item => {
    const prod = mockData.products.find(p => p._id === (item.productId || item.product?._id));
    const price = item.price || prod?.sellingPrice || 0;
    const qty   = item.qty || 1;
    const gstPct = prod?.gstPercent || 18;
    const itemSubtotal = price * qty;
    const itemGst = (itemSubtotal * gstPct) / 100;
    subtotal  += itemSubtotal;
    gstAmount += itemGst;
    return {
      product: prod
        ? { _id: prod._id, name: prod.name, brand: prod.brand, category: prod.category, gstPercent: prod.gstPercent }
        : { _id: item.productId, name: "Unknown" },
      qty,
      price,
      gstPercent: gstPct,
      subtotal: itemSubtotal,
      gstAmount: itemGst,
    };
  });

  const total = subtotal + gstAmount;

  // Resolve customer
  let customer = null;
  if (customerId) {
    customer = mockData.customers.find(c => c._id === customerId) || null;
    if (customer) {
      customer = { _id: customer._id, name: customer.name, phone: customer.phone };
    }
  }

  const invoice = {
    _id: uuidv4(),
    invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
    items: enrichedItems,
    subtotal,
    gstAmount,
    total,
    paymentMode,
    paymentStatus: req.body.paymentStatus || "paid",
    customer,
  };

  mockData.invoices.push(invoice);

  // Update stock
  enrichedItems.forEach(item => {
    const prod = mockData.products.find(p => p._id === item.product._id);
    if (prod) prod.stock -= item.qty;
  });

  res.json({ success: true, data: invoice });
});

app.post('/api/billing/invoices/:id/mark-paid', (req, res) => {
  const invoice = mockData.invoices.find(i => i._id === req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
  invoice.paymentStatus = "paid";
  invoice.paymentMode = req.body.paymentMode || "cash";
  res.json({ success: true, data: invoice });
});

// --- Quotations ---
app.get('/api/quotations', (req, res) => {
  res.json({ success: true, data: mockData.quotations });
});

app.get('/api/quotations/:id', (req, res) => {
  const q = mockData.quotations.find(q => q._id === req.params.id);
  if (q) res.json({ success: true, data: q });
  else res.status(404).json({ success: false, message: "Quotation not found" });
});

app.post('/api/quotations', (req, res) => {
  const q = { _id: uuidv4(), quotationNumber: `QT-${Date.now().toString().slice(-4)}`, createdAt: new Date().toISOString(), ...req.body };
  mockData.quotations.push(q);
  res.json({ success: true, data: q });
});

app.post('/api/quotations/:id/convert', (req, res) => {
  const q = mockData.quotations.find(x => x._id === req.params.id);
  if (!q) return res.status(404).json({ success: false, message: "Quotation not found" });
  if (q.status === 'converted') return res.status(400).json({ success: false, message: "Already converted" });

  q.status = 'converted';
  
  // Create an invoice
  const invoice = {
    _id: uuidv4(),
    invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
    customer: q.customer,
    items: q.items,
    subtotal: q.items.reduce((acc, item) => acc + item.subtotal, 0),
    gstAmount: q.items.reduce((acc, item) => acc + item.gstAmount, 0),
    total: q.total,
    paymentMode: 'cash',
    createdAt: new Date().toISOString(),
  };
  
  mockData.invoices.push(invoice);
  
  // Update stock
  invoice.items.forEach(item => {
    const prod = mockData.products.find(p => p._id === item.product._id);
    if (prod) prod.stock -= item.qty;
  });

  res.json({ success: true, data: { quotation: q, invoice } });
});

// --- Stock Movements ---
app.get('/api/stock/movements', (req, res) => {
  let filtered = mockData.stockMovements;
  if (req.query.productId) {
    filtered = filtered.filter(m => typeof m.product === 'object' ? m.product._id === req.query.productId : m.product === req.query.productId);
  }
  res.json({ success: true, data: filtered });
});

app.post('/api/stock/movements', (req, res) => {
  const movement = { _id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  mockData.stockMovements.push(movement);

  const prod = mockData.products.find(p => p._id === req.body.productId);
  if (prod) {
    if (req.body.type === 'in') prod.stock += req.body.qty;
    if (req.body.type === 'out') prod.stock -= req.body.qty;
  }

  res.json({ success: true, data: movement });
});

// --- Staff ---
app.get('/api/staff', (req, res) => {
  res.json({ success: true, data: mockData.staff });
});

app.post('/api/staff', (req, res) => {
  const s = { _id: uuidv4(), ...req.body, isActive: true, permissions: {} };
  mockData.staff.push(s);
  res.json({ success: true, data: s });
});

app.patch('/api/staff/:id/permissions', (req, res) => {
  const s = mockData.staff.find(x => x._id === req.params.id);
  if (s) {
    s.permissions = req.body.permissions;
    res.json({ success: true, data: s });
  } else {
    res.status(404).json({ success: false, message: "Staff not found" });
  }
});

app.patch('/api/staff/:id', (req, res) => {
  const s = mockData.staff.find(x => x._id === req.params.id);
  if (s) {
    if (req.body.isActive !== undefined) {
      s.isActive = req.body.isActive;
    }
    res.json({ success: true, data: s });
  } else {
    res.status(404).json({ success: false, message: "Staff not found" });
  }
});

// --- Reports ---
app.get('/api/reports/sales', (req, res) => {
  const { period = 'monthly', date } = req.query;
  const reqDate = date ? new Date(date) : new Date();
  
  // Seed based on period and date to ensure deterministic but changing data
  const seedStr = `${period}-${reqDate.getFullYear()}-${reqDate.getMonth()}-${period === 'daily' ? reqDate.getDate() : 1}`;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i);
  }

  const mult = period === "yearly" ? 12 : period === "monthly" ? 4 : 1;
  const baseSales = 25000;
  
  res.json({
    success: true,
    data: {
      totalSales: (baseSales + (seed % 10000)) * mult,
      totalOrders: (10 + (seed % 20)) * mult,
      avgOrderValue: 6000 + (seed % 1000),
      topPaymentMode: seed % 2 === 0 ? "UPI" : "Card",
      grossProfit: (baseSales * 0.4 + (seed % 3000)) * mult,
      expenses: (baseSales * 0.15 + (seed % 1000)) * mult,
      netProfit: (baseSales * 0.25 + (seed % 2000)) * mult
    }
  });
});

app.get('/api/reports/top-products', (req, res) => {
  const { period = 'monthly', date } = req.query;
  const reqDate = date ? new Date(date) : new Date();
  
  const seedStr = `${period}-${reqDate.getFullYear()}-${reqDate.getMonth()}-${period === 'daily' ? reqDate.getDate() : 1}`;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i);
  }

  const mult = period === "yearly" ? 12 : period === "monthly" ? 4 : 1;
  
  const products = [
    { _id: "p1", name: "iPhone 15 128GB", unitsSold: Math.floor(10 * mult + (seed % 5)), revenue: (125800 + (seed % 1000)) * mult },
    { _id: "p2", name: "Galaxy S24 256GB", unitsSold: Math.floor(8 * mult + (seed % 4)), revenue: (74999 + (seed % 800)) * mult },
    { _id: "p3", name: "AirPods Pro", unitsSold: Math.floor(25 * mult + (seed % 10)), revenue: (62500 + (seed % 500)) * mult },
    { _id: "p4", name: "MacBook Air M3", unitsSold: Math.floor(3 * mult + (seed % 2)), revenue: (300000 + (seed % 2000)) * mult },
    { _id: "p5", name: "Boat Airdopes 141", unitsSold: Math.floor(22 * mult + (seed % 6)), revenue: (28578 + (seed % 300)) * mult }
  ];

  // Shuffle or sort based on period
  if (period === "monthly") products.reverse();
  if (period === "daily") products.sort((a, b) => b.unitsSold - a.unitsSold);

  res.json({ 
    success: true, 
    data: products
  });
});

// --- Expenses ---
app.get('/api/expenses', (req, res) => {
  let results = mockData.expenses;
  const { month, year } = req.query;
  if (month && year) {
    results = results.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
    });
  }
  res.json({ success: true, data: results });
});

app.post('/api/expenses', (req, res) => {
  const e = { _id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  mockData.expenses.push(e);
  res.json({ success: true, data: e });
});

app.patch('/api/expenses/:id', (req, res) => {
  const idx = mockData.expenses.findIndex(e => e._id === req.params.id);
  if (idx !== -1) {
    mockData.expenses[idx] = { ...mockData.expenses[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: mockData.expenses[idx] });
  } else {
    res.status(404).json({ success: false, message: "Expense not found" });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  mockData.expenses = mockData.expenses.filter(e => e._id !== req.params.id);
  res.json({ success: true });
});

// --- Inquiries ---
app.get('/api/inquiries', (req, res) => {
  res.json({ success: true, data: mockData.inquiries });
});

app.post('/api/inquiries', (req, res) => {
  const prod = mockData.products.find(p => p._id === req.body.productId);
  const i = {
    _id: uuidv4(),
    createdAt: new Date().toISOString(),
    product: prod || { _id: req.body.productId, name: "Unknown Product" },
    ...req.body
  };
  mockData.inquiries.push(i);
  res.json({ success: true, data: i });
});

// --- Users Management ---
app.get('/api/users', (req, res) => {
  res.json({ success: true, data: mockData.users || [] });
});

app.post('/api/users', (req, res) => {
  if (!mockData.users) mockData.users = [];
  const u = { _id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  mockData.users.push(u);
  res.json({ success: true, data: u });
});

app.patch('/api/users/:id', (req, res) => {
  if (!mockData.users) mockData.users = [];
  const idx = mockData.users.findIndex(x => x._id === req.params.id);
  if (idx !== -1) {
    mockData.users[idx] = { ...mockData.users[idx], ...req.body };
    res.json({ success: true, data: mockData.users[idx] });
  } else {
    res.status(404).json({ success: false, message: "User not found" });
  }
});

app.delete('/api/users/:id', (req, res) => {
  if (!mockData.users) mockData.users = [];
  const idx = mockData.users.findIndex(x => x._id === req.params.id);
  if (idx !== -1) {
    mockData.users.splice(idx, 1);
    res.json({ success: true, message: "User deleted" });
  } else {
    res.status(404).json({ success: false, message: "User not found" });
  }
});

// Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Mock backend running on http://${HOST}:${PORT}`);
});
