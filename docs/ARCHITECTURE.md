# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database & Auth:** Supabase (Postgres + RLS + Auth)
- **Styling:** Tailwind CSS
- **Maps (later):** Mapbox GL JS

## What to Build Now vs Later
**Now:** restaurant directory, detail pages, search by city/country, owner admin CRUD 
**Next:** map view, cuisine/tag filters, photo galleries 
**Later:** visitor favourites, submission queue, AI halal-tagging, email digest

## Key User Action — Step-by-Step
1. Visitor lands on homepage → Next.js fetches `restaurants` rows from Supabase (server component)
2. Visitor types a city → client-side filter narrows cards in state
3. Visitor clicks a card → detail page fetched by restaurant `id` from Supabase
4. Owner visits `/admin` → env-var password check (Sprint 3), then lists all restaurants
5. Owner submits Add Restaurant form → POST to `/api/restaurants` → inserts row into Supabase → writes to `audit_logs` → revalidates the directory page cache
6. New restaurant appears live on the public directory without any rebuild

## Layer Plan
1. **Data first** — tables, seed rows, RLS policies, confirmed readable before any UI
2. **App logic** — directory page, detail page, admin CRUD all wired to live DB
3. **Smart features** — AI halal-confidence tagging added on top once core is stable

## Why Core Runs Without AI
All restaurant data (halal status, rating, price range, signature dish) is entered and curated manually by the owner. AI fields (`halal_status_confidence`, `halal_status_source`) are stored alongside the canonical value but are never required for the app to display or function.