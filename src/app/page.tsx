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

        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
          Brightloop Software
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
          Unified platform to run pricing plans, recurring subscriptions, automated invoicing, and customer billing.
        </p>

        <div className="pt-2">
          <Link
            href="/accounts"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition-all space-x-2"
          >
            <span>Launch Authentication Portal</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 text-left">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
            <Users className="w-4 h-4 text-slate-700 mb-2.5" />
            <h3 className="font-semibold text-slate-900 text-xs">Role-Based Access</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Dedicated permission controls for Admins, Staff, and Client portals.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
            <Layers className="w-4 h-4 text-slate-700 mb-2.5" />
            <h3 className="font-semibold text-slate-900 text-xs">Lifecycle Engine</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">State transitions from Quotation to Confirmed, Active, and Renewal.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
            <Receipt className="w-4 h-4 text-slate-700 mb-2.5" />
            <h3 className="font-semibold text-slate-900 text-xs">Automated Billing</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Idempotent recurring billing runs with automatic tax and discount calculations.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
