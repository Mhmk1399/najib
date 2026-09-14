"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore, Layers3, Palette, Ruler, Shapes, Tags } from "lucide-react";
import { CatalogSectionNav } from "@/components/admin/catalog-section-nav";
import { DynamicDataTable } from "@/components/global/table/DynamicTable";
import { DataButton } from "@/components/global/table/primitives";
import type { DataSelectOption, DynamicColumn, DynamicFormSchema, DynamicTableResult } from "@/components/global/table/types";
import { useToast } from "@/components/ui/CustomToast";
import { emptyLocalizedText, fa, trimLocalized, type LocalizedText } from "@/lib/admin/localization";

type Resource = "collections" | "colors" | "size-groups" | "sizes" | "variants";
type ReferenceRecord = {
  _id: string;
  name?: LocalizedText;
  slug?: string;
  description?: LocalizedText;
  family?: LocalizedText;
  hex?: string;
  swatchImageUrl?: string;
  code?: string;
  sizeGroupId?: string;
  productId?: string;
  colorId?: string;
  sizeId?: string;
  sku?: string;
  barcode?: string;
  priceOverrideMinor?: number;
  isActive: boolean;
  sortOrder?: number;
  startsAt?: string;
  endsAt?: string;
  updatedAt?: string;
};
type FormValues = Record<string, unknown> & {
  name: LocalizedText; slug: string; description: LocalizedText; family: LocalizedText;
  code: string; hex: string; swatchImageUrl: string; sizeGroupId: string;
  productId: string; colorId: string; sizeId: string; sku: string; barcode: string;
  priceOverride: number | null; isActive: boolean; sortOrder: number;
  startsAt: string; endsAt: string;
};
type ListResponse<T> = { items: T[]; pagination: { page: number; limit: number; total: number; pages: number } };
type Filters = Record<string, unknown> & { isActive?: string | null };

const resources: Array<{ id: Resource; label: string; description: string; icon: typeof Tags }> = [
  { id: "collections", label: "مجموعه‌ها", description: "فصل‌ها و کمپین‌های فروش", icon: Layers3 },
  { id: "colors", label: "رنگ‌ها", description: "نام، خانواده و نمونه رنگ", icon: Palette },
  { id: "size-groups", label: "گروه‌های سایز", description: "ساختارهای اندازه‌گیری", icon: Shapes },
  { id: "sizes", label: "سایزها", description: "سایزهای هر گروه", icon: Ruler },
  { id: "variants", label: "تنوع محصولات", description: "ترکیب محصول، رنگ و سایز", icon: Tags },
];
const statusOptions: DataSelectOption[] = [{ value: "true", label: "فعال" }, { value: "false", label: "غیرفعال" }];

function emptyForm(): FormValues {
  return { name: emptyLocalizedText(), slug: "", description: emptyLocalizedText(), family: emptyLocalizedText(), code: "", hex: "", swatchImageUrl: "", sizeGroupId: "", productId: "", colorId: "", sizeId: "", sku: "", barcode: "", priceOverride: null, isActive: true, sortOrder: 0, startsAt: "", endsAt: "" };
}
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180); }
function recordLabel(record: ReferenceRecord) { return record.name ? fa(record.name) : record.sku || record.code || "رکورد کاتالوگ"; }
function normalize(record: ReferenceRecord): FormValues {
  return { ...emptyForm(), ...record, name: record.name ?? emptyLocalizedText(), description: record.description ?? emptyLocalizedText(), family: record.family ?? emptyLocalizedText(), priceOverride: record.priceOverrideMinor === undefined ? null : record.priceOverrideMinor / 100, startsAt: record.startsAt?.slice(0, 10) ?? "", endsAt: record.endsAt?.slice(0, 10) ?? "" };
}
function localizedFields(prefix: string, label: string, kind: "input" | "textarea" = "input") {
  return (["fa", "en", "ar"] as const).map((locale) => ({ kind, name: `${prefix}.${locale}`, label: `${label} ${locale === "fa" ? "فارسی" : locale === "en" ? "انگلیسی" : "عربی"}`, dir: locale === "en" ? "ltr" as const : "rtl" as const, ...(kind === "textarea" ? { rows: 4 } : {}) }));
}
function requiredLocalized(value: LocalizedText | undefined, label: string) { return value?.fa.trim() && value.en.trim() && value.ar.trim() ? null : `${label} باید در هر سه زبان تکمیل شود.`; }

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) { const body = (await response.json().catch(() => ({}))) as { error?: string }; throw new Error(body.error || "درخواست انجام نشد."); }
  return response.json() as Promise<T>;
}
async function all(resource: string): Promise<ReferenceRecord[]> {
  const items: ReferenceRecord[] = [];
  let page = 1;
  while (true) {
    const data = await api<ListResponse<ReferenceRecord>>(`/api/catalog/${resource}?page=${page}&limit=100`);
    items.push(...data.items);
    if (page >= data.pagination.pages) return items;
    page += 1;
  }
}
function options(records: ReferenceRecord[]) { return records.map((record) => ({ value: record._id, label: recordLabel(record), description: record.slug ?? record.sku ?? record.code })); }

