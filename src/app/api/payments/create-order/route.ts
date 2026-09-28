import { NextResponse } from "next/server";
import { calculatePackage, createBooking, locks } from "@/lib/store";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const lockToken = String(body.lockToken ?? "");
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: validLock, error } = await supabase.rpc(
      "validate_inventory_lock",
      { p_token: lockToken },
    );
    if (error || !validLock)
      return NextResponse.json(
        { error: "Inventory lock expired" },
        { status: 409 },
      );
  } else {
    const lock = [...locks.values()].find(
      (item) => item.token === lockToken && item.expiresAt > Date.now(),
    );
    if (!lock)
      return NextResponse.json(
        { error: "Inventory lock expired" },
        { status: 409 },
      );
  }
  try {
    const guests = Math.max(1, Number(body.guests) || 1);
    const nights = Math.max(1, Number(body.nights) || 1);
    const quote = calculatePackage(
      String(body.propertyId),
      guests,
      nights,
      Array.isArray(body.activities) ? body.activities.map(String) : [],
    );
    const booking = createBooking({
      propertyId: quote.property.id,
      roomId: quote.property.id,
      guestName: String(body.guestName ?? "Guest"),
      guestPhone: String(body.guestPhone ?? ""),
      checkIn: String(body.checkIn ?? ""),
      checkOut: String(body.checkOut ?? ""),
      guests,
      nights,
      activities: quote.selectedActivities.map((activity) => activity.id),
      total: quote.total,
      deposit: quote.deposit,
      platformFee: quote.platformFee,
      lockToken,
    });
    if (supabase) {
      const { data: property } = await supabase
        .from("properties")
        .select("property_id, rooms(room_id)")
        .eq("slug", booking.propertyId)
        .single();
      const room = Array.isArray(property?.rooms) ? property.rooms[0] : null;
      if (!property || !room)
        return NextResponse.json(
          { error: "Property is not configured" },
          { status: 503 },
        );
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          booking_id: booking.id,
          property_id: property.property_id,
          room_id: room.room_id,
          guest_name: booking.guestName,
          guest_phone: booking.guestPhone,
          check_in: booking.checkIn,
          check_out: booking.checkOut,
          guests: booking.guests,
          nights: booking.nights,
          total_amount: booking.total,
          deposit_amount: booking.deposit,
          platform_fee: booking.platformFee,
          status: "PAID",
          is_unlocked: true,
          qr_hash: booking.qrHash,
        });
      if (bookingError)
        return NextResponse.json(
          { error: "Unable to save booking" },
          { status: 503 },
        );
      await supabase
        .from("escrow_ledger")
        .insert({
          booking_id: booking.id,
          partner_payout_amount: booking.total - booking.platformFee,
          platform_commission: booking.platformFee,
          status: "HELD",
        });
    }
    return NextResponse.json({
      bookingId: booking.id,
      orderId: `local_order_${booking.id.slice(0, 8)}`,
      amount: booking.deposit,
      currency: "INR",
      status: booking.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create booking quote" },
      { status: 400 },
    );
  }
}
