/* MOMIQ App - وظائف مشتركة لكل الصفحات */
const DEFAULT_WHATSAPP = "966500000000"; /* رقم تجريبي واضح - يُعدّل من الإعدادات */
const DEFAULT_WHATSAPP_MSG = "السلام عليكم، أريد استفسار عن منتج MOMIQ";
const CART_KEY = "momiq_cart";
const WISH_KEY = "momiq_wishlist";

/* ---------- واتساب ---------- */
function getWhatsAppNumber() {
  try {
    return localStorage.getItem("momiq_whatsapp") || DEFAULT_WHATSAPP;
  } catch (e) {
    return DEFAULT_WHATSAPP;
  }
}

function getWhatsAppMsg() {
  try {
    return localStorage.getItem("momiq_whatsapp_msg") || DEFAULT_WHATSAPP_MSG;
  } catch (e) {
    return DEFAULT_WHATSAPP_MSG;
  }
}

function buildWhatsAppUrl(text) {
  const num = getWhatsAppNumber().replace(/\D/g, "");
  const msg = encodeURIComponent(text || getWhatsAppMsg());
  return `https://wa.me/${num}?text=${msg}`;
}

function openWhatsApp(text) {
  window.open(buildWhatsAppUrl(text), "_blank", "noopener,noreferrer");
}

/* ---------- السلة ---------- */
function getCart() {
  return window.MomiqStorage.get(CART_KEY, []);
}

function saveCart(cart) {
  window.MomiqStorage.set(CART_KEY, cart);
  document.dispatchEvent(new Event("cart:updated"));
}

function addToCart(product, qty) {
  const cart = getCart();
  const q = Math.max(1, Number(qty) || 1);
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty = (Number(existing.qty) || 1) + q;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || "assets/img/placeholder.svg",
      qty: q
    });
  }
  saveCart(cart);
  return getCartCount();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function setCartQty(index, qty) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, Number(qty) || 1);
  saveCart(cart);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
}

/* ---------- المفضلة ---------- */
function getWishlist() {
  return window.MomiqStorage.get(WISH_KEY, []);
}

function isInWishlist(id) {
  return getWishlist().some(item => item.id === id);
}

function addToWishlist(id) {
  const list = getWishlist();
  if (list.some(item => item.id === id)) return false;
  list.push({ id });
  window.MomiqStorage.set(WISH_KEY, list);
  document.dispatchEvent(new Event("wishlist:updated"));
  return true;
}

function removeFromWishlist(id) {
  const list = getWishlist().filter(item => item.id !== id);
  window.MomiqStorage.set(WISH_KEY, list);
  document.dispatchEvent(new Event("wishlist:updated"));
}

/* تبديل الحالة: يضيف أو يحذف، ويعيد true إذا أصبح ضمن المفضلة */
function toggleWishlist(id) {
  const willBeIn = !isInWishlist(id);
  if (willBeIn) addToWishlist(id); else removeFromWishlist(id);
  return willBeIn;
}

/* زر القلب الموحّد — بلا نص، يتغيّر لونه حسب الحالة */
function wishBtnHtml(id, extraClass) {
  const active = isInWishlist(id);
  const label = t(active ? "wish_aria_remove" : "wish_aria_add");
  return `<button type="button" class="btn--wish ${active ? "is-active" : ""} ${extraClass || ""}" ` +
    `data-wish-btn data-id="${id}" aria-pressed="${active}" aria-label="${label}" title="${label}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-7.5-4.7-9.6-9.1C.8 8.4 2.6 4.8 6.1 4.2c2-.4 3.9.5 4.9 2 .9-1.5 2.9-2.4 4.9-2 3.5.6 5.3 4.2 3.7 7.7C19.5 16.3 12 21 12 21z"/></svg></button>`;
}

/* ربط كل أزرار القلب في الصفحة الحالية */
function initWishButtons(scope) {
  (scope || document).querySelectorAll("[data-wish-btn]").forEach(btn => {
    if (btn._wishBound) return;
    btn._wishBound = true;
    btn.addEventListener("click", () => {
      const active = toggleWishlist(btn.getAttribute("data-id"));
      syncWishBtn(btn, active);
      showToast(t(active ? "added_to_wish" : "removed_from_wish"));
    });
  });
}

function syncWishBtn(btn, active) {
  btn.classList.toggle("is-active", !!active);
  btn.setAttribute("aria-pressed", String(!!active));
  const label = t(active ? "wish_aria_remove" : "wish_aria_add");
  btn.setAttribute("aria-label", label);
  btn.setAttribute("title", label);
}

/* تحديث كل الأزرار بعد أي تغيّر في المفضلة */
function refreshWishButtons() {
  document.querySelectorAll("[data-wish-btn]").forEach(btn => {
    syncWishBtn(btn, isInWishlist(btn.getAttribute("data-id")));
  });
}

/* ---------- مساعدات عامة ---------- */
function t(key) {
  const lang = window.MomiqI18n ? window.MomiqI18n.getLang() : "ar";
  const dict = (window.MomiqI18n && window.MomiqI18n.dict && window.MomiqI18n.dict[lang]) || {};
  return dict[key] !== undefined ? dict[key] : key;
}

function getProductById(id) {
  return (window.MomiqProducts || []).find(p => p.id === id) || null;
}

function getProductText(product, lang) {
  const l = lang || (window.MomiqI18n ? window.MomiqI18n.getLang() : "ar");
  return product[l] || product.ar;
}

function categoryLabel(category) {
  const key = "cat_" + category;
  const label = window.MomiqI18n && window.MomiqI18n.dict[window.MomiqI18n.getLang()][key];
  return label || category;
}

