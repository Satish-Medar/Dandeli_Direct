import { NextResponse } from "next/server";
import { properties } from "@/lib/store";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("vibe") ?? "").toLowerCase();
  const guests = Number(params.get("guests") ?? 1);
  const supabase = getSupabaseAdmin();
  if (supabase) {
    let search = supabase
      .from("properties")
      .select(
        "slug, alias, location, image_url, river_distance, signal, rating, wholesale_rate",
      )
      .eq("is_verified", true);
    if (query)
      search = search.or(
        `alias.ilike.%${query}%,location.ilike.%${query}%,signal.ilike.%${query}%`,
      );
    const { data, error } = await search;
    if (error)
      return NextResponse.json(
        { error: "Unable to search properties" },
        { status: 503 },
      );
    return NextResponse.json({
      properties: (data ?? []).map((property) => ({
        id: property.slug,
        alias: property.alias,
        location: property.location,
        image: property.image_url,
        riverDistance: property.river_distance,
        signal: property.signal,
        rating: property.rating,
        stay: property.wholesale_rate,
        available: guests <= 8,
      })),
    });
  }
  const results = properties.filter(
    (property) =>
      !query ||
      `${property.alias} ${property.location} ${property.signal}`
        .toLowerCase()
        .includes(query),
  );
  return NextResponse.json({
    properties: results.map(({ exactName, managerPhone, ...masked }) => ({
      ...masked,
      available: guests <= 8,
    })),
  });
}
