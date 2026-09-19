"use client";

import { memo, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import {
  Copy,
  Crosshair,
  ImageOff,
  Images,
  PackageOpen,
  Plus,
  Trash2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CatalogSectionNav } from "@/components/admin/catalog-section-nav";
import { DynamicDataTable } from "@/components/global/table/DynamicTable";
import {
  DataButton,
  DataInput,
  DataSelect,
} from "@/components/global/table/primitives";
import type {
  DataSelectOption,
  DynamicColumn,
  DynamicFilterDefinition,
  DynamicFormSchema,
  DynamicTableResult,
} from "@/components/global/table/types";
import { useToast } from "@/components/ui/CustomToast";
import {
  emptyLocalizedText,
  fa,
  trimLocalized,
  type LocalizedText,
} from "@/lib/admin/localization";
import type {
  ImageObjectFit,
  ImageObjectPosition,
} from "@/lib/catalog/image-presentation";

type Kind =
  | "product"
  | "category_banner"
  | "subcategory_banner"
  | "collection_banner"
  | "editorial"
  | "lookbook";

type ProductLink = {
  productId: string;
  variantId?: string | null;
  label?: LocalizedText;
  hotspotX?: number;
  hotspotY?: number;
  sortOrder: number;
};

type ImageAsset = {
  _id: string;
  url: string;
  alt: LocalizedText;
  storyTitle?: LocalizedText;
  storyDescription?: LocalizedText;
  storyCtaLabel?: LocalizedText;
  storyProductLimit?: number;
  storyRevealEnabled?: boolean;
  kind: Kind;
  width?: number | null;
  height?: number | null;
  objectFit: ImageObjectFit;
  objectPosition: ImageObjectPosition;
  focalPointX: number;
  focalPointY: number;
  linkedProducts: ProductLink[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ImageFormValues = {
  url: string;
  alt: LocalizedText;
  storyTitle: LocalizedText;
  storyDescription: LocalizedText;
  storyCtaLabel: LocalizedText;
  storyProductLimit: number;
  storyRevealEnabled: boolean;
  kind: Kind;
  width?: number | null;
  height?: number | null;
  objectFit: ImageObjectFit;
  objectPosition: ImageObjectPosition;
  focalPointX: number;
  focalPointY: number;
  linkedProducts: ProductLink[];
  isActive: boolean;
};

type Product = {
  _id: string;
  name: LocalizedText;
  slug: string;
};

type Variant = {
  _id: string;
  sku: string;
  productId: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type List<T> = {
  items: T[];
  pagination: Pagination;
};

type ImageFilters = Record<string, unknown> & {
  kind?: string | null;
  isActive?: string | null;
};

type ApiError = Error & {
  fieldErrors?: Record<string, string>;
};

const kinds: Kind[] = [
  "product",
  "category_banner",
  "subcategory_banner",
  "collection_banner",
  "editorial",
  "lookbook",
];

const kindOptions: DataSelectOption[] = kinds.map((kind) => ({
  value: kind,
  label: labelKind(kind),
}));

const activeOptions: DataSelectOption[] = [
  { value: "true", label: "فعال" },
  { value: "false", label: "غیرفعال" },
];

const objectFitOptions: DataSelectOption[] = [
  { value: "cover", label: "پوشش کامل" },
  { value: "contain", label: "نمایش کامل تصویر" },
  { value: "fill", label: "کشیده داخل قاب" },
  { value: "none", label: "اندازه اصلی" },
  { value: "scale-down", label: "کوچک‌سازی در صورت نیاز" },
];

const objectPositionOptions: DataSelectOption[] = [
  { value: "center", label: "وسط" },
  { value: "top", label: "بالا" },
  { value: "bottom", label: "پایین" },
  { value: "left", label: "چپ" },
  { value: "right", label: "راست" },
  { value: "left top", label: "چپ بالا" },
  { value: "right top", label: "راست بالا" },
  { value: "left bottom", label: "چپ پایین" },
  { value: "right bottom", label: "راست پایین" },
];

const emptyProducts: Product[] = [];
const emptyVariants: Variant[] = [];
const emptySelectOptions: DataSelectOption[] = [];
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function labelKind(kind: Kind) {
  return {
    product: "محصول",
    category_banner: "بنر دسته",
    subcategory_banner: "بنر زیردسته",
    collection_banner: "بنر کالکشن",
    editorial: "ادیتوریال",
    lookbook: "لوک‌بوک",
  }[kind];
}

function emptyForm(): ImageFormValues {
  return {
    url: "",
    alt: emptyLocalizedText(),
    storyTitle: emptyLocalizedText(),
    storyDescription: emptyLocalizedText(),
    storyCtaLabel: emptyLocalizedText(),
    storyProductLimit: 3,
    storyRevealEnabled: true,
    kind: "editorial",
    width: null,
    height: null,
    objectFit: "cover",
    objectPosition: "center",
    focalPointX: 50,
    focalPointY: 50,
    linkedProducts: [],
    isActive: true,
  };
}

function imageToForm(asset: ImageAsset): ImageFormValues {
  return {
    url: asset.url,
    alt: asset.alt,
    storyTitle: asset.storyTitle ?? emptyLocalizedText(),
    storyDescription: asset.storyDescription ?? emptyLocalizedText(),
    storyCtaLabel: asset.storyCtaLabel ?? emptyLocalizedText(),
    storyProductLimit: asset.storyProductLimit ?? 3,
    storyRevealEnabled: asset.storyRevealEnabled ?? true,
    kind: asset.kind,
    width: asset.width ?? null,
    height: asset.height ?? null,
    objectFit: asset.objectFit ?? "cover",
    objectPosition: asset.objectPosition ?? "center",
    focalPointX: asset.focalPointX ?? 50,
    focalPointY: asset.focalPointY ?? 50,
    linkedProducts: asset.linkedProducts ?? [],
    isActive: asset.isActive,
  };
}

function validImageUrl(value: string) {
  return value.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(value);
}

function cleanLinkedProducts(links: ProductLink[]) {
  return links
    .filter((link) => link.productId)
    .map((link, index) => ({
      productId: link.productId,
      ...(link.variantId ? { variantId: link.variantId } : {}),
      label: link.label ? trimLocalized(link.label) : undefined,
      hotspotX: link.hotspotX,
      hotspotY: link.hotspotY,
      sortOrder: Number.isFinite(Number(link.sortOrder))
        ? Number(link.sortOrder)
        : index,
    }));
}

function formPayload(values: ImageFormValues) {
  return {
    url: values.url.trim(),
    alt: trimLocalized(values.alt),
    storyTitle: trimLocalized(values.storyTitle),
    storyDescription: trimLocalized(values.storyDescription),
    storyCtaLabel: trimLocalized(values.storyCtaLabel),
    storyProductLimit: Math.max(1, Math.min(6, Number(values.storyProductLimit) || 3)),
    storyRevealEnabled: values.storyRevealEnabled,
    kind: values.kind,
    width: values.width ? Number(values.width) : null,
    height: values.height ? Number(values.height) : null,
    objectFit: values.objectFit,
    objectPosition: values.objectPosition,
    focalPointX: Math.max(0, Math.min(100, Number(values.focalPointX) || 50)),
    focalPointY: Math.max(0, Math.min(100, Number(values.focalPointY) || 50)),
    linkedProducts: cleanLinkedProducts(values.linkedProducts),
    isActive: values.isActive,
  };
}

function formatDigits(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

function formatDate(value?: string) {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

function toTableResult<T>(data: List<T>): DynamicTableResult<T> {
  return {
    items: data.items,
    total: data.pagination.total,
    page: data.pagination.page,
    pageSize: data.pagination.limit,
    pageCount: data.pagination.pages,
  };
}

function getImageRowId(record: ImageAsset) {
  return record._id;
}

function getImageRowLabel(record: ImageAsset) {
  return fa(record.alt);
}

function fieldErrorPath(path: Array<string | number> | undefined) {
  return path?.map(String).join(".");
}

async function readApiError(response: Response): Promise<ApiError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const body = payload as {
    error?: string;
    message?: string;
    details?: Array<{ path?: Array<string | number>; message?: string }>;
  } | null;

  const error = new Error(
    body?.error ?? body?.message ?? "درخواست انجام نشد. دوباره تلاش کنید.",
  ) as ApiError;

  if (Array.isArray(body?.details)) {
    error.fieldErrors = Object.fromEntries(
      body.details
        .map((issue) => [fieldErrorPath(issue.path), issue.message] as const)
        .filter(
          (issue): issue is readonly [string, string] =>
            Boolean(issue[0]) && Boolean(issue[1]),
        ),
    );
  }

  return error;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw await readApiError(response);
  return (await response.json()) as T;
}

function mapFormError(error: unknown) {
  const typed = error as ApiError;
  return {
    message: typed?.message ?? "ذخیره تصویر انجام نشد.",
    fieldErrors: typed?.fieldErrors,
  };
}

function validateImage(values: ImageFormValues) {
  const errors: Record<string, string> = {};
  if (!validImageUrl(values.url)) {
    errors.url = "آدرس تصویر باید با http، https یا / شروع شود.";
  }
  if (!values.alt.fa.trim() || !values.alt.en.trim() || !values.alt.ar.trim()) {
    errors["alt.fa"] = "متن جایگزین باید برای فارسی، انگلیسی و عربی تکمیل شود.";
  }
  if (
    values.width !== null &&
    values.width !== undefined &&
    Number(values.width) < 1
  ) {
    errors.width = "عرض باید عددی بزرگ‌تر از صفر باشد.";
  }
  if (
    values.height !== null &&
    values.height !== undefined &&
    Number(values.height) < 1
  ) {
    errors.height = "ارتفاع باید عددی بزرگ‌تر از صفر باشد.";
  }
  values.linkedProducts.forEach((link, index) => {
    if (!link.productId) return;
    const hasX = link.hotspotX !== undefined && link.hotspotX !== null;
    const hasY = link.hotspotY !== undefined && link.hotspotY !== null;
    if (hasX !== hasY) {
      errors.linkedProducts = `برای پیوند ${formatDigits(index + 1)} هر دو مختصات افقی و عمودی لازم است.`;
    }
    if (hasX && (Number(link.hotspotX) < 0 || Number(link.hotspotX) > 100)) {
      errors.linkedProducts = "مختصات افقی باید بین ۰ تا ۱۰۰ باشد.";
    }
    if (hasY && (Number(link.hotspotY) < 0 || Number(link.hotspotY) > 100)) {
      errors.linkedProducts = "مختصات عمودی باید بین ۰ تا ۱۰۰ باشد.";
    }
  });
  return errors;
}

function buildSchema({
  products,
  variants,
}: {
  products: Product[];
  variants: Variant[];
}): DynamicFormSchema<ImageFormValues> {
  return {
    validate: validateImage,
    fields: [
      {
        kind: "input",
        name: "url",
        label: "آدرس تصویر",
        required: true,
        dir: "ltr",
        inputType: "url",
        placeholder: "https://... یا /uploads/...",
      },
      {
        kind: "textarea",
        name: "alt.fa",
        label: "متن جایگزین فارسی",
        required: true,
        rows: 3,
      },
      {
        kind: "textarea",
        name: "alt.en",
        label: "متن جایگزین انگلیسی",
        required: true,
        dir: "ltr",
        rows: 3,
      },
      {
        kind: "textarea",
        name: "alt.ar",
        label: "متن جایگزین عربی",
        required: true,
        rows: 3,
      },
      {
        kind: "textarea",
        name: "storyTitle.fa",
        label: "عنوان داینامیک آیلند فارسی",
        rows: 2,
      },
      {
        kind: "textarea",
        name: "storyDescription.fa",
        label: "توضیح داینامیک آیلند فارسی",
        rows: 2,
      },
      {
        kind: "textarea",
        name: "storyCtaLabel.fa",
        label: "متن دکمه داینامیک آیلند",
        rows: 2,
      },
      {
        kind: "input",
        inputType: "number",
        name: "storyProductLimit",
        label: "تعداد محصول در داینامیک آیلند",
        min: 1,
        max: 6,
        step: 1,
        inputMode: "numeric",
      },
      {
        kind: "boolean",
        name: "storyRevealEnabled",
        label: "باز شدن پنل محصول",
        onLabel: "فعال",
        offLabel: "مستقیم به صفحه محصول",
      },
      {
        kind: "select",
        name: "kind",
        label: "نوع تصویر",
        options: kindOptions,
        required: true,
      },
      {
        kind: "boolean",
        name: "isActive",
        label: "وضعیت نمایش",
        onLabel: "فعال",
        offLabel: "غیرفعال",
      },
      {
        kind: "select",
        name: "objectFit",
        label: "پوشش تصویر",
        options: objectFitOptions,
        required: true,
      },
      {
        kind: "select",
        name: "objectPosition",
        label: "موقعیت تصویر",
        options: objectPositionOptions,
        required: true,
      },
      {
        kind: "input",
        inputType: "number",
        name: "width",
        label: "عرض",
        min: 1,
        step: 1,
        inputMode: "numeric",
        helperText: "اختیاری",
      },
      {
        kind: "input",
        inputType: "number",
        name: "height",
        label: "ارتفاع",
        min: 1,
        step: 1,
        inputMode: "numeric",
        helperText: "اختیاری",
      },
      {
        kind: "input",
        inputType: "number",
        name: "focalPointX",
        label: "نقطه تمرکز افقی",
        min: 0,
        max: 100,
        step: 1,
        suffixText: "%",
      },
      {
        kind: "input",
        inputType: "number",
        name: "focalPointY",
        label: "نقطه تمرکز عمودی",
        min: 0,
        max: 100,
        step: 1,
        suffixText: "%",
      },
      {
        kind: "custom",
        name: "linkedProducts",
        label: "پیوند محصول و نقاط خرید",
        colSpan: "full",
        render: ({ value, values, setValue, error, disabled, readOnly }) => (
          <HotspotComposer
            imageUrl={values.url}
            objectFit={values.objectFit}
            objectPosition={values.objectPosition}
            links={Array.isArray(value) ? (value as ProductLink[]) : []}
            products={products}
            variants={variants}
            error={error}
            disabled={disabled || readOnly}
            onChange={setValue}
          />
        ),
      },
    ],
    sections: [
      {
        id: "source",
        title: "منبع و دسترس‌پذیری",
        description:
          "تصویر با URL ذخیره می‌شود و متن جایگزین برای هر سه زبان لازم است.",
        fieldNames: [
          "url",
          "alt.fa",
          "alt.en",
          "alt.ar",
          "storyTitle.fa",
          "storyDescription.fa",
          "storyCtaLabel.fa",
          "storyProductLimit",
          "storyRevealEnabled",
          "kind",
          "isActive",
        ],
      },
      {
        id: "presentation",
        title: "نمایش تصویر",
        description:
          "پوشش، موقعیت، ابعاد و نقطه تمرکز برای استفاده در صفحات مختلف.",
        fieldNames: [
          "objectFit",
          "objectPosition",
          "width",
          "height",
          "focalPointX",
          "focalPointY",
          "storyProductLimit",
          "storyRevealEnabled",
        ],
      },
      {
        id: "links",
        title: "تصویر خریدپذیر",
        description:
          "محصول‌ها را به تصویر وصل کنید و نقطه دقیق هر محصول را روی تصویر بگذارید.",
        fieldNames: ["linkedProducts"],
      },
    ],
  };
}

function statusBadge(active: boolean) {
  return (
    <span
      className={`inline-flex border px-2 py-1 text-[8px] font-semibold ${
        active
          ? "border-[var(--adt-success)]/30 bg-[var(--adt-success)]/[0.06] text-[var(--adt-success)]"
          : "border-[var(--adt-danger)]/30 bg-[var(--adt-danger)]/[0.06] text-[var(--adt-danger)]"
      }`}
    >
      {active ? "فعال" : "غیرفعال"}
    </span>
  );
}

const ImageThumb = memo(function ImageThumb({
  asset,
}: {
  asset?: Pick<ImageAsset, "url" | "objectFit" | "objectPosition">;
}) {
  return (
    <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-[6px] border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] text-[var(--adt-muted)]">
      {asset?.url ? (
        <img
          src={asset.url}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full"
          style={{
            objectFit: asset.objectFit ?? "cover",
            objectPosition: asset.objectPosition ?? "center",
          }}
        />
      ) : (
        <ImageOff size={18} />
      )}
    </span>
  );
});

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const HotspotComposer = memo(function HotspotComposer({
  imageUrl,
  objectFit,
  objectPosition,
  links,
  products,
  variants,
  error,
  disabled,
  onChange,
}: {
  imageUrl: string;
  objectFit: ImageObjectFit;
  objectPosition: ImageObjectPosition;
  links: ProductLink[];
  products: Product[];
  variants: Variant[];
  error?: string;
  disabled: boolean;
  onChange: (links: ProductLink[]) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [placing, setPlacing] = useState(false);
  const debouncedImageUrl = useDebouncedValue(imageUrl, 350);
  const previewUrl =
    debouncedImageUrl && validImageUrl(debouncedImageUrl)
      ? debouncedImageUrl
      : "";

  const productOptions = useMemo<DataSelectOption[]>(
    () =>
      products.map((product) => ({
        value: product._id,
        label: fa(product.name),
        description: product.slug,
      })),
    [products],
  );

  const variantsByProduct = useMemo(() => {
    const map = new Map<string, DataSelectOption[]>();
    for (const variant of variants) {
      const current = map.get(variant.productId);
      const option = { value: variant._id, label: variant.sku };
      if (current) current.push(option);
      else map.set(variant.productId, [option]);
    }
    return map;
  }, [variants]);

  function updateLink(index: number, patch: Partial<ProductLink>) {
    onChange(
      links.map((link, itemIndex) =>
        itemIndex === index ? { ...link, ...patch } : link,
      ),
    );
  }

  function addLink() {
    const next = [...links, { productId: "", sortOrder: links.length }];
    onChange(next);
    setSelectedIndex(next.length - 1);
  }

  function removeLink(index: number) {
    onChange(links.filter((_, itemIndex) => itemIndex !== index));
    setSelectedIndex(Math.max(0, index - 1));
  }

  function placeHotspot(event: MouseEvent<HTMLDivElement>) {
    if (!placing || disabled || !links[selectedIndex]) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - bounds.left) / bounds.width) * 100);
    const y = Math.round(((event.clientY - bounds.top) / bounds.height) * 100);
    updateLink(selectedIndex, {
      hotspotX: Math.max(0, Math.min(100, x)),
      hotspotY: Math.max(0, Math.min(100, y)),
    });
    setPlacing(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="min-w-0">
        <div
          role="button"
          tabIndex={placing ? 0 : -1}
          aria-label="بوم جای‌گذاری نقطه محصول"
          onClick={placeHotspot}
          onKeyDown={(event) => {
            if (
              (event.key === "Enter" || event.key === " ") &&
              links[selectedIndex]
            ) {
              updateLink(selectedIndex, { hotspotX: 50, hotspotY: 50 });
              setPlacing(false);
            }
          }}
          className={`relative aspect-[4/5] min-h-[320px] overflow-hidden rounded-[6px] border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] ${
            placing ? "cursor-crosshair ring-2 ring-[var(--adt-accent)]/30" : ""
          }`}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full select-none"
              style={{ objectFit, objectPosition }}
            />
          ) : (
            <div className="grid h-full place-items-center text-center text-[10px] text-[var(--adt-muted)]">
              <span>
                <Images className="mx-auto mb-2" size={24} />
                آدرس معتبر تصویر را وارد کنید
              </span>
            </div>
          )}

          {links.map((link, index) =>
            link.hotspotX !== undefined && link.hotspotY !== undefined ? (
              <button
                key={`${link.productId || "draft"}-${index}`}
                type="button"
                disabled={disabled}
                aria-label={`انتخاب نقطه ${formatDigits(index + 1)}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedIndex(index);
                  setPlacing(false);
                }}
                className={`absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[9px] font-bold shadow-[0_8px_24px_rgba(0,0,0,0.25)] ${
                  selectedIndex === index
                    ? "border-[var(--adt-accent)] bg-[var(--adt-accent)] text-white"
                    : "border-white/80 bg-black/70 text-white"
                }`}
                style={{
                  left: `${link.hotspotX}%`,
                  top: `${link.hotspotY}%`,
                }}
              >
                {formatDigits(index + 1)}
              </button>
            ) : null,
          )}
        </div>
        <p className="mt-2 text-[9px] leading-5 text-[var(--adt-muted)]">
          {placing
            ? "روی تصویر کلیک کنید تا مختصات همین پیوند ثبت شود."
            : "برای جای‌گذاری دقیق، اول یک پیوند را انتخاب کنید و دکمه نقطه‌گذاری را بزنید."}
        </p>
      </div>

      <div className="min-w-0 space-y-3">
        {links.length === 0 ? (
          <div className="border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-4 py-8 text-center text-[10px] text-[var(--adt-muted)]">
            هنوز محصولی به این تصویر وصل نشده است.
          </div>
        ) : null}

        {links.map((link, index) => {
          const variantOptions =
            variantsByProduct.get(link.productId) ?? emptySelectOptions;

          return (
            <article
              key={index}
              className={`min-w-0 border p-3 ${
                selectedIndex === index
                  ? "border-[var(--adt-accent)] bg-[var(--adt-accent)]/[0.05]"
                  : "border-[var(--adt-border)] bg-[var(--adt-surface)]"
              }`}
            >
              <header className="mb-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedIndex(index)}
                  className="cursor-pointer text-[10px] font-bold text-[var(--adt-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/30"
                >
                  پیوند {formatDigits(index + 1)}
                </button>
                <DataButton
                  tone="ghost"
                  size="sm"
                  icon={<Trash2 size={13} />}
                  disabled={disabled}
                  onClick={() => removeLink(index)}
                >
                  حذف
                </DataButton>
              </header>

              <div className="grid gap-3 md:grid-cols-2">
                <DataSelect
                  label="محصول"
                  value={link.productId || null}
                  options={productOptions}
                  searchable
                  clearable
                  disabled={disabled}
                  onChange={(value) =>
                    updateLink(index, {
                      productId: String(value ?? ""),
                      variantId: null,
                    })
                  }
                />
                <DataSelect
                  label="تنوع"
                  value={link.variantId || null}
                  options={variantOptions}
                  searchable
                  clearable
                  disabled={disabled || !link.productId}
                  placeholder={
                    link.productId ? "همه تنوع‌ها" : "اول محصول را انتخاب کنید"
                  }
                  onChange={(value) =>
                    updateLink(index, {
                      variantId: value ? String(value) : null,
                    })
                  }
                />
                <DataInput
                  label="برچسب فارسی"
                  value={link.label?.fa ?? ""}
                  disabled={disabled}
                  onChange={(event) =>
                    updateLink(index, {
                      label: {
                        ...(link.label ?? emptyLocalizedText()),
                        fa: event.target.value,
                      },
                    })
                  }
                />
                <DataInput
                  label="برچسب انگلیسی"
                  dir="ltr"
                  value={link.label?.en ?? ""}
                  disabled={disabled}
                  onChange={(event) =>
                    updateLink(index, {
                      label: {
                        ...(link.label ?? emptyLocalizedText()),
                        en: event.target.value,
                      },
                    })
                  }
                />
                <DataInput
                  label="مختصات افقی"
                  type="number"
                  min={0}
                  max={100}
                  suffixText="%"
                  value={link.hotspotX ?? ""}
                  disabled={disabled}
                  onChange={(event) =>
                    updateLink(index, {
                      hotspotX:
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                    })
                  }
                />
                <DataInput
                  label="مختصات عمودی"
                  type="number"
                  min={0}
                  max={100}
                  suffixText="%"
                  value={link.hotspotY ?? ""}
                  disabled={disabled}
                  onChange={(event) =>
                    updateLink(index, {
                      hotspotY:
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                    })
                  }
                />
                <DataInput
                  label="ترتیب"
                  type="number"
                  value={link.sortOrder}
                  disabled={disabled}
                  onChange={(event) =>
                    updateLink(index, { sortOrder: Number(event.target.value) })
                  }
                />
                <br />
                <div className="flex items-end gap-2">
                  <DataButton
                    tone={
                      placing && selectedIndex === index
                        ? "warning"
                        : "secondary"
                    }
                    size="md"
                    icon={<Crosshair size={14} />}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedIndex(index);
                      setPlacing(true);
                    }}
                  >
                    نقطه‌گذاری
                  </DataButton>
                  <DataButton
                    tone="ghost"
                    size="md"
                    disabled={disabled}
                    onClick={() =>
                      updateLink(index, {
                        hotspotX: undefined,
                        hotspotY: undefined,
                      })
                    }
                  >
                    پاک کردن نقطه
                  </DataButton>
                </div>
              </div>
            </article>
          );
        })}

        {error ? (
          <p className="text-[9px] leading-5 text-[var(--adt-danger)]">
            {error}
          </p>
        ) : null}

        <DataButton
          tone="secondary"
          size="md"
          icon={<Plus size={14} />}
          disabled={disabled}
          onClick={addLink}
        >
          افزودن پیوند محصول
        </DataButton>
      </div>
    </div>
  );
});

export function ImageStories({
  canRead,
  canWrite,
}: {
  canRead: boolean;
  canWrite: boolean;
}) {
  const toast = useToast();

  const productsQuery = useQuery({
    queryKey: ["catalog", "products", "image-story-options"],
    queryFn: () =>
      fetchJson<List<Product>>("/api/catalog/products?limit=100&status=active"),
    enabled: canRead,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const variantsQuery = useQuery({
    queryKey: ["catalog", "variants", "image-story-options"],
    queryFn: () => fetchJson<List<Variant>>("/api/catalog/variants?limit=100"),
    enabled: canRead,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const products = productsQuery.data?.items ?? emptyProducts;
  const variants = variantsQuery.data?.items ?? emptyVariants;
  const schema = useMemo(
    () => buildSchema({ products, variants }),
    [products, variants],
  );

  const columns = useMemo<DynamicColumn<ImageAsset>[]>(
    () => [
      {
        id: "image",
        label: "تصویر",
        minWidth: 280,
        sticky: "start",
        lockVisibility: true,
        cell: ({ record }) => (
          <div className="flex min-w-0 items-center gap-3">
            <ImageThumb asset={record} />
            <span className="min-w-0">
              <strong className="block truncate text-[10px] font-bold">
                {fa(record.alt)}
              </strong>
              <span className="mt-0.5 block truncate text-[8px] text-[var(--adt-muted)]">
                {record.url}
              </span>
            </span>
          </div>
        ),
        mobile: { priority: 1, showLabel: false },
      },
      {
        id: "kind",
        label: "نوع",
        accessor: "kind",
        minWidth: 140,
        cell: ({ record }) => labelKind(record.kind),
        mobile: { priority: 2 },
      },
      {
        id: "isActive",
        label: "وضعیت",
        accessor: "isActive",
        minWidth: 110,
        cell: ({ record }) => statusBadge(record.isActive),
        mobile: { priority: 3 },
      },
      {
        id: "linkedProducts",
        label: "پیوند محصول",
        minWidth: 130,
        cell: ({ record }) => formatDigits(record.linkedProducts?.length ?? 0),
        mobile: { priority: 4 },
      },
      {
        id: "focal",
        label: "تمرکز",
        minWidth: 110,
        cell: ({ record }) =>
          `${formatDigits(record.focalPointX ?? 50)} / ${formatDigits(record.focalPointY ?? 50)}`,
        mobile: { priority: 5 },
      },
      {
        id: "size",
        label: "ابعاد",
        minWidth: 130,
        defaultHidden: true,
        cell: ({ record }) =>
          record.width && record.height
            ? `${formatDigits(record.width)} × ${formatDigits(record.height)}`
            : "—",
        mobile: { hidden: true },
      },
      {
        id: "updatedAt",
        label: "آخرین ویرایش",
        accessor: "updatedAt",
        minWidth: 160,
        defaultHidden: true,
        cell: ({ record }) => formatDate(record.updatedAt),
        mobile: { hidden: true },
      },
    ],
    [],
  );

  const filters = useMemo<DynamicFilterDefinition<ImageFilters, ImageAsset>[]>(
    () => [
      {
        id: "kind",
        kind: "select",
        label: "نوع تصویر",
        options: kindOptions,
        defaultValue: null,
        badge: (value) =>
          typeof value === "string" ? labelKind(value as Kind) : null,
      },
      {
        id: "isActive",
        kind: "select",
        label: "وضعیت",
        options: activeOptions,
        defaultValue: null,
        badge: (value) =>
          value === "true" ? "فعال" : value === "false" ? "غیرفعال" : null,
      },
    ],
    [],
  );

  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const source = useMemo(
    () => ({
      queryKey: ["catalog", "images"],
      fetchPage: async ({
        page,
        pageSize,
        search,
        filters: activeFilters,
        signal,
      }: {
        page: number;
        pageSize: number;
        search?: string | null;
        filters: ImageFilters;
        signal?: AbortSignal;
      }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
        });
        if (search) params.set("search", search);
        if (activeFilters.kind) params.set("kind", String(activeFilters.kind));
        if (activeFilters.isActive) {
          params.set("isActive", String(activeFilters.isActive));
        }
        return toTableResult(
          await fetchJson<List<ImageAsset>>(
            `/api/catalog/images?${params.toString()}`,
            { signal },
          ),
        );
      },
      fetchOne: async ({ id, signal }: { id: string; signal?: AbortSignal }) =>
        fetchJson<ImageAsset>(`/api/catalog/images/${id}`, { signal }),
    }),
    [],
  );

  const searchConfig = useMemo(
    () => ({
      placeholder: "جستجو با متن جایگزین یا آدرس تصویر...",
      debounceMs: 450,
    }),
    [],
  );

  const initialFilters = useMemo<ImageFilters>(
    () => ({ kind: null, isActive: null }),
    [],
  );

  const pagination = useMemo(
    () => ({
      initialPageSize: 12,
      pageSizeOptions: [12, 24, 48],
      showPageNumbers: true,
    }),
    [],
  );

  const columnVisibility = useMemo(
    () => ({
      enabled: true,
      persist: true,
      storageKey: "admin-image-stories-columns",
    }),
    [],
  );

  const mobile = useMemo(
    () => ({
      title: (record: ImageAsset) => fa(record.alt),
      subtitle: (record: ImageAsset) => record.url,
      badge: (record: ImageAsset) => statusBadge(record.isActive),
      fieldIds: ["kind", "linkedProducts", "focal", "isActive"],
      maxFields: 4,
    }),
    [],
  );

  const crud = useMemo(
    () => ({
      create: {
        enabled: canWrite,
        label: "تصویر جدید",
        title: "افزودن تصویر",
        description:
          "تصویر با URL ذخیره می‌شود؛ برای نقاط خریدپذیر، محصول را در بخش پیوند محصول وصل کنید.",
        schema,
        initialValues: emptyForm,
        mutationFn: async ({ values }: { values: ImageFormValues }) =>
          fetchJson<ImageAsset>("/api/catalog/images", {
            method: "POST",
            body: JSON.stringify(formPayload(values)),
          }),
        mapError: mapFormError,
        onSuccess: (record: ImageAsset | void) => {
          toastRef.current.success("تصویر ساخته شد", {
            description:
              record && "_id" in record
                ? `${fa(record.alt)} به کتابخانه اضافه شد.`
                : undefined,
          });
        },
      },
      edit: {
        enabled: canWrite,
        title: (record: ImageAsset) => `ویرایش ${fa(record.alt)}`,
        description:
          "متن جایگزین، نوع تصویر، نحوه نمایش و نقاط خریدپذیر را ویرایش کنید.",
        schema,
        toInitialValues: imageToForm,
        mutationFn: async ({ id, values }: { id: string; values: ImageFormValues }) =>
          fetchJson<ImageAsset>(`/api/catalog/images/${id}`, {
            method: "PATCH",
            body: JSON.stringify(formPayload(values)),
          }),
        mapError: mapFormError,
        onSuccess: (record: ImageAsset | void, original: ImageAsset) => {
          toastRef.current.success("تغییرات تصویر ذخیره شد", {
            description:
              record && "_id" in record
                ? `${fa(record.alt)} به‌روزرسانی شد.`
                : `${fa(original.alt)} به‌روزرسانی شد.`,
          });
        },
      },
      view: {
        title: (record: ImageAsset) => `مشاهده ${fa(record.alt)}`,
        fields: [
          {
            id: "preview",
            label: "پیش‌نمایش",
            render: ({ record }: { record: ImageAsset }) => <ImageThumb asset={record} />,
          },
          {
            id: "url",
            label: "آدرس تصویر",
            accessor: "url",
            colSpan: "full" as const,
          },
          {
            id: "alt",
            label: "متن جایگزین فارسی",
            render: ({ record }: { record: ImageAsset }) => fa(record.alt),
          },
          {
            id: "kind",
            label: "نوع",
            render: ({ record }: { record: ImageAsset }) => labelKind(record.kind),
          },
          {
            id: "status",
            label: "وضعیت",
            render: ({ record }: { record: ImageAsset }) => statusBadge(record.isActive),
          },
          {
            id: "links",
            label: "پیوند محصول",
            render: ({ record }: { record: ImageAsset }) =>
              formatDigits(record.linkedProducts?.length ?? 0),
          },
          {
            id: "focal",
            label: "نقطه تمرکز",
            render: ({ record }: { record: ImageAsset }) =>
              `${formatDigits(record.focalPointX)} / ${formatDigits(record.focalPointY)}`,
          },
          {
            id: "updatedAt",
            label: "آخرین ویرایش",
            render: ({ record }: { record: ImageAsset }) => formatDate(record.updatedAt),
          },
        ],
        sections: [
          {
            id: "identity",
            title: "تصویر",
            fieldIds: ["preview", "url", "alt", "kind", "status"],
          },
          {
            id: "behavior",
            title: "نمایش و اتصال",
            fieldIds: ["links", "focal", "updatedAt"],
          },
        ],
      },
      delete: {
        enabled: canWrite,
        title: (record: ImageAsset) => `غیرفعال کردن ${fa(record.alt)}`,
        description: (record: ImageAsset) => (
          <>
            تصویر <strong>{fa(record.alt)}</strong> حذف فیزیکی نمی‌شود؛ فقط از
            استفاده فعال خارج می‌شود.
          </>
        ),
        dangerLevel: "soft" as const,
        confirmLabel: "غیرفعال کردن",
        mutationFn: async ({ id }: { id: string }) => {
          await fetchJson(`/api/catalog/images/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ isActive: false }),
          });
        },
        mapError: (error: unknown) =>
          error instanceof Error
            ? error.message
            : "غیرفعال‌سازی تصویر انجام نشد. دوباره تلاش کنید.",
        onSuccess: (record: ImageAsset) => {
          toastRef.current.warning("تصویر غیرفعال شد", {
            description: `${fa(record.alt)} دیگر به عنوان تصویر فعال نمایش داده نمی‌شود.`,
          });
        },
      },
      extraRowActions: [
        {
          id: "copy-url",
          label: "کپی آدرس",
          icon: <Copy size={14} />,
          onClick: async (record: ImageAsset) => {
            await navigator.clipboard.writeText(record.url);
            toastRef.current.info("آدرس تصویر کپی شد", {
              description: record.url,
            });
          },
        },
      ],
    }),
    [canWrite, schema],
  );

  const labels = useMemo(
    () => ({
      filters: "فیلتر تصاویر",
      clearFilters: "پاک کردن فیلترها",
      applyFilters: "اعمال فیلترها",
      pendingFilters: "فیلتر فعال",
      columns: "ستون‌ها",
      create: "تصویر جدید",
      view: "مشاهده",
      edit: "ویرایش",
      delete: "غیرفعال‌سازی",
      actions: "عملیات",
      rowsPerPage: "تعداد در صفحه",
    }),
    [],
  );

  const emptyState = useMemo(
    () => ({
      title: "هنوز تصویری ثبت نشده",
      description:
        "اولین تصویر را بسازید تا برای محصول، بنر یا ادیتوریال قابل استفاده باشد.",
      filteredTitle: "تصویری با این شرایط پیدا نشد",
      filteredDescription: "عبارت جستجو یا فیلترهای انتخاب‌شده را تغییر دهید.",
    }),
    [],
  );

  if (!canRead) {
    return (
      <div className="min-w-0 p-3 sm:p-4 lg:p-5">
        <CatalogSectionNav />
        <section className="mt-3 border border-[var(--adt-border)] bg-[var(--adt-surface)] p-6 text-right text-[var(--adt-text)]">
          <PackageOpen className="mb-3 text-[var(--adt-warning)]" size={22} />
          <h1 className="text-[16px] font-bold">دسترسی تصاویر فعال نیست</h1>
          <p className="mt-2 text-[10px] leading-6 text-[var(--adt-muted)]">
            برای دیدن و مدیریت تصویرها، دسترسی catalog.read لازم است.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-3 p-3 sm:p-4 lg:p-5">
      <CatalogSectionNav />

      <DynamicDataTable<
        ImageAsset,
        ImageFormValues,
        ImageFormValues,
        ImageFilters
      >
        tableId="admin-image-stories"
        eyebrow="IMAGE STORIES"
        title="مدیریت تصاویر خریدپذیر"
        description="کتابخانه تصویر، نوع تصویر، متن جایگزین، نقطه تمرکز و اتصال محصول‌ها را از یک جدول واحد مدیریت کنید."
        source={source}
        columns={columns}
        getRowId={getImageRowId}
        getRowLabel={getImageRowLabel}
        search={searchConfig}
        filters={filters}
        initialFilters={initialFilters}
        pagination={pagination}
        columnVisibility={columnVisibility}
        mobile={mobile}
        crud={crud}
        labels={labels}
        emptyState={emptyState}
      />
    </div>
  );
}
