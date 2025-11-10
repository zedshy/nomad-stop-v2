<div align="center">

![Nomad Stop](public/favicon.svg)

# Nomad Stop – Next.js Commerce Platform

</div>

## Overview

Nomad Stop is a full-stack commerce platform for an Afghan street food brand. It combines a Next.js 15 frontend with Prisma/PostgreSQL, Stripe-like payment scheduling (via Worldpay), and a custom admin dashboard for menu management, order fulfilment, and promotions.

Key capabilities:
- Five-step checkout with promo codes, delivery/pickup logic, and tip calculation.
- Worldpay integration (Access Checkout hosted fields + Payments API in progress; legacy Orders API fallback available).
- Admin tools for products, orders, and promotional campaigns.
- Automated order status emails and webhook-ready payment reconciliation.

## Tech Stack

- **App Framework:** Next.js 15 (App Router, Turbopack)
- **Styling:** Tailwind CSS + custom design system components
- **State Management:** Zustand for cart/checkout flows
- **Database:** Prisma ORM (SQLite in dev; PostgreSQL in production)
- **Payments:** Worldpay Access Checkout & Webhooks
- **Email:** Resend + custom transactional templates

## Getting Started

```bash
npm install

# Development
npm run dev

# Linting
npm run lint

# Prisma
npx prisma migrate dev
npx prisma db seed
```

The app runs at `http://localhost:3000` by default (Turbopack will pick the next available port if 3000 is busy).

## Environment Variables

Create `.env.local` and provide the following keys:

```
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

WORLDPAY_USERNAME="..."
WORLDPAY_PASSWORD="..."
WORLDPAY_ENTITY_ID="..."
WORLDPAY_CHECKOUT_ID="..."
WORLDPAY_ENVIRONMENT="sandbox"

RESEND_API_KEY="..."
```

See `docs/payments/WORLDPAY_CONFIGURATION.md` for the full list and setup guidance.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Next.js dev server (Turbopack). |
| `npm run build` | Create a production build. |
| `npm run start` | Run the compiled production server. |
| `npm run lint` | Run ESLint. |

## Documentation

- `docs/architecture/` – High-level system design (add diagrams & notes here).
- `docs/deployment/` – cPanel deployment guide, scripts, and checklists.
- `docs/payments/` – Worldpay configuration, troubleshooting, and webhook setup.
- `docs/operations/` – Order fulfilment SOPs and production runbooks.

See `docs/README.md` for the full directory map.

## Contributing & GitHub Workflow

1. Fork or clone the repo: `git clone https://github.com/zedshy/nomad-stop.git`
2. Install dependencies and create a brach: `git checkout -b feature/<name>`
3. Keep commits focused and descriptive.
4. Push and open a PR against `main`.

## Deployment

Detailed deployment instructions for both GoDaddy cPanel and containerized hosting live under `docs/deployment/`. The quick path is:

```bash
npm run build
npm run start
```

Make sure environment variables are configured in your hosting provider dashboard, and that Prisma migrations are applied before switching traffic to the new build.

---

Questions? Reach out via the Nomad Stop Slack or email the dev team at engineering@nomadstop.com. README last updated Nov 2025.
