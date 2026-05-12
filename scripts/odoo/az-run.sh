#!/usr/bin/env bash
# Fallback path: execute a shell snippet on pes-odoo-crm-vm via Azure Run Command.
# Use when SSH is not available (NSG drift, JIT re-asserted, IP change, etc.).
# Requires: az CLI logged in with rights on the VM.
#   az login --use-device-code
set -euo pipefail
RG="${RG:-PES-Odoo-CRM}"
VM="${VM:-pes-odoo-crm-vm}"
SCRIPT="${1:--}"
if [ "$SCRIPT" = "-" ]; then
  TMP=$(mktemp); cat > "$TMP"; SCRIPT="$TMP"
fi
az vm run-command invoke -g "$RG" -n "$VM" --command-id RunShellScript \
  --scripts "@$SCRIPT" --query 'value[0].message' -o tsv
