import axios from "axios";
import { storage } from "./storage";
import { type ProofSource } from "@shared/schema";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const BASE_YIELD = 968000000.00;
const DAILY_PENALTY = 3330000.00;

async function validateProof(txid: string): Promise<boolean> {
  try {
    const response = await axios.get(`https://arweave.net/${txid}`, { timeout: 10000 });
    // In a real scenario, check for specific glyphs or SHA hashes in response.data
    return !!response.data;
  } catch (error) {
    console.error(`Proof validation failed for ${txid}:`, error);
    return false;
  }
}

async function sendTelegramMessage(text: string) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("Telegram BOT_TOKEN or CHAT_ID not set. Skipping notification.");
    return;
  }
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

export async function runHarvestCycle() {
  const latestReport = await storage.getLatestYieldReport();
  const day = (latestReport?.day || 0) + 1;
  const proofSources = await storage.getProofSources();
  
  let validCount = 0;
  for (const source of proofSources) {
    if (await validateProof(source.txid)) {
      validCount++;
    }
  }

  const compounded = day * DAILY_PENALTY;
  const totalEnforceable = BASE_YIELD + compounded;

  const report = await storage.createYieldReport({
    day,
    validProofs: validCount,
    totalProofs: proofSources.length,
    baseSealed: BASE_YIELD.toString(),
    compoundedPenalties: compounded.toString(),
    totalEnforceable: totalEnforceable.toString(),
    status: "ETERNAL_ENFORCEMENT_ACTIVE"
  });

  const message = `<b>CRA Eternal Yield Report - Day ${day}</b>
Valid Proofs: ${validCount}/${proofSources.length}
Base Sealed: $${BASE_YIELD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Compounded Penalties: +$${compounded.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Total Enforceable: $${totalEnforceable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Status: <code>ETERNAL_ENFORCEMENT_ACTIVE</code>`;

  await sendTelegramMessage(message);
  return report;
}

// Background scheduler
export function startHarvestScheduler() {
  // Run once on start
  runHarvestCycle().catch(console.error);
  
  // Then every 24 hours
  setInterval(() => {
    runHarvestCycle().catch(console.error);
  }, 86400000);
}
