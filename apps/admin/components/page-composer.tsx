"use client";

/* eslint-disable @next/next/no-img-element */
import { CatalogSectionNav } from "@/components/catalog-section-nav";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Edit3, ImageOff, LayoutTemplate, LoaderCircle, Plus, RefreshCw, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Banner = { imageId: string; eyebrow?: string; heading: string; body?: string; ctaLabel?: string; ctaHref?: string };
type Description = { heading?: string; body: string };
type PageContent = { primaryBanner: Banner; primaryDescription: Description; secondaryBanner: Banner; secondaryDescription: Description; seoTitle?: string; seoDescription?: string };
type Taxonomy = { _id: string; name: string; slug: string; description?: string | null; thumbnailImageId?: string | null; categoryId?: string; pageContent: PageContent; isActive: boolean; sortOrder: number; updatedAt?: string };
type ImageAsset = { _id: string; url: string; alt: string; kind: string; isActive: boolean };
type Category = Pick<Taxonomy, "_id" | "name" | "slug">;
type Pagination = { page: number; limit: number; total: number; pages: number };
type List<T> = { items: T[]; pagination: Pagination };
type Form = Omit<Taxonomy, "_id" | "updatedAt">;

const emptyBanner = (): Banner => ({ imageId: "", eyebrow: "", heading: "", body: "", ctaLabel: "", ctaHref: "" });
const emptyForm = (): Form => ({ name: "", slug: "", description: "", thumbnailImageId: "", categoryId: "", isActive: true, sortOrder: 0, pageContent: { primaryBanner: emptyBanner(), primaryDescription: { heading: "", body: "" }, secondaryBanner: emptyBanner(), secondaryDescription: { heading: "", body: "" }, seoTitle: "", seoDescription: "" } });
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
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category._id, category.name])), [categories]);
  const filtered = Boolean(search || active || parent);
  const switchResource = (value: "categories" | "subcategories") => { setResource(value); setPage(1); setParent(""); setDraftSearch(""); setSearch(""); };
  const clear = () => { setDraftSearch(""); setSearch(""); setActive(""); setParent(""); setPage(1); };
  const saved = (message: string) => { setEditor(null); setRefresh((n) => n + 1); setNotice(message); setTimeout(() => setNotice(""), 2600); };

  return <div className="catalog-workspace studio-workspace composer-workspace">
    {notice && <div className="toast" role="status"><Check size={14} />{notice}</div>}
    <CatalogSectionNav />
    <header className="studio-masthead composer-masthead"><div><p>Campaign atelier <i>/</i> Page architecture</p><h1>Page composer.</h1><small>Arrange a category as a deliberate sequence of image and copy.</small></div><div className="studio-count"><span>Pages in register</span><strong>{String(pagination.total).padStart(2, "0")}</strong><small>{resource}</small></div>{canWrite && <button className="studio-primary" onClick={() => setEditor({ mode: "create" })}><Plus size={16} /><span>Create {resource === "categories" ? "category" : "subcategory"}</span></button>}</header>
    {!canRead ? <Permission /> : <>
      <div className="register-switch" role="tablist" aria-label="Page type"><button role="tab" aria-selected={resource === "categories"} className={resource === "categories" ? "active" : ""} onClick={() => switchResource("categories")}><span>01</span>Categories</button><button role="tab" aria-selected={resource === "subcategories"} className={resource === "subcategories" ? "active" : ""} onClick={() => switchResource("subcategories")}><span>02</span>Subcategories</button></div>
      <section className="studio-controls composer-controls">
        <label className="studio-search"><Search size={16} /><input aria-label={`Search ${resource}`} value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} placeholder="Search name or slug" /></label>
        <label><span className="sr-only">Activity</span><select value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}><option value="">Active & inactive</option><option value="true">Active</option><option value="false">Inactive</option></select></label>
        {resource === "subcategories" && <label><span className="sr-only">Parent category</span><select value={parent} onChange={(e) => { setParent(e.target.value); setPage(1); }}><option value="">Every parent category</option>{categories.map((category) => <option value={category._id} key={category._id}>{category.name}</option>)}</select></label>}
        {filtered && <button className="studio-text-button" onClick={clear}><X size={14} />Clear</button>}<button className="catalog-refresh" onClick={() => setRefresh((n) => n + 1)} disabled={loading} aria-label="Refresh pages"><RefreshCw className={loading ? "spin" : ""} size={16} /></button>
      </section>
      <section className="page-register" aria-live="polite" aria-busy={loading}>
        <header><span>{resource} / {filtered ? "filtered edition" : "full register"}</span><b>{pagination.total} pages</b></header>
        {loading ? <ComposerSkeleton /> : error ? <StudioState title="The page register is unavailable." detail={error} action="Try again" onAction={() => setRefresh((n) => n + 1)} /> : items.length === 0 ? <StudioState title={filtered ? "No pages match this edit." : `No ${resource} composed yet.`} detail={filtered ? "Clear the filters or choose another parent." : images.length < 2 ? "Two banner images are required before a page can be composed." : "Begin with a real campaign page and its two-story sequence."} action={filtered ? "Clear filters" : canWrite && images.length >= 2 ? "Compose first page" : undefined} onAction={filtered ? clear : () => setEditor({ mode: "create" })} /> : <div className="page-register__list">{items.map((item, index) => <article className="page-row" key={item._id}>
          <span className="page-row__number">{String((page - 1) * 15 + index + 1).padStart(2, "0")}</span>
          <div className="page-row__identity"><small>{resource === "subcategories" ? categoryMap.get(item.categoryId || "") || "Parent unavailable" : "Top-level category"}</small><strong>{item.name}</strong><span>/{item.slug}</span></div>
          <div className="page-row__story"><MiniImage asset={imageMap.get(item.pageContent?.primaryBanner?.imageId)} number="I" /><i /><MiniImage asset={imageMap.get(item.pageContent?.secondaryBanner?.imageId)} number="II" /></div>
          <div className="page-row__meta"><span className={item.isActive ? "catalog-status catalog-status--active" : "catalog-status catalog-status--archived"}>{item.isActive ? "Active" : "Inactive"}</span><small>Order {item.sortOrder}</small></div>
          <div className="seo-readiness"><span className={item.pageContent?.seoTitle && item.pageContent?.seoDescription ? "ready" : ""} /><small>{item.pageContent?.seoTitle && item.pageContent?.seoDescription ? "SEO ready" : "SEO incomplete"}</small></div>
          {canWrite && <button className="edit-product" onClick={() => setEditor({ mode: "edit", id: item._id })}><Edit3 size={14} />Edit</button>}
        </article>)}</div>}
        {!loading && !error && items.length > 0 && <footer className="studio-pagination"><span>Register {pagination.page} of {Math.max(1, pagination.pages)}</span><div><button disabled={page <= 1} onClick={() => setPage((n) => n - 1)}><ArrowLeft size={14} />Previous</button><button disabled={page >= pagination.pages} onClick={() => setPage((n) => n + 1)}>Next<ArrowRight size={14} /></button></div></footer>}
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
  const panelRef = useRef<HTMLElement>(null), nameRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(form) !== initial;
  const close = useCallback(() => { if (!dirty || window.confirm("Discard the unsaved page composition?")) onClose(); }, [dirty, onClose]);
  useEffect(() => { document.body.classList.add("editor-open"); const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); }; addEventListener("keydown", key); setTimeout(() => nameRef.current?.focus(), 80); return () => { document.body.classList.remove("editor-open"); removeEventListener("keydown", key); }; }, [close]);
  useEffect(() => { if (!descriptor.id) return; fetch(`/api/catalog/${resource}/${descriptor.id}`).then(json<Taxonomy>).then((item) => { const next: Form = { ...emptyForm(), ...item, pageContent: item.pageContent }; setForm(next); setInitial(JSON.stringify(next)); setSlugTouched(true); }).catch((cause) => { auth(cause.status || 0); setError(cause.message); }).finally(() => setLoading(false)); }, [auth, descriptor.id, resource]);
  const availableImages = useMemo(() => images.filter((image) => [resource === "categories" ? "category_banner" : "subcategory_banner", "editorial", "lookbook"].includes(image.kind) && (!imageSearch || `${image.alt} ${image.url}`.toLowerCase().includes(imageSearch.toLowerCase()))), [imageSearch, images, resource]);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const banner = (key: "primaryBanner" | "secondaryBanner", patch: Partial<Banner>) => setForm((f) => ({ ...f, pageContent: { ...f.pageContent, [key]: { ...f.pageContent[key], ...patch } } }));
  const description = (key: "primaryDescription" | "secondaryDescription", patch: Partial<Description>) => setForm((f) => ({ ...f, pageContent: { ...f.pageContent, [key]: { ...f.pageContent[key], ...patch } } }));
  const seo = (key: "seoTitle" | "seoDescription", value: string) => setForm((f) => ({ ...f, pageContent: { ...f.pageContent, [key]: value } }));
  const validate = () => { const next: Record<string, string> = {}; if (!form.name.trim()) next.name = "Name is required."; if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) next.slug = "Use a lowercase, hyphenated slug."; if (resource === "subcategories" && !form.categoryId) next.categoryId = "Choose a parent category."; (["primaryBanner", "secondaryBanner"] as const).forEach((key) => { if (!form.pageContent[key].imageId) next[`${key}.imageId`] = "Choose a real banner image."; if (!form.pageContent[key].heading.trim()) next[`${key}.heading`] = "Banner heading is required."; }); (["primaryDescription", "secondaryDescription"] as const).forEach((key) => { if (!form.pageContent[key].body.trim()) next[`${key}.body`] = "Description body is required."; }); setErrors(next); return !Object.keys(next).length; };
  const save = async (event: FormEvent) => { event.preventDefault(); if (!canWrite || saving || !validate()) return; setSaving(true); setError(""); const payload = { name: form.name.trim(), slug: form.slug, description: form.description?.trim() || null, thumbnailImageId: form.thumbnailImageId || null, isActive: form.isActive, sortOrder: Number(form.sortOrder), ...(resource === "subcategories" ? { categoryId: form.categoryId } : {}), pageContent: { primaryBanner: cleanBanner(form.pageContent.primaryBanner), primaryDescription: cleanDescription(form.pageContent.primaryDescription), secondaryBanner: cleanBanner(form.pageContent.secondaryBanner), secondaryDescription: cleanDescription(form.pageContent.secondaryDescription), seoTitle: form.pageContent.seoTitle?.trim() || undefined, seoDescription: form.pageContent.seoDescription?.trim() || undefined } }; try { await fetch(descriptor.id ? `/api/catalog/${resource}/${descriptor.id}` : `/api/catalog/${resource}`, { method: descriptor.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).then(json); onSaved(descriptor.id ? "Page composition revised." : "Page added to the register."); } catch (cause) { const problem = cause as Error & { status?: number }; auth(problem.status || 0); setError(problem.status === 403 ? "Your role cannot change page content." : problem.message); } finally { setSaving(false); } };

  return <div className="editor-layer" onMouseDown={(e) => { if (e.currentTarget === e.target) close(); }}><aside ref={panelRef} className="composer-editor" role="dialog" aria-modal="true" aria-labelledby="composer-title" onKeyDown={(e) => trapFocus(e, panelRef.current)}><header className="editor-header"><div><p>Page composer / {resource}</p><h2 id="composer-title">{descriptor.mode === "create" ? "Compose a new page" : "Revise the campaign page"}</h2></div><button onClick={close} aria-label="Close page composer"><X size={20} /></button></header>
    {loading ? <div className="editor-loading"><LoaderCircle className="spin" /><strong>Opening the latest composition…</strong></div> : <form onSubmit={save} noValidate><div className="composer-editor__body">
      {error && <div className="editor-error" role="alert"><AlertTriangle size={16} />{error}</div>}
      {images.length < 2 && <div className="dependency-warning"><ImageOff size={18} /><div><strong>Two banner images are required.</strong><span>Build the image library before saving this page.</span></div><Link href="/catalog/images">Open Image stories</Link></div>}
      <section className="composer-identity"><EditorHeading index="01" eyebrow="Foundation" title="Page identity" /><div className="editor-grid">
        <Field label="Page name" error={errors.name} wide><input ref={nameRef} value={form.name} onChange={(e) => { const name = e.target.value; setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) })); }} /></Field>
        <Field label="URL slug" error={errors.slug}><input value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></Field><Field label="Display order"><input type="number" step="1" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} /></Field>
        {resource === "subcategories" && <Field label="Parent category" error={errors.categoryId} wide><select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}><option value="">Choose real parent</option>{categories.map((category) => <option value={category._id} key={category._id}>{category.name}</option>)}</select></Field>}
        <Field label="Internal description" hint="Optional" wide><textarea rows={3} value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></Field><Field label="Visibility"><select value={String(form.isActive)} onChange={(e) => set("isActive", e.target.value === "true")}><option value="true">Active</option><option value="false">Inactive</option></select></Field><Field label="Thumbnail" hint="Optional"><select value={form.thumbnailImageId || ""} onChange={(e) => set("thumbnailImageId", e.target.value)}><option value="">No thumbnail</option>{images.map((image) => <option key={image._id} value={image._id}>{image.alt}</option>)}</select></Field>
      </div></section>

      <div className="storyboard-title"><span>02</span><div><p>Campaign sequence</p><h3>Build the two-part story</h3></div><label><Search size={13} /><input value={imageSearch} onChange={(e) => setImageSearch(e.target.value)} placeholder="Filter banner assets" /></label></div>
      <section className="storyboard">{(["primary", "secondary"] as const).map((position, index) => { const bKey = `${position}Banner` as "primaryBanner" | "secondaryBanner", dKey = `${position}Description` as "primaryDescription" | "secondaryDescription", current = form.pageContent[bKey]; return <article className="story-panel" key={position}>
        <header><span>{index === 0 ? "I" : "II"}</span><div><p>{position} story</p><h4>{index === 0 ? "Open the campaign" : "Complete the narrative"}</h4></div></header>
        <div className="story-panel__preview">{imageMap.get(current.imageId) ? <img src={imageMap.get(current.imageId)!.url} alt="" /> : <div><ImageOff size={20} /><span>Banner not selected</span></div>}<section><small>{current.eyebrow || "Eyebrow"}</small><strong>{current.heading || "Banner heading"}</strong><p>{current.body || "Optional supporting copy appears here."}</p>{current.ctaLabel && <b>{current.ctaLabel} →</b>}</section></div>
        <div className="story-panel__fields"><Field label="Banner image" error={errors[`${bKey}.imageId`]} wide><select value={current.imageId} onChange={(e) => banner(bKey, { imageId: e.target.value })}><option value="">Choose real image</option>{availableImages.map((image) => <option value={image._id} key={image._id}>{image.alt} — {image.kind.replaceAll("_", " ")}</option>)}</select></Field><Field label="Eyebrow" hint="Optional"><input maxLength={120} value={current.eyebrow || ""} onChange={(e) => banner(bKey, { eyebrow: e.target.value })} /></Field><Field label="Heading" error={errors[`${bKey}.heading`]}><input maxLength={200} value={current.heading} onChange={(e) => banner(bKey, { heading: e.target.value })} /></Field><Field label="Banner body" hint="Optional" wide><textarea rows={3} maxLength={1200} value={current.body || ""} onChange={(e) => banner(bKey, { body: e.target.value })} /></Field><Field label="CTA label" hint="Optional"><input maxLength={80} value={current.ctaLabel || ""} onChange={(e) => banner(bKey, { ctaLabel: e.target.value })} /></Field><Field label="CTA href" hint="Optional"><input maxLength={500} value={current.ctaHref || ""} onChange={(e) => banner(bKey, { ctaHref: e.target.value })} placeholder="/collections/…" /></Field>
          <div className="description-block editor-span-2"><span>Description {index + 1}</span><Field label="Heading" hint="Optional" wide><input maxLength={240} value={form.pageContent[dKey].heading || ""} onChange={(e) => description(dKey, { heading: e.target.value })} /></Field><Field label="Body" error={errors[`${dKey}.body`]} wide><textarea rows={5} maxLength={5000} value={form.pageContent[dKey].body} onChange={(e) => description(dKey, { body: e.target.value })} /></Field></div>
        </div>
      </article>; })}</section>
      <section className="seo-section"><EditorHeading index="03" eyebrow="Discovery" title="Search presentation" /><div className="seo-layout"><div className="editor-grid"><Field label="SEO title" hint={`${form.pageContent.seoTitle?.length || 0}/70`} wide><input maxLength={70} value={form.pageContent.seoTitle || ""} onChange={(e) => seo("seoTitle", e.target.value)} /></Field><Field label="SEO description" hint={`${form.pageContent.seoDescription?.length || 0}/170`} wide><textarea rows={4} maxLength={170} value={form.pageContent.seoDescription || ""} onChange={(e) => seo("seoDescription", e.target.value)} /></Field></div><aside className="search-preview"><span>Search preview</span><strong>{form.pageContent.seoTitle || form.name || "Page title"}</strong><small>najibzadeh.com / {form.slug || "page-slug"}</small><p>{form.pageContent.seoDescription || "Write a considered summary for search visitors."}</p></aside></div></section>
    </div><footer className="editor-actions"><span>{dirty ? "Unsaved composition" : "Composition current"}</span><button type="button" onClick={close}>Cancel</button><button className="editor-save" disabled={saving || !canWrite || images.length < 2}>{saving ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}{saving ? "Saving…" : "Save complete page"}</button></footer></form>}
  </aside></div>;
}

