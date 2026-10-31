import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Subscription = {
  id: string; customer: string; customerEmail: string; planId: string; planName: string;
  productName: string; interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  quantity: number; unitPrice: number; taxRate: number; taxAmount: number; amount: number;
  startDate: string; expiryDate: string; paymentTerms: string;
  status: "Draft" | "Quotation" | "Confirmed" | "Active" | "Paused" | "Closed";
  autoCloseOnEnd: boolean; canPause: boolean; canCancelEarly: boolean; canRenew: boolean;
  createdAt: string;
};
const file = path.join(process.cwd(), ".data", "subscriptions.json");
async function readAll(): Promise<Subscription[]> {
  try { return JSON.parse(await fs.readFile(file, "utf8")) as Subscription[]; }
  catch { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, "[]"); return []; }
}
async function writeAll(rows: Subscription[]) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(rows, null, 2), "utf8");
}
export async function GET() { return NextResponse.json({ subscriptions: await readAll() }); }
export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.customer || !b.planId || !b.startDate || !b.expiryDate || !b.interval) {
    return NextResponse.json({ error: "Customer, plan, start date, expiry date and billing interval are required." }, { status: 400 });
  }
  if (new Date(b.expiryDate) < new Date(b.startDate)) return NextResponse.json({ error: "Expiry date must be after start date." }, { status: 400 });
  const qty = Math.max(1, Number(b.quantity) || 1), price = Math.max(0, Number(b.unitPrice) || 0);
  const rate = Math.max(0, Number(b.taxRate) || 0), subtotal = qty * price, taxAmount = subtotal * rate / 100;
  const row: Subscription = {
    id: `SUB-${Date.now().toString().slice(-7)}`, customer: String(b.customer), customerEmail: String(b.customerEmail || ""),
    planId: String(b.planId), planName: String(b.planName || ""), productName: String(b.productName || ""),
    interval: b.interval, quantity: qty, unitPrice: price, taxRate: rate, taxAmount, amount: subtotal + taxAmount,
    startDate: b.startDate, expiryDate: b.expiryDate, paymentTerms: String(b.paymentTerms || "Due on receipt"),
    status: "Draft", autoCloseOnEnd: !!b.autoCloseOnEnd, canPause: !!b.canPause,
    canCancelEarly: !!b.canCancelEarly, canRenew: !!b.canRenew, createdAt: new Date().toISOString()
  };
  const rows = await readAll(); rows.unshift(row); await writeAll(rows);
  return NextResponse.json(row, { status: 201 });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json(); const rows = await readAll(); const i = rows.findIndex(x => x.id === b.id);
  if (i < 0) return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
  const s = rows[i];
  if (b.action === "quotation" && s.status === "Draft") s.status = "Quotation";
  else if (b.action === "confirm" && s.status === "Quotation") s.status = "Confirmed";
  else if (b.action === "activate" && s.status === "Confirmed") s.status = "Active";
  else if (b.action === "pause" && s.status === "Active" && s.canPause) s.status = "Paused";
  else if (b.action === "resume" && s.status === "Paused") s.status = "Active";
  else if (b.action === "close" && ["Active", "Paused", "Confirmed"].includes(s.status) && (s.canCancelEarly || s.status === "Confirmed")) s.status = "Closed";
  else if (b.action === "renew" && s.status === "Active" && s.canRenew) {
    const end = new Date(s.expiryDate); const start = new Date(end); start.setDate(start.getDate() + 1);
    const next = new Date(start);
    if (s.interval === "DAILY") next.setDate(next.getDate()+1);
    if (s.interval === "WEEKLY") next.setDate(next.getDate()+7);
    if (s.interval === "MONTHLY") next.setMonth(next.getMonth()+1);
    if (s.interval === "YEARLY") next.setFullYear(next.getFullYear()+1);
    s.startDate = start.toISOString().slice(0,10); s.expiryDate = next.toISOString().slice(0,10);
  } else return NextResponse.json({ error: "This action is not allowed for the current subscription or plan." }, { status: 400 });
  await writeAll(rows); return NextResponse.json(s);
}
