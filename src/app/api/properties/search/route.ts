import { NextResponse } from "next/server";
import propertyCatalog from "../../../../../scripts/data.json";
import { getSupabaseAdmin } from "@/lib/supabase";

type CatalogProperty = {
  id: string;
  alias: string;
  category?: string;
  location: string;
  image: string;
  distanceToRiverKm: number;
  riverDistanceText: string;
  mobileSignal: string;
  rating: number;
  reviewCount: number;
  pricePerNightINR: number;
  tags: string[];
  amenities: string[];
  activitiesOffered: string[];
  mealsIncluded: string[];
  foodType?: string;
  petFriendly: boolean;
  coupleFriendly: boolean;
  familyFriendly: boolean;
  wifiAvailable: boolean;
  stayType?: string;
  nearestLandmark?: string;
  googleMapsUrl?: string;
};

type SearchProperty = {
  id: string;
  alias: string;
  category?: string | null;
  location: string;
  image: string;
  riverDistance: string;
  signal: string;
  rating: number;
  stay: number;
  tags: string[];
  amenities: string[];
  activitiesOffered: string[];
  mealsIncluded: string[];
  foodType?: string | null;
  petFriendly?: boolean | null;
  coupleFriendly?: boolean | null;
  familyFriendly?: boolean | null;
  wifiAvailable?: boolean | null;
  distanceToRiverKm?: number | null;
  stayType?: string | null;
  reviewCount?: number | null;
  nearestLandmark?: string | null;
  googleMapsUrl?: string | null;
};

type DatabaseProperty = {
  slug: string;
  alias: string;
  location: string;
  image_url?: string | null;
  river_distance?: string | null;
  signal?: string | null;
  rating?: number | null;
  wholesale_rate?: number | null;
  tags?: string[] | null;
  amenities?: string[] | null;
  activities_offered?: string[] | null;
  meals_included?: string[] | null;
  food_type?: string | null;
  pet_friendly?: boolean | null;
  couple_friendly?: boolean | null;
  family_friendly?: boolean | null;
  wifi_available?: boolean | null;
  distance_to_river_km?: number | null;
  stay_type?: string | null;
  category?: string | null;
  review_count?: number | null;
  nearest_landmark?: string | null;
  google_maps_url?: string | null;
};

const catalog = propertyCatalog as unknown as CatalogProperty[];
const catalogById = new Map(catalog.map((property) => [property.id, property]));

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function fromCatalog(property: CatalogProperty): SearchProperty {
  return {
    id: property.id,
    alias: property.alias,
    category: property.category,
    location: property.location,
    image: property.image,
    riverDistance: property.riverDistanceText,
    signal: property.mobileSignal,
    rating: property.rating,
    stay: property.pricePerNightINR,
    tags: property.tags,
    amenities: property.amenities,
    activitiesOffered: property.activitiesOffered,
    mealsIncluded: property.mealsIncluded,
    foodType: property.foodType,
    petFriendly: property.petFriendly,
    coupleFriendly: property.coupleFriendly,
    familyFriendly: property.familyFriendly,
    wifiAvailable: property.wifiAvailable,
    distanceToRiverKm: property.distanceToRiverKm,
    stayType: property.stayType,
    reviewCount: property.reviewCount,
    nearestLandmark: property.nearestLandmark,
    googleMapsUrl: property.googleMapsUrl,
  };
}

