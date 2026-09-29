export function AboutLocal() {
  return (
    <section id="about" className="bg-[#fbfaf6] px-6 py-20 md:px-12 md:py-24">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1">
          <div className="grid grid-cols-2 items-start gap-4">
            <div className="mt-8 h-[280px] overflow-hidden md:h-[380px]">
              <img
                src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=800&q=80"
                alt="Forest canopy near Dandeli"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-[280px] overflow-hidden md:h-[380px]">
              <img
                src="https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&w=800&q=80"
                alt="River landscape in the Dandeli region"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="mb-4 text-xs font-semibold uppercase text-[#ba633d]">
            A little local context
          </p>
          <h2 className="mb-7 font-serif text-4xl leading-tight text-[#18372f] md:text-5xl">
            The right stay depends on the kind of Dandeli you came for.
          </h2>
          <div className="space-y-5 text-base leading-7 text-[#53645b]">
            <p>
              Some people come for the river. Others want a quiet place under
              the trees, a family weekend, or a full day outdoors. Distance,
              meals, and mobile signal can matter as much as the room itself.
            </p>
            <p>
              We put those details next to the price so you can compare stays
              with your plans in mind. If you are unsure, tell us what you need
              and we will help you work through the options.
            </p>
          </div>

          <div className="mt-8 border-l-2 border-[#ba633d] pl-5">
            <p className="text-sm leading-6 text-[#53645b]">
              Have a question before you book? Call us at{" "}
              <a
                href="tel:+917204113614"
                className="font-semibold text-[#18372f] underline underline-offset-4"
              >
                +91 72041 13614
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
