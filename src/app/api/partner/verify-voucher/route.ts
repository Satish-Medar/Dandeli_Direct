import { NextResponse } from "next/server";
import { properties, verifyVoucher } from "@/lib/store";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PUT(request: Request) {
  const body = await request.json();
  const propertyId = String(body.propertyId ?? "");
  if (!properties.some((property) => property.id === propertyId))
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: property } = await supabase
      .from("properties")
      .select("property_id")
      .eq("slug", propertyId)
      .single();
    if (!property)
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("booking_id, status")
      .eq("property_id", property.property_id)
      .eq("qr_hash", String(body.qrHash ?? ""))
      .neq("status", "CANCELLED")
      .single();
    if (error || !booking)
      return NextResponse.json(
        { error: "Invalid or already cancelled voucher" },
        { status: 409 },
      );
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "CHECKED_IN" })
      .eq("booking_id", booking.booking_id);
    if (updateError)
      return NextResponse.json(
        { error: "Unable to confirm check-in" },
        { status: 503 },
      );
    return NextResponse.json({
      verified: true,
      status: "CHECKED_IN",
      bookingId: booking.booking_id,
      payout: { status: "SCHEDULED", releaseWindow: "Within 2 hours" },
    });
  }
  const booking = verifyVoucher(String(body.qrHash ?? ""), propertyId);
  if (!booking)
    return NextResponse.json(
      { error: "Invalid or already cancelled voucher" },
      { status: 409 },
    );
  return NextResponse.json({
    verified: true,
    status: booking.status,
    bookingId: booking.id,
    payout: { status: "SCHEDULED", releaseWindow: "Within 2 hours" },
  });
}
