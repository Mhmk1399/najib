import { AboutCraftSection } from "@/components/static/About/AboutCraftSection";
import { AboutHeroSection } from "@/components/static/About/AboutHeroSection";
import { AboutValuesSection } from "@/components/static/About/AboutValuesSection";

export default function Page() {
  return (
    <main>
      <AboutHeroSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="خانه خیاطی نجیب‌زاده"
        eyebrow="درباره نجیب‌زاده"
        title="ریشه‌دار در میراث."
        italicTitle="تعریف‌شده با هدف."
        description="نجیب‌زاده خانه‌ای مدرن برای خیاطی، عطر و اشیای ماندگار است؛ شکل‌گرفته از هنر دست، ظرافت، اصالت و جست‌وجویی آرام برای خلق تمایزی ماندگار."
        mobileImagePosition="68% center"
        desktopImagePosition="center"
      />

      <AboutCraftSection
        images={[
          {
            id: "fabric",

            src: "/assets/images/banner.webp",

            alt: "Najibzadeh fabric detail",

            position: "center",
          },

          {
            id: "hand",

            src: "/assets/images/banner.webp",

            alt: "Najibzadeh craftsmanship",

            position: "center",
          },

          {
            id: "material",

            src: "/assets/images/banner.webp",

            alt: "Najibzadeh material",

            position: "center",
          },
        ]}
      />

      <AboutValuesSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="ارزش‌های ماندگار نجیب‌زاده"
        eyebrow="ارزش‌های ما"
        title="ساخته‌شده بر پایه ارزش‌های ماندگار."
        italicTitle="هدایت‌شده با اصالت."
        mobileImagePosition="68% center"
        desktopImagePosition="center"
      />
    </main>
  );
}
