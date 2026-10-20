
import { Link } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  Mail,
  Clock,
  MapPin,
} from "lucide-react";
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTwitter,
  IoLogoLinkedin,
} from "react-icons/io5";
import { KeyLogo } from "./Illustrations";
import { useGet } from "../ui";

export default function Footer() {
  const [p] = useGet("/public/platform", null, {
    stale: 300000,
    shared: true,
  });

  const wa =
    p?.whatsapp &&
    "https://wa.me/" + p.whatsapp.replace(/\D/g, "");

  const C = ({ title, children }) => (
    <div>
      <h3 className="font-sans font-semibold text-white mb-3 text-sm uppercase tracking-wide">
        {title}
      </h3>
      <ul className="grid gap-2 text-sm text-white/70">
        {children}
      </ul>
    </div>
  );

  const A = ({ to, children }) => (
    <li>
      <Link className="hover:text-accent transition" to={to}>
        {children}
      </Link>
    </li>
  );

  const H = ({ href, children }) => (
    <li>
      <a className="hover:text-accent transition" href={href}>
        {children}
      </a>
    </li>
  );

  return (
    <footer className="bg-primary text-white mt-10">
      <div className="max-w-6xl mx-auto px-5 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 font-display text-2xl font-bold">
            <KeyLogo size={30} />
            key<span className="text-accent -ml-1.5">konnec</span>
          </div>

          <p className="mt-4 text-sm text-white/70 max-w-sm">
            Online booking, verified payments and day-to-day hotel management
            in one place, built for hotels, guest houses and serviced
            apartments in Nigeria.
          </p>

          {/* Social Media Icons */}
          <div className="flex gap-3 mt-5">
            {[
              [p?.facebook, IoLogoFacebook, "Facebook"],
              [p?.instagram, IoLogoInstagram, "Instagram"],
              [p?.twitter, IoLogoTwitter, "X"],
              [p?.linkedin, IoLogoLinkedin, "LinkedIn"],
            ]
              .filter((x) => x[0])
              .map(([u, I, n]) => (
                <a
                  key={n}
                  href={u}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={n}
                  className="rounded-full bg-white/10 p-2.5 hover:bg-accent hover:text-primary transition"
                >
                  <I size={18} />
                </a>
              ))}
          </div>
        </div>

        {/* Product Links */}
        <C title="Product">
          <H href="/#how">How it works</H>
          <H href="/#features">Features</H>
          <H href="/#pricing">Pricing</H>
          <H href="/#faq">FAQ</H>
        </C>

        {/* Company Links */}
        <C title="Company">
          <A to="/about">About us</A>
          <H href="/#contact">Contact</H>
          <A to="/login">Hotel login</A>
          <A to="/register">Create an account</A>
          <A to="/legal/privacy">Privacy policy</A>
          <A to="/legal/terms">Terms of service</A>
        </C>

        {/* Contact Information */}
        <C title="Contact">
          {p?.contactPhone && (
            <li className="flex gap-2">
              <Phone size={16} className="mt-0.5 shrink-0" />
              <a href={"tel:" + p.contactPhone}>
                {p.contactPhone}
              </a>
            </li>
          )}

          {wa && (
            <li className="flex gap-2">
              <MessageCircle
                size={16}
                className="mt-0.5 shrink-0"
              />
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp us
              </a>
            </li>
          )}

          {p?.contactEmail && (
            <li className="flex gap-2">
              <Mail size={16} className="mt-0.5 shrink-0" />
              <a href={"mailto:" + p.contactEmail}>
                {p.contactEmail}
              </a>
            </li>
          )}

          {p?.hours && (
            <li className="flex gap-2">
              <Clock size={16} className="mt-0.5 shrink-0" />
              {p.hours}
            </li>
          )}

          {p?.address && (
            <li className="flex gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              {p.address}
            </li>
          )}

          {p && !p.contactPhone && !p.contactEmail && !wa && (
            <li>
              <a href="/#contact">Send us a message</a>
            </li>
          )}
        </C>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-5 px-5 text-xs text-white/50 flex flex-wrap gap-2 justify-between max-w-6xl mx-auto">
        <span>
          © {new Date().getFullYear()} keykonnec. All rights reserved.
        </span>

        <span>
          Paystack transaction fees apply to online payments on every plan.
        </span>
      </div>
    </footer>
  );
}
