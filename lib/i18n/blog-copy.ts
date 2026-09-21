import type { Locale } from "@/lib/i18n/config";

export type BlogCategoryKey =
    | "style-notes"
    | "craftsmanship"
    | "inside-house"
    | "perspectives"
    | "inspiration"
    | "care-guide";

export type BlogPostCopy = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    imageAlt: string;
    imagePosition?: string;
    category: BlogCategoryKey;
    publishedAt: string;
    readingMinutes?: number;
    author?: string;
    featured?: boolean;
};

export type BlogCopy = {
    metadata: {
        title: string;
        description: string;
    };
    hero: {
        eyebrow: string;
        title: string;
        description: string;
        imageAlt: string;
        actionLabel: string;
    };
    journal: {
        eyebrow: string;
        titleLine1: string;
        titleLine2: string;
        description: string;
    };
    filters: {
        all: string;
        searchPlaceholder: string;
        searchAriaLabel: string;
        sortAriaLabel: string;
        sort: {
            latest: string;
            oldest: string;
            title: string;
        };
        loading: string;
        articlesCountTemplate: string;
        resultsForTemplate: string;
    };
    featured: {
        badge: string;
        readArticle: string;
    };
    article: {
        read: string;
        readAriaTemplate: string;
        readingTimeTemplate: string;
    };
    pagination: {
        ariaLabel: string;
        previous: string;
        next: string;
        pageAriaTemplate: string;
    };
    newsletter: {
        eyebrow: string;
        title: string;
        description: string;
        emailPlaceholder: string;
        submit: string;
        consent: string;
        successTitle: string;
        successDescription: string;
    };
    empty: {
        title: string;
        description: string;
        reset: string;
    };
    categories: Record<BlogCategoryKey, string>;
    posts: BlogPostCopy[];
};

