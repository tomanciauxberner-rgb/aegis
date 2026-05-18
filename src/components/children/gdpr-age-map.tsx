"use client";

import { cn } from "@/lib/utils";
import { GDPR_AGES } from "@/types/children";

const CODES = Object.keys(GDPR_AGES);

function ageBg(age: number) {
  if (age === 13) return { bg: "#0f2d1f", border: "#5ce8a040", text: "#5ce8a0" };
  if (age === 14) return { bg: "#1a3a6e", border: "#4f7cff40", text: "#4f7cff" };
  if (age === 15) return { bg: "#3d3220", border: "#e8b84b40", text: "#e8b84b" };
  return          { bg: "#3d1a1a", border: "#ff5c5c40", text: "#ff5c5c" };
}

interface Props {
  selectedCountry?: string;
  onSelect?: (code: string) => void;
}

export function GdprAgeMap({ selectedCountry, onSelect }: Props) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-dim font-mono">
          GDPR Art. 8 — digital consent age per member state
        </p>
        <div className="flex items-center gap-3 text-xs font-mono">
          {[13, 14, 15, 16].map((age) => {
            const c = ageBg(age);
            return (
              <span key={age} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c.bg, border: `1px solid ${c.border}` }} />
                <span style={{ color: c.text }}>{age}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1.5">
        {CODES.map((code) => {
          const c = GDPR_AGES[code];
          const colors = ageBg(c.age);
          const isSelected = selectedCountry === code;
          return (
            <button
              key={code}
              onClick={() => onSelect?.(code === selectedCountry ? "" : code)}
              title={`${c.name} — consent age: ${c.age}`}
              className={cn(
                "flex flex-col items-center gap-0.5 p-1.5 rounded transition-all",
                onSelect && "cursor-pointer hover:opacity-80"
              )}
              style={{
                background: colors.bg,
                border: `1px solid ${isSelected ? colors.text : colors.border}`,
                boxShadow: isSelected ? `0 0 0 2px ${colors.text}40` : undefined,
                transform: isSelected ? "scale(1.08)" : undefined,
              }}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="text-xs font-bold font-mono" style={{ color: colors.text }}>{c.age}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-text-dim mt-3 font-mono">
        A system lawful in BE (13) may be unlawful in NL (16) — verify consent age per deployment country.
      </p>
    </div>
  );
}
