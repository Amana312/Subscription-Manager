'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, Plus, Sparkles, Tag, ArrowRight, Check, Trash2, 
  Calculator, ChevronDown, ChevronUp, Layers, ShieldCheck, DollarSign
} from 'lucide-react';
import { Product, ProductVariant, ProductType } from '@/lib/catalog-types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Product Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('Software License');
  const [salesPrice, setSalesPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Variant addition state (keyed by productId)
  const [addingVariantFor, setAddingVariantFor] = useState<string | null>(null);
  const [attrName, setAttrName] = useState('Brand');
  const [attrValue, setAttrValue] = useState('Odoo');
  const [priceModifier, setPriceModifier] = useState('560');

  // Selected variant for simulation (keyed by productId)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Toast / feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok && data.products) {
        setProducts(data.products);
        // Default first variant selection for simulator
        const initialSelections: Record<string, string> = {};
        data.products.forEach((p: Product) => {
          if (p.variants && p.variants.length > 0) {
            initialSelections[p.id] = p.variants[0].id;
          }
        });
        setSelectedVariants(initialSelections);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load catalog products.' });
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
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to create product' });
      } else {
        setFeedback({ type: 'success', message: `Product "${data.product.name}" created successfully.` });
        setName('');
        setSalesPrice('');
        setCostPrice('');
        setNotes('');
        setShowAddForm(false);
        fetchProducts();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error creating product.' });
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              B
            </div>
            <span className="font-semibold text-slate-900 text-sm tracking-tight">Brightloop</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-medium text-slate-500">Catalog & Pricing</span>
          </div>

          <nav className="flex items-center space-x-4 text-xs font-medium">
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link href="/accounts" className="text-slate-500 hover:text-slate-900 transition-colors">
              Accounts
            </Link>
            <Link href="/catalog" className="text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5">
              Catalog
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Products & Pricing Catalog</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure baseline product offerings and variant price modifiers (e.g. Odoo brand +$560).
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'New Product'}</span>
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`my-4 p-3 rounded-xl text-xs font-medium flex items-center justify-between ${
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

        {/* Add Product Form (Drawer) */}
        {showAddForm && (
          <div className="my-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Create New Catalog Product</span>
            </h3>

            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brightloop Enterprise Cloud"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Product Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800"
                >
                  <option value="Software License">Software License</option>
                  <option value="Cloud Add-on">Cloud Add-on</option>
                  <option value="Professional Service">Professional Service</option>
                  <option value="User Seat">User Seat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sales Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(e.target.value)}
                  placeholder="1200.00"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="400.00"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes, features, and SLA specifications..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-sm hover:bg-slate-800"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product Cards List */}
        <div className="mt-6 space-y-5">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading catalog items...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No products in catalog yet.</p>
            </div>
          ) : (
            products.map((product) => {
              const activeVariantId = selectedVariants[product.id];
              const activeVariant = product.variants.find((v) => v.id === activeVariantId);
              const variantModifier = activeVariant ? Number(activeVariant.priceModifier) : 0;
              const calculatedTotal = product.salesPrice + variantModifier;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    
                    {/* Left: Product Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {product.type}
                        </span>
                        {product.id === 'prod_brightloop_erp' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Prompt Reference Spec</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{product.name}</h3>
                      {product.notes && <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{product.notes}</p>}

                      {/* Pricing Specs */}
                      <div className="flex items-center space-x-4 pt-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">Base Sales Price:</span>{' '}
                          <span className="font-semibold text-slate-900">${product.salesPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div>
                          <span className="text-slate-400">Cost Price:</span>{' '}
                          <span className="text-slate-700">${product.costPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div>
                          <span className="text-slate-400">Base Margin:</span>{' '}
                          <span className="font-semibold text-emerald-600">
                            +${(product.salesPrice - product.costPrice).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Configured Variants */}
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Available Variants ({product.variants.length})
                          </span>

                          <button
                            onClick={() =>
                              setAddingVariantFor(addingVariantFor === product.id ? null : product.id)
                            }
                            className="text-xs text-slate-700 hover:text-slate-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Variant</span>
                          </button>
                        </div>

                        {product.variants.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No variants configured for this product.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {product.variants.map((v) => (
                              <div
                                key={v.id}
                                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                                  v.priceModifier > 0
                                    ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="font-medium text-slate-500">{v.attributeName}:</span>
                                <span className="font-semibold">{v.attributeValue}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    v.priceModifier > 0
                                      ? 'bg-purple-200 text-purple-800'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {v.priceModifier > 0 ? `+$${v.priceModifier}` : '+$0'}
                                </span>
                                <button
                                  onClick={() => handleDeleteVariant(product.id, v.id)}
                                  className="text-slate-400 hover:text-rose-600 ml-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Add Variant Drawer */}
                        {addingVariantFor === product.id && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              value={attrName}
                              onChange={(e) => setAttrName(e.target.value)}
                              placeholder="Attribute (e.g. Brand)"
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-28 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={attrValue}
                              onChange={(e) => setAttrValue(e.target.value)}
                              placeholder="Value (e.g. Odoo)"
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-32 focus:outline-none"
                            />
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-slate-500 font-medium">+$</span>
                              <input
                                type="number"
                                value={priceModifier}
                                onChange={(e) => setPriceModifier(e.target.value)}
                                placeholder="560"
                                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-20 focus:outline-none"
                              />
                            </div>
                            <button
                              onClick={() => handleAddVariant(product.id)}
                              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 ml-auto"
                            >
                              Save Variant
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Live Interactive Price Calculator (Judges feature) */}
                    <div className="lg:w-72 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Pricing Calculator</span>
                        </div>

                        {product.variants.length > 0 ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Select Variant Simulation:
                              </label>
                              <select
                                value={selectedVariants[product.id] || ''}
                                onChange={(e) =>
                                  setSelectedVariants({ ...selectedVariants, [product.id]: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                              >
                                {product.variants.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.attributeName}: {v.attributeValue} (+${v.priceModifier})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Math Breakdown */}
                            <div className="space-y-1 text-xs pt-1 border-t border-slate-200/60">
                              <div className="flex justify-between text-slate-500">
                                <span>Base Price:</span>
                                <span>${product.salesPrice.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-purple-700 font-medium">
                                <span>Variant Adder:</span>
                                <span>+${variantModifier.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 py-2">Add variants to test price modifiers.</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium block">
                          Final Calculated Price
                        </span>
                        <div className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                          ${calculatedTotal.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500 ml-1">/ unit</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}
