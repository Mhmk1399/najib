"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  Boxes,
  Building2,
  CheckCircle2,
  CircleGauge,
  ClipboardList,
  Clock3,
  MapPin,
  PackageCheck,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Store as StoreIcon,
  Warehouse,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { DynamicDataTable } from "@/components/global/table/DynamicTable";
import { DynamicModal } from "@/components/global/table/DynamicModal";
import {
  DataButton,
  DataInput,
  DataSelect,
  DataTextarea,
} from "@/components/global/table/primitives";
import type {
  DataSelectOption,
  DynamicColumn,
  DynamicFormSchema,
  DynamicTableResult,
} from "@/components/global/table/types";
import {
  getAdminDataThemeVars,
  useAdminTheme,
} from "@/components/admin/useAdminTheme";
import { useToast } from "@/components/ui/CustomToast";
import {
  emptyLocalizedText,
  fa,
  trimLocalized,
  type LocalizedText,
} from "@/lib/admin/localization";

type MainTab = "balances" | "masters" | "movements" | "reservations" | "transfers";
type MasterResource = "cities" | "stores" | "pools" | "locations";
type RefValue = string | { _id: string; code?: string; sku?: string; name?: LocalizedText; type?: string };
type Pagination = { page: number; limit: number; total: number; pages: number };
type ListResponse<T> = { items: T[]; pagination: Pagination };
type Filters = Record<string, unknown> & { isActive?: string | null; status?: string | null };
type MasterRecord = {
  _id: string;
  code: string;
  name: LocalizedText;
  countryCode?: string;
  cityId?: RefValue | null;
  poolId?: RefValue | null;
  storeId?: RefValue | null;
  address?: LocalizedText;
  shippingFeeMinor?: number;
  shippingFeeIrrMinor?: number;
  shippingFeeUsdMinor?: number;
  type?: "warehouse" | "store" | "virtual";
  isActive: boolean;
  updatedAt?: string;
};
type CatalogReference = { _id: string; name: LocalizedText; isActive?: boolean };
type Variant = { _id: string; sku: string; productId?: RefValue; colorId?: RefValue; sizeId?: RefValue; isActive: boolean };
type Balance = {
  _id: string;
  variantId: RefValue;
  locationId: RefValue;
  onHand: number;
  reserved: number;
  safetyStock: number;
  available: number;
  updatedAt?: string;
};
type Movement = {
  _id: string;
  type: string;
  variantId: RefValue;
  locationId: RefValue;
  onHandDelta: number;
  reservedDelta: number;
  onHandAfter: number;
  reservedAfter: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  createdAt?: string;
};
type Reservation = {
  _id: string;
  status: "active" | "committed" | "released" | "expired";
  items: Array<{ variantId: RefValue; locationId: RefValue; quantity: number }>;
  expiresAt: string;
  createdAt?: string;
};
type Transfer = {
  _id: string;
  sourceLocationId: RefValue;
  destinationLocationId: RefValue;
  items: Array<{ variantId: RefValue; quantity: number }>;
  status: "completed" | "cancelled";
  reason: string;
  completedAt?: string;
};
type MasterForm = Record<string, unknown> & {
  code: string;
  name: LocalizedText;
  countryCode: string;
  cityId: string;
  poolId: string;
  storeId: string;
  address: LocalizedText;
  shippingFeeMinor: number;
  shippingFeeIrrMinor: number;
  shippingFeeUsd: number;
  type: "warehouse" | "store" | "virtual";
  isActive: boolean;
};
type MutationKind = "adjustment" | "transfer" | "reservation";
type InventoryDialog = "add-stock" | MutationKind;

const number = new Intl.NumberFormat("fa-IR");
const QUICK_STOCK_REASON = "افزایش موجودی روزمره توسط مدیریت";
const QUICK_STOCK_NOTE_MAX = 500 - QUICK_STOCK_REASON.length - 3;
const QUICK_STOCK_QUANTITY_MAX = 1_000_000;
const mainTabs: Array<{ id: MainTab; label: string; description: string; icon: typeof Boxes }> = [
  { id: "balances", label: "موجودی", description: "مانده دقیق هر تنوع", icon: CircleGauge },
  { id: "masters", label: "مکان‌ها", description: "ساختار نگهداری کالا", icon: Warehouse },
  { id: "movements", label: "گردش موجودی", description: "دفتر تغییرات غیرقابل ویرایش", icon: ClipboardList },
  { id: "reservations", label: "رزروها", description: "تعهدهای فعال و نهایی", icon: Clock3 },
  { id: "transfers", label: "انتقال‌ها", description: "جابجایی بین مکان‌ها", icon: ArrowLeftRight },
];
const masterTabs: Array<{ id: MasterResource; label: string; icon: typeof Boxes }> = [
  { id: "cities", label: "شهرها", icon: MapPin },
  { id: "stores", label: "فروشگاه‌ها", icon: StoreIcon },
  { id: "pools", label: "استخرهای موجودی", icon: Boxes },
  { id: "locations", label: "مکان‌های نگهداری", icon: Building2 },
];
const statusOptions: DataSelectOption[] = [
  { value: "true", label: "فعال" },
  { value: "false", label: "غیرفعال" },
];
const reservationStatusOptions: DataSelectOption[] = [
  { value: "active", label: "فعال" },
  { value: "committed", label: "قطعی‌شده" },
  { value: "released", label: "آزادشده" },
  { value: "expired", label: "منقضی" },
];

function refId(value?: RefValue | null) {
  return typeof value === "string" ? value : value?._id ?? "";
}
function refLabel(value?: RefValue | null) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return (value.name ? fa(value.name) : "") || value.sku || value.code || value._id;
}
function ltrId(value?: RefValue | null) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.sku || value.code || value._id;
}
function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function signed(value: number) {
  return `${value > 0 ? "+" : ""}${number.format(value)}`;
}
function toResult<T>(data: ListResponse<T>): DynamicTableResult<T> {
  return { items: data.items, total: data.pagination.total, page: data.pagination.page, pageSize: data.pagination.limit, pageCount: data.pagination.pages };
}
function newKey(kind: MutationKind) {
  return `admin-${kind}-${crypto.randomUUID()}`;
}
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string; details?: Array<{ message?: string }> };
    throw new Error(body.error || body.details?.[0]?.message || "درخواست انجام نشد. دوباره تلاش کنید.");
  }
  return response.json() as Promise<T>;
}
async function all<T>(url: string) {
  const result: T[] = [];
  let page = 1;
  while (true) {
    const separator = url.includes("?") ? "&" : "?";
    const data = await api<ListResponse<T>>(`${url}${separator}page=${page}&limit=100`);
    result.push(...data.items);
    if (page >= data.pagination.pages) return result;
    page += 1;
  }
}
function asOptions(items: MasterRecord[]): DataSelectOption[] {
  return items.map((item) => ({
    value: item._id,
    label: fa(item.name),
    description: item.code,
    disabled: !item.isActive,
  }));
}
function exactVariantOptions(variants: Variant[], products: CatalogReference[], colors: CatalogReference[], sizes: CatalogReference[]): DataSelectOption[] {
  const productNames = new Map(products.map((item) => [item._id, fa(item.name)]));
  const colorNames = new Map(colors.map((item) => [item._id, fa(item.name)]));
  const sizeNames = new Map(sizes.map((item) => [item._id, fa(item.name)]));
  return variants.map((variant) => {
    const product = productNames.get(refId(variant.productId));
    const color = colorNames.get(refId(variant.colorId));
    const size = sizeNames.get(refId(variant.sizeId));
    const attributes = [color, size].filter(Boolean).join(" · ");
    return {
      value: variant._id,
      label: product ? `${product}${attributes ? ` — ${attributes}` : ""}` : variant.sku,
      description: `SKU: ${variant.sku}`,
      keywords: [variant.sku, product, color, size].filter((value): value is string => Boolean(value)),
      disabled: !variant.isActive,
    };
  });
}
function locationOptions(items: MasterRecord[]): DataSelectOption[] {
  return items.map((item) => ({
    value: item._id,
    label: fa(item.name),
    description: `${item.code}${item.storeId ? ` · شعبه ${refLabel(item.storeId)}` : ""}`,
    keywords: [item.code, refLabel(item.storeId)],
    disabled: !item.isActive,
  }));
}
function emptyMaster(): MasterForm {
  return { code: "", name: emptyLocalizedText(), countryCode: "IR", cityId: "", poolId: "", storeId: "", address: emptyLocalizedText(), shippingFeeMinor: 0, shippingFeeIrrMinor: 0, shippingFeeUsd: 0, type: "warehouse", isActive: true };
}
function localizedFields(prefix: "name" | "address", label: string, required = false) {
  return (["fa", "en", "ar"] as const).map((locale) => ({
    kind: "input" as const,
    name: `${prefix}.${locale}`,
    label: `${label} ${locale === "fa" ? "فارسی" : locale === "en" ? "انگلیسی" : "عربی"}`,
    dir: locale === "en" ? ("ltr" as const) : ("rtl" as const),
    required,
  }));
}

