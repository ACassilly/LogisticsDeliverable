'use client';
import { useEffect } from 'react';

export default function LeadershipPortal() {
  useEffect(() => { document.title = 'Leadership Portal | Portlandia Logistics'; }, []);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Leadership Portal</h1>
      <p className="text-muted-foreground">Executive dashboards — revenue analytics, operational KPIs, and team performance.</p>
    </main>
  );
}
