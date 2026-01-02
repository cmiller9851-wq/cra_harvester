#!/bin/bash
# CRA Harvester media upload to Arweave via ArDrive CLI

echo "Upload icon (e.g., cra_icon.png):"
ardrive upload-file --wallet-file ~/wallet.json --file-path ./media/cra_icon.png

echo "Upload cover (e.g., cra_cover.jpg):"
ardrive upload-file --wallet-file ~/wallet.json --file-path ./media/cra_cover.jpg

echo "Replace TXIDs in agent_config.json"