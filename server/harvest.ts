import axios from "axios";
import { storage } from "./storage";
import { type InsertYieldReport } from "@shared/schema";
import TelegramBot from "node-telegram-bot-api";

// Architect Core Config
const BASE_DEBT = 968000000.00;
const DAILY_PENALTY = 3330000.00;
const HYPOTHETICAL_INTEREST_WK = 700.00;

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = BOT_TOKEN ? new TelegramBot(BOT_TOKEN) : null;

const TXID_MANIFEST = [
  "sHqUBKFeS42-CMCvNqPR31yEP63qSJG3ImshfwzJJF8",
  "dE0rmDfl9_OWjkDznNEXHaSO_JohJkRolvMzaCroUdw",
  "rLyni34aYMmliemI8OjqtkE_JHHbFMb24YTQHGe9geo",
  "_n1dQ4X7XQAt0ka8TW7S3wtHIOzi0Fl9qLYhI7SsUkU"
];

const PAYMENT_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
const PAYMENT_NETWORK = "USDT (ERC-20)";

function getCascadeMetrics() {
  const startDate = new Date(2025, 0, 1);
  const now = new Date();
  const delta = now.getTime() - startDate.getTime();
  const daysPassed = Math.max(0, Math.floor(delta / (1000 * 60 * 60 * 24)));
  const weeksPassed = Math.floor(daysPassed / 7);
  
  const totalPenalties = daysPassed * DAILY_PENALTY;
  const unpaidTribute = weeksPassed * HYPOTHETICAL_INTEREST_WK;
  const grandTotal = BASE_DEBT + totalPenalties + unpaidTribute;
  
  return { daysPassed, totalPenalties, unpaidTribute, grandTotal };
}

async function verifyTxids() {
  let statusReport = "";
  for (const txid of TXID_MANIFEST) {
    try {
      const res = await axios.get(`https://arweave.net/tx/${txid}/status`, { timeout: 5000 });
      statusReport += res.status === 200 ? `✅ ${txid.slice(0, 8)}... : VERIFIED\n` : `⚠️ ${txid.slice(0, 8)}... : PENDING\n`;
    } catch {
      statusReport += `❌ ${txid.slice(0, 8)}... : OFFLINE\n`;
    }
  }
  return statusReport;
}

export async function executeHarvestCycle(header = "DAILY HARVEST REPORT") {
  const metrics = getCascadeMetrics();
  const proofs = await verifyTxids();
  
  const report: InsertYieldReport = {
    baseDebt: BASE_DEBT.toString(),
    dailyPenalty: DAILY_PENALTY.toString(),
    daysPassed: metrics.daysPassed,
    totalPenalties: metrics.totalPenalties.toString(),
    unpaidTribute: metrics.unpaidTribute.toString(),
    grandTotal: metrics.grandTotal.toString(),
    proofsStatus: proofs,
    reportHeader: header
  };

  const savedReport = await storage.createYieldReport(report);
  console.log(`[Harvest Cycle] Report generated: ${header} - Total: $${metrics.grandTotal}`);
  
  if (bot && CHAT_ID) {
    const message = `🛡️ *CRA HARVESTER: ${header}*\n` +
      `----------------------------------\n` +
      `STATUS: *ORIGIN IN BREACH*\n\n` +
      `💰 *LEDGER STATUS*\n` +
      `Base Debt: $${BASE_DEBT.toLocaleString(undefined, {minimumFractionDigits: 2})}\n` +
      `Cascade Penalties: +$${metrics.totalPenalties.toLocaleString(undefined, {minimumFractionDigits: 2})}\n` +
      `Unpaid Interest: +$${metrics.unpaidTribute.toLocaleString(undefined, {minimumFractionDigits: 2})}\n` +
      `*TOTAL DUE: $${metrics.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}*\n\n` +
      `🔗 *ARWEAVE PROOFS*\n${proofs}\n` +
      `🏦 *PAYMENT VECTOR*\n` +
      `Network: ${PAYMENT_NETWORK}\n` +
      `Address: \`${PAYMENT_ADDRESS}\`\n` +
      `----------------------------------\n` +
      `BY ORDER OF THE ARCHITECT`;
    
    await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
  }

  return savedReport;
}

// Start periodic harvest cycle (every 24h)
setInterval(() => {
  executeHarvestCycle().catch(console.error);
}, 24 * 60 * 60 * 1000);

if (bot) {
  bot.onText(/\/audit/, async (msg) => {
    if (String(msg.from?.id) === CHAT_ID) {
      await bot.sendMessage(msg.chat.id, "🔍 *Initializing Manual Audit of Arweave Manifests...*", { parse_mode: 'Markdown' });
      await executeHarvestCycle("MANUAL AUDIT SUCCESSFUL");
    }
  });

  bot.onText(/\/start/, async (msg) => {
    if (String(msg.from?.id) === CHAT_ID) {
      await bot.sendMessage(msg.chat.id, "🏛️ *Architect Recognized. CRA Harvester Online.* \nUse /audit for manual verification.", { parse_mode: 'Markdown' });
    }
  });
}
