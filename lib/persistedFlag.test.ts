// lib/persistedFlag.test.ts
// GitHub issue #7 verification: the home page's "Show All" state has to survive
// a Back navigation, which means it has to survive a round trip through Web
// Storage — including the round trips that never complete.
//
// The throwing-storage cases below are NOT a contrived edge case. Safari
// Private Browsing and any browser with site data blocked raise a SecurityError
// on the storage accessor itself, before a method is ever called (D-4). Over
// half of this site's visitors are on an iPhone, so an unguarded read inside a
// layout effect would blank the home page for them. These tests are what keep
// the guards in place.
//
// Node 26 invocation notes (see lib/blogRedirects.test.ts for precedent):
// - Run with bare `yarn test` / `node --test` — never `node --test <dir>`
//   (repo gotcha, treats the path as a script to require).
// - The relative import below must use the exact on-disk extension
//   ("./persistedFlag" alone is rejected by Node's ESM resolver).
import test from "node:test";
import assert from "node:assert/strict";
import {
  HOME_SHOW_ALL_KEY,
  readPersistedFlag,
  writePersistedFlag,
  type FlagStorage,
} from "./persistedFlag.ts";

const KEY = "test:flag";

// A working per-tab storage, standing in for sessionStorage.
function memoryStorage(seed: Record<string, string> = {}): FlagStorage {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

// Safari Private Browsing / blocked site data: every access throws.
function hostileStorage(): FlagStorage {
  return {
    getItem: () => {
      throw new Error("SecurityError: storage is blocked");
    },
    setItem: () => {
      throw new Error("SecurityError: storage is blocked");
    },
  };
}

test("HOME_SHOW_ALL_KEY is the namespaced home-page key shared by both locales", () => {
  assert.equal(HOME_SHOW_ALL_KEY, "iridium:home:showAll");
});

test("reading a key that was never written returns false", () => {
  assert.equal(readPersistedFlag(KEY, memoryStorage()), false);
});

test("reading the exact expanded marker returns true", () => {
  assert.equal(readPersistedFlag(KEY, memoryStorage({ [KEY]: "1" })), true);
});

test("reading anything other than the exact marker returns false", () => {
  for (const stored of ["", "0", "true", "yes", "11", " 1", "1 ", "{}", "null"]) {
    assert.equal(
      readPersistedFlag(KEY, memoryStorage({ [KEY]: stored })),
      false,
      `stored value ${JSON.stringify(stored)} must degrade to collapsed`,
    );
  }
});

test("reading from a throwing storage returns false instead of propagating", () => {
  assert.doesNotThrow(() => readPersistedFlag(KEY, hostileStorage()));
  assert.equal(readPersistedFlag(KEY, hostileStorage()), false);
});

test("reading with no storage available returns false", () => {
  assert.equal(readPersistedFlag(KEY, null), false);
});

test("writing true then reading back returns true", () => {
  const storage = memoryStorage();
  writePersistedFlag(KEY, true, storage);
  assert.equal(readPersistedFlag(KEY, storage), true);
});

test("writing false then reading back returns false", () => {
  const storage = memoryStorage();
  writePersistedFlag(KEY, true, storage);
  writePersistedFlag(KEY, false, storage);
  assert.equal(readPersistedFlag(KEY, storage), false);
});

test("collapsing records an explicit marker rather than clearing the key", () => {
  // Presence-based persistence would let a visitor who expands, collapses, then
  // navigates away come back expanded. Collapsed has to be written down.
  const storage = memoryStorage();
  writePersistedFlag(KEY, false, storage);
  assert.equal(storage.getItem(KEY), "0");
});

test("writing to a throwing storage does not propagate", () => {
  assert.doesNotThrow(() => writePersistedFlag(KEY, true, hostileStorage()));
  assert.doesNotThrow(() => writePersistedFlag(KEY, false, hostileStorage()));
});

test("writing with no storage available is a no-op, not a throw", () => {
  assert.doesNotThrow(() => writePersistedFlag(KEY, true, null));
});

test("with no storage argument the module is safe outside a browser", () => {
  // No `window` under node:test — the same condition as the static export's
  // server render, where this module must stay import- and call-safe.
  assert.equal(readPersistedFlag(KEY), false);
  assert.doesNotThrow(() => writePersistedFlag(KEY, true));
});
