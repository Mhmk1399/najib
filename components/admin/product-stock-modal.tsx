"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, PackagePlus } from "lucide-react";
import { DynamicModal } from "@/components/global/table/DynamicModal";
import { DataButton } from "@/components/global/table/primitives";
import { useToast } from "@/components/ui/CustomToast";
import { fa, type LocalizedText } from "@/lib/admin/localization";

type Location = { _id: string; code: string; name: LocalizedText; type?: string; storeId?: string | { name?: LocalizedText } | null };
type Ref = { _id: string; name: LocalizedText; code?: string; hex?: string };
type Row = { _id: string; sku: string; colorId: Ref; sizeId: Ref; balance: { onHand: number; reserved: number; available: number } };
type StockData = { variants: Row[] };
type Product = { _id: string; name: LocalizedText };
const nf = new Intl.NumberFormat("fa-IR");
const inputClass = "min-h-10 w-full border border-[var(--adt-border-strong)] bg-[var(--adt-surface)] px-3 text-[11px] outline-none focus:border-[var(--adt-accent)] focus:ring-2 focus:ring-[var(--adt-accent)]/15";

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => null) as T & { error?: string };
  if (!response.ok) throw new Error(body?.error || "درخواست انجام نشد.");
  return body;
}

export function ProductStockModal({ product, locations, open, onClose }: { product: Product | null; locations: Location[]; open: boolean; onClose: () => void }) {
  const toast = useToast(); const queryClient = useQueryClient();
  const [locationId, setLocationId] = useState(""); const [quantities, setQuantities] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const key = useRef(crypto.randomUUID());
  const selectedLocationId = locationId;
  const stock = useQuery({ queryKey: ["inventory", "product-stock", product?._id, selectedLocationId], queryFn: () => request<StockData>(`/api/admin/inventory/product-stock?productId=${product?._id}&locationId=${selectedLocationId}`), enabled: open && Boolean(product?._id && selectedLocationId), staleTime: 0 });
  const selected = useMemo(() => Object.entries(quantities).map(([variantId, raw]) => ({ variantId, quantity: Number(raw) })).filter((item) => Number.isInteger(item.quantity) && item.quantity > 0), [quantities]);
  const total = selected.reduce((sum, item) => sum + item.quantity, 0);
  async function submit() {
    if (!product || !selectedLocationId || !selected.length) return setError("برای حداقل یک رنگ و سایز، تعداد افزایشی وارد کنید.");
    setBusy(true); setError("");
    try {
      await request("/api/admin/inventory/product-stock", { method: "POST", body: JSON.stringify({ idempotencyKey: `stock:${key.current}`, productId: product._id, locationId: selectedLocationId, items: selected }) });
      toast.success("موجودی محصول ثبت شد", { description: `${nf.format(total)} عدد به موجودی محل انتخاب‌شده اضافه شد.` });
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["inventory"] }), queryClient.invalidateQueries({ queryKey: ["catalog", "products"] })]);
      onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "ثبت موجودی انجام نشد."); }
    finally { setBusy(false); }
  }
  return <DynamicModal open={open} onClose={busy ? undefined : onClose} title={`افزودن موجودی ${product ? fa(product.name) : "محصول"}`} description="یک محل را انتخاب کنید و فقط تعداد رنگ‌ و سایزهایی را بنویسید که تحویل گرفته‌اید؛ همه با یک ثبت اضافه می‌شوند." size="xl" footer={<div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between"><span className="text-[10px] font-semibold text-[var(--adt-muted)]">{nf.format(selected.length)} تنوع · {nf.format(total)} عدد</span><div className="flex gap-2"><DataButton onClick={onClose} disabled={busy}>انصراف</DataButton><DataButton tone="primary" icon={<PackagePlus size={15} />} loading={busy} disabled={!selected.length || stock.isFetching} onClick={() => void submit()}>ثبت یک‌جای موجودی</DataButton></div></div>}>
    <div className="space-y-4" dir="rtl">
      <section className="border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] p-4"><label className="block text-[10px] font-bold">شعبه یا انبار مقصد</label><select className={`${inputClass} mt-2`} value={locationId} onChange={(event) => { setLocationId(event.target.value); setQuantities({}); key.current = crypto.randomUUID(); }}><option value="">انتخاب محل</option>{locations.map((location) => <option key={location._id} value={location._id}>{fa(location.name)} · {location.code}</option>)}</select></section>
      {stock.isPending ? <div className="p-8 text-center text-[10px] text-[var(--adt-muted)]">در حال دریافت رنگ‌ها، سایزها و موجودی فعلی…</div> : stock.isError ? <div role="alert" className="border border-[var(--adt-danger)]/30 bg-[var(--adt-danger)]/[.06] p-4 text-[10px] text-[var(--adt-danger)]">{stock.error.message}</div> : !stock.data?.variants.length ? <div className="p-8 text-center text-[10px] text-[var(--adt-muted)]">این محصول تنوع فعال ندارد.</div> : <div className="max-h-[54vh] overflow-auto border border-[var(--adt-border)]"><table className="w-full min-w-[620px] border-collapse text-[10px]"><thead className="sticky top-0 z-10 bg-[var(--adt-surface-muted)]"><tr><th className="p-3 text-right">رنگ و سایز</th><th className="p-3 text-right">SKU</th><th className="p-3 text-center">موجودی فعلی</th><th className="w-40 p-3 text-right">تعداد افزایشی</th></tr></thead><tbody>{stock.data.variants.map((row) => <tr key={row._id} className="border-t border-[var(--adt-border)]"><td className="p-3"><span className="inline-flex items-center gap-2"><i className="size-3 rounded-full border border-black/15" style={{ background: row.colorId.hex || "#ddd" }} /><strong>{fa(row.colorId.name)} · {fa(row.sizeId.name)}</strong></span></td><td dir="ltr" className="p-3 text-left text-[9px] text-[var(--adt-muted)]">{row.sku}</td><td className="p-3 text-center"><strong>{nf.format(row.balance.onHand)}</strong>{row.balance.reserved ? <small className="mt-1 block text-[var(--adt-warning)]">{nf.format(row.balance.reserved)} رزرو</small> : null}</td><td className="p-2"><input aria-label={`تعداد افزایشی ${row.sku}`} className={`${inputClass} text-center`} inputMode="numeric" placeholder="۰" value={quantities[row._id] ?? ""} onChange={(event) => setQuantities((current) => ({ ...current, [row._id]: event.target.value.replace(/[^0-9۰-۹]/g, "").replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))) }))} /></td></tr>)}</tbody></table></div>}
      {selected.length ? <div className="flex items-center gap-2 border-r-2 border-[var(--adt-accent)] bg-[var(--adt-accent)]/[.06] px-4 py-3 text-[10px]"><Boxes size={14} /><strong>{nf.format(total)} عدد</strong><span>به محل انتخاب‌شده اضافه می‌شود.</span></div> : null}
      {error ? <p role="alert" className="text-[10px] font-semibold text-[var(--adt-danger)]">{error}</p> : null}
    </div>
  </DynamicModal>;
}
