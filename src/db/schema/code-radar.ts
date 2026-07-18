import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";

// ─── Code Radar — payload types ─────────────────────────

export interface HostStat {
  name: string;
  kind: string | null;
  repositories: number;
  owners: number;
}

export interface CodeRadarPayload {
  fetched_via: string;
  hosts: HostStat[];
  totals: {
    hosts: number;
    repositories: number;
    owners: number;
  };
}

// ─── Code Radar — snapshots ─────────────────────────────

export const codeRadarSnapshots = pgTable(
  "code_radar_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: varchar("source_id", { length: 40 }).notNull(),
    country: varchar("country", { length: 2 }).notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    status: varchar("status", { length: 10 }).notNull().default("ok"),
    payload: jsonb("payload").$type<CodeRadarPayload | null>(),
    error: text("error"),
  },
  (table) => [
    index("crs_source_captured_idx").on(table.sourceId, table.capturedAt),
    index("crs_country_idx").on(table.country),
  ]
);
