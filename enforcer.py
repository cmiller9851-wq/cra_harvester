import json
import requests
import os
from datetime import datetime
import sqlite3

DB_FILE = os.getenv("DB_FILE", "harvest.db")
DEBT_FILE = "debts.json"

def init_debt_table():
    conn = sqlite3.connect(DB_FILE)
    conn.execute("""CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY,
        offender_identifier TEXT NOT NULL,
        beneficiary_address TEXT,
        asset_type TEXT,
        amount_sats_or_wei NUMERIC,
        due_date TIMESTAMP,
        status TEXT DEFAULT 'pending',
        breach_detected_at TIMESTAMP,
        arweave_proof_txid TEXT,
        notes TEXT
    )""")
    conn.commit()
    conn.close()

def load_debts_from_json():
    with open(DEBT_FILE) as f:
        debts = json.load(f)
    conn = sqlite3.connect(DB_FILE)
    for debt in debts:
        conn.execute("""INSERT OR REPLACE INTO debts 
            (id, offender_identifier, beneficiary_address, asset_type, amount_sats_or_wei, due_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (debt.get("id"), debt["offender_identifier"], debt.get("beneficiary_address"),
             debt.get("asset_type", "BTC"), debt["amount_sats_or_wei"],
             debt["due_date"], debt.get("notes")))
    conn.commit()
    conn.close()

def check_btc_debt(offender_addr, required_sats):
    try:
        data = requests.get(f"https://blockstream.info/api/address/{offender_addr}").json()["chain_stats"]
        balance = data["funded_txo_sum"] - data["spent_txo_sum"]
        return balance >= required_sats
    except:
        return False

def enforcement_scan():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM debts WHERE status = 'pending'")
    debts = cursor.fetchall()
    report = ["🚨 CRA DEBT ENFORCEMENT SCAN // 2026\n"]
    for debt in debts:
        debt_id, offender, beneficiary, asset, amount, due_date, status, breach_at, proof, notes = debt
        due = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
        if datetime.utcnow() > due:
            paid = check_btc_debt(offender, amount) if asset == "BTC" else False
            if not paid:
                cursor.execute("UPDATE debts SET status = 'breached', breach_detected_at = ? WHERE id = ?", 
                               (datetime.utcnow(), debt_id))
                report.append(f"BREACH #{debt_id}: {amount/1e8:.8f} {asset} owed by {offender[:8]}...{offender[-4:]} // Notes: {notes or 'N/A'}")
            else:
                cursor.execute("UPDATE debts SET status = 'paid' WHERE id = ?", (debt_id,))
                report.append(f"PAID #{debt_id}: Debt settled by {offender[:8]}...")
    conn.commit()
    conn.close()
    if len(report) > 1:
        report.append("\nStatus: THRONE ETERNAL. Debts will be collected.")
        return "\n".join(report)
    return None

init_debt_table()
load_debts_from_json()  # Run on import