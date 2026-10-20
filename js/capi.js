// js/capi.js
// Conversions API copies of Pixel events (step 2.5). Loaded in <head> on every page, after
// js/advanced-matching.js and before the Pixel base code.
//
// TEST-ONLY SHORTCUT: GitHub Pages can't run server code, so the browser calls the Conversions
// API directly with a HARDCODED access token. Anyone can read this token in the page source and
// send events to the dataset. Never do this for a real business: there, the token lives on a
// server and the browser never sees it. Events arriving through this endpoint still show up as
// "Server" in Events Manager.

var CAPI_DATASET_ID = "27002620367424";
var CAPI_GRAPH_VERSION = "v21.0";
var CAPI_ACCESS_TOKEN = "EAAAXYFttG74BSzDoHf5g9V9R2DgLBuCCVszf4ZBb5CgGDtyGTVASii0x2asfcqfhoKz3H5Qr8ueAs1HFRcxDo9ZB1Un37w7gMnFBFLzadIKN3pc2piDZCJyVhsHZA1gVgQ4XQVZCDjZA0K8Al09nYgLDYByitxHzBZCCkiwjUVg2AAkrN9eKkC2cXJyvGsYImqmfTUrdp6pPmqT7NGeIbJPnvb63Tmox0EGN19qh8YIY3YZD";
// From Events Manager > Test Events. Codes can change between sessions: update it when it does.
// Set to "" to send events to the live dataset instead of Test Events.
var CAPI_TEST_EVENT_CODE = "";

// Fires a Pixel event AND its CAPI copy with one shared event_id, so Meta can deduplicate
// them (step 2.6). Pass an eventId to choose it yourself (e.g. the order id for Purchase);
// otherwise a random one is generated. Returns the event_id used.
function trackEvent(eventName, params, eventId) {
  eventId = eventId || generateEventId();
  fbq("track", eventName, params, { eventID: eventId });
  sendServerEvent(eventName, eventId, params);
  return eventId;
}

// Sends the CAPI copy of an event. user_data is the hashed Advanced Matching keys plus raw
// fbp/fbc (getUserDataForCapi) and the browser's user agent, which CAPI requires for website
// events. (A real server would also send client_ip_address; the browser can't know it.)
function sendServerEvent(eventName, eventId, customData) {
  whenLoaded(function () {
    var userData = getUserDataForCapi();
    if (!userData.fbp) delete userData.fbp; // omit rather than send null
    if (!userData.fbc) delete userData.fbc;
    userData.client_user_agent = navigator.userAgent;

    var event = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "website",
      event_source_url: window.location.href,
      user_data: userData,
      custom_data: customData || {}
    };

    // Form-encoded (not JSON) so the browser sends a "simple" cross-origin request with no
    // CORS preflight. The Graph API accepts `data` as a JSON string.
    var body = new URLSearchParams({ data: JSON.stringify([event]), access_token: CAPI_ACCESS_TOKEN });
    if (CAPI_TEST_EVENT_CODE) body.set("test_event_code", CAPI_TEST_EVENT_CODE);

    fetch("https://graph.facebook.com/" + CAPI_GRAPH_VERSION + "/" + CAPI_DATASET_ID + "/events", {
      method: "POST",
      body: body,
      keepalive: true // lets the request finish even if the page navigates away
    })
      .then(function (response) { return response.json(); })
      .then(function (result) { console.log("CAPI " + eventName + " (" + eventId + "):", result); })
      .catch(function (error) { console.warn("CAPI " + eventName + " failed:", error); });
  });
}

// Runs fn after window load: fbevents.js has executed by then, so the _fbp cookie exists.
function whenLoaded(fn) {
  if (document.readyState === "complete") fn();
  else window.addEventListener("load", fn);
}
