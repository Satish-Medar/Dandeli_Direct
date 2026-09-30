"use client";

import { useEffect, useMemo, useState } from "react";
import { CONTACT_PHONE_DISPLAY, createWhatsAppUrl } from "@/lib/contact";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

type Property = {
  id: string;
  alias: string;
  location: string;
  image: string;
  riverDistance: string;
  signal: string;
  rating: string | number;
  stay: number;
  tags?: string[];
};

const properties: Property[] = [
  {
    id: "riverfront-02",
    alias: "Ganeshgudi Riverfront #02",
    location: "Near Kali River · 2.4 km",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85",
    riverDistance: "2.4 km to river",
    signal: "4G signal",
    rating: "4.8",
    stay: 3600,
    tags: ["riverside", "luxury"],
  },
  {
    id: "jungle-04",
    alias: "Eco-Jungle Homestay #04",
    location: "Kogilban · 5.1 km",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",
    riverDistance: "5.1 km to river",
    signal: "Limited signal",
    rating: "4.7",
    stay: 2850,
    tags: ["jungle", "peaceful"],
  },
  {
    id: "camp-07",
    alias: "Bison Valley Camp #07",
    location: "Dandeli forest edge · 7.8 km",
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=85",
    riverDistance: "7.8 km to river",
    signal: "4G signal",
    rating: "4.6",
    stay: 2400,
    tags: ["budget", "group"],
  },
];

const activities = [
  {
    id: "rafting",
    name: "White-water rafting",
    detail: "90 min · exclusive slot",
    price: 1450,
  },
  {
    id: "kayaking",
    name: "Sunrise kayaking",
    detail: "60 min · calm water",
    price: 850,
  },
  {
    id: "safari",
    name: "Tigress safari",
    detail: "3 hr · forest permit",
    price: 1200,
  },
];

