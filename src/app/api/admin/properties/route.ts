import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function hasValidAdminKey(providedKey: string, expectedKey: string) {
  const providedHash = createHash("sha256").update(providedKey).digest();
  const expectedHash = createHash("sha256").update(expectedKey).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

export async function POST(request: Request) {
  const expectedAdminKey = process.env.ADMIN_API_KEY;
  if (!expectedAdminKey) {
    return NextResponse.json(
      {
        error:
          "Admin saving is not configured. Set ADMIN_API_KEY on the server.",
      },
      { status: 503 },
    );
  }

  const providedAdminKey = request.headers.get("x-admin-api-key") ?? "";
  if (!hasValidAdminKey(providedAdminKey, expectedAdminKey)) {
    return NextResponse.json(
      { error: "Invalid admin access key." },
      { status: 401 },
    );
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase server credentials are not configured." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsedBody: unknown = await request.json();
    if (
      !parsedBody ||
      typeof parsedBody !== "object" ||
      Array.isArray(parsedBody)
    ) {
      return NextResponse.json(
        { error: "Invalid property details." },
        { status: 400 },
      );
    }
    body = parsedBody as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const alias = String(body.alias ?? "").trim();
  const exactName = String(body.exactName ?? "").trim();
  const managerPhone = String(body.managerPhone ?? "").trim();
  const location = String(body.location ?? "").trim();
  const image = String(body.image ?? "").trim();
  const riverDistance = String(body.riverDistance ?? "").trim();
  const signal = String(body.signal ?? "").trim();
  const wholesaleRate = Number(body.wholesaleRate);
  const directRackRate = Number(body.directRackRate);
  const rating = Number(body.rating);
  const tags = Array.isArray(body.tags)
    ? body.tags
        .map(String)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

  let imageUrl: URL;
  try {
    imageUrl = new URL(image);
  } catch {
    return NextResponse.json(
      { error: "Enter a valid image URL." },
      { status: 400 },
    );
  }

  if (
    !alias ||
    !exactName ||
    !managerPhone ||
    !location ||
    !riverDistance ||
    !signal ||
    alias.length > 120 ||
    exactName.length > 160 ||
    managerPhone.length > 40 ||
    location.length > 160 ||
    !["http:", "https:"].includes(imageUrl.protocol) ||
    !Number.isInteger(wholesaleRate) ||
    wholesaleRate < 0 ||
    !Number.isInteger(directRackRate) ||
    directRackRate < wholesaleRate ||
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      {
        error:
          "Check the required fields, rating, and rates; direct rate must be at least the wholesale rate.",
      },
      { status: 400 },
    );
  }

  const baseSlug = slugify(alias) || "property";
  const slug = `${baseSlug}-${randomUUID().slice(0, 8)}`;
  const distanceMatch = riverDistance.match(/^\s*(\d+(?:\.\d+)?)/);
  const distanceToRiverKm = distanceMatch ? Number(distanceMatch[1]) : null;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from("properties").insert({
    slug,
    alias,
    exact_name: exactName,
    manager_phone: managerPhone,
    location,
    image_url: imageUrl.toString(),
    river_distance: riverDistance,
    signal,
    rating,
    wholesale_rate: wholesaleRate,
    direct_rack_rate: directRackRate,
    is_verified: true,
    is_masked: true,
  });

  if (error) {
    console.error("Property insert failed:", error.message);
    return NextResponse.json(
      { error: "Unable to save this property to Supabase." },
      { status: 503 },
    );
  }

  let richFieldsSaved = false;
  const { error: richFieldsError } = await supabase
    .from("properties")
    .update({ tags, distance_to_river_km: distanceToRiverKm })
    .eq("slug", slug);
  if (!richFieldsError) richFieldsSaved = true;

  return NextResponse.json({ slug, richFieldsSaved }, { status: 201 });
}
