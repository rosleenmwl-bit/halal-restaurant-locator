export type MalaysiaFallbackResult = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  halal_status: string;
  signature_dish: string | null;
  price_range: string | null;
  average_rating: number | null;
  review_count: number | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  google_maps_url: string | null;
  image_url: string | null;
  is_published: boolean;
  external_url: string;
  google_rating_text: string | null;
  location_name: string | null;
};

const cityAliases: Array<{ city: string; aliases: string[] }> = [
  { city: "Kuala Lumpur", aliases: ["kuala lumpur", "kl"] },
  { city: "George Town", aliases: ["george town", "georgetown", "penang", "pulau pinang"] },
  { city: "Johor Bahru", aliases: ["johor bahru", "jb"] },
  { city: "Shah Alam", aliases: ["shah alam"] },
  { city: "Petaling Jaya", aliases: ["petaling jaya", "pj"] },
  { city: "Subang Jaya", aliases: ["subang jaya"] },
  { city: "Putrajaya", aliases: ["putrajaya"] },
  { city: "Cyberjaya", aliases: ["cyberjaya"] },
  { city: "Melaka", aliases: ["melaka", "malacca"] },
  { city: "Ipoh", aliases: ["ipoh"] },
  { city: "Kota Kinabalu", aliases: ["kota kinabalu", "kk sabah"] },
  { city: "Kuching", aliases: ["kuching"] },
  { city: "Kuantan", aliases: ["kuantan"] },
  { city: "Kota Bharu", aliases: ["kota bharu", "kota bahru"] },
  { city: "Kuala Terengganu", aliases: ["kuala terengganu"] },
  { city: "Alor Setar", aliases: ["alor setar"] },
  { city: "Seremban", aliases: ["seremban"] },
  { city: "Klang", aliases: ["klang"] },
  { city: "Kajang", aliases: ["kajang"] },
  { city: "Bangi", aliases: ["bangi"] },
];

