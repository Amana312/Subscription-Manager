import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "quotations.json");

async function readQuotes(): Promise<Quote[]> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw) as Quote[];
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFile, "[]", "utf8");
    return [];
  }
}

async function writeQuotes(quotes: Quote[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(quotes, null, 2), "utf8");
}

export async function GET() {
  return NextResponse.json(await readQuotes());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.customer?.trim() || !body.item?.trim()) {
    return NextResponse.json({ error: "Customer and item are required." }, { status: 400 });
  }
  const quantity = Math.max(1, Number(body.quantity) || 1);
  const unitPrice = Math.max(0, Number(body.unitPrice) || 0);
  const subtotal = quantity * unitPrice;
  const tax = subtotal * 0.05;
  const created = new Date();
  const expiry = new Date(created);
  expiry.setDate(expiry.getDate() + 30);
  const quote: Quote = {
    id: `QT-${Date.now().toString().slice(-7)}`,
    customer: String(body.customer).trim(),
    email: String(body.email || "").trim(),
    item: String(body.item).trim(),
    quantity,
    unitPrice,
    tax,
    total: subtotal + tax,
    createdAt: created.toISOString(),
    expiresAt: expiry.toISOString(),
    status: "Draft",
  };
  const quotes = await readQuotes();
  quotes.unshift(quote);
  await writeQuotes(quotes);
  return NextResponse.json(quote, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const quotes = await readQuotes();
  const index = quotes.findIndex((quote) => quote.id === body.id);
  if (index < 0) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  if (body.status) quotes[index].status = body.status;
  await writeQuotes(quotes);
  return NextResponse.json(quotes[index]);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Quotation ID is required." }, { status: 400 });
  const quotes = await readQuotes();
  const remaining = quotes.filter((quote) => quote.id !== id);
  if (remaining.length === quotes.length) {
    return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  }
  await writeQuotes(remaining);
  return NextResponse.json({ success: true });
}
