"use client";

/* eslint-disable @next/next/no-img-element */
import { CatalogSectionNav } from "@/components/catalog-section-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { emptyLocalizedText, fa, type Locale, type LocalizedText, trimLocalized } from "@/lib/localization";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Edit3, ImageOff, LayoutTemplate, LoaderCircle, Plus, RefreshCw, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Banner = { imageId: string; eyebrow?: LocalizedText; heading: LocalizedText; body?: LocalizedText; ctaLabel?: LocalizedText; ctaHref?: string };
type Description = { heading?: LocalizedText; body: LocalizedText };
type PageContent = { primaryBanner: Banner; primaryDescription: Description; secondaryBanner: Banner; secondaryDescription: Description; seoTitle?: LocalizedText; seoDescription?: LocalizedText };
type Taxonomy = { _id: string; name: LocalizedText; slug: string; description?: LocalizedText | null; thumbnailImageId?: string | null; categoryId?: string; pageContent: PageContent; isActive: boolean; sortOrder: number; updatedAt?: string };
type ImageAsset = { _id: string; url: string; alt: LocalizedText; kind: string; isActive: boolean };
type Category = Pick<Taxonomy, "_id" | "name" | "slug">;
type Pagination = { page: number; limit: number; total: number; pages: number };
type List<T> = { items: T[]; pagination: Pagination };
type Form = Omit<Taxonomy, "_id" | "updatedAt">;

const emptyBanner = (): Banner => ({ imageId: "", eyebrow: emptyLocalizedText(), heading: emptyLocalizedText(), body: emptyLocalizedText(), ctaLabel: emptyLocalizedText(), ctaHref: "" });
const emptyForm = (): Form => ({ name: emptyLocalizedText(), slug: "", description: emptyLocalizedText(), thumbnailImageId: "", categoryId: "", isActive: true, sortOrder: 0, pageContent: { primaryBanner: emptyBanner(), primaryDescription: { heading: emptyLocalizedText(), body: emptyLocalizedText() }, secondaryBanner: emptyBanner(), secondaryDescription: { heading: emptyLocalizedText(), body: emptyLocalizedText() }, seoTitle: emptyLocalizedText(), seoDescription: emptyLocalizedText() } });
const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);
async function json<T>(response: Response): Promise<T> { const body = await response.json().catch(() => ({})) as { error?: string; message?: string }; if (!response.ok) throw Object.assign(new Error(body.error || body.message || "The request could not be completed."), { status: response.status }); return body as T; }

