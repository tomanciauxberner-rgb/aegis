"use client";

import { useState } from "react";
import { Building2, Users, Key, Upload, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

function DataIngestionPanel() {
  const [text, setText] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleIngest() {
    if (text.trim().length < 50) {
      setError("Paste at least 50 characters of report text");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          sourceLabel: sourceLabel.trim() || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data);
      if (data.inserted > 0) setText("");
    } catch (e: any) {
      setError(e.message ?? "Ingestion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded bg-accent-soft flex items-center justify-center">
          <Upload className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="font-semibold">Data Ingestion — AI-Powered</h2>
          <p className="text-xs text-text-muted font-[family-name:var(--font-mono)]">
            Paste text from FRA reports — Claude extracts structured data points automatically
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Source name</label>
            <input type="text" className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors" placeholder="e.g. Roma Survey 2024" value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Source URL</label>
            <input type="url" className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors" placeholder="https://fra.europa.eu/..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Report text (max 30,000 chars)</label>
          <textarea
            className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors"
            style={{ height: 200, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6 }}
            placeholder={"Paste report text here...\n\nExample: \"45% of respondents of African descent say they experienced racial discrimination in the 5 years before the survey. In Germany and Austria, it goes over 70%.\""}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">{text.length.toLocaleString()} / 30,000</span>
            <button onClick={handleIngest} disabled={loading || text.trim().length < 50} className="flex items-center gap-2 px-4 py-2 bg-accent text-bg rounded text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting with Claude…</> : <><Upload className="w-4 h-4" /> Extract &amp; ingest</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger-soft border border-danger/30 rounded">
            <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-surface-2 border border-border rounded space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-success">Extraction complete</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Extracted", value: result.extracted },
                { label: "Valid", value: result.valid },
                { label: "Inserted", value: result.inserted },
                { label: "Skipped", value: result.skipped },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 bg-bg border border-border rounded">
                  <div className="text-lg font-bold text-text font-[family-name:var(--font-mono)]">{s.value}</div>
                  <div className="text-xs text-text-muted">{s.label}</div>
                </div>
              ))}
            </div>
            {result.preview?.length > 0 && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-[family-name:var(--font-mono)]">Preview</p>
                <div className="space-y-1">
                  {result.preview.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-[family-name:var(--font-mono)]">
                      <span className="text-text font-bold w-6">{p.country}</span>
                      <span className="text-text-muted">{p.group}</span>
                      <span className="text-text-dim">·</span>
                      <span className="text-text-muted">{p.sector}</span>
                      <span className="text-text-dim">·</span>
                      <span className="text-accent font-bold">{p.value}%</span>
                      <span className="text-text-dim">{p.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-text-muted">Organization settings, team management, and data ingestion</p>
      </div>
      <div className="space-y-6">
        <DataIngestionPanel />
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-accent-soft flex items-center justify-center"><Building2 className="w-4 h-4 text-accent" /></div>
            <h2 className="font-semibold">Organization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Name</label>
              <input type="text" className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors" placeholder="Organization name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Sector</label>
              <select className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors">
                <option value="">Select sector</option>
                <option value="employment">Employment / HR</option>
                <option value="education">Education</option>
                <option value="finance">Finance / Credit</option>
                <option value="insurance">Insurance</option>
                <option value="public">Public sector</option>
                <option value="law_enforcement">Law enforcement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-gold-soft flex items-center justify-center"><Users className="w-4 h-4 text-gold" /></div>
            <h2 className="font-semibold">Team members</h2>
          </div>
          <p className="text-sm text-text-muted">Invite team members to collaborate on FRIA assessments. Roles: Owner, Admin, Analyst, Viewer.</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-success-soft flex items-center justify-center"><Key className="w-4 h-4 text-success" /></div>
            <h2 className="font-semibold">API Access</h2>
          </div>
          <p className="text-sm text-text-muted">Generate API keys to access the Aegis Open Data API and integrate with your existing compliance tools.</p>
        </div>
      </div>
    </div>
  );
}
