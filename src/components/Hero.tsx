import {
  CONTACT_PHONE_DISPLAY,
  createWhatsAppUrl,
  WHATSAPP_REQUIREMENTS_MESSAGE,
} from "@/lib/contact";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[720px] flex-col overflow-hidden bg-[#173c34] text-[#fffaf1] md:min-h-[780px]">
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

      <nav className="relative z-10 mx-auto flex w-full max-w-screen-xl items-center justify-between border-b border-white/25 px-6 py-5 md:px-12">
        <a href="#top" className="font-serif text-xl text-white">
          Dandeli <em className="font-normal">Direct</em>
        </a>
        <div className="hidden items-center gap-8 text-sm text-white/90 md:flex">
          <a href="#booking" className="transition-colors hover:text-white">
            Find a stay
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
          className="text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
        >
          Call {CONTACT_PHONE_DISPLAY}
        </a>
      </nav>

      <div
        id="top"
        className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-1 items-center px-6 py-16 md:px-12"
      >
        <div className="max-w-2xl">
          <p className="mb-6 text-xs font-semibold uppercase text-[#edb27f]">
            A local guide to Dandeli, Karnataka
          </p>
          <h1 className="max-w-[680px] font-serif text-5xl leading-[1.02] text-white md:text-7xl">
            Find your own way to the river.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/85">
            Compare local stays, shape a trip around the things you want to do,
            and speak directly with us before you commit.
          </p>
          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <a
              href={createWhatsAppUrl(WHATSAPP_REQUIREMENTS_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center bg-[#25D366] px-6 py-3 font-semibold text-[#102c27] transition-colors hover:bg-[#62e38f]"
            >
              Tell us what you have in mind
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

      <div className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-wrap gap-x-8 gap-y-2 px-6 pb-7 text-xs text-white/75 md:px-12">
        <span>Dandeli, Uttara Kannada</span>
        <span>Stays, river time, forest trails</span>
        <span>Talk to a local before booking</span>
      </div>
    </section>
  );
}
