import type { Locale } from "@/lib/i18n/config";

export type HomeCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;

    primaryAction: {
      label: string;
      href: string;
    };

    secondaryAction: {
      label: string;
      href: string;
    };

    footnote: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    description: string;
    categoryActionLabel: string;
    categoryAriaPrefix: string;
  };
  cinematic: {
    posterAlt: string;
    eyebrow: string;
    title: string;
    description: string;

    primaryAction: {
      label: string;
      href: string;
    };

    secondaryAction: {
      label: string;
      href: string;
    };
  };
  whyChooseUs: {
    backgroundImageAlt: string;
    eyebrow: string;
    title: string;
    italicTitle: string;
    description: string;

    action: {
      label: string;
      href: string;
    };

    features: {
      id: string;
      title: string;
      description: string;
      icon:
      | "quality"
      | "craftsmanship"
      | "experience"
      | "responsibility"
      | "exclusive"
      | "lasting";
    }[];
  };
  houseEditorial: {
    imageAlt: string;
    eyebrow: string;
    title: string;
    description: string;
    navAriaLabel: string;

    primaryAction: {
      label: string;
      href: string;
    };

    secondaryAction: {
      label: string;
      href: string;
    };

    features: {
      id: string;
      title: string;
      description: string;
      href: string;
      icon: "tailoring" | "fragrance" | "story";
    }[];
  };
};

