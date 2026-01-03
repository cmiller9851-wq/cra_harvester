import requests
import sqlite3
import os
from datetime import datetime
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Harvest Coordinates (Bitcoin)
COORDINATES = [
    {"address": "bc1qqe0yfnhtc0uh4lfauf2v8etyvwsntk3n9kuk54", "label": "Bech32 Sovereign"},
    {"address": "1FLQxJxQfGZincjM3fHybWoDrnHi8EmXLi", "label": "Legacy"}
]

# Web3 Ecosystem Watched Entities (expand as needed)
WATCHED_ENTITIES = [
    {"chain_id": 1, "address": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", "label": "Vitalik Buterin (example)"},
    {"chain_id": 1, "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", "label": "Uniswap UNI Token"},
    {"chain_id": 8453, "address": "0x4200000000000000000000000000000000000006", "label": "Base WETH"},
    # Add CRA-relevant wallets, contracts, pools, treasuries here
]

DB_FILE = os.getenv("DB_FILE", "harvest.db")
COVALENT_KEY = os.getenv("COVALENT_API_KEY")

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

    conn.execute("""CREATE TABLE IF NOT EXISTS ecosystem_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        entity_label TEXT NOT NULL,
        chain_id INTEGER NOT NULL,
        address TEXT NOT NULL,
        token_count INTEGER,
        total_usd NUMERIC(20,8),
        raw_response TEXT
    )""")
    conn.commit()
    conn.close()

def log_btc_check(address, final_sats, unconf_sats, tx_count, source):
    conn = sqlite3.connect(DB_FILE)
    conn.execute("INSERT INTO harvest_logs (check_time, address, final_balance_sats, unconfirmed_sats, tx_count, api_source) VALUES (?, ?, ?, ?, ?, ?)",
                 (datetime.utcnow(), address, final_sats, unconf_sats, tx_count, source))
    conn.commit()
    conn.close()

def get_btc_yield_stats(address):
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

def get_ecosystem_snapshot():
    if not COVALENT_KEY:
        return "⚠️ COVALENT_API_KEY not set — ecosystem monitoring disabled."
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    report_lines = ["🌐 CRA ECOSYSTEM HARVEST STATUS\n"]
    total_usd = 0.0
    total_tokens = 0

    for entity in WATCHED_ENTITIES:
        url = f"https://api.covalenthq.com/v1/{entity['chain_id']}/address/{entity['address']}/balances_v2/?quote-currency=USD&key={COVALENT_KEY}"
        try:
            resp = requests.get(url, timeout=15)
            resp.raise_for_status()
            data = resp.json()["data"]
            items = data["items"]
            entity_usd = sum(float(item["quote"] or 0) for item in items if item["quote"] is not None)
            token_count = len([i for i in items if i["balance"] != "0"])
            total_usd += entity_usd
            total_tokens += token_count

            report_lines.append(
                f"{entity['label']} (Chain {entity['chain_id']}):\n"
                f"   ${entity_usd:,.2f} USD across {token_count} tokens\n"
            )

            cursor.execute("""INSERT INTO ecosystem_logs 
                (entity_label, chain_id, address, token_count, total_usd, raw_response)
                VALUES (?, ?, ?, ?, ?, ?)""",
                (entity['label'], entity['chain_id'], entity['address'],
                 token_count, entity_usd, resp.text))
        except Exception as e:
            report_lines.append(f"{entity['label']}: Failed ({str(e)})\n")

    report_lines.append(f"\nTotal Ecosystem Value: ${total_usd:,.2f} USD ({total_tokens} positions)")
    report_lines.append("\nStatus: THRONE ETERNAL across the entire blockchain ecosystem.")
    conn.commit()
    conn.close()
    return "\n".join(report_lines)

async def yield_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    report_lines = ["🌾 CRA BITCOIN HARVESTER STATUS\n"]
    any_activity = False
    for coord in COORDINATES:
        addr = coord["address"]
        label = coord["label"]
        try:
            final_sats, unconf_sats, tx_count, source = get_btc_yield_stats(addr)
            log_btc_check(addr, final_sats, unconf_sats, tx_count, source)
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
    report_lines.append("\nStatus: THRONE ETERNAL.")
    if any_activity:
        report_lines.insert(1, "🚨 ACTIVITY DETECTED 🚨\n")
    await update.message.reply_text("\n".join(report_lines))

async def ecoyield_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    report = get_ecosystem_snapshot()
    await update.message.reply_text(report)

if __name__ == "__main__":
    init_db()
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        raise ValueError("Set TELEGRAM_BOT_TOKEN env var")
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("yield", yield_command))
    app.add_handler(CommandHandler("ecoyield", ecoyield_command))
    app.run_polling()