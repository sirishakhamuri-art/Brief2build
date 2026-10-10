import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Product, StockMovement, Supplier } from '../types';
import { exportInventoryReportPDF } from '../utils/pdfGenerator';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  History,
  Download,
  Edit2,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  X,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const ProductsInventory: React.FC = () => {
  const { business, formatCurrency, currency } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Inventory physical count audit');
  const [isMovementsDrawerOpen, setIsMovementsDrawerOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formCurrentStock, setFormCurrentStock] = useState<number>(0);
  const [formMinThreshold, setFormMinThreshold] = useState<number>(5);
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formUnit, setFormUnit] = useState('pcs');
  const [formBatchNumber, setFormBatchNumber] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodData, supData, movData] = await Promise.all([
        api.get<Product[]>('/api/products'),
        api.get<Supplier[]>('/api/suppliers'),
        api.get<StockMovement[]>('/api/stock-movements'),
      ]);
      setProducts(prodData || []);
      setSuppliers(supData || []);
      setMovements(movData || []);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [business?.id]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('General');
    setFormSku(`SKU-${Date.now().toString().slice(-4)}`);
    setFormPurchasePrice(0);
    setFormSellingPrice(0);
    setFormCurrentStock(10);
    setFormMinThreshold(5);
    setFormSupplierId(suppliers[0]?.id || '');
    setFormUnit('pcs');
    setFormBatchNumber('');
    setFormExpiryDate('');
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormSku(prod.sku);
    setFormPurchasePrice(prod.purchasePrice);
    setFormSellingPrice(prod.sellingPrice);
    setFormCurrentStock(prod.currentStock);
    setFormMinThreshold(prod.minThreshold);
    setFormSupplierId(prod.supplierId || '');
    setFormUnit(prod.unit);
    setFormBatchNumber(prod.batchNumber || '');
    setFormExpiryDate(prod.expiryDate || '');
    setFormNotes(prod.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Product name is required.');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === formSupplierId);

    const payload = {
      name: formName.trim(),
      category: formCategory.trim() || 'General',
      sku: formSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      purchasePrice: Number(formPurchasePrice) || 0,
      sellingPrice: Number(formSellingPrice) || 0,
      currentStock: Number(formCurrentStock) || 0,
      minThreshold: Number(formMinThreshold) || 5,
      supplierId: formSupplierId || undefined,
      supplierName: selectedSupplier ? selectedSupplier.name : undefined,
      unit: formUnit || 'pcs',
      batchNumber: formBatchNumber || undefined,
      expiryDate: formExpiryDate || undefined,
      notes: formNotes || undefined,
    };

    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      return;
    }
    try {
      await api.del(`/api/products/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleOpenAdjust = (prod: Product) => {
    setAdjustingProduct(prod);
    setAdjustDelta(0);
    setAdjustReason('Physical inventory audit count');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async () => {
    if (!adjustingProduct) return;
    const newStock = Math.max(0, adjustingProduct.currentStock + adjustDelta);
    try {
      await api.put(`/api/products/${adjustingProduct.id}`, {
        currentStock: newStock,
      });
      setIsAdjustModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    }
  };

  // Filtered Products
  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'low_stock'
        ? p.status === 'low_stock' || (p.currentStock <= p.minThreshold && p.currentStock > 0)
        : statusFilter === 'out_of_stock'
        ? p.status === 'out_of_stock' || p.currentStock === 0
        : statusFilter === 'expired'
        ? p.status === 'expired'
        : p.status === 'in_stock';

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalHeldValue = products.reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.minThreshold && p.currentStock > 0).length;
  const outOfStockCount = products.filter((p) => p.currentStock === 0).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Product & Inventory Operations</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Inventory Catalogue & Stock Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audited stock levels, cost and selling margins, reorder thresholds, and FIFO expiry tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMovementsDrawerOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Audit History</span>
          </button>
          <button
            onClick={() => exportInventoryReportPDF(products, business?.name || 'My_Business', currency)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Total Catalogued SKUs</span>
          <p className="text-xl font-bold text-white font-mono mt-1">{products.length}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Held Inventory Valuation</span>
          <p className="text-xl font-bold text-amber-300 font-mono mt-1">{formatCurrency(totalHeldValue)}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Low Stock Reorder Alerts</span>
          <p className="text-xl font-bold text-amber-400 font-mono mt-1">{lowStockCount}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Sold Out / Depleted SKUs</span>
          <p className="text-xl font-bold text-rose-400 font-mono mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU, name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock Alerts</option>
            <option value="out_of_stock">Sold Out</option>
            <option value="expired">Expired Stock</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">SKU / Identifier</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Cost Price</th>
                <th className="py-3 px-4 font-semibold text-right">Selling Price</th>
                <th className="py-3 px-4 font-semibold text-center">Stock Level</th>
                <th className="py-3 px-4 font-semibold text-center">Threshold</th>
                <th className="py-3 px-4 font-semibold">Expiry / Batch</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No products matched your criteria. Click "Add Product" to create your first catalogue item.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isLow = prod.currentStock <= prod.minThreshold && prod.currentStock > 0;
                  const isOut = prod.currentStock === 0;
                  const isExp = prod.status === 'expired';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-400">{prod.sku}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{prod.name}</div>
                        {prod.supplierName && (
                          <div className="text-[10px] text-slate-500">Supplier: {prod.supplierName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(prod.purchasePrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">
                        {formatCurrency(prod.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono font-bold text-sm ${isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-slate-100'}`}>
                          {prod.currentStock} {prod.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {prod.minThreshold} {prod.unit}
                      </td>
                      <td className="py-3 px-4">
                        {prod.expiryDate ? (
                          <div className="text-[11px] font-mono">
                            <span className={isExp ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              {new Date(prod.expiryDate).toLocaleDateString()}
                            </span>
                            {prod.batchNumber && (
                              <span className="block text-[10px] text-slate-500 font-normal">{prod.batchNumber}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isExp ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/80">
                            Expired
                          </span>
                        ) : isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/50">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80 animate-pulse">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenAdjust(prod)}
                            title="Adjust Stock"
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            title="Edit Product"
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            title="Delete"
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingProduct ? 'Edit Inventory Product' : 'Add New Product to Inventory'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter SKU details, stock levels, safety thresholds, and cost prices.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. French Butter Croissant"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. BAK-CRS-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Viennoiserie / Apparel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters (L)</option>
                    <option value="boxes">Boxes</option>
                    <option value="packs">Packs</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Purchase / Cost Price ({currency})</label>
                  <input
                    type="number"
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price ({currency})</label>
                  <input
                    type="number"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Reorder Alert Threshold</label>
                  <input
                    type="number"
                    value={formMinThreshold}
                    onChange={(e) => setFormMinThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Supplier</label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None / Custom</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formBatchNumber}
                    onChange={(e) => setFormBatchNumber(e.target.value)}
                    placeholder="e.g. BATCH-2026-X"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Storage requirements, packaging details, recipe notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {isAdjustModalOpen && adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">
              Adjust Stock: {adjustingProduct.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Current recorded balance: <strong className="text-white font-mono">{adjustingProduct.currentStock} {adjustingProduct.unit}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity Change (+ or -)</label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  placeholder="e.g. +5 or -2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  New resulting stock: <strong className="text-indigo-400 font-mono">{Math.max(0, adjustingProduct.currentStock + adjustDelta)} {adjustingProduct.unit}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Physical inventory audit count">Physical inventory count audit</option>
                  <option value="Damaged or spoiled in storage">Damaged or spoiled in storage</option>
                  <option value="Customer sample / promotional tasting">Customer sample / promotion</option>
                  <option value="Manual supplier delivery correction">Supplier delivery correction</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAdjustment}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  Confirm Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movements Audit Drawer */}
      {isMovementsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Stock Movement Audit Trail</h3>
              </div>
              <button
                onClick={() => setIsMovementsDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {movements.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No stock movements recorded yet.
                </div>
              ) : (
                movements.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{m.productName}</span>
                      <span
                        className={`font-mono font-bold ${
                          m.delta > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {m.delta > 0 ? `+${m.delta}` : m.delta}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Balance: {m.previousStock} → {m.newStock}</span>
                      <span>{new Date(m.timestamp).toLocaleDateString()} {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic mt-1">{m.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
