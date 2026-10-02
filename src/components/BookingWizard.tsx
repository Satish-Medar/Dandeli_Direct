"use client";

import { useEffect, useMemo, useState } from "react";
import { createWhatsAppUrl } from "@/lib/contact";
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

const stayStyles = [
  {
    propertyId: "camp-07",
    title: "Simple stay",
    description: "A simple place to relax and explore.",
  },
  {
    propertyId: "jungle-04",
    title: "Comfortable stay",
    description: "More comfort for an easy trip.",
  },
  {
    propertyId: "riverfront-02",
    title: "Luxury stay",
    description: "Extra comfort for a special getaway.",
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
    initialPropertyId ?? "",
  );
  const [selectedVibe, setSelectedVibe] = useState<string>("all");
  const [formPrompt, setFormPrompt] = useState<"stay" | "phone" | null>(null);

  const [checkIn, setCheckIn] = useState(() =>
    addDays(new Date().toISOString().slice(0, 10), 1),
  );
  const [checkOut, setCheckOut] = useState(() =>
    addDays(new Date().toISOString().slice(0, 10), 2),
  );
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [remotePropertyState, setRemotePropertyState] =
    useState<RemotePropertyState | null>(null);
  const nights = getNights(checkIn, checkOut);

  const localProperty = properties.find((item) => item.id === selectedProperty);
  const matchingRemoteState =
    remotePropertyState?.id === selectedProperty ? remotePropertyState : null;
  const property =
    localProperty ?? matchingRemoteState?.property ?? properties[2];
  const propertyError = matchingRemoteState?.error ?? "";
  const isPropertyLoading =
    Boolean(selectedProperty) &&
    !localProperty &&
    !matchingRemoteState?.property &&
    !propertyError;

  useEffect(() => {
    if (
      !selectedProperty ||
      properties.some((item) => item.id === selectedProperty)
    )
      return;

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
    "Hi Dandeli Direct, I'd like a quick stay quote:",
    "",
    `Name: ${guestName.trim() || "[your name]"}`,
    `Phone: ${guestPhone.trim() || "[your phone]"}`,
    `Stay: ${selectedProperty ? property.alias : "[choose a stay style]"}`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Guests: ${guests}`,
    `Activities: ${
      activities
        .filter((activity) => selectedActivities.includes(activity.id))
        .map((activity) => activity.name)
        .join(", ") || "Not decided yet"
    }`,
    `Estimated package: ${selectedProperty ? `₹${total.toLocaleString("en-IN")}` : "Please share a quote"}`,
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

  // Filter properties based on vibe
  const displayProperties = useMemo(() => {
    const sortedProperties = [...properties].sort((a, b) => a.stay - b.stay);
    if (selectedVibe === "all") return sortedProperties;
    const matches = sortedProperties.filter((p) =>
      (p.tags ?? []).includes(selectedVibe),
    );
    const others = sortedProperties.filter(
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
      <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-24">
        <section
          id="guest-request"
          className="guest-request-float relative z-10 isolate overflow-hidden rounded-[30px] border border-[#dfe5df] bg-white/90 px-2 py-24 shadow-[0_26px_60px_rgba(16,36,29,0.10)] sm:px-5 sm:py-20 md:px-14 md:py-16"
          aria-labelledby="guest-request-title"
        >
          <div className="relative z-10 mx-auto max-w-4xl px-10 sm:px-8 md:px-12">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase text-[#8a492f]">
                  Guest stay request
                </p>
                <h3
                  id="guest-request-title"
                  className="mt-1 font-serif text-2xl text-[#18372f]"
                >
                  Tell us what kind of stay you prefer
                </h3>
              </div>
              <p className="w-fit text-xs font-semibold text-[#18372f]">
                No booking fee · No advance payment
              </p>
            </div>

            <div className="mt-6">
              <fieldset id="stay-style-options">
                <legend className="mb-3 text-sm font-semibold text-[#18372f]">
                  1. Choose one stay type
                </legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
                  {stayStyles.map((style) => {
                    const isSelected = selectedProperty === style.propertyId;

                    return (
                      <label
                        key={style.propertyId}
                        className={`flex min-h-0 cursor-pointer flex-row items-center justify-between gap-3 border p-3 text-left transition-colors focus-within:ring-2 focus-within:ring-[#ba633d] sm:min-h-32 sm:flex-col sm:items-start sm:gap-0 sm:p-5 ${isSelected ? "border-[#ba633d] bg-[#f4e9df] shadow-[inset_0_0_0_1px_#ba633d]" : "border-[#b9c9bf] bg-white hover:border-[#18372f]"}`}
                      >
                        <input
                          type="radio"
                          name="stayStyle"
                          value={style.propertyId}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedProperty(style.propertyId);
                            setSelectedVibe("all");
                            setFormPrompt(null);
                          }}
                          className="sr-only"
                        />
                        <span>
                          <span className="block font-serif text-lg text-[#18372f] sm:text-xl">
                            {style.title}
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-[#65736b]">
                            {style.description}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-[#18372f] sm:mt-4 sm:text-sm">
                          {isSelected ? "Selected" : "Choose this"}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-[#65736b]">
                  Select one option before sending your request.
                </p>
              </fieldset>

              <div className="mt-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <p className="text-sm font-semibold text-[#18372f]">
                  2. Your details
                </p>
                <p className="text-sm text-[#65736b]">
                  {selectedProperty
                    ? `${property.alias} · ${nightsLabel} · ${guests} guests`
                    : "Choose a stay style above to continue"}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:mt-5 sm:gap-4 lg:grid-cols-4">
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#65736b]">
                  Your name
                  <input
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    className="mt-2 block min-h-12 w-full rounded-sm border border-[#a8b9ae] bg-white px-3 text-base font-normal normal-case text-[#18372f] outline-none focus:border-[#ba633d] focus:ring-1 focus:ring-[#ba633d]"
                  />
                </label>
                <div>
                  <label
                    htmlFor="guest-phone"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#65736b]"
                  >
                    Phone number
                  </label>
                  <input
                    id="guest-phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={24}
                    value={guestPhone}
                    aria-invalid={formPrompt === "phone"}
                    aria-describedby={
                      formPrompt === "phone" ? "phone-number-error" : undefined
                    }
                    onChange={(event) => {
                      setGuestPhone(event.target.value);
                      if (formPrompt === "phone" && event.target.value.trim())
                        setFormPrompt(null);
                    }}
                    className="mt-2 block min-h-12 w-full rounded-sm border border-[#a8b9ae] bg-white px-3 text-base font-normal normal-case text-[#18372f] outline-none focus:border-[#ba633d] focus:ring-1 focus:ring-[#ba633d]"
                  />
                  {formPrompt === "phone" && (
                    <p
                      id="phone-number-error"
                      role="alert"
                      className="mt-2 text-xs font-semibold text-[#a33d25]"
                    >
                      Enter your contact number to continue on WhatsApp.
                    </p>
                  )}
                </div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#65736b]">
                  Check-in
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
                    className="mt-2 block min-h-12 w-full rounded-sm border border-[#a8b9ae] bg-white px-3 text-base font-normal normal-case text-[#18372f] outline-none focus:border-[#ba633d] focus:ring-1 focus:ring-[#ba633d]"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#65736b]">
                  Guests
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={guests}
                    onChange={(event) =>
                      setGuests(
                        Math.min(
                          8,
                          Math.max(1, Number(event.target.value) || 1),
                        ),
                      )
                    }
                    className="mt-2 block min-h-12 w-full rounded-sm border border-[#a8b9ae] bg-white px-3 text-base font-normal normal-case text-[#18372f] outline-none focus:border-[#ba633d] focus:ring-1 focus:ring-[#ba633d]"
                  />
                </label>
              </div>

              <div className="mt-5">
                <TrackedWhatsAppLink
                  href={createWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-describedby={
                    formPrompt === "stay" ? "stay-type-error" : undefined
                  }
                  onClick={(event) => {
                    if (!selectedProperty) {
                      event.preventDefault();
                      setFormPrompt("stay");
                      document
                        .querySelector<HTMLInputElement>(
                          'input[name="stayStyle"]',
                        )
                        ?.focus();
                      return;
                    }
                    if (!guestPhone.trim()) {
                      event.preventDefault();
                      setFormPrompt("phone");
                      document.getElementById("guest-phone")?.focus();
                      return;
                    }
                    setFormPrompt(null);
                  }}
                  className="inline-flex min-h-12 w-full items-center justify-center bg-[#25D366] px-5 py-3 text-sm font-bold text-[#102c27] transition-colors hover:bg-[#62e38f]"
                >
                  Continue on WhatsApp
                </TrackedWhatsAppLink>
              </div>

              {formPrompt === "stay" && (
                <p
                  id="stay-type-error"
                  role="alert"
                  className="mt-3 border-l-2 border-[#ba633d] bg-[#f4e9df] px-3 py-2 text-sm font-semibold text-[#713d2c]"
                >
                  Please choose one of the three stay types before continuing.
                </p>
              )}

              <p className="mt-3 text-xs leading-5 text-[#65736b]">
                WhatsApp opens with your details. Review the message and tap
                Send.
              </p>
            </div>
          </div>
        </section>

        {selectedProperty && (
          <>
            <div className="mb-9 flex flex-col items-start justify-between gap-6 md:mb-12 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase text-[#ba633d] sm:mb-4">
                  Places to stay
                </p>
                <h2 className="font-serif text-3xl leading-tight text-[#18372f] sm:text-4xl md:text-6xl">
                  Find your kind of place.
                </h2>
              </div>

              <div className="flex w-full flex-col items-start md:w-auto md:items-end">
                <span className="mb-3 block text-xs font-semibold uppercase text-[#65736b]">
                  Filter by feel
                </span>
                <div className="flex flex-wrap justify-start gap-2 md:justify-end">
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

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
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
                      className="relative h-48 bg-cover bg-center sm:h-56 md:h-64"
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
                    <div className="relative min-w-0 bg-white p-4 sm:p-6">
                      <span className="mb-2 block text-xs text-[#65736b]">
                        {item.location}
                      </span>
                      <h3 className="mb-3 break-words font-serif text-xl font-medium text-[#18372f] sm:mb-4 sm:text-2xl">
                        {item.alias}
                      </h3>
                      <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#65736b]">
                        <span>{item.riverDistance}</span>
                        <span>{item.signal}</span>
                      </div>
                      <strong className="block text-base text-gray-900 sm:text-lg">
                        From ₹{item.stay.toLocaleString("en-IN")}{" "}
                        <small className="text-gray-500 font-normal">
                          / night
                        </small>
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Builder Section */}
      {selectedProperty && (
        <section className="bg-[#e9eeea] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-24">
          <div className="mx-auto max-w-screen-xl">
            <div className="mb-10 sm:mb-16">
              <p className="mb-4 text-xs font-semibold uppercase text-[#ba633d]">
                Build your trip
              </p>
              <h2 className="max-w-xl font-serif text-3xl leading-tight text-[#18372f] sm:text-4xl md:text-6xl">
                Put the pieces together.
              </h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 md:gap-12 lg:grid-cols-12">
              {/* Controls */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:col-span-7">
                <div>
                  <div className="flex items-center gap-3 border-b border-[#b7cfc0] pb-4 mb-6">
                    <span className="text-[#d66c3c] font-mono font-bold">
                      01
                    </span>
                    <h3 className="text-2xl font-bold font-serif text-gray-900">
                      Your stay
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
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
                    <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block col-span-1 mt-4 min-[480px]:col-span-2">
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
                    <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block col-span-1 min-[480px]:col-span-2">
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
                    <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block col-span-1 min-[480px]:col-span-2">
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
                    <span className="text-[#d66c3c] font-mono font-bold">
                      02
                    </span>
                    <h3 className="text-2xl font-bold font-serif text-gray-900">
                      Add an adventure
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => toggleActivity(activity.id)}
                        className="-mx-2 flex w-full items-center justify-between gap-3 border-b border-[#b7cfc0] px-2 py-4 text-left transition-colors hover:bg-[#c5dbce]"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${selectedActivities.includes(activity.id) ? "bg-[#d66c3c] border-[#d66c3c] text-white" : "border-[#96b2a0]"}`}
                          >
                            {selectedActivities.includes(activity.id)
                              ? "✓"
                              : "+"}
                          </div>
                          <div className="min-w-0">
                            <b className="block text-gray-900 font-bold">
                              {activity.name}
                            </b>
                            <small className="block text-gray-600 font-mono mt-1">
                              {activity.detail}
                            </small>
                          </div>
                        </div>
                        <strong className="shrink-0 font-mono text-sm text-gray-900 sm:text-base">
                          ₹{activity.price.toLocaleString("en-IN")}
                        </strong>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Receipt Component (Glassmorphism styling) */}
              <div className="relative z-10 rounded-md border border-[#34584d] bg-[#18372f] p-5 text-white shadow-lg sm:p-7 md:p-9 lg:col-span-5 lg:-mt-12">
                <div className="flex justify-between text-xs font-mono text-[#aac7b4] tracking-widest uppercase mb-8">
                  <span>Your Estimate</span>
                  <span className="text-[#93d0a8]">● Live update</span>
                </div>

                <h3 className="mb-2 break-words font-serif text-2xl font-medium sm:text-3xl">
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
                  <div className="flex justify-between gap-3 text-sm font-mono text-[#bfd0c3]">
                    <span className="min-w-0">Stay · {nightsLabel}</span>
                    <b className="shrink-0 text-white">
                      ₹{stayTotal.toLocaleString("en-IN")}
                    </b>
                  </div>
                  <div className="flex justify-between gap-3 text-sm font-mono text-[#bfd0c3]">
                    <span className="min-w-0">Meals · {nights} days</span>
                    <b className="shrink-0 text-white">
                      ₹{mealTotal.toLocaleString("en-IN")}
                    </b>
                  </div>
                  {selectedActivities.map((id) => {
                    const activity = activities.find((item) => item.id === id)!;
                    return (
                      <div
                        key={id}
                        className="flex justify-between gap-3 text-sm font-mono text-[#bfd0c3]"
                      >
                        <span className="min-w-0">{activity.name}</span>
                        <b className="shrink-0 text-white">
                          ₹{(activity.price * guests).toLocaleString("en-IN")}
                        </b>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-8 flex items-end justify-between gap-3 border-t border-[#527765] pt-6">
                  <span className="font-mono text-sm text-[#bfd0c3]">
                    Total package
                  </span>
                  <strong className="shrink-0 text-2xl font-bold font-serif text-[#f2b98d] sm:text-3xl">
                    ₹{total.toLocaleString("en-IN")}
                  </strong>
                </div>

                <p className="text-sm text-[#cadbce] mb-6 leading-relaxed">
                  Estimated total: ₹{total.toLocaleString("en-IN")}. This is an
                  estimate; the host must confirm availability and final
                  details.
                </p>
                <p className="text-[#8fae9d] font-mono text-[10px] text-center mt-4 tracking-widest uppercase">
                  No payment · not yet confirmed
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
