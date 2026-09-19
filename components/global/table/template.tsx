"use client";

import { Copy, Crown, Package, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatPersianDateCompact } from "@/components/ui/PersianDatePicker";
import { DynamicDataTable } from "./DynamicTable";
import { DataInput, DataButton } from "./primitives";
import { PersianDateRangeValue, DataSelectOption, DynamicColumn, DynamicFilterDefinition, DynamicFormSchema } from "./types";
 

type ProductStatus = "active" | "draft" | "archived";

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  sales: number;
  status: ProductStatus;
  featured: boolean;
  colors: string[];
  launchDate: string;
  createdAt: string;
  supplier: {
    name: string;
    email: string;
  };
  description: string;
};

type ProductForm = {
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number | null;
  stock: number | null;
  status: ProductStatus;
  featured: boolean;
  colors: string[];
  launchDate: string | null;
  campaignWindow: PersianDateRangeValue;
  supplier: {
    name: string;
    email: string;
  };
  description: string;
};

type ProductFilters = Record<string, unknown> & {
  orderId?: string | null;
  category?: string | null;
  brands?: string[];
  status?: string | null;
  featured?: boolean | null;
  minStock?: number | null;
  createdOn?: string | null;
  createdRange?: PersianDateRangeValue;
  priceRange?: { min: number | null; max: number | null };
};

type FakeError = Error & {
  fieldErrors?: Record<string, string>;
};

const CATEGORY_OPTIONS: DataSelectOption[] = [
  { value: "suit", label: "کت و شلوار" },
  { value: "shirt", label: "پیراهن" },
  { value: "trouser", label: "شلوار" },
  { value: "coat", label: "پالتو" },
  { value: "accessory", label: "اکسسوری" },
];

const BRAND_OPTIONS: DataSelectOption[] = [
  { value: "najib", label: "Najibzadeh" },
  { value: "atelier", label: "Atelier Line" },
  { value: "heritage", label: "Heritage" },
  { value: "seasonal", label: "Seasonal" },
];

const COLOR_OPTIONS: DataSelectOption[] = [
  { value: "black", label: "مشکی" },
  { value: "brown", label: "قهوه‌ای" },
  { value: "gray", label: "خاکستری" },
  { value: "navy", label: "سرمه‌ای" },
  { value: "taupe", label: "Taupe" },
];

const STATUS_OPTIONS: DataSelectOption[] = [
  { value: "active", label: "فعال" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "archived", label: "آرشیو" },
];

let fakeDb: Product[] = createFakeProducts();
let requestCount = 0;
let filterRequestCount = 0;
const listeners = new Set<() => void>();

function emitStats() {
  listeners.forEach((listener) => listener());
}

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function createFakeProducts(): Product[] {
  const names = [
    "Napoli کت و شلوار",
    "Milano پیراهن کلاسیک",
    "Roma شلوار پارچه‌ای",
    "Torino پالتو پشمی",
    "Firenze کمربند چرمی",
    "Como کت تک",
    "Parma پیراهن رسمی",
  ];
  const categories = CATEGORY_OPTIONS.map((item) => item.value);
  const brands = BRAND_OPTIONS.map((item) => item.value);
  const statuses: ProductStatus[] = ["active", "active", "draft", "archived"];

  return Array.from({ length: 73 }, (_, index) => {
    const day = String((index % 27) + 1).padStart(2, "0");
    const month = String((index % 8) + 1).padStart(2, "0");
    return {
      id: `prd-${String(index + 1).padStart(3, "0")}`,
      sku: `NV-${1001 + index}`,
      name: `${names[index % names.length]} ${index + 1}`,
      category: categories[index % categories.length]!,
      brand: brands[index % brands.length]!,
      price: 8_500_000 + index * 375_000,
      stock: (index * 7) % 96,
      sales: (index * 31) % 420,
      status: statuses[index % statuses.length]!,
      featured: index % 6 === 0,
      colors: [COLOR_OPTIONS[index % COLOR_OPTIONS.length]!.value],
      launchDate: `2026-${month}-${day}`,
      createdAt: `2026-${month}-${day}`,
      supplier: {
        name: index % 2 === 0 ? "تامین پارس" : "خانه پارچه تهران",
        email: index % 2 === 0 ? "supply@example.com" : "fabric@example.com",
      },
      description:
        "محصول نمونه برای تست کامل جدول داینامیک، فرم‌ها، مودال‌ها، فیلترها و رفتار ریسپانسیو.",
    };
  });
}