function schemaFor(resource: Resource, refs: { groups: DataSelectOption[]; products: DataSelectOption[]; colors: DataSelectOption[]; sizes: DataSelectOption[] }): DynamicFormSchema<FormValues> {
  const fields: DynamicFormSchema<FormValues>["fields"] = [];
  if (resource !== "variants") fields.push(...localizedFields("name", "نام").map((field) => ({ ...field, required: true })));
  if (resource === "collections" || resource === "colors") fields.push({ kind: "input", name: "slug", label: "شناسه URL", dir: "ltr", required: true, parse: (value) => slugify(value) });
  if (resource === "collections") {
    fields.push(...localizedFields("description", "توضیحات", "textarea"), { kind: "date", name: "startsAt", label: "تاریخ شروع", clearable: true }, { kind: "date", name: "endsAt", label: "تاریخ پایان", clearable: true });
  }
  if (resource === "colors") fields.push(...localizedFields("family", "خانواده رنگ").map((field) => ({ ...field, required: true })), { kind: "input", name: "hex", label: "کد HEX", dir: "ltr", placeholder: "#1C1C1C" }, { kind: "input", inputType: "url", name: "swatchImageUrl", label: "URL تصویر نمونه", dir: "ltr" });
  if (resource === "size-groups") fields.push({ kind: "input", name: "code", label: "کد گروه", dir: "ltr", required: true });
  if (resource === "sizes") fields.push({ kind: "select", name: "sizeGroupId", label: "گروه سایز", options: refs.groups, searchable: true, required: true }, { kind: "input", name: "code", label: "کد سایز", dir: "ltr", required: true }, { kind: "input", inputType: "number", name: "sortOrder", label: "ترتیب نمایش", min: 0, step: 1 });
  if (resource === "collections" || resource === "colors") fields.push({ kind: "input", inputType: "number", name: "sortOrder", label: "ترتیب نمایش", min: 0, step: 1 });
  if (resource === "variants") fields.push(
    { kind: "select", name: "productId", label: "محصول", options: refs.products, searchable: true, required: true },
    { kind: "select", name: "colorId", label: "رنگ", options: refs.colors, searchable: true, required: true },
    { kind: "select", name: "sizeId", label: "سایز", options: refs.sizes, searchable: true, required: true },
    { kind: "input", name: "sku", label: "SKU", dir: "ltr", required: true },
    { kind: "input", name: "barcode", label: "بارکد", dir: "ltr" },
    { kind: "input", inputType: "number", name: "priceOverride", label: "قیمت جایگزین", min: 0, step: 0.01 },
  );
  fields.push({ kind: "boolean", name: "isActive", label: "وضعیت", onLabel: "فعال", offLabel: "غیرفعال" });
  return { fields, validate: (values) => {
    const errors: Record<string, string> = {};
    if (resource !== "variants") { const error = requiredLocalized(values.name, "نام"); if (error) errors["name.fa"] = error; }
    if ((resource === "collections" || resource === "colors") && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) errors.slug = "شناسه URL باید انگلیسی، کوچک و با خط تیره باشد.";
    if (resource === "colors") { const error = requiredLocalized(values.family, "خانواده رنگ"); if (error) errors["family.fa"] = error; if (values.hex && !/^#[0-9A-Fa-f]{6}$/.test(values.hex)) errors.hex = "کد رنگ باید مانند #1C1C1C باشد."; }
    if (resource === "sizes" && !values.sizeGroupId) errors.sizeGroupId = "گروه سایز را انتخاب کنید.";
    if (resource === "variants") { if (!values.productId) errors.productId = "محصول را انتخاب کنید."; if (!values.colorId) errors.colorId = "رنگ را انتخاب کنید."; if (!values.sizeId) errors.sizeId = "سایز را انتخاب کنید."; if (!values.sku.trim()) errors.sku = "SKU الزامی است."; }
    return errors;
  } };
}

function payload(resource: Resource, value: FormValues) {
  if (resource === "collections") return { name: trimLocalized(value.name), slug: slugify(value.slug), description: trimLocalized(value.description), isActive: value.isActive, startsAt: value.startsAt || undefined, endsAt: value.endsAt || undefined, sortOrder: Number(value.sortOrder) || 0 };
  if (resource === "colors") return { name: trimLocalized(value.name), slug: slugify(value.slug), family: trimLocalized(value.family), hex: value.hex.trim() || undefined, swatchImageUrl: value.swatchImageUrl.trim() || undefined, isActive: value.isActive, sortOrder: Number(value.sortOrder) || 0 };
  if (resource === "size-groups") return { name: trimLocalized(value.name), code: value.code.trim().toUpperCase(), isActive: value.isActive };
  if (resource === "sizes") return { sizeGroupId: value.sizeGroupId, name: trimLocalized(value.name), code: value.code.trim().toUpperCase(), sortOrder: Number(value.sortOrder) || 0, isActive: value.isActive };
  return { productId: value.productId, colorId: value.colorId, sizeId: value.sizeId, sku: value.sku.trim().toUpperCase(), barcode: value.barcode.trim() || undefined, priceOverrideMinor: value.priceOverride === null ? undefined : Math.round(Number(value.priceOverride) * 100), isActive: value.isActive };
}

export function CatalogReferenceManager({ canWrite }: { canWrite: boolean }) {
  const [resource, setResource] = useState<Resource>("collections");
  const queryClient = useQueryClient();
  const toast = useToast();
  const groups = useQuery({ queryKey: ["catalog", "all-size-groups"], queryFn: () => all("size-groups"), enabled: resource === "sizes" });
  const products = useQuery({ queryKey: ["catalog", "all-products"], queryFn: () => all("products"), enabled: resource === "variants" });
  const colors = useQuery({ queryKey: ["catalog", "all-colors"], queryFn: () => all("colors"), enabled: resource === "variants" });
  const sizes = useQuery({ queryKey: ["catalog", "all-sizes"], queryFn: () => all("sizes"), enabled: resource === "variants" });
  const refs = useMemo(() => ({ groups: options(groups.data ?? []), products: options(products.data ?? []), colors: options(colors.data ?? []), sizes: options(sizes.data ?? []) }), [groups.data, products.data, colors.data, sizes.data]);
  const schema = useMemo(() => schemaFor(resource, refs), [resource, refs]);
  const current = resources.find((item) => item.id === resource) ?? resources[0];
  const refMaps = useMemo(() => ({ groups: new Map((groups.data ?? []).map((r) => [r._id, recordLabel(r)])), products: new Map((products.data ?? []).map((r) => [r._id, recordLabel(r)])), colors: new Map((colors.data ?? []).map((r) => [r._id, recordLabel(r)])), sizes: new Map((sizes.data ?? []).map((r) => [r._id, recordLabel(r)])) }), [groups.data, products.data, colors.data, sizes.data]);
  const columns = useMemo<DynamicColumn<ReferenceRecord>[]>(() => {
    const first: DynamicColumn<ReferenceRecord> = { id: "identity", label: resource === "variants" ? "تنوع" : "عنوان", minWidth: 220, sticky: "start", lockVisibility: true, cell: ({ record }) => <span><strong className="block text-[11px]">{recordLabel(record)}</strong><small dir="ltr" className="mt-1 block text-left text-[9px] text-[var(--adt-muted)]">{record.slug ?? record.sku ?? record.code ?? "—"}</small></span>, mobile: { priority: 1, showLabel: false } };
    const result = [first];
    if (resource === "colors") result.push({ id: "family", label: "خانواده", cell: ({ record }) => record.family ? fa(record.family) : "—" }, { id: "hex", label: "رنگ", cell: ({ record }) => <span className="inline-flex items-center gap-2" dir="ltr"><i className="size-4 border border-[var(--adt-border)]" style={{ background: record.hex || "transparent" }} />{record.hex || "—"}</span> });
    if (resource === "sizes") result.push({ id: "group", label: "گروه", cell: ({ record }) => refMaps.groups.get(record.sizeGroupId ?? "") ?? "—" });
    if (resource === "variants") result.push({ id: "product", label: "محصول", cell: ({ record }) => refMaps.products.get(record.productId ?? "") ?? "—" }, { id: "color", label: "رنگ", cell: ({ record }) => refMaps.colors.get(record.colorId ?? "") ?? "—" }, { id: "size", label: "سایز", cell: ({ record }) => refMaps.sizes.get(record.sizeId ?? "") ?? "—" });
    result.push({ id: "status", label: "وضعیت", cell: ({ record }) => <span className={record.isActive ? "text-[var(--adt-success)]" : "text-[var(--adt-warning)]"}>{record.isActive ? "فعال" : "غیرفعال"}</span>, mobile: { priority: 2 } });
    return result;
  }, [resource, refMaps]);
  const invalidate = () => { void queryClient.invalidateQueries({ queryKey: ["catalog"] }); };
  const save = (id: string | null, values: FormValues) => api<ReferenceRecord>(`/api/catalog/${resource}${id ? `/${id}` : ""}`, { method: id ? "PATCH" : "POST", body: JSON.stringify(payload(resource, values)) });

  return <div className="min-w-0 space-y-3 p-3 sm:p-4 lg:p-5">
    <CatalogSectionNav />
    <section className="border border-[var(--adt-border)] bg-[var(--adt-surface)] p-3">
      <h1 className="px-1 text-[16px] font-bold">اطلاعات پایه کاتالوگ</h1><p className="mt-1 px-1 text-[11px] leading-6 text-[var(--adt-muted)]">مجموعه‌ها، رنگ‌ها، سایزها و تنوع‌های قابل انتخاب محصول را از این بخش مدیریت کنید.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{resources.map(({ id, label, description, icon: Icon }) => <DataButton key={id} tone={resource === id ? "danger" : "ghost"} size="md" icon={<Icon size={15} />} onClick={() => setResource(id)} aria-pressed={resource === id}><span className="text-right"><strong className="block text-[11px]">{label}</strong><small className="mt-0.5 block text-[8px] opacity-65">{description}</small></span></DataButton>)}</div>
    </section>
    <DynamicDataTable<ReferenceRecord, FormValues, FormValues, Filters>
      key={resource} tableId={`admin-${resource}`} eyebrow="اطلاعات پایه" title={current.label} description={current.description}
      source={{ queryKey: ["catalog", resource], fetchPage: async ({ page, pageSize, search, filters, signal }) => { const params = new URLSearchParams({ page: String(page), limit: String(pageSize) }); if (search) params.set("search", search); if (filters.isActive) params.set("isActive", String(filters.isActive)); const data = await api<ListResponse<ReferenceRecord>>(`/api/catalog/${resource}?${params}`, { signal }); return { items: data.items, total: data.pagination.total, page: data.pagination.page, pageSize: data.pagination.limit, pageCount: data.pagination.pages } satisfies DynamicTableResult<ReferenceRecord>; } }}
      columns={columns} getRowId={(record) => record._id} getRowLabel={recordLabel} search={{ placeholder: "جستجو در این بخش…" }} filters={[{ id: "isActive", kind: "select", label: "وضعیت", options: statusOptions, defaultValue: null }]} initialFilters={{ isActive: null }} pagination={{ initialPageSize: 15, pageSizeOptions: [10, 15, 25, 50], showPageNumbers: true }} columnVisibility={{ enabled: true, persist: true, storageKey: `admin-${resource}-columns` }} mobile={{ title: recordLabel, badge: (record) => record.isActive ? "فعال" : "غیرفعال", maxFields: 4 }}
      crud={{ create: { enabled: canWrite, label: `${current.label} جدید`, title: `ساخت ${current.label}`, schema, initialValues: emptyForm, mutationFn: ({ values }) => save(null, values), onSuccess: () => { invalidate(); toast.success("رکورد ساخته شد"); }, mapError: (error) => ({ message: error instanceof Error ? error.message : "ذخیره انجام نشد." }) }, edit: { enabled: canWrite, title: (record) => `ویرایش ${recordLabel(record)}`, schema, toInitialValues: normalize, mutationFn: ({ id, values }) => save(id, values), onSuccess: () => { invalidate(); toast.success("تغییرات ذخیره شد"); }, mapError: (error) => ({ message: error instanceof Error ? error.message : "ذخیره انجام نشد." }) }, view: { title: (record) => recordLabel(record), fields: [{ id: "title", label: "عنوان", render: ({ record }) => recordLabel(record) }, { id: "code", label: "شناسه", render: ({ record }) => record.slug ?? record.sku ?? record.code ?? "—" }, { id: "status", label: "وضعیت", render: ({ record }) => record.isActive ? "فعال" : "غیرفعال" }] }, extraRowActions: canWrite ? [{ id: "lifecycle", label: "تغییر وضعیت", icon: <ArchiveRestore size={14} />, tone: "warning", onClick: async (record) => { await api(`/api/catalog/${resource}/${record._id}`, { method: "PATCH", body: JSON.stringify({ isActive: !record.isActive }) }); invalidate(); toast.success(record.isActive ? "رکورد غیرفعال شد" : "رکورد فعال شد"); } }] : [] }}
      emptyState={{ title: `هنوز ${current.label} ثبت نشده است.`, description: canWrite ? "برای شروع، اولین رکورد را بسازید." : "رکوردی برای نمایش وجود ندارد." }}
    />
  </div>;
}
