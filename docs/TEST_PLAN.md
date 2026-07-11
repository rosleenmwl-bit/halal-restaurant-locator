# Test Plan

## v1 Success Scenario (manual)

### Step 1 — Directory loads
1. Open the live domain in an incognito browser
2. **Pass:** Restaurant cards load (name, city, halal badge, rating visible); no login prompt

### Step 2 — Search
1. Type "London" in the search box
2. **Pass:** Only London restaurants shown
3. Clear search
4. **Pass:** All restaurants return

### Step 3 — Detail page
1. Click any restaurant card
2. **Pass:** Detail page loads with name, address, signature dish, halal status badge, price range, description
3. Navigate back
4. **Pass:** Directory page still shows correctly (no blank state)

### Step 4 — Admin: Add restaurant
1. Visit `/admin` with correct secret
2. Click "Add Restaurant"
3. Fill in: name="Test Grill Dubai", city="Dubai", country="UAE", halal_status="halal-certified", signature_dish="Mixed Grill", price_range="££"
4. Submit
5. **Pass:** Redirected to admin list; "Test Grill Dubai" appears
6. Open public homepage in new tab
7. **Pass:** "Test Grill Dubai" visible in directory

### Step 5 — Admin: Edit restaurant
1. Click Edit on "Test Grill Dubai"
2. Change price_range to "£££"
3. Save
4. **Pass:** Detail page shows "£££"

### Step 6 — Admin: Delete restaurant
1. Click Delete on "Test Grill Dubai" → confirm prompt
2. **Pass:** Removed from admin list and public directory; Supabase row gone

---

## Empty & Error Cases

| Scenario | Expected |
|---|---|
| Search returns no matches | "No restaurants found — try a different city" message shown |
| Visiting `/restaurants/nonexistent-id` | Custom 404 page |
| Supabase unreachable on homepage load | Error banner: "Could not load restaurants. Please try again." |
| Admin form submitted with missing required field | Inline validation error on that field; no DB call made |
| Admin accessed without correct secret | 401 / redirect to homepage |
| Image URL broken on a card | Fallback placeholder image renders |