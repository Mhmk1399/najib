import FAQ, { FAQItem } from "@/components/global/faq";
import { BrandStorySection } from "@/components/static/Home/BrandStorySection";
import {
  CategoryShowcase,
  getHomeCategoryShowcaseItems,
} from "@/components/static/Home/CategoryShowcase";
import { CinematicVideoSection } from "@/components/static/Home/CinematicVideoSection";
import { DynamicIslandExperienceSections } from "@/components/static/Home/DynamicIslandExperienceSections";
import { HeroSection } from "@/components/static/Home/HeroSection";
import { HouseEditorialSection } from "@/components/static/Home/HouseEditorialSection";
import { ProductEditorialGrid } from "@/components/static/Home/ProductEditorialGrid";
import { ShoppableImageBanner } from "@/components/static/Home/ShoppableImageBanner";
import { WhyChooseUsSection } from "@/components/static/Home/WhyChooseUsSection";

export const dynamic = "force-dynamic";

export const FAQ_DEMO_CONTENT = {
  eyebrow: "اطلاعات مشتریان",
  title: "پاسخ‌هایی برای انتخابی مطمئن.",
  description:
    "هر آنچه درباره سفارش، ارسال، مرجوعی، قرارهای خصوصی و نگهداری از محصولات نجیب‌زاده نیاز دارید.",
};

export const FAQ_DEMO_ITEMS: FAQItem[] = [
  {
    id: "delivery",
    question: "ارسال سفارش چقدر زمان می‌برد؟",
    answerLabel: "ارسال و تحویل",
    answer:
      "سفارش‌ها پیش از ارسال با دقت آماده می‌شوند. تحویل استاندارد معمولاً پس از آماده‌سازی سفارش بین ۲ تا ۵ روز کاری زمان می‌برد. زمان تحویل سفارش‌های بین‌المللی نیز با توجه به مقصد و فرایندهای گمرکی متفاوت است.",
  },
  {
    id: "returns",
    question: "آیا امکان بازگشت یا تعویض کالا وجود دارد؟",
    answerLabel: "مرجوعی و تعویض",
    answer:
      "کالاهای واجد شرایط در بازه تعیین‌شده قابل بازگشت یا تعویض هستند؛ مشروط بر اینکه استفاده نشده باشند و همراه با بسته‌بندی، لیبل‌ها و متعلقات اصلی بازگردانده شوند. برخی کالاهای شخصی‌سازی‌شده یا فروش نهایی ممکن است شامل شرایط بازگشت نباشند.",
  },
  {
    id: "appointment",
    question: "چطور وقت ملاقات خصوصی رزرو کنم؟",
    answerLabel: "خدمات اختصاصی مشتریان",
    answer:
      "از طریق صفحه رزرو ملاقات خصوصی می‌توانید زمان و محل موردنظر خود را انتخاب کنید. تیم خدمات مشتریان نجیب‌زاده برای انتخاب استایل، بررسی سایز و راهنمایی درباره محصولات در کنار شما خواهد بود.",
  },
  {
    id: "sizing",
    question: "چطور سایز مناسب را انتخاب کنم؟",
    answerLabel: "راهنمای سایز",
    answer:
      "راهنمای سایز هر محصول بهترین مرجع برای انتخاب اولیه است. اگر بین دو سایز هستید یا برای یک قطعه رسمی و خیاطی‌شده به راهنمایی دقیق‌تری نیاز دارید، پیش از ثبت سفارش با خدمات مشتریان تماس بگیرید.",
  },
  {
    id: "fragrance",
    question: "آیا عطر به خارج از کشور ارسال می‌شود؟",
    answerLabel: "ارسال عطر",
    answer:
      "امکان ارسال عطر به قوانین و محدودیت‌های شرکت‌های حمل‌ونقل در مقصد بستگی دارد، زیرا محصولات عطری معمولاً حاوی ترکیبات الکلی هستند. روش‌های ارسال در دسترس، هنگام تسویه‌حساب و بر اساس مقصد سفارش نمایش داده می‌شوند.",
  },
  {
    id: "care",
    question: "چطور از محصولات نجیب‌زاده نگهداری کنم؟",
    answerLabel: "نگهداری محصول",
    answer:
      "همیشه دستورالعمل درج‌شده روی لیبل مراقبت محصول را دنبال کنید. بهتر است پوشاک رسمی بین هر بار استفاده استراحت داشته باشند و فقط در صورت نیاز به‌صورت حرفه‌ای تمیز شوند. محصولات چرمی و عطرها نیز باید دور از گرمای مستقیم، رطوبت و نور خورشید نگهداری شوند.",
  },
  {
    id: "payment",
    question: "چه روش‌های پرداختی پذیرفته می‌شوند؟",
    answerLabel: "پرداخت",
    answer:
      "روش‌های پرداخت قابل استفاده به‌صورت امن در مرحله تسویه‌حساب نمایش داده می‌شوند و ممکن است بسته به بازار یا محل سفارش متفاوت باشند. سفارش پس از تأیید موفق پرداخت نهایی خواهد شد.",
  },
];

export default async function Page() {
  const categoryShowcaseItems = await getHomeCategoryShowcaseItems();

  return (
    <main>
      <HeroSection />
      <CategoryShowcase categories={categoryShowcaseItems} />
      <CinematicVideoSection
        videoSrc="/assets/video/videoCinema.mp4"
        posterSrc="/assets/images/p1.webp"
        posterAlt="خیاط در حال آماده‌سازی کت نجیب‌زاده"
        eyebrow="هنر خیاطی"
        title="جزئیات، تفاوت را می‌سازند."
        description="هر قطعه با دقت، تجربه و توجه به تناسب ساخته می‌شود؛ از انتخاب پارچه تا آخرین دوخت."
        primaryAction={{
          label: "کشف داستان ما",
          href: "/about-us",
        }}
        secondaryAction={{
          label: "مشاهده مجموعه",
          href: "/shop",
        }}
      />
      <WhyChooseUsSection backgroundImage="/assets/images/whyus.webp" />
      <HouseEditorialSection
        imageSrc="/assets/images/p2.webp"
        imageAlt="Najibzadeh tailoring"
        eyebrow="فصل تازه"
        title="برای لحظه‌هایی که در خاطر می‌مانند."
        description="خیاطی ماندگار، رایحه‌های متمایز و انتخاب‌هایی سنجیده؛ برای سبک زندگی‌ای که کیفیت را در جزئیات تعریف می‌کند"
        primaryAction={{
          label: "مشاهده مجموعه",
          href: "/shop",
        }}
        secondaryAction={{
          label: "کشف خانه نجیب‌زاده",
          href: "/about-us",
        }}
        mobileImagePosition="62% center"
        desktopImagePosition="center"
      />
      <ShoppableImageBanner />
      <DynamicIslandExperienceSections />
      <ProductEditorialGrid />
      <FAQ
        eyebrow={FAQ_DEMO_CONTENT.eyebrow}
        title={FAQ_DEMO_CONTENT.title}
        description={FAQ_DEMO_CONTENT.description}
        items={FAQ_DEMO_ITEMS}
        defaultOpenIds={["delivery"]}
        allowMultiple={false}
      />
      <BrandStorySection />
    </main>
  );
}
