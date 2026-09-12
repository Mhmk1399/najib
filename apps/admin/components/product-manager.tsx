"use client";

import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronDown, Edit3, FileText,
  Layers3, LoaderCircle, PackageOpen, Plus, RefreshCw, Search, SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CatalogSectionNav } from "@/components/catalog-section-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { emptyLocalizedText, fa, type Locale, type LocalizedText, type LocalizedTextList, trimLocalized } from "@/lib/localization";

type ProductStatus = "draft" | "active" | "archived";

type Product = {
  _id: string;
  name: LocalizedText;
  slug: string;
  description: LocalizedText;
  categoryId: string;
  subcategoryId: string;
  collectionIds: string[];
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
  updatedAt?: string;
};

type ReferenceItem = { _id: string; name: LocalizedText; categoryId?: string };
type Pagination = { page: number; limit: number; total: number; pages: number };
type ListResponse<T> = { items: T[]; pagination: Pagination };
type ApiError = { error?: string; message?: string; details?: unknown };

type ProductForm = {
  name: LocalizedText;
  slug: string;
  description: LocalizedText;
  categoryId: string;
  subcategoryId: string;
  collectionIds: string[];
  price: string;
  currency: string;
  status: ProductStatus;
  material: LocalizedText;
  fit: LocalizedText;
  silhouette: LocalizedText;
  pattern: LocalizedText;
  seasons: LocalizedText;
  occasions: LocalizedText;
  styleTags: LocalizedText;
};

const emptyForm: ProductForm = {
  name: emptyLocalizedText(), slug: "", description: emptyLocalizedText(), categoryId: "", subcategoryId: "",
  collectionIds: [], price: "", currency: "USD", status: "draft", material: emptyLocalizedText(),
  fit: emptyLocalizedText(), silhouette: emptyLocalizedText(), pattern: emptyLocalizedText(), seasons: emptyLocalizedText(), occasions: emptyLocalizedText(), styleTags: emptyLocalizedText(),
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);
}

function splitTags(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function formatPrice(minor: number, currency: string) {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD" }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function productToForm(product: Product): ProductForm {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    collectionIds: product.collectionIds || [],
    price: (product.basePriceMinor / 100).toFixed(2),
    currency: product.currency,
    status: product.status,
    material: { fa: product.material?.fa?.join(", ") || "", en: product.material?.en?.join(", ") || "", ar: product.material?.ar?.join(", ") || "" },
    fit: product.fit || emptyLocalizedText(), silhouette: product.silhouette || emptyLocalizedText(), pattern: product.pattern || emptyLocalizedText(),
    seasons: { fa: product.seasons?.fa?.join(", ") || "", en: product.seasons?.en?.join(", ") || "", ar: product.seasons?.ar?.join(", ") || "" },
    occasions: { fa: product.occasions?.fa?.join(", ") || "", en: product.occasions?.en?.join(", ") || "", ar: product.occasions?.ar?.join(", ") || "" },
    styleTags: { fa: product.styleTags?.fa?.join(", ") || "", en: product.styleTags?.en?.join(", ") || "", ar: product.styleTags?.ar?.join(", ") || "" },
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (body as ApiError).error || (body as ApiError).message || "The request could not be completed.";
    throw Object.assign(new Error(message), { status: response.status });
  }
  return body as T;
}

