import { NextResponse } from "next/server";

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
};

type GoogleSearchItem = {
  title?: string;
  link?: string;
  snippet?: string;
  pagemap?: {
    cse_thumbnail?: Array<{ src?: string }>;
    metatags?: Array<Record<string, string>>;
  };
};

type GoogleSearchResponse = {
  items?: GoogleSearchItem[];
  error?: { message?: string };
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const cache = new Map<string, { expiresAt: number; results: DiscoveryResult[] }>();

const sourceQueries = [
  (query: string) => `site:halal.gov.my ${query} halal restaurant`,
  (query: string) => `site:halaltrip.com ${query} halal restaurant`,
  (query: string) => `site:ehalal.io ${query} halal restaurant`,
  (query: string) => `site:zabihah.com ${query} halal restaurant`,
  (query: string) => `${query} halal restaurant certified Muslim friendly`,
];

const restaurantWords = [
  "restaurant",
  "cafe",
  "food",
  "dining",
  "kitchen",
  "halal",
  "makan",
  "nasi",
  "biryani",
  "grill",
  "steak",
  "seafood",
  "dim sum",
  "sushi",
  "bakery",
];

const blockedWords = [
  "hotel booking",
  "flight",
  "job",
  "career",
  "pdf",
  "login",
  "privacy policy",
  "terms",
];

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

  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    return NextResponse.json(
      {
        results: [],
        needsConfiguration: true,
        message: "Live search is ready but needs GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID.",
      },
      { status: 503 },
    );
  }

  try {
    const batches = await Promise.all(sourceQueries.map((buildQuery) => googleSearch(buildQuery(query))));
    const results = normalizeResults(batches.flat(), query).slice(0, 18);
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, results });
    return NextResponse.json({ results, cached: false });
  } catch (error) {
    return NextResponse.json(
      { results: [], message: error instanceof Error ? error.message : "Search failed." },
      { status: 502 },
    );
  }
}

async function googleSearch(query: string): Promise<GoogleSearchItem[]> {
  const url = new URL("https://customsearch.googleapis.com/customsearch/v1");
  url.searchParams.set("key", process.env.GOOGLE_SEARCH_API_KEY!);
  url.searchParams.set("cx", process.env.GOOGLE_SEARCH_ENGINE_ID!);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "10");
  url.searchParams.set("safe", "active");
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", countryBoost(query));

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 12 } });
  const data = await response.json() as GoogleSearchResponse;
  if (!response.ok) throw new Error(data.error?.message || "Google search request failed.");
  return data.items ?? [];
}

function normalizeResults(items: GoogleSearchItem[], query: string): DiscoveryResult[] {
  const seen = new Set<string>();
  const cleaned = items
    .filter((item) => item.title && item.link)
    .filter((item) => looksUseful(item))
    .map((item) => toDiscoveryResult(item, query))
    .filter((result) => {
      const key = `${result.name.toLowerCase()}|${result.external_url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => scoreResult(b, query) - scoreResult(a, query));

  return cleaned;
}

function looksUseful(item: GoogleSearchItem) {
  const text = `${item.title || ""} ${item.snippet || ""} ${item.link || ""}`.toLowerCase();
  if (blockedWords.some((word) => text.includes(word))) return false;
  return restaurantWords.some((word) => text.includes(word));
}

function toDiscoveryResult(item: GoogleSearchItem, query: string): DiscoveryResult {
  const name = cleanTitle(item.title || "Halal food result");
  const location = inferLocation(query, item);
  const description = trimText(item.snippet || "Halal-friendly food result found through live web discovery.", 170);
  const image = item.pagemap?.cse_thumbnail?.[0]?.src || item.pagemap?.metatags?.[0]?.["og:image"] || null;

  return {
    id: `google-${hash(`${name}-${item.link}`)}`,
    name,
    city: location.city,
    country: location.country,
    halal_status: "muslim-friendly",
    signature_dish: inferDish(description),
    price_range: null,
    average_rating: null,
    review_count: null,
    description,
    image_url: image,
    external_url: item.link!,
  };
}

function cleanTitle(title: string) {
  return trimText(title.replace(/\s[-|–].*$/u, "").replace(/\s+/g, " ").trim(), 70);
}

function inferLocation(query: string, item: GoogleSearchItem) {
  const text = `${query} ${item.title || ""} ${item.snippet || ""}`.toLowerCase();
  if (text.includes("kuala lumpur") || text.includes("kl ")) return { city: "Kuala Lumpur", country: "Malaysia" };
  if (text.includes("dubai")) return { city: "Dubai", country: "United Arab Emirates" };
  if (text.includes("london")) return { city: "London", country: "United Kingdom" };
  if (text.includes("singapore")) return { city: "Singapore", country: "Singapore" };
  if (text.includes("tokyo")) return { city: "Tokyo", country: "Japan" };
  if (text.includes("seoul")) return { city: "Seoul", country: "South Korea" };
  if (text.includes("paris")) return { city: "Paris", country: "France" };
  return { city: titleCase(query), country: "Search result" };
}

function inferDish(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("nasi lemak")) return "Nasi lemak";
  if (lower.includes("nasi kandar")) return "Nasi kandar";
  if (lower.includes("biryani")) return "Biryani";
  if (lower.includes("dim sum")) return "Dim sum";
  if (lower.includes("sushi")) return "Sushi";
  if (lower.includes("grill")) return "Grilled dishes";
  return "Halal-friendly food";
}

function scoreResult(result: DiscoveryResult, query: string) {
  const text = `${result.name} ${result.city} ${result.country} ${result.description} ${result.external_url}`.toLowerCase();
  let score = 0;
  for (const word of query.toLowerCase().split(/\s+/)) if (text.includes(word)) score += 3;
  if (text.includes("halal")) score += 6;
  if (text.includes("restaurant")) score += 4;
  if (text.includes("halal.gov.my")) score += 8;
  if (text.includes("halaltrip.com")) score += 7;
  if (text.includes("zabihah.com")) score += 7;
  if (text.includes("ehalal.io")) score += 6;
  return score;
}

function countryBoost(query: string) {
  const lower = query.toLowerCase();
  if (lower.includes("kuala lumpur") || lower.includes("malaysia")) return "my";
  if (lower.includes("dubai")) return "ae";
  if (lower.includes("london")) return "gb";
  if (lower.includes("singapore")) return "sg";
  if (lower.includes("tokyo")) return "jp";
  if (lower.includes("seoul")) return "kr";
  if (lower.includes("paris")) return "fr";
  return "my";
}

function trimText(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1).trim()}...` : value;
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`);
}

function hash(value: string) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output << 5) - output + value.charCodeAt(index);
    output |= 0;
  }
  return Math.abs(output).toString(36);
}
