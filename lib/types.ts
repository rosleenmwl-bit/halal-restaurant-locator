export type Restaurant = {
  id: string; name: string; city: string; country: string; address: string | null;
  halal_status: string; signature_dish: string | null; price_range: string | null;
  average_rating: number | null; review_count: number | null; description: string | null;
  phone: string | null; website: string | null; google_maps_url: string | null;
  image_url: string | null; is_published: boolean;
};