function statusLabel(status: ProductStatus) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

function categoryLabel(value: string) {
  return CATEGORY_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

function money(value: number) {
  return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
}

function makeError(message: string, fieldErrors?: Record<string, string>) {
  const error = new Error(message) as FakeError;
  error.fieldErrors = fieldErrors;
  return error;
}

export function DataGridV3Showcase() {
  const queryClient = useQueryClient();
  const [, forceStats] = useState(0);

  useEffect(() => {
    const listener = () => forceStats((value) => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const columns = useMemo<DynamicColumn<Product>[]>(
    () => [
      {
        id: "name",
        label: "محصول",
        accessor: "name",
        sortable: true,
        minWidth: 220,
        sticky: "start",
        lockVisibility: true,
        cell: ({ record }) => (
          <div className="min-w-0">
            <strong className="block truncate text-[10px] font-bold">
              {record.name}
            </strong>
            <span className="mt-0.5 block text-[8px] text-[var(--adt-muted)]">
              {record.sku}
            </span>
          </div>
        ),
        mobile: { priority: 1, showLabel: false },
      },
      {
        id: "category",
        label: "دسته‌بندی",
        accessor: "category",
        sortable: true,
        minWidth: 130,
        cell: ({ value }) => categoryLabel(String(value)),
        mobile: { priority: 2 },
      },
      {
        id: "price",
        label: "قیمت",
        accessor: "price",
        sortable: true,
        minWidth: 150,
        cell: ({ value }) => money(Number(value)),
        mobile: { priority: 3 },
      },
      {
        id: "stock",
        label: "موجودی",
        accessor: "stock",
        sortable: true,
        align: "center",
        minWidth: 100,
        cell: ({ record }) => (
          <span className={record.stock < 10 ? "text-[var(--adt-danger)]" : ""}>
            {new Intl.NumberFormat("fa-IR").format(record.stock)}
          </span>
        ),
        mobile: { priority: 4 },
      },
      {
        id: "sales",
        label: "فروش",
        accessor: "sales",
        sortable: true,
        align: "center",
        minWidth: 100,
        mobile: { hidden: true },
      },
      {
        id: "status",
        label: "وضعیت",
        accessor: "status",
        sortable: true,
        minWidth: 110,
        cell: ({ record }) => <StatusBadge status={record.status} />,
        mobile: { priority: 5 },
      },
      {
        id: "featured",
        label: "ویژه",
        accessor: "featured",
        defaultHidden: true,
        minWidth: 90,
        cell: ({ record }) => (record.featured ? "بله" : "خیر"),
        mobile: { hidden: true },
      },
      {
        id: "launchDate",
        label: "تاریخ عرضه",
        accessor: "launchDate",
        sortable: true,
        defaultHidden: true,
        minWidth: 140,
        cell: ({ record }) => formatPersianDateCompact(record.launchDate),
        mobile: { hidden: true },
      },
      {
        id: "supplier.name",
        label: "تامین‌کننده",
        accessor: "supplier.name",
        defaultHidden: true,
        minWidth: 160,
        mobile: { hidden: true },
      },
    ],
    [],
  );

  const filters = useMemo<DynamicFilterDefinition<ProductFilters, Product>[]>(
    () => [
      {
        id: "orderId",
        kind: "text",
        label: "SKU",
        placeholder: "مثلاً NV-1024",
        defaultValue: null,
      },
      {
        id: "category",
        kind: "select",
        label: "دسته‌بندی",
        defaultValue: null,
        searchable: true,
        loadOptions: async ({ signal }) => {
          filterRequestCount += 1;
          emitStats();
          await delay(650, signal);
          return CATEGORY_OPTIONS;
        },
        badge: (value) => categoryLabel(String(value)),
      },
      {
        id: "brands",
        kind: "multi-select",
        label: "برند",
        defaultValue: [],
        options: BRAND_OPTIONS,
        allowSelectAll: true,
        searchable: true,
        badge: (value) =>
          Array.isArray(value) && value.length
            ? `${new Intl.NumberFormat("fa-IR").format(value.length)} برند`
            : null,
      },
      {
        id: "status",
        kind: "select",
        label: "وضعیت",
        defaultValue: null,
        options: STATUS_OPTIONS,
        badge: (value) => statusLabel(String(value) as ProductStatus),
      },
      {
        id: "featured",
        kind: "boolean",
        label: "محصول ویژه",
        trueLabel: "فقط ویژه‌ها",
        falseLabel: "غیر ویژه‌ها",
        defaultValue: null,
      },
      {
        id: "minStock",
        kind: "number",
        label: "حداقل موجودی",
        placeholder: "مثلاً ۱۰",
        min: 0,
        defaultValue: null,
      },
      {
        id: "createdOn",
        kind: "date",
        label: "تاریخ دقیق",
        defaultValue: null,
        badge: (value) =>
          typeof value === "string" ? formatPersianDateCompact(value) : null,
      },
      {
        id: "createdRange",
        kind: "date-range",
        label: "بازه تاریخ",
        defaultValue: { from: null, to: null },
        badge: (value) => {
          const range = value as PersianDateRangeValue;
          if (!range?.from && !range?.to) return null;
          return `${range.from ? formatPersianDateCompact(range.from) : "…"} تا ${
            range.to ? formatPersianDateCompact(range.to) : "…"
          }`;
        },
      },
      {
        id: "priceRange",
        kind: "custom",
        label: "بازه قیمت",
        defaultValue: { min: null, max: null },
        badge: (value) => {
          const range = value as { min: number | null; max: number | null };
          if (!range?.min && !range?.max) return null;
          return `${range.min ? money(range.min) : "…"} تا ${range.max ? money(range.max) : "…"}`;
        },
        render: ({ value, setValue, close }) => {
          const range =
            value && typeof value === "object"
              ? (value as { min: number | null; max: number | null })
              : { min: null, max: null };
          return (
            <div className="space-y-3">
              <DataInput
                label="از قیمت"
                type="number"
                value={range.min ?? ""}
                placeholder="حداقل قیمت"
                onChange={(event) =>
                  setValue({
                    ...range,
                    min:
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                  })
                }
              />
              <DataInput
                label="تا قیمت"
                type="number"
                value={range.max ?? ""}
                placeholder="حداکثر قیمت"
                onChange={(event) =>
                  setValue({
                    ...range,
                    max:
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                  })
                }
              />
              <div className="flex justify-end">
                <DataButton tone="secondary" size="sm" onClick={close}>
                  ثبت مقدار
                </DataButton>
              </div>
            </div>
          );
        },
      },
    ],
    [],
  );

  const createSchema = useMemo<DynamicFormSchema<ProductForm>>(
    () => buildProductSchema(false),
    [],
  );
  const editSchema = useMemo<DynamicFormSchema<ProductForm>>(
    () => buildProductSchema(true),
    [],
  );

  const source = useMemo(
    () => ({
      queryKey: ["demo", "products-v3"] as const,
      fetchPage: async ({
        page,
        pageSize,
        search,
        sort,
        filters: activeFilters,
        signal,
      }: {
        page: number;
        pageSize: number;
        search: string;
        sort: Array<{ key: string; direction: "asc" | "desc" }>;
        filters: ProductFilters;
        signal: AbortSignal;
      }) => {
        requestCount += 1;
        emitStats();
        await delay(520, signal);
        let items = [...fakeDb];

        if (search) {
          const query = search.toLowerCase();
          items = items.filter((product) =>
            [product.name, product.sku, product.supplier.name]
              .join(" ")
              .toLowerCase()
              .includes(query),
          );
        }

        if (activeFilters.orderId) {
          const sku = String(activeFilters.orderId).toLowerCase();
          items = items.filter((product) =>
            product.sku.toLowerCase().includes(sku),
          );
        }
        if (activeFilters.category) {
          items = items.filter(
            (product) => product.category === activeFilters.category,
          );
        }
        if (
          Array.isArray(activeFilters.brands) &&
          activeFilters.brands.length
        ) {
          items = items.filter((product) =>
            activeFilters.brands?.includes(product.brand),
          );
        }
        if (activeFilters.status) {
          items = items.filter(
            (product) => product.status === activeFilters.status,
          );
        }
        if (typeof activeFilters.featured === "boolean") {
          items = items.filter(
            (product) => product.featured === activeFilters.featured,
          );
        }
        if (typeof activeFilters.minStock === "number") {
          items = items.filter(
            (product) => product.stock >= activeFilters.minStock!,
          );
        }
        if (activeFilters.createdOn) {
          items = items.filter(
            (product) => product.createdAt === activeFilters.createdOn,
          );
        }
        if (activeFilters.createdRange?.from) {
          items = items.filter(
            (product) => product.createdAt >= activeFilters.createdRange!.from!,
          );
        }
        if (activeFilters.createdRange?.to) {
          items = items.filter(
            (product) => product.createdAt <= activeFilters.createdRange!.to!,
          );
        }
        if (activeFilters.priceRange?.min) {
          items = items.filter(
            (product) => product.price >= activeFilters.priceRange!.min!,
          );
        }
        if (activeFilters.priceRange?.max) {
          items = items.filter(
            (product) => product.price <= activeFilters.priceRange!.max!,
          );
        }

        for (const rule of [...sort].reverse()) {
          items.sort((a, b) => {
            const av = readSortValue(a, rule.key);
            const bv = readSortValue(b, rule.key);
            const result =
              typeof av === "number" && typeof bv === "number"
                ? av - bv
                : String(av).localeCompare(String(bv), "fa");
            return rule.direction === "asc" ? result : -result;
          });
        }

        const total = items.length;
        const start = (page - 1) * pageSize;
        return {
          items: items.slice(start, start + pageSize),
          total,
          page,
          pageSize,
          pageCount: Math.max(1, Math.ceil(total / pageSize)),
          meta: {
            requestCount,
            filterRequestCount,
            cachePolicy: "staleTime/gcTime = Infinity",
          },
        };
      },
      fetchOne: async ({ id, signal }: { id: string; signal: AbortSignal }) => {
        await delay(380, signal);
        const product = fakeDb.find((item) => item.id === id);
        if (!product) throw new Error("محصول پیدا نشد.");
        return structuredClone(product);
      },
    }),
    [],
  );

  return (
    <div className="min-w-0 p-3 sm:p-4 lg:p-5">
      <DynamicDataTable<Product, ProductForm, ProductForm, ProductFilters>
        tableId="products-showcase-v3"
        eyebrow="DATA GRID V3"
        title="آزمایشگاه جدول محصولات"
        description="نسخه بازطراحی‌شده با فیلترهای چیپی، تقویم فارسی، مودال ریسپانسیو و کارت موبایل. تغییر فیلترها تا زمان کلیک روی «اعمال فیلترها» درخواست جدول ایجاد نمی‌کند."
        source={source}
        columns={columns}
        getRowId={(record) => record.id}
        getRowLabel={(record) => record.name}
        search={{
          placeholder: "جستجو با نام، SKU یا تامین‌کننده…",
          debounceMs: 320,
        }}
        filters={filters}
        initialFilters={{
          orderId: null,
          category: null,
          brands: [],
          status: null,
          featured: null,
          minStock: null,
          createdOn: null,
          createdRange: { from: null, to: null },
          priceRange: { min: null, max: null },
        }}
        pagination={{
          initialPageSize: 10,
          pageSizeOptions: [10, 15, 25, 50],
          showPageNumbers: true,
        }}
        columnVisibility={{
          enabled: true,
          persist: true,
          storageKey: "demo-products-v3-columns",
          
        }}
        mobile={{
          title: (record) => record.name,
          subtitle: (record) =>
            `${record.sku} · ${categoryLabel(record.category)}`,
          badge: (record) => <StatusBadge status={record.status} />,
          fieldIds: ["price", "stock", "status", "category", "launchDate"],
          maxFields: 5,
        }}
        renderMeta={(meta) => {
          const stats = meta as { cachePolicy: string };
          return (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[8px] text-[var(--adt-muted)]">
              <span>
                درخواست جدول:{" "}
                <strong className="text-[var(--adt-text)]">
                  {requestCount}
                </strong>
              </span>
              <span>
                درخواست گزینه فیلتر:{" "}
                <strong className="text-[var(--adt-text)]">
                  {filterRequestCount}
                </strong>
              </span>
              <span className="text-[var(--adt-accent-strong)]">
                {stats.cachePolicy}
              </span>
            </div>
          );
        }}
        crud={{
          create: {
            label: "محصول جدید",
            title: "ایجاد محصول",
            description:
              "فرم ساخت عمداً با انواع مختلف فیلد برای تست سیستم پر شده است.",
            schema: createSchema,
            initialValues: emptyProductForm,
            mutationFn: async ({ values }) => {
              await delay(650);
              if (fakeDb.some((item) => item.sku === values.sku)) {
                throw makeError("SKU تکراری است.", {
                  sku: "این SKU قبلاً ثبت شده است.",
                });
              }
              if (values.sku === "FAIL-500") {
                throw makeError("خطای شبیه‌سازی‌شده سرور.");
              }
              const record = formToProduct(values, `prd-${Date.now()}`);
              fakeDb = [record, ...fakeDb];
              return record;
            },
            mapError: mapFakeError,
          },
          edit: {
            title: (record) => `ویرایش ${record.name}`,
            description:
              "SKU در ویرایش فقط خواندنی است؛ بقیه فیلدها قابل تغییرند.",
            schema: editSchema,
            toInitialValues: productToForm,
            mutationFn: async ({ id, values }) => {
              await delay(650);
              const index = fakeDb.findIndex((item) => item.id === id);
              if (index < 0) throw makeError("محصول پیدا نشد.");
              const next = formToProduct(values, id);
              fakeDb = fakeDb.map((item) => (item.id === id ? next : item));
              return next;
            },
            mapError: mapFakeError,
          },
          view: {
            title: (record) => `مشاهده ${record.name}`,
            fields: [
              { id: "sku", label: "SKU", accessor: "sku" },
              { id: "name", label: "نام", accessor: "name" },
              {
                id: "category",
                label: "دسته‌بندی",
                accessor: "category",
                render: ({ value }) => categoryLabel(String(value)),
              },
              {
                id: "price",
                label: "قیمت",
                accessor: "price",
                render: ({ value }) => money(Number(value)),
              },
              { id: "stock", label: "موجودی", accessor: "stock" },
              {
                id: "status",
                label: "وضعیت",
                accessor: "status",
                render: ({ record }) => <StatusBadge status={record.status} />,
              },
              {
                id: "launchDate",
                label: "تاریخ عرضه",
                accessor: "launchDate",
                render: ({ value }) => formatPersianDateCompact(String(value)),
              },
              {
                id: "supplier",
                label: "تامین‌کننده",
                accessor: "supplier.name",
              },
              {
                id: "supplierEmail",
                label: "ایمیل تامین‌کننده",
                accessor: "supplier.email",
              },
              {
                id: "description",
                label: "توضیحات",
                accessor: "description",
                colSpan: "full",
              },
            ],
            sections: [
              {
                id: "main",
                title: "اطلاعات محصول",
                fieldIds: [
                  "sku",
                  "name",
                  "category",
                  "price",
                  "stock",
                  "status",
                ],
              },
              {
                id: "supply",
                title: "عرضه و تامین",
                fieldIds: [
                  "launchDate",
                  "supplier",
                  "supplierEmail",
                  "description",
                ],
              },
            ],
          },
          delete: {
            title: (record) => `حذف ${record.name}`,
            description: (record) => (
              <>
                محصول <strong>{record.sku}</strong> از دیتای دمو حذف می‌شود. این
                حذف فقط داخل حافظه مرورگر است.
              </>
            ),
            dangerLevel: "hard",
            mutationFn: async ({ id }) => {
              await delay(700);
              if (id.endsWith("007")) {
                throw new Error("این رکورد برای تست خطای حذف قفل شده است.");
              }
              fakeDb = fakeDb.filter((item) => item.id !== id);
            },
          },
          extraRowActions: [
            {
              id: "feature",
              label: "تغییر وضعیت ویژه",
              icon: <Crown size={14} />,
              tone: "warning",
              onClick: async (record) => {
                await delay(320);
                fakeDb = fakeDb.map((item) =>
                  item.id === record.id
                    ? { ...item, featured: !item.featured }
                    : item,
                );
                await queryClient.invalidateQueries({
                  queryKey: ["demo", "products-v3"],
                  refetchType: "none",
                });
                await queryClient.refetchQueries({
                  queryKey: ["demo", "products-v3"],
                  type: "active",
                });
              },
            },
            {
              id: "duplicate",
              label: "تکثیر محصول",
              icon: <Copy size={14} />,
              onClick: async (record) => {
                await delay(320);
                fakeDb = [
                  {
                    ...record,
                    id: `prd-${Date.now()}`,
                    sku: `${record.sku}-COPY`,
                    name: `${record.name} - کپی`,
                  },
                  ...fakeDb,
                ];
                await queryClient.invalidateQueries({
                  queryKey: ["demo", "products-v3"],
                  refetchType: "none",
                });
                await queryClient.refetchQueries({
                  queryKey: ["demo", "products-v3"],
                  type: "active",
                });
              },
            },
          ],
        }}
        emptyState={{
          title: "محصولی ثبت نشده",
          description: "با دکمه محصول جدید اولین رکورد را ایجاد کنید.",
          filteredTitle: "محصولی با این شرایط پیدا نشد",
          filteredDescription:
            "فیلترهای اعمال‌شده یا عبارت جستجو را تغییر دهید.",
        }}
      />
    </div>
  );
}

function buildProductSchema(edit: boolean): DynamicFormSchema<ProductForm> {
  return {
    fields: [
      {
        kind: "input",
        name: "sku",
        label: "SKU",
        placeholder: "NV-2001",
        required: true,
        readOnly: edit,
      },
      {
        kind: "input",
        name: "name",
        label: "نام محصول",
        placeholder: "نام محصول را وارد کنید",
        required: true,
      },
      {
        kind: "select",
        name: "category",
        label: "دسته‌بندی",
        options: CATEGORY_OPTIONS,
        searchable: true,
        required: true,
      },
      {
        kind: "select",
        name: "brand",
        label: "برند",
        options: BRAND_OPTIONS,
        required: true,
      },
      {
        kind: "input",
        inputType: "number",
        name: "price",
        label: "قیمت",
        placeholder: "قیمت به تومان",
        required: true,
        min: 0,
      },
      {
        kind: "input",
        inputType: "number",
        name: "stock",
        label: "موجودی",
        placeholder: "تعداد موجودی",
        required: true,
        min: 0,
      },
      {
        kind: "select",
        name: "status",
        label: "وضعیت",
        options: STATUS_OPTIONS,
        required: true,
      },
      {
        kind: "boolean",
        name: "featured",
        label: "محصول ویژه",
        onLabel: "در بخش محصولات ویژه نمایش داده شود",
        offLabel: "محصول عادی",
      },
      {
        kind: "multi-select",
        name: "colors",
        label: "رنگ‌ها",
        options: COLOR_OPTIONS,
        searchable: true,
        allowSelectAll: true,
      },
      {
        kind: "date",
        name: "launchDate",
        label: "تاریخ عرضه",
        placeholder: "تاریخ عرضه را انتخاب کنید",
        required: true,
      },
      {
        kind: "date-range",
        name: "campaignWindow",
        label: "بازه کمپین",
        placeholder: "شروع و پایان کمپین",
      },
      {
        kind: "input",
        name: "supplier.name",
        label: "نام تامین‌کننده",
        placeholder: "نام تامین‌کننده",
      },
      {
        kind: "input",
        inputType: "email",
        name: "supplier.email",
        label: "ایمیل تامین‌کننده",
        placeholder: "supplier@example.com",
        validate: (value) =>
          String(value ?? "").endsWith("@blocked.test")
            ? "این دامنه برای تست خطای فیلد مسدود شده است."
            : null,
      },
      {
        kind: "textarea",
        name: "description",
        label: "توضیحات",
        placeholder: "توضیح کوتاه محصول",
        rows: 5,
        colSpan: "full",
      },
      {
        kind: "custom",
        name: "preview",
        label: "پیش‌نمایش سفارشی",
        colSpan: "full",
        render: ({ values }) => (
          <div className="flex min-w-0 items-center gap-3 border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] p-3">
            <span className="grid size-10 shrink-0 place-items-center border border-[var(--adt-border-strong)] text-[var(--adt-accent-strong)]">
              <Package size={17} />
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-[11px] text-[var(--adt-text)]">
                {values.name || "نام محصول"}
              </strong>
              <span className="mt-1 block truncate text-[8px] text-[var(--adt-muted)]">
                {values.sku || "SKU"} ·{" "}
                {values.price ? money(Number(values.price)) : "بدون قیمت"}
              </span>
            </div>
            {values.featured ? (
              <span className="mr-auto inline-flex shrink-0 items-center gap-1 text-[8px] text-[var(--adt-warning)]">
                <Sparkles size={12} /> ویژه
              </span>
            ) : null}
          </div>
        ),
      },
    ],
    sections: [
      {
        id: "identity",
        title: "هویت محصول",
        description: "نام، شناسه، دسته‌بندی و برند.",
        fieldNames: ["sku", "name", "category", "brand"],
      },
      {
        id: "commerce",
        title: "فروش و موجودی",
        description: "قیمت، انبار و وضعیت انتشار.",
        fieldNames: ["price", "stock", "status", "featured", "colors"],
      },
      {
        id: "dates",
        title: "تاریخ‌ها",
        description: "نمونه استفاده از تقویم فارسی تک‌تاریخ و بازه‌ای.",
        fieldNames: ["launchDate", "campaignWindow"],
      },
      {
        id: "supplier",
        title: "تامین و توضیحات",
        fieldNames: [
          "supplier.name",
          "supplier.email",
          "description",
          "preview",
        ],
      },
    ],
    validate: async (values) => {
      const errors: Record<string, string> = {};
      if (values.price !== null && values.price < 100_000) {
        errors.price = "برای این دمو قیمت باید حداقل ۱۰۰٬۰۰۰ تومان باشد.";
      }
      if (values.stock !== null && values.stock > 5000) {
        errors.stock = "موجودی دمو نمی‌تواند بیشتر از ۵۰۰۰ باشد.";
      }
      return errors;
    },
  };
}

function emptyProductForm(): ProductForm {
  return {
    sku: "",
    name: "",
    category: "",
    brand: "najib",
    price: null,
    stock: null,
    status: "draft",
    featured: false,
    colors: [],
    launchDate: null,
    campaignWindow: { from: null, to: null },
    supplier: { name: "", email: "" },
    description: "",
  };
}

function productToForm(product: Product): ProductForm {
  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    brand: product.brand,
    price: product.price,
    stock: product.stock,
    status: product.status,
    featured: product.featured,
    colors: product.colors,
    launchDate: product.launchDate,
    campaignWindow: { from: null, to: null },
    supplier: { ...product.supplier },
    description: product.description,
  };
}

function formToProduct(values: ProductForm, id: string): Product {
  const existing = fakeDb.find((item) => item.id === id);
  return {
    id,
    sku: values.sku,
    name: values.name,
    category: values.category,
    brand: values.brand,
    price: Number(values.price ?? 0),
    stock: Number(values.stock ?? 0),
    sales: existing?.sales ?? 0,
    status: values.status,
    featured: values.featured,
    colors: values.colors,
    launchDate: values.launchDate ?? "2026-09-14",
    createdAt: existing?.createdAt ?? "2026-09-14",
    supplier: values.supplier,
    description: values.description,
  };
}

function mapFakeError(error: unknown) {
  const typed = error as FakeError;
  return {
    message: typed?.message ?? "ذخیره انجام نشد.",
    fieldErrors: typed?.fieldErrors,
  };
}

function readSortValue(product: Product, key: string): unknown {
  if (key === "supplier.name") return product.supplier.name;
  return product[key as keyof Product];
}

function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={
        status === "active"
          ? "inline-flex border border-[var(--adt-success)]/30 bg-[var(--adt-success)]/[0.06] px-2 py-1 text-[8px] font-semibold text-[var(--adt-success)]"
          : status === "draft"
            ? "inline-flex border border-[var(--adt-warning)]/30 bg-[var(--adt-warning)]/[0.06] px-2 py-1 text-[8px] font-semibold text-[var(--adt-warning)]"
            : "inline-flex border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-2 py-1 text-[8px] font-semibold text-[var(--adt-muted)]"
      }
    >
      {statusLabel(status)}
    </span>
  );
}
