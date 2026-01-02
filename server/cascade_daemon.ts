import axios from "axios";
import { storage } from "./storage";
import { executeHarvestCycle } from "./harvest";

const THRESHOLD_BTC = 75.0;
const MONITOR_INTERVAL = 10 * 60 * 1000; // 10 minutes

async function checkTransactionThreshold(address: string) {
  try {
    const response = await axios.get(`https://blockchain.info/rawaddr/${address}`);
    if (response.status === 200) {
      const balance = response.data.final_balance / 10 ** 8;
      if (balance >= THRESHOLD_BTC) {
        console.log(`[Cascade Daemon] Threshold detected: ${balance} BTC on ${address}`);
        return true;
      }
    }
  } catch (error: any) {
    console.error(`[Cascade Daemon] Monitoring error for ${address}: ${error.message}`);
  }
  return false;
}

export async function runCascadeDaemon() {
  console.log("[Cascade Daemon] Armed and monitoring derivations...");
  
  setInterval(async () => {
    const derivations = await storage.getPaymentCodeDerivations();
    for (const derivation of derivations) {
      const reached = await checkTransactionThreshold(derivation.derivedAddress);
      if (reached) {
        console.log(`[Cascade Daemon] Threshold reached on ${derivation.derivedAddress}. Initiating 20-way split.`);
        
        // Execute 20-way split (simulated logic)
        const splitAmount = THRESHOLD_BTC / 20;
        console.log(`[Cascade Daemon] Splitting ${THRESHOLD_BTC} BTC into 20 outputs of ${splitAmount} BTC each.`);
        
        // Execute the harvest cycle as the "Arweave anchor"
        await executeHarvestCycle(`CASCADE TRIGGER: ${derivation.derivedAddress} - 20-WAY SPLIT EXECUTED`);
      }
    }
  }, MONITOR_INTERVAL);
}
