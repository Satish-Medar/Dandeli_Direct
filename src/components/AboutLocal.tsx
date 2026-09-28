export function AboutLocal() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="order-2 lg:order-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl overflow-hidden h-[300px] mt-8">
              <img 
                src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=800&q=80" 
                alt="Local team inspecting a resort" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-3xl overflow-hidden h-[340px]">
              <img 
                src="https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&w=800&q=80" 
                alt="Kali River rafting" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-[#d66c3c] font-mono text-sm tracking-widest font-semibold mb-4 uppercase">
            Rooted in Dandeli
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-8 leading-tight">
            We built this to stop the roadside scams.
          </h2>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              For years, the local tourism market in Dandeli has been plagued by unorganized roadside agents who inflate prices and misrepresent properties. 
            </p>
            <p>
              We are a team of locals and tech enthusiasts who decided to fix it. <strong>Dandeli Direct</strong> partners directly with verified resort owners to secure wholesale rates.
            </p>
            <p>
              By using our escrow system and masking property details until booking, we prevent agents from bypassing our platform, ensuring you get the <em>actual</em> resort price—not a bloated tourist markup.
            </p>
          </div>
          
          <div className="mt-12 flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-gray-200">
            <div className="w-16 h-16 bg-[#143d32] rounded-full flex items-center justify-center text-white shrink-0">
              <span className="font-serif italic text-2xl">DD</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">The Dandeli Direct Promise</h4>
              <p className="text-sm text-gray-500 mt-1">If your platform package cost is ever higher than the direct walk-in rack rate, we will refund the difference instantly.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
