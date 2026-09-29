"use client";

import { useState } from "react";
import Link from "next/link";

type BookingRequest = {
  request_id: string;
  status: "REQUESTED" | "CONFIRMED" | "DECLINED" | "CANCELLED";
  guest_name: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  activity_ids: string[];
  estimated_amount: number;
  created_at: string;
  properties: { alias: string } | { alias: string }[] | null;
};

export default function AdminPage() {
  const [formData, setFormData] = useState({
    alias: "",
    exactName: "",
    managerPhone: "",
    location: "",
    image: "",
    riverDistance: "",
    signal: "4G signal",
    rating: "5.0",
    stay: "",
    directRackRate: "",
    tags: "",
  });

  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestQueueMessage, setRequestQueueMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "info", message: "Saving property..." });

    try {
      const response = await fetch("/api/admin/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-api-key": adminKey,
        },
        body: JSON.stringify({
          alias: formData.alias,
          exactName: formData.exactName,
          managerPhone: formData.managerPhone,
          location: formData.location,
          image: formData.image,
          riverDistance: formData.riverDistance,
          signal: formData.signal,
          rating: formData.rating,
          wholesaleRate: formData.stay,
          directRackRate: formData.directRackRate,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to save property.");

      setStatus({
        type: "success",
        message: result.richFieldsSaved
          ? `Property saved and searchable as ${result.slug}.`
          : `Property saved and searchable as ${result.slug}. Run the rich-fields migration to save tags and numeric river distance.`,
      });
      setFormData({
        alias: "",
        exactName: "",
        managerPhone: "",
        location: "",
        image: "",
        riverDistance: "",
        signal: "4G signal",
        rating: "5.0",
        stay: "",
        directRackRate: "",
        tags: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to save property.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function loadBookingRequests() {
    setIsLoadingRequests(true);
    setRequestQueueMessage("");
    try {
      const response = await fetch("/api/admin/booking-requests", {
        headers: { "x-admin-api-key": adminKey },
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to load requests.");
      setBookingRequests(result.requests ?? []);
    } catch (error) {
      setRequestQueueMessage(
        error instanceof Error ? error.message : "Unable to load requests.",
      );
    } finally {
      setIsLoadingRequests(false);
    }
  }

  async function updateBookingRequest(
    requestId: string,
    nextStatus: "CONFIRMED" | "DECLINED",
  ) {
    setRequestQueueMessage("");
    try {
      const response = await fetch("/api/admin/booking-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-api-key": adminKey,
        },
        body: JSON.stringify({ requestId, status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to update request.");
      setBookingRequests((current) =>
        current.map((item) =>
          item.request_id === requestId
            ? { ...item, status: result.request.status }
            : item,
        ),
      );
    } catch (error) {
      setRequestQueueMessage(
        error instanceof Error ? error.message : "Unable to update request.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] pb-24 font-sans text-[#18372f]">
      {/* Admin Header */}
      <header className="flex items-center justify-between border-b border-white/20 bg-[#18372f] px-6 py-5 text-white md:px-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-serif text-xl hover:opacity-80">
            Dandeli <em className="font-normal">Direct</em>
          </Link>
          <span className="border-l border-white/25 pl-4 text-xs text-white/75">
            ADMIN PORTAL
          </span>
        </div>
        <Link
          href="/"
          className="text-sm text-white/75 transition-colors hover:text-white"
        >
          Guest site
        </Link>
      </header>

      <div className="max-w-4xl mx-auto mt-12 px-6">
        <div className="mb-8">
          <p className="text-[#d66c3c] font-mono text-sm tracking-widest font-semibold mb-2 uppercase">
            Inventory Management
          </p>
          <h1 className="text-4xl font-bold font-serif text-gray-900">
            Add New Resort
          </h1>
          <p className="text-gray-500 mt-2">
            Enter the verified details below. The exact name will be masked
            until deposit payment.
          </p>
        </div>

        <div className="border border-[#d5ddd5] bg-white p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                Admin Access Key
              </label>
              <input
                type="password"
                name="adminKey"
                required
                autoComplete="current-password"
                value={adminKey}
                onChange={(event) => setAdminKey(event.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    Basic Details
                  </h3>
                  <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                    Masked Alias
                  </label>
                  <input
                    type="text"
                    name="alias"
                    required
                    placeholder="e.g., Eco-Jungle Homestay #04"
                    value={formData.alias}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    This is what guests will see before payment.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                    Exact Property Name
                  </label>
                  <input
                    type="text"
                    name="exactName"
                    required
                    value={formData.exactName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                    Location Summary
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="e.g., Near Kali River · 2.4 km"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                    Manager Phone
                  </label>
                  <input
                    type="tel"
                    name="managerPhone"
                    required
                    value={formData.managerPhone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                  />
                </div>
              </div>

              {/* Specs & Pricing */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    Specs & Pricing
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                        River Distance
                      </label>
                      <input
                        type="text"
                        name="riverDistance"
                        required
                        placeholder="e.g., 2.4 km"
                        value={formData.riverDistance}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                        Wholesale Rate (₹)
                      </label>
                      <input
                        type="number"
                        name="stay"
                        required
                        placeholder="3600"
                        value={formData.stay}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                      Network Signal
                    </label>
                    <select
                      name="signal"
                      value={formData.signal}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] transition-all"
                    >
                      <option value="4G signal">4G signal</option>
                      <option value="Limited signal">Limited signal</option>
                      <option value="No signal">No signal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                      Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      name="rating"
                      required
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                    Vibe Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="e.g., riverside, luxury, budget"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Comma separated. Used for the recommendation engine.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">
                    Direct Rack Rate (₹)
                  </label>
                  <input
                    type="number"
                    name="directRackRate"
                    min={formData.stay || 0}
                    step="1"
                    required
                    value={formData.directRackRate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#d66c3c] focus:ring-1 focus:ring-[#d66c3c] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Status Message */}
            {status.message && (
              <div
                className={`border p-4 text-sm font-medium ${
                  status.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : status.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-[#cbd4cb] bg-[#f4f1e8] text-[#53645b]"
                }`}
              >
                <span className="mr-2 font-semibold uppercase">
                  {status.type === "success"
                    ? "Saved"
                    : status.type === "error"
                      ? "Issue"
                      : "Working"}
                </span>
                {status.message}
              </div>
            )}

            {/* Submit */}
            <div className="border-t border-gray-100 pt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#18372f] px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#356e59] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save Property"}
              </button>
            </div>
          </form>
        </div>
        <section className="mt-10 bg-white border border-gray-200 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <p className="text-[#d66c3c] font-mono text-xs tracking-widest uppercase mb-2">
                Unpaid requests
              </p>
              <h2 className="text-2xl font-bold font-serif text-gray-900">
                Guest booking requests
              </h2>
            </div>
            <button
              type="button"
              onClick={loadBookingRequests}
              disabled={!adminKey || isLoadingRequests}
              className="bg-[#143d32] hover:bg-[#1e5a44] disabled:opacity-60 text-white px-5 py-3 font-bold"
            >
              {isLoadingRequests ? "Loading..." : "Load requests"}
            </button>
          </div>
          {requestQueueMessage && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {requestQueueMessage}
            </p>
          )}
          {!isLoadingRequests && bookingRequests.length === 0 ? (
            <p className="py-8 text-sm text-gray-500">
              Load the queue to see new guest requests.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookingRequests.map((request) => {
                const property = Array.isArray(request.properties)
                  ? request.properties[0]
                  : request.properties;
                return (
                  <article
                    key={request.request_id}
                    className="grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-gray-900">
                          {property?.alias ?? "Property"}
                        </h3>
                        <span className="text-xs font-mono text-gray-500">
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">
                        {request.guest_name} · {request.guest_phone}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {request.check_in} to {request.check_out} ·{" "}
                        {request.guests} guests · {request.nights} nights ·
                        estimate ₹
                        {request.estimated_amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                    {request.status === "REQUESTED" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateBookingRequest(
                              request.request_id,
                              "CONFIRMED",
                            )
                          }
                          className="bg-[#143d32] px-4 py-2 text-sm font-bold text-white"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBookingRequest(request.request_id, "DECLINED")
                          }
                          className="border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
