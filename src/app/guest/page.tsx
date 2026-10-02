import type { Metadata } from "next";
import Link from "next/link";
import { BookingWizard } from "@/components/BookingWizard";

export const metadata: Metadata = {
  title: "Guest Portal | Dandeli Direct",
  description: "Choose a Dandeli stay and send a quick booking request.",
};

export default function GuestHome() {
  return (
    <main className="min-h-screen bg-[#fbfaf6] pb-20 font-sans text-[#18372f]">
      <header className="border-b border-[#d5ddd5]">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4 sm:px-6 md:px-12">
          <Link
            href="/"
            className="font-serif text-lg text-[#18372f] sm:text-xl"
          >
            Dandeli <em className="font-normal">Direct</em>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#65736b]">
            Guest portal
          </span>
        </div>
      </header>
      <section className="bg-[#18372f] text-white">
        <div className="mx-auto grid max-w-screen-xl gap-4 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-[1fr_auto] md:items-center md:px-12">
          <div>
            <p className="text-xs font-semibold uppercase text-[#f2b98d]">
              Direct guest offer
            </p>
            <h1 className="mt-2 font-serif text-2xl leading-tight sm:text-3xl">
              No booking fee. No advance payment.
            </h1>
            <p className="mt-2 text-sm text-white/75">
              Get a direct quote and speak with a local before you decide.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90 md:flex-col md:gap-2">
            <span>Featured stays from ₹2,400 / night</span>
            <span>Pay only after your host confirms</span>
          </div>
        </div>
      </section>
      <BookingWizard initialPropertyId={null} />
    </main>
  );
}
