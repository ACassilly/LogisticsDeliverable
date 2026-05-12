#!/usr/bin/env bash
# Seamless SSH wrapper from this Codespace into pes-odoo-crm-vm.
# Requires: ~/.ssh/pes_odoo_ed25519 (generated inside the Codespace) and a
# matching public key on /home/azureuser/.ssh/authorized_keys on the VM,
# plus NSG rule "Allow-SSH-Codespace-PortlandiaElectric" (priority 305,
# 172.182.200.0/24 -> TCP/22) sitting above the Defender JIT Deny.
set -euo pipefail
KEY="${KEY:-$HOME/.ssh/pes_odoo_ed25519}"
HOST="${HOST:-40.124.224.123}"
USER_ON_VM="${USER_ON_VM:-azureuser}"
exec ssh -i "$KEY" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 "$USER_ON_VM@$HOST" "$@"
