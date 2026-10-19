"use client";

import React, { useState } from "react";
import { Lock, ShieldAlert, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect admin password");
      }
    } catch {
      setError("Network authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="p-8 rounded-3xl bg-orbit-card border border-orbit-border shadow-card space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-orbit-surface flex items-center justify-center text-orbit-signal mx-auto border border-orbit-border">
          <Lock className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-display font-black text-orbit-text">
            Admin Authentication
          </h1>
          <p className="text-xs text-orbit-muted">
            Enter authorized master password to manage ORBIT BLR event inventory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-orbit-surface border border-orbit-border focus:border-orbit-signal focus:outline-none font-mono text-sm text-orbit-text placeholder-orbit-subtle"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg transition-all shadow-glow disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Authenticate Session"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
