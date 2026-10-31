'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, Plus, Sparkles, ArrowRight, Check, Trash2, 
  Calculator, Search, LayoutGrid, Table as TableIcon,
  CheckCircle2, Users, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';
import { Product, ProductVariant, ProductType } from '@/lib/catalog-types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // New Product Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('Software License');
  const [salesPrice, setSalesPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [targetAudience, setTargetAudience] = useState('General Enterprise');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Variant addition state (keyed by productId)
  const [addingVariantFor, setAddingVariantFor] = useState<string | null>(null);
  const [attrName, setAttrName] = useState('Brand');
  const [attrValue, setAttrValue] = useState('Odoo Edition');
  const [priceModifier, setPriceModifier] = useState('560');

  // Selected variant for simulation (keyed by productId)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Feedback state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok && data.products) {
        setProducts(data.products);
        const initialSelections: Record<string, string> = {};
        data.products.forEach((p: Product) => {
          if (p.variants && p.variants.length > 0) {
            initialSelections[p.id] = p.variants[0].id;
          }
        });
        setSelectedVariants(initialSelections);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load catalog offerings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          salesPrice: parseFloat(salesPrice) || 0,
          costPrice: parseFloat(costPrice) || 0,
          targetAudience,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to create offering' });
      } else {
        setFeedback({ type: 'success', message: `Product "${data.product.name}" created.` });
        setName('');
        setSalesPrice('');
        setCostPrice('');
        setNotes('');
        setShowAddForm(false);
        fetchProducts();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error creating offering.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddVariant = async (productId: string) => {
    if (!attrName || !attrValue) return;

    try {
      const res = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributeName: attrName,
          attributeValue: attrValue,
          priceModifier: parseFloat(priceModifier) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: `Variant added (+${data.variant.priceModifier}).` });
        setAddingVariantFor(null);
        setAttrName('Brand');
        setAttrValue('');
        setPriceModifier('0');
        fetchProducts();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to add variant.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error adding variant.' });
    }
  };

  const handleDeleteVariant = async (productId: string, variantId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/variants?variantId=${variantId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Variant removed.' });
        fetchProducts();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to remove variant.' });
    }
  };

  const categories = ['All', 'Software License', 'Cloud Add-on', 'User Seat', 'Professional Service'];
  
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.type === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      p.type.toLowerCase().includes(query) ||
      (p.targetAudience && p.targetAudience.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-16">
      
      {/* Top Navbar */}
      <header className="border-b border-sage-200/80 bg-white/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/subsage-logo.jpg"
              alt="SubSage"
              className="h-8 w-auto object-contain rounded-md"
            />
            <span className="text-[10px] text-sage-600 font-semibold px-2 py-0.5 rounded-full bg-sage-100 border border-sage-200">
              powered by Brightloop
            </span>
          </Link>

          <nav className="flex items-center space-x-4 text-xs font-medium">
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link href="/accounts" className="text-slate-500 hover:text-slate-900 transition-colors">
              Task 1: Accounts
            </Link>
            <Link href="/catalog" className="text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5">
              Task 2: Catalog
            </Link>
            <Link href="/plans" className="text-slate-500 hover:text-slate-900 transition-colors">
              Task 3: Plans
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Compact Hero Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                Task 2 Engine
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {products.length} Products & Add-ons
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Product Catalog & Variant Pricing
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured with the required <b>Odoo brand variant modifier (+$560)</b>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Compact Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Structured Table"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Close' : 'Add Product'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`my-3 p-2.5 rounded-xl text-xs font-medium flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
              ✕
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-4 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => {
              const count = cat === 'All' ? products.length : products.filter((p) => p.type === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative md:w-64">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offering or SKU..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Compact Add Product Form */}
        {showAddForm && (
          <div className="my-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              <span>Create New Catalog Offering</span>
            </h3>

            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brightloop Payroll"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="Software License">Software License</option>
                  <option value="Cloud Add-on">Cloud Add-on</option>
                  <option value="Professional Service">Professional Service</option>
                  <option value="User Seat">User Seat</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Small Shops"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Sales Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(e.target.value)}
                  placeholder="1200.00"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="400.00"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summary of product features and usage terms..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* COMPACT & ATTRACTIVE CARD GRID */}
        {viewMode === 'grid' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const activeVariantId = selectedVariants[product.id];
              const activeVariant = product.variants.find((v) => v.id === activeVariantId);
              const variantModifier = activeVariant ? Number(activeVariant.priceModifier) : 0;
              const calculatedTotal = product.salesPrice + variantModifier;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_6px_-2px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col justify-between hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.07)] hover:border-slate-300 transition-all"
                >
                  <div>
                    {/* Compact Image Banner (110px height) */}
                    <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/95 text-slate-900 backdrop-blur">
                          {product.type}
                        </span>
                        {product.sku && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-black/60 text-slate-200 backdrop-blur">
                            {product.sku}
                          </span>
                        )}
                      </div>

                      {/* Prompt Highlight Badge */}
                      {product.id === 'prod_brightloop_erp' && (
                        <div className="absolute top-2 right-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-600 text-white flex items-center space-x-0.5 shadow-sm">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Odoo Rule</span>
                          </span>
                        </div>
                      )}

                      {/* Title on Image */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                        <h3 className="font-bold text-sm leading-tight drop-shadow-sm truncate">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-slate-300 truncate mt-0.5">
                          {product.targetAudience}
                        </p>
                      </div>
                    </div>

                    {/* Compact Body */}
                    <div className="p-3.5 space-y-2.5">
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {product.notes}
                      </p>

                      {/* 2 Bullet Features */}
                      {product.features && product.features.length > 0 && (
                        <div className="space-y-1">
                          {product.features.slice(0, 2).map((feat, idx) => (
                            <div key={idx} className="flex items-center text-[10px] text-slate-600">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Variants Section */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Variants ({product.variants.length})
                          </span>
                          <button
                            onClick={() =>
                              setAddingVariantFor(addingVariantFor === product.id ? null : product.id)
                            }
                            className="text-[10px] text-slate-600 hover:text-slate-900 font-medium inline-flex items-center space-x-0.5"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((v) => (
                            <div
                              key={v.id}
                              className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] border ${
                                v.priceModifier > 0
                                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="truncate max-w-[90px]">{v.attributeValue}</span>
                              <span
                                className={`text-[9px] font-bold px-1 rounded ${
                                  v.priceModifier > 0 ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                +${v.priceModifier}
                              </span>
                              <button
                                onClick={() => handleDeleteVariant(product.id, v.id)}
                                className="text-slate-400 hover:text-rose-600 pl-0.5"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Inline Add Variant Drawer */}
                        {addingVariantFor === product.id && (
                          <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-1.5 text-xs">
                            <input
                              type="text"
                              value={attrName}
                              onChange={(e) => setAttrName(e.target.value)}
                              placeholder="Attr"
                              className="px-1.5 py-1 text-[11px] bg-white border border-slate-200 rounded w-16"
                            />
                            <input
                              type="text"
                              value={attrValue}
                              onChange={(e) => setAttrValue(e.target.value)}
                              placeholder="Value"
                              className="px-1.5 py-1 text-[11px] bg-white border border-slate-200 rounded flex-1 min-w-[70px]"
                            />
                            <input
                              type="number"
                              value={priceModifier}
                              onChange={(e) => setPriceModifier(e.target.value)}
                              placeholder="+$"
                              className="px-1.5 py-1 text-[11px] bg-white border border-slate-200 rounded w-14"
                            />
                            <button
                              onClick={() => handleAddVariant(product.id)}
                              className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-medium"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compact Bottom Price Bar */}
                  <div className="p-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex-1 mr-2">
                      <select
                        value={selectedVariants[product.id] || ''}
                        onChange={(e) =>
                          setSelectedVariants({ ...selectedVariants, [product.id]: e.target.value })
                        }
                        className="w-full px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                      >
                        {product.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.attributeValue} (+${v.priceModifier})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-right">
                      <span className="text-[14px] font-bold text-slate-900 block leading-tight">
                        ${calculatedTotal.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Base: ${product.salesPrice}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* STRUCTURED TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="mt-4 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Offering</th>
                    <th className="py-2.5 px-3">SKU & Type</th>
                    <th className="py-2.5 px-3">Target Audience</th>
                    <th className="py-2.5 px-3">Base Price</th>
                    <th className="py-2.5 px-3">Configured Variants</th>
                    <th className="py-2.5 px-3 text-right">Odoo / Max Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const maxVariant = p.variants.reduce((prev, curr) => 
                      curr.priceModifier > prev ? curr.priceModifier : prev, 0
                    );
                    const hasOdoo = p.variants.some((v) => v.attributeValue.toLowerCase().includes('odoo'));

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 text-xs">{p.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{p.notes}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[10px] text-slate-600 block">{p.sku}</span>
                          <span className="text-[10px] text-slate-400">{p.type}</span>
                        </td>

                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {p.targetAudience}
                        </td>

                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          ${p.salesPrice.toLocaleString()}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {p.variants.map((v) => (
                              <span
                                key={v.id}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                  v.priceModifier > 0
                                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {v.attributeValue} (+${v.priceModifier})
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <span className="text-xs font-bold text-slate-900">
                            ${(p.salesPrice + maxVariant).toLocaleString()}
                          </span>
                          {hasOdoo && (
                            <span className="block text-[9px] text-purple-700 font-semibold">
                              Odoo (+$560)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
