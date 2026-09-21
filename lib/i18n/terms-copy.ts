import type { Locale } from "@/lib/i18n/config";

export type TermsSectionCopy = {
    id: string;
    title: string;
    paragraphs: string[];
};

export type TermsCopy = {
    hero: {
        imageAlt: string;
        brandMark: string;
        eyebrow: string;
        title: string;
        description: string;
        lastUpdatedLabel: string;
        lastUpdated: string;
    };

    navigation: {
        title: string;
        ariaLabel: string;
        printLabel: string;
    };

    support: {
        eyebrow: string;
        title: string;
        description: string;

        action: {
            label: string;
            href: string;
        };

        email: string;
    };

    footer: {
        copyrightTemplate: string;
        legalLabel: string;
    };

    sections: TermsSectionCopy[];
};

export const termsCopy: Record<Locale, TermsCopy> = {
    fa: {
        hero: {
            imageAlt: "شرایط و ضوابط نجیب‌زاده",
            brandMark: "نجیب‌زاده",
            eyebrow: "حقوقی / نجیب‌زاده",
            title: "شرایط و ضوابط",
            description:
                "این شرایط، نحوه استفاده شما از وب‌سایت نجیب‌زاده و خدمات و محصولات ارائه‌شده از طریق آن را مشخص می‌کند.",
            lastUpdatedLabel: "آخرین به‌روزرسانی",
            lastUpdated: "اوت ۲۰۲۶",
        },

        navigation: {
            title: "در این صفحه",
            ariaLabel: "بخش‌های شرایط و ضوابط",
            printLabel: "چاپ / ذخیره PDF",
        },

        support: {
            eyebrow: "خدمات مشتریان",
            title: "در کنار شما هستیم.",
            description:
                "اگر درباره این شرایط، سفارش خود یا تجربه‌تان با نجیب‌زاده پرسشی دارید، تیم ما با خرسندی همراه شما خواهد بود.",
            action: {
                label: "تماس با ما",
                href: "/contact-us",
            },
            email: "clientservices@najibzadeh.com",
        },

        footer: {
            copyrightTemplate: "© {year} نجیب‌زاده",
            legalLabel: "شرایط و ضوابط / حقوقی",
        },

        sections: [
            {
                id: "introduction",
                title: "مقدمه",
                paragraphs: [
                    "به نجیب‌زاده خوش آمدید. این شرایط و ضوابط، نحوه دسترسی و استفاده شما از وب‌سایت، خدمات دیجیتال و خریدهایی را که از طریق تجربه آنلاین ما انجام می‌دهید، مشخص می‌کند.",
                    "با دسترسی به این وب‌سایت یا استفاده از آن، تأیید می‌کنید که این شرایط را مطالعه و درک کرده‌اید و با آن‌ها موافق هستید.",
                ],
            },
            {
                id: "use-of-site",
                title: "استفاده از وب‌سایت",
                paragraphs: [
                    "شما تنها می‌توانید برای اهداف قانونی از این وب‌سایت استفاده کنید و استفاده شما نباید حقوق دیگران را نقض کند یا دسترسی و بهره‌مندی آن‌ها از تجربه نجیب‌زاده را محدود سازد.",
                    "هرگونه سوءاستفاده، بازتولید غیرمجاز، ایجاد اختلال یا تلاش برای دسترسی بدون مجوز به هر بخش از وب‌سایت، سامانه‌ها یا خدمات ما مجاز نیست.",
                ],
            },
            {
                id: "products-orders",
                title: "محصولات و سفارش‌ها",
                paragraphs: [
                    "تمام محصولات مشروط به موجودی هستند. در صورت ضرورت معقول، حق محدود کردن تعداد، توقف عرضه محصول یا نپذیرفتن یک سفارش برای نجیب‌زاده محفوظ است.",
                    "سفارش تنها زمانی پذیرفته‌شده محسوب می‌شود که تأیید پردازش سفارش را از نجیب‌زاده دریافت کنید.",
                ],
            },
            {
                id: "pricing-payment",
                title: "قیمت‌گذاری و پرداخت",
                paragraphs: [
                    "قیمت‌های نمایش‌داده‌شده در وب‌سایت با ارز مربوط ارائه می‌شوند و در مواردی که قانون الزام کند، ممکن است شامل مالیات باشند.",
                    "ما برای صحت اطلاعات قیمت‌گذاری دقت معقولی به کار می‌بریم. اگر پیش از انجام سفارش خطایی شناسایی شود، ممکن است پیش از ادامه فرایند با شما تماس بگیریم.",
                ],
            },
            {
                id: "shipping-delivery",
                title: "ارسال و تحویل",
                paragraphs: [
                    "زمان‌های تخمینی تحویل صرفاً به‌عنوان راهنما ارائه می‌شوند و ممکن است بر اساس مقصد، موجودی محصول و شرایط خارج از کنترل معقول ما تغییر کنند.",
                    "انتقال ریسک محصولات خریداری‌شده مطابق ترتیبات تحویل مربوط و قوانین حمایت از مصرف‌کننده در حوزه قضایی شما انجام می‌شود.",
                ],
            },
            {
                id: "returns-exchanges",
                title: "مرجوعی و تعویض",
                paragraphs: [
                    "محصولات واجد شرایط را می‌توان در بازه زمانی مشخص‌شده در سیاست مرجوعی ما بازگرداند یا تعویض کرد؛ مشروط بر اینکه استفاده یا پوشیده نشده باشند و در وضعیت اولیه خود باقی مانده باشند.",
                    "برخی محصولات شخصی‌سازی‌شده، سفارشی یا حساس از نظر بهداشتی، در مواردی که قانون اجازه دهد، ممکن است مشمول مرجوعی نباشند.",
                ],
            },
            {
                id: "intellectual-property",
                title: "مالکیت فکری",
                paragraphs: [
                    "تمام محتوای موجود در این وب‌سایت، از جمله علائم تجاری، تصاویر، طراحی‌ها، متن، گرافیک، ویدئو و عناصر هویتی برند، متعلق به نجیب‌زاده است یا با مجوز در اختیار آن قرار دارد.",
                    "هیچ بخشی از محتوا بدون دریافت اجازه کتبی قبلی نباید کپی، بازتولید، توزیع یا به‌صورت تجاری بهره‌برداری شود.",
                ],
            },
            {
                id: "limitation-liability",
                title: "محدودیت مسئولیت",
                paragraphs: [
                    "هیچ بخشی از این شرایط، مسئولیتی را که طبق قانون قابل حذف یا محدود کردن نیست، مستثنا یا محدود نمی‌کند. تا حدی که قانون اجازه می‌دهد، نجیب‌زاده مسئول زیان‌های غیرمستقیم یا تبعی ناشی از استفاده از این وب‌سایت نیست.",
                    "ما برای ارائه تجربه‌ای دیجیتال، دقیق و پایدار تلاش می‌کنیم، اما تضمین نمی‌کنیم که وب‌سایت همواره در دسترس یا عاری از خطاهای فنی باشد.",
                ],
            },
            {
                id: "governing-law",
                title: "قانون حاکم",
                paragraphs: [
                    "این شرایط تابع قوانینی است که بر واحد نجیب‌زاده مسئول تراکنش شما اعمال می‌شود؛ با رعایت هرگونه حمایت الزامی از مصرف‌کننده که در حوزه قضایی شما در دسترس است.",
                ],
            },
            {
                id: "changes",
                title: "تغییرات این شرایط",
                paragraphs: [
                    "ممکن است برای انعکاس تغییرات خدمات، عملیات یا تعهدات قانونی، این شرایط و ضوابط را هر از گاهی به‌روزرسانی کنیم.",
                    "نسخه منتشرشده در این صفحه در زمان مراجعه شما، نسخه جاری محسوب می‌شود.",
                ],
            },
            {
                id: "contact",
                title: "تماس با ما",
                paragraphs: [
                    "اگر درباره این شرایط و ضوابط، سفارش خود یا تجربه‌تان با نجیب‌زاده پرسشی دارید، تیم خدمات مشتریان ما با خرسندی همراه شما خواهد بود.",
                ],
            },
        ],
    },

    en: {
        hero: {
            imageAlt: "Najibzadeh Terms and Conditions",
            brandMark: "NAJIBZADEH",
            eyebrow: "Legal / Najibzadeh",
            title: "Terms & Conditions",
            description:
                "These terms govern your use of the Najibzadeh website and the services and products made available through it.",
            lastUpdatedLabel: "Last updated",
            lastUpdated: "August 2026",
        },

        navigation: {
            title: "On this page",
            ariaLabel: "Terms and conditions sections",
            printLabel: "Print / Save PDF",
        },

        support: {
            eyebrow: "Client Services",
            title: "We are here to assist.",
            description:
                "If you have any questions about these terms, your order, or your experience with Najibzadeh, our team will be pleased to assist you.",
            action: {
                label: "Contact Us",
                href: "/contact-us",
            },
            email: "clientservices@najibzadeh.com",
        },

        footer: {
            copyrightTemplate: "© {year} Najibzadeh",
            legalLabel: "Terms & Conditions / Legal",
        },

        sections: [
            {
                id: "introduction",
                title: "Introduction",
                paragraphs: [
                    "Welcome to Najibzadeh. These terms and conditions govern your access to and use of our website, digital services, and purchases made through our online experience.",
                    "By accessing or using this website, you confirm that you have read and understood these terms and agree to be bound by them.",
                ],
            },
            {
                id: "use-of-site",
                title: "Use of the Website",
                paragraphs: [
                    "You may use this website only for lawful purposes and in a manner that does not infringe the rights of others or restrict their access to and enjoyment of the Najibzadeh experience.",
                    "Misuse, unauthorised reproduction, disruption, or attempts to gain unauthorised access to any part of our website, systems, or services are prohibited.",
                ],
            },
            {
                id: "products-orders",
                title: "Products & Orders",
                paragraphs: [
                    "All products are subject to availability. Where reasonably necessary, Najibzadeh reserves the right to limit quantities, discontinue products, or decline an order.",
                    "An order is considered accepted only once you receive confirmation from Najibzadeh that the order is being processed.",
                ],
            },
            {
                id: "pricing-payment",
                title: "Pricing & Payment",
                paragraphs: [
                    "Prices displayed on the website are shown in the applicable currency and may include taxes where required by law.",
                    "We take reasonable care to ensure pricing information is accurate. If an error is identified before an order is completed, we may contact you before proceeding.",
                ],
            },
            {
                id: "shipping-delivery",
                title: "Shipping & Delivery",
                paragraphs: [
                    "Estimated delivery times are provided as a guide only and may vary depending on destination, product availability, and circumstances beyond our reasonable control.",
                    "Risk in purchased products passes in accordance with the applicable delivery arrangements and consumer protection laws in your jurisdiction.",
                ],
            },
            {
                id: "returns-exchanges",
                title: "Returns & Exchanges",
                paragraphs: [
                    "Eligible products may be returned or exchanged within the period specified in our returns policy, provided they remain unused, unworn, and in their original condition.",
                    "Certain personalised, made-to-order, or hygiene-sensitive products may be excluded from returns where permitted by law.",
                ],
            },
            {
                id: "intellectual-property",
                title: "Intellectual Property",
                paragraphs: [
                    "All content on this website, including trademarks, imagery, designs, text, graphics, video, and brand elements, is owned by or licensed to Najibzadeh.",
                    "No content may be copied, reproduced, distributed, or commercially exploited without prior written permission.",
                ],
            },
            {
                id: "limitation-liability",
                title: "Limitation of Liability",
                paragraphs: [
                    "Nothing in these terms excludes or limits any liability that cannot legally be excluded or limited. To the extent permitted by law, Najibzadeh is not liable for indirect or consequential losses arising from the use of this website.",
                    "We work to provide an accurate and reliable digital experience, but we do not guarantee that the website will always be available or free from technical errors.",
                ],
            },
            {
                id: "governing-law",
                title: "Governing Law",
                paragraphs: [
                    "These terms are governed by the laws applicable to the Najibzadeh entity responsible for your transaction, subject to any mandatory consumer protections available in your jurisdiction.",
                ],
            },
            {
                id: "changes",
                title: "Changes to These Terms",
                paragraphs: [
                    "We may update these terms from time to time to reflect changes to our services, operations, or legal obligations.",
                    "The version published on this page at the time of your visit is considered the current version.",
                ],
            },
            {
                id: "contact",
                title: "Contact Us",
                paragraphs: [
                    "If you have questions about these terms and conditions, your order, or your experience with Najibzadeh, our client services team will be pleased to assist you.",
                ],
            },
        ],
    },

    ar: {
        hero: {
            imageAlt: "شروط وأحكام نجيب زاده",
            brandMark: "نجيب زاده",
            eyebrow: "قانوني / نجيب زاده",
            title: "الشروط والأحكام",
            description:
                "تحدد هذه الشروط كيفية استخدامك لموقع نجيب زاده والخدمات والمنتجات المقدمة من خلاله.",
            lastUpdatedLabel: "آخر تحديث",
            lastUpdated: "أغسطس ٢٠٢٦",
        },

        navigation: {
            title: "في هذه الصفحة",
            ariaLabel: "أقسام الشروط والأحكام",
            printLabel: "طباعة / حفظ PDF",
        },

        support: {
            eyebrow: "خدمة العملاء",
            title: "نحن هنا لمساعدتك.",
            description:
                "إذا كان لديك أي سؤال حول هذه الشروط أو طلبك أو تجربتك مع نجيب زاده، فسيسعد فريقنا بمساعدتك.",
            action: {
                label: "تواصل معنا",
                href: "/contact-us",
            },
            email: "clientservices@najibzadeh.com",
        },

        footer: {
            copyrightTemplate: "© {year} نجيب زاده",
            legalLabel: "الشروط والأحكام / قانوني",
        },

        sections: [
            {
                id: "introduction",
                title: "مقدمة",
                paragraphs: [
                    "مرحباً بك في نجيب زاده. تحكم هذه الشروط والأحكام وصولك إلى موقعنا الإلكتروني وخدماتنا الرقمية والمشتريات التي تتم من خلال تجربتنا عبر الإنترنت.",
                    "من خلال الوصول إلى هذا الموقع أو استخدامه، فإنك تؤكد أنك قرأت هذه الشروط وفهمتها وتوافق على الالتزام بها.",
                ],
            },
            {
                id: "use-of-site",
                title: "استخدام الموقع",
                paragraphs: [
                    "يجوز لك استخدام هذا الموقع للأغراض القانونية فقط، وبطريقة لا تنتهك حقوق الآخرين أو تحد من وصولهم إلى تجربة نجيب زاده والاستفادة منها.",
                    "يُحظر إساءة الاستخدام أو النسخ غير المصرح به أو تعطيل الموقع أو محاولة الوصول دون تصريح إلى أي جزء من موقعنا أو أنظمتنا أو خدماتنا.",
                ],
            },
            {
                id: "products-orders",
                title: "المنتجات والطلبات",
                paragraphs: [
                    "تخضع جميع المنتجات للتوافر. وعند الضرورة المعقولة، تحتفظ نجيب زاده بالحق في تحديد الكميات أو إيقاف عرض أحد المنتجات أو رفض أحد الطلبات.",
                    "لا يُعد الطلب مقبولاً إلا بعد استلام تأكيد من نجيب زاده ببدء معالجة الطلب.",
                ],
            },
            {
                id: "pricing-payment",
                title: "الأسعار والدفع",
                paragraphs: [
                    "تُعرض الأسعار على الموقع بالعملة المعمول بها، وقد تشمل الضرائب عندما يقتضي القانون ذلك.",
                    "نبذل عناية معقولة لضمان دقة معلومات الأسعار. وإذا تم اكتشاف خطأ قبل إتمام الطلب، فقد نتواصل معك قبل متابعة العملية.",
                ],
            },
            {
                id: "shipping-delivery",
                title: "الشحن والتوصيل",
                paragraphs: [
                    "تُقدم أوقات التوصيل التقديرية كإرشاد فقط، وقد تختلف بحسب الوجهة وتوافر المنتج والظروف الخارجة عن نطاق سيطرتنا المعقولة.",
                    "ينتقل خطر المنتجات المشتراة وفقاً لترتيبات التسليم المعمول بها وقوانين حماية المستهلك في نطاقك القضائي.",
                ],
            },
            {
                id: "returns-exchanges",
                title: "الإرجاع والاستبدال",
                paragraphs: [
                    "يمكن إرجاع أو استبدال المنتجات المؤهلة خلال المدة المحددة في سياسة الإرجاع، شريطة أن تظل غير مستخدمة وغير مرتداة وفي حالتها الأصلية.",
                    "قد تُستثنى بعض المنتجات المخصصة أو المصنوعة حسب الطلب أو الحساسة من الناحية الصحية من الإرجاع حيثما يسمح القانون بذلك.",
                ],
            },
            {
                id: "intellectual-property",
                title: "الملكية الفكرية",
                paragraphs: [
                    "جميع محتويات هذا الموقع، بما في ذلك العلامات التجارية والصور والتصاميم والنصوص والرسومات ومقاطع الفيديو وعناصر هوية العلامة التجارية، مملوكة لنجيب زاده أو مستخدمة بموجب ترخيص.",
                    "لا يجوز نسخ أي جزء من المحتوى أو إعادة إنتاجه أو توزيعه أو استغلاله تجارياً دون الحصول على إذن كتابي مسبق.",
                ],
            },
            {
                id: "limitation-liability",
                title: "تحديد المسؤولية",
                paragraphs: [
                    "لا يستبعد أي جزء من هذه الشروط أو يحد من أي مسؤولية لا يجوز قانوناً استبعادها أو الحد منها. وفي الحدود التي يسمح بها القانون، لا تتحمل نجيب زاده مسؤولية الخسائر غير المباشرة أو التبعية الناتجة عن استخدام هذا الموقع.",
                    "نسعى إلى تقديم تجربة رقمية دقيقة وموثوقة، لكننا لا نضمن أن يكون الموقع متاحاً دائماً أو خالياً من الأخطاء التقنية.",
                ],
            },
            {
                id: "governing-law",
                title: "القانون الحاكم",
                paragraphs: [
                    "تخضع هذه الشروط للقوانين المطبقة على جهة نجيب زاده المسؤولة عن معاملتك، مع مراعاة أي حماية إلزامية للمستهلك متاحة في نطاقك القضائي.",
                ],
            },
            {
                id: "changes",
                title: "التغييرات على هذه الشروط",
                paragraphs: [
                    "قد نقوم بتحديث هذه الشروط من وقت إلى آخر لتعكس التغييرات في خدماتنا أو عملياتنا أو التزاماتنا القانونية.",
                    "تُعد النسخة المنشورة على هذه الصفحة وقت زيارتك هي النسخة الحالية.",
                ],
            },
            {
                id: "contact",
                title: "تواصل معنا",
                paragraphs: [
                    "إذا كان لديك أي سؤال حول هذه الشروط والأحكام أو طلبك أو تجربتك مع نجيب زاده، فسيسعد فريق خدمة العملاء لدينا بمساعدتك.",
                ],
            },
        ],
    },
};