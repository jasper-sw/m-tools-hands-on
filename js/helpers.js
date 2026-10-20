// js/helpers.js
// Utilities for YOUR instrumentation work. The store itself never calls these.
// Loaded on every page, so they are available inside each page's instrumentation <script>.

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

// ---------------------------------------------------------------------------
// TODO (Advanced Matching): SHA-256 helper, intentionally NOT implemented.
//
// - Normalize each value before hashing (that is part of the exercise).
// - The browser has this built in: crypto.subtle.digest("SHA-256", bytes)
//   returns a Promise<ArrayBuffer>. Encode the input with new TextEncoder().encode(str)
//   and convert the result to a lowercase hex string.
// - crypto.subtle only exists in secure contexts (https:// or localhost).
//
// async function sha256(value) {
//   // TODO: implement me
// }
// ---------------------------------------------------------------------------
