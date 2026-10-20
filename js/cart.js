// js/cart.js
// Shared store logic: product lookup, cart state in localStorage, order hand-off via
// sessionStorage, and the cart counter in the header. No network calls anywhere.

var CART_KEY = "demo_store_cart";   // localStorage: [{ id: "SKU-1001", quantity: 2 }, ...]
var ORDER_KEY = "demo_store_order"; // sessionStorage: the last placed order (see placeOrder)

function findProduct(id) {
  return window.PRODUCTS.find(function (p) { return p.id === id; }) || null;
}

function formatPrice(amount, currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
}

// ---- Cart state -------------------------------------------------------------

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return []; // corrupted value: treat as empty
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  renderCartCount();
}

function addToCart(id, quantity) {
  var items = readCart();
  var line = items.find(function (item) { return item.id === id; });
  if (line) {
    line.quantity += quantity;
  } else {
    items.push({ id: id, quantity: quantity });
  }
  writeCart(items);
}

// Setting a quantity of 0 or less removes the line.
function setQuantity(id, quantity) {
  var items = readCart()
    .map(function (item) { return item.id === id ? { id: id, quantity: quantity } : item; })
    .filter(function (item) { return item.quantity > 0; });
  writeCart(items);
}

function removeFromCart(id) {
  setQuantity(id, 0);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  renderCartCount();
}

// Cart lines joined with product data. Unknown SKUs (e.g. stale data) are skipped.
function cartLines() {
  return readCart()
    .map(function (item) {
      var product = findProduct(item.id);
      return product ? { product: product, quantity: item.quantity } : null;
    })
    .filter(Boolean);
}

// The normalized cart object used as window.PAGE_DATA on cart.html and checkout.html.
// Shape: { content_ids, contents: [{ id, quantity, item_price }], num_items, value, currency }
function cartSummary() {
  var lines = cartLines();
  var total = lines.reduce(function (sum, l) { return sum + l.product.price * l.quantity; }, 0);
  return {
    content_ids: lines.map(function (l) { return l.product.id; }),
    contents: lines.map(function (l) {
      return { id: l.product.id, quantity: l.quantity, item_price: l.product.price };
    }),
    num_items: lines.reduce(function (sum, l) { return sum + l.quantity; }, 0),
    value: Math.round(total * 100) / 100, // avoid float noise like 30.990000000000002
    currency: "USD"
  };
}

// ---- Orders -----------------------------------------------------------------

// "Places" an order entirely in the browser: nothing is sent anywhere.
// Saves the order to sessionStorage, empties the cart, and returns the order.
function placeOrder(customer) {
  var summary = cartSummary();
  var order = {
    order_id: "ORD-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    content_ids: summary.content_ids,
    contents: summary.contents,
    num_items: summary.num_items,
    value: summary.value,
    currency: summary.currency,
    customer: customer // fake form values, kept only so confirmation.html can show them
  };
  sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
  clearCart();
  return order;
}

function readLastOrder() {
  try {
    return JSON.parse(sessionStorage.getItem(ORDER_KEY));
  } catch (e) {
    return null;
  }
}

// ---- Header -----------------------------------------------------------------

// Updates the "Cart (n)" counter in the header on every page.
function renderCartCount() {
  var el = document.getElementById("cart-count");
  if (el) el.textContent = cartSummary().num_items;
}

document.addEventListener("DOMContentLoaded", renderCartCount);
