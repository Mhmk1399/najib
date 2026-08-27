
import { AboutCraftSection } from "@/components/static/About/AboutCraftSection";
import { AboutHeroSection } from "@/components/static/About/AboutHeroSection";
import { AboutValuesSection } from "@/components/static/About/AboutValuesSection";

 

export default function Page() {
  return (
    <main>
      <AboutHeroSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="Najibzadeh tailoring house"
        eyebrow="About Najibzadeh"
        title="Rooted in heritage."
        italicTitle="Defined by purpose."
        description="Najibzadeh is a modern house of tailoring, fragrance and considered objects — shaped by craftsmanship, restraint and a quiet pursuit of lasting distinction."
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
        imageAlt="Najibzadeh timeless values"
        eyebrow="Our Values"
        title="Built on timeless values."
        italicTitle="Guided by integrity."
        mobileImagePosition="68% center"
        desktopImagePosition="center"
      />
    </main>
  );
}
