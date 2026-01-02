import { db } from "./db";
import { harvestedItems, yieldReports, protocolTokens, paymentCodeDerivations, type InsertHarvestedItem, type HarvestedItem, type YieldReport, type InsertYieldReport, type InsertProtocolToken, type ProtocolToken, type InsertPaymentCodeDerivation, type PaymentCodeDerivation } from "@shared/schema";
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

  createProtocolToken(token: InsertProtocolToken): Promise<ProtocolToken>;
  getProtocolTokens(): Promise<ProtocolToken[]>;

  createPaymentCodeDerivation(derivation: InsertPaymentCodeDerivation): Promise<PaymentCodeDerivation>;
  getPaymentCodeDerivations(): Promise<PaymentCodeDerivation[]>;
  getPaymentCodeDerivationByCode(code: string): Promise<PaymentCodeDerivation | undefined>;
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

  async updateHarvestedItemStatus(id: number, status: "pending" | "completed" | "failed"): Promise<HarvestedItem> {
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

  async createProtocolToken(token: InsertProtocolToken): Promise<ProtocolToken> {
    const [newToken] = await db.insert(protocolTokens).values(token).returning();
    return newToken;
  }

  async getProtocolTokens(): Promise<ProtocolToken[]> {
    return await db.select().from(protocolTokens).orderBy(desc(protocolTokens.timestamp));
  }

  async createPaymentCodeDerivation(derivation: InsertPaymentCodeDerivation): Promise<PaymentCodeDerivation> {
    const [newDerivation] = await db.insert(paymentCodeDerivations).values(derivation).returning();
    return newDerivation;
  }

  async getPaymentCodeDerivations(): Promise<PaymentCodeDerivation[]> {
    return await db.select().from(paymentCodeDerivations).orderBy(desc(paymentCodeDerivations.timestamp));
  }

  async getPaymentCodeDerivationByCode(code: string): Promise<PaymentCodeDerivation | undefined> {
    const [derivation] = await db.select().from(paymentCodeDerivations).where(eq(paymentCodeDerivations.paymentCode, code));
    return derivation;
  }
}

export const storage = new DatabaseStorage();
