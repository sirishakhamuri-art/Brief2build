import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AppDatabase,
  User,
  Business,
  BusinessPlan,
  Supplier,
  Product,
  StockMovement,
  Sale,
  Purchase,
  Expense,
  FoodSafetyIncident,
  NotificationItem,
} from './types';
import { CURATED_SUPPLIERS } from './curatedSuppliers';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const initialDatabase: AppDatabase = {
  users: [],
  businesses: [],
  businessPlans: [],
  suppliers: [],
  products: [],
  stockMovements: [],
  sales: [],
  purchases: [],
  expenses: [],
  foodSafetyIncidents: [],
  notifications: [],
};

class DatabaseManager {
  private data: AppDatabase = { ...initialDatabase };
  private sessionTokens: Map<string, string> = new Map(); // token -> userId

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Error reading db.json, initializing fresh store:', err);
        this.data = { ...initialDatabase };
        this.save();
      }
    } else {
      this.seedInitialDemoData();
      this.save();
    }
  }

  private save() {
    try {
      const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  private seedInitialDemoData() {
    // Seed a standard demo user so reviewers/users can immediately test or log in
    const demoSalt = crypto.randomBytes(16).toString('hex');
    const demoPasswordHash = this.hashPassword('DemoPassword123!', demoSalt);

    const demoUserId = 'usr_demo_01';
    const demoBusinessId = 'biz_demo_01';

    const demoUser: User = {
      id: demoUserId,
      email: 'owner@brief2build.example.com',
      name: 'Priya Sharma',
      passwordHash: `${demoSalt}:${demoPasswordHash}`,
      role: 'owner',
      createdAt: new Date().toISOString(),
      businessId: demoBusinessId,
    };

    const demoBusiness: Business = {
      id: demoBusinessId,
      userId: demoUserId,
      name: 'Flourish Artisanal Bakery & Cafe',
      category: 'bakery_restaurant',
      categoryLabel: 'Bakery & Cafe',
      description: 'Specialty sourdough breads, custom celebration cakes, and artisanal pastries made with organic local ingredients.',
      location: 'Koramangala 4th Block, Bengaluru, KA',
      currency: 'INR',
      status: 'existing',
      startingBudget: 1500000,
      targetCustomers: 'Neighborhood families, cafe enthusiasts, office goers, and bespoke party clients',
      preferredSize: 'Boutique Storefront (600 sq ft)',
      equipmentNeeded: 'Commercial Double Deck Oven, 30L Spiral Mixer, Display Chiller, Espresso Machine',
      expectedLaunchDate: '2026-04-15',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    };

    // Seed suppliers from curated list for this demo business
    const demoSuppliers: Supplier[] = CURATED_SUPPLIERS.slice(0, 4).map((s, idx) => ({
      id: `sup_demo_${idx + 1}`,
      businessId: demoBusinessId,
      userId: demoUserId,
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      address: s.address,
      productCategories: s.productCategories,
      verified: s.verified,
      verificationStatusNote: s.verificationStatusNote,
      website: s.website,
      minOrderQuantity: s.minOrderQuantity,
      priceNotes: s.priceNotes,
      paymentTerms: s.paymentTerms,
      rating: s.rating,
      isFavorite: idx === 0 || idx === 1,
      isSystemCurated: true,
      createdAt: new Date().toISOString(),
    }));

    // Seed realistic products
    const demoProducts: Product[] = [
      {
        id: 'prod_01',
        businessId: demoBusinessId,
        userId: demoUserId,
        name: 'Organic Sourdough Loaf (750g)',
        category: 'Artisanal Breads',
        sku: 'BAK-SDR-750',
        purchasePrice: 65,
        sellingPrice: 190,
        currentStock: 24,
        minThreshold: 10,
        supplierId: 'sup_demo_1',
        supplierName: 'AgroFresh Wholesale Grains & Flours',
        unit: 'pcs',
        batchNumber: 'BATCH-2026-10-A',
        purchaseDate: '2026-10-08',
        expiryDate: '2026-10-14',
        status: 'in_stock',
        notes: 'Cold fermented for 36 hours. Best consumed within 5 days.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_02',
        businessId: demoBusinessId,
        userId: demoUserId,
        name: 'French Butter Croissant',
        category: 'Viennoiserie',
        sku: 'BAK-CRS-01',
        purchasePrice: 38,
        sellingPrice: 130,
        currentStock: 18,
        minThreshold: 12,
        supplierId: 'sup_demo_2',
        supplierName: 'Apex Dairy & Fats Distributing Corp',
        unit: 'pcs',
        batchNumber: 'BATCH-2026-10-B',
        purchaseDate: '2026-10-09',
        expiryDate: '2026-10-12',
        status: 'in_stock',
        notes: 'Laminated with 82% cultured French style butter.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_03',
        businessId: demoBusinessId,
        userId: demoUserId,
        name: 'Dutch Truffle Cake (1 Kg)',
        category: 'Celebration Cakes',
        sku: 'CAK-TRF-1K',
        purchasePrice: 320,
        sellingPrice: 890,
        currentStock: 4,
        minThreshold: 5,
        supplierId: 'sup_demo_1',
        supplierName: 'AgroFresh Wholesale Grains & Flours',
        unit: 'pcs',
        batchNumber: 'BATCH-2026-10-C',
        purchaseDate: '2026-10-08',
        expiryDate: '2026-10-15',
        status: 'low_stock',
        notes: 'Dark chocolate ganache with moist sponge.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_04',
        businessId: demoBusinessId,
        userId: demoUserId,
        name: 'Commercial Grade Unsalted Butter (25kg pack)',
        category: 'Raw Materials & Dairy',
        sku: 'RAW-BTR-25K',
        purchasePrice: 9500,
        sellingPrice: 11000,
        currentStock: 2,
        minThreshold: 3,
        supplierId: 'sup_demo_2',
        supplierName: 'Apex Dairy & Fats Distributing Corp',
        unit: 'boxes',
        batchNumber: 'APEX-BT-902',
        purchaseDate: '2026-10-01',
        expiryDate: '2026-12-01',
        status: 'low_stock',
        notes: 'Keep chilled below 4 deg Celsius.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_05',
        businessId: demoBusinessId,
        userId: demoUserId,
        name: 'Biodegradable Cake Boxes (Pack of 50)',
        category: 'Packaging',
        sku: 'PKG-BX-50',
        purchasePrice: 450,
        sellingPrice: 580,
        currentStock: 15,
        minThreshold: 5,
        supplierId: 'sup_demo_4',
        supplierName: 'EcoPack Sustainable Packaging Solutions',
        unit: 'packs',
        purchaseDate: '2026-09-25',
        status: 'in_stock',
        notes: 'Sturdy kraft food-safe boxes with display window.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Seed realistic stock movements
    const demoMovements: StockMovement[] = demoProducts.map((p, idx) => ({
      id: `mov_init_${idx + 1}`,
      businessId: demoBusinessId,
      productId: p.id,
      productName: p.name,
      changeType: 'purchase',
      delta: p.currentStock + 5,
      previousStock: 0,
      newStock: p.currentStock + 5,
      reason: 'Initial onboarding inventory batch receipt',
      timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    }));

    // Seed realistic sales
    const demoSales: Sale[] = [
      {
        id: 'sale_01',
        businessId: demoBusinessId,
        userId: demoUserId,
        invoiceNumber: 'INV-2026-001',
        date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        customerName: 'Ananya Verma',
        customerPhone: '+91 99881 22334',
        items: [
          {
            productId: 'prod_01',
            productName: 'Organic Sourdough Loaf (750g)',
            quantity: 2,
            unitPrice: 190,
            purchasePrice: 65,
            discount: 0,
            total: 380,
          },
          {
            productId: 'prod_02',
            productName: 'French Butter Croissant',
            quantity: 4,
            unitPrice: 130,
            purchasePrice: 38,
            discount: 20,
            total: 500,
          },
        ],
        subtotal: 900,
        totalDiscount: 20,
        totalAmount: 880,
        cogsTotal: (2 * 65) + (4 * 38), // 130 + 152 = 282
        paymentMethod: 'upi',
        status: 'completed',
        notes: 'Walk-in regular customer',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'sale_02',
        businessId: demoBusinessId,
        userId: demoUserId,
        invoiceNumber: 'INV-2026-002',
        date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        customerName: 'Vikram Mehta (Birthday Order)',
        customerPhone: '+91 98440 55112',
        items: [
          {
            productId: 'prod_03',
            productName: 'Dutch Truffle Cake (1 Kg)',
            quantity: 1,
            unitPrice: 890,
            purchasePrice: 320,
            discount: 0,
            total: 890,
          },
          {
            productId: 'prod_02',
            productName: 'French Butter Croissant',
            quantity: 6,
            unitPrice: 130,
            purchasePrice: 38,
            discount: 50,
            total: 730,
          },
        ],
        subtotal: 1670,
        totalDiscount: 50,
        totalAmount: 1620,
        cogsTotal: (1 * 320) + (6 * 38), // 320 + 228 = 548
        paymentMethod: 'card',
        status: 'completed',
        notes: 'Advance pickup scheduled at 4 PM',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'sale_03',
        businessId: demoBusinessId,
        userId: demoUserId,
        invoiceNumber: 'INV-2026-003',
        date: new Date().toISOString(),
        customerName: 'Sanjay Nair',
        customerPhone: '+91 97410 88990',
        items: [
          {
            productId: 'prod_01',
            productName: 'Organic Sourdough Loaf (750g)',
            quantity: 1,
            unitPrice: 190,
            purchasePrice: 65,
            discount: 0,
            total: 190,
          },
        ],
        subtotal: 190,
        totalDiscount: 0,
        totalAmount: 190,
        cogsTotal: 65,
        paymentMethod: 'cash',
        status: 'completed',
        notes: 'Morning fresh batch',
        createdAt: new Date().toISOString(),
      },
    ];

    // Seed realistic expenses
    const demoExpenses: Expense[] = [
      {
        id: 'exp_01',
        businessId: demoBusinessId,
        userId: demoUserId,
        date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
        category: 'rent',
        description: 'Storefront commercial lease (Monthly October)',
        amount: 35000,
        paymentMethod: 'Bank Transfer (NEFT)',
        notes: 'Koramangala commercial landlord',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_02',
        businessId: demoBusinessId,
        userId: demoUserId,
        date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
        category: 'electricity',
        description: 'BESCOM commercial electricity & refrigeration cooling',
        amount: 8400,
        paymentMethod: 'UPI',
        notes: 'High load due to baking deck oven',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_03',
        businessId: demoBusinessId,
        userId: demoUserId,
        date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
        category: 'salaries',
        description: 'Head Baker & Assistant Barista bi-weekly advance',
        amount: 28000,
        paymentMethod: 'Bank Transfer',
        notes: '2 Staff members',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_04',
        businessId: demoBusinessId,
        userId: demoUserId,
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
        category: 'packaging',
        description: 'Custom stamped bakery butter-paper & branded ribbons',
        amount: 2200,
        paymentMethod: 'UPI',
        notes: 'Eco-friendly supplies',
        createdAt: new Date().toISOString(),
      },
    ];

    // Seed realistic purchases
    const demoPurchases: Purchase[] = [
      {
        id: 'po_01',
        businessId: demoBusinessId,
        userId: demoUserId,
        poNumber: 'PO-2026-101',
        date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        supplierId: 'sup_demo_1',
        supplierName: 'AgroFresh Wholesale Grains & Flours',
        items: [
          {
            productId: 'prod_01',
            productName: 'Organic T55 Baking Flour (50kg bag)',
            quantity: 6,
            unitCost: 1900,
            total: 11400,
            batchNumber: 'BATCH-2026-10-A',
            expiryDate: '2026-11-20',
          },
        ],
        additionalCharges: 400,
        totalAmount: 11800,
        paymentStatus: 'paid',
        status: 'received',
        notes: 'Delivered in good condition with moisture seal',
        createdAt: new Date().toISOString(),
      },
    ];

    // Seed notifications
    const demoNotifications: NotificationItem[] = [
      {
        id: 'notif_01',
        businessId: demoBusinessId,
        userId: demoUserId,
        type: 'low_stock',
        title: 'Low Stock Alert: Dutch Truffle Cake (1 Kg)',
        message: 'Current stock is 4 units (Threshold: 5). Recommend placing a reorder or preparing a fresh batch.',
        read: false,
        linkSection: 'inventory',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif_02',
        businessId: demoBusinessId,
        userId: demoUserId,
        type: 'reorder_needed',
        title: 'Reorder Reminder: Unsalted Butter Pack',
        message: 'Only 2 boxes remaining. Apex Dairy delivery requires 48 hours lead time.',
        read: false,
        linkSection: 'suppliers',
        createdAt: new Date().toISOString(),
      },
    ];

    this.data = {
      users: [demoUser],
      businesses: [demoBusiness],
      businessPlans: [],
      suppliers: demoSuppliers,
      products: demoProducts,
      stockMovements: demoMovements,
      sales: demoSales,
      purchases: demoPurchases,
      expenses: demoExpenses,
      foodSafetyIncidents: [],
      notifications: demoNotifications,
    };
  }

  // --- Auth Helpers ---
  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  public registerUser(name: string, email: string, password: string, businessData?: Partial<Business>): { user: Omit<User, 'passwordHash'>; token: string; business: Business } {
    const existing = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword(password, salt);
    const userId = `usr_${crypto.randomUUID().slice(0, 8)}`;
    const businessId = `biz_${crypto.randomUUID().slice(0, 8)}`;

    const user: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash: `${salt}:${hash}`,
      role: 'owner',
      createdAt: new Date().toISOString(),
      businessId,
    };

    const business: Business = {
      id: businessId,
      userId,
      name: businessData?.name || `${name}'s Enterprise`,
      category: businessData?.category || 'other',
      categoryLabel: businessData?.categoryLabel || 'Business Enterprise',
      description: businessData?.description || 'Commercial operations and business venture.',
      location: businessData?.location || 'India',
      currency: businessData?.currency || 'INR',
      status: businessData?.status || 'planning',
      startingBudget: businessData?.startingBudget || 100000,
      targetCustomers: businessData?.targetCustomers,
      preferredSize: businessData?.preferredSize,
      equipmentNeeded: businessData?.equipmentNeeded,
      expectedLaunchDate: businessData?.expectedLaunchDate,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(user);
    this.data.businesses.push(business);

    // Auto seed curated suppliers matching user or available
    CURATED_SUPPLIERS.forEach((s, idx) => {
      this.data.suppliers.push({
        id: `sup_${crypto.randomUUID().slice(0, 8)}`,
        businessId,
        userId,
        name: s.name,
        contactPerson: s.contactPerson,
        phone: s.phone,
        email: s.email,
        address: s.address,
        productCategories: s.productCategories,
        verified: s.verified,
        verificationStatusNote: s.verificationStatusNote,
        website: s.website,
        minOrderQuantity: s.minOrderQuantity,
        priceNotes: s.priceNotes,
        paymentTerms: s.paymentTerms,
        rating: s.rating,
        isFavorite: false,
        isSystemCurated: true,
        createdAt: new Date().toISOString(),
      });
    });

    this.save();

    const token = crypto.randomBytes(32).toString('hex');
    this.sessionTokens.set(token, userId);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token, business };
  }

  public loginUser(email: string, password: string): { user: Omit<User, 'passwordHash'>; token: string; business: Business } {
    const user = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const [salt, storedHash] = user.passwordHash.split(':');
    const inputHash = this.hashPassword(password, salt);
    if (inputHash !== storedHash) {
      throw new Error('Invalid email or password.');
    }

    const business = this.data.businesses.find((b) => b.id === user.businessId) || {
      id: user.businessId,
      userId: user.id,
      name: `${user.name}'s Enterprise`,
      category: 'other',
      categoryLabel: 'Enterprise',
      description: '',
      location: 'India',
      currency: 'INR',
      status: 'planning',
      createdAt: new Date().toISOString(),
    };

    const token = crypto.randomBytes(32).toString('hex');
    this.sessionTokens.set(token, user.id);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token, business };
  }

  public authenticateToken(token: string): { user: Omit<User, 'passwordHash'>; business: Business } | null {
    const userId = this.sessionTokens.get(token);
    if (!userId) return null;

    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    const business = this.data.businesses.find((b) => b.id === user.businessId);
    if (!business) return null;

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, business };
  }

  public logoutUser(token: string): boolean {
    return this.sessionTokens.delete(token);
  }

  public resetPassword(email: string, newPassword: string): boolean {
    const user = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('No user found with this email address.');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword(newPassword, salt);
    user.passwordHash = `${salt}:${hash}`;
    this.save();
    return true;
  }

  // --- Business CRUD ---
  public getBusiness(businessId: string): Business | undefined {
    return this.data.businesses.find((b) => b.id === businessId);
  }

  public updateBusiness(businessId: string, updates: Partial<Business>): Business {
    const idx = this.data.businesses.findIndex((b) => b.id === businessId);
    if (idx === -1) throw new Error('Business record not found.');
    this.data.businesses[idx] = { ...this.data.businesses[idx], ...updates };
    this.save();
    return this.data.businesses[idx];
  }

  // --- Business Plan CRUD ---
  public getBusinessPlan(businessId: string): BusinessPlan | undefined {
    return this.data.businessPlans.find((p) => p.businessId === businessId);
  }

  public saveBusinessPlan(plan: Omit<BusinessPlan, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): BusinessPlan {
    const now = new Date().toISOString();
    const existingIdx = this.data.businessPlans.findIndex((p) => p.businessId === plan.businessId);

    if (existingIdx !== -1) {
      const updated: BusinessPlan = {
        ...this.data.businessPlans[existingIdx],
        ...plan,
        updatedAt: now,
      };
      this.data.businessPlans[existingIdx] = updated;
      this.save();
      return updated;
    } else {
      const newPlan: BusinessPlan = {
        ...plan,
        id: plan.id || `plan_${crypto.randomUUID().slice(0, 8)}`,
        createdAt: now,
        updatedAt: now,
      };
      this.data.businessPlans.push(newPlan);
      this.save();
      return newPlan;
    }
  }

  // --- Products & Inventory CRUD ---
  public getProducts(businessId: string): Product[] {
    return this.data.products.filter((p) => p.businessId === businessId);
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const now = new Date().toISOString();
    const id = `prod_${crypto.randomUUID().slice(0, 8)}`;

    let status: Product['status'] = 'in_stock';
    if (product.currentStock <= 0) {
      status = 'out_of_stock';
    } else if (product.currentStock <= product.minThreshold) {
      status = 'low_stock';
    }

    if (product.expiryDate) {
      const exp = new Date(product.expiryDate).getTime();
      if (exp < Date.now()) {
        status = 'expired';
      }
    }

    const newProd: Product = {
      ...product,
      id,
      status,
      createdAt: now,
      updatedAt: now,
    };

    this.data.products.push(newProd);

    // Record initial stock movement
    if (product.currentStock > 0) {
      this.data.stockMovements.push({
        id: `mov_${crypto.randomUUID().slice(0, 8)}`,
        businessId: product.businessId,
        productId: id,
        productName: product.name,
        changeType: 'adjustment',
        delta: product.currentStock,
        previousStock: 0,
        newStock: product.currentStock,
        reason: 'Initial stock setup',
        timestamp: now,
      });
    }

    // Check low stock notification
    if (status === 'low_stock' || status === 'out_of_stock') {
      this.createNotification({
        businessId: product.businessId,
        userId: product.userId,
        type: 'low_stock',
        title: `Low Stock: ${product.name}`,
        message: `Current stock is ${product.currentStock} ${product.unit} (Threshold: ${product.minThreshold}).`,
        read: false,
        linkSection: 'inventory',
      });
    }

    this.save();
    return newProd;
  }

  public updateProduct(productId: string, businessId: string, updates: Partial<Product>): Product {
    const idx = this.data.products.findIndex((p) => p.id === productId && p.businessId === businessId);
    if (idx === -1) throw new Error('Product not found');

    const prev = this.data.products[idx];
    const newStock = updates.currentStock !== undefined ? updates.currentStock : prev.currentStock;
    const minThreshold = updates.minThreshold !== undefined ? updates.minThreshold : prev.minThreshold;

    let status = updates.status || prev.status;
    if (newStock <= 0) {
      status = 'out_of_stock';
    } else if (newStock <= minThreshold) {
      status = 'low_stock';
    } else {
      status = 'in_stock';
    }

    const expiryDate = updates.expiryDate || prev.expiryDate;
    if (expiryDate && new Date(expiryDate).getTime() < Date.now()) {
      status = 'expired';
    }

    const now = new Date().toISOString();
    const updatedProd: Product = {
      ...prev,
      ...updates,
      currentStock: newStock,
      status,
      updatedAt: now,
    };

    this.data.products[idx] = updatedProd;

    // If stock changed directly via edit, record adjustment
    if (updates.currentStock !== undefined && updates.currentStock !== prev.currentStock) {
      const delta = updates.currentStock - prev.currentStock;
      this.data.stockMovements.push({
        id: `mov_${crypto.randomUUID().slice(0, 8)}`,
        businessId,
        productId,
        productName: updatedProd.name,
        changeType: 'adjustment',
        delta,
        previousStock: prev.currentStock,
        newStock: updates.currentStock,
        reason: 'Manual inventory adjustment',
        timestamp: now,
      });
    }

    this.save();
    return updatedProd;
  }

  public deleteProduct(productId: string, businessId: string): boolean {
    const idx = this.data.products.findIndex((p) => p.id === productId && p.businessId === businessId);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  public getStockMovements(businessId: string): StockMovement[] {
    return this.data.stockMovements
      .filter((m) => m.businessId === businessId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // --- Sales Record & Automatic Stock Deduction ---
  public getSales(businessId: string): Sale[] {
    return this.data.sales
      .filter((s) => s.businessId === businessId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public recordSale(saleData: Omit<Sale, 'id' | 'createdAt' | 'cogsTotal'>): Sale {
    const now = new Date().toISOString();
    const saleId = `sale_${crypto.randomUUID().slice(0, 8)}`;

    // 1. Validate all items and check stock & expiry
    let computedCogs = 0;
    for (const item of saleData.items) {
      const prod = this.data.products.find((p) => p.id === item.productId && p.businessId === saleData.businessId);
      if (!prod) {
        throw new Error(`Product "${item.productName}" not found in inventory.`);
      }

      // Check expiry validation
      if (prod.status === 'expired' || (prod.expiryDate && new Date(prod.expiryDate).getTime() < Date.now())) {
        throw new Error(`Safety Warning: Product "${prod.name}" has expired and cannot be sold. Please remove or quarantine.`);
      }

      // Check stock sufficiency
      if (prod.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.currentStock}, Requested: ${item.quantity}.`);
      }

      // Compute COGS
      const unitCost = item.purchasePrice || prod.purchasePrice || 0;
      computedCogs += item.quantity * unitCost;
    }

    // 2. Perform atomic stock deductions & record movements
    for (const item of saleData.items) {
      const prod = this.data.products.find((p) => p.id === item.productId && p.businessId === saleData.businessId)!;
      const prevStock = prod.currentStock;
      const newStock = prevStock - item.quantity;
      prod.currentStock = newStock;
      prod.updatedAt = now;

      if (newStock <= 0) {
        prod.status = 'out_of_stock';
      } else if (newStock <= prod.minThreshold) {
        prod.status = 'low_stock';
      }

      this.data.stockMovements.push({
        id: `mov_${crypto.randomUUID().slice(0, 8)}`,
        businessId: saleData.businessId,
        productId: prod.id,
        productName: prod.name,
        changeType: 'sale',
        delta: -item.quantity,
        previousStock: prevStock,
        newStock,
        referenceId: saleId,
        reason: `Sold via Invoice ${saleData.invoiceNumber}`,
        timestamp: now,
      });

      // Low stock notification trigger
      if (newStock <= prod.minThreshold) {
        this.createNotification({
          businessId: saleData.businessId,
          userId: saleData.userId,
          type: 'low_stock',
          title: `Low Stock Alert: ${prod.name}`,
          message: `Stock dropped to ${newStock} ${prod.unit} after sale. Reorder recommended.`,
          read: false,
          linkSection: 'inventory',
        });
      }
    }

    const sale: Sale = {
      ...saleData,
      id: saleId,
      cogsTotal: computedCogs,
      createdAt: now,
    };

    this.data.sales.push(sale);
    this.save();
    return sale;
  }

  public refundSale(saleId: string, businessId: string): Sale {
    const sale = this.data.sales.find((s) => s.id === saleId && s.businessId === businessId);
    if (!sale) throw new Error('Sale not found.');
    if (sale.status === 'refunded') throw new Error('Sale is already refunded.');

    const now = new Date().toISOString();
    sale.status = 'refunded';

    // Reverse stock deductions
    for (const item of sale.items) {
      const prod = this.data.products.find((p) => p.id === item.productId && p.businessId === businessId);
      if (prod) {
        const prevStock = prod.currentStock;
        const newStock = prevStock + item.quantity;
        prod.currentStock = newStock;
        prod.updatedAt = now;
        if (newStock > prod.minThreshold && prod.status !== 'expired') {
          prod.status = 'in_stock';
        }

        this.data.stockMovements.push({
          id: `mov_${crypto.randomUUID().slice(0, 8)}`,
          businessId,
          productId: prod.id,
          productName: prod.name,
          changeType: 'return',
          delta: item.quantity,
          previousStock: prevStock,
          newStock,
          referenceId: saleId,
          reason: `Returned & refunded from Invoice ${sale.invoiceNumber}`,
          timestamp: now,
        });
      }
    }

    this.save();
    return sale;
  }

  // --- Purchases & Automatic Stock Replenishment ---
  public getPurchases(businessId: string): Purchase[] {
    return this.data.purchases
      .filter((p) => p.businessId === businessId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public recordPurchase(purchaseData: Omit<Purchase, 'id' | 'createdAt'>): Purchase {
    const now = new Date().toISOString();
    const purchaseId = `po_${crypto.randomUUID().slice(0, 8)}`;

    const purchase: Purchase = {
      ...purchaseData,
      id: purchaseId,
      createdAt: now,
    };

    // If purchase status is received, immediately update inventory stock
    if (purchase.status === 'received') {
      for (const item of purchase.items) {
        if (item.productId) {
          const prod = this.data.products.find((p) => p.id === item.productId && p.businessId === purchaseData.businessId);
          if (prod) {
            const prevStock = prod.currentStock;
            const newStock = prevStock + item.quantity;
            prod.currentStock = newStock;
            if (item.unitCost > 0) {
              prod.purchasePrice = item.unitCost;
            }
            if (item.batchNumber) prod.batchNumber = item.batchNumber;
            if (item.expiryDate) prod.expiryDate = item.expiryDate;
            prod.updatedAt = now;

            if (newStock > prod.minThreshold && prod.status !== 'expired') {
              prod.status = 'in_stock';
            }

            this.data.stockMovements.push({
              id: `mov_${crypto.randomUUID().slice(0, 8)}`,
              businessId: purchaseData.businessId,
              productId: prod.id,
              productName: prod.name,
              changeType: 'purchase',
              delta: item.quantity,
              previousStock: prevStock,
              newStock,
              referenceId: purchaseId,
              reason: `Stock receipt from PO ${purchase.poNumber} (${purchase.supplierName})`,
              timestamp: now,
            });
          }
        }
      }
    }

    this.data.purchases.push(purchase);
    this.save();
    return purchase;
  }

  // --- Expenses CRUD ---
  public getExpenses(businessId: string): Expense[] {
    return this.data.expenses
      .filter((e) => e.businessId === businessId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const now = new Date().toISOString();
    const expense: Expense = {
      ...expenseData,
      id: `exp_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: now,
    };
    this.data.expenses.push(expense);
    this.save();
    return expense;
  }

  public deleteExpense(expenseId: string, businessId: string): boolean {
    const idx = this.data.expenses.findIndex((e) => e.id === expenseId && e.businessId === businessId);
    if (idx === -1) return false;
    this.data.expenses.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Suppliers CRUD ---
  public getSuppliers(businessId: string): Supplier[] {
    return this.data.suppliers.filter((s) => s.businessId === businessId);
  }

  public addSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const supplier: Supplier = {
      ...supplierData,
      id: `sup_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.suppliers.push(supplier);
    this.save();
    return supplier;
  }

  public updateSupplier(supplierId: string, businessId: string, updates: Partial<Supplier>): Supplier {
    const idx = this.data.suppliers.findIndex((s) => s.id === supplierId && s.businessId === businessId);
    if (idx === -1) throw new Error('Supplier not found');
    this.data.suppliers[idx] = { ...this.data.suppliers[idx], ...updates };
    this.save();
    return this.data.suppliers[idx];
  }

  public deleteSupplier(supplierId: string, businessId: string): boolean {
    const idx = this.data.suppliers.findIndex((s) => s.id === supplierId && s.businessId === businessId);
    if (idx === -1) return false;
    this.data.suppliers.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Food Safety & Incidents ---
  public getFoodSafetyIncidents(businessId: string): FoodSafetyIncident[] {
    return this.data.foodSafetyIncidents
      .filter((i) => i.businessId === businessId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public recordFoodSafetyIncident(incidentData: Omit<FoodSafetyIncident, 'id' | 'createdAt'>): FoodSafetyIncident {
    const now = new Date().toISOString();
    const id = `safe_${crypto.randomUUID().slice(0, 8)}`;
    const incident: FoodSafetyIncident = {
      ...incidentData,
      id,
      createdAt: now,
    };

    // If quarantine quantity is provided and product exists, quarantine stock
    if (incidentData.productId && incidentData.stockQuarantinedQty && incidentData.stockQuarantinedQty > 0) {
      const prod = this.data.products.find((p) => p.id === incidentData.productId && p.businessId === incidentData.businessId);
      if (prod) {
        const qtyToQuarantine = Math.min(prod.currentStock, incidentData.stockQuarantinedQty);
        const prevStock = prod.currentStock;
        const newStock = prevStock - qtyToQuarantine;
        prod.currentStock = newStock;
        prod.status = 'on_hold';
        prod.updatedAt = now;

        this.data.stockMovements.push({
          id: `mov_${crypto.randomUUID().slice(0, 8)}`,
          businessId: incidentData.businessId,
          productId: prod.id,
          productName: prod.name,
          changeType: 'quarantine',
          delta: -qtyToQuarantine,
          previousStock: prevStock,
          newStock,
          referenceId: id,
          reason: `Safety Quarantine: ${incidentData.incidentType} - ${incidentData.description.slice(0, 50)}`,
          timestamp: now,
        });
      }
    }

    // High/critical severity generates notification
    if (incidentData.severity === 'high' || incidentData.severity === 'critical') {
      this.createNotification({
        businessId: incidentData.businessId,
        userId: incidentData.userId,
        type: 'safety_alert',
        title: `Food Safety Alert: ${incidentData.incidentType}`,
        message: `${incidentData.description}. Immediate action required.`,
        read: false,
        linkSection: 'safety',
      });
    }

    this.data.foodSafetyIncidents.push(incident);
    this.save();
    return incident;
  }

  // --- Notifications ---
  public getNotifications(businessId: string): NotificationItem[] {
    return this.data.notifications
      .filter((n) => n.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(n: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const item: NotificationItem = {
      ...n,
      id: `notif_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(item);
    if (this.data.notifications.length > 50) {
      this.data.notifications.pop();
    }
    this.save();
    return item;
  }

  public markNotificationAsRead(id: string, businessId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.businessId === businessId);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  // --- Financial & Dashboard Aggregates ---
  public getFinancialSummary(businessId: string, monthOffset: number = 0) {
    const sales = this.data.sales.filter((s) => s.businessId === businessId && s.status === 'completed');
    const expenses = this.data.expenses.filter((e) => e.businessId === businessId);
    const products = this.data.products.filter((p) => p.businessId === businessId);
    const purchases = this.data.purchases.filter((p) => p.businessId === businessId);

    // Total Inventory Value = currentStock * purchasePrice
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);

    // Today's Date
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter((s) => s.date.startsWith(todayStr));
    const todaySalesRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);

    // Lifetime Revenue & COGS
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalCOGS = sales.reduce((acc, s) => acc + s.cogsTotal, 0);
    const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalOperatingExpenses;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Monthly breakdown (last 6 months)
    const monthlyData: Array<{
      month: string;
      revenue: number;
      cogs: number;
      grossProfit: number;
      expenses: number;
      netProfit: number;
    }> = [];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });

      const mSales = sales.filter((s) => s.date.startsWith(yearMonth));
      const mExpenses = expenses.filter((e) => e.date.startsWith(yearMonth));

      const mRev = mSales.reduce((acc, s) => acc + s.totalAmount, 0);
      const mCogs = mSales.reduce((acc, s) => acc + s.cogsTotal, 0);
      const mGross = mRev - mCogs;
      const mExp = mExpenses.reduce((acc, e) => acc + e.amount, 0);
      const mNet = mGross - mExp;

      monthlyData.push({
        month: monthLabel,
        revenue: mRev,
        cogs: mCogs,
        grossProfit: mGross,
        expenses: mExp,
        netProfit: mNet,
      });
    }

    // Current Month Metrics
    const currentMonthLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const curMonthSales = sales.filter((s) => s.date.startsWith(currentMonthLabel));
    const curMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthLabel));
    const curMonthRevenue = curMonthSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const curMonthCogs = curMonthSales.reduce((acc, s) => acc + s.cogsTotal, 0);
    const curMonthOperatingExpenses = curMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const curMonthGrossProfit = curMonthRevenue - curMonthCogs;
    const curMonthNetProfit = curMonthGrossProfit - curMonthOperatingExpenses;

    // Expense Category Breakdown
    const expenseByCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
    });

    // Best-selling products (actual sales data)
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    sales.forEach((s) => {
      s.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.total;
      });
    });

    const topSellingProducts = Object.entries(productSalesMap)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Low stock & out of stock counts
    const lowStockCount = products.filter((p) => p.status === 'low_stock' || (p.currentStock <= p.minThreshold && p.currentStock > 0)).length;
    const outOfStockCount = products.filter((p) => p.status === 'out_of_stock' || p.currentStock === 0).length;
    const expiredCount = products.filter((p) => p.status === 'expired').length;

    return {
      todaySalesRevenue,
      todaySalesCount: todaySales.length,
      currentMonthRevenue: curMonthRevenue,
      currentMonthOperatingExpenses: curMonthOperatingExpenses,
      currentMonthGrossProfit: curMonthGrossProfit,
      currentMonthNetProfit: curMonthNetProfit,
      totalInventoryValue,
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalOperatingExpenses,
      netProfit,
      grossMarginPercent,
      netMarginPercent,
      monthlyData,
      expenseByCategory,
      topSellingProducts,
      lowStockCount,
      outOfStockCount,
      expiredCount,
      totalProductsCount: products.length,
      totalPurchasesCount: purchases.length,
    };
  }

  public getCashFlowForecast(businessId: string) {
    const business = this.getBusiness(businessId);
    const sales = this.data.sales.filter((s) => s.businessId === businessId && s.status === 'completed');
    const expenses = this.data.expenses.filter((e) => e.businessId === businessId);
    const purchases = this.data.purchases.filter((p) => p.businessId === businessId);

    // Initial Capital / Cash Reserve
    const initialCash = business?.startingCashBalance !== undefined
      ? business.startingCashBalance
      : (business?.startingBudget || 150000);

    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalPurchasesPaid = purchases
      .filter((p) => p.paymentStatus === 'paid' || p.status === 'received')
      .reduce((acc, p) => acc + p.totalAmount, 0);
    const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    // Current estimated liquid cash balance
    const currentCashBalance = Math.max(0, initialCash + totalRevenue - totalPurchasesPaid - totalOperatingExpenses);

    // Group historical months (last 3 recorded or recent months)
    const now = new Date();
    const historicalMonths: Array<{
      month: string;
      revenue: number;
      expenses: number;
      cogs: number;
      purchases: number;
      netCash: number;
    }> = [];

    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });

      const mSales = sales.filter((s) => s.date.startsWith(yearMonth));
      const mExpenses = expenses.filter((e) => e.date.startsWith(yearMonth));
      const mPurchases = purchases.filter((p) => p.date.startsWith(yearMonth));

      const rev = mSales.reduce((acc, s) => acc + s.totalAmount, 0);
      const cogs = mSales.reduce((acc, s) => acc + s.cogsTotal, 0);
      const exp = mExpenses.reduce((acc, e) => acc + e.amount, 0);
      const purch = mPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
      const netCash = rev - exp - purch;

      historicalMonths.push({
        month: monthLabel,
        revenue: rev,
        expenses: exp,
        cogs,
        purchases: purch,
        netCash,
      });
    }

    // Historical Averages & Run-Rates
    const validRevMonths = historicalMonths.filter((m) => m.revenue > 0);
    const avgMonthlyRev = validRevMonths.length > 0
      ? validRevMonths.reduce((acc, m) => acc + m.revenue, 0) / validRevMonths.length
      : (totalRevenue > 0 ? totalRevenue : 45000);

    const validExpMonths = historicalMonths.filter((m) => m.expenses > 0);
    const avgMonthlyExp = validExpMonths.length > 0
      ? validExpMonths.reduce((acc, m) => acc + m.expenses, 0) / validExpMonths.length
      : (totalOperatingExpenses > 0 ? totalOperatingExpenses : 30000);

    const avgMonthlyCogs = validRevMonths.length > 0
      ? validRevMonths.reduce((acc, m) => acc + m.cogs, 0) / validRevMonths.length
      : avgMonthlyRev * 0.4;

    // Fixed vs Variable split (rent & salaries are typically ~75% of operating overhead)
    const fixedExpenses = Math.round(avgMonthlyExp * 0.75);
    const variableExpensesRatio = avgMonthlyExp > 0 ? (avgMonthlyExp * 0.25) / Math.max(1, avgMonthlyRev) : 0.1;

    // Generate 3-Month Forecast Scenarios
    const generateForecast = (revMultiplier: number, expMultiplier: number, growthRate: number) => {
      const forecast: any[] = [];
      let runningCash = currentCashBalance;

      for (let m = 1; m <= 3; m++) {
        const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
        const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });

        const compoundedGrowth = Math.pow(1 + growthRate, m);
        const projectedRevenue = Math.round(avgMonthlyRev * revMultiplier * compoundedGrowth);
        const projectedCOGS = Math.round(projectedRevenue * 0.4);
        const projectedOperatingExpenses = Math.round((fixedExpenses + (projectedRevenue * variableExpensesRatio)) * expMultiplier);
        
        // Net Cash Flow for the month
        const netCashFlow = projectedRevenue - projectedCOGS - projectedOperatingExpenses;
        const openingCashBalance = runningCash;
        const closingCashBalance = openingCashBalance + netCashFlow;
        runningCash = closingCashBalance;

        forecast.push({
          monthIndex: m,
          monthLabel,
          isHistorical: false,
          openingCashBalance,
          projectedRevenue,
          projectedCOGS,
          projectedOperatingExpenses,
          netCashFlow,
          closingCashBalance,
          breakdown: {
            fixedExpenses,
            variableExpenses: projectedOperatingExpenses - fixedExpenses,
            inventoryPurchases: projectedCOGS,
          },
        });
      }
      return forecast;
    };

    const expected = generateForecast(1.0, 1.0, 0.05); // 5% steady growth
    const conservative = generateForecast(0.85, 1.08, -0.02); // -15% sales stress, +8% overhead
    const aggressive = generateForecast(1.20, 1.05, 0.12); // +20% upside, 12% growth

    // Key Liquidity Metrics
    const expectedMonth1 = expected[0];
    const avgNetCashFlow = expected.reduce((acc, m) => acc + m.netCashFlow, 0) / expected.length;
    const averageMonthlyBurnRate = avgNetCashFlow < 0 ? Math.abs(avgNetCashFlow) : 0;
    const projectedRunwayMonths = averageMonthlyBurnRate > 0
      ? Number((currentCashBalance / averageMonthlyBurnRate).toFixed(1))
      : 99; // Cash flow positive

    const lowestProjectedBalance = Math.min(...expected.map((m) => m.closingCashBalance));
    const safetyBufferNeeded = Math.round(avgMonthlyExp * 2); // 2 months buffer

    let surplusOrDeficit: 'surplus' | 'deficit' | 'stable' = 'stable';
    if (lowestProjectedBalance < 0) {
      surplusOrDeficit = 'deficit';
    } else if (lowestProjectedBalance > safetyBufferNeeded * 1.5) {
      surplusOrDeficit = 'surplus';
    }

    return {
      currentCashBalance,
      historicalMonths,
      forecastMonths: expected,
      scenarios: {
        conservative,
        expected,
        aggressive,
      },
      metrics: {
        averageMonthlyBurnRate,
        projectedRunwayMonths,
        lowestProjectedBalance,
        surplusOrDeficit,
        safetyBufferNeeded,
      },
    };
  }
}

export const db = new DatabaseManager();
