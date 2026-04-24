# Atelier Commerce Platform

Single-tenant fashion platform built for a premium atelier brand. The project combines institutional pages, tailored-order workflows, an online store, and private operational panels in a portfolio-ready Next.js architecture.

## What This Project Includes

- Public website in pt-BR for brand presentation, contact, custom orders, and online store
- Authenticated client area for tailored orders, store purchases, tracking, reviews, and account management
- Internal dashboards for `admin`, `finance`, and `sales_stock`
- Server Actions, adapter-based integrations, audit trail, and operational safeguards
- Supabase migrations, RLS-ready schema, and a complete demo seed

## Stack

- Next.js App Router
- React 19 + TypeScript
- Tailwind CSS
- Supabase
- shadcn/ui
- react-hook-form + zod

## Architecture

```txt
app/         routes, layouts, pages
components/  reusable UI and feature components
actions/     server actions
services/    business rules and data orchestration
adapters/    provider interfaces and mocks
lib/         constants, auth, validations, utilities
types/       shared contracts
supabase/    migrations, policies, seed data
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file from the example:

```bash
cp .env.example .env.local
```

3. Configure at least:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INTERNAL_FINANCE_UNLOCK_PASSWORD`
- `INTERNAL_ADMIN_TECHNICAL_PASSWORD`

4. Apply the Supabase migrations in `supabase/migrations/`
5. Run the demo seed in `supabase/seed/demo_seed.sql`
6. Start the app:

```bash
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

## Demo Notes

- The repository ships with mock adapters for email, WhatsApp, payment, shipping, invoice, and password recovery flows.
- Demo operational data lives in `supabase/seed/demo_seed.sql`.
- The app is structured for real provider swaps without spreading SDK logic through actions.

## Production Gaps

- Replace mock adapters with real providers
- Configure transactional email and operational 2FA delivery
- Integrate payment webhooks, shipping, and invoicing
- Add automated critical-flow tests
- Add observability, rate limiting, and failure monitoring

## Validation

Recommended checks before shipping:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## License

MIT
