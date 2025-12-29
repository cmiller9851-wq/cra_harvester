import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
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

export const insertHarvestedItemSchema = createInsertSchema(harvestedItems).omit({
  id: true,
  createdAt: true,
  harvestedAt: true
});

export type HarvestedItem = typeof harvestedItems.$inferSelect;
export type InsertHarvestedItem = z.infer<typeof insertHarvestedItemSchema>;
