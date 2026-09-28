import mongoose from "mongoose";

const localized = (fa, en, ar) => ({ fa, en, ar });

const categories = [
  {
    slug: "trousers",
    name: localized("شلوار", "Trousers", "السراويل"),
    description: localized(
      "شلوارهای مردانه نجیب‌زاده با برش دقیق، پارچه‌های خوش‌فرم و تناسبی ماندگار برای استایل رسمی و روزمره.",
      "Najibzadeh trousers with precise cuts, composed fabrics, and enduring proportions for formal and everyday dressing.",
      "سراويل رجالية من نجيب زاده بقصات دقيقة وأقمشة متقنة وتناسب مدروس للإطلالات الرسمية واليومية.",
    ),
    primaryBanner: {
      eyebrow: localized("خیاطی روزمره", "Everyday Tailoring", "خياطة يومية"),
      heading: localized(
        "خطی دقیق برای هر قدم",
        "A precise line for every step",
        "خط دقيق يرافق كل خطوة",
      ),
      body: localized(
        "از فرم کمر تا افت پارچه، هر جزئیات برای ساختن ظاهری متعادل، راحت و منظم انتخاب شده است.",
        "From the waistband to the fall of the fabric, every detail is considered for a balanced, comfortable, and composed silhouette.",
        "من تصميم الخصر إلى انسياب القماش، اختيرت كل التفاصيل لتمنحك إطلالة متوازنة ومريحة ومتقنة.",
      ),
      ctaLabel: localized("مشاهده شلوارها", "View trousers", "تصفح السراويل"),
    },
    primaryDescription: {
      heading: localized(
        "تناسبی که از کمر تا پا ادامه دارد",
        "Proportion from waist to hem",
        "تناسق يبدأ من الخصر ويصل إلى الحافة",
      ),
      body: localized(
        "یک شلوار خوب باید هنگام ایستادن خطی تمیز داشته باشد و در حرکت آزادی کافی بدهد. در مجموعه نجیب‌زاده، ارتفاع فاق، پهنای ران و شکست دمپا در کنار وزن پارچه سنجیده می‌شوند تا شلوار با کت، پیراهن یا بافت سبک به‌سادگی هماهنگ شود.",
        "A good pair of trousers should hold a clean line while standing and move with ease throughout the day. Najibzadeh considers rise, thigh room, hem break, and fabric weight together, creating trousers that pair naturally with tailoring, shirts, and fine knitwear.",
        "يجب أن يحافظ البنطال الجيد على خط أنيق عند الوقوف وأن يمنح حرية الحركة طوال اليوم. في نجيب زاده نراعي ارتفاع الخصر واتساع الفخذ وانسياب الحافة ووزن القماش لتنسجم السراويل بسهولة مع السترات والقمصان والتريكو الناعم.",
      ),
    },
    secondaryBanner: {
      eyebrow: localized("فرم ماندگار", "Enduring Form", "قصة تدوم"),
      heading: localized(
        "از جلسه صبح تا قرار شب",
        "From the morning meeting to the evening",
        "من اجتماع الصباح إلى موعد المساء",
      ),
      body: localized(
        "رنگ‌های عمیق و برش‌های سنجیده، شلوار را به پایه‌ای قابل اتکا برای چندین ترکیب متفاوت تبدیل می‌کنند.",
        "Deep tones and considered cuts make each pair a dependable foundation for several distinct looks.",
        "تجعل الدرجات العميقة والقصات المدروسة كل بنطال أساساً موثوقاً لتنسيقات متعددة.",
      ),
      ctaLabel: localized("کشف مجموعه", "Explore the collection", "اكتشف المجموعة"),
    },
    secondaryDescription: {
      heading: localized(
        "پایه‌ای آرام برای استایل مردانه",
        "The quiet foundation of menswear",
        "الأساس الهادئ للأناقة الرجالية",
      ),
      body: localized(
        "برای یک کمد منعطف، از شلوارهای ذغالی، سرمه‌ای و مشکی شروع کنید. پارچه‌های صاف برای موقعیت رسمی و بافت‌های نرم‌تر برای روزهای نیمه‌رسمی، امکان ساختن استایل‌های متعدد را بدون شلوغی فراهم می‌کنند.",
        "Build a flexible wardrobe around charcoal, navy, and black trousers. Smooth fabrics serve formal settings, while softer textures relax the look, allowing a small edit of pieces to work across many occasions.",
        "ابدأ خزانة مرنة بسراويل فحمية وكحلية وسوداء. تناسب الأقمشة الناعمة المناسبات الرسمية، بينما تمنح الخامات الأكثر ليونة طابعاً هادئاً يسمح بتنسيقات متعددة دون ازدحام.",
      ),
    },
    seoTitle: localized(
      "شلوار مردانه نجیب‌زاده | رسمی و روزمره",
      "Najibzadeh Men's Trousers | Formal & Everyday",
      "سراويل رجالية من نجيب زاده | رسمية ويومية",
    ),
    seoDescription: localized(
      "خرید شلوار مردانه نجیب‌زاده با برش دقیق، پارچه باکیفیت و فرم ماندگار برای استایل رسمی، نیمه‌رسمی و روزمره.",
      "Shop Najibzadeh men's trousers with precise cuts, premium fabrics, and refined proportions for formal and everyday style.",
      "تسوق سراويل نجيب زاده الرجالية بقصات دقيقة وأقمشة فاخرة للإطلالات الرسمية واليومية.",
    ),
  },
  {
    slug: "shoes",
    name: localized("کفش", "Shoes", "الأحذية"),
    description: localized(
      "کفش‌های مردانه نجیب‌زاده با فرم ماندگار و جزئیات دقیق برای کامل کردن استایل رسمی و روزمره.",
      "Najibzadeh men's shoes with enduring form and precise details for polished formal and everyday looks.",
      "أحذية رجالية من نجيب زاده بتصميم خالد وتفاصيل دقيقة لإكمال الإطلالات الرسمية واليومية.",
    ),
    primaryBanner: {
      eyebrow: localized("گام نهایی استایل", "The Finishing Step", "الخطوة الأخيرة للإطلالة"),
      heading: localized(
        "کفشی که حضور را کامل می‌کند",
        "Shoes that complete the presence",
        "حذاء يكمل حضورك",
      ),
      body: localized(
        "فرم متعادل، چرم خوش‌ساخت و جزئیاتی سنجیده؛ برای قدم‌هایی که باید به‌اندازه ظاهر شما مطمئن باشند.",
        "Balanced form, refined leather, and considered details for steps that feel as assured as the rest of your look.",
        "تصميم متوازن وجلد متقن وتفاصيل مدروسة لخطوات واثقة توازي أناقة إطلالتك.",
      ),
      ctaLabel: localized("مشاهده کفش‌ها", "View shoes", "تصفح الأحذية"),
    },
    primaryDescription: {
      heading: localized(
        "از پنجه تا پاشنه، با دقت",
        "Considered from toe to heel",
        "عناية من المقدمة إلى الكعب",
      ),
      body: localized(
        "کفش مناسب فقط پایان استایل نیست؛ تعادل آن را مشخص می‌کند. تناسب پنجه، ارتفاع پاشنه، انعطاف زیره و پرداخت چرم در کنار هم انتخاب می‌شوند تا کفش در استفاده طولانی راحت بماند و با گذر زمان شخصیت بیشتری پیدا کند.",
        "The right shoe does more than finish a look; it defines its balance. Toe shape, heel height, sole flexibility, and leather finish are considered together so every pair remains comfortable and gains character over time.",
        "الحذاء المناسب لا يكتفي بإكمال الإطلالة بل يحدد توازنها. نراعي شكل المقدمة وارتفاع الكعب ومرونة النعل وتشطيب الجلد ليحافظ الحذاء على راحته ويكتسب طابعاً أجمل مع الوقت.",
      ),
    },
    secondaryBanner: {
      eyebrow: localized("ساخت و پرداخت", "Craft & Finish", "حرفة وتشطيب"),
      heading: localized(
        "وقار در هر قدم",
        "Composure in every step",
        "أناقة في كل خطوة",
      ),
      body: localized(
        "از آکسفورد رسمی تا مدل‌های منعطف‌تر، هر انتخاب برای هماهنگی با شلوار و کت‌های نجیب‌زاده شکل گرفته است.",
        "From formal Oxfords to more relaxed silhouettes, each pair is selected to work naturally with Najibzadeh tailoring.",
        "من أحذية أكسفورد الرسمية إلى التصاميم الأكثر مرونة، اختير كل زوج ليتناغم مع خياطة نجيب زاده.",
      ),
      ctaLabel: localized("انتخاب کفش", "Choose your pair", "اختر حذاءك"),
    },
    secondaryDescription: {
      heading: localized(
        "کفش مناسب برای موقعیت مناسب",
        "The right pair for the occasion",
        "الحذاء المناسب لكل مناسبة",
      ),
      body: localized(
        "برای مراسم رسمی، چرم صاف و فرم کشیده انتخابی مطمئن است. برای استفاده روزانه، زیره منعطف و پنجه راحت اهمیت بیشتری دارد. رنگ کفش را با کمربند و عمق رنگ شلوار هماهنگ کنید تا استایل یکپارچه بماند.",
        "Smooth leather and an elongated profile suit formal occasions, while flexible soles and roomier shapes serve everyday wear. Coordinate the leather tone with your belt and trousers to keep the look coherent.",
        "يناسب الجلد الأملس والتصميم الممتد المناسبات الرسمية، بينما تلائم النعال المرنة والقوالب المريحة الاستخدام اليومي. نسق لون الجلد مع الحزام والبنطال لتحافظ على وحدة الإطلالة.",
      ),
    },
    seoTitle: localized(
      "کفش مردانه نجیب‌زاده | رسمی و چرمی",
      "Najibzadeh Men's Shoes | Formal Leather Footwear",
      "أحذية رجالية من نجيب زاده | أحذية جلدية رسمية",
    ),
    seoDescription: localized(
      "خرید کفش مردانه نجیب‌زاده با چرم باکیفیت، فرم ماندگار و طراحی دقیق برای استایل رسمی و روزمره.",
      "Discover Najibzadeh men's shoes with refined leather, enduring form, and considered design for formal and everyday wear.",
      "اكتشف أحذية نجيب زاده الرجالية بجلد فاخر وتصميم متقن للإطلالات الرسمية واليومية.",
    ),
  },
  {
    slug: "sport-coats",
    name: localized("کت تک", "Sport Coats", "السترات المنفصلة"),
    description: localized(
      "کت‌های تک نجیب‌زاده با ساختار دقیق و فرم منعطف برای استایل رسمی، نیمه‌رسمی و روزمره.",
      "Najibzadeh sport coats with refined structure and flexible silhouettes for formal and smart-casual dressing.",
      "سترات منفصلة من نجيب زاده ببنية متقنة وقصات مرنة للإطلالات الرسمية وشبه الرسمية.",
    ),
    primaryBanner: {
      eyebrow: localized("خیاطی منعطف", "Flexible Tailoring", "خياطة مرنة"),
      heading: localized(
        "ساختار کت، آزادی انتخاب",
        "Tailored structure, freedom to style",
        "بنية مصممة وحرية في التنسيق",
      ),
      body: localized(
        "کت تک، وقار خیاطی را با آزادی ترکیب همراه می‌کند؛ از جلسه کاری تا یک قرار عصرگاهی.",
        "A sport coat brings tailored composure with the freedom to dress it up or down, from business hours to evening plans.",
        "تجمع السترة المنفصلة بين أناقة الخياطة وحرية التنسيق، من ساعات العمل إلى مواعيد المساء.",
      ),
      ctaLabel: localized("مشاهده کت‌ها", "View sport coats", "تصفح السترات"),
    },
    primaryDescription: {
      heading: localized(
        "میان رسمیت و راحتی",
        "Between formal and relaxed",
        "بين الرسمية والراحة",
      ),
      body: localized(
        "کت تک زمانی بهترین عملکرد را دارد که خط شانه مرتب بماند اما بدن در آن آزاد حرکت کند. ساختار داخلی سبک، طول متعادل و پارچه‌های قابل ترکیب باعث می‌شوند یک کت کنار شلوار رسمی، کتان یا پیراهن ساده شخصیت متفاوتی پیدا کند.",
        "A sport coat works best when the shoulder remains clean while the body moves freely. Light internal structure, balanced length, and versatile fabrics allow one jacket to shift naturally between tailored trousers, chinos, and an open-collar shirt.",
        "تنجح السترة المنفصلة عندما يبقى خط الكتف أنيقاً مع حرية الحركة. تمنحها البنية الداخلية الخفيفة والطول المتوازن والأقمشة سهلة التنسيق قدرة على الانسجام مع السراويل الرسمية أو القطنية والقمصان المفتوحة الياقة.",
      ),
    },
    secondaryBanner: {
      eyebrow: localized("یک کت، چند موقعیت", "One Jacket, Many Settings", "سترة واحدة لمناسبات متعددة"),
      heading: localized(
        "استایلی که با روز تغییر می‌کند",
        "A look that moves with the day",
        "إطلالة تتغير مع يومك",
      ),
      body: localized(
        "با تغییر پیراهن، شلوار و کفش، همان کت از رسمی به روزمره می‌رسد و انسجام خود را حفظ می‌کند.",
        "Change the shirt, trousers, and shoes, and the same jacket moves from formal to relaxed without losing its composure.",
        "بتغيير القميص والبنطال والحذاء، تنتقل السترة نفسها من الرسمية إلى الإطلالة اليومية مع الحفاظ على أناقتها.",
      ),
      ctaLabel: localized("ساختن استایل", "Build the look", "نسق الإطلالة"),
    },
    secondaryDescription: {
      heading: localized(
        "انتخابی برای کمد منعطف",
        "An anchor for a flexible wardrobe",
        "قطعة أساسية لخزانة مرنة",
      ),
      body: localized(
        "برای بیشترین کاربرد، سراغ رنگ‌های سرمه‌ای، ذغالی یا قهوه‌ای عمیق بروید. بافت پارچه می‌تواند کت را آرام‌تر یا رسمی‌تر نشان دهد؛ اما تناسب شانه و قد آستین همیشه باید دقیق بماند.",
        "For maximum versatility, begin with navy, charcoal, or deep brown. Texture can make the jacket feel more relaxed or more formal, but shoulder fit and sleeve length should always remain precise.",
        "لأكبر قدر من المرونة، ابدأ بالكحلي أو الفحمي أو البني العميق. يمكن لملمس القماش أن يجعل السترة أكثر هدوءاً أو رسمية، لكن تناسب الكتف وطول الكم يجب أن يبقيا دقيقين.",
      ),
    },
    seoTitle: localized(
      "کت تک مردانه نجیب‌زاده | استایل رسمی و روزمره",
      "Najibzadeh Men's Sport Coats | Refined Tailoring",
      "سترات رجالية منفصلة من نجيب زاده | خياطة راقية",
    ),
    seoDescription: localized(
      "خرید کت تک مردانه نجیب‌زاده با برش دقیق و پارچه باکیفیت برای استایل رسمی، نیمه‌رسمی و روزمره.",
      "Shop Najibzadeh men's sport coats with refined cuts and premium fabrics for formal and smart-casual style.",
      "تسوق سترات نجيب زاده الرجالية المنفصلة بقصات دقيقة وأقمشة فاخرة للإطلالات الرسمية واليومية.",
    ),
  },
  {
    slug: "suits",
    name: localized("کت و شلوار", "Suits", "البدلات"),
    description: localized(
      "کت‌وشلوارهای مردانه نجیب‌زاده با تناسب سنجیده، پارچه‌های ممتاز و خیاطی دقیق برای حضورهای مهم.",
      "Najibzadeh men's suits with considered proportions, premium fabrics, and precise tailoring for defining occasions.",
      "بدلات رجالية من نجيب زاده بتناسب مدروس وأقمشة فاخرة وخياطة دقيقة للمناسبات المهمة.",
    ),
    primaryBanner: {
      eyebrow: localized("خیاطی نجیب‌زاده", "Najibzadeh Tailoring", "خياطة نجيب زاده"),
      heading: localized(
        "برای حضورهایی که به یاد می‌مانند",
        "For a presence that remains",
        "لحضور يبقى في الذاكرة",
      ),
      body: localized(
        "تناسب دقیق شانه، افت آرام پارچه و جزئیاتی سنجیده، کت‌وشلوار را به امضای حضور شما تبدیل می‌کنند.",
        "A precise shoulder, a clean drape, and considered details turn the suit into a signature of your presence.",
        "يحول تناسب الكتف وانسياب القماش والتفاصيل المدروسة البدلة إلى توقيع لحضورك.",
      ),
      ctaLabel: localized("مشاهده کت‌وشلوارها", "View suits", "تصفح البدلات"),
    },
    primaryDescription: {
      heading: localized(
        "تناسب، پیش از هر چیز",
        "Proportion before everything",
        "التناسق قبل كل شيء",
      ),
      body: localized(
        "کیفیت کت‌وشلوار ابتدا در تناسب آن دیده می‌شود: خط شانه باید طبیعی باشد، یقه کت روی پیراهن بنشیند و شلوار بدون شکست اضافی ادامه پیدا کند. مجموعه نجیب‌زاده این اصول را با پارچه‌های منتخب و ساختاری آرام همراه می‌کند.",
        "The quality of a suit begins with proportion: the shoulder should feel natural, the collar should sit cleanly against the shirt, and the trousers should fall without excess break. Najibzadeh combines these principles with selected fabrics and quiet structure.",
        "تبدأ جودة البدلة من التناسق؛ يجب أن يبدو الكتف طبيعياً وأن تستقر ياقة السترة بانسيابية فوق القميص وأن ينسدل البنطال دون تكسر زائد. تجمع نجيب زاده هذه المبادئ مع أقمشة مختارة وبنية هادئة.",
      ),
    },
    secondaryBanner: {
      eyebrow: localized("جزئیات یک امضا", "Signature Details", "تفاصيل التوقيع"),
      heading: localized(
        "وقار بدون اغراق",
        "Composure without excess",
        "وقار بلا مبالغة",
      ),
      body: localized(
        "دکمه‌ها، فرم یقه، جیب‌ها و پرداخت نهایی با هدفی واحد کنار هم قرار می‌گیرند: حضوری دقیق و بی‌نیاز از نمایش اضافه.",
        "Buttons, lapels, pockets, and finishing are brought together with one purpose: a precise presence without unnecessary display.",
        "تجتمع الأزرار والياقات والجيوب والتشطيبات لهدف واحد: حضور دقيق بعيد عن الاستعراض الزائد.",
      ),
      ctaLabel: localized("کشف خیاطی", "Discover tailoring", "اكتشف الخياطة"),
    },
    secondaryDescription: {
      heading: localized(
        "کت‌وشلوار مناسب هر موقعیت",
        "A suit for the right occasion",
        "البدلة المناسبة لكل مناسبة",
      ),
      body: localized(
        "سرمه‌ای برای کمدی منعطف، ذغالی برای رسمیت آرام و مشکی برای شب و مراسم انتخاب‌هایی ماندگارند. پیراهن روشن، کراوات متناسب و کفش چرمی ساده اجازه می‌دهند فرم کت‌وشلوار در مرکز توجه بماند.",
        "Navy brings versatility, charcoal offers quiet formality, and black belongs to evening occasions. A crisp shirt, a considered tie, and restrained leather shoes allow the tailoring to remain the focus.",
        "يمنح الكحلي مرونة أكبر، ويقدم الفحمي رسمية هادئة، بينما يناسب الأسود الأمسيات والمناسبات. يترك القميص النقي وربطة العنق المدروسة والحذاء الجلدي البسيط الخياطة في مركز الإطلالة.",
      ),
    },
    seoTitle: localized(
      "کت و شلوار مردانه نجیب‌زاده | خیاطی رسمی",
      "Najibzadeh Men's Suits | Refined Formal Tailoring",
      "بدلات رجالية من نجيب زاده | خياطة رسمية راقية",
    ),
    seoDescription: localized(
      "خرید کت و شلوار مردانه نجیب‌زاده با پارچه ممتاز، برش دقیق و تناسب ماندگار برای مراسم و موقعیت‌های رسمی.",
      "Discover Najibzadeh men's suits with premium fabrics, precise tailoring, and refined proportions for formal occasions.",
      "اكتشف بدلات نجيب زاده الرجالية بأقمشة فاخرة وخياطة دقيقة للمناسبات الرسمية.",
    ),
  },
  {
    slug: "accessories",
    name: localized("اکسسوری", "Accessories", "الإكسسوارات"),
    description: localized(
      "اکسسوری‌های مردانه نجیب‌زاده؛ جزئیاتی کاربردی و سنجیده برای کامل کردن استایل با شخصیت و ظرافت.",
      "Najibzadeh men's accessories: considered, functional details that complete a look with character and restraint.",
      "إكسسوارات رجالية من نجيب زاده؛ تفاصيل عملية ومدروسة تكمل الإطلالة بأناقة وشخصية.",
    ),
    primaryBanner: {
      eyebrow: localized("جزئیات امضا", "Signature Details", "تفاصيل التوقيع"),
      heading: localized(
        "شخصیت در آخرین انتخاب",
        "Character in the final detail",
        "الشخصية في اللمسة الأخيرة",
      ),
      body: localized(
        "کمربند، کیف، ساعت، عینک و کراوات؛ انتخاب‌های کوچک اما تعیین‌کننده‌ای که استایل را کامل می‌کنند.",
        "Belts, bags, watches, eyewear, and ties: small but defining choices that bring the entire look together.",
        "الأحزمة والحقائب والساعات والنظارات وربطات العنق؛ اختيارات صغيرة لكنها حاسمة في اكتمال الإطلالة.",
      ),
      ctaLabel: localized("مشاهده اکسسوری‌ها", "View accessories", "تصفح الإكسسوارات"),
    },
    primaryDescription: {
      heading: localized(
        "جزئیات کمتر، اثر بیشتر",
        "Fewer details, greater impact",
        "تفاصيل أقل وتأثير أكبر",
      ),
      body: localized(
        "اکسسوری خوب نباید با لباس رقابت کند؛ باید آن را کامل کند. کیفیت چرم، مقیاس قطعه، رنگ فلز و هماهنگی با کفش و کت، تفاوت میان یک ظاهر شلوغ و استایلی سنجیده را مشخص می‌کنند.",
        "A good accessory should not compete with the clothes; it should complete them. Leather quality, scale, metal tone, and coordination with shoes and tailoring define the difference between visual noise and a considered look.",
        "لا ينبغي للإكسسوار الجيد أن ينافس الملابس بل أن يكملها. تحدد جودة الجلد وحجم القطعة ولون المعدن وتناسقها مع الحذاء والخياطة الفرق بين إطلالة مزدحمة وأخرى مدروسة.",
      ),
    },
    secondaryBanner: {
      eyebrow: localized("انتخاب شخصی", "Personal Selection", "اختيار شخصي"),
      heading: localized(
        "امضایی که به استایل اضافه می‌کنید",
        "The signature you add to the look",
        "التوقيع الذي تضيفه إلى إطلالتك",
      ),
      body: localized(
        "یک قطعه درست می‌تواند ظاهر رسمی را شخصی‌تر و استایل روزمره را کامل‌تر نشان دهد.",
        "One well-chosen piece can make formalwear feel personal and everyday dressing feel complete.",
        "يمكن لقطعة مختارة بعناية أن تمنح الملابس الرسمية طابعاً شخصياً وتكمل الإطلالة اليومية.",
      ),
      ctaLabel: localized("انتخاب جزئیات", "Choose the details", "اختر التفاصيل"),
    },
    secondaryDescription: {
      heading: localized(
        "هماهنگی، نه یکسان‌سازی",
        "Coordination, not matching",
        "تناغم لا تطابق",
      ),
      body: localized(
        "لازم نیست همه جزئیات دقیقاً یک‌رنگ باشند. کافی است گرمای چرم‌ها، رنگ فلزات و میزان رسمیت قطعات با یکدیگر هماهنگ بمانند تا نتیجه طبیعی و شخصی دیده شود.",
        "Every detail does not need to match exactly. Keep the warmth of leathers, tone of metals, and level of formality in harmony, and the result will feel natural, personal, and composed.",
        "لا تحتاج كل التفاصيل إلى لون متطابق. يكفي الحفاظ على تناغم دفء الجلود ولون المعادن ودرجة الرسمية لتبدو النتيجة طبيعية وشخصية ومتزنة.",
      ),
    },
    seoTitle: localized(
      "اکسسوری مردانه نجیب‌زاده | کیف، کمربند و ساعت",
      "Najibzadeh Men's Accessories | Bags, Belts & Watches",
      "إكسسوارات رجالية من نجيب زاده | حقائب وأحزمة وساعات",
    ),
    seoDescription: localized(
      "خرید اکسسوری مردانه نجیب‌زاده شامل کیف، کمربند، ساعت، عینک و کراوات برای تکمیل استایل رسمی و روزمره.",
      "Shop Najibzadeh men's accessories, including bags, belts, watches, eyewear, and ties for a refined finishing touch.",
      "تسوق إكسسوارات نجيب زاده الرجالية من حقائب وأحزمة وساعات ونظارات وربطات عنق.",
    ),
  },
  {
    slug: "fragrances",
    name: localized("عطر و ادکلن", "Fragrances", "العطور"),
    description: localized(
      "عطرها و ادکلن‌های مردانه نجیب‌زاده با رایحه‌های متمایز برای ساختن امضایی شخصی و ماندگار.",
      "Najibzadeh men's fragrances with distinctive compositions for a personal and memorable signature.",
      "عطور رجالية من نجيب زاده بتركيبات مميزة لبصمة شخصية راسخة لا تُنسى.",
    ),
    primaryBanner: {
      eyebrow: localized("امضای نامرئی", "The Invisible Signature", "التوقيع الخفي"),
      heading: localized(
        "رایحه‌ای که حضور را ماندگار می‌کند",
        "A scent that makes presence last",
        "عطر يجعل حضورك باقياً",
      ),
      body: localized(
        "از نت آغازین تا عمق رایحه، هر انتخاب برای بیان شخصیتی آرام، متمایز و به‌یادماندنی شکل گرفته است.",
        "From the opening note to the lasting depth, each composition is chosen to express a presence that feels quiet, distinctive, and memorable.",
        "من النغمة الأولى إلى العمق الباقي، اختير كل تركيب ليعبر عن حضور هادئ ومميز ولا يُنسى.",
      ),
      ctaLabel: localized("مشاهده رایحه‌ها", "View fragrances", "تصفح العطور"),
    },
    primaryDescription: {
      heading: localized(
        "رایحه‌ای متناسب با شخصیت شما",
        "A fragrance aligned with your character",
        "عطر ينسجم مع شخصيتك",
      ),
      body: localized(
        "انتخاب عطر از شناخت حال‌وهوا آغاز می‌شود. رایحه‌های چوبی عمق و وقار می‌سازند، مرکبات انرژی و شفافیت می‌آورند و نت‌های ادویه‌ای حضوری گرم‌تر ایجاد می‌کنند. آنچه روی پوست شما باقی می‌ماند باید طبیعی و شخصی احساس شود.",
        "Choosing a fragrance begins with mood. Woods bring depth and composure, citrus adds energy and clarity, and spices create a warmer presence. What remains on your skin should feel natural, personal, and unmistakably yours.",
        "يبدأ اختيار العطر من الحالة التي تريد التعبير عنها. تمنح الأخشاب عمقاً ووقاراً، وتضيف الحمضيات طاقة ونقاء، بينما تصنع التوابل حضوراً أكثر دفئاً. ما يبقى على بشرتك يجب أن يبدو طبيعياً وشخصياً وخاصاً بك.",
      ),
    },
    secondaryBanner: {
      eyebrow: localized("نت‌های ماندگار", "Lasting Notes", "نغمات باقية"),
      heading: localized(
        "برای روز، شب و لحظه‌های خاص",
        "For day, evening, and defining moments",
        "للنهار والمساء واللحظات الخاصة",
      ),
      body: localized(
        "رایحه سبک‌تر برای روز و ترکیبی عمیق‌تر برای شب، کمد عطر شما را کامل و منعطف نگه می‌دارد.",
        "A lighter composition for daytime and a deeper scent for evening keep your fragrance wardrobe complete and versatile.",
        "تركيبة أخف للنهار وعطر أعمق للمساء يجعلان مجموعة عطورك متكاملة ومرنة.",
      ),
      ctaLabel: localized("کشف رایحه‌ها", "Discover the scents", "اكتشف العطور"),
    },
    secondaryDescription: {
      heading: localized(
        "چطور رایحه مناسب را انتخاب کنیم",
        "How to choose the right fragrance",
        "كيف تختار العطر المناسب",
      ),
      body: localized(
        "عطر را روی پوست امتحان کنید و برای آشکار شدن نت‌های میانی و پایه به آن زمان بدهید. فصل، ساعت استفاده و فضایی که در آن حضور دارید روی انتخاب اثر می‌گذارند؛ اما در نهایت بهترین رایحه همان است که با آن خودتان هستید.",
        "Test fragrance on skin and allow time for the heart and base notes to emerge. Season, time of day, and setting all influence the choice, but the best scent is ultimately the one that feels most like you.",
        "جرب العطر على بشرتك واترك وقتاً لظهور النغمات الوسطى والقاعدية. يؤثر الموسم ووقت الاستخدام والمكان في الاختيار، لكن أفضل عطر هو الذي يشعرك بأنه يعبر عنك حقاً.",
      ),
    },
    seoTitle: localized(
      "عطر و ادکلن مردانه نجیب‌زاده | رایحه‌های متمایز",
      "Najibzadeh Men's Fragrances | Distinctive Scents",
      "عطور رجالية من نجيب زاده | روائح مميزة",
    ),
    seoDescription: localized(
      "خرید عطر و ادکلن مردانه نجیب‌زاده با رایحه‌های چوبی، مرکباتی و ادویه‌ای برای روز، شب و موقعیت‌های خاص.",
      "Discover Najibzadeh men's fragrances with woody, citrus, and spicy compositions for day, evening, and special occasions.",
      "اكتشف عطور نجيب زاده الرجالية بتركيبات خشبية وحمضية وتوابلية للنهار والمساء والمناسبات الخاصة.",
    ),
  },
];

