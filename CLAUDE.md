# store-admin — Admin dashboard of the clothing store

Online clothing store for the Algerian market. The system is split into **three independent repositories**, all in **TypeScript**:

| Repo | Role |
|---|---|
| `store-api` | Server: database, business rules, payments, delivery company |
| `store-web` | Customer storefront (Next.js) |
| `store-admin` (this one) | Admin dashboard (Next.js), for the owner and staff only |

The owner speaks Arabic — reply to him in Arabic. Code, comments and commit messages in English.

## How the repos are connected
- This app **never touches the database**. It talks only to `store-api` (`/admin/*` endpoints) over HTTPS (`NEXT_PUBLIC_API_URL`).
- API types are **generated** from the API's `/openapi.json` (`npm run gen:api`, using `openapi-typescript`). Never hand-write API types.
- **While `store-api` is not ready**, build against a typed mock adapter (`src/lib/api/mock.ts`) switched by `NEXT_PUBLIC_USE_MOCK=true`.
- Login through Supabase Auth via the API; only users with role `admin` get in. Every page is protected (middleware redirects to `/login`). Secure cookie, no token in localStorage.

## Stack
- **Next.js** (App Router, TypeScript strict), **Tailwind CSS** + **shadcn/ui** (tables, forms, dialogs), logical CSS properties for RTL.
- **next-intl**: `ar` (default, RTL) and `fr`. No hard-coded UI strings.
- Currency **DZD (دج)**.
- Deploy on **Vercel** from GitHub `main`, on its own domain/subdomain (e.g. `admin.…`). Add `noindex` everywhere.
- Works well on a **phone** (the owner will often use it from his phone): responsive tables → cards on small screens.

## Design
Clean and simple: white background, black primary buttons, rounded corners, same visual identity as the storefront (`src/config/brand.ts`, placeholder name "Store"). Mobile-first.

