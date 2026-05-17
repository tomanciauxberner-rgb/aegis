import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const courtEnum = pgEnum("jurisprudence_court", [
  "CJEU",
  "ECHR",
  "national",
  "DPA",
]);

export const relevanceEnum = pgEnum("jurisprudence_relevance", [
  "binding",
  "persuasive",
  "illustrative",
]);

export const ingestSourceEnum = pgEnum("jurisprudence_ingest_source", [
  "manual",
  "eurlex",
  "hudoc",
  "dpa_feed",
]);

export const jurisprudenceCases = pgTable(
  "jurisprudence_cases",
  {
    id: varchar("id", { length: 120 }).primaryKey(),
    court: courtEnum("court").notNull(),
    name: varchar("name", { length: 400 }).notNull(),
    citation: varchar("citation", { length: 200 }).notNull(),
    year: integer("year").notNull(),
    country: varchar("country", { length: 2 }),
    summary: text("summary").notNull(),
    holding: text("holding").notNull(),
    relevance: relevanceEnum("relevance").notNull().default("illustrative"),
    rightsCategories: jsonb("rights_categories")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    aiActArticles: jsonb("ai_act_articles")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    sectors: jsonb("sectors")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    keywords: jsonb("keywords")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    url: text("url"),
    ingestSource: ingestSourceEnum("ingest_source")
      .notNull()
      .default("manual"),
    externalId: varchar("external_id", { length: 200 }),
    isActive: boolean("is_active").notNull().default(true),
    searchVector: text("search_vector"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("jc_court_idx").on(table.court),
    index("jc_year_idx").on(table.year),
    index("jc_country_idx").on(table.country),
    index("jc_relevance_idx").on(table.relevance),
    index("jc_active_idx").on(table.isActive),
    uniqueIndex("jc_external_id_source_idx").on(
      table.externalId,
      table.ingestSource
    ),
  ]
);

export const jurisprudenceIngestLog = pgTable(
  "jurisprudence_ingest_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: ingestSourceEnum("source").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    inserted: integer("inserted").notNull().default(0),
    updated: integer("updated").notNull().default(0),
    skipped: integer("skipped").notNull().default(0),
    errors: integer("errors").notNull().default(0),
    errorDetails: jsonb("error_details").$type<string[]>().default(sql`'[]'::jsonb`),
  }
);
