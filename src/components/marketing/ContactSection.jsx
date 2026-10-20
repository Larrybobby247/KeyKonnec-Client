import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
} from "lucide-react";
import { api, err } from "../../services/api";
import { useGet, Msg } from "../ui";
export default function ContactSection() {
  const [p] = useGet("/public/platform", null, { stale: 300000, shared: true }),
    [m, setM] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    subjects = p?.subjects || [
      "General question",
      "Pricing and plans",
      "Demo request",
      "Technical support",
      "Billing",
      "Partnership",
      "Feedback",
      "Other",
    ];
  const wa = p?.whatsapp && "https://wa.me/" + p.whatsapp.replace(/\D/g, "");
  const send = async (e) => {
    e.preventDefault();
    const f = e.target;
    setBusy(true);
    setM("");
    try {
      await api.post("/contact", Object.fromEntries(new FormData(f)));
      f.reset();
      setDone(true);
    } catch (x) {
      setM(err(x));
    }
    setBusy(false);
  };
  const Info = ({ I, t, children }) => (
    <li className="card p-4 flex gap-3 items-start lift">
      <span className="rounded-xl bg-mist p-2.5 text-secondary">
        <I size={20} />
      </span>
      <div>
        <div className="text-xs text-muted">{t}</div>
        <div className="font-semibold text-sm break-words">{children}</div>
      </div>
    </li>
  );
  return (
    <section id="contact" className="px-5 py-16 bg-white/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center rv">
          <p className="text-accent font-semibold text-sm uppercase tracking-wide">
            Contact
          </p>
          <h2 className="font-display text-3xl md:text-4xl mt-1">
            Talk to a real person
          </h2>
          <p className="text-muted mt-2">
            Questions about plans, setup or moving your hotel over? We reply as
            soon as we can.
          </p>
        </div>
        <div className="grid lg:grid-cols-5 gap-8 mt-10">
          <ul className="lg:col-span-2 grid gap-3 content-start rv">
            {p?.contactPhone && (
              <Info I={Phone} t="Call us">
                <a href={"tel:" + p.contactPhone}>{p.contactPhone}</a>
              </Info>
            )}
            {wa && (
              <Info I={MessageCircle} t="WhatsApp">
                <a href={wa} target="_blank" rel="noreferrer">
                  Chat with us
                </a>
              </Info>
            )}
            {p?.contactEmail && (
              <Info I={Mail} t="Email">
                <a href={"mailto:" + p.contactEmail}>{p.contactEmail}</a>
              </Info>
            )}
            {p?.hours && (
              <Info I={Clock} t="Available times">
                {p.hours}
              </Info>
            )}
            {p?.address && (
              <Info I={MapPin} t="Office">
                {p.address}
              </Info>
            )}
            {p && !p.contactPhone && !p.contactEmail && !wa && (
              <li className="card p-4 text-sm text-muted">
                Use the form and your message goes straight to our team.
              </li>
            )}
          </ul>
          <div className="lg:col-span-3 card p-6 rv">
            {done ? (
              <div className="text-center py-10 pop">
                <CheckCircle2 className="mx-auto text-secondary" size={48} />
                <h3 className="font-display text-2xl mt-3">Message sent</h3>
                <p className="text-muted mt-1">
                  Thank you. Our team will get back to you by email.
                </p>
                <button className="btn mt-5" onClick={() => setDone(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={send} className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm font-semibold">
                  Your name
                  <input
                    required
                    name="name"
                    className="inp mt-1"
                    autoComplete="name"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    className="inp mt-1"
                    autoComplete="email"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Phone (optional)
                  <input name="phone" className="inp mt-1" autoComplete="tel" />
                </label>
                <label className="text-sm font-semibold">
                  Subject
                  <select
                    required
                    name="subject"
                    className="inp mt-1"
                    defaultValue=""
                  >
                    {
                      <option value="" disabled>
                        Choose a subject
                      </option>
                    }
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold sm:col-span-2">
                  Message
                  <textarea
                    required
                    minLength="10"
                    maxLength="2000"
                    name="message"
                    rows="5"
                    className="inp mt-1"
                  />
                </label>
                <div className="sm:col-span-2">
                  <Msg m={m} />
                  <button className="btn" disabled={busy}>
                    <Send size={16} />
                    {busy ? "Sending…" : "Send message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
