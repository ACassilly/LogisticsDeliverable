'use client';
import { useEffect } from 'react';

export default function CarrierPortal() {
  useEffect(() => { document.title = 'Carrier Portal | Portlandia Logistics'; }, []);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Carrier Portal</h1>
      <p className="text-muted-foreground">View assigned loads, update delivery status, and manage carrier documents.</p>
    </main>
  );
}
