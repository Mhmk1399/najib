import type { Locale } from "@/lib/i18n/config";

export type PrivacyPolicySection = {
    id: string;
    title: string;
    body: string;
};

export type PrivacyCopy = {
    metadata: {
        title: string;
        description: string;
    };

    hero: {
        eyebrow: string;
        title: string;
        intro: string;

        contactAction: {
            label: string;
            href: string;
        };
    };

    sections: PrivacyPolicySection[];
};

export const privacyCopy: Record<Locale, PrivacyCopy> = {
    fa: {
        metadata: {
            title: "حریم خصوصی | نجیب‌زاده",
            description:
                "نحوه استفاده و نگهداری نجیب‌زاده از اطلاعات شما.",
        },

        hero: {
            eyebrow: "اطلاعات و اعتماد",

            title:
                "حریم خصوصی شما برای ما جدی است.",

            intro:
                "این صفحه توضیح می‌دهد چه اطلاعاتی هنگام استفاده از فروشگاه نجیب‌زاده دریافت می‌شود، چرا به آن نیاز داریم و چگونه از آن محافظت می‌کنیم.",

            contactAction: {
                label:
                    "پرسشی دارید؟ با ما تماس بگیرید",
                href: "/contact-us",
            },
        },

        sections: [
            {
                id: "information-we-collect",

                title:
                    "اطلاعاتی که دریافت می‌کنیم",

                body:
                    "اطلاعاتی مانند نام، راه ارتباطی، نشانی تحویل و جزئیات سفارش فقط زمانی دریافت می‌شود که برای ایجاد حساب، تکمیل خرید یا پاسخ‌گویی به درخواست شما لازم باشد.",
            },

            {
                id: "how-we-use-information",

                title: "نحوه استفاده",

                body:
                    "از اطلاعات برای ارائه خدمات فروشگاه، پیگیری سفارش، پشتیبانی مشتریان، جلوگیری از سوءاستفاده و بهبود تجربه نجیب‌زاده استفاده می‌کنیم.",
            },

            {
                id: "sharing-and-security",

                title:
                    "اشتراک‌گذاری و امنیت",

                body:
                    "اطلاعات شما فروخته نمی‌شود. تنها در حد لازم با ارائه‌دهندگان مورد اعتماد پرداخت، تحویل و زیرساخت فنی به اشتراک گذاشته می‌شود و دسترسی‌ها محدود و کنترل‌شده هستند.",
            },

            {
                id: "your-requests",

                title: "درخواست‌های شما",

                body:
                    "برای مشاهده، اصلاح یا حذف اطلاعات حساب خود می‌توانید از صفحه پروفایل استفاده کنید یا از طریق صفحه تماس با ما درخواستتان را ارسال کنید.",
            },
        ],
    },

    en: {
        metadata: {
            title:
                "Privacy Policy | Najibzadeh",

            description:
                "How Najibzadeh collects, uses, and protects your information.",
        },

        hero: {
            eyebrow:
                "Information & Trust",

            title:
                "Your privacy matters to us.",

            intro:
                "This page explains what information may be collected when you use the Najibzadeh store, why we need it, and how we work to protect it.",

            contactAction: {
                label:
                    "Have a question? Contact us",
                href: "/contact-us",
            },
        },

        sections: [
            {
                id: "information-we-collect",

                title:
                    "Information We Collect",

                body:
                    "Information such as your name, contact details, delivery address, and order information is collected only when it is needed to create an account, complete a purchase, or respond to your request.",
            },

            {
                id: "how-we-use-information",

                title:
                    "How We Use Your Information",

                body:
                    "We use your information to provide store services, process and track orders, support clients, prevent misuse, and improve the Najibzadeh experience.",
            },

            {
                id: "sharing-and-security",

                title:
                    "Sharing & Security",

                body:
                    "Your information is not sold. It is shared only where necessary with trusted payment, delivery, and technical infrastructure providers, with access kept limited and controlled.",
            },

            {
                id: "your-requests",

                title: "Your Requests",

                body:
                    "You can review, update, or request the deletion of your account information through your profile or by submitting a request through our contact page.",
            },
        ],
    },

    ar: {
        metadata: {
            title:
                "سياسة الخصوصية | نجيب زاده",

            description:
                "كيفية استخدام نجيب زاده لمعلوماتك وحمايتها والاحتفاظ بها.",
        },

        hero: {
            eyebrow:
                "المعلومات والثقة",

            title:
                "خصوصيتك مهمة بالنسبة لنا.",

            intro:
                "توضح هذه الصفحة المعلومات التي قد يتم جمعها عند استخدام متجر نجيب زاده، وسبب حاجتنا إليها، وكيف نعمل على حمايتها.",

            contactAction: {
                label:
                    "لديك سؤال؟ تواصل معنا",
                href: "/contact-us",
            },
        },

        sections: [
            {
                id: "information-we-collect",

                title:
                    "المعلومات التي نجمعها",

                body:
                    "يتم جمع معلومات مثل الاسم وبيانات التواصل وعنوان التسليم وتفاصيل الطلب فقط عندما تكون ضرورية لإنشاء حساب أو إتمام عملية شراء أو الرد على طلبك.",
            },

            {
                id: "how-we-use-information",

                title:
                    "كيفية استخدام المعلومات",

                body:
                    "نستخدم المعلومات لتقديم خدمات المتجر ومتابعة الطلبات ودعم العملاء ومنع إساءة الاستخدام وتحسين تجربة نجيب زاده.",
            },

            {
                id: "sharing-and-security",

                title:
                    "المشاركة والأمان",

                body:
                    "لا يتم بيع معلوماتك. ولا تتم مشاركتها إلا بالقدر اللازم مع مزودي خدمات الدفع والتوصيل والبنية التحتية التقنية الموثوقين، مع تقييد الوصول إليها والتحكم فيه.",
            },

            {
                id: "your-requests",

                title: "طلباتك",

                body:
                    "يمكنك مراجعة معلومات حسابك أو تعديلها أو طلب حذفها من خلال صفحة الملف الشخصي أو عبر إرسال طلب من خلال صفحة التواصل معنا.",
            },
        ],
    },
};