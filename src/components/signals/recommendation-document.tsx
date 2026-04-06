import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { RecommendationDraft } from "@/types/recommendations";

const GROUP_LABELS: Record<string, string> = {
  african_descent: "People of African descent",
  roma: "Roma",
  muslims: "Muslims",
  lgbtiq: "LGBTIQ people",
  women: "Women",
  disabilities: "Persons with disabilities",
  migrants: "Migrants",
  jews: "Jews",
  general: "General population",
};

const SECTOR_LABELS: Record<string, string> = {
  employment: "Employment",
  education: "Education",
  housing: "Housing",
  healthcare: "Healthcare",
  law_enforcement: "Law enforcement",
  essential_services: "Essential services",
  online: "Online",
  justice: "Justice",
};

const SIGNAL_TYPE_LABELS: Record<string, string> = {
  statistical: "Statistical",
  legislative: "Legislative",
  incident: "Incident",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a2e",
    padding: 48,
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottom: "2px solid #1a1a2e",
    paddingBottom: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flexDirection: "column",
    gap: 2,
  },
  brandName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 8,
    color: "#666",
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  },
  refNumber: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 8,
    color: "#666",
  },
  classificationBanner: {
    backgroundColor: "#1a1a2e",
    padding: "6 12",
    marginBottom: 20,
  },
  classificationText: {
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  metaChip: {
    border: "1px solid #cccccc",
    padding: "3 8",
    fontSize: 8,
    color: "#444",
    letterSpacing: 0.5,
  },
  severityChip: {
    backgroundColor: "#1a1a2e",
    padding: "3 8",
    fontSize: 8,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#888",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
    borderBottom: "1px solid #eeeeee",
    paddingBottom: 3,
  },
  bodyText: {
    fontSize: 10,
    color: "#1a1a2e",
    lineHeight: 1.6,
  },
  evidenceItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    padding: "6 8",
    backgroundColor: "#f8f8f8",
  },
  evidenceType: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#444",
    letterSpacing: 1,
    width: 70,
    flexShrink: 0,
    paddingTop: 1,
  },
  evidenceContent: {
    flex: 1,
  },
  evidenceTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    marginBottom: 2,
  },
  evidenceSummary: {
    fontSize: 8,
    color: "#555",
    lineHeight: 1.5,
    marginBottom: 2,
  },
  evidenceMeta: {
    fontSize: 7,
    color: "#888",
    letterSpacing: 0.3,
  },
  actionGrid: {
    flexDirection: "column",
    gap: 8,
    padding: "10 12",
    border: "1px solid #1a1a2e",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#888",
    letterSpacing: 1,
    width: 90,
    flexShrink: 0,
    paddingTop: 1,
  },
  actionValue: {
    fontSize: 9,
    color: "#1a1a2e",
    flex: 1,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTop: "1px solid #eeeeee",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#aaa",
    letterSpacing: 0.3,
  },
});

interface Props {
  draft: RecommendationDraft;
}

export function RecommendationDocument({ draft }: Props) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const groupLabel = GROUP_LABELS[draft.groupId] ?? draft.groupId;
  const sectorLabel = SECTOR_LABELS[draft.sector] ?? draft.sector;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.brandName}>AEGIS</Text>
            <Text style={styles.brandSub}>INTELLIGENCE PLATFORM</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.refNumber}>{draft.refNumber}</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>
        </View>

        <View style={styles.classificationBanner}>
          <Text style={styles.classificationText}>
            INTELLIGENCE BRIEF — FUNDAMENTAL RIGHTS SIGNAL
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.severityChip}>
            <Text>{draft.severity.toUpperCase()} · {draft.convergenceScore}/3</Text>
          </View>
          <View style={styles.metaChip}>
            <Text>{draft.country}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text>{groupLabel}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text>{sectorLabel}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Situation</Text>
          <Text style={styles.bodyText}>{draft.situation}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Evidence Base</Text>
          {draft.evidenceBase.map((s, i) => (
            <View key={i} style={styles.evidenceItem}>
              <Text style={styles.evidenceType}>
                {SIGNAL_TYPE_LABELS[s.signal_type] ?? s.signal_type}
              </Text>
              <View style={styles.evidenceContent}>
                <Text style={styles.evidenceTitle}>{s.title}</Text>
                {s.summary ? <Text style={styles.evidenceSummary}>{s.summary}</Text> : null}
                <Text style={styles.evidenceMeta}>
                  {[
                    s.delta_pp !== null ? `Δ ${s.delta_pp > 0 ? "+" : ""}${s.delta_pp}pp` : null,
                    s.source,
                    s.year ? String(s.year) : null,
                  ].filter(Boolean).join("  ·  ")}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EU Context</Text>
          <Text style={styles.bodyText}>{draft.euContext}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recommended Action</Text>
          <View style={styles.actionGrid}>
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>ADDRESSEE</Text>
              <Text style={styles.actionValue}>{draft.addressee}</Text>
            </View>
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>LEGAL BASIS</Text>
              <Text style={styles.actionValue}>{draft.legalBasis}</Text>
            </View>
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>ACTION REQUESTED</Text>
              <Text style={styles.actionValue}>{draft.actionRequested}</Text>
            </View>
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>DEADLINE</Text>
              <Text style={styles.actionValue}>{draft.deadline}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Prepared by Aegis Intelligence Platform · {draft.refNumber}
          </Text>
          <Text style={styles.footerText}>
            Sources: FRA surveys · Eurostat · Documented incidents
          </Text>
        </View>
      </Page>
    </Document>
  );
}
