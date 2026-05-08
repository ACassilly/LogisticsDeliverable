'use client';
import { useEffect } from 'react';

export default function AgentPortal() {
  useEffect(() => { document.title = 'Agent Portal | Portlandia Logistics'; }, []);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Agent Portal</h1>
      <p className="text-muted-foreground">Manage customer accounts, view bookings, and generate quotes on behalf of shippers.</p>
    </main>
  );
}
