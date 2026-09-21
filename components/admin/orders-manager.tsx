"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  Banknote,
  Boxes,
  Eye,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";

import { useAdminTheme, getAdminDataThemeVars } from "@/components/admin/useAdminTheme";
import { DynamicDataTable } from "@/components/global/table/DynamicTable";
import { DynamicModal } from "@/components/global/table/DynamicModal";
import { DataButton, DataTextarea } from "@/components/global/table/primitives";
import type { DynamicColumn } from "@/components/global/table/types";
import { useToast } from "@/components/ui/CustomToast";

type OrderStatus =
  | "pending_inventory"
  | "pending_payment"
  | "payment_failed"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "compensation_required"
  | "fulfilled"
  | "refunded";
type OrderAction = "cancel" | "retry_payment" | "mark_fulfilled";
type LocalizedText = { fa?: string; en?: string; ar?: string };
type OrderItem = {
  _id: string;
  variantId: string;
  productId: string;
  productName: LocalizedText;
  sku: string;
  colorName: LocalizedText;
  sizeName: LocalizedText;
  unitPriceMinor: number;
  taxMinor: number;
  discountMinor: number;
  quantity: number;
  lineTotalMinor: number;
};
type OrderRecord = {
  _id: string;
  orderNumber: string;
  correlationId: string;
  cartId: string;
  checkoutSessionId: string;
  userId?: string;
  contact: { email: string; firstName: string; lastName: string; phone?: string };
  storeId: string;
  cityId: string;
  inventoryReservationId?: string;
  paymentIntentId?: string;
  currency: string;
  items: OrderItem[];
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  shippingMinor: number;
  totalMinor: number;
  status: OrderStatus;
  policyVersion: string;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
};
type ListResponse<T> = {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
type OrderFilters = Record<string, unknown> & { status: string | null };

const number = new Intl.NumberFormat("fa-IR");
const STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  pending_inventory: { label: "در انتظار موجودی", tone: "border-amber-500/35 bg-amber-500/10 text-amber-600" },
  pending_payment: { label: "در انتظار پرداخت", tone: "border-sky-500/35 bg-sky-500/10 text-sky-600" },
  payment_failed: { label: "پرداخت ناموفق", tone: "border-red-500/35 bg-red-500/10 text-red-600" },
  confirmed: { label: "تأییدشده", tone: "border-emerald-500/35 bg-emerald-500/10 text-emerald-600" },
  cancelled: { label: "لغوشده", tone: "border-red-500/25 bg-red-500/[0.06] text-red-500" },
  expired: { label: "منقضی", tone: "border-stone-500/30 bg-stone-500/[0.08] text-[var(--adt-muted)]" },
  compensation_required: { label: "نیازمند جبران", tone: "border-orange-500/40 bg-orange-500/10 text-orange-600" },
  fulfilled: { label: "تحویل عملیات", tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600" },
  refunded: { label: "بازپرداخت‌شده", tone: "border-violet-500/35 bg-violet-500/10 text-violet-600" },
};
const ACTIONS: Record<OrderAction, { label: string; title: string; effect: string; tone: "danger" | "warning" | "primary"; icon: ReactNode }> = {
  cancel: { label: "لغو سفارش", title: "تأیید لغو سفارش", effect: "سفارش لغو می‌شود و رویداد لغو برای پردازش‌های بعدی ثبت خواهد شد. این اقدام از این صفحه قابل بازگشت نیست.", tone: "danger", icon: <Ban size={14} /> },
  retry_payment: { label: "تلاش دوباره پرداخت", title: "ثبت تلاش دوباره پرداخت", effect: "سفارش به وضعیت «در انتظار پرداخت» برمی‌گردد و درخواست تلاش دوباره پرداخت ثبت می‌شود.", tone: "warning", icon: <RotateCcw size={14} /> },
  mark_fulfilled: { label: "ثبت تحویل عملیات", title: "تأیید تحویل سفارش", effect: "سفارش به‌صورت نهایی تحویل‌شده ثبت می‌شود. پیش از ادامه، تحویل واقعی کالا را کنترل کنید.", tone: "primary", icon: <PackageCheck size={14} /> },
};

function fa(value?: LocalizedText) { return value?.fa || value?.en || value?.ar || "—"; }
function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
function money(value: number, currency = "IRR") {
  const unit = currency === "IRR" ? "ریال" : currency;
  return `${number.format(value)} ${unit}`;
}
function customer(order: OrderRecord) { return `${order.contact.firstName} ${order.contact.lastName}`.trim() || order.contact.email; }
function itemCount(order: OrderRecord) { return order.items.reduce((sum, item) => sum + item.quantity, 0); }
function statusBadge(status: OrderStatus) {
  const meta = STATUS[status];
  return <span className={`inline-flex min-h-7 items-center border px-2.5 text-[9px] font-bold ${meta.tone}`}>{meta.label}</span>;
}
function allowedActions(status: OrderStatus): OrderAction[] {
  if (status === "payment_failed") return ["retry_payment", "cancel"];
  if (status === "pending_inventory" || status === "pending_payment") return ["cancel"];
  if (status === "confirmed") return ["mark_fulfilled"];
  return [];
}
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store", credentials: "same-origin", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => null) as { error?: string; message?: string; details?: Array<{ message?: string }> } | T | null;
  if (!response.ok) {
    const error = body as { error?: string; message?: string; details?: Array<{ message?: string }> } | null;
    throw new Error(error?.error || error?.message || error?.details?.[0]?.message || "درخواست انجام نشد. دوباره تلاش کنید.");
  }
  return body as T;
}

