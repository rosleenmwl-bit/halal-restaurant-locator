# Tasks & Sprints

## Sprint 1 — Database & Seed Data
**Goal:** Live Supabase schema with realistic demo rows; confirmed readable without login.

- [ ] Run migration SQL (cuisines, restaurants, audit_logs)
- [ ] Verify 5 seed restaurants readable via Supabase table editor
- [ ] Confirm RLS v1 open policies allow anonymous SELECT
- [ ] Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to Vercel env

**Definition of Done:** Supabase returns all 5 seed restaurants in a raw `select * from restaurants` query with no auth token.

---

## Sprint 2 — Restaurant Directory & Detail Pages ✦ v1 functional
**Goal:** Public-facing site works end-to-end against live data.

- [ ] Homepage: grid of restaurant cards (name, city, country, halal badge, price range, rating, signature dish, image)
- [ ] Search input filters cards by city or country (client-side)
- [ ] Empty state: "No restaurants found — try a different city"
- [ ] Loading skeleton on initial data fetch
- [ ] Error state if Supabase fetch fails
- [ ] Restaurant detail page `/restaurants/[id]`: all fields, halal status badge, Google Maps link
- [ ] 404 page if restaurant id not found
- [ ] Deploy to Vercel preview URL

**Definition of Done:** Visiting the live URL shows the 5 seed restaurants. Searching "London" shows only Dishoom. Clicking it shows the full detail page. Searching "xyz" shows the empty state. All confirmed against live DB, not mocked data.

---

## Sprint 3 — Owner Admin Panel
**Goal:** Owner can add, edit, and delete restaurants from a protected UI.

- [ ] `/admin` route: checks `ADMIN_SECRET` env var via server action or middleware
- [ ] Admin restaurant list with Edit and Delete buttons (no dead buttons)
- [ ] Add Restaurant form: all required fields, saves to `restaurants` + writes `audit_logs`
- [ ] Edit Restaurant form: pre-populated, updates row + audit_log
- [ ] Delete: confirmation prompt → hard delete + audit_log
- [ ] After any mutation, directory page cache revalidated (new restaurant appears live)
- [ ] Form validation: name, city, country, halal_status required
- [ ] Error state if save fails

**Definition of Done:** Owner adds a new restaurant via the form; it immediately appears on the public homepage. Owner edits the name; change reflects instantly. Owner deletes it; it's gone from the directory and confirmed absent in Supabase.

---

## Sprint 4 — Polish & Go-Live
**Goal:** Site is live on owner's custom domain and looks production-ready.

- [ ] Custom domain configured in Vercel
- [ ] `<title>` and OG meta tags on homepage and detail pages
- [ ] Mobile-responsive layout (cards stack on small screens)
- [ ] Favicon and site name in browser tab
- [ ] Global 404 and 500 error pages

**Definition of Done:** Site loads at custom domain. Sharing a restaurant URL on WhatsApp shows correct OG title and description. Layout is usable on iPhone 12 screen width.

---

## Sprint 5 — Map View & Filters
**Goal:** Visitors can explore restaurants on a map and filter by cuisine or halal type.

- [ ] Add `latitude` and `longitude` to restaurants table (migration)
- [ ] Cuisine filter chips on directory page
- [ ] Halal status filter (certified / muslim-friendly / all)
- [ ] Map view tab using Mapbox GL JS — pins at restaurant coordinates
- [ ] Clicking a pin opens restaurant card

**Definition of Done:** Switching to map view shows pinned restaurants. Selecting "Turkish" filter shows only Turkish restaurants in both list and map view.

---

## Sprint 6 — Lock It Down
**Goal:** Owner login secured; anonymous writes disabled; data is safe for long-term use.

- [ ] Enable Supabase Auth (email + password for owner only)
- [ ] Replace `ADMIN_SECRET` middleware with `supabase.auth.getUser()` check
- [ ] Update RLS write policies: `auth.uid() = user_id` on restaurants and cuisines
- [ ] Backfill `user_id` on existing owner-created rows
- [ ] Remove open write policies; keep open read policy for public directory
- [ ] Test: unauthenticated POST to `/api/restaurants` returns 401

**Definition of Done:** Signed-out user cannot create or modify restaurants (Supabase returns RLS error). Owner logs in, adds a restaurant, it appears publicly. Audit log row includes correct `user_id`.

---

## Gantt (Sprint → Feature)
```
Sprint 1  |████| DB schema + seed
Sprint 2  |████| Public directory + detail  ← v1 functional
Sprint 3  |████| Admin CRUD
Sprint 4  |████| Domain + polish
Sprint 5  |     ████| Map + filters
Sprint 6  |          ████| Auth + RLS lock-down
```