const cityHighlights: Record<string, Array<[string, string, string, string]>> = {
  "Kuala Lumpur": [
    ["Jibby Chow", "Chinese-Muslim comfort food", "Halal Chinese-Muslim dishes and family dining in Kuala Lumpur.", "halal-certified"],
    ["Mohammad Chow Restaurant", "Chinese-Muslim seafood", "Chinese-Muslim restaurant option for shared meals around Kuala Lumpur.", "halal-certified"],
    ["Songket Restaurant", "Malay classics", "Malay dining with cultural ambience and traditional favourites.", "halal-certified"],
    ["Nasi Ayam Hainan Chee Meng", "Hainanese chicken rice", "Well-known halal chicken rice restaurant with Kuala Lumpur outlets.", "halal-certified"],
    ["Nasi Kandar Pelita", "Nasi kandar", "Popular mamak-style halal dining for curry rice and late-night meals.", "halal-certified"],
    ["Dolly Dim Sum", "Dim sum", "Halal dim sum restaurant with several Klang Valley mall locations.", "halal-certified"],
    ["Serai", "Modern Malaysian", "Modern Malaysian restaurant known for local favourites and family-friendly dining.", "halal-certified"],
    ["Mohd Chan", "Chinese-Muslim dishes", "Halal Chinese-Muslim restaurant group with broad comfort-food options.", "halal-certified"],
    ["Homst", "Chinese-Muslim banquet dishes", "Chinese-Muslim restaurant group suitable for family meals.", "halal-certified"],
    ["De.Wan 1958 by Chef Wan", "Malay cuisine", "Contemporary Malay restaurant by Chef Wan in Kuala Lumpur.", "halal-certified"],
    ["Congkak", "Malay cuisine", "Malay restaurant in Bukit Bintang serving traditional favourites.", "halal-certified"],
    ["Restoran Rebung Chef Ismail", "Malay buffet", "Malay buffet restaurant known for kampung-style dishes.", "halal-certified"],
  ],
  "George Town": [
    ["Bee Hwa Cafe", "Malay and Penang favourites", "Halal-friendly Penang cafe option; verify current certification before visiting.", "muslim-friendly"],
    ["Hameediyah Restaurant", "Nasi kandar", "Historic Penang nasi kandar favourite with broad Muslim-friendly appeal.", "muslim-friendly"],
    ["Kapitan Restaurant", "Tandoori and biryani", "Popular Indian-Muslim restaurant option in George Town.", "muslim-friendly"],
    ["Deen Maju", "Nasi kandar", "Busy Penang nasi kandar option for curry rice and fried chicken.", "muslim-friendly"],
    ["Kareem Pasembur Rojak", "Pasembur", "Known Penang Muslim-friendly street-food option.", "muslim-friendly"],
  ],
  "Johor Bahru": [
    ["Restoran ZZ Sup Tulang", "Sup tulang", "Johor Bahru Malay restaurant option known for soups and local dishes.", "muslim-friendly"],
    ["Kacang Pool Haji", "Kacang pool", "Local Johor favourite for kacang pool and breakfast-style dishes.", "muslim-friendly"],
    ["IT Roo Cafe", "Chicken chop", "Use this card to verify halal-friendly chicken chop options around JB.", "muslim-friendly"],
    ["The Pinggan Cafe", "Local cafe dishes", "Johor Bahru cafe option for Muslim-friendly local plates.", "muslim-friendly"],
    ["Sedap Corner", "Malay comfort food", "Johor Bahru Malay dining option; verify current halal details before visiting.", "muslim-friendly"],
  ],
  "Melaka": [
    ["Asam Pedas Claypot", "Asam pedas", "Melaka asam pedas option; verify current halal details before visiting.", "muslim-friendly"],
    ["Pak Putra Tandoori", "Tandoori chicken", "Popular Melaka Indian-Muslim tandoori option.", "muslim-friendly"],
    ["Hajjah Mona Asam Pedas", "Asam pedas", "Melaka Malay asam pedas restaurant option.", "muslim-friendly"],
    ["Restoran Lot 85", "Malay seafood", "Melaka local dining option for Malay dishes.", "muslim-friendly"],
    ["Cendol Kampung Hulu", "Cendol", "Sweet stop option around Melaka; verify current halal details.", "muslim-friendly"],
  ],
  "Ipoh": [
    ["Nasi Ganja Ipoh", "Nasi kandar", "Ipoh nasi kandar favourite often searched by Muslim travellers.", "muslim-friendly"],
    ["Restoran New Hollywood", "Hawker-style dishes", "Popular Ipoh halal-friendly food court option.", "muslim-friendly"],
    ["Canning Dim Sum", "Dim sum", "Use this card to find halal dim sum choices around Ipoh.", "muslim-friendly"],
    ["Mee Daud Mat Jasak", "Mee rebus", "Ipoh Malay noodle option with strong local following.", "muslim-friendly"],
    ["Restoran M Salim", "Nasi kandar", "Ipoh nasi kandar and curry rice option.", "muslim-friendly"],
  ],
  "Kota Kinabalu": [
    ["Restoran Sempelang", "Sabah Malay dishes", "Kota Kinabalu halal-friendly local restaurant option.", "muslim-friendly"],
    ["Kedai Kopi Islamic Restaurant", "Local Muslim food", "Muslim-friendly restaurant option in Kota Kinabalu.", "muslim-friendly"],
    ["Sri Latha Curry House", "Banana leaf and curry", "Kota Kinabalu Indian-Muslim dining option.", "muslim-friendly"],
    ["D'Place Kinabalu", "Sabah traditional dishes", "Sabah cuisine option; verify halal details before visiting.", "muslim-friendly"],
    ["Restoran Nasi Kandar Anak Mami", "Nasi kandar", "Nasi kandar option around Kota Kinabalu.", "muslim-friendly"],
  ],
  "Kuching": [
    ["Lepau Restaurant", "Sarawak local dishes", "Kuching local cuisine option; verify halal details before visiting.", "muslim-friendly"],
    ["RJ Ayam Bakar", "Ayam bakar", "Kuching halal-friendly grilled chicken option.", "muslim-friendly"],
    ["Swee Kang Ais Kacang", "Local desserts", "Use this card to verify halal-friendly dessert options in Kuching.", "muslim-friendly"],
    ["Mom's Laksa", "Sarawak laksa", "Use this card to find halal Sarawak laksa options around Kuching.", "muslim-friendly"],
    ["Zinc Restaurant", "Modern local plates", "Kuching dining option; verify halal details before visiting.", "muslim-friendly"],
  ],
};