export function OrdersManager({ canWrite }: { canWrite: boolean }) {
  const theme = useAdminTheme();
  const themeVars = useMemo(() => getAdminDataThemeVars(theme), [theme]);
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const summary = useQuery({
    queryKey: ["admin", "orders", "summary"],
    queryFn: async ({ signal }) => {
      const statuses: OrderStatus[] = ["payment_failed", "confirmed", "compensation_required"];
      const [all, ...parts] = await Promise.all([
        api<ListResponse<OrderRecord>>("/api/admin/orders?page=1&limit=1", { signal }),
        ...statuses.map((status) => api<ListResponse<OrderRecord>>(`/api/admin/orders?page=1&limit=1&status=${status}`, { signal })),
      ]);
      return { total: all.pagination.total, payment_failed: parts[0].pagination.total, confirmed: parts[1].pagination.total, compensation_required: parts[2].pagination.total };
    },
  });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });

  const columns = useMemo<DynamicColumn<OrderRecord>[]>(() => [
    { id: "orderNumber", label: "شماره سفارش", accessor: "orderNumber", sortable: true, sortKey: "orderNumber", minWidth: 170, sticky: "start", lockVisibility: true, cell: ({ record }) => <button type="button" onClick={() => setSelectedId(record._id)} dir="ltr" className="text-left text-[11px] font-extrabold text-[var(--adt-accent-strong)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/40">{record.orderNumber}</button>, mobile: { priority: 1, showLabel: false } },
    { id: "customer", label: "مشتری و تماس", minWidth: 220, cell: ({ record }) => <span><strong className="block text-[11px]">{customer(record)}</strong><small dir="ltr" className="mt-1 block text-left text-[9px] text-[var(--adt-muted)]">{record.contact.phone || record.contact.email}</small></span>, mobile: { priority: 2 } },
    { id: "status", label: "وضعیت", accessor: "status", sortable: true, sortKey: "status", minWidth: 140, cell: ({ record }) => statusBadge(record.status), mobile: { priority: 3 } },
    { id: "items", label: "اقلام", minWidth: 90, align: "center", cell: ({ record }) => `${number.format(itemCount(record))} عدد`, mobile: { priority: 4 } },
    { id: "total", label: "مبلغ کل", accessor: "totalMinor", sortable: true, sortKey: "totalMinor", minWidth: 170, cell: ({ record }) => <span dir="ltr" className="block text-left text-[11px] font-bold tabular-nums">{money(record.totalMinor, record.currency)}</span>, mobile: { priority: 5 } },
    { id: "destination", label: "شهر / شعبه", minWidth: 190, cell: ({ record }) => <span dir="ltr" className="block text-left text-[9px] leading-5"><b>{record.cityId}</b><br/><span className="text-[var(--adt-muted)]">{record.storeId}</span></span>, mobile: { hidden: true } },
    { id: "createdAt", label: "زمان ثبت", accessor: "createdAt", sortable: true, sortKey: "createdAt", minWidth: 160, cell: ({ record }) => formatDate(record.createdAt), mobile: { priority: 6 } },
  ], []);

  return (
    <div style={themeVars} className="min-w-0 space-y-3 p-3 text-[var(--adt-text)] sm:p-4 lg:p-5">
      <section className="relative overflow-hidden border border-[var(--adt-border)] bg-[var(--adt-surface)] px-4 py-5 sm:px-5">
        <div aria-hidden className="absolute inset-y-0 right-0 w-1 bg-[var(--adt-accent)]" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-[9px] font-bold tracking-[0.08em] text-[var(--adt-accent-strong)]">عملیات سفارش‌ها</p><h1 className="mt-2 text-[20px] font-extrabold sm:text-[24px]">مرکز عملیات سفارش‌ها</h1><p className="mt-2 max-w-2xl text-[12px] leading-7 text-[var(--adt-muted)]">وضعیت سفارش، پرداخت و اقلام دقیق را بررسی کنید؛ فقط اقدام‌های امن و مجاز در دسترس‌اند.</p></div>
          <DataButton icon={<RefreshCw size={15} />} onClick={refresh} loading={summary.isFetching}>به‌روزرسانی داده‌ها</DataButton>
        </div>
      </section>
      <section aria-label="خلاصه زنده سفارش‌ها" className="grid border border-[var(--adt-border)] bg-[var(--adt-surface)] sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<ShoppingBag size={17}/>} label="کل سفارش‌ها" value={summary.data?.total} loading={summary.isLoading} error={summary.isError}/>
        <Metric icon={<RotateCcw size={17}/>} label="پرداخت ناموفق" value={summary.data?.payment_failed} loading={summary.isLoading} error={summary.isError}/>
        <Metric icon={<PackageCheck size={17}/>} label="آماده تحویل" value={summary.data?.confirmed} loading={summary.isLoading} error={summary.isError}/>
        <Metric icon={<ReceiptText size={17}/>} label="نیازمند جبران" value={summary.data?.compensation_required} loading={summary.isLoading} error={summary.isError} last/>
      </section>
      {summary.isError ? <div role="alert" className="border border-[var(--adt-danger)]/35 bg-[var(--adt-danger)]/[0.06] px-4 py-3 text-[10px] leading-6 text-[var(--adt-danger)]">{summary.error instanceof Error ? summary.error.message : "خلاصه زنده دریافت نشد؛ جدول سفارش‌ها همچنان مستقل قابل استفاده است."}</div> : null}
      {listError ? <div role="alert" className="border border-[var(--adt-danger)]/35 bg-[var(--adt-danger)]/[0.06] px-4 py-3 text-[10px] leading-6 text-[var(--adt-danger)]">خطای دریافت فهرست: {listError}</div> : null}
      <DynamicDataTable<OrderRecord, Record<string, unknown>, Record<string, unknown>, OrderFilters>
        tableId="admin-orders" eyebrow="دفتر سفارش‌ها" title="دفتر سفارش‌ها" description="برای دیدن پرونده کامل و اقدام قانونی، شماره سفارش یا گزینه مشاهده را انتخاب کنید."
        source={{ queryKey: ["admin", "orders", "list"], fetchPage: async ({ page, pageSize, search, sort, filters, signal }) => { const params = new URLSearchParams({ page: String(page), limit: String(pageSize) }); if (search) params.set("search", search); if (filters.status) params.set("status", String(filters.status)); if (sort[0]) { params.set("sortKey", sort[0].key); params.set("sortDirection", sort[0].direction); } setListError(null); try { const data = await api<ListResponse<OrderRecord>>(`/api/admin/orders?${params}`, { signal }); return { items: data.items, total: data.pagination.total, page: data.pagination.page, pageSize: data.pagination.limit, pageCount: data.pagination.pages }; } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setListError(error instanceof Error ? error.message : "فهرست سفارش‌ها دریافت نشد."); throw error; } } }}
        columns={columns} getRowId={(record) => record._id} getRowLabel={(record) => record.orderNumber}
        search={{ placeholder: "جستجو با شماره سفارش، نام یا ایمیل…", debounceMs: 320 }}
        filters={[{ id: "status", kind: "select", label: "وضعیت سفارش", options: Object.entries(STATUS).map(([value, meta]) => ({ value, label: meta.label })), defaultValue: null, badge: (value) => value ? STATUS[value as OrderStatus]?.label ?? String(value) : null }]}
        initialFilters={{ status: null }} pagination={{ initialPageSize: 15, pageSizeOptions: [10, 15, 25, 50], showPageNumbers: true }}
        columnVisibility={{ enabled: true, persist: true, storageKey: "admin-orders-columns" }}
        mobile={{ title: (record) => record.orderNumber, subtitle: customer, badge: (record) => statusBadge(record.status), fieldIds: ["status", "items", "total", "createdAt"], maxFields: 4 }}
        crud={{ extraRowActions: [{ id: "inspect", label: "مشاهده پرونده", icon: <Eye size={14}/>, onClick: (record) => setSelectedId(record._id) }] }}
        emptyState={{ title: "هنوز سفارشی ثبت نشده است.", description: "پس از خرید موفق مشتری، سفارش اینجا نمایش داده می‌شود.", filteredTitle: "سفارشی با این شرایط پیدا نشد.", filteredDescription: "عبارت جستجو یا وضعیت انتخاب‌شده را تغییر دهید." }}
      />
      <OrderDossier orderId={selectedId} canWrite={canWrite} onClose={() => setSelectedId(null)} onChanged={refresh} toast={toast} />
    </div>
  );
}

