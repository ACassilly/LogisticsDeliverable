# Odoo VM Runbook (pes-odoo-crm-vm)

This document is the source of truth for how this Codespace connects to and
operates on the Odoo 19 Enterprise CRM VM. All steps here are reproducible from
the repo.

## VM identity

- Name: `pes-odoo-crm-vm`
- Resource group: `PES-Odoo-CRM`
- Subscription: PortlandiaElectricSupply
- Public IP: `40.124.224.123`
- Private IP: `172.25.0.4`
- OS: Ubuntu 24.04, Standard E2s v3 (2 vCPU / 16 GiB)
- Tags: `ApplicationDomain = Odoo 19 CRM`, `Domain = crm.pes.supply`

## Stack on the VM

- Odoo 19 Enterprise, systemd unit `odoo.service`, ExecStart
  `/opt/odoo/venv/bin/odoo -c /etc/odoo/odoo.conf`, user/group `odoo`
- Postgres 16 local (`db_host=localhost`, `db_user=odoo`)
- Database: `pes_crm` (single-DB mode, locked via `odoo.conf`)
- nginx in front of Odoo (`proxy_mode=True`, workers=2; HTTP 8069, longpoll 8072)
- Addons paths: `/opt/odoo/enterprise`, `/opt/odoo/odoo-server/odoo/addons`,
  `/opt/odoo/custom-addons`
- 546 modules installed; 16 websites; 26 companies

## Tenant scoping for Portlandia Logistics

- Company: `Portlandia Logistics LLC` (company_id = **3**)
- Website: `Portlandia Logistics Portal` (website_id = **8**, domain
  `https://id.portlandialogistics.com`)
- All Portlandia-scoped users must have `company_id=3`, `company_ids=[3]`, and
  `website_id=8`.

## Access from this Codespace

SSH from the Codespace to the VM is allowed by NSG rule
`Allow-SSH-Codespace-PortlandiaElectric` (priority 305) which permits TCP/22
from `172.182.200.0/24` (GitHub Codespaces egress for our region). This sits
above the priority-1000 Microsoft Defender JIT Deny rule.

- VM-only private key: `~/.ssh/pes_odoo_ed25519` (generated inside this
  Codespace; never leaves it).
- Matching public key is appended to `/home/azureuser/.ssh/authorized_keys`
  on the VM.
- Fingerprint: `SHA256:/46nSfkLWnLlSzlLWfRfgtsg2nDEfMgrfACGpd/cHXE`

If the Codespace is rebuilt the key disappears with it; regenerate and
re-authorize via the `az-run.sh` fallback (see below).

## Scripts

All versioned under `scripts/odoo/`:

- `ssh.sh` -- SSH wrapper. Usage: `scripts/odoo/ssh.sh 'remote command'`
- `discover.sh` -- Prints odoo.conf (secrets stripped), nginx vhosts, the
  systemd unit, module count, websites, companies, and a comet-admin probe.
- `provision-comet-admin.sh` -- Idempotently creates/repairs the
  `comet-admin@portlandialogistics.com` user with Administrator +
  ERP Manager + Website Designer groups, scoped to Portlandia Logistics LLC.
  The generated password is written only to `/root/.comet-admin.pwd`
  (mode 0600) on the VM.
- `az-run.sh` -- Fallback path that drives the VM via `az vm run-command`.
  Use when SSH is unavailable. Requires `az login --use-device-code`.

### Gotcha: Odoo 19 field rename

The writable groups field on `res.users` in Odoo 19 is `group_ids`
(Many2many -> res.groups, stored). The legacy name `groups_id` no longer
exists; using it raises `ValueError: Invalid field 'groups_id'`.
`all_group_ids` is computed (includes implied groups) and not writable.

## Reveal the comet-admin password

After running `scripts/odoo/provision-comet-admin.sh`:

```bash
scripts/odoo/ssh.sh sudo cat /root/.comet-admin.pwd
```

Use it to sign in at <https://id.portlandialogistics.com/web/login>.

## Recovery / drift

- NSG drift (e.g., Defender re-asserts JIT): re-add the priority-305 rule, or
  use `az-run.sh` until SSH is restored.
- New Codespace egress IP outside `172.182.200.0/24`: update the NSG rule's
  source CIDR.
- Lost SSH key: regenerate inside the Codespace, then push the new pubkey to
  the VM via `az-run.sh`.

## Per-user-type QA harness & portal groups (added 2026-05-12)

- `scripts/qa/roles.json` — declarative map of the 6 RBAC roles (ADMIN, AGENT, DISPATCHER, SHIPPER, CARRIER, LEADERSHIP), their Next.js paths under `/portal/<role>`, and matching Odoo group names `pl_portal_<role>`.
- `scripts/qa/probe-roles.sh` — asserts (a) every `/portal/<role>` redirects unauthenticated requests to `/login?redirect=...`, (b) every public path returns 200 with body >1024 bytes.
- `scripts/qa/asset-audit.sh` — crawls public pages and audits every `<img>`/`og:image` URL for placeholder bytes or non-image content-type.
- `scripts/odoo/provision-portal-groups.sh` — idempotently creates the 6 `pl_portal_*` groups in `pes_crm` (no users created).

### How to actually assign humans to portal groups (you, not the assistant)
1. Reveal the comet-admin password (on the VM only):  
   `scripts/odoo/ssh.sh sudo cat /root/.comet-admin.pwd`
2. Sign in at `https://id.portlandialogistics.com/web/login` as `comet-admin@portlandialogistics.com`.
3. Settings → Users & Companies → Users → pick the user → check the relevant `PL Portal *` group(s) under Other (Odoo 19: `group_ids`).
4. Save.

### Odoo 19 caveats discovered while wiring this
- `res.users.groups_id` is gone — use `group_ids`.
- `res.groups.category_id` is gone — module categories no longer couple to groups. The `pl_portal_*` groups are named-only.

## Open image/audit follow-ups (queued atomic tickets, 2026-05-12)

From `audit/asset-audit-20260512.log`:

1. **Service tile placeholders on disk (286-byte JPEGs).** Replace `public/images/services/built-for-ltl.png` (68B), `customer-support.jpg`, `intermodal.jpg`, `specialized.jpg` with real imagery. `ltl-hero.png`, `what-is-ltl.png`, `ltl.jpg` are real and serve correctly.
2. **`stay-updated.png` / `stay-updated-mobile.png` are 1x1 placeholders.** Replace with real CTA imagery.
3. **`_next/image?url=...&w=3840` returns HTTP 400 in prod for some service assets.** Investigate Next 16 image optimizer `deviceSizes` cap and `images.formats` in `next.config.ts`; consider adding `images.localPatterns` or switching the heavy `ltl.jpg` (1.8 MB) to Cloudinary.
4. **Optimize `ltl.jpg` (1.8 MB).** Either pre-compress in `public/` or move to Cloudinary `f_auto,q_auto`.
