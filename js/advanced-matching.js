// js/advanced-matching.js
// Advanced Matching (step 2.3). Loaded in <head> on every page, after js/helpers.js and
// BEFORE the Pixel base code, which calls fbq('init', PIXEL_ID, getStoredUserData()).
//
// Why store hashes? Match keys must be passed to fbq('init'), which runs in <head> before the
// page has loaded, but hashing (crypto.subtle) is asynchronous. So we hash as soon as the data
// is available (checkout form, first visit) and keep ONLY the hashes in localStorage; every
// later page, including the Purchase on confirmation.html, reads them synchronously.
// Raw PII is never stored by this file and never sent to Meta.
// The same values (plus fbp/fbc) are what you'll forward server-side via CAPI in step 2.5.

var USER_DATA_KEY = "demo_store_user_data";     // localStorage: { em, ph, ..., external_id }, SHA-256 hex
var EXTERNAL_ID_KEY = "demo_store_external_id"; // localStorage: raw random visitor id (not PII)

// ---- Normalization --------------------------------------------------------------
// Meta hashes nothing for you on the CAPI side, and a hash of "Test@Example.com " won't match
// a hash of "test@example.com", so every value is normalized before hashing.

// Email: trim, lowercase.
function normalizeEmail(v) { return v.trim().toLowerCase(); }

// Phone: digits only, no leading zeros, MUST include the country code.
// "+1 (555) 555-0100" -> "15555550100". A 10-digit US number without one gets "1" prepended.
function normalizePhone(v, country) {
  var digits = v.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10 && country === "us") digits = "1" + digits;
  return digits;
}

// First name, last name, city: lowercase letters only (no spaces, punctuation or digits).
// "Anytown" -> "anytown". \p{L} keeps accented letters, which are hashed as UTF-8.
function normalizeLetters(v) { return v.toLowerCase().replace(/[^\p{L}]/gu, ""); }

// State: 2-letter code, lowercase. "CA" -> "ca". (Expects a code, not a full state name.)
function normalizeState(v) { return v.toLowerCase().replace(/[^a-z]/g, ""); }

// ZIP: lowercase, no spaces or dashes; US uses the first 5 digits only. "95555-1234" -> "95555".
function normalizeZip(v, country) {
  var zip = v.toLowerCase().replace(/[\s-]/g, "");
  return country === "us" ? zip.slice(0, 5) : zip;
}

// Country: ISO 3166-1 alpha-2, lowercase. "US" -> "us".
function normalizeCountry(v) { return v.trim().toLowerCase(); }

// Maps checkout form values (getCustomerFromForm() in checkout.html) to normalized match keys.
// Street address is not an Advanced Matching key, so it is left out.
function normalizeCustomer(c) {
  var country = normalizeCountry(c.country || "");
  return {
    em: normalizeEmail(c.email || ""),
    ph: normalizePhone(c.phone || "", country),
    fn: normalizeLetters(c.first_name || ""),
    ln: normalizeLetters(c.last_name || ""),
    ct: normalizeLetters(c.city || ""),
    st: normalizeState(c.state || ""),
    zp: normalizeZip(c.zip || "", country),
    country: country
  };
}

// ---- Hashing + storage -----------------------------------------------------------

// crypto.subtle only exists on https:// and localhost, so nothing is hashed from file://.
function canHash() { return !!(window.crypto && crypto.subtle); }

// Hashes every non-empty value of { key: normalizedValue }. Resolves to { key: sha256hex }.
async function hashUserData(normalized) {
  var hashed = {};
  for (var key in normalized) {
    if (normalized[key]) hashed[key] = await sha256(normalized[key]);
  }
  return hashed;
}

// The hashed match keys collected so far ({} if none). Passed to fbq('init') in <head>.
function getStoredUserData() {
  try {
    return JSON.parse(localStorage.getItem(USER_DATA_KEY)) || {};
  } catch (e) {
    return {};
  }
}

// Merges new hashed keys into the stored ones (external_id from the first visit + em/ph/... from checkout).
function saveUserData(hashed) {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(Object.assign(getStoredUserData(), hashed)));
}

// Normalizes, hashes and stores checkout form values. Called from checkout.html.
function storeCustomerMatchKeys(customer) {
  if (!canHash()) return Promise.resolve();
  return hashUserData(normalizeCustomer(customer)).then(saveUserData);
}

// ---- external_id -----------------------------------------------------------------
// A random id per browser, standing in for the customer id a real store would have. It links
// a visitor's events together even before they type an email. Sent hashed; in step 2.5,
// send the SAME hashed value server-side.
function getExternalId() {
  var id = localStorage.getItem(EXTERNAL_ID_KEY);
  if (!id) {
    id = generateEventId();
    localStorage.setItem(EXTERNAL_ID_KEY, id);
  }
  return id;
}

// ---- fbc / fbp -------------------------------------------------------------------
// A visitor arriving from an ad has ?fbclid=... in the URL. Store it in the _fbc cookie in the
// format fb.1.<creation time in ms>.<fbclid>, keeping the original creation time if this same
// fbclid was already captured. The Pixel can also set _fbc itself; doing it here guarantees
// it exists for CAPI. _fbp is set by the Pixel automatically. Read both with getCookie().
function captureFbc() {
  var fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid) return;
  var existing = getCookie("_fbc");
  if (existing && existing.split(".").slice(3).join(".") === fbclid) return;
  document.cookie = "_fbc=fb.1." + Date.now() + "." + fbclid +
    "; max-age=" + 90 * 24 * 60 * 60 + "; path=/; SameSite=Lax" +
    (window.location.protocol === "https:" ? "; Secure" : "");
}

// Everything you'll need for CAPI user_data in step 2.5. All values are hashed except fbp and
// fbc, which must be sent as-is (never hash them).
function getUserDataForCapi() {
  return Object.assign({}, getStoredUserData(), { fbp: getCookie("_fbp"), fbc: getCookie("_fbc") });
}

// ---- Runs on every page load, before the Pixel base code ---------------------------
captureFbc();
// The very first page view of a new visitor goes out without external_id (hashing is async);
// every later event has it.
if (canHash() && !getStoredUserData().external_id) {
  hashUserData({ external_id: getExternalId() }).then(saveUserData);
}
