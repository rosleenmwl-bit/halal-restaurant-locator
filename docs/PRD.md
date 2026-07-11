# Product Requirements — Halal Restaurant Locator

## Problem
Muslim travellers and locals have no single personal, owner-controlled directory to find halal or Muslim-friendly restaurants in any city worldwide — including abroad. Existing platforms are cluttered, unreliable on halal status, and owned by third parties.

## Target User
Muslim individuals and families — the owner, their network, and international travellers — looking for trustworthy halal dining options in an unfamiliar city.

## Core Objects
| Object | Purpose |
|---|---|
| `restaurant` | A halal or Muslim-friendly dining venue |
| `cuisine` | Cuisine category (Middle Eastern, South Asian, Turkish…) |
| `audit_log` | Record of every create/edit/delete action |

## MVP Must-Haves (v1 checklist)
- [ ] Directory page listing restaurants with city, country, halal status, signature dish, price range, and rating
- [ ] Search/filter by city or country
- [ ] Restaurant detail page with full information
- [ ] Visible to any visitor — no login required
- [ ] Owner admin panel to add, edit, and delete restaurant entries
- [ ] Seed data: at least 5 real-looking restaurants across different countries

## Non-Goals (v1)
- Visitor accounts, reviews, or ratings submission
- Map view (next sprint)
- Mobile app
- Multi-owner or SaaS mode
- Automated scraping or AI halal detection (later)

## Success Criteria
**End-to-end scenario:** The owner opens the live domain, sees a directory of halal restaurants in Kuala Lumpur and London, clicks one card, reads the full detail page including signature dish and halal certification status, then logs into /admin and adds a new restaurant in Dubai — which immediately appears on the public directory. All steps pass without errors, and the new row is confirmed in the database.