import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { FriaWizardState, RiskLevel } from "@/types";
import type { JurisprudenceCase } from "@/types/jurisprudence";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2", fontWeight: 700 },
  ],
});

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#22c55e",
  minimal:  "#6b7280",
};

const s = StyleSheet.create({
  page:           { fontFamily: "Inter", fontSize: 9, color: "#1a1a2e", padding: "40 50 50 50", lineHeight: 1.5 },
  coverPage:      { fontFamily: "Inter", fontSize: 9, color: "#1a1a2e", padding: "60 50 50 50", lineHeight: 1.5, backgroundColor: "#0f0f1a" },
  coverTitle:     { fontSize: 28, fontWeight: 700, color: "#ffffff", marginBottom: 8, lineHeight: 1.2 },
  coverSubtitle:  { fontSize: 13, color: "#a0a0c0", marginBottom: 40 },
  coverMeta:      { fontSize: 9, color: "#6060a0", marginTop: 4 },
  coverBadge:     { backgroundColor: "#4f7cff", color: "#ffffff", fontSize: 8, fontWeight: 700, padding: "4 10", borderRadius: 4, marginBottom: 24, alignSelf: "flex-start" },
  coverDivider:   { borderBottomWidth: 1, borderBottomColor: "#2a2a4a", marginVertical: 32 },
  h1:             { fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 12, marginTop: 24 },
  h2:             { fontSize: 12, fontWeight: 700, color: "#1a1a2e", marginBottom: 8, marginTop: 16 },
  h3:             { fontSize: 10, fontWeight: 700, color: "#3a3a5e", marginBottom: 6, marginTop: 12 },
  body:           { fontSize: 9, color: "#3a3a5e", marginBottom: 6 },
  label:          { fontSize: 7.5, fontWeight: 700, color: "#6060a0", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  section:        { marginBottom: 20 },
  card:           { backgroundColor: "#f8f8fc", borderRadius: 6, padding: "10 12", marginBottom: 8 },
  cardBorder:     { backgroundColor: "#f8f8fc", borderRadius: 6, padding: "10 12", marginBottom: 8, borderLeftWidth: 3 },
  row:            { flexDirection: "row", gap: 12 },
  col:            { flex: 1 },
  badge:          { fontSize: 7.5, fontWeight: 700, padding: "2 7", borderRadius: 3, alignSelf: "flex-start", marginBottom: 4 },
  divider:        { borderBottomWidth: 1, borderBottomColor: "#e8e8f0", marginVertical: 16 },
  footer:         { position: "absolute", bottom: 30, left: 50, right: 50, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: "#9090b0" },
  tableHeader:    { flexDirection: "row", backgroundColor: "#e8e8f4", padding: "5 8", borderRadius: "4 4 0 0" },
  tableRow:       { flexDirection: "row", padding: "5 8", borderBottomWidth: 1, borderBottomColor: "#f0f0f8" },
  tableCell:      { fontSize: 8.5 },
  riskPill:       { fontSize: 7, fontWeight: 700, padding: "2 6", borderRadius: 10, color: "#ffffff" },
  toc:            { backgroundColor: "#f0f0f8", borderRadius: 6, padding: "14 16", marginBottom: 20 },
  tocItem:        { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  tocText:        { fontSize: 9, color: "#3a3a5e" },
  tocPage:        { fontSize: 9, color: "#9090b0" },
  legalNote:      { backgroundColor: "#fff8e8", borderRadius: 6, padding: "10 12", borderLeftWidth: 3, borderLeftColor: "#eab308", marginBottom: 12 },
  articleRef:     { fontSize: 7.5, color: "#4f7cff", fontWeight: 700 },
});

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <Text style={[s.riskPill, { backgroundColor: RISK_COLORS[level] ?? "#6b7280" }]}>
      {level.toUpperCase()}
    </Text>
  );
}

function Footer({ title, page }: { title: string; page: number }) {
  return (
    <View style={s.footer} fixed>
      <Text>Aegis FRIA — {title}</Text>
      <Text>Confidential — Art. 27 AI Act</Text>
      <Text>Page {page}</Text>
    </View>
  );
}

function riskScore(likelihood: RiskLevel, severity: RiskLevel): RiskLevel {
  const score: Record<RiskLevel, number> = { minimal: 1, low: 2, medium: 3, high: 4, critical: 5 };
  const s = score[likelihood] * score[severity];
  if (s >= 20) return "critical";
  if (s >= 12) return "high";
  if (s >= 6)  return "medium";
  if (s >= 3)  return "low";
  return "minimal";
}

interface PDFProps {
  state: FriaWizardState;
  systemName: string;
  orgName: string;
  cases: JurisprudenceCase[];
  generatedAt: string;
}

