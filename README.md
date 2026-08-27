# JKUAT Towers Commerce Network

A digital operating system for JKUAT Towers: customers search/discover/order across
every participating shop in the building, and vendors get an AI business assistant.

This starter implements the beginning of **Phase 4/5/6** from the roadmap:
the data foundation, the building directory, and cross-vendor product search.
Everything else (WhatsApp AI, documents, automation, payments) plugs into this schema.

## Stack

- Next.js 15 (App Router, TypeScript, Tailwind)
- PostgreSQL + Prisma
- Ready to layer in: OpenAI API (AI shopping assistant + vendor business brain),
  WhatsApp Business Cloud API

## What's here right now

```
src/app/page.tsx               Landing page — premium fintech-style hero, live Building Index panel, how-it-works preview
src/app/shops/page.tsx         Browse Shops — filterable directory of every vendor
src/app/search/page.tsx        Browse Products — cross-vendor product search page
src/app/shops/[slug]/page.tsx  Individual vendor storefront
src/app/how-it-works/page.tsx  Customer + vendor journeys, FAQ
src/app/contact/page.tsx       Contact form (persists to ContactMessage) + info cards
src/app/onboard/page.tsx       Vendor onboarding — 4-step form (business -> location -> products -> review)
src/app/assistant/page.tsx     AI shopping assistant — WhatsApp-style chat UI
src/components/SiteNav.tsx     Shared sticky nav — Browse Shops / Browse Products / Become a Vendor / How It Works / Contact Us
src/components/SiteFooter.tsx  Shared footer with the same link set, grouped by audience
src/app/api/search/route.ts    JSON search API (same query the AI assistant uses)
src/app/api/onboard/route.ts   Creates a Shop + its first Products in one call (Clerk-authenticated)
src/app/api/assistant/route.ts OpenAI function-calling loop over the search_products tool
src/app/api/contact/route.ts   Contact form submission endpoint
src/app/api/whatsapp/webhook/route.ts  WhatsApp Cloud API webhook — same AI assistant, replies with per-product shop links
src/lib/search.ts              Shared cross-vendor search logic (used by both the API and the AI tool)
src/lib/assistant-core.ts      Shared OpenAI tool-calling loop (used by both web chat and WhatsApp)
src/lib/openai.ts              OpenAI client singleton
prisma/schema.prisma           Full data model (see below)
prisma/seed.ts                 Sample data: 1 building, 2 shops, 5 products, 1 deal
```

### Landing page & new content pages

The homepage's signature element is the **Building Index panel** — a dark
glass "market index" card in the hero reporting real counts (shops,
products, categories) plus a scrolling strip of live deals/new listings,
styled like a trading terminal rather than a generic gradient hero. It's
real data, not invented deltas — see `src/components/BuildingIndexPanel.tsx`.

