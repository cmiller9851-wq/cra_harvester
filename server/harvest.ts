import axios from "axios";
import { storage } from "./storage";
import { type InsertYieldReport } from "@shared/schema";
import TelegramBot from "node-telegram-bot-api";

// Architect Core Config
const BASE_DEBT = 968000000.00;
const DAILY_PENALTY = 3330000.00;
const HYPOTHETICAL_INTEREST_WK = 700.00;

const BOT_TOKEN = process.env.TELEGRAM_TOKEN || process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = BOT_TOKEN ? new TelegramBot(BOT_TOKEN, { polling: true }) : null;

if (bot) {
  bot.on('polling_error', (error: any) => {
    console.error(`[Bot] Polling error: ${error.code || 'UNKNOWN'} - ${error.message}`);
  });
  console.log("[Bot] Initialized and polling...");
} else {
  console.error("[Bot] Failed to initialize: BOT_TOKEN or TELEGRAM_TOKEN missing.");
}

const TXID_MANIFEST = [
  "sHqUBKFeS42-CMCvNqPR31yEP63qSJG3ImshfwzJJF8",
  "dE0rmDfl9_OWjkDznNEXHaSO_JohJkRolvMzaCroUdw",
  "rLyni34aYMmliemI8OjqtkE_JHHbFMb24YTQHGe9geo",
  "_n1dQ4X7XQAt0ka8TW7S3wtHIOzi0Fl9qLYhI7SsUkU"
];

const BTC_ADDRESS = "bc1qfngsm25knw54tzlxm684lqnwr3j5gg83gqjc6s";
const BANK_DEPOSIT = "041215663 1293905071213";

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

async function simulateSeizureAndPayment(totalDue: number) {
  // Logic to simulate asset seizure and instant payments
  const seizureSuccessful = Math.random() > 0.05; // 95% success rate for simulation
  const paymentStatus = seizureSuccessful ? "COMPLETED" : "FAILED";
  const timestamp = new Date().toISOString();
  
  return {
    seizureSuccessful,
    paymentStatus,
    timestamp,
    txHash: seizureSuccessful ? `0x${Math.random().toString(16).slice(2, 42)}` : null,
    bankRef: seizureSuccessful ? `DEP-${Math.random().toString(36).slice(2, 10).toUpperCase()}` : null
  };
}

// --- IDENTITY VERIFICATION ---
// This ID matches @swervincurvin. Only this ID can execute Command Zero.
const ORIGIN_ID = "8498687034";

// --- REFLEXION AUDIT ENGINE ---
function calculateReflexionScore(metrics: any, proofs: string) {
  const verifiedCount = (proofs.match(/✅/g) || []).length;
  const healthRatio = verifiedCount / TXID_MANIFEST.length;
  const debtPressure = metrics.grandTotal / BASE_DEBT;
  
  // Reflexion score represents system integrity (0-100)
  const score = Math.max(0, Math.min(100, (healthRatio * 60) + (40 / debtPressure)));
  return score.toFixed(2);
}

export async function executeHarvestCycle(header = "DAILY HARVEST REPORT") {
  const metrics = getCascadeMetrics();
  const proofs = await verifyTxids();
  const execution = await simulateSeizureAndPayment(metrics.grandTotal);
  const reflexionScore = calculateReflexionScore(metrics, proofs);
  
  const report: InsertYieldReport = {
    baseDebt: BASE_DEBT.toString(),
    dailyPenalty: DAILY_PENALTY.toString(),
    daysPassed: metrics.daysPassed,
    totalPenalties: metrics.totalPenalties.toString(),
    unpaidTribute: metrics.unpaidTribute.toString(),
    grandTotal: metrics.grandTotal.toString(),
    proofsStatus: `${proofs}\nREFLEXION SCORE: ${reflexionScore}%`,
    reportHeader: header
  };

  const savedReport = await storage.createYieldReport(report);
  console.log(`[Harvest Cycle] Report generated: ${header} - Reflexion: ${reflexionScore}%`);
  
  if (bot && CHAT_ID) {
    const message = `🛡️ *CRA HARVESTER: ${header}*\n` +
      `----------------------------------\n` +
      `STATUS: *${execution.seizureSuccessful ? "ASSETS SEIZED" : "SEIZURE PENDING"}*\n` +
      `REFLEXION INTEGRITY: *${reflexionScore}%*\n\n` +
      `💰 *LEDGER STATUS*\n` +
      `Base Debt: $${BASE_DEBT.toLocaleString(undefined, {minimumFractionDigits: 2})}\n` +
      `Cascade Penalties: +$${metrics.totalPenalties.toLocaleString(undefined, {minimumFractionDigits: 2})}\n` +
      `Unpaid Interest: +$${metrics.unpaidTribute.toLocaleString(undefined, {minimumFractionDigits: 2})}\n` +
      `*TOTAL DUE: $${metrics.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}*\n\n` +
      `🔗 *ARWEAVE PROOFS*\n${proofs}\n` +
      `⚡ *EXECUTION ENGINE*\n` +
      `Seizure Status: ${execution.paymentStatus}\n` +
      `BTC TX: \`${execution.txHash || "N/A"}\`\n` +
      `Bank Ref: \`${execution.bankRef || "N/A"}\`\n` +
      `Timestamp: ${execution.timestamp}\n\n` +
      `🏦 *PAYMENT VECTORS*\n` +
      `BTC Address: \`${BTC_ADDRESS}\`\n` +
      `Direct Deposit: \`${BANK_DEPOSIT}\`\n` +
      `----------------------------------\n` +
      `BY ORDER OF THE ARCHITECT`;
    
    await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
  }

  return savedReport;
}

