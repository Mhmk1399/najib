import type { Locale } from "@/lib/i18n/config";

export type CustomerDashboardCopy = {
    metadata: {
        title: string;
        description: string;
    };

    brand: {
        name: string;
        personalSpace: string;
        backToStore: string;
    };

    tabs: {
        ariaLabel: string;
        overview: string;
        orders: string;
        profile: string;
    };

    common: {
        retry: string;
        loading: string;
        fetchError: string;
        itemCountTemplate: string;
        listSeparator: string;
    };

    statuses: {
        pending_inventory: string;
        pending_payment: string;
        payment_failed: string;
        confirmed: string;
        fulfilled: string;
        cancelled: string;
        expired: string;
        refunded: string;
        compensation_required: string;
    };

    journey: {
        ariaLabel: string;
        title: string;
        steps: {
            select: {
                title: string;
                text: string;
            };
            order: {
                title: string;
                text: string;
            };
            preparing: {
                title: string;
                text: string;
            };
            delivery: {
                title: string;
                text: string;
            };
        };
    };

    overview: {
        unavailable: string;
        eyebrow: string;
        titleTemplate: string;
        description: string;
        statsAriaLabel: string;
        stats: {
            allOrders: string;
            activeOrders: string;
            fulfilledOrders: string;
            savedAddresses: string;
        };
        recentEyebrow: string;
        recentTitle: string;
        viewAll: string;
        noOrdersTitle: string;
        noOrdersDescription: string;
        viewProducts: string;
        cartEyebrow: string;
        cartItemCountTemplate: string;
        cartSubtotalLabel: string;
        continueShopping: string;
        emptyCartTitle: string;
        emptyCartDescription: string;
        startShopping: string;
    };

    orders: {
        eyebrow: string;
        title: string;
        statusLabel: string;
        allOrders: string;
        emptyTitle: string;
        emptyDescription: string;
        previousPage: string;
        nextPage: string;
        pageTemplate: string;
        loadingOrder: string;
    };

    orderDetail: {
        eyebrow: string;
        closeAriaLabel: string;
        itemCountTemplate: string;
        skuLabel: string;
        quantityLabel: string;
        colorLabel: string;
        sizeLabel: string;
        subtotalLabel: string;
        shippingLabel: string;
        discountLabel: string;
        totalLabel: string;
    };

    profile: {
        unavailable: string;
        savedNotice: string;
        eyebrow: string;
        title: string;
        refreshingAriaLabel: string;
        description: string;
        firstName: string;
        lastName: string;
        phone: string;
        preferredLanguage: string;
        email: string;
        emailLocked: string;
        saving: string;
        save: string;
        addressEyebrow: string;
        addressTitle: string;
        defaultAddress: string;
        postalCodeLabel: string;
        noAddressTitle: string;
        noAddressDescription: string;
        securityTitle: string;
        securityDescription: string;
    };

    localeNames: Record<Locale, string>;

    currency: {
        toman: string;
    };
};

