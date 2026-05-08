'use client';
import { useEffect } from 'react';

export default function DispatcherPortal() {
  useEffect(() => { document.title = 'Dispatcher Portal | Portlandia Logistics'; }, []);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Dispatcher Portal</h1>
      <p className="text-muted-foreground">Coordinate pickups and deliveries, assign carriers, and monitor active shipments.</p>
    </main>
  );
}
