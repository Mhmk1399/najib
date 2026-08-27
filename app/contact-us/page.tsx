import { ContactHeroSection } from "@/components/static/Contact/ContactHeroSection";

import { ContactServicesSection } from "@/components/static/Contact/ContactServicesSection";

import { PrivateAppointmentSection } from "@/components/static/Contact/PrivateAppointmentSection";

export default function ContactPage() {
  return (
    <main>
      <ContactHeroSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="Najibzadeh private atelier"
        eyebrow="Contact Najibzadeh"
        title="Begin the conversation."
        italicTitle="We are here to guide every detail."
        mobileImagePosition="70% center"
        desktopImagePosition="center"
      />

      <ContactServicesSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="Najibzadeh materials and client book"
        imagePosition="center"
      />

      <PrivateAppointmentSection
        imageSrc="/assets/images/banner.webp"
        imageAlt="Najibzadeh private appointment"
        eyebrow="Let us assist you personally"
        title="Book a Private Appointment."
        italicTitle="Tailored to you."
        mobileImagePosition="70% center"
        desktopImagePosition="center"
      />
    </main>
  );
}
