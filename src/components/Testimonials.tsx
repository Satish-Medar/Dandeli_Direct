export function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "Rahul Sharma",
      location: "Bangalore",
      date: "August 2026",
      text: "I used to waste hours bargaining with roadside agents in Dandeli. Booking through here was seamless. The exact GPS pin provided after deposit saved us from getting lost in the forest.",
      rating: 5,
    },
    {
      id: 2,
      name: "Priya Desai",
      location: "Pune",
      date: "September 2026",
      text: "The wholesale pricing is real. We compared the final package price with a direct call to the resort manager, and Dandeli Direct was actually ₹1200 cheaper for our group of 4. Highly recommend!",
      rating: 5,
    },
    {
      id: 3,
      name: "Anand Verma",
      location: "Hyderabad",
      date: "October 2026",
      text: "Loved the transparency. Knowing our deposit was held in escrow until we physically reached the property gave us immense peace of mind. The rafting slots were perfectly organized.",
      rating: 5,
    }
  ];

  return (
    <section className="bg-slate-50 py-24 px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#d66c3c] font-mono text-sm tracking-widest font-semibold mb-4 uppercase">
            Don&apos;t just take our word for it
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-6">
            Trusted by weekenders.
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Over 2,000+ happy travelers from Bangalore, Pune, and Hyderabad have used Dandeli Direct to secure their perfect forest getaway.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              <div className="flex text-amber-400 mb-6 text-lg">
                {"★".repeat(review.rating)}
              </div>
              <p className="text-gray-700 leading-relaxed mb-8 italic">
                &quot;{review.text}&quot;
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-[#1e5a44] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <p className="text-gray-500 text-sm">{review.location} • {review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
