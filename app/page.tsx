
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
        posterSrc="/assets/images/p1.webp"
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
      <WhyChooseUsSection  backgroundImage="/assets/images/whyus.webp" />
      <HouseEditorialSection
        imageSrc="/assets/images/p2.webp"
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
            image: "/assets/images/p1.webp",
          },
          {
            id: "shoes",
            title: "Shoes",
            eyebrow: "02 / Essentials",
            href: "/shoes",
            image: "/assets/images/p2.webp",
          },
          {
            id: "fragrance",
            title: "Fragrance",
            eyebrow: "03 / Signature",
            href: "/fragrance",
            image: "/assets/images/p6.webp",
          },
          {
            id: "knitwear",
            title: "Knitwear",
            eyebrow: "04 / Softness",
            href: "/knitwear",
            image: "/assets/images/p7.webp",
          },
          {
            id: "leather-goods",
            title: "Leather Goods",
            eyebrow: "05 / Craft",
            href: "/accessories",
            image: "/assets/images/p8.webp",
          },
          {
            id: "accessories",
            title: "Accessories",
            eyebrow: "06 / Details",
            href: "/accessories",
            image: "/assets/images/p10.webp",
            imagePosition:"center",
            
          },
        ]}
      />
      <BrandStorySection />
    </main>
  );
}
