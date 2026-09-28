export function TrustBadges() {
  return (
    <section className="bg-white border-b border-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
            🛡️
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Secure Escrow</h3>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">Your deposit is held safely until you verify the property at check-in.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
            📍
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Verified Local Hosts</h3>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">Every property is physically vetted. Get exact GPS pins upon booking.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
            💰
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Wholesale Pricing</h3>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">We bypass roadside agents to give you the true resort contract rates.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