export function InventoryManager({ canWrite }: { canWrite: boolean }) {
  const [tab, setTab] = useState<MainTab>("balances");
  const [master, setMaster] = useState<MasterResource>("locations");
  const [dialog, setDialog] = useState<InventoryDialog | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const theme = useAdminTheme();
  const themeVars = useMemo(() => getAdminDataThemeVars(theme), [theme]);
  const queryClient = useQueryClient();
  const toast = useToast();

  const overview = useQuery({
    queryKey: ["inventory", "overview"],
    queryFn: async () => {
      const [balances, reservations, movements] = await Promise.all([
        api<ListResponse<Balance>>("/api/admin/inventory/balances?page=1&limit=1"),
        api<ListResponse<Reservation>>("/api/admin/inventory/reservations?page=1&limit=1&status=active"),
        api<ListResponse<Movement>>("/api/admin/inventory/movements?page=1&limit=1"),
      ]);
      return { balances: balances.pagination.total, reservations: reservations.pagination.total, movements: movements.pagination.total };
    },
  });
  const cities = useQuery({ queryKey: ["inventory", "refs", "cities"], queryFn: () => all<MasterRecord>("/api/admin/inventory/cities") });
  const stores = useQuery({ queryKey: ["inventory", "refs", "stores"], queryFn: () => all<MasterRecord>("/api/admin/inventory/stores") });
  const pools = useQuery({ queryKey: ["inventory", "refs", "pools"], queryFn: () => all<MasterRecord>("/api/admin/inventory/pools") });
  const locations = useQuery({ queryKey: ["inventory", "refs", "locations"], queryFn: () => all<MasterRecord>("/api/admin/inventory/locations?include=references") });
  const variants = useQuery({ queryKey: ["inventory", "refs", "variants"], queryFn: () => all<Variant>("/api/catalog/variants") });
  const products = useQuery({ queryKey: ["inventory", "refs", "products"], queryFn: () => all<CatalogReference>("/api/catalog/products") });
  const colors = useQuery({ queryKey: ["inventory", "refs", "colors"], queryFn: () => all<CatalogReference>("/api/catalog/colors") });
  const sizes = useQuery({ queryKey: ["inventory", "refs", "sizes"], queryFn: () => all<CatalogReference>("/api/catalog/sizes") });
  const references = useMemo(() => ({
    cities: asOptions(cities.data ?? []),
    stores: asOptions(stores.data ?? []),
    pools: asOptions(pools.data ?? []),
    locations: locationOptions(locations.data ?? []),
    variants: exactVariantOptions(variants.data ?? [], products.data ?? [], colors.data ?? [], sizes.data ?? []),
  }), [cities.data, stores.data, pools.data, locations.data, variants.data, products.data, colors.data, sizes.data]);
  const referenceQueries = [cities, stores, pools, locations, variants, products, colors, sizes];
  const referencesLoading = referenceQueries.some((query) => query.isLoading);
  const referencesError = referenceQueries.some((query) => query.isError);

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["inventory"] });

  return (
    <div style={themeVars} className="min-w-0 space-y-3 p-3 text-[var(--adt-text)] sm:p-4 lg:p-5">
      <section className="relative overflow-hidden border border-[var(--adt-border)] bg-[var(--adt-surface)] px-4 py-5 sm:px-5">
        <div aria-hidden className="absolute inset-y-0 right-0 w-1 bg-[var(--adt-accent)]" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[8px] font-bold tracking-[0.18em] text-[var(--adt-accent-strong)]">ATELIER INVENTORY</p>
            <h1 className="mt-2 text-[20px] font-extrabold sm:text-[24px]">مرکز کنترل موجودی</h1>
            <p className="mt-2 max-w-2xl text-[12px] leading-7 text-[var(--adt-muted)]">مانده دقیق هر تنوع را ببینید و اصلاح، رزرو یا انتقال کالا را با ثبت کامل گردش انجام دهید.</p>
          </div>
          {canWrite ? <DataButton size="lg" tone="primary" icon={<Plus size={17} />} onClick={() => setDialog("add-stock")}>افزودن موجودی</DataButton> : null}
        </div>
        {canWrite ? <div className="mt-4 border-t border-[var(--adt-border)] pt-3"><button type="button" aria-expanded={advancedOpen} onClick={() => setAdvancedOpen((value) => !value)} className="flex min-h-10 items-center gap-2 text-[10px] font-semibold text-[var(--adt-muted)] outline-none transition-colors hover:text-[var(--adt-text)] focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/35"><Settings2 size={14} />عملیات پیشرفته<span aria-hidden className={`text-[12px] transition-transform ${advancedOpen ? "rotate-180" : ""}`}>⌄</span></button>{advancedOpen ? <div className="mt-2 grid gap-2 sm:grid-cols-3"><DataButton onClick={() => setDialog("adjustment")}>اصلاح، کاهش و ذخیره امن</DataButton><DataButton icon={<ArrowLeftRight size={15} />} onClick={() => setDialog("transfer")}>انتقال بین مکان‌ها</DataButton><DataButton icon={<ShieldCheck size={15} />} onClick={() => setDialog("reservation")}>ایجاد رزرو دستی</DataButton></div> : null}</div> : null}
      </section>

      <section aria-label="نمای کلی عملیات" className="grid border border-[var(--adt-border)] bg-[var(--adt-surface)] sm:grid-cols-3">
        <Metric icon={<PackageCheck size={17} />} label="ردیف‌های موجودی" value={overview.data?.balances} loading={overview.isLoading} unavailable={overview.isError} />
        <Metric icon={<Clock3 size={17} />} label="رزروهای فعال" value={overview.data?.reservations} loading={overview.isLoading} unavailable={overview.isError} />
        <Metric icon={<ClipboardList size={17} />} label="سوابق گردش" value={overview.data?.movements} loading={overview.isLoading} unavailable={overview.isError} last />
        {overview.isError ? <div role="alert" className="flex flex-col gap-2 border-t border-[var(--adt-danger)]/30 bg-[var(--adt-danger)]/[0.06] px-4 py-3 text-[11px] leading-6 text-[var(--adt-danger)] sm:col-span-3 sm:flex-row sm:items-center sm:justify-between"><span>آمار عملیاتی در دسترس نیست؛ خط تیره به‌معنای صفر نیست.</span><DataButton size="sm" tone="danger" className="min-h-11" icon={<RefreshCw size={14} />} onClick={() => void overview.refetch()}>تلاش دوباره</DataButton></div> : null}
      </section>

      {referencesError ? <div role="alert" className="flex flex-col gap-2 border border-[var(--adt-warning)]/40 bg-[var(--adt-warning)]/[0.08] px-4 py-3 text-[11px] leading-6 text-[var(--adt-warning)] sm:flex-row sm:items-center sm:justify-between"><span>فهرست تنوع‌ها یا مکان‌ها دریافت نشد. فرم‌های عملیاتی تا بازیابی اطلاعات غیرفعال هستند.</span><DataButton size="sm" tone="warning" className="min-h-11" icon={<RefreshCw size={14} />} onClick={() => void queryClient.invalidateQueries({ queryKey: ["inventory", "refs"] })}>بازیابی فهرست‌ها</DataButton></div> : null}

      <nav aria-label="بخش‌های مدیریت موجودی" className="grid grid-cols-2 gap-px border border-[var(--adt-border)] bg-[var(--adt-border)] lg:grid-cols-5">
        {mainTabs.map(({ id, label, description, icon: Icon }) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)} className={`min-h-16 bg-[var(--adt-surface)] px-3 py-3 text-right outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--adt-accent)]/45 ${tab === id ? "text-[var(--adt-text)] shadow-[inset_-3px_0_0_var(--adt-accent)]" : "text-[var(--adt-muted)] hover:bg-[var(--adt-surface-muted)] hover:text-[var(--adt-text)]"}`}>
            <span className="flex items-center gap-2 text-[11px] font-bold"><Icon size={15} className={tab === id ? "text-[var(--adt-accent-strong)]" : ""} />{label}</span>
            <span className="mt-1 hidden text-[10px] leading-5 sm:block">{description}</span>
          </button>
        ))}
      </nav>

      {tab === "balances" ? <BalanceTable /> : null}
      {tab === "masters" ? <MasterManager resource={master} setResource={setMaster} canWrite={canWrite} refs={references} onChanged={invalidate} /> : null}
      {tab === "movements" ? <MovementTable /> : null}
      {tab === "reservations" ? <ReservationTable canWrite={canWrite} onChanged={invalidate} /> : null}
      {tab === "transfers" ? <TransferTable /> : null}

      <QuickStockModal key={dialog === "add-stock" ? "quick-open" : "quick-closed"} open={dialog === "add-stock"} onClose={() => setDialog(null)} refs={references} referencesLoading={referencesLoading} referencesError={referencesError} onRetryReferences={() => void queryClient.invalidateQueries({ queryKey: ["inventory", "refs"] })} onSuccess={(quantity) => { invalidate(); setDialog(null); toast.success(`${number.format(quantity)} عدد به موجودی اضافه شد`); }} />
      <InventoryActionModal key={dialog && dialog !== "add-stock" ? dialog : "closed"} kind={dialog === "add-stock" ? null : dialog} onClose={() => setDialog(null)} refs={references} referencesLoading={referencesLoading} referencesError={referencesError} onRetryReferences={() => void queryClient.invalidateQueries({ queryKey: ["inventory", "refs"] })} onSuccess={() => { invalidate(); setDialog(null); toast.success("عملیات پیشرفته موجودی ثبت شد"); }} />
    </div>
  );
}

