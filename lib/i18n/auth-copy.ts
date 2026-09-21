import type { Locale } from "@/lib/i18n/config";

export type AuthCopy = {
    metadata: {
        title: string;
        description: string;
    };

    brand: {
        name: string;
        accountEyebrow: string;
        backToShop: string;
    };

    modes: {
        ariaLabel: string;

        login: {
            tab: string;
            title: string;
            description: string;
            submit: string;
            failure: string;
        };

        signup: {
            tab: string;
            title: string;
            description: string;
            submit: string;
            failure: string;
        };
    };

    session: {
        restoring: string;
        checking: string;
        secureNotice: string;
    };

    fields: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
        confirmPassword: string;

        optional: string;
        passwordMeta: string;

        emailPlaceholder: string;
        phonePlaceholder: string;
    };

    validation: {
        firstNameRequired: string;
        lastNameRequired: string;
        phoneInvalid: string;
        confirmPasswordRequired: string;
        passwordsMismatch: string;
        emailRequired: string;
        emailInvalid: string;
        passwordRequired: string;
        passwordMinLength: string;
    };

    submit: {
        checking: string;
        serviceUnavailable: string;
    };

    apiErrors: {
        invalidCredentials: string;
        emailAlreadyExists: string;
        accountDisabled: string;
        accountLocked: string;
        rateLimited: string;
        sessionExpired: string;
        generic: string;
    };

    visual: {
        ariaLabel: string;
        imageAlt: string;
        accountLabel: string;
        eyebrow: string;
        titleLine1: string;
        titleLine2: string;
        customerAccount: string;
        adminAccess: string;
    };
};

