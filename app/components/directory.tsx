"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Restaurant } from "@/lib/types";

type SearchResult = Restaurant & { external_url?: string };

export default function Directory({ restaurants, loadError }: { restaurants: Restaurant[]; loadError: boolean }) {
  const [query, setQuery] = useState("");
  const [externalResults, setExternalResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const cleanQuery = query.trim();
  const hasQuery = cleanQuery.length > 0;

  useEffect(() => {
    if (!hasQuery) {
      setExternalResults([]);
      setIsSearching(false);
      setSearchError(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(false);
      try {
        const response = await fetch(`/api/discover?q=${encodeURIComponent(cleanQuery)}`, { signal: controller.signal });
        if (response.status === 503) {
          setExternalResults([]);
          return;
        }
        if (!response.ok) throw new Error("Search failed");
        const payload = await response.json() as { results?: SearchResult[] };
        setExternalResults(payload.results ?? []);
      } catch (error) {
        if (!controller.signal.aborted) setSearchError(true);
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
          <p className="eyebrow">A trusted table, wherever you travel</p>
          <h1>Good food.<br /><em>Clear halal status.</em></h1>
          <p className="lede">Search halal-friendly places by city, country, restaurant, or dish and get a broader discovery set beyond the saved directory.</p>
          <label className="search">
            <span aria-hidden>Search</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Kuala Lumpur, Dubai, London..." aria-label="Search by city, country, restaurant, or dish" />
          </label>
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
        {loadError && !hasQuery ? <div className="message error">Could not load restaurants. Please try again.</div> : searchError ? <div className="message error">Search is taking longer than expected. Please try again.</div> : isSearching ? <div className="message">Searching halal food options...</div> : displayed.length === 0 ? <div className="message">Live search is ready. Add the OpenAI API key in Vercel to show broad halal results for any city.</div> : (
          <div className="grid">{displayed.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>
        )}
      </section>
      <footer><span className="brand">HalalVoyage</span><p>Curated with care for Muslim travellers.</p></footer>
    </main>
  );
}

function RestaurantCard({ restaurant: r }: { restaurant: SearchResult }) {
  const cardContent = <>
    <div className="card-image">{r.image_url ? <img src={r.image_url} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}<span className={`badge ${r.halal_status}`}>{r.halal_status === "halal-certified" ? "Halal certified" : "Muslim friendly"}</span></div>
    <div className="card-body"><div className="location">{r.city}, {r.country}</div><h3>{r.name}</h3><p className="dish">Try the {r.signature_dish || "house speciality"}</p><div className="meta"><span>{r.external_url ? "Verify details" : `Rating ${r.average_rating ?? "New"}`}</span><span>{r.price_range || "Not priced"}</span></div></div>
  </>;

  if (r.external_url) {
    return <a href={r.external_url} className="card" target="_blank" rel="noreferrer">{cardContent}</a>;
  }

  return <Link href={`/restaurants/${r.id}`} className="card">{cardContent}</Link>;
}
