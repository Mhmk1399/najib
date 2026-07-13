import { homepageFaqData } from "@/components/global/faq/faq-data.example";
import { FaqSection } from "@/components/global/faq/faq-section";
import { BrandSeoSummary } from "@/components/static/home/brand-seo-summary/brand-seo-summary";
import { brandSeoSummaryData } from "@/components/static/home/brand-seo-summary/brand-seo-summary-data";
import { BrandStatementImage } from "@/components/static/home/brand-statement-image/brand-statement-image";
import { brandStatementImageData } from "@/components/static/home/brand-statement-image/brand-statement-image-data";
import { CampaignDiptych } from "@/components/static/home/campaign-diptych/campaign-diptych";
import { campaignDiptychData } from "@/components/static/home/campaign-diptych/campaign-diptych-data";
import { CategoryEditorialGrid } from "@/components/static/home/category-editorial-grid/category-editorial-grid";
import { categoryEditorialGridData } from "@/components/static/home/category-editorial-grid/category-editorial-grid-data";
import { CinematicVideoHero } from "@/components/static/home/cinematic-video-hero/cinematic-video-hero";
import { cinematicVideoHeroData } from "@/components/static/home/cinematic-video-hero/cinematic-video-hero-data.example";
import { ColorStorySlider } from "@/components/static/home/color-story-slider/color-story-slider";
import { colorStorySliderData } from "@/components/static/home/color-story-slider/color-story-slider-data";
import { HOME_SECTION_DIVIDER_CLASS } from "@/components/static/home/home-section-classes";
import { ProductFocusSlider } from "@/components/static/home/product-focus-slider/product-focus-slider";
import { productFocusSliderData } from "@/components/static/home/product-focus-slider/product-focus-slider-data.example";

export default function Home() {
  return (
    <main className="isolate overflow-x-hidden bg-[#FCFAF7] text-[#231F20] dark:bg-[#0B1117] dark:text-[#F8F5F0]">
      <CinematicVideoHero {...cinematicVideoHeroData} />
      <CategoryEditorialGrid {...categoryEditorialGridData} />
      <ProductFocusSlider
        {...productFocusSliderData}
        className={HOME_SECTION_DIVIDER_CLASS}
      />

      <CampaignDiptych
        {...campaignDiptychData}
        className={HOME_SECTION_DIVIDER_CLASS}
      />
      <ColorStorySlider {...colorStorySliderData} />
      <FaqSection {...homepageFaqData} className={HOME_SECTION_DIVIDER_CLASS} />
      <BrandStatementImage {...brandStatementImageData} />
      <BrandSeoSummary
        {...brandSeoSummaryData}
        className={HOME_SECTION_DIVIDER_CLASS}
      />
    </main>
  );
}
