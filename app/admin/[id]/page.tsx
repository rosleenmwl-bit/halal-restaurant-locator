import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import RestaurantForm from "../restaurant-form";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  const db = await createClient();
  const { data } = await db.from("restaurants").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <main className="admin-shell">
      <nav><Link href="/" className="brand">Sajda</Link><Link href="/admin" className="admin-link">Back to owner area</Link></nav>
      <div className="panel edit-panel"><p className="eyebrow">Edit listing</p><h1>{data.name}</h1><RestaurantForm restaurant={data} /></div>
    </main>
  );
}
