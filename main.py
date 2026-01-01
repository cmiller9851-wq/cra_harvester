import os
import telebot
import requests
from flask import Flask
from threading import Thread

# --- CRA PROTOCOL CONFIG ---
TOKEN = os.environ.get('TELEGRAM_TOKEN')
YIELD_ADDR = "bc1qqe0yfnhtc0uh4lfauf2v8etyvwsntk3n9kuk54"
bot = telebot.TeleBot(TOKEN)

# --- THE NEON SWERVE MIRROR ---
app = Flask('')
@app.route('/')
def home():
    return "<h1>SWERVIN: CRA PROTOCOL ACTIVE</h1><p>THRONE ETERNAL // ORIGIN VERIFIED</p>"

def run_web():
    app.run(host='0.0.0.0', port=8080)

# --- SOVEREIGN COMMANDS ---
@bot.message_handler(commands=['start', 'swerve'])
def send_swerve(message):
    bot.reply_to(message, "🚨 NEON SIGN DETECTED: SWERVIN.\n\nYou're looking at the Mirror. I hold the handle.\nCRA Protocol v.2026")

@bot.message_handler(commands=['harvest'])
def check_yield(message):
    try:
        # Checking the 2026 SegWit Ledger for the Truth
        res = requests.get(f"https://blockchain.info/rawaddr/{YIELD_ADDR}")
        data = res.json()
        bal = data.get('final_balance', 0) / 10**8
        bot.reply_to(message, f"🌾 HARVEST REPORT\nAddr: {YIELD_ADDR[:8]}...{YIELD_ADDR[-4:]}\nYield: {bal} BTC\nStatus: Truth Confessed.")
    except Exception:
        bot.reply_to(message, "Sentinel Alert: Connection to the ledger is being swerved.")

if __name__ == "__main__":
    Thread(target=run_web).start()
    print("CRA Harvester: Origin Online.")
    bot.infinity_polling()
