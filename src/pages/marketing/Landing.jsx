import { Link } from "react-router-dom";
import {
  ArrowRight,
  PhoneCall,
  MessageCircle,
  FileSpreadsheet,
  Building2,
  Home,
  Building,
  Hotel,
  ShieldCheck,
  Zap,
  BadgeCheck,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { HeroScene } from "../../components/marketing/Illustrations";
import { Counter, Skeleton } from "../../components/ui";
const HowItWorks = lazy(() => import("../../components/marketing/HowItWorks")),
  Features = lazy(() => import("../../components/marketing/Features")),
  DashboardMock = lazy(
    () => import("../../components/marketing/DashboardMock"),
  ),
  PlanCards = lazy(() => import("../../components/marketing/PlanCards")),
  Faq = lazy(() => import("../../components/marketing/Faq")),
  ContactSection = lazy(
    () => import("../../components/marketing/ContactSection"),
  );
const Later = ({ h = 480, children }) => (
  <Suspense
    fallback={
      <div style={{ minHeight: h }} className="max-w-6xl mx-auto px-5 py-10">
        <Skeleton className="h-full min-h-[320px] w-full" />
      </div>
    }
  >
    {children}
  </Suspense>
);
const STATS = [
  [0, "%", "Commission on Professional"],
  [4, "", "Plans, from ₦0"],
  [14, "", "Day free trial on Starter and Growth"],
  [24, "/7", "Online booking"],
];
const WHO = [
  [Hotel, "Hotels", "Full room inventory, staff roles and reports."],
  [Home, "Guest houses", "Simple setup, low cost, bookings on WhatsApp."],
  [Building, "Serviced apartments", "Longer stays, deposits and balances."],
  [Building2, "Hotel groups", "Multiple branches under one login."],
];
export default function Landing() {
  return (
    <>
      <section className="hero-bg px-5 pt-10 pb-16 md:pt-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center mt-13">
          <div className="slide-up">
            <span className="inline-flex items-center gap-2 bg-white card !rounded-full px-3 py-1 text-xs font-semibold text-secondary">
              <Zap size={14} className="text-accent" />
              Built for hotels in Nigeria
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] mt-4 text-primary">
              Every room booked, every payment verified.
            </h1>
            <p className="mt-5 text-lg text-ink/75 max-w-xl">
              keykonnec gives your hotel its own booking website, online
              payments straight to your bank account, and a simple dashboard to
              run the day. No double bookings. No chasing transfers.
            </p>
            <div className="flex gap-3 flex-wrap mt-7">
              <Link to="/register" className="btn btn-accent !px-6 !py-3">
                Get started
                <ArrowRight size={18} />
              </Link>
              <a href="#how" className="btn btn-ghost !px-6 !py-3">
                See how it works
              </a>
            </div>
            <ul className="flex gap-x-6 gap-y-2 flex-wrap mt-6 text-sm text-ink/70">
              {[
                [ShieldCheck, "Payments verified on our servers"],
                [BadgeCheck, "Your data stays yours"],
              ].map(([I, t]) => (
                <li key={t} className="flex gap-1.5 items-center">
                  <I size={16} className="text-secondary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroScene />
        </div>
      </section>
      <section className="px-5 -mt-4">
        <div className="max-w-5xl mx-auto card grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-ink/10 text-center">
          {STATS.map(([n, s, l]) => (
            <div key={l} className="p-5">
              <div className="font-display text-4xl text-secondary">
                <Counter to={n} suffix={s} />
              </div>
              <div className="text-xs text-muted mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="px-5 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center rv">
            <p className="text-accent font-semibold text-sm uppercase tracking-wide">
              The problem
            </p>
            <h2 className="font-display text-3xl md:text-4xl mt-1">
              Bookings are scattered. Your hotel should not be.
            </h2>
          </div>
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center mt-10">
            <div className="grid gap-3 rv">
              {[
                [PhoneCall, "Phone calls", "Rooms promised to two people"],
                [
                  MessageCircle,
                  "WhatsApp chats",
                  "Details lost in long threads",
                ],
                [
                  FileSpreadsheet,
                  "Notebooks and sheets",
                  "No one sure who has paid",
                ],
              ].map(([I, t, d], i) => (
                <div
                  key={t}
                  className="card p-4 flex gap-3 items-center float"
                  style={{ animationDelay: i * 0.5 + "s" }}
                >
                  <span className="rounded-xl bg-red-50 text-red-700 p-2.5">
                    <I size={20} />
                  </span>
                  <div>
                    <b className="text-sm">{t}</b>
                    <div className="text-xs text-muted">{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:grid place-items-center">
              <ArrowRight size={40} className="text-accent" />
            </div>
            <div className="card p-6 rv bg-primary text-white">
              <h3 className="font-display text-2xl">One system</h3>
              <ul className="mt-3 grid gap-2 text-sm text-white/85">
                {[
                  "Every booking in one calendar",
                  "Every payment verified and recorded",
                  "Every room status in one place",
                  "One link to share with guests",
                ].map((x) => (
                  <li key={x} className="flex gap-2 text-ink">
                    <BadgeCheck size={18} className="text-accent shrink-0" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <Later>
        <HowItWorks />
      </Later>
      <Later>
        <Features />
      </Later>
      <Later>
        <DashboardMock />
      </Later>
      <section className="px-5 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl text-center rv">
            Made for every kind of stay
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {WHO.map(([I, t, d]) => (
              <div key={t} className="card p-5 lift rv text-center">
                <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-mist text-secondary">
                  <I size={28} />
                </span>
                <h3 className="font-display text-xl mt-3">{t}</h3>
                <p className="text-sm text-muted mt-1">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="pricing" className="px-5 py-16 bg-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 rv">
            <p className="text-accent font-semibold text-sm uppercase tracking-wide">
              Pricing
            </p>
            <h2 className="font-display text-3xl md:text-4xl mt-1">
              Simple pricing that grows with you
            </h2>
            <p className="text-muted mt-2 max-w-2xl mx-auto">
              A monthly fee plus a small commission on online bookings. Higher
              plans pay less commission. Paystack transaction fees apply on
              every plan.
            </p>
          </div>
          <Later h={420}>
            <PlanCards />
          </Later>
        </div>
      </section>
      <Later>
        <Faq />
      </Later>
      <section className="px-5 pb-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-primary text-white p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-accent/20 spin-slow" />
          <h2 className="font-display text-3xl md:text-4xl relative">
            Ready to fill your rooms?
          </h2>
          <p className="text-white/75 mt-2 relative">
            Create your account and have your booking page ready today.
          </p>
          <Link
            to="/register"
            className="btn btn-accent mt-6 !px-7 !py-3 relative"
          >
            Get started
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <Later>
        <ContactSection />
      </Later>
    </>
  );
}
