# 🛒 ShopNext

A full-stack e-commerce platform built with Next.js 16 (App Router), Prisma, and PostgreSQL. ShopNext ships with a complete storefront, customer accounts, an admin dashboard, and the operational tooling (orders, inventory, coupons, blog, analytics, etc.) you need to run a real shop.

---

## ✨ Features

**Storefront**
- Product catalog with categories, variants, search, filters, sort, and pagination
- Product detail pages with image gallery, reviews, Q&A, size guide, and related items
- Cart drawer, wishlist, product comparison, recently viewed
- Multi-step checkout with guest checkout, coupons, gift cards, and multiple shipping methods
- Order history, tracking timeline, and PDF-style invoice download
- Blog, FAQ, contact, and policy pages

**Accounts**
- Email/password auth with JWT, password reset, and account deletion
- Saved addresses, profile management, data export (GDPR-style)
- In-app notifications and newsletter subscription

**Admin**
- Dashboard with sales analytics, advanced reports, and audit logs
- Product, category, inventory, and banner management
- Order management with status history and bulk export
- Coupons, flash sales, gift cards, and blog editor
- Customer management with multiple admin roles (super admin, manager, support)
- Messaging center for replying to customer inquiries

**Tech**
- Next.js 16 App Router with Server Components and Route Handlers
- Prisma ORM with PostgreSQL
- Tailwind CSS v4 + shadcn/ui components
- Redux Toolkit for client state, Zod for validation, bcrypt for hashing
- PWA manifest + install prompt

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Lucide |
| State | Redux Toolkit, React Redux |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Charts | Recharts |

---

## 📋 Prerequisites

- Node.js 20+ and npm
- One of:
  - Docker + Docker Compose (recommended for local dev)
  - A remote PostgreSQL connection string (e.g., Supabase, Neon, Railway, RDS)

---

## 🚀 Quick Start — Local with Docker

This is the fastest path. Docker spins up Postgres on port `5433` so it doesn't clash with any local Postgres on `5432`.

**1. Clone and install**

```bash
git clone <your-repo-url> shopnext
cd shopnext
npm install
```

**2. Create `.env`**

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/ecommerce"
JWT_SECRET="replace-with-a-long-random-string"
```

**3. Start Postgres**

```bash
docker compose up -d
```

This starts the `ecommerce-db` container defined in `docker-compose.yml` with a persistent `pgdata` volume.

**4. Run migrations and seed**

```bash
npx prisma migrate deploy
npx prisma generate
npm run seed
```

**5. Start the dev server**

```bash
npm run dev
```

Open http://localhost:3000.

**Default seeded accounts**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@shopnext.com` | `admin123` |
| User | `user@shopnext.com` | `user123` |

Change these immediately for anything other than local development.

---

## ☁️ Using a Remote PostgreSQL (Supabase, Neon, Railway, etc.)

You can skip Docker entirely and point ShopNext at any managed Postgres.

### Option A — Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the dashboard, go to **Project Settings → Database → Connection string** and copy the **URI** (the one that includes your password).
3. Use the **Connection Pooler** string (port `6543`, mode `transaction`) for your app, and the **direct** string (port `5432`) for migrations. Prisma needs both because the pooler doesn't support some migration commands.

Set up `.env` like this:

```bash
# App runtime — pooled connection (works with serverless)
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Migrations — direct connection
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"

JWT_SECRET="replace-with-a-long-random-string"
```

Then update `prisma/schema.prisma` to use both URLs:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Run migrations and seed:

```bash
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

> Tip: if your password contains special characters (`@`, `#`, `:`, `/`), URL-encode them in the connection string.

### Option B — Any other remote Postgres (Neon, Railway, RDS, Render)

Just set `DATABASE_URL` to the provider's connection string. Most providers require SSL — append `?sslmode=require` if it isn't already there:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require"
JWT_SECRET="replace-with-a-long-random-string"
```

Then:

```bash
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

You don't need `docker compose up` when using a remote database.

---

## 📜 Scripts

```bash
npm run dev      # Start the dev server
npm run build    # Production build
npm run start    # Run the production build
npm run lint     # ESLint
npm run seed     # Seed the database with demo data
```

Useful Prisma commands:

```bash
npx prisma studio          # Visual DB browser
npx prisma migrate dev     # Create and apply a new migration (dev)
npx prisma migrate deploy  # Apply existing migrations (prod / CI)
npx prisma generate        # Regenerate the Prisma client
```

---

## 📁 Project Structure

```
shopnext/
├── prisma/
│   ├── schema.prisma          # Data model
│   ├── migrations/            # SQL migrations
│   └── seed.ts                # Demo data seeder
├── public/                    # Static assets, PWA manifest
├── src/
│   ├── app/
│   │   ├── (admin)/           # Admin dashboard routes
│   │   ├── (auth)/            # Login, register, password reset
│   │   ├── (shop)/            # Storefront pages
│   │   ├── api/               # Route handlers (REST endpoints)
│   │   └── layout.tsx
│   ├── components/            # UI, layout, shop, admin components
│   ├── hooks/                 # Reusable React hooks
│   ├── lib/                   # Auth, prisma client, utilities
│   └── store/                 # Redux slices
├── docker-compose.yml         # Local Postgres
└── package.json
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (pooled if using Supabase) |
| `DIRECT_URL` | ⚪ | Direct (unpooled) connection, recommended for Supabase migrations |
| `JWT_SECRET` | ✅ | Secret used to sign JWTs. Use a long random value in production |

---

## 🩺 Troubleshooting

- **`P1001: Can't reach database server`** — confirm Docker is running (`docker ps`), or that your remote DB allows connections from your IP.
- **Port 5433 already in use** — change the host port in `docker-compose.yml` and update `DATABASE_URL` to match.
- **Supabase migrations hang or fail** — make sure migrations run against the direct (`5432`) connection, not the pooler.
- **`prisma generate` errors after schema edits** — re-run `npx prisma generate`; the client is output to `src/generated/prisma`.
- **Seeded accounts missing after switching DBs** — run `npm run seed` against the new database.

---

## 📦 Deploying

ShopNext deploys cleanly to any Node-compatible host (Vercel, Render, Fly, a VPS, etc.). Set the same `DATABASE_URL` and `JWT_SECRET` env vars in your host's dashboard, run `npx prisma migrate deploy` as part of your build, and you're set.

---

## 📄 License

MIT — use it, fork it, ship it.
