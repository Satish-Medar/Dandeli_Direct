"use client";

import { useState } from "react";
import Link from "next/link";

type Property = {
  id: string;
  alias: string;
  location: string;
  image: string;
  riverDistance: string;
  signal: string;
  rating: number;
  stay: number;
  tags?: string[];
  amenities?: string[];
  activitiesOffered?: string[];
  mealsIncluded?: string[];
  foodType?: string;
  petFriendly?: boolean;
  coupleFriendly?: boolean;
  familyFriendly?: boolean;
  wifiAvailable?: boolean;
  distanceToRiverKm?: number;
  stayType?: string;
  category?: string;
  reviewCount?: number;
  nearestLandmark?: string;
  googleMapsUrl?: string;
};

export default function MatchPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [budget, setBudget] = useState(5000);
  const [maxDistance, setMaxDistance] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Property[]>([]);
  const [searchError, setSearchError] = useState("");
  const [distanceFallback, setDistanceFallback] = useState(false);

  async function handleSearch() {
    setIsSearching(true);
    setStep(2);
    setSearchError("");
    setResults([]);
    setDistanceFallback(false);

    try {
      const parameters = new URLSearchParams({
        target_rate: String(budget),
        max_distance_km: String(maxDistance),
      });
      const response = await fetch(`/api/properties/search?${parameters}`);
      if (!response.ok)
        throw new Error("Property search is temporarily unavailable.");
      const data = await response.json();
      setResults(data.properties ?? []);
      setDistanceFallback(data.distanceFallback ?? false);
    } catch {
      setSearchError("Search is temporarily unavailable. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] pb-24 font-sans text-[#18372f]">
      <header className="flex items-center justify-between border-b border-white/20 bg-[#18372f] px-6 py-5 text-white md:px-12">
        <Link href="/" className="font-serif text-xl hover:opacity-80">
          Dandeli <em className="font-normal">Direct</em>
        </Link>
        <span className="text-xs text-white/75">Resort matchmaker</span>
      </header>

      <div className="mx-auto mt-12 max-w-4xl px-6">
        {step === 1 ? (
          <section className="overflow-hidden border border-[#d5ddd5] bg-white">
            <div className="bg-[#18372f] px-7 py-9 md:px-10">
              <p className="mb-3 text-xs font-semibold uppercase text-[#edb27f]">
                Find a stay
              </p>
              <h1 className="font-serif text-3xl font-medium text-white md:text-4xl">
                Start with your budget and the river.
              </h1>
              <p className="mt-3 max-w-lg text-base leading-6 text-white/75">
                Set a nightly price and how far you would like to be from the
                water. We will show the closest matches.
              </p>
            </div>

            <div className="space-y-9 p-7 md:p-10">
              <label className="block text-sm font-semibold text-[#18372f]">
                Target budget per night
                <span className="mt-3 flex items-center justify-between text-xs font-normal text-[#65736b]">
                  <span>₹1,000</span>
                  <strong className="text-xl font-semibold text-[#18372f]">
                    ₹{budget.toLocaleString("en-IN")}
                  </strong>
                  <span>₹10,000</span>
                </span>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="100"
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  className="mt-2 w-full accent-[#ba633d]"
                />
              </label>

              <label className="block text-sm font-semibold text-[#18372f]">
                Preferred distance from the river
                <span className="mt-3 flex items-center justify-between text-xs font-normal text-[#65736b]">
                  <span>1 km</span>
                  <strong className="font-semibold text-[#18372f]">
                    Within {maxDistance} km
                  </strong>
                  <span>15 km</span>
                </span>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={maxDistance}
                  onChange={(event) =>
                    setMaxDistance(Number(event.target.value))
                  }
                  className="mt-2 w-full accent-[#ba633d]"
                />
              </label>

              <button
                onClick={handleSearch}
                className="w-full bg-[#ba633d] py-4 text-left text-lg font-semibold text-white transition-colors hover:bg-[#a95333]"
              >
                Show matching stays
              </button>
            </div>
          </section>
        ) : (
          <section>
            <button
              onClick={() => setStep(1)}
              className="mb-6 text-sm font-semibold text-[#8f482e] underline underline-offset-4"
            >
              Edit requirements
            </button>

            <div className="mb-8 border-b border-[#d5ddd5] pb-6">
              <p className="mb-3 text-xs font-semibold uppercase text-[#ba633d]">
                Your shortlist
              </p>
              <h1 className="font-serif text-3xl font-medium text-[#18372f]">
                Stays near your budget
              </h1>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#53645b]">
                <span>₹{budget.toLocaleString("en-IN")} per night</span>
                <span>Within {maxDistance} km of the river</span>
              </div>
            </div>

            {isSearching ? (
              <p
                role="status"
                className="border-y border-[#d5ddd5] py-12 text-sm text-[#53645b]"
              >
                Looking for stays within your price and distance range…
              </p>
            ) : searchError ? (
              <div role="alert" className="border border-red-200 bg-white p-8">
                <h2 className="font-serif text-2xl font-medium text-[#18372f]">
                  We could not complete that search
                </h2>
                <p className="mt-2 text-sm text-[#53645b]">{searchError}</p>
                <button
                  onClick={handleSearch}
                  className="mt-5 border border-[#ba633d] px-5 py-2.5 font-semibold text-[#8f482e] transition-colors hover:bg-[#f4e9df]"
                >
                  Try again
                </button>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-5">
                {distanceFallback && (
                  <p
                    role="status"
                    className="border-l-2 border-[#ba633d] bg-[#f4e9df] px-4 py-3 text-sm text-[#5c4335]"
                  >
                    No stays were found within {maxDistance} km. These are the
                    closest budget matches instead.
                  </p>
                )}
                {results.map((property, index) => (
                  <article
                    key={property.id}
                    className={`flex flex-col overflow-hidden border bg-white md:flex-row ${index === 0 ? "border-[#ba633d]" : "border-[#d5ddd5]"}`}
                  >
                    <div
                      role="img"
                      aria-label={property.alias}
                      className="min-h-56 bg-cover bg-center md:w-2/5"
                      style={{ backgroundImage: `url(${property.image})` }}
                    />
                    <div className="flex flex-1 flex-col justify-between p-6 md:p-7">
                      <div>
                        <div className="flex items-start justify-between gap-4 text-xs text-[#65736b]">
                          <span>{property.category || property.location}</span>
                          <span className="shrink-0 font-semibold text-[#18372f]">
                            {property.rating} rating
                          </span>
                        </div>
                        <h2 className="mt-2 font-serif text-2xl font-medium text-[#18372f]">
                          {property.alias}
                        </h2>
                        {property.stayType && (
                          <p className="mt-1 text-sm font-semibold text-[#8f482e]">
                            {property.stayType}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#65736b]">
                          <span>{property.riverDistance}</span>
                          <span>{property.signal}</span>
                          {property.wifiAvailable && <span>Wi-Fi</span>}
                          {property.petFriendly && <span>Pets welcome</span>}
                          {property.reviewCount ? (
                            <span>{property.reviewCount} reviews</span>
                          ) : null}
                        </div>

                        {property.tags && property.tags.length > 0 && (
                          <p className="mt-3 text-xs text-[#53645b]">
                            {property.tags.slice(0, 5).join(" · ")}
                          </p>
                        )}
                        {property.activitiesOffered &&
                          property.activitiesOffered.length > 0 && (
                            <p className="mt-2 text-xs text-[#53645b]">
                              <strong>Activities:</strong>{" "}
                              {property.activitiesOffered
                                .slice(0, 3)
                                .join(" · ")}
                            </p>
                          )}
                        {property.mealsIncluded &&
                          property.mealsIncluded.length > 0 && (
                            <p className="mt-1 text-xs text-[#53645b]">
                              <strong>Meals:</strong>{" "}
                              {property.mealsIncluded.join(", ")} included
                            </p>
                          )}
                      </div>

                      <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[#d5ddd5] pt-5 sm:flex-row sm:items-end">
                        <div>
                          <span className="block text-xs text-[#65736b]">
                            Nightly rate
                          </span>
                          <strong className="mt-1 block text-2xl font-semibold text-[#18372f]">
                            ₹{property.stay.toLocaleString("en-IN")}
                            <small className="ml-1 text-sm font-normal text-[#65736b]">
                              per night
                            </small>
                          </strong>
                          <small className="mt-1 block text-xs text-[#65736b]">
                            {property.stay === budget
                              ? "At your target"
                              : `₹${Math.abs(property.stay - budget).toLocaleString("en-IN")} ${property.stay < budget ? "below" : "above"} target`}
                          </small>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {property.googleMapsUrl && (
                            <a
                              href={property.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="border border-[#cbd4cb] px-4 py-2.5 text-sm font-semibold text-[#53645b] transition-colors hover:border-[#18372f]"
                            >
                              View map
                            </a>
                          )}
                          <Link
                            href={`/?property=${property.id}#booking`}
                            className="bg-[#18372f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#356e59]"
                          >
                            View this stay
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="border border-[#d5ddd5] bg-white p-8">
                <h2 className="font-serif text-2xl font-medium text-[#18372f]">
                  No stays match those details yet
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#53645b]">
                  Try widening your budget or river distance to see more
                  options.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-5 border border-[#ba633d] px-5 py-2.5 font-semibold text-[#8f482e] transition-colors hover:bg-[#f4e9df]"
                >
                  Adjust requirements
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
