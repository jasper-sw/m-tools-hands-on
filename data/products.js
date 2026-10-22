// data/products.js
// SINGLE SOURCE OF TRUTH for the 8 demo products. Every page reads window.PRODUCTS.
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
    },
    {
      id: "SKU-1005",
      title: "Beeswax Taper Candle Pair",
      description: "Two 10 inch hand-dipped beeswax taper candles with cotton wicks. About 8 hours of burn time each. Fictional demo product.",
      price: 18.00,
      currency: "USD",
      availability: "in stock",
      condition: "new",
      brand: BRAND,
      category: "Home & Garden > Decor > Home Fragrances > Candles",
      image: placeholderImage("SKU-1005", "Taper Candles", "#f7f0d9", "#d9b44a")
    },
    {
      id: "SKU-1006",
      title: "Striped Linen Tea Towel",
      description: "A 20 x 28 inch tea towel in washed linen with a woven stripe and a hanging loop. Fictional demo product.",
      price: 12.50,
      currency: "USD",
      availability: "in stock",
      condition: "new",
      brand: BRAND,
      category: "Home & Garden > Linens & Bedding > Towels > Kitchen Towels",
      image: placeholderImage("SKU-1006", "Linen Tea Towel", "#e9eef0", "#8fa9b5")
    },
    {
      id: "SKU-1007",
      title: "Walnut Cutting Board",
      description: "A 16 x 10 inch end-grain walnut cutting board with a juice groove. Hand wash and oil occasionally. Fictional demo product.",
      price: 45.00,
      currency: "USD",
      availability: "in stock",
      condition: "new",
      brand: BRAND,
      category: "Home & Garden > Kitchen & Dining > Kitchen Tools & Utensils > Cutting Boards",
      image: placeholderImage("SKU-1007", "Cutting Board", "#efe6dd", "#8a5a3b")
    },
    {
      id: "SKU-1008",
      title: "Merino Wool Throw",
      description: "A 50 x 60 inch merino wool throw blanket with fringed edges, woven in a soft herringbone. Fictional demo product.",
      price: 68.00,
      currency: "USD",
      availability: "in stock",
      condition: "new",
      brand: BRAND,
      category: "Home & Garden > Linens & Bedding > Bedding > Blankets",
      image: placeholderImage("SKU-1008", "Wool Throw", "#ece6f0", "#9b86b0")
    }
  ];
})();
