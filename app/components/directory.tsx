"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Restaurant } from "@/lib/types";

const trustedSources = [
  { name: "JAKIM Halal Directory", href: "https://www.halal.gov.my/v4/directory/index.php", description: "Official Malaysia halal certification directory." },
  { name: "HalalTrip", href: "https://www.halaltrip.com/restaurant-search/", description: "Travel-focused halal restaurant and mosque discovery." },
  { name: "eHalal.io", href: "https://ehalal.io/", description: "Global halal food, travel, certification, and marketplace platform." },
  { name: "Zabihah", href: "https://www.zabihah.com/", description: "Community halal restaurant discovery with global coverage." },
];

export default function Directory({ restaurants, loadError }: { restaurants: Restaurant[]; loadError: boolean }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) =>
      [r.name, r.city, r.country, r.address, r.description, r.signature_dish, r.halal_status].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [query, restaurants]);
  const hasQuery = query.trim().length > 0;

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
          <p className="lede">A curated guide to memorable halal and Muslim-friendly restaurants, with quick links to trusted halal directories for deeper city searches.</p>
          <label className="search">
            <span aria-hidden>Search</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a city, country, restaurant, or dish" aria-label="Search by city, country, restaurant, or dish" />
          </label>
        </div>
      </header>
      <section className="directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The directory</p>
            <h2>{hasQuery ? `Places matching "${query}"` : "Places worth a journey"}</h2>
          </div>
          <p>{filtered.length} {filtered.length === 1 ? "place" : "places"}</p>
        </div>
        {loadError ? <div className="message error">Could not load restaurants. Please try again.</div> : filtered.length === 0 ? <div className="message">No curated listings found yet. Check the trusted sources below for a wider city search.</div> : (
          <div className="grid">{filtered.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>
        )}
        <TrustedSourcePanel query={query} hasQuery={hasQuery} />
      </section>
      <footer><span className="brand">HalalVoyage</span><p>Curated with care for Muslim travellers.</p></footer>
    </main>
  );
}

function TrustedSourcePanel({ query, hasQuery }: { query: string; hasQuery: boolean }) {
  const encodedQuery = encodeURIComponent(query.trim());
  return (
    <aside className="source-panel">
      <div>
        <p className="eyebrow">Broaden your search</p>
        <h2>{hasQuery ? `Check trusted directories for ${query}` : "Search beyond this curated list"}</h2>
        <p>HalalVoyage shows restaurants that have been added to this directory. For a fuller city sweep, continue with official or specialist halal sources.</p>
      </div>
      <div className="source-grid">
        {trustedSources.map((source) => {
          const href = hasQuery && source.name !== "JAKIM Halal Directory" ? `${source.href}?s=${encodedQuery}` : source.href;
          return <a key={source.name} href={href} target="_blank" rel="noreferrer"><strong>{source.name}</strong><span>{source.description}</span></a>;
        })}
      </div>
    </aside>
  );
}

function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  return <Link href={`/restaurants/${r.id}`} className="card">
    <div className="card-image">{r.image_url ? <img src={r.image_url} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}<span className={`badge ${r.halal_status}`}>{r.halal_status === "halal-certified" ? "Halal certified" : "Muslim friendly"}</span></div>
    <div className="card-body"><div className="location">{r.city}, {r.country}</div><h3>{r.name}</h3><p className="dish">Try the {r.signature_dish || "house speciality"}</p><div className="meta"><span>Rating {r.average_rating ?? "New"}</span><span>{r.price_range || "Not priced"}</span></div></div>
  </Link>;
}
