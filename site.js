/* Roseline Rose — measure the fixed header so the page starts below it */
(function () {
  var bar = document.querySelector(".topbar");
  if (!bar) return;
  function setH() {
    document.documentElement.style.setProperty(
      "--topbar-h", Math.ceil(bar.getBoundingClientRect().height) + "px"
    );
  }
  setH();
  window.addEventListener("resize", setH);
  window.addEventListener("orientationchange", function () { setTimeout(setH, 220); });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(setH); }
  window.addEventListener("load", setH);
})();

/* Roseline Rose — reveal on scroll */
(function () {
  var targets = document.querySelectorAll(
    ".look, .detail-row figure, .frame, .split, .overlap, .values3 > div, .banner, .page-head, .looks-head"
  );
  if (!targets.length) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (t) { t.classList.add("in"); });
    return;
  }

  targets.forEach(function (t) { t.classList.add("reveal"); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      // stagger siblings so looks arrive one at a time
      var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
      var i = siblings.indexOf(el);
      el.style.transitionDelay = Math.min(i < 0 ? 0 : i % 4, 3) * 110 + "ms";
      el.classList.add("in");
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

  targets.forEach(function (t) { io.observe(t); });
})();
