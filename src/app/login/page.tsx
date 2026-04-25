"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const adminExists = useQuery(api.admins.adminExists);
  const isSetup = adminExists === false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isSetup ? "/api/auth/setup" : "/api/auth/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      if (isSetup) {
        // After creating account, log in immediately
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!loginRes.ok) {
          setError("Account created. Please sign in.");
          return;
        }
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show skeleton while we determine if setup is needed
  if (adminExists === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div className="text-center">
          <h2 className="font-syne text-3xl font-bold text-text-primary">
            {isSetup ? "First-Time Setup" : "Admin Login"}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {isSetup
              ? "No admin account found. Create one to continue."
              : "Sign in to manage your models."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {loading ? "Please wait..." : isSetup ? "Create Account & Continue" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
