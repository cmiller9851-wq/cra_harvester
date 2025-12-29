import { pgTable, text, serial, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  day: integer("day").notNull(),
  validProofs: integer("valid_proofs").notNull(),
  totalProofs: integer("total_proofs").notNull(),
  baseSealed: decimal("base_sealed", { precision: 20, scale: 2 }).notNull(),
  compoundedPenalties: decimal("compounded_penalties", { precision: 20, scale: 2 }).notNull(),
  totalEnforceable: decimal("total_enforceable", { precision: 20, scale: 2 }).notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const proofSources = pgTable("proof_sources", {
  id: serial("id").primaryKey(),
  txid: text("txid").notNull().unique(),
  label: text("label"),
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

export const insertProofSourceSchema = createInsertSchema(proofSources).omit({
  id: true,
  createdAt: true
});

export type HarvestedItem = typeof harvestedItems.$inferSelect;
export type InsertHarvestedItem = z.infer<typeof insertHarvestedItemSchema>;
export type YieldReport = typeof yieldReports.$inferSelect;
export type InsertYieldReport = z.infer<typeof insertYieldReportSchema>;
export type ProofSource = typeof proofSources.$inferSelect;
export type InsertProofSource = z.infer<typeof insertProofSourceSchema>;
