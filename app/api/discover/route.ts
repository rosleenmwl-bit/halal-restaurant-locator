import { NextResponse } from "next/server";
import { malaysiaFallbackResults } from "@/lib/malaysia-fallback";

type DiscoveryResult = {
  id: string;
  name: string;
  city: string;
  country: string;
  halal_status: string;
  signature_dish: string | null;
  price_range: string | null;
  average_rating: number | null;
  review_count: number | null;
  description: string | null;
  image_url: string | null;
  external_url: string;
  source_name: string;
  google_rating_text: string | null;
  location_name: string | null;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  error?: { message?: string };
};

type ModelResult = {
  name?: string;
  city?: string;
  country?: string;
  halal_status?: string;
  signature_dish?: string | null;
  price_range?: string | null;
  average_rating?: number | null;
  review_count?: number | null;
  description?: string | null;
  source_url?: string;
  google_rating?: number | null;
  google_review_count?: number | null;
  google_rating_text?: string | null;
  location_name?: string | null;
  image_url?: string | null;
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const MIN_RESULTS_BEFORE_EXPANSION = 8;
const cache = new Map<string, { expiresAt: number; results: DiscoveryResult[] }>();
const PREFERRED_SOURCE_DOMAINS = ["halallens.no", "halaltrip.com", "zabihah.com"];
type SearchScope = "preferred" | "broad" | "expanded";
const nullableString = { anyOf: [{ type: "string" }, { type: "null" }] };
const nullableNumber = { anyOf: [{ type: "number" }, { type: "null" }] };
const RESTAURANT_RESULTS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          city: { type: "string" },
          country: { type: "string" },
          halal_status: { type: "string", enum: ["halal-certified", "muslim-friendly"] },
          signature_dish: nullableString,
          price_range: { anyOf: [{ type: "string", enum: ["$", "$$", "$$$"] }, { type: "null" }] },
          average_rating: nullableNumber,
          review_count: nullableNumber,
          google_rating: nullableNumber,
          google_review_count: nullableNumber,
          google_rating_text: nullableString,
          location_name: nullableString,
          image_url: nullableString,
          description: nullableString,
          source_url: { type: "string" },
        },
        required: [
          "name",
          "city",
          "country",
          "halal_status",
          "signature_dish",
          "price_range",
          "average_rating",
          "review_count",
          "google_rating",
          "google_review_count",
          "google_rating_text",
          "location_name",
          "image_url",
          "description",
          "source_url",
        ],
      },
    },
  },
  required: ["results"],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q")?.trim() || "";
  const query = rawQuery.slice(0, 80);

  if (query.length < 2) return NextResponse.json({ results: [] });

  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ results: cached.results, cached: true });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        results: [],
        needsConfiguration: true,
        message: "Live search is ready but needs OPENAI_API_KEY.",
      },
      { status: 503 },
    );
  }

  try {
    const results = await searchWithOpenAI(query);
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, results });
    return NextResponse.json({ results, cached: false });
  } catch (error) {
    const fallback = fallbackResults(query);
    if (fallback.length > 0) {
      cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, results: fallback });
      return NextResponse.json({ results: fallback, cached: false, fallback: true });
    }
    console.error("Live restaurant search failed:", error);
    return NextResponse.json(
      {
        results: [],
        searchFailed: true,
        message: "Live search could not complete this search. Please try again.",
      },
      { status: 200 },
    );
  }
}

async function searchWithOpenAI(query: string): Promise<DiscoveryResult[]> {
  const [preferredSearch, broadSearch] = await Promise.allSettled([
    searchOpenAIScope(query, "preferred"),
    searchOpenAIScope(query),
  ]);

  const preferredResults = preferredSearch.status === "fulfilled" ? preferredSearch.value : [];
  const broadResults = broadSearch.status === "fulfilled" ? broadSearch.value : [];
  let results = mergeResults(preferredResults, broadResults, fallbackResults(query));

  if (results.length < MIN_RESULTS_BEFORE_EXPANSION) {
    try {
      const expandedResults = await searchOpenAIScope(query, "expanded");
      results = mergeResults(results, expandedResults);
    } catch (error) {
      if (preferredSearch.status === "rejected" && broadSearch.status === "rejected") {
        throw error;
      }
      console.warn(`Expanded restaurant search failed for ${query}:`, error);
    }
  }

  if (results.length === 0 && preferredSearch.status === "rejected" && broadSearch.status === "rejected") {
    throw broadSearch.reason instanceof Error
      ? broadSearch.reason
      : new Error("OpenAI search request failed.");
  }

  return results.slice(0, 30);
}

