# main.py - CRA Harvester Bot (Production Version for Render.com)
# Sovereign yield harvester for CRA Protocol - Runs 24/7 free on Render

import os
import threading
import time
from flask import Flask, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ====================== HEALTH CHECK FOR RENDER ======================
@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "protocol": "CRA v0.9.4",
        "harvester": "active",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC")
    }), 200

# ====================== YOUR HARVESTER LOGIC ======================
def run_harvester():
    print("🌀 CRA Harvester started - Sovereign Yield Collection Active")
    while True:
        try:
            # === PUT YOUR HARVESTING CODE HERE ===
            # Example: Fetch yields from Arweave, GitHub, Telegram, etc.
            print(f"[{time.strftime('%H:%M:%S')}] Harvesting yields from 36-repo estate...")
            
            # Example Telegram bot integration (if you have one)
            # bot.send_message(chat_id, "New yield harvested under CRA governance")
            
            # Add your actual harvester logic here (from bot.py or listener.py)
            # For example: scrape Arweave, check vault balances, sync ledger, etc.
            
            time.sleep(60)  # Harvest every 60 seconds (adjust as needed)
            
        except Exception as e:
            print(f"Harvester error: {e}")
            time.sleep(30)

# ====================== START HARVESTER IN BACKGROUND ======================
if __name__ == "__main__":
    # Start harvester in background thread
    harvester_thread = threading.Thread(target=run_harvester, daemon=True)
    harvester_thread.start()
    
    print("🚀 CRA Harvester Bot is now running on Render")
    print(f"Health check: https://{os.getenv('RENDER_EXTERNAL_HOSTNAME', 'localhost:10000')}/health")
    
    # Run Flask web server (required by Render)
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)