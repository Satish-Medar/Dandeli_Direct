import { NextResponse } from "next/server";
import { lockInventory, properties } from "@/lib/store";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const roomId = String(body.roomId ?? "");
  const checkIn = String(body.checkIn ?? "");
  const checkOut = String(body.checkOut ?? "");
  if (
    !properties.some((property) => property.id === roomId) ||
    !checkIn ||
    !checkOut ||
    checkOut <= checkIn
  ) {
    return NextResponse.json(
      { error: "Valid room and date range are required" },
      { status: 400 },
    );
  }
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: property } = await supabase
      .from("properties")
      .select("property_id, rooms(room_id)")
      .eq("slug", roomId)
      .eq("is_verified", true)
      .single();
    const room = Array.isArray(property?.rooms) ? property.rooms[0] : null;
    if (!room)
      return NextResponse.json(
        { error: "Room is not configured" },
        { status: 404 },
      );
    const { data, error } = await supabase.rpc("acquire_inventory_lock", {
      p_room_id: room.room_id,
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_ttl_seconds: 600,
    });
    if (error)
      return NextResponse.json(
        { error: "Unable to reserve inventory" },
        { status: 503 },
      );
    const lock = data?.[0];
    if (!lock)
      return NextResponse.json(
        { error: "Room temporarily held. Please try again in 10 minutes." },
        { status: 409 },
      );
    return NextResponse.json({
      lockToken: lock.lock_token,
      expiresAt: lock.expires_at,
    });
  }
  const lock = lockInventory(roomId, checkIn, checkOut);
  if (!lock)
    return NextResponse.json(
      { error: "Room temporarily held. Please try again in 10 minutes." },
      { status: 409 },
    );
  return NextResponse.json({
    lockToken: lock.token,
    expiresAt: new Date(lock.expiresAt).toISOString(),
  });
}
