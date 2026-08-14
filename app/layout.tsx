import type { Metadata } from 'next';
import React from 'react';
import '../src/index.css';
import { AppProvider } from '../src/context/AppContext';
import { Navbar } from '../src/components/layout/Navbar';
import { Footer } from '../src/components/layout/Footer';
import { WhatsAppWidget } from '../src/components/support/WhatsAppWidget';

export const metadata: Metadata = {
  title: 'TrainMedix | DMHCA Accredited Hospital Clinical Training Platform',
  description: 'Book DMHCA-accredited clinical rotations across 11 medical specialties in top tertiary hospitals in India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        <AppProvider>
          <div className="min-h-screen flex flex-col justify-between">
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
            <WhatsAppWidget />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
