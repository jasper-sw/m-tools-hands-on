// feed/build-feed.js
// Builds the catalog feed CSV from window.PRODUCTS (data/products.js) and SITE_BASE_URL
// (config.js). Used by feed/generate.html. Not loaded by any store page.

var FEED_COLUMNS = [
  "id", "title", "description", "availability", "condition",
  "price", "link", "image_link", "brand", "google_product_category"
];

// Quote a CSV field only if it contains a comma, quote or newline (so plain ids stay unquoted).
function csvField(value) {
  var s = String(value);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function buildFeedCsv(products, baseUrl) {
  var rows = products.map(function (p) {
    return [
      p.id,                                        // must equal the content_ids sent in events
      p.title,
      p.description,
      p.availability,
      p.condition,
      p.price.toFixed(2) + " " + p.currency,       // e.g. "18.00 USD"
      baseUrl + "/products/" + encodeURIComponent(p.id) + ".html",  // same URL as the page's og:url
      baseUrl + "/images/" + p.id + ".png",        // PNG copy of the inline SVG (catalogs need JPG/PNG)
      p.brand,
      p.category
    ].map(csvField).join(",");
  });
  return [FEED_COLUMNS.join(",")].concat(rows).join("\n") + "\n";
}