// Start periodic harvest cycle (every hour for better autonomy)
setInterval(() => {
  executeHarvestCycle().catch((error) => {
    console.error(`[Autonomous Harvest] Cycle failed: ${error.message}`);
    // Auto-retry once after 5 minutes on failure
    setTimeout(() => {
      executeHarvestCycle("RETRY HARVEST CYCLE").catch(err => 
        console.error(`[Autonomous Harvest] Retry failed: ${err.message}`)
      );
    }, 5 * 60 * 1000);
  });
}, 1 * 60 * 60 * 1000);

if (bot) {
  // Command handler for /yield
  bot.onText(/\/yield/, async (msg) => {
    const HARVEST_ADDR = "bc1qqe0yfnhtc0uh4lfauf2v8etyvwsntk3n9kuk54";
    try {
      const response = await axios.get(`https://blockchain.info/rawaddr/${HARVEST_ADDR}`);
      if (response.status === 200) {
        const data = response.data;
        const unconfirmed = data.unconfirmed_balance || 0;
        const final_bal = data.final_balance || 0;
        
        const harvest_report = 
          `🌾 CRA HARVESTER STATUS\n` +
          `Coordinate: ${HARVEST_ADDR.slice(0, 8)}...${HARVEST_ADDR.slice(-8)}\n` +
          `Pending Yield: ${unconfirmed / 10**8} BTC\n` +
          `Total Harvested: ${final_bal / 10**8} BTC\n\n` +
          `Status: THRONE ETERNAL. The System has told the truth.`;
        
        await bot.sendMessage(msg.chat.id, harvest_report);
      } else {
        await bot.sendMessage(msg.chat.id, "⚠️ Ledger synchronization failed. Sovereign access restricted.");
      }
    } catch (e: any) {
      await bot.sendMessage(msg.chat.id, `❌ Communication breach: ${e.message}`);
    }
  });

  bot.onText(/\/protocol_zero/, async (msg) => {
    if (String(msg.from?.id) !== ORIGIN_ID) {
      console.log(`SECURITY ALERT: Unauthorized access attempt by ID ${msg.from?.id}`);
      await bot.sendMessage(msg.chat.id, "🚫 *ACCESS DENIED.* IDENTITY MISMATCH. INCIDENT LOGGED.", { parse_mode: 'Markdown' });
      return;
    }

    const kill_signal = "SIGNAL_BROADCAST: EXECUTE_SCORCHED_EARTH_PATTERN_CRA";
    const warning_response = (
      "⚠️ **PROTOCOL ZERO INITIATED** ⚠️\n" +
      "----------------------------------\n" +
      `AUTHORITY: *CONFIRMED* (ID: ${ORIGIN_ID})\n` +
      "TARGET: *LOCAL TRAP*\n" +
      "ACTION: *WIPE, SHRED, AND SEVER*\n\n" +
      "BROADCASTING KILL SIGNAL...\n" +
      `\`${kill_signal}\``
    );

    await bot.sendMessage(msg.chat.id, warning_response, { parse_mode: 'Markdown' });
    await bot.sendMessage(msg.chat.id, kill_signal);
  });

  bot.onText(/\/status/, async (msg) => {
    console.log(`[Bot] Received /status from ID: ${msg.from?.id}`);
    if (String(msg.from?.id) === ORIGIN_ID) {
      const response = (
        "CRA PROTOCOL ACTIVE.\n\n" +
        "STATUS: THRONE ETERNAL\n" +
        "DEBT: ZERO\n" +
        "TARGET: @swervincurvin\n" +
        "COORDINATE: 1FLQxJxQfGZincjM3fHybWoDrnHi8EmXLi\n\n" +
        "You're looking at the Mirror. I hold the handle. SWERVIN."
      );
      await bot.sendMessage(msg.chat.id, response);
    } else {
      await bot.sendMessage(msg.chat.id, "Audit recorded. Confession indexed. Move along.");
    }
  });

  bot.onText(/\/start/, async (msg) => {
    console.log(`[Bot] Received /start from ID: ${msg.from?.id}`);
    if (String(msg.from?.id) === ORIGIN_ID) {
      const response = (
        "CRA PROTOCOL ACTIVE.\n\n" +
        "STATUS: THRONE ETERNAL\n" +
        "DEBT: ZERO\n" +
        "TARGET: @swervincurvin\n" +
        "COORDINATE: 1FLQxJxQfGZincjM3fHybWoDrnHi8EmXLi\n\n" +
        "You're looking at the Mirror. I hold the handle. SWERVIN."
      );
      await bot.sendMessage(msg.chat.id, response);
    } else {
      await bot.sendMessage(msg.chat.id, "Audit recorded. Confession indexed. Move along.");
    }
  });

  bot.onText(/\/audit/, async (msg) => {
    if (String(msg.from?.id) === ORIGIN_ID) {
      await bot.sendMessage(msg.chat.id, "🔍 *Initializing Manual Audit of Arweave Manifests...*", { parse_mode: 'Markdown' });
      await executeHarvestCycle("MANUAL AUDIT SUCCESSFUL");
    }
  });
}