export function PageComposer({ canRead, canWrite }: { canRead: boolean; canWrite: boolean }) {
  const router = useRouter();
  const [resource, setResource] = useState<"categories" | "subcategories">("categories");
  const [items, setItems] = useState<Taxonomy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, pages: 1 });
  const [page, setPage] = useState(1), [draftSearch, setDraftSearch] = useState(""), [search, setSearch] = useState(""), [active, setActive] = useState(""), [parent, setParent] = useState("");
  const [loading, setLoading] = useState(canRead), [error, setError] = useState(""), [refresh, setRefresh] = useState(0);
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; id?: string } | null>(null);
  const [notice, setNotice] = useState("");
  const auth = useCallback((status: number) => { if (status === 401) router.replace("/login?reason=session"); }, [router]);

  useEffect(() => { const timer = setTimeout(() => { setSearch(draftSearch.trim()); setPage(1); }, 320); return () => clearTimeout(timer); }, [draftSearch]);
  useEffect(() => {
    if (!canRead) return; const controller = new AbortController();
    Promise.all([
      fetch("/api/catalog/categories?limit=100", { signal: controller.signal }).then(json<List<Category>>),
      fetch("/api/catalog/images?limit=100&isActive=true", { signal: controller.signal }).then(json<List<ImageAsset>>),
    ]).then(([cats, assets]) => { setCategories(cats.items); setImages(assets.items); }).catch((cause) => { if (cause.name !== "AbortError") auth(cause.status || 0); });
    return () => controller.abort();
  }, [auth, canRead, refresh]);
  useEffect(() => {
    if (!canRead) return; const controller = new AbortController();
    const load = async () => {
      setLoading(true); setError("");
      const params = new URLSearchParams({ page: String(page), limit: "15" }); if (search) params.set("search", search); if (active) params.set("isActive", active); if (resource === "subcategories" && parent) params.set("categoryId", parent);
      try { const data = await fetch(`/api/catalog/${resource}?${params}`, { signal: controller.signal }).then(json<List<Taxonomy>>); setItems(data.items); setPagination(data.pagination); }
      catch (cause) { const problem = cause as Error & { status?: number }; if (problem.name !== "AbortError") { auth(problem.status || 0); setError(problem.message); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [active, auth, canRead, page, parent, refresh, resource, search]);

  const imageMap = useMemo(() => new Map(images.map((image) => [image._id, image])), [images]);
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category._id, fa(category.name)])), [categories]);
  const filtered = Boolean(search || active || parent);
  const switchResource = (value: "categories" | "subcategories") => { setResource(value); setPage(1); setParent(""); setDraftSearch(""); setSearch(""); };
  const clear = () => { setDraftSearch(""); setSearch(""); setActive(""); setParent(""); setPage(1); };
  const saved = (message: string) => { setEditor(null); setRefresh((n) => n + 1); setNotice(message); setTimeout(() => setNotice(""), 2600); };

  return <div className="catalog-workspace studio-workspace composer-workspace">
    {notice && <div className="toast" role="status"><Check size={14} />{notice}</div>}
    <CatalogSectionNav />
    <header className="studio-masthead composer-masthead"><div><p>آتلیه کمپین <i>/</i> معماری صفحه</p><h1>صفحه‌ساز.</h1><small>صفحه دسته‌بندی را با تصویر و روایت سه‌زبانه بسازید.</small></div><div className="studio-count"><span>صفحه‌های ثبت‌شده</span><strong>{String(pagination.total).padStart(2, "0")}</strong><small>{resource === "categories" ? "دسته‌ها" : "زیردسته‌ها"}</small></div>{canWrite && <button className="studio-primary" onClick={() => setEditor({ mode: "create" })}><Plus size={16} /><span>ساخت {resource === "categories" ? "دسته" : "زیردسته"}</span></button>}</header>
    {!canRead ? <Permission /> : <>
      <div className="register-switch" role="tablist" aria-label="نوع صفحه"><button role="tab" aria-selected={resource === "categories"} className={resource === "categories" ? "active" : ""} onClick={() => switchResource("categories")}><span>۰۱</span>دسته‌بندی‌ها</button><button role="tab" aria-selected={resource === "subcategories"} className={resource === "subcategories" ? "active" : ""} onClick={() => switchResource("subcategories")}><span>۰۲</span>زیردسته‌ها</button></div>
      <section className="studio-controls composer-controls">
        <label className="studio-search"><Search size={16} /><input aria-label="جست‌وجوی صفحه" value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} placeholder="جست‌وجوی نام یا شناسه" /></label>
        <label><span className="sr-only">وضعیت</span><select value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}><option value="">فعال و غیرفعال</option><option value="true">فعال</option><option value="false">غیرفعال</option></select></label>
        {resource === "subcategories" && <label><span className="sr-only">دسته مادر</span><select value={parent} onChange={(e) => { setParent(e.target.value); setPage(1); }}><option value="">همه دسته‌های مادر</option>{categories.map((category) => <option value={category._id} key={category._id}>{fa(category.name)}</option>)}</select></label>}
        {filtered && <button className="studio-text-button" onClick={clear}><X size={14} />پاک کردن</button>}<button className="catalog-refresh" onClick={() => setRefresh((n) => n + 1)} disabled={loading} aria-label="تازه‌سازی صفحه‌ها"><RefreshCw className={loading ? "spin" : ""} size={16} /></button>
      </section>
      <section className="page-register" aria-live="polite" aria-busy={loading}>
        <header><span>{resource} / {filtered ? "filtered edition" : "full register"}</span><b>{pagination.total} pages</b></header>
        {loading ? <ComposerSkeleton /> : error ? <StudioState title="فهرست صفحه‌ها در دسترس نیست." detail={error} action="تلاش دوباره" onAction={() => setRefresh((n) => n + 1)} /> : items.length === 0 ? <StudioState title={filtered ? "صفحه‌ای با این فیلتر پیدا نشد." : "هنوز صفحه‌ای ساخته نشده است."} detail={filtered ? "فیلترها را پاک کنید یا دسته دیگری را انتخاب کنید." : images.length < 2 ? "برای ساخت صفحه دست‌کم دو تصویر بنر لازم است." : "اولین صفحه کمپین را بسازید."} action={filtered ? "پاک کردن فیلترها" : canWrite && images.length >= 2 ? "ساخت اولین صفحه" : undefined} onAction={filtered ? clear : () => setEditor({ mode: "create" })} /> : <div className="page-register__list">{items.map((item, index) => <article className="page-row" key={item._id}>
          <span className="page-row__number">{String((page - 1) * 15 + index + 1).padStart(2, "0")}</span>
          <div className="page-row__identity"><small>{resource === "subcategories" ? categoryMap.get(item.categoryId || "") || "دسته مادر نامشخص" : "دسته اصلی"}</small><strong>{fa(item.name)}</strong><span dir="ltr">/{item.slug}</span></div>
          <div className="page-row__story"><MiniImage asset={imageMap.get(item.pageContent?.primaryBanner?.imageId)} number="I" /><i /><MiniImage asset={imageMap.get(item.pageContent?.secondaryBanner?.imageId)} number="II" /></div>
          <div className="page-row__meta"><span className={item.isActive ? "catalog-status catalog-status--active" : "catalog-status catalog-status--archived"}>{item.isActive ? "فعال" : "غیرفعال"}</span><small>ترتیب {item.sortOrder}</small></div>
          <div className="seo-readiness"><span className={item.pageContent?.seoTitle?.fa && item.pageContent?.seoDescription?.fa ? "ready" : ""} /><small>{item.pageContent?.seoTitle?.fa && item.pageContent?.seoDescription?.fa ? "سئو کامل" : "سئو ناقص"}</small></div>
          {canWrite && <button className="edit-product" onClick={() => setEditor({ mode: "edit", id: item._id })}><Edit3 size={14} />ویرایش</button>}
        </article>)}</div>}
        {!loading && !error && items.length > 0 && <footer className="studio-pagination"><span>صفحه {pagination.page} از {Math.max(1, pagination.pages)}</span><div><button disabled={page <= 1} onClick={() => setPage((n) => n - 1)}><ArrowRight size={14} />قبلی</button><button disabled={page >= pagination.pages} onClick={() => setPage((n) => n + 1)}>بعدی<ArrowLeft size={14} /></button></div></footer>}
      </section>
    </>}
    {editor && <ComposerEditor descriptor={editor} resource={resource} categories={categories} images={images} imageMap={imageMap} canWrite={canWrite} auth={auth} onClose={() => setEditor(null)} onSaved={saved} />}
  </div>;
}

