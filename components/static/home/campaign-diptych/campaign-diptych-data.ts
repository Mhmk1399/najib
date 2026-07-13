import type { CampaignDiptychProps } from "./campaign-diptych.types";

export const campaignDiptychData = {
  id: "homepage-campaign-diptych",
  eyebrow: "دو روایت از یک حضور",
  title: "از روشنای روز تا سکوت شب.",
  description:
    "پوشش مناسب، با موقعیت تغییر می‌کند؛ اما وقار، تعادل و دقت در انتخاب همواره باقی می‌ماند.",
  panels: [
    {
      id: "daywear",
      eyebrow: "پوشش روز",
      title: "آرام، دقیق، حاضر.",
      description:
        "کت‌ها و بلیزرهایی برای جلسات، موقعیت‌های روزانه و حضورهایی که به تعادل میان رسمیت و آزادی نیاز دارند.",
      layout: "lead",
      image: {
        src: "/assets/images/hero2.webp",
        width: 1800,
        height: 2160,
        alt: "مدل مرد با کت و بلیزر نجیب‌زاده در فضای روشن روز",
      },
      objectPosition: "center-top",
      action: {
        label: "مشاهده کت و بلیزر",
        href: "/collections/jackets",
        ariaLabel: "مشاهده مجموعه کت و بلیزر مردانه نجیب‌زاده",
      },
    },
    {
      id: "eveningwear",
      eyebrow: "پوشش شب",
      title: "وقار در لحظه‌های متمایز.",
      description:
        "کت‌وشلوارهایی برای مراسم و موقعیت‌هایی که حضور شما باید بدون اغراق، دقیق و به‌یادماندنی باشد.",
      layout: "support",
      image: {
        src: "/assets/images/hero3.webp",
        width: 1600,
        height: 2000,
        alt: "مدل مرد با کت‌وشلوار رسمی نجیب‌زاده در فضای شب",
      },
      objectPosition: "center-top",
      action: {
        label: "مشاهده کت‌وشلوارها",
        href: "/collections/suits",
        ariaLabel: "مشاهده مجموعه کت‌وشلوارهای رسمی نجیب‌زاده",
      },
    },
  ],
} as const satisfies Omit<CampaignDiptychProps, "locale" | "className">;