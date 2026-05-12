#!/usr/bin/env bash
# Re-runnable discovery against pes-odoo-crm-vm. Prints odoo.conf (secrets stripped),
# nginx vhosts, the odoo systemd unit, installed module count, websites, companies,
# and a quick "is comet-admin present?" probe. Safe to run repeatedly.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/ssh.sh" 'bash -s' <<'REMOTE'
set +e
echo '### ODOO.CONF (secrets stripped) ###'
sudo grep -vE '^\s*(admin_passwd|db_password)\s*=' /etc/odoo/odoo.conf
echo '### NGINX VHOSTS ###'
for f in /etc/nginx/sites-enabled/*; do echo "--- $f ---"; sudo grep -E 'server_name|proxy_pass|listen|ssl_certificate ' "$f" | head -25; done
echo '### ODOO SERVICE ###'
systemctl show odoo --no-pager | grep -E '^(ExecStart|User|Group|WorkingDirectory)='
echo '### INSTALLED MODULES COUNT ###'
sudo -u postgres psql -d pes_crm -tAc "SELECT count(*) FROM ir_module_module WHERE state='installed';"
echo '### WEBSITES ###'
sudo -u postgres psql -d pes_crm -c "SELECT id, name, domain, company_id FROM website ORDER BY id;"
echo '### COMPANIES ###'
sudo -u postgres psql -d pes_crm -c "SELECT id, name FROM res_company ORDER BY id;"
echo '### COMET-ADMIN PROBE ###'
sudo -u postgres psql -d pes_crm -c "SELECT id, login, active, company_id FROM res_users WHERE login ILIKE '%comet%';"
REMOTE
