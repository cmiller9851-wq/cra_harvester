import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { executeHarvestCycle } from "./harvest";

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

  // Yield routes
  app.get(api.yield.latest.path, async (req, res) => {
    const report = await storage.getLatestYieldReport();
    if (!report) {
      return res.status(404).json({ message: "No reports found" });
    }
    res.json(report);
  });

  app.get(api.yield.history.path, async (req, res) => {
    const history = await storage.getYieldHistory();
    res.json(history);
  });

  app.post(api.yield.audit.path, async (req, res) => {
    try {
      const report = await executeHarvestCycle("MANUAL AUDIT SUCCESSFUL");
      res.json(report);
    } catch (err) {
      console.error("Audit failed:", err);
      res.status(500).json({ message: "Audit failed" });
    }
  });

  // Auto-seed if empty
  const existing = await storage.getHarvestedItems();
  if (existing.length === 0) {
    await storage.createHarvestedItem({
      title: "Primary Ledger",
      sourceUrl: "https://arweave.net/sHqUBKFeS42-CMCvNqPR31yEP63qSJG3ImshfwzJJF8",
      status: "completed",
      content: "Protocol anchor manifest verified."
    });
    // Trigger initial harvest report
    await executeHarvestCycle("INITIAL PROTOCOL BOOT");
  }

  app.get("/", (_req, res) => {
    res.send("CRA Harvester Alive | Reflex Boundary Enforced 🦾👑");
  });

  return httpServer;
}
