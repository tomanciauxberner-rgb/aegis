"use client";

import { useState } from "react";

export function RequestAccessForm() {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    if (fullName.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr("Please enter your name and a valid email.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, roleTitle, organisation, email, message }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Submission failed");
      }
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setErr(e instanceof Error ? e.message : "Submission failed");
    }
  }

  if (status === "done") {
    return (
      <div className="ra-wrap">
        <div className="ra-done">
          <p className="ra-done-title">Request received — thank you.</p>
          <p className="ra-done-sub">We&apos;ll be in touch. In the meantime, the platform is open to explore.</p>
        </div>
        <style>{raStyles}</style>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="ra-collapsed">
        <button className="ra-trigger" onClick={() => setOpen(true)}>
          Request contributor access
        </button>
        <p className="ra-trigger-sub">Viewing is open to all · contribution is granted on request</p>
        <style>{raStyles}</style>
      </div>
    );
  }

  return (
    <div className="ra-wrap" id="request-access">
      <div className="ra-head">
        <p className="ra-label">Request contributor access</p>
        <p className="ra-intro">
          Viewing is open to everyone. To help shape what Aegis tracks — uploading reports, validating data —
          tell us a little about you. No commitment, just a conversation.
        </p>
      </div>

      <div className="ra-grid">
        <input className="ra-input" placeholder="I am… (your name)" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className="ra-input" placeholder="Role / title (optional)" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
        <input className="ra-input" placeholder="Organisation (optional)" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
        <input className="ra-input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <textarea className="ra-textarea" rows={3} placeholder="What draws you to Aegis, and how might you contribute? (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />

      {err && <p className="ra-err">{err}</p>}

      <button className="ra-btn" onClick={submit} disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Request access"}
      </button>

      <style>{raStyles}</style>
    </div>
  );
}

const raStyles = `
  .ra-collapsed { width: 100%; max-width: 760px; margin: 0 auto 56px; text-align: center; }
  .ra-trigger {
    padding: 13px 28px; font-size: 14px; font-weight: 600;
    background: transparent; color: #4f7cff; border: 1px solid rgba(79,124,255,0.4);
    border-radius: 10px; cursor: pointer; transition: all 0.2s;
  }
  .ra-trigger:hover { background: rgba(79,124,255,0.1); border-color: #4f7cff; }
  .ra-trigger-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 10px; }
  .ra-wrap {
    width: 100%;
    max-width: 760px;
    margin: 0 auto 56px;
    padding: 28px;
    border: 1px solid rgba(79,124,255,0.25);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(79,124,255,0.06), rgba(255,255,255,0.02));
    text-align: left;
  }
  .ra-label {
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: #4f7cff; margin-bottom: 8px;
  }
  .ra-intro { font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.6); margin-bottom: 18px; }
  .ra-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .ra-input, .ra-textarea {
    width: 100%; padding: 11px 13px; font-size: 14px;
    background: rgba(7,21,37,0.6); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 9px; color: #fff; outline: none; font-family: inherit;
  }
  .ra-textarea { resize: vertical; margin-bottom: 10px; }
  .ra-input::placeholder, .ra-textarea::placeholder { color: rgba(255,255,255,0.35); }
  .ra-input:focus, .ra-textarea:focus { border-color: #4f7cff; }
  .ra-err { font-size: 12px; color: #ff7676; margin-bottom: 10px; }
  .ra-btn {
    width: 100%; padding: 13px; font-size: 14px; font-weight: 600;
    background: #4f7cff; color: #fff; border: none; border-radius: 9px; cursor: pointer;
    transition: background 0.2s;
  }
  .ra-btn:hover { background: #3d6af0; }
  .ra-btn:disabled { opacity: 0.6; cursor: default; }
  .ra-done { text-align: center; padding: 12px 0; }
  .ra-done-title { font-size: 16px; font-weight: 700; color: #34d399; margin-bottom: 6px; }
  .ra-done-sub { font-size: 13px; color: rgba(255,255,255,0.6); }
  @media (max-width: 700px) { .ra-grid { grid-template-columns: 1fr; } }
`;