export const blogCopy: Record<Locale, BlogCopy> = {
    fa: {
        metadata: {
            title: "ژورنال | نجیب‌زاده",
            description:
                "روایت‌هایی از سبک، هنر ساخت، متریال و جهان نجیب‌زاده را در ژورنال ما بخوانید.",
        },
        hero: {
            eyebrow: "ژورنال نجیب‌زاده",
            title: "روایت‌هایی از سبک، هنر و شخصیت.",
            description:
                "نگاهی سنجیده به پوشاک، متریال، هنر ساخت و جهانی که هویت نجیب‌زاده را شکل می‌دهد.",
            imageAlt: "ژورنال و روایت‌های نجیب‌زاده",
            actionLabel: "مشاهده ژورنال",
        },
        journal: {
            eyebrow: "ژورنال نجیب‌زاده",
            titleLine1: "ایده‌هایی که",
            titleLine2: "ارزش بازگشت دارند.",
            description:
                "نگاه‌هایی به پوشاک، هنر ساخت، متریال و جزئیات آرامی که جهان نجیب‌زاده را شکل می‌دهند.",
        },
        filters: {
            all: "همه",
            searchPlaceholder: "جست‌وجو در ژورنال",
            searchAriaLabel: "جست‌وجو در ژورنال",
            sortAriaLabel: "مرتب‌سازی مقاله‌ها",
            sort: {
                latest: "جدیدترین",
                oldest: "قدیمی‌ترین",
                title: "الفبا",
            },
            loading: "در حال بارگذاری ژورنال",
            articlesCountTemplate: "{count} مقاله",
            resultsForTemplate: "نتایج برای «{query}»",
        },
        featured: {
            badge: "داستان ویژه",
            readArticle: "مطالعه مقاله",
        },
        article: {
            read: "مطالعه",
            readAriaTemplate: "مطالعه {title}",
            readingTimeTemplate: "{minutes} دقیقه مطالعه",
        },
        pagination: {
            ariaLabel: "صفحه‌بندی وبلاگ",
            previous: "قبلی",
            next: "بعدی",
            pageAriaTemplate: "صفحه {page}",
        },
        newsletter: {
            eyebrow: "یادداشت‌های ژورنال",
            title: "همراه نجیب‌زاده بمانید.",
            description:
                "روایت‌های تازه، کالکشن‌ها و نگاه‌های منتخب نجیب‌زاده را هر از گاهی دریافت کنید.",
            emailPlaceholder: "آدرس ایمیل",
            submit: "عضویت",
            consent:
                "با عضویت، با دریافت گاه‌به‌گاه مطالب تحریریه نجیب‌زاده موافقت می‌کنید.",
            successTitle: "عضویت شما ثبت شد.",
            successDescription:
                "از همراهی شما با ژورنال نجیب‌زاده سپاسگزاریم.",
        },
        empty: {
            title: "نتیجه‌ای پیدا نشد.",
            description:
                "عبارت دیگری جست‌وجو کنید یا همه داستان‌های ژورنال را ببینید.",
            reset: "پاک‌کردن فیلترها",
        },
        categories: {
            "style-notes": "یادداشت‌های استایل",
            craftsmanship: "هنر ساخت",
            "inside-house": "درون خانه",
            perspectives: "دیدگاه‌ها",
            inspiration: "الهام",
            "care-guide": "راهنمای نگهداری",
        },
        posts: [
            {
                id: "blog-01",
                slug: "the-new-language-of-modern-dressing",
                title: "زبان تازه پوشش مدرن",
                excerpt:
                    "نگاهی سنجیده به تناسب، متریال و سادگی؛ روایتی از اینکه کمد لباس مدرن چگونه آرام‌تر، شخصی‌تر و ماندگارتر می‌شود.",
                image: "/assets/images/hero4.webp",
                imageAlt: "جزئیات پوشش مدرن نجیب‌زاده",
                imagePosition: "center 30%",
                category: "style-notes",
                publishedAt: "2026-08-24",
                readingMinutes: 6,
                author: "تحریریه نجیب‌زاده",
                featured: true,
            },
            {
                id: "blog-02",
                slug: "why-material-matters",
                title: "چرا کیفیت متریال بیش از همیشه اهمیت دارد",
                excerpt:
                    "از کشمیر تا پشم ظریف، کیفیت یک لباس مدت‌ها پیش از شکل‌گرفتن فرم نهایی آن آغاز می‌شود.",
                image: "/assets/images/banner.webp",
                imageAlt: "متریال و پارچه‌های منتخب نجیب‌زاده",
                category: "craftsmanship",
                publishedAt: "2026-08-21",
                readingMinutes: 5,
                author: "تحریریه نجیب‌زاده",
            },
            {
                id: "blog-03",
                slug: "building-a-timeless-wardrobe",
                title: "ساختن کمدی فراتر از فصل",
                excerpt:
                    "قطعاتی که ارزش نگه‌داشتن دارند، معمولاً پرهیاهوترین‌ها نیستند؛ نگاهی به انعطاف‌پذیری، ماندگاری و طراحی سنجیده.",
                image: "/assets/images/banner.webp",
                imageAlt: "کمد لباس ماندگار نجیب‌زاده",
                category: "style-notes",
                publishedAt: "2026-08-18",
                readingMinutes: 4,
                author: "تحریریه نجیب‌زاده",
            },
            {
                id: "blog-04",
                slug: "inside-the-atelier",
                title: "درون آتلیه؛ جزئیاتی که هرگز نمی‌بینید",
                excerpt:
                    "نگاهی نزدیک به ساخت، پرداخت نهایی و تصمیم‌های ظریفی که خیاطی ممتاز را شکل می‌دهند.",
                image: "/assets/images/banner.webp",
                imageAlt: "درون آتلیه نجیب‌زاده",
                category: "inside-house",
                publishedAt: "2026-08-14",
                readingMinutes: 8,
                author: "تحریریه نجیب‌زاده",
            },
            {
                id: "blog-05",
                slug: "the-art-of-quiet-luxury",
                title: "تجمل آرام به معنای نامرئی بودن نیست",
                excerpt:
                    "سادگی واقعی به معنای حذف نیست؛ یعنی اطمینان از اینکه دقیقاً چه چیزی شایسته توجه است.",
                image: "/assets/images/banner.webp",
                imageAlt: "نگاه نجیب‌زاده به تجمل آرام",
                category: "perspectives",
                publishedAt: "2026-08-09",
                readingMinutes: 7,
                author: "تحریریه نجیب‌زاده",
            },
            {
                id: "blog-06",
                slug: "a-study-in-black",
                title: "مطالعه‌ای در سیاه",
                excerpt:
                    "بافت، سایه و تناسب نشان می‌دهند چگونه یک رنگ می‌تواند هویت یک کمد کامل را به دوش بکشد.",
                image: "/assets/images/banner.webp",
                imageAlt: "مطالعه رنگ سیاه در پوشاک نجیب‌زاده",
                category: "inspiration",
                publishedAt: "2026-08-03",
                readingMinutes: 3,
                author: "تحریریه نجیب‌زاده",
            },
            {
                id: "blog-07",
                slug: "care-for-cashmere",
                title: "چگونه از کشمیر مراقبت کنیم",
                excerpt:
                    "راهنمایی کاربردی برای شست‌وشو، نگهداری و حفظ یکی از ظریف‌ترین الیاف طبیعی جهان.",
                image: "/assets/images/banner.webp",
                imageAlt: "راهنمای مراقبت از کشمیر",
                category: "care-guide",
                publishedAt: "2026-07-29",
                readingMinutes: 5,
                author: "تحریریه نجیب‌زاده",
            },
            {
                id: "blog-08",
                slug: "the-perfect-jacket",
                title: "آناتومی یک کت بی‌نقص",
                excerpt:
                    "سرشانه، یقه، تعادل و تناسب؛ چهار جزئیاتی که خیاطی را از یک پوشش ساده به شخصیت تبدیل می‌کنند.",
                image: "/assets/images/banner.webp",
                imageAlt: "جزئیات یک کت نجیب‌زاده",
                category: "craftsmanship",
                publishedAt: "2026-07-23",
                readingMinutes: 7,
                author: "تحریریه نجیب‌زاده",
            },
            {
                id: "blog-09",
                slug: "objects-with-character",
                title: "اشیایی با شخصیت",
                excerpt:
                    "چرا چیزهایی که برای زندگی انتخاب می‌کنیم باید سنجیده، ملموس و با گذر زمان شخصی‌تر شوند.",
                image: "/assets/images/banner.webp",
                imageAlt: "اشیای منتخب با شخصیت نجیب‌زاده",
                category: "inspiration",
                publishedAt: "2026-07-18",
                readingMinutes: 4,
                author: "تحریریه نجیب‌زاده",
            },
        ],
    },

    en: {
        metadata: {
            title: "Journal | Najibzadeh",
            description:
                "Explore stories on style, craftsmanship, materials, and the world of Najibzadeh.",
        },
        hero: {
            eyebrow: "The Najibzadeh Journal",
            title: "Stories of style, craft, and character.",
            description:
                "A considered perspective on clothing, materials, craftsmanship, and the world that shapes the identity of Najibzadeh.",
            imageAlt: "The Najibzadeh journal and stories",
            actionLabel: "Explore the Journal",
        },
        journal: {
            eyebrow: "The Najibzadeh Journal",
            titleLine1: "Ideas worth",
            titleLine2: "returning to.",
            description:
                "Perspectives on clothing, craftsmanship, materials, and the quiet details that shape the world of Najibzadeh.",
        },
        filters: {
            all: "All",
            searchPlaceholder: "Search the journal",
            searchAriaLabel: "Search the journal",
            sortAriaLabel: "Sort articles",
            sort: {
                latest: "Newest",
                oldest: "Oldest",
                title: "Alphabetical",
            },
            loading: "Loading the journal",
            articlesCountTemplate: "{count} articles",
            resultsForTemplate: "Results for “{query}”",
        },
        featured: {
            badge: "Featured Story",
            readArticle: "Read Article",
        },
        article: {
            read: "Read",
            readAriaTemplate: "Read {title}",
            readingTimeTemplate: "{minutes} min read",
        },
        pagination: {
            ariaLabel: "Blog pagination",
            previous: "Previous",
            next: "Next",
            pageAriaTemplate: "Page {page}",
        },
        newsletter: {
            eyebrow: "Journal Notes",
            title: "Stay close to Najibzadeh.",
            description:
                "Receive new stories, collections, and selected perspectives from Najibzadeh from time to time.",
            emailPlaceholder: "Email address",
            submit: "Subscribe",
            consent:
                "By subscribing, you agree to occasionally receive editorial updates from Najibzadeh.",
            successTitle: "You are subscribed.",
            successDescription:
                "Thank you for staying connected to the Najibzadeh Journal.",
        },
        empty: {
            title: "No results found.",
            description:
                "Try another search or return to all stories in the journal.",
            reset: "Clear Filters",
        },
        categories: {
            "style-notes": "Style Notes",
            craftsmanship: "Craftsmanship",
            "inside-house": "Inside the House",
            perspectives: "Perspectives",
            inspiration: "Inspiration",
            "care-guide": "Care Guide",
        },
        posts: [
            {
                id: "blog-01",
                slug: "the-new-language-of-modern-dressing",
                title: "The New Language of Modern Dressing",
                excerpt:
                    "A considered look at proportion, material, and simplicity — and how a modern wardrobe can become quieter, more personal, and more enduring.",
                image: "/assets/images/hero4.webp",
                imageAlt: "Modern dressing by Najibzadeh",
                imagePosition: "center 30%",
                category: "style-notes",
                publishedAt: "2026-08-24",
                readingMinutes: 6,
                author: "Najibzadeh Editorial",
                featured: true,
            },
            {
                id: "blog-02",
                slug: "why-material-matters",
                title: "Why Material Matters More Than Ever",
                excerpt:
                    "From cashmere to fine wool, the quality of a garment begins long before its final form takes shape.",
                image: "/assets/images/banner.webp",
                imageAlt: "Najibzadeh selected fabrics and materials",
                category: "craftsmanship",
                publishedAt: "2026-08-21",
                readingMinutes: 5,
                author: "Najibzadeh Editorial",
            },
            {
                id: "blog-03",
                slug: "building-a-timeless-wardrobe",
                title: "Building a Wardrobe Beyond the Season",
                excerpt:
                    "The pieces worth keeping are rarely the loudest — a study in versatility, longevity, and considered design.",
                image: "/assets/images/banner.webp",
                imageAlt: "A timeless Najibzadeh wardrobe",
                category: "style-notes",
                publishedAt: "2026-08-18",
                readingMinutes: 4,
                author: "Najibzadeh Editorial",
            },
            {
                id: "blog-04",
                slug: "inside-the-atelier",
                title: "Inside the Atelier: The Details You Never See",
                excerpt:
                    "A closer look at construction, finishing, and the subtle decisions that define exceptional tailoring.",
                image: "/assets/images/banner.webp",
                imageAlt: "Inside the Najibzadeh atelier",
                category: "inside-house",
                publishedAt: "2026-08-14",
                readingMinutes: 8,
                author: "Najibzadeh Editorial",
            },
            {
                id: "blog-05",
                slug: "the-art-of-quiet-luxury",
                title: "Quiet Luxury Does Not Mean Invisible",
                excerpt:
                    "True simplicity is not about removing everything; it is about knowing precisely what deserves attention.",
                image: "/assets/images/banner.webp",
                imageAlt: "Najibzadeh perspective on quiet luxury",
                category: "perspectives",
                publishedAt: "2026-08-09",
                readingMinutes: 7,
                author: "Najibzadeh Editorial",
            },
            {
                id: "blog-06",
                slug: "a-study-in-black",
                title: "A Study in Black",
                excerpt:
                    "Texture, shadow, and proportion reveal how a single colour can carry the identity of an entire wardrobe.",
                image: "/assets/images/banner.webp",
                imageAlt: "A study of black in Najibzadeh clothing",
                category: "inspiration",
                publishedAt: "2026-08-03",
                readingMinutes: 3,
                author: "Najibzadeh Editorial",
            },
            {
                id: "blog-07",
                slug: "care-for-cashmere",
                title: "How to Care for Cashmere",
                excerpt:
                    "A practical guide to washing, storing, and preserving one of the world's most delicate natural fibres.",
                image: "/assets/images/banner.webp",
                imageAlt: "Cashmere care guide",
                category: "care-guide",
                publishedAt: "2026-07-29",
                readingMinutes: 5,
                author: "Najibzadeh Editorial",
            },
            {
                id: "blog-08",
                slug: "the-perfect-jacket",
                title: "The Anatomy of the Perfect Jacket",
                excerpt:
                    "Shoulder, lapel, balance, and proportion — four details that transform tailoring from clothing into character.",
                image: "/assets/images/banner.webp",
                imageAlt: "Details of a Najibzadeh jacket",
                category: "craftsmanship",
                publishedAt: "2026-07-23",
                readingMinutes: 7,
                author: "Najibzadeh Editorial",
            },
            {
                id: "blog-09",
                slug: "objects-with-character",
                title: "Objects with Character",
                excerpt:
                    "Why the things we choose to live with should feel considered, tactile, and increasingly personal over time.",
                image: "/assets/images/banner.webp",
                imageAlt: "Najibzadeh objects with character",
                category: "inspiration",
                publishedAt: "2026-07-18",
                readingMinutes: 4,
                author: "Najibzadeh Editorial",
            },
        ],
    },

    ar: {
        metadata: {
            title: "المجلة | نجيب زاده",
            description:
                "اكتشف قصصاً عن الأناقة والحرفية والخامات والعالم الذي يشكل هوية نجيب زاده.",
        },
        hero: {
            eyebrow: "مجلة نجيب زاده",
            title: "حكايات عن الأسلوب والحرفة والشخصية.",
            description:
                "نظرة مدروسة إلى الملابس والخامات والحرفية والعالم الذي يصوغ هوية نجيب زاده.",
            imageAlt: "مجلة نجيب زاده وحكاياتها",
            actionLabel: "استكشف المجلة",
        },
        journal: {
            eyebrow: "مجلة نجيب زاده",
            titleLine1: "أفكار تستحق",
            titleLine2: "العودة إليها.",
            description:
                "رؤى حول الملابس والحرفية والخامات والتفاصيل الهادئة التي تشكل عالم نجيب زاده.",
        },
        filters: {
            all: "الكل",
            searchPlaceholder: "ابحث في المجلة",
            searchAriaLabel: "البحث في المجلة",
            sortAriaLabel: "ترتيب المقالات",
            sort: {
                latest: "الأحدث",
                oldest: "الأقدم",
                title: "أبجدياً",
            },
            loading: "جارٍ تحميل المجلة",
            articlesCountTemplate: "{count} مقالات",
            resultsForTemplate: "نتائج البحث عن «{query}»",
        },
        featured: {
            badge: "قصة مختارة",
            readArticle: "قراءة المقال",
        },
        article: {
            read: "قراءة",
            readAriaTemplate: "قراءة {title}",
            readingTimeTemplate: "{minutes} دقائق قراءة",
        },
        pagination: {
            ariaLabel: "ترقيم صفحات المدونة",
            previous: "السابق",
            next: "التالي",
            pageAriaTemplate: "الصفحة {page}",
        },
        newsletter: {
            eyebrow: "ملاحظات المجلة",
            title: "ابق قريباً من نجيب زاده.",
            description:
                "استقبل من حين إلى آخر أحدث الحكايات والمجموعات والرؤى المختارة من نجيب زاده.",
            emailPlaceholder: "البريد الإلكتروني",
            submit: "اشتراك",
            consent:
                "بالاشتراك، فإنك توافق على تلقي تحديثات تحريرية من نجيب زاده من حين إلى آخر.",
            successTitle: "تم تسجيل اشتراكك.",
            successDescription:
                "شكراً لبقائك على اتصال بمجلة نجيب زاده.",
        },
        empty: {
            title: "لم يتم العثور على نتائج.",
            description:
                "جرّب عبارة بحث أخرى أو عد إلى جميع قصص المجلة.",
            reset: "مسح عوامل التصفية",
        },
        categories: {
            "style-notes": "ملاحظات الأناقة",
            craftsmanship: "الحرفية",
            "inside-house": "داخل الدار",
            perspectives: "وجهات نظر",
            inspiration: "إلهام",
            "care-guide": "دليل العناية",
        },
        posts: [
            {
                id: "blog-01",
                slug: "the-new-language-of-modern-dressing",
                title: "اللغة الجديدة للأناقة المعاصرة",
                excerpt:
                    "نظرة مدروسة إلى التناسب والخامات والبساطة، وكيف يمكن لخزانة الملابس الحديثة أن تصبح أكثر هدوءاً وشخصية واستمرارية.",
                image: "/assets/images/hero4.webp",
                imageAlt: "أناقة معاصرة من نجيب زاده",
                imagePosition: "center 30%",
                category: "style-notes",
                publishedAt: "2026-08-24",
                readingMinutes: 6,
                author: "تحرير نجيب زاده",
                featured: true,
            },
            {
                id: "blog-02",
                slug: "why-material-matters",
                title: "لماذا أصبحت جودة الخامات أكثر أهمية من أي وقت مضى",
                excerpt:
                    "من الكشمير إلى الصوف الناعم، تبدأ جودة القطعة قبل وقت طويل من اكتمال شكلها النهائي.",
                image: "/assets/images/banner.webp",
                imageAlt: "خامات وأقمشة مختارة من نجيب زاده",
                category: "craftsmanship",
                publishedAt: "2026-08-21",
                readingMinutes: 5,
                author: "تحرير نجيب زاده",
            },
            {
                id: "blog-03",
                slug: "building-a-timeless-wardrobe",
                title: "بناء خزانة تتجاوز المواسم",
                excerpt:
                    "القطع التي تستحق الاحتفاظ بها نادراً ما تكون الأكثر صخباً؛ تأمل في المرونة والاستمرارية والتصميم المدروس.",
                image: "/assets/images/banner.webp",
                imageAlt: "خزانة نجيب زاده الخالدة",
                category: "style-notes",
                publishedAt: "2026-08-18",
                readingMinutes: 4,
                author: "تحرير نجيب زاده",
            },
            {
                id: "blog-04",
                slug: "inside-the-atelier",
                title: "داخل الأتيليه: تفاصيل لا تراها عادة",
                excerpt:
                    "نظرة عن قرب إلى البناء والتشطيب والقرارات الدقيقة التي تصنع الخياطة الرفيعة.",
                image: "/assets/images/banner.webp",
                imageAlt: "داخل أتيليه نجيب زاده",
                category: "inside-house",
                publishedAt: "2026-08-14",
                readingMinutes: 8,
                author: "تحرير نجيب زاده",
            },
            {
                id: "blog-05",
                slug: "the-art-of-quiet-luxury",
                title: "الفخامة الهادئة لا تعني الاختفاء",
                excerpt:
                    "البساطة الحقيقية لا تعني حذف كل شيء؛ بل معرفة ما يستحق الاهتمام بدقة.",
                image: "/assets/images/banner.webp",
                imageAlt: "رؤية نجيب زاده للفخامة الهادئة",
                category: "perspectives",
                publishedAt: "2026-08-09",
                readingMinutes: 7,
                author: "تحرير نجيب زاده",
            },
            {
                id: "blog-06",
                slug: "a-study-in-black",
                title: "دراسة في اللون الأسود",
                excerpt:
                    "تكشف الملامس والظلال والتناسب كيف يمكن للون واحد أن يحمل هوية خزانة كاملة.",
                image: "/assets/images/banner.webp",
                imageAlt: "دراسة اللون الأسود في ملابس نجيب زاده",
                category: "inspiration",
                publishedAt: "2026-08-03",
                readingMinutes: 3,
                author: "تحرير نجيب زاده",
            },
            {
                id: "blog-07",
                slug: "care-for-cashmere",
                title: "كيف تعتني بالكشمير",
                excerpt:
                    "دليل عملي لغسل الكشمير وتخزينه والحفاظ على واحد من أرق الألياف الطبيعية في العالم.",
                image: "/assets/images/banner.webp",
                imageAlt: "دليل العناية بالكشمير",
                category: "care-guide",
                publishedAt: "2026-07-29",
                readingMinutes: 5,
                author: "تحرير نجيب زاده",
            },
            {
                id: "blog-08",
                slug: "the-perfect-jacket",
                title: "تشريح السترة المثالية",
                excerpt:
                    "الكتف والياقة والتوازن والتناسب؛ أربعة تفاصيل تنقل الخياطة من مجرد لباس إلى تعبير عن الشخصية.",
                image: "/assets/images/banner.webp",
                imageAlt: "تفاصيل سترة من نجيب زاده",
                category: "craftsmanship",
                publishedAt: "2026-07-23",
                readingMinutes: 7,
                author: "تحرير نجيب زاده",
            },
            {
                id: "blog-09",
                slug: "objects-with-character",
                title: "أشياء تحمل شخصية",
                excerpt:
                    "لماذا ينبغي للأشياء التي نختار أن نعيش معها أن تكون مدروسة وملموسة وتزداد شخصية مع مرور الوقت.",
                image: "/assets/images/banner.webp",
                imageAlt: "قطع مختارة تحمل شخصية نجيب زاده",
                category: "inspiration",
                publishedAt: "2026-07-18",
                readingMinutes: 4,
                author: "تحرير نجيب زاده",
            },
        ],
    },
};
