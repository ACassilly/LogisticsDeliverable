'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPortal() {
  const router = useRouter();
  useEffect(() => { document.title = 'Admin Portal | Portlandia Logistics'; }, []);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
      <p className="text-muted-foreground">Full system administration — users, roles, bookings, blog, and reports.</p>
    </main>
  );
}
