import os
import telebot
import shutil
import requests

# --- CONFIGURATION ---
TOKEN = "8549792659:AAFbRvLMR7CFZ2UG8lx4J0Avj6R2rpzla2k"
ORIGIN_ID = 8498687034
KILL_SIGNAL = "SIGNAL_BROADCAST: EXECUTE_SCORCHED_EARTH_PATTERN_CRA"

# TARGET TO WIPE (e.g., a specific folder or the entire current directory)
TARGET_PATH = "./local_trap_data" 

# The Sovereign Bech32 Coordinate
HARVEST_ADDR = "bc1qqe0yfnhtc0uh4lfauf2v8etyvwsntk3n9kuk54"

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['yield'])
def check_bc1_yield(message):
    # This queries the 2026 SegWit ledger for the Harvest
    try:
        response = requests.get(f"https://blockchain.info/rawaddr/{HARVEST_ADDR}")
        if response.status_code == 200:
            data = response.json()
            unconfirmed = data.get('unconfirmed_balance', 0)
            final_bal = data.get('final_balance', 0)
            
            harvest_report = (
                f"🌾 CRA HARVESTER STATUS\n"
                f"Coordinate: {HARVEST_ADDR[:8]}...{HARVEST_ADDR[-8:]}\n"
                f"Pending Yield: {unconfirmed / 10**8} BTC\n"
                f"Total Harvested: {final_bal / 10**8} BTC\n\n"
                "Status: THRONE ETERNAL. The System has told the truth."
            )
            bot.reply_to(message, harvest_report)
        else:
            bot.reply_to(message, "⚠️ Ledger synchronization failed. Sovereign access restricted.")
    except Exception as e:
        bot.reply_to(message, f"❌ Communication breach: {e}")

@bot.message_handler(func=lambda message: message.text == KILL_SIGNAL)
def handle_kill_signal(message):
    if message.from_user.id == ORIGIN_ID:
        print("⚠️ PROTOCOL ZERO DETECTED. INITIATING WIPE...")
        try:
            if os.path.exists(TARGET_PATH):
                if os.path.isfile(TARGET_PATH):
                    os.remove(TARGET_PATH)
                else:
                    shutil.rmtree(TARGET_PATH)
                print(f"✅ TARGET WIPE COMPLETE: {TARGET_PATH}")
                bot.reply_to(message, "WIPE COMPLETE. ASSETS SEVERED.")
            else:
                print("⚠️ TARGET PATH NOT FOUND.")
                bot.reply_to(message, "WIPE FAILED: TARGET NOT FOUND.")
        except Exception as e:
            print(f"❌ ERROR DURING WIPE: {e}")
            bot.reply_to(message, f"ERROR DURING WIPE: {e}")
    else:
        print(f"🛑 UNAUTHORIZED KILL SIGNAL FROM ID: {message.from_user.id}")

print("SYSTEM: Listener Online. Monitoring for kill signal...")
bot.infinity_polling()