const nationalOptions: Array<[string, string, string]> = [
  ["Secret Recipe", "Cafe meals and cakes", "Search nearby JAKIM-listed or halal-certified cafe outlets."],
  ["Sushi King", "Japanese sushi", "Search nearby halal-certified Japanese chain outlets."],
  ["Marrybrown", "Fried chicken and local meals", "Search nearby Malaysian halal-certified quick-service outlets."],
  ["The Chicken Rice Shop", "Chicken rice", "Search nearby halal-certified chicken rice outlets."],
  ["Kenny Rogers Roasters", "Roasted chicken", "Search nearby halal-friendly roasted chicken outlets."],
  ["Manhattan Fish Market", "Seafood platters", "Search nearby halal-certified seafood chain outlets."],
  ["OldTown White Coffee", "Local cafe dishes", "Search nearby halal-friendly Malaysian cafe outlets."],
  ["Tealive", "Drinks and snacks", "Search nearby halal-certified beverage outlets."],
  ["A&W Malaysia", "Burgers and root beer", "Search nearby halal-certified family restaurant outlets."],
  ["KFC Malaysia", "Fried chicken", "Search nearby halal-certified quick-service outlets."],
  ["McDonald's Malaysia", "Burgers and breakfast", "Search nearby halal-certified quick-service outlets."],
  ["Pizza Hut Malaysia", "Pizza", "Search nearby halal-certified pizza outlets."],
  ["Domino's Pizza Malaysia", "Pizza", "Search nearby halal-certified pizza outlets."],
  ["Texas Chicken Malaysia", "Fried chicken", "Search nearby halal-certified chicken outlets."],
  ["Seoul Garden Malaysia", "Grill and steamboat", "Search nearby halal-certified Korean-style buffet outlets."],
  ["Dubuyo", "Korean dishes", "Search nearby halal-certified Korean casual dining outlets."],
  ["Sepiring", "Malaysian local dishes", "Search nearby halal-friendly Malaysian dining outlets."],
  ["PappaRich", "Malaysian cafe dishes", "Search nearby halal-friendly Malaysian cafe outlets."],
];

export function malaysiaFallbackResults(query: string): MalaysiaFallbackResult[] {
  const city = inferMalaysiaCity(query);
  if (!city) return [];

  const highlights = cityHighlights[city] ?? [];
  const local = highlights.map(([name, dish, description, halalStatus]) => buildResult(city, name, dish, description, halalStatus));
  const national = nationalOptions.map(([name, dish, description]) => buildResult(city, name, dish, description, "halal-certified"));

  return dedupe([...local, ...national]).slice(0, 30);
}

function inferMalaysiaCity(query: string) {
  const lower = query.toLowerCase();
  const match = cityAliases.find(({ aliases }) => aliases.some((alias) => lower.includes(alias)));
  if (match) return match.city;
  if (lower.includes("malaysia")) return titleCase(query.replace(/malaysia/gi, "").trim()) || "Malaysia";
  return null;
}

function buildResult(city: string, name: string, dish: string, description: string, halalStatus: string): MalaysiaFallbackResult {
  return {
    id: `malaysia-${hash(`${city}-${name}`)}`,
    name,
    city,
    country: "Malaysia",
    address: null,
    halal_status: halalStatus,
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
    external_url: `https://www.google.com/search?q=${encodeURIComponent(`${name} ${city} halal JAKIM MyEHalal`)}`,
    google_rating_text: "Google rating",
    location_name: city,
  };
}

function dedupe(results: MalaysiaFallbackResult[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = result.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`);
}

function hash(value: string) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output << 5) - output + value.charCodeAt(index);
    output |= 0;
  }
  return Math.abs(output).toString(36);
}