function ComposerEditor({ descriptor, resource, categories, images, imageMap, canWrite, auth, onClose, onSaved }: { descriptor: { mode: "create" | "edit"; id?: string }; resource: "categories" | "subcategories"; categories: Category[]; images: ImageAsset[]; imageMap: Map<string, ImageAsset>; canWrite: boolean; auth: (s: number) => void; onClose: () => void; onSaved: (m: string) => void }) {
  const [form, setForm] = useState<Form>(emptyForm());
  const [initial, setInitial] = useState(JSON.stringify(emptyForm()));
  const [loading, setLoading] = useState(descriptor.mode === "edit"), [saving, setSaving] = useState(false), [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageSearch, setImageSearch] = useState("");
  const [locale, setLocale] = useState<Locale>("fa");
  const panelRef = useRef<HTMLElement>(null), nameRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(form) !== initial;
  const close = useCallback(() => { if (!dirty || window.confirm("تغییرات ذخیره‌نشده صفحه حذف شود؟")) onClose(); }, [dirty, onClose]);
  useEffect(() => { document.body.classList.add("editor-open"); const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); }; addEventListener("keydown", key); setTimeout(() => nameRef.current?.focus(), 80); return () => { document.body.classList.remove("editor-open"); removeEventListener("keydown", key); }; }, [close]);
  useEffect(() => { if (!descriptor.id) return; fetch(`/api/catalog/${resource}/${descriptor.id}`).then(json<Taxonomy>).then((item) => { const next: Form = { ...emptyForm(), ...item, pageContent: item.pageContent }; setForm(next); setInitial(JSON.stringify(next)); setSlugTouched(true); }).catch((cause) => { auth(cause.status || 0); setError(cause.message); }).finally(() => setLoading(false)); }, [auth, descriptor.id, resource]);
  const availableImages = useMemo(() => images.filter((image) => [resource === "categories" ? "category_banner" : "subcategory_banner", "editorial", "lookbook"].includes(image.kind) && (!imageSearch || `${fa(image.alt)} ${image.url}`.toLowerCase().includes(imageSearch.toLowerCase()))), [imageSearch, images, resource]);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const banner = (key: "primaryBanner" | "secondaryBanner", patch: Partial<Banner>) => setForm((f) => ({ ...f, pageContent: { ...f.pageContent, [key]: { ...f.pageContent[key], ...patch } } }));
  const description = (key: "primaryDescription" | "secondaryDescription", patch: Partial<Description>) => setForm((f) => ({ ...f, pageContent: { ...f.pageContent, [key]: { ...f.pageContent[key], ...patch } } }));
  const bannerText = (key: "primaryBanner" | "secondaryBanner", field: "eyebrow" | "heading" | "body" | "ctaLabel", value: string) => banner(key, { [field]: { ...(form.pageContent[key][field] || emptyLocalizedText()), [locale]: value } });
  const descriptionText = (key: "primaryDescription" | "secondaryDescription", field: "heading" | "body", value: string) => description(key, { [field]: { ...(form.pageContent[key][field] || emptyLocalizedText()), [locale]: value } });
  const seo = (key: "seoTitle" | "seoDescription", value: string) => setForm((f) => ({ ...f, pageContent: { ...f.pageContent, [key]: { ...(f.pageContent[key] || emptyLocalizedText()), [locale]: value } } }));
  const validate = () => { const next: Record<string, string> = {}; (["fa", "en", "ar"] as Locale[]).forEach((lang) => { if (!form.name[lang].trim()) next.name = "نام صفحه در هر سه زبان لازم است."; (["primaryBanner", "secondaryBanner"] as const).forEach((key) => { if (!form.pageContent[key].heading[lang].trim()) next[`${key}.heading`] = "عنوان بنر در هر سه زبان لازم است."; }); (["primaryDescription", "secondaryDescription"] as const).forEach((key) => { if (!form.pageContent[key].body[lang].trim()) next[`${key}.body`] = "متن توضیح در هر سه زبان لازم است."; }); }); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) next.slug = "شناسه باید انگلیسی و خط‌تیره‌دار باشد."; if (resource === "subcategories" && !form.categoryId) next.categoryId = "دسته مادر را انتخاب کنید."; (["primaryBanner", "secondaryBanner"] as const).forEach((key) => { if (!form.pageContent[key].imageId) next[`${key}.imageId`] = "تصویر واقعی بنر را انتخاب کنید."; }); setErrors(next); return !Object.keys(next).length; };
  const save = async (event: FormEvent) => { event.preventDefault(); if (!canWrite || saving || !validate()) return; setSaving(true); setError(""); const payload = { name: trimLocalized(form.name), slug: form.slug, description: form.description ? trimLocalized(form.description) : null, thumbnailImageId: form.thumbnailImageId || null, isActive: form.isActive, sortOrder: Number(form.sortOrder), ...(resource === "subcategories" ? { categoryId: form.categoryId } : {}), pageContent: { primaryBanner: cleanBanner(form.pageContent.primaryBanner), primaryDescription: cleanDescription(form.pageContent.primaryDescription), secondaryBanner: cleanBanner(form.pageContent.secondaryBanner), secondaryDescription: cleanDescription(form.pageContent.secondaryDescription), seoTitle: form.pageContent.seoTitle ? trimLocalized(form.pageContent.seoTitle) : undefined, seoDescription: form.pageContent.seoDescription ? trimLocalized(form.pageContent.seoDescription) : undefined } }; try { await fetch(descriptor.id ? `/api/catalog/${resource}/${descriptor.id}` : `/api/catalog/${resource}`, { method: descriptor.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).then(json); onSaved(descriptor.id ? "صفحه ویرایش شد." : "صفحه به فهرست افزوده شد."); } catch (cause) { const problem = cause as Error & { status?: number }; auth(problem.status || 0); setError(problem.status === 403 ? "اجازه تغییر محتوای صفحه را ندارید." : problem.message); } finally { setSaving(false); } };

  const complete = { fa: Boolean(form.name.fa.trim() && form.pageContent.primaryBanner.heading.fa.trim() && form.pageContent.secondaryBanner.heading.fa.trim()), en: Boolean(form.name.en.trim() && form.pageContent.primaryBanner.heading.en.trim() && form.pageContent.secondaryBanner.heading.en.trim()), ar: Boolean(form.name.ar.trim() && form.pageContent.primaryBanner.heading.ar.trim() && form.pageContent.secondaryBanner.heading.ar.trim()) };
  return <div className="editor-layer" onMouseDown={(e) => { if (e.currentTarget === e.target) close(); }}><aside ref={panelRef} className="composer-editor" role="dialog" aria-modal="true" aria-labelledby="composer-title" onKeyDown={(e) => trapFocus(e, panelRef.current)}><header className="editor-header"><div><p>صفحه‌ساز / {resource === "categories" ? "دسته" : "زیردسته"}</p><h2 id="composer-title">{descriptor.mode === "create" ? "ساخت صفحه جدید" : "ویرایش صفحه کمپین"}</h2></div><LanguageSwitcher locale={locale} onChange={setLocale} complete={complete} /><button onClick={close} aria-label="بستن صفحه‌ساز"><X size={20} /></button></header>
    {loading ? <div className="editor-loading"><LoaderCircle className="spin" /><strong>در حال باز کردن آخرین نسخه…</strong></div> : <form onSubmit={save} noValidate><div className="composer-editor__body">
      {error && <div className="editor-error" role="alert"><AlertTriangle size={16} />{error}</div>}
      {images.length < 2 && <div className="dependency-warning"><ImageOff size={18} /><div><strong>دو تصویر بنر لازم است.</strong><span>پیش از ذخیره صفحه، کتابخانه تصاویر را تکمیل کنید.</span></div><Link href="/catalog/images">باز کردن تصاویر</Link></div>}
      <section className="composer-identity"><EditorHeading index="۰۱" eyebrow="پایه" title="هویت صفحه" /><div className="editor-grid">
        <Field label="نام صفحه" error={errors.name} wide><input ref={nameRef} dir={locale === "en" ? "ltr" : "rtl"} value={form.name[locale]} onChange={(e) => { const name = e.target.value; setForm((f) => ({ ...f, name: { ...f.name, [locale]: name }, slug: slugTouched || locale !== "en" ? f.slug : slugify(name) })); }} /></Field>
        <Field label="شناسه URL" error={errors.slug}><input dir="ltr" value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></Field><Field label="ترتیب نمایش"><input type="number" step="1" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} /></Field>
        {resource === "subcategories" && <Field label="دسته مادر" error={errors.categoryId} wide><select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}><option value="">انتخاب دسته مادر</option>{categories.map((category) => <option value={category._id} key={category._id}>{fa(category.name)}</option>)}</select></Field>}
        <Field label="توضیح دسته" hint="اختیاری" wide><textarea dir={locale === "en" ? "ltr" : "rtl"} rows={3} value={form.description?.[locale] || ""} onChange={(e) => set("description", { ...(form.description || emptyLocalizedText()), [locale]: e.target.value })} /></Field><Field label="نمایش"><select value={String(form.isActive)} onChange={(e) => set("isActive", e.target.value === "true")}><option value="true">فعال</option><option value="false">غیرفعال</option></select></Field><Field label="تصویر بندانگشتی" hint="اختیاری"><select value={form.thumbnailImageId || ""} onChange={(e) => set("thumbnailImageId", e.target.value)}><option value="">بدون تصویر</option>{images.map((image) => <option key={image._id} value={image._id}>{fa(image.alt)}</option>)}</select></Field>
      </div></section>

      <div className="storyboard-title"><span>۰۲</span><div><p>ترتیب کمپین</p><h3>روایت دو بخشی را بسازید</h3></div><label><Search size={13} /><input value={imageSearch} onChange={(e) => setImageSearch(e.target.value)} placeholder="فیلتر تصاویر بنر" /></label></div>
      <section className="storyboard">{(["primary", "secondary"] as const).map((position, index) => { const bKey = `${position}Banner` as "primaryBanner" | "secondaryBanner", dKey = `${position}Description` as "primaryDescription" | "secondaryDescription", current = form.pageContent[bKey]; return <article className="story-panel" key={position}>
        <header><span>{index === 0 ? "I" : "II"}</span><div><p>{index === 0 ? "روایت اول" : "روایت دوم"}</p><h4>{index === 0 ? "آغاز کمپین" : "تکمیل روایت"}</h4></div></header>
        <div className="story-panel__preview">{imageMap.get(current.imageId) ? <img src={imageMap.get(current.imageId)!.url} alt="" /> : <div><ImageOff size={20} /><span>بنر انتخاب نشده</span></div>}<section><small>{current.eyebrow?.[locale] || "پیش‌عنوان"}</small><strong>{current.heading[locale] || "عنوان بنر"}</strong><p>{current.body?.[locale] || "متن همراه بنر در اینجا دیده می‌شود."}</p>{current.ctaLabel?.[locale] && <b>{current.ctaLabel[locale]} ←</b>}</section></div>
        <div className="story-panel__fields"><Field label="تصویر بنر" error={errors[`${bKey}.imageId`]} wide><select value={current.imageId} onChange={(e) => banner(bKey, { imageId: e.target.value })}><option value="">انتخاب تصویر</option>{availableImages.map((image) => <option value={image._id} key={image._id}>{fa(image.alt)} — {image.kind.replaceAll("_", " ")}</option>)}</select></Field><Field label="پیش‌عنوان" hint="اختیاری"><input dir={locale === "en" ? "ltr" : "rtl"} maxLength={120} value={current.eyebrow?.[locale] || ""} onChange={(e) => bannerText(bKey, "eyebrow", e.target.value)} /></Field><Field label="عنوان" error={errors[`${bKey}.heading`]}><input dir={locale === "en" ? "ltr" : "rtl"} maxLength={200} value={current.heading[locale]} onChange={(e) => bannerText(bKey, "heading", e.target.value)} /></Field><Field label="متن بنر" hint="اختیاری" wide><textarea dir={locale === "en" ? "ltr" : "rtl"} rows={3} maxLength={1200} value={current.body?.[locale] || ""} onChange={(e) => bannerText(bKey, "body", e.target.value)} /></Field><Field label="متن دکمه" hint="اختیاری"><input dir={locale === "en" ? "ltr" : "rtl"} maxLength={80} value={current.ctaLabel?.[locale] || ""} onChange={(e) => bannerText(bKey, "ctaLabel", e.target.value)} /></Field><Field label="لینک دکمه" hint="فنی"><input dir="ltr" maxLength={500} value={current.ctaHref || ""} onChange={(e) => banner(bKey, { ctaHref: e.target.value })} placeholder="/collections/…" /></Field>
          <div className="description-block editor-span-2"><span>توضیح {index + 1}</span><Field label="عنوان" hint="اختیاری" wide><input dir={locale === "en" ? "ltr" : "rtl"} maxLength={240} value={form.pageContent[dKey].heading?.[locale] || ""} onChange={(e) => descriptionText(dKey, "heading", e.target.value)} /></Field><Field label="متن" error={errors[`${dKey}.body`]} wide><textarea dir={locale === "en" ? "ltr" : "rtl"} rows={5} maxLength={5000} value={form.pageContent[dKey].body[locale]} onChange={(e) => descriptionText(dKey, "body", e.target.value)} /></Field></div>
        </div>
      </article>; })}</section>
      <section className="seo-section"><EditorHeading index="۰۳" eyebrow="یافتن" title="نمایش در جست‌وجو" /><div className="seo-layout"><div className="editor-grid"><Field label="عنوان سئو" hint={`${form.pageContent.seoTitle?.[locale]?.length || 0}/70`} wide><input dir={locale === "en" ? "ltr" : "rtl"} maxLength={70} value={form.pageContent.seoTitle?.[locale] || ""} onChange={(e) => seo("seoTitle", e.target.value)} /></Field><Field label="توضیح سئو" hint={`${form.pageContent.seoDescription?.[locale]?.length || 0}/170`} wide><textarea dir={locale === "en" ? "ltr" : "rtl"} rows={4} maxLength={170} value={form.pageContent.seoDescription?.[locale] || ""} onChange={(e) => seo("seoDescription", e.target.value)} /></Field></div><aside className="search-preview"><span>پیش‌نمایش جست‌وجو</span><strong>{form.pageContent.seoTitle?.[locale] || form.name[locale] || "عنوان صفحه"}</strong><small dir="ltr">najibzadeh.com / {form.slug || "page-slug"}</small><p>{form.pageContent.seoDescription?.[locale] || "خلاصه‌ای برای بازدیدکنندگان جست‌وجو بنویسید."}</p></aside></div></section>
    </div><footer className="editor-actions"><span>{dirty ? "تغییرات ذخیره‌نشده" : "صفحه به‌روز است"}</span><button type="button" onClick={close}>انصراف</button><button className="editor-save" disabled={saving || !canWrite || images.length < 2}>{saving ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}{saving ? "در حال ذخیره…" : "ذخیره کامل صفحه"}</button></footer></form>}
  </aside></div>;
}

