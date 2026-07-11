# Google Programmable Search setup

HalalVoyage uses Google Programmable Search from the server-side `/api/discover` route.

## Required Vercel environment variables

- `GOOGLE_SEARCH_API_KEY`
- `GOOGLE_SEARCH_ENGINE_ID`

## Setup steps

1. Open Google Programmable Search Engine and create a search engine.
2. Configure it to search the entire web, or include trusted halal domains such as:
   - `halal.gov.my`
   - `halaltrip.com`
   - `ehalal.io`
   - `zabihah.com`
3. Copy the Search Engine ID into `GOOGLE_SEARCH_ENGINE_ID`.
4. Create or reuse a Google API key with access to the Custom Search JSON API.
5. Add the key to `GOOGLE_SEARCH_API_KEY`.
6. Redeploy production after adding or changing either value.

## Runtime behavior

The app searches multiple halal-focused queries, normalizes Google results into restaurant cards, removes obvious non-restaurant pages, ranks trusted halal domains higher, and caches results for 12 hours.
