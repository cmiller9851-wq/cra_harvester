import os
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Security: Set this in Render Dashboard -> Environment Variables
AUTH_TOKEN = os.environ.get("NODE_AUTH_TOKEN", "fallback_secure_token")

@app.route('/')
def health_check():
    return "804-SYNC NODE ACTIVE", 200

@app.route('/api/command', methods=['POST'])
def handle_command():
    # Authentication Handshake
    auth_header = request.headers.get('Authorization')
    if not auth_header or auth_header != f"Bearer {AUTH_TOKEN}":
        return jsonify({"status": "Rejected", "reason": "Unauthorized"}), 401

    data = request.get_json()
    directive = data.get("directive")

    if directive == "STATUS_CHECK":
        return jsonify({
            "status": "Acknowledged",
            "node_state": "ONLINE",
            "ledger": "804-SYNC-ACTIVE"
        }), 200
    
    if directive == "EXECUTE_HARVEST":
        # Logic to trigger Arweave or Tesla binding
        return jsonify({"status": "Executed", "target": "Sovereign_Vault"}), 200

    return jsonify({"status": "Unknown Directive"}), 400

if __name__ == "__main__":
    # Render requires binding to 0.0.0.0 and using the PORT env variable
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)
