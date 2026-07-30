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
  domain: "",

  /* 2. Storefront API access token
        (Shopify admin → Settings → Apps and sales channels → Develop apps
         → your app → API credentials → Storefront API access token) */
  storefrontAccessToken: "",

  /* 3. One Shopify product ID per page on this site.
        Open a product in Shopify admin and copy the number at the end of
        the address bar, e.g. .../products/8123456789012 → "8123456789012" */
  products: {
    "esther-royale-blue":   "",
    "esther-royale-red":    "",
    "esther-royale-purple": "",
    "esther-royale-mini":   "",
    "victory-dress":        "",
    "majesty-gown":         "",
    "favour-fringe-gold":   "",
    "favour-fringe-red":    "",
    "favour-fringe-blue":   "",
    "favour-fringe-pink":   ""
  },

  /* Wording — change freely */
  addLabel: "Add to basket",
  addedLabel: "Added",
  soldOutLabel: "Made to order only",
  cartLabel: "Basket"
};
