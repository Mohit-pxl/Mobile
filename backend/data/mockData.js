const { v4: uuidv4 } = require('uuid');

const categories = ["Mobiles", "Audio", "Earphones", "Chargers", "Smart Watches", "Laptops"];

const products = [
  // ── Mobiles ──
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
    hsnCode: "8517",
    barcode: "BC001",
    description: "iPhone 15 features a 6.1-inch Super Retina XDR display, A16 Bionic chip, and a 48MP main camera.",
    specifications: [
      { key: "Display", value: "6.1\" Super Retina XDR" },
      { key: "Chip", value: "A16 Bionic" },
      { key: "Camera", value: "48MP main + 12MP ultrawide" },
      { key: "Battery", value: "3349 mAh" },
      { key: "Storage", value: "128GB" },
      { key: "OS", value: "iOS 17" },
    ],
    images: [
      "https://images.unsplash.com/photo-1695048132628-76be6db4fe9f?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
  {
    _id: "p2",
    name: "Samsung Galaxy S24 256GB",
    brand: "Samsung",
    category: "Mobiles",
    sellingPrice: 74999,
    mrp: 85000,
    costPrice: 70000,
    stock: 8,
    lowStockThreshold: 5,
    gstPercent: 18,
    hsnCode: "8517",
    barcode: "BC002",
    description: "Galaxy S24 with Snapdragon 8 Gen 3, 50MP camera, and 7 years of OS updates.",
    specifications: [
      { key: "Display", value: "6.2\" Dynamic AMOLED 2X" },
      { key: "Processor", value: "Snapdragon 8 Gen 3" },
      { key: "Camera", value: "50MP + 12MP + 10MP" },
      { key: "Battery", value: "4000 mAh" },
      { key: "Storage", value: "256GB" },
      { key: "OS", value: "Android 14" },
    ],
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
  {
    _id: "p3",
    name: "OnePlus 12 256GB",
    brand: "OnePlus",
    category: "Mobiles",
    sellingPrice: 64999,
    mrp: 69999,
    costPrice: 60000,
    stock: 6,
    lowStockThreshold: 3,
    gstPercent: 18,
    barcode: "BC003",
    description: "OnePlus 12 with Snapdragon 8 Gen 3, Hasselblad camera system, and 100W SUPERVOOC charging.",
    specifications: [
      { key: "Display", value: "6.82\" LTPO AMOLED" },
      { key: "Processor", value: "Snapdragon 8 Gen 3" },
      { key: "Camera", value: "50MP Hasselblad triple" },
      { key: "Battery", value: "5400 mAh" },
      { key: "Charging", value: "100W wired, 50W wireless" },
    ],
    images: [
      "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
  {
    _id: "p4",
    name: "Redmi Note 13 Pro 128GB",
    brand: "Xiaomi",
    category: "Mobiles",
    sellingPrice: 26999,
    mrp: 32999,
    costPrice: 23000,
    stock: 20,
    lowStockThreshold: 5,
    gstPercent: 18,
    barcode: "BC004",
    description: "Redmi Note 13 Pro with 200MP camera, 67W turbo charging, and premium AMOLED display.",
    specifications: [
      { key: "Display", value: "6.67\" AMOLED 120Hz" },
      { key: "Camera", value: "200MP main" },
      { key: "Battery", value: "5100 mAh" },
      { key: "Charging", value: "67W Turbo" },
    ],
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },

  // ── Audio ──
  {
    _id: "p5",
    name: "Boat Airdopes 141",
    brand: "Boat",
    category: "Audio",
    sellingPrice: 1299,
    mrp: 2990,
    costPrice: 800,
    stock: 50,
    lowStockThreshold: 10,
    gstPercent: 18,
    barcode: "BC005",
    description: "Boat Airdopes 141 TWS earbuds with 42-hour total playback, Instacharge, and Beast Mode.",
    specifications: [
      { key: "Driver", value: "8mm" },
      { key: "Battery", value: "42 hrs total" },
      { key: "Charging", value: "Type-C, 10min=150min" },
      { key: "Water resistance", value: "IPX4" },
    ],
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
  {
    _id: "p6",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Audio",
    sellingPrice: 26990,
    mrp: 34990,
    costPrice: 22000,
    stock: 5,
    lowStockThreshold: 2,
    gstPercent: 18,
    barcode: "BC006",
    description: "Industry-leading noise cancelling headphones with 30-hour battery and crystal-clear call quality.",
    specifications: [
      { key: "Driver", value: "30mm" },
      { key: "Battery", value: "30 hrs (ANC on)" },
      { key: "ANC", value: "Industry leading" },
      { key: "Codec", value: "LDAC, AAC, SBC" },
    ],
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },

  // ── Earphones ──
  {
    _id: "p7",
    name: "Apple AirPods Pro 2nd Gen",
    brand: "Apple",
    category: "Earphones",
    sellingPrice: 24900,
    mrp: 29900,
    costPrice: 21000,
    stock: 9,
    lowStockThreshold: 3,
    gstPercent: 18,
    barcode: "BC007",
    description: "AirPods Pro with H2 chip, Adaptive Audio, Personalised Spatial Audio, and USB-C case.",
    specifications: [
      { key: "ANC", value: "Adaptive Transparency" },
      { key: "Battery", value: "6 hrs + 30 hrs case" },
      { key: "Chip", value: "Apple H2" },
      { key: "Water resistance", value: "IP54" },
    ],
    images: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
  {
    _id: "p8",
    name: "Samsung Galaxy Buds2 Pro",
    brand: "Samsung",
    category: "Earphones",
    sellingPrice: 11999,
    mrp: 17999,
    costPrice: 9500,
    stock: 14,
    lowStockThreshold: 4,
    gstPercent: 18,
    barcode: "BC008",
    description: "Galaxy Buds2 Pro with 360° Audio, IPX7 water resistance, and Intelligent ANC.",
    specifications: [
      { key: "ANC", value: "Intelligent ANC" },
      { key: "Battery", value: "5 hrs + 18 hrs case" },
      { key: "Audio", value: "360° Spatial Audio" },
      { key: "Water resistance", value: "IPX7" },
    ],
    images: [
      "https://images.unsplash.com/photo-1629367494173-c78a56567877?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },

  // ── Smart Watches ──
  {
    _id: "p9",
    name: "realme Watch 3",
    brand: "realme",
    category: "Smart Watches",
    sellingPrice: 3499,
    mrp: 4999,
    costPrice: 2000,
    stock: 2,
    lowStockThreshold: 5,
    gstPercent: 18,
    barcode: "BC009",
    description: "realme Watch 3 with 1.8\" large display, Bluetooth calling, and 100+ sports modes.",
    specifications: [
      { key: "Display", value: "1.8\" LCD" },
      { key: "Battery", value: "7 days" },
      { key: "Calling", value: "Bluetooth calling" },
      { key: "Sports modes", value: "100+" },
    ],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
  {
    _id: "p10",
    name: "Apple Watch Series 9 GPS 45mm",
    brand: "Apple",
    category: "Smart Watches",
    sellingPrice: 44900,
    mrp: 49900,
    costPrice: 40000,
    stock: 4,
    lowStockThreshold: 2,
    gstPercent: 18,
    barcode: "BC010",
    description: "Apple Watch Series 9 with S9 chip, Double Tap gesture, Always-On display, and crash detection.",
    specifications: [
      { key: "Display", value: "45mm Always-On Retina" },
      { key: "Chip", value: "Apple S9" },
      { key: "Battery", value: "18 hrs" },
      { key: "Health", value: "ECG, Blood Oxygen, Crash Detection" },
    ],
    images: [
      "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
  {
    _id: "p11",
    name: "Samsung Galaxy Watch 6 Classic 47mm",
    brand: "Samsung",
    category: "Smart Watches",
    sellingPrice: 32999,
    mrp: 39999,
    costPrice: 27000,
    stock: 6,
    lowStockThreshold: 2,
    gstPercent: 18,
    barcode: "BC011",
    description: "Galaxy Watch 6 Classic with rotating bezel, advanced health monitoring, and Wear OS.",
    specifications: [
      { key: "Display", value: "1.47\" Super AMOLED" },
      { key: "Battery", value: "40 hrs" },
      { key: "Health", value: "BIA, ECG, Blood pressure" },
      { key: "OS", value: "Wear OS 4" },
    ],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },

  // ── Chargers ──
  {
    _id: "p12",
    name: "Anker 65W GaN Charger",
    brand: "Anker",
    category: "Chargers",
    sellingPrice: 2499,
    mrp: 3499,
    costPrice: 1500,
    stock: 30,
    lowStockThreshold: 8,
    gstPercent: 18,
    barcode: "BC012",
    description: "Anker Nano Pro 65W GaN charger with 2 USB-C and 1 USB-A port. Charges MacBook, iPhone, Android.",
    specifications: [
      { key: "Output", value: "65W Max" },
      { key: "Ports", value: "2x USB-C, 1x USB-A" },
      { key: "Technology", value: "GaN II" },
      { key: "Compatibility", value: "MacBook, iPhone, Android" },
    ],
    images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
  {
    _id: "p13",
    name: "Apple 20W USB-C Power Adapter",
    brand: "Apple",
    category: "Chargers",
    sellingPrice: 1900,
    mrp: 2200,
    costPrice: 1400,
    stock: 40,
    lowStockThreshold: 10,
    gstPercent: 18,
    barcode: "BC013",
    description: "Apple 20W USB-C charger. Fast-charges iPhone 15 series. Compatible with iPad and AirPods.",
    specifications: [
      { key: "Output", value: "20W" },
      { key: "Port", value: "USB-C" },
      { key: "Compatibility", value: "iPhone 12 and later, iPad" },
    ],
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },

  // ── Laptops ──
  {
    _id: "p14",
    name: "MacBook Air M2 8GB 256GB",
    brand: "Apple",
    category: "Laptops",
    sellingPrice: 99900,
    mrp: 114900,
    costPrice: 90000,
    stock: 3,
    lowStockThreshold: 2,
    gstPercent: 18,
    barcode: "BC014",
    description: "MacBook Air M2 with 13.6\" Liquid Retina display, all-day battery life, and fanless design.",
    specifications: [
      { key: "Chip", value: "Apple M2" },
      { key: "RAM", value: "8GB unified" },
      { key: "Storage", value: "256GB SSD" },
      { key: "Display", value: "13.6\" Liquid Retina" },
      { key: "Battery", value: "18 hrs" },
    ],
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
  {
    _id: "p15",
    name: "Dell XPS 15 9530 16GB 512GB",
    brand: "Dell",
    category: "Laptops",
    sellingPrice: 149990,
    mrp: 179990,
    costPrice: 135000,
    stock: 2,
    lowStockThreshold: 2,
    gstPercent: 18,
    barcode: "BC015",
    description: "Dell XPS 15 with 13th Gen Intel i7, OLED display, NVIDIA RTX 4060, and thunderbolt 4.",
    specifications: [
      { key: "Processor", value: "Intel Core i7-13700H" },
      { key: "RAM", value: "16GB DDR5" },
      { key: "Storage", value: "512GB NVMe SSD" },
      { key: "Display", value: "15.6\" OLED 3.5K" },
      { key: "GPU", value: "NVIDIA RTX 4060 8GB" },
    ],
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop"
    ],
    isActive: true,
  },
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

const invoices = [
  {
    _id: "inv1",
    invoiceNumber: "INV-1042",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        product: { _id: "p1", name: "iPhone 15 128GB", brand: "Apple", category: "Mobiles", gstPercent: 18 },
        qty: 1,
        price: 69900,
        gstPercent: 18,
        subtotal: 69900,
        gstAmount: 12582,
      },
      {
        product: { _id: "p13", name: "Apple 20W USB-C Power Adapter", brand: "Apple", category: "Chargers", gstPercent: 18 },
        qty: 1,
        price: 1900,
        gstPercent: 18,
        subtotal: 1900,
        gstAmount: 342,
      },
    ],
    subtotal: 71800,
    gstAmount: 12924,
    total: 84724,
    paymentMode: "cash",
    customer: { _id: "c1", name: "Rahul Sharma", phone: "9876543210" },
  },
];
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

