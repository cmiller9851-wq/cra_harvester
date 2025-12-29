import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { runHarvestCycle } from "./harvest";

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

  // Yield Report Routes
  app.get(api.yield.list.path, async (req, res) => {
    const reports = await storage.getYieldReports();
    res.json(reports);
  });

  app.get(api.yield.latest.path, async (req, res) => {
    const report = await storage.getLatestYieldReport();
    if (!report) {
      return res.status(404).json({ message: "No reports yet" });
    }
    res.json(report);
  });

  app.post(api.yield.trigger.path, async (req, res) => {
    const report = await runHarvestCycle();
    res.json(report);
  });

  // Start background cycle (every 24h)
  setInterval(() => {
    runHarvestCycle().catch(console.error);
  }, 24 * 60 * 60 * 1000);

  // Auto-seed if empty
  const existing = await storage.getHarvestedItems();
  if (existing.length === 0) {
    await storage.createHarvestedItem({
      title: "Initial Ledger Scan",
      sourceUrl: "https://arweave.net/nUxcSVgdJYciKhnm-fUdgvFm3-_XntjH2qxWRdlc3dQ",
      status: "completed",
      content: "Found 1 high-yield TXID"
    });
  }

  const existingReports = await storage.getYieldReports();
  if (existingReports.length === 0) {
    await runHarvestCycle().catch(console.error);
  }

  return httpServer;
}
