import { useState, useEffect } from "react";
import { Pause, Play } from "lucide-react";
import { StepScene } from "./Illustrations";
const STEPS = [
  [
    "Set up your hotel",
    "Add room types with photos, prices and amenities, write your website content and add your bank account so you can be paid.",
    [
      "Upload photos straight from your phone",
      "Set prices, deposits and policies",
      "Add your bank account for payouts",
    ],
  ],
  [
    "Share your booking link",
    "Publish your website and share the link on WhatsApp, Instagram, Google or your own site. One link, always up to date.",
    [
      "Preview before you publish",
      "Share to WhatsApp in one tap",
      "Optional booking button for your website",
    ],
  ],
  [
    "Guests book and pay",
    "Guests pick dates, see only rooms that are really free, and pay securely online. The room is locked for them the moment they start.",
    [
      "Live availability, no double bookings",
      "Paystack checkout with verified payments",
      "Instant confirmation by email",
    ],
  ],
  [
    "Run your day and get paid",
    "Check guests in and out, watch occupancy and revenue, and receive money in your bank account. Our commission is split off automatically.",
    [
      "Arrivals and departures at a glance",
      "Reports your accountant will like",
      "Payouts straight to your bank",
    ],
  ],
];
export default function HowItWorks() {
  const [i, setI] = useState(0),
    [paused, setP] = useState(false),
    reduce =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => setI((x) => (x + 1) % STEPS.length), 6000);
    return () => clearTimeout(t);
  }, [i, paused]);
  return (
    <section id="how" className="px-5 py-16 bg-white/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center rv">
          <p className="text-accent font-semibold text-sm uppercase tracking-wide">
            How it works
          </p>
          <h2 className="font-display text-3xl md:text-4xl mt-1">
            From signup to your first booking in four steps
          </h2>
        </div>
        <div
          className="grid lg:grid-cols-2 gap-8 mt-10 items-center"
          onMouseEnter={() => setP(true)}
          onMouseLeave={() => setP(false)}
        >
          <ol className="grid gap-3">
            {STEPS.map(([t, d, b], k) => (
              <li key={t}>
                <button
                  onClick={() => setI(k)}
                  aria-current={i === k}
                  className={`w-full text-left card p-4 transition-all duration-300 ${i === k ? "!border-accent shadow-lg scale-[1.01]" : "opacity-70 hover:opacity-100"}`}
                >
                  <div className="flex gap-3 items-start">
                    <span
                      className={`shrink-0 grid place-items-center w-9 h-9 rounded-full font-bold text-sm transition ${i === k ? "bg-accent text-primary" : "bg-mist text-secondary"}`}
                    >
                      {k + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-lg">{t}</h3>
                      {i === k && (
                        <div className="slide-up">
                          <p className="text-sm text-ink/75 mt-1">{d}</p>
                          <ul className="mt-2 grid gap-1 text-sm">
                            {b.map((x) => (
                              <li key={x} className="flex gap-2">
                                <span className="text-accent">●</span>
                                {x}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  {i === k && !reduce && !paused && (
                    <div className="h-1 bg-mist rounded mt-3 overflow-hidden">
                      <div
                        key={i + "p"}
                        className="h-full bg-accent origin-left"
                        style={{ animation: "fillbar 6s linear forwards" }}
                      />
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ol>
          <div className="relative">
            <div className="card p-4 sm:p-6 bg-gradient-to-br from-white to-mist">
              <div key={i} className="slide-in">
                <StepScene i={i} />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted">
                  Step {i + 1} of {STEPS.length}
                </span>
                <button
                  onClick={() => setP(!paused)}
                  className="text-xs font-semibold text-secondary flex items-center gap-1"
                  aria-label={paused ? "Play steps" : "Pause steps"}
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                  {paused ? "Play" : "Pause"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
