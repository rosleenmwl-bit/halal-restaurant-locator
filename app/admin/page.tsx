import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import RestaurantForm from "./restaurant-form";
import { deleteRestaurant } from "./actions";
import DeleteButton from "./delete-button";

export const revalidate = 0;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams;
  if (!(await isAdmin())) {
    return (
      <main className="admin-shell login">
        <Link href="/" className="brand">Sajda</Link>
        <div className="panel">
          <p className="eyebrow">Owner area</p>
          <h1>Welcome back.</h1>
          <p>Enter your private owner secret to manage the directory.</p>
          {params.error && <p className="form-error">That secret was not correct.</p>}
          <form action="/api/admin/login" method="post">
            <label>Owner secret<input type="password" name="secret" required autoFocus /></label>
            <button className="button">Open owner area</button>
          </form>
        </div>
      </main>
    );
  }

  const db = await createClient();
  const { data: restaurants } = await db.from("restaurants").select("*").order("created_at", { ascending: false });

  return (
    <main className="admin-shell">
      <nav><Link href="/" className="brand">Sajda</Link><Link href="/" className="admin-link">View public directory</Link></nav>
      <header className="admin-heading">
        <p className="eyebrow">Owner area</p>
        <h1>Curate the guide</h1>
        <p>Add a trusted place or keep an existing listing accurate.</p>
        {params.success && <div className="success">Restaurant {params.success} successfully.</div>}
      </header>
      <section className="admin-grid">
        <div className="panel"><h2>Add restaurant</h2><RestaurantForm /></div>
        <div>
          <h2>Published places</h2>
          <div className="admin-list">
            {restaurants?.map((r) => <article key={r.id}><div><strong>{r.name}</strong><p>{r.city}, {r.country}</p></div><div className="actions"><Link href={`/admin/${r.id}`}>Edit</Link><form action={deleteRestaurant}><input type="hidden" name="id" value={r.id} /><DeleteButton /></form></div></article>)}
          </div>
        </div>
      </section>
    </main>
  );
}
