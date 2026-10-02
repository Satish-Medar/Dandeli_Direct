import { CONTACT_PHONE_DISPLAY } from "@/lib/contact";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[640px] flex-col overflow-hidden bg-[#173c34] text-[#fffaf1] md:min-h-[780px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-[position:center_55%]"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&w=2200&q=88")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#102c27]/90 via-[#102c27]/60 to-[#102c27]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102c27]/65 via-transparent to-[#102c27]/30" />
      </div>

      <nav className="relative z-10 mx-auto flex w-full max-w-screen-xl items-center justify-between border-b border-white/25 px-4 py-4 sm:px-6 sm:py-5 md:px-12">
        <a href="#top" className="font-serif text-lg text-white sm:text-xl">
          Dandeli <em className="font-normal">Direct</em>
        </a>
        <div className="hidden items-center gap-8 text-sm text-white/90 md:flex">
          <a href="/guest" className="transition-colors hover:text-white">
            Guest portal
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-white"
          >
            How it works
          </a>
          <a href="#about" className="transition-colors hover:text-white">
            About us
          </a>
        </div>
        <a
          href={`tel:+${CONTACT_PHONE_DISPLAY.replace(/\D/g, "")}`}
          className="shrink-0 text-xs font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white sm:text-sm"
        >
          <span className="sm:hidden">Call us</span>
          <span className="hidden sm:inline">Call {CONTACT_PHONE_DISPLAY}</span>
        </a>
      </nav>

      <div
        id="top"
        className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-1 items-center px-4 py-12 sm:px-6 sm:py-16 md:px-12"
      >
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase text-[#edb27f] sm:mb-6">
            A local guide to Dandeli, Karnataka
          </p>
          <h1 className="max-w-[680px] font-serif text-4xl leading-tight text-white sm:text-5xl md:text-7xl">
            Find your own way to the river.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:mt-7 sm:text-lg sm:leading-8">
            Compare local stays, shape a trip around the things you want to do,
            and speak directly with us before you commit.
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-4 sm:mt-9 sm:flex-row sm:items-center sm:gap-5">
            <a
              href="/guest"
              className="inline-flex min-h-12 w-full items-center justify-center bg-[#25D366] px-4 py-3 text-sm font-semibold text-[#102c27] transition-colors hover:bg-[#62e38f] sm:w-auto sm:px-6 sm:text-base"
            >
              Start a stay request
            </a>
            <a
              href="#booking"
              className="py-3 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
            >
              Browse stays and prices
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-wrap gap-x-5 gap-y-2 px-4 pb-5 text-xs text-white/75 sm:gap-x-8 sm:px-6 sm:pb-7 md:px-12">
        <span>Dandeli, Uttara Kannada</span>
        <span>Stays, river time, forest trails</span>
        <span>Talk to a local before booking</span>
      </div>
    </section>
  );
}