function categoryUpdates(category) {
  const shopHref = `/shop?category=${category.slug}`;

  return {
    name: category.name,
    description: category.description,
    "pageContent.primaryBanner.eyebrow": category.primaryBanner.eyebrow,
    "pageContent.primaryBanner.heading": category.primaryBanner.heading,
    "pageContent.primaryBanner.body": category.primaryBanner.body,
    "pageContent.primaryBanner.ctaLabel": category.primaryBanner.ctaLabel,
    "pageContent.primaryBanner.ctaHref": shopHref,
    "pageContent.primaryDescription.heading": category.primaryDescription.heading,
    "pageContent.primaryDescription.body": category.primaryDescription.body,
    "pageContent.secondaryBanner.eyebrow": category.secondaryBanner.eyebrow,
    "pageContent.secondaryBanner.heading": category.secondaryBanner.heading,
    "pageContent.secondaryBanner.body": category.secondaryBanner.body,
    "pageContent.secondaryBanner.ctaLabel": category.secondaryBanner.ctaLabel,
    "pageContent.secondaryBanner.ctaHref": shopHref,
    "pageContent.secondaryDescription.heading": category.secondaryDescription.heading,
    "pageContent.secondaryDescription.body": category.secondaryDescription.body,
    "pageContent.seoTitle": category.seoTitle,
    "pageContent.seoDescription": category.seoDescription,
    updatedAt: new Date(),
  };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) throw new Error("MONGODB_URI is not configured.");

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME?.trim() || "najib",
    serverSelectionTimeoutMS: 10000,
  });

  const collection = mongoose.connection.db.collection("categories");
  const slugs = categories.map((category) => category.slug);
  const existing = await collection
    .find(
      { slug: { $in: slugs }, isActive: true },
      { projection: { slug: 1, name: 1, sortOrder: 1 } },
    )
    .toArray();
  const existingSlugs = new Set(existing.map((category) => category.slug));
  const missing = slugs.filter((slug) => !existingSlugs.has(slug));

  if (missing.length) {
    throw new Error(`Active categories not found: ${missing.join(", ")}`);
  }

  if (!apply) {
    console.log(
      JSON.stringify(
        {
          mode: "preview",
          categories: categories.map(({ slug, name }) => ({ slug, name })),
          note: "Run with --apply to update text fields only.",
        },
        null,
        2,
      ),
    );
    return;
  }

  const results = [];

  for (const category of categories) {
    const result = await collection.updateOne(
      { slug: category.slug, isActive: true },
      { $set: categoryUpdates(category) },
    );

    results.push({
      slug: category.slug,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  }

  console.log(JSON.stringify({ mode: "applied", results }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
