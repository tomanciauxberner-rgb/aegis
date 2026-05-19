import crypto from "crypto";
import { detectSignals, hasMinorSignal } from "./signal-detector";
import { resolveJurisdictions } from "./jurisdiction-resolver";
import { mapObligations } from "./obligation-mapper";
import type { TriggerScanResult } from "./types";

export { detectSignals, hasMinorSignal } from "./signal-detector";
export { resolveJurisdictions } from "./jurisdiction-resolver";
export { mapObligations } from "./obligation-mapper";
export type { TriggerScanResult, TriggerObligation, DetectedSignal, ResolvedJurisdiction } from "./types";

export function scanText(
  text: string,
  context?: { jurisdiction?: string; system_type?: string },
): TriggerScanResult {
  const normalized = text.slice(0, 8000).trim();
  const input_hash = crypto.createHash("sha256").update(normalized).digest("hex");

  const signals = detectSignals(normalized);
  const jurisdictions = resolveJurisdictions(normalized, context?.jurisdiction);
  const obligations = mapObligations(signals, jurisdictions);

  return {
    input_hash,
    signals,
    jurisdictions,
    obligations,
    scanned_at: new Date().toISOString(),
    signal_count: signals.length,
    obligation_count: obligations.length,
  };
}
