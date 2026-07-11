import type { Restaurant } from "@/lib/types";
import { createRestaurant, updateRestaurant } from "./actions";

export default function RestaurantForm({ restaurant }: { restaurant?: Restaurant }) {
  const action = restaurant ? updateRestaurant : createRestaurant;

  return (
    <form action={action} className="restaurant-form">
      {restaurant && <input type="hidden" name="id" value={restaurant.id} />}
      <label>Name *<input name="name" required defaultValue={restaurant?.name} /></label>
      <div className="form-row">
        <label>City *<input name="city" required defaultValue={restaurant?.city} /></label>
        <label>Country *<input name="country" required defaultValue={restaurant?.country} /></label>
      </div>
      <label>Address<input name="address" defaultValue={restaurant?.address || ""} /></label>
      <div className="form-row">
        <label>Halal status *<select name="halal_status" required defaultValue={restaurant?.halal_status || "halal-certified"}><option value="halal-certified">Halal certified</option><option value="muslim-friendly">Muslim friendly</option><option value="unverified">Unverified</option></select></label>
        <label>Price range<select name="price_range" defaultValue={restaurant?.price_range || "$$"}><option>$</option><option>$$</option><option>$$$</option></select></label>
      </div>
      <label>Signature dish<input name="signature_dish" defaultValue={restaurant?.signature_dish || ""} /></label>
      <label>Description<textarea name="description" rows={4} defaultValue={restaurant?.description || ""} /></label>
      <div className="form-row">
        <label>Rating<input name="average_rating" type="number" min="0" max="5" step="0.1" defaultValue={restaurant?.average_rating || ""} /></label>
        <label>Image URL<input name="image_url" type="url" defaultValue={restaurant?.image_url || ""} /></label>
      </div>
      <label>Google Maps URL<input name="google_maps_url" type="url" defaultValue={restaurant?.google_maps_url || ""} /></label>
      <button className="button" type="submit">{restaurant ? "Save changes" : "Add restaurant"}</button>
    </form>
  );
}
