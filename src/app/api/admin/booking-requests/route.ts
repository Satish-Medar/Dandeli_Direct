import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function isAuthorized(request: Request) {
  const expectedKey = process.env.ADMIN_API_KEY;
  const providedKey = request.headers.get("x-admin-api-key") ?? "";
  if (!expectedKey) return false;
  return timingSafeEqual(
    createHash("sha256").update(providedKey).digest(),
    createHash("sha256").update(expectedKey).digest(),
  );
}

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: Request) {
  if (!isAuthorized(request))
    return NextResponse.json(
      { error: "Admin authorization failed." },
      { status: 401 },
    );
  const supabase = getSupabase();
  if (!supabase)
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );

  const { data, error } = await supabase
    .from("booking_requests")
    .select(
      "request_id, status, guest_name, guest_phone, check_in, check_out, guests, nights, activity_ids, estimated_amount, created_at, properties(alias)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Unable to load booking requests:", error.message);
    return NextResponse.json(
      {
        error:
          "Unable to load booking requests. Run the booking-request migration.",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ requests: data ?? [] });
}

export async function PATCH(request: Request) {
  if (!isAuthorized(request))
    return NextResponse.json(
      { error: "Admin authorization failed." },
      { status: 401 },
    );
  const supabase = getSupabase();
  if (!supabase)
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const requestId = String(body.requestId ?? "");
  const status = String(body.status ?? "");
  if (!requestId || !["CONFIRMED", "DECLINED"].includes(status))
    return NextResponse.json(
      { error: "Invalid request status." },
      { status: 400 },
    );

  const { data, error } = await supabase
    .from("booking_requests")
    .update({ status })
    .eq("request_id", requestId)
    .eq("status", "REQUESTED")
    .select("request_id, status")
    .maybeSingle();

  if (error) {
    console.error("Unable to update booking request:", error.message);
    return NextResponse.json(
      { error: "Unable to update this request." },
      { status: 503 },
    );
  }
  if (!data)
    return NextResponse.json(
      { error: "Request not found or it has already been reviewed." },
      { status: 409 },
    );
  return NextResponse.json({ request: data });
}
