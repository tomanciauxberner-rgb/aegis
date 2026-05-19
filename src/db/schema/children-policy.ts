import {
  pgTable, varchar, text, integer, boolean, jsonb, timestamp, date,
  pgEnum, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const policySignalTypeEnum = pgEnum("policy_signal_type", [
  "research_project",
  "opinion_or_guidance",
  "consultation_open",
  "consultation_closed",
  "bill_introduced",
  "bill_adopted",
  "parliamentary_question",
  "position_paper",
  "work_programme",
  "stakeholder_event",
]);

export const policySignalStatusEnum = pgEnum("policy_signal_status", [
  "upcoming", "open", "in_progress", "closed", "adopted", "withdrawn",
]);

export const childrenPolicySources = pgTable("children_policy_sources", {
  id:              varchar("id", { length: 50 }).primaryKey(),
  name:            varchar("name", { length: 200 }).notNull(),
  acronym:         varchar("acronym", { length: 20 }),
  sourceUrl:       text("source_url").notNull(),
  rssUrl:          text("rss_url"),
  scope:           varchar("scope", { length: 20 }).notNull().default("eu"),
  countryCode:     varchar("country_code", { length: 2 }),
  languageCode:    varchar("language_code", { length: 5 }).notNull().default("en"),
  ingestStrategy:  varchar("ingest_strategy", { length: 20 }).notNull().default("manual"),
  isActive:        boolean("is_active").notNull().default(true),
  lastIngestedAt:  timestamp("last_ingested_at", { withTimezone: true }),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("policy_sources_active_idx").on(t.isActive),
  index("policy_sources_scope_idx").on(t.scope),
]);

export const childrenPolicySignals = pgTable("children_policy_signals", {
  id:                varchar("id", { length: 160 }).primaryKey(),
  sourceId:          varchar("source_id", { length: 50 }).notNull().references(() => childrenPolicySources.id),
  signalType:        policySignalTypeEnum("signal_type").notNull(),
  status:            policySignalStatusEnum("status").notNull().default("in_progress"),
  titleOriginal:     text("title_original").notNull(),
  titleEn:           text("title_en").notNull(),
  summaryEn:         text("summary_en").notNull(),
  signalDate:        date("signal_date").notNull(),
  deadlineDate:      date("deadline_date"),
  jurisdiction:      varchar("jurisdiction", { length: 50 }).notNull().default("eu"),
  countryCodes:      jsonb("country_codes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  themes:            jsonb("themes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  legalFrameworks:   jsonb("legal_frameworks").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  relevanceScore:    integer("relevance_score").notNull().default(50),
  whyItMatters:      text("why_it_matters"),
  stakeholders:      jsonb("stakeholders").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  sourceUrl:         text("source_url").notNull(),
  languageOriginal:  varchar("language_original", { length: 5 }).notNull(),
  externalId:        varchar("external_id", { length: 200 }),
  isVerified:        boolean("is_verified").notNull().default(false),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:         timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("policy_sig_unique_ext").on(t.sourceId, t.externalId),
  index("policy_sig_date_idx").on(t.signalDate),
  index("policy_sig_type_idx").on(t.signalType),
  index("policy_sig_status_idx").on(t.status),
  index("policy_sig_relevance_idx").on(t.relevanceScore),
]);
