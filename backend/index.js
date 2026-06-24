const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mockData = require('./data/mockData');

const app = express();
app.use(cors());
app.use(express.json());

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

// --- Product Management Routes (Staff App) ---
app.get('/api/products', (req, res) => {
  let filtered = mockData.products;
  if (req.query.lowStock === 'true') {
    filtered = filtered.filter(p => p.stock <= p.lowStockThreshold);
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
  const invoice = { _id: uuidv4(), invoiceNumber: `INV-${Date.now()}`, createdAt: new Date().toISOString(), ...req.body };
  mockData.invoices.push(invoice);
  // Update stock
  invoice.items.forEach(item => {
    const prod = mockData.products.find(p => p._id === item.product._id);
    if (prod) prod.stock -= item.qty;
  });
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
  const q = { _id: uuidv4(), quotationNumber: `QT-${Date.now()}`, createdAt: new Date().toISOString(), ...req.body };
  mockData.quotations.push(q);
  res.json({ success: true, data: q });
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

// --- Reports ---
app.get('/api/reports/sales', (req, res) => {
  res.json({
    success: true,
    data: {
      totalSales: 150000,
      totalOrders: 25,
      avgOrderValue: 6000,
      topPaymentMode: "UPI"
    }
  });
});

app.get('/api/reports/top-products', (req, res) => {
  res.json({ success: true, data: [] });
});

// --- Expenses ---
app.get('/api/expenses', (req, res) => {
  res.json({ success: true, data: mockData.expenses });
});

app.post('/api/expenses', (req, res) => {
  const e = { _id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  mockData.expenses.push(e);
  res.json({ success: true, data: e });
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

// Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mock backend running on port ${PORT}`);
});