function Metric({ icon, label, value, loading, error, last }: { icon: ReactNode; label: string; value?: number; loading: boolean; error: boolean; last?: boolean }) {
  return <div className={`flex min-h-24 items-center gap-3 px-4 py-4 ${last ? "" : "border-b border-[var(--adt-border)] sm:border-l xl:border-b-0"}`}><span className="grid size-10 place-items-center border border-[var(--adt-border-strong)] bg-[var(--adt-surface-muted)] text-[var(--adt-accent-strong)]">{icon}</span><span><small className="block text-[10px] text-[var(--adt-muted)]">{label}</small><strong className="mt-1 block text-[22px] tabular-nums">{loading ? "…" : error || value === undefined ? "—" : number.format(value)}</strong></span></div>;
}

function OrderDossier({ orderId, canWrite, onClose, onChanged, toast }: { orderId: string | null; canWrite: boolean; onClose: () => void; onChanged: () => void; toast: ReturnType<typeof useToast> }) {
  const queryClient = useQueryClient();
  const operationInFlightRef = useRef(false);
  const [action, setAction] = useState<OrderAction | null>(null);
  const [reason, setReason] = useState("");
  const query = useQuery({ queryKey: ["admin", "orders", "detail", orderId], queryFn: ({ signal }) => api<OrderRecord>(`/api/admin/orders/${orderId}`, { signal }), enabled: Boolean(orderId) });
  const mutation = useMutation({ mutationFn: ({ targetOrderId, selectedAction, meaningfulReason }: { targetOrderId: string; selectedAction: OrderAction; meaningfulReason: string }) => api<OrderRecord>(`/api/admin/orders/${targetOrderId}`, { method: "PATCH", body: JSON.stringify({ action: selectedAction, reason: meaningfulReason }) }), onSuccess: (updated, variables) => { queryClient.setQueryData(["admin", "orders", "detail", variables.targetOrderId], updated); toast.success("عملیات سفارش با موفقیت ثبت شد", { description: `${updated.orderNumber} اکنون ${STATUS[updated.status].label} است.` }); setAction(null); setReason(""); onChanged(); }, onSettled: () => { operationInFlightRef.current = false; } });
  const order = query.data;
  const actions = order ? allowedActions(order.status) : [];
  const reasonValid = reason.trim().length >= 3;
  return <DynamicModal open={Boolean(orderId)} onClose={() => { if (!mutation.isPending && !operationInFlightRef.current) { setAction(null); setReason(""); onClose(); } }} title={order ? `پرونده سفارش ${order.orderNumber}` : "پرونده سفارش"} description="اطلاعات دقیق سفارش و تنها اقدام‌های عملیاتی مجاز" size="xl" busy={mutation.isPending}>
    {query.isLoading ? <div className="grid min-h-64 place-items-center text-[11px] text-[var(--adt-muted)]"><RefreshCw className="mb-3 animate-spin" size={22}/><span>در حال دریافت پرونده سفارش…</span></div> : null}
    {query.isError ? <div role="alert" className="border border-[var(--adt-danger)]/35 bg-[var(--adt-danger)]/[0.06] p-5 text-[11px] leading-6 text-[var(--adt-danger)]"><p>{query.error instanceof Error ? query.error.message : "پرونده سفارش دریافت نشد."}</p><DataButton className="mt-3" tone="danger" icon={<RefreshCw size={14}/>} onClick={() => void query.refetch()}>تلاش دوباره</DataButton></div> : null}
    {order ? <div className="space-y-4">
      <section className="grid gap-px border border-[var(--adt-border)] bg-[var(--adt-border)] sm:grid-cols-[1.15fr_.85fr]">
        <div className="min-w-0 bg-[var(--adt-surface)] p-4"><div className="flex flex-wrap items-center justify-between gap-3">{statusBadge(order.status)}<span dir="ltr" className="break-all text-left text-[10px] font-bold text-[var(--adt-muted)]">{order.orderNumber}</span></div><h3 className="mt-4 text-[18px] font-extrabold">{customer(order)}</h3><div className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-[10px] text-[var(--adt-muted)]"><span dir="ltr" className="break-all text-left">{order.contact.phone || "بدون تلفن"}</span><span dir="ltr" className="break-all text-left">{order.contact.email}</span></div></div>
        <div className="bg-[var(--adt-surface-muted)] p-4"><span className="text-[9px] text-[var(--adt-muted)]">مبلغ نهایی</span><strong dir="ltr" className="mt-2 block text-left text-[20px] tabular-nums">{money(order.totalMinor, order.currency)}</strong><span className="mt-3 block text-[9px] text-[var(--adt-muted)]">ثبت: {formatDate(order.createdAt)}</span></div>
      </section>
      <section><h3 className="mb-2 flex items-center gap-2 text-[12px] font-extrabold"><Boxes size={15} className="text-[var(--adt-accent-strong)]"/>اقلام دقیق سفارش</h3><div className="overflow-hidden border border-[var(--adt-border)]">{order.items.map((item, index) => <article key={item._id || `${item.variantId}-${index}`} className="grid min-w-0 gap-3 border-b border-[var(--adt-border)] p-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><strong className="text-[11px]">{fa(item.productName)}</strong><p className="mt-1 text-[9px] text-[var(--adt-muted)]">رنگ: {fa(item.colorName)} · سایز: {fa(item.sizeName)} · تعداد: {number.format(item.quantity)}</p><p dir="ltr" className="mt-1 break-all text-left text-[9px] leading-5 text-[var(--adt-soft)]">کد کالا: {item.sku} · شناسه تنوع: {item.variantId}</p></div><div dir="ltr" className="text-left"><strong className="text-[11px] tabular-nums">{money(item.lineTotalMinor, order.currency)}</strong><small className="mt-1 block text-[9px] text-[var(--adt-muted)]">واحد {money(item.unitPriceMinor, order.currency)}</small></div></article>)}</div></section>
      <section className="grid gap-px border border-[var(--adt-border)] bg-[var(--adt-border)] sm:grid-cols-2 lg:grid-cols-4"><MoneyLine label="جمع اقلام" value={order.subtotalMinor} currency={order.currency}/><MoneyLine label="مالیات" value={order.taxMinor} currency={order.currency}/><MoneyLine label="تخفیف" value={order.discountMinor} currency={order.currency}/><MoneyLine label="ارسال" value={order.shippingMinor} currency={order.currency}/></section>
      <section className="grid gap-3 border border-[var(--adt-border)] bg-[var(--adt-surface)] p-4 sm:grid-cols-2"><Info icon={<UserRound size={14}/>} label="شناسه مشتری" value={order.userId}/><Info icon={<ShoppingBag size={14}/>} label="سبد / نشست پرداخت" value={`${order.cartId} / ${order.checkoutSessionId}`}/><Info icon={<Boxes size={14}/>} label="شهر / شعبه" value={`${order.cityId} / ${order.storeId}`}/><Info icon={<Banknote size={14}/>} label="پرداخت / رزرو" value={`${order.paymentIntentId || "—"} / ${order.inventoryReservationId || "—"}`}/></section>
      <section className="border border-[var(--adt-border)] bg-[var(--adt-surface)] p-4"><h3 className="text-[12px] font-extrabold">زمان‌بندی و رهگیری</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Timeline label="ایجاد سفارش" value={formatDate(order.createdAt)}/><Timeline label="آخرین تغییر" value={formatDate(order.updatedAt)}/><Timeline label="تأیید سفارش" value={formatDate(order.confirmedAt)}/><Timeline label="لغو سفارش" value={formatDate(order.cancelledAt)}/></div><div className="mt-4 grid gap-3 border-t border-[var(--adt-border)] pt-4 sm:grid-cols-2"><Info icon={<ReceiptText size={14}/>} label="شناسه داخلی سفارش" value={order._id}/><Info icon={<RefreshCw size={14}/>} label="شناسه رهگیری رویداد" value={order.correlationId}/><Info icon={<ReceiptText size={14}/>} label="نسخه سیاست سفارش" value={order.policyVersion}/></div></section>
      <section className="border border-[var(--adt-border)] bg-[var(--adt-surface)] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-[12px] font-extrabold">اقدام عملیاتی بعدی</h3><p className="mt-1 text-[9px] leading-5 text-[var(--adt-muted)]">هر اقدام ثبت ممیزی دارد و فقط مطابق وضعیت فعلی فعال می‌شود.</p></div>{!canWrite ? <span className="border border-[var(--adt-warning)]/35 bg-[var(--adt-warning)]/[0.08] px-2 py-1 text-[9px] text-[var(--adt-warning)]">فقط مشاهده</span> : null}</div>
        {canWrite && actions.length ? <div className="mt-4 flex flex-wrap gap-2">{actions.map((item) => <DataButton key={item} tone={ACTIONS[item].tone} icon={ACTIONS[item].icon} disabled={mutation.isPending} onClick={() => { if (mutation.isPending || operationInFlightRef.current) return; setAction(item); setReason(""); mutation.reset(); }}>{ACTIONS[item].label}</DataButton>)}</div> : <p className="mt-4 border-r-2 border-[var(--adt-border-strong)] pr-3 text-[10px] text-[var(--adt-muted)]">{canWrite ? "برای وضعیت فعلی اقدام دستی مجازی وجود ندارد." : "شما اجازه انجام عملیات روی سفارش را ندارید."}</p>}
        {action ? <div className="mt-4 border border-[var(--adt-warning)]/40 bg-[var(--adt-warning)]/[0.06] p-4"><h4 className="text-[12px] font-extrabold text-[var(--adt-warning)]">{ACTIONS[action].title}</h4><p className="mt-2 text-[10px] leading-6 text-[var(--adt-text)]">{ACTIONS[action].effect}</p><DataTextarea autoFocus className="mt-3" label="دلیل عملیاتی" required rows={3} maxLength={300} disabled={mutation.isPending} value={reason} onChange={(event) => setReason(event.target.value)} error={reason.length > 0 && !reasonValid ? "دلیل باید حداقل ۳ نویسه معنادار باشد." : undefined} helperText="این دلیل در سابقه ممیزی کارکنان ثبت می‌شود."/><div aria-live="polite">{mutation.isError ? <p role="alert" className="mt-3 text-[10px] text-[var(--adt-danger)]">{mutation.error instanceof Error ? mutation.error.message : "عملیات انجام نشد."}</p> : null}</div><div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><DataButton disabled={mutation.isPending} onClick={() => { if (mutation.isPending || operationInFlightRef.current) return; setAction(null); setReason(""); mutation.reset(); }}>انصراف</DataButton><DataButton tone={ACTIONS[action].tone} loading={mutation.isPending} disabled={!reasonValid || mutation.isPending || !orderId} onClick={() => { if (mutation.isPending || operationInFlightRef.current || !orderId) return; operationInFlightRef.current = true; mutation.mutate({ targetOrderId: orderId, selectedAction: action, meaningfulReason: reason.trim() }); }}>تأیید و ثبت نهایی</DataButton></div></div> : null}
      </section>
    </div> : null}
  </DynamicModal>;
}

function MoneyLine({ label, value, currency }: { label: string; value: number; currency: string }) { return <div className="bg-[var(--adt-surface-muted)] p-3"><small className="text-[9px] text-[var(--adt-muted)]">{label}</small><strong dir="ltr" className="mt-1 block text-left text-[11px] tabular-nums">{money(value, currency)}</strong></div>; }
function Info({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) { return <div className="min-w-0"><span className="flex items-center gap-2 text-[9px] text-[var(--adt-muted)]">{icon}{label}</span><strong dir="ltr" className="mt-1 block break-all text-left text-[9px] font-medium">{value || "—"}</strong></div>; }
function Timeline({ label, value }: { label: string; value: string }) { return <div className="border-r-2 border-[var(--adt-accent)]/45 pr-3"><small className="block text-[9px] text-[var(--adt-muted)]">{label}</small><strong className="mt-1 block text-[10px] font-semibold">{value}</strong></div>; }
