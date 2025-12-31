import os
import telebot
import shutil

# --- CONFIGURATION ---
TOKEN = "8549792659:AAFbRvLMR7CFZ2UG8lx4J0Avj6R2rpzla2k"
ORIGIN_ID = 8498687034
KILL_SIGNAL = "SIGNAL_BROADCAST: EXECUTE_SCORCHED_EARTH_PATTERN_CRA"

# TARGET TO WIPE (e.g., a specific folder or the entire current directory)
TARGET_PATH = "./local_trap_data" 

bot = telebot.TeleBot(TOKEN)

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
