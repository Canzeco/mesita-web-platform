# mesita-web-platform

Web platform for **Mesita** — an AI-powered product for restaurants, cafés, bars, and nightlife venues. Guests get a complete venue intelligence layer, AI-assisted table reservations, and a coupon mechanic that adapts to the venue: **cashback** at venues that issue invoices, **instant discount** at cash-based venues. Guests are segmented into four tiers (Bronze, Silver, Gold, Diamond) reached through three independent paths: verified Instagram followers, a paid monthly Membership ($200 MX Silver, $500 MX Gold), or a manual upgrade.

This repo contains the five web surfaces:

| Surface       | Route          | Audience                                                              |
| ------------- | -------------- | --------------------------------------------------------------------- |
| **Landing**   | `/`            | Public marketing site                                                 |
| **Admin**     | `/admin`       | Internal operations (Canzeco team)                                    |
| **Manager**   | `/manager`     | Verified Partner owners and operators                                 |
| **Validator** | `/validator`   | Service staff (Web Waiter — browser-based checkout)                   |
| **Guest**     | `/guest`       | Guest-facing web (companion to the mobile app)                        |

The mobile guest app (Expo) and the WhatsApp Waiter Bot live in separate repos.

## Stack

- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style, neutral base) + `tw-animate-css`
- **UI primitives**: Radix UI (`radix-ui`), Lucide icons, Sonner toasts, `qrcode.react`
- **Backend**: Supabase (separate repo: `mesita-supabase`) — `@supabase/ssr` + `@supabase/supabase-js`
- **Maps**: Google Maps via `@vis.gl/react-google-maps`
- **Payments**: Stripe (venue plans + guest Memberships)
- **Package manager**: pnpm 11 (pinned via `packageManager`)
- **Node**: 22 LTS (pinned via `.nvmrc` and `engines`)
- **Hosting**: Vercel

## Architecture rules

These are enforced across the platform — keep them in mind when adding code:

- **Client → Edge Function → Database.** Clients never call the database directly. Every data read or write goes through a Supabase Edge Function.
- **Functions don't call other functions.** Composition happens on the client. Edge Functions are leaf nodes.
- **Function naming: `caller-verb-words`.** E.g., `manager-create-unit`, `guest-claim-coupon`.
- **`verify_jwt=true` is currently forced on.** Don't disable it in function configs without coordinating.

## Getting started

```bash
nvm use            # picks up .nvmrc (Node 22)
pnpm install
pnpm dev           # http://localhost:3000
```

You'll need a `.env.local` with Supabase URL + anon key, the Google Maps API key, and the Stripe publishable key. See `mesita-supabase` for the matching backend setup.

## Scripts

| Command       | What it does                       |
| ------------- | ---------------------------------- |
| `pnpm dev`    | Run Next.js dev server (Turbopack) |
| `pnpm build`  | Production build                   |
| `pnpm start`  | Run the production build           |
| `pnpm lint`   | Run ESLint                         |

## Adding shadcn/ui components

shadcn/ui is pre-configured (`components.json`, neutral base, `@/` alias). To add a component:

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card dialog input
```

Components land in `src/components/ui/`.

## Project layout

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # Landing
│   ├── globals.css             # Tailwind v4 + shadcn theme tokens
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── auth/                   # Sign-in callback, password reset, post-signin routing
│   ├── admin/                  # Internal back office
│   ├── manager/                # Verified Partner dashboard
│   │   ├── sign-in, sign-up, onboard, create_unit
│   │   └── (shell)/            # Authed shell with sidebar
│   │       ├── home
│   │       ├── place
│   │       ├── promos
│   │       ├── performance
│   │       ├── wallet
│   │       └── team
│   ├── validator/              # Web Waiter — browser-based checkout
│   └── guest/                  # Guest-facing web (mirror of mobile app)
│       ├── sign-in, sign-up, onboard
│       └── (shell)/            # Authed shell with bottom nav
│           ├── discover/       # swipe / map / catalog / ai
│           ├── saved
│           ├── qr
│           ├── share
│           ├── profile
│           ├── subscribe/[tier] # Silver/Gold Membership checkout
│           └── venue/[id]
├── components/
│   ├── ui/                     # shadcn primitives
│   ├── auth/                   # Email, phone, OAuth, sign-out
│   ├── shared/                 # Cross-surface (TierBadge, FiscalBadge, RatePill, …)
│   ├── manager/                # Manager-only components
│   └── guest/                  # Guest-only components (mobile frame, swipe deck, etc.)
├── lib/
│   ├── api/                    # Typed wrappers around Edge Functions
│   ├── supabase/               # Browser, server, and middleware clients
│   ├── ticket-workflow.ts      # 10-ticket taxonomy logic
│   ├── validators.ts
│   ├── guest-data.ts
│   ├── ui-classes.ts
│   └── utils.ts
└── middleware.ts               # Auth + route protection
```

## Manager Console layout

The Manager `(shell)` routes follow the agreed nav order:

**Home · Place · Promos · Performance · Wallet · Team**

`Wallet` only renders for venues on a Cashback plan (Formal). Plan management and integrations (Instagram, WhatsApp, Stripe Connect, Google Business) live in a profile-menu **Settings** drawer, not in the top-level nav.

## License

Proprietary — see [LICENSE](./LICENSE). All rights reserved by Canzeco.