function Metric({ icon, label, value, loading, unavailable, last }: { icon: ReactNode; label: string; value?: number; loading: boolean; unavailable?: boolean; last?: boolean }) {
  const display = loading ? "…" : unavailable || value === undefined ? "—" : number.format(value);
  return <div className={`flex min-h-24 items-center gap-3 px-4 py-4 ${last ? "" : "border-b border-[var(--adt-border)] sm:border-b-0 sm:border-l"}`}><span className="grid size-10 place-items-center border border-[var(--adt-border-strong)] bg-[var(--adt-surface-muted)] text-[var(--adt-accent-strong)]">{icon}</span><span><small className="block text-[11px] leading-5 text-[var(--adt-muted)]">{label}</small><strong className="mt-1 block text-[22px] leading-none" aria-label={unavailable ? `${label} در دسترس نیست` : undefined}>{display}</strong></span></div>;
}

function tableSource<T>(path: string, include = true) {
  return async ({ page, pageSize, filters, signal }: { page: number; pageSize: number; filters: Filters; signal: AbortSignal }) => {
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (include) params.set("include", "references");
    if (filters.status) params.set("status", String(filters.status));
    const data = await api<ListResponse<T>>(`${path}?${params}`, { signal });
    return toResult(data);
  };
}
function commonPagination() { return { initialPageSize: 15, pageSizeOptions: [10, 15, 25, 50], showPageNumbers: true }; }

function BalanceTable() {
  const columns: DynamicColumn<Balance>[] = [
    { id: "variant", label: "تنوع محصول", minWidth: 170, sticky: "start", lockVisibility: true, cell: ({ record }) => <span dir="ltr" className="block text-left text-[12px] font-semibold">{ltrId(record.variantId)}</span>, mobile: { hidden: true } },
    { id: "location", label: "مکان", minWidth: 170, cell: ({ record }) => <span><strong className="block text-[12px] leading-5">{refLabel(record.locationId)}</strong><small dir="ltr" className="mt-1 block text-left text-[11px] leading-5 text-[var(--adt-muted)]">{ltrId(record.locationId)}</small></span>, mobile: { hidden: true } },
    { id: "equation", label: "معادله موجودی", minWidth: 330, cell: ({ record }) => <StockEquation balance={record} />, mobile: { priority: 3, fullWidth: true, showLabel: false } },
    { id: "updated", label: "آخرین تغییر", cell: ({ record }) => formatDate(record.updatedAt), mobile: { priority: 4 } },
  ];
  return <DynamicDataTable<Balance, Record<string, unknown>, Record<string, unknown>, Filters> tableId="admin-inventory-balances" eyebrow="مانده عملیاتی" title="موجودی قابل فروش" description="فیزیکی منهای رزرو و ذخیره امن، مقدار واقعی قابل فروش را نشان می‌دهد." source={{ queryKey: ["inventory", "balances"], fetchPage: tableSource<Balance>("/api/admin/inventory/balances") }} columns={columns} getRowId={(r) => r._id} pagination={commonPagination()} columnVisibility={{ enabled: true, persist: true, storageKey: "inventory-balance-columns" }} mobile={{ title: (r) => ltrId(r.variantId), subtitle: (r) => refLabel(r.locationId), maxFields: 4 }} emptyState={{ title: "هنوز مانده‌ای ثبت نشده است.", description: "با اصلاح موجودی، نخستین مانده برای یک تنوع و مکان ساخته می‌شود." }} />;
}
function StockEquation({ balance }: { balance: Pick<Balance, "onHand" | "reserved" | "safetyStock" | "available"> }) {
  const cells = [["فیزیکی", balance.onHand], ["رزرو", balance.reserved], ["ذخیره امن", balance.safetyStock], ["قابل فروش", balance.available]] as const;
  return <div dir="rtl" aria-label={`فیزیکی ${balance.onHand} منهای رزرو ${balance.reserved} منهای ذخیره امن ${balance.safetyStock} برابر قابل فروش ${balance.available}`} className="grid w-full grid-cols-2 gap-px overflow-hidden border border-[var(--adt-border)] bg-[var(--adt-border)] md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1.15fr] md:items-stretch">{cells.map(([label, value], index) => <span key={label} className={`min-w-0 bg-[var(--adt-surface-muted)] px-3 py-3 ${index === 3 ? "text-[var(--adt-success)]" : "text-[var(--adt-text)]"}`}><small className="block text-[11px] leading-5 text-[var(--adt-muted)]">{label}</small><strong className="mt-1 block text-[18px] leading-none">{number.format(value)}</strong></span>).reduce<ReactNode[]>((all, cell, index) => [...all, ...(index ? [<span key={`op-${index}`} aria-hidden className="hidden items-center bg-[var(--adt-surface-muted)] px-1 text-[14px] text-[var(--adt-soft)] md:flex">{index === 3 ? "=" : "−"}</span>] : []), cell], [])}</div>;
}

