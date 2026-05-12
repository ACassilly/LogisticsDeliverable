#!/usr/bin/env bash
# Rebrand the Portlandia Logistics Portal (Odoo website_id=8, company_id=3).
# Idempotent: pruning unused public modules + per-website footer/contactus/header overrides.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$DIR/../.." && pwd)"
LOGO="$REPO/public/images/logo/logo.png"
test -s "$LOGO"
B64="$(base64 -w0 "$LOGO")"
cat > /tmp/_rebrand.sh <<EOF
set -euo pipefail
sudo -u odoo /opt/odoo/venv/bin/odoo shell -c /etc/odoo/odoo.conf -d pes_crm --no-http <<'PYEOF'
WEB_ID=8; CO_ID=3
LOGO=b'${B64}'
V=env['ir.ui.view'].sudo()
C=env['res.company'].sudo().browse(CO_ID)
W=env['website'].sudo().browse(WEB_ID)
C.write({'logo': LOGO,'email':'portal@portlandialogistics.com','phone':'+1 502-385-3399','website':'https://portlandialogistics.com'})
if C.partner_id: C.partner_id.write({'email':'portal@portlandialogistics.com','phone':'+1 502-385-3399','website':'https://portlandialogistics.com'})
W.write({'company_id': CO_ID,'name':'Portlandia Logistics Portal','logo': LOGO})
# Prune unused public top-nav menus
M=env['website.menu'].sudo()
bad=('/shop','/event','/forum','/blog','/slides','/appointment','/jobs','/courses')
for m in M.search([('website_id','=',WEB_ID)]):
    u=(m.url or '').lower()
    if any(u.startswith(p) for p in bad):
        try: m.unlink()
        except Exception: pass
def patch(view_id, pairs):
    g=V.browse(view_id); arch=g.arch_db or ''; new=arch; changed=False
    for a,b in pairs:
        if a in new: new=new.replace(a,b); changed=True
    if not changed: return
    t=V.search([('key','=',g.key),('website_id','=',WEB_ID)],limit=1)
    if t: t.write({'arch_db':new})
    else: V.create({'key':g.key,'name':g.name+' (PL)','type':g.type,'arch_db':new,'website_id':WEB_ID,'mode':g.mode,'priority':g.priority,'inherit_id':g.inherit_id.id if g.inherit_id else False})
# footer custom
patch(1532,[
  ("We are a team of passionate people whose goal is to improve everyone's life through disruptive products. We build great products to solve your business problems.",
   'Portlandia Logistics is a customer-obsessed transportation and logistics partner. We move freight across truckload, LTL, intermodal and drayage with national-3PL reliability and a dedicated single point of contact for every load.'),
  ('Our products are designed for small to medium size companies willing to optimize their performance.',
   'Shippers across North America trust Portlandia Logistics for transparent pricing, real-time visibility, and proactive communication on every shipment.'),
  ('info@yourcompany.example.com','portal@portlandialogistics.com'),
  ('+1 555-555-5556','+1 502-385-3399'),
])
# header phone widget
patch(1603,[('+1 555-555-5556','+1 502-385-3399'),('555-555-5556','502-385-3399')])
# contactus page
for v in V.search([('key','=','website.contactus'),('website_id','=',False)]):
    patch(v.id,[('+1 555-555-5556','+1 502-385-3399'),('555-555-5556','502-385-3399'),('info@yourcompany.example.com','portal@portlandialogistics.com')])
env.cr.commit(); print('OK rebrand company=%s website=%s'%(C.id,W.id))
PYEOF
EOF
"$DIR/ssh.sh" "sudo bash -s" < /tmp/_rebrand.sh
