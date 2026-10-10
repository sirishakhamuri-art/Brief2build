import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Sale, Product, SaleItem } from '../types';
import { exportSalesReportPDF } from '../utils/pdfGenerator';
import {
  ShoppingCart,
  Plus,
  Search,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  DollarSign,
  User,
  Phone,
  FileText,
} from 'lucide-react';

export const SalesModule: React.FC = () => {
  const { business, formatCurrency, currency } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  // New Sale POS Modal
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'credit' | 'bank_transfer'>('upi');
  const [cartItems, setCartItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    purchasePrice: number;
    discount: number;
    maxStock: number;
    isExpired: boolean;
  }>>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [posError, setPosError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesData, prodData] = await Promise.all([
        api.get<Sale[]>('/api/sales'),
        api.get<Product[]>('/api/products'),
      ]);
      setSales(salesData || []);
      setProducts(prodData || []);
    } catch (err) {
      console.error('Failed to load sales data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [business?.id]);

  const handleOpenPOS = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('upi');
    setSelectedProductToAdd('');
    setPosError(null);
    setIsPosOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find((p) => p.id === selectedProductToAdd);
    if (!prod) return;

    // Safety check: is expired?
    const isExpired = prod.status === 'expired' || (prod.expiryDate && new Date(prod.expiryDate).getTime() < Date.now());
    if (isExpired) {
      setPosError(`Safety Alert: Product "${prod.name}" has expired and cannot be sold.`);
      return;
    }

    if (prod.currentStock <= 0) {
      setPosError(`Product "${prod.name}" is sold out.`);
      return;
    }

    const existingIndex = cartItems.findIndex((c) => c.productId === prod.id);
    if (existingIndex !== -1) {
      if (cartItems[existingIndex].quantity >= prod.currentStock) {
        setPosError(`Cannot add more than available inventory (${prod.currentStock} ${prod.unit}).`);
        return;
      }
      const copy = [...cartItems];
      copy[existingIndex].quantity += 1;
      setCartItems(copy);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: prod.id,
          productName: prod.name,
          quantity: 1,
          unitPrice: prod.sellingPrice,
          purchasePrice: prod.purchasePrice,
          discount: 0,
          maxStock: prod.currentStock,
          isExpired: false,
        },
      ]);
    }
    setPosError(null);
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleCompleteSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setPosError('Please add at least one product to the sale.');
      return;
    }

    // Double check quantities
    for (const item of cartItems) {
      if (item.quantity > item.maxStock) {
        setPosError(`Insufficient stock for "${item.productName}". Available: ${item.maxStock}, in cart: ${item.quantity}.`);
        return;
      }
    }

    const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const totalDiscount = cartItems.reduce((acc, item) => acc + item.discount, 0);
    const totalAmount = Math.max(0, subtotal - totalDiscount);

    const saleItems: SaleItem[] = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      purchasePrice: item.purchasePrice,
      discount: item.discount,
      total: item.quantity * item.unitPrice - item.discount,
    }));

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    try {
      await api.post('/api/sales', {
        invoiceNumber,
        date: new Date().toISOString(),
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        items: saleItems,
        subtotal,
        totalDiscount,
        totalAmount,
        paymentMethod,
        status: 'completed',
      });

      setIsPosOpen(false);
      fetchData();
    } catch (err: any) {
      setPosError(err.message || 'Failed to complete sale transaction');
    }
  };

  const handleRefund = async (sale: Sale) => {
    if (!window.confirm(`Issue full refund for invoice ${sale.invoiceNumber}? This will reverse the stock deduction.`)) {
      return;
    }
    try {
      await api.post(`/api/sales/${sale.id}/refund`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Refund processing failed');
    }
  };

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPayment = filterPayment === 'all' || s.paymentMethod === filterPayment;

    return matchesSearch && matchesPayment;
  });

  const totalGrossRevenue = sales
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const totalDiscount = cartItems.reduce((acc, item) => acc + item.discount, 0);
  const totalDue = Math.max(0, subtotal - totalDiscount);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Sales & Revenue Management</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Point-of-Sale Register & Daily Transactions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock deduction, multi-payment tracking (UPI/Cash/Card), and invoice records.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportSalesReportPDF(sales, business?.name || 'My_Business', 'All Time', currency)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sales PDF</span>
          </button>
          <button
            onClick={handleOpenPOS}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sale Checkout</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Total Recorded Sales</span>
          <p className="text-xl font-bold text-white font-mono mt-1">{sales.length}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Lifetime Gross Revenue</span>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{formatCurrency(totalGrossRevenue)}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Completed Orders</span>
          <p className="text-xl font-bold text-white font-mono mt-1">
            {sales.filter((s) => s.status === 'completed').length}
          </p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Refunded Transactions</span>
          <p className="text-xl font-bold text-rose-400 font-mono mt-1">
            {sales.filter((s) => s.status === 'refunded').length}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by invoice #, customer, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="credit">Store Credit</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Date & Time</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Items Sold</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                <th className="py-3 px-4 font-semibold text-right">COGS</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No sales recorded yet. Use "New Sale Checkout" to log your first transaction.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-medium text-white">{sale.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(sale.date).toLocaleDateString()}{' '}
                      {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{sale.customerName || 'Walk-in Customer'}</div>
                      {sale.customerPhone && (
                        <div className="text-[10px] text-slate-500">{sale.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {sale.items.map((i, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300">
                            {i.productName} <span className="text-slate-500">x{i.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase font-bold">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                      {formatCurrency(sale.cogsTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sale.status === 'refunded' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                          Refunded
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sale.status === 'completed' && (
                        <button
                          onClick={() => handleRefund(sale)}
                          title="Refund sale & restore stock"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 rounded text-[11px] font-semibold transition cursor-pointer flex items-center space-x-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale POS Checkout Modal */}
      {isPosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsPosOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              New Sale / Point of Sale Checkout
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add products from live stock. Stock will be automatically deducted upon completion.
            </p>

            {posError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{posError}</span>
              </div>
            )}

            {/* Product Selector */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 mb-4">
              <label className="block text-xs font-semibold text-slate-300">Select Item to Add</label>
              <div className="flex gap-2">
                <select
                  value={selectedProductToAdd}
                  onChange={(e) => setSelectedProductToAdd(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose product from inventory --</option>
                  {products.map((p) => {
                    const isExp = p.status === 'expired' || (p.expiryDate && new Date(p.expiryDate).getTime() < Date.now());
                    return (
                      <option key={p.id} value={p.id} disabled={isExp || p.currentStock <= 0}>
                        {p.name} ({p.sku}) — Available: {p.currentStock} {p.unit} — {formatCurrency(p.sellingPrice)}
                        {isExp ? ' [EXPIRED - CANNOT SELL]' : p.currentStock <= 0 ? ' [OUT OF STOCK]' : ''}
                      </option>
                    );
                  })}
                </select>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedProductToAdd}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Cart Table */}
            <div className="space-y-3 mb-4">
              <label className="block text-xs font-semibold text-slate-300">
                Cart Items ({cartItems.length})
              </label>
              {cartItems.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Your cart is empty. Select a product above to add.
                </div>
              ) : (
                <div className="space-y-2">
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{item.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Unit Price: {formatCurrency(item.unitPrice)} • In Stock: {item.maxStock}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Quantity</label>
                          <input
                            type="number"
                            min={1}
                            max={item.maxStock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(item.maxStock, Number(e.target.value)));
                              const copy = [...cartItems];
                              copy[idx].quantity = val;
                              setCartItems(copy);
                            }}
                            className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center font-mono text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Discount ({currency})</label>
                          <input
                            type="number"
                            min={0}
                            value={item.discount}
                            onChange={(e) => {
                              const copy = [...cartItems];
                              copy[idx].discount = Number(e.target.value);
                              setCartItems(copy);
                            }}
                            className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center font-mono text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="text-[10px] text-slate-400 block">Subtotal</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatCurrency(item.quantity * item.unitPrice - item.discount)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer & Payment Form */}
            <form onSubmit={handleCompleteSale} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ananya Verma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 99..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method *</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['upi', 'cash', 'card', 'credit', 'bank_transfer'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {method.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Total Items: {cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
                  {totalDiscount > 0 && <span className="ml-2 text-amber-400 font-semibold">(Discount: {formatCurrency(totalDiscount)})</span>}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Total Amount Due</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPosOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cartItems.length === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  Complete Sale & Print Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
