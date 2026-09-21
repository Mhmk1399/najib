"use client";

import { CategoryLandingPage } from "@/components/static/Category/CategoryLandingPage";
import { Button } from "@/components/ui/Button";
import { BrandSketchLoader } from "@/components/ui/SketchLoader";
import {
  useCategoryPageData,
  useSubcategoryPageData,
} from "@/lib/catalog/storefront-client";
import { catalogPageCopy } from "@/lib/i18n/catalog-page-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { SubcategoryLandingPage } from "./SubcategoryLandingPage";

type CategoryPageClientProps = {
  categorySlug: string;
  locale: Locale;
};

type SubcategoryPageClientProps = CategoryPageClientProps & {
  subcategorySlug: string;
};

export function CategoryPageClient({
  categorySlug,
  locale,
}: CategoryPageClientProps) {
  const copy = catalogPageCopy[locale];
  const query = useCategoryPageData(categorySlug, locale);

  if (query.isLoading) {
    return <BrandSketchLoader open label={copy.loadingCategory} />;
  }

  if (query.isError) {
    return (
      <CatalogState
        title={copy.categoryErrorTitle}
        description={copy.errorDescription}
        actionLabel={copy.retry}
        locale={locale}
        onAction={() => void query.refetch()}
      />
    );
  }

  if (query.isNotFound || !query.data) {
    return (
      <CatalogState
        title={copy.categoryNotFoundTitle}
        description={copy.notFoundDescription}
        actionLabel={copy.backToShop}
        href={localizedHref("/shop", locale)}
        locale={locale}
      />
    );
  }

  return <CategoryLandingPage data={query.data} locale={locale} />;
}

export function SubcategoryPageClient({
  categorySlug,
  locale,
  subcategorySlug,
}: SubcategoryPageClientProps) {
  const copy = catalogPageCopy[locale];
  const query = useSubcategoryPageData(categorySlug, subcategorySlug, locale);

  if (query.isLoading) {
    return <BrandSketchLoader open label={copy.loadingSubcategory} />;
  }

  if (query.isError) {
    return (
      <CatalogState
        title={copy.subcategoryErrorTitle}
        description={copy.errorDescription}
        actionLabel={copy.retry}
        locale={locale}
        onAction={query.refetch}
      />
    );
  }

  if (query.isNotFound || !query.data) {
    return (
      <CatalogState
        title={copy.subcategoryNotFoundTitle}
        description={copy.notFoundDescription}
        actionLabel={copy.backToShop}
        href={localizedHref("/shop", locale)}
        locale={locale}
      />
    );
  }

  return <SubcategoryLandingPage data={query.data} locale={locale} />;
}

function CatalogState({
  title,
  description,
  actionLabel,
  href,
  onAction,
  locale,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
  locale: Locale;
}) {
  const copy = catalogPageCopy[locale];
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);

  return (
    <main
      dir={direction}
      lang={htmlLang}
      className="grid min-h-screen place-items-center bg-white px-6 text-center text-black"
    >
      <div className="max-w-[460px]">
        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-black/40">
          {copy.catalogStateEyebrow}
        </p>
        <h1 className="mt-4   text-[clamp(2.8rem,12vw,4.8rem)] leading-[0.92] tracking-[-0.05em]">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-[360px] text-[11px] leading-7 text-black/50">
          {description ?? copy.notFoundDescription}
        </p>
        {actionLabel && (
          <div className="mx-auto mt-8 max-w-[220px]">
            <Button
              href={href}
              onClick={onAction}
              variant="black"
              size="lg"
              fullWidth
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
