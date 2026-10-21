// data/products.js
// SINGLE SOURCE OF TRUTH for the 4 demo products. Every page reads window.PRODUCTS.
// The `id` values are hardcoded SKUs and must stay identical to the `id` column in
// feed/products.csv: catalog matching depends on content_ids === feed ids.

(function () {
  // Builds a simple square placeholder image as an SVG data URI.
  // The exact same SVG markup is saved as images/<SKU>.svg for the catalog feed.
  function placeholderImage(sku, label, background, accent) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">' +
      '<rect width="600" height="600" fill="' + background + '"/>' +
      '<circle cx="300" cy="250" r="130" fill="' + accent + '"/>' +
      '<text x="300" y="460" font-family="Helvetica, Arial, sans-serif" font-size="44" ' +
      'text-anchor="middle" fill="#222222">' + label + '</text>' +
      '<text x="300" y="515" font-family="Helvetica, Arial, sans-serif" font-size="28" ' +
      'text-anchor="middle" fill="#555555">' + sku + ' (demo)</text>' +
      '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  var BRAND = "Fernhollow Goods"; // invented brand name

  window.PRODUCTS = [
    {
      id: "SKU-1001",
      title: "Speckled Stoneware Mug",
      description: "A 12 oz speckled stoneware mug with a matte glaze. Dishwasher safe. Fictional demo product.",
      price: 22.00,
      currency: "USD",
      availability: "in stock",
      condition: "new",
      brand: BRAND,
      category: "Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs",
      image: placeholderImage("SKU-1001", "Stoneware Mug", "#f3e9dc", "#c8a27a")
    },
    {
      id: "SKU-1002",
      title: "Canvas Market Tote",
      description: "A sturdy natural-canvas tote bag with long handles and an inner pocket. Fictional demo product.",
      price: 29.50,
      currency: "USD",
      availability: "in stock",
      condition: "new",
      brand: BRAND,
      category: "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
      image: placeholderImage("SKU-1002", "Market Tote", "#e6efe6", "#7fa77f")
    },
    {
      id: "SKU-1003",
      title: "Terracotta Planter",
      description: "A 6 inch terracotta planter with drainage hole and matching saucer. Fictional demo product.",
      price: 27.00,
      currency: "USD",
      availability: "in stock",
      condition: "new",
      brand: BRAND,
      category: "Home & Garden > Lawn & Garden > Gardening > Pots & Planters",
      image: placeholderImage("SKU-1003", "Terracotta Planter", "#f6e3dc", "#c96f4f")
    },
    {
      id: "SKU-1004",
      title: "Dot Grid Notebook",
      description: "An A5 dot grid notebook with 160 pages and a lay-flat binding. Fictional demo product.",
      price: 14.99,
      currency: "USD",
      availability: "in stock",
      condition: "new",
      brand: BRAND,
      category: "Office Supplies > General Office Supplies > Paper Products > Notebooks & Notepads",
      image: placeholderImage("SKU-1004", "Dot Grid Notebook", "#e3e8f3", "#6f86b8")
    }
  ];
})();