export const homeCopy: Record<Locale, HomeCopy> = {
  fa: {
    hero: {
      eyebrow: "نجیب‌زاده / پوشاک مردانه",
      title: "حضور، با دقت دوخته شده",
      description:
        "خیاطی مدرن، عطرهای امضادار و جزئیاتی سنجیده؛ برای مردی که حضورش را با انتخاب‌های دقیق تعریف می‌کند.",
      primaryAction: {
        label: "مشاهده پوشاک",
        href: "/clothing",
      },
      secondaryAction: {
        label: "ورود به فروشگاه",
        href: "/shop",
      },
      footnote: "برای استانداردی بالاتر بپوشید",
    },
    categories: {
      eyebrow: "دسته‌بندی‌ها",
      title: "دسته‌بندی‌های نجیب‌زاده",
      description:
        "مجموعه‌های اصلی نجیب‌زاده را ببینید و بر اساس سلیقه، نیاز و موقعیت خود انتخاب کنید.",
      categoryActionLabel: "مشاهده دسته",
      categoryAriaPrefix: "مشاهده دسته",
    },
    cinematic: {
      posterAlt: "خیاط در حال آماده‌سازی کت نجیب‌زاده",
      eyebrow: "هنر خیاطی",
      title: "جزئیات، تفاوت را می‌سازند.",
      description:
        "هر قطعه با دقت، تجربه و توجه به تناسب ساخته می‌شود؛ از انتخاب پارچه تا آخرین دوخت.",

      primaryAction: {
        label: "کشف داستان ما",
        href: "/about-us",
      },

      secondaryAction: {
        label: "مشاهده مجموعه",
        href: "/shop",
      },
    },
    whyChooseUs: {
      backgroundImageAlt: "جزئیات خیاطی و پوشاک نجیب‌زاده",

      eyebrow: "چرا نجیب‌زاده؟",

      title: "فراتر از پوشش.",

      italicTitle: "معیاری برای تمایز.",

      description:
        "هر انتخاب در نجیب‌زاده از دقت، هدف و باور به کیفیتی می‌آید که باید در گذر زمان معنا پیدا کند.",

      action: {
        label: "داستان نجیب‌زاده",
        href: "/about-us",
      },

      features: [
        {
          id: "quality",
          title: "کیفیت بدون مصالحه",
          description:
            "پارچه‌ها و متریال‌ها با وسواس انتخاب می‌شوند؛ برای کیفیتی که در لمس، فرم و ماندگاری دیده می‌شود.",
          icon: "quality",
        },
        {
          id: "craftsmanship",
          title: "ظرافت در ساخت",
          description:
            "تکنیک‌های اصیل خیاطی با نگاه امروز ترکیب می‌شوند تا هر جزئیات با دقت و هدف شکل بگیرد.",
          icon: "craftsmanship",
        },
        {
          id: "experience",
          title: "تجربه‌ای سنجیده",
          description:
            "از نخستین انتخاب تا تحویل نهایی، هر مرحله برای تجربه‌ای آرام، دقیق و شخصی طراحی شده است.",
          icon: "experience",
        },
        {
          id: "responsibility",
          title: "تجمل مسئولانه",
          description:
            "انتخاب‌های آگاهانه‌تر در متریال و فرایند تولید، بخشی از تعریف ما از کیفیت ماندگار است.",
          icon: "responsibility",
        },
        {
          id: "exclusive",
          title: "خاص، نه اغراق‌آمیز",
          description:
            "تعداد محدود، طراحی ماندگار و حضوری بی‌نیاز از هیاهو؛ انتخابی برای کسانی که جزئیات را می‌بینند.",
          icon: "exclusive",
        },
        {
          id: "lasting",
          title: "ساخته‌شده برای ماندگاری",
          description:
            "قطعاتی برای پوشیدن، زندگی‌کردن و به‌خاطر سپردن؛ فراتر از یک فصل یا یک روند گذرا.",
          icon: "lasting",
        },
      ],
    },
    houseEditorial: {
      imageAlt: "خیاطی نجیب‌زاده",

      eyebrow: "فصل تازه",

      title: "برای لحظه‌هایی که در خاطر می‌مانند.",

      description:
        "خیاطی ماندگار، رایحه‌های متمایز و انتخاب‌هایی سنجیده؛ برای سبک زندگی‌ای که کیفیت را در جزئیات تعریف می‌کند.",

      navAriaLabel: "بخش‌های خانه نجیب‌زاده",

      primaryAction: {
        label: "مشاهده مجموعه",
        href: "/shop",
      },

      secondaryAction: {
        label: "کشف خانه نجیب‌زاده",
        href: "/about-us",
      },

      features: [
        {
          id: "tailoring",
          title: "خیاطی نجیب‌زاده",
          description:
            "کت‌وشلوار، بافت و پوشاکی که با دقت شکل گرفته‌اند.",
          href: "/tailoring",
          icon: "tailoring",
        },
        {
          id: "fragrance",
          title: "عطرهای امضادار",
          description:
            "رایحه‌هایی متمایز برای حضوری که در خاطر می‌ماند.",
          href: "/fragrance",
          icon: "fragrance",
        },
        {
          id: "story",
          title: "داستان ما",
          description:
            "نگاهی به ارزش‌ها، نگاه و جهان پشت خانه نجیب‌زاده.",
          href: "/about-us",
          icon: "story",
        },
      ],
    },
  },
  en: {
    hero: {
      eyebrow: "Najibzadeh / Menswear",
      title: "Presence, precisely tailored",
      description:
        "Modern tailoring, signature fragrances, and considered details for men who define presence through precise choices.",
      primaryAction: {
        label: "Explore Clothing",
        href: "/clothing",
      },
      secondaryAction: {
        label: "Enter the Store",
        href: "/shop",
      },
      footnote: "Dress for a higher standard",
    },
    categories: {
      eyebrow: "Categories",
      title: "Explore Najibzadeh",
      description:
        "Discover the house's core collections and choose by style, occasion, and the way you want to dress.",
      categoryActionLabel: "Explore category",
      categoryAriaPrefix: "Explore category",
    },
    cinematic: {
      posterAlt: "Tailor preparing a Najibzadeh jacket",
      eyebrow: "The Art of Tailoring",
      title: "Details make the difference.",
      description:
        "Every piece is crafted with precision, experience, and attention to fit — from the choice of fabric to the final stitch.",

      primaryAction: {
        label: "Discover Our Story",
        href: "/about-us",
      },

      secondaryAction: {
        label: "Explore the Collection",
        href: "/shop",
      },
    },
    whyChooseUs: {
      backgroundImageAlt: "Najibzadeh tailoring and craftsmanship details",

      eyebrow: "Why Najibzadeh?",

      title: "Beyond clothing.",

      italicTitle: "A standard of distinction.",

      description:
        "Every choice at Najibzadeh is shaped by precision, purpose, and a belief in quality that gains meaning over time.",

      action: {
        label: "The Najibzadeh Story",
        href: "/about-us",
      },

      features: [
        {
          id: "quality",
          title: "Uncompromising Quality",
          description:
            "Fabrics and materials are selected with meticulous care, creating quality you can see and feel in texture, form, and longevity.",
          icon: "quality",
        },
        {
          id: "craftsmanship",
          title: "Refined Craftsmanship",
          description:
            "Traditional tailoring techniques meet a modern perspective, ensuring every detail is shaped with precision and purpose.",
          icon: "craftsmanship",
        },
        {
          id: "experience",
          title: "A Considered Experience",
          description:
            "From the first choice to the final delivery, every step is designed to feel calm, precise, and personal.",
          icon: "experience",
        },
        {
          id: "responsibility",
          title: "Responsible Luxury",
          description:
            "More considered choices in materials and production are part of our definition of enduring quality.",
          icon: "responsibility",
        },
        {
          id: "exclusive",
          title: "Distinctive, Never Excessive",
          description:
            "Limited quantities, enduring design, and a presence that needs no spectacle — made for those who notice the details.",
          icon: "exclusive",
        },
        {
          id: "lasting",
          title: "Made to Last",
          description:
            "Pieces made to be worn, lived in, and remembered — beyond a single season or passing trend.",
          icon: "lasting",
        },
      ],
    },
    houseEditorial: {
      imageAlt: "Najibzadeh tailoring",

      eyebrow: "A New Chapter",

      title: "For moments worth remembering.",

      description:
        "Enduring tailoring, distinctive fragrances, and considered choices for a way of life that defines quality through the details.",

      navAriaLabel: "Explore the Najibzadeh House",

      primaryAction: {
        label: "Explore the Collection",
        href: "/shop",
      },

      secondaryAction: {
        label: "Discover the Najibzadeh House",
        href: "/about-us",
      },

      features: [
        {
          id: "tailoring",
          title: "Najibzadeh Tailoring",
          description:
            "Suits, knitwear, and clothing shaped with precision and considered craftsmanship.",
          href: "/tailoring",
          icon: "tailoring",
        },
        {
          id: "fragrance",
          title: "Signature Fragrances",
          description:
            "Distinctive scents created for a presence that stays in memory.",
          href: "/fragrance",
          icon: "fragrance",
        },
        {
          id: "story",
          title: "Our Story",
          description:
            "Discover the values, perspective, and world behind the Najibzadeh House.",
          href: "/about-us",
          icon: "story",
        },
      ],
    },
  },
  ar: {
    hero: {
      eyebrow: "نجيب زاده / أزياء رجالية",
      title: "حضور مصمم بدقة",
      description:
        "خياطة عصرية، عطور مميزة، وتفاصيل مدروسة للرجل الذي يصنع حضوره باختيارات دقيقة.",
      primaryAction: {
        label: "استكشف الأزياء",
        href: "/clothing",
      },
      secondaryAction: {
        label: "ادخل المتجر",
        href: "/shop",
      },
      footnote: "ارتد لمعيار أعلى",
    },
    categories: {
      eyebrow: "الفئات",
      title: "فئات نجيب زاده",
      description:
        "اكتشف المجموعات الأساسية لنجيب زاده واختر ما يناسب أسلوبك واحتياجك والمناسبة.",
      categoryActionLabel: "استكشف الفئة",
      categoryAriaPrefix: "استكشف الفئة",
    },
    cinematic: {
      posterAlt: "خياط يجهز سترة من نجيب زاده",
      eyebrow: "فن الخياطة",
      title: "التفاصيل تصنع الفارق.",
      description:
        "تُصنع كل قطعة بدقة وخبرة وعناية بالتناسق، بدءاً من اختيار القماش وحتى الغرزة الأخيرة.",

      primaryAction: {
        label: "اكتشف قصتنا",
        href: "/about-us",
      },

      secondaryAction: {
        label: "استكشف المجموعة",
        href: "/shop",
      },
    },
    whyChooseUs: {
      backgroundImageAlt: "تفاصيل الخياطة والحرفية لدى نجيب زاده",

      eyebrow: "لماذا نجيب زاده؟",

      title: "أبعد من مجرد ملابس.",

      italicTitle: "معيار للتميّز.",

      description:
        "كل اختيار في نجيب زاده ينبع من الدقة والهدف والإيمان بجودة تزداد قيمة ومعنى مع مرور الزمن.",

      action: {
        label: "قصة نجيب زاده",
        href: "/about-us",
      },

      features: [
        {
          id: "quality",
          title: "جودة بلا تنازلات",
          description:
            "تُختار الأقمشة والخامات بعناية فائقة لتقديم جودة تظهر في الملمس والشكل والقدرة على الاستمرار.",
          icon: "quality",
        },
        {
          id: "craftsmanship",
          title: "حرفية متقنة",
          description:
            "تلتقي تقنيات الخياطة الأصيلة برؤية معاصرة لتتشكل كل تفصيلة بدقة وغاية واضحة.",
          icon: "craftsmanship",
        },
        {
          id: "experience",
          title: "تجربة مدروسة",
          description:
            "من الاختيار الأول وحتى التسليم النهائي، صُممت كل خطوة لتقدم تجربة هادئة ودقيقة وشخصية.",
          icon: "experience",
        },
        {
          id: "responsibility",
          title: "فخامة مسؤولة",
          description:
            "الاختيارات الأكثر وعياً في الخامات وعمليات الإنتاج جزء من رؤيتنا للجودة التي تدوم.",
          icon: "responsibility",
        },
        {
          id: "exclusive",
          title: "متفرّد بلا مبالغة",
          description:
            "كميات محدودة وتصميم خالد وحضور لا يحتاج إلى صخب؛ لمن يقدّر التفاصيل.",
          icon: "exclusive",
        },
        {
          id: "lasting",
          title: "صُنع ليدوم",
          description:
            "قطع صُممت لتُرتدى وتُعاش وتبقى في الذاكرة، بعيداً عن موسم واحد أو صيحة عابرة.",
          icon: "lasting",
        },
      ],
    },
    houseEditorial: {
      imageAlt: "خياطة نجيب زاده",

      eyebrow: "فصل جديد",

      title: "للحظات التي تبقى في الذاكرة.",

      description:
        "خياطة تدوم، وعطور مميزة، واختيارات مدروسة لأسلوب حياة يرى الجودة في أدق التفاصيل.",

      navAriaLabel: "أقسام دار نجيب زاده",

      primaryAction: {
        label: "استكشف المجموعة",
        href: "/shop",
      },

      secondaryAction: {
        label: "اكتشف دار نجيب زاده",
        href: "/about-us",
      },

      features: [
        {
          id: "tailoring",
          title: "خياطة نجيب زاده",
          description:
            "بدلات وتريكو وملابس تتشكل بعناية ودقة في كل تفصيلة.",
          href: "/tailoring",
          icon: "tailoring",
        },
        {
          id: "fragrance",
          title: "عطور بتوقيع مميز",
          description:
            "روائح متفرّدة لحضور يبقى عالقاً في الذاكرة.",
          href: "/fragrance",
          icon: "fragrance",
        },
        {
          id: "story",
          title: "قصتنا",
          description:
            "نظرة إلى القيم والرؤية والعالم الذي يقف خلف دار نجيب زاده.",
          href: "/about-us",
          icon: "story",
        },
      ],
    },
  },
};
