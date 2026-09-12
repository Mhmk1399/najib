import FAQ, { FAQItem } from "@/components/global/faq";
import { BrandStorySection } from "@/components/static/Home/BrandStorySection";
import { CategoryShowcase } from "@/components/static/Home/CategoryShowcase";
import { CinematicVideoSection } from "@/components/static/Home/CinematicVideoSection";
import { HeroSection } from "@/components/static/Home/HeroSection";
import { HouseEditorialSection } from "@/components/static/Home/HouseEditorialSection";
import { ProductEditorialGrid } from "@/components/static/Home/ProductEditorialGrid";
import { WhyChooseUsSection } from "@/components/static/Home/WhyChooseUsSection";
export const FAQ_DEMO_CONTENT = {
  eyebrow: "Client Information",
  title: "Questions, considered.",
  description:
    "Everything you may want to know about ordering, delivery, returns, private appointments and the care of Najibzadeh pieces.",
};

export const FAQ_DEMO_ITEMS: FAQItem[] = [
  {
    id: "delivery",
    question: "How long does delivery take?",
    answerLabel: "Delivery",
    answer:
      "Orders are prepared with care before dispatch. Standard delivery typically takes 2–5 business days after processing, while timing for international orders varies by destination and customs clearance.",
  },
  {
    id: "returns",
    question: "Can I return or exchange an item?",
    answerLabel: "Returns & Exchanges",
    answer:
      "Eligible pieces may be returned within the stated return window provided they remain unworn, unused and in their original condition with all packaging and tags intact. Final-sale and personalised pieces may be excluded.",
  },
  {
    id: "appointment",
    question: "How do I arrange a private appointment?",
    answerLabel: "Private Client Services",
    answer:
      "Private appointments can be requested through the appointments page. Select your preferred location and time, and the client services team can assist with wardrobe selection, sizing and product guidance.",
  },
  {
    id: "sizing",
    question: "How should I choose the correct size?",
    answerLabel: "Sizing",
    answer:
      "Use the size guide available on each product page as the primary reference. If you are between sizes or need help with a tailored piece, contact client services before ordering for more specific guidance.",
  },
  {
    id: "fragrance",
    question: "Can fragrance be shipped internationally?",
    answerLabel: "Fragrance",
    answer:
      "Fragrance shipping availability depends on destination-specific carrier restrictions for alcohol-based products. Available delivery methods will be shown at checkout when fragrance is present in your bag.",
  },
  {
    id: "care",
    question: "How should Najibzadeh pieces be cared for?",
    answerLabel: "Product Care",
    answer:
      "Always follow the care label supplied with the piece. Tailored garments should be rested between wears and professionally cleaned only when necessary. Leather goods and fragrance should be stored away from direct heat, moisture and sunlight.",
  },
  {
    id: "payment",
    question: "Which payment methods are accepted?",
    answerLabel: "Payment",
    answer:
      "Available payment methods are presented securely during checkout and can vary by market. Your order is confirmed only after the payment has been successfully authorised.",
  },
];

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
      <WhyChooseUsSection backgroundImage="/assets/images/whyus.webp" />
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
            imagePosition: "center",
          },
        ]}
      />
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
