export function Hero() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=88")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a2a20] via-[#0a2a20]/80 to-transparent opacity-90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-white max-w-2xl">
          <p className="text-[#d66c3c] font-mono text-sm tracking-widest font-semibold mb-6 uppercase">
            Skip the middlemen
          </p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 font-serif tracking-tight">
            Book verified<br />
            <span className="text-[#e19a6e] italic">Dandeli</span> stays.
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-lg leading-relaxed">
            Handpicked resorts, guaranteed wholesale rates, and verified local hosts. Stop guessing and start exploring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#booking" className="bg-[#d66c3c] hover:bg-[#c55d31] transition-colors text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg">
              Explore Packages
              <span className="text-2xl font-normal leading-none">→</span>
            </a>
          </div>
        </div>
        
        {/* Trust Stamp on Hero */}
        <div className="hidden lg:flex justify-end pr-12">
          <div className="w-32 h-32 border-2 border-white/40 rounded-full flex flex-col items-center justify-center text-center rotate-12 backdrop-blur-sm">
            <span className="text-xs font-mono font-bold tracking-widest text-white mb-1">KALI RIVER</span>
            <div className="w-12 h-[1px] bg-white/50 mb-1" />
            <span className="text-[10px] font-mono text-white/80">EST. 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
