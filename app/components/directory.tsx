"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Restaurant } from "@/lib/types";
import { malaysiaFallbackResults } from "@/lib/malaysia-fallback";

type SearchResult = Restaurant & {
  external_url?: string;
  source_name?: string | null;
  google_rating_text?: string | null;
  location_name?: string | null;
};

type SearchPayload = {
  results?: SearchResult[];
  message?: string;
  needsConfiguration?: boolean;
  searchFailed?: boolean;
};

export default function Directory({ restaurants, loadError }: { restaurants: Restaurant[]; loadError: boolean }) {
  const [query, setQuery] = useState("");
  const [externalResults, setExternalResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const cleanQuery = query.trim();
  const hasQuery = cleanQuery.length > 0;

  useEffect(() => {
    if (!hasQuery) {
      setExternalResults([]);
      setIsSearching(false);
      setSearchMessage(null);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setSearchMessage(null);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/discover?q=${encodeURIComponent(cleanQuery)}`, { signal: controller.signal });
        const payload = await response.json() as SearchPayload;
        const fallback = getClientFallback(cleanQuery);
        if (response.status === 503) {
          setExternalResults(fallback);
          if (fallback.length === 0) {
            setSearchMessage(payload.needsConfiguration
              ? "Live search needs its server configuration. Please contact the site owner."
              : "Live search is temporarily unavailable. Please try again.");
          }
          return;
        }
        if (response.status === 429) {
          setExternalResults(fallback);
          if (fallback.length === 0) {
            setSearchMessage(payload.message || "You have reached the live-search limit. Please try again shortly.");
          }
          return;
        }
        if (!response.ok) throw new Error("Search failed");
        const results = payload.results ?? [];
        setExternalResults(results.length > 0 ? results : fallback);
        if (results.length === 0 && fallback.length === 0 && payload.searchFailed) {
          setSearchMessage(payload.message || "Live search could not complete this search. Please try again.");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          const fallback = getClientFallback(cleanQuery);
          setExternalResults(fallback);
          if (fallback.length === 0) {
            setSearchMessage("Live search is temporarily unavailable. Please try again.");
          }
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [cleanQuery, hasQuery]);

  const displayed = useMemo(() => hasQuery ? externalResults : restaurants, [externalResults, hasQuery, restaurants]);

  return (
    <main>
      <header className="hero">
        <nav>
          <Link href="/" className="brand">HalalVoyage</Link>
          <Link href="/admin" className="admin-link">Manage listings</Link>
        </nav>
        <div className="hero-inner">
          <h1><span>Explore Halal Restaurants</span><em>Discover Muslim-friendly restaurants</em></h1>
          <p className="lede">Search restaurant by city, country from fast food, local restaurants to fine dining, globally.</p>
          <label className="search">
            <span aria-hidden>Search</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Kuala Lumpur, Dubai, London..." aria-label="Search by city, country, restaurant, or dish" />
          </label>
          <p className="search-sources">Searching <a href="https://halallens.no/en/halal-restaurant" target="_blank" rel="noreferrer">HalalLens</a>, <a href="https://www.halaltrip.com/restaurant-search" target="_blank" rel="noreferrer">HalalTrip</a>, <a href="https://www.zabihah.com/" target="_blank" rel="noreferrer">Zabihah</a>, and the wider web.</p>
        </div>
      </header>
      <section className="directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{hasQuery ? "Live discovery" : "The directory"}</p>
            <h2>{hasQuery ? `Halal food matching "${query}"` : "Places worth a journey"}</h2>
          </div>
          <p>{isSearching ? "Searching..." : `${displayed.length} ${displayed.length === 1 ? "place" : "places"}`}</p>
        </div>
        {loadError && !hasQuery ? <div className="message error">Could not load restaurants. Please try again.</div> : searchMessage ? <div className="message error">{searchMessage}</div> : isSearching ? <div className="message">Searching halal food options...</div> : displayed.length === 0 ? <div className="message">No restaurants found — try a nearby city or different spelling.</div> : (
          <div className="grid">{displayed.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>
        )}
      </section>
      <footer><span className="brand">HalalVoyage</span><p>Curated with care for Muslim travellers.</p></footer>
    </main>
  );
}

function RestaurantCard({ restaurant: r }: { restaurant: SearchResult }) {
  const ratingLabel = getDisplayRatingLabel(r);
  const locationLabel = getLocationLabel(r);
  const imageUrl = r.image_url || getFoodImageUrl(r);
  const cardContent = <>
    <div className="card-image">{imageUrl ? <img src={imageUrl} alt={r.signature_dish ? `${r.signature_dish} food` : `${r.name} food`} onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}<span className={`badge ${r.halal_status}`}>{r.halal_status === "halal-certified" ? "Halal certified" : "Muslim friendly"}</span></div>
    <div className="card-body"><div className="location">{r.city}, {r.country}</div><h3>{r.name}</h3><p className="dish">{r.signature_dish || "House speciality"}</p><div className="meta"><span>{ratingLabel}</span><span>{locationLabel}</span></div>{r.external_url ? <div className="source-label">Source: {getSourceLabel(r)}</div> : null}</div>
  </>;

  if (r.external_url) {
    return <a href={r.external_url} className="card" target="_blank" rel="noreferrer">{cardContent}</a>;
  }

  return <Link href={`/restaurants/${r.id}`} className="card">{cardContent}</Link>;
}

function getSourceLabel(r: SearchResult) {
  if (cleanLabel(r.source_name)) return r.source_name;
  if (!r.external_url) return "Live web search";
  try {
    return new URL(r.external_url).hostname.replace(/^www\./, "");
  } catch {
    return "Live web search";
  }
}

function getClientFallback(query: string) {
  return malaysiaFallbackResults(query);
}

function getRatingLabel(r: SearchResult) {
  if (r.google_rating_text) return r.google_rating_text;
  if (typeof r.average_rating === "number") {
    const reviews = typeof r.review_count === "number" && r.review_count > 0 ? `, ${r.review_count.toLocaleString()} Google reviews` : "";
    return `${r.average_rating.toFixed(1)} ★${reviews}`;
  }
  return "Google rating";
}
function getDisplayRatingLabel(r: SearchResult) {
  const ratingText = cleanLabel(r.google_rating_text)?.replace(/,\s*[\d,]+\+?\s*Google reviews?/i, "").replace(/\s*Google reviews?/i, "");
  if (ratingText) return ratingText;
  if (typeof r.average_rating === "number") return `${r.average_rating.toFixed(1)} ★`;
  return "Check rating";
}

function getLocationLabel(r: SearchResult) {
  const location = cleanLabel(r.location_name) || cleanLabel(r.address?.split(",")[0]) || cleanLabel(r.google_maps_url ? "Map location" : null);
  return location || r.city || "Location";
}

function getFoodImageUrl(r: SearchResult) {
  const terms = [r.signature_dish, r.name, "halal food"].filter(Boolean).join(",");
  return `https://source.unsplash.com/600x420/?${encodeURIComponent(terms)}`;
}

function cleanLabel(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || /^(null|undefined|n\/a|none|unknown)$/i.test(trimmed)) return null;
  return trimmed;
}
