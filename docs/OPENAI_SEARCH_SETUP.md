# OpenAI web search setup

HalalVoyage uses the OpenAI Responses API with the hosted `web_search` tool from the server-side `/api/discover` route.

## Required Vercel environment variables

- `OPENAI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` - server-only database access for protected search caching and rate limiting.

## Optional Vercel environment variable

- `OPENAI_SEARCH_MODEL` - defaults to `gpt-4.1-mini`.
- `RATE_LIMIT_SALT` - hashes visitor network addresses before storage. When omitted, the existing `ADMIN_SECRET` is used.

## Runtime behavior

The app sends the visitor's city or food query to OpenAI from the server. It runs two live searches in parallel:

1. A dedicated search that asks for HalalLens (`halallens.no`), HalalTrip (`halaltrip.com`), and Zabihah (`zabihah.com`) listings, then validates that returned source URLs belong to those domains.
2. A broader web search that prioritizes halal-focused sources such as MyEHalal/JAKIM, Loka halal food pages, eHalal, official restaurant pages, and strong travel/food sources.

The results are normalized, merged, and de-duplicated into restaurant cards. Matches from the three dedicated directories are ordered first, and each live result shows the source used for verification.

The preferred-source search intentionally avoids the web tool's `filters.allowed_domains` parameter because the configured `gpt-4.1-mini` model rejects that parameter. Source validation after retrieval preserves compatibility while preventing unrelated URLs from entering the preferred-source group.

Both search passes use the Responses API's strict JSON Schema output format. This keeps larger city result sets valid and parseable instead of relying on the model to follow a JSON-only prompt perfectly.

The UI shows the results as HalalVoyage cards. Each live-search result links to a verification page so users can check the latest details before visiting.

Results are cached in memory for 12 hours and saved in the protected Supabase `search_cache` table for seven days. A repeated search can therefore return saved results across visitors and server restarts without another OpenAI call. Expired entries are refreshed and replaced so restaurant information does not remain stale indefinitely.

Each visitor may make up to 60 total search requests and start up to 10 uncached live searches per 10-minute window. Cached searches do not count against the stricter live-search allowance. Visitor network addresses are salted and hashed before the rate counters are stored, and neither protection table is accessible through the public Supabase key.

For Malaysian city searches, the route also keeps a broad fallback set of common halal-certified chains and city-specific halal-friendly options so the search page does not go blank if a live model response is delayed or malformed.
