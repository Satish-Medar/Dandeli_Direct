"use client";

import { useMemo, useState } from "react";

type Property = {
  id: string;
  alias: string;
  location: string;
  image: string;
  riverDistance: string;
  signal: string;
  rating: string;
  stay: number;
};

const properties: Property[] = [
  {
    id: "riverfront-02",
    alias: "Ganeshgudi Riverfront #02",
    location: "Near Kali River · 2.4 km",
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85",
    riverDistance: "2.4 km to river",
    signal: "4G signal",
    rating: "4.8",
    stay: 3600,
  },
  {
    id: "jungle-04",
    alias: "Eco-Jungle Homestay #04",
    location: "Kogilban · 5.1 km",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",
    riverDistance: "5.1 km to river",
    signal: "Limited signal",
    rating: "4.7",
    stay: 2850,
  },
  {
    id: "camp-07",
    alias: "Bison Valley Camp #07",
    location: "Dandeli forest edge · 7.8 km",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=85",
    riverDistance: "7.8 km to river",
    signal: "4G signal",
    rating: "4.6",
    stay: 2400,
  },
];

const activities = [
  { id: "rafting", name: "White-water rafting", detail: "90 min · exclusive slot", price: 1450 },
  { id: "kayaking", name: "Sunrise kayaking", detail: "60 min · calm water", price: 850 },
  { id: "safari", name: "Tigress safari", detail: "3 hr · forest permit", price: 1200 },
];

