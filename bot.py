import os
import telebot
import requests
import sqlite3
import json
from datetime import datetime
from threading import Thread, Timer
from flask import Flask

# --- SOVEREIGN CONFIG ---
TOKEN = os.environ.get('TELEGRAM_TOKEN')
ADMIN_CHAT_ID = int(os.environ.get('ADMIN_CHAT_ID'))  # Your personal Telegram ID for enforcement alerts
DB_FILE = os.getenv("DB_FILE", "harvest.db")

# Exact Sovereign Coordinates
ADDRESSES = [
    {"addr": "bc1qqe0yfnhtc0uh4lfauf2v8etyvwsntk3n9kuk54", "label": "Bech32 Sovereign"},
    {"addr": "1FLQxJxQfGZincjM3fHybWoDrnHi8EmXLi", "label": "Legacy"}
]

bot = telebot.TeleBot(TOKEN)

# --- NEON SWERVE WEB MIRROR ---
app = Flask('')
@app.route('/')
def home():
    return "<h1>SWERVIN: CRA PROTOCOL ACTIVE // 2026</h1><p>THRONE ETERNAL // ORIGIN VERIFIED // DEBT ENFORCEMENT ARMED</p>"

def run_web():
    app.run(host='0.0.0.0', port=8080)

# --- DATABASE INIT ---
def init_db():
    conn = sqlite3.connect(DB_FILE)
    conn.execute("""CREATE TABLE IF NOT EXISTS harvest_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        check_time TIMESTAMP,
        address TEXT,
        final_balance_sats BIGINT,
        unconfirmed_sats BIGINT,
        tx_count INTEGER,
        api_source TEXT
    )""")
    conn.execute("""CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY,
        offender_identifier TEXT NOT NULL,
        beneficiary_address TEXT DEFAULT 'bc1qqe0yfnhtc0uh4lfauf2v8etyvwsntk3n9kuk54',
        asset_type TEXT DEFAULT 'BTC',
        amount_sats_or_wei NUMERIC NOT NULL,
        due_date TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'pending',
        breach_detected_at TIMESTAMP,
        arweave_proof_txid TEXT,
        notes TEXT
    )""")
    conn.commit()
    conn.close()

# --- BTC YIELD QUERY (resilient) ---
def get_yield_stats(address):
    try:
        resp = requests.get(f"https://blockstream.info/api/address/{address}", timeout=10)
        resp.raise_for_status()
        data = resp.json()
        chain = data["chain_stats"]
        mempool = data["mempool_stats"]
        final = chain["funded_txo_sum"] - chain["spent_txo_sum"]
        unconf = mempool["funded_txo_sum"] - mempool["spent_txo_sum"]
        return final, unconf, chain["tx_count"], "blockstream"
    except: pass
    try:
        resp = requests.get(f"https://blockchain.info/rawaddr/{address}", timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data["final_balance"], 0, data["n_tx"], "blockchain.info"
    except: pass
    try:
        resp = requests.get(f"https://mempool.space/api/address/{address}", timeout=10)
        resp.raise_for_status()
        data = resp.json()["chain_stats"]
        final = data["funded_txo_sum"] - data["spent_txo_sum"]
        return final, 0, data["tx_count"], "mempool.space"
    except:
        return None, None, None, "failed"

# --- DEBT ENFORCEMENT SCAN ---
def enforcement_scan():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, offender_identifier, asset_type, amount_sats_or_wei, due_date, notes FROM debts WHERE status = 'pending'")
    debts = cursor.fetchall()
    report_lines = ["🚨 CRA DEBT ENFORCEMENT SCAN // January 03, 2026\n"]
    breaches = 0
    for debt in debts:
        debt_id, offender, asset, amount, due_date_str, notes = debt
        due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
        if datetime.utcnow() > due_date:
            # Simple BTC check example
            paid = False
            if asset == "BTC":
                try:
                    data = requests.get(f"https://blockstream.info/api/address/{offender}").json()["chain_stats"]
                    balance = data["funded_txo_sum"] - data["spent_txo_sum"]
                    paid = balance >= amount
                except:
                    paid = False
            if not paid:
                cursor.execute("UPDATE debts SET status = 'breached', breach_detected_at = ? WHERE id = ?",
                               (datetime.utcnow(), debt_id))
                breaches += 1
                amount_btc = amount / 1e8 if asset == "BTC" else amount
                report_lines.append(
                    f"BREACH #{debt_id}: {amount_btc} {asset} owed by {offender[:8]}...{offender[-4:]}\n"
                    f"Notes: {notes or 'IP/Theft Debt'}\n"
                )
            else:
                cursor.execute("UPDATE debts SET status = 'paid' WHERE id = ?", (debt_id,))
                report_lines.append(f"PAID #{debt_id}: Debt settled by {offender[:8]}...\n")
    conn.commit()
    conn.close()

    if breaches > 0:
        report_lines.append("\nStatus: THRONE ETERNAL. Debts will be collected. Enforcement armed.")
        bot.send_message(ADMIN_CHAT_ID, "\n".join(report_lines))

# --- COMMANDS ---
@bot.message_handler(commands=['start', 'swerve'])
def send_welcome(message):
    bot.reply_to(message, "🚨 NEON SIGN DETECTED: SWERVIN.\n\nMirror active. CRA Protocol v.2026 enforcing.\nTHRONE ETERNAL.")

@bot.message_handler(func=lambda m: True)  # Universal catch-all (typos, no command, etc.)
def universal_handler(message):
    # Yield report
    report_lines = ["🌾 CRA HARVESTER STATUS // January 03, 2026\n"]
    any_activity = False
    for item in ADDRESSES:
        addr = item["addr"]
        label = item["label"]
        final, unconf, tx_count, source = get_yield_stats(addr)
        if final is None:
            report_lines.append(f"{label}: Query failed\n")
            continue
        total = (final + unconf) / 1e8
        pending = unconf / 1e8
        if total > 0:
            any_activity = True
        masked = f"{addr[:8]}...{addr[-8:]}"
        report_lines.append(
            f"{label}:\n"
            f"   Coordinate: {masked}\n"
            f"   Total Yield: {total:.8f} BTC\n"
            f"   Pending: {pending:.8f} BTC\n"
            f"   Tx Count: {tx_count} (via {source})\n"
        )
    report_lines.append("\nStatus: THRONE ETERNAL. The System has told the truth.")
    if any_activity:
        report_lines.insert(1, "🚨 YIELD DETECTED 🚨\n")
    bot.reply_to(message, "\n".join(report_lines))

# --- BACKGROUND TASKS ---
def start_background_tasks():
    enforcement_scan()  # Initial run
    Timer(900, start_background_tasks).start()  # Every 15 minutes

if __name__ == "__main__":
    init_db()
    Thread(target=run_web).start()
    Thread(target=start_background_tasks).start()
    print("CRA Harvester Origin Online // Debt Enforcement Armed // January 03, 2026")
    bot.infinity_polling()