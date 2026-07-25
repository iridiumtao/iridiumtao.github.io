// lib/persistedFlag.ts
// Per-tab persistence for small boolean UI flags, kept React-free so it can be
// unit-tested without a DOM.
//
// This exists for GitHub issue #7: expanding the home page's project list,
// opening one of the projects it revealed, and pressing Back used to land the
// visitor on a collapsed page — with the card they clicked gone and the
// browser's restored scroll offset applied to a page hundreds of pixels
// shorter than the one they left.
//
// sessionStorage, not a query parameter: the site publishes a careful canonical
// + hreflang set, and a "?all=1" variant of the home page would be a second
// shareable, indexable URL for identical content. Per-tab storage dies with the
// tab, needs no routing change, and survives the static export with no server.
//
// Storage is taken as an injected parameter rather than reached for directly.
// That is what makes these two functions testable, and it is the reason this
// logic lives here instead of inside the component.

/** The slice of the DOM Storage API this module actually uses. */
export type FlagStorage = Pick<Storage, "getItem" | "setItem">;

// One key for both locales: an expanded project list is the same UI state in
// English and Chinese, so it should survive a language switch (D-5).
export const HOME_SHOW_ALL_KEY = "iridium:home:showAll";

// Explicit two-value marker rather than key presence. Collapsing has to record
// "collapsed" actively — with presence-based persistence, a visitor who expands,
// collapses, then navigates away would come back expanded.
const TRUE_MARKER = "1";
const FALSE_MARKER = "0";

// The per-tab storage object when it is reachable, null otherwise.
//
// The property access itself is inside the try, not just the method calls: when
// site data is blocked (Safari Private Browsing, disabled cookies, enterprise
// policy), merely touching sessionStorage on window throws a SecurityError
// before any method is invoked. Returning null when window is undefined also
// keeps this module call-safe during the static export's server render.
function defaultStorage(): FlagStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage ?? null;
  } catch {
    return null;
  }
}

// Read a persisted flag. Only the exact marker counts as true, so a tampered,
// truncated, or stale value degrades to false rather than half-working — the
// value never reaches the DOM, it only picks a branch.
//
// Failure is silent by design, not by omission: this is cosmetic UI state, and
// a blocked-storage browser would otherwise log on every single page load.
export function readPersistedFlag(
  key: string,
  storage: FlagStorage | null = defaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(key) === TRUE_MARKER;
  } catch {
    return false;
  }
}

// Write a persisted flag. Swallows storage failures for the same reason the
// reader does — losing the memory of a toggle is invisible; throwing out of a
// click handler is not.
export function writePersistedFlag(
  key: string,
  value: boolean,
  storage: FlagStorage | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(key, value ? TRUE_MARKER : FALSE_MARKER);
  } catch {
    // Intentionally ignored — see the note above.
  }
}