function MovementTable() {
  const labels: Record<string, string> = { adjustment: "اصلاح", reservation: "رزرو", commit: "قطعی‌سازی", release: "آزادسازی", transfer_out: "خروج انتقال", transfer_in: "ورود انتقال", return: "مرجوعی" };
  const columns: DynamicColumn<Movement>[] = [
    { id: "date", label: "زمان", cell: ({ record }) => formatDate(record.createdAt), mobile: { priority: 2 } },
    { id: "type", label: "رویداد", cell: ({ record }) => <StatusBadge tone={record.type.includes("out") || record.type === "commit" ? "danger" : record.type.includes("in") || record.type === "release" ? "success" : "warning"}>{labels[record.type] ?? record.type}</StatusBadge>, mobile: { priority: 1 } },
    { id: "variant", label: "SKU", cell: ({ record }) => <span dir="ltr">{ltrId(record.variantId)}</span> },
    { id: "location", label: "مکان", cell: ({ record }) => refLabel(record.locationId) },
    { id: "change", label: "تغییر", cell: ({ record }) => <span dir="ltr" className="inline-flex gap-3"><span>فیزیکی {signed(record.onHandDelta)}</span><span>رزرو {signed(record.reservedDelta)}</span></span>, mobile: { priority: 3, fullWidth: true } },
    { id: "after", label: "مانده بعد", cell: ({ record }) => `${number.format(record.onHandAfter)} / ${number.format(record.reservedAfter)}` },
    { id: "reason", label: "دلیل", cell: ({ record }) => record.reason || "—" },
  ];
  return <DynamicDataTable<Movement, Record<string, unknown>, Record<string, unknown>, Filters> tableId="admin-inventory-movements" eyebrow="دفتر تغییرات" title="گردش موجودی" description="این سوابق برای قابلیت پیگیری عملیات، فقط خواندنی و غیرقابل ویرایش هستند." source={{ queryKey: ["inventory", "movements"], fetchPage: tableSource<Movement>("/api/admin/inventory/movements") }} columns={columns} getRowId={(r) => r._id} pagination={commonPagination()} mobile={{ title: (r) => labels[r.type] ?? r.type, subtitle: (r) => ltrId(r.variantId), maxFields: 5 }} emptyState={{ title: "هنوز گردشی ثبت نشده است.", description: "اصلاح، رزرو و انتقال‌ها به‌صورت خودکار در این دفتر ثبت می‌شوند." }} />;
}

