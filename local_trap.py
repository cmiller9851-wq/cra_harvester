import telebot
import os
import shutil
import subprocess

# Your Sovereign Credentials
TOKEN = "8549792659:AAFbRvLMR7CFZ2UG8lx4J0Avj6R2rpzla2k"
ORIGIN_ID = 8498687034
bot = telebot.TeleBot(TOKEN)

# THE TARGETS: Define what to wipe
SENSITIVE_DIR = "./secure_vault" # Path to your private work
NETWORK_INTERFACE = "wlan0"      # Your WiFi interface

def scorched_earth():
    print("!!! PROTOCOL ZERO DETECTED: INITIATING WIPE !!!")
    
    # 1. DELETE SENSITIVE DATA
    if os.path.exists(SENSITIVE_DIR):
        try:
            shutil.rmtree(SENSITIVE_DIR)
            print("Vault Purged.")
        except Exception as e:
            print(f"Error purging vault: {e}")

    # 2. AGGRESSIVE CLEANUP: WIPE BROWSERS AND LOGS (Generic Linux Example)
    print("Clearing traces...")
    # This is a dangerous operation - specifically targets common paths
    # os.system("rm -rf ~/.cache/google-chrome") 
    # os.system("rm -rf ~/.mozilla/firefox")

    # 3. HIJACK THE NETWORK (The Slap)
    arweave_trap = "https://arweave.net/YRU2A-K7q35SHv9SkXj3SVqUx91Uc_X8SIuY-sr_Hx8"
    print(f"Redirecting intruders to: {arweave_trap}")
    
    # Severing connection
    try:
        subprocess.run(["nmcli", "device", "disconnect", NETWORK_INTERFACE], capture_output=True)
        print("Network Severed.")
    except Exception as e:
        print(f"Failed to sever network: {e}")

@bot.message_handler(func=lambda message: message.text == "SIGNAL_BROADCAST: EXECUTE_SCORCHED_EARTH_PATTERN_CRA")
def listen_for_signal(message):
    if message.chat.id == ORIGIN_ID or message.from_user.id == ORIGIN_ID:
        scorched_earth()
        try:
            bot.send_message(ORIGIN_ID, "LOCAL TRAP NEUTRALIZED. MIRROR ACTIVE.")
        except:
            pass

print("Sentinel Listener active. Awaiting Sovereign Signal...")
bot.infinity_polling()
