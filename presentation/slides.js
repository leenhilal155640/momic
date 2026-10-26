/* ============================================================
   MOMK — presentation navigation
   Dynamic slide count, dots, counter, CTA, keyboard, swipe, hash.
   ============================================================ */

(() => {
  "use strict";

  const presentation = document.getElementById("presentation");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;

  if (!presentation || total === 0) return;

  const openingDots = document.getElementById("openingDots");
  const openingCurrent = document.getElementById("openingCurrent");
  const globalCurrent = document.getElementById("currentSlideNumber");
  const globalTotal = document.getElementById("totalSlideNumber");
  const progressBar = document.getElementById("progressBar");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let currentIndex = 0;
  let dots = [];

  const pad = (value) => String(value).padStart(2, "0");

  /* ------------------------------------------------------------
     Build the 12 real dots from the actual slide count
     ------------------------------------------------------------ */
  function buildDots() {
    if (!openingDots) return;

    openingDots.innerHTML = "";
    dots = [];

    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "nav-dot";
      dot.dataset.slideIndex = String(index);
      dot.setAttribute("aria-label", `الشريحة ${index + 1} من ${total}`);
      dot.title = `الشريحة ${index + 1}`;

      dot.addEventListener("click", () => {
        goTo(index);
      });

      openingDots.appendChild(dot);
      dots.push(dot);
    }
  }

  /* ------------------------------------------------------------
     Keep every place that shows the total in sync
     ------------------------------------------------------------ */
  function syncTotals() {
    document.querySelectorAll("[data-total]").forEach((node) => {
      node.textContent = pad(total);
    });

    if (globalTotal) globalTotal.textContent = pad(total);
    if (globalCurrent) globalCurrent.textContent = pad(currentIndex + 1);
    if (openingCurrent) openingCurrent.textContent = pad(currentIndex + 1);
  }

  function syncDots() {
    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function syncProgress() {
    if (!progressBar) return;
    const percent = ((currentIndex + 1) / total) * 100;
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", String(Math.round(percent)));
    progressBar.setAttribute("aria-valuetext", `الشريحة ${currentIndex + 1} من ${total}`);
  }

  /* ------------------------------------------------------------
     Show a slide
     ------------------------------------------------------------ */
  function goTo(index, options = {}) {
    const { updateHash = true } = options;

    let nextIndex = Number(index);

    if (Number.isNaN(nextIndex)) nextIndex = 0;

    if (nextIndex < 0) nextIndex = total - 1;
    if (nextIndex >= total) nextIndex = 0;

    const previousIndex = currentIndex;
    currentIndex = nextIndex;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");

      if ("inert" in slide) {
        slide.inert = !isActive;
      }

      /* Restart CSS entrance animations when a slide is revisited. */
      if (isActive && previousIndex !== currentIndex) {
        const scene = slide.querySelector(".scene-container");
        if (scene) {
          void scene.offsetWidth;
        }
      }
    });

    document.body.classList.toggle("is-opening", currentIndex === 0);
    presentation.dataset.currentSlide = String(currentIndex + 1);

    syncTotals();
    syncDots();
    syncProgress();

    if (updateHash) {
      const hash = `#slide-${currentIndex + 1}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(null, "", hash);
      }
    }
  }

  const next = () => goTo(currentIndex + 1);
  const previous = () => goTo(currentIndex - 1);

  /* ------------------------------------------------------------
     Buttons
     ------------------------------------------------------------ */
  function bindButtons() {
    document.querySelectorAll("[data-next-slide]").forEach((button) => {
      button.addEventListener("click", next);
    });

    document.querySelectorAll("[data-prev-slide]").forEach((button) => {
      button.addEventListener("click", previous);
    });
  }

  /* ------------------------------------------------------------
     Keyboard
     ------------------------------------------------------------ */
  function isTypingTarget(target) {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      target.isContentEditable
    );
  }

  function isInteractiveTarget(target) {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("button, a, input, textarea, select, [contenteditable='true']"));
  }

  function onKeyDown(event) {
    if (event.defaultPrevented || isTypingTarget(event.target)) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
      case "PageDown":
        event.preventDefault();
        next();
        break;

      case "ArrowRight":
      case "ArrowUp":
      case "PageUp":
        event.preventDefault();
        previous();
        break;

      case " ":
        if (isInteractiveTarget(event.target)) return;
        event.preventDefault();
        next();
        break;

      case "Home":
        event.preventDefault();
        goTo(0);
        break;

      case "End":
        event.preventDefault();
        goTo(total - 1);
        break;

      default:
        break;
    }
  }

  /* ------------------------------------------------------------
     Touch / swipe
     ------------------------------------------------------------ */
  function bindSwipe() {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    document.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) return;
        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (event) => {
        if (!tracking) return;
        tracking = false;

        const touch = event.changedTouches[0];
        if (!touch) return;

        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;

        if (deltaX < 0) {
          next();
        } else {
          previous();
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------
     Hash / deep link
     ------------------------------------------------------------ */
  function readHashIndex() {
    const match = window.location.hash.match(/slide-(\d+)/i);
    if (!match) return 0;
    const index = Number(match[1]) - 1;
    return index >= 0 && index < total ? index : 0;
  }

  function onHashChange() {
    const index = readHashIndex();
    if (index !== currentIndex) {
      goTo(index, { updateHash: false });
    }
  }

  /* ------------------------------------------------------------
     Init
     ------------------------------------------------------------ */
  function init() {
    buildDots();
    bindButtons();
    bindSwipe();

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("hashchange", onHashChange);

    if (reducedMotion.matches) {
      document.documentElement.classList.add("reduced-motion");
    }

    reducedMotion.addEventListener?.("change", (event) => {
      document.documentElement.classList.toggle("reduced-motion", event.matches);
    });

    goTo(readHashIndex(), { updateHash: false });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
