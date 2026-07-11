import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createClient();
  const { data } = await db.from("restaurants").select("name,city,signature_dish").eq("id", id).single();
  return data ? { title: `${data.name} - HalalVoyage`, description: `Discover ${data.signature_dish || "halal dining"} in ${data.city}.` } : {};
}

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createClient();
  const { data: r } = await db.from("restaurants").select("*").eq("id", id).eq("is_published", true).single();
  if (!r) notFound();

  return (
    <main className="detail-page">
      <nav><Link href="/" className="brand">HalalVoyage</Link><Link href="/" className="admin-link">Back to directory</Link></nav>
      <article className="detail">
        <div className="detail-image">{r.image_url && <img src={r.image_url} alt={`${r.name} restaurant`} />}</div>
        <div className="detail-copy">
          <span className={`badge ${r.halal_status}`}>{r.halal_status === "halal-certified" ? "Halal certified" : "Muslim friendly"}</span>
          <p className="eyebrow">{r.city}, {r.country}</p>
          <h1>{r.name}</h1>
          <p className="detail-description">{r.description}</p>
          <dl>
            <div><dt>Signature dish</dt><dd>{r.signature_dish || "Ask the chef"}</dd></div>
            <div><dt>Price</dt><dd>{r.price_range || "Not listed"}</dd></div>
            <div><dt>Rating</dt><dd>{r.average_rating ?? "New"} {r.review_count ? `(${r.review_count.toLocaleString()} reviews)` : ""}</dd></div>
            <div><dt>Address</dt><dd>{r.address || `${r.city}, ${r.country}`}</dd></div>
          </dl>
          {r.google_maps_url && <a className="button" href={r.google_maps_url} target="_blank" rel="noreferrer">Open in Google Maps</a>}
        </div>
      </article>
    </main>
  );
}
