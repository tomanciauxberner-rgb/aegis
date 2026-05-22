import { pgTable, uuid, varchar, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";

export const accessRequestStatusEnum = pgEnum("access_request_status", ["pending", "approved", "declined"]);

export const accessRequests = pgTable("access_requests", {
  id:           uuid("id").primaryKey().defaultRandom(),
  fullName:     varchar("full_name", { length: 160 }).notNull(),
  roleTitle:    varchar("role_title", { length: 200 }),
  organisation: varchar("organisation", { length: 200 }),
  email:        varchar("email", { length: 254 }).notNull(),
  message:      text("message"),
  status:       accessRequestStatusEnum("status").notNull().default("pending"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("access_requests_status_idx").on(t.status, t.createdAt),
  index("access_requests_email_idx").on(t.email),
]);
