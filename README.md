# mesita-web-platform

Web platform for **Mesita** — an AI-powered product for restaurants, cafés, and nightlife venues that gives guests venue intelligence, AI-assisted table reservations, and cashback coupons. Guests are segmented by social influence and spending behavior so venues can compete for high-value customers.

This repo contains the five web surfaces:

- **Landing** — public marketing site
- **Admin** — internal operations (Canzeco team)
- **Manager** — venue owner / operator dashboard
- **Waiter** — service staff app
- **Guest** — guest-facing web (companion to the mobile app)

The mobile guest app and the WhatsApp waiter bot live in separate repos.

## Stack

- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style, neutral base)
- **Package manager**: pnpm
- **Node**: 22 LTS (pinned via `.nvmrc` and `engines`)
- **Backend**: Supabase (separate repo: `mesita-supabase`) — client calls Edge Functions, Edge Functions call the database. The client never calls the database directly.
- **Payments**: Stripe
- **Hosting**: Vercel

## Getting started

```bash
nvm use            # picks up .nvmrc (Node 22)
pnpm install
pnpm dev           # http://localhost:3000
```

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
├── app/             # App Router routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css  # Tailwind v4 + shadcn theme tokens
├── components/      # shared components
│   └── ui/          # shadcn primitives (added on demand)
└── lib/
    └── utils.ts     # cn() helper
```

## License

Proprietary — see [LICENSE](./LICENSE). All rights reserved by Canzeco.
