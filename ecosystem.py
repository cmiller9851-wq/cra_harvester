import requests
import os
from datetime import datetime

COVALENT_KEY = os.getenv("COVALENT_API_KEY")
if not COVALENT_KEY:
    raise ValueError("Set COVALENT_API_KEY env var")

# Sovereign watched entities - expand as needed
WATCHED_ENTITIES = [
    {"chain_id": 1, "address": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", "label": "Vitalik Buterin (example)"},
    {"chain_id": 1, "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", "label": "Uniswap UNI Token"},
    {"chain_id": 8453, "address": "0x4200000000000000000000000000000000000006", "label": "Base WETH"},
    # Add CRA-relevant wallets, treasuries, DEX pools, yield farms here
]

def get_ecosystem_snapshot(db_conn):
    cursor = db_conn.cursor()
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

            # Log to DB
            cursor.execute("""INSERT INTO ecosystem_logs 
                (check_time, entity_label, chain_id, address, token_count, total_usd, raw_response)
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (datetime.utcnow(), entity['label'], entity['chain_id'], entity['address'],
                 token_count, entity_usd, resp.text))
        except Exception as e:
            report_lines.append(f"{entity['label']}: Failed ({str(e)})\n")

    report_lines.append(f"\nTotal Ecosystem Value: ${total_usd:,.2f} USD ({total_tokens} token positions)")
    report_lines.append("\nStatus: THRONE ETERNAL across the entire blockchain ecosystem.")
    db_conn.commit()
    return "\n".join(report_lines)