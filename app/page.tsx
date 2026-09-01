
import { BrandStorySection } from "@/components/static/Home/BrandStorySection";
import { CategoryShowcase } from "@/components/static/Home/CategoryShowcase";
import { CinematicVideoSection } from "@/components/static/Home/CinematicVideoSection";
import { HeroSection } from "@/components/static/Home/HeroSection";
import { HouseEditorialSection } from "@/components/static/Home/HouseEditorialSection";
import { ProductEditorialGrid } from "@/components/static/Home/ProductEditorialGrid";
import { WhyChooseUsSection } from "@/components/static/Home/WhyChooseUsSection";

export default function Page() {
  return (
    <main>
      <HeroSection />
      <CategoryShowcase />
      <CinematicVideoSection
        videoSrc="/assets/video/videoCinema.mp4"
        posterSrc="/images/craftsmanship-poster.webp"
        eyebrow="The House"
        title="Crafted with intention."
        description="A closer look at the details, materials and hands behind the Najibzadeh world."
        primaryAction={{
          label: "Discover Our Story",
          href: "/our-story",
        }}
        secondaryAction={{
          label: "Explore Categories",
          href: "/craftsmanship",
        }}
      />
      <WhyChooseUsSection backgroundImage="/assets/images/banner.webp" />
      <HouseEditorialSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="Najibzadeh tailoring"
        eyebrow="New Season"
        title="Tailored for the memorable."
        description="Timeless tailoring. Distinctive fragrance. Objects made with intention, for a life well-lived."
        primaryAction={{
          label: "Explore the Collection",
          href: "/collections",
        }}
        secondaryAction={{
          label: "Discover the House",
          href: "/our-story",
        }}
        mobileImagePosition="62% center"
        desktopImagePosition="center"
      />
      <ProductEditorialGrid
        products={[
          {
            id: "tailoring",
            title: "Tailoring",
            eyebrow: "01 / Collection",
            href: "/tailoring",
            image: "/assets/images/banner.webp",
          },
          {
            id: "shoes",
            title: "Shoes",
            eyebrow: "02 / Essentials",
            href: "/shoes",
            image: "/assets/images/banner.webp",
          },
          {
            id: "fragrance",
            title: "Fragrance",
            eyebrow: "03 / Signature",
            href: "/fragrance",
            image: "/assets/images/banner.webp",
          },
          {
            id: "knitwear",
            title: "Knitwear",
            eyebrow: "04 / Softness",
            href: "/knitwear",
            image: "/assets/images/hero4.webp",
          },
          {
            id: "leather-goods",
            title: "Leather Goods",
            eyebrow: "05 / Craft",
            href: "/accessories",
            image: "/assets/images/banner.webp",
          },
          {
            id: "accessories",
            title: "Accessories",
            eyebrow: "06 / Details",
            href: "/accessories",
            image: "/assets/images/hero2.webp",
          },
        ]}
      />
      <BrandStorySection />
    </main>
  );
}
