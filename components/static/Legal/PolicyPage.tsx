import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PolicySection = {
  title: string;
  body: string;
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: PolicySection[];
};

export function PolicyPage({
  eyebrow,
  title,
  intro,
  sections,
}: PolicyPageProps) {
  return (
    <main dir="rtl" lang="fa" className="bg-[#F6F2EB] text-[#0B0B0B]">
      <header className="border-b border-black/[0.1] bg-[#0B0B0B] px-6 py-20 text-white sm:px-10 sm:py-28 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex items-center gap-3 text-[10px] font-medium text-[#C69A73]">
            <span className="h-px w-8 bg-[#B7835A]" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-[720px] text-balance text-[clamp(2.5rem,6vw,5.4rem)] font-semibold leading-[1.08] tracking-[-0.045em]">
            {title}
          </h1>
          <p className="mt-7 max-w-[680px] text-pretty text-[13px] leading-8 text-white/62 sm:text-[15px]">
            {intro}
          </p>
          <Link
            href="/contact-us"
            className="mt-10 inline-flex items-center gap-2 border-b border-white/30 pb-2 text-[10px] text-white/72 transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]"
          >
            پرسشی دارید؟ با ما تماس بگیرید
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1100px] px-6 py-12 sm:px-10 sm:py-20 lg:px-16 lg:py-28">
        {sections.map((section, index) => (
          <section
            key={section.title}
            className="grid gap-5 border-b border-black/[0.12] py-8 first:pt-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-10 sm:py-10"
          >
            <span className="text-[10px] font-medium tabular-nums text-[#A06F48]">
              {new Intl.NumberFormat("fa-IR", {
                minimumIntegerDigits: 2,
                useGrouping: false,
              }).format(index + 1)}
            </span>
            <div>
              <h2 className="text-[20px] font-semibold leading-8 tracking-[-0.02em] sm:text-[24px]">
                {section.title}
              </h2>
              <p className="mt-4 max-w-[720px] text-[13px] leading-8 text-black/62 sm:text-[14px]">
                {section.body}
              </p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