export function ProductManager({ canRead, canWrite }: { canRead: boolean; canWrite: boolean }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [categories, setCategories] = useState<ReferenceItem[]>([]);
  const [subcategories, setSubcategories] = useState<ReferenceItem[]>([]);
  const [collections, setCollections] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(canRead);
  const [refsLoading, setRefsLoading] = useState(canRead);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(!canRead);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | ProductStatus>("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; id?: string } | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [initialForm, setInitialForm] = useState<ProductForm>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [locale, setLocale] = useState<Locale>("fa");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleAuthFailure = useCallback((statusCode: number) => {
    if (statusCode === 401) router.replace("/login?reason=session");
    if (statusCode === 403) setPermissionDenied(true);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchDraft.trim()); setPage(1); }, 320);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  useEffect(() => {
    if (!canRead) return;
    const controller = new AbortController();
    const loadReferences = async () => {
      setRefsLoading(true);
      try {
        const [categoryData, subcategoryData, collectionData] = await Promise.all([
          fetch("/api/catalog/categories?limit=100", { credentials: "same-origin", signal: controller.signal }).then(readJson<ListResponse<ReferenceItem>>),
          fetch("/api/catalog/subcategories?limit=100", { credentials: "same-origin", signal: controller.signal }).then(readJson<ListResponse<ReferenceItem>>),
          fetch("/api/catalog/collections?limit=100", { credentials: "same-origin", signal: controller.signal }).then(readJson<ListResponse<ReferenceItem>>),
        ]);
        setCategories(categoryData.items);
        setSubcategories(subcategoryData.items);
        setCollections(collectionData.items);
      } catch (cause) {
        if ((cause as Error).name !== "AbortError") handleAuthFailure((cause as Error & { status?: number }).status || 0);
      } finally {
        if (!controller.signal.aborted) setRefsLoading(false);
      }
    };
    loadReferences();
    return () => controller.abort();
  }, [canRead, handleAuthFailure, refreshKey]);

  useEffect(() => {
    if (!canRead) return;
    const controller = new AbortController();
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (categoryId) params.set("categoryId", categoryId);
      try {
        const response = await fetch(`/api/catalog/products?${params}`, { credentials: "same-origin", signal: controller.signal });
        const data = await readJson<ListResponse<Product>>(response);
        setProducts(data.items);
        setPagination(data.pagination);
      } catch (cause) {
        if ((cause as Error).name === "AbortError") return;
        const statusCode = (cause as Error & { status?: number }).status || 0;
        handleAuthFailure(statusCode);
        if (statusCode !== 401 && statusCode !== 403) setError((cause as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadProducts();
    return () => controller.abort();
  }, [canRead, categoryId, handleAuthFailure, page, refreshKey, search, status]);

  const categoryNames = useMemo(() => new Map(categories.map((item) => [item._id, fa(item.name)])), [categories]);
  const subcategoryNames = useMemo(() => new Map(subcategories.map((item) => [item._id, fa(item.name)])), [subcategories]);
  const filteredSubcategories = useMemo(() => subcategories.filter((item) => !form.categoryId || item.categoryId === form.categoryId), [form.categoryId, subcategories]);
  const filtersActive = Boolean(searchDraft || status || categoryId);
  const dirty = editor !== null && JSON.stringify(form) !== JSON.stringify(initialForm);

  const clearFilters = () => { setSearchDraft(""); setSearch(""); setStatus(""); setCategoryId(""); setPage(1); };
  const announce = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2800); };

  const openCreate = () => {
    const next = { ...emptyForm, collectionIds: [] };
    setForm(next); setInitialForm(next); setSlugTouched(false); setFieldErrors({}); setSaveError(null); setLocale("fa");
    setEditor({ mode: "create" });
  };

  const openEdit = async (product: Product) => {
    setEditor({ mode: "edit", id: product._id });
    setEditorLoading(true); setFieldErrors({}); setSaveError(null); setSlugTouched(true);
    try {
      const response = await fetch(`/api/catalog/products/${product._id}`, { credentials: "same-origin" });
      const detailed = await readJson<Product>(response);
      const next = productToForm(detailed);
      setForm(next); setInitialForm(next);
    } catch (cause) {
      handleAuthFailure((cause as Error & { status?: number }).status || 0);
      setSaveError((cause as Error).message);
    } finally {
      setEditorLoading(false);
    }
  };

  const closeEditor = useCallback(() => {
    if (dirty && !window.confirm("تغییرات ذخیره‌نشده این محصول حذف شود؟")) return;
    setEditor(null); setSaveError(null); setFieldErrors({});
  }, [dirty]);

  useEffect(() => {
    if (!editor) return;
    document.body.classList.add("editor-open");
    const timer = window.setTimeout(() => nameInputRef.current?.focus(), 120);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeEditor(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", onKeyDown); document.body.classList.remove("editor-open"); };
  }, [closeEditor, editor]);

  const updateField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => { const next = { ...current }; delete next[key]; return next; });
  };

  const updateName = (value: string) => {
    setForm((current) => ({ ...current, name: { ...current.name, [locale]: value }, slug: slugTouched || locale !== "en" ? current.slug : slugify(value) }));
    setFieldErrors((current) => { const next = { ...current }; delete next.name; delete next.slug; return next; });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    (["fa", "en", "ar"] as Locale[]).forEach((lang) => {
      if (!form.name[lang].trim()) next.name = "نام محصول در هر سه زبان الزامی است.";
      if (!form.description[lang].trim()) next.description = "توضیحات محصول در هر سه زبان الزامی است.";
    });
    if (!form.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) next.slug = "شناسه URL باید انگلیسی، کوچک و خط‌تیره‌دار باشد.";
    if (!form.categoryId) next.categoryId = "دسته‌بندی را انتخاب کنید.";
    if (!form.subcategoryId) next.subcategoryId = "زیردسته را انتخاب کنید.";
    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price < 0) next.price = "یک قیمت معتبر وارد کنید.";
    if (!/^[A-Za-z]{3}$/.test(form.currency)) next.currency = "کد سه‌حرفی ارز را وارد کنید.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || !validate() || !editor) return;
    setSaving(true); setSaveError(null);
    const payload = {
      name: trimLocalized(form.name), slug: form.slug.trim(), description: trimLocalized(form.description),
      categoryId: form.categoryId, subcategoryId: form.subcategoryId, collectionIds: form.collectionIds,
      basePriceMinor: Math.round(Number(form.price) * 100), currency: form.currency.toUpperCase(), status: form.status,
      material: Object.fromEntries((["fa", "en", "ar"] as Locale[]).map((lang) => [lang, splitTags(form.material[lang])])) as LocalizedTextList,
      fit: trimLocalized(form.fit), silhouette: trimLocalized(form.silhouette), pattern: trimLocalized(form.pattern),
      seasons: Object.fromEntries((["fa", "en", "ar"] as Locale[]).map((lang) => [lang, splitTags(form.seasons[lang])])) as LocalizedTextList,
      occasions: Object.fromEntries((["fa", "en", "ar"] as Locale[]).map((lang) => [lang, splitTags(form.occasions[lang])])) as LocalizedTextList,
      styleTags: Object.fromEntries((["fa", "en", "ar"] as Locale[]).map((lang) => [lang, splitTags(form.styleTags[lang])])) as LocalizedTextList,
    };
    try {
      const endpoint = editor.mode === "create" ? "/api/catalog/products" : `/api/catalog/products/${editor.id}`;
      const response = await fetch(endpoint, {
        method: editor.mode === "create" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      await readJson<Product>(response);
      setInitialForm(form);
      setEditor(null);
      setPage(1);
      setRefreshKey((value) => value + 1);
      announce(editor.mode === "create" ? "محصول به دفتر کاتالوگ افزوده شد." : "تغییرات محصول ذخیره شد.");
    } catch (cause) {
      const statusCode = (cause as Error & { status?: number }).status || 0;
      handleAuthFailure(statusCode);
      if (statusCode !== 401) setSaveError(statusCode === 403 ? "اجازه تغییر محصولات کاتالوگ را ندارید." : (cause as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return <div className="catalog-workspace">
    {notice && <div className="toast" role="status"><Check size={14} />{notice}</div>}
    <CatalogSectionNav />
    <header className="catalog-masthead">
      <div className="catalog-title-block">
        <p><span>فروش</span><i>/</i> دفتر محصولات</p>
        <h1>کاتالوگی دقیق،<br />برای روایتی ماندگار.</h1>
        <small>داستان، قیمت و جایگاه هر محصول را از یک دفتر کاری مدیریت کنید.</small>
      </div>
      <div className="catalog-tally" aria-label={`${pagination.total} محصول`}><span>محصول ثبت‌شده</span><strong>{String(pagination.total).padStart(2, "0")}</strong><small>در همه وضعیت‌ها</small></div>
      {canWrite && <button className="catalog-add" onClick={openCreate} disabled={refsLoading}><Plus size={17} /><span>افزودن محصول</span><small>پرونده جدید</small></button>}
    </header>

    {!canRead || permissionDenied ? <PermissionState /> : <>
      <section className="catalog-controls" aria-label="فیلتر محصولات">
        <label className="catalog-search"><Search size={17} /><span className="sr-only">جست‌وجوی محصولات</span><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="جست‌وجوی نام، شناسه یا SKU" /></label>
        <div className="status-tabs" aria-label="وضعیت محصول">
          {(["", "draft", "active", "archived"] as const).map((item) => <button key={item || "all"} className={status === item ? "active" : ""} onClick={() => { setStatus(item); setPage(1); }} aria-pressed={status === item}>{({ "": "همه", draft: "پیش‌نویس", active: "فعال", archived: "بایگانی" } as const)[item]}</button>)}
        </div>
        <label className="catalog-select"><Layers3 size={15} /><span className="sr-only">فیلتر دسته‌بندی</span><select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}><option value="">همه دسته‌بندی‌ها</option>{categories.map((item) => <option value={item._id} key={item._id}>{fa(item.name)}</option>)}</select><ChevronDown size={14} /></label>
        {filtersActive && <button className="clear-filter" onClick={clearFilters}><X size={14} />پاک کردن</button>}
        <button className="catalog-refresh" onClick={() => setRefreshKey((value) => value + 1)} aria-label="تازه‌سازی محصولات" disabled={loading}><RefreshCw className={loading ? "spin" : ""} size={16} /></button>
      </section>

      <section className="ledger" aria-live="polite" aria-busy={loading}>
        <header className="ledger-head"><p><SlidersHorizontal size={14} />{filtersActive ? "نتایج فیلترشده" : "فهرست کامل"}</p><span>{pagination.total} محصول</span></header>
        {loading ? <LedgerSkeleton /> : error ? <ErrorState message={error} onRetry={() => setRefreshKey((value) => value + 1)} /> : products.length === 0 ? <EmptyState filtered={filtersActive} canWrite={canWrite} onClear={clearFilters} onAdd={openCreate} /> : <>
          <div className="ledger-table-wrap"><table className="ledger-table"><thead><tr><th>محصول / شناسه</th><th>دسته‌بندی</th><th>قیمت</th><th>وضعیت</th><th>آخرین ویرایش</th>{canWrite && <th><span className="sr-only">ویرایش</span></th>}</tr></thead><tbody>{products.map((product) => <tr key={product._id}>
            <td><div className="product-identity"><span className="product-monogram" aria-hidden="true">{fa(product.name).trim().slice(0, 2) || "ن"}</span><div><strong>{fa(product.name)}</strong><small dir="ltr">/{product.slug}</small></div></div></td>
            <td><strong className="taxonomy-name">{categoryNames.get(product.categoryId) || "بدون دسته"}</strong><small className="taxonomy-sub">{subcategoryNames.get(product.subcategoryId) || "بدون زیردسته"}</small></td>
            <td><strong className="price-cell">{formatPrice(product.basePriceMinor, product.currency)}</strong><small>{product.currency}</small></td>
            <td><span className={`catalog-status catalog-status--${product.status}`}>{({ draft: "پیش‌نویس", active: "فعال", archived: "بایگانی" } as const)[product.status]}</span></td>
            <td><span className="revision-date">{formatDate(product.updatedAt)}</span></td>
            {canWrite && <td><button className="edit-product" onClick={() => openEdit(product)} aria-label={`ویرایش ${fa(product.name)}`}><Edit3 size={15} /><span>ویرایش</span></button></td>}
          </tr>)}</tbody></table></div>
          <div className="ledger-mobile-list">{products.map((product) => <article className="product-card" key={product._id}>
            <header><span className="product-monogram" aria-hidden="true">{fa(product.name).trim().slice(0, 2) || "ن"}</span><div><strong>{fa(product.name)}</strong><small dir="ltr">/{product.slug}</small></div><span className={`catalog-status catalog-status--${product.status}`}>{({ draft: "پیش‌نویس", active: "فعال", archived: "بایگانی" } as const)[product.status]}</span></header>
            <dl><div><dt>مسیر دسته‌بندی</dt><dd>{categoryNames.get(product.categoryId) || "نامشخص"} / {subcategoryNames.get(product.subcategoryId) || "نامشخص"}</dd></div><div><dt>قیمت</dt><dd>{formatPrice(product.basePriceMinor, product.currency)}</dd></div><div><dt>ویرایش</dt><dd>{formatDate(product.updatedAt)}</dd></div></dl>
            {canWrite && <button onClick={() => openEdit(product)}><Edit3 size={15} />ویرایش محصول</button>}
          </article>)}</div>
        </>}
        {!loading && !error && products.length > 0 && <footer className="ledger-pagination"><p>صفحه <strong>{pagination.page}</strong> از <strong>{Math.max(pagination.pages, 1)}</strong><span>·</span>{pagination.total} محصول</p><div><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={pagination.page <= 1}><ArrowRight size={15} />قبلی</button><button onClick={() => setPage((value) => Math.min(pagination.pages, value + 1))} disabled={pagination.page >= pagination.pages}>بعدی<ArrowLeft size={15} /></button></div></footer>}
      </section>
    </>}

    {editor && <Editor
      editor={editor} form={form} categories={categories} subcategories={filteredSubcategories} collections={collections}
      fieldErrors={fieldErrors} saveError={saveError} loading={editorLoading} saving={saving} dirty={dirty}
      nameInputRef={nameInputRef} onClose={closeEditor} onSubmit={saveProduct} onName={updateName}
      onField={updateField} onSlugTouched={() => setSlugTouched(true)} locale={locale} onLocale={setLocale}
    />}
  </div>;
}

function PermissionState() {
  return <section className="catalog-state catalog-state--permission"><AlertTriangle size={22} /><p>دسترسی کاتالوگ</p><h2>این بخش در سطح دسترسی شما نیست.</h2><span>از مدیر سیستم بخواهید مجوز مشاهده کاتالوگ را به حساب شما اضافه کند.</span></section>;
}

function LedgerSkeleton() {
  return <div className="ledger-skeleton" role="status"><span className="sr-only">در حال بارگذاری محصولات</span>{Array.from({ length: 6 }).map((_, index) => <div key={index}><i /><p><b /><small /></p><em /><em /><em /></div>)}</div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="catalog-state"><AlertTriangle size={22} /><p>فهرست در دسترس نیست</p><h2>دریافت محصولات انجام نشد.</h2><span>{message}</span><button onClick={onRetry}><RefreshCw size={15} />تلاش دوباره</button></div>;
}

function EmptyState({ filtered, canWrite, onClear, onAdd }: { filtered: boolean; canWrite: boolean; onClear: () => void; onAdd: () => void }) {
  return <div className="catalog-state"><PackageOpen size={24} /><p>{filtered ? "نتیجه‌ای پیدا نشد" : "فهرست خالی"}</p><h2>{filtered ? "جست‌وجو را تغییر دهید." : "اولین محصول را بسازید."}</h2><span>{filtered ? "محصولی با این فیلترها وجود ندارد." : "پس از آماده شدن دسته‌بندی‌ها، محصول جدید بسازید."}</span>{filtered ? <button onClick={onClear}><X size={15} />پاک کردن فیلترها</button> : canWrite && <button onClick={onAdd}><Plus size={15} />افزودن اولین محصول</button>}</div>;
}

type EditorProps = {
  editor: { mode: "create" | "edit"; id?: string };
  form: ProductForm;
  categories: ReferenceItem[];
  subcategories: ReferenceItem[];
  collections: ReferenceItem[];
  fieldErrors: Record<string, string>;
  saveError: string | null;
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onName: (value: string) => void;
  onField: <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => void;
  onSlugTouched: () => void;
  locale: Locale;
  onLocale: (locale: Locale) => void;
};

function Editor({ editor, form, categories, subcategories, collections, fieldErrors, saveError, loading, saving, dirty, nameInputRef, onClose, onSubmit, onName, onField, onSlugTouched, locale, onLocale }: EditorProps) {
  const noTaxonomy = !categories.length || !subcategories.length;
  const localized = (key: "description" | "material" | "fit" | "silhouette" | "pattern" | "seasons" | "occasions" | "styleTags", value: string) => onField(key, { ...form[key], [locale]: value });
  const complete = { fa: Boolean(form.name.fa.trim() && form.description.fa.trim()), en: Boolean(form.name.en.trim() && form.description.en.trim()), ar: Boolean(form.name.ar.trim() && form.description.ar.trim()) };
  return <div className="editor-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <aside
      className="product-editor"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
    >
      <header className="editor-header"><div><p>{editor.mode === "create" ? "پرونده جدید کاتالوگ" : "ویرایش محصول"}</p><h2 id="editor-title">{editor.mode === "create" ? "ساخت محصول" : "تکمیل محصول"}</h2></div><LanguageSwitcher locale={locale} onChange={onLocale} complete={complete} /><button onClick={onClose} aria-label="بستن ویرایشگر"><X size={20} /></button></header>
      {loading ? <div className="editor-loading"><LoaderCircle className="spin" size={23} /><strong>در حال باز کردن محصول…</strong><span>آخرین اطلاعات کاتالوگ دریافت می‌شود.</span></div> : <form onSubmit={onSubmit} noValidate>
        <div className="editor-scroll">
          <section className="product-folio" aria-label="پیش‌نمایش فارسی محصول"><span className="folio-monogram">{form.name.fa.trim().slice(0, 2) || "ن"}</span><div><small>پیش‌نمایش فارسی</small><strong>{form.name.fa || "محصول بدون عنوان"}</strong><p dir="ltr">/{form.slug || "product-slug"}</p></div><span className={`catalog-status catalog-status--${form.status}`}>{({ draft: "پیش‌نویس", active: "فعال", archived: "بایگانی" } as const)[form.status]}</span><footer><b dir="ltr">{form.price ? `${form.currency.toUpperCase()} ${form.price}` : "قیمت ثبت نشده"}</b><i>{dirty ? "تغییرات ذخیره‌نشده" : "اطلاعات به‌روز"}</i></footer></section>

          {saveError && <div className="editor-error" role="alert"><AlertTriangle size={16} /><span>{saveError}</span></div>}
          {noTaxonomy && <div className="reference-warning"><Layers3 size={17} /><p><strong>دسته‌بندی و زیردسته لازم است.</strong><span>پیش از ذخیره محصول، دسته‌بندی و زیردسته را بسازید.</span></p></div>}

          <EditorSection index="۰۱" label="هویت" title="نام‌گذاری محصول">
            <div className="editor-grid">
              <Field label="نام محصول" required error={fieldErrors.name} className="editor-span-2"><input ref={nameInputRef} required dir={locale === "en" ? "ltr" : "rtl"} value={form.name[locale]} onChange={(event) => onName(event.target.value)} placeholder="نام محصول در زبان انتخاب‌شده" aria-invalid={Boolean(fieldErrors.name)} /></Field>
              <Field label="شناسه URL" required error={fieldErrors.slug} className="editor-span-2" hint="فنی و انگلیسی"><div className="slug-input" dir="ltr"><span>/</span><input required value={form.slug} onChange={(event) => { onSlugTouched(); onField("slug", slugify(event.target.value)); }} placeholder="atelier-wool-overcoat" aria-invalid={Boolean(fieldErrors.slug)} /></div></Field>
              <Field label="توضیحات" required error={fieldErrors.description} className="editor-span-2"><textarea required dir={locale === "en" ? "ltr" : "rtl"} value={form.description[locale]} onChange={(event) => localized("description", event.target.value)} placeholder="توضیحات محصول در زبان انتخاب‌شده…" rows={5} aria-invalid={Boolean(fieldErrors.description)} /></Field>
              <Field label="وضعیت کاتالوگ"><select value={form.status} onChange={(event) => onField("status", event.target.value as ProductStatus)}><option value="draft">پیش‌نویس</option><option value="active">فعال</option><option value="archived">بایگانی</option></select></Field>
            </div>
          </EditorSection>

          <EditorSection index="۰۲" label="جایگاه" title="دسته‌بندی محصول">
            <div className="editor-grid">
              <Field label="دسته‌بندی" required error={fieldErrors.categoryId}><select required value={form.categoryId} onChange={(event) => { onField("categoryId", event.target.value); onField("subcategoryId", ""); }} aria-invalid={Boolean(fieldErrors.categoryId)}><option value="">انتخاب دسته‌بندی</option>{categories.map((item) => <option value={item._id} key={item._id}>{fa(item.name)}</option>)}</select></Field>
              <Field label="زیردسته" required error={fieldErrors.subcategoryId}><select required value={form.subcategoryId} onChange={(event) => onField("subcategoryId", event.target.value)} disabled={!form.categoryId} aria-invalid={Boolean(fieldErrors.subcategoryId)}><option value="">{form.categoryId ? "انتخاب زیردسته" : "ابتدا دسته را انتخاب کنید"}</option>{subcategories.map((item) => <option value={item._id} key={item._id}>{fa(item.name)}</option>)}</select></Field>
              <fieldset className="collection-field editor-span-2"><legend>کالکشن‌ها <span>اختیاری</span></legend>{collections.length ? <div>{collections.map((item) => <label key={item._id}><input type="checkbox" checked={form.collectionIds.includes(item._id)} onChange={(event) => onField("collectionIds", event.target.checked ? [...form.collectionIds, item._id] : form.collectionIds.filter((id) => id !== item._id))} /><span><Check size={12} />{fa(item.name)}</span></label>)}</div> : <p>هنوز کالکشنی ثبت نشده است.</p>}</fieldset>
            </div>
          </EditorSection>

          <EditorSection index="۰۳" label="قیمت‌گذاری" title="تعیین ارزش">
            <div className="editor-grid editor-grid--pricing">
              <Field label="قیمت نمایش" required error={fieldErrors.price} hint="واحد اصلی"><input dir="ltr" required type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={(event) => onField("price", event.target.value)} placeholder="0.00" aria-invalid={Boolean(fieldErrors.price)} /></Field>
              <Field label="ارز" required error={fieldErrors.currency} hint="کد ISO"><input dir="ltr" required value={form.currency} maxLength={3} onChange={(event) => onField("currency", event.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} placeholder="USD" aria-invalid={Boolean(fieldErrors.currency)} /></Field>
            </div>
          </EditorSection>

          <EditorSection index="۰۴" label="داستان محصول" title="تعریف شخصیت محصول">
            <div className="editor-grid">
              <Field label="جنس‌ها" className="editor-span-2" hint="با ویرگول جدا کنید"><input dir={locale === "en" ? "ltr" : "rtl"} value={form.material[locale]} onChange={(event) => localized("material", event.target.value)} /></Field>
              <Field label="فرم"><input dir={locale === "en" ? "ltr" : "rtl"} value={form.fit[locale]} onChange={(event) => localized("fit", event.target.value)} /></Field>
              <Field label="سیلوئت"><input dir={locale === "en" ? "ltr" : "rtl"} value={form.silhouette[locale]} onChange={(event) => localized("silhouette", event.target.value)} /></Field>
              <Field label="طرح"><input dir={locale === "en" ? "ltr" : "rtl"} value={form.pattern[locale]} onChange={(event) => localized("pattern", event.target.value)} /></Field>
              <Field label="فصل‌ها" hint="با ویرگول جدا کنید"><input dir={locale === "en" ? "ltr" : "rtl"} value={form.seasons[locale]} onChange={(event) => localized("seasons", event.target.value)} /></Field>
              <Field label="موقعیت‌ها" className="editor-span-2" hint="با ویرگول جدا کنید"><input dir={locale === "en" ? "ltr" : "rtl"} value={form.occasions[locale]} onChange={(event) => localized("occasions", event.target.value)} /></Field>
              <Field label="برچسب‌های سبک" className="editor-span-2" hint="با ویرگول جدا کنید"><input dir={locale === "en" ? "ltr" : "rtl"} value={form.styleTags[locale]} onChange={(event) => localized("styleTags", event.target.value)} /></Field>
            </div>
          </EditorSection>

          <div className="next-phase-note"><FileText size={17} /><p><strong>تصاویر و تنوع‌ها در بخش‌های بعدی مدیریت می‌شوند.</strong><span>این پرونده اطلاعات اصلی محصول را در سه زبان ذخیره می‌کند.</span></p></div>
        </div>
        <footer className="editor-actions"><span>{dirty ? "تغییرات ذخیره‌نشده" : "بدون تغییر"}</span><button type="button" onClick={onClose}>انصراف</button><button className="editor-save" type="submit" disabled={saving || noTaxonomy || !dirty}>{saving ? <><LoaderCircle className="spin" size={15} />در حال ذخیره…</> : <><Check size={15} />{editor.mode === "create" ? "افزودن محصول" : "ذخیره تغییرات"}</>}</button></footer>
      </form>}
    </aside>
  </div>;
}

function EditorSection({ index, label, title, children }: { index: string; label: string; title: string; children: React.ReactNode }) {
  return <section className="editor-section"><header><span>{index}</span><div><p>{label}</p><h3>{title}</h3></div></header>{children}</section>;
}

function Field({ label, required, error, hint, className = "", children }: { label: string; required?: boolean; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
  const errorId = error ? `error-${label.toLowerCase().replace(/\s/g, "-")}` : undefined;
  return <label className={`editor-field ${className}`}><span>{label}{required && <b>*</b>}{hint && <small>{hint}</small>}</span>{children}{error && <em id={errorId}>{error}</em>}</label>;
}
