'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, Check, Plus, Sparkles, LayoutGrid, Table as TableIcon,
  CheckCircle2, Layers, Shield, ArrowRight, Zap, RefreshCw, Clock, 
  ExternalLink, Flame
} from 'lucide-react';
import { Plan, BillingInterval, getPriceForInterval, formatIntervalLabel } from '@/lib/plans-types';

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Master global interval
  const [globalInterval, setGlobalInterval] = useState<BillingInterval>('MONTHLY');

  // Per-card interval selection
  const [planIntervals, setPlanIntervals] = useState<Record<string, BillingInterval>>({});

  // Seat simulator (planId -> seats)
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Form State
  const [name, setName] = useState('');
  const [productName, setProductName] = useState('Brightloop Business Suite');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('Core Software');
  const [dailyRate, setDailyRate] = useState('15');
  const [weeklyRate, setWeeklyRate] = useState('75');
  const [monthlyRate, setMonthlyRate] = useState('250');
  const [yearlyRate, setYearlyRate] = useState('2400');
  const [minQuantity, setMinQuantity] = useState('1');
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false);
  const [canPause, setCanPause] = useState(true);
  const [canCancelEarly, setCanCancelEarly] = useState(true);
  const [canRenew, setCanRenew] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      if (res.ok && data.plans) {
        setPlans(data.plans);
        const initialInt: Record<string, BillingInterval> = {};
        const initialQty: Record<string, number> = {};
        data.plans.forEach((p: Plan) => {
          initialInt[p.id] = 'MONTHLY';
          initialQty[p.id] = p.minQuantity || 1;
        });
        setPlanIntervals(initialInt);
        setQuantities(initialQty);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load plans.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleGlobalIntervalChange = (interval: BillingInterval) => {
    setGlobalInterval(interval);
    const updated: Record<string, BillingInterval> = {};
    plans.forEach((p) => {
      updated[p.id] = interval;
    });
    setPlanIntervals(updated);
  };

  const handleCardIntervalChange = (planId: string, interval: BillingInterval) => {
    setPlanIntervals((prev) => ({
      ...prev,
      [planId]: interval,
    }));
  };

  const handleQuantityChange = (planId: string, val: number, minQ: number) => {
    setQuantities((prev) => ({
      ...prev,
      [planId]: Math.max(minQ, val),
    }));
  };

  const categories = ['All', 'Core Software', 'Retail & POS', 'Infrastructure', 'Intelligence', 'Support', 'Licensing', 'Compliance', 'Security', 'Developer'];

  const filteredPlans = plans.filter((p) => {
    return selectedCategory === 'All' || p.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-cream-100 text-sage-950 pb-24 selection:bg-sage-400 selection:text-white">
      
      {/* Top Navbar */}
      <header className="border-b border-sage-200/80 bg-white/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/subsage-logo.jpg"
              alt="SubSage"
              className="h-8 w-auto object-contain rounded-md"
            />
            <span className="text-[10px] text-sage-700 font-semibold px-2 py-0.5 rounded-full bg-sage-100 border border-sage-200">
              powered by Brightloop
            </span>
          </Link>

          <nav className="flex items-center space-x-5 text-xs font-semibold">
            <Link href="/" className="text-sage-600 hover:text-sage-950 transition-colors">
              Home
            </Link>
            <Link href="/accounts" className="text-sage-600 hover:text-sage-950 transition-colors">
              Task 1: Accounts
            </Link>
            <Link href="/catalog" className="text-sage-600 hover:text-sage-950 transition-colors">
              Task 2: Catalog
            </Link>
            <Link href="/plans" className="text-sage-900 font-bold border-b-2 border-sage-800 pb-0.5">
              Task 3: Plans
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Sage Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sage-200/70 text-sage-900 text-xs font-bold mb-3 border border-sage-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-sage-700" />
            <span>Task 3 Engine • 10 Product Offerings With 4-Cycle Frequency Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-sage-950 leading-tight">
            Subscription Pricing & Plan Cycles
          </h1>
          <p className="text-sm text-sage-700 mt-2.5 leading-relaxed max-w-xl mx-auto font-medium">
            Choose from 10 enterprise offerings. Switch seamlessly between <b>Daily, Weekly, Monthly, and Yearly</b> cycles with live seat calculators.
          </p>

          {/* Master Global Frequency Switcher */}
          <div className="mt-6 inline-flex items-center bg-white p-1 rounded-2xl border border-sage-200 shadow-sm">
            {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as BillingInterval[]).map((int) => (
              <button
                key={int}
                onClick={() => handleGlobalIntervalChange(int)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  globalInterval === int
                    ? 'bg-sage-800 text-white shadow-sm'
                    : 'text-sage-600 hover:text-sage-900 hover:bg-sage-50'
                }`}
              >
                <span>{int.charAt(0) + int.slice(1).toLowerCase()}</span>
                {int === 'YEARLY' && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-sage-400 text-sage-950">
                    SAVE 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-5 border-b border-sage-200">
          
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-sage-800 text-white shadow-xs'
                    : 'bg-white border border-sage-200 text-sage-700 hover:bg-sage-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            {/* View Mode */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-sage-200 shadow-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'grid' ? 'bg-sage-800 text-white shadow-xs' : 'text-sage-600 hover:text-sage-900'
                }`}
                title="Photo Cards Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'table' ? 'bg-sage-800 text-white shadow-xs' : 'text-sage-600 hover:text-sage-900'
                }`}
                title="Comparison Table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 10 RICH ATTRACTIVE PLAN CARDS WITH PICTURES & SAGE COLOR THEME */}
        {viewMode === 'grid' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const currentInterval = planIntervals[plan.id] || 'MONTHLY';
              const activePrice = getPriceForInterval(plan.rates, currentInterval);
              const currentQty = quantities[plan.id] || plan.minQuantity || 1;
              const totalCost = activePrice * currentQty;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group hover:scale-[1.01] hover:shadow-lg ${
                    plan.isPopular
                      ? 'border-sage-500 shadow-md ring-2 ring-sage-400/30'
                      : 'border-sage-200 hover:border-sage-300 shadow-xs'
                  }`}
                >
                  <div>
                    
                    {/* PHOTO BANNER WITH BRAND ACCENT TOP BAR */}
                    <div className="relative h-40 w-full overflow-hidden bg-sage-100">
                      <img
                        src={plan.imageUrl}
                        alt={plan.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-sage-950/85 via-sage-950/40 to-transparent" />
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-sage-800" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur">
                          {plan.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sage-800/90 text-sage-100 border border-sage-700 backdrop-blur">
                          {plan.category}
                        </span>
                      </div>

                      {/* Popular Badge */}
                      {plan.isPopular && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sage-400 text-sage-950 flex items-center space-x-1 shadow-md">
                            <Sparkles className="w-3 h-3 text-sage-950" />
                            <span>FEATURED</span>
                          </span>
                        </div>
                      )}

                      {/* Title on Image */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-extrabold text-lg text-white leading-tight drop-shadow-md">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-sage-200 font-medium truncate mt-0.5">
                          {plan.productName}
                        </p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4">
                      
                      <p className="text-xs text-sage-600 leading-relaxed min-h-[36px]">
                        {plan.tagline}
                      </p>

                      {/* 4-OPTION INTERVAL PILL SWITCHER INSIDE THIS PLAN */}
                      <div className="p-1 bg-sage-50 rounded-xl border border-sage-200 flex items-center justify-between text-xs font-semibold">
                        {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as BillingInterval[]).map((int) => (
                          <button
                            key={int}
                            onClick={() => handleCardIntervalChange(plan.id, int)}
                            className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                              currentInterval === int
                                ? 'bg-sage-800 text-white font-bold shadow-xs'
                                : 'text-sage-600 hover:text-sage-900'
                            }`}
                          >
                            {int === 'DAILY' ? 'Day' : int === 'WEEKLY' ? 'Wk' : int === 'MONTHLY' ? 'Mo' : 'Yr'}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic Pricing Highlight */}
                      <div className="pt-2 flex items-baseline justify-between border-t border-sage-100">
                        <div>
                          <div className="flex items-baseline space-x-1.5">
                            <span className="text-3xl font-extrabold text-sage-950 tracking-tight">
                              ${activePrice.toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-sage-600">
                              {formatIntervalLabel(currentInterval)}
                            </span>
                          </div>
                          {currentInterval === 'YEARLY' && (
                            <span className="text-[10px] text-sage-700 font-bold block mt-0.5">
                              ✓ Annual commitment savings applied
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-semibold text-sage-700 bg-sage-50 px-2 py-1 rounded-md border border-sage-200">
                          Min: {plan.minQuantity} {plan.minQuantity > 1 ? 'seats' : 'seat'}
                        </span>
                      </div>

                      {/* Feature Checklist with Sage Green Icons */}
                      <div className="space-y-2 pt-2 border-t border-sage-100">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center text-xs text-sage-700">
                            <div className="w-4 h-4 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center mr-2 flex-shrink-0 border border-sage-300">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Lifecycle Policy Badges */}
                      <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          plan.autoCloseOnEnd
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-sage-100 text-sage-800 border border-sage-200'
                        }`}>
                          {plan.autoCloseOnEnd ? 'Auto-Closes at End' : 'Auto-Renewable'}
                        </span>

                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          plan.canPause ? 'bg-sage-50 text-sage-700 border border-sage-200' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {plan.canPause ? 'Pausable' : 'Continuous'}
                        </span>

                        <span className="px-2 py-0.5 rounded font-semibold bg-sage-50 text-sage-600 border border-sage-200">
                          {plan.canCancelEarly ? 'Early Cancel OK' : 'Fixed Term'}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Interactive Seat Calculator & Action Link */}
                  <div className="p-4 bg-sage-50/70 border-t border-sage-100 flex flex-col space-y-3">
                    
                    {/* Live Seat Simulator Bar */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-sage-600 font-medium">Seats:</span>
                        <input
                          type="number"
                          min={plan.minQuantity}
                          value={currentQty}
                          onChange={(e) => handleQuantityChange(plan.id, parseInt(e.target.value) || plan.minQuantity, plan.minQuantity)}
                          className="w-14 px-2 py-1 text-center font-bold text-xs bg-white border border-sage-200 text-sage-900 rounded-lg focus:outline-none focus:border-sage-700"
                        />
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-sage-500 block">Total {currentInterval.toLowerCase()}:</span>
                        <span className="text-base font-extrabold text-sage-950">
                          ${totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center space-x-2 pt-1">
                      <Link
                        href="/catalog"
                        className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-sage-100 text-sage-800 text-xs font-semibold text-center transition-all border border-sage-200 flex items-center justify-center space-x-1"
                      >
                        <span>View Catalog</span>
                        <ExternalLink className="w-3 h-3 text-sage-500" />
                      </Link>

                      <Link
                        href="/accounts"
                        className="flex-1 py-2 px-3 rounded-xl text-white text-xs font-bold text-center transition-all shadow-xs flex items-center justify-center space-x-1 bg-sage-800 hover:bg-sage-900"
                      >
                        <span>Select Plan</span>
                        <ArrowRight className="w-3.5 h-3.5 text-sage-300" />
                      </Link>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* FULL COMPARISON TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="mt-8 bg-white rounded-2xl border border-sage-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-sage-50/80 border-b border-sage-200 text-sage-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Offering Plan</th>
                    <th className="py-3 px-3 text-center">Daily</th>
                    <th className="py-3 px-3 text-center">Weekly</th>
                    <th className="py-3 px-3 text-center">Monthly</th>
                    <th className="py-3 px-3 text-center text-sage-800">Yearly (-20%)</th>
                    <th className="py-3 px-3 text-center">Min Qty</th>
                    <th className="py-3 px-4">Expiry Rule</th>
                    <th className="py-3 px-3 text-center">Pausable</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {filteredPlans.map((p) => (
                    <tr key={p.id} className="hover:bg-sage-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-sage-950">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-sage-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-xs text-sage-950">{p.name}</p>
                            <p className="text-[11px] text-sage-500">{p.productName} • {p.code}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center text-sage-700 font-semibold">
                        ${p.rates.daily}/d
                      </td>

                      <td className="py-3 px-3 text-center text-sage-700 font-semibold">
                        ${p.rates.weekly}/w
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-sage-900">
                        ${p.rates.monthly}/mo
                      </td>

                      <td className="py-3 px-3 text-center font-extrabold text-sage-800">
                        ${p.rates.yearly}/yr
                      </td>

                      <td className="py-3 px-3 text-center text-sage-600 font-semibold">
                        {p.minQuantity} {p.minQuantity > 1 ? 'seats' : 'seat'}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.autoCloseOnEnd
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-sage-100 text-sage-800 border border-sage-200'
                        }`}>
                          {p.autoCloseOnEnd ? 'Auto-Closes' : 'Auto-Renews'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs font-bold ${p.canPause ? 'text-sage-700' : 'text-slate-300'}`}>
                          {p.canPause ? '✓' : '✕'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href="/catalog"
                          className="px-2.5 py-1 rounded-lg bg-sage-800 hover:bg-sage-900 text-white font-bold text-[11px] inline-flex items-center space-x-1 shadow-xs"
                        >
                          <span>Select</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
