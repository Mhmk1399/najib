import type { Locale } from "@/lib/i18n/config";

export type AboutActionCopy = {
    label: string;
    href: string;
};

export type AboutCraftIcon =
    | "material"
    | "precision"
    | "finishing"
    | "lasting";

export type AboutCraftValueCopy = {
    id: string;
    title: string;
    icon: AboutCraftIcon;
};

export type AboutCopy = {
    metadata: {
        title: string;
        description: string;
    };

    hero: {
        imageAlt: string;

        eyebrow: string;

        title: string;
        italicTitle: string;

        description: string;

        houseEyebrow: string;
        houseName: string;

        bottomLabel: string;
        bottomBrand: string;

        action?: AboutActionCopy;
    };

    craft: {
        imageAlts: {
            fabric: string;
            hand: string;
            material: string;
        };

        eyebrow: string;

        title: string;

        description: string;

        secondaryDescription: string;

        values: AboutCraftValueCopy[];
    };

    values: {
        imageAlt: string;

        eyebrow: string;

        title: string;
        italicTitle: string;

        description: string;

        quote: string;

        signature: string;

        bottomDetail: string;

        action?: AboutActionCopy;
    };
};

export const aboutCopy: Record<
    Locale,
    AboutCopy
> = {
    fa: {
        metadata: {
            title: "درباره ما | نجیب‌زاده",
            description:
                "با خانه نجیب‌زاده، نگاه ما به خیاطی، هنر دست، متریال و ارزش‌هایی که هویت این برند را شکل می‌دهند آشنا شوید.",
        },

        hero: {
            imageAlt:
                "خانه خیاطی نجیب‌زاده",

            eyebrow:
                "درباره نجیب‌زاده",

            title:
                "ریشه‌دار در میراث.",

            italicTitle:
                "تعریف‌شده با هدف.",

            description:
                "نجیب‌زاده خانه‌ای مدرن برای خیاطی، عطر و اشیای ماندگار است؛ شکل‌گرفته از هنر دست، ظرافت، اصالت و جست‌وجویی آرام برای خلق تمایزی ماندگار.",

            houseEyebrow:
                "خانه نجیب‌زاده",

            houseName:
                "نجیب‌زاده",

            bottomLabel:
                "بنیان‌گذاری‌شده با هدف",

            bottomBrand:
                "نجیب‌زاده",
        },

        craft: {
            imageAlts: {
                fabric:
                    "جزئیات پارچه نجیب‌زاده",

                hand:
                    "هنر دست و خیاطی نجیب‌زاده",

                material:
                    "متریال منتخب نجیب‌زاده",
            },

            eyebrow:
                "هنر ما",

            title:
                "جایی که هنر دست با ظرافت مدرن پیوند می‌خورد.",

            description:
                "هر قطعه با یک هدف آغاز می‌شود. از انتخاب نخستین متریال تا آخرین بخیه، هر تصمیم با دقت، تناسب و احترام به هنر خیاطی شکل می‌گیرد.",

            secondaryDescription:
                "نتیجه، پوشاک و اشیایی است که برای زندگی‌کردن، به‌یادماندن و ارزشمند ماندن فراتر از یک لحظه ساخته شده‌اند.",

            values: [
                {
                    id: "materials",
                    title:
                        "بهترین متریال",
                    icon: "material",
                },

                {
                    id: "precision",
                    title:
                        "دوخت دقیق",
                    icon: "precision",
                },

                {
                    id: "finishing",
                    title:
                        "پرداخت ظریف",
                    icon: "finishing",
                },

                {
                    id: "lasting",
                    title:
                        "ساخته‌شده برای ماندگاری",
                    icon: "lasting",
                },
            ],
        },

        values: {
            imageAlt:
                "ارزش‌های ماندگار نجیب‌زاده",

            eyebrow:
                "ارزش‌های ما",

            title:
                "ساخته‌شده بر پایه ارزش‌های ماندگار.",

            italicTitle:
                "هدایت‌شده با اصالت.",

            description:
                "در نجیب‌زاده باور داریم که تجمل واقعی، آرام و بی‌ادعاست؛ در صداقت، انتخاب‌های سنجیده و تعهد به خلق چیزهایی معنا پیدا می‌کند که شایسته ماندگاری هستند.",

            quote:
                "«ما با احترام خلق می‌کنیم؛ احترام به انسان، هنر، اصالت و جهانی که پیرامون ماست.»",

            signature:
                "نجیب‌زاده",

            bottomDetail:
                "هدف / هنر / شخصیت",
        },
    },

    en: {
        metadata: {
            title:
                "About Us | Najibzadeh",

            description:
                "Discover the House of Najibzadeh, our approach to tailoring and craftsmanship, and the enduring values that shape our identity.",
        },

        hero: {
            imageAlt:
                "The House of Najibzadeh tailoring",

            eyebrow:
                "About Najibzadeh",

            title:
                "Rooted in heritage.",

            italicTitle:
                "Defined by purpose.",

            description:
                "Najibzadeh is a modern house of tailoring, fragrance, and enduring objects, shaped by craftsmanship, refinement, authenticity, and a quiet pursuit of lasting distinction.",

            houseEyebrow:
                "The House of Najibzadeh",

            houseName:
                "NAJIBZADEH",

            bottomLabel:
                "Founded with purpose",

            bottomBrand:
                "NAJIBZADEH",
        },

        craft: {
            imageAlts: {
                fabric:
                    "Najibzadeh fabric detail",

                hand:
                    "Najibzadeh craftsmanship",

                material:
                    "Najibzadeh selected material",
            },

            eyebrow:
                "Our Craft",

            title:
                "Where craftsmanship meets modern refinement.",

            description:
                "Every piece begins with intention. From the first selection of material to the final stitch, each decision is guided by precision, proportion, and respect for the art of tailoring.",

            secondaryDescription:
                "The result is clothing and objects created to be lived with, remembered, and valued far beyond a single moment.",

            values: [
                {
                    id: "materials",
                    title:
                        "Exceptional Materials",
                    icon: "material",
                },

                {
                    id: "precision",
                    title:
                        "Precise Tailoring",
                    icon: "precision",
                },

                {
                    id: "finishing",
                    title:
                        "Refined Finishing",
                    icon: "finishing",
                },

                {
                    id: "lasting",
                    title:
                        "Made to Endure",
                    icon: "lasting",
                },
            ],
        },

        values: {
            imageAlt:
                "The enduring values of Najibzadeh",

            eyebrow:
                "Our Values",

            title:
                "Built upon enduring values.",

            italicTitle:
                "Guided by authenticity.",

            description:
                "At Najibzadeh, we believe true luxury is quiet and considered; expressed through integrity, deliberate choices, and a commitment to creating things worthy of lasting.",

            quote:
                "“We create with respect — for people, craft, authenticity, and the world around us.”",

            signature:
                "NAJIBZADEH",

            bottomDetail:
                "PURPOSE / CRAFT / CHARACTER",
        },
    },

    ar: {
        metadata: {
            title:
                "من نحن | نجيب زاده",

            description:
                "تعرّف على دار نجيب زاده ونهجنا في الخياطة والحرفية والقيم الراسخة التي تشكل هويتنا.",
        },

        hero: {
            imageAlt:
                "دار نجيب زاده للخياطة",

            eyebrow:
                "عن نجيب زاده",

            title:
                "متجذرون في الإرث.",

            italicTitle:
                "تحددنا الغاية.",

            description:
                "نجيب زاده دار معاصرة للخياطة والعطور والقطع الخالدة، تشكلت من الحرفية والرقي والأصالة والسعي الهادئ نحو تميز يدوم.",

            houseEyebrow:
                "دار نجيب زاده",

            houseName:
                "نجيب زاده",

            bottomLabel:
                "تأسست برؤية وغاية",

            bottomBrand:
                "نجيب زاده",
        },

        craft: {
            imageAlts: {
                fabric:
                    "تفاصيل أقمشة نجيب زاده",

                hand:
                    "حرفية نجيب زاده",

                material:
                    "خامات نجيب زاده المختارة",
            },

            eyebrow:
                "حرفيتنا",

            title:
                "حيث تلتقي الحرفية بالرقي المعاصر.",

            description:
                "تبدأ كل قطعة برؤية واضحة. فمن اختيار الخامة الأولى إلى الغرزة الأخيرة، تُتخذ كل خطوة بدقة وتوازن واحترام لفن الخياطة.",

            secondaryDescription:
                "والنتيجة ملابس وقطع صُممت لتُعاش وتُتذكر وتحافظ على قيمتها لما بعد اللحظة.",

            values: [
                {
                    id: "materials",
                    title:
                        "أجود الخامات",
                    icon: "material",
                },

                {
                    id: "precision",
                    title:
                        "خياطة دقيقة",
                    icon: "precision",
                },

                {
                    id: "finishing",
                    title:
                        "تشطيبات راقية",
                    icon: "finishing",
                },

                {
                    id: "lasting",
                    title:
                        "صُنعت لتدوم",
                    icon: "lasting",
                },
            ],
        },

        values: {
            imageAlt:
                "قيم نجيب زاده الراسخة",

            eyebrow:
                "قيمنا",

            title:
                "بُنيت على قيم تدوم.",

            italicTitle:
                "تقودها الأصالة.",

            description:
                "في نجيب زاده نؤمن بأن الفخامة الحقيقية هادئة ومدروسة؛ تتجلى في النزاهة والاختيارات الواعية والالتزام بابتكار أشياء تستحق أن تدوم.",

            quote:
                "«نبتكر باحترام؛ احتراماً للإنسان والحرفة والأصالة والعالم من حولنا.»",

            signature:
                "نجيب زاده",

            bottomDetail:
                "الغاية / الحرفة / الشخصية",
        },
    },
};