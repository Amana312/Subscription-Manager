import Link from 'next/link';
import { ArrowRight, Sparkles, Layers, Users, Receipt } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-6">
        
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-sm mb-1">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>

        <div>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-3 border border-slate-200">
            <span>powered by</span>
            <span className="font-semibold text-slate-900">Brightloop</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            SubSage
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Unified platform to run subscription plans, recurring billing cycles, automated invoicing, and customer accounts.
          </p>
        </div>

        {/* Task Links */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/accounts"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition-all space-x-2"
          >
            <span>Task 1: Accounts & Auth</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
          <Link
            href="/catalog"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-sm font-medium border border-slate-200/90 shadow-sm transition-all space-x-2"
          >
            <span>Task 2: Catalog & Pricing</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 text-left">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
            <Users className="w-4 h-4 text-slate-700 mb-2.5" />
            <h3 className="font-semibold text-slate-900 text-xs">Role-Based Access</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Admin, Staff & Customer Portal with strict permission checks.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
            <Layers className="w-4 h-4 text-slate-700 mb-2.5" />
            <h3 className="font-semibold text-slate-900 text-xs">Catalog & Modifiers</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Dynamic variant pricing rules (including Odoo brand +$560).</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
            <Receipt className="w-4 h-4 text-slate-700 mb-2.5" />
            <h3 className="font-semibold text-slate-900 text-xs">Recurring Billing</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Automated invoice generation engine and payment reconciliation.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
