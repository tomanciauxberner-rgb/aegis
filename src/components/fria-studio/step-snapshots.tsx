"use client";

import { useState } from "react";
import { Camera, GitCompare, Clock, Trash2 } from "lucide-react";
import { FriaDiffView } from "@/components/fria-studio/fria-diff";
import type { FriaStudioSnapshot } from "@/lib/fria-studio/diff-engine";
import type { EvidenceState } from "@/lib/fria-studio/evidence-schema";

interface StepSnapshotsProps {
  current: {
    domainCode: string | null;
    lifecycleState: Record<string, Record<string, string>>;
    evidenceState: EvidenceState;
  };
  snapshots: FriaStudioSnapshot[];
  onUpdate: (snapshots: FriaStudioSnapshot[]) => void;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function StepSnapshots({ current, snapshots, onUpdate }: StepSnapshotsProps) {
  const [label, setLabel] = useState("");
  const [fromIdx, setFromIdx] = useState<number | null>(null);
  const [toIdx, setToIdx] = useState<number | null>(null);

  function captureSnapshot() {
    const snap: FriaStudioSnapshot = {
      domainCode: current.domainCode,
      lifecycleState: current.lifecycleState,
      evidenceState: current.evidenceState,
      capturedAt: new Date().toISOString(),
      label: label.trim() || `Version ${snapshots.length + 1}`,
    };
    onUpdate([...snapshots, snap]);
    setLabel("");
  }

  function removeSnapshot(idx: number) {
    onUpdate(snapshots.filter((_, i) => i !== idx));
    if (fromIdx === idx) setFromIdx(null);
    if (toIdx === idx) setToIdx(null);
  }

  const canCompare = fromIdx !== null && toIdx !== null && fromIdx !== toIdx;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>
          Versions & diff
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          Capture a snapshot of the assessment at any point — before a review, after a mitigation
          round — and compare any two versions to see exactly what changed: control status,
          evidence, and how residual rights exposure moved.
        </p>
      </div>

      {/* Capture */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Snapshot label (e.g. 'Before expert review')"
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#e8eaf0",
            fontSize: 13,
          }}
        />
        <button
          onClick={captureSnapshot}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", fontSize: 13, fontWeight: 600,
            color: "#fff", background: "#4f7cff", border: "none", borderRadius: 8, cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Camera size={15} /> Capture snapshot
        </button>
      </div>

      {/* History */}
      {snapshots.length === 0 ? (
        <div style={{
          padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13,
          border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <Clock size={18} style={{ opacity: 0.5 }} />
          No versions captured yet. Capture one to start tracking how this FRIA evolves.
        </div>
      ) : (
        <>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
            Captured versions · select two to compare
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {snapshots.map((snap, idx) => {
              const isFrom = fromIdx === idx;
              const isTo = toIdx === idx;
              return (
                <div key={`${snap.capturedAt}-${idx}`} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px",
                  border: `1px solid ${isFrom || isTo ? "rgba(79,124,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 8,
                  background: isFrom || isTo ? "rgba(79,124,255,0.04)" : "transparent",
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>{snap.label}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontFamily: "var(--font-mono), monospace" }}>{fmtDate(snap.capturedAt)}</p>
                  </div>
                  <button
                    onClick={() => setFromIdx(isFrom ? null : idx)}
                    style={{
                      fontSize: 11, fontFamily: "var(--font-mono), monospace", padding: "4px 10px", borderRadius: 6,
                      border: `1px solid ${isFrom ? "#4f7cff" : "rgba(255,255,255,0.1)"}`,
                      background: isFrom ? "rgba(79,124,255,0.12)" : "transparent",
                      color: isFrom ? "#4f7cff" : "rgba(255,255,255,0.4)", cursor: "pointer",
                    }}
                  >
                    From
                  </button>
                  <button
                    onClick={() => setToIdx(isTo ? null : idx)}
                    style={{
                      fontSize: 11, fontFamily: "var(--font-mono), monospace", padding: "4px 10px", borderRadius: 6,
                      border: `1px solid ${isTo ? "#4f7cff" : "rgba(255,255,255,0.1)"}`,
                      background: isTo ? "rgba(79,124,255,0.12)" : "transparent",
                      color: isTo ? "#4f7cff" : "rgba(255,255,255,0.4)", cursor: "pointer",
                    }}
                  >
                    To
                  </button>
                  <button
                    onClick={() => removeSnapshot(idx)}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 6, flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Diff */}
      {canCompare && fromIdx !== null && toIdx !== null && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <GitCompare size={15} style={{ color: "#4f7cff" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0" }}>Comparison</span>
          </div>
          <FriaDiffView from={snapshots[fromIdx]} to={snapshots[toIdx]} />
        </div>
      )}
    </div>
  );
}
