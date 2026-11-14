/* Roseline Rose — forms that really reach us (2026-11-14).
   The site has no server, so a form opens the visitor's own email app with the
   message already written, addressed to the house. Nothing is stored on the site.
   Forms opt in with data-mail="contact" | "enquiry" | "letter". */
(function () {
  var TO = "roselinerosecouture@hotmail.com";

  function labelFor(el) {
    if (el.id) {
      var l = document.querySelector('label[for="' + el.id + '"]');
      if (l) return l.textContent.trim();
    }
    return (el.getAttribute("aria-label") || el.name || "").trim();
  }

  function pieceName() {
    var h = document.querySelector("h1");
    return h ? h.textContent.replace(/\s+/g, " ").trim() : document.title;
  }

  function subjectFor(form, kind) {
    var name = form.querySelector('input[type="text"]');
    var who = name && name.value.trim() ? " from " + name.value.trim() : "";
    if (kind === "letter") return "Please add me to the house letter";
    if (kind === "enquiry") return "Interest in " + pieceName() + who;
    var reason = form.querySelector("select");
    return (reason ? reason.value : "Enquiry") + who;
  }

  function bodyFor(form, kind) {
    var lines = [];
    if (kind === "letter") {
      lines.push("Hello,", "", "Please add this address to the house letter.");
    } else {
      if (kind === "enquiry") lines.push("Piece: " + pieceName() + " (" + location.href + ")");
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        if (el.type === "submit" || el.type === "button") return;
        var v = (el.value || "").trim();
        if (!v) return;
        var k = labelFor(el);
        lines.push(el.tagName === "TEXTAREA" ? "\n" + k + ":\n" + v : k + ": " + v);
      });
    }
    var email = form.querySelector('input[type="email"]');
    if (kind === "letter" && email && email.value) lines.push("", "Email: " + email.value.trim());
    return lines.join("\n");
  }

  document.querySelectorAll("form[data-mail]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var kind = form.getAttribute("data-mail");
      var href = "mailto:" + TO +
        "?subject=" + encodeURIComponent(subjectFor(form, kind)) +
        "&body=" + encodeURIComponent(bodyFor(form, kind));
      window.location.href = href;
      var msg = form.querySelector(".mail-sent");
      if (msg) {
        msg.hidden = false;
        msg.querySelector("a[data-retry]") && (msg.querySelector("a[data-retry]").href = href);
      }
    });
  });
})();
