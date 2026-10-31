import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brightloop - Subscription & Recurring Billing',
  description: 'Unified software platform to run plans, subscriptions, and recurring billing.',
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