## Features
- **Overview:** new orders today, revenue (today / week / month), top products, low-stock alerts, orders by status.
- **Orders:** list with filters (status, date, wilaya, payment) and search; order page with items, totals, payment status, status change; **confirm order** (sends it to the delivery company through the API, which then removes the customer's personal data from our DB); button to open the parcel in the delivery company's dashboard by tracking number; print invoice / delivery slip; `wa.me` button to contact the customer on WhatsApp while the order is still pending.
- **New-order alert:** live badge + sound (Supabase Realtime via the API's event channel), notifications list.
- **Products:** create / edit / delete, variants (size, color, stock, price, compare-at price), multi-image upload with drag-to-reorder, publish/unpublish, bulk price/stock update.
- **Catalog:** categories, collections, brands.
- **Storefront content:** hero slides, banners, announcement bar text.
- **Shipping:** fee per wilaya (table editable in place), home vs desk fee.
- **Discount codes**, **customers list** (orders count only, no personal data beyond what the API exposes).
- **Settings:** admins list (invite / remove), store info.

## Build order (commit after each phase)
1. Setup: Next.js + Tailwind + shadcn/ui + next-intl, brand config, login page, protected layout, sidebar (bottom bar on mobile), mock API adapter, `gen:api` script.
2. Overview page + orders list/detail (against mock).
3. Products CRUD with variants and image upload.
4. Catalog, shipping fees, slides/banners, discount codes.
5. Connect everything to the real API; order confirmation → delivery company; new-order alerts.
6. Invoices / delivery slips, customers, settings.
7. Polish: loading/empty/error states, accessibility, performance.

## Things the owner must do himself (ask step by step)
- Connect this repo to **Vercel** once and set `NEXT_PUBLIC_API_URL`.
- Create the first admin user (the API repo will document how).

## Everything editable (owner's rule)
Whatever the storefront shows must be editable here. When `store-web` gets a new element, add: the API fields/endpoints (write them under `## Needs from API`), and a screen in this dashboard (nav entry, list + edit form, preview when it helps). Reuse `src/components/form/*` (I18nFields ar/fr/en, ImageField, DateTimeField, SwitchField, FormSheet).

## Rules
- Run `npm run build` and `npm run lint` before every push; fix all errors.
- Small, clear commits on `main` unless the owner asks for branches.
- Keep `## Progress` up to date. If the API is missing something the dashboard needs, write it under `## Needs from API` so the owner can pass it to the `store-api` session.

## Progress
- [x] Phase 1 — setup: Next.js 16 + Tailwind 4 + shadcn/ui (button, input, label, card, badge, sheet, skeleton — written by hand, `components.json` ready) + next-intl (ar/fr via cookie), brand identity shared with the storefront (wordmark + black ADMIN tag), login page (server action, httpOnly cookie), protected layout (`src/proxy.ts` + `requireSession`), sidebar (desktop) / bottom bar + "More" sheet (mobile), mock API adapter, `gen:api`, noindex
- [x] Storefront content screens (mock, in-memory): **Brands** (add/edit/delete/hide/reorder brands + brands-strip settings: show, animation on/off, speed, pause on hover, title; live preview), **Offers & sales** (banners with ar/fr/en texts, image, dark/light, button + link, schedule, countdown, status), **Content** (announcement bar text with preview)
- [x] **Connected to the real API** (2026-11-26): generated types (`npm run gen:api`), brands / strip / offers / sale page / announcement / uploads all work against store-api; the overview page shows a notice until `/admin/stats/overview` exists. Use `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_USE_MOCK=false`. Local demo login with the API's `npm run dev:local`: `admin@store.test` / `admin1234`.
- [x] **Orders** (2026-11-26): list with status tabs, search (order/tracking number) and paging; detail page with items/totals/payment, customer contact only while pending (call + WhatsApp), **confirm** (tracking number; personal data erased), status flow (shipped → delivered / returned), cancel (stock restored), print slip; live **new-order bell** (polls every 20 s, badge + beep); overview now uses the real statistics endpoint. Mock mode has in-memory sample orders.
- [x] **Catalog management** (2026-11-27): products (list, search, publish/hide, create/edit/delete with ar/fr/en texts, category, brand, several photos resized in the browser, reorder + cover, variants table with quick size sets), inventory (bulk price / compare-at / stock, % discount tool, low-stock filter), categories and collections (CRUD, reorder, product picker). Mock mode has an in-memory sample catalog.
- [x] **Phase 5b screens** (2026-11-27): shipping (`/shipping`: 58-wilaya table edited in place with search, same-fee tool, free-delivery threshold), discount codes (`/discounts`: CRUD, kind/value/min/limit/schedule, duplicate → clear error), hero slides (section on `/content`: image, ar/fr/en text, collection or custom link, reorder, schedule). Mock mode has sample data for all three.
- [x] **Phase 6 screens** (2026-11-28): delivery company picker on `/shipping` (manual / Yalidine, chosen from the API's list); with a company selected, "Confirm order" has no tracking field — the server creates the parcel; order page shows delivery status + "refresh parcel status"; card payment status already shown.
- [x] **Home sections screens** (2026-11-29) on `/content`: category cards (image, ar/fr/en text, link, reorder, hide), "why us" (6 slots, icon + title + text, show/hide), newsletter block texts + subscribers list (delete on request).
- [x] **Pages & contact** (2026-11-30) `/pages`: edit the 5 legal pages (title + text in ar/fr/en, published / draft flags) and the store contact details (phone, WhatsApp, email, address, opening hours).

## Needs from API
Temporary shapes are in `src/lib/api/types.ts`.
- `GET/POST /admin/brands`, `PUT/DELETE /admin/brands/{id}`, `POST /admin/brands/{id}/move` `{ direction: -1|1 }` — `AdminBrand { id, name, logoUrl, href, isActive }`
- `GET/PUT /admin/brands-strip` — `{ enabled, animated, speed (5–120 s per loop), pauseOnHover, title: {ar,fr,en} }`
- `GET/POST /admin/offers`, `PUT/DELETE /admin/offers/{id}` — `AdminOffer { id, label, title, subtitle, ctaLabel: {ar,fr,en}, href, imageUrl, theme: "dark"|"light", showCountdown, startsAt, endsAt (ISO), isActive }` (DB table `offers` already exists; countdown requires `endsAt`)
- `GET/PUT /admin/site` — `{ announcement: {ar,fr,en} }` (empty hides the bar)
- `GET/PUT /admin/sale-page` — `{ enabled, title: {ar,fr,en}, subtitle: {ar,fr,en} }` (**done**, screen on the Offers page)
- `POST /admin/uploads` (multipart `file`; PNG/JPEG/WebP/GIF ≤ 3 MB, **no SVG**) → `{ url }` (Cloudflare R2). The dashboard resizes and converts every picked image to WebP in the browser first (`src/lib/image-optimize.ts`, used by `ImageField`): logos ≤ 600 px, offer/banner ≤ 1400 px, product photos ≤ 1600 px.
- `POST /auth/login` `{ email, password }` → `{ accessToken, expiresIn, user: { id, email, role } }`; 401 on bad credentials, 403 if role ≠ `admin` (or return the role and the dashboard refuses).
- **done in API 0.3.0:** `GET /admin/orders`, `GET /admin/orders/{id}`, `POST /admin/orders/{id}/confirm`, `POST /admin/orders/{id}/status`, `GET /admin/events`, `POST /admin/events/read`.
- `GET /admin/stats/overview` (**done**) → `{ newOrdersToday, revenue: { today, week, month }, revenueLast7Days: number[7], ordersByStatus: { pending, confirmed, shipped, delivered, cancelled, returned }, topProducts: [{ id, name, image, unitsSold, revenue }], lowStock: [{ variantId, productName, size, stock, image }] }` (integer DZD).
