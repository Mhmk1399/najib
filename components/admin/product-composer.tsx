"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Boxes, Check, ChevronLeft, PackagePlus, Plus, Trash2 } from "lucide-react";
import { DynamicModal } from "@/components/global/table/DynamicModal";
import { DataButton, DataInput } from "@/components/global/table/primitives";
import { useToast } from "@/components/ui/CustomToast";
import { fa, type LocalizedText } from "@/lib/admin/localization";

type Reference = { _id: string; name: LocalizedText; code?: string; slug?: string; hex?: string; categoryId?: string };
type Location = { _id: string; name: LocalizedText; code: string; type?: string; storeId?: string | { _id: string; name?: LocalizedText; code?: string } | null };
type ImageReference = { _id: string; url: string; alt: LocalizedText };
type VariantDraft = { colorId: string; sizeId: string; enabled: boolean; sku: string; skuManual: boolean; barcode: string; priceOverrideIrr: string; priceOverrideUsd: string };
type ComposerProps = {
  open: boolean;
  onClose: () => void;
  categories: Reference[];
  subcategories: Reference[];
  colors: Reference[];
  sizes: Reference[];
  locations: Location[];
  images: ImageReference[];
  loading?: boolean;
  error?: boolean;
  onRetry: () => void;
  onSuccess: () => void;
};

const digits = new Intl.NumberFormat("fa-IR");
const textInput = "min-h-11 w-full rounded-[5px] border border-[var(--adt-border-strong)] bg-[var(--adt-surface)] px-3 text-[11px] outline-none transition focus:border-[var(--adt-accent)] focus:ring-2 focus:ring-[var(--adt-accent)]/15 disabled:opacity-50";
const selectInput = `${textInput} appearance-none`;

function idempotencyKey() {
  return `product:${Date.now()}:${crypto.randomUUID()}`;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);
}

function skuPart(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 18) || "ITEM";
}

function latinDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block min-w-0"><span className="mb-1.5 block text-[10px] font-bold text-[var(--adt-text)]">{label}</span>{children}{hint ? <span className="mt-1 block text-[9px] leading-5 text-[var(--adt-muted)]">{hint}</span> : null}</label>;
}

function RefToggle({ selected, item, onClick, color }: { selected: boolean; item: Reference; onClick: () => void; color?: boolean }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={`flex min-h-11 items-center gap-2 rounded-[5px] border px-3 text-[10px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/35 ${selected ? "border-[var(--adt-accent)] bg-[var(--adt-accent)]/[0.09] text-[var(--adt-text)]" : "border-[var(--adt-border)] bg-[var(--adt-surface)] text-[var(--adt-muted)] hover:border-[var(--adt-border-strong)]"}`}>
    {color ? <span className="size-4 rounded-full border border-black/15" style={{ background: item.hex || "#ddd" }} /> : null}{fa(item.name)}{selected ? <Check size={13} className="text-[var(--adt-accent-strong)]" /> : null}
  </button>;
}

