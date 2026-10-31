import Link from 'next/link';
import { Shield, ArrowRight, Users, Layers, Receipt } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#714B67] text-white shadow-xl">
          <Shield className="w-9 h-9" />
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Brightloop Software
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Unified Subscription Management, Automated Recurring Billing, and Customer Portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/accounts"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#714B67] hover:bg-[#5b3c53] text-white font-semibold shadow-lg transition-all space-x-2"
          >
            <span>Launch Accounts & Auth Portal</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Users className="w-6 h-6 text-[#714B67] mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Role-Based Access</h3>
            <p className="text-xs text-slate-500 mt-1">Admin, Staff & Customer Portal with strict permission boundaries.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Layers className="w-6 h-6 text-[#017E84] mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Plans & Subscriptions</h3>
            <p className="text-xs text-slate-500 mt-1">Lifecycle from Draft to Quotation, Confirmed, Active, and Closed.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Receipt className="w-6 h-6 text-amber-600 mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Automated Billing</h3>
            <p className="text-xs text-slate-500 mt-1">Idempotent recurring billing engine, taxes, and instant MRR analytics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
