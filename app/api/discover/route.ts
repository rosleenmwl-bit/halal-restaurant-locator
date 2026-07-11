import { NextResponse } from "next/server";

type DiscoveryResult = {
  id: string;
  name: string;
  city: string;
  country: string;
  halal_status: string;
  signature_dish: string | null;
  price_range: string | null;
  average_rating: number | null;
  review_count: number | null;
  description: string | null;
  image_url: string | null;
  external_url: string;
  source: string;
};

const externalIndex: DiscoveryResult[] = [
  {
    id: "external-kl-village-park",
    name: "Village Park Restaurant",
    city: "Kuala Lumpur",
    country: "Malaysia",
    halal_status: "halal-certified",
    signature_dish: "Nasi lemak ayam goreng",
    price_range: "$$",
    average_rating: 4.7,
    review_count: 9000,
    description: "A long-running nasi lemak favourite frequently recommended for Kuala Lumpur food trips.",
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    external_url: "https://www.google.com/search?q=Village+Park+Restaurant+Kuala+Lumpur+halal",
    source: "external halal discovery",
  },
  {
    id: "external-kl-pelita",
    name: "Nasi Kandar Pelita",
    city: "Kuala Lumpur",
    country: "Malaysia",
    halal_status: "halal-certified",
    signature_dish: "Nasi kandar with fish curry",
    price_range: "$",
    average_rating: 4.4,
    review_count: 2700,
    description: "24-hour Malaysian mamak dining with a broad halal-friendly menu.",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    external_url: "https://www.google.com/search?q=Nasi+Kandar+Pelita+Kuala+Lumpur+halal",
    source: "external halal discovery",
  },
  {
    id: "external-kl-serai",
    name: "Serai",
    city: "Kuala Lumpur",
    country: "Malaysia",
    halal_status: "halal-certified",
    signature_dish: "Nasi kerabu and local favourites",
    price_range: "$$",
    average_rating: 4.5,
    review_count: 3500,
    description: "Modern Malaysian dining with several Kuala Lumpur mall locations.",
    image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800",
    external_url: "https://www.google.com/search?q=Serai+Kuala+Lumpur+halal",
    source: "external halal discovery",
  },
  {
    id: "external-kl-mohd-chan",
    name: "Mohd Chan",
    city: "Kuala Lumpur",
    country: "Malaysia",
    halal_status: "halal-certified",
    signature_dish: "Chinese-Muslim seafood and dim sum",
    price_range: "$$",
    average_rating: 4.3,
    review_count: 1800,
    description: "Popular Malaysian Chinese-Muslim restaurant group with halal-certified dining.",
    image_url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800",
    external_url: "https://www.google.com/search?q=Mohd+Chan+Kuala+Lumpur+halal",
    source: "external halal discovery",
  },
  {
    id: "external-kl-dolly",
    name: "Dolly Dim Sum",
    city: "Kuala Lumpur",
    country: "Malaysia",
    halal_status: "halal-certified",
    signature_dish: "Dim sum baskets",
    price_range: "$$",
    average_rating: 4.4,
    review_count: 4200,
    description: "Halal dim sum restaurant known for accessible mall locations and family dining.",
    image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
    external_url: "https://www.google.com/search?q=Dolly+Dim+Sum+Kuala+Lumpur+halal",
    source: "external halal discovery",
  },
  {
    id: "external-kl-homst",
    name: "Homst",
    city: "Kuala Lumpur",
    country: "Malaysia",
    halal_status: "halal-certified",
    signature_dish: "Chinese-Muslim banquet dishes",
    price_range: "$$",
    average_rating: 4.2,
    review_count: 1600,
    description: "Chinese-Muslim restaurant group suitable for shared family meals.",
    image_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800",
    external_url: "https://www.google.com/search?q=Homst+Kuala+Lumpur+halal",
    source: "external halal discovery",
  },
  {
    id: "external-kl-secret-recipe",
    name: "Secret Recipe",
    city: "Kuala Lumpur",
    country: "Malaysia",
    halal_status: "halal-certified",
    signature_dish: "Cakes and cafe meals",
    price_range: "$$",
    average_rating: 4.1,
    review_count: 5000,
    description: "Malaysia-born halal-certified cafe chain with many Kuala Lumpur outlets.",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
    external_url: "https://www.google.com/search?q=Secret+Recipe+Kuala+Lumpur+halal",
    source: "external halal discovery",
  },
  {
    id: "external-kl-sushi-king",
    name: "Sushi King",
    city: "Kuala Lumpur",
    country: "Malaysia",
    halal_status: "halal-certified",
    signature_dish: "Conveyor-belt sushi",
    price_range: "$$",
    average_rating: 4.1,
    review_count: 3900,
    description: "Halal-certified Japanese chain with multiple Malaysia outlets.",
    image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
    external_url: "https://www.google.com/search?q=Sushi+King+Kuala+Lumpur+halal",
    source: "external halal discovery",
  },
  {
    id: "external-dubai-al-fanar",
    name: "Al Fanar Restaurant",
    city: "Dubai",
    country: "United Arab Emirates",
    halal_status: "halal-certified",
    signature_dish: "Emirati machboos",
    price_range: "$$",
    average_rating: 4.5,
    review_count: 7800,
    description: "Traditional Emirati restaurant popular with travellers looking for local halal food.",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
    external_url: "https://www.google.com/search?q=Al+Fanar+Restaurant+Dubai+halal",
    source: "external halal discovery",
  },
  {
    id: "external-london-dishoom",
    name: "Dishoom",
    city: "London",
    country: "United Kingdom",
    halal_status: "halal-certified",
    signature_dish: "Black dal",
    price_range: "$$",
    average_rating: 4.6,
    review_count: 8900,
    description: "Bombay-style cafe with halal meat options and several London branches.",
    image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800",
    external_url: "https://www.google.com/search?q=Dishoom+London+halal",
    source: "external halal discovery",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase() || "";

  if (query.length < 2) return NextResponse.json({ results: [] });

  const words = query.split(/\s+/).filter(Boolean);
  const results = externalIndex
    .filter((restaurant) => {
      const searchable = [
        restaurant.name,
        restaurant.city,
        restaurant.country,
        restaurant.signature_dish,
        restaurant.description,
      ].join(" ").toLowerCase();
      return words.every((word) => searchable.includes(word));
    })
    .slice(0, 18);

  return NextResponse.json({ results });
}
