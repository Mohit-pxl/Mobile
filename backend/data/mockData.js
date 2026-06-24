const { v4: uuidv4 } = require('uuid');

const categories = ["Mobiles", "Audio", "Earphones", "Chargers", "Smart Watches", "Laptops"];

const products = [
  {
    _id: "p1",
    name: "iPhone 15 128GB",
    brand: "Apple",
    category: "Mobiles",
    sellingPrice: 69900,
    mrp: 79900,
    costPrice: 65000,
    stock: 12,
    lowStockThreshold: 5,
    gstPercent: 18,
    images: ["https://picsum.photos/200"],
    isActive: true,
  },
  {
    _id: "p2",
    name: "Galaxy S24 256GB",
    brand: "Samsung",
    category: "Mobiles",
    sellingPrice: 74999,
    mrp: 85000,
    costPrice: 70000,
    stock: 8,
    lowStockThreshold: 5,
    gstPercent: 18,
    images: ["https://picsum.photos/201"],
    isActive: true,
  },
  {
    _id: "p3",
    name: "Boat Airdopes 141",
    brand: "Boat",
    category: "Audio",
    sellingPrice: 1299,
    mrp: 2990,
    costPrice: 800,
    stock: 50,
    lowStockThreshold: 10,
    gstPercent: 18,
    images: ["https://picsum.photos/202"],
    isActive: true,
  },
  {
    _id: "p4",
    name: "realme Watch 3",
    brand: "realme",
    category: "Smart Watches",
    sellingPrice: 3499,
    mrp: 4999,
    costPrice: 2000,
    stock: 2,
    lowStockThreshold: 5,
    gstPercent: 18,
    images: ["https://picsum.photos/203"],
    isActive: true,
  }
];

const customers = [
  {
    _id: "c1",
    name: "John Doe",
    phone: "9876543210",
    email: "john@example.com",
    totalDue: 1500
  }
];

const staff = [
  {
    _id: "s1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    isActive: true,
    permissions: {
      canViewCostPrice: true,
      canEditPrice: true,
      canViewReports: true,
      canManageStaff: true,
    }
  }
];

const invoices = [];
const quotations = [];
const expenses = [];
const stockMovements = [];
const inquiries = [];
const wishlist = [];

module.exports = {
  categories,
  products,
  customers,
  staff,
  invoices,
  quotations,
  expenses,
  stockMovements,
  inquiries,
  wishlist
};