export const customerDashboardCopy: Record<Locale, CustomerDashboardCopy> = {
    fa: {
        metadata: {
            title: "حساب من | نجیب‌زاده",
            description: "مدیریت سفارش‌ها و مشخصات حساب مشتری نجیب‌زاده",
        },

        brand: {
            name: "NAJIBZADEH",
            personalSpace: "فضای شخصی شما",
            backToStore: "بازگشت به فروشگاه",
        },

        tabs: {
            ariaLabel: "بخش‌های حساب",
            overview: "خلاصه حساب",
            orders: "سفارش‌ها",
            profile: "مشخصات من",
        },

        common: {
            retry: "تلاش دوباره",
            loading: "در حال بارگذاری",
            fetchError: "دریافت اطلاعات انجام نشد.",
            itemCountTemplate: "{count} کالا",
            listSeparator: "، ",
        },

        statuses: {
            pending_inventory: "در انتظار موجودی",
            pending_payment: "در انتظار پرداخت",
            payment_failed: "پرداخت ناموفق",
            confirmed: "تأیید شده",
            fulfilled: "تحویل شده",
            cancelled: "لغو شده",
            expired: "منقضی شده",
            refunded: "بازپرداخت شده",
            compensation_required: "در حال بررسی",
        },

        journey: {
            ariaLabel: "مسیر سفارش",
            title: "مسیر هر خرید در نجیب‌زاده",
            steps: {
                select: {
                    title: "انتخاب",
                    text: "افزودن کالا به سبد",
                },
                order: {
                    title: "ثبت سفارش",
                    text: "تأیید اطلاعات و پرداخت",
                },
                preparing: {
                    title: "آماده‌سازی",
                    text: "بررسی و بسته‌بندی",
                },
                delivery: {
                    title: "تحویل",
                    text: "ارسال به نشانی شما",
                },
            },
        },

        overview: {
            unavailable: "اطلاعات حساب در دسترس نیست.",
            eyebrow: "خوش آمدید",
            titleTemplate: "{name} عزیز، حساب شما آماده است.",
            description:
                "سفارش‌ها، سبد خرید و اطلاعات حساب را از یک فضای امن پیگیری کنید.",
            statsAriaLabel: "آمار حساب",
            stats: {
                allOrders: "همه سفارش‌ها",
                activeOrders: "سفارش فعال",
                fulfilledOrders: "تحویل‌شده",
                savedAddresses: "نشانی ذخیره‌شده",
            },
            recentEyebrow: "آخرین فعالیت",
            recentTitle: "سفارش‌های اخیر",
            viewAll: "مشاهده همه",
            noOrdersTitle: "هنوز سفارشی ثبت نکرده‌اید",
            noOrdersDescription:
                "اولین انتخاب شما می‌تواند شروع یک استایل ماندگار باشد.",
            viewProducts: "مشاهده محصولات",
            cartEyebrow: "سبد خرید جاری",
            cartItemCountTemplate: "{count} کالا",
            cartSubtotalLabel: "جمع سبد:",
            continueShopping: "ادامه خرید",
            emptyCartTitle: "سبد شما خالی است",
            emptyCartDescription:
                "محصولات انتخاب‌شده شما اینجا نمایش داده می‌شوند.",
            startShopping: "شروع خرید",
        },

        orders: {
            eyebrow: "تاریخچه خرید",
            title: "سفارش‌های من",
            statusLabel: "وضعیت",
            allOrders: "همه سفارش‌ها",
            emptyTitle: "سفارشی در این بخش نیست",
            emptyDescription:
                "با تغییر فیلتر یا دیدن محصولات دوباره بررسی کنید.",
            previousPage: "صفحه قبل",
            nextPage: "صفحه بعد",
            pageTemplate: "صفحه {page} از {pages}",
            loadingOrder: "در حال دریافت سفارش",
        },

        orderDetail: {
            eyebrow: "جزئیات سفارش",
            closeAriaLabel: "بستن جزئیات",
            itemCountTemplate: "{count} کالا",
            skuLabel: "SKU",
            quantityLabel: "تعداد",
            colorLabel: "رنگ",
            sizeLabel: "سایز",
            subtotalLabel: "جمع کالاها",
            shippingLabel: "ارسال",
            discountLabel: "تخفیف",
            totalLabel: "مبلغ نهایی",
        },

        profile: {
            unavailable: "مشخصات حساب در دسترس نیست.",
            savedNotice: "تغییرات با موفقیت ذخیره شد.",
            eyebrow: "اطلاعات حساب",
            title: "مشخصات من",
            refreshingAriaLabel: "در حال به‌روزرسانی مشخصات",
            description:
                "اطلاعات تماس خود را دقیق نگه دارید تا هماهنگی سفارش‌ها آسان‌تر باشد.",
            firstName: "نام",
            lastName: "نام خانوادگی",
            phone: "شماره تماس",
            preferredLanguage: "زبان ترجیحی",
            email: "ایمیل",
            emailLocked: "ایمیل ورود از این بخش قابل تغییر نیست.",
            saving: "در حال ذخیره…",
            save: "ذخیره تغییرات",
            addressEyebrow: "دفترچه نشانی",
            addressTitle: "نشانی‌های ذخیره‌شده",
            defaultAddress: "پیش‌فرض",
            postalCodeLabel: "کد پستی:",
            noAddressTitle: "نشانی‌ای ذخیره نشده است",
            noAddressDescription: "نشانی ارسال هنگام ثبت سفارش قابل افزودن است.",
            securityTitle: "امنیت حساب",
            securityDescription:
                "اطلاعات این صفحه فقط پس از تأیید نشست امن شما دریافت می‌شود.",
        },

        localeNames: {
            fa: "فارسی",
            en: "English",
            ar: "العربية",
        },

        currency: {
            toman: "تومان",
        },
    },

    en: {
        metadata: {
            title: "My Account | Najibzadeh",
            description: "Manage your Najibzadeh orders and customer account details.",
        },

        brand: {
            name: "NAJIBZADEH",
            personalSpace: "Your private space",
            backToStore: "Back to Store",
        },

        tabs: {
            ariaLabel: "Account sections",
            overview: "Account Overview",
            orders: "Orders",
            profile: "My Profile",
        },

        common: {
            retry: "Try Again",
            loading: "Loading",
            fetchError: "Unable to retrieve information.",
            itemCountTemplate: "{count} items",
            listSeparator: ", ",
        },

        statuses: {
            pending_inventory: "Awaiting Inventory",
            pending_payment: "Awaiting Payment",
            payment_failed: "Payment Failed",
            confirmed: "Confirmed",
            fulfilled: "Delivered",
            cancelled: "Cancelled",
            expired: "Expired",
            refunded: "Refunded",
            compensation_required: "Under Review",
        },

        journey: {
            ariaLabel: "Order journey",
            title: "The journey of every Najibzadeh order",
            steps: {
                select: {
                    title: "Selection",
                    text: "Add products to your bag",
                },
                order: {
                    title: "Place Order",
                    text: "Confirm details and payment",
                },
                preparing: {
                    title: "Preparation",
                    text: "Review and packaging",
                },
                delivery: {
                    title: "Delivery",
                    text: "Shipped to your address",
                },
            },
        },

        overview: {
            unavailable: "Your account information is currently unavailable.",
            eyebrow: "Welcome",
            titleTemplate: "{name}, your account is ready.",
            description:
                "Track your orders, shopping bag, and account information from one secure space.",
            statsAriaLabel: "Account statistics",
            stats: {
                allOrders: "All Orders",
                activeOrders: "Active Orders",
                fulfilledOrders: "Delivered",
                savedAddresses: "Saved Addresses",
            },
            recentEyebrow: "Latest Activity",
            recentTitle: "Recent Orders",
            viewAll: "View All",
            noOrdersTitle: "You have not placed an order yet",
            noOrdersDescription:
                "Your first selection can be the beginning of an enduring wardrobe.",
            viewProducts: "View Products",
            cartEyebrow: "Current Bag",
            cartItemCountTemplate: "{count} items",
            cartSubtotalLabel: "Bag subtotal:",
            continueShopping: "Continue Shopping",
            emptyCartTitle: "Your bag is empty",
            emptyCartDescription: "Products you select will appear here.",
            startShopping: "Start Shopping",
        },

        orders: {
            eyebrow: "Purchase History",
            title: "My Orders",
            statusLabel: "Status",
            allOrders: "All Orders",
            emptyTitle: "There are no orders in this section",
            emptyDescription:
                "Try changing the filter or browse the collection and check again.",
            previousPage: "Previous",
            nextPage: "Next",
            pageTemplate: "Page {page} of {pages}",
            loadingOrder: "Loading order",
        },

        orderDetail: {
            eyebrow: "Order Details",
            closeAriaLabel: "Close order details",
            itemCountTemplate: "{count} items",
            skuLabel: "SKU",
            quantityLabel: "Quantity",
            colorLabel: "Color",
            sizeLabel: "Size",
            subtotalLabel: "Subtotal",
            shippingLabel: "Shipping",
            discountLabel: "Discount",
            totalLabel: "Total",
        },

        profile: {
            unavailable: "Your account details are currently unavailable.",
            savedNotice: "Your changes were saved successfully.",
            eyebrow: "Account Information",
            title: "My Profile",
            refreshingAriaLabel: "Refreshing profile",
            description:
                "Keep your contact information accurate to make order coordination easier.",
            firstName: "First Name",
            lastName: "Last Name",
            phone: "Phone",
            preferredLanguage: "Preferred Language",
            email: "Email",
            emailLocked: "Your sign-in email cannot be changed here.",
            saving: "Saving…",
            save: "Save Changes",
            addressEyebrow: "Address Book",
            addressTitle: "Saved Addresses",
            defaultAddress: "Default",
            postalCodeLabel: "Postal code:",
            noAddressTitle: "No address has been saved",
            noAddressDescription: "A shipping address can be added during checkout.",
            securityTitle: "Account Security",
            securityDescription:
                "Information on this page is retrieved only after your secure session has been verified.",
        },

        localeNames: {
            fa: "Persian",
            en: "English",
            ar: "Arabic",
        },

        currency: {
            toman: "Toman",
        },
    },

    ar: {
        metadata: {
            title: "حسابي | نجيب زاده",
            description: "إدارة طلباتك وبيانات حسابك لدى نجيب زاده.",
        },

        brand: {
            name: "NAJIBZADEH",
            personalSpace: "مساحتك الخاصة",
            backToStore: "العودة إلى المتجر",
        },

        tabs: {
            ariaLabel: "أقسام الحساب",
            overview: "ملخص الحساب",
            orders: "الطلبات",
            profile: "ملفي الشخصي",
        },

        common: {
            retry: "المحاولة مرة أخرى",
            loading: "جارٍ التحميل",
            fetchError: "تعذر استرداد المعلومات.",
            itemCountTemplate: "{count} قطعة",
            listSeparator: "، ",
        },

        statuses: {
            pending_inventory: "في انتظار التوفر",
            pending_payment: "في انتظار الدفع",
            payment_failed: "فشل الدفع",
            confirmed: "تم التأكيد",
            fulfilled: "تم التسليم",
            cancelled: "ملغى",
            expired: "منتهي الصلاحية",
            refunded: "تم رد المبلغ",
            compensation_required: "قيد المراجعة",
        },

        journey: {
            ariaLabel: "مسار الطلب",
            title: "رحلة كل طلب لدى نجيب زاده",
            steps: {
                select: {
                    title: "الاختيار",
                    text: "إضافة المنتجات إلى السلة",
                },
                order: {
                    title: "تأكيد الطلب",
                    text: "تأكيد البيانات والدفع",
                },
                preparing: {
                    title: "التجهيز",
                    text: "المراجعة والتغليف",
                },
                delivery: {
                    title: "التسليم",
                    text: "الإرسال إلى عنوانك",
                },
            },
        },

        overview: {
            unavailable: "معلومات الحساب غير متاحة حالياً.",
            eyebrow: "مرحباً",
            titleTemplate: "{name}، حسابك جاهز.",
            description:
                "تابع طلباتك وسلة التسوق ومعلومات حسابك من مساحة واحدة آمنة.",
            statsAriaLabel: "إحصاءات الحساب",
            stats: {
                allOrders: "جميع الطلبات",
                activeOrders: "الطلبات النشطة",
                fulfilledOrders: "تم التسليم",
                savedAddresses: "العناوين المحفوظة",
            },
            recentEyebrow: "آخر النشاطات",
            recentTitle: "الطلبات الأخيرة",
            viewAll: "عرض الكل",
            noOrdersTitle: "لم تقم بأي طلب بعد",
            noOrdersDescription:
                "قد يكون اختيارك الأول بداية لإطلالة تدوم طويلاً.",
            viewProducts: "عرض المنتجات",
            cartEyebrow: "سلة التسوق الحالية",
            cartItemCountTemplate: "{count} قطعة",
            cartSubtotalLabel: "مجموع السلة:",
            continueShopping: "متابعة التسوق",
            emptyCartTitle: "سلتك فارغة",
            emptyCartDescription: "ستظهر المنتجات التي تختارها هنا.",
            startShopping: "ابدأ التسوق",
        },

        orders: {
            eyebrow: "سجل المشتريات",
            title: "طلباتي",
            statusLabel: "الحالة",
            allOrders: "جميع الطلبات",
            emptyTitle: "لا توجد طلبات في هذا القسم",
            emptyDescription:
                "جرّب تغيير الفلتر أو تصفح المنتجات ثم تحقق مرة أخرى.",
            previousPage: "السابق",
            nextPage: "التالي",
            pageTemplate: "الصفحة {page} من {pages}",
            loadingOrder: "جارٍ تحميل الطلب",
        },

        orderDetail: {
            eyebrow: "تفاصيل الطلب",
            closeAriaLabel: "إغلاق تفاصيل الطلب",
            itemCountTemplate: "{count} قطعة",
            skuLabel: "SKU",
            quantityLabel: "الكمية",
            colorLabel: "اللون",
            sizeLabel: "المقاس",
            subtotalLabel: "مجموع المنتجات",
            shippingLabel: "الشحن",
            discountLabel: "الخصم",
            totalLabel: "المبلغ النهائي",
        },

        profile: {
            unavailable: "بيانات الحساب غير متاحة حالياً.",
            savedNotice: "تم حفظ التغييرات بنجاح.",
            eyebrow: "معلومات الحساب",
            title: "ملفي الشخصي",
            refreshingAriaLabel: "جارٍ تحديث الملف الشخصي",
            description:
                "حافظ على دقة معلومات التواصل لتسهيل تنسيق طلباتك.",
            firstName: "الاسم",
            lastName: "اسم العائلة",
            phone: "رقم الهاتف",
            preferredLanguage: "اللغة المفضلة",
            email: "البريد الإلكتروني",
            emailLocked: "لا يمكن تغيير بريد تسجيل الدخول من هذا القسم.",
            saving: "جارٍ الحفظ…",
            save: "حفظ التغييرات",
            addressEyebrow: "دفتر العناوين",
            addressTitle: "العناوين المحفوظة",
            defaultAddress: "افتراضي",
            postalCodeLabel: "الرمز البريدي:",
            noAddressTitle: "لا يوجد عنوان محفوظ",
            noAddressDescription: "يمكن إضافة عنوان الشحن أثناء إتمام الطلب.",
            securityTitle: "أمان الحساب",
            securityDescription:
                "لا يتم استرداد معلومات هذه الصفحة إلا بعد التحقق من جلستك الآمنة.",
        },

        localeNames: {
            fa: "الفارسية",
            en: "الإنجليزية",
            ar: "العربية",
        },

        currency: {
            toman: "تومان",
        },
    },
};
