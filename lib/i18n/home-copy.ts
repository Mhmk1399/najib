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
  shoppableImage: {
    fallbackTitle: string;
    eyebrow: string;
    description: string;
    productLabel: string;
    productAriaPrefix: string;

    action: {
      label: string;
      href: string;
    };
  };
  dynamicIsland: {
    completeLook: {
      fallbackTitle: string;
      eyebrow: string;
      description: string;
      imageNote: string;
      productItemLabel: string;
      productAriaPrefix: string;
      featuredActionLabel: string;

      shopAction: {
        label: string;
        href: string;
      };
    };

    occasion: {
      eyebrow: string;
      title: string;
      description: string;
      storyFallbackTitle: string;
      relatedProductsLabel: string;
    };
  };
  productEditorial: {
    eyebrow: string;
    title: string;
    description: string;

    productEyebrow: string;
    productActionLabel: string;
    productAriaPrefix: string;
    fetchError: string;

    action?: {
      label: string;
      href: string;
    };
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;

    emptyState: {
      title: string;
      description: string;
    };

    items: {
      id: string;
      question: string;
      answerLabel: string;
      answer: string;
    }[];
  };
  brandStory: {
    eyebrow: string;
    title: string;
    text: string;
    readMoreLabel: string;
    readLessLabel: string;
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
        href: "/shop",
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
    shoppableImage: {
      fallbackTitle: "انتخاب‌های خریدپذیر نجیب‌زاده",

      eyebrow: "تصویر خریدپذیر",

      description:
        "این تصویر به سه محصول منتخب وصل شده است؛ هر محصول را مستقیم ببینید یا برای کشف انتخاب‌های بیشتر وارد فروشگاه شوید.",

      productLabel: "محصول",

      productAriaPrefix: "مشاهده",

      action: {
        label: "ورود به فروشگاه",
        href: "/shop",
      },
    },
    dynamicIsland: {
      completeLook: {
        fallbackTitle: "استایل کامل نجیب‌زاده",

        eyebrow: "ست پیشنهادی",

        description:
          "هر محصول این تصویر به همان تجربه پایین صفحه وصل است؛ کاربر می‌تواند محصول را انتخاب کند، جزئیاتش را زیر همین سکشن ببیند و بعد وارد صفحه محصول شود.",

        imageNote:
          "این تصویر به {count} محصول وصل است و داینامیک ایلند انتخاب‌های مرتبط را زنده نمایش می‌دهد.",

        productItemLabel: "انتخاب {number}",

        productAriaPrefix: "مشاهده",

        featuredActionLabel: "دیدن محصول شاخص",

        shopAction: {
          label: "جستجو در فروشگاه",
          href: "/shop",
        },
      },

      occasion: {
        eyebrow: "راهنمای انتخاب",

        title:
          "چند نقطه هوشمند برای داینامیک ایلند",

        description:
          "هر تصویر این بخش یک context جدا دارد؛ با رسیدن کاربر به هر تصویر، ایلند محصولات و پیشنهادهای همان فضا را نمایش می‌دهد.",

        storyFallbackTitle: "انتخاب {number}",

        relatedProductsLabel:
          "{count} محصول مرتبط",
      },
    },
    productEditorial: {
      eyebrow: "تازه‌ترین محصولات",

      title: "انتخاب‌های تازه نجیب‌زاده",

      description:
        "شش محصول تازه از کالکشن‌های فعال فروشگاه؛ انتخاب‌هایی با تصویر و اطلاعات واقعی از کاتالوگ نجیب‌زاده.",

      productEyebrow: "محصول {number}",

      productActionLabel: "مشاهده محصول",

      productAriaPrefix: "مشاهده محصول",

      fetchError:
        "دریافت محصولات ناموفق بود.",

      action: {
        label: "مشاهده همه محصولات",
        href: "/shop",
      },
    },
    faq: {
      eyebrow: "اطلاعات مشتریان",

      title:
        "پاسخ‌هایی برای انتخابی مطمئن.",

      description:
        "هر آنچه درباره سفارش، ارسال، مرجوعی، قرارهای خصوصی و نگهداری از محصولات نجیب‌زاده نیاز دارید.",

      emptyState: {
        title:
          "هنوز پرسشی ثبت نشده است",

        description:
          "پرسش‌ها را به داده‌های FAQ اضافه کنید؛ موارد جدید به‌صورت خودکار در این بخش نمایش داده می‌شوند.",
      },

      items: [
        {
          id: "delivery",
          question:
            "ارسال سفارش چقدر زمان می‌برد؟",
          answerLabel:
            "ارسال و تحویل",
          answer:
            "سفارش‌ها پیش از ارسال با دقت آماده می‌شوند. تحویل استاندارد معمولاً پس از آماده‌سازی سفارش بین ۲ تا ۵ روز کاری زمان می‌برد. زمان تحویل سفارش‌های بین‌المللی نیز با توجه به مقصد و فرایندهای گمرکی متفاوت است.",
        },

        {
          id: "returns",
          question:
            "آیا امکان بازگشت یا تعویض کالا وجود دارد؟",
          answerLabel:
            "مرجوعی و تعویض",
          answer:
            "کالاهای واجد شرایط در بازه تعیین‌شده قابل بازگشت یا تعویض هستند؛ مشروط بر اینکه استفاده نشده باشند و همراه با بسته‌بندی، لیبل‌ها و متعلقات اصلی بازگردانده شوند. برخی کالاهای شخصی‌سازی‌شده یا فروش نهایی ممکن است شامل شرایط بازگشت نباشند.",
        },

        {
          id: "appointment",
          question:
            "چطور وقت ملاقات خصوصی رزرو کنم؟",
          answerLabel:
            "خدمات اختصاصی مشتریان",
          answer:
            "از طریق صفحه رزرو ملاقات خصوصی می‌توانید زمان و محل موردنظر خود را انتخاب کنید. تیم خدمات مشتریان نجیب‌زاده برای انتخاب استایل، بررسی سایز و راهنمایی درباره محصولات در کنار شما خواهد بود.",
        },

        {
          id: "sizing",
          question:
            "چطور سایز مناسب را انتخاب کنم؟",
          answerLabel:
            "راهنمای سایز",
          answer:
            "راهنمای سایز هر محصول بهترین مرجع برای انتخاب اولیه است. اگر بین دو سایز هستید یا برای یک قطعه رسمی و خیاطی‌شده به راهنمایی دقیق‌تری نیاز دارید، پیش از ثبت سفارش با خدمات مشتریان تماس بگیرید.",
        },

        {
          id: "fragrance",
          question:
            "آیا عطر به خارج از کشور ارسال می‌شود؟",
          answerLabel:
            "ارسال عطر",
          answer:
            "امکان ارسال عطر به قوانین و محدودیت‌های شرکت‌های حمل‌ونقل در مقصد بستگی دارد، زیرا محصولات عطری معمولاً حاوی ترکیبات الکلی هستند. روش‌های ارسال در دسترس، هنگام تسویه‌حساب و بر اساس مقصد سفارش نمایش داده می‌شوند.",
        },

        {
          id: "care",
          question:
            "چطور از محصولات نجیب‌زاده نگهداری کنم؟",
          answerLabel:
            "نگهداری محصول",
          answer:
            "همیشه دستورالعمل درج‌شده روی لیبل مراقبت محصول را دنبال کنید. بهتر است پوشاک رسمی بین هر بار استفاده استراحت داشته باشند و فقط در صورت نیاز به‌صورت حرفه‌ای تمیز شوند. محصولات چرمی و عطرها نیز باید دور از گرمای مستقیم، رطوبت و نور خورشید نگهداری شوند.",
        },

        {
          id: "payment",
          question:
            "چه روش‌های پرداختی پذیرفته می‌شوند؟",
          answerLabel:
            "پرداخت",
          answer:
            "روش‌های پرداخت قابل استفاده به‌صورت امن در مرحله تسویه‌حساب نمایش داده می‌شوند و ممکن است بسته به بازار یا محل سفارش متفاوت باشند. سفارش پس از تأیید موفق پرداخت نهایی خواهد شد.",
        },
      ],
    },
    brandStory: {
      eyebrow: "خانه نجیب‌زاده",

      title: "جهان نجیب‌زاده.",

      text: `
نجیب‌زاده خانه‌ای معاصر است که بر یک باور ساده شکل گرفته: ظرافت واقعی هیچ‌وقت نیاز به هیاهو ندارد.

جهان ما حول خیاطی سنجیده، رایحه‌های متمایز و اشیایی ساخته شده که به‌خاطر شخصیت، متریال و ماندگاری‌شان انتخاب می‌شوند.

ما به قطعاتی علاقه‌مندیم که امروز معنادار باشند و پس از گذر فصل‌ها نیز ارزش خود را حفظ کنند. هر جزئیات با نیت آغاز می‌شود؛ از تناسب یک لباس و بافت پارچه تا حسی که یک رایحه در فضا باقی می‌گذارد.

برای ما، تجمل در خویشتن‌داری، دقت و توانایی حذف هر چیزی است که ضرورتی ندارد. مهارت در ساخت را نه به‌عنوان تزئین، بلکه به‌عنوان پایه هر آنچه خلق می‌کنیم می‌بینیم.

نگاه نجیب‌زاده دانش سنتی را با دیدگاهی امروزی کنار هم قرار می‌دهد تا فرم‌های آشنا دوباره تازه و معاصر احساس شوند. لباس قرار نیست فقط بخشی از کمد باشد؛ باید آرام‌آرام به بخشی از زندگی فرد تبدیل شود.

عطر برای ما امتداد حضور است؛ چیزی که می‌تواند خاطره را در خود نگه دارد و بدون اغراق اثری ماندگار ایجاد کند. اشیای جهان نجیب‌زاده نیز با همان دقت در تعادل، کاربرد و زیبایی پایدار انتخاب می‌شوند.

باور داریم سبک شخصی زمانی عمیق‌تر می‌شود که آهسته و آگاهانه ساخته شود. همین نگاه، انتخاب متریال، فرم، رنگ و تجربه پیرامون هر محصول را شکل می‌دهد.

نجیب‌زاده با افراط یا تغییر دائمی تعریف نمی‌شود؛ بلکه با پیگیری مداوم کیفیت، شخصیت و جزئیاتی شناخته می‌شود که برای دیده‌شدن فریاد نمی‌زنند.

هر آنچه می‌سازیم باید شخصی، ماندگار و بی‌نیاز از توضیح اضافه باشد.
  `.trim(),

      readMoreLabel: "ادامه داستان",

      readLessLabel: "بستن داستان",
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
        href: "/shop",
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
    shoppableImage: {
      fallbackTitle: "Shop the Najibzadeh Edit",

      eyebrow: "Shop the Image",

      description:
        "This image connects you directly to three selected pieces. Explore each item individually or enter the store to discover more.",

      productLabel: "Product",

      productAriaPrefix: "View",

      action: {
        label: "Enter the Store",
        href: "/shop",
      },
    },
    dynamicIsland: {
      completeLook: {
        fallbackTitle:
          "The Complete Najibzadeh Look",

        eyebrow: "Curated Look",

        description:
          "Each product in this image connects to the experience below, allowing you to select an item, explore its details, and continue directly to its product page.",

        imageNote:
          "This image is connected to {count} products, while the Dynamic Island surfaces related selections in real time.",

        productItemLabel:
          "Selection {number}",

        productAriaPrefix: "View",

        featuredActionLabel:
          "View Featured Product",

        shopAction: {
          label: "Search the Store",
          href: "/shop",
        },
      },

      occasion: {
        eyebrow: "Selection Guide",

        title:
          "Smart touchpoints for the Dynamic Island",

        description:
          "Each image creates its own context. As you reach a new scene, the island surfaces products and recommendations connected to that setting.",

        storyFallbackTitle:
          "Selection {number}",

        relatedProductsLabel:
          "{count} related products",
      },
    },
    productEditorial: {
      eyebrow: "Latest Arrivals",

      title: "New from Najibzadeh",

      description:
        "Six recent pieces from the active collections, presented with imagery and product information directly from the Najibzadeh catalogue.",

      productEyebrow: "Product {number}",

      productActionLabel: "View Product",

      productAriaPrefix: "View product",

      fetchError:
        "Unable to load products.",

      action: {
        label: "Explore All Products",
        href: "/shop",
      },
    },
    faq: {
      eyebrow: "Client Information",

      title:
        "Answers for a confident choice.",

      description:
        "Everything you need to know about orders, delivery, returns, private appointments, and caring for your Najibzadeh pieces.",

      emptyState: {
        title:
          "No questions have been added yet",

        description:
          "Add questions to the FAQ data and new entries will automatically appear in this section.",
      },

      items: [
        {
          id: "delivery",
          question:
            "How long does delivery take?",
          answerLabel:
            "Shipping & Delivery",
          answer:
            "Orders are carefully prepared before dispatch. Standard delivery typically takes between 2 and 5 business days after the order has been prepared. International delivery times vary depending on the destination and customs procedures.",
        },

        {
          id: "returns",
          question:
            "Can I return or exchange an item?",
          answerLabel:
            "Returns & Exchanges",
          answer:
            "Eligible items may be returned or exchanged within the specified period, provided they remain unused and are returned with their original packaging, labels, and accessories. Certain personalised or final-sale items may not be eligible for return.",
        },

        {
          id: "appointment",
          question:
            "How can I book a private appointment?",
          answerLabel:
            "Private Client Services",
          answer:
            "You can select your preferred time and location through the private appointment booking page. The Najibzadeh client services team will assist you with styling, sizing, and product guidance.",
        },

        {
          id: "sizing",
          question:
            "How do I choose the right size?",
          answerLabel:
            "Size Guide",
          answer:
            "The size guide provided for each product is the best starting point. If you are between sizes or need more precise guidance for a tailored or formal piece, contact client services before placing your order.",
        },

        {
          id: "fragrance",
          question:
            "Can fragrances be shipped internationally?",
          answerLabel:
            "Fragrance Shipping",
          answer:
            "International fragrance shipping depends on the regulations and restrictions of carriers serving the destination, as fragrances commonly contain alcohol. Available delivery methods will be shown at checkout based on the order destination.",
        },

        {
          id: "care",
          question:
            "How should I care for Najibzadeh products?",
          answerLabel:
            "Product Care",
          answer:
            "Always follow the instructions on the product care label. Tailored garments should ideally be allowed to rest between wears and professionally cleaned only when necessary. Leather goods and fragrances should also be stored away from direct heat, humidity, and sunlight.",
        },

        {
          id: "payment",
          question:
            "Which payment methods are accepted?",
          answerLabel:
            "Payment",
          answer:
            "Available payment methods are displayed securely during checkout and may vary by market or order location. Your order is confirmed once payment has been successfully authorised.",
        },
      ],
    },
    brandStory: {
      eyebrow: "The House of Najibzadeh",

      title: "The World of Najibzadeh.",

      text: `
Najibzadeh is a contemporary house built around a simple belief: true refinement never needs to announce itself.

Our world is shaped by considered tailoring, distinctive fragrances, and objects chosen for their character, materials, and enduring quality.

We are drawn to pieces that feel meaningful today and retain their value long after seasons change. Every detail begins with intention — from the fit of a garment and the texture of a fabric to the impression a fragrance leaves behind.

For us, luxury is found in restraint, precision, and the ability to remove everything that serves no purpose. We see craftsmanship not as decoration, but as the foundation of everything we create.

The Najibzadeh perspective brings traditional knowledge together with a contemporary sensibility, allowing familiar forms to feel relevant again. Clothing should be more than part of a wardrobe; over time, it should become part of the life of the person who wears it.

Fragrance, to us, is an extension of presence — something capable of holding memory and leaving a lasting impression without excess. The objects within the Najibzadeh world are chosen with the same attention to balance, function, and enduring beauty.

We believe personal style becomes more meaningful when it is built slowly and consciously. This philosophy shapes our choices of material, form, colour, and the experience surrounding every product.

Najibzadeh is not defined by excess or constant change, but by a continual pursuit of quality, character, and details that never need to compete for attention.

Everything we create should feel personal, enduring, and complete without unnecessary explanation.
  `.trim(),

      readMoreLabel: "Continue the Story",

      readLessLabel: "Close the Story",
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
        href: "/shop",
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
    shoppableImage: {
      fallbackTitle: "اختيارات قابلة للتسوق من نجيب زاده",

      eyebrow: "تسوّق من الصورة",

      description:
        "ترتبط هذه الصورة مباشرة بثلاث قطع مختارة؛ استكشف كل منتج أو ادخل المتجر لاكتشاف المزيد من اختيارات نجيب زاده.",

      productLabel: "المنتج",

      productAriaPrefix: "عرض",

      action: {
        label: "ادخل المتجر",
        href: "/shop",
      },
    },
    dynamicIsland: {
      completeLook: {
        fallbackTitle:
          "إطلالة نجيب زاده المتكاملة",

        eyebrow: "إطلالة مختارة",

        description:
          "يرتبط كل منتج في هذه الصورة بالتجربة الموجودة أسفلها؛ يمكنك اختيار القطعة، استكشاف تفاصيلها، ثم الانتقال مباشرة إلى صفحة المنتج.",

        imageNote:
          "ترتبط هذه الصورة بـ {count} منتجات، بينما تعرض الجزيرة الديناميكية الاختيارات المرتبطة بها مباشرة.",

        productItemLabel:
          "الاختيار {number}",

        productAriaPrefix: "عرض",

        featuredActionLabel:
          "عرض المنتج المميز",

        shopAction: {
          label: "البحث في المتجر",
          href: "/shop",
        },
      },

      occasion: {
        eyebrow: "دليل الاختيار",

        title:
          "نقاط ذكية للجزيرة الديناميكية",

        description:
          "توفر كل صورة في هذا القسم سياقاً مختلفاً؛ ومع الوصول إلى كل مشهد، تعرض الجزيرة المنتجات والاقتراحات المرتبطة به.",

        storyFallbackTitle:
          "الاختيار {number}",

        relatedProductsLabel:
          "{count} منتجات مرتبطة",
      },
    },
    productEditorial: {
      eyebrow: "أحدث المنتجات",

      title: "مختارات جديدة من نجيب زاده",

      description:
        "ست قطع حديثة من المجموعات المتاحة، مع الصور ومعلومات المنتجات مباشرة من كتالوج نجيب زاده.",

      productEyebrow: "المنتج {number}",

      productActionLabel: "عرض المنتج",

      productAriaPrefix: "عرض المنتج",

      fetchError:
        "تعذر تحميل المنتجات.",

      action: {
        label: "استكشف جميع المنتجات",
        href: "/shop",
      },
    },
    faq: {
      eyebrow: "معلومات العملاء",

      title:
        "إجابات تساعدك على الاختيار بثقة.",

      description:
        "كل ما تحتاج إلى معرفته حول الطلبات والتوصيل والإرجاع والمواعيد الخاصة والعناية بمنتجات نجيب زاده.",

      emptyState: {
        title:
          "لم تتم إضافة أي أسئلة بعد",

        description:
          "أضف الأسئلة إلى بيانات الأسئلة الشائعة وستظهر العناصر الجديدة تلقائياً في هذا القسم.",
      },

      items: [
        {
          id: "delivery",
          question:
            "كم تستغرق مدة توصيل الطلب؟",
          answerLabel:
            "الشحن والتوصيل",
          answer:
            "يتم تجهيز الطلبات بعناية قبل الشحن. يستغرق التوصيل القياسي عادةً من يومين إلى خمسة أيام عمل بعد تجهيز الطلب. أما مدة توصيل الطلبات الدولية فتختلف بحسب الوجهة والإجراءات الجمركية.",
        },

        {
          id: "returns",
          question:
            "هل يمكن إرجاع أو استبدال المنتجات؟",
          answerLabel:
            "الإرجاع والاستبدال",
          answer:
            "يمكن إرجاع أو استبدال المنتجات المؤهلة خلال الفترة المحددة، بشرط ألا تكون قد استُخدمت وأن تُعاد مع العبوة والملصقات والملحقات الأصلية. وقد لا تشمل سياسة الإرجاع بعض المنتجات المخصصة أو منتجات البيع النهائي.",
        },

        {
          id: "appointment",
          question:
            "كيف يمكنني حجز موعد خاص؟",
          answerLabel:
            "خدمات العملاء الخاصة",
          answer:
            "يمكنك اختيار الوقت والمكان المناسبين لك من خلال صفحة حجز المواعيد الخاصة. وسيكون فريق خدمة عملاء نجيب زاده إلى جانبك للمساعدة في اختيار الإطلالة والمقاس وتقديم الإرشادات حول المنتجات.",
        },

        {
          id: "sizing",
          question:
            "كيف أختار المقاس المناسب؟",
          answerLabel:
            "دليل المقاسات",
          answer:
            "يُعد دليل المقاسات الخاص بكل منتج أفضل نقطة للبدء. وإذا كنت بين مقاسين أو كنت بحاجة إلى إرشادات أكثر دقة لقطعة رسمية أو مصممة بأسلوب الخياطة، فتواصل مع خدمة العملاء قبل إتمام الطلب.",
        },

        {
          id: "fragrance",
          question:
            "هل يمكن شحن العطور دولياً؟",
          answerLabel:
            "شحن العطور",
          answer:
            "تعتمد إمكانية شحن العطور دولياً على قوانين وقيود شركات النقل في الوجهة، نظراً لاحتواء منتجات العطور عادةً على مكونات كحولية. وستظهر خيارات الشحن المتاحة أثناء إتمام الطلب وفقاً لوجهة الشحن.",
        },

        {
          id: "care",
          question:
            "كيف أعتني بمنتجات نجيب زاده؟",
          answerLabel:
            "العناية بالمنتج",
          answer:
            "اتبع دائماً التعليمات الموجودة على ملصق العناية بالمنتج. ويُفضل ترك الملابس الرسمية لترتاح بين مرات الاستخدام وعدم تنظيفها بشكل احترافي إلا عند الحاجة. كما ينبغي حفظ المنتجات الجلدية والعطور بعيداً عن الحرارة المباشرة والرطوبة وأشعة الشمس.",
        },

        {
          id: "payment",
          question:
            "ما طرق الدفع المقبولة؟",
          answerLabel:
            "الدفع",
          answer:
            "تظهر طرق الدفع المتاحة بشكل آمن أثناء إتمام الطلب، وقد تختلف بحسب السوق أو موقع الطلب. ويتم تأكيد الطلب بعد نجاح عملية الدفع.",
        },
      ],
    },
    brandStory: {
      eyebrow: "دار نجيب زاده",

      title: "عالم نجيب زاده.",

      text: `
نجيب زاده دار معاصرة تأسست على قناعة بسيطة: الأناقة الحقيقية لا تحتاج أبداً إلى الضجيج كي تُلاحظ.

يتشكل عالمنا حول الخياطة المدروسة، والعطور المميزة، والأشياء التي نختارها لما تحمله من شخصية وجودة في الخامات وقدرة على الاستمرار.

ننجذب إلى القطع التي تحمل معنى اليوم وتحافظ على قيمتها حتى بعد مرور المواسم. تبدأ كل تفصيلة بقصد واضح؛ من تناسق القطعة وملمس القماش إلى الأثر الذي يتركه العطر في المكان.

بالنسبة لنا، تكمن الفخامة في ضبط النفس والدقة والقدرة على إزالة كل ما لا ضرورة له. ونرى الحرفية أساساً لكل ما نصنعه، لا مجرد عنصر للزينة.

تجمع رؤية نجيب زاده بين المعرفة التقليدية والمنظور المعاصر، لتبدو الأشكال المألوفة متجددة وملائمة للحاضر. فالملابس لا ينبغي أن تكون مجرد جزء من خزانة؛ بل أن تصبح مع الوقت جزءاً من حياة من يرتديها.

العطر بالنسبة لنا امتداد للحضور؛ شيء قادر على حفظ الذكريات وترك أثر دائم دون مبالغة. كما تُختار الأشياء في عالم نجيب زاده بالعناية نفسها بالتوازن والوظيفة والجمال الذي يدوم.

نؤمن بأن الأسلوب الشخصي يصبح أكثر عمقاً عندما يُبنى ببطء ووعي. وهذه الرؤية هي التي تشكل اختياراتنا للخامات والأشكال والألوان والتجربة المحيطة بكل منتج.

لا تُعرّف نجيب زاده بالمبالغة أو التغيير المستمر، بل بالسعي المتواصل إلى الجودة والشخصية والتفاصيل التي لا تحتاج إلى أن تصرخ كي تُرى.

كل ما نصنعه يجب أن يكون شخصياً، مميزاً وقادراً على الاستمرار دون حاجة إلى شرح زائد.
  `.trim(),

      readMoreLabel: "متابعة القصة",

      readLessLabel: "إغلاق القصة",
    },
  },
};
