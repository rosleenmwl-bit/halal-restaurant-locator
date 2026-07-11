import { createClient } from "@/lib/supabase/server";
import Directory from "./components/directory";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_published", true)
    .order("average_rating", { ascending: false });

  return <Directory restaurants={data ?? []} loadError={Boolean(error)} />;
}
