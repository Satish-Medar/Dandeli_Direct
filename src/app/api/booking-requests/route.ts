import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { activities } from "@/lib/store";

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

export async function POST(request: Request) {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Booking requests are not configured." },
      { status: 503 },
    );
  }

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

  const propertySlug = String(body.propertyId ?? "").trim();
  const guestName = String(body.guestName ?? "").trim();
  const guestPhone = String(body.guestPhone ?? "").trim();
  const checkIn = parseDate(body.checkIn);
  const checkOut = parseDate(body.checkOut);
  const guests = Number(body.guests);
  const activityIds = Array.isArray(body.activities)
    ? body.activities.map(String)
    : [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (
    !propertySlug ||
    guestName.length < 2 ||
    guestName.length > 100 ||
    !/^[+()\d\s-]{7,24}$/.test(guestPhone) ||
    !checkIn ||
    !checkOut ||
    checkIn < today ||
    checkOut <= checkIn ||
    !Number.isInteger(guests) ||
    guests < 1 ||
    guests > 16 ||
    activityIds.some((id) => !activities.some((activity) => activity.id === id))
  ) {
    return NextResponse.json(
      {
        error: "Enter a valid name, phone, guest count, and future date range.",
      },
      { status: 400 },
    );
  }

  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / 86_400_000,
  );
  if (nights > 30)
    return NextResponse.json(
      { error: "Booking requests can be up to 30 nights." },
      { status: 400 },
    );

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("property_id, wholesale_rate")
    .eq("slug", propertySlug)
    .eq("is_verified", true)
    .single();

  if (propertyError || !property)
    return NextResponse.json(
      { error: "Verified property not found." },
      { status: 404 },
    );

  const nightlyRate = Number(property.wholesale_rate);
  const stayAmount = nightlyRate * nights;
  const mealAmount = 550 * guests * nights;
  const activitiesAmount = activities
    .filter((activity) => activityIds.includes(activity.id))
    .reduce((total, activity) => total + activity.price * guests, 0);
  const platformFee = 0;
  const estimatedAmount = stayAmount + mealAmount + activitiesAmount;
  const { data: bookingRequest, error } = await supabase
    .from("booking_requests")
    .insert({
      property_id: property.property_id,
      guest_name: guestName,
      guest_phone: guestPhone,
      check_in: body.checkIn,
      check_out: body.checkOut,
      guests,
      nights,
      nightly_rate: nightlyRate,
      activity_ids: activityIds,
      stay_amount: stayAmount,
      meal_amount: mealAmount,
      activities_amount: activitiesAmount,
      platform_fee: platformFee,
      estimated_amount: estimatedAmount,
    })
    .select("request_id, status")
    .single();

  if (error || !bookingRequest) {
    console.error("Booking request insert failed:", error?.message);
    return NextResponse.json(
      { error: "Unable to send your booking request." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      requestId: bookingRequest.request_id,
      status: bookingRequest.status,
      nights,
      nightlyRate,
      stayAmount,
      mealAmount,
      activitiesAmount,
      platformFee,
      estimatedAmount,
      currency: "INR",
      paymentRequired: false,
    },
    { status: 201 },
  );
}
