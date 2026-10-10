import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './server/db';
import { generateAIBusinessPlan, generateAIBusinessInsights, generateAICashFlowForecast } from './server/gemini';
import { CURATED_SUPPLIERS } from './server/curatedSuppliers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware
interface AuthenticatedRequest extends Request {
  user?: any;
  business?: any;
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const authData = db.authenticateToken(token);
  if (!authData) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  req.user = authData.user;
  req.business = authData.business;
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, business } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const result = db.registerUser(name, email, password, business);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = db.loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  // Always fetch fresh business details
  const freshBusiness = db.getBusiness(req.business.id) || req.business;
  res.json({ user: req.user, business: freshBusiness });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.logoutUser(token);
  }
  res.json({ success: true });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    db.resetPassword(email, newPassword);
    res.json({ success: true, message: 'Password updated successfully. You can now login.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- BUSINESS PROFILE ---
app.get('/api/business', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const business = db.getBusiness(req.business.id);
  res.json(business);
});

app.put('/api/business', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateBusiness(req.business.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- BUSINESS PLAN & AI GENERATION ---
app.post('/api/ai/business-plan', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const input = {
      ...req.body,
      currency: req.business.currency || 'INR',
    };
    const result = await generateAIBusinessPlan(input);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate plan' });
  }
});

app.get('/api/business-plan', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const plan = db.getBusinessPlan(req.business.id);
  res.json(plan || null);
});

app.post('/api/business-plan', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const saved = db.saveBusinessPlan({
      ...req.body,
      businessId: req.business.id,
      userId: req.user.id,
    });
    res.json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- SUPPLIERS & CURATED DISCOVERY ---
app.get('/api/curated-suppliers', (req: Request, res: Response) => {
  res.json(CURATED_SUPPLIERS);
});

app.get('/api/suppliers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const suppliers = db.getSuppliers(req.business.id);
  res.json(suppliers);
});

app.post('/api/suppliers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const supplier = db.addSupplier({
      ...req.body,
      businessId: req.business.id,
      userId: req.user.id,
    });
    res.json(supplier);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/suppliers/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateSupplier(req.params.id, req.business.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteSupplier(req.params.id, req.business.id);
  res.json({ success });
});

// --- PRODUCTS & INVENTORY ---
app.get('/api/products', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const products = db.getProducts(req.business.id);
  res.json(products);
});

app.post('/api/products', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = db.addProduct({
      ...req.body,
      businessId: req.business.id,
      userId: req.user.id,
    });
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.business.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteProduct(req.params.id, req.business.id);
  res.json({ success });
});

app.get('/api/stock-movements', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const movements = db.getStockMovements(req.business.id);
  res.json(movements);
});

// --- SALES ---
app.get('/api/sales', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const sales = db.getSales(req.business.id);
  res.json(sales);
});

app.post('/api/sales', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sale = db.recordSale({
      ...req.body,
      businessId: req.business.id,
      userId: req.user.id,
    });
    res.json(sale);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/sales/:id/refund', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const refunded = db.refundSale(req.params.id, req.business.id);
    res.json(refunded);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- PURCHASES ---
app.get('/api/purchases', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const purchases = db.getPurchases(req.business.id);
  res.json(purchases);
});

app.post('/api/purchases', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const purchase = db.recordPurchase({
      ...req.body,
      businessId: req.business.id,
      userId: req.user.id,
    });
    res.json(purchase);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- EXPENSES ---
app.get('/api/expenses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const expenses = db.getExpenses(req.business.id);
  res.json(expenses);
});

app.post('/api/expenses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const expense = db.addExpense({
      ...req.body,
      businessId: req.business.id,
      userId: req.user.id,
    });
    res.json(expense);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteExpense(req.params.id, req.business.id);
  res.json({ success });
});

// --- FOOD SAFETY ---
app.get('/api/food-safety', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const incidents = db.getFoodSafetyIncidents(req.business.id);
  res.json(incidents);
});

app.post('/api/food-safety', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const incident = db.recordFoodSafetyIncident({
      ...req.body,
      businessId: req.business.id,
      userId: req.user.id,
    });
    res.json(incident);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifications = db.getNotifications(req.business.id);
  res.json(notifications);
});

app.post('/api/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.markNotificationAsRead(req.params.id, req.business.id);
  res.json({ success });
});

// --- FINANCIAL SUMMARY ---
app.get('/api/financials', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const summary = db.getFinancialSummary(req.business.id);
  res.json(summary);
});

// --- AI BUSINESS INSIGHTS ---
app.post('/api/ai/insights', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const financials = db.getFinancialSummary(req.business.id);
    const products = db.getProducts(req.business.id);
    const recentSales = db.getSales(req.business.id);
    const expenses = db.getExpenses(req.business.id);

    const insights = await generateAIBusinessInsights({
      businessName: req.business.name,
      category: req.business.categoryLabel || req.business.category,
      currency: req.business.currency || 'INR',
      financials,
      products,
      recentSales,
      expenses,
      stockAlerts: products.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock'),
    });

    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to synthesize insights' });
  }
});

// --- CASH FLOW FORECASTING ---
app.get('/api/cash-flow/forecast', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const forecast = db.getCashFlowForecast(req.business.id);
  res.json(forecast);
});

app.post('/api/cash-flow/forecast/ai', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cashFlowData = db.getCashFlowForecast(req.business.id);
    const aiAnalysis = await generateAICashFlowForecast({
      businessName: req.business.name,
      category: req.business.categoryLabel || req.business.category,
      currency: req.business.currency || 'INR',
      cashFlowData,
    });
    res.json(aiAnalysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate AI cash forecast' });
  }
});

app.put('/api/cash-flow/starting-balance', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startingCashBalance } = req.body;
    const updated = db.updateBusiness(req.business.id, {
      startingCashBalance: Number(startingCashBalance) || 0,
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- VITE MIDDLEWARE / STATIC ASSETS ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Brief2Build AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
