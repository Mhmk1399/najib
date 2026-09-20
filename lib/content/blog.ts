export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  category: string;
  publishedAt: string;
  readingTime?: string;
  author?: string;
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    id: "blog-01",
    slug: "the-new-language-of-modern-dressing",
    title: "زبان تازه پوشش مدرن",
    excerpt:
      "نگاهی سنجیده به تناسب، متریال و سادگی؛ روایتی از اینکه کمد لباس مدرن چگونه آرام‌تر، شخصی‌تر و ماندگارتر می‌شود.",
    image: "/assets/images/hero4.webp",
    imagePosition: "center 30%",
    category: "یادداشت‌های استایل",
    publishedAt: "2026-08-24",
    readingTime: "۶ دقیقه مطالعه",
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
    category: "هنر ساخت",
    publishedAt: "2026-08-21",
    readingTime: "۵ دقیقه مطالعه",
    author: "تحریریه نجیب‌زاده",
  },
  {
    id: "blog-03",
    slug: "building-a-timeless-wardrobe",
    title: "ساختن کمدی فراتر از فصل",
    excerpt:
      "قطعاتی که ارزش نگه‌داشتن دارند، معمولاً پرهیاهوترین‌ها نیستند؛ نگاهی به انعطاف‌پذیری، ماندگاری و طراحی سنجیده.",
    image: "/assets/images/banner.webp",
    category: "یادداشت‌های استایل",
    publishedAt: "2026-08-18",
    readingTime: "۴ دقیقه مطالعه",
    author: "تحریریه نجیب‌زاده",
  },
  {
    id: "blog-04",
    slug: "inside-the-atelier",
    title: "درون آتلیه؛ جزئیاتی که هرگز نمی‌بینید",
    excerpt:
      "نگاهی نزدیک به ساخت، پرداخت نهایی و تصمیم‌های ظریفی که خیاطی ممتاز را شکل می‌دهند.",
    image: "/assets/images/banner.webp",
    category: "درون خانه",
    publishedAt: "2026-08-14",
    readingTime: "۸ دقیقه مطالعه",
    author: "تحریریه نجیب‌زاده",
  },
  {
    id: "blog-05",
    slug: "the-art-of-quiet-luxury",
    title: "تجمل آرام به معنای نامرئی بودن نیست",
    excerpt:
      "سادگی واقعی به معنای حذف نیست؛ یعنی اطمینان از اینکه دقیقاً چه چیزی شایسته توجه است.",
    image: "/assets/images/banner.webp",
    category: "دیدگاه‌ها",
    publishedAt: "2026-08-09",
    readingTime: "۷ دقیقه مطالعه",
    author: "تحریریه نجیب‌زاده",
  },
  {
    id: "blog-06",
    slug: "a-study-in-black",
    title: "مطالعه‌ای در سیاه",
    excerpt:
      "بافت، سایه و تناسب نشان می‌دهند چگونه یک رنگ می‌تواند هویت یک کمد کامل را به دوش بکشد.",
    image: "/assets/images/banner.webp",
    category: "الهام",
    publishedAt: "2026-08-03",
    readingTime: "۳ دقیقه مطالعه",
    author: "تحریریه نجیب‌زاده",
  },
  {
    id: "blog-07",
    slug: "care-for-cashmere",
    title: "چگونه از کشمیر مراقبت کنیم",
    excerpt:
      "راهنمایی کاربردی برای شست‌وشو، نگهداری و حفظ یکی از ظریف‌ترین الیاف طبیعی جهان.",
    image: "/assets/images/banner.webp",
    category: "راهنمای نگهداری",
    publishedAt: "2026-07-29",
    readingTime: "۵ دقیقه مطالعه",
    author: "تحریریه نجیب‌زاده",
  },
  {
    id: "blog-08",
    slug: "the-perfect-jacket",
    title: "آناتومی یک کت بی‌نقص",
    excerpt:
      "سرشانه، یقه، تعادل و تناسب؛ چهار جزئیاتی که خیاطی را از یک پوشش ساده به شخصیت تبدیل می‌کنند.",
    image: "/assets/images/banner.webp",
    category: "هنر ساخت",
    publishedAt: "2026-07-23",
    readingTime: "۷ دقیقه مطالعه",
    author: "تحریریه نجیب‌زاده",
  },
  {
    id: "blog-09",
    slug: "objects-with-character",
    title: "اشیایی با شخصیت",
    excerpt:
      "چرا چیزهایی که برای زندگی انتخاب می‌کنیم باید سنجیده، ملموس و با گذر زمان شخصی‌تر شوند.",
    image: "/assets/images/banner.webp",
    category: "الهام",
    publishedAt: "2026-07-18",
    readingTime: "۴ دقیقه مطالعه",
    author: "تحریریه نجیب‌زاده",
  },
];
