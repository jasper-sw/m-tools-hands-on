# Fernhollow Goods: demo store for Pixel / Conversions API practice

**This is a fictional, test-only store built for a training exercise.** "Fernhollow Goods" is
not a real business. The site accepts no payments, sends no data anywhere, and contains no real
personal or confidential data. The checkout form is prefilled with obviously fake values
(`test@example.com`, `+1 (555) 555-0100`, `123 Example Street`, ...), and placing an "order" only
writes to your own browser's storage.

The store is plain HTML + one CSS file + vanilla JS. No build step, no dependencies, no server.
It shipped with no tracking code; the instrumentation is added step by step (see
"Instrumentation progress" below).

## File tree

```
index.html          product listing
product.html        product detail (?id=SKU-xxxx)
cart.html           cart
checkout.html       fake checkout form
confirmation.html   order confirmation (Purchase goes here)
css/style.css       the only stylesheet
data/products.js    window.PRODUCTS, the single source of truth for all 4 products
js/cart.js          cart (localStorage), order hand-off (sessionStorage), header counter
js/helpers.js       generateEventId(), getCookie(), sha256()
js/advanced-matching.js  normalize + hash match keys, external_id, _fbc capture (step 2.3)
config.js           SITE_BASE_URL (used only for the catalog feed)
feed/products.csv   catalog feed
feed/build-feed.js  CSV builder used by feed/generate.html
feed/generate.html  open in a browser to regenerate products.csv
images/*.svg        standalone copies of the product images (for the feed's image_link)
.nojekyll           tells GitHub Pages to serve files as-is
```

## Run it locally

Double-click `index.html`. Everything works from `file://`, except that browsers generally don't
store cookies for `file://` pages (so no `_fbp`/`_fbc`), and `crypto.subtle` needs `https://`.
Use the published GitHub Pages URL for anything involving the Pixel.

## Publish on GitHub Pages