export const authCopy: Record<Locale, AuthCopy> = {
    fa: {
        metadata: {
            title: "ورود و ثبت‌نام | نجیب‌زاده",
            description: "ورود یا ساخت حساب کاربری نجیب‌زاده",
        },

        brand: {
            name: "NAJIBZADEH",
            accountEyebrow: "حساب نجیب‌زاده",
            backToShop: "بازگشت به فروشگاه",
        },

        modes: {
            ariaLabel: "انتخاب ورود یا ثبت‌نام",

            login: {
                tab: "ورود",
                title: "خوش آمدید.",
                description:
                    "با یک حساب، به فضای شخصی یا پنل مدیریت خود وارد شوید.",
                submit: "ورود به حساب",
                failure:
                    "ورود انجام نشد. اطلاعات خود را بررسی کنید.",
            },

            signup: {
                tab: "ثبت‌نام",
                title: "به جمع ما بپیوندید.",
                description:
                    "حساب شخصی خود را بسازید و خریدها، نشانی‌ها و تجربه اختصاصی را در یک‌جا دنبال کنید.",
                submit: "ساخت حساب شخصی",
                failure:
                    "ثبت‌نام انجام نشد. دوباره تلاش کنید.",
            },
        },

        session: {
            restoring: "در حال بازیابی حساب شما",
            checking: "بررسی نشست امن…",
            secureNotice:
                "نشست شما در مرورگر و با کوکی امن نگهداری می‌شود.",
        },

        fields: {
            firstName: "نام",
            lastName: "نام خانوادگی",
            email: "ایمیل",
            phone: "شماره تماس",
            password: "رمز عبور",
            confirmPassword: "تکرار رمز عبور",

            optional: "اختیاری",
            passwordMeta: "حداقل ۱۲ کاراکتر",

            emailPlaceholder: "name@example.com",
            phonePlaceholder: "09xxxxxxxxx",
        },

        validation: {
            firstNameRequired: "نام را وارد کنید.",
            lastNameRequired: "نام خانوادگی را وارد کنید.",
            phoneInvalid: "شماره تماس را کامل وارد کنید.",
            confirmPasswordRequired:
                "تکرار رمز عبور را وارد کنید.",
            passwordsMismatch:
                "تکرار رمز عبور یکسان نیست.",
            emailRequired: "ایمیل خود را وارد کنید.",
            emailInvalid: "یک ایمیل معتبر وارد کنید.",
            passwordRequired: "رمز عبور را وارد کنید.",
            passwordMinLength:
                "رمز عبور باید دست‌کم ۱۲ کاراکتر باشد.",
        },

        submit: {
            checking: "در حال بررسی…",
            serviceUnavailable:
                "سرویس حساب کاربری موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.",
        },

        apiErrors: {
            invalidCredentials:
                "ایمیل یا رمز عبور صحیح نیست.",
            emailAlreadyExists:
                "برای این ایمیل قبلاً حسابی ثبت شده است.",
            accountDisabled:
                "این حساب در حال حاضر غیرفعال است.",
            accountLocked:
                "دسترسی به این حساب موقتاً محدود شده است.",
            rateLimited:
                "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.",
            sessionExpired:
                "نشست شما منقضی شده است. دوباره وارد حساب شوید.",
            generic:
                "انجام عملیات امکان‌پذیر نبود. دوباره تلاش کنید.",
        },

        visual: {
            ariaLabel: "نجیب‌زاده، وقار در سکوت",
            imageAlt: "پوشاک مردانه نجیب‌زاده",
            accountLabel: "حساب یکپارچه",
            eyebrow: "وقار در سکوت",
            titleLine1: "یک ورودی،",
            titleLine2: "فضای مخصوص شما.",
            customerAccount: "حساب مشتری",
            adminAccess: "دسترسی مدیریت",
        },
    },

    en: {
        metadata: {
            title: "Sign In & Register | Najibzadeh",
            description:
                "Sign in to your Najibzadeh account or create a new account.",
        },

        brand: {
            name: "NAJIBZADEH",
            accountEyebrow: "Najibzadeh Account",
            backToShop: "Back to Store",
        },

        modes: {
            ariaLabel: "Choose sign in or registration",

            login: {
                tab: "Sign In",
                title: "Welcome back.",
                description:
                    "Use one account to access your personal space or management panel.",
                submit: "Sign In",
                failure:
                    "We could not sign you in. Please check your details.",
            },

            signup: {
                tab: "Register",
                title: "Join Najibzadeh.",
                description:
                    "Create your personal account and keep your purchases, addresses, and tailored experience together in one place.",
                submit: "Create Account",
                failure:
                    "We could not create your account. Please try again.",
            },
        },

        session: {
            restoring: "Restoring your account",
            checking: "Checking your secure session…",
            secureNotice:
                "Your session is securely maintained in your browser using a secure cookie.",
        },

        fields: {
            firstName: "First Name",
            lastName: "Last Name",
            email: "Email",
            phone: "Phone",
            password: "Password",
            confirmPassword: "Confirm Password",

            optional: "Optional",
            passwordMeta: "Minimum 12 characters",

            emailPlaceholder: "name@example.com",
            phonePlaceholder: "+44 0000 000000",
        },

        validation: {
            firstNameRequired:
                "Please enter your first name.",
            lastNameRequired:
                "Please enter your last name.",
            phoneInvalid:
                "Please enter a complete phone number.",
            confirmPasswordRequired:
                "Please confirm your password.",
            passwordsMismatch:
                "The passwords do not match.",
            emailRequired:
                "Please enter your email address.",
            emailInvalid:
                "Please enter a valid email address.",
            passwordRequired:
                "Please enter your password.",
            passwordMinLength:
                "Your password must contain at least 12 characters.",
        },

        submit: {
            checking: "Checking…",
            serviceUnavailable:
                "The account service is temporarily unavailable. Please try again shortly.",
        },

        apiErrors: {
            invalidCredentials:
                "The email or password you entered is incorrect.",
            emailAlreadyExists:
                "An account already exists for this email address.",
            accountDisabled:
                "This account is currently disabled.",
            accountLocked:
                "Access to this account is temporarily restricted.",
            rateLimited:
                "Too many requests have been made. Please try again shortly.",
            sessionExpired:
                "Your session has expired. Please sign in again.",
            generic:
                "We could not complete your request. Please try again.",
        },

        visual: {
            ariaLabel:
                "Najibzadeh, refinement in silence",
            imageAlt: "Najibzadeh menswear",
            accountLabel: "Unified Account",
            eyebrow: "Refinement in Silence",
            titleLine1: "One account,",
            titleLine2: "your private space.",
            customerAccount: "Client Account",
            adminAccess: "Management Access",
        },
    },

    ar: {
        metadata: {
            title: "تسجيل الدخول وإنشاء حساب | نجيب زاده",
            description:
                "تسجيل الدخول إلى حساب نجيب زاده أو إنشاء حساب جديد.",
        },

        brand: {
            name: "NAJIBZADEH",
            accountEyebrow: "حساب نجيب زاده",
            backToShop: "العودة إلى المتجر",
        },

        modes: {
            ariaLabel:
                "اختيار تسجيل الدخول أو إنشاء حساب",

            login: {
                tab: "تسجيل الدخول",
                title: "مرحباً بعودتك.",
                description:
                    "استخدم حساباً واحداً للوصول إلى مساحتك الشخصية أو لوحة الإدارة.",
                submit: "تسجيل الدخول",
                failure:
                    "تعذر تسجيل الدخول. يرجى التحقق من بياناتك.",
            },

            signup: {
                tab: "إنشاء حساب",
                title: "انضم إلى نجيب زاده.",
                description:
                    "أنشئ حسابك الشخصي وتابع مشترياتك وعناوينك وتجربتك الخاصة في مكان واحد.",
                submit: "إنشاء حساب شخصي",
                failure:
                    "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.",
            },
        },

        session: {
            restoring: "جارٍ استعادة حسابك",
            checking: "جارٍ التحقق من الجلسة الآمنة…",
            secureNotice:
                "يتم الاحتفاظ بجلستك بأمان في المتصفح باستخدام ملف تعريف ارتباط آمن.",
        },

        fields: {
            firstName: "الاسم",
            lastName: "اسم العائلة",
            email: "البريد الإلكتروني",
            phone: "رقم الهاتف",
            password: "كلمة المرور",
            confirmPassword: "تأكيد كلمة المرور",

            optional: "اختياري",
            passwordMeta: "12 حرفاً على الأقل",

            emailPlaceholder: "name@example.com",
            phonePlaceholder: "+971 00 000 0000",
        },

        validation: {
            firstNameRequired: "يرجى إدخال الاسم.",
            lastNameRequired:
                "يرجى إدخال اسم العائلة.",
            phoneInvalid:
                "يرجى إدخال رقم هاتف كاملاً.",
            confirmPasswordRequired:
                "يرجى تأكيد كلمة المرور.",
            passwordsMismatch:
                "كلمتا المرور غير متطابقتين.",
            emailRequired:
                "يرجى إدخال البريد الإلكتروني.",
            emailInvalid:
                "يرجى إدخال بريد إلكتروني صالح.",
            passwordRequired:
                "يرجى إدخال كلمة المرور.",
            passwordMinLength:
                "يجب ألا تقل كلمة المرور عن 12 حرفاً.",
        },

        submit: {
            checking: "جارٍ التحقق…",
            serviceUnavailable:
                "خدمة الحساب غير متاحة مؤقتاً. يرجى المحاولة مرة أخرى بعد قليل.",
        },

        apiErrors: {
            invalidCredentials:
                "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
            emailAlreadyExists:
                "يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني.",
            accountDisabled:
                "هذا الحساب غير نشط حالياً.",
            accountLocked:
                "تم تقييد الوصول إلى هذا الحساب مؤقتاً.",
            rateLimited:
                "تم إرسال عدد كبير من الطلبات. يرجى المحاولة مرة أخرى بعد قليل.",
            sessionExpired:
                "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.",
            generic:
                "تعذر إكمال العملية. يرجى المحاولة مرة أخرى.",
        },

        visual: {
            ariaLabel: "نجيب زاده، أناقة بلا ضجيج",
            imageAlt: "أزياء رجالية من نجيب زاده",
            accountLabel: "حساب موحد",
            eyebrow: "أناقة بلا ضجيج",
            titleLine1: "حساب واحد،",
            titleLine2: "مساحتك الخاصة.",
            customerAccount: "حساب العميل",
            adminAccess: "الوصول الإداري",
        },
    },
};