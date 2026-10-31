import Link from 'next/link';
import { ArrowRight, Layers, Users, Receipt, FileText } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-100 text-sage-950 flex flex-col justify-center items-center px-4 py-16 selection:bg-sage-400 selection:text-white">
      <div className="max-w-5xl w-full text-center space-y-6">
        {/* SubSage Official Logo */}
        <div className="flex justify-center mb-2">
          <img
            src="/subsage-logo.jpg"
            alt="SubSage"
            className="h-14 sm:h-16 w-auto object-contain rounded-xl shadow-xs"
          />
        </div>

        <div>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold mb-3 border border-sage-200">
            <span>powered by</span>
            <span className="font-bold">Brightloop Software</span>
          </span>
          <p className="text-sm sm:text-base text-sage-700 max-w-2xl mx-auto leading-relaxed font-medium">
            Unified subscription management, automated recurring billing cycles, catalog variants, and customer self-service portal.
          </p>
        </div>

        {/* Task Navigation Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5">
          <Link href="/accounts" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sage-800 hover:bg-sage-900 text-white text-xs font-bold shadow-sm transition-all space-x-1.5">
            <span>Task 1: Accounts & RBAC</span><ArrowRight className="w-3.5 h-3.5 text-sage-300" />
          </Link>
          <Link href="/catalog" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-sage-50 text-sage-800 text-xs font-bold border border-sage-200 shadow-sm transition-all space-x-1.5">
            <span>Task 2: Catalog & Pricing</span><ArrowRight className="w-3.5 h-3.5 text-sage-400" />
          </Link>
          <Link href="/plans" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-sage-50 text-sage-800 text-xs font-bold border border-sage-200 shadow-sm transition-all space-x-1.5">
            <span>Task 3: Plans Engine</span><ArrowRight className="w-3.5 h-3.5 text-sage-400" />
          </Link>
<Link href="/quotations" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-sage-50 text-sage-800 text-xs font-bold border border-sage-200 shadow-sm transition-all space-x-1.5">
            <span>Task 4: Quotations</span><ArrowRight className="w-3.5 h-3.5 text-sage-400" />
          </Link>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-8 text-left">
          <div className="p-4 bg-white rounded-xl border border-sage-200 shadow-[0_2px_12px_-4px_rgba(27,61,47,0.04)]">
            <Users className="w-5 h-5 text-sage-600 mb-2.5" />
            <h3 className="font-bold text-sage-900 text-xs">Role-Based Access</h3>
            <p className="text-[11px] text-sage-600 mt-1 leading-relaxed">Admin controls, Staff sales handling, and isolated Customer Portal.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-sage-200 shadow-[0_2px_12px_-4px_rgba(27,61,47,0.04)]">
            <Layers className="w-5 h-5 text-sage-600 mb-2.5" />
            <h3 className="font-bold text-sage-900 text-xs">Catalog & Variants</h3>
            <p className="text-[11px] text-sage-600 mt-1 leading-relaxed">Configurable pricing modifiers, including Odoo brand (+ $560).</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-sage-200 shadow-[0_2px_12px_-4px_rgba(27,61,47,0.04)]">
            <Receipt className="w-5 h-5 text-sage-600 mb-2.5" />
            <h3 className="font-bold text-sage-900 text-xs">Recurring Plans</h3>
            <p className="text-[11px] text-sage-600 mt-1 leading-relaxed">Daily, Weekly, Monthly, and Yearly cycles with pause and auto-close rules.</p>
          </div>
<div className="p-4 bg-white rounded-xl border border-sage-200 shadow-[0_2px_12px_-4px_rgba(27,61,47,0.04)]">
            <FileText className="w-5 h-5 text-sage-600 mb-2.5" />
            <h3 className="font-bold text-sage-900 text-xs">Quotation Management</h3>
            <p className="text-[11px] text-sage-600 mt-1 leading-relaxed">Create, search, and track customer quotations with automatic tax and validity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