function formatPrice(value) {
  return `${Number(value).toLocaleString(window.MomiqI18n && window.MomiqI18n.getLang() === "en" ? "en-US" : "ar-SA")} ${t("price_label")}`;
}

/* ---------- رسائل الحالة (بدل alert) ---------- */
function showToast(message, type) {
  let host = document.getElementById("momiqToast");
  if (!host) {
    host = document.createElement("div");
    host.id = "momiqToast";
    host.className = "toast";
    host.setAttribute("role", "status");
    host.setAttribute("aria-live", "polite");
    document.body.appendChild(host);
  }
  host.textContent = message;
  host.dataset.type = type || "success";
  host.classList.add("toast--visible");
  clearTimeout(host._timer);
  host._timer = setTimeout(() => host.classList.remove("toast--visible"), 2600);
}

/* ---------- بطاقة منتج قابلة لإعادة الاستخدام ---------- */
function productCardHtml(product) {
  const t9n = getProductText(product);
  const img = product.image || "assets/img/placeholder.svg";
  return `<article class="card">
    <div class="card__media">
      <img src="${img}" alt="${t9n.name}" loading="lazy" onerror="this.src='assets/img/placeholder.svg'">
      ${wishBtnHtml(product.id, "btn--wish--card")}
    </div>
    <div class="card__body">
      <h3 class="card__title">${t9n.name}</h3>
      <p class="card__text">${t9n.shortDesc || ""}</p>
      <div class="card__meta">
        <span class="price">${formatPrice(product.price)}</span>
        <a href="product.html?id=${product.id}" class="btn btn--small btn--details">${t("view_details")}</a>
      </div>
    </div>
  </article>`;
}

/* ---------- التنقل واللغة ---------- */
function initNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("nav--open");
    });
  }

  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      const current = window.MomiqI18n.getLang();
      window.MomiqI18n.setLang(current === "ar" ? "en" : "ar");
    });
  }

  const wa = document.getElementById("waFab");
  if (wa) wa.addEventListener("click", () => openWhatsApp());

  const footerWa = document.getElementById("footerWa");
  if (footerWa) {
    footerWa.addEventListener("click", event => {
      event.preventDefault();
      openWhatsApp();
    });
  }

  document.querySelectorAll("[data-wa-product]").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-wa-product");
      openWhatsApp(`${getWhatsAppMsg()} — ${name}`);
    });
  });
}

/* ---------- فوتر مومِك ---------- */
function initFooter() {
  document.addEventListener("click", event => {
    const waBtn = event.target.closest("[data-footer-whatsapp]");
    if (waBtn) {
      event.preventDefault();
      openWhatsApp();
      return;
    }

    const topBtn = event.target.closest("[data-footer-top]");
    if (topBtn) {
      event.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      const brand = document.querySelector(".header .brand");
      if (brand && typeof brand.focus === "function") brand.focus({ preventScroll: true });
    }
  });

  const footer = document.querySelector(".mq-footer");
  if (!footer) return;

  /* ظهور تدريجي لعناصر الفوتر في الصفحات التي لا تحمّل animations.js */
  const footerGroup = footer.querySelector("[data-animate-stagger]");
  const hasAnimationsScript = Array.prototype.some.call(
    document.scripts,
    script => /animations\.js/.test(script.src || "")
  );

  if (footerGroup && !hasAnimationsScript) {
    const items = Array.prototype.slice.call(footerGroup.children);
    items.forEach(el => {
      if (!el.hasAttribute("data-animate")) el.setAttribute("data-animate", "slide-up");
    });

    if (!("IntersectionObserver" in window)) {
      items.forEach(el => el.classList.add("is-inview"));
    } else {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -20px 0px" });

      items.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("is-inview");
          return;
        }
        observer.observe(el);
      });
    }
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  let frame = null;
  footer.addEventListener("pointermove", event => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      const rect = footer.getBoundingClientRect();
      footer.style.setProperty("--mq-mx", `${event.clientX - rect.left}px`);
      footer.style.setProperty("--mq-my", `${event.clientY - rect.top}px`);
      footer.classList.add("is-spotlight");
      frame = null;
    });
  });

  footer.addEventListener("pointerleave", () => {
    footer.classList.remove("is-spotlight");
  });
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) badge.textContent = String(getCartCount());
}

function initCommon() {
  initNav();
  initFooter();
  updateCartBadge();
  window.MomiqI18n.initI18n();
  applyFontPreferences();
  initWishButtons();
  refreshWishButtons();
  document.addEventListener("cart:updated", updateCartBadge);
  document.addEventListener("wishlist:updated", refreshWishButtons);
}

/* ---------- الخطوط (تُطبّق أيضًا من الإعدادات) ---------- */
function applyFontPreferences() {
  const arFont = window.MomiqStorage.get("momiq_font_ar", "Tajawal");
  const enFont = window.MomiqStorage.get("momiq_font_en", "Inter");
  const body = document.body;
  body.style.setProperty("--font-ar", `'${arFont}', 'Tajawal', 'Cairo', system-ui, sans-serif`);
  body.style.setProperty("--font-en", `'${enFont}', 'Inter', system-ui, sans-serif`);
  if (window.MomiqI18n.getLang() === "ar") {
    body.style.fontFamily = `var(--font-ar)`;
  } else {
    body.style.fontFamily = `var(--font-en)`;
  }
  document.addEventListener("lang:changed", () => {
    const l = window.MomiqI18n.getLang();
    body.style.fontFamily = l === "ar" ? `var(--font-ar)` : `var(--font-en)`;
  }, { once: true });
}

document.addEventListener("DOMContentLoaded", initCommon);
