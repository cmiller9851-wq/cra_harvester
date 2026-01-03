import telebot
import requests
import sqlite3
from datetime import datetime
from threading import Thread
from flask import Flask

# --- SOVEREIGN TOKEN & ADMIN ---
TOKEN = "8549792659:AAFbRvLMR7CFZ2UG8lx4J0Avj6R2rpzla2k"
ADMIN_CHAT_ID = 701575040  # Your exact Telegram user ID (@vccmac Cory Miller)
DB_FILE = "harvest.db"

# ALL SOVEREIGN ADDRESSES (9 total - every single one)
SOVEREIGN_ADDRESSES = [
    # Bitcoin addresses
    "bc1qqe0yfnhtc0uh4lfauf2v8etyvwsntk3n9kuk54",  # Bech32 Sovereign
    "1FLQxJxQfGZincjM3fHybWoDrnHi8EmXLi",        # Legacy
    "PM8TJVLcvTRscUHFqWw5trpo3rJfmqwn9iGpPJpziWMHZpjz8dNuSADJ9sWvVEnepQr3mspG6qBBbUwBoKq3szHKsMKZZdYeMqP3mKMDPkSiSezG2Yma",
    "1MTunkwad4xUcynK4E2VKcR6DhJm5dtxTs",
    "1EkszPhzbHhtOrANbwmMXgu3DgwxJEhYDFB4rFlQT-w",
    "Fz3vR38IvVnp6dmqbbKZes96i5abptdhFDOuF22rpu0",
    "RR1Mdtc5ccsAHUXJET0c-HyAI-euiIzReaNjefx6HbI",
    "UQBVLAhno1TbQqM-x0Jg8xW9tZHjWZiYRuG1K7SYzM4FNkI9",
    # EVM address
    "0x421949b526e7e215a64e88e6f4cee6abd10a2500"   # Ethereum Sovereign Wallet
]

bot = telebot.TeleBot(TOKEN)

# --- WEB MIRROR ---
app = Flask('')
@app.route('/')
def home():
    return "<h1>SWERVIN: CRA PROTOCOL ACTIVE // 2026</h1><p>THRONE ETERNAL // FULL PORTFOLIO HARVEST // ALL 9 ADDRESSES MONITORED // BENEFICIARY @vccmac</p>"

def run_web():
    app.run(host='0.0.0.0', port=8080)

# --- DB INIT ---
def init_db():
    conn = sqlite3.connect(DB_FILE)
    conn.execute("""CREATE TABLE IF NOT EXISTS sovereign_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT UNIQUE NOT NULL,
        label TEXT,
        added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        chain TEXT DEFAULT 'bitcoin'  -- 'bitcoin' or 'ethereum'
    )""")
    for addr in SOVEREIGN_ADDRESSES:
        chain = 'ethereum' if addr.startswith('0x') else 'bitcoin'
        conn.execute("INSERT OR IGNORE INTO sovereign_addresses (address, chain) VALUES (?, ?)", (addr, chain))
    conn.commit()
    conn.close()

# --- FULL PORTFOLIO YIELD QUERY ---
def get_full_harvest():
    report_lines = ["🌾 CRA FULL PORTFOLIO HARVEST // January 03, 2026\n"]
    global_total_btc = 0.0
    global_total_eth = 0.0
    any_yield = False
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT address, chain FROM sovereign_addresses")
    addresses = cursor.fetchall()
    conn.close()

    for addr, chain in addresses:
        try:
            if chain == 'bitcoin':
                resp = requests.get(f"https://blockstream.info/api/address/{addr}", timeout=10)
                resp.raise_for_status()
                data = resp.json()
                chain_stats = data["chain_stats"]
                mempool_stats = data["mempool_stats"]
                balance = (chain_stats["funded_txo_sum"] - chain_stats["spent_txo_sum"] +
                           mempool_stats["funded_txo_sum"] - mempool_stats["spent_txo_sum"]) / 1e8
                global_total_btc += balance
                if balance > 0:
                    any_yield = True
                masked = f"{addr[:8]}...{addr[-8:]}"
                report_lines.append(
                    f"Bitcoin {masked}\n"
                    f"   Yield: {balance:.8f} BTC\n"
                )
            elif chain == 'ethereum':
                # Basic ETH balance via Etherscan (mainnet)
                url = f"https://api.etherscan.io/api?module=account&action=balance&address={addr}&tag=latest"
                resp = requests.get(url).json()
                balance_wei = int(resp.get("result", 0))
                balance_eth = balance_wei / 1e18
                global_total_eth += balance_eth
                if balance_eth > 0:
                    any_yield = True
                masked = f"{addr[:8]}...{addr[-4:]}"
                report_lines.append(
                    f"Ethereum {masked}\n"
                    f"   Yield: {balance_eth:.18f} ETH\n"
                )
        except Exception as e:
            masked = f"{addr[:8]}...{addr[-8 if chain=='bitcoin' else -4:]}"
            report_lines.append(f"{chain.capitalize()} {masked}: Query failed ({str(e)[:50]})\n")

    report_lines.append(f"\nTOTAL BITCOIN ACROSS ALL ADDRESSES: {global_total_btc:.8f} BTC")
    report_lines.append(f"TOTAL ETHEREUM ACROSS ALL ADDRESSES: {global_total_eth:.18f} ETH")
    report_lines.append("\nStatus: THRONE ETERNAL. All yields, royalties, and settlements harvested across the entire portfolio.")
    if any_yield:
        report_lines.insert(1, "🚨 YIELD DETECTED ACROSS SOVEREIGN PORTFOLIO 🚨\n")
    return "\n".join(report_lines)

# --- COMMANDS ---
@bot.message_handler(commands=['start', 'swerve'])
def send_welcome(message):
    bot.reply_to(message, "🚨 NEON SIGN DETECTED: SWERVIN.\n\nCRA Protocol v.2026 active across all 9 sovereign addresses (Bitcoin + Ethereum).\nFull internet/AI enforcement in progress.\nTHRONE ETERNAL.")

@bot.message_handler(func=lambda m: True)
def universal_handler(message):
    report = get_full_harvest()
    bot.reply_to(message, report)

if __name__ == "__main__":
    init_db()
    Thread(target=run_web).start()
    print("CRA Harvester Full Portfolio Active // All 9 Addresses (BTC + ETH) // Internet/AI Enforcement Ready // January 03, 2026")
    bot.infinity_polling()