function fromDatabase(row: DatabaseProperty): SearchProperty {
  const seeded = catalogById.get(row.slug);
  const distanceFromText = row.river_distance?.match(/(\d+(?:\.\d+)?)/)?.[1];
  return {
    id: row.slug,
    alias: row.alias,
    category: row.category ?? seeded?.category,
    location: row.location,
    image: row.image_url ?? seeded?.image ?? "",
    riverDistance:
      row.river_distance ?? seeded?.riverDistanceText ?? "Distance unavailable",
    signal: row.signal ?? seeded?.mobileSignal ?? "Signal unavailable",
    rating: toNumber(row.rating) ?? seeded?.rating ?? 0,
    stay: toNumber(row.wholesale_rate) ?? seeded?.pricePerNightINR ?? 0,
    tags: row.tags?.length ? row.tags : (seeded?.tags ?? []),
    amenities: row.amenities?.length
      ? row.amenities
      : (seeded?.amenities ?? []),
    activitiesOffered: row.activities_offered?.length
      ? row.activities_offered
      : (seeded?.activitiesOffered ?? []),
    mealsIncluded: row.meals_included?.length
      ? row.meals_included
      : (seeded?.mealsIncluded ?? []),
    foodType: row.food_type ?? seeded?.foodType,
    petFriendly: row.pet_friendly ?? seeded?.petFriendly,
    coupleFriendly: row.couple_friendly ?? seeded?.coupleFriendly,
    familyFriendly: row.family_friendly ?? seeded?.familyFriendly,
    wifiAvailable: row.wifi_available ?? seeded?.wifiAvailable,
    distanceToRiverKm:
      toNumber(row.distance_to_river_km) ??
      seeded?.distanceToRiverKm ??
      toNumber(distanceFromText),
    stayType: row.stay_type ?? seeded?.stayType,
    reviewCount: toNumber(row.review_count) ?? seeded?.reviewCount ?? 0,
    nearestLandmark: row.nearest_landmark ?? seeded?.nearestLandmark,
    googleMapsUrl: row.google_maps_url ?? seeded?.googleMapsUrl,
  };
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const targetRate = Math.max(
    0,
    toNumber(params.get("target_rate")) ??
      toNumber(params.get("max_rate")) ??
      5000,
  );
  const maxDistanceKm = toNumber(params.get("max_distance_km"));
  const supabase = getSupabaseAdmin();
  let candidates: SearchProperty[];

  if (supabase) {
    const richResult = await supabase
      .from("properties")
      .select(
        `slug, alias, location, image_url, river_distance, signal, rating, wholesale_rate,
         tags, amenities, activities_offered, meals_included, food_type,
         pet_friendly, couple_friendly, family_friendly, wifi_available,
         distance_to_river_km, stay_type, category, review_count, nearest_landmark,
         google_maps_url`,
      )
      .eq("is_verified", true)
      .limit(1000);

    if (!richResult.error) {
      candidates = (
        (richResult.data ?? []) as unknown as DatabaseProperty[]
      ).map(fromDatabase);
    } else {
      const coreResult = await supabase
        .from("properties")
        .select(
          "slug, alias, location, image_url, river_distance, signal, rating, wholesale_rate",
        )
        .eq("is_verified", true)
        .limit(1000);

      if (coreResult.error) {
        console.error("Property search failed:", coreResult.error.message);
        return NextResponse.json(
          { error: "Unable to search properties" },
          { status: 503 },
        );
      }
      candidates = (
        (coreResult.data ?? []) as unknown as DatabaseProperty[]
      ).map(fromDatabase);
    }
  } else {
    candidates = catalog.map(fromCatalog);
  }

  const nearbyCandidates =
    maxDistanceKm === null
      ? candidates
      : candidates.filter(
          (property) =>
            property.distanceToRiverKm !== null &&
            property.distanceToRiverKm !== undefined &&
            property.distanceToRiverKm <= maxDistanceKm,
        );
  const distanceFallback =
    maxDistanceKm !== null &&
    candidates.length > 0 &&
    nearbyCandidates.length === 0;
  const results = (distanceFallback ? candidates : nearbyCandidates)
    .map((property) => ({
      property,
      priceGap: Math.abs(property.stay - targetRate),
    }))
    .sort(
      (left, right) =>
        left.priceGap - right.priceGap ||
        left.property.stay - right.property.stay,
    )
    .slice(0, 3)
    .map(({ property }) => property);

  return NextResponse.json({ properties: results, distanceFallback });
}
