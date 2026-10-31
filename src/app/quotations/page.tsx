"use client";

import { useEffect, useMemo, useState } from "react";
import { FilePlus2, Search, Trash2, Eye, CheckCircle2 } from "lucide-react";

type Quote = {
  id: string;
  customer: string;
  email: string;
  item: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
  createdAt: string;
  expiresAt: string;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired" | "Converted";
};

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  async function loadQuotes() {
    setLoading(true);
    try {
      const response = await fetch("/api/quotations");
      if (response.ok) setQuotes(await response.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadQuotes(); }, []);

  async function createQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, email, item, quantity, unitPrice }),
    });
    if (!response.ok) {
      const result = await response.json();
      alert(result.error || "Could not create quotation.");
      return;
    }
    setCustomer(""); setEmail(""); setItem(""); setQuantity("1"); setUnitPrice("");
    setShowForm(false);
    await loadQuotes();
  }

  async function updateStatus(id: string, status: Quote["status"]) {
    await fetch("/api/quotations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await loadQuotes();
  }

  async function deleteQuote(id: string) {
    if (!window.confirm("Delete this quotation?")) return;
    await fetch(`/api/quotations?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadQuotes();
  }

  const filtered = useMemo(() => quotes.filter((quote) =>
    [quote.id, quote.customer, quote.email].join(" ").toLowerCase().includes(search.toLowerCase())
  ), [quotes, search]);

  const totalValue = quotes.reduce((sum, quote) => sum + quote.total, 0);
  const drafts = quotes.filter((quote) => quote.status === "Draft").length;

  return (
    <main className="min-h-screen bg-cream-50 px-5 py-8 text-sage-900 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-500">SubSage / Finance</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Quotations</h1>
            <p className="mt-2 text-sm text-sage-600">Create, track and manage customer quotations.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sage-700 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-sage-800">
            <FilePlus2 size={17} /> Create quotation
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-sage-200 bg-white p-5"><p className="text-sm text-sage-500">Total quotations</p><p className="mt-2 text-3xl font-semibold">{quotes.length}</p></div>
          <div className="rounded-2xl border border-sage-200 bg-white p-5"><p className="text-sm text-sage-500">Drafts</p><p className="mt-2 text-3xl font-semibold">{drafts}</p></div>
          <div className="rounded-2xl border border-sage-200 bg-white p-5"><p className="text-sm text-sage-500">Total quoted value</p><p className="mt-2 text-3xl font-semibold">{money(totalValue)}</p></div>
        </section>

        {showForm && <form onSubmit={createQuote} className="grid gap-4 rounded-2xl border border-sage-200 bg-white p-6 sm:grid-cols-2">
          <div className="sm:col-span-2"><h2 className="text-lg font-semibold">New quotation</h2><p className="text-sm text-sage-500">Tax is calculated automatically at 5%; validity is 30 days.</p></div>
          <label className="text-sm font-medium">Customer name<input required value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1 w-full rounded-lg border border-sage-200 px-3 py-2 outline-none focus:border-sage-500" /></label>
          <label className="text-sm font-medium">Customer email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-sage-200 px-3 py-2 outline-none focus:border-sage-500" /></label>
          <label className="text-sm font-medium">Product / plan<input required value={item} onChange={(e) => setItem(e.target.value)} className="mt-1 w-full rounded-lg border border-sage-200 px-3 py-2 outline-none focus:border-sage-500" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">Quantity<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 w-full rounded-lg border border-sage-200 px-3 py-2 outline-none focus:border-sage-500" /></label>
            <label className="text-sm font-medium">Unit price (USD)<input required type="number" min="0" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="mt-1 w-full rounded-lg border border-sage-200 px-3 py-2 outline-none focus:border-sage-500" /></label>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-sage-200 px-4 py-2 text-sm">Cancel</button><button className="rounded-lg bg-sage-700 px-5 py-2 text-sm font-medium text-white hover:bg-sage-800">Save quotation</button></div>
        </form>}

        <section className="overflow-hidden rounded-2xl border border-sage-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-sage-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-semibold">All quotations</h2><p className="text-sm text-sage-500">Your latest customer quotes</p></div>
            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer or quote ID" className="w-full rounded-lg border border-sage-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-sage-500 sm:w-72" /></div>
          </div>
          {loading ? <p className="p-8 text-center text-sm text-sage-500">Loading quotations...</p> : filtered.length === 0 ? <div className="p-12 text-center"><FilePlus2 className="mx-auto text-sage-300" size={30} /><p className="mt-3 font-medium">No quotations yet</p><p className="mt-1 text-sm text-sage-500">Create your first quotation to see it here.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-sage-50 text-xs uppercase tracking-wide text-sage-500"><tr><th className="px-5 py-3">Quote ID</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Item</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-sage-100">{filtered.map((quote) => <tr key={quote.id} className="hover:bg-sage-50/60"><td className="px-5 py-4 font-medium">{quote.id}</td><td className="px-5 py-4"><div className="font-medium">{quote.customer}</div><div className="text-xs text-sage-500">{quote.email}</div></td><td className="px-5 py-4">{quote.item} × {quote.quantity}</td><td className="px-5 py-4">{new Date(quote.createdAt).toLocaleDateString()}</td><td className="px-5 py-4 font-medium">{money(quote.total)}</td><td className="px-5 py-4"><span className="rounded-full bg-sage-100 px-3 py-1 text-xs text-sage-700">{quote.status}</span></td><td className="px-5 py-4"><div className="flex items-center gap-2"><button title="Mark as sent" onClick={() => updateStatus(quote.id, "Sent")} className="rounded-lg p-2 text-sage-600 hover:bg-sage-100"><Eye size={16} /></button><button title="Mark as accepted" onClick={() => updateStatus(quote.id, "Accepted")} className="rounded-lg p-2 text-sage-600 hover:bg-sage-100"><CheckCircle2 size={16} /></button><button title="Delete" onClick={() => deleteQuote(quote.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
        </section>
        <p className="text-xs text-sage-500">Prototype note: quotations are stored in the local .data folder. Converting a quote into a subscription is not implemented yet.</p>
      </div>
    </main>
  );
}
