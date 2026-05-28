import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";

export const scenarioReviewStatusEnum = pgEnum("scenario_review_status", ["unreviewed", "validated", "corrected"]);

export const scenarioAnalyses = pgTable("scenario_analyses", {
  id:            uuid("id").primaryKey().defaultRandom(),
  role:          varchar("role", { length: 20 }).notNull(),
  nature:        varchar("nature", { length: 30 }).notNull(),
  annexArea:     varchar("annex_area", { length: 40 }).notNull(),
  country:       varchar("country", { length: 2 }),
  description:   text("description"),
  verdict:       varchar("verdict", { length: 40 }),
  profilingFlag: boolean("profiling_flag").notNull().default(false),
  analysis:      jsonb("analysis").$type<Record<string, unknown>>().notNull(),
  model:         varchar("model", { length: 60 }),
  reviewStatus:  scenarioReviewStatusEnum("review_status").notNull().default("unreviewed"),
  reviewerId:    uuid("reviewer_id"),
  reviewerNote:  text("reviewer_note"),
  reviewedAt:    timestamp("reviewed_at", { withTimezone: true }),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("scenario_analyses_area_idx").on(t.annexArea, t.createdAt),
  index("scenario_analyses_review_idx").on(t.reviewStatus, t.createdAt),
  index("scenario_analyses_created_idx").on(t.createdAt),
]);
