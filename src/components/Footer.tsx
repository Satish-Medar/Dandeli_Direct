export function Footer() {
  return (
    <footer className="bg-[#143d32] text-[#93d0a8] py-16 px-6 border-t-4 border-[#d66c3c]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        <div className="col-span-1 md:col-span-1">
          <a href="#" className="flex items-center gap-3 text-white font-bold text-xl mb-6">
            <span className="w-10 h-10 bg-white text-[#143d32] flex items-center justify-center rounded font-mono text-sm tracking-tighter">DD</span>
            <span>Dandeli <em className="font-serif italic font-medium">Direct</em></span>
          </a>
          <p className="text-sm leading-relaxed mb-6">
            The only transparent, escrow-backed booking engine for verified stays and activities in Dandeli.
          </p>
          <div className="flex gap-4">
            {/* Social place holders */}
            <div className="w-8 h-8 rounded-full bg-[#1e5a44] flex items-center justify-center cursor-pointer hover:bg-[#d66c3c] transition-colors">f</div>
            <div className="w-8 h-8 rounded-full bg-[#1e5a44] flex items-center justify-center cursor-pointer hover:bg-[#d66c3c] transition-colors">in</div>
            <div className="w-8 h-8 rounded-full bg-[#1e5a44] flex items-center justify-center cursor-pointer hover:bg-[#d66c3c] transition-colors">ig</div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 font-mono tracking-wider text-sm">EXPLORE</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#booking" className="hover:text-white transition-colors">Riverfront Resorts</a></li>
            <li><a href="#booking" className="hover:text-white transition-colors">Jungle Homestays</a></li>
            <li><a href="#booking" className="hover:text-white transition-colors">Camping Sites</a></li>
            <li><a href="#booking" className="hover:text-white transition-colors">Rafting & Activities</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 font-mono tracking-wider text-sm">SUPPORT</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cancellation Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Escrow Guarantee</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 font-mono tracking-wider text-sm">PARTNERS</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="/partner" className="text-[#e19a6e] font-semibold hover:text-white transition-colors flex items-center gap-2">Partner Login <span>↗</span></a></li>
            <li><a href="#" className="hover:text-white transition-colors">List Your Property</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Agent Protection Program</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#1e5a44] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
        <p>© 2026 Dandeli Direct Platform. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
