// Ad attribution shared by the browser (first-touch capture) and the server (allowlist).
export const ATTRIBUTION_KEY = 'invo-attribution:v1';
export type Tracking = Record<string, string>;
type AttributionStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function isTrackingKey(key: string): boolean {
  return /^utm_(source|medium|campaign|term|content|id)$/.test(key) || ['gclid', 'fbclid', 'msclkid'].includes(key);
}

// Keeps only allowlisted string values of a sane length; anything else is dropped.
export function pickTracking(value: unknown): Tracking {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, entry]) =>
    isTrackingKey(key) && typeof entry === 'string' && entry.length > 0 && entry.length <= 500));
}

export function trackingFromSearch(search: string): Tracking {
  return pickTracking(Object.fromEntries(new URLSearchParams(search)));
}

// First touch wins: a later visit without tags (or with different tags) never
// replaces the ad that first brought this browser to the site.
export function captureAttribution(search: string, storage: AttributionStorage): Tracking {
  const stored = readAttribution(storage);
  if (Object.keys(stored).length) return stored;
  const current = trackingFromSearch(search);
  if (Object.keys(current).length) {
    try { storage.setItem(ATTRIBUTION_KEY, JSON.stringify(current)); } catch { /* blocked storage */ }
  }
  return current;
}

export function readAttribution(storage: Pick<Storage, 'getItem'>): Tracking {
  try { return pickTracking(JSON.parse(storage.getItem(ATTRIBUTION_KEY) || 'null')); }
  catch { return {}; }
}

// Browser helpers: storage can be unavailable (private mode, blocked site data).
export function captureBrowserAttribution(): Tracking {
  if (typeof window === 'undefined') return {};
  try { return captureAttribution(window.location.search, window.localStorage); }
  catch { return trackingFromSearch(window.location.search); }
}

// Tags on the current URL describe this visit; otherwise use the stored first touch.
// Never mix the two sets, which would invent a source/campaign pairing.
export function browserAttribution(): Tracking {
  if (typeof window === 'undefined') return {};
  const current = trackingFromSearch(window.location.search);
  if (Object.keys(current).length) return current;
  try { return readAttribution(window.localStorage); } catch { return {}; }
}
