// lib/analytics.ts
// GoatCounter configuration and the typed handle onto its global.
//
// GoatCounter is a cookieless, aggregate-only pageview counter: no cookies, no
// cross-site identifiers, and no visitor IPs retained, so the site needs no
// consent banner. It is loaded from gc.zgo.at as a third-party script.

// The subdomain chosen when registering at https://www.goatcounter.com — for
// "iridium.goatcounter.com" this is exactly "iridium", with no protocol, dots,
// or trailing slash. Leaving it empty disables analytics entirely: no script
// tag is rendered and no request is made, which is the intended state until a
// site code exists.
export const GOATCOUNTER_CODE = "iridiumtao";

export const goatcounterEndpoint = GOATCOUNTER_CODE
  ? `https://${GOATCOUNTER_CODE}.goatcounter.com/count`
  : null;

// Shape of the global that count.js installs. `count` is absent until the
// script finishes loading, so every call site must check before invoking it.
type GoatCounter = {
  count?: (vars?: { path?: string; title?: string; referrer?: string }) => void;
};

declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

// Count one pageview for the current URL. Safe to call before count.js has
// loaded (and on the server) — it simply does nothing.
//
// The path is passed explicitly rather than relying on count.js's default of
// reading location at call time: Next's routeChangeComplete fires with the new
// URL already committed, but passing it removes any doubt about ordering.
export function countPageview(path: string): void {
  if (typeof window === "undefined") return;
  window.goatcounter?.count?.({ path });
}
