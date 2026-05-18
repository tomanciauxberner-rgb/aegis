export { ALL_CASES as JURISPRUDENCE_CASES } from "./cases";

import type { JurisprudenceCase } from "@/types/jurisprudence";
import { ALL_CASES } from "./cases";

export function getCasesForContext(opts: {
  rights_categories: string[];
  sectors: string[];
  limit?: number;
}): JurisprudenceCase[] {
  const { rights_categories, sectors, limit = 8 } = opts;

  const scored = ALL_CASES.map((c) => {
    const catMatch = c.rights_categories.filter((r) =>
      rights_categories.includes(r)
    ).length;
    const secMatch = c.sectors.filter((s) => sectors.includes(s)).length;
    const relevanceBonus =
      c.relevance === "binding" ? 2 : c.relevance === "persuasive" ? 1 : 0;
    return { case: c, score: catMatch * 3 + secMatch * 2 + relevanceBonus };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.case);
}