This repo is public on GitHub at
[github.com/jasper-sw/m-tools-hands-on](https://github.com/jasper-sw/m-tools-hands-on).

1. Commit and push to `main`:
   ```sh
   git add -A && git commit -m "Add demo store" && git push origin main
   ```
2. On GitHub, go to the repo's **Settings → Pages**. Under "Build and deployment", set
   Source = **Deploy from a branch**, Branch = **`main`**, folder = **`/ (root)`**, then Save.
   (Only needed once.)
3. Wait a few minutes. The first deploy can take a while; progress shows under the repo's
   **Actions** tab. The site will be at **https://jasper-sw.github.io/m-tools-hands-on/**.

All links in the site are relative, so it works under the `/m-tools-hands-on/` subpath without changes.

The catalog feed will be live at
`https://jasper-sw.github.io/m-tools-hands-on/feed/products.csv`, which you can use as a
scheduled feed URL.

## Changing the feed URL

`SITE_BASE_URL` on **line 5 of `config.js`** (the only non-comment line) is already set to
`"https://jasper-sw.github.io/m-tools-hands-on"`, and `feed/products.csv` was generated from it.
If the repo is ever renamed or forked:

1. Edit that line (no trailing slash).
2. **Regenerate `feed/products.csv`**. The CSV is a static file, so editing `config.js` alone
   does not change it:
   - Open `feed/generate.html` in your browser, check the URL it shows, click
     **Download products.csv**, and replace `feed/products.csv` with the downloaded file; **or**
   - run a find-and-replace (macOS sed shown):
     `sed -i '' 's#https://jasper-sw.github.io/m-tools-hands-on#https://NEW_USER.github.io/NEW_REPO#g' feed/products.csv`
3. Commit and push.

### Image tradeoff

The pages show product images as **inline SVG data URIs** built in `data/products.js`, so the
store makes zero image requests. A catalog feed needs a real, fetchable `image_link`, so the
same SVG markup is also saved as standalone files in `images/SKU-xxxx.svg`, and the feed points
there. If you change an image in `products.js`, update the matching file in `images/` too.

**Heads-up:** catalog ingestion generally expects JPG or PNG images, so the SVG `image_link`s
may be rejected or show as missing images. If that happens, export each SVG as a 600×600 PNG
with any image editor, save them as `images/SKU-xxxx.png`, change `".svg"` to `".png"` in
`feed/build-feed.js`, and regenerate the feed.

## Where each event goes

Every page has these two empty comment lines in `<head>`:

```html
<!-- ===== META PIXEL BASE CODE GOES HERE (step 2.1) ===== -->
<!-- ===== DOMAIN VERIFICATION META TAG GOES HERE (step 2.8) ===== -->
```

and, at the end of `<body>`, an empty `<script>` block starting with
`// ===== INSTRUMENTATION: <page> =====` that describes what to fire there. The data objects are
set by the page script that runs just before that block, so they're ready when your code runs.

| Page | Event(s) to fire | Trigger | Parameters come from |
|---|---|---|---|
| all pages | PageView | base code in `<head>` | — |
| `index.html` | (none beyond PageView) | — | — |
| `product.html` | ViewContent | page load | `window.PAGE_DATA` (`null` if the SKU is unknown) |
| `product.html` | AddToCart | click `#add-to-cart-btn` | `window.PAGE_DATA` + button `data-sku`, `data-qty` |
| `cart.html` | (optional) InitiateCheckout | click `#checkout-btn` | `window.PAGE_DATA` + button `data-sku`, `data-qty` |
| `checkout.html` | InitiateCheckout (recommended spot) | page load | `window.PAGE_DATA`; form values via `getCustomerFromForm()` |
| `confirmation.html` | Purchase | page load | `window.ORDER_DATA`; customer via `window.CUSTOMER_DATA` (both `null` if no order) |

Fire InitiateCheckout in **one** place only. Data shapes:

```js
// product.html
window.PAGE_DATA  = { content_ids: ["SKU-1001"], content_name: "Speckled Stoneware Mug",
                      content_type: "product", value: 18, currency: "USD" }
// cart.html and checkout.html (cart.html keeps it current as quantities change)
window.PAGE_DATA  = { content_ids: ["SKU-1001", "SKU-1003"],
                      contents: [{ id: "SKU-1001", quantity: 2, item_price: 18 },
                                 { id: "SKU-1003", quantity: 1, item_price: 32 }],
                      num_items: 3, value: 68, currency: "USD" }
// confirmation.html
window.ORDER_DATA = { order_id: "ORD-1760000000000-AB12", content_ids: [...], contents: [...],
                      num_items: 3, value: 68, currency: "USD" }
window.CUSTOMER_DATA = { first_name, last_name, email, phone, street, city, state, zip, country } // raw, unhashed
```

Multi-item buttons (`#checkout-btn`, `#place-order-btn`) carry comma-separated, same-order lists:
`data-sku="SKU-1001,SKU-1003" data-qty="2,1"`.

Helpers in `js/helpers.js` (loaded in `<head>` on every page): `generateEventId()` for
browser/server deduplication, `getCookie("_fbp")` / `getCookie("_fbc")`, and `sha256(str)`.

## Advanced Matching (step 2.3)

`js/advanced-matching.js` loads in `<head>` before the Pixel code. The base code calls
`fbq('init', PIXEL_ID, getStoredUserData())`.

- **Why hashes are stored:** `fbq('init')` runs before the page loads, but browser hashing is
  asynchronous. So the checkout page normalizes and hashes the form fields (on load and on every
  edit) and stores **only the SHA-256 hashes** in localStorage (`demo_store_user_data`). Every
  later page passes them to `init`, including the Purchase on `confirmation.html`.
- **Keys sent:** `em, ph, fn, ln, ct, st, zp, country, external_id`. Normalization rules are
  commented in the file (e.g. phone `+1 (555) 555-0100` → `15555550100`).
- **external_id:** a random id per browser (`demo_store_external_id`), standing in for a customer
  id. It's sent hashed, from the visitor's second page view onward.
- **fbc / fbp:** visiting with `?fbclid=...` writes the `_fbc` cookie as `fb.1.<ms>.<fbclid>`.
  `_fbp` is set by the Pixel itself.
- **For CAPI (step 2.5):** `getUserDataForCapi()` returns the same hashed keys plus raw
  `fbp`/`fbc`. Send exactly these values server-side.
- Automatic Advanced Matching is also on (Events Manager → dataset Settings).

## Products (quick reference)

These ids must match `content_ids` in your events and the `id` column in `feed/products.csv`.

| id | title | price |
|---|---|---|
| SKU-1001 | Speckled Stoneware Mug | 18.00 USD |
| SKU-1002 | Canvas Market Tote | 24.50 USD |
| SKU-1003 | Terracotta Planter | 32.00 USD |
| SKU-1004 | Dot Grid Notebook | 12.99 USD |

## Instrumentation progress

- **Done:** Pixel base code + PageView (2.1); ViewContent, AddToCart, InitiateCheckout,
  Purchase (2.2); Advanced Matching with hashed identifiers + fbp/fbc (2.3).
- **Not yet:** Conversions API and event_id deduplication (2.4–2.6), domain verification (2.8).

## What is deliberately missing

- **No server**: static files only; "orders" live in your browser's `sessionStorage`.
- **No payments**: no card fields, nothing is charged. (Only hashed checkout fields leave the
  browser, with Pixel events.)
- No analytics or external requests other than the Pixel (no CDNs, fonts, or remote images).
