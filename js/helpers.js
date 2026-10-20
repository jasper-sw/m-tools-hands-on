// js/helpers.js
// Utilities for instrumentation work. The store itself never calls these.
// Loaded in <head> on every page (before the Pixel base code), so they are available
// everywhere: in js/advanced-matching.js, the base code, and each instrumentation <script>.

// Returns a random UUID-style string. Use the SAME value as `eventID` in the browser
// event and `event_id` in the matching server (CAPI) event so the two can be deduplicated.
function generateEventId() {
  if (window.crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID(); // available on https:// and localhost
  }
  // Fallback for contexts where randomUUID is missing (e.g. some file:// setups).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Returns the value of a cookie, or null if it is not set.
// Use for getCookie("_fbp") and getCookie("_fbc"). Note: browsers generally do not
// keep cookies for file:// pages, so test this on your GitHub Pages URL.
function getCookie(name) {
  var prefix = name + "=";
  var match = document.cookie.split("; ").find(function (row) { return row.indexOf(prefix) === 0; });
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

// Returns a Promise for the SHA-256 hash of a string, as lowercase hex (64 chars).
// Normalize values BEFORE hashing (see js/advanced-matching.js). crypto.subtle only exists
// in secure contexts (https:// or localhost), so callers should check for it first.
async function sha256(value) {
  var digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map(function (b) { return b.toString(16).padStart(2, "0"); })
    .join("");
}
