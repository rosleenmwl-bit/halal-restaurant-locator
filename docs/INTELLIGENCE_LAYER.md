# Intelligence Layer

## Messy Inputs the Owner Provides
- Restaurant name and city (sometimes incomplete)
- Halal status as free text ("I think it's halal", "certified by JAKIM")
- No structured cuisine tag or price estimate

## Auto-Structure Schema (JSON example)
```json
{
  "restaurant_id": "uuid",
  "inferred_cuisine": "South Asian",
  "inferred_price_range": "££",
  "halal_status": "halal-certified",
  "halal_status_source": "owner-text-extraction",
  "halal_status_confidence": 0.82,
  "halal_status_review_status": "unreviewed"
}
```

## Events to Track
- Owner adds restaurant with free-text halal note
- Owner edits halal_status manually (overrides AI)
- Owner marks AI suggestion as reviewed

## Scoring Rules (v1 — rule-based)
- `halal-certified` if description contains "certified", "JAKIM", "HFA", "IFANCA" → confidence 0.90
- `muslim-friendly` if contains "no pork", "no alcohol" → confidence 0.75
- `unverified` otherwise → confidence 0.50

## What Gets Ranked
- Restaurants sorted by `average_rating` desc by default
- Later: personalised ranking by user's past saved cuisines

## v1 vs Later
- **v1:** Rule-based halal confidence scoring on save
- **Later:** LLM extraction from Google Maps reviews; auto-fetch certification from JAKIM/HFA APIs