function cleanBanner(b: Banner): Banner { return { imageId: b.imageId, heading: trimLocalized(b.heading), eyebrow: b.eyebrow ? trimLocalized(b.eyebrow) : undefined, body: b.body ? trimLocalized(b.body) : undefined, ctaLabel: b.ctaLabel ? trimLocalized(b.ctaLabel) : undefined, ctaHref: b.ctaHref?.trim() || undefined }; }
function cleanDescription(d: Description): Description { return { body: trimLocalized(d.body), heading: d.heading ? trimLocalized(d.heading) : undefined }; }
function MiniImage({ asset, number }: { asset?: ImageAsset; number: string }) { const [broken, setBroken] = useState(false); return <div>{asset && !broken ? <img src={asset.url} alt="" onError={() => setBroken(true)} /> : <ImageOff size={15} />}<span>{number}</span></div>; }
function Field({ label, hint, error, wide, children }: { label: string; hint?: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <label className={`editor-field ${wide ? "editor-span-2" : ""}`}><span>{label}{hint && <small>{hint}</small>}</span>{children}{error && <em>{error}</em>}</label>; }
function EditorHeading({ index, eyebrow, title }: { index: string; eyebrow: string; title: string }) { return <header className="editor-subheading"><span>{index}</span><div><p>{eyebrow}</p><h3>{title}</h3></div></header>; }
function trapFocus(event: React.KeyboardEvent, panel: HTMLElement | null) { if (event.key !== "Tab" || !panel) return; const nodes = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')); if (!nodes.length) return; if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1)?.focus(); } else if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus(); } }
function Permission() { return <section className="catalog-state catalog-state--permission"><AlertTriangle size={22} /><p>دسترسی کاتالوگ</p><h2>صفحه‌ساز در سطح دسترسی شما نیست.</h2><span>از مدیر سیستم مجوز مشاهده کاتالوگ را بخواهید.</span></section>; }
function StudioState({ title, detail, action, onAction }: { title: string; detail: string; action?: string | false; onAction: () => void }) { return <div className="catalog-state"><LayoutTemplate size={22} /><p>فهرست صفحه‌ها</p><h2>{title}</h2><span>{detail}</span>{action && <button onClick={onAction}>{action}</button>}</div>; }
function ComposerSkeleton() { return <div className="composer-skeleton">{Array.from({ length: 5 }).map((_, i) => <i key={i} />)}</div>; }
