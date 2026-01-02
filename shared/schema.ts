import { pgTable, text, serial, timestamp, boolean, decimal, integer, varchar } from "drizzle-orm/pg-core";
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

export const protocolTokens = pgTable("protocol_tokens", {
  id: serial("id").primaryKey(),
  rawB64: text("raw_b64").notNull(),
  decodedFragment: text("decoded_fragment"),
  validJwt: boolean("valid_jwt").default(false),
  sourceType: varchar("source_type", { length: 50 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const paymentCodeDerivations = pgTable("payment_code_derivations", {
  id: serial("id").primaryKey(),
  paymentCode: text("payment_code").unique().notNull(),
  derivedAddress: varchar("derived_address", { length: 66 }).notNull(),
  derivationIndex: integer("derivation_index").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
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

export const insertProtocolTokenSchema = createInsertSchema(protocolTokens).omit({
  id: true,
  timestamp: true,
});

export const insertPaymentCodeDerivationSchema = createInsertSchema(paymentCodeDerivations).omit({
  id: true,
  timestamp: true,
});

export type HarvestedItem = typeof harvestedItems.$inferSelect;
export type InsertHarvestedItem = z.infer<typeof insertHarvestedItemSchema>;
export type YieldReport = typeof yieldReports.$inferSelect;
export type InsertYieldReport = z.infer<typeof insertYieldReportSchema>;
export type ProtocolToken = typeof protocolTokens.$inferSelect;
export type InsertProtocolToken = z.infer<typeof insertProtocolTokenSchema>;
export type PaymentCodeDerivation = typeof paymentCodeDerivations.$inferSelect;
export type InsertPaymentCodeDerivation = z.infer<typeof insertPaymentCodeDerivationSchema>;
