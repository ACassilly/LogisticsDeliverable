#!/usr/bin/env bash
# Idempotently provision Odoo groups for each Portlandia Logistics portal role.
# Does NOT create human users -- group scaffolding only.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/ssh.sh" 'sudo -u odoo /opt/odoo/venv/bin/odoo shell -c /etc/odoo/odoo.conf -d pes_crm --no-http' <<'PYEOF'
ROLES = [
    ("pl_portal_admin",      "PL Portal Admin"),
    ("pl_portal_agent",      "PL Portal Agent"),
    ("pl_portal_dispatcher", "PL Portal Dispatcher"),
    ("pl_portal_shipper",    "PL Portal Shipper"),
    ("pl_portal_carrier",    "PL Portal Carrier"),
    ("pl_portal_leadership", "PL Portal Leadership"),
]

Group = env['res.groups']

# (no module-category coupling in Odoo 19)

for xmlid, name in ROLES:
    g = Group.search([('name','=',name)], limit=1)
    if not g:
        g = Group.create({'name':name})
        print('CREATED', xmlid, g.id)
    else:
        print('OK     ', xmlid, g.id)
env.cr.commit()
print('DONE total_groups=%d' % Group.search_count([('name','like','PL Portal %')]))
PYEOF
