import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Supplier } from '../types';
import { exportSupplierComparisonPDF } from '../utils/pdfGenerator';
import {
  Compass,
  CheckCircle2,
  Phone,
  Globe,
  Plus,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  Star,
  Layers,
  Check,
} from 'lucide-react';

export const SupplierDiscovery: React.FC = () => {
  const { business, currency } = useAuth();
  const [curated, setCurated] = useState<any[]>([]);
  const [savedSuppliers, setSavedSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForComparison, setSelectedForComparison] = useState<any[]>([]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const [cList, sList] = await Promise.all([
          api.get<any[]>('/api/curated-suppliers'),
          api.get<Supplier[]>('/api/suppliers'),
        ]);
        setCurated(cList || []);
        setSavedSuppliers(sList || []);
      } catch (err) {
        console.error('Failed to load curated suppliers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleSaveToDirectory = async (supplier: any) => {
    try {
      const saved = await api.post<Supplier>('/api/suppliers', {
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        productCategories: supplier.productCategories,
        verified: supplier.verified,
        verificationStatusNote: supplier.verificationStatusNote,
        website: supplier.website,
        minOrderQuantity: supplier.minOrderQuantity,
        priceNotes: supplier.priceNotes,
        paymentTerms: supplier.paymentTerms,
        rating: supplier.rating,
        isSystemCurated: true,
      });
      setSavedSuppliers([...savedSuppliers, saved]);
      setAddedIds({ ...addedIds, [supplier.name]: true });
    } catch (err: any) {
      alert(err.message || 'Failed to save supplier');
    }
  };

  const toggleComparison = (sup: any) => {
    if (selectedForComparison.some((s) => s.name === sup.name)) {
      setSelectedForComparison(selectedForComparison.filter((s) => s.name !== sup.name));
    } else {
      if (selectedForComparison.length >= 4) {
        alert('You can compare up to 4 suppliers simultaneously.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, sup]);
    }
  };

  const filteredCurated = curated.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.productCategories.some((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : s.productCategories.some((c: string) => c.toLowerCase().includes(categoryFilter.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Supplier Discovery & Trade Sourcing</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Verified Trade Wholesalers & Equipment Distributors
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Connect with verified commercial suppliers for raw materials, packaging, and commercial appliances.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {savedSuppliers.length > 0 && (
            <button
              onClick={() => exportSupplierComparisonPDF(savedSuppliers, business?.name || 'My_Business', currency)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Comparison PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search suppliers by name, category, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Product Categories</option>
            <option value="Flour">Flours, Grains & Sugar</option>
            <option value="Dairy">Dairy & Fats</option>
            <option value="Packaging">Sustainable Packaging</option>
            <option value="Equipment">Commercial Equipment & Ovens</option>
            <option value="Textiles">Textiles & Fabrics</option>
            <option value="Displays">POS Displays & Retail Hardware</option>
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Box if active */}
      {selectedForComparison.length > 0 && (
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Side-by-Side Sourcing Comparison ({selectedForComparison.length} selected)</span>
            </h3>
            <button
              onClick={() => setSelectedForComparison([])}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Clear Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedForComparison.map((s, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white text-sm truncate">{s.name}</div>
                <div className="flex items-center space-x-1 text-emerald-400 text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{s.verificationStatusNote}</span>
                </div>
                <div className="pt-2 space-y-1 text-slate-300">
                  <p><strong className="text-slate-400">MOQ: </strong>{s.minOrderQuantity}</p>
                  <p><strong className="text-slate-400">Pricing: </strong>{s.priceNotes}</p>
                  <p><strong className="text-slate-400">Terms: </strong>{s.paymentTerms}</p>
                  <p><strong className="text-slate-400">Contact: </strong>{s.contactPerson} ({s.phone})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curated Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCurated.map((sup, idx) => {
          const isSaved = savedSuppliers.some((s) => s.name === sup.name) || addedIds[sup.name];
          const isComparing = selectedForComparison.some((s) => s.name === sup.name);

          return (
            <div
              key={idx}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-white">{sup.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sup.address}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded text-[11px] shrink-0 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{sup.rating}</span>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="truncate">{sup.verificationStatusNote}</span>
                </div>

                {/* Product Categories */}
                <div className="flex flex-wrap gap-1.5">
                  {sup.productCategories.map((cat: string, cIdx: number) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div className="text-xs space-y-1 pt-1 text-slate-300">
                  <p><strong className="text-slate-400">Min Order Qty: </strong>{sup.minOrderQuantity}</p>
                  <p><strong className="text-slate-400">Indicative Pricing: </strong>{sup.priceNotes}</p>
                  <p><strong className="text-slate-400">Payment Terms: </strong>{sup.paymentTerms}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${sup.phone}`}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition flex items-center justify-center"
                    title={`Call ${sup.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  {sup.website && (
                    <a
                      href={sup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition flex items-center justify-center"
                      title="Visit official website"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => toggleComparison(sup)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      isComparing ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isComparing ? 'Comparing' : 'Compare'}
                  </button>
                </div>

                <button
                  onClick={() => handleSaveToDirectory(sup)}
                  disabled={isSaved}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  }`}
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'In Directory' : 'Save to Directory'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
