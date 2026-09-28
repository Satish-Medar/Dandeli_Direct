import { createHash, randomUUID } from "node:crypto";

export type Property = {
  id: string;
  alias: string;
  exactName: string;
  managerPhone: string;
  location: string;
  image: string;
  riverDistance: string;
  signal: string;
  rating: string;
  wholesaleRate: number;
  directRackRate: number;
};

export type Activity = {
  id: string;
  name: string;
  detail: string;
  price: number;
  capacity: number;
};

export type Booking = {
  id: string;
  propertyId: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  activities: string[];
  total: number;
  deposit: number;
  platformFee: number;
  status: "HELD" | "PAID" | "CHECKED_IN" | "CANCELLED";
  isUnlocked: boolean;
  qrHash: string;
  lockToken: string;
  createdAt: string;
};

type Lock = { token: string; expiresAt: number; bookingId?: string };

export const properties: Property[] = [
  {
    id: "riverfront-02",
    alias: "Ganeshgudi Riverfront #02",
    exactName: "Kali River Canopy Retreat",
    managerPhone: "+91 98452 77120",
    location: "Near Kali River · 2.4 km",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85",
    riverDistance: "2.4 km to river",
    signal: "4G signal",
    rating: "4.8",
    wholesaleRate: 3600,
    directRackRate: 4800,
  },
  {
    id: "jungle-04",
    alias: "Eco-Jungle Homestay #04",
    exactName: "Kogilban Forest House",
    managerPhone: "+91 99801 44321",
    location: "Kogilban · 5.1 km",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",
    riverDistance: "5.1 km to river",
    signal: "Limited signal",
    rating: "4.7",
    wholesaleRate: 2850,
    directRackRate: 3900,
  },
  {
    id: "camp-07",
    alias: "Bison Valley Camp #07",
    exactName: "Bison Valley Wilderness Camp",
    managerPhone: "+91 99018 61244",
    location: "Dandeli forest edge · 7.8 km",
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=85",
    riverDistance: "7.8 km to river",
    signal: "4G signal",
    rating: "4.6",
    wholesaleRate: 2400,
    directRackRate: 3400,
  },
];

export const activities: Activity[] = [
  {
    id: "rafting",
    name: "White-water rafting",
    detail: "90 min · exclusive slot",
    price: 1450,
    capacity: 24,
  },
  {
    id: "kayaking",
    name: "Sunrise kayaking",
    detail: "60 min · calm water",
    price: 850,
    capacity: 12,
  },
  {
    id: "safari",
    name: "Tigress safari",
    detail: "3 hr · forest permit",
    price: 1200,
    capacity: 18,
  },
];

export const bookings = new Map<string, Booking>();
export const locks = new Map<string, Lock>();

export function calculatePackage(
  propertyId: string,
  guests: number,
  nights: number,
  activityIds: string[],
) {
  const property = properties.find((item) => item.id === propertyId);
  if (!property) throw new Error("Property not found");
  const stay = property.wholesaleRate * nights;
  const meals = 550 * guests * nights;
  const selectedActivities = activityIds
    .map((id) => activities.find((item) => item.id === id))
    .filter(Boolean) as Activity[];
  const activityTotal = selectedActivities.reduce(
    (sum, item) => sum + item.price * guests,
    0,
  );
  const platformFee = 200 * guests;
  const total = stay + meals + activityTotal + platformFee;
  const directComparableTotal =
    property.directRackRate * nights + activityTotal;
  return {
    property,
    stay,
    meals,
    selectedActivities,
    activityTotal,
    platformFee,
    total,
    deposit: Math.round(total * 0.25),
    savingsVsDirect: Math.max(0, directComparableTotal - total),
    rule:
      total <= directComparableTotal ? "within-direct-rate" : "needs-review",
  };
}

export function lockInventory(
  roomId: string,
  checkIn: string,
  checkOut: string,
) {
  const key = `${roomId}:${checkIn}:${checkOut}`;
  const existing = locks.get(key);
  if (existing && existing.expiresAt > Date.now()) return null;
  const token = randomUUID();
  locks.set(key, { token, expiresAt: Date.now() + 10 * 60 * 1000 });
  return { key, token, expiresAt: Date.now() + 10 * 60 * 1000 };
}

export function createBooking(
  input: Omit<Booking, "id" | "status" | "isUnlocked" | "qrHash" | "createdAt">,
) {
  const id = randomUUID();
  const qrHash = createHash("sha256")
    .update(
      `${id}:${input.lockToken}:${process.env.QR_SECRET ?? "local-secret"}`,
    )
    .digest("hex");
  const booking: Booking = {
    ...input,
    id,
    status: "PAID",
    isUnlocked: true,
    qrHash,
    createdAt: new Date().toISOString(),
  };
  bookings.set(id, booking);
  return booking;
}

export function findBooking(id: string) {
  return bookings.get(id);
}

export function verifyVoucher(qrHash: string, propertyId: string) {
  const booking = [...bookings.values()].find(
    (item) => item.qrHash === qrHash && item.propertyId === propertyId,
  );
  if (!booking || booking.status === "CANCELLED") return null;
  booking.status = "CHECKED_IN";
  return booking;
}
