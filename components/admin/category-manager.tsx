"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Copy, ImageIcon, Layers3 } from "lucide-react";
import { DynamicDataTable } from "@/components/global/table/DynamicTable";
import { DataButton } from "@/components/global/table/primitives";
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

type Resource = "categories" | "subcategories";

type Banner = {
  imageId: string;
  objectFit: ImageObjectFit;
  objectPosition: ImageObjectPosition;
  eyebrow?: LocalizedText;
  heading: LocalizedText;
  body?: LocalizedText;
  ctaLabel?: LocalizedText;
  ctaHref?: string;
};

type Description = {
  heading?: LocalizedText;
  body: LocalizedText;
};

type PageContent = {
  primaryBanner: Banner;
  primaryDescription: Description;
  secondaryBanner: Banner;
  secondaryDescription: Description;
  seoTitle?: LocalizedText;
  seoDescription?: LocalizedText;
};

type TaxonomyRecord = {
  _id: string;
  name: LocalizedText;
  slug: string;
  description?: LocalizedText | null;
  thumbnailImageId?: string | null;
  thumbnailObjectFit: ImageObjectFit;
  thumbnailObjectPosition: ImageObjectPosition;
  categoryId?: string;
  pageContent: PageContent;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryOptionRecord = Pick<TaxonomyRecord, "_id" | "name" | "slug">;

type ImageAsset = {
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

type CatalogList<T> = {
  items: T[];
  pagination: Pagination;
};

type TaxonomyFilters = Record<string, unknown> & {
  isActive?: string | null;
  categoryId?: string | null;
};

type TaxonomyFormValues = {
  name: LocalizedText;
  slug: string;
  description: LocalizedText;
  thumbnailImageId: string;
  thumbnailObjectFit: ImageObjectFit;
  thumbnailObjectPosition: ImageObjectPosition;
  categoryId?: string;
  pageContent: PageContent;
  isActive: boolean;
  sortOrder: number;
};

type ApiError = Error & {
  fieldErrors?: Record<string, string>;
};

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

const statusOptions: DataSelectOption[] = [
  { value: "true", label: "فعال" },
  { value: "false", label: "غیرفعال" },
];

const numberFormatter = new Intl.NumberFormat("fa-IR", {
  useGrouping: false,
});

function emptyBanner(): Banner {
  return {
    imageId: "",
    objectFit: "cover",
    objectPosition: "center",
    eyebrow: emptyLocalizedText(),
    heading: emptyLocalizedText(),
    body: emptyLocalizedText(),
    ctaLabel: emptyLocalizedText(),
    ctaHref: "",
  };
}

function emptyForm(resource: Resource): TaxonomyFormValues {
  return {
    name: emptyLocalizedText(),
    slug: "",
    description: emptyLocalizedText(),
    thumbnailImageId: "",
    thumbnailObjectFit: "cover",
    thumbnailObjectPosition: "center",
    categoryId: resource === "subcategories" ? "" : undefined,
    isActive: true,
    sortOrder: 0,
    pageContent: {
      primaryBanner: emptyBanner(),
      primaryDescription: {
        heading: emptyLocalizedText(),
        body: emptyLocalizedText(),
      },
      secondaryBanner: emptyBanner(),
      secondaryDescription: {
        heading: emptyLocalizedText(),
        body: emptyLocalizedText(),
      },
      seoTitle: emptyLocalizedText(),
      seoDescription: emptyLocalizedText(),
    },
  };
}

function normalizeForm(record: TaxonomyRecord, resource: Resource): TaxonomyFormValues {
  const fallback = emptyForm(resource);
  return {
    ...fallback,
    ...record,
    description: record.description ?? emptyLocalizedText(),
    thumbnailImageId: record.thumbnailImageId ?? "",
    categoryId: resource === "subcategories" ? (record.categoryId ?? "") : undefined,
    pageContent: {
      ...fallback.pageContent,
      ...record.pageContent,
      primaryBanner: {
        ...fallback.pageContent.primaryBanner,
        ...record.pageContent.primaryBanner,
      },
      primaryDescription: {
        ...fallback.pageContent.primaryDescription,
        ...record.pageContent.primaryDescription,
      },
      secondaryBanner: {
        ...fallback.pageContent.secondaryBanner,
        ...record.pageContent.secondaryBanner,
      },
      secondaryDescription: {
        ...fallback.pageContent.secondaryDescription,
        ...record.pageContent.secondaryDescription,
      },
      seoTitle: record.pageContent.seoTitle ?? emptyLocalizedText(),
      seoDescription: record.pageContent.seoDescription ?? emptyLocalizedText(),
    },
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

function formatDigits(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replace(/\d/g, (digit) =>
    numberFormatter.format(Number(digit)),
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function imageKind(resource: Resource) {
  return resource === "categories" ? "category_banner" : "subcategory_banner";
}

function catalogUploadUrl(resource: Resource) {
  return `/api/admin/uploads/catalog-image?kind=${imageKind(resource)}`;
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

function cleanLocalized(value?: LocalizedText | null) {
  return trimLocalized(value ?? emptyLocalizedText());
}

function cleanBanner(value: Banner): Banner {
  return {
    imageId: coerceImageId(value.imageId),
    objectFit: value.objectFit,
    objectPosition: value.objectPosition,
    heading: cleanLocalized(value.heading),
    eyebrow: cleanLocalized(value.eyebrow),
    body: cleanLocalized(value.body),
    ctaLabel: cleanLocalized(value.ctaLabel),
    ctaHref: value.ctaHref?.trim() || undefined,
  };
}

function cleanDescription(value: Description): Description {
  return {
    heading: cleanLocalized(value.heading),
    body: cleanLocalized(value.body),
  };
}

function formPayload(resource: Resource, values: TaxonomyFormValues) {
  return {
    name: cleanLocalized(values.name),
    slug: slugify(values.slug),
    description: cleanLocalized(values.description),
    thumbnailImageId: coerceImageId(values.thumbnailImageId) || null,
    thumbnailObjectFit: values.thumbnailObjectFit,
    thumbnailObjectPosition: values.thumbnailObjectPosition,
    isActive: values.isActive,
    sortOrder: Number(values.sortOrder) || 0,
    ...(resource === "subcategories" ? { categoryId: values.categoryId } : {}),
    pageContent: {
      primaryBanner: cleanBanner(values.pageContent.primaryBanner),
      primaryDescription: cleanDescription(values.pageContent.primaryDescription),
      secondaryBanner: cleanBanner(values.pageContent.secondaryBanner),
      secondaryDescription: cleanDescription(values.pageContent.secondaryDescription),
      seoTitle: cleanLocalized(values.pageContent.seoTitle),
      seoDescription: cleanLocalized(values.pageContent.seoDescription),
    },
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

function toTableResult<T>(data: CatalogList<T>): DynamicTableResult<T> {
  return {
    items: data.items,
    total: data.pagination.total,
    page: data.pagination.page,
    pageSize: data.pagination.limit,
    pageCount: data.pagination.pages,
  };
}

function mapFormError(error: unknown) {
  const typed = error as ApiError;
  return {
    message: typed?.message ?? "ذخیره اطلاعات دسته‌بندی انجام نشد.",
    fieldErrors: typed?.fieldErrors,
  };
}

function requiredLocalized(value: LocalizedText | undefined, label: string) {
  if (!value?.fa.trim() || !value.en.trim() || !value.ar.trim()) {
    return `${label} باید برای فارسی، انگلیسی و عربی تکمیل شود.`;
  }
  return null;
}

function validateTaxonomy(resource: Resource, values: TaxonomyFormValues) {
  const errors: Record<string, string> = {};

  const nameError = requiredLocalized(values.name, "نام");
  if (nameError) errors["name.fa"] = nameError;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    errors.slug = "شناسه URL باید انگلیسی، کوچک و با خط تیره باشد.";
  }
  if (resource === "subcategories" && !values.categoryId) {
    errors.categoryId = "دسته مادر را انتخاب کنید.";
  }

  (["primaryBanner", "secondaryBanner"] as const).forEach((key, index) => {
    const label = index === 0 ? "بنر اول" : "بنر دوم";
    const banner = values.pageContent[key];
    if (!coerceImageId(banner.imageId)) {
      errors[`pageContent.${key}.imageId`] = `تصویر ${label} الزامی است.`;
    }
    const headingError = requiredLocalized(banner.heading, `عنوان ${label}`);
    if (headingError) errors[`pageContent.${key}.heading.fa`] = headingError;
  });

  (["primaryDescription", "secondaryDescription"] as const).forEach(
    (key, index) => {
      const label = index === 0 ? "متن توضیح اول" : "متن توضیح دوم";
      const error = requiredLocalized(values.pageContent[key].body, label);
      if (error) errors[`pageContent.${key}.body.fa`] = error;
    },
  );

  return errors;
}

function makeImageField(
  name: string,
  label: string,
  resource: Resource,
  imageMap: Map<string, ImageAsset>,
  required = false,
) {
  return {
    kind: "file" as const,
    name,
    label,
    required,
    uploadUrl: catalogUploadUrl(resource),
    uploadFieldName: "file",
    accept: "image/jpeg,image/png,image/webp",
    maxSizeBytes: 5 * 1024 * 1024,
    preview: "image" as const,
    buttonLabel: "انتخاب و آپلود تصویر",
    removeLabel: "حذف تصویر",
    cancelLabel: "لغو آپلود",
    helperText: "بعد از آپلود، تصویر به کتابخانه کاتالوگ اضافه می‌شود.",
    parseUploadResponse: uploadedImageId,
    format: (value: unknown) => {
      const imageId = coerceImageId(value);
      return imageMap.get(imageId)?.url ?? imageId;
    },
  };
}

function localizedFields(prefix: string, label: string, kind: "input" | "textarea") {
  return (["fa", "en", "ar"] as const).map((locale) => ({
    kind,
    name: `${prefix}.${locale}`,
    label: `${label} ${locale === "fa" ? "فارسی" : locale === "en" ? "انگلیسی" : "عربی"}`,
    dir: locale === "en" ? ("ltr" as const) : ("rtl" as const),
    ...(kind === "textarea" ? { rows: 4 } : {}),
  }));
}

function bannerFieldNames(key: "primaryBanner" | "secondaryBanner") {
  return [
    `pageContent.${key}.imageId`,
    `pageContent.${key}.objectFit`,
    `pageContent.${key}.objectPosition`,
    `pageContent.${key}.eyebrow.fa`,
    `pageContent.${key}.eyebrow.en`,
    `pageContent.${key}.eyebrow.ar`,
    `pageContent.${key}.heading.fa`,
    `pageContent.${key}.heading.en`,
    `pageContent.${key}.heading.ar`,
    `pageContent.${key}.body.fa`,
    `pageContent.${key}.body.en`,
    `pageContent.${key}.body.ar`,
    `pageContent.${key}.ctaLabel.fa`,
    `pageContent.${key}.ctaLabel.en`,
    `pageContent.${key}.ctaLabel.ar`,
    `pageContent.${key}.ctaHref`,
  ];
}

function descriptionFieldNames(key: "primaryDescription" | "secondaryDescription") {
  return [
    `pageContent.${key}.heading.fa`,
    `pageContent.${key}.heading.en`,
    `pageContent.${key}.heading.ar`,
    `pageContent.${key}.body.fa`,
    `pageContent.${key}.body.en`,
    `pageContent.${key}.body.ar`,
  ];
}

function buildSchema(
  resource: Resource,
  categoryOptions: DataSelectOption[],
  imageMap: Map<string, ImageAsset>,
): DynamicFormSchema<TaxonomyFormValues> {
  const isSubcategory = resource === "subcategories";

  return {
    validate: (values) => validateTaxonomy(resource, values),
    fields: [
      {
        kind: "input",
        name: "slug",
        label: "شناسه URL",
        required: true,
        dir: "ltr",
        placeholder: "formal-shirts",
        parse: (value) => slugify(value),
      },
      ...localizedFields("name", "نام", "input").map((field) => ({
        ...field,
        required: true,
      })),
      {
        kind: "select",
        name: "categoryId",
        label: "دسته مادر",
        options: categoryOptions,
        searchable: true,
        required: isSubcategory,
        hidden: !isSubcategory,
        placeholder: "انتخاب دسته مادر",
      },
      ...localizedFields("description", "توضیح کوتاه", "textarea"),
      {
        kind: "boolean",
        name: "isActive",
        label: "وضعیت نمایش",
        onLabel: "فعال",
        offLabel: "غیرفعال",
      },
      {
        kind: "input",
        inputType: "number",
        name: "sortOrder",
        label: "ترتیب نمایش",
        min: 0,
        step: 1,
      },
      makeImageField(
        "thumbnailImageId",
        "تصویر بندانگشتی",
        resource,
        imageMap,
        false,
      ),
      {
        kind: "select",
        name: "thumbnailObjectFit",
        label: "پوشش بندانگشتی",
        options: objectFitOptions,
        required: true,
      },
      {
        kind: "select",
        name: "thumbnailObjectPosition",
        label: "موقعیت بندانگشتی",
        options: objectPositionOptions,
        required: true,
      },
      makeImageField(
        "pageContent.primaryBanner.imageId",
        "تصویر بنر اول",
        resource,
        imageMap,
        true,
      ),
      {
        kind: "select",
        name: "pageContent.primaryBanner.objectFit",
        label: "پوشش بنر اول",
        options: objectFitOptions,
        required: true,
      },
      {
        kind: "select",
        name: "pageContent.primaryBanner.objectPosition",
        label: "موقعیت بنر اول",
        options: objectPositionOptions,
        required: true,
      },
      ...localizedFields("pageContent.primaryBanner.eyebrow", "پیش‌عنوان بنر اول", "input"),
      ...localizedFields("pageContent.primaryBanner.heading", "عنوان بنر اول", "input").map((field) => ({
        ...field,
        required: true,
      })),
      ...localizedFields("pageContent.primaryBanner.body", "متن بنر اول", "textarea"),
      ...localizedFields("pageContent.primaryBanner.ctaLabel", "متن دکمه بنر اول", "input"),
      {
        kind: "input",
        name: "pageContent.primaryBanner.ctaHref",
        label: "لینک دکمه بنر اول",
        dir: "ltr",
        placeholder: "/shop",
      },
      ...localizedFields("pageContent.primaryDescription.heading", "عنوان متن اول", "input"),
      ...localizedFields("pageContent.primaryDescription.body", "متن توضیح اول", "textarea").map((field) => ({
        ...field,
        required: true,
        rows: 5,
      })),
      makeImageField(
        "pageContent.secondaryBanner.imageId",
        "تصویر بنر دوم",
        resource,
        imageMap,
        true,
      ),
      {
        kind: "select",
        name: "pageContent.secondaryBanner.objectFit",
        label: "پوشش بنر دوم",
        options: objectFitOptions,
        required: true,
      },
      {
        kind: "select",
        name: "pageContent.secondaryBanner.objectPosition",
        label: "موقعیت بنر دوم",
        options: objectPositionOptions,
        required: true,
      },
      ...localizedFields("pageContent.secondaryBanner.eyebrow", "پیش‌عنوان بنر دوم", "input"),
      ...localizedFields("pageContent.secondaryBanner.heading", "عنوان بنر دوم", "input").map((field) => ({
        ...field,
        required: true,
      })),
      ...localizedFields("pageContent.secondaryBanner.body", "متن بنر دوم", "textarea"),
      ...localizedFields("pageContent.secondaryBanner.ctaLabel", "متن دکمه بنر دوم", "input"),
      {
        kind: "input",
        name: "pageContent.secondaryBanner.ctaHref",
        label: "لینک دکمه بنر دوم",
        dir: "ltr",
        placeholder: "/shop",
      },
      ...localizedFields("pageContent.secondaryDescription.heading", "عنوان متن دوم", "input"),
      ...localizedFields("pageContent.secondaryDescription.body", "متن توضیح دوم", "textarea").map((field) => ({
        ...field,
        required: true,
        rows: 5,
      })),
      ...localizedFields("pageContent.seoTitle", "عنوان سئو", "input"),
      ...localizedFields("pageContent.seoDescription", "توضیح سئو", "textarea"),
    ],
    sections: [
      {
        id: "identity",
        title: isSubcategory ? "هویت زیردسته" : "هویت دسته",
        description: "نام‌ها برای زبان‌های سایت و شناسه URL برای مسیر صفحه استفاده می‌شود.",
        fieldNames: [
          "slug",
          "name.fa",
          "name.en",
          "name.ar",
          ...(isSubcategory ? ["categoryId"] : []),
          "description.fa",
          "description.en",
          "description.ar",
          "isActive",
          "sortOrder",
        ],
      },
      {
        id: "thumbnail",
        title: "تصویر بندانگشتی",
        description: "این تصویر در لیست‌ها و کارت‌های دسته‌بندی استفاده می‌شود.",
        fieldNames: [
          "thumbnailImageId",
          "thumbnailObjectFit",
          "thumbnailObjectPosition",
        ],
      },
      {
        id: "primary-story",
        title: "بنر و متن اول",
        description: "اولین بخش صفحه دسته‌بندی شامل تصویر، تیتر، متن و لینک اختیاری است.",
        fieldNames: [
          ...bannerFieldNames("primaryBanner"),
          ...descriptionFieldNames("primaryDescription"),
        ],
      },
      {
        id: "secondary-story",
        title: "بنر و متن دوم",
        description: "بخش دوم صفحه برای ادامه روایت دسته یا زیردسته استفاده می‌شود.",
        fieldNames: [
          ...bannerFieldNames("secondaryBanner"),
          ...descriptionFieldNames("secondaryDescription"),
        ],
      },
      {
        id: "seo",
        title: "سئو",
        description: "عنوان و توضیح کوتاه برای موتورهای جست‌وجو.",
        fieldNames: [
          "pageContent.seoTitle.fa",
          "pageContent.seoTitle.en",
          "pageContent.seoTitle.ar",
          "pageContent.seoDescription.fa",
          "pageContent.seoDescription.en",
          "pageContent.seoDescription.ar",
        ],
      },
    ],
  };
}

function StatusBadge({ active }: { active: boolean }) {
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

function ImagePreview({ image }: { image?: ImageAsset }) {
  return (
    <span
      className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[6px] border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] text-[var(--adt-muted)]"
      style={
        image
          ? {
              backgroundImage: `url("${image.url}")`,
              backgroundPosition: image.objectPosition ?? "center",
              backgroundSize: image.objectFit === "contain" ? "contain" : "cover",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      {image ? null : <ImageIcon size={18} />}
    </span>
  );
}

export function CategoryManager({ canWrite }: { canWrite: boolean }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [resource, setResource] = useState<Resource>("categories");

  const categoryReferenceQuery = useQuery({
    queryKey: ["catalog", "category-options"],
    queryFn: () =>
      fetchJson<CatalogList<CategoryOptionRecord>>(
        "/api/catalog/categories?limit=100&isActive=true",
      ),
  });

  const imageReferenceQuery = useQuery({
    queryKey: ["catalog", "image-options"],
    queryFn: () =>
      fetchJson<CatalogList<ImageAsset>>(
        "/api/catalog/images?limit=100&isActive=true",
      ),
  });

  const categoryOptions = useMemo<DataSelectOption[]>(
    () =>
      (categoryReferenceQuery.data?.items ?? []).map((category) => ({
        value: category._id,
        label: fa(category.name),
        description: category.slug,
      })),
    [categoryReferenceQuery.data?.items],
  );

  const categoryNames = useMemo(
    () =>
      new Map(
        (categoryReferenceQuery.data?.items ?? []).map((category) => [
          category._id,
          fa(category.name),
        ]),
      ),
    [categoryReferenceQuery.data?.items],
  );

  const imageMap = useMemo(
    () =>
      new Map(
        (imageReferenceQuery.data?.items ?? []).map((image) => [
          image._id,
          image,
        ]),
      ),
    [imageReferenceQuery.data?.items],
  );

  const reloadReferences = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["catalog", "category-options"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["catalog", "image-options"],
    });
  }, [queryClient]);

  const filters = useMemo<
    DynamicFilterDefinition<TaxonomyFilters, TaxonomyRecord>[]
  >(
    () => [
      {
        id: "isActive",
        kind: "select",
        label: "وضعیت",
        options: statusOptions,
        defaultValue: null,
        badge: (value) =>
          value === "true" ? "فعال" : value === "false" ? "غیرفعال" : null,
      },
      {
        id: "categoryId",
        kind: "select",
        label: "دسته مادر",
        options: categoryOptions,
        defaultValue: null,
        searchable: true,
        hidden: resource !== "subcategories",
        badge: (value) =>
          typeof value === "string" ? categoryNames.get(value) ?? null : null,
      },
    ],
    [categoryNames, categoryOptions, resource],
  );

  const columns = useMemo<DynamicColumn<TaxonomyRecord>[]>(
    () => [
      {
        id: "name",
        label: resource === "categories" ? "دسته" : "زیردسته",
        minWidth: 260,
        sticky: "start",
        lockVisibility: true,
        cell: ({ record }) => (
          <div className="flex min-w-0 items-center gap-3">
            <ImagePreview
              image={
                record.thumbnailImageId
                  ? imageMap.get(record.thumbnailImageId)
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
        label: "دسته مادر",
        accessor: "categoryId",
        minWidth: 180,
        hidden: resource === "categories",
        desktop: { hidden: resource === "categories" },
        cell: ({ record }) =>
          record.categoryId ? categoryNames.get(record.categoryId) ?? "—" : "—",
        mobile: { hidden: resource === "categories", priority: 2 },
      },
      {
        id: "banners",
        label: "بنرها",
        minWidth: 150,
        cell: ({ record }) => (
          <div className="flex items-center gap-2">
            <ImagePreview
              image={imageMap.get(record.pageContent.primaryBanner.imageId)}
            />
            <ImagePreview
              image={imageMap.get(record.pageContent.secondaryBanner.imageId)}
            />
          </div>
        ),
        mobile: { priority: 3 },
      },
      {
        id: "isActive",
        label: "وضعیت",
        accessor: "isActive",
        minWidth: 110,
        cell: ({ record }) => <StatusBadge active={record.isActive} />,
        mobile: { priority: 4 },
      },
      {
        id: "sortOrder",
        label: "ترتیب",
        accessor: "sortOrder",
        minWidth: 100,
        cell: ({ record }) => formatDigits(record.sortOrder),
        mobile: { priority: 5 },
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
    [categoryNames, imageMap, resource],
  );

  const schema = useMemo(
    () => buildSchema(resource, categoryOptions, imageMap),
    [categoryOptions, imageMap, resource],
  );

  const source = useMemo(
    () => ({
      queryKey: ["catalog", resource],
      fetchPage: async ({
        page,
        pageSize,
        search,
        filters: activeFilters,
        signal,
      }: {
        page: number;
        pageSize: number;
        search: string;
        filters: TaxonomyFilters;
        signal: AbortSignal;
      }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
        });
        if (search) params.set("search", search);
        if (activeFilters.isActive) {
          params.set("isActive", String(activeFilters.isActive));
        }
        if (resource === "subcategories" && activeFilters.categoryId) {
          params.set("categoryId", String(activeFilters.categoryId));
        }
        return toTableResult(
          await fetchJson<CatalogList<TaxonomyRecord>>(
            `/api/catalog/${resource}?${params.toString()}`,
            { signal },
          ),
        );
      },
      fetchOne: async ({
        id,
        signal,
      }: {
        id: string;
        signal: AbortSignal;
        record: TaxonomyRecord;
      }) =>
        fetchJson<TaxonomyRecord>(`/api/catalog/${resource}/${id}`, { signal }),
    }),
    [resource],
  );

  const title = resource === "categories" ? "مدیریت دسته‌بندی‌ها" : "مدیریت زیردسته‌ها";
  const createLabel = resource === "categories" ? "دسته جدید" : "زیردسته جدید";

  return (
    <div className="min-w-0 space-y-3 p-3 sm:p-4 lg:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-white/[0.075] bg-[#0c1117] p-3 group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-[#f0ede7]">
        <div className="min-w-0">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#a87959]">
            CATALOG TAXONOMY
          </p>
          <h1 className="mt-1 text-[18px] font-extrabold text-white group-data-[theme=light]/admin:text-[#1d1c1a]">
            دسته‌بندی و زیردسته
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <DataButton
            tone={resource === "categories" ? "danger" : "danger"}
            size="md"
             icon={<Boxes size={15} />}
            onClick={() => setResource("categories")}
            
          >
            دسته‌ها
          </DataButton>
          <DataButton
            tone={resource === "subcategories" ? "danger" : "danger"}
            size="md"
            icon={<Layers3 size={15} />}
            onClick={() => setResource("subcategories")}
          >
            زیردسته‌ها
          </DataButton>
        </div>
      </div>

      <DynamicDataTable<
        TaxonomyRecord,
        TaxonomyFormValues,
        TaxonomyFormValues,
        TaxonomyFilters
      >
        key={resource}
        tableId={`admin-${resource}`}
        eyebrow={resource === "categories" ? "CATEGORY" : "SUBCATEGORY"}
        title={title}
        description="ساخت و ویرایش مسیرهای اصلی کاتالوگ، متن‌های چندزبانه و دو بنر صفحه از همین بخش انجام می‌شود."
        source={source}
        columns={columns}
        getRowId={(record) => record._id}
        getRowLabel={(record) => fa(record.name)}
        search={{
          placeholder: "جستجو با نام یا شناسه URL...",
          debounceMs: 320,
        }}
        filters={filters}
        initialFilters={{ isActive: null, categoryId: null }}
        pagination={{
          initialPageSize: 15,
          pageSizeOptions: [10, 15, 25, 50],
          showPageNumbers: true,
        }}
        columnVisibility={{
          enabled: true,
          persist: true,
          storageKey: `admin-${resource}-columns`,
        }}
        mobile={{
          title: (record) => fa(record.name),
          subtitle: (record) => record.slug,
          badge: (record) => <StatusBadge active={record.isActive} />,
          fieldIds:
            resource === "categories"
              ? ["banners", "isActive", "sortOrder"]
              : ["categoryId", "banners", "isActive", "sortOrder"],
          maxFields: 4,
        }}
        crud={{
          create: {
            enabled: canWrite,
            label: createLabel,
            title: `ساخت ${resource === "categories" ? "دسته" : "زیردسته"}`,
            description: "دو بنر و دو متن اصلی طبق مدل صفحه دسته‌بندی الزامی هستند.",
            schema,
            initialValues: () => emptyForm(resource),
            mutationFn: async ({ values }) =>
              fetchJson<TaxonomyRecord>(`/api/catalog/${resource}`, {
                method: "POST",
                body: JSON.stringify(formPayload(resource, values)),
              }),
            mapError: mapFormError,
            onSuccess: (record) => {
              void reloadReferences();
              toast.success(
                resource === "categories" ? "دسته ساخته شد" : "زیردسته ساخته شد",
                {
                  description:
                    record && "_id" in record ? `${fa(record.name)} آماده انتشار است.` : undefined,
                },
              );
            },
          },
          edit: {
            enabled: canWrite,
            title: (record) => `ویرایش ${fa(record.name)}`,
            description: "تغییر بنرها، متن‌ها، تصویر بندانگشتی و وضعیت نمایش از همین فرم انجام می‌شود.",
            schema,
            toInitialValues: (record) => normalizeForm(record, resource),
            mutationFn: async ({ id, values }) =>
              fetchJson<TaxonomyRecord>(`/api/catalog/${resource}/${id}`, {
                method: "PATCH",
                body: JSON.stringify(formPayload(resource, values)),
              }),
            mapError: mapFormError,
            onSuccess: (record) => {
              void reloadReferences();
              toast.success("تغییرات ذخیره شد", {
                description:
                  record && "_id" in record ? `${fa(record.name)} به‌روزرسانی شد.` : undefined,
              });
            },
          },
          view: {
            title: (record) => `مشاهده ${fa(record.name)}`,
            fields: [
              { id: "name", label: "نام فارسی", render: ({ record }) => fa(record.name) },
              { id: "slug", label: "شناسه URL", accessor: "slug" },
              {
                id: "parent",
                label: "دسته مادر",
                hidden: resource === "categories",
                render: ({ record }) =>
                  record.categoryId ? categoryNames.get(record.categoryId) ?? "—" : "—",
              },
              {
                id: "status",
                label: "وضعیت",
                render: ({ record }) => <StatusBadge active={record.isActive} />,
              },
              {
                id: "sortOrder",
                label: "ترتیب",
                render: ({ record }) => formatDigits(record.sortOrder),
              },
              {
                id: "primaryBanner",
                label: "بنر اول",
                render: ({ record }) => (
                  <span className="inline-flex items-center gap-3">
                    <ImagePreview image={imageMap.get(record.pageContent.primaryBanner.imageId)} />
                    <span>{fa(record.pageContent.primaryBanner.heading)}</span>
                  </span>
                ),
              },
              {
                id: "secondaryBanner",
                label: "بنر دوم",
                render: ({ record }) => (
                  <span className="inline-flex items-center gap-3">
                    <ImagePreview image={imageMap.get(record.pageContent.secondaryBanner.imageId)} />
                    <span>{fa(record.pageContent.secondaryBanner.heading)}</span>
                  </span>
                ),
              },
              {
                id: "primaryDescription",
                label: "متن اول",
                colSpan: "full",
                render: ({ record }) => fa(record.pageContent.primaryDescription.body),
              },
              {
                id: "secondaryDescription",
                label: "متن دوم",
                colSpan: "full",
                render: ({ record }) => fa(record.pageContent.secondaryDescription.body),
              },
            ],
            sections: [
              {
                id: "identity",
                title: "هویت",
                fieldIds: ["name", "slug", "parent", "status", "sortOrder"],
              },
              {
                id: "content",
                title: "محتوای صفحه",
                fieldIds: [
                  "primaryBanner",
                  "secondaryBanner",
                  "primaryDescription",
                  "secondaryDescription",
                ],
              },
            ],
          },
          delete: {
            enabled: canWrite,
            title: (record) => `غیرفعال کردن ${fa(record.name)}`,
            description: (record) => (
              <>
                مورد <strong>{fa(record.name)}</strong> حذف فیزیکی نمی‌شود؛ فقط از
                لیست فعال خارج خواهد شد.
              </>
            ),
            dangerLevel: "soft",
            confirmLabel: "غیرفعال کردن",
            mutationFn: async ({ id }) => {
              await fetchJson(`/api/catalog/${resource}/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: false }),
              });
            },
            mapError: (error) =>
              error instanceof Error
                ? error.message
                : "غیرفعال‌سازی انجام نشد. دوباره تلاش کنید.",
            onSuccess: (record) => {
              toast.warning("مورد غیرفعال شد", {
                description: `${fa(record.name)} از نمایش فعال خارج شد.`,
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
                toast.info("شناسه کپی شد", { description: record.slug });
              },
            },
          ],
        }}
        labels={{
          filters: "فیلتر دسته‌بندی",
          clearFilters: "پاک کردن فیلترها",
          applyFilters: "اعمال فیلترها",
          pendingFilters: "فیلتر فعال",
          columns: "ستون‌ها",
          create: createLabel,
          view: "مشاهده",
          edit: "ویرایش",
          delete: "غیرفعال‌سازی",
          actions: "عملیات",
          rowsPerPage: "تعداد در صفحه",
        }}
        emptyState={{
          title:
            resource === "categories"
              ? "هنوز دسته‌ای ساخته نشده"
              : "هنوز زیردسته‌ای ساخته نشده",
          description: "اولین مورد را بسازید تا مسیرهای کاتالوگ کامل شود.",
          filteredTitle: "موردی با این شرایط پیدا نشد",
          filteredDescription: "عبارت جستجو یا فیلترهای انتخاب‌شده را تغییر دهید.",
        }}
      />
    </div>
  );
}
