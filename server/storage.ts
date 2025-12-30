import { db } from "./db";
import { harvestedItems, yieldReports, type InsertHarvestedItem, type HarvestedItem, type YieldReport, type InsertYieldReport } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getHarvestedItems(): Promise<HarvestedItem[]>;
  getHarvestedItem(id: number): Promise<HarvestedItem | undefined>;
  createHarvestedItem(item: InsertHarvestedItem): Promise<HarvestedItem>;
  deleteHarvestedItem(id: number): Promise<void>;
  updateHarvestedItemStatus(id: number, status: string): Promise<HarvestedItem>;
  
  getLatestYieldReport(): Promise<YieldReport | undefined>;
  getYieldHistory(): Promise<YieldReport[]>;
  createYieldReport(report: InsertYieldReport): Promise<YieldReport>;
}

export class DatabaseStorage implements IStorage {
  async getHarvestedItems(): Promise<HarvestedItem[]> {
    return await db.select().from(harvestedItems).orderBy(desc(harvestedItems.createdAt));
  }

  async getHarvestedItem(id: number): Promise<HarvestedItem | undefined> {
    const [item] = await db.select().from(harvestedItems).where(eq(harvestedItems.id, id));
    return item;
  }

  async createHarvestedItem(insertItem: InsertHarvestedItem): Promise<HarvestedItem> {
    const [item] = await db.insert(harvestedItems).values(insertItem).returning();
    return item;
  }

  async deleteHarvestedItem(id: number): Promise<void> {
    await db.delete(harvestedItems).where(eq(harvestedItems.id, id));
  }

  async updateHarvestedItemStatus(id: number, status: string): Promise<HarvestedItem> {
    const [item] = await db.update(harvestedItems)
      .set({ status })
      .where(eq(harvestedItems.id, id))
      .returning();
    return item;
  }

  async getLatestYieldReport(): Promise<YieldReport | undefined> {
    const [report] = await db.select().from(yieldReports).orderBy(desc(yieldReports.createdAt)).limit(1);
    return report;
  }

  async getYieldHistory(): Promise<YieldReport[]> {
    return await db.select().from(yieldReports).orderBy(desc(yieldReports.createdAt));
  }

  async createYieldReport(report: InsertYieldReport): Promise<YieldReport> {
    const [newReport] = await db.insert(yieldReports).values(report).returning();
    return newReport;
  }
}

export const storage = new DatabaseStorage();
