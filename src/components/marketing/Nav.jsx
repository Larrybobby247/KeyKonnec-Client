import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { KeyLogo } from "./Illustrations";
const L = [
  ["/#how", "How it works"],
  ["/#features", "Features"],
  ["/#pricing", "Pricing"],
  ["/about", "About"],
  ["/#faq", "FAQ"],
  ["/#contact", "Contact"],
];
export default function Nav() {
  const [o, setO] = useState(false);
  return (
    <header className="fixed top-0 z-40 px-3 pt-2 w-full">
      <div className="max-w-6xl mx-auto card !rounded-full px-4 sm:px-5 py-2.5 flex items-center justify-between backdrop-blur bg-white/85">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-primary"
          aria-label="keykonnec home"
        >
          <span className="bg-primary rounded-full p-1">
            <KeyLogo size={22} />
          </span>
          key<span className="text-accent -ml-1.5">konnec</span>
        </Link>
        <nav
          className="hidden lg:flex gap-6 text-sm font-medium"
          aria-label="Main"
        >
          {L.map(([h, t]) =>
            h.startsWith("/#") ? (
              <a
                key={h}
                href={h}
                className="text-ink/70 hover:text-primary transition"
              >
                {t}
              </a>
            ) : (
              <NavLink
                key={h}
                to={h}
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-semibold"
                    : "text-ink/70 hover:text-primary transition"
                }
              >
                {t}
              </NavLink>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden sm:inline text-sm font-semibold px-3 hover:text-secondary"
          >
            Log in
          </Link>
          <Link to="/register" className="btn">
            Get started
          </Link>
          <button
            className="lg:hidden p-2"
            aria-label={o ? "Close menu" : "Open menu"}
            aria-expanded={o}
            onClick={() => setO(!o)}
          >
            {o ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {o && (
        <div className="lg:hidden max-w-6xl mx-auto card mt-2 p-4 grid gap-1 slide-up">
          {L.map(([h, t]) => (
            <a
              key={h}
              href={h}
              onClick={() => setO(false)}
              className="py-2.5 px-2 rounded-lg hover:bg-mist font-medium"
            >
              {t}
            </a>
          ))}
          <Link
            to="/login"
            className="py-2.5 px-2 font-semibold text-secondary"
          >
            Log in
          </Link>
        </div>
      )}
    </header>
  );
}
