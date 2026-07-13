import Image from "next/image";
import Link from "next/link";

import { FooterWordmark } from "./wordmark";
import type {
  FooterLink,
  FooterLocale,
  FooterProps,
  FooterSection,
  FooterTrustItem,
} from "./footer.types";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const MISSING_TRUST_IMAGE_SOURCES = new Set([
  "/assets/images/enemad.png",
  "/assets/images/meliNeshan.png",
]);

/** One shared focus treatment so every interactive element behaves identically. */
const FOCUS_RING = cn(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94420]",
  "focus-visible:ring-offset-4 focus-visible:ring-offset-[#FCFAF7]",
  "dark:focus-visible:ring-[#E18A68] dark:focus-visible:ring-offset-[#0B1117]",
);

/** Quiet text link with an animated, direction-aware hairline underline. */
const TEXT_LINK = cn(
  "relative inline-block text-sm leading-7 text-[#6C6662]",
  "transition-colors duration-300 hover:text-[#231F20]",
  "dark:text-[#B8B2AC] dark:hover:text-[#F8F5F0]",
  "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left",
  "after:scale-x-0 after:bg-current after:opacity-50 after:transition-transform",
  "after:duration-300 after:ease-out hover:after:scale-x-100 rtl:after:origin-right",
  FOCUS_RING,
);

/** Small accent dash used before every column heading. */
function HeadingAccent() {
  return (
    <span
      aria-hidden="true"
      className="h-px w-4 shrink-0 bg-[#A94420]/70 dark:bg-[#E18A68]/70"
    />
  );
}

function FooterTextLink({
  link,
  className,
}: {
  link: FooterLink;
  className?: string;
}) {
  const sharedClassName = cn(TEXT_LINK, className);

  if (link.external) {
    return (
      <a
        href={link.href}
        aria-label={link.ariaLabel}
        target="_blank"
        rel="noreferrer"
        className={sharedClassName}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      aria-label={link.ariaLabel}
      className={sharedClassName}
    >
      {link.label}
    </Link>
  );
}

function FooterSectionBlock({ section }: { section: FooterSection }) {
  return (
    <nav aria-label={section.title}>
      <h3 className="flex items-center gap-3 text-sm font-medium text-[#231F20] dark:text-[#F8F5F0]">
        <HeadingAccent />
        {section.title}
      </h3>

      <ul className="mt-6 space-y-3.5">
        {section.links.map((link) => (
          <li key={`${section.id}-${link.href}`}>
            <FooterTextLink link={link} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterTrustBadge({ item }: { item: FooterTrustItem }) {
  const badgeContent = (
    <span
      className={cn(
        "flex h-20 w-20 items-center justify-center border border-[#DED8D1] bg-white/60",
        "transition-colors duration-300 dark:border-[#2C343C] dark:bg-white/[0.03]",
        item.href &&
          "group-hover/badge:border-[#A94420]/50 dark:group-hover/badge:border-[#E18A68]/50",
      )}
    >
      <Image
        src={item.image.src}
        alt={item.image.alt}
        width={item.image.width}
        height={item.image.height}
        className="h-14 w-14 object-contain"
      />
    </span>
  );

  if (!item.href) {
    return badgeContent;
  }

  const wrapperClassName = cn(
    "group/badge inline-flex transition-transform duration-300 hover:-translate-y-0.5",
    FOCUS_RING,
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        aria-label={item.ariaLabel}
        target="_blank"
        rel="noreferrer"
        className={wrapperClassName}
      >
        {badgeContent}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      aria-label={item.ariaLabel}
      className={wrapperClassName}
    >
      {badgeContent}
    </Link>
  );
}

export function Footer(props: FooterProps) {
  const sectionId =
    typeof props.id === "string" && props.id.trim().length > 0
      ? props.id.trim()
      : "site-footer";

  const locale: FooterLocale = props.locale === "en" ? "en" : "fa";
  const direction = locale === "fa" ? "rtl" : "ltr";
  const currentYear = new Date().getFullYear();

  const trustItems = (props.trustItems ?? []).filter(
    (item) => !MISSING_TRUST_IMAGE_SOURCES.has(item.image.src),
  );
  const socialLinks = props.socialLinks ?? [];
  const homeHref = props.homeHref ?? "/";

  return (
    <footer
      id={sectionId}
      dir={direction}
      className={cn(
        "border-t border-[#DED8D1] bg-[#FCFAF7] dark:border-[#2C343C] dark:bg-[#0B1117]",
        props.className,
      )}
    >
      <div className="mx-auto max-w-[1700px] px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-10 xl:py-24">
          <div className="lg:col-span-5">
            {props.logo ? (
              <Link
                href={homeHref}
                aria-label={`بازگشت به صفحه اصلی ${props.brandLabel}`}
                className={cn("inline-flex", FOCUS_RING)}
              >
                <Image
                  src={props.logo.src}
                  alt={props.logo.alt}
                  width={props.logo.width}
                  height={props.logo.height}
                  className="h-20 w-auto object-contain"
                />
              </Link>
            ) : (
              <Link
                href={homeHref}
                className={cn(
                  "inline-flex text-lg font-medium text-[#231F20] dark:text-[#F8F5F0]",
                  FOCUS_RING,
                )}
              >
                {props.brandLabel}
              </Link>
            )}

            <p className="mt-6 max-w-xl text-pretty text-sm leading-8 text-[#6C6662] dark:text-[#B8B2AC] sm:text-base">
              {props.description}
            </p>

            {socialLinks.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <FooterTextLink
                      link={link}
                      className="text-xs uppercase tracking-[0.18em]"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
            {props.sections.map((section) => (
              <FooterSectionBlock key={section.id} section={section} />
            ))}
          </div>

          {trustItems.length > 0 ? (
            <div className="lg:col-span-2">
              <h3 className="flex items-center gap-3 text-sm font-medium text-[#231F20] dark:text-[#F8F5F0]">
                <HeadingAccent />
                اعتماد
              </h3>

              <div className="mt-6 flex items-center gap-3">
                {trustItems.map((item) => (
                  <FooterTrustBadge key={item.id} item={item} />
                ))}
              </div>

              <p className="mt-5 text-sm leading-7 text-[#6C6662] dark:text-[#B8B2AC]">
                تجربه‌ای آرام، دقیق و متعهد به کیفیت.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-[#DED8D1] py-6 dark:border-[#2C343C] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#6C6662] dark:text-[#B8B2AC] sm:text-sm">
            © {currentYear} {props.copyrightLabel}. تمامی حقوق محفوظ است.
          </p>

          {props.tagline ? (
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#A94420] dark:text-[#E18A68] sm:text-xs">
              {props.tagline}
            </p>
          ) : null}
        </div>
      </div>

      <FooterWordmark wordmark={props.wordmark} />
    </footer>
  );
}
