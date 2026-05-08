'use client';
import { useEffect } from 'react';

export default function ShipperPortal() {
  useEffect(() => { document.title = 'Shipper Portal | Portlandia Logistics'; }, []);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Shipper Portal</h1>
      <p className="text-muted-foreground">Get instant LTL freight quotes, book shipments, and track deliveries.</p>
    </main>
  );
}
