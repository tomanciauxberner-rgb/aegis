"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/overview");
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lr { min-height: 100vh; background: #0d1b35; display: flex; align-items: center; justify-content: center; padding: 60px 24px; }
        .lbox { width: 100%; max-width: 500px; display: flex; flex-direction: column; align-items: center; }
        .linput {
          width: 100%; padding: 18px 20px;
          background: #071525; border: 1px solid #1e3a5f; border-radius: 10px;
          color: #e8eaf0; font-size: 16px; font-family: monospace; outline: none; -webkit-appearance: none;
        }
        .linput::placeholder { color: #2a4a6b; }
        .linput:focus { border-color: #4f7cff; }
        .linput:-webkit-autofill, .linput:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #071525 inset !important;
          -webkit-text-fill-color: #e8eaf0 !important;
        }
        .lbtn {
          width: 100%; padding: 18px; background: #1a4fa8; border: none; border-radius: 10px;
          color: #fff; font-size: 15px; font-family: monospace; letter-spacing: 0.1em;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .lbtn:hover { background: #2060c0; }
        .lbtn:disabled { opacity: 0.5; }
        .llabel { display: block; font-family: monospace; font-size: 12px; letter-spacing: 0.15em; color: #4a7fa5; margin-bottom: 10px; }
      `}</style>

      <main className="lr">
        <div className="lbox">

          <Image src="/logo.png" alt="Aegis" width={280} height={328} priority style={{ marginBottom: 48 }} />

          <div style={{ width: "100%", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 20, padding: "48px 44px" }}>
            <h2 style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 600, letterSpacing: "0.12em", color: "#e8eaf0", marginBottom: 8 }}>
              SIGN IN
            </h2>
            <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.1em", color: "#4a7fa5", marginBottom: 40 }}>
              RESTRICTED ACCESS — AUTHORIZED ANALYSTS ONLY
            </p>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <label className="llabel">EMAIL ADDRESS</label>
                <input className="linput" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="analyst@institution.eu" />
              </div>
              <div>
                <label className="llabel">PASSWORD</label>
                <input className="linput" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" minLength={8} placeholder="••••••••" />
              </div>
              {error && (
                <div style={{ padding: "16px 20px", background: "rgba(255,92,92,0.08)", border: "1px solid rgba(255,92,92,0.3)", borderRadius: 10, color: "#ff5c5c", fontFamily: "monospace", fontSize: 14 }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="lbtn">
                {loading
                  ? <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" />
                  : <><span>ACCESS PLATFORM</span><ArrowRight style={{ width: 18, height: 18 }} /></>
                }
              </button>
            </form>
          </div>

          <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", width: "100%" }}>
            <p style={{ fontFamily: "monospace", fontSize: 13, color: "#2a4a6b" }}>
              No account?{" "}<Link href="/register" style={{ color: "#4f7cff", textDecoration: "none" }}>Request access</Link>
            </p>
            <p style={{ fontFamily: "monospace", fontSize: 13, color: "#1e3a5f" }}>© 2026 Aegis</p>
          </div>

        </div>
      </main>
    </>
  );
}
