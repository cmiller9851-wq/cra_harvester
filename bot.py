import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
import sqlite3
import os
from datetime import datetime

COORDINATES = [
    {"address": "bc1qqe0yfnhtc0uh4lfauf2v8etyvwsntk3n9kuk54", "label": "Bech32 Sovereign"},
    {"address": "1FLQxJxQfGZincjM3fHybWoDrnHi8EmXLi", "label": "Legacy"}
]
DB_FILE = os.getenv("DB_FILE", "harvest.db")

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
    conn.execute("""CREATE TABLE IF NOT EXISTS harvest_coordinates (
        address TEXT UNIQUE,
        label TEXT
    )""")
    conn.executemany("INSERT OR IGNORE INTO harvest_coordinates (address, label) VALUES (?, ?)",
                     [(c["address"], c["label"]) for c in COORDINATES])
    conn.commit()
    conn.close()

def log_check(address, final_sats, unconf_sats, tx_count, source):
    conn = sqlite3.connect(DB_FILE)
    conn.execute("INSERT INTO harvest_logs (check_time, address, final_balance_sats, unconfirmed_sats, tx_count, api_source) VALUES (?, ?, ?, ?, ?, ?)",
                 (datetime.utcnow(), address, final_sats, unconf_sats, tx_count, source))
    conn.commit()
    conn.close()

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
    resp = requests.get(f"https://mempool.space/api/address/{address}", timeout=10)
    resp.raise_for_status()
    data = resp.json()["chain_stats"]
    final = data["funded_txo_sum"] - data["spent_txo_sum"]
    return final, 0, data["tx_count"], "mempool.space"

async def yield_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    report_lines = ["🌾 CRA HARVESTER FULL STATUS\n"]
    any_activity = False
    for coord in COORDINATES:
        addr = coord["address"]
        label = coord["label"]
        try:
            final_sats, unconf_sats, tx_count, source = get_yield_stats(addr)
            log_check(addr, final_sats, unconf_sats, tx_count, source)
            total_btc = (final_sats + unconf_sats) / 1e8
            if total_btc > 0:
                any_activity = True
            report_lines.append(
                f"{label}:\n"
                f"   Coord: {addr[:8]}...{addr[-8:]}\n"
                f"   Yield: {total_btc:.8f} BTC (pending {unconf_sats/1e8:.8f})\n"
                f"   Tx: {tx_count} (via {source})\n"
            )
        except Exception as e:
            report_lines.append(f"{label}: Query failed ({str(e)})\n")
    report_lines.append("\nStatus: THRONE ETERNAL. The System has told the truth.")
    if any_activity:
        report_lines.insert(1, "🚨 ACTIVITY DETECTED 🚨\n")
    await update.message.reply_text("\n".join(report_lines))

if __name__ == "__main__":
    init_db()
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        raise ValueError("Set TELEGRAM_BOT_TOKEN env var")
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("yield", yield_command))
    app.run_polling()