#!/usr/bin/env bash
# Idempotently provision the comet-admin user on the Odoo 19 instance running on
# pes-odoo-crm-vm, scoped to Portlandia Logistics LLC (company_id=3) and the
# Portlandia Logistics Portal website (website_id=8). Stores the generated password
# only in /root/.comet-admin.pwd on the VM (mode 0600). Uses the Odoo 19 writable
# groups field name (group_ids, NOT groups_id).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/ssh.sh" 'sudo bash -s' <<'REMOTE'
set -euo pipefail
PWFILE=/root/.comet-admin.pwd
if [ ! -s "$PWFILE" ]; then
  umask 077; openssl rand -base64 30 | tr -d '/+=' | cut -c1-28 > "$PWFILE"
fi
PW=$(cat "$PWFILE")
export PW

sudo -u odoo /opt/odoo/venv/bin/odoo shell -c /etc/odoo/odoo.conf -d pes_crm --no-http <<'PYEOF'
import os
LOGIN='comet-admin@portlandialogistics.com'
PW=os.environ['PW']
PL_CO_ID=3; PL_WEBSITE_ID=8
U=env['res.users'].sudo()
C=env['res.company'].sudo()
pl=C.browse(PL_CO_ID)
assert pl.exists() and 'Portlandia Logistics' in pl.name
group_ids=[]
for x in ('base.group_user','base.group_system','base.group_erp_manager','website.group_website_designer'):
    try: group_ids.append(env.ref(x).id)
    except Exception as e: print('skip',x,e)
vals=dict(name='Comet Admin (Portlandia Logistics)', login=LOGIN, email=LOGIN,
          company_id=PL_CO_ID, company_ids=[(6,0,[PL_CO_ID])],
          group_ids=[(6,0,group_ids)], active=True)
u=U.search([('login','=',LOGIN)],limit=1)
if u: u.write(vals); print('UPDATED',u.id)
else: u=U.create(vals); print('CREATED',u.id)
u.password=PW
if 'website_id' in u._fields:
    try: u.website_id=PL_WEBSITE_ID
    except Exception as e: print('website_id set failed:',e)
env.cr.commit()
print('OK id=%s login=%s active=%s company=%s(%s)'%(u.id,u.login,u.active,u.company_id.id,u.company_id.name))
PYEOF
REMOTE
echo 'NOTE: The generated password is stored at /root/.comet-admin.pwd on the VM (mode 0600).'
echo 'To reveal: scripts/odoo/ssh.sh sudo cat /root/.comet-admin.pwd'
