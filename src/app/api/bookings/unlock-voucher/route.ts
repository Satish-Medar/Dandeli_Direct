import { NextResponse } from "next/server";
import { findBooking, properties } from "@/lib/store";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const bookingId = params.get("bookingId") ?? "";
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "booking_id, status, guest_name, property_id, qr_hash, properties(exact_name, manager_phone)",
      )
      .eq("booking_id", bookingId)
      .single();
    if (error || !booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    const property = Array.isArray(booking.properties)
      ? booking.properties[0]
      : booking.properties;
    return NextResponse.json({
      bookingId: booking.booking_id,
      status: booking.status,
      guestName: booking.guest_name,
      roomType: "Forest room",
      activities: [],
      qrHash: booking.qr_hash,
      property: {
        name: property?.exact_name,
        managerPhone: property?.manager_phone,
        gps: "15.2471, 74.6298",
        checkInInstructions:
          "Show this voucher at the forest gate and carry a government ID.",
      },
    });
  }
  const booking = findBooking(bookingId);
  if (!booking || booking.status === "CANCELLED")
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  const property = properties.find((item) => item.id === booking.propertyId)!;
  return NextResponse.json({
    bookingId: booking.id,
    status: booking.status,
    guestName: booking.guestName,
    roomType: "Forest room",
    activities: booking.activities,
    qrHash: booking.qrHash,
    property: {
      name: property.exactName,
      managerPhone: property.managerPhone,
      gps: "15.2471, 74.6298",
      checkInInstructions:
        "Show this voucher at the forest gate and carry a government ID.",
    },
  });
}
