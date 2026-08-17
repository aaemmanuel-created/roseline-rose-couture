/* ————————————————————————————————————————————————
   Roseline Rose Couture — Shopify checkout settings

   Fill in the three values below and the basket turns on across the
   whole site. Leave them blank and nothing shopping-related appears —
   the site stays exactly as it is today.

   Where each value comes from is written in SHOPIFY-SETUP.md.
   ———————————————————————————————————————————————— */

window.SHOP_CONFIG = {

  /* 1. Your store's permanent Shopify address, e.g. "roseline-rose.myshopify.com"
        (Shopify admin → Settings → Domains → "myshopify.com domain") */
  domain: "d5e648-03.myshopify.com",

  /* 2. Storefront API access token — public by design. It can only read the
        catalogue and create baskets; it cannot touch orders, customers or
        money. Issued by the Buy Button channel (Sales channels → Buy Button
        → create a button → Copy code). */
  storefrontAccessToken: "a4e31eb29194a2c0c4d558c6fb045487",

  /* 3. Product IDs are optional. The Shopify product handles match this
        site's page names (e.g. victory-dress), so the basket finds each
        piece by handle. Only fill one in if a handle is renamed in Shopify. */
  products: {},

  /* Wording — change freely */
  addLabel: "Add to basket",
  addedLabel: "Added",
  soldOutLabel: "Made to order only",
  cartLabel: "Basket"
};