function cleanBanner(b: Banner): Banner { return { imageId: b.imageId, heading: b.heading.trim(), eyebrow: b.eyebrow?.trim() || undefined, body: b.body?.trim() || undefined, ctaLabel: b.ctaLabel?.trim() || undefined, ctaHref: b.ctaHref?.trim() || undefined }; }
function cleanDescription(d: Description): Description { return { body: d.body.trim(), heading: d.heading?.trim() || undefined }; }
function MiniImage({ asset, number }: { asset?: ImageAsset; number: string }) { const [broken, setBroken] = useState(false); return <div>{asset && !broken ? <img src={asset.url} alt="" onError={() => setBroken(true)} /> : <ImageOff size={15} />}<span>{number}</span></div>; }
function Field({ label, hint, error, wide, children }: { label: string; hint?: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <label className={`editor-field ${wide ? "editor-span-2" : ""}`}><span>{label}{hint && <small>{hint}</small>}</span>{children}{error && <em>{error}</em>}</label>; }
function EditorHeading({ index, eyebrow, title }: { index: string; eyebrow: string; title: string }) { return <header className="editor-subheading"><span>{index}</span><div><p>{eyebrow}</p><h3>{title}</h3></div></header>; }
function trapFocus(event: React.KeyboardEvent, panel: HTMLElement | null) { if (event.key !== "Tab" || !panel) return; const nodes = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')); if (!nodes.length) return; if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1)?.focus(); } else if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus(); } }
function Permission() { return <section className="catalog-state catalog-state--permission"><AlertTriangle size={22} /><p>Catalog access</p><h2>Page composition is outside your role.</h2><span>Ask an administrator for catalog viewing permission.</span></section>; }
function StudioState({ title, detail, action, onAction }: { title: string; detail: string; action?: string | false; onAction: () => void }) { return <div className="catalog-state"><LayoutTemplate size={22} /><p>Page register</p><h2>{title}</h2><span>{detail}</span>{action && <button onClick={onAction}>{action}</button>}</div>; }
function ComposerSkeleton() { return <div className="composer-skeleton">{Array.from({ length: 5 }).map((_, i) => <i key={i} />)}</div>; }
