import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Store, Plus, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ExistingBusinessOnboardingProps {
  onComplete: () => void;
}

export const ExistingBusinessOnboarding: React.FC<ExistingBusinessOnboardingProps> = ({ onComplete }) => {
  const { business, updateBusiness, currency } = useAuth();

  const [businessName, setBusinessName] = useState(business?.name || '');
  const [category, setCategory] = useState(business?.category || 'bakery_restaurant');
  const [location, setLocation] = useState(business?.location || '');
  const [description, setDescription] = useState(business?.description || '');

  // Dynamic initial products tailored to business category
  const [products, setProducts] = useState<Array<{
    name: string;
    sku: string;
    category: string;
    purchasePrice: number;
    sellingPrice: number;
    currentStock: number;
    minThreshold: number;
    unit: string;
    expiryDate?: string;
    customField?: string;
  }>>([
    {
      name: category === 'clothing' ? 'Classic Denim Jacket (M)' : category === 'grocery' ? 'Basmati Rice 5kg' : 'Fresh Artisanal Bread',
      sku: 'SKU-001',
      category: category === 'clothing' ? 'Outerwear' : category === 'grocery' ? 'Grains' : 'Bakery Items',
      purchasePrice: 100,
      sellingPrice: 250,
      currentStock: 20,
      minThreshold: 5,
      unit: 'pcs',
      customField: category === 'clothing' ? 'Size: M, Blue' : category === 'bakery_restaurant' ? 'Freshly baked' : '',
    },
  ]);

  // Initial Suppliers
  const [suppliers, setSuppliers] = useState<Array<{
    name: string;
    contactPerson: string;
    phone: string;
    category: string;
  }>>([
    {
      name: 'Primary Wholesale Trade Supplier',
      contactPerson: 'Manager',
      phone: '+91 98765 43210',
      category: 'Raw Materials & Supplies',
    },
  ]);

  // Initial Recurring Expenses
  const [expenses, setExpenses] = useState<Array<{
    category: string;
    description: string;
    amount: number;
  }>>([
    { category: 'rent', description: 'Storefront Monthly Rent', amount: 30000 },
    { category: 'electricity', description: 'Monthly Commercial Electricity', amount: 6000 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        name: '',
        sku: `SKU-${String(products.length + 1).padStart(3, '0')}`,
        category: 'General',
        purchasePrice: 0,
        sellingPrice: 0,
        currentStock: 0,
        minThreshold: 5,
        unit: 'pcs',
        customField: '',
      },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleAddSupplier = () => {
    setSuppliers([
      ...suppliers,
      { name: '', contactPerson: '', phone: '', category: 'Wholesale' },
    ]);
  };

  const handleRemoveSupplier = (index: number) => {
    setSuppliers(suppliers.filter((_, i) => i !== index));
  };

  const handleAddExpense = () => {
    setExpenses([
      ...expenses,
      { category: 'salaries', description: 'Staff Salaries', amount: 25000 },
    ]);
  };

  const handleRemoveExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Business name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Update business profile
      await updateBusiness({
        name: businessName,
        category: category as any,
        categoryLabel:
          category === 'bakery_restaurant'
            ? 'Bakery & Restaurant'
            : category === 'clothing'
            ? 'Clothing & Apparel'
            : category === 'grocery'
            ? 'Grocery & Supermarket'
            : 'Enterprise',
        location,
        description,
        status: 'existing',
      });

      // 2. Save initial suppliers
      for (const sup of suppliers) {
        if (sup.name.trim()) {
          await api.post('/api/suppliers', {
            name: sup.name,
            contactPerson: sup.contactPerson,
            phone: sup.phone,
            address: location || 'Local City',
            productCategories: [sup.category || 'Wholesale'],
            verified: false,
            verificationStatusNote: 'User Registered Business Supplier',
          });
        }
      }

      // 3. Save initial products
      for (const prod of products) {
        if (prod.name.trim()) {
          await api.post('/api/products', {
            name: prod.name,
            sku: prod.sku || `SKU-${Date.now().toString().slice(-4)}`,
            category: prod.category || 'General',
            purchasePrice: Number(prod.purchasePrice) || 0,
            sellingPrice: Number(prod.sellingPrice) || 0,
            currentStock: Number(prod.currentStock) || 0,
            minThreshold: Number(prod.minThreshold) || 5,
            unit: prod.unit || 'pcs',
            expiryDate: prod.expiryDate || undefined,
            customFields: prod.customField ? { details: prod.customField } : undefined,
          });
        }
      }

      // 4. Save initial expenses
      for (const exp of expenses) {
        if (exp.description.trim() && exp.amount > 0) {
          await api.post('/api/expenses', {
            date: new Date().toISOString().split('T')[0],
            category: exp.category,
            description: exp.description,
            amount: Number(exp.amount),
            paymentMethod: 'Bank Transfer / Cash',
          });
        }
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to complete existing business setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Store className="w-4 h-4" />
          <span>Existing Business Fast-Track Onboarding</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Initialize Your Active Business Operations
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Skip the planning phase and immediately configure your existing catalogue, inventory balances, suppliers, and operating expenses.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Business Identity */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">1</span>
            <span>Business Profile & Industry Type</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Metro Fashion Boutique"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="bakery_restaurant">Bakery or Restaurant (Menu, ingredients, perishables)</option>
                <option value="clothing">Clothing & Apparel (Sizes, catalogue, stock)</option>
                <option value="grocery">Grocery & Supermarket (Quantities, expiry dates)</option>
                <option value="electronics">Retail Hardware & Electronics</option>
                <option value="other">Other Business (Customizable products/services)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Store / Commercial Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Commercial Street, Bengaluru"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Multi-brand apparel and designer ethnic wear store."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Starting Inventory & Products */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">2</span>
              <span>Starting Products & Current Stock</span>
            </h3>
            <button
              type="button"
              onClick={handleAddProduct}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="space-y-3">
            {products.map((prod, index) => (
              <div key={index} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Product #{index + 1}</span>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="text-rose-400 hover:text-rose-300 text-xs p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={prod.name}
                      onChange={(e) => {
                        const copy = [...products];
                        copy[index].name = e.target.value;
                        setProducts(copy);
                      }}
                      placeholder="e.g. Sourdough Loaf / Cotton Shirt"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Cost Price ({currency})</label>
                    <input
                      type="number"
                      value={prod.purchasePrice}
                      onChange={(e) => {
                        const copy = [...products];
                        copy[index].purchasePrice = Number(e.target.value);
                        setProducts(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Selling Price ({currency})</label>
                    <input
                      type="number"
                      value={prod.sellingPrice}
                      onChange={(e) => {
                        const copy = [...products];
                        copy[index].sellingPrice = Number(e.target.value);
                        setProducts(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Current Stock Quantity</label>
                    <input
                      type="number"
                      value={prod.currentStock}
                      onChange={(e) => {
                        const copy = [...products];
                        copy[index].currentStock = Number(e.target.value);
                        setProducts(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Min. Reorder Alert Threshold</label>
                    <input
                      type="number"
                      value={prod.minThreshold}
                      onChange={(e) => {
                        const copy = [...products];
                        copy[index].minThreshold = Number(e.target.value);
                        setProducts(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {category === 'clothing' ? 'Sizes / Variants' : category === 'grocery' || category === 'bakery_restaurant' ? 'Expiry Date' : 'Custom Field'}
                    </label>
                    {category === 'grocery' || category === 'bakery_restaurant' ? (
                      <input
                        type="date"
                        value={prod.expiryDate || ''}
                        onChange={(e) => {
                          const copy = [...products];
                          copy[index].expiryDate = e.target.value;
                          setProducts(copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={prod.customField || ''}
                        onChange={(e) => {
                          const copy = [...products];
                          copy[index].customField = e.target.value;
                          setProducts(copy);
                        }}
                        placeholder="e.g. S, M, L, XL or Color"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Existing Suppliers */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">3</span>
              <span>Existing Suppliers & Vendors</span>
            </h3>
            <button
              type="button"
              onClick={handleAddSupplier}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Supplier</span>
            </button>
          </div>

          <div className="space-y-3">
            {suppliers.map((sup, index) => (
              <div key={index} className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={sup.name}
                    onChange={(e) => {
                      const copy = [...suppliers];
                      copy[index].name = e.target.value;
                      setSuppliers(copy);
                    }}
                    placeholder="Wholesale Partner"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={sup.contactPerson}
                    onChange={(e) => {
                      const copy = [...suppliers];
                      copy[index].contactPerson = e.target.value;
                      setSuppliers(copy);
                    }}
                    placeholder="e.g. Ramesh"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={sup.phone}
                    onChange={(e) => {
                      const copy = [...suppliers];
                      copy[index].phone = e.target.value;
                      setSuppliers(copy);
                    }}
                    placeholder="+91 98..."
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">Category Supplied</label>
                    <input
                      type="text"
                      value={sup.category}
                      onChange={(e) => {
                        const copy = [...suppliers];
                        copy[index].category = e.target.value;
                        setSuppliers(copy);
                      }}
                      placeholder="e.g. Fabrics, Flour"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {suppliers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSupplier(index)}
                      className="text-rose-400 hover:text-rose-300 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Existing Recurring Operating Expenses */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">4</span>
              <span>Baseline Operating Expenses (Rent, Utilities, Salaries)</span>
            </h3>
            <button
              type="button"
              onClick={handleAddExpense}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>

          <div className="space-y-3">
            {expenses.map((exp, index) => (
              <div key={index} className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Expense Category</label>
                  <select
                    value={exp.category}
                    onChange={(e) => {
                      const copy = [...expenses];
                      copy[index].category = e.target.value;
                      setExpenses(copy);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="rent">Store Rent</option>
                    <option value="electricity">Electricity & Utilities</option>
                    <option value="salaries">Salaries & Staff</option>
                    <option value="packaging">Packaging Supplies</option>
                    <option value="transportation">Logistics & Transportation</option>
                    <option value="marketing">Advertising & Marketing</option>
                    <option value="other">Other Operating Overhead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={exp.description}
                    onChange={(e) => {
                      const copy = [...expenses];
                      copy[index].description = e.target.value;
                      setExpenses(copy);
                    }}
                    placeholder="e.g. Monthly Lease"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">Monthly Amount ({currency})</label>
                    <input
                      type="number"
                      value={exp.amount}
                      onChange={(e) => {
                        const copy = [...expenses];
                        copy[index].amount = Number(e.target.value);
                        setExpenses(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExpense(index)}
                      className="text-rose-400 hover:text-rose-300 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving Business Configuration...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Save Setup & Launch Live Operations Dashboard</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
