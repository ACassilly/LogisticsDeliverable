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
