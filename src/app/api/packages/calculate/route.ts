import { NextResponse } from "next/server";
import { calculatePackage } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const propertyId = String(body.propertyId ?? "");
  const guests = Math.max(1, Number(body.guests) || 1);
  const nights = Math.max(1, Number(body.nights) || 1);
  const activities = Array.isArray(body.activities)
    ? body.activities.map(String)
    : [];
  try {
    const quote = calculatePackage(propertyId, guests, nights, activities);

    return NextResponse.json({
      currency: "INR",
      breakdown: {
        stay: quote.stay,
        meals: quote.meals,
        activities: quote.selectedActivities.map((activity) => ({
          id: activity.id,
          amount: activity.price * guests,
        })),
        platformFee: quote.platformFee,
      },
      total: quote.total,
      deposit: quote.deposit,
      savingsVsDirect: quote.savingsVsDirect,
      rule: quote.rule,
    });
  } catch {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }
}
