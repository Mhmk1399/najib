import type { Metadata } from "next";

import { ContactHeroSection } from "@/components/static/Contact/ContactHeroSection";

import { PrivateAppointmentSection } from "@/components/static/Contact/PrivateAppointmentSection";

import { contactCopy } from "@/lib/i18n/contact-copy";

import {
  defaultLocale,
  getHtmlLang,
  getLocaleDirection,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { ContactSection } from "@/components/static/Contact/ContactServicesSection";

type ContactPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  const locale = resolveLocale(localeParam);

  const copy = contactCopy[locale];

  return {
    title: copy.metadata.title,

    description: copy.metadata.description,
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: localeParam } = await params;

  const locale = resolveLocale(localeParam);

  const copy = contactCopy[locale];

  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  return (
    <main
      dir={direction}
      lang={htmlLang}
      className="
        w-full
        overflow-x-clip
      "
    >
      <ContactHeroSection
        locale={locale}
        copy={copy.hero}
        imageSrc="/assets/images/banner.webp"
        mobileImagePosition="70% center"
        desktopImagePosition="center"
      />

      <ContactSection
        locale={locale}
        copy={copy.services}
        imageSrc="/assets/images/banner.webp"
        imagePosition="center"
      />

      <PrivateAppointmentSection
        locale={locale}
        copy={copy.appointment}
        imageSrc="/assets/images/banner.webp"
        mobileImagePosition="70% center"
        desktopImagePosition="center"
      />
    </main>
  );
}
