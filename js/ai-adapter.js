/* ============================================================
   MOMIQ — طبقة محوّل المساعد الذكي (AI Adapter Layer)
   ------------------------------------------------------------
   • الحالي: مزوّد محلي (local) يعتمد على قواعد داخل المتصفح.
   • المستقبلي: يمكن استبداله بمزوّد API حقيقي دون تغيير الصفحة.
   ⚠️ لا تُخزَّن مفاتيح API في المتصفح ولا في هذا الملف.
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     المزوّد المحلي — قواعد بسيطة + منتجات الكتالوج
     ---------------------------------------------------------- */
  var LocalProvider = {
    id: "local",
    /* صريح: ليس نموذج ذكاء اصطناعي حقيقي */
    isDemo: true,

    reply: function (message) {
      return new Promise(function (resolve) {
        /* تأخير بسيط لمحاكاة زمن الاستجابة */
        var delay = 320 + Math.random() * 380;
        setTimeout(function () {
          try {
            resolve(LocalProvider._run(message));
          } catch (e) {
            resolve({ text: t("ai_no_match"), products: [] });
          }
        }, delay);
      });
    },

    _run: function (message) {
      var raw = String(message || "").trim();
      if (!raw) return { text: t("ai_no_match"), products: [] };

      var q = raw.toLowerCase();
      var products = window.MomiqProducts || [];

      /* 1) تحيّة — بدون \b لأنها لا تعمل مع العربية */
      if (/^\s*(مرحبا|مرحبًا|مرحباً|السلام|هلا|أهلا|اهلا|هاي|هلاهلا|صباح الخير|مساء الخير|hi|hello|hey|salam|good\s*(morning|evening))/.test(q)) {
        return { text: t("ai_greeting"), products: [] };
      }

      /* 2) نصائح عامة */
      if (/(نصائح|نصيحة|نصيح|نصايح|ساعد|ساعدني|كيف ابدأ|tips?|help|advice)/.test(q) &&
          !LocalProvider._detectCategory(q)) {
        return {
          text: t("ai_tips") + "\n• " + t("ai_tip_budget") +
                "\n• " + t("ai_tip_bag") + "\n• " + t("ai_tip_list"),
          products: []
        };
      }

      /* 3) استخراج الميزانية */
      var budget = LocalProvider._detectBudget(q);

      /* 4) اكتشاف القسم */
      var cat = LocalProvider._detectCategory(q);

      /* 5) طلب التوفير/الأرخص صراحة */
      var wantsCheap = /(أرخص|ارخص|رخيص|الأرخص|الارخيص|توفير|أقل سعر|اقل سعر|cheap|cheapest|lowest|save)/.test(q);

      /* 6) لا يوجد نية مفهومة (لا ميزانية ولا قسم ولا طلب منتج) → لا مطابقة */
      var wantsProducts = /(منتج|منتجات|اشتري|أريد|اريد|أبي|ابي|طلب|شراء|سعر|كتالوج|product|products|buy|want|order|price|shop|catalog)/.test(q);
      if (!budget && !cat && !wantsCheap && !wantsProducts) {
        return { text: t("ai_no_match"), products: [] };
      }

      /* 7) بناء المرشحين */
      var pool = products.slice();
      if (cat) {
        var inCat = pool.filter(function (p) { return p.category === cat; });
        if (inCat.length) pool = inCat;
      }

      /* 8) أرخص المنتجات */
      if (wantsCheap && !budget) {
        return {
          text: t("ai_cheapest"),
          products: pool.slice().sort(function (a, b) { return a.price - b.price; }).slice(0, 4)
        };
      }

      /* 9) مع ميزانية */
      if (budget > 0) {
        var under = pool.filter(function (p) {
          return (Number(p.price) || 0) <= budget;
        }).sort(function (a, b) { return b.price - a.price; });

        if (under.length) {
          var head = t("ai_found") + " " + budget + " " + t("price_label") + ".";
          /* إذا وُجدت بدائل أرخص داخل القسم نفسه نعرضها كخيار إضافي */
          var others = pool.filter(function (p) {
            return (Number(p.price) || 0) > budget;
          }).sort(function (a, b) { return a.price - b.price; }).slice(0, 2);

          if (under.length < 2 && others.length) head += "\n" + t("ai_cheaper");

          return { text: head, products: under.slice(0, 4).concat(others) };
        }

        /* لا شيء ضمن الميزانية → الأقرب سعرًا */
        var closest = pool.slice().sort(function (a, b) { return a.price - b.price; }).slice(0, 3);
        return { text: t("ai_none_under"), products: closest };
      }

      /* 10) قسم فقط بدون ميزانية */
      if (pool.length) {
        return {
          text: cat ? t("ai_category_products") : t("ai_all_under"),
          products: pool.slice(0, 4)
        };
      }

      return { text: t("ai_no_match"), products: [] };
    },

    /* استخراج الميزانية من النص العربي/الإنجليزي */
    _detectBudget: function (q) {
      var m = q.match(/(\d{2,6})\s*(ريال|رس|sar|sr|riyal)/);
      if (!m) m = q.match(/(?:ب|تحت|اقل|أقل|بحد اقصى|بحد أقصى|حتى|under|max|below|budget|within)\s*(?:ميزانية\s*)?(?:من\s*)?(\d{2,6})/);
      if (!m) m = q.match(/(\d{2,6})\s*(?:ريال|sar|بحد|تحت)?\s*(?:فوق|فوق|less|than)/);
      return m ? (Number(m[1]) || 0) : 0;
    },

    _detectCategory: function (q) {
      var map = [
        { cat: "hospital", re: /مستشفى|حقيبة|bag|hospital|department/ },
        { cat: "comfort",  re: /وساد|حمل|comfort|pregnan|pillow|راحة|راحه|ظهر|بطن/ },
        { cat: "nursing",  re: /رضاع|رضاعه|nursing|breast|feeding|milk/ },
        { cat: "baby",     re: /مولود|طفل|بيجام|ملابس|baby|newborn|clothes|onesie|رضيع/ },
        { cat: "care",     re: /عناية|عنايه|after|postpartum|care|تعافي|تعافى/ }
      ];
      for (var i = 0; i < map.length; i++) {
        if (map[i].re.test(q)) return map[i].cat;
      }
      return null;
    }
  };

  /* ----------------------------------------------------------
     مزوّد API — سُيح لاحقًا (غير مفعّل حاليًا)
     لا تضع مفتاح API هنا أبدًا. يُقرأ من إعدادات الخادم فقط.
     ---------------------------------------------------------- */
  var ApiProvider = {
    id: "api",
    isDemo: false,
    enabled: false, /* يصبح true عند ربط مزوّد حقيقي من الخادم */

    reply: function () {
      return Promise.reject(new Error("API provider not configured"));
    }
  };

  /* ----------------------------------------------------------
     الواجهة الموحّدة — ما تستخدمه الصفحات
     ---------------------------------------------------------- */
  function pickProvider() {
    /* اختيار المزوّد من إعدادات محلية آمنة (بدون مفاتيح) */
    var chosen = "local";
    try {
      chosen = localStorage.getItem("momiq_ai_provider") || "local";
    } catch (e) { chosen = "local"; }

    if (chosen === "api" && ApiProvider.enabled) return ApiProvider;
    return LocalProvider;
  }

  var MomiqAI = {
    get provider() { return pickProvider(); },
    get isDemo() { return pickProvider().isDemo; },

    reply: function (message) {
      return pickProvider().reply(message);
    }
  };

  window.MomiqAI = MomiqAI;
})();
