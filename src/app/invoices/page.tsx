'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Invoice } from '@/lib/invoices-types';

type Row = Invoice & { overdue: boolean };

const METHODS = ['CARD', 'BANK_TRANSFER', 'UPI', 'CASH', 'CHEQUE'];
const PAGE_SIZE = 20;
const money = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function readRole(): string | null {
  try {
    const part = document.cookie.split('; ').find((c) => c.startsWith('brightloop_session='));
    if (!part) return null;
    const raw = part.split('=').slice(1).join('=');
    let s;
    try {
      s = JSON.parse(decodeURIComponent(raw));
    } catch {
      s = JSON.parse(raw);
    }
    return s.role ?? null;
  } catch {
    return null;
  }
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const [payFor, setPayFor] = useState<Row | null>(null);
  const [method, setMethod] = useState('UPI');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => setRole(readRole()), []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    const res = await fetch('/api/invoices?' + params.toString());
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Could not load invoices.');
      setRows([]);
    } else {
      setError('');
      setRows(data.items);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, status, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: 'confirm' | 'cancel') {
    const res = await fetch('/api/invoices/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Action failed.');
    else setError('');
    load();
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!payFor) return;
    const res = await fetch('/api/invoices/' + payFor.id + '/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, amount: Number(amount), note }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Payment failed.');
      return;
    }
    setError('');
    setPayFor(null);
    setAmount('');
    setNote('');
    load();
  }

  const isStaff = role === 'ADMIN' || role === 'STAFF';
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>

      <form
        className="flex flex-wrap gap-3 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQ(qInput.trim());
        }}
      >
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search invoice no. or customer"
          className="border rounded px-3 py-2 w-72"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button className="bg-slate-900 text-white rounded px-4 py-2">Search</button>
        <span className="self-center text-sm text-slate-500">{total} invoices</span>
      </form>

      {error && <p className="mb-3 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</p>}

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-2">Invoice</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Due</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-right">Paid</th>
              <th className="p-2">Status</th>
              {isStaff && <th className="p-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 font-medium">{r.number}</td>
                <td className="p-2">{r.customerName}</td>
                <td className="p-2">{r.dueDate.slice(0, 10)}</td>
                <td className="p-2 text-right">{money(r.total)}</td>
                <td className="p-2 text-right">{money(r.amountPaid)}</td>
                <td className="p-2">
                  <span className="rounded bg-slate-200 px-2 py-0.5">{r.status}</span>
                  {r.overdue && (
                    <span className="ml-1 rounded bg-red-100 text-red-700 px-2 py-0.5">OVERDUE</span>
                  )}
                </td>
                {isStaff && (
                  <td className="p-2 space-x-2 whitespace-nowrap">
                    {r.status === 'DRAFT' && (
                      <button className="text-blue-700 underline" onClick={() => act(r.id, 'confirm')}>
                        Confirm
                      </button>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <button
                        className="text-green-700 underline"
                        onClick={() => {
                          setPayFor(r);
                          setAmount(String(Math.round((r.total - r.amountPaid) * 100) / 100));
                        }}
                      >
                        Record payment
                      </button>
                    )}
                    {(r.status === 'DRAFT' || r.status === 'CONFIRMED') && (
                      <button className="text-red-600 underline" onClick={() => act(r.id, 'cancel')}>
                        Cancel
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="p-4 text-slate-500" colSpan={7}>
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="border rounded px-3 py-1 disabled:opacity-40">
          Previous
        </button>
        <span className="text-sm">
          Page {page} of {pages}
        </span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="border rounded px-3 py-1 disabled:opacity-40">
          Next
        </button>
      </div>

      {payFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={submitPayment} className="bg-white rounded-lg p-5 w-full max-w-sm space-y-3">
            <h2 className="font-bold">Record payment for {payFor.number}</h2>
            <p className="text-sm text-slate-500">
              Outstanding: {money(payFor.total - payFor.amountPaid)}
            </p>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="border rounded px-3 py-2 w-full">
              {METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              required
              className="border rounded px-3 py-2 w-full"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="border rounded px-3 py-2 w-full"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setPayFor(null)} className="border rounded px-3 py-2">
                Cancel
              </button>
              <button className="bg-green-600 text-white rounded px-3 py-2">Save payment</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}