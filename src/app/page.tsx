import { Hero } from "@/components/Hero";
import { TrustBadges } from "@/components/TrustBadges";
import { BookingWizard } from "@/components/BookingWizard";
import { Testimonials } from "@/components/Testimonials";
import { AboutLocal } from "@/components/AboutLocal";
import { Footer } from "@/components/Footer";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ property?: string | string[] }>;
}) {
  const query = await searchParams;
  const initialPropertyId = Array.isArray(query.property)
    ? (query.property[0] ?? null)
    : (query.property ?? null);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-[#18372f] font-sans">
      <Hero />
      <TrustBadges />
      <BookingWizard initialPropertyId={initialPropertyId} />
      <Testimonials />
      <AboutLocal />
      <Footer />
    </main>
  );
}
