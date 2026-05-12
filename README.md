# Portlandia Logistics

Full-stack logistics platform built with Next.js 16.2.6, MongoDB, Stripe, and Odoo.

## Tech Stack

- **Framework**: Next.js 16.2.6 (App Router, React Compiler enabled)
- **Database**: MongoDB via Mongoose
- **Auth**: JWT with 6-role RBAC (ADMIN, AGENT, DISPATCHER, SHIPPER, CARRIER, LEADERSHIP)
- **Payments**: Stripe Checkout + Webhooks
- **ERP**: Odoo XML-RPC (sale orders + CRM leads)
- **Email**: Nodemailer
- **Freight Rates**: GTZShip API
- **Images**: Cloudinary
- **UI**: Tailwind CSS v4 + shadcn/ui + Radix UI

## Getting Started

```bash
cp .env.local.example .env.local
# fill in your env vars
npm install
npm run dev
```

## Environment Variables

See `.env.local.example` for all required variables.

## Portal Routes

| Role | Portal URL |
|------|------------|
| ADMIN | `/portal/admin` |
| AGENT | `/portal/agent` |
| DISPATCHER | `/portal/dispatcher` |
| SHIPPER | `/portal/shipper` |
| CARRIER | `/portal/carrier` |
| LEADERSHIP | `/portal/leadership` |