export function BookingWizard() {
  const [selectedProperty, setSelectedProperty] = useState(properties[0].id);
  const [checkIn, setCheckIn] = useState("2026-06-18");
  const [checkOut, setCheckOut] = useState("2026-06-20");
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(2);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(["rafting"]);
  const [isHeld, setIsHeld] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [holdError, setHoldError] = useState("");

  const property = properties.find((item) => item.id === selectedProperty) ?? properties[0];
  
  const activityTotal = activities
    .filter((activity) => selectedActivities.includes(activity.id))
    .reduce((total, activity) => total + activity.price * guests, 0);
    
  const stayTotal = property.stay * nights;
  const mealTotal = 550 * guests * nights;
  const platformFee = 200 * guests;
  const total = stayTotal + mealTotal + activityTotal + platformFee;
  const deposit = Math.round(total * 0.25);

  const nightsLabel = useMemo(() => `${nights} ${nights === 1 ? "night" : "nights"}`, [nights]);

  function toggleActivity(id: string) {
    setSelectedActivities((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function holdPackage() {
    setHoldError("");
    try {
      const lockResponse = await fetch("/api/bookings/lock-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: selectedProperty, checkIn, checkOut }),
      });
      const lock = await lockResponse.json();
      if (!lockResponse.ok) {
        setHoldError(lock.error ?? "This room is temporarily unavailable.");
        return;
      }
      
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedProperty,
          checkIn,
          checkOut,
          guests,
          nights,
          activities: selectedActivities,
          lockToken: lock.lockToken,
          guestName: "Dandeli guest",
          guestPhone: "",
        }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) {
        setHoldError(order.error ?? "Unable to create the booking hold.");
        return;
      }
      setBookingId(order.bookingId);
      setIsHeld(true);
    } catch (e) {
      setHoldError("Network error. Please try again.");
    }
  }

  return (
    <div id="booking">
      {/* Search Bar / Properties */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <p className="text-[#d66c3c] font-mono text-sm tracking-widest font-semibold mb-4 uppercase">Stays without the static</p>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 leading-tight">Somewhere<br /><i className="text-[#e19a6e]">real.</i></h2>
          </div>
          <p className="text-gray-500 font-mono text-sm mt-6 md:mt-0 max-w-xs text-right">No mystery names. No roadside markups. <strong>Just verified Dandeli.</strong></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedProperty(item.id)}
              className={`text-left rounded-2xl overflow-hidden transition-all duration-300 border-2 ${item.id === selectedProperty ? 'border-[#d66c3c] shadow-lg scale-[1.02]' : 'border-transparent hover:border-gray-200'}`}
            >
              <div className="h-64 relative bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">Verified stay</span>
                <span className="absolute top-4 right-4 bg-[#143d32] text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm">★ {item.rating}</span>
              </div>
              <div className="p-6 bg-white">
                <span className="text-xs font-mono text-gray-500 tracking-wider uppercase block mb-2">{item.location}</span>
                <h3 className="text-xl font-bold font-serif text-gray-900 mb-4">{item.alias}</h3>
                <div className="flex gap-4 text-xs font-mono text-gray-500 mb-6">
                  <span className="flex items-center gap-1">📍 {item.riverDistance}</span>
                  <span className="flex items-center gap-1">📶 {item.signal}</span>
                </div>
                <strong className="block text-lg text-gray-900">
                  From ₹{item.stay.toLocaleString("en-IN")} <small className="text-gray-500 font-normal">/ night</small>
                </strong>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Builder Section */}
      <section className="bg-[#dfeee5] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[#1e5a44] font-mono text-sm tracking-widest font-semibold mb-4 uppercase">Plan the details</p>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 leading-tight">Make it<br /><i className="text-[#1e5a44]">yours.</i></h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Controls */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-12">
              
              <div>
                <div className="flex items-center gap-3 border-b border-[#b7cfc0] pb-4 mb-6">
                  <span className="text-[#d66c3c] font-mono font-bold">01</span>
                  <h3 className="text-2xl font-bold font-serif text-gray-900">Your stay</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block">
                    Guests
                    <input
                      type="number"
                      min="1" max="8"
                      value={guests}
                      onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                      className="block w-full bg-transparent border-b border-[#9fbba8] py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#d66c3c] transition-colors mt-2"
                    />
                  </label>
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block">
                    Nights
                    <select
                      value={nights}
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="block w-full bg-transparent border-b border-[#9fbba8] py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#d66c3c] transition-colors mt-2"
                    >
                      <option value={1}>1 night</option>
                      <option value={2}>2 nights</option>
                      <option value={3}>3 nights</option>
                      <option value={4}>4 nights</option>
                    </select>
                  </label>
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-wider block col-span-2 mt-4">
                    Check-in Date
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="block w-full bg-transparent border-b border-[#9fbba8] py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#d66c3c] transition-colors mt-2"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 border-b border-[#b7cfc0] pb-4 mb-6">
                  <span className="text-[#d66c3c] font-mono font-bold">02</span>
                  <h3 className="text-2xl font-bold font-serif text-gray-900">Add an adventure</h3>
                </div>
                
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => toggleActivity(activity.id)}
                      className="w-full flex items-center justify-between text-left py-4 border-b border-[#b7cfc0] hover:bg-[#c5dbce] transition-colors px-2 rounded -mx-2"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${selectedActivities.includes(activity.id) ? 'bg-[#d66c3c] border-[#d66c3c] text-white' : 'border-[#96b2a0]'}`}>
                          {selectedActivities.includes(activity.id) ? "✓" : "+"}
                        </div>
                        <div>
                          <b className="block text-gray-900 font-bold">{activity.name}</b>
                          <small className="block text-gray-600 font-mono mt-1">{activity.detail}</small>
                        </div>
                      </div>
                      <strong className="font-mono text-gray-900">₹{activity.price.toLocaleString("en-IN")}</strong>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Receipt Component (Glassmorphism styling) */}
            <div className="lg:col-span-5 bg-[#143d32] text-white p-8 rounded-3xl shadow-2xl relative lg:-mt-24 z-10 border border-[#1e5a44] backdrop-blur-md bg-opacity-95">
              <div className="flex justify-between text-xs font-mono text-[#aac7b4] tracking-widest uppercase mb-8">
                <span>Your Estimate</span>
                <span className="text-[#93d0a8]">● Live update</span>
              </div>
              
              <h3 className="text-3xl font-bold font-serif mb-2">{property.alias}</h3>
              <p className="text-[#a8c3b1] font-mono text-sm mb-8">{nightsLabel} · {guests} guests · Dandeli</p>
              
              <div className="space-y-4 border-t border-[#527765] pt-6 pb-6">
                <div className="flex justify-between text-sm font-mono text-[#bfd0c3]">
                  <span>Stay · {nightsLabel}</span>
                  <b className="text-white">₹{stayTotal.toLocaleString("en-IN")}</b>
                </div>
                <div className="flex justify-between text-sm font-mono text-[#bfd0c3]">
                  <span>Meals · {nights} days</span>
                  <b className="text-white">₹{mealTotal.toLocaleString("en-IN")}</b>
                </div>
                {selectedActivities.map((id) => {
                  const activity = activities.find((item) => item.id === id)!;
                  return (
                    <div key={id} className="flex justify-between text-sm font-mono text-[#bfd0c3]">
                      <span>{activity.name}</span>
                      <b className="text-white">₹{(activity.price * guests).toLocaleString("en-IN")}</b>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm font-mono text-[#bfd0c3]">
                  <span>Platform fee · ₹200 × {guests}</span>
                  <b className="text-white">₹{platformFee.toLocaleString("en-IN")}</b>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-[#527765] pt-6 mb-8">
                <span className="font-mono text-sm text-[#bfd0c3]">Total package</span>
                <strong className="text-3xl font-bold font-serif text-[#f2b98d]">₹{total.toLocaleString("en-IN")}</strong>
              </div>

              <p className="text-sm text-[#cadbce] mb-6 leading-relaxed">
                Pay ₹{deposit.toLocaleString("en-IN")} deposit to unlock exact property details and secure your dates.
              </p>

              <button
                onClick={holdPackage}
                disabled={isHeld}
                className="w-full bg-[#d66c3c] hover:bg-[#c55d31] disabled:opacity-75 disabled:cursor-not-allowed transition-colors text-white py-4 px-6 rounded-xl font-bold text-lg flex justify-between items-center shadow-lg"
              >
                {isHeld ? `Booking held · ${bookingId.slice(0, 8)}` : "Hold this package"}
                <span className="text-2xl font-normal leading-none">→</span>
              </button>
              
              {holdError && <p className="text-red-400 text-xs font-mono text-center mt-4">{holdError}</p>}
              <p className="text-[#8fae9d] font-mono text-[10px] text-center mt-4 tracking-widest uppercase">
                No payment yet · 10-minute inventory hold
              </p>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
