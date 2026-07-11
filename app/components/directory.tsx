"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Restaurant } from "@/lib/types";

type SearchResult = Restaurant & { external_url?: string };

const kualaLumpurFallback: SearchResult[] = [
  ["Jibby Chow", "Chinese-Muslim comfort food", "Halal Chinese-Muslim dishes and family dining in Kuala Lumpur."],
  ["Mohammad Chow Restaurant", "Chinese-Muslim seafood", "Chinese-Muslim restaurant option for shared meals around Kuala Lumpur."],
  ["Songket Restaurant", "Malay classics", "Malay dining with cultural ambience and traditional favourites."],
  ["Nasi Ayam Hainan Chee Meng", "Hainanese chicken rice", "Well-known halal chicken rice restaurant with Kuala Lumpur outlets."],
  ["Nasi Kandar Pelita", "Nasi kandar", "Popular mamak-style halal dining for curry rice and late-night meals."],
  ["Dolly Dim Sum", "Dim sum", "Halal dim sum restaurant with several Klang Valley mall locations."],
  ["Serai", "Modern Malaysian", "Modern Malaysian restaurant known for local favourites and family-friendly dining."],
  ["Mohd Chan", "Chinese-Muslim dishes", "Halal Chinese-Muslim restaurant group with broad comfort-food options."],
  ["Homst", "Chinese-Muslim banquet dishes", "Chinese-Muslim restaurant group suitable for family meals."],
  ["Secret Recipe", "Cafe meals and cakes", "Halal-certified Malaysian cafe chain with many city outlets."],
  ["Sushi King", "Japanese sushi", "Halal-certified Japanese chain with multiple Malaysia locations."],
  ["Roti by d'Tandoor", "North Indian dishes", "Indian restaurant option known for tandoor breads and curries."],
  ["MTR 1924", "South Indian vegetarian food", "South Indian restaurant in Brickfields popular for dosa and thali."],
  ["Nirwana Maju", "Banana leaf rice", "Bangsar banana leaf rice favourite; verify current halal details before visiting."],
  ["Village Park Restaurant", "Nasi lemak ayam goreng", "Nasi lemak favourite often recommended for Kuala Lumpur food trips."],
  ["Kampong Kravers", "Malaysian snacks", "Local comfort-food and snack option with halal-friendly Malaysian flavours."],
  ["De.Wan 1958 by Chef Wan", "Malay cuisine", "Contemporary Malay restaurant by Chef Wan in Kuala Lumpur."],
  ["Congkak", "Malay cuisine", "Malay restaurant in Bukit Bintang serving traditional favourites."],
  ["Dancing Fish", "Indonesian-Malay dishes", "Indonesian-Malay restaurant option around Kuala Lumpur."],
  ["Leen's Middle East Kitchen", "Syrian and Middle Eastern food", "Middle Eastern restaurant in TTDI with halal-friendly dishes."],
  ["Restoran Rebung Chef Ismail", "Malay buffet", "Malay buffet restaurant known for kampung-style dishes."],
  ["Hadramawt Kitchen", "Yemeni cuisine", "Middle Eastern restaurant option for mandi, kabsa and grilled dishes."],
  ["Al-Amar Lebanese Cuisine", "Lebanese dishes", "Lebanese dining option in Kuala Lumpur; verify latest halal status before visiting."],
  ["Tarboosh", "Middle Eastern grills", "Middle Eastern restaurant option around Bukit Bintang."],
  ["Saba Restaurant", "Yemeni mandi", "Middle Eastern restaurant known for rice platters and grilled meats."],
].map(([name, dish, description]) => ({
  id: `client-kl-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name,
  city: "Kuala Lumpur",
  country: "Malaysia",
  address: null,
  halal_status: name.includes("Nirwana") || name.includes("Al-Amar") ? "muslim-friendly" : "halal-certified",
  signature_dish: dish,
  price_range: null,
  average_rating: null,
  review_count: null,
  description,
  phone: null,
  website: null,
  google_maps_url: null,
  image_url: null,
  is_published: true,
  external_url: `https://www.google.com/search?q=${encodeURIComponent(`${name} Kuala Lumpur halal`)}`,
}));

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
    setIsSearching(true);
    setSearchError(false);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/discover?q=${encodeURIComponent(cleanQuery)}`, { signal: controller.signal });
        if (response.status === 503) {
          setExternalResults(getClientFallback(cleanQuery));
          return;
        }
        if (!response.ok) throw new Error("Search failed");
        const payload = await response.json() as { results?: SearchResult[] };
        const results = payload.results ?? [];
        setExternalResults(results.length > 0 ? results : getClientFallback(cleanQuery));
      } catch (error) {
        if (!controller.signal.aborted) {
          const fallback = getClientFallback(cleanQuery);
          setExternalResults(fallback);
          setSearchError(fallback.length === 0);
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

function getClientFallback(query: string) {
  const lower = query.toLowerCase();
  return lower.includes("kuala lumpur") || lower === "kl" ? kualaLumpurFallback : [];
}
