import { db } from "./db";
import { 
  harvestedItems, type InsertHarvestedItem, type HarvestedItem,
  yieldReports, type InsertYieldReport, type YieldReport,
  proofSources, type InsertProofSource, type ProofSource
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Items
  getHarvestedItems(): Promise<HarvestedItem[]>;
  getHarvestedItem(id: number): Promise<HarvestedItem | undefined>;
  createHarvestedItem(item: InsertHarvestedItem): Promise<HarvestedItem>;
  deleteHarvestedItem(id: number): Promise<void>;
  updateHarvestedItemStatus(id: number, status: string): Promise<HarvestedItem>;
  
  // Yield Reports
  getYieldReports(): Promise<YieldReport[]>;
  getLatestYieldReport(): Promise<YieldReport | undefined>;
  createYieldReport(report: InsertYieldReport): Promise<YieldReport>;
  
  // Proof Sources
  getProofSources(): Promise<ProofSource[]>;
  createProofSource(source: InsertProofSource): Promise<ProofSource>;
  deleteProofSource(id: number): Promise<void>;
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

  async getYieldReports(): Promise<YieldReport[]> {
    return await db.select().from(yieldReports).orderBy(desc(yieldReports.createdAt));
  }

  async getLatestYieldReport(): Promise<YieldReport | undefined> {
    const [report] = await db.select().from(yieldReports).orderBy(desc(yieldReports.createdAt)).limit(1);
    return report;
  }

  async createYieldReport(report: InsertYieldReport): Promise<YieldReport> {
    const [newReport] = await db.insert(yieldReports).values(report).returning();
    return newReport;
  }

  async getProofSources(): Promise<ProofSource[]> {
    return await db.select().from(proofSources);
  }

  async createProofSource(source: InsertProofSource): Promise<ProofSource> {
    const [newSource] = await db.insert(proofSources).values(source).returning();
    return newSource;
  }

  async deleteProofSource(id: number): Promise<void> {
    await db.delete(proofSources).where(eq(proofSources.id, id));
  }
}

export const storage = new DatabaseStorage();
