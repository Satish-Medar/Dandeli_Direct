import {
  CONTACT_PHONE_DISPLAY,
  createWhatsAppUrl,
  WHATSAPP_REQUIREMENTS_MESSAGE,
} from "@/lib/contact";

export function Footer() {
  return (
    <footer className="border-t-4 border-[#ba633d] bg-[#18372f] px-6 py-14 text-[#d0ddd2] md:px-12">
      <div className="mx-auto mb-12 grid max-w-screen-xl grid-cols-1 gap-10 md:grid-cols-4">
        <div className="col-span-1 md:col-span-1">
          <a
            href="#top"
            className="mb-5 flex items-center gap-3 font-serif text-xl text-white"
          >
            <span>
              Dandeli <em className="font-serif italic font-medium">Direct</em>
            </span>
          </a>
          <p className="max-w-xs text-sm leading-6 text-[#bdcec2]">
            A local starting point for stays and things to do around Dandeli.
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-xs font-semibold uppercase text-white">
            Explore
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#booking" className="hover:text-white transition-colors">
                Riverfront Resorts
              </a>
            </li>
            <li>
              <a href="#booking" className="hover:text-white transition-colors">
                Jungle Homestays
              </a>
            </li>
            <li>
              <a href="#booking" className="hover:text-white transition-colors">
                Camping Sites
              </a>
            </li>
            <li>
              <a href="#booking" className="hover:text-white transition-colors">
                Rafting & Activities
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-xs font-semibold uppercase text-white">
            Talk to us
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="tel:+917204113614"
                className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                Call {CONTACT_PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={createWhatsAppUrl(WHATSAPP_REQUIREMENTS_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                WhatsApp us
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-xs font-semibold uppercase text-white">
            Partners
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="/partner"
                className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                Partner portal
              </a>
            </li>
            <li>
              <a href="/partner" className="hover:text-white transition-colors">
                List Your Property
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-screen-xl flex-col items-start justify-between gap-4 border-t border-white/20 pt-6 text-xs text-[#bdcec2] md:flex-row md:items-center">
        <p>© 2026 Dandeli Direct Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
