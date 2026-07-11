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
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const cache = new Map<string, { expiresAt: number; results: DiscoveryResult[] }>();

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
    return NextResponse.json(
      { results: [], message: error instanceof Error ? error.message : "Search failed." },
      { status: 502 },
    );
  }
}

async function searchWithOpenAI(query: string): Promise<DiscoveryResult[]> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SEARCH_MODEL || "gpt-4.1-mini",
      tools: [{ type: "web_search" }],
      tool_choice: "required",
      input: [
        {
          role: "system",
          content:
            "You are HalalVoyage's live halal food discovery engine. Search the web and return practical halal or Muslim-friendly restaurant options. Prioritize official halal directories, JAKIM/halal.gov.my for Malaysia, HalalTrip, eHalal, Zabihah, restaurant official pages, and strong travel/food sources. Do not include hotels, generic articles without restaurant names, job pages, PDFs, or duplicate locations.",
        },
        {
          role: "user",
          content: `Find halal food or Muslim-friendly restaurants for: ${query}.

Return only valid JSON in this exact shape:
{"results":[{"name":"Restaurant name","city":"City","country":"Country","halal_status":"halal-certified or muslim-friendly","signature_dish":"Dish or cuisine","price_range":"$, $$, $$$, or null","average_rating":null,"review_count":null,"description":"Short useful description under 170 characters","source_url":"Clickable URL used to verify this result"}]}

Return 8 to 18 results when possible. Every result must have a source_url. If the halal status is not official, use "muslim-friendly" and avoid overclaiming.`,
        },
      ],
    }),
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) throw new Error(data.error?.message || "OpenAI search request failed.");

  return parseResults(extractText(data), query).slice(0, 18);
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
  const jsonText = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(jsonText) as { results?: ModelResult[] };
  const seen = new Set<string>();

  return (parsed.results ?? [])
    .map((result) => normalizeResult(result, query))
    .filter((result): result is DiscoveryResult => Boolean(result))
    .filter((result) => {
      const key = `${result.name.toLowerCase()}|${result.external_url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeResult(result: ModelResult, query: string): DiscoveryResult | null {
  if (!result.name || !result.source_url) return null;

  return {
    id: `openai-${hash(`${result.name}-${result.source_url}`)}`,
    name: trimText(result.name, 70),
    city: trimText(result.city || inferCity(query), 50),
    country: trimText(result.country || "Search result", 50),
    halal_status: result.halal_status === "halal-certified" ? "halal-certified" : "muslim-friendly",
    signature_dish: trimNullable(result.signature_dish, 70),
    price_range: normalizePrice(result.price_range),
    average_rating: typeof result.average_rating === "number" ? result.average_rating : null,
    review_count: typeof result.review_count === "number" ? result.review_count : null,
    description: trimNullable(result.description, 170) || "Halal-friendly restaurant result found through live web search.",
    image_url: null,
    external_url: result.source_url,
  };
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

function hash(value: string) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output << 5) - output + value.charCodeAt(index);
    output |= 0;
  }
  return Math.abs(output).toString(36);
}
