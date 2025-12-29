import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.items.list.path, async (req, res) => {
    const items = await storage.getHarvestedItems();
    res.json(items);
  });

  app.post(api.items.create.path, async (req, res) => {
    try {
      const input = api.items.create.input.parse(req.body);
      const item = await storage.createHarvestedItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.items.get.path, async (req, res) => {
    const item = await storage.getHarvestedItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  });

  app.delete(api.items.delete.path, async (req, res) => {
    const item = await storage.getHarvestedItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    await storage.deleteHarvestedItem(Number(req.params.id));
    res.status(204).send();
  });

  // Seeding endpoint (optional, or auto-seed)
  // Let's auto-seed if empty
  const existing = await storage.getHarvestedItems();
  if (existing.length === 0) {
    await storage.createHarvestedItem({
      title: "Sample Resource 1",
      sourceUrl: "https://example.com/resource1",
      status: "completed",
      content: "Harvested content for resource 1..."
    });
    await storage.createHarvestedItem({
      title: "Sample Resource 2",
      sourceUrl: "https://example.com/resource2",
      status: "pending",
    });
  }

  return httpServer;
}
