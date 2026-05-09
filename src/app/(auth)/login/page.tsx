"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLE_PORTAL_MAP: Record<string, string> = {
  admin: "/portal/admin",
  agent: "/portal/agent",
  carrier: "/portal/carrier",
  dispatcher: "/portal/dispatcher",
  leadership: "/portal/leadership",
  shipper: "/portal/shipper",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.message || "Invalid credentials");
        return;
      }
      const role = (data?.data?.user?.role || "").toLowerCase();
      const dest = ROLE_PORTAL_MAP[role] || "/portal/admin";
      router.push(dest);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "#fafafa" }}>
      <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 400, background: "white", padding: "2rem", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Portlandia Logistics</h1>
        <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>Sign in to your portal</p>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, marginBottom: 16, fontSize: 14 }} autoComplete="email" />
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, marginBottom: 16, fontSize: 14 }} autoComplete="current-password" />
        {error && <div style={{ color: "#c00", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px 16px", background: "black", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
