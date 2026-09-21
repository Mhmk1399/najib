import type { Locale } from "@/lib/i18n/config";

export type ContactMethodIcon =
    | "appointment"
    | "service"
    | "location"
    | "contact";

export type ContactMethodCopy = {
    id: string;

    title: string;

    description: string[];

    action?: {
        label: string;
        href: string;
        external?: boolean;
    };

    icon: ContactMethodIcon;
};

export type ContactCopy = {
    metadata: {
        title: string;
        description: string;
    };

    hero: {
        imageAlt: string;

        houseMark: string;

        eyebrow: string;

        title: string;

        italicTitle: string;

        description: string;

        bottomServiceLabel: string;

        bottomBrandLabel: string;
    };

    services: {
        imageAlt: string;

        imageCaption: string;

        eyebrow: string;

        title: string;

        footerNote: string;

        methods: ContactMethodCopy[];
    };

    appointment: {
        imageAlt: string;

        eyebrow: string;

        title: string;

        italicTitle: string;

        description: string;

        form: {
            fullName: string;

            email: string;

            phone: string;

            preferredDate: string;

            preferredTime: string;

            message: string;

            submit: string;
        };
    };
};

export const contactCopy: Record<Locale, ContactCopy> = {
    fa: {
        metadata: {
            title: "تماس با ما | نجیب‌زاده",
            description:
                "برای خدمات مشتریان، راهنمایی اختصاصی و رزرو قرار ملاقات خصوصی با نجیب‌زاده در ارتباط باشید.",
        },

        hero: {
            imageAlt: "آتلیه خصوصی نجیب‌زاده",

            houseMark: "نجیب‌زاده",

            eyebrow: "ارتباط با نجیب‌زاده",

            title: "آغاز یک گفت‌وگو.",

            italicTitle:
                "برای همراهی شما در تمام جزئیات اینجاییم.",

            description:
                "از قرارهای ملاقات خصوصی تا راهنمایی‌های اختصاصی، تیم نجیب‌زاده آماده است تا تجربه‌ای دقیق، آرام و متناسب با نیاز شما فراهم کند.",

            bottomServiceLabel:
                "خدمات اختصاصی مشتریان",

            bottomBrandLabel: "نجیب‌زاده",
        },

        services: {
            imageAlt:
                "خدمات خصوصی و متریال نجیب‌زاده",

            imageCaption:
                "خدمات اختصاصی نجیب‌زاده",

            eyebrow: "ارتباط با ما",

            title:
                "هر زمان که نیاز داشته باشید، در کنار شما هستیم.",

            footerNote:
                "حریم خصوصی شما برای ما اهمیت دارد. تمام درخواست‌ها با نهایت احترام و محرمانگی بررسی می‌شوند.",

            methods: [
                {
                    id: "appointment",

                    title: "قرار ملاقات خصوصی",

                    description: [
                        "کالکشن‌های نجیب‌زاده را در فضایی خصوصی، آرام و اختصاصی تجربه کنید.",
                        "پذیرش تنها با رزرو قبلی انجام می‌شود.",
                    ],

                    action: {
                        label: "رزرو قرار ملاقات",
                        href: "/contact-us#appointment",
                    },

                    icon: "appointment",
                },

                {
                    id: "services",

                    title: "خدمات مشتریان",

                    description: [
                        "تیم ما برای پاسخ‌گویی درباره محصولات، راهنمایی استایل، سفارش‌ها و خدمات پس از خرید در کنار شماست.",
                    ],

                    action: {
                        label: "خدمات مشتریان",
                        href: "/contact-us#services",
                    },

                    icon: "service",
                },

                {
                    id: "location",

                    title: "دیدار از خانه نجیب‌زاده",

                    description: [
                        "آتلیه نجیب‌زاده",
                        "۷۴ ماونت استریت",
                        "می‌فر، لندن",
                        "بریتانیا",
                    ],

                    action: {
                        label: "مشاهده مسیر",
                        href: "/contact-us#location",
                    },

                    icon: "location",
                },

                {
                    id: "contact",

                    title: "ایمیل و تلفن",

                    description: [
                        "info@najibzadeh.com",
                        "+44 (0)20 4571 8900",
                        "دوشنبه تا جمعه",
                        "۱۰:۰۰ تا ۱۸:۰۰",
                    ],

                    action: {
                        label: "ارسال ایمیل",
                        href: "mailto:info@najibzadeh.com",
                        external: true,
                    },

                    icon: "contact",
                },
            ],
        },

        appointment: {
            imageAlt:
                "قرار ملاقات خصوصی نجیب‌زاده",

            eyebrow:
                "اجازه دهید شخصاً همراه شما باشیم",

            title:
                "رزرو قرار ملاقات خصوصی.",

            italicTitle:
                "تجربه‌ای متناسب با شما.",

            description:
                "چند جزئیات کوتاه با ما در میان بگذارید تا تیم نجیب‌زاده برای هماهنگی و تأیید قرار ملاقات با شما در ارتباط باشد.",

            form: {
                fullName:
                    "نام و نام خانوادگی",

                email: "آدرس ایمیل",

                phone: "شماره تماس",

                preferredDate:
                    "تاریخ مورد نظر",

                preferredTime:
                    "ساعت مورد نظر",

                message: "پیام شما",

                submit: "ارسال درخواست",
            },
        },
    },

    en: {
        metadata: {
            title: "Contact Us | Najibzadeh",
            description:
                "Contact Najibzadeh for client services, personalised guidance, and private appointments.",
        },

        hero: {
            imageAlt:
                "Najibzadeh private atelier",

            houseMark: "NAJIBZADEH",

            eyebrow: "Contact Najibzadeh",

            title: "Begin a conversation.",

            italicTitle:
                "We are here to assist with every detail.",

            description:
                "From private appointments to personalised guidance, the Najibzadeh team is here to provide a considered, calm, and individual experience.",

            bottomServiceLabel:
                "Private Client Services",

            bottomBrandLabel:
                "NAJIBZADEH",
        },

        services: {
            imageAlt:
                "Najibzadeh private services and materials",

            imageCaption:
                "Najibzadeh Private Services",

            eyebrow: "Contact Us",

            title:
                "Whenever you need us, we are here.",

            footerNote:
                "Your privacy matters to us. Every enquiry is handled with care, respect, and discretion.",

            methods: [
                {
                    id: "appointment",

                    title: "Private Appointment",

                    description: [
                        "Discover the Najibzadeh collections in a private, calm, and personal setting.",
                        "Visits are available by prior appointment only.",
                    ],

                    action: {
                        label:
                            "Book an Appointment",
                        href: "/contact-us#appointment",
                    },

                    icon: "appointment",
                },

                {
                    id: "services",

                    title: "Client Services",

                    description: [
                        "Our team is available to assist with products, styling guidance, orders, and aftercare.",
                    ],

                    action: {
                        label: "Client Services",
                        href: "/contact-us#services",
                    },

                    icon: "service",
                },

                {
                    id: "location",

                    title:
                        "Visit the Najibzadeh House",

                    description: [
                        "Najibzadeh Atelier",
                        "74 Mount Street",
                        "Mayfair, London",
                        "United Kingdom",
                    ],

                    action: {
                        label: "View Directions",
                        href: "/contact-us#location",
                    },

                    icon: "location",
                },

                {
                    id: "contact",

                    title: "Email & Telephone",

                    description: [
                        "info@najibzadeh.com",
                        "+44 (0)20 4571 8900",
                        "Monday to Friday",
                        "10:00 – 18:00",
                    ],

                    action: {
                        label: "Send an Email",
                        href: "mailto:info@najibzadeh.com",
                        external: true,
                    },

                    icon: "contact",
                },
            ],
        },

        appointment: {
            imageAlt:
                "Najibzadeh private appointment",

            eyebrow:
                "Allow us to assist you personally",

            title:
                "Book a private appointment.",

            italicTitle:
                "An experience tailored to you.",

            description:
                "Share a few details with us and the Najibzadeh team will contact you to arrange and confirm your private appointment.",

            form: {
                fullName: "Full Name",

                email: "Email Address",

                phone: "Telephone",

                preferredDate:
                    "Preferred Date",

                preferredTime:
                    "Preferred Time",

                message: "Your Message",

                submit: "Send Request",
            },
        },
    },

    ar: {
        metadata: {
            title: "تواصل معنا | نجيب زاده",
            description:
                "تواصل مع نجيب زاده لخدمات العملاء والإرشاد الشخصي وحجز المواعيد الخاصة.",
        },

        hero: {
            imageAlt:
                "أتيليه نجيب زاده الخاص",

            houseMark: "نجيب زاده",

            eyebrow: "تواصل مع نجيب زاده",

            title: "ابدأ حواراً معنا.",

            italicTitle:
                "نحن هنا لمرافقتك في كل التفاصيل.",

            description:
                "من المواعيد الخاصة إلى الإرشاد الشخصي، فريق نجيب زاده مستعد لتقديم تجربة دقيقة وهادئة ومصممة بما يتناسب مع احتياجاتك.",

            bottomServiceLabel:
                "خدمات العملاء الخاصة",

            bottomBrandLabel: "نجيب زاده",
        },

        services: {
            imageAlt:
                "خدمات نجيب زاده الخاصة والخامات",

            imageCaption:
                "خدمات نجيب زاده الخاصة",

            eyebrow: "تواصل معنا",

            title:
                "نحن إلى جانبك متى احتجت إلينا.",

            footerNote:
                "خصوصيتك مهمة بالنسبة لنا. يتم التعامل مع جميع الطلبات بكل احترام وسرية.",

            methods: [
                {
                    id: "appointment",

                    title: "موعد خاص",

                    description: [
                        "اكتشف مجموعات نجيب زاده في أجواء خاصة وهادئة ومصممة لك.",
                        "تتم الزيارات بالحجز المسبق فقط.",
                    ],

                    action: {
                        label: "احجز موعداً",
                        href: "/contact-us#appointment",
                    },

                    icon: "appointment",
                },

                {
                    id: "services",

                    title: "خدمات العملاء",

                    description: [
                        "فريقنا متاح لمساعدتك في ما يتعلق بالمنتجات واختيار الإطلالة والطلبات وخدمات ما بعد الشراء.",
                    ],

                    action: {
                        label: "خدمات العملاء",
                        href: "/contact-us#services",
                    },

                    icon: "service",
                },

                {
                    id: "location",

                    title:
                        "زيارة دار نجيب زاده",

                    description: [
                        "أتيليه نجيب زاده",
                        "74 Mount Street",
                        "Mayfair, London",
                        "United Kingdom",
                    ],

                    action: {
                        label: "عرض الاتجاهات",
                        href: "/contact-us#location",
                    },

                    icon: "location",
                },

                {
                    id: "contact",

                    title:
                        "البريد الإلكتروني والهاتف",

                    description: [
                        "info@najibzadeh.com",
                        "+44 (0)20 4571 8900",
                        "من الاثنين إلى الجمعة",
                        "10:00 – 18:00",
                    ],

                    action: {
                        label: "إرسال بريد إلكتروني",
                        href: "mailto:info@najibzadeh.com",
                        external: true,
                    },

                    icon: "contact",
                },
            ],
        },

        appointment: {
            imageAlt:
                "موعد خاص مع نجيب زاده",

            eyebrow:
                "دعنا نرافقك بصورة شخصية",

            title: "احجز موعداً خاصاً.",

            italicTitle:
                "تجربة مصممة من أجلك.",

            description:
                "شارك معنا بعض التفاصيل وسيتواصل معك فريق نجيب زاده لترتيب موعدك الخاص وتأكيده.",

            form: {
                fullName: "الاسم الكامل",

                email:
                    "البريد الإلكتروني",

                phone: "رقم الهاتف",

                preferredDate:
                    "التاريخ المفضل",

                preferredTime:
                    "الوقت المفضل",

                message: "رسالتك",

                submit: "إرسال الطلب",
            },
        },
    },
};