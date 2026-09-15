"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ImageIcon, PackageOpen } from "lucide-react";
import { CatalogSectionNav } from "@/components/admin/catalog-section-nav";
import { DynamicDataTable } from "@/components/global/table/DynamicTable";
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
  type LocalizedTextList,
} from "@/lib/admin/localization";
import type {
  ImageObjectFit,
  ImageObjectPosition,
} from "@/lib/catalog/image-presentation";

type ProductStatus = "draft" | "active" | "archived";

type Product = {
  _id: string;
  name: LocalizedText;
  slug: string;
  description: LocalizedText;
  categoryId: string;
  subcategoryId: string;
  collectionIds: string[];
  colorIds: string[];
  sizeIds: string[];
  basePriceMinor: number;
  currency: string;
  status: ProductStatus;
  material: LocalizedTextList;
  fit?: LocalizedText | null;
  silhouette?: LocalizedText | null;
  pattern?: LocalizedText | null;
  seasons: LocalizedTextList;
  occasions: LocalizedTextList;
  styleTags: LocalizedTextList;
  primaryImageId?: string | null;
  primaryImageObjectFit?: ImageObjectFit;
  primaryImageObjectPosition?: ImageObjectPosition;
  imageIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type ReferenceItem = {
  _id: string;
  name: LocalizedText;
  slug?: string;
  categoryId?: string;
  code?: string;
  hex?: string;
  sizeGroupId?: string;
};

type ImageReference = {
  _id: string;
  url: string;
  alt: LocalizedText;
  kind: string;
  objectFit?: ImageObjectFit;
  objectPosition?: ImageObjectPosition;
  isActive: boolean;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type ListResponse<T> = {
  items: T[];
  pagination: Pagination;
};

type ProductFilters = Record<string, unknown> & {
  status?: string | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
};

type ProductFormValues = {
  name: LocalizedText;
  slug: string;
  description: LocalizedText;
  categoryId: string;
  subcategoryId: string;
  collectionIds: string[];
  colorIds: string[];
  sizeIds: string[];
  price: number | null;
  currency: string;
  status: ProductStatus;
  material: LocalizedText;
  fit: LocalizedText;
  silhouette: LocalizedText;
  pattern: LocalizedText;
  seasons: LocalizedText;
  occasions: LocalizedText;
  styleTags: LocalizedText;
  primaryImageId: string;
  primaryImageObjectFit: ImageObjectFit;
  primaryImageObjectPosition: ImageObjectPosition;
  imageIds: string[];
  galleryUploadOne: string;
  galleryUploadTwo: string;
  galleryUploadThree: string;
};

type ApiError = Error & {
  fieldErrors?: Record<string, string>;
};

const statusOptions: DataSelectOption[] = [
  { value: "draft", label: "پیش‌نویس" },
  { value: "active", label: "فعال" },
  { value: "archived", label: "آرشیو" },
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

const numberFormatter = new Intl.NumberFormat("fa-IR");
const emptyReferenceItems: ReferenceItem[] = [];
const emptyImageReferences: ImageReference[] = [];

function referenceOption(item: ReferenceItem): DataSelectOption {
  const label = fa(item.name);

  return {
    value: item._id,
    label: label === "—" ? (item.code ?? item.slug ?? item._id) : label,
    description: item.code ?? item.slug,
    meta: item.hex ? { swatch: item.hex } : undefined,
  };
}

function referenceLabel(item: ReferenceItem) {
  const label = fa(item.name);
  return label === "—" ? (item.code ?? item.slug ?? item._id) : label;
}

function joinedReferenceLabels(ids: string[] | undefined, names: Map<string, string>) {
  return ids?.length
    ? ids.map((id) => names.get(id) ?? id).join("، ")
    : "—";
}

function emptyForm(): ProductFormValues {
  return {
    name: emptyLocalizedText(),
    slug: "",
    description: emptyLocalizedText(),
    categoryId: "",
    subcategoryId: "",
    collectionIds: [],
    colorIds: [],
    sizeIds: [],
    price: null,
    currency: "USD",
    status: "draft",
    material: emptyLocalizedText(),
    fit: emptyLocalizedText(),
    silhouette: emptyLocalizedText(),
    pattern: emptyLocalizedText(),
    seasons: emptyLocalizedText(),
    occasions: emptyLocalizedText(),
    styleTags: emptyLocalizedText(),
    primaryImageId: "",
    primaryImageObjectFit: "cover",
    primaryImageObjectPosition: "center",
    imageIds: [],
    galleryUploadOne: "",
    galleryUploadTwo: "",
    galleryUploadThree: "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function splitList(value: string) {
  return value
    .split(/[,،\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function textToList(value: LocalizedText): LocalizedTextList {
  return {
    fa: splitList(value.fa),
    en: splitList(value.en),
    ar: splitList(value.ar),
  };
}

function listToText(value?: LocalizedTextList | null): LocalizedText {
  return {
    fa: value?.fa?.join("، ") ?? "",
    en: value?.en?.join(", ") ?? "",
    ar: value?.ar?.join("، ") ?? "",
  };
}

function statusLabel(value: ProductStatus) {
  return statusOptions.find((option) => option.value === value)?.label ?? value;
}

function formatDigits(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replace(/\d/g, (digit) =>
    new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(Number(digit)),
  );
}

function formatPrice(minor: number, currency: string) {
  const amount = minor / 100;
  try {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${numberFormatter.format(amount)} ${currency}`;
  }
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function uploadedImageId(response: unknown) {
  const payload = response as {
    imageId?: string;
    image?: { _id?: string; id?: string };
  };
  return payload.imageId ?? payload.image?._id ?? payload.image?.id ?? "";
}

function coerceImageId(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const payload = value as { id?: string; _id?: string; imageId?: string };
    return payload.imageId ?? payload.id ?? payload._id ?? "";
  }
  return "";
}

function uniqueImageIds(values: ProductFormValues) {
  return Array.from(
    new Set(
      [
        ...values.imageIds,
        values.galleryUploadOne,
        values.galleryUploadTwo,
        values.galleryUploadThree,
      ]
        .map(coerceImageId)
        .filter(Boolean),
    ),
  );
}

function productToForm(product: Product): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    collectionIds: product.collectionIds ?? [],
    colorIds: product.colorIds ?? [],
    sizeIds: product.sizeIds ?? [],
    price: product.basePriceMinor / 100,
    currency: product.currency,
    status: product.status,
    material: listToText(product.material),
    fit: product.fit ?? emptyLocalizedText(),
    silhouette: product.silhouette ?? emptyLocalizedText(),
    pattern: product.pattern ?? emptyLocalizedText(),
    seasons: listToText(product.seasons),
    occasions: listToText(product.occasions),
    styleTags: listToText(product.styleTags),
    primaryImageId: product.primaryImageId ?? "",
    primaryImageObjectFit: product.primaryImageObjectFit ?? "cover",
    primaryImageObjectPosition:
      product.primaryImageObjectPosition ?? "center",
    imageIds: product.imageIds ?? [],
    galleryUploadOne: "",
    galleryUploadTwo: "",
    galleryUploadThree: "",
  };
}

function cleanLocalized(value?: LocalizedText | null) {
  return trimLocalized(value ?? emptyLocalizedText());
}

function formPayload(values: ProductFormValues) {
  return {
    name: cleanLocalized(values.name),
    slug: slugify(values.slug),
    description: cleanLocalized(values.description),
    categoryId: values.categoryId,
    subcategoryId: values.subcategoryId,
    collectionIds: values.collectionIds,
    colorIds: values.colorIds,
    sizeIds: values.sizeIds,
    basePriceMinor: Math.round(Number(values.price ?? 0) * 100),
    currency: values.currency.trim().toUpperCase(),
    status: values.status,
    material: textToList(values.material),
    fit: cleanLocalized(values.fit),
    silhouette: cleanLocalized(values.silhouette),
    pattern: cleanLocalized(values.pattern),
    seasons: textToList(values.seasons),
    occasions: textToList(values.occasions),
    styleTags: textToList(values.styleTags),
    primaryImageId: coerceImageId(values.primaryImageId) || null,
    primaryImageObjectFit: values.primaryImageObjectFit,
    primaryImageObjectPosition: values.primaryImageObjectPosition,
    imageIds: uniqueImageIds(values),
  };
}

function toTableResult<T>(data: ListResponse<T>): DynamicTableResult<T> {
  return {
    items: data.items,
    total: data.pagination.total,
    page: data.pagination.page,
    pageSize: data.pagination.limit,
    pageCount: data.pagination.pages,
  };
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
    message: typed?.message ?? "ذخیره محصول انجام نشد.",
    fieldErrors: typed?.fieldErrors,
  };
}

function requiredLocalized(value: LocalizedText | undefined, label: string) {
  if (!value?.fa.trim() || !value.en.trim() || !value.ar.trim()) {
    return `${label} باید برای فارسی، انگلیسی و عربی تکمیل شود.`;
  }
  return null;
}

function validateProduct(values: ProductFormValues) {
  const errors: Record<string, string> = {};

  const nameError = requiredLocalized(values.name, "نام محصول");
  if (nameError) errors["name.fa"] = nameError;

  const descriptionError = requiredLocalized(
    values.description,
    "توضیحات محصول",
  );
  if (descriptionError) errors["description.fa"] = descriptionError;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    errors.slug = "شناسه URL باید انگلیسی، کوچک و با خط تیره باشد.";
  }
  if (!values.categoryId) errors.categoryId = "دسته‌بندی را انتخاب کنید.";
  if (!values.subcategoryId) errors.subcategoryId = "زیردسته را انتخاب کنید.";
  if (!values.colorIds.length) errors.colorIds = "حداقل یک رنگ انتخاب کنید.";
  if (!values.sizeIds.length) errors.sizeIds = "حداقل یک سایز انتخاب کنید.";
  if (
    values.price === null ||
    !Number.isFinite(Number(values.price)) ||
    Number(values.price) < 0
  ) {
    errors.price = "قیمت معتبر وارد کنید.";
  }
  if (!/^[A-Za-z]{3}$/.test(values.currency.trim())) {
    errors.currency = "کد ارز باید سه حرف انگلیسی باشد.";
  }

  return errors;
}

function localizedFields(
  prefix: string,
  label: string,
  kind: "input" | "textarea",
) {
  return (["fa", "en", "ar"] as const).map((locale) => ({
    kind,
    name: `${prefix}.${locale}`,
    label: `${label} ${
      locale === "fa" ? "فارسی" : locale === "en" ? "انگلیسی" : "عربی"
    }`,
    dir: locale === "en" ? ("ltr" as const) : ("rtl" as const),
    ...(kind === "textarea" ? { rows: 5 } : {}),
  }));
}

function imageUploadField(
  name: string,
  label: string,
  imageMap: Map<string, ImageReference>,
  required = false,
) {
  return {
    kind: "file" as const,
    name,
    label,
    required,
    uploadUrl: "/api/admin/uploads/catalog-image?kind=product",
    uploadFieldName: "file",
    accept: "image/jpeg,image/png,image/webp",
    maxSizeBytes: 5 * 1024 * 1024,
    preview: "image" as const,
    buttonLabel: "انتخاب و آپلود تصویر",
    removeLabel: "حذف تصویر",
    cancelLabel: "لغو آپلود",
    helperText: "فایل JPG، PNG یا WebP تا ۵ مگابایت قابل آپلود است.",
    parseUploadResponse: uploadedImageId,
    format: (value: unknown) => {
      const imageId = coerceImageId(value);
      return imageMap.get(imageId)?.url ?? imageId;
    },
  };
}

function buildSchema({
  categoryOptions,
  subcategoryOptions,
  collectionOptions,
  colorOptions,
  sizeOptions,
  imageOptions,
  imageMap,
}: {
  categoryOptions: DataSelectOption[];
  subcategoryOptions: DataSelectOption[];
  collectionOptions: DataSelectOption[];
  colorOptions: DataSelectOption[];
  sizeOptions: DataSelectOption[];
  imageOptions: DataSelectOption[];
  imageMap: Map<string, ImageReference>;
}): DynamicFormSchema<ProductFormValues> {
  return {
    validate: validateProduct,
    fields: [
      {
        kind: "input",
        name: "slug",
        label: "شناسه URL",
        required: true,
        dir: "ltr",
        placeholder: "signature-cashmere-jacket",
        parse: (value) => slugify(value),
      },
      ...localizedFields("name", "نام محصول", "input").map((field) => ({
        ...field,
        required: true,
      })),
      ...localizedFields("description", "توضیحات محصول", "textarea").map(
        (field) => ({
          ...field,
          required: true,
          rows: 6,
        }),
      ),
      {
        kind: "select",
        name: "categoryId",
        label: "دسته‌بندی",
        options: categoryOptions,
        required: true,
        searchable: true,
        placeholder: "انتخاب دسته",
      },
      {
        kind: "select",
        name: "subcategoryId",
        label: "زیردسته",
        options: subcategoryOptions,
        required: true,
        searchable: true,
        placeholder: "انتخاب زیردسته",
      },
      {
        kind: "multi-select",
        name: "collectionIds",
        label: "کالکشن‌ها",
        options: collectionOptions,
        searchable: true,
        allowSelectAll: true,
        helperText: "محصول می‌تواند در چند کالکشن نمایش داده شود.",
      },
      {
        kind: "multi-select",
        name: "colorIds",
        label: "رنگ‌های محصول",
        options: colorOptions,
        searchable: true,
        allowSelectAll: true,
        required: true,
        helperText: "همه رنگ‌هایی که این محصول با آن‌ها قابل سفارش است انتخاب کنید.",
      },
      {
        kind: "multi-select",
        name: "sizeIds",
        label: "سایزهای محصول",
        options: sizeOptions,
        searchable: true,
        allowSelectAll: true,
        required: true,
        helperText: "همه سایزهای قابل ارائه برای این محصول را انتخاب کنید.",
      },
      {
        kind: "input",
        inputType: "number",
        name: "price",
        label: "قیمت",
        required: true,
        min: 0,
        step: 0.01,
        inputMode: "decimal",
        suffixText: "واحد اصلی ارز",
      },
      {
        kind: "input",
        name: "currency",
        label: "کد ارز",
        required: true,
        dir: "ltr",
        maxLength: 3,
        placeholder: "USD",
        parse: (value) => value.toUpperCase(),
      },
      {
        kind: "select",
        name: "status",
        label: "وضعیت محصول",
        options: statusOptions,
        required: true,
      },
      imageUploadField("primaryImageId", "تصویر اصلی محصول", imageMap, false),
      {
        kind: "select",
        name: "primaryImageObjectFit",
        label: "پوشش تصویر اصلی",
        options: objectFitOptions,
        required: true,
      },
      {
        kind: "select",
        name: "primaryImageObjectPosition",
        label: "موقعیت تصویر اصلی",
        options: objectPositionOptions,
        required: true,
      },
      {
        kind: "multi-select",
        name: "imageIds",
        label: "گالری تصاویر موجود",
        options: imageOptions,
        searchable: true,
        helperText: "تصاویر آپلودشده قبلی را به گالری محصول اضافه کنید.",
      },
      imageUploadField("galleryUploadOne", "آپلود تصویر گالری ۱", imageMap),
      imageUploadField("galleryUploadTwo", "آپلود تصویر گالری ۲", imageMap),
      imageUploadField("galleryUploadThree", "آپلود تصویر گالری ۳", imageMap),
      ...localizedFields("material", "متریال‌ها", "textarea"),
      ...localizedFields("fit", "فیت", "input"),
      ...localizedFields("silhouette", "سیلوئت", "input"),
      ...localizedFields("pattern", "الگو", "input"),
      ...localizedFields("seasons", "فصل‌ها", "textarea"),
      ...localizedFields("occasions", "موقعیت استفاده", "textarea"),
      ...localizedFields("styleTags", "تگ‌های استایل", "textarea"),
    ],
    sections: [
      {
        id: "identity",
        title: "هویت محصول",
        description: "نام، شناسه URL و متن اصلی محصول برای هر سه زبان سایت.",
        fieldNames: [
          "slug",
          "name.fa",
          "name.en",
          "name.ar",
          "description.fa",
          "description.en",
          "description.ar",
        ],
      },
      {
        id: "catalog",
        title: "جایگاه در کاتالوگ",
        description: "دسته، زیردسته، کالکشن، قیمت و وضعیت انتشار محصول.",
        fieldNames: [
          "categoryId",
          "subcategoryId",
          "collectionIds",
          "colorIds",
          "sizeIds",
          "price",
          "currency",
          "status",
        ],
      },
      {
        id: "media",
        title: "تصاویر محصول",
        description: "تصویر اصلی و گالری از همین فرم قابل آپلود یا انتخاب است.",
        fieldNames: [
          "primaryImageId",
          "primaryImageObjectFit",
          "primaryImageObjectPosition",
          "imageIds",
          "galleryUploadOne",
          "galleryUploadTwo",
          "galleryUploadThree",
        ],
      },
      {
        id: "attributes",
        title: "ویژگی‌ها و تگ‌ها",
        description:
          "برای لیست‌ها هر مقدار را با ویرگول، ویرگول فارسی یا خط جدید جدا کنید.",
        fieldNames: [
          "material.fa",
          "material.en",
          "material.ar",
          "fit.fa",
          "fit.en",
          "fit.ar",
          "silhouette.fa",
          "silhouette.en",
          "silhouette.ar",
          "pattern.fa",
          "pattern.en",
          "pattern.ar",
          "seasons.fa",
          "seasons.en",
          "seasons.ar",
          "occasions.fa",
          "occasions.en",
          "occasions.ar",
          "styleTags.fa",
          "styleTags.en",
          "styleTags.ar",
        ],
      },
    ],
  };
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const tone =
    status === "active"
      ? "border-[var(--adt-success)]/30 bg-[var(--adt-success)]/[0.06] text-[var(--adt-success)]"
      : status === "archived"
        ? "border-[var(--adt-danger)]/30 bg-[var(--adt-danger)]/[0.06] text-[var(--adt-danger)]"
        : "border-[var(--adt-warning)]/30 bg-[var(--adt-warning)]/[0.06] text-[var(--adt-warning)]";

  return (
    <span
      className={`inline-flex border px-2 py-1 text-[8px] font-semibold ${tone}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function ImagePreview({ image }: { image?: ImageReference }) {
  return (
    <span
      className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[6px] border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] text-[var(--adt-muted)]"
      style={
        image
          ? {
              backgroundImage: `url("${image.url}")`,
              backgroundPosition: image.objectPosition ?? "center",
              backgroundSize:
                image.objectFit === "contain" ? "contain" : "cover",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      {image ? null : <ImageIcon size={18} />}
    </span>
  );
}

export function ProductManager({
  canRead,
  canWrite,
}: {
  canRead: boolean;
  canWrite: boolean;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories", "options"],
    queryFn: () =>
      fetchJson<ListResponse<ReferenceItem>>(
        "/api/catalog/categories?limit=100&isActive=true",
      ),
    enabled: canRead,
  });

  const subcategoriesQuery = useQuery({
    queryKey: ["catalog", "subcategories", "options"],
    queryFn: () =>
      fetchJson<ListResponse<ReferenceItem>>(
        "/api/catalog/subcategories?limit=100&isActive=true",
      ),
    enabled: canRead,
  });

  const collectionsQuery = useQuery({
    queryKey: ["catalog", "collections", "options"],
    queryFn: () =>
      fetchJson<ListResponse<ReferenceItem>>(
        "/api/catalog/collections?limit=100&isActive=true",
      ),
    enabled: canRead,
  });

  const colorsQuery = useQuery({
    queryKey: ["catalog", "colors", "options"],
    queryFn: () =>
      fetchJson<ListResponse<ReferenceItem>>(
        "/api/catalog/colors?limit=100&isActive=true",
      ),
    enabled: canRead,
  });

  const sizesQuery = useQuery({
    queryKey: ["catalog", "sizes", "options"],
    queryFn: () =>
      fetchJson<ListResponse<ReferenceItem>>(
        "/api/catalog/sizes?limit=100&isActive=true",
      ),
    enabled: canRead,
  });

  const imagesQuery = useQuery({
    queryKey: ["catalog", "product-images", "options"],
    queryFn: () =>
      fetchJson<ListResponse<ImageReference>>(
        "/api/catalog/images?limit=100&isActive=true&kind=product",
      ),
    enabled: canRead,
  });

  const categories = categoriesQuery.data?.items ?? emptyReferenceItems;
  const subcategories = subcategoriesQuery.data?.items ?? emptyReferenceItems;
  const collections = collectionsQuery.data?.items ?? emptyReferenceItems;
  const colors = colorsQuery.data?.items ?? emptyReferenceItems;
  const sizes = sizesQuery.data?.items ?? emptyReferenceItems;
  const images = imagesQuery.data?.items ?? emptyImageReferences;

  const categoryNames = useMemo(
    () => new Map(categories.map((item) => [item._id, fa(item.name)])),
    [categories],
  );
  const subcategoryNames = useMemo(
    () => new Map(subcategories.map((item) => [item._id, fa(item.name)])),
    [subcategories],
  );
  const collectionNames = useMemo(
    () => new Map(collections.map((item) => [item._id, fa(item.name)])),
    [collections],
  );
  const colorNames = useMemo(
    () => new Map(colors.map((item) => [item._id, fa(item.name)])),
    [colors],
  );
  const sizeNames = useMemo(
    () => new Map(sizes.map((item) => [item._id, referenceLabel(item)])),
    [sizes],
  );
  const imageMap = useMemo(
    () => new Map(images.map((image) => [image._id, image])),
    [images],
  );

  const categoryOptions = useMemo<DataSelectOption[]>(
    () =>
      categories.map((category) => ({
        value: category._id,
        label: fa(category.name),
        description: category.slug,
      })),
    [categories],
  );

  const subcategoryOptions = useMemo<DataSelectOption[]>(
    () =>
      subcategories.map((subcategory) => ({
        value: subcategory._id,
        label: fa(subcategory.name),
        description: subcategory.categoryId
          ? categoryNames.get(subcategory.categoryId)
          : subcategory.slug,
      })),
    [categoryNames, subcategories],
  );

  const collectionOptions = useMemo<DataSelectOption[]>(
    () => collections.map(referenceOption),
    [collections],
  );

  const colorOptions = useMemo<DataSelectOption[]>(
    () => colors.map(referenceOption),
    [colors],
  );

  const sizeOptions = useMemo<DataSelectOption[]>(
    () => sizes.map(referenceOption),
    [sizes],
  );

  const imageOptions = useMemo<DataSelectOption[]>(
    () =>
      images.map((image) => ({
        value: image._id,
        label: fa(image.alt),
        description: image.url,
      })),
    [images],
  );

  const reloadReferences = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["catalog", "product-images"],
    });
    void queryClient.invalidateQueries({ queryKey: ["catalog", "categories"] });
    void queryClient.invalidateQueries({
      queryKey: ["catalog", "subcategories"],
    });
    void queryClient.invalidateQueries({ queryKey: ["catalog", "collections"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog", "colors"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog", "sizes"] });
  }, [queryClient]);

  const schema = useMemo(
    () =>
      buildSchema({
        categoryOptions,
        subcategoryOptions,
        collectionOptions,
        colorOptions,
        sizeOptions,
        imageOptions,
        imageMap,
      }),
    [
      categoryOptions,
      collectionOptions,
      colorOptions,
      imageMap,
      imageOptions,
      sizeOptions,
      subcategoryOptions,
    ],
  );

  const columns = useMemo<DynamicColumn<Product>[]>(
    () => [
      {
        id: "name",
        label: "محصول",
        minWidth: 290,
        sticky: "start",
        lockVisibility: true,
        cell: ({ record }) => (
          <div className="flex min-w-0 items-center gap-3">
            <ImagePreview
              image={
                record.primaryImageId
                  ? imageMap.get(record.primaryImageId)
                  : undefined
              }
            />
            <span className="min-w-0">
              <strong className="block truncate text-[10px] font-bold">
                {fa(record.name)}
              </strong>
              <span className="mt-0.5 block truncate text-[8px] text-[var(--adt-muted)]">
                {record.slug}
              </span>
            </span>
          </div>
        ),
        mobile: { priority: 1, showLabel: false },
      },
      {
        id: "categoryId",
        label: "دسته",
        accessor: "categoryId",
        minWidth: 150,
        cell: ({ record }) => categoryNames.get(record.categoryId) ?? "—",
        mobile: { priority: 2 },
      },
      {
        id: "subcategoryId",
        label: "زیردسته",
        accessor: "subcategoryId",
        minWidth: 150,
        cell: ({ record }) => subcategoryNames.get(record.subcategoryId) ?? "—",
        mobile: { priority: 3 },
      },
      {
        id: "price",
        label: "قیمت",
        minWidth: 130,
        cell: ({ record }) =>
          formatPrice(record.basePriceMinor, record.currency),
        mobile: { priority: 4 },
      },
      {
        id: "status",
        label: "وضعیت",
        accessor: "status",
        minWidth: 110,
        cell: ({ record }) => <StatusBadge status={record.status} />,
        mobile: { priority: 5 },
      },
      {
        id: "collections",
        label: "کالکشن‌ها",
        minWidth: 220,
        defaultHidden: true,
        cell: ({ record }) =>
          joinedReferenceLabels(record.collectionIds, collectionNames),
        mobile: { hidden: true },
      },
      {
        id: "colors",
        label: "رنگ‌ها",
        minWidth: 180,
        cell: ({ record }) => joinedReferenceLabels(record.colorIds, colorNames),
        mobile: { hidden: true },
      },
      {
        id: "sizes",
        label: "سایزها",
        minWidth: 180,
        cell: ({ record }) => joinedReferenceLabels(record.sizeIds, sizeNames),
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
    [
      categoryNames,
      collectionNames,
      colorNames,
      imageMap,
      sizeNames,
      subcategoryNames,
    ],
  );

  const filters = useMemo<DynamicFilterDefinition<ProductFilters, Product>[]>(
    () => [
      {
        id: "status",
        kind: "select",
        label: "وضعیت",
        options: statusOptions,
        defaultValue: null,
        badge: (value) =>
          typeof value === "string"
            ? statusLabel(value as ProductStatus)
            : null,
      },
      {
        id: "categoryId",
        kind: "select",
        label: "دسته",
        options: categoryOptions,
        defaultValue: null,
        searchable: true,
        badge: (value) =>
          typeof value === "string" ? categoryNames.get(value) ?? null : null,
      },
      {
        id: "subcategoryId",
        kind: "select",
        label: "زیردسته",
        options: subcategoryOptions,
        defaultValue: null,
        searchable: true,
        badge: (value) =>
          typeof value === "string" ? subcategoryNames.get(value) ?? null : null,
      },
    ],
    [categoryNames, categoryOptions, subcategoryNames, subcategoryOptions],
  );

  if (!canRead) {
    return (
      <div className="min-w-0 p-3 sm:p-4 lg:p-5">
        <CatalogSectionNav />
        <section className="mt-3 border border-[var(--adt-border)] bg-[var(--adt-surface)] p-6 text-right text-[var(--adt-text)]">
          <PackageOpen className="mb-3 text-[var(--adt-warning)]" size={22} />
          <h1 className="text-[16px] font-bold">دسترسی محصولات فعال نیست</h1>
          <p className="mt-2 text-[10px] leading-6 text-[var(--adt-muted)]">
            برای دیدن و مدیریت محصولات، دسترسی catalog.read لازم است.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-3 p-3 sm:p-4 lg:p-5">
      <CatalogSectionNav />

      <DynamicDataTable<
        Product,
        ProductFormValues,
        ProductFormValues,
        ProductFilters
      >
        tableId="admin-products"
        eyebrow="کاتالوگ محصول"
        title="مدیریت محصولات"
        description="محصول را از صفر بسازید: متن چندزبانه، جایگاه کاتالوگ، رنگ، سایز، قیمت، وضعیت، تصویر اصلی و گالری."
        source={{
          queryKey: ["catalog", "products"],
          fetchPage: async ({
            page,
            pageSize,
            search,
            filters: activeFilters,
            signal,
          }) => {
            const params = new URLSearchParams({
              page: String(page),
              limit: String(pageSize),
            });
            if (search) params.set("search", search);
            if (activeFilters.status) {
              params.set("status", String(activeFilters.status));
            }
            if (activeFilters.categoryId) {
              params.set("categoryId", String(activeFilters.categoryId));
            }
            if (activeFilters.subcategoryId) {
              params.set("subcategoryId", String(activeFilters.subcategoryId));
            }
            return toTableResult(
              await fetchJson<ListResponse<Product>>(
                `/api/catalog/products?${params.toString()}`,
                { signal },
              ),
            );
          },
          fetchOne: async ({ id, signal }) =>
            fetchJson<Product>(`/api/catalog/products/${id}`, { signal }),
        }}
        columns={columns}
        getRowId={(record) => record._id}
        getRowLabel={(record) => fa(record.name)}
        search={{
          placeholder: "جستجو با نام، شناسه URL یا SKU...",
          debounceMs: 320,
        }}
        filters={filters}
        initialFilters={{ status: null, categoryId: null, subcategoryId: null }}
        pagination={{
          initialPageSize: 15,
          pageSizeOptions: [10, 15, 25, 50],
          showPageNumbers: true,
        }}
        columnVisibility={{
          enabled: true,
          persist: true,
          storageKey: "admin-products-columns",
        }}
        mobile={{
          title: (record) => fa(record.name),
          subtitle: (record) => record.slug,
          badge: (record) => <StatusBadge status={record.status} />,
          fieldIds: ["categoryId", "subcategoryId", "price", "status"],
          maxFields: 4,
        }}
        crud={{
          create: {
            enabled: canWrite,
            label: "محصول جدید",
            title: "ساخت محصول",
            description:
              "فیلدهای ضروری محصول را کامل کنید؛ تصاویر آپلودی مستقیم به کتابخانه محصول اضافه می‌شوند.",
            schema,
            initialValues: emptyForm,
            mutationFn: async ({ values }) =>
              fetchJson<Product>("/api/catalog/products", {
                method: "POST",
                body: JSON.stringify(formPayload(values)),
              }),
            mapError: mapFormError,
            onSuccess: (record) => {
              reloadReferences();
              toast.success("محصول ساخته شد", {
                description:
                  record && "_id" in record
                    ? `${fa(record.name)} به کاتالوگ اضافه شد.`
                    : undefined,
              });
            },
          },
          edit: {
            enabled: canWrite,
            title: (record) => `ویرایش ${fa(record.name)}`,
            description:
              "تغییرات محصول، تصاویر و ویژگی‌ها بعد از ذخیره روی کاتالوگ اعمال می‌شود.",
            schema,
            toInitialValues: productToForm,
            mutationFn: async ({ id, values }) =>
              fetchJson<Product>(`/api/catalog/products/${id}`, {
                method: "PATCH",
                body: JSON.stringify(formPayload(values)),
              }),
            mapError: mapFormError,
            onSuccess: (record) => {
              reloadReferences();
              toast.success("تغییرات محصول ذخیره شد", {
                description:
                  record && "_id" in record
                    ? `${fa(record.name)} به‌روزرسانی شد.`
                    : undefined,
              });
            },
          },
          view: {
            title: (record) => `مشاهده ${fa(record.name)}`,
            fields: [
              {
                id: "name",
                label: "نام فارسی",
                render: ({ record }) => fa(record.name),
              },
              { id: "slug", label: "شناسه URL", accessor: "slug" },
              {
                id: "category",
                label: "دسته",
                render: ({ record }) => categoryNames.get(record.categoryId) ?? "—",
              },
              {
                id: "subcategory",
                label: "زیردسته",
                render: ({ record }) =>
                  subcategoryNames.get(record.subcategoryId) ?? "—",
              },
              {
                id: "price",
                label: "قیمت",
                render: ({ record }) =>
                  formatPrice(record.basePriceMinor, record.currency),
              },
              {
                id: "colors",
                label: "رنگ‌ها",
                render: ({ record }) =>
                  joinedReferenceLabels(record.colorIds, colorNames),
              },
              {
                id: "sizes",
                label: "سایزها",
                render: ({ record }) =>
                  joinedReferenceLabels(record.sizeIds, sizeNames),
              },
              {
                id: "status",
                label: "وضعیت",
                render: ({ record }) => <StatusBadge status={record.status} />,
              },
              {
                id: "primaryImage",
                label: "تصویر اصلی",
                render: ({ record }) => (
                  <span className="inline-flex items-center gap-3">
                    <ImagePreview
                      image={
                        record.primaryImageId
                          ? imageMap.get(record.primaryImageId)
                          : undefined
                      }
                    />
                    <span>
                      {record.primaryImageId
                        ? imageMap.get(record.primaryImageId)?.url ??
                          record.primaryImageId
                        : "—"}
                    </span>
                  </span>
                ),
              },
              {
                id: "description",
                label: "توضیحات فارسی",
                colSpan: "full",
                render: ({ record }) => fa(record.description),
              },
              {
                id: "gallery",
                label: "تعداد تصاویر گالری",
                render: ({ record }) => formatDigits(record.imageIds?.length ?? 0),
              },
              {
                id: "updatedAt",
                label: "آخرین ویرایش",
                render: ({ record }) => formatDate(record.updatedAt),
              },
            ],
            sections: [
              {
                id: "identity",
                title: "هویت",
                fieldIds: ["name", "slug", "category", "subcategory"],
              },
              {
                id: "commerce",
                title: "فروش",
                fieldIds: [
                  "price",
                  "colors",
                  "sizes",
                  "status",
                  "primaryImage",
                  "gallery",
                ],
              },
              {
                id: "content",
                title: "محتوا",
                fieldIds: ["description", "updatedAt"],
              },
            ],
          },
          delete: {
            enabled: canWrite,
            title: (record) => `آرشیو کردن ${fa(record.name)}`,
            description: (record) => (
              <>
                محصول <strong>{fa(record.name)}</strong> حذف فیزیکی نمی‌شود؛
                وضعیت آن به آرشیو تغییر می‌کند.
              </>
            ),
            dangerLevel: "soft",
            confirmLabel: "آرشیو کردن",
            mutationFn: async ({ id }) => {
              await fetchJson(`/api/catalog/products/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "archived" }),
              });
            },
            mapError: (error) =>
              error instanceof Error
                ? error.message
                : "آرشیو محصول انجام نشد. دوباره تلاش کنید.",
            onSuccess: (record) => {
              toast.warning("محصول آرشیو شد", {
                description: `${fa(record.name)} از لیست محصولات فعال خارج شد.`,
              });
            },
          },
          extraRowActions: [
            {
              id: "copy-slug",
              label: "کپی شناسه URL",
              icon: <Copy size={14} />,
              onClick: async (record) => {
                await navigator.clipboard.writeText(record.slug);
                toast.info("شناسه URL کپی شد", { description: record.slug });
              },
            },
          ],
        }}
        labels={{
          filters: "فیلتر محصولات",
          clearFilters: "پاک کردن فیلترها",
          applyFilters: "اعمال فیلترها",
          pendingFilters: "فیلتر فعال",
          columns: "ستون‌ها",
          create: "محصول جدید",
          view: "مشاهده",
          edit: "ویرایش",
          delete: "آرشیو",
          actions: "عملیات",
          rowsPerPage: "تعداد در صفحه",
        }}
        emptyState={{
          title: "هنوز محصولی ساخته نشده",
          description: "اولین محصول را با متن، قیمت، دسته و تصاویر بسازید.",
          filteredTitle: "محصولی با این شرایط پیدا نشد",
          filteredDescription:
            "عبارت جستجو یا فیلترهای انتخاب‌شده را تغییر دهید.",
        }}
      />
    </div>
  );
}