export function FriaPdfDocument({ state, systemName, orgName, cases, generatedAt }: PDFProps) {
  const overallRisks = state.risks.map((r) => riskScore(r.likelihood, r.severity));
  const highestRisk: RiskLevel = overallRisks.includes("critical") ? "critical"
    : overallRisks.includes("high") ? "high"
    : overallRisks.includes("medium") ? "medium"
    : overallRisks.includes("low") ? "low"
    : "minimal";

  const refNumber = `FRIA-${new Date(generatedAt).getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return (
    <Document
      title={`FRIA — ${systemName}`}
      author={orgName}
      subject="Fundamental Rights Impact Assessment — EU AI Act Art. 27"
      keywords="FRIA, AI Act, fundamental rights, impact assessment"
      creator="Aegis Platform"
    >
      {/* ── Cover page ── */}
      <Page size="A4" style={s.coverPage}>
        <Text style={s.coverBadge}>FUNDAMENTAL RIGHTS IMPACT ASSESSMENT</Text>
        <Text style={s.coverTitle}>{systemName}</Text>
        <Text style={s.coverSubtitle}>{orgName}</Text>
        <View style={s.coverDivider} />
        <View style={[s.row, { marginBottom: 8 }]}>
          <View style={s.col}>
            <Text style={[s.coverMeta, { color: "#a0a0c0", fontSize: 8 }]}>REFERENCE NUMBER</Text>
            <Text style={[s.coverMeta, { color: "#ffffff", fontSize: 10, fontWeight: 700 }]}>{refNumber}</Text>
          </View>
          <View style={s.col}>
            <Text style={[s.coverMeta, { color: "#a0a0c0", fontSize: 8 }]}>GENERATED</Text>
            <Text style={[s.coverMeta, { color: "#ffffff", fontSize: 10 }]}>{new Date(generatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</Text>
          </View>
          <View style={s.col}>
            <Text style={[s.coverMeta, { color: "#a0a0c0", fontSize: 8 }]}>OVERALL RISK</Text>
            <Text style={[s.coverMeta, { color: RISK_COLORS[highestRisk], fontSize: 10, fontWeight: 700 }]}>{highestRisk.toUpperCase()}</Text>
          </View>
        </View>
        <View style={s.coverDivider} />
        <Text style={[s.coverMeta, { color: "#6060a0", fontSize: 8 }]}>
          This document constitutes a Fundamental Rights Impact Assessment (FRIA) prepared pursuant to Article 27 of Regulation (EU) 2024/1689 of the European Parliament and of the Council on Artificial Intelligence (the AI Act). It documents the assessment of impacts on fundamental rights of the deployment of a high-risk AI system as defined under Annex III of the AI Act.
        </Text>
        <View style={[s.coverDivider, { marginTop: 40 }]} />
        <Text style={[s.coverMeta, { color: "#4040a0" }]}>Generated by Aegis — aegis-eu.com</Text>
      </Page>

      {/* ── Section 1: Context ── */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.h1}>1. Deployment Context</Text>
          <Text style={[s.articleRef, { marginBottom: 8 }]}>Art. 27(1)(a) AI Act — Description of the processes in which the AI system will be used</Text>

          <View style={s.card}>
            <Text style={s.label}>Deployment Description</Text>
            <Text style={s.body}>{state.context.deploymentDescription || "Not provided."}</Text>
          </View>

          <View style={s.row}>
            <View style={s.col}>
              <View style={s.card}>
                <Text style={s.label}>Operational Frequency</Text>
                <Text style={s.body}>{state.context.operationalFrequency || "Not specified."}</Text>
              </View>
            </View>
            <View style={s.col}>
              <View style={s.card}>
                <Text style={s.label}>Deployment Duration</Text>
                <Text style={s.body}>{state.context.duration || "Not specified."}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section 2: Affected Populations ── */}
        <View style={s.section}>
          <Text style={s.h1}>2. Affected Populations</Text>
          <Text style={[s.articleRef, { marginBottom: 8 }]}>Art. 27(1)(b) AI Act — Categories of natural persons and groups affected</Text>

          {state.affectedGroups.length === 0 ? (
            <Text style={s.body}>No affected groups identified.</Text>
          ) : (
            state.affectedGroups.map((g, i) => (
              <View key={i} style={[s.cardBorder, { borderLeftColor: RISK_COLORS[g.vulnerabilityLevel] }]}>
                <View style={s.row}>
                  <View style={[s.col, { flex: 2 }]}>
                    <Text style={s.label}>Population Group</Text>
                    <Text style={s.body}>{g.populationCode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Text>
                  </View>
                  <View style={s.col}>
                    <Text style={s.label}>Estimated Size</Text>
                    <Text style={s.body}>{g.estimatedSize || "Unknown"}</Text>
                  </View>
                  <View style={s.col}>
                    <Text style={s.label}>Vulnerability</Text>
                    <RiskBadge level={g.vulnerabilityLevel} />
                  </View>
                </View>
                {g.specificConcerns && (
                  <>
                    <Text style={[s.label, { marginTop: 6 }]}>Specific Concerns</Text>
                    <Text style={s.body}>{g.specificConcerns}</Text>
                  </>
                )}
              </View>
            ))
          )}
        </View>

        <Footer title={systemName} page={2} />
      </Page>

      {/* ── Section 3: Risks ── */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.h1}>3. Fundamental Rights Risks</Text>
          <Text style={[s.articleRef, { marginBottom: 8 }]}>Art. 27(1)(c) AI Act — Risks to fundamental rights and their likelihood and severity</Text>

          {state.risks.length === 0 ? (
            <Text style={s.body}>No risks identified.</Text>
          ) : (
            state.risks.map((r, i) => {
              const overall = riskScore(r.likelihood, r.severity);
              return (
                <View key={i} style={[s.cardBorder, { borderLeftColor: RISK_COLORS[overall] }]}>
                  <View style={[s.row, { marginBottom: 6 }]}>
                    <View style={[s.col, { flex: 3 }]}>
                      <Text style={s.h3}>{r.title}</Text>
                      <Text style={[s.label, { color: "#8080b0" }]}>{r.rightsCategoryCode.replace(/_/g, " ").toUpperCase()}</Text>
                    </View>
                    <View style={s.col}>
                      <Text style={s.label}>Likelihood</Text>
                      <RiskBadge level={r.likelihood} />
                    </View>
                    <View style={s.col}>
                      <Text style={s.label}>Severity</Text>
                      <RiskBadge level={r.severity} />
                    </View>
                    <View style={s.col}>
                      <Text style={s.label}>Overall</Text>
                      <RiskBadge level={overall} />
                    </View>
                  </View>
                  <Text style={s.body}>{r.description}</Text>
                  {r.dataEvidence && r.dataEvidence.length > 0 && (
                    <View style={{ marginTop: 6 }}>
                      <Text style={s.label}>Statistical Evidence</Text>
                      {r.dataEvidence.map((e, j) => (
                        <Text key={j} style={[s.body, { color: "#6060a0" }]}>
                          • {e.country} ({e.year}): {e.value}% — {e.source}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <Footer title={systemName} page={3} />
      </Page>

      {/* ── Section 4: Mitigations ── */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.h1}>4. Mitigation Measures</Text>
          <Text style={[s.articleRef, { marginBottom: 8 }]}>Art. 27(1)(d) AI Act — Measures envisaged to address identified risks</Text>

          {state.mitigations.length === 0 ? (
            <Text style={s.body}>No mitigation measures defined.</Text>
          ) : (
            state.mitigations.map((m, i) => {
              const linkedRisk = state.risks.find((r) => r.id === m.riskId);
              return (
                <View key={i} style={s.card}>
                  <View style={s.row}>
                    <View style={[s.col, { flex: 3 }]}>
                      <Text style={s.h3}>{m.title}</Text>
                      {linkedRisk && (
                        <Text style={[s.body, { color: "#8080b0", fontSize: 8 }]}>
                          Addresses: {linkedRisk.title}
                        </Text>
                      )}
                    </View>
                    <View style={s.col}>
                      <Text style={s.label}>Responsible</Text>
                      <Text style={s.body}>{m.responsible || "TBD"}</Text>
                    </View>
                    <View style={s.col}>
                      <Text style={s.label}>Deadline</Text>
                      <Text style={s.body}>{m.deadline ? new Date(m.deadline).toLocaleDateString("en-GB") : "TBD"}</Text>
                    </View>
                  </View>
                  <Text style={[s.body, { marginTop: 4 }]}>{m.description}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* ── Section 5: Human Oversight ── */}
        <View style={s.section}>
          <Text style={s.h1}>5. Human Oversight</Text>
          <Text style={[s.articleRef, { marginBottom: 8 }]}>Art. 27(1)(e) AI Act — Human oversight measures</Text>

          <View style={s.card}>
            <Text style={s.label}>Oversight Measures</Text>
            <Text style={s.body}>{state.context.humanOversightMeasures || "Not documented."}</Text>
          </View>
        </View>

        {/* ── Section 6: DPIA ── */}
        {(state.dpiaReference || state.dpiaOverlapNotes) && (
          <View style={s.section}>
            <Text style={s.h1}>6. DPIA Relationship</Text>
            <Text style={[s.articleRef, { marginBottom: 8 }]}>Art. 27(3) AI Act — Relationship with existing DPIA</Text>

            {state.dpiaReference && (
              <View style={s.card}>
                <Text style={s.label}>DPIA Reference</Text>
                <Text style={s.body}>{state.dpiaReference}</Text>
              </View>
            )}
            {state.dpiaOverlapNotes && (
              <View style={s.card}>
                <Text style={s.label}>Overlap Notes</Text>
                <Text style={s.body}>{state.dpiaOverlapNotes}</Text>
              </View>
            )}
          </View>
        )}

        <Footer title={systemName} page={4} />
      </Page>

      {/* ── Section 7: Jurisprudence ── */}
      {cases.length > 0 && (
        <Page size="A4" style={s.page}>
          <View style={s.section}>
            <Text style={s.h1}>7. Relevant Case Law</Text>
            <Text style={[s.articleRef, { marginBottom: 8 }]}>Supporting jurisprudence from CJEU, ECHR, national courts and DPAs</Text>

            {cases.map((c, i) => (
              <View key={i} style={s.card}>
                <View style={s.row}>
                  <View style={[s.col, { flex: 3 }]}>
                    <Text style={s.h3}>{c.name}</Text>
                    <Text style={[s.body, { color: "#8080b0", fontSize: 8 }]}>{c.citation} — {c.court} ({c.year}){c.country ? ` — ${c.country}` : ""}</Text>
                  </View>
                  <View style={s.col}>
                    <Text style={s.label}>Relevance</Text>
                    <Text style={[s.badge, {
                      backgroundColor: c.relevance === "binding" ? "#4f7cff" : c.relevance === "persuasive" ? "#a07cff" : "#e8b84b",
                      color: "#ffffff",
                    }]}>{c.relevance.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={[s.label, { marginTop: 6 }]}>Holding</Text>
                <Text style={s.body}>{c.holding}</Text>
                {c.ai_act_articles.length > 0 && (
                  <Text style={[s.body, { color: "#4f7cff", marginTop: 4, fontSize: 8 }]}>
                    AI Act: {c.ai_act_articles.join(" · ")}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <Footer title={systemName} page={5} />
        </Page>
      )}

      {/* ── Section 8: Legal basis & signature ── */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.h1}>{cases.length > 0 ? "8" : "7"}. Legal Basis & Declaration</Text>

          <View style={s.legalNote}>
            <Text style={[s.body, { fontWeight: 700, marginBottom: 4 }]}>Article 27 AI Act — Fundamental Rights Impact Assessment</Text>
            <Text style={s.body}>
              This assessment has been conducted pursuant to Article 27 of Regulation (EU) 2024/1689 (the AI Act). Deployers of high-risk AI systems listed in Annex III are required to conduct a fundamental rights impact assessment prior to putting the system into service and to update it when materially changed.
            </Text>
          </View>

          <View style={s.legalNote}>
            <Text style={[s.body, { fontWeight: 700, marginBottom: 4 }]}>Article 27(4) — Notification Obligation</Text>
            <Text style={s.body}>
              Where the assessment identifies significant risks to fundamental rights, the deployer shall notify the relevant market surveillance authority and, where applicable, the data protection supervisory authority without undue delay.
            </Text>
          </View>

          <View style={[s.card, { marginTop: 24 }]}>
            <Text style={s.label}>Declaration</Text>
            <Text style={s.body}>
              I declare that this Fundamental Rights Impact Assessment has been conducted in good faith and to the best of my knowledge reflects the actual deployment context, affected populations, identified risks, and planned mitigation measures for the AI system described herein.
            </Text>
            <View style={[s.row, { marginTop: 24 }]}>
              <View style={s.col}>
                <View style={{ borderBottomWidth: 1, borderBottomColor: "#c0c0d0", marginBottom: 4, paddingBottom: 16 }} />
                <Text style={s.label}>Signature</Text>
              </View>
              <View style={s.col}>
                <View style={{ borderBottomWidth: 1, borderBottomColor: "#c0c0d0", marginBottom: 4, paddingBottom: 16 }} />
                <Text style={s.label}>Date</Text>
              </View>
              <View style={s.col}>
                <View style={{ borderBottomWidth: 1, borderBottomColor: "#c0c0d0", marginBottom: 4, paddingBottom: 16 }} />
                <Text style={s.label}>Function</Text>
              </View>
            </View>
          </View>

          <View style={[s.card, { marginTop: 12, backgroundColor: "#f0f4ff" }]}>
            <View style={s.row}>
              <View style={s.col}>
                <Text style={s.label}>Reference Number</Text>
                <Text style={[s.body, { fontWeight: 700 }]}>{refNumber}</Text>
              </View>
              <View style={s.col}>
                <Text style={s.label}>Generated</Text>
                <Text style={s.body}>{new Date(generatedAt).toLocaleString("en-GB")}</Text>
              </View>
              <View style={s.col}>
                <Text style={s.label}>Platform</Text>
                <Text style={s.body}>Aegis — aegis-eu.com</Text>
              </View>
            </View>
          </View>
        </View>

        <Footer title={systemName} page={cases.length > 0 ? 6 : 5} />
      </Page>
    </Document>
  );
}
