export function Testimonials() {
  const steps = [
    {
      number: "01",
      title: "Choose a place",
      text: "Compare the location, stay type, and nightly rate before you settle on a property.",
    },
    {
      number: "02",
      title: "Shape the trip",
      text: "Add your dates, group size, meals, and activities to see an estimate that updates as you go.",
    },
    {
      number: "03",
      title: "Confirm the details",
      text: "Send a request or speak with us directly. The host confirms availability before it becomes a booking.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-[#e9eeea] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-24"
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase text-[#ba633d]">
            How it works
          </p>
          <h2 className="font-serif text-3xl leading-tight text-[#18372f] sm:text-4xl md:text-5xl">
            A good trip starts with a few clear choices.
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 border-t border-[#bfcac1] md:mt-12 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="border-b border-[#bfcac1] py-6 md:border-b-0 md:border-r md:px-8 md:py-8 md:first:pl-0 md:last:border-r-0"
            >
              <span className="text-xs font-semibold text-[#ba633d]">
                {step.number}
              </span>
              <h3 className="mt-4 font-serif text-xl text-[#18372f] sm:mt-5 sm:text-2xl">
                {step.title}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#5d6e65]">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
