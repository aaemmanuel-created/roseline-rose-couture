/* Roseline Rose Couture — Shopify basket
   Uses Shopify's Buy Button JS SDK for the data and the hosted checkout,
   but keeps the house's own buttons and type. Silent until shop-config.js
   is filled in. */
(function () {
  "use strict";

  var cfg = window.SHOP_CONFIG || {};
  var ready = cfg.domain && cfg.storefrontAccessToken;

  var buyBlocks = document.querySelectorAll("[data-buy]");
  var cartBtns = document.querySelectorAll("[data-cart-open]");
  var counts = document.querySelectorAll("[data-cart-count]");

  function setCount(n) {
    counts.forEach(function (el) {
      el.textContent = n;
      el.hidden = !n;
    });
  }

  // The basket icon always leads to the basket page.
  cartBtns.forEach(function (b) {
    b.addEventListener("click", function () { window.location.href = "basket.html"; });
  });

  var basketPage = document.getElementById("basketLines");

  if (!ready) {
    if (basketPage) {
      document.getElementById("basket").hidden = true;
      document.getElementById("basketEmpty").hidden = false;
    }
    return;
  }

  buyBlocks.forEach(function (el) { el.hidden = false; });

  var SDK = "https://sdks.shopifycdn.com/buy-button/latest/buybutton.js";

  function load(cb) {
    if (window.ShopifyBuy && window.ShopifyBuy.UI) return cb();
    var s = document.createElement("script");
    s.async = true;
    s.src = SDK;
    s.onload = cb;
    s.onerror = function () { console.warn("Roseline: Shopify SDK failed to load"); };
    document.head.appendChild(s);
  }

  load(function () {
    var client = window.ShopifyBuy.buildClient({
      domain: cfg.domain,
      storefrontAccessToken: cfg.storefrontAccessToken
    });
    var ui = window.ShopifyBuy.UI.init(client);

    /* — the basket drawer, styled to the house — */
    var cart = null;
    ui.createComponent("cart", {
      node: document.getElementById("shopify-cart") || undefined,
      options: {
        cart: {
          startOpen: false,
          popup: false,
          text: {
            title: cfg.cartLabel || "Basket",
            empty: "Your basket is empty.",
            button: "Checkout",
            total: "Subtotal",
            notice: "Made to order. Shipping and taxes calculated at checkout."
          },
          styles: {
            button: {
              "font-family": "Jost, Helvetica Neue, Arial, sans-serif",
              "font-size": "11px",
              "font-weight": "500",
              "letter-spacing": "0.32em",
              "text-transform": "uppercase",
              "border-radius": "0",
              "background-color": "#241a18",
              ":hover": { "background-color": "#5b4741" }
            },
            title: { "font-family": "Italiana, serif", "font-weight": "400" },
            cart: { "background-color": "#fffdfb" },
            footer: { "background-color": "#fffdfb" }
          }
        },
        toggle: { styles: { toggle: { "background-color": "#241a18" } } }
      }
    }).then(function (c) { cart = c; refreshCount(); renderBasket(); });

    function refreshCount() {
      try {
        var model = cart && cart.model;
        var n = model && (model.lineItemCount != null
          ? model.lineItemCount
          : (model.lineItems || []).reduce(function (t, li) { return t + (li.quantity || 0); }, 0));
        setCount(n || 0);
      } catch (e) { /* leave the badge as it is */ }
    }

    function openCart() { if (cart) cart.open(); }

    /* — the basket page — */
    function money(n, code) {
      var sym = code === "GBP" || !code ? "£" : "";
      return sym + Number(n).toFixed(2).replace(/\.00$/, "");
    }

    function renderBasket() {
      if (!basketPage) return;
      var model = cart && cart.model;
      var lines = (model && model.lineItems) || [];
      var wrap = document.getElementById("basket");
      var empty = document.getElementById("basketEmpty");
      var sum = document.getElementById("basketSum");

      if (!lines.length) {
        wrap.hidden = true;
        empty.hidden = false;
        return;
      }
      empty.hidden = true;
      wrap.hidden = false;
      sum.hidden = false;

      basketPage.innerHTML = "";
      lines.forEach(function (li) {
        var v = li.variant || {};
        var img = (v.image && v.image.src) || "";
        var attrs = (li.customAttributes || [])
          .map(function (a) { return a.key + ": " + a.value; })
          .join(" · ");
        var row = document.createElement("div");
        row.className = "basket-line";
        row.innerHTML =
          '<div class="bl-img">' + (img ? '<img src="' + img + '" alt="" />' : "") + "</div>" +
          '<div class="bl-txt">' +
            '<div class="bl-name">' + (li.title || "") + "</div>" +
            '<div class="bl-var">' + (v.title && v.title !== "Default Title" ? v.title : "") + "</div>" +
            (attrs ? '<div class="bl-attr">' + attrs + "</div>" : "") +
            '<button class="bl-remove" type="button">Remove</button>' +
          "</div>" +
          '<div class="bl-price">' + money((v.price && v.price.amount) || v.price || 0) + "</div>";
        row.querySelector(".bl-remove").addEventListener("click", function () {
          cart.model.updateLineItem(li.id, 0).then(function () {
            refreshCount();
            renderBasket();
          });
        });
        basketPage.appendChild(row);
      });

      var total = (model.subtotalPrice && model.subtotalPrice.amount) || model.subtotalPrice || 0;
      document.getElementById("basketTotal").textContent = money(total);
      var go = document.getElementById("basketCheckout");
      if (model.webUrl) go.setAttribute("href", model.webUrl);
    }

    /* — one buy block per dress page — */
    buyBlocks.forEach(function (block) {
      var slug = block.getAttribute("data-buy");
      var id = (cfg.products || {})[slug];
      var select = block.querySelector("[data-size]");
      var button = block.querySelector("[data-add]");
      var note = block.querySelector("[data-buy-note]");
      if (!id || !button) { block.hidden = true; return; }

      client.product.fetch(id).then(function (product) {
        var variants = product.variants || [];

        // fill the size list from the real Shopify variants
        if (select && variants.length) {
          select.innerHTML = "";
          variants.forEach(function (v) {
            var o = document.createElement("option");
            o.value = v.id;
            o.textContent = v.title === "Default Title" ? "One size" : v.title;
            if (!v.available) { o.textContent += " — unavailable"; o.disabled = true; }
            select.appendChild(o);
          });
        }

        button.disabled = false;
        button.addEventListener("click", function () {
          var variantId = select && select.value ? select.value : (variants[0] && variants[0].id);
          if (!variantId) return;
          var line = [{ variantId: variantId, quantity: 1 }];
          var customAttributes = [];
          var date = block.querySelector("[data-event-date]");
          if (date && date.value) {
            customAttributes.push({ key: "Event date", value: date.value });
          }
          if (customAttributes.length) line[0].customAttributes = customAttributes;

          ui.components.cart[0].model.addVariants(line).then(function () {
            var old = button.textContent;
            button.textContent = cfg.addedLabel || "Added";
            button.classList.add("is-added");
            if (note) note.hidden = false;
            setTimeout(function () {
              button.textContent = old;
              button.classList.remove("is-added");
            }, 1800);
            refreshCount();
            renderBasket();
          });
        });
      }).catch(function (e) {
        console.warn("Roseline: could not load product", slug, e);
        block.hidden = true;
      });
    });
  });
})();
