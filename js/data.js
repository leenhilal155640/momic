/* MOMIQ بيانات تجريبية (عربي / إنجليزي) - الأسعار بالريال السعودي */
const MOMIQ_PRODUCTS = [
  {
    id: "p-001",
    slug: "hospital-bag-basic",
    category: "hospital",
    stage: ["pregnancy-prep", "birth-prep"],
    price: 1000,
    image: "assets/img/product-hospital-bag.jpg",
    images: ["assets/img/product-hospital-bag.jpg"],
    ar: {
      name: "حقيبة مستشفى أساسية",
      shortDesc: "مجموعة ضرورية لليوم الأول بعد الولادة.",
      desc: "حقيبة منظمة تشمل احتياجات الأم والطفل ليوم الدخول للمستشفى مع تقسيم واضح.",
      categoryLabel: "مستلزمات المستشفى"
    },
    en: {
      name: "Basic Hospital Bag",
      shortDesc: "Essentials for the first day after delivery.",
      desc: "An organized set covering mom and baby needs for hospital stay with clear compartments.",
      categoryLabel: "Hospital Essentials"
    },
    inStock: true
  },
  {
    id: "p-002",
    slug: "maternity-pillow",
    category: "comfort",
    stage: ["pregnancy", "postpartum"],
    price: 100,
    image: "assets/img/product-pillow.jpg",
    images: ["assets/img/product-pillow.jpg"],
    ar: {
      name: "وسادة حمل مريحة",
      shortDesc: "دعم مثالي للظهر والبطن أثناء النوم.",
      desc: "تصميم منحني يوفر دعمًا مريحًا ويقلل الضغط على الظهر والوركين.",
      categoryLabel: "راحة الحامل"
    },
    en: {
      name: "Comfort Maternity Pillow",
      shortDesc: "Gentle support for back and bump while resting.",
      desc: "Ergonomic curve offers cozy support to ease pressure on back and hips.",
      categoryLabel: "Maternity Comfort"
    },
    inStock: true
  },
  {
    id: "p-003",
    slug: "nursing-pillow",
    category: "nursing",
    stage: ["postpartum"],
    price: 50,
    image: "assets/img/product-pillow-nursing.jpg",
    images: ["assets/img/product-pillow-nursing.jpg"],
    ar: {
      name: "وسادة رضاعة",
      shortDesc: "دعّامة مريحة أثناء إرضاع صغيركِ.",
      desc: "وسادة ترفع الطفل على مستوى الصدر لتقليل الضغط على الظهر والذراعين أثناء الرضاعة.",
      categoryLabel: "رضاعة طبيعية"
    },
    en: {
      name: "Nursing Pillow",
      shortDesc: "Comfy support while you feed your little one.",
      desc: "Raises baby to chest level to ease strain on your back and arms during feeding.",
      categoryLabel: "Nursing"
    },
    inStock: true
  },
  {
    id: "p-004",
    slug: "baby-onesies-set",
    category: "baby",
    stage: ["birth-prep", "postpartum"],
    price: 60,
    image: "assets/img/product-onesie.jpg",
    images: ["assets/img/product-onesie.jpg"],
    ar: {
      name: "طقم بيجامات أطفال",
      shortDesc: "طقم ناعم ومناسب لحديثي الولادة.",
      desc: "قماش قطني ناعم على بشرة الطفل، سهل الارتداء والغسيل.",
      categoryLabel: "ملابس المولود"
    },
    en: {
      name: "Newborn Onesies Set",
      shortDesc: "Soft cotton set for delicate newborn skin.",
      desc: "Gentle cotton blend, easy to put on and machine washable.",
      categoryLabel: "Babywear"
    },
    inStock: true
  },
  {
    id: "p-005",
    slug: "diaper-bag",
    category: "baby",
    stage: ["birth-prep", "postpartum"],
    price: 279,
    image: "assets/img/product-diaperbag.jpg",
    images: ["assets/img/product-diaperbag.jpg"],
    ar: {
      name: "شنطة حفاضات أنيقة",
      shortDesc: "مساحة كبيرة وأقسام منظمة.",
      desc: "شنطة عصرية تجمع بين الأناقة والوظيفة مع جيوب مخصصة.",
      categoryLabel: "شنط الحفاضات"
    },
    en: {
      name: "Stylish Diaper Bag",
      shortDesc: "Spacious with smart compartments.",
      desc: "Modern diaper bag that blends style and function for outings.",
      categoryLabel: "Diaper Bags"
    },
    inStock: true
  },
  {
    id: "p-006",
    slug: "baby-helper-tools",
    category: "baby",
    stage: ["baby", "postpartum"],
    price: 1500,
    image: "assets/img/product-care.jpg",
    images: ["assets/img/product-care.jpg"],
    ar: {
      name: "أدوات مساعدة للطفل",
      shortDesc: "أدوات عملية تسهّل عليكِ رعاية صغيركِ.",
      desc: "مجموعة أدوات مصممة لمساعدة الأم والطفل في الأنشطة اليومية مثل التغذية والتنظيف والنوم بأمان وراحة.",
      categoryLabel: "مستلزمات الطفل"
    },
    en: {
      name: "Baby Helper Tools",
      shortDesc: "Practical tools that make caring for your baby easier.",
      desc: "A set of tools designed to assist you and your baby in daily routines like feeding, cleaning, and sleep — safely and comfortably.",
      categoryLabel: "Baby Essentials"
    },
    inStock: true
  }
];

window.MomiqProducts = MOMIQ_PRODUCTS;
