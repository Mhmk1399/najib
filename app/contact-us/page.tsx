import { ContactHeroSection } from "@/components/static/Contact/ContactHeroSection";
import { ContactServicesSection } from "@/components/static/Contact/ContactServicesSection";
import { PrivateAppointmentSection } from "@/components/static/Contact/PrivateAppointmentSection";

export default function ContactPage() {
  return (
    <main dir="rtl">
      <ContactHeroSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="آتلیه خصوصی نجیب‌زاده"
        eyebrow="ارتباط با نجیب‌زاده"
        title="آغاز یک گفت‌وگو."
        italicTitle="برای همراهی شما در تمام جزئیات اینجاییم."
        mobileImagePosition="70% center"
        desktopImagePosition="center"
      />

      <ContactServicesSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="خدمات خصوصی و متریال نجیب‌زاده"
        imagePosition="center"
      />

      <PrivateAppointmentSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="قرار ملاقات خصوصی نجیب‌زاده"
        eyebrow="اجازه دهید شخصاً همراه شما باشیم"
        title="رزرو قرار ملاقات خصوصی."
        italicTitle="تجربه‌ای متناسب با شما."
        mobileImagePosition="70% center"
        desktopImagePosition="center"
      />
    </main>
  );
}
