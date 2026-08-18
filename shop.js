/* Roseline Rose Couture — Shopify basket
   Talks to Shopify's Storefront API directly through the Buy SDK's client,
   and keeps the house's own buttons, type and basket page. Shopify's stock
   cart widget is deliberately not used — it failed to initialise reliably.
   Silent until shop-config.js is filled in. */
(function () {
  "use strict";

  var cfg = window.SHOP_CONFIG || {};
  var ready = cfg.domain && cfg.storefrontAccessToken;

  var buyBlocks = document.querySelectorAll("[data-buy]");
  var cartBtns = document.querySelectorAll("[data-cart-open]");
  var counts = document.querySelectorAll("[data-cart-count]");
  var basketPage = document.getElementById("basketLines");

  var STORE_KEY = "rrc-checkout-id";

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
    if (window.ShopifyBuy && window.ShopifyBuy.buildClient) return cb();
    var s = document.createElement("script");
    s.async = true;
    s.src = SDK;
    s.onload = cb;
    s.onerror = function () { console.warn("Roseline: Shopify SDK failed to load"); };
    document.head.appendChild(s);
  }

  function money(v) {
    var n = Number(v || 0);
    return "£" + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2));
  }

  function readId() {
    try { return window.localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function writeId(id) {
    try { window.localStorage.setItem(STORE_KEY, id); } catch (e) {}
  }
  function clearId() {
    try { window.localStorage.removeItem(STORE_KEY); } catch (e) {}
  }

  load(function () {
    var client = window.ShopifyBuy.buildClient({
      domain: cfg.domain,
      storefrontAccessToken: cfg.storefrontAccessToken
    });

    /* Fetch the saved basket, or start a new one. A basket that Shopify has
       already turned into a completed order is discarded and replaced. */
    function getCheckout() {
      var id = readId();
      if (!id) {
        return client.checkout.create().then(function (co) {
          writeId(co.id);
          return co;
        });
      }
      return client.checkout.fetch(id).then(function (co) {
        if (!co || co.completedAt) {
          clearId();
          return client.checkout.create().then(function (fresh) {
            writeId(fresh.id);
            return fresh;
          });
        }
        return co;
      }).catch(function () {
        clearId();
        return client.checkout.create().then(function (fresh) {
          writeId(fresh.id);
          return fresh;
        });
      });
    }

    function refresh(co) {
      var lines = (co && co.lineItems) || [];
      var n = lines.reduce(function (t, li) { return t + (li.quantity || 0); }, 0);
      setCount(n);
      if (basketPage) renderBasket(co);
      return co;
    }

    /* — the basket page — */
    function renderBasket(co) {
      if (!basketPage) return;
      var lines = (co && co.lineItems) || [];
      var wrap = document.getElementById("basket");
      var empty = document.getElementById("basketEmpty");
      var sum = document.getElementById("basketSum");
      var go = document.getElementById("basketCheckout");

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
        var img = (v.image && (v.image.src || v.image.url)) || "";
        var attrs = (li.customAttributes || [])
          .map(function (a) { return a.key + ": " + a.value; })
          .join(" · ");
        var price = (v.price && v.price.amount) || v.price || 0;
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
          '<div class="bl-price">' + money(price * (li.quantity || 1)) + "</div>";
        row.querySelector(".bl-remove").addEventListener("click", function () {
          this.disabled = true;
          client.checkout.removeLineItems(co.id, [li.id]).then(refresh);
        });
        basketPage.appendChild(row);
      });

      var total = (co.lineItemsSubtotalPrice && co.lineItemsSubtotalPrice.amount) ||
                  (co.subtotalPrice && co.subtotalPrice.amount) || co.subtotalPrice || 0;
      document.getElementById("basketTotal").textContent = money(total);
      if (go && co.webUrl) go.setAttribute("href", co.webUrl);
    }

    getCheckout().then(refresh).catch(function (e) {
      console.warn("Roseline: basket unavailable", e);
    });

    /* — one buy block per dress page — */
    buyBlocks.forEach(function (block) {
      var slug = block.getAttribute("data-buy");
      var id = (cfg.products || {})[slug];
      var select = block.querySelector("[data-size]");
      var button = block.querySelector("[data-add]");
      var note = block.querySelector("[data-buy-note]");
      if (!button) { block.hidden = true; return; }

      /* Shopify product handles match this site's page slugs, so we look the
         product up by handle. An explicit ID in shop-config.js still wins. */
      var lookup = id ? client.product.fetch(id) : client.product.fetchByHandle(slug);

      lookup.then(function (product) {
        if (!product) throw new Error("no product for handle " + slug);
        var variants = product.variants || [];

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

          var line = { variantId: variantId, quantity: 1 };
          var date = block.querySelector("[data-event-date]");
          if (date && date.value) {
            line.customAttributes = [{ key: "Event date", value: date.value }];
          }

          button.disabled = true;
          getCheckout()
            .then(function (co) { return client.checkout.addLineItems(co.id, [line]); })
            .then(function (co) {
              refresh(co);
              var old = cfg.addLabel || "Add to basket";
              button.textContent = cfg.addedLabel || "Added";
              button.classList.add("is-added");
              if (note) note.hidden = false;
              setTimeout(function () {
                button.textContent = old;
                button.classList.remove("is-added");
                button.disabled = false;
              }, 1800);
            })
            .catch(function (e) {
              button.disabled = false;
              button.textContent = "Please try again";
              console.warn("Roseline: could not add to basket", e);
              setTimeout(function () {
                button.textContent = cfg.addLabel || "Add to basket";
              }, 2500);
            });
        });
      }).catch(function (e) {
        console.warn("Roseline: could not load product", slug, e);
        block.hidden = true;
      });
    });
  });
})();
