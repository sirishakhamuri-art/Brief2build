export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'owner' | 'admin';
  createdAt: string;
  businessId: string;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  category: 'bakery_restaurant' | 'clothing' | 'grocery' | 'electronics' | 'services' | 'manufacturing' | 'other';
  categoryLabel: string;
  description: string;
  location: string;
  currency: string;
  status: 'planning' | 'launched' | 'existing';
  startingBudget?: number;
  startingCashBalance?: number;
  targetCustomers?: string;
  preferredSize?: string;
  equipmentNeeded?: string;
  expectedLaunchDate?: string;
  createdAt: string;
}

export interface BusinessPlan {
  id: string;
  businessId: string;
  userId: string;
  summary: string;
  targetMarket: string;
  requiredEquipment: Array<{
    name: string;
    estimatedCost: number;
    purpose: string;
  }>;
  startupExpenses: Array<{
    item: string;
    cost: number;
    category: string;
  }>;
  monthlyOperatingExpenses: Array<{
    item: string;
    cost: number;
    category: string;
  }>;
  budgetAllocation: Array<{
    category: string;
    percentage: number;
    amount: number;
  }>;
  launchTimeline: Array<{
    phase: string;
    timeframe: string;
    milestones: string[];
  }>;
  risksAndRecommendations: Array<{
    risk: string;
    recommendation: string;
  }>;
  salesAndBreakEvenEstimates: {
    estimatedMonthlySalesUnits: number;
    averageUnitPrice: number;
    estimatedMonthlyRevenue: number;
    estimatedCOGS: number;
    breakEvenMonthlyUnits: number;
    breakEvenMonthlyRevenue: number;
    assumptions: string;
    missingInfoNotes: string;
    disclaimer: string;
  };
  followUpQuestions?: string[];
  userNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  userId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  productCategories: string[];
  verified: boolean;
  verificationStatusNote: string;
  website?: string;
  minOrderQuantity?: string;
  priceNotes?: string;
  paymentTerms?: string;
  rating?: number;
  isFavorite?: boolean;
  isSystemCurated?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  userId: string;
  name: string;
  category: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minThreshold: number;
  supplierId?: string;
  supplierName?: string;
  unit: string;
  batchNumber?: string;
  purchaseDate?: string;
  expiryDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_hold' | 'expired';
  customFields?: Record<string, string>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  changeType: 'purchase' | 'sale' | 'adjustment' | 'return' | 'quarantine' | 'waste';
  delta: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  reason: string;
  timestamp: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  businessId: string;
  userId: string;
  invoiceNumber: string;
  date: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  cogsTotal: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'credit' | 'bank_transfer';
  status: 'completed' | 'refunded';
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Purchase {
  id: string;
  businessId: string;
  userId: string;
  poNumber: string;
  date: string;
  supplierId?: string;
  supplierName: string;
  items: PurchaseItem[];
  additionalCharges: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  status: 'received' | 'ordered' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  userId: string;
  date: string;
  category: 'rent' | 'electricity' | 'salaries' | 'raw_materials' | 'transportation' | 'packaging' | 'equipment' | 'marketing' | 'maintenance' | 'other';
  description: string;
  amount: number;
  paymentMethod: string;
  receiptRef?: string;
  notes?: string;
  createdAt: string;
}

export interface FoodSafetyIncident {
  id: string;
  businessId: string;
  userId: string;
  date: string;
  incidentType: 'customer_complaint' | 'spoiled_batch' | 'temperature_excursion' | 'supplier_recall' | 'packaging_defect';
  batchNumber?: string;
  productId?: string;
  productName?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionTaken: string;
  stockQuarantinedQty?: number;
  status: 'investigating' | 'resolved' | 'escalated';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  businessId: string;
  userId: string;
  type: 'low_stock' | 'expired_product' | 'expiring_soon' | 'safety_alert' | 'reorder_needed' | 'milestone';
  title: string;
  message: string;
  read: boolean;
  linkSection?: string;
  createdAt: string;
}

export interface AppDatabase {
  users: User[];
  businesses: Business[];
  businessPlans: BusinessPlan[];
  suppliers: Supplier[];
  products: Product[];
  stockMovements: StockMovement[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  foodSafetyIncidents: FoodSafetyIncident[];
  notifications: NotificationItem[];
  sessions?: Record<string, string>;
}
