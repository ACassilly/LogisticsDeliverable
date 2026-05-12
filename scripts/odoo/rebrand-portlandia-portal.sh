#!/usr/bin/env bash
# Rebrand the Portlandia Logistics Portal Odoo website (website_id=8)
# and its company (company_id=3): logo, phone, email, website, About copy,
# and prune unused public Odoo modules from the public nav (Shop/Events/
# Forum/Blog/Courses/Appointment/Jobs).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$DIR/../.." && pwd)"
LOGO_LOCAL="$REPO/public/images/logo.png"
test -s "$LOGO_LOCAL"
# Stage the logo on the VM
base64 -w0 "$LOGO_LOCAL" > /tmp/pl-logo.b64
scp -o StrictHostKeyChecking=no -i "$DIR/../../.ssh-codespace/id_ed25519" /tmp/pl-logo.b64 azureuser@40.124.224.123:/tmp/pl-logo.b64 || true
"$DIR/ssh.sh" 'sudo bash -s' <<'REMOTE'
set -euo pipefail
test -s /tmp/pl-logo.b64
sudo -u odoo /opt/odoo/venv/bin/odoo shell -c /etc/odoo/odoo.conf -d pes_crm --no-http <<'PYEOF'
import base64
CO_ID=3; WEB_ID=8
LOGO=open('/tmp/pl-logo.b64','rb').read().strip()
C=env['res.company'].sudo().browse(CO_ID)
W=env['website'].sudo().browse(WEB_ID)
assert C.exists() and W.exists()
C.write({
  'logo': LOGO,
  'email': 'portal@portlandialogistics.com',
  'phone': '+1 502-385-3399',
  'website': 'https://portlandialogistics.com',
})
if C.partner_id:
    C.partner_id.write({
      'email': 'portal@portlandialogistics.com',
      'phone': '+1 502-385-3399',
      'website': 'https://portlandialogistics.com',
    })
# Bind website to company
W.write({'company_id': CO_ID, 'name': 'Portlandia Logistics Portal'})
# Prune public top-nav menus that are not relevant to a logistics portal
M=env['website.menu'].sudo()
bad_prefixes=('/shop','/event','/forum','/blog','/slides','/appointment','/jobs','/courses')
menus=M.search([('website_id','=',WEB_ID)])
for m in menus:
    u=(m.url or '').lower()
    if any(u.startswith(p) for p in bad_prefixes):
        print('UNLINK menu', m.id, m.name, u)
        try: m.unlink()
        except Exception as e: print('skip', m.id, e)
env.cr.commit()
print('OK rebrand company=%s website=%s'%(C.id,W.id))
PYEOF
REMOTE