function addDays(date: string, days: number) {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function getNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00.000Z`).getTime();
  const end = new Date(`${checkOut}T00:00:00.000Z`).getTime();
  return end > start ? Math.round((end - start) / 86_400_000) : 0;
}

type RemotePropertyState = {
  id: string;
  property?: Property;
  error?: string;
};

export function BookingWizard({
  initialPropertyId,
}: {
  initialPropertyId: string | null;
}) {
  const [selectedProperty, setSelectedProperty] = useState(
    initialPropertyId ?? properties[0].id,
  );
  const [selectedVibe, setSelectedVibe] = useState<string>("all");

  const [checkIn, setCheckIn] = useState(() =>
    addDays(new Date().toISOString().slice(0, 10), 1),
  );
  const [checkOut, setCheckOut] = useState(() =>
    addDays(new Date().toISOString().slice(0, 10), 3),
  );
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    "rafting",
  ]);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [requestError, setRequestError] = useState("");
  const [remotePropertyState, setRemotePropertyState] =
    useState<RemotePropertyState | null>(null);
  const nights = getNights(checkIn, checkOut);

  const localProperty = properties.find((item) => item.id === selectedProperty);
  const matchingRemoteState =
    remotePropertyState?.id === selectedProperty ? remotePropertyState : null;
  const property =
    localProperty ?? matchingRemoteState?.property ?? properties[0];
  const propertyError = matchingRemoteState?.error ?? "";
  const isPropertyLoading =
    !localProperty && !matchingRemoteState?.property && !propertyError;

  useEffect(() => {
    if (properties.some((item) => item.id === selectedProperty)) return;

    const controller = new AbortController();
    fetch(`/api/properties/${encodeURIComponent(selectedProperty)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error ?? "Property not found.");
        setRemotePropertyState({
          id: selectedProperty,
          property: {
            ...result.property,
            rating: String(result.property.rating),
            tags: result.property.tags ?? [],
          },
        });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setRemotePropertyState({
          id: selectedProperty,
          error: "We could not load this stay. Please choose another.",
        });
      });

    return () => controller.abort();
  }, [selectedProperty]);

  const activityTotal = activities
    .filter((activity) => selectedActivities.includes(activity.id))
    .reduce((total, activity) => total + activity.price * guests, 0);

  const stayTotal = property.stay * nights;
  const mealTotal = 550 * guests * nights;
  const total = stayTotal + mealTotal + activityTotal;
  const today = new Date().toISOString().slice(0, 10);
  const whatsappMessage = [
    "Hi Dandeli Direct, I'd like help planning this trip:",
    "",
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Guests: ${guests}`,
    `Stay: ${property.alias}`,
    `Activities: ${
      activities
        .filter((activity) => selectedActivities.includes(activity.id))
        .map((activity) => activity.name)
        .join(", ") || "Not decided yet"
    }`,
    `Estimated package: ₹${total.toLocaleString("en-IN")}`,
    "Budget or special requirements: [add here]",
    "Please confirm availability and share the final details.",
  ].join("\n");

  const nightsLabel = useMemo(
    () => `${nights} ${nights === 1 ? "night" : "nights"}`,
    [nights],
  );

  function toggleActivity(id: string) {
    setSelectedActivities((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function submitBookingRequest() {
    setRequestError("");
    try {
      const response = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedProperty,
          checkIn,
          checkOut,
          guests,
          guestName,
          guestPhone,
          activities: selectedActivities,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setRequestError(result.error ?? "Unable to send the booking request.");
        return;
      }
      setBookingId(result.requestId);
      setIsRequestSent(true);
    } catch {
      setRequestError("Network error. Please try again.");
    }
  }

  // Filter properties based on vibe
  const displayProperties = useMemo(() => {
    if (selectedVibe === "all") return properties;
    const matches = properties.filter((p) =>
      (p.tags ?? []).includes(selectedVibe),
    );
    const others = properties.filter(
      (p) => !(p.tags ?? []).includes(selectedVibe),
    );
    return [...matches, ...others];
  }, [selectedVibe]);

  // Handle vibe click
  const handleVibeChange = (vibe: string) => {
    setSelectedVibe(vibe);
    if (vibe !== "all") {
      const match = properties.find((p) => (p.tags ?? []).includes(vibe));
      if (match) setSelectedProperty(match.id);
    }
  };

  return (
    <div id="booking">
      {/* Search Bar / Properties */}
      <section className="mx-auto max-w-screen-xl px-6 py-20 md:px-12 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase text-[#ba633d]">
              Places to stay
            </p>
            <h2 className="font-serif text-4xl leading-tight text-[#18372f] md:text-6xl">
              Find your kind of place.
            </h2>
          </div>

          <div className="mt-8 md:mt-0 flex flex-col items-end">
            <span className="mb-3 block text-xs font-semibold uppercase text-[#65736b]">
              Filter by feel
            </span>
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={() => handleVibeChange("all")}
                className={`border px-4 py-2 text-sm font-semibold transition-colors ${selectedVibe === "all" ? "border-[#18372f] bg-[#18372f] text-white" : "border-[#cbd4cb] bg-transparent text-[#53645b] hover:border-[#18372f]"}`}
              >
                All Stays
              </button>
              <button
                onClick={() => handleVibeChange("riverside")}
                className={`border px-4 py-2 text-sm font-semibold transition-colors ${selectedVibe === "riverside" ? "border-[#18372f] bg-[#18372f] text-white" : "border-[#cbd4cb] bg-transparent text-[#53645b] hover:border-[#18372f]"}`}
              >
                Riverside
              </button>
              <button
                onClick={() => handleVibeChange("jungle")}
                className={`border px-4 py-2 text-sm font-semibold transition-colors ${selectedVibe === "jungle" ? "border-[#18372f] bg-[#18372f] text-white" : "border-[#cbd4cb] bg-transparent text-[#53645b] hover:border-[#18372f]"}`}
              >
                Forest
              </button>
              <button
                onClick={() => handleVibeChange("budget")}
                className={`border px-4 py-2 text-sm font-semibold transition-colors ${selectedVibe === "budget" ? "border-[#18372f] bg-[#18372f] text-white" : "border-[#cbd4cb] bg-transparent text-[#53645b] hover:border-[#18372f]"}`}
              >
                Under budget
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayProperties.map((item, index) => {
            const isTopMatch =
              selectedVibe !== "all" &&
              (item.tags ?? []).includes(selectedVibe) &&
              index === 0;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedProperty(item.id)}
                className={`overflow-hidden border text-left transition-colors duration-200 ${item.id === selectedProperty ? "border-[#ba633d] bg-white shadow-md" : "border-transparent bg-white hover:border-[#cbd4cb]"}`}
              >
                <div
                  className="h-64 relative bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  {isTopMatch ? (
                    <span className="absolute left-4 top-4 bg-[#fbfaf6] px-3 py-1.5 text-xs font-semibold text-[#18372f]">
                      A good fit
                    </span>
                  ) : (
                    <span className="absolute left-4 top-4 bg-[#fbfaf6] px-3 py-1.5 text-xs font-semibold text-[#18372f]">
                      Verified stay
                    </span>
                  )}
                  <span className="absolute right-4 top-4 bg-[#18372f] px-3 py-1.5 text-xs font-semibold text-white">
                    {item.rating} rating
                  </span>
                </div>
                <div className="relative bg-white p-6">
                  <span className="mb-2 block text-xs text-[#65736b]">
                    {item.location}
                  </span>
                  <h3 className="mb-4 font-serif text-2xl font-medium text-[#18372f]">
                    {item.alias}
                  </h3>
                  <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#65736b]">
                    <span>{item.riverDistance}</span>
                    <span>{item.signal}</span>
                  </div>
                  <strong className="block text-lg text-gray-900">
                    From ₹{item.stay.toLocaleString("en-IN")}{" "}
                    <small className="text-gray-500 font-normal">/ night</small>
                  </strong>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Builder Section */}
      <section className="bg-[#e9eeea] px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-16">
            <p className="mb-4 text-xs font-semibold uppercase text-[#ba633d]">
              Build your trip
            </p>
            <h2 className="max-w-xl font-serif text-4xl leading-tight text-[#18372f] md:text-6xl">
              Put the pieces together.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Controls */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 border-b border-[#b7cfc0] pb-4 mb-6">
                  <span className="text-[#d66c3c] font-mono font-bold">01</span>
                  <h3 className="text-2xl font-bold font-serif text-gray-900">
                    Your stay
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block">
                    Guests
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={guests}
                      onChange={(e) =>
                        setGuests(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="block w-full bg-transparent border-b border-[#9fbba8] py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#d66c3c] transition-colors mt-2"
                    />
                  </label>
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block">
                    Check-out
                    <input
                      type="date"
                      min={checkIn ? addDays(checkIn, 1) : addDays(today, 2)}
                      value={checkOut}
                      onChange={(event) => setCheckOut(event.target.value)}
                      className="block w-full bg-transparent border-b border-[#9fbba8] py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#d66c3c] transition-colors mt-2"
                    />
                  </label>
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block col-span-2 mt-4">
                    Check-in Date
                    <input
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(event) => {
                        const nextCheckIn = event.target.value;
                        setCheckIn(nextCheckIn);
                        if (checkOut <= nextCheckIn)
                          setCheckOut(addDays(nextCheckIn, 1));
                      }}
                      className="block w-full bg-transparent border-b border-[#9fbba8] py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#d66c3c] transition-colors mt-2"
                    />
                  </label>
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block col-span-2">
                    Your name
                    <input
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                      className="block w-full bg-transparent border-b border-[#9fbba8] py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#d66c3c] transition-colors mt-2"
                    />
                  </label>
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block col-span-2">
                    Phone number
                    <input
                      type="tel"
                      autoComplete="tel"
                      maxLength={24}
                      value={guestPhone}
                      onChange={(event) => setGuestPhone(event.target.value)}
                      className="block w-full bg-transparent border-b border-[#9fbba8] py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#d66c3c] transition-colors mt-2"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 border-b border-[#b7cfc0] pb-4 mb-6">
                  <span className="text-[#d66c3c] font-mono font-bold">02</span>
                  <h3 className="text-2xl font-bold font-serif text-gray-900">
                    Add an adventure
                  </h3>
                </div>

                <div className="space-y-2">
                  {activities.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => toggleActivity(activity.id)}
                      className="w-full flex items-center justify-between text-left py-4 border-b border-[#b7cfc0] hover:bg-[#c5dbce] transition-colors px-2 rounded -mx-2"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${selectedActivities.includes(activity.id) ? "bg-[#d66c3c] border-[#d66c3c] text-white" : "border-[#96b2a0]"}`}
                        >
                          {selectedActivities.includes(activity.id) ? "✓" : "+"}
                        </div>
                        <div>
                          <b className="block text-gray-900 font-bold">
                            {activity.name}
                          </b>
                          <small className="block text-gray-600 font-mono mt-1">
                            {activity.detail}
                          </small>
                        </div>
                      </div>
                      <strong className="font-mono text-gray-900">
                        ₹{activity.price.toLocaleString("en-IN")}
                      </strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Receipt Component (Glassmorphism styling) */}
            <div className="relative z-10 rounded-md border border-[#34584d] bg-[#18372f] p-7 text-white shadow-lg lg:col-span-5 lg:-mt-12 md:p-9">
              <div className="flex justify-between text-xs font-mono text-[#aac7b4] tracking-widest uppercase mb-8">
                <span>Your Estimate</span>
                <span className="text-[#93d0a8]">● Live update</span>
              </div>

              <h3 className="mb-2 font-serif text-3xl font-medium">
                {property.alias}
              </h3>
              <p className="text-[#a8c3b1] font-mono text-sm mb-8">
                {nightsLabel} · {guests} guests · Dandeli
              </p>
              {isPropertyLoading && (
                <p className="text-[#cadbce] text-sm mb-4">
                  Loading selected stay...
                </p>
              )}
              {propertyError && (
                <p role="alert" className="text-red-300 text-sm mb-4">
                  {propertyError}
                </p>
              )}

              <div className="space-y-4 border-t border-[#527765] pt-6 pb-6">
                <div className="flex justify-between text-sm font-mono text-[#bfd0c3]">
                  <span>Stay · {nightsLabel}</span>
                  <b className="text-white">
                    ₹{stayTotal.toLocaleString("en-IN")}
                  </b>
                </div>
                <div className="flex justify-between text-sm font-mono text-[#bfd0c3]">
                  <span>Meals · {nights} days</span>
                  <b className="text-white">
                    ₹{mealTotal.toLocaleString("en-IN")}
                  </b>
                </div>
                {selectedActivities.map((id) => {
                  const activity = activities.find((item) => item.id === id)!;
                  return (
                    <div
                      key={id}
                      className="flex justify-between text-sm font-mono text-[#bfd0c3]"
                    >
                      <span>{activity.name}</span>
                      <b className="text-white">
                        ₹{(activity.price * guests).toLocaleString("en-IN")}
                      </b>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-end border-t border-[#527765] pt-6 mb-8">
                <span className="font-mono text-sm text-[#bfd0c3]">
                  Total package
                </span>
                <strong className="text-3xl font-bold font-serif text-[#f2b98d]">
                  ₹{total.toLocaleString("en-IN")}
                </strong>
              </div>

              <p className="text-sm text-[#cadbce] mb-6 leading-relaxed">
                Estimated total: ₹{total.toLocaleString("en-IN")}. This sends a
                request to the host; availability and final details must be
                confirmed. No payment is taken.
              </p>

              <button
                onClick={submitBookingRequest}
                disabled={
                  isRequestSent ||
                  isPropertyLoading ||
                  !!propertyError ||
                  !guestName.trim() ||
                  !guestPhone.trim() ||
                  nights < 1
                }
                className="w-full bg-[#ba633d] px-6 py-4 text-left text-lg font-semibold text-white transition-colors hover:bg-[#a95333] disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isRequestSent
                  ? `Request sent · ${bookingId.slice(0, 8)}`
                  : "Send booking request"}
              </button>

              <p className="mt-5 text-center text-sm text-[#cadbce]">
                Prefer to discuss it?{" "}
                <TrackedWhatsAppLink
                  href={createWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white underline underline-offset-4"
                >
                  Send these details on WhatsApp
                </TrackedWhatsAppLink>
                <span className="mx-2">or</span>
                <a
                  href="tel:+917204113614"
                  className="font-semibold text-white underline underline-offset-4"
                >
                  call {CONTACT_PHONE_DISPLAY}
                </a>
              </p>

              {requestError && (
                <p
                  role="alert"
                  className="text-red-400 text-xs font-mono text-center mt-4"
                >
                  {requestError}
                </p>
              )}
              {isRequestSent && (
                <p
                  role="status"
                  className="text-[#cadbce] text-xs text-center mt-4"
                >
                  Request received. The host must confirm availability before
                  this becomes a booking.
                </p>
              )}
              <p className="text-[#8fae9d] font-mono text-[10px] text-center mt-4 tracking-widest uppercase">
                No payment · not yet confirmed
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
