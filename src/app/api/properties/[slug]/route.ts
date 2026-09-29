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
  stayType?: string;
  nearestLandmark?: string;
};

type PropertyRow = {
  slug: string;
  alias: string;
  category?: string | null;
  location: string;
  image_url?: string | null;
  river_distance?: string | null;
  signal?: string | null;
  rating?: number | null;
  wholesale_rate?: number | null;
  distance_to_river_km?: number | null;
  tags?: string[] | null;
  amenities?: string[] | null;
  activities_offered?: string[] | null;
  meals_included?: string[] | null;
  stay_type?: string | null;
  review_count?: number | null;
  nearest_landmark?: string | null;
};

const catalog = propertyCatalog as unknown as CatalogProperty[];
const catalogById = new Map(catalog.map((property) => [property.id, property]));

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function mapCatalog(property: CatalogProperty) {
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
    distanceToRiverKm: property.distanceToRiverKm,
    reviewCount: property.reviewCount,
    tags: property.tags,
    amenities: property.amenities,
    activitiesOffered: property.activitiesOffered,
    mealsIncluded: property.mealsIncluded,
    stayType: property.stayType,
    nearestLandmark: property.nearestLandmark,
  };
}

function mapDatabase(row: PropertyRow) {
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
    distanceToRiverKm:
      toNumber(row.distance_to_river_km) ??
      seeded?.distanceToRiverKm ??
      toNumber(distanceFromText),
    reviewCount: toNumber(row.review_count) ?? seeded?.reviewCount ?? 0,
    tags: row.tags ?? seeded?.tags ?? [],
    amenities: row.amenities ?? seeded?.amenities ?? [],
    activitiesOffered:
      row.activities_offered ?? seeded?.activitiesOffered ?? [],
    mealsIncluded: row.meals_included ?? seeded?.mealsIncluded ?? [],
    stayType: row.stay_type ?? seeded?.stayType,
    nearestLandmark: row.nearest_landmark ?? seeded?.nearestLandmark,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const property = catalog.find((item) => item.id === slug);
    if (!property)
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    return NextResponse.json({ property: mapCatalog(property) });
  }

  const richResult = await supabase
    .from("properties")
    .select(
      `slug, alias, category, location, image_url, river_distance, signal, rating,
       wholesale_rate, distance_to_river_km, tags, amenities, activities_offered,
       meals_included, stay_type, review_count, nearest_landmark`,
    )
    .eq("slug", slug)
    .eq("is_verified", true)
    .maybeSingle();

  if (!richResult.error && richResult.data) {
    return NextResponse.json({
      property: mapDatabase(richResult.data as unknown as PropertyRow),
    });
  }

  const coreResult = await supabase
    .from("properties")
    .select(
      "slug, alias, location, image_url, river_distance, signal, rating, wholesale_rate",
    )
    .eq("slug", slug)
    .eq("is_verified", true)
    .maybeSingle();

  if (coreResult.error || !coreResult.data)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  return NextResponse.json({
    property: mapDatabase(coreResult.data as unknown as PropertyRow),
  });
}
