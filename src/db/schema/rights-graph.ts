import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, date, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";

export const rgProvenanceEnum = pgEnum("rg_provenance", ["verified", "community", "expert_validated"]);
export const rgRiskTierEnum = pgEnum("rg_risk_tier", ["prohibited", "high_risk", "limited_risk", "minimal_risk", "undetermined"]);
export const rgDeploymentStatusEnum = pgEnum("rg_deployment_status", ["in_production", "piloted", "procured", "announced", "withdrawn", "unknown"]);

export const rgProviders = pgTable("rg_providers", {
  id:          uuid("id").primaryKey().defaultRandom(),
  name:        varchar("name", { length: 200 }).notNull(),
  country:     varchar("country", { length: 2 }),
  description: text("description"),
  website:     varchar("website", { length: 300 }),
  provenance:  rgProvenanceEnum("provenance").notNull().default("community"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rgSystems = pgTable("rg_systems", {
  id:               uuid("id").primaryKey().defaultRandom(),
  name:             varchar("name", { length: 250 }).notNull(),
  providerId:       uuid("provider_id").references(() => rgProviders.id, { onDelete: "set null" }),
  purpose:          text("purpose").notNull(),
  annexArea:        varchar("annex_area", { length: 40 }).notNull(),
  riskTier:         rgRiskTierEnum("risk_tier").notNull().default("undetermined"),
  deploymentStatus: rgDeploymentStatusEnum("deployment_status").notNull().default("unknown"),
  countries:        jsonb("countries").$type<string[]>().notNull().default([]),
  legalBasis:       text("legal_basis"),
  friaKnown:        boolean("fria_known").notNull().default(false),
  affectsChildren:  boolean("affects_children").notNull().default(false),
  affectsMigrants:  boolean("affects_migrants").notNull().default(false),
  provenance:       rgProvenanceEnum("provenance").notNull().default("community"),
  contributorId:    uuid("contributor_id"),
  validatedBy:      uuid("validated_by"),
  validatedAt:      timestamp("validated_at", { withTimezone: true }),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("rg_systems_area_idx").on(t.annexArea),
  index("rg_systems_tier_idx").on(t.riskTier),
  index("rg_systems_provenance_idx").on(t.provenance),
]);

export const rgRights = pgTable("rg_rights", {
  id:         varchar("id", { length: 60 }).primaryKey(),
  label:      varchar("label", { length: 200 }).notNull(),
  instrument: varchar("instrument", { length: 120 }).notNull(),
  article:    varchar("article", { length: 40 }),
});

export const rgSystemRights = pgTable("rg_system_rights", {
  id:         uuid("id").primaryKey().defaultRandom(),
  systemId:   uuid("system_id").notNull().references(() => rgSystems.id, { onDelete: "cascade" }),
  rightId:    varchar("right_id", { length: 60 }).notNull().references(() => rgRights.id, { onDelete: "cascade" }),
  impactNote: text("impact_note"),
  provenance: rgProvenanceEnum("provenance").notNull().default("community"),
}, (t) => [
  uniqueIndex("rg_system_rights_uniq").on(t.systemId, t.rightId),
]);

export const rgSources = pgTable("rg_sources", {
  id:          uuid("id").primaryKey().defaultRandom(),
  entityType:  varchar("entity_type", { length: 20 }).notNull(),
  entityId:    uuid("entity_id").notNull(),
  title:       varchar("title", { length: 400 }).notNull(),
  url:         varchar("url", { length: 600 }).notNull(),
  publisher:   varchar("publisher", { length: 200 }),
  publishedAt: date("published_at"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("rg_sources_entity_idx").on(t.entityType, t.entityId),
]);

export const rgPositions = pgTable("rg_positions", {
  id:         uuid("id").primaryKey().defaultRandom(),
  topic:      varchar("topic", { length: 200 }).notNull(),
  authority:  varchar("authority", { length: 160 }).notNull(),
  stance:     text("stance").notNull(),
  sourceUrl:  varchar("source_url", { length: 600 }).notNull(),
  statedAt:   date("stated_at"),
  provenance: rgProvenanceEnum("provenance").notNull().default("verified"),
  createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
