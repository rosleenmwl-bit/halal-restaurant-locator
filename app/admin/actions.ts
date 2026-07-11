"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

function text(form: FormData, key: string) {
  const value = String(form.get(key) || "").trim();
  return value || null;
}

function restaurantData(form: FormData) {
  const name = text(form, "name");
  const city = text(form, "city");
  const country = text(form, "country");
  const halal_status = text(form, "halal_status");
  if (!name || !city || !country || !halal_status) throw new Error("Name, city, country and halal status are required.");

  const note = `${text(form, "description") || ""} ${halal_status}`.toLowerCase();
  const confidence = note.includes("certified") || note.includes("jakim") ? .9 : note.includes("no pork") || note.includes("no alcohol") ? .75 : .5;

  return {
    name,
    city,
    country,
    halal_status,
    address: text(form, "address"),
    signature_dish: text(form, "signature_dish"),
    price_range: text(form, "price_range"),
    description: text(form, "description"),
    image_url: text(form, "image_url"),
    google_maps_url: text(form, "google_maps_url"),
    average_rating: Number(form.get("average_rating")) || null,
    is_published: true,
    halal_status_source: "owner-entry",
    halal_status_confidence: confidence,
  };
}

async function guard() {
  if (!(await isAdmin())) redirect("/admin");
}

async function writeAudit(db: Awaited<ReturnType<typeof createClient>>, entry: Record<string, unknown>) {
  const { error } = await db.from("audit_logs").insert(entry);
  if (error) throw new Error(`Audit log failed: ${error.message}`);
}

export async function createRestaurant(form: FormData) {
  await guard();
  const db = await createClient();
  const input = restaurantData(form);
  const { data, error } = await db.from("restaurants").insert(input).select().single();
  if (error) throw new Error(error.message);

  try {
    await writeAudit(db, { action: "create", target_table: "restaurants", target_id: data.id, payload: { after: data } });
  } catch (auditError) {
    await db.from("restaurants").delete().eq("id", data.id);
    throw auditError;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?success=created");
}

export async function updateRestaurant(form: FormData) {
  await guard();
  const id = String(form.get("id"));
  const db = await createClient();
  const { data: before } = await db.from("restaurants").select("*").eq("id", id).single();
  const { data, error } = await db.from("restaurants").update(restaurantData(form)).eq("id", id).select().single();
  if (error) throw new Error(error.message);

  await writeAudit(db, { action: "update", target_table: "restaurants", target_id: id, payload: { before, after: data } });
  revalidatePath("/");
  revalidatePath(`/restaurants/${id}`);
  revalidatePath("/admin");
  redirect("/admin?success=updated");
}

export async function deleteRestaurant(form: FormData) {
  await guard();
  const id = String(form.get("id"));
  const db = await createClient();
  const { data: before } = await db.from("restaurants").select("*").eq("id", id).single();
  await writeAudit(db, { action: "delete", target_table: "restaurants", target_id: id, payload: { before } });
  const { error } = await db.from("restaurants").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/restaurants/${id}`);
  revalidatePath("/admin");
}