`/shops` (Browse Shops), `/how-it-works`, and `/contact` are full pages —
not modals or anchors — each behind the same `SiteNav`/`SiteFooter` shell,
so the requested nav links ("Browse Shops", "Browse Products", "Become a
Vendor", "How It Works", "Contact Us") all resolve to real, dedicated
routes.

### AI shopping assistant (`/assistant`)

A WhatsApp-style chat (Phase 8 wedge, running as a web page rather than an
actual WhatsApp webhook for now — see "Next steps" below). The customer types
naturally ("men's perfume under 3000", "gift idea under 5k"); the model
(OpenAI, `gpt-4o-mini` by default — override with `OPENAI_MODEL`) is given a
`search_products` tool and **cannot** answer with a product, price, or shop
location it didn't get back from that tool — this is what keeps recommendations
grounded in real inventory instead of hallucinated.

The tool calls the exact same `searchProducts()` function that powers
`/api/search`, so the AI and the plain search page can never disagree about
what's actually in stock.

Requires `OPENAI_API_KEY` in `.env` — without it, `/assistant` will show a
friendly "not configured yet" message rather than crashing.

Not yet built: this only talks to shops in a single seeded building, doesn't
persist conversations to the `Conversation`/`Message` tables yet (so there's no
vendor-side chat history or "hand off to vendor" yet), and isn't hooked up to
an actual WhatsApp number — see Phase 8 in the roadmap below.

### Vendor dashboard + AI Business Brain (`/dashboard/[token]`)

Every shop gets a `dashboardToken` (generated automatically on onboarding —
see `prisma/schema.prisma`). Visiting `/dashboard/<token>` shows:

- **Overview cards** — revenue from completed orders, order counts, product
  count, customer count, and a low-stock warning banner.
- **Product manager** — add products, deactivate/reactivate them (no delete,
  so history stays intact).
- **AI Business Assistant** — a chat scoped entirely to *this shop's* data via
  `src/lib/vendor-brain.ts`, with tools:
  - `get_business_summary` — real sales/stock/customer numbers
  - `list_products` — look up this shop's own catalogue
  - `create_quotation` / `create_invoice` — the vendor can say "create a
    quotation for Sarah, 2 units at 3000 each" and it resolves pricing against
    existing products when possible, computes totals, and stores a real
    `Quotation`/`Invoice` row with a generated reference number (`QUO-2026-0001`)

**Security note on the MVP auth**: knowing the `dashboardToken` URL is what
grants dashboard access right now — there's no password or account system.
That's a deliberate simplification for piloting with a handful of trusted
founding vendors (Phase 15), not something to rely on at real scale. Before a
public launch, swap this for real authentication (e.g. WhatsApp OTP, since
every vendor already has a WhatsApp number on file).

Not yet built: invoices/quotations are stored as data only — no PDF or
WhatsApp send yet (see Phase 12), and the AI can't yet run the
follow-up/automation rules from `AutomationRule` (see Phase 13).

### Vendor onboarding (`/onboard`)

A 4-step form matching the "5 minutes → digital shop" flow from the roadmap:
business info → location & contact → products → review. On submit it calls
`POST /api/onboard`, which:

- looks up (or creates) the `Floor` if one was given,
- generates a unique `slug` from the business name,
- creates the `Shop` and all its `Product`s in one write,
- redirects the vendor straight to their new live storefront at `/shops/[slug]`.

Current MVP assumption: **one active `Building`** (seeded by `prisma/seed.ts`).
Once you support multiple buildings, pass a building identifier from the
onboarding form instead of `prisma.building.findFirst()`.

Not yet built: image upload for products (currently text-only), CSV/WhatsApp
catalogue import, and the QR code generation mentioned in the roadmap
("Digital Shop Number") — worth adding once you're onboarding real vendors.

## Design system

The UI follows a "fintech meets building directory" visual language —
see `src/app/globals.css` for tokens and `src/components/`:

- **Colors**: near-navy `ink` (#0B1121) on cool-white `paper`, a commerce-green
  `signal` accent (search, orders, money), and `violet` reserved *only* for
  AI/assistant-touched surfaces — so anywhere the AI acted, the color says so.
- **Type**: Space Grotesk (headings), Inter (body), IBM Plex Mono (every price,
  shop number, and reference code — money and location read as data).
- **Signature element**: the `ShopPlaque` component — a die-cut badge styled
  after the physical numbered plates on real shop doors, used everywhere a
  shop is referenced (search results, storefronts, dashboard header).
- **Motion** (`framer-motion`): staggered fade-ups on scroll (`Reveal`/
  `RevealGroup`/`RevealItem`), count-up stat numbers (`AnimatedNumber`),
  animated step transitions in onboarding, and sliding chat bubbles with a
  three-dot typing indicator in both AI chats. Respects `prefers-reduced-motion`.
- Fully responsive: single-column on mobile throughout, grid layouts from `sm:`/`md:` up.

## Data model (prisma/schema.prisma)

**A note on Prisma 7**: this project uses Prisma 7, which changed its default
architecture in two ways that both surface as setup errors if you're used to
older Prisma:

1. **No bundled query-engine binary.** `PrismaClient` now requires an explicit
   driver adapter (`@prisma/adapter-pg`, wrapping the `pg` driver). Already
   wired up in `src/lib/prisma.ts` and `prisma/seed.ts` — you don't need to do
   anything extra, just know that if you see "PrismaClient was instantiated
   without any options. A driver adapter is required," it means some new file
   created `new PrismaClient()` directly instead of importing the shared
   `prisma` from `src/lib/prisma.ts`.
2. **`datasource.url` moved out of `schema.prisma`.** Prisma 7 no longer
   accepts `url = env("DATABASE_URL")` inside the `datasource` block — that
   now lives in **`prisma.config.ts`** at the project root, which supplies the
   connection string for CLI commands (`db push`, `migrate`, `studio`).
   This is separate from the app's own runtime connection (the adapter in
   `src/lib/prisma.ts`) — both read `DATABASE_URL`, but through different
   mechanisms, so you only ever need to set that one env var.

Mirrors the layered architecture we discussed:

- **Building / Floor / Shop** — the physical + digital directory
- **Product / Service / PricingRule** — vendor catalogue, including bulk pricing
  the AI can use when drafting quotations
- **Customer / Order / OrderItem** — commerce + reserve & collect
- **Conversation / Message** — WhatsApp/AI chat log per customer per shop
- **Quotation / Invoice / Proposal** — the "AI Business Brain" documents
- **AutomationRule** — follow-up rules (new lead, abandoned order, unpaid invoice, etc.)
- **Deal** — building-wide flash sales / featured deals

This is the structured foundation the AI sits on top of — the AI should
retrieve facts from these tables, not invent them.

## Setup

1. **Start a local Postgres.** Easiest is Docker (a `docker-compose.yml` is
   included):
   ```bash
   docker compose up -d
   ```
   No Docker? Install Postgres directly and create a database — or skip local
   Postgres entirely and use a free hosted one: [Neon](https://neon.tech) or
   [Supabase](https://supabase.com).

2. Copy the env file — the default already matches the `docker-compose.yml`
   credentials above, so no edits needed if you used Docker:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Generate the Prisma client and push the schema to your database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Seed sample data (1 building, 2 shops, 5 products):
   ```bash
   npm run db:seed
   ```

6. Add your OpenAI key to `.env` (only needed for `/assistant`, the vendor
   dashboard's AI Business Brain, and the WhatsApp assistant below):
   ```
   OPENAI_API_KEY="sk-..."
   ```

6a. **Set up Clerk (vendor sign-in).** Vendors now authenticate with real
    accounts instead of just a dashboard link:
    - Create a free app at [dashboard.clerk.com](https://dashboard.clerk.com).
    - Copy its Publishable key and Secret key into `.env`:
      ```
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
      CLERK_SECRET_KEY="sk_..."
      ```
    - That's it — `/sign-in`, `/sign-up`, `/onboard`, and `/dashboard` all
      pick it up automatically via `src/middleware.ts`.
    - Seeded/legacy shops (created before Clerk existed) still work via
      their `dashboardToken` link; visiting one while signed in shows a
      "Claim this dashboard" banner that links it to your account so
      `/dashboard` resolves straight to it afterward.

6b. **Set up the WhatsApp AI assistant.** Customers can message your
    WhatsApp Business number and get product recommendations that link
    straight to the right shop:
    - In [Meta for Developers](https://developers.facebook.com), create an
      app with the WhatsApp product added, and grab a test number.
    - Add to `.env`:
      ```
      WHATSAPP_TOKEN="..."             # temporary or permanent access token
      WHATSAPP_PHONE_NUMBER_ID="..."   # from the WhatsApp > API Setup page
      WHATSAPP_VERIFY_TOKEN="jkuat-towers-verify"  # any string you invent
      NEXT_PUBLIC_APP_URL="https://your-tunnel-url"  # ngrok/etc while developing
      ```
    - Expose your dev server publicly (`ngrok http 3000` or similar) and
      set the webhook URL in Meta's dashboard to
      `https://your-tunnel-url/api/whatsapp/webhook`, verify token matching
      `WHATSAPP_VERIFY_TOKEN` above.
    - Message your test number from a phone — e.g. "perfume under 3000" —
      and you should get a reply with matching products, each with a link
      that opens that exact product on the vendor's storefront
      (`/shops/[slug]?highlight=[productId]`, auto-scrolled and ringed).
    - Conversation memory per customer lives in `AssistantSession` /
      `AssistantMessage` (scoped by WhatsApp number, not per-shop — see the
      schema comments for why that's separate from `Conversation`/`Message`).

7. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 — you should see the JKUAT Towers homepage,
   be able to search "perfume", click into a shop, list a new shop at
   `/onboard`, and chat with the AI at `/assistant`.

**What's actually been verified vs. what you'll verify:** the schema itself
was applied field-for-field to a real running Postgres instance and exercised
with representative inserts/joins matching the app's exact query
patterns (product search with shop+floor joins, quotation totals, etc.) —
every relation, constraint, and index behaved as expected. What I *couldn't*
run in that sandbox is `prisma generate`/`db push` themselves, since
Prisma downloads its schema-engine binary from `binaries.prisma.sh`, a
domain outside that environment's network allowlist (confirmed via a direct
request — `403 host_not_allowed`, not a bug in the schema or your setup).
Your own machine won't have that restriction, so steps 4 onward should just
work.

## Next steps, mapped to the roadmap

| Roadmap phase | What to build next |
|---|---|
| Phase 6 — Vendor onboarding | ✅ Done — see `/onboard`, now behind Clerk sign-in. Next: image upload, CSV import, QR code generation |
| Phase 7 — AI Business Brain | ✅ Done — see `/dashboard/[token]` (Clerk-protected). Next: `search_customers` tool, `create_proposal`, and letting the AI write marketing content (Phase 14) |
| Phase 8 — WhatsApp customer AI | ✅ Done — `/api/whatsapp/webhook` (Meta Cloud API) runs the same `search_products`-backed assistant as `/assistant`, persists exchanges to `AssistantSession`/`AssistantMessage`, and replies with per-product links back to the vendor's storefront |
| Vendor auth | ✅ Done — Clerk accounts (`src/middleware.ts`, `Shop.clerkUserId`); legacy token-only shops can be claimed from their dashboard |
| Phase 10/11 — Commerce & payments | Reserve endpoint (`OrderStatus.RESERVED` + `reservedUntil`), then M-Pesa STK push integration |
| Phase 12 — Documents | Quotations/invoices are created as real data (`create_quotation`/`create_invoice` tools) but have no PDF or WhatsApp-send yet — add PDF generation (e.g. `@react-pdf/renderer`) and a "send to customer" action |
| Phase 13 — Automation | A scheduled job (cron or queue) that scans `AutomationRule`s against `Conversation`/`Order` timestamps and sends follow-up messages |
| Phase 15 — Launch | Recruit 5 founding vendors, onboard them through the `/onboard` flow, watch what breaks |

## A note on scope

Per the discovery-first approach we discussed: before building the WhatsApp AI or
document generation, it's worth validating with real JKUAT Towers vendors which of
these matters most to them. This starter is intentionally the smallest useful
slice — building directory + search — so you have something to *show* vendors
during those conversations.
