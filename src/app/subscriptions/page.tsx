'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Search, Plus, Pause, Play, XCircle, CalendarDays, CreditCard, Users, Layers } from 'lucide-react';
import type { Plan } from '@/lib/plans-types';
import type { Subscription } from '@/lib/subscriptions-types';

type SessionInfo = { id: string; name: string; email: string; role: string };

const money = (value: number) => value.toLocaleString('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
});
const dateLabel = (value: string) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});

function readSession(): SessionInfo | null {
  try {
    const item = document.cookie.split('; ').find((part) => part.startsWith('brightloop_session='));
    if (!item) return null;
    const raw = item.split('=').slice(1).join('=');
    try { return JSON.parse(decodeURIComponent(raw)); }
    catch { return JSON.parse(raw); }
  } catch { return null; }
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAUSED: 'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  EXPIRED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function SubscriptionsPage() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [interval, setInterval] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => setSession(readSession()), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [planRes, subRes] = await Promise.all([fetch('/api/plans'), fetch('/api/subscriptions')]);
      const planData = await planRes.json();
      const subData = await subRes.json();
      if (!planRes.ok) throw new Error(planData.error || 'Could not load plans.');
      if (!subRes.ok) throw new Error(subData.error || 'Could not load subscriptions.');
      setPlans(planData.plans || []);
      setSubscriptions(subData.items || []);
      if (!planId && planData.plans?.length) setPlanId(planData.plans[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load subscription data.');
    } finally { setLoading(false); }
  }, [planId]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedPlan = plans.find((plan) => plan.id === planId);
  const unitPrice = selectedPlan ? selectedPlan.rates[interval.toLowerCase() as 'daily' | 'weekly' | 'monthly' | 'yearly'] : 0;
  const total = unitPrice * quantity;

  const filtered = useMemo(() => subscriptions.filter((sub) => {
    const matchesQuery = [sub.number, sub.customerName, sub.customerEmail, sub.planName]
      .some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (statusFilter === 'ALL' || sub.status === statusFilter);
  }), [subscriptions, query, statusFilter]);

  const stats = useMemo(() => ({
    active: subscriptions.filter((s) => s.status === 'ACTIVE').length,
    paused: subscriptions.filter((s) => s.status === 'PAUSED').length,
    recurring: subscriptions.filter((s) => s.status === 'ACTIVE').reduce((sum, s) => sum + s.total, 0),
  }), [subscriptions]);

  async function createNewSubscription(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const payload = {
        customerId: session?.role === 'CUSTOMER' ? session.id : customerId,
        customerName: session?.role === 'CUSTOMER' ? session.name : customerName,
        customerEmail: session?.role === 'CUSTOMER' ? session.email : customerEmail,
        planId, interval, quantity: Number(quantity), startDate,
      };
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create subscription.');
      setNotice(`Subscription ${data.subscription.number} created successfully.`);
      setShowForm(false);
      setCustomerName(''); setCustomerEmail(''); setCustomerId(''); setQuantity(1);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create subscription.');
    } finally { setSaving(false); }
  }

  async function changeStatus(id: string, action: 'pause' | 'resume' | 'cancel') {
    setError(''); setNotice('');
    const response = await fetch('/api/subscriptions/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Action could not be completed.'); return; }
    setNotice(`Subscription updated to ${data.subscription.status.toLowerCase()}.`);
    await loadData();
  }

  const isCustomer = session?.role === 'CUSTOMER';

  return (
    <main className="min-h-screen bg-[#f8f6f0] px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-sage-600 hover:text-sage-900">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-500">SubSage · Task 5</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-sage-950">Subscriptions</h1>
            <p className="mt-1 text-sm text-sage-600">Create, monitor and manage recurring customer subscriptions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/invoices" className="inline-flex items-center gap-2 rounded-xl border border-sage-200 bg-white px-3 py-2.5 text-sm font-semibold text-sage-800 hover:bg-sage-50">
              <CreditCard className="h-4 w-4" /> Invoices
            </Link>
            <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-sage-200 bg-white px-3 py-2.5 text-sm font-semibold text-sage-800 hover:bg-sage-50">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button onClick={() => { setShowForm(!showForm); setError(''); }} className="inline-flex items-center gap-2 rounded-xl bg-sage-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-sage-900">
              <Plus className="h-4 w-4" /> New subscription
            </button>
          </div>
        </header>

        {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {notice && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-sage-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm text-sage-600"><span>Active subscriptions</span><Users className="h-4 w-4" /></div>
            <p className="mt-2 text-2xl font-extrabold text-sage-950">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-sage-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm text-sage-600"><span>Paused subscriptions</span><Pause className="h-4 w-4" /></div>
            <p className="mt-2 text-2xl font-extrabold text-sage-950">{stats.paused}</p>
          </div>
          <div className="rounded-2xl border border-sage-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm text-sage-600"><span>Active recurring value</span><Layers className="h-4 w-4" /></div>
            <p className="mt-2 text-2xl font-extrabold text-sage-950">{money(stats.recurring)}</p>
            <p className="mt-1 text-[11px] text-sage-500">Sum of active cycle values</p>
          </div>
        </section>

        {showForm && (
          <section className="mb-6 rounded-2xl border border-sage-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-lg font-bold text-sage-950">Create subscription</h2><p className="text-xs text-sage-500">Choose a customer, plan and recurring interval.</p></div>
              <button onClick={() => setShowForm(false)} className="text-sm text-sage-500 hover:text-sage-900">Close</button>
            </div>
            <form onSubmit={createNewSubscription} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {!isCustomer && <>
                <label className="text-xs font-semibold text-sage-700">Customer name
                  <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer / company" className="mt-1 w-full rounded-xl border border-sage-200 px-3 py-2.5 text-sm outline-none focus:border-sage-600" />
                </label>
                <label className="text-xs font-semibold text-sage-700">Customer email
                  <input required type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="name@company.com" className="mt-1 w-full rounded-xl border border-sage-200 px-3 py-2.5 text-sm outline-none focus:border-sage-600" />
                </label>
                <label className="text-xs font-semibold text-sage-700">Customer ID
                  <input required value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="Account ID from Accounts" className="mt-1 w-full rounded-xl border border-sage-200 px-3 py-2.5 text-sm outline-none focus:border-sage-600" />
                </label>
              </>}
              {isCustomer && <div className="rounded-xl bg-sage-50 p-3 text-sm text-sage-700 sm:col-span-2"><b>{session?.name}</b><br />{session?.email}<p className="mt-1 text-xs">Subscription will be linked to your signed-in account.</p></div>}
              <label className="text-xs font-semibold text-sage-700">Plan
                <select required value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sage-600">
                  {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-sage-700">Billing interval
                <select value={interval} onChange={(e) => setInterval(e.target.value as typeof interval)} className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sage-600">
                  <option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="YEARLY">Yearly</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-sage-700">Quantity / seats
                <input required type="number" min={selectedPlan?.minQuantity || 1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sage-200 px-3 py-2.5 text-sm outline-none focus:border-sage-600" />
                <span className="mt-1 block font-normal text-sage-500">Minimum: {selectedPlan?.minQuantity || 1}</span>
              </label>
              <label className="text-xs font-semibold text-sage-700">Start date
                <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-xl border border-sage-200 px-3 py-2.5 text-sm outline-none focus:border-sage-600" />
              </label>
              <div className="flex items-end justify-between rounded-xl bg-sage-50 p-3 sm:col-span-2 lg:col-span-3">
                <div><p className="text-xs text-sage-600">Estimated recurring total</p><p className="text-xl font-extrabold text-sage-950">{money(total)} <span className="text-xs font-semibold text-sage-500">/ {interval.toLowerCase()}</span></p></div>
                <button disabled={saving || plans.length === 0} className="rounded-xl bg-sage-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-sage-900 disabled:opacity-50">{saving ? 'Creating…' : 'Create subscription'}</button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-sage-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-sage-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-bold text-sage-950">All subscriptions</h2><p className="text-xs text-sage-500">{filtered.length} records</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-sage-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer or plan" className="w-full rounded-xl border border-sage-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-sage-600 sm:w-64" /></div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm text-sage-700 outline-none"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option><option value="CANCELLED">Cancelled</option><option value="EXPIRED">Expired</option></select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-sage-50 text-[11px] uppercase tracking-wide text-sage-500"><tr><th className="px-4 py-3">Subscription</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Cycle value</th><th className="px-4 py-3">Next billing</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-sage-100">
                {filtered.map((sub) => <tr key={sub.id} className="hover:bg-sage-50/50">
                  <td className="px-4 py-3"><p className="font-bold text-sage-900">{sub.number}</p><p className="text-[11px] text-sage-500">Started {dateLabel(sub.startDate)}</p></td>
                  <td className="px-4 py-3"><p className="font-semibold text-sage-800">{sub.customerName}</p><p className="text-xs text-sage-500">{sub.customerEmail}</p></td>
                  <td className="px-4 py-3"><p className="font-semibold text-sage-800">{sub.planName}</p><p className="text-xs text-sage-500">{sub.quantity} × {money(sub.unitPrice)} / {sub.interval.toLowerCase()}</p></td>
                  <td className="px-4 py-3 font-bold text-sage-900">{money(sub.total)}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-sage-700"><CalendarDays className="h-3.5 w-3.5" />{dateLabel(sub.nextBillingDate)}</span></td>
                  <td className="px-4 py-3"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[sub.status] || statusStyles.EXPIRED}`}>{sub.status}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2">
                    {!isCustomer && sub.status === 'ACTIVE' && <button title="Pause" onClick={() => changeStatus(sub.id, 'pause')} className="rounded-lg border border-amber-200 p-2 text-amber-700 hover:bg-amber-50"><Pause className="h-3.5 w-3.5" /></button>}
                    {!isCustomer && sub.status === 'PAUSED' && <button title="Resume" onClick={() => changeStatus(sub.id, 'resume')} className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50"><Play className="h-3.5 w-3.5" /></button>}
                    {!isCustomer && ['ACTIVE', 'PAUSED'].includes(sub.status) && <button title="Cancel" onClick={() => changeStatus(sub.id, 'cancel')} className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50"><XCircle className="h-3.5 w-3.5" /></button>}
                    {isCustomer && <span className="text-xs text-sage-400">View only</span>}
                    {!isCustomer && !['ACTIVE', 'PAUSED'].includes(sub.status) && <span className="text-xs text-sage-400">No actions</span>}
                  </div></td>
                </tr>)}
                {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-sage-500">No subscriptions found. Create one to get started.</td></tr>}
                {loading && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-sage-500">Loading subscriptions…</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <p className="mt-4 text-center text-[11px] text-sage-500">SubSage · Subscription records are linked to the billing module through subscription IDs and line items.</p>
      </div>
    </main>
  );
}
