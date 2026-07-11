"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Restaurant } from "@/lib/types";

export default function Directory({ restaurants, loadError }: { restaurants: Restaurant[]; loadError: boolean }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? restaurants.filter((r) => `${r.name} ${r.city} ${r.country}`.toLowerCase().includes(q)) : restaurants;
  }, [query, restaurants]);

  return (
    <main>
      <header className="hero">
        <nav>
          <Link href="/" className="brand">Sajda</Link>
          <Link href="/admin" className="admin-link">Owner area</Link>
        </nav>
        <div className="hero-inner">
          <p className="eyebrow">A trusted table, wherever you travel</p>
          <h1>Good food.<br /><em>Clear halal status.</em></h1>
          <p className="lede">A personally curated guide to memorable halal and Muslim-friendly restaurants around the world.</p>
          <label className="search">
            <span aria-hidden>Search</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a city or country" aria-label="Search by city or country" />
          </label>
        </div>
      </header>
      <section className="directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The directory</p>
            <h2>{query ? `Places matching "${query}"` : "Places worth a journey"}</h2>
          </div>
          <p>{filtered.length} {filtered.length === 1 ? "place" : "places"}</p>
        </div>
        {loadError ? <div className="message error">Could not load restaurants. Please try again.</div> : filtered.length === 0 ? <div className="message">No restaurants found. Try a different city.</div> : (
          <div className="grid">{filtered.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>
        )}
      </section>
      <footer><span className="brand">Sajda</span><p>Curated with care for Muslim travellers.</p></footer>
    </main>
  );
}

function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  return <Link href={`/restaurants/${r.id}`} className="card">
    <div className="card-image">{r.image_url ? <img src={r.image_url} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}<span className={`badge ${r.halal_status}`}>{r.halal_status === "halal-certified" ? "Halal certified" : "Muslim friendly"}</span></div>
    <div className="card-body"><div className="location">{r.city}, {r.country}</div><h3>{r.name}</h3><p className="dish">Try the {r.signature_dish || "house speciality"}</p><div className="meta"><span>Rating {r.average_rating ?? "New"}</span><span>{r.price_range || "Not priced"}</span></div></div>
  </Link>;
}
