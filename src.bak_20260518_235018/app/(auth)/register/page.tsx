"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { org_name: orgName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/login?message=check_email");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Shield className="w-6 h-6 text-accent" />
          <span className="font-[family-name:var(--font-display)] font-semibold text-xl tracking-tight">
            Aegis
          </span>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h1 className="text-lg font-semibold mb-1">Create account</h1>
          <p className="text-sm text-text-muted mb-6">
            Start your FRIA assessment today
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="org"
                className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider"
              >
                Organization name
              </label>
              <input
                id="org"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                placeholder="you@company.eu"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>

            {error && (
              <div className="text-xs text-danger bg-danger-soft border border-danger/20 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create account <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-dim mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
