import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SubSage • Powered by Brightloop',
  description: 'SubSage - Unified Subscription, Invoicing & Recurring Billing Platform, powered by Brightloop.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
