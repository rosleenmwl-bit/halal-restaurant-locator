# OpenAI web search setup

HalalVoyage uses the OpenAI Responses API with the hosted `web_search` tool from the server-side `/api/discover` route.

## Required Vercel environment variable

- `OPENAI_API_KEY`

## Optional Vercel environment variable

- `OPENAI_SEARCH_MODEL` - defaults to `gpt-4.1-mini`.

## Runtime behavior

The app sends the visitor's city or food query to OpenAI from the server. OpenAI searches the live web, prioritizes halal-focused sources such as JAKIM, HalalTrip, eHalal, Zabihah, official restaurant pages, and strong travel/food sources, then returns normalized restaurant cards.

The UI shows the results as HalalVoyage cards. Each live-search result links to a verification page so users can check the latest details before visiting.

Results are cached in memory for 12 hours per search query to improve speed and reduce API usage.
