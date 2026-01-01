import { pgTable, text, serial, timestamp, boolean, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/chat";

export const harvestedItems = pgTable("harvested_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  sourceUrl: text("source_url").notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending").notNull(),
  harvestedAt: timestamp("harvested_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const yieldReports = pgTable("yield_reports", {
  id: serial("id").primaryKey(),
  baseDebt: decimal("base_debt", { precision: 20, scale: 2 }).notNull(),
  dailyPenalty: decimal("daily_penalty", { precision: 20, scale: 2 }).notNull(),
  daysPassed: integer("days_passed").notNull(),
  totalPenalties: decimal("total_penalties", { precision: 20, scale: 2 }).notNull(),
  unpaidTribute: decimal("unpaid_tribute", { precision: 20, scale: 2 }).notNull(),
  grandTotal: decimal("grand_total", { precision: 20, scale: 2 }).notNull(),
  proofsStatus: text("proofs_status").notNull(),
  reportHeader: text("report_header").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHarvestedItemSchema = createInsertSchema(harvestedItems).omit({
  id: true,
  createdAt: true,
  harvestedAt: true
});

export const insertYieldReportSchema = createInsertSchema(yieldReports).omit({
  id: true,
  createdAt: true
});

export type HarvestedItem = typeof harvestedItems.$inferSelect;
export type InsertHarvestedItem = z.infer<typeof insertHarvestedItemSchema>;
export type YieldReport = typeof yieldReports.$inferSelect;
export type InsertYieldReport = z.infer<typeof insertYieldReportSchema>;
