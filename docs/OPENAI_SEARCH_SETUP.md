# OpenAI web search setup

HalalVoyage uses the OpenAI Responses API with the hosted `web_search` tool from the server-side `/api/discover` route.

## Required Vercel environment variable

- `OPENAI_API_KEY`

## Optional Vercel environment variable

- `OPENAI_SEARCH_MODEL` - defaults to `gpt-4.1-mini`.

## Runtime behavior

The app sends the visitor's city or food query to OpenAI from the server. It runs two live searches in parallel:

1. A dedicated, domain-filtered search across HalalLens (`halallens.no`), HalalTrip (`halaltrip.com`), and Zabihah (`zabihah.com`).
2. A broader web search that prioritizes halal-focused sources such as MyEHalal/JAKIM, Loka halal food pages, eHalal, official restaurant pages, and strong travel/food sources.

The results are normalized, merged, and de-duplicated into restaurant cards. Matches from the three dedicated directories are ordered first, and each live result shows the source used for verification.

The UI shows the results as HalalVoyage cards. Each live-search result links to a verification page so users can check the latest details before visiting.

Results are cached in memory for 12 hours per search query to improve speed and reduce API usage.

For Malaysian city searches, the route also keeps a broad fallback set of common halal-certified chains and city-specific halal-friendly options so the search page does not go blank if a live model response is delayed or malformed.
