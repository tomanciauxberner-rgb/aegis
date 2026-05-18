import {
  pgTable, varchar, text, integer, bigint, boolean, jsonb, timestamp, date, uuid,
  pgEnum, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const childrenSeverityEnum = pgEnum("children_severity", [
  "critical", "high", "medium", "low", "informational",
]);

export const dpaOutcomeEnum = pgEnum("dpa_decision_outcome", [
  "fine", "warning", "injunction", "dismissed", "ongoing", "settled", "guidance",
]);

export const appStorePlatformEnum = pgEnum("app_store_platform", ["ios", "android"]);

export const edtechRiskTierEnum = pgEnum("edtech_risk_tier", [
  "annex3", "prohibited", "limited", "minimal", "unknown",
]);

export const childrenGdprAge = pgTable("children_gdpr_age", {
  countryCode:  varchar("country_code", { length: 2 }).primaryKey(),
  ageConsent:   integer("age_consent").notNull(),
  legalSource:  text("legal_source").notNull(),
  sourceUrl:    text("source_url").notNull(),
  lastVerified: date("last_verified").notNull(),
  notes:        text("notes"),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const childrenDpaRegistry = pgTable("children_dpa_registry", {
  id:              varchar("id", { length: 40 }).primaryKey(),
  countryCode:     varchar("country_code", { length: 2 }).notNull(),
  nameLocal:       varchar("name_local", { length: 200 }).notNull(),
  nameEn:          varchar("name_en", { length: 200 }).notNull(),
  acronym:         varchar("acronym", { length: 20 }),
  languageCode:    varchar("language_code", { length: 5 }).notNull(),
  decisionsUrl:    text("decisions_url").notNull(),
  rssUrl:          text("rss_url"),
  ingestStrategy:  varchar("ingest_strategy", { length: 20 }).notNull().default("manual"),
  ingestSelector:  jsonb("ingest_selector").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  lastIngestedAt:  timestamp("last_ingested_at", { withTimezone: true }),
  isActive:        boolean("is_active").notNull().default(true),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("dpa_country_idx").on(t.countryCode),
  index("dpa_active_idx").on(t.isActive),
]);

export const childrenDpaDecisions = pgTable("children_dpa_decisions", {
  id:               varchar("id", { length: 120 }).primaryKey(),
  dpaId:            varchar("dpa_id", { length: 40 }).notNull().references(() => childrenDpaRegistry.id),
  countryCode:      varchar("country_code", { length: 2 }).notNull(),
  decisionDate:     date("decision_date").notNull(),
  publishedDate:    date("published_date"),
  titleOriginal:    text("title_original").notNull(),
  titleEn:          text("title_en").notNull(),
  summaryEn:        text("summary_en").notNull(),
  outcome:          dpaOutcomeEnum("outcome").notNull().default("ongoing"),
  fineAmountEur:    bigint("fine_amount_eur", { mode: "number" }),
  respondentName:   varchar("respondent_name", { length: 400 }),
  respondentSector: varchar("respondent_sector", { length: 100 }),
  legalBases:       jsonb("legal_bases").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  ageRangeAffected: varchar("age_range_affected", { length: 40 }),
  severity:         childrenSeverityEnum("severity").notNull().default("medium"),
  sourceUrl:        text("source_url").notNull(),
  languageOriginal: varchar("language_original", { length: 5 }).notNull(),
  ingestSource:     varchar("ingest_source", { length: 20 }).notNull().default("auto"),
  externalId:       varchar("external_id", { length: 200 }),
  isVerified:       boolean("is_verified").notNull().default(false),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("dpa_dec_unique_ext").on(t.dpaId, t.externalId),
  index("dpa_dec_country_idx").on(t.countryCode),
  index("dpa_dec_date_idx").on(t.decisionDate),
  index("dpa_dec_severity_idx").on(t.severity),
  index("dpa_dec_outcome_idx").on(t.outcome),
]);

export const childrenApps = pgTable("children_apps", {
  id:                  varchar("id", { length: 120 }).primaryKey(),
  bundleId:            varchar("bundle_id", { length: 200 }).notNull().unique(),
  name:                varchar("name", { length: 300 }).notNull(),
  publisher:           varchar("publisher", { length: 300 }),
  platforms:           jsonb("platforms").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  declaredMinAge:      integer("declared_min_age"),
  isVlop:              boolean("is_vlop").notNull().default(false),
  vlopDesignationDate: date("vlop_designation_date"),
  dsaTransparencyUrl:  text("dsa_transparency_url"),
  category:            varchar("category", { length: 80 }),
  createdAt:           timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:           timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("apps_vlop_idx").on(t.isVlop),
]);

export const childrenAppRankings = pgTable("children_app_rankings", {
  id:            uuid("id").primaryKey().defaultRandom(),
  appId:         varchar("app_id", { length: 120 }).notNull().references(() => childrenApps.id),
  countryCode:   varchar("country_code", { length: 2 }).notNull(),
  platform:      appStorePlatformEnum("platform").notNull(),
  chartCategory: varchar("chart_category", { length: 80 }).notNull(),
  rank:          integer("rank").notNull(),
  observedAt:    timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("app_rank_unique").on(t.appId, t.countryCode, t.platform, t.chartCategory, t.observedAt),
  index("app_rank_country_idx").on(t.countryCode, t.observedAt),
  index("app_rank_app_idx").on(t.appId, t.observedAt),
]);

export const childrenDsaReports = pgTable("children_dsa_reports", {
  id:             varchar("id", { length: 120 }).primaryKey(),
  appId:          varchar("app_id", { length: 120 }).notNull().references(() => childrenApps.id),
  periodStart:    date("period_start").notNull(),
  periodEnd:      date("period_end").notNull(),
  reportUrl:      text("report_url").notNull(),
  pdfHash:        varchar("pdf_hash", { length: 64 }),
  metrics:        jsonb("metrics").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  minorsSpecific: jsonb("minors_specific").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  ingestedAt:     timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("dsa_rep_unique").on(t.appId, t.periodStart, t.periodEnd),
  index("dsa_rep_period_idx").on(t.periodEnd),
]);

export const childrenEdtechSystems = pgTable("children_edtech_systems", {
  id:                varchar("id", { length: 120 }).primaryKey(),
  countryCode:       varchar("country_code", { length: 2 }).notNull(),
  systemName:        varchar("system_name", { length: 300 }).notNull(),
  vendor:            varchar("vendor", { length: 300 }),
  deploymentScope:   varchar("deployment_scope", { length: 50 }).notNull(),
  studentsAffected:  integer("students_affected"),
  aiFeatures:        jsonb("ai_features").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  annex3Categories:  jsonb("annex3_categories").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  riskTier:          edtechRiskTierEnum("risk_tier").notNull().default("unknown"),
  legalStatus:       varchar("legal_status", { length: 50 }),
  sourceUrl:         text("source_url"),
  description:       text("description").notNull(),
  lastVerified:      date("last_verified").notNull(),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:         timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("edtech_country_idx").on(t.countryCode),
  index("edtech_risk_idx").on(t.riskTier),
]);

export const childrenIngestLog = pgTable("children_ingest_log", {
  id:           uuid("id").primaryKey().defaultRandom(),
  pipeline:     varchar("pipeline", { length: 40 }).notNull(),
  startedAt:    timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt:  timestamp("completed_at", { withTimezone: true }),
  inserted:     integer("inserted").notNull().default(0),
  updated:      integer("updated").notNull().default(0),
  skipped:      integer("skipped").notNull().default(0),
  errors:       integer("errors").notNull().default(0),
  errorDetails: jsonb("error_details").$type<string[]>().default(sql`'[]'::jsonb`),
}, (t) => [
  index("children_log_pipeline_idx").on(t.pipeline, t.startedAt),
]);
