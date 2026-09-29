export function TrustBadges() {
  const details = [
    {
      number: "01",
      title: "Local stays",
      text: "See where each stay is and what kind of trip it suits.",
    },
    {
      number: "02",
      title: "Clear estimates",
      text: "Build a package with your dates, group size, and activities.",
    },
    {
      number: "03",
      title: "Talk it through",
      text: "Ask questions by phone or WhatsApp before you decide.",
    },
  ];

  return (
    <section className="border-b border-[#d5ddd5] bg-[#fbfaf6] px-6 py-10 md:px-12 md:py-12">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
        {details.map((detail) => (
          <article
            key={detail.number}
            className="border-t border-[#c7d1c8] pt-4"
          >
            <span className="text-xs font-semibold text-[#ba633d]">
              {detail.number}
            </span>
            <h2 className="mt-4 font-serif text-2xl text-[#18372f]">
              {detail.title}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#5d6e65]">
              {detail.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
