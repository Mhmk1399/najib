"use client";

import { CategoryLandingPage } from "@/components/static/Category/CategoryLandingPage";
import { Button } from "@/components/ui/Button";
import {
  useCategoryPageData,
  useSubcategoryPageData,
} from "@/lib/catalog/storefront-client";
import { SubcategoryLandingPage } from "./SubcategoryLandingPage";

type CategoryPageClientProps = {
  categorySlug: string;
};

type SubcategoryPageClientProps = CategoryPageClientProps & {
  subcategorySlug: string;
};

export function CategoryPageClient({ categorySlug }: CategoryPageClientProps) {
  const query = useCategoryPageData(categorySlug);

  if (query.isLoading) {
    return <CatalogState title="در حال دریافت دسته‌بندی" />;
  }

  if (query.isError) {
    return (
      <CatalogState
        title="دریافت دسته‌بندی ناموفق بود"
        description="اتصال به دیتابیس یا سرویس کاتالوگ را بررسی کنید."
        actionLabel="تلاش دوباره"
        onAction={() => void query.refetch()}
      />
    );
  }

  if (query.isNotFound || !query.data) {
    return (
      <CatalogState
        title="دسته‌بندی پیدا نشد"
        description="این دسته‌بندی هنوز فعال نشده یا آدرس آن تغییر کرده است."
        actionLabel="بازگشت به فروشگاه"
        href="/shop"
      />
    );
  }

  return <CategoryLandingPage data={query.data} />;
}

export function SubcategoryPageClient({
  categorySlug,
  subcategorySlug,
}: SubcategoryPageClientProps) {
  const query = useSubcategoryPageData(categorySlug, subcategorySlug);

  if (query.isLoading) {
    return <CatalogState title="در حال دریافت زیردسته" />;
  }

  if (query.isError) {
    return (
      <CatalogState
        title="دریافت زیردسته ناموفق بود"
        description="اتصال به دیتابیس یا سرویس کاتالوگ را بررسی کنید."
        actionLabel="تلاش دوباره"
        onAction={query.refetch}
      />
    );
  }

  if (query.isNotFound || !query.data) {
    return (
      <CatalogState
        title="زیردسته پیدا نشد"
        description="این زیردسته هنوز فعال نشده یا آدرس آن تغییر کرده است."
        actionLabel="بازگشت به فروشگاه"
        href="/shop"
      />
    );
  }

  return <SubcategoryLandingPage data={query.data} />;
}

function CatalogState({
  title,
  description = "چند لحظه صبر کنید.",
  actionLabel,
  href,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-center text-black">
      <div className="max-w-[460px]">
        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-black/40">
          Najibzadeh Catalog
        </p>
        <h1 className="mt-4 font-serif text-[clamp(2.8rem,12vw,4.8rem)] leading-[0.92] tracking-[-0.05em]">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-[360px] text-[11px] leading-7 text-black/50">
          {description}
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