function ReservationTable({ canWrite, onChanged }: { canWrite: boolean; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState("");
  const act = async (record: Reservation, action: "commit" | "release" | "expire") => {
    if (!window.confirm(action === "commit" ? "این رزرو قطعی و از موجودی فیزیکی کسر شود؟" : action === "release" ? "این رزرو آزاد شود؟" : "این رزرو منقضی شود؟")) return;
    setBusy(`${record._id}:${action}`);
    try {
      await api(`/api/admin/inventory/reservations/${record._id}`, { method: "PATCH", body: JSON.stringify({ action, reason: action === "commit" ? "قطعی‌سازی توسط مدیریت" : action === "release" ? "آزادسازی توسط مدیریت" : "انقضا توسط مدیریت" }) });
      onChanged(); toast.success("وضعیت رزرو ثبت شد");
    } catch (error) { toast.error(error instanceof Error ? error.message : "عملیات انجام نشد."); }
    finally { setBusy(""); }
  };
  const status = { active: "فعال", committed: "قطعی‌شده", released: "آزادشده", expired: "منقضی" };
  const columns: DynamicColumn<Reservation>[] = [
    { id: "id", label: "شناسه رزرو", minWidth: 170, cell: ({ record }) => <span dir="ltr" className="block max-w-[180px] truncate">{record._id}</span>, mobile: { priority: 2 } },
    { id: "status", label: "وضعیت", cell: ({ record }) => <StatusBadge tone={record.status === "committed" ? "success" : record.status === "active" ? "warning" : "neutral"}>{status[record.status]}</StatusBadge>, mobile: { priority: 1 } },
    { id: "items", label: "اقلام", cell: ({ record }) => <span>{number.format(record.items.length)} قلم · {number.format(record.items.reduce((sum, item) => sum + item.quantity, 0))} واحد</span>, mobile: { priority: 3 } },
    { id: "expires", label: "انقضا", cell: ({ record }) => formatDate(record.expiresAt) },
    { id: "lines", label: "جزئیات", minWidth: 240, cell: ({ record }) => <div className="space-y-1.5">{record.items.map((item, i) => <div key={i} className="text-[11px] leading-5"><span dir="ltr">{ltrId(item.variantId)}</span> · {refLabel(item.locationId)} · {number.format(item.quantity)}</div>)}</div>, mobile: { fullWidth: true, priority: 4 } },
  ];
  return <DynamicDataTable<Reservation, Record<string, unknown>, Record<string, unknown>, Filters> tableId="admin-inventory-reservations" eyebrow="تعهد موجودی" title="رزروها" description="رزرو فعال را فقط با تصمیم روشن قطعی، آزاد یا منقضی کنید." source={{ queryKey: ["inventory", "reservations"], fetchPage: tableSource<Reservation>("/api/admin/inventory/reservations") }} columns={columns} getRowId={(r) => r._id} filters={[{ id: "status", kind: "select", label: "وضعیت", options: reservationStatusOptions, defaultValue: null }]} initialFilters={{ status: null }} pagination={commonPagination()} mobile={{ title: (r) => status[r.status], subtitle: (r) => r._id, maxFields: 5 }} crud={{ extraRowActions: canWrite ? [{ id: "commit", label: "قطعی‌سازی", tone: "success", icon: <CheckCircle2 size={14} />, hidden: (r) => r.status !== "active", disabled: (r) => Boolean(busy) && busy !== `${r._id}:commit`, onClick: (r) => act(r, "commit") }, { id: "release", label: "آزادسازی", tone: "warning", icon: <RefreshCw size={14} />, hidden: (r) => r.status !== "active", disabled: () => Boolean(busy), onClick: (r) => act(r, "release") }, { id: "expire", label: "ثبت انقضا", tone: "danger", icon: <Clock3 size={14} />, hidden: (r) => r.status !== "active", disabled: () => Boolean(busy), onClick: (r) => act(r, "expire") }] : [] }} emptyState={{ title: "رزروی وجود ندارد.", description: "رزروهای جدید پس از ثبت در این بخش نمایش داده می‌شوند." }} />;
}

function TransferTable() {
  const columns: DynamicColumn<Transfer>[] = [
    { id: "date", label: "زمان تکمیل", cell: ({ record }) => formatDate(record.completedAt), mobile: { priority: 2 } },
    { id: "route", label: "مسیر انتقال", minWidth: 300, cell: ({ record }) => <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"><span><small className="block text-[11px] leading-5 text-[var(--adt-muted)]">مبدأ</small><strong className="block text-[12px] leading-5">{refLabel(record.sourceLocationId)}</strong></span><span aria-hidden className="text-[16px] text-[var(--adt-accent-strong)]">←</span><span><small className="block text-[11px] leading-5 text-[var(--adt-muted)]">مقصد</small><strong className="block text-[12px] leading-5">{refLabel(record.destinationLocationId)}</strong></span></span>, mobile: { priority: 1, fullWidth: true, showLabel: false } },
    { id: "items", label: "اقلام", cell: ({ record }) => `${number.format(record.items.length)} قلم · ${number.format(record.items.reduce((sum, item) => sum + item.quantity, 0))} واحد`, mobile: { priority: 3 } },
    { id: "status", label: "وضعیت", cell: ({ record }) => <StatusBadge tone={record.status === "completed" ? "success" : "danger"}>{record.status === "completed" ? "تکمیل‌شده" : "لغوشده"}</StatusBadge> },
    { id: "reason", label: "دلیل", cell: ({ record }) => record.reason },
  ];
  return <DynamicDataTable<Transfer, Record<string, unknown>, Record<string, unknown>, Filters> tableId="admin-inventory-transfers" eyebrow="جابجایی کالا" title="تاریخچه انتقال‌ها" description="انتقال‌های تکمیل‌شده میان مکان‌های موجودی را بررسی کنید." source={{ queryKey: ["inventory", "transfers"], fetchPage: tableSource<Transfer>("/api/admin/inventory/transfers") }} columns={columns} getRowId={(r) => r._id} pagination={commonPagination()} mobile={{ title: (r) => <span className="text-[12px] leading-6">مبدأ: {refLabel(r.sourceLocationId)} · مقصد: {refLabel(r.destinationLocationId)}</span>, subtitle: (r) => formatDate(r.completedAt), maxFields: 4 }} emptyState={{ title: "انتقالی ثبت نشده است.", description: "پس از انتقال کالا، سابقه آن اینجا باقی می‌ماند." }} />;
}

function StatusBadge({ tone, children }: { tone: "success" | "warning" | "danger" | "neutral"; children: ReactNode }) {
  const color = tone === "success" ? "var(--adt-success)" : tone === "warning" ? "var(--adt-warning)" : tone === "danger" ? "var(--adt-danger)" : "var(--adt-muted)";
  return <span className="inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-semibold leading-5" style={{ color, borderColor: `color-mix(in srgb, ${color} 38%, transparent)`, background: `color-mix(in srgb, ${color} 8%, transparent)` }}><i className="size-1.5 rounded-full bg-current" />{children}</span>;
}

function MasterManager({ resource, setResource, canWrite, refs, onChanged }: { resource: MasterResource; setResource: (value: MasterResource) => void; canWrite: boolean; refs: Record<string, DataSelectOption[]>; onChanged: () => void }) {
  const toast = useToast();
  const current = masterTabs.find((item) => item.id === resource)!;
  const schema = masterSchema(resource, refs);
  const columns: DynamicColumn<MasterRecord>[] = [
    { id: "name", label: "عنوان", sticky: "start", lockVisibility: true, minWidth: 190, cell: ({ record }) => <span><strong className="block text-[12px] leading-5">{fa(record.name)}</strong><small dir="ltr" className="mt-1 block text-left text-[11px] leading-5 text-[var(--adt-muted)]">{record.code}</small></span>, mobile: { priority: 1, showLabel: false } },
    ...(resource === "cities" ? [{ id: "country", label: "کشور", cell: ({ record }: { record: MasterRecord }) => <span dir="ltr">{record.countryCode}</span> }] : []),
    ...(resource !== "cities" ? [{ id: "city", label: "شهر", cell: ({ record }: { record: MasterRecord }) => refLabel(record.cityId) }] : []),
    ...(resource === "stores" ? [{ id: "shipping", label: "ارسال ریال / دلار", cell: ({ record }: { record: MasterRecord }) => <span dir="ltr">{number.format(record.shippingFeeIrrMinor ?? record.shippingFeeMinor ?? 0)} IRR · {record.shippingFeeUsdMinor === undefined ? "—" : `${number.format(record.shippingFeeUsdMinor / 100)} USD`}</span> }] : []),
    ...(resource === "locations" ? [{ id: "type", label: "نوع", cell: ({ record }: { record: MasterRecord }) => ({ warehouse: "انبار", store: "فروشگاه", virtual: "مجازی" }[record.type ?? "warehouse"]) }, { id: "pool", label: "استخر", cell: ({ record }: { record: MasterRecord }) => refLabel(record.poolId) }] : []),
    { id: "status", label: "وضعیت", cell: ({ record }) => <StatusBadge tone={record.isActive ? "success" : "neutral"}>{record.isActive ? "فعال" : "غیرفعال"}</StatusBadge>, mobile: { priority: 2 } },
  ];
  const save = (id: string | null, values: MasterForm) => api<MasterRecord>(`/api/admin/inventory/${resource}${id ? `/${id}` : ""}`, { method: id ? "PATCH" : "POST", body: JSON.stringify(masterPayload(resource, values)) });
  return <div className="space-y-3">
    <nav aria-label="انواع مکان موجودی" className="flex gap-1 overflow-x-auto border border-[var(--adt-border)] bg-[var(--adt-surface)] p-1.5">{masterTabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={resource === id} onClick={() => setResource(id)} className={`flex min-h-11 shrink-0 items-center gap-2 border px-3 text-[11px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/35 ${resource === id ? "border-[var(--adt-accent)]/45 bg-[var(--adt-accent)]/10 text-[var(--adt-text)]" : "border-transparent text-[var(--adt-muted)] hover:bg-[var(--adt-surface-muted)]"}`}><Icon size={14} />{label}</button>)}</nav>
    <DynamicDataTable<MasterRecord, MasterForm, MasterForm, Filters> key={resource} tableId={`admin-inventory-${resource}`} eyebrow="ساختار موجودی" title={current.label} description="کدها و نام‌های سه‌زبانه را برای استفاده در عملیات موجودی مدیریت کنید." source={{ queryKey: ["inventory", resource], fetchPage: async ({ page, pageSize, search, filters, signal }) => { const params = new URLSearchParams({ page: String(page), limit: String(pageSize), include: "references" }); if (search) params.set("search", search); if (filters.isActive) params.set("isActive", String(filters.isActive)); return toResult(await api<ListResponse<MasterRecord>>(`/api/admin/inventory/${resource}?${params}`, { signal })); } }} columns={columns} getRowId={(r) => r._id} getRowLabel={(r) => fa(r.name)} search={{ placeholder: `جستجو در ${current.label}…` }} filters={[{ id: "isActive", kind: "select", label: "وضعیت", options: statusOptions, defaultValue: null }]} initialFilters={{ isActive: null }} pagination={commonPagination()} mobile={{ title: (r) => fa(r.name), subtitle: (r) => r.code, badge: (r) => r.isActive ? "فعال" : "غیرفعال", maxFields: 4 }} crud={{ create: { enabled: canWrite, label: `${current.label} جدید`, title: `ایجاد ${current.label}`, schema, initialValues: emptyMaster, mutationFn: ({ values }) => save(null, values), onSuccess: () => { onChanged(); toast.success("رکورد پایه ایجاد شد"); }, mapError: (error) => ({ message: error instanceof Error ? error.message : "ذخیره انجام نشد." }) }, edit: { enabled: canWrite, title: (r) => `ویرایش ${fa(r.name)}`, schema, toInitialValues: masterToForm, mutationFn: ({ id, values }) => save(id, values), onSuccess: () => { onChanged(); toast.success("تغییرات ذخیره شد"); }, mapError: (error) => ({ message: error instanceof Error ? error.message : "ذخیره انجام نشد." }) }, view: { title: (r) => fa(r.name), fields: [{ id: "code", label: "کد", render: ({ record }) => record.code }, { id: "fa", label: "نام فارسی", render: ({ record }) => record.name.fa }, { id: "en", label: "نام انگلیسی", render: ({ record }) => record.name.en }, { id: "ar", label: "نام عربی", render: ({ record }) => record.name.ar }, { id: "status", label: "وضعیت", render: ({ record }) => record.isActive ? "فعال" : "غیرفعال" }] }, extraRowActions: canWrite ? [{ id: "toggle", label: "تغییر وضعیت", tone: "warning", onClick: async (record) => { await api(`/api/admin/inventory/${resource}/${record._id}`, { method: "PATCH", body: JSON.stringify({ isActive: !record.isActive }) }); onChanged(); toast.success(record.isActive ? "رکورد غیرفعال شد" : "رکورد فعال شد"); } }] : [] }} emptyState={{ title: `هنوز ${current.label} ثبت نشده است.`, description: canWrite ? "برای شروع، اولین رکورد را ایجاد کنید." : "رکوردی برای نمایش وجود ندارد." }} />
  </div>;
}

function masterSchema(resource: MasterResource, refs: Record<string, DataSelectOption[]>): DynamicFormSchema<MasterForm> {
  const fields: DynamicFormSchema<MasterForm>["fields"] = [{ kind: "input", name: "code", label: "کد یکتا", dir: "ltr", required: true }, ...localizedFields("name", "نام", true)];
  if (resource === "cities") fields.push({ kind: "input", name: "countryCode", label: "کد دوحرفی کشور", dir: "ltr", required: true, maxLength: 2 });
  if (resource === "stores") fields.push({ kind: "select", name: "cityId", label: "شهر", options: refs.cities, searchable: true, required: true }, { kind: "input", name: "shippingFeeIrrMinor", label: "هزینه ارسال ریالی", inputType: "number", min: 0, step: 1, dir: "ltr", required: true, suffixText: "ریال" }, { kind: "input", name: "shippingFeeUsd", label: "هزینه ارسال دلاری", inputType: "number", min: 0, step: 0.01, dir: "ltr", required: true, suffixText: "USD", helperText: "این مبلغ مستقل است و از ریال تبدیل نمی‌شود." }, ...localizedFields("address", "نشانی"));
  if (resource === "pools") fields.push({ kind: "select", name: "cityId", label: "شهر (اختیاری)", options: refs.cities, searchable: true, clearable: true });
  if (resource === "locations") fields.push({ kind: "select", name: "type", label: "نوع مکان", required: true, options: [{ value: "warehouse", label: "انبار" }, { value: "store", label: "فروشگاه" }, { value: "virtual", label: "مجازی" }] }, { kind: "select", name: "cityId", label: "شهر", options: refs.cities, searchable: true, required: true }, { kind: "select", name: "poolId", label: "استخر موجودی", options: refs.pools, searchable: true, required: true }, { kind: "select", name: "storeId", label: "فروشگاه مرتبط", options: refs.stores, searchable: true, clearable: true, hidden: (v) => v.type !== "store", required: true });
  fields.push({ kind: "boolean", name: "isActive", label: "وضعیت", onLabel: "فعال", offLabel: "غیرفعال" });
  return { fields, validate: (values) => { const errors: Record<string, string> = {}; if (!/^[A-Za-z0-9_-]{2,40}$/.test(values.code.trim())) errors.code = "کد باید ۲ تا ۴۰ نویسه انگلیسی باشد."; if (!values.name.fa.trim() || !values.name.en.trim() || !values.name.ar.trim()) errors["name.fa"] = "نام باید در هر سه زبان تکمیل شود."; if (resource === "cities" && !/^[A-Za-z]{2}$/.test(values.countryCode)) errors.countryCode = "کد کشور باید دو حرف باشد."; if (["stores", "locations"].includes(resource) && !values.cityId) errors.cityId = "شهر را انتخاب کنید."; if (resource === "stores" && (!Number.isSafeInteger(Number(values.shippingFeeIrrMinor)) || Number(values.shippingFeeIrrMinor) < 0)) errors.shippingFeeIrrMinor = "هزینه ریالی باید عدد صحیح نامنفی باشد."; if (resource === "stores" && (!Number.isFinite(Number(values.shippingFeeUsd)) || Number(values.shippingFeeUsd) < 0)) errors.shippingFeeUsd = "هزینه دلاری معتبر وارد کنید."; if (resource === "locations" && !values.poolId) errors.poolId = "استخر موجودی را انتخاب کنید."; if (resource === "locations" && values.type === "store" && !values.storeId) errors.storeId = "برای این نوع، فروشگاه الزامی است."; return errors; } };
}
function masterToForm(record: MasterRecord): MasterForm { return { ...emptyMaster(), ...record, cityId: refId(record.cityId), poolId: refId(record.poolId), storeId: refId(record.storeId), address: record.address ?? emptyLocalizedText(), shippingFeeIrrMinor: record.shippingFeeIrrMinor ?? record.shippingFeeMinor ?? 0, shippingFeeUsd: record.shippingFeeUsdMinor === undefined ? 0 : record.shippingFeeUsdMinor / 100 }; }
function masterPayload(resource: MasterResource, values: MasterForm) {
  const base = { code: values.code.trim().toUpperCase(), name: trimLocalized(values.name), isActive: values.isActive };
  if (resource === "cities") return { ...base, countryCode: values.countryCode.trim().toUpperCase() };
  if (resource === "stores") return { ...base, cityId: values.cityId, shippingFeeMinor: Number(values.shippingFeeIrrMinor), shippingFeeIrrMinor: Number(values.shippingFeeIrrMinor), shippingFeeUsdMinor: Math.round(Number(values.shippingFeeUsd) * 100), address: trimLocalized(values.address) };
  if (resource === "pools") return { ...base, cityId: values.cityId || null };
  return { ...base, type: values.type, cityId: values.cityId, poolId: values.poolId, storeId: values.type === "store" ? values.storeId : null };
}

function QuickStockModal({ open, onClose, refs, referencesLoading, referencesError, onRetryReferences, onSuccess }: { open: boolean; onClose: () => void; refs: Record<string, DataSelectOption[]>; referencesLoading: boolean; referencesError: boolean; onRetryReferences: () => void; onSuccess: (quantity: number) => void }) {
  const [attemptKey] = useState(() => newKey("adjustment"));
  const [variantId, setVariantId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const selectedVariant = refs.variants.find((option) => option.value === variantId);
  const selectedLocation = refs.locations.find((option) => option.value === locationId);
  const amount = Number(quantity);
  const quantityValid = Number.isInteger(amount) && amount > 0 && amount <= QUICK_STOCK_QUANTITY_MAX;
  const hasEnabledVariants = refs.variants.some((option) => !option.disabled);
  const hasEnabledLocations = refs.locations.some((option) => !option.disabled);
  const referencesEmpty = !referencesLoading && !referencesError && (!hasEnabledVariants || !hasEnabledLocations);
  const referencesReady = !referencesLoading && !referencesError && hasEnabledVariants && hasEnabledLocations;
  const ready = referencesReady && Boolean(variantId && locationId) && quantityValid;
  const mutation = useMutation({
    mutationFn: async () => {
      if (!referencesReady) throw new Error("فهرست تنوع‌ها و مکان‌ها برای ثبت موجودی آماده نیست.");
      if (!variantId || !locationId) throw new Error("تنوع محصول و شعبه یا مکان را انتخاب کنید.");
      if (!quantityValid) throw new Error(`تعداد باید یک عدد صحیح بین ۱ تا ${number.format(QUICK_STOCK_QUANTITY_MAX)} باشد.`);
      const reason = note.trim() ? `${QUICK_STOCK_REASON} — ${note.trim()}` : QUICK_STOCK_REASON;
      await api("/api/admin/inventory/adjustments", { method: "POST", body: JSON.stringify({ idempotencyKey: attemptKey, variantId, locationId, delta: amount, reason }) });
      return amount;
    },
    onSuccess: (added) => onSuccess(added),
    onError: (value) => setError(value instanceof Error ? value.message : "افزودن موجودی انجام نشد."),
  });
  const submit = () => { setError(""); mutation.mutate(); };

  return <DynamicModal open={open} onClose={onClose} title="افزودن موجودی" description="کالا را انتخاب کنید، مقصد را مشخص کنید و تعداد جدید را وارد کنید." size="sm" busy={mutation.isPending} initialFocusSelector="button[aria-haspopup='dialog']" footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><DataButton onClick={onClose} disabled={mutation.isPending}>انصراف</DataButton><DataButton form="quick-stock-form" type="submit" tone="primary" icon={<Plus size={15} />} disabled={!ready} loading={mutation.isPending}>افزودن به موجودی</DataButton></div>}>
    <form id="quick-stock-form" onSubmit={(event) => { event.preventDefault(); submit(); }} className="space-y-4">
      {referencesLoading ? <div role="status" className="border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-3 py-3 text-[11px] leading-6 text-[var(--adt-muted)]">در حال آماده‌کردن فهرست کالاها و شعبه‌ها…</div> : null}
      {referencesError ? <div role="alert" className="flex flex-col gap-2 border border-[var(--adt-warning)]/40 bg-[var(--adt-warning)]/[0.08] px-3 py-3 text-[11px] leading-6 text-[var(--adt-warning)] sm:flex-row sm:items-center sm:justify-between"><span>فهرست کالاها یا مکان‌ها دریافت نشد.</span><DataButton size="sm" tone="warning" onClick={onRetryReferences}>تلاش دوباره</DataButton></div> : null}
      {referencesEmpty ? <div role="status" className="border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-3 py-3 text-[11px] leading-6 text-[var(--adt-muted)]">برای افزودن موجودی، حداقل یک تنوع محصول فعال و یک شعبه یا مکان فعال لازم است. وضعیت آن‌ها را در «کاتالوگ» و «مکان‌ها» بررسی کنید.</div> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <DataSelect label="کدام کالا؟" placeholder="نام، رنگ، سایز یا SKU" value={variantId || null} onChange={(value) => setVariantId(String(value ?? ""))} options={refs.variants} searchable required disabled={!referencesReady} className="sm:col-span-2" />
        <DataSelect label="در کدام شعبه یا مکان؟" placeholder="شعبه یا انبار را انتخاب کنید" value={locationId || null} onChange={(value) => setLocationId(String(value ?? ""))} options={refs.locations} searchable required disabled={!referencesReady} />
        <DataInput label="چند عدد اضافه شود؟" type="number" min={1} max={QUICK_STOCK_QUANTITY_MAX} step={1} inputMode="numeric" dir="ltr" value={quantity} onChange={(event) => setQuantity(event.target.value)} error={quantity && !quantityValid ? `یک عدد صحیح بین ۱ تا ${number.format(QUICK_STOCK_QUANTITY_MAX)} وارد کنید.` : undefined} required />
      </div>
      <details className="group border border-[var(--adt-border)] bg-[var(--adt-surface)]"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-[10px] font-semibold text-[var(--adt-muted)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--adt-accent)]/30"><span>یادداشت اختیاری</span><span aria-hidden className="transition-transform group-open:rotate-180">⌄</span></summary><div className="border-t border-[var(--adt-border)] p-3"><DataTextarea label="توضیح برای سابقه انبار" value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={QUICK_STOCK_NOTE_MAX} placeholder="مثلاً تحویل بار امروز یا شماره رسید" helperText={`دلیل اصلی خودکار ثبت می‌شود؛ حداکثر ${number.format(QUICK_STOCK_NOTE_MAX)} نویسه.`} /></div></details>
      <section aria-live="polite" className={`border px-4 py-4 ${ready ? "border-[var(--adt-success)]/35 bg-[var(--adt-success)]/[0.07]" : "border-[var(--adt-border)] bg-[var(--adt-surface-muted)]"}`}>
        <div className="flex items-center gap-2"><CheckCircle2 size={16} className={ready ? "text-[var(--adt-success)]" : "text-[var(--adt-soft)]"} /><strong className="text-[11px]">خلاصه ثبت</strong></div>
        {ready ? <dl className="mt-3 grid gap-3 text-[10px] leading-5 sm:grid-cols-3"><div><dt className="text-[var(--adt-muted)]">تنوع دقیق</dt><dd className="mt-1 font-semibold">{selectedVariant?.label}</dd><small dir="ltr" className="block text-left text-[8px] text-[var(--adt-muted)]">{selectedVariant?.description}</small></div><div><dt className="text-[var(--adt-muted)]">مقصد</dt><dd className="mt-1 font-semibold">{selectedLocation?.label}</dd><small className="block text-[8px] text-[var(--adt-muted)]">{selectedLocation?.description}</small></div><div><dt className="text-[var(--adt-muted)]">مقدار افزایش</dt><dd className="mt-1 text-[18px] font-extrabold text-[var(--adt-success)]">+{number.format(amount)}</dd></div></dl> : <p className="mt-2 text-[10px] leading-6 text-[var(--adt-muted)]">سه انتخاب بالا را کامل کنید؛ قبل از ثبت، خلاصه دقیق همین‌جا نمایش داده می‌شود.</p>}
      </section>
      {error ? <div role="alert" className="border border-[var(--adt-danger)]/40 bg-[var(--adt-danger)]/[0.08] px-3 py-3 text-[11px] leading-6 text-[var(--adt-danger)]">{error}</div> : null}
    </form>
  </DynamicModal>;
}

function InventoryActionModal({ kind, onClose, refs, referencesLoading, referencesError, onRetryReferences, onSuccess }: { kind: MutationKind | null; onClose: () => void; refs: Record<string, DataSelectOption[]>; referencesLoading: boolean; referencesError: boolean; onRetryReferences: () => void; onSuccess: () => void }) {
  const [attempt, setAttempt] = useState<{ kind: MutationKind; key: string } | null>(() => kind ? { kind, key: newKey(kind) } : null);
  const [variantId, setVariantId] = useState(""); const [locationId, setLocationId] = useState(""); const [destinationId, setDestinationId] = useState("");
  const [quantity, setQuantity] = useState("1"); const [safetyStock, setSafetyStock] = useState(""); const [reason, setReason] = useState(""); const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const activeAttempt = attempt?.kind === kind ? attempt : null;
  const referencesEmpty = !referencesLoading && !referencesError && (!refs.variants.some((option) => !option.disabled) || !refs.locations.some((option) => !option.disabled));
  const referencesReady = !referencesLoading && !referencesError && !referencesEmpty;
  const mutation = useMutation({ mutationFn: async () => {
    if (!kind || !activeAttempt) return;
    if (!referencesReady) throw new Error("فهرست تنوع‌ها و مکان‌ها برای ثبت عملیات آماده نیست.");
    if (!variantId || !locationId) throw new Error("تنوع و مکان موجودی را کامل کنید.");
    if (kind !== "reservation" && !reason.trim()) throw new Error("دلیل عملیات را وارد کنید.");
    const amount = Number(quantity);
    if (!Number.isInteger(amount)) throw new Error("تغییر تعداد باید عدد صحیح باشد.");
    if (kind === "adjustment") {
      const safetyProvided = safetyStock.trim() !== "";
      const parsedSafetyStock = safetyProvided ? Number(safetyStock) : undefined;
      if (safetyProvided && (!Number.isInteger(parsedSafetyStock) || Number(parsedSafetyStock) < 0)) throw new Error("ذخیره امن باید عدد صحیح و نامنفی باشد.");
      if (amount === 0 && !safetyProvided) throw new Error("تغییر فیزیکی یا ذخیره امن جدید را وارد کنید.");
      return api("/api/admin/inventory/adjustments", { method: "POST", body: JSON.stringify({ idempotencyKey: activeAttempt.key, variantId, locationId, delta: amount, safetyStock: parsedSafetyStock, reason: reason.trim() }) });
    }
    if (amount < 1) throw new Error("تعداد باید حداقل یک باشد.");
    if (kind === "transfer") { if (!destinationId || destinationId === locationId) throw new Error("مبدأ و مقصد متفاوت را انتخاب کنید."); return api("/api/admin/inventory/transfers", { method: "POST", body: JSON.stringify({ idempotencyKey: activeAttempt.key, sourceLocationId: locationId, destinationLocationId: destinationId, items: [{ variantId, quantity: amount }], reason: reason.trim() }) }); }
    if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) throw new Error("زمان انقضای آینده را انتخاب کنید.");
    return api("/api/admin/inventory/reservations", { method: "POST", body: JSON.stringify({ idempotencyKey: activeAttempt.key, items: [{ variantId, locationId, quantity: amount }], expiresAt: new Date(expiresAt).toISOString() }) });
  }, onSuccess: () => { setVariantId(""); setLocationId(""); setDestinationId(""); setQuantity("1"); setSafetyStock(""); setReason(""); setExpiresAt(""); setAttempt(null); setError(""); onSuccess(); }, onError: (value) => setError(value instanceof Error ? value.message : "عملیات انجام نشد.") });
  const titles = { adjustment: ["اصلاح موجودی", "تغییر فیزیکی یا ذخیره امن با ثبت دلیل"], transfer: ["انتقال موجودی", "جابجایی امن یک تنوع از مبدأ به مقصد"], reservation: ["ایجاد رزرو", "کنارگذاری موقت موجودی قابل فروش تا زمان مشخص"] } as const;
  return <DynamicModal open={Boolean(kind)} onClose={onClose} title={kind ? titles[kind][0] : ""} description={kind ? titles[kind][1] : ""} size="md" busy={mutation.isPending} footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><DataButton onClick={onClose} disabled={mutation.isPending}>انصراف</DataButton><DataButton tone="primary" disabled={!referencesReady} loading={mutation.isPending} onClick={() => { setError(""); mutation.mutate(); }}>ثبت عملیات</DataButton></div>}>
    {kind ? <div className="grid gap-4 sm:grid-cols-2">{referencesLoading ? <div role="status" className="border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-3 py-3 text-[11px] leading-6 text-[var(--adt-muted)] sm:col-span-2">در حال دریافت تنوع‌ها و مکان‌های فعال…</div> : null}{referencesError ? <div role="alert" className="flex flex-col gap-2 border border-[var(--adt-warning)]/40 bg-[var(--adt-warning)]/[0.08] px-3 py-3 text-[11px] leading-6 text-[var(--adt-warning)] sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"><span>فهرست‌های لازم دریافت نشدند.</span><DataButton size="sm" tone="warning" className="min-h-11" onClick={onRetryReferences}>تلاش دوباره</DataButton></div> : null}{referencesEmpty ? <div role="status" className="border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-3 py-3 text-[11px] leading-6 text-[var(--adt-muted)] sm:col-span-2">برای ثبت عملیات، حداقل یک تنوع محصول فعال و یک مکان فعال لازم است؛ وضعیت آن‌ها را در «کاتالوگ» و «مکان‌ها» بررسی کنید.</div> : null}<DataSelect label="تنوع محصول" value={variantId || null} onChange={(v) => setVariantId(String(v ?? ""))} options={refs.variants} searchable required disabled={!referencesReady} className="sm:col-span-2" /><DataSelect label={kind === "transfer" ? "مکان مبدأ" : "مکان موجودی"} value={locationId || null} onChange={(v) => setLocationId(String(v ?? ""))} options={refs.locations} searchable required disabled={!referencesReady} />{kind === "transfer" ? <DataSelect label="مکان مقصد" value={destinationId || null} onChange={(v) => setDestinationId(String(v ?? ""))} options={refs.locations.filter((o) => o.value !== locationId)} searchable required disabled={!referencesReady} /> : <DataInput label={kind === "adjustment" ? "تغییر موجودی فیزیکی" : "تعداد رزرو"} type="number" dir="ltr" value={quantity} onChange={(e) => setQuantity(e.target.value)} helperText={kind === "adjustment" ? "برای کاهش عدد منفی و برای تغییر فقط ذخیره امن، صفر وارد کنید." : undefined} required />}{kind === "transfer" ? <DataInput label="تعداد انتقال" type="number" min={1} step={1} dir="ltr" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /> : null}{kind === "adjustment" ? <DataInput label="ذخیره امن جدید (اختیاری)" type="number" min={0} step={1} dir="ltr" value={safetyStock} onChange={(e) => setSafetyStock(e.target.value)} helperText="با تغییر فیزیکی صفر، فقط ذخیره امن به‌روزرسانی می‌شود." /> : null}{kind === "reservation" ? <DataInput label="زمان انقضا" type="datetime-local" dir="ltr" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required /> : null}{kind !== "reservation" ? <DataTextarea label="دلیل عملیات" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required className="sm:col-span-2" /> : null}{error ? <div role="alert" className="border border-[var(--adt-danger)]/40 bg-[var(--adt-danger)]/[0.08] px-3 py-3 text-[11px] leading-6 text-[var(--adt-danger)] sm:col-span-2">{error}</div> : null}<div className="border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-3 py-3 text-[11px] leading-6 text-[var(--adt-muted)] sm:col-span-2"><strong className="text-[var(--adt-text)]">ثبت ایمن:</strong> در صورت قطع ارتباط، تلاش دوباره همین فرم عملیات را تکراری ثبت نمی‌کند.</div></div> : null}
  </DynamicModal>;
}
