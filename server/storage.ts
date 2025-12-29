import { db } from "./db";
import { harvestedItems, type InsertHarvestedItem, type HarvestedItem } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getHarvestedItems(): Promise<HarvestedItem[]>;
  getHarvestedItem(id: number): Promise<HarvestedItem | undefined>;
  createHarvestedItem(item: InsertHarvestedItem): Promise<HarvestedItem>;
  deleteHarvestedItem(id: number): Promise<void>;
  updateHarvestedItemStatus(id: number, status: string): Promise<HarvestedItem>;
}

export class DatabaseStorage implements IStorage {
  async getHarvestedItems(): Promise<HarvestedItem[]> {
    return await db.select().from(harvestedItems).orderBy(harvestedItems.createdAt);
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
    // This is a simplified update for status only
    // In a real app, we might update content too
    const [item] = await db.update(harvestedItems)
      .set({ status })
      .where(eq(harvestedItems.id, id))
      .returning();
    return item;
  }
}

export const storage = new DatabaseStorage();
