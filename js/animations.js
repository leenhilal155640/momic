/* ============================================================
   MOMIQ — حركات تفاعلية
   ============================================================ */

(function () {
  "use strict";

  /* ---------- ظهور عند التمرير ---------- */
  function initScrollReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-animate]").forEach(function (el) {
        el.classList.add("is-inview");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -20px 0px"
    });

    document.querySelectorAll("[data-animate]").forEach(function (el) {
      // فعّل العناصر الموجودة في الشاشة فورًا
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("is-inview");
        return;
      }
      observer.observe(el);
    });

    document.querySelectorAll("[data-animate-stagger]").forEach(function (group) {
      var items = group.querySelectorAll(":scope > *");
      items.forEach(function (el) {
        if (!el.hasAttribute("data-animate")) {
          el.setAttribute("data-animate", "slide-up");
        }
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("is-inview");
          return;
        }
        observer.observe(el);
      });
    });
  }

  /* ---------- تموج الأزرار ---------- */
  function initRipple() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn");
      if (!btn) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 650);
    }, { passive: true });
  }

  /* ---------- تأثير الميلان 3D للبطاقات ---------- */
  function initTilt() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 900) return;

    var cards = document.querySelectorAll(".card");
    cards.forEach(function (card) {
      if (card.dataset.tiltInit) return;
      card.dataset.tiltInit = "1";
      var bounds = null;
      function update(e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var x = e.clientX - bounds.left;
        var y = e.clientY - bounds.top;
        var rx = ((y / bounds.height) - 0.5) * -4;
        var ry = ((x / bounds.width) - 0.5) * 4;
        card.style.transform = "translateY(-4px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      }
      function reset() {
        bounds = null;
        card.style.transform = "";
      }
      card.addEventListener("mousemove", update);
      card.addEventListener("mouseleave", reset);
    });
  }

  /* ---------- تفعيل عند التحميل ---------- */
  function init() {
    initScrollReveal();
    initRipple();
    initTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("lang:changed", function () {
    document.querySelectorAll("[data-animate]").forEach(function (el) {
      el.classList.remove("is-inview");
    });
    setTimeout(initScrollReveal, 50);
  });
})();
