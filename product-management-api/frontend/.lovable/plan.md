# Nimbus — Inventory Management Frontend

Frontend-only build with a typed API client layer backed by in-memory mock data. Backend swap = change one base URL later.

## Visual Direction

Sleek modern SaaS aesthetic — think Linear × Vercel × Retool.
- **Palette**: deep slate background (`#0B0F17`), elevated surfaces (`#131926`), soft white text, a single vivid accent (electric indigo `#6366F1` → cyan `#22D3EE` gradient for CTAs and brand). Light mode available; dark by default.
- **Typography**: Geist Sans (UI) + Geist Mono (SKUs, numbers, code). Loaded via `@fontsource-variable/geist` + `@fontsource-variable/geist-mono`.
- **Motion**: subtle — fade+rise on section reveal, spring on cards, animated gradient orb on landing hero. No parallax circus.
- **Iconography**: Lucide throughout for consistency; generated hero/feature imagery for the landing page only.

## Screen Flow

```text
/                     Landing (public)
/login                Email + password
/register             Email prefilled if redirected from login
/app                  Redirects by role
  /app/dashboard      Role-aware overview
  /app/products       List, search, filter, paginate (admin + user)
  /app/products/:id   Detail view
  /app/products/new   Admin only
  /app/products/:id/edit  Admin only
  /app/categories     Admin only — category CRUD
  /app/profile        My profile (both roles)
```

Auth guard: `_authenticated` layout redirects to `/login` if no mock session. Admin-only routes gated by a nested layout that checks role.

## Landing Page Sections

1. Sticky nav — logo, Features, Pricing, Docs, Login, "Get started" CTA
2. Hero — headline, subhead, dual CTA, animated gradient + generated dashboard mockup image
3. Trust strip — fake but tasteful logo row
4. Feature grid (6 cards) — Realtime inventory, SKU tracking, Category org, Multi-warehouse, Role-based access, Powerful search
5. Product screenshot showcase — generated image of the app dashboard
6. How it works — 3 steps with icons
7. Stats band — "10k+ SKUs tracked", etc.
8. Pricing — 3 tiers (Starter / Growth / Enterprise)
9. FAQ — accordion
10. CTA band
11. Footer — 4 columns (Product, Company, Resources, Legal) + socials + newsletter

## Dashboards

**User dashboard**: welcome header, stat cards (Total products, Categories, Low stock, Recently updated), recent products table, quick search.

**Admin dashboard**: everything above + Add Product CTA, low-stock alert list, category breakdown chart (Recharts donut), recent activity feed.

**Products page (both roles)**: paginated table with SKU / name / category / price / stock / supplier / actions. Search bar (keyword), category filter dropdown, sort. Admins see bulk-select checkboxes with Delete / Export CSV / Import CSV actions and row-level Edit/Delete. Users see view-only.

**Product detail**: image, all fields, stock status badge, back button, Edit/Delete for admin.

**Product form (new/edit)**: name, SKU, category (select), price, stock qty, low-stock threshold, description, tags (chip input), supplier, warehouse location, image URL/upload preview. Zod validation.

**Categories (admin)**: list with product counts, inline create/rename/delete.

**Profile**: avatar, name, email (read-only), role badge, change-password form, sign out.

## Product Fields

`id, sku, name, description, category, price, stock, lowStockThreshold, tags[], supplier, warehouseLocation, imageUrl, createdAt, updatedAt`

## Mock Data Layer

`src/lib/api/` — one file per resource (`auth.ts`, `products.ts`, `categories.ts`, `profile.ts`) exposing async functions that mirror real REST endpoints. Backed by `src/lib/mock/store.ts` (in-memory + `localStorage` persistence) seeded with ~40 realistic products across 8 categories and 2 users (admin@nimbus.dev / user@nimbus.dev, password `password`). All calls artificially delay 250–500ms for realism. Swapping to a real backend = replace function bodies with `fetch()`.

TanStack Query wraps every call. Auth session stored in `localStorage` + Zustand-lite context; `_authenticated` route reads it in `beforeLoad`.

## Generated Imagery

Using `imagegen` (premium for hero, fast for the rest), saved under `src/assets/`:
- `hero-dashboard.png` — angled 3D render of the Nimbus dashboard UI
- `feature-inventory.jpg`, `feature-search.jpg`, `feature-roles.jpg` — abstract product shots
- `og-image.jpg` — social share card
- `logo.svg` — hand-authored inline SVG (nimbus cloud + box mark), not generated

## Technical Notes

- TanStack Start file-based routes under `src/routes/`
- Root `head()` sets real Nimbus title/description/OG tags
- Each route file sets its own `head()` (Features, Pricing, Login, etc.)
- shadcn: button, card, input, label, table, dialog, dropdown-menu, select, badge, tabs, accordion, avatar, checkbox, form, sonner (toasts), skeleton, pagination, sheet, sidebar (for app shell), chart
- Recharts for the category donut
- Zod + react-hook-form for all forms
- Sidebar layout for `/app/*` with collapsible nav, role-filtered items, user menu in footer

## Out of Scope (this pass)

Real backend, real file uploads (image field is URL only with preview), real payments on pricing page, email verification, password reset flow (UI stub only).