async function searchOpenAIScope(query: string, scope: SearchScope = "broad"): Promise<DiscoveryResult[]> {
  const sourceInstruction = scope === "preferred"
    ? "Search specifically within HalalLens (halallens.no), HalalTrip (halaltrip.com), and Zabihah (zabihah.com), using site-specific searches when useful. Only return listings whose source_url is from one of those three domains. Use the most specific restaurant or search-result page as source_url. Return an empty results array when none of them has a relevant listing."
    : scope === "expanded"
      ? "Run an expanded recovery search because earlier searches may have found too few venues. Use several query variations: the city plus halal restaurant, Muslim-owned restaurant, halal certification, neighbourhood names, and the equivalent terms in the country's main local language or languages. Search official halal authorities and tourism sites, restaurant websites, local food guides, HalalLens, HalalTrip, and Zabihah. Return distinct named restaurants with evidence; never pad the list with generic articles or unverified venues."
      : "Search the broader web. Prioritize official halal-certification portals, official restaurant pages, and strong halal travel or food directories. Do not duplicate the dedicated HalalLens, HalalTrip, and Zabihah search when other useful sources are available.";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SEARCH_MODEL || "gpt-4.1-mini",
      max_output_tokens: 12000,
      tools: [{
        type: "web_search",
        search_context_size: scope === "broad" ? "medium" : "high",
      }],
      tool_choice: "required",
      text: {
        format: {
          type: "json_schema",
          name: "halal_restaurant_results",
          description: "A normalized list of halal or Muslim-friendly restaurant search results.",
          strict: true,
          schema: RESTAURANT_RESULTS_SCHEMA,
        },
      },
      input: [
        {
          role: "system",
          content:
            `You are HalalVoyage's live halal food discovery engine. Search the web and return practical halal or Muslim-friendly restaurant options. ${sourceInstruction} For Malaysian cities, search with terms such as halal restaurant, JAKIM, sijil halal, restoran halal, and makanan halal. Do not include hotels, generic articles without restaurant names, job pages, PDFs, or duplicate locations.`,
        },
        {
          role: "user",
          content: `Find halal food or Muslim-friendly restaurants for: ${query}.

Return only valid JSON in this exact shape:
{"results":[{"name":"Restaurant name","city":"City","country":"Country","halal_status":"halal-certified or muslim-friendly","signature_dish":"Dish or cuisine","price_range":"$, $$, $$$, or null","average_rating":null,"review_count":null,"google_rating":4.3,"google_review_count":null,"google_rating_text":"4.3 ★ or null","location_name":"Specific street, neighbourhood, mall, or area name or null","image_url":"Direct food image URL that matches the signature dish or null","description":"Short useful description under 170 characters","source_url":"Clickable URL used to verify this result"}]}

Return up to 20 results when possible. Every result must have a source_url from a page you actually used. Use Google-visible customer ratings when available, but do not include review counts in google_rating_text. Extract a useful local place label such as street, neighbourhood, mall, or district; do not repeat the city as the location_name unless no smaller location is available. Find a representative food image URL that matches the signature_dish when available. If the halal status is not official, use "muslim-friendly" and avoid overclaiming. Include a varied mix of local, Chinese-Muslim, Indian-Muslim, Middle Eastern, cafes, family restaurants, and relevant regional specialities.`,
        },
      ],
    }),
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) throw new Error(data.error?.message || "OpenAI search request failed.");

  const results = parseResults(extractText(data), query);
  return scope === "preferred"
    ? results.filter((result) => isPreferredSource(result.external_url))
    : results;
}

function isPreferredSource(value: string) {
  const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  return PREFERRED_SOURCE_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

function extractText(data: OpenAIResponse) {
  if (data.output_text) return data.output_text;
  return (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" && content.text)
    .map((content) => content.text)
    .join("\n");
}

function parseResults(text: string, query: string): DiscoveryResult[] {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? trimmed.slice(firstBrace, lastBrace + 1) : trimmed;
  const parsed = JSON.parse(jsonText) as { results?: ModelResult[] };

  return (parsed.results ?? [])
    .map((result) => normalizeResult(result, query))
    .filter((result): result is DiscoveryResult => Boolean(result));
}

function normalizeResult(result: ModelResult, query: string): DiscoveryResult | null {
  if (!result.name || !result.source_url) return null;
  const externalUrl = normalizeExternalUrl(result.source_url);
  if (!externalUrl) return null;

  return {
    id: `openai-${hash(`${result.name}-${externalUrl}`)}`,
    name: trimText(result.name, 70),
    city: trimText(result.city || inferCity(query), 50),
    country: trimText(result.country || "Search result", 50),
    halal_status: result.halal_status === "halal-certified" ? "halal-certified" : "muslim-friendly",
    signature_dish: trimNullable(result.signature_dish, 70),
    price_range: normalizePrice(result.price_range),
    average_rating: typeof result.average_rating === "number" ? result.average_rating : typeof result.google_rating === "number" ? result.google_rating : null,
    review_count: typeof result.review_count === "number" ? result.review_count : typeof result.google_review_count === "number" ? result.google_review_count : null,
    description: trimNullable(result.description, 170) || "Halal-friendly restaurant result found through live web search.",
    image_url: normalizeImageUrl(result.image_url) || buildFoodImageUrl(result.signature_dish || result.name),
    external_url: externalUrl,
    source_name: getSourceName(externalUrl),
    google_rating_text: normalizeRatingText(result),
    location_name: normalizeLocationName(result.location_name, result.city || inferCity(query)),
  };
}

function normalizeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function getSourceName(value: string) {
  const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  if (hostname === "halallens.no" || hostname.endsWith(".halallens.no")) return "HalalLens";
  if (hostname === "halaltrip.com" || hostname.endsWith(".halaltrip.com")) return "HalalTrip";
  if (hostname === "zabihah.com" || hostname.endsWith(".zabihah.com")) return "Zabihah";
  if (hostname.includes("halal.gov.my")) return "JAKIM / MyEHalal";
  return hostname;
}

function normalizeRatingText(result: ModelResult) {
  const explicit = cleanNullable(result.google_rating_text);
  if (explicit) return trimText(stripReviewCounts(explicit), 20);
  const rating = typeof result.google_rating === "number" ? result.google_rating : typeof result.average_rating === "number" ? result.average_rating : null;
  if (rating === null) return null;
  return `${rating.toFixed(1)} ★`;
}

function stripReviewCounts(value: string) {
  return value.replace(/,\s*[\d,]+\+?\s*Google reviews?/i, "").replace(/\s*Google reviews?/i, "").trim();
}

function normalizeLocationName(value: string | null | undefined, city: string) {
  const cleaned = cleanNullable(value);
  if (!cleaned) return null;
  if (cleaned.toLowerCase() === city.toLowerCase()) return null;
  return trimText(cleaned, 60);
}

function normalizeImageUrl(value: string | null | undefined) {
  const cleaned = cleanNullable(value);
  if (!cleaned || !/^https?:\/\//i.test(cleaned)) return null;
  return trimText(cleaned, 350);
}

function cleanNullable(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || /^(null|undefined|n\/a|none|unknown)$/i.test(trimmed)) return null;
  return trimmed;
}

function buildFoodImageUrl(food: string | null | undefined) {
  return `https://source.unsplash.com/600x420/?${encodeURIComponent(`${food || "halal food"},food`)}`;
}

function normalizePrice(value: string | null | undefined) {
  if (value === "$" || value === "$$" || value === "$$$") return value;
  return null;
}

function trimNullable(value: string | null | undefined, max: number) {
  return value ? trimText(value, max) : null;
}

function trimText(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1).trim()}...` : value;
}

function inferCity(query: string) {
  return query.replace(/\w\S*/g, (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`);
}

function mergeResults(...groups: DiscoveryResult[][]) {
  const seen = new Set<string>();
  return groups.flat().filter((result) => {
    const key = result.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function fallbackResults(query: string): DiscoveryResult[] {
  return malaysiaFallbackResults(query);
}

function hash(value: string) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output << 5) - output + value.charCodeAt(index);
    output |= 0;
  }
  return Math.abs(output).toString(36);
}
