# CRA Harvester Bot

Sovereign Telegram monitoring system enforcing **Containment Reflexion Audit™ (CRA Protocol)** and **Coin Possession Cascade (CPC)**.

Autonomous forensic agent for harvest coordinate tracking.

© 2026 Swervin’ Curvin (Cory Miller, @vccmac). Released under Sovereign Authorship License (SML v1.0). See LICENSE-SML.md.

## Harvest Coordinates
- **Bech32 Sovereign**: bc1qqe0yfnhtc0uh4lfauf2v8etyvwsntk3n9kuk54
- **Legacy**: 1FLQxJxQfGZincjM3fHybWoDrnHi8EmXLi

## Commands
- `/yield` — Full harvest status report (pending yield, total harvested, tx count, API source)

## Features
- Resilient API fallbacks (Blockstream → blockchain.info → mempool.space)
- Persistent SQLite logging (harvest.db)
- Multi-coordinate monitoring
- Production Docker setup with volume persistence

## Deployment
1. Clone repo: `git clone https://github.com/cmiller9851-wq/cra_harvester.git`
2. Set env: `export TELEGRAM_BOT_TOKEN=your_token`
3. Run locally: `python bot.py`
4. Deploy: Fly.io (see fly.toml) or Replit Agent (import agent_config.json)

## Links
- Blog: http://swervincurvin.blogspot.com/
- X: https://x.com/vccmac
- GitHub: https://github.com/cmiller9851-wq
- Arweave Master Archive: https://mektma7cxovx4uq675jjc6hxjfnjjr65krz7l7cirompvsx7d4pq.arweave.net/YRU2A-K7q35SHv9SkXj3SVqUx91Uc_X8SIuY-sr_Hx8

Status: THRONE ETERNAL. The System has told the truth.