export function ProductComposer(props: ComposerProps) {
  const toast = useToast();
  const [name, setName] = useState({ fa: "", en: "", ar: "" });
  const [description, setDescription] = useState({ fa: "", en: "", ar: "" });
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [priceIrr, setPriceIrr] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [primaryImageId, setPrimaryImageId] = useState("");
  const [colorIds, setColorIds] = useState<string[]>([]);
  const [sizeIds, setSizeIds] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [stock, setStock] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [requestKey, setRequestKey] = useState(idempotencyKey);
  const [slugManual, setSlugManual] = useState(false);

  const subcategories = props.subcategories.filter((item) => !categoryId || item.categoryId === categoryId);
  const colorMap = useMemo(() => new Map(props.colors.map((item) => [item._id, item])), [props.colors]);
  const sizeMap = useMemo(() => new Map(props.sizes.map((item) => [item._id, item])), [props.sizes]);
  const enabled = variants.filter((item) => item.enabled);
  const totalUnits = enabled.reduce((sum, variant) => sum + props.locations.reduce((locationSum, location) => locationSum + (Number(stock[`${variant.colorId}:${variant.sizeId}:${location._id}`]) || 0), 0), 0);
  const locationsUsed = props.locations.filter((location) => enabled.some((variant) => Number(stock[`${variant.colorId}:${variant.sizeId}:${location._id}`]) > 0));

  function syncVariants(nextColors: string[], nextSizes: string[]) {
    setVariants((current) => {
      const previous = new Map(current.map((item) => [`${item.colorId}:${item.sizeId}`, item]));
      return nextColors.flatMap((colorId) => nextSizes.map((sizeId) => {
        const key = `${colorId}:${sizeId}`;
        const old = previous.get(key);
        const color = colorMap.get(colorId);
        const size = sizeMap.get(sizeId);
        return old ?? { colorId, sizeId, enabled: true, sku: [skuPart(slug || name.en || "PRODUCT"), skuPart(color?.code || color?.slug || fa(color?.name)), skuPart(size?.code || size?.slug || fa(size?.name))].join("-"), skuManual: false, barcode: "", priceOverrideIrr: "", priceOverrideUsd: "" };
      }));
    });
  }

  function toggleColor(id: string) {
    const next = colorIds.includes(id) ? colorIds.filter((item) => item !== id) : [...colorIds, id];
    if (next.length * sizeIds.length > 100) { setMessage("حداکثر ۱۰۰ ترکیب رنگ و سایز در یک محصول مجاز است."); return; }
    setColorIds(next); syncVariants(next, sizeIds);
  }
  function toggleSize(id: string) {
    const next = sizeIds.includes(id) ? sizeIds.filter((item) => item !== id) : [...sizeIds, id];
    if (colorIds.length * next.length > 100) { setMessage("حداکثر ۱۰۰ ترکیب رنگ و سایز در یک محصول مجاز است."); return; }
    setSizeIds(next); syncVariants(colorIds, next);
  }
  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((item) => `${item.colorId}:${item.sizeId}` === key ? { ...item, ...patch } : item));
  }

  function updateGeneratedIdentifiers(nextSlug: string) {
    setSlug(nextSlug);
    setVariants((current) => current.map((item) => item.skuManual ? item : { ...item, sku: [skuPart(nextSlug || "PRODUCT"), skuPart(colorMap.get(item.colorId)?.code || colorMap.get(item.colorId)?.slug || fa(colorMap.get(item.colorId)?.name)), skuPart(sizeMap.get(item.sizeId)?.code || sizeMap.get(item.sizeId)?.slug || fa(sizeMap.get(item.sizeId)?.name))].join("-") }));
  }

  function resetDraft() {
    setName({ fa: "", en: "", ar: "" }); setDescription({ fa: "", en: "", ar: "" }); setSlug(""); setSlugManual(false);
    setCategoryId(""); setSubcategoryId(""); setPriceIrr(""); setPriceUsd(""); setStatus("draft"); setPrimaryImageId(""); setColorIds([]); setSizeIds([]); setVariants([]); setStock({}); setMessage(""); setRequestKey(idempotencyKey());
  }

  async function submit() {
    setMessage("");
    const positiveStockRows = enabled.flatMap((item) => props.locations.map((location) => ({ variantKey: `${item.colorId}:${item.sizeId}`, locationId: location._id, quantity: Number(stock[`${item.colorId}:${item.sizeId}:${location._id}`]) || 0 })).filter((row) => row.quantity > 0));
    if (!name.fa.trim() || !name.en.trim() || !name.ar.trim()) return setMessage("نام محصول را در هر سه زبان وارد کنید.");
    if (!slugify(slug)) return setMessage("شناسه URL انگلیسی محصول را وارد کنید.");
    if (!categoryId || !subcategoryId) return setMessage("دسته و زیردسته را انتخاب کنید.");
    if (!priceIrr.trim() || !Number.isSafeInteger(Number(priceIrr)) || Number(priceIrr) < 0) return setMessage("قیمت ریالی را به‌صورت عدد صحیح وارد کنید.");
    const usdCents = Math.round(Number(priceUsd) * 100);
    if (!priceUsd.trim() || !Number.isFinite(Number(priceUsd)) || Number(priceUsd) < 0 || !Number.isSafeInteger(usdCents)) return setMessage("قیمت دلاری معتبر وارد کنید.");
    if (!enabled.length) return setMessage("حداقل یک ترکیب رنگ و سایز را فعال کنید.");
    if (enabled.some((item) => !item.sku.trim())) return setMessage("همه تنوع‌های فعال باید کد کالا داشته باشند.");
    if (positiveStockRows.length > 1000) return setMessage("تعداد ردیف‌های دارای موجودی از سقف ۱۰۰۰ بیشتر است؛ انتخاب‌ها را محدود کنید.");
    if (props.loading || props.error) return setMessage("ابتدا اطلاعات پایه را کامل دریافت کنید.");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/catalog/products/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        idempotencyKey: requestKey,
        product: { name, slug: slugify(slug), description, categoryId, subcategoryId, priceIrrMinor: Number(priceIrr), priceUsdMinor: usdCents, status, primaryImageId: primaryImageId || null, primaryImageObjectFit: "cover", primaryImageObjectPosition: "center" },
        variants: enabled.map((item) => ({ colorId: item.colorId, sizeId: item.sizeId, sku: item.sku.trim().toUpperCase(), ...(item.barcode.trim() ? { barcode: item.barcode.trim() } : {}), ...(item.priceOverrideIrr ? { priceOverrideIrrMinor: Number(item.priceOverrideIrr) } : {}), ...(item.priceOverrideUsd ? { priceOverrideUsdMinor: Math.round(Number(item.priceOverrideUsd) * 100) } : {}) })),
        stock: positiveStockRows,
      }) });
      const body = await response.json().catch(() => null) as { error?: string; message?: string } | null;
      if (!response.ok) throw new Error(body?.error || body?.message || "ثبت محصول انجام نشد.");
      toast.success("محصول و موجودی با هم ثبت شدند", { description: `${digits.format(enabled.length)} تنوع و ${digits.format(totalUnits)} عدد موجودی ساخته شد.` });
      resetDraft(); props.onSuccess(); props.onClose();
    } catch (error) { setMessage(error instanceof Error ? error.message : "ثبت محصول انجام نشد."); }
    finally { setBusy(false); }
  }

  return <DynamicModal open={props.open} onClose={props.onClose} busy={busy} size="xl" title="ساخت یکپارچه محصول" description="محصول، تنوع‌های رنگ و سایز و موجودی اولیه شعبه‌ها را یک‌جا ثبت کنید." footer={<div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between"><span className="text-[10px] text-[var(--adt-muted)]">ثبت نهایی اتمیک است؛ اگر بخشی خطا داشته باشد هیچ داده ناقصی ساخته نمی‌شود.</span><div className="flex gap-2"><DataButton onClick={props.onClose} disabled={busy}>انصراف</DataButton><DataButton tone="primary" loading={busy} disabled={props.loading || props.error} icon={<PackagePlus size={15} />} onClick={submit}>ثبت محصول و موجودی</DataButton></div></div>}>
    <div dir="rtl" className="space-y-5 p-4 text-[var(--adt-text)] sm:p-5">
      {props.loading ? <div className="border border-[var(--adt-border)] p-6 text-center text-[11px] text-[var(--adt-muted)]">در حال آماده‌سازی رنگ‌ها، سایزها و شعبه‌ها…</div> : null}
      {props.error ? <div role="alert" className="flex items-center justify-between gap-3 border border-[var(--adt-danger)]/35 bg-[var(--adt-danger)]/[0.06] p-4 text-[10px] text-[var(--adt-danger)]"><span>اطلاعات پایه کامل دریافت نشد.</span><DataButton size="sm" tone="danger" onClick={props.onRetry}>تلاش دوباره</DataButton></div> : null}
      <section className="border border-[var(--adt-border)] bg-[var(--adt-surface)]">
        <header className="flex items-center gap-3 border-b border-[var(--adt-border)] px-4 py-3"><span className="grid size-7 place-items-center bg-[var(--adt-text)] text-[10px] font-bold text-[var(--adt-surface)]">۱</span><div><h3 className="text-[12px] font-extrabold">اطلاعات اصلی</h3><p className="mt-0.5 text-[9px] text-[var(--adt-muted)]">نام، دسته و قیمت پایه؛ ارز کاتالوگ ثابت و ریال است.</p></div></header>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <Field label="نام فارسی"><input className={textInput} value={name.fa} onChange={(e) => setName({ ...name, fa: e.target.value })} /></Field>
          <Field label="نام انگلیسی"><input dir="ltr" className={textInput} value={name.en} onChange={(e) => { const nextName = e.target.value; setName({ ...name, en: nextName }); if (!slugManual) updateGeneratedIdentifiers(slugify(nextName)); }} /></Field>
          <Field label="نام عربی"><input className={textInput} value={name.ar} onChange={(e) => setName({ ...name, ar: e.target.value })} /></Field>
          <Field label="شناسه URL" hint="تا وقتی دستی تغییرش ندهید از نام انگلیسی ساخته می‌شود."><input dir="ltr" className={textInput} value={slug} onChange={(e) => { setSlugManual(true); updateGeneratedIdentifiers(slugify(e.target.value)); }} placeholder="blue-shirt" /></Field>
          <Field label="دسته‌بندی"><select className={selectInput} value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(""); }}><option value="">انتخاب دسته</option>{props.categories.map((item) => <option key={item._id} value={item._id}>{fa(item.name)}</option>)}</select></Field>
          <Field label="زیردسته"><select className={selectInput} value={subcategoryId} disabled={!categoryId} onChange={(e) => setSubcategoryId(e.target.value)}><option value="">انتخاب زیردسته</option>{subcategories.map((item) => <option key={item._id} value={item._id}>{fa(item.name)}</option>)}</select></Field>
          <Field label="قیمت ریالی" hint="مبلغ دقیق به ریال؛ تبدیل ارزی انجام نمی‌شود."><DataInput dir="ltr" inputMode="numeric" value={priceIrr} onChange={(e) => setPriceIrr(latinDigits(e.target.value).replace(/\D/g, ""))} suffixText="ریال" /></Field>
          <Field label="قیمت دلاری" hint="مبلغ دلار؛ در سیستم به سنت ذخیره می‌شود."><DataInput dir="ltr" inputMode="decimal" value={priceUsd} onChange={(e) => setPriceUsd(latinDigits(e.target.value).replace(/[^\d.]/g, ""))} suffixText="USD" /></Field>
          <Field label="وضعیت"><select className={selectInput} value={status} onChange={(e) => setStatus(e.target.value as "draft" | "active")}><option value="draft">پیش‌نویس</option><option value="active">فعال و قابل فروش</option></select></Field>
          <Field label="تصویر اصلی"><div className="flex items-center gap-2"><select className={selectInput} value={primaryImageId} onChange={(e) => setPrimaryImageId(e.target.value)}><option value="">بدون تصویر؛ بعداً اضافه می‌کنم</option>{props.images.map((item) => <option key={item._id} value={item._id}>{fa(item.alt)}</option>)}</select>{primaryImageId ? <span className="size-11 shrink-0 border border-[var(--adt-border)] bg-cover bg-center" role="img" aria-label="پیش‌نمایش تصویر اصلی" style={{ backgroundImage: `url(${props.images.find((item) => item._id === primaryImageId)?.url})` }} /> : null}</div></Field>
          <div className="md:col-span-3 grid gap-3 md:grid-cols-3">{(["fa", "en", "ar"] as const).map((locale) => <Field key={locale} label={`توضیحات ${locale === "fa" ? "فارسی" : locale === "en" ? "انگلیسی" : "عربی"}`}><textarea dir={locale === "en" ? "ltr" : "rtl"} rows={3} className={`${textInput} py-3`} value={description[locale]} onChange={(e) => setDescription({ ...description, [locale]: e.target.value })} /></Field>)}</div>
        </div>
      </section>

      <section className="border border-[var(--adt-border)] bg-[var(--adt-surface)]">
        <header className="flex items-center gap-3 border-b border-[var(--adt-border)] px-4 py-3"><span className="grid size-7 place-items-center bg-[var(--adt-text)] text-[10px] font-bold text-[var(--adt-surface)]">۲</span><div><h3 className="text-[12px] font-extrabold">رنگ‌ها و سایزهای موجود</h3><p className="mt-0.5 text-[9px] text-[var(--adt-muted)]">رنگ و سایز را انتخاب کنید؛ ترکیب‌ها خودکار ساخته می‌شوند.</p></div></header>
        <div className="grid gap-5 p-4 lg:grid-cols-2"><div><h4 className="mb-2 text-[10px] font-bold">رنگ‌ها</h4><div className="flex flex-wrap gap-2">{props.colors.map((item) => <RefToggle key={item._id} item={item} color selected={colorIds.includes(item._id)} onClick={() => toggleColor(item._id)} />)}</div></div><div><h4 className="mb-2 text-[10px] font-bold">سایزها</h4><div className="flex flex-wrap gap-2">{props.sizes.map((item) => <RefToggle key={item._id} item={item} selected={sizeIds.includes(item._id)} onClick={() => toggleSize(item._id)} />)}</div></div></div>
        {variants.length ? <div className="border-t border-[var(--adt-border)] p-4"><div className="mb-3 flex items-center justify-between"><h4 className="text-[11px] font-bold">ترکیب‌های قابل فروش</h4><span className="text-[10px] text-[var(--adt-muted)]">{digits.format(enabled.length)} از {digits.format(variants.length)} فعال</span></div><div className="grid gap-2">{variants.map((item) => { const key = `${item.colorId}:${item.sizeId}`; return <article key={key} className={`grid min-w-0 gap-3 border p-3 md:grid-cols-[minmax(130px,.6fr)_minmax(0,1.2fr)_minmax(110px,.6fr)_minmax(115px,.65fr)_minmax(115px,.65fr)_42px] md:items-end ${item.enabled ? "border-[var(--adt-border-strong)]" : "border-[var(--adt-border)] opacity-55"}`}><div><strong className="block text-[11px]">{fa(colorMap.get(item.colorId)?.name)} · {fa(sizeMap.get(item.sizeId)?.name)}</strong><span className="mt-1 block text-[9px] text-[var(--adt-muted)]">تنوع مستقل</span></div><Field label="کد کالا (SKU)"><input dir="ltr" disabled={!item.enabled} className={textInput} value={item.sku} onChange={(e) => updateVariant(key, { sku: e.target.value.toUpperCase(), skuManual: true })} /></Field><Field label="بارکد"><input dir="ltr" disabled={!item.enabled} className={textInput} value={item.barcode} placeholder="اختیاری" onChange={(e) => updateVariant(key, { barcode: latinDigits(e.target.value).trim() })} /></Field><Field label="قیمت ریالی متفاوت"><input dir="ltr" inputMode="numeric" disabled={!item.enabled} className={textInput} value={item.priceOverrideIrr} placeholder="قیمت محصول" onChange={(e) => updateVariant(key, { priceOverrideIrr: latinDigits(e.target.value).replace(/\D/g, "") })} /></Field><Field label="قیمت دلاری متفاوت"><input dir="ltr" inputMode="decimal" disabled={!item.enabled} className={textInput} value={item.priceOverrideUsd} placeholder="قیمت محصول" onChange={(e) => updateVariant(key, { priceOverrideUsd: latinDigits(e.target.value).replace(/[^\d.]/g, "") })} /></Field><button type="button" aria-label={item.enabled ? "غیرفعال کردن ترکیب" : "فعال کردن ترکیب"} onClick={() => updateVariant(key, { enabled: !item.enabled })} className={`grid size-10 place-items-center rounded-[5px] border outline-none focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/35 ${item.enabled ? "border-[var(--adt-danger)]/30 text-[var(--adt-danger)]" : "border-[var(--adt-accent)] text-[var(--adt-accent-strong)]"}`}>{item.enabled ? <Trash2 size={14} /> : <Plus size={14} />}</button></article>; })}</div></div> : <div className="border-t border-dashed border-[var(--adt-border)] p-5 text-center text-[10px] text-[var(--adt-muted)]">با انتخاب رنگ و سایز، تنوع‌های محصول اینجا ساخته می‌شوند.</div>}
      </section>

      <section className="border border-[var(--adt-border)] bg-[var(--adt-surface)]">
        <header className="flex items-center gap-3 border-b border-[var(--adt-border)] px-4 py-3"><span className="grid size-7 place-items-center bg-[var(--adt-text)] text-[10px] font-bold text-[var(--adt-surface)]">۳</span><div><h3 className="text-[12px] font-extrabold">موجودی اولیه شعبه و انبار</h3><p className="mt-0.5 text-[9px] text-[var(--adt-muted)]">برای هر ترکیب فقط تعداد محل‌هایی را وارد کنید که واقعاً کالا دارند؛ صفر یعنی بدون موجودی.</p></div></header>
        {!enabled.length ? <div className="p-5 text-center text-[10px] text-[var(--adt-muted)]">ابتدا حداقل یک ترکیب را فعال کنید.</div> : !props.locations.length ? <div className="p-5 text-center text-[10px] text-[var(--adt-danger)]">شعبه یا انبار فعالی وجود ندارد. ابتدا یک محل موجودی بسازید.</div> : <div className="max-w-full overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-[10px]"><thead><tr className="bg-[var(--adt-surface-muted)]"><th className="sticky right-0 z-10 min-w-52 border-b border-l border-[var(--adt-border)] bg-[var(--adt-surface-muted)] p-3 text-right">{name.fa || "محصول"} · رنگ · سایز · کد</th>{props.locations.map((location) => { const store = typeof location.storeId === "object" ? location.storeId : null; return <th key={location._id} className="min-w-36 border-b border-l border-[var(--adt-border)] p-3 text-right"><strong className="block">{fa(location.name)}</strong><small className="mt-1 block font-normal text-[var(--adt-muted)]">{store?.name ? fa(store.name) : location.type === "warehouse" ? "انبار" : "شعبه"}</small><small dir="ltr" className="mt-1 block text-left font-normal text-[var(--adt-muted)]">{location.code}</small></th>; })}</tr></thead><tbody>{enabled.map((item) => { const variantKey = `${item.colorId}:${item.sizeId}`; return <tr key={variantKey}><th className="sticky right-0 z-10 border-b border-l border-[var(--adt-border)] bg-[var(--adt-surface)] p-3 text-right"><strong>{fa(colorMap.get(item.colorId)?.name)} · {fa(sizeMap.get(item.sizeId)?.name)}</strong><small dir="ltr" className="mt-1 block text-left font-normal text-[var(--adt-muted)]">{item.sku}</small></th>{props.locations.map((location) => { const key = `${variantKey}:${location._id}`; return <td key={location._id} className="border-b border-l border-[var(--adt-border)] p-2"><input aria-label={`موجودی ${item.sku} در ${fa(location.name)}`} dir="ltr" inputMode="numeric" className={`${textInput} text-center`} value={stock[key] ?? ""} placeholder="۰" onChange={(e) => setStock({ ...stock, [key]: latinDigits(e.target.value).replace(/\D/g, "") })} /></td>; })}</tr>; })}</tbody></table></div>}
      </section>

      <section className="border border-[var(--adt-border-strong)] bg-[var(--adt-surface-muted)] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="flex items-center gap-2 text-[9px] font-bold tracking-[.12em] text-[var(--adt-accent-strong)]"><Boxes size={14} />نقشه تنوع و موجودی</p><h3 className="mt-2 text-[15px] font-extrabold">{name.fa || "محصول جدید"}</h3></div><p className="text-[10px] text-[var(--adt-muted)]">{digits.format(enabled.length)} تنوع · {digits.format(totalUnits)} عدد · {digits.format(locationsUsed.length)} محل</p></div><div className="mt-4 grid gap-2">{enabled.map((variant) => { const allocations = props.locations.map((location) => ({ location, quantity: Number(stock[`${variant.colorId}:${variant.sizeId}:${location._id}`]) || 0 })).filter((item) => item.quantity > 0); return <article key={`${variant.colorId}:${variant.sizeId}`} className="grid gap-2 border border-[var(--adt-border)] bg-[var(--adt-surface)] p-3 sm:grid-cols-[minmax(170px,.8fr)_minmax(0,1.2fr)]"><div><strong className="text-[11px]">{fa(colorMap.get(variant.colorId)?.name)} · {fa(sizeMap.get(variant.sizeId)?.name)}</strong><small dir="ltr" className="mt-1 block text-left text-[9px] text-[var(--adt-muted)]">{variant.sku}</small></div><div className="flex flex-wrap gap-1.5">{allocations.length ? allocations.map(({ location, quantity }) => <span key={location._id} className="border border-[var(--adt-border)] px-2 py-1.5 text-[9px]"><strong>{fa(location.name)}</strong><ChevronLeft size={10} className="mx-1 inline" />{digits.format(quantity)}</span>) : <span className="text-[9px] text-[var(--adt-muted)]">بدون موجودی اولیه</span>}</div></article>; })}{!enabled.length ? <span className="text-[10px] text-[var(--adt-muted)]">هنوز تنوع فعالی انتخاب نشده است.</span> : null}</div></section>
      {message ? <div role="alert" className="border-r-2 border-[var(--adt-danger)] bg-[var(--adt-danger)]/[0.07] px-4 py-3 text-[10px] font-semibold text-[var(--adt-danger)]">{message}</div> : null}
    </div>
  </DynamicModal>;
}
