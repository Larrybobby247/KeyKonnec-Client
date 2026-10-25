import { useEffect, useState, useCallback, useRef } from "react";
import { Eye, EyeOff, X, Inbox, RefreshCw, WifiOff } from "lucide-react";
import { api, publicApi, err } from "../../services/api";
import AppLoader from "./AppLoader";
export { day, today } from "../../services/api";
// ---- data fetching: aborts outdated requests, ignores stale responses, de-duplicates and caches ONLY requests that opt in with {stale}.
// Cache keys include the signed-in user (or 'public' for shared public data), so one user's data is never shown to another. Bookings, payments and other critical data are never cached.
let scope = "public";
export const setCacheScope = (s) => {
  scope = s || "public";
};
const cache = new Map(),
  inflight = new Map();
export const clearCache = () => {
  cache.clear();
  inflight.clear();
};
export const useGet = (url, params, opt) => {
  const stale = (opt && opt.stale) || 0,
    shared = !!(opt && opt.shared),
    // Shared data (such as the plan list) is public, so it is requested without cookies. The API only allows cookie-free calls for public routes; sending cookies there makes the browser block the response.
    client = shared ? publicApi : api,
    k = JSON.stringify(params || {}),
    key = (shared ? "public" : scope) + "|" + url + "|" + k;
  const [d, setD] = useState(() => {
      const h = stale && cache.get(key);
      return h ? h.d : null;
    }),
    [e, setE] = useState(""),
    [loading, setL] = useState(true),
    seq = useRef(0),
    ctl = useRef(null);
  const run = useCallback(
    (force) => {
      const my = ++seq.current;
      ctl.current && ctl.current.abort();
      if (stale) {
        const hit = cache.get(key);
        if (hit) {
          setD(hit.d);
          if (!force && Date.now() - hit.t < stale) {
            setE("");
            setL(false);
            return Promise.resolve();
          }
        }
      }
      setL(true);
      let p;
      if (stale) {
        p = inflight.get(key);
        if (!p || force) {
          p = client
            .get(url, { params })
            .then((r) => {
              cache.set(key, { d: r.data, t: Date.now() });
              return r.data;
            })
            .finally(() => inflight.delete(key));
          inflight.set(key, p);
        }
      } else {
        const c = new AbortController();
        ctl.current = c;
        p = client.get(url, { params, signal: c.signal }).then((r) => r.data);
      }
      return p
        .then((x) => {
          if (my === seq.current) {
            setD(x);
            setE("");
            setL(false);
          }
        })
        .catch((x) => {
          if (x && (x.code === "ERR_CANCELED" || x.name === "CanceledError"))
            return;
          if (my === seq.current) {
            setE(err(x));
            setL(false);
          }
        });
    },
    [url, k, key, stale],
  );
  useEffect(() => {
    run(false);
    return () => {
      seq.current++;
      ctl.current && ctl.current.abort();
    };
  }, [run]);
  return [d, useCallback(() => run(true), [run]), e, loading];
};
export const useDebounced = (v, ms = 350) => {
  const [x, setX] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setX(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return x;
};
// ---- loading placeholders
export const Skeleton = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={"animate-pulse rounded-lg bg-ink/10 " + className}
  />
);
export const Spinner = ({ label = "Loading" }) => (
  <div role="status" aria-label={label} className="grid gap-3 p-2">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
    <span className="sr-only">{label}</span>
  </div>
);
export const TableSkeleton = ({ rows = 5 }) => (
  <div role="status" aria-label="Loading" className="grid gap-2">
    {Array.from({ length: rows }, (_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
);
export const ShellSkeleton = () => <AppLoader />;
export const ErrorRetry = ({ e, retry }) =>
  e ? (
    <div
      role="alert"
      className="card p-4 flex flex-wrap items-center gap-3 text-sm border-red-200"
    >
      <WifiOff size={18} className="text-red-600 shrink-0" />
      <span className="flex-1 min-w-0 break-words">{e}</span>
      {retry && (
        <button className="btn !py-1.5" onClick={retry}>
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  ) : null;
export const Box = ({ title, children, right }) => (
  <section className="card p-4 sm:p-5 overflow-x-auto min-w-0 max-w-full">
    <div className="flex justify-between items-center gap-x-3 gap-y-2 flex-wrap mb-3">
      <h2 className="font-display text-xl min-w-0 break-words">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);
export const Msg = ({ m, ok }) =>
  m ? (
    <p
      role="alert"
      className={
        "text-sm font-medium py-1 break-words " +
        (ok ? "text-secondary" : "text-red-700")
      }
    >
      {m}
    </p>
  ) : null;
export const run = async (setM, fn, after) => {
  try {
    await fn();
    setM("");
    after && after();
  } catch (x) {
    setM(err(x));
  }
};
// Submit helper: the submit button is disabled and shows a spinner until the handler finishes, so forms cannot be double-submitted.
export const form = (fn) => async (e) => {
  e.preventDefault();
  const f = e.currentTarget || e.target,
    b =
      (e.nativeEvent && e.nativeEvent.submitter) ||
      f.querySelector("button:not([type=button])");
  if (b && b.dataset.loading) return;
  if (b) {
    b.dataset.loading = "1";
    b.disabled = true;
    b.setAttribute("aria-busy", "true");
  }
  try {
    await fn(Object.fromEntries(new FormData(f)), f);
  } finally {
    if (b) {
      delete b.dataset.loading;
      b.disabled = false;
      b.removeAttribute("aria-busy");
    }
  }
};
export const Btn = ({ children, ...p }) => (
  <button
    {...p}
    className={
      "text-secondary font-semibold hover:underline disabled:opacity-40 " +
      (p.className || "")
    }
  >
    {children}
  </button>
);
export const Empty = ({ children, icon: I = Inbox }) => (
  <div className="text-center text-muted py-8 text-sm">
    <I className="mx-auto mb-2" size={28} />
    {children}
  </div>
);
export const Badge = ({ tone = "gray", children }) => {
  const t = {
    gray: "bg-ink/10 text-ink",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-sky-100 text-sky-800",
  }[tone];
  return (
    <span
      className={`inline-block whitespace-nowrap shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${t}`}
    >
      {children}
    </span>
  );
};
export const Modal = ({ open, onClose, title, children, wide }) => {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open]);
  return open ? (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={
          "card w-full max-h-[90vh] overflow-auto p-4 sm:p-5 " +
          (wide ? "max-w-2xl" : "max-w-md")
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3 mb-3">
          <h2 className="font-display text-xl min-w-0 break-words">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="shrink-0">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  ) : null;
};
export const PasswordInput = ({ className = "", ...p }) => {
  const [s, setS] = useState(false);
  return (
    <div className="relative">
      <input
        {...p}
        type={s ? "text" : "password"}
        className={"inp pr-11 " + className}
      />
      <button
        type="button"
        onClick={() => setS(!s)}
        aria-label={s ? "Hide password" : "Show password"}
        aria-pressed={s}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
      >
        {s ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};
export const Stat = ({ label, value, icon: I, tone = "text-secondary" }) => (
  <div className="card p-3 sm:p-4 flex items-center gap-3 min-w-0">
    {I && (
      <span className={"rounded-xl bg-mist p-2.5 shrink-0 " + tone}>
        <I size={20} />
      </span>
    )}
    <div className="min-w-0">
      <div className="text-xs text-muted truncate">{label}</div>
      <div className="font-display text-xl sm:text-2xl leading-tight break-words">
        {value}
      </div>
    </div>
  </div>
);
export const Pager = ({ page, total, per, set }) => (
  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-sm items-center">
    <Btn disabled={page < 2} onClick={() => set(page - 1)}>
      Previous
    </Btn>
    <span className="text-muted">Page {page}</span>
    <Btn disabled={page * per >= total} onClick={() => set(page + 1)}>
      Next
    </Btn>
  </div>
);
export const Tabs = ({ tabs, value, onChange }) => (
  <div
    role="tablist"
    className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 mb-4 -mx-1 px-1"
  >
    {tabs.map(([k, l]) => (
      <button
        key={k}
        role="tab"
        aria-selected={value === k}
        onClick={() => onChange(k)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${value === k ? "bg-secondary text-white" : "bg-white border border-ink/10 hover:border-secondary"}`}
      >
        {l}
      </button>
    ))}
  </div>
);
export const useReveal = () => {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".rv:not(.in)").forEach((x) => io.observe(x));
    return () => io.disconnect();
  });
};
export const Counter = ({ to, suffix = "", dur = 1400 }) => {
  const [v, setV] = useState(0),
    r = useRef();
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(),
        tick = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          p < 1 && requestAnimationFrame(tick);
        };
      requestAnimationFrame(tick);
    });
    io.observe(r.current);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={r}>
      {v.toLocaleString()}
      {suffix}
    </span>
  );
};
