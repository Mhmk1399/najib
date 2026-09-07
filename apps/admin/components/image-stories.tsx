"use client";

/* eslint-disable @next/next/no-img-element */
import { CatalogSectionNav } from "@/components/catalog-section-nav";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Crosshair, Edit3, ImageOff, Images, LoaderCircle, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";

type Kind = "product" | "category_banner" | "subcategory_banner" | "collection_banner" | "editorial" | "lookbook";
type ProductLink = { productId: string; variantId?: string; label?: string; hotspotX?: number; hotspotY?: number; sortOrder: number };
type ImageAsset = { _id: string; url: string; alt: string; kind: Kind; width?: number | null; height?: number | null; focalPointX: number; focalPointY: number; linkedProducts: ProductLink[]; isActive: boolean; updatedAt?: string };
type Product = { _id: string; name: string; slug: string };
type Variant = { _id: string; sku: string; productId: string };
type Pagination = { page: number; limit: number; total: number; pages: number };
type List<T> = { items: T[]; pagination: Pagination };

const kinds: Kind[] = ["product", "category_banner", "subcategory_banner", "collection_banner", "editorial", "lookbook"];
const emptyAsset: Omit<ImageAsset, "_id"> = { url: "", alt: "", kind: "editorial", focalPointX: 50, focalPointY: 50, linkedProducts: [], isActive: true };

async function json<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({})) as { error?: string; message?: string };
  if (!response.ok) throw Object.assign(new Error(body.error || body.message || "The request could not be completed."), { status: response.status });
  return body as T;
}
const labelKind = (kind: Kind) => kind.replaceAll("_", " ");
const validImageUrl = (value: string) => value.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(value);

export function ImageStories({ canRead, canWrite }: { canRead: boolean; canWrite: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<ImageAsset[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"" | Kind>("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(canRead);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; id?: string } | null>(null);
  const [notice, setNotice] = useState("");

  const auth = useCallback((status: number) => { if (status === 401) router.replace("/login?reason=session"); }, [router]);
  useEffect(() => { const timer = setTimeout(() => { setSearch(draftSearch.trim()); setPage(1); }, 320); return () => clearTimeout(timer); }, [draftSearch]);
  useEffect(() => {
    if (!canRead) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true); setError("");
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) params.set("search", search); if (kind) params.set("kind", kind); if (active) params.set("isActive", active);
      try {
        const data = await fetch(`/api/catalog/images?${params}`, { signal: controller.signal }).then(json<List<ImageAsset>>);
        setItems(data.items); setPagination(data.pagination);
      } catch (cause) {
        const problem = cause as Error & { status?: number };
        if (problem.name !== "AbortError") { auth(problem.status || 0); setError(problem.message); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [active, auth, canRead, kind, page, refresh, search]);

  const clear = () => { setDraftSearch(""); setSearch(""); setKind(""); setActive(""); setPage(1); };
  const filtered = Boolean(search || kind || active);
  const saved = (message: string) => { setEditor(null); setPage(1); setRefresh((n) => n + 1); setNotice(message); setTimeout(() => setNotice(""), 2600); };

  return <div className="catalog-workspace studio-workspace">
    {notice && <div className="toast" role="status"><Check size={14} />{notice}</div>}
    <CatalogSectionNav />
    <header className="studio-masthead">
      <div><p>Editorial contact sheet <i>/</i> Asset register</p><h1>Image stories.</h1><small>Place the product inside the campaign—not beside it.</small></div>
      <div className="studio-count"><span>Frames on file</span><strong>{String(pagination.total).padStart(2, "0")}</strong><small>URL-based image records</small></div>
      {canWrite && <button className="studio-primary" onClick={() => setEditor({ mode: "create" })}><Plus size={16} /><span>Create image</span></button>}
    </header>

    {!canRead ? <Permission /> : <>
      <section className="studio-controls" aria-label="Image filters">
        <label className="studio-search"><Search size={16} /><span className="sr-only">Search images</span><input value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} placeholder="Search alt text or URL" /></label>
        <label><span className="sr-only">Image kind</span><select value={kind} onChange={(e) => { setKind(e.target.value as "" | Kind); setPage(1); }}><option value="">All image kinds</option>{kinds.map((value) => <option key={value} value={value}>{labelKind(value)}</option>)}</select></label>
        <label><span className="sr-only">Activity</span><select value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}><option value="">Active & inactive</option><option value="true">Active</option><option value="false">Inactive</option></select></label>
        {filtered && <button className="studio-text-button" onClick={clear}><X size={14} />Clear</button>}
        <button className="catalog-refresh" onClick={() => setRefresh((n) => n + 1)} disabled={loading} aria-label="Refresh images"><RefreshCw className={loading ? "spin" : ""} size={16} /></button>
      </section>

      <section className="contact-sheet" aria-live="polite" aria-busy={loading}>
        <header><span>Contact sheet / {filtered ? "selection" : "complete archive"}</span><b>{pagination.total} frames</b></header>
        {loading ? <ImageSkeleton /> : error ? <StudioState icon="error" title="The contact sheet is unavailable." detail={error} action="Try again" onAction={() => setRefresh((n) => n + 1)} /> : items.length === 0 ? <StudioState title={filtered ? "No frames match this edit." : "Your image story begins here."} detail={filtered ? "Clear or adjust the filters to widen the contact sheet." : "Add a real image URL before composing category banners or shoppable moments."} action={filtered ? "Clear filters" : canWrite ? "Create first image" : undefined} onAction={filtered ? clear : () => setEditor({ mode: "create" })} /> : <div className="image-grid">{items.map((asset, index) => <article className="image-card" key={asset._id}>
          <div className="image-card__frame"><AssetImage asset={asset} /><span className="frame-number">{String((page - 1) * 12 + index + 1).padStart(2, "0")}</span><span className={asset.isActive ? "frame-state" : "frame-state inactive"}>{asset.isActive ? "Live" : "Inactive"}</span></div>
          <div className="image-card__copy"><p>{labelKind(asset.kind)}</p><h2>{asset.alt}</h2><dl><div><dt>Frame</dt><dd>{asset.width && asset.height ? `${asset.width} × ${asset.height}` : "Unmeasured"}</dd></div><div><dt>Focus</dt><dd>{asset.focalPointX ?? 50} / {asset.focalPointY ?? 50}</dd></div><div><dt>Linked</dt><dd>{asset.linkedProducts?.length || 0} products</dd></div></dl>{canWrite && <button onClick={() => setEditor({ mode: "edit", id: asset._id })}><Edit3 size={14} />Edit story</button>}</div>
        </article>)}</div>}
        {!loading && !error && items.length > 0 && <footer className="studio-pagination"><span>Sheet {pagination.page} of {Math.max(1, pagination.pages)}</span><div><button disabled={page <= 1} onClick={() => setPage((n) => n - 1)}><ArrowLeft size={14} />Previous</button><button disabled={page >= pagination.pages} onClick={() => setPage((n) => n + 1)}>Next<ArrowRight size={14} /></button></div></footer>}
      </section>
    </>}
    {editor && <ImageEditor descriptor={editor} canWrite={canWrite} onClose={() => setEditor(null)} onSaved={saved} auth={auth} />}
  </div>;
}

function AssetImage({ asset, className = "" }: { asset: Pick<ImageAsset, "url" | "alt" | "focalPointX" | "focalPointY">; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (!asset.url || broken) return <div className={`broken-image ${className}`}><ImageOff size={21} /><span>Preview unavailable</span></div>;
  return <img className={className} src={asset.url} alt={asset.alt} onError={() => setBroken(true)} style={{ objectPosition: `${asset.focalPointX ?? 50}% ${asset.focalPointY ?? 50}%` }} />;
}

function ImageEditor({ descriptor, canWrite, onClose, onSaved, auth }: { descriptor: { mode: "create" | "edit"; id?: string }; canWrite: boolean; onClose: () => void; onSaved: (m: string) => void; auth: (s: number) => void }) {
  const [form, setForm] = useState<Omit<ImageAsset, "_id"> & { width?: number | null; height?: number | null }>(emptyAsset);
  const [initial, setInitial] = useState(JSON.stringify(emptyAsset));
  const [loading, setLoading] = useState(descriptor.mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [variants, setVariants] = useState<Record<number, Variant[]>>({});
  const [selectedLink, setSelectedLink] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const panelRef = useRef<HTMLElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(form) !== initial;

  const close = useCallback(() => { if (!dirty || window.confirm("Discard the unsaved image story?")) onClose(); }, [dirty, onClose]);
  useEffect(() => {
    document.body.classList.add("editor-open");
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    window.addEventListener("keydown", key); setTimeout(() => urlRef.current?.focus(), 80);
    return () => { document.body.classList.remove("editor-open"); window.removeEventListener("keydown", key); };
  }, [close]);
  useEffect(() => {
    if (!descriptor.id) return;
    fetch(`/api/catalog/images/${descriptor.id}`).then(json<ImageAsset>).then((asset) => { const next = { ...asset }; setForm(next); setInitial(JSON.stringify(next)); }).catch((cause) => { auth(cause.status || 0); setError(cause.message); }).finally(() => setLoading(false));
  }, [auth, descriptor.id]);
  useEffect(() => {
    const controller = new AbortController(); const timer = setTimeout(() => {
      setProductLoading(true); const params = new URLSearchParams({ limit: "20" }); if (productSearch.trim()) params.set("search", productSearch.trim());
      fetch(`/api/catalog/products?${params}`, { signal: controller.signal }).then(json<List<Product>>).then((data) => setProducts(data.items)).catch(() => {}).finally(() => setProductLoading(false));
    }, 280);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [productSearch]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: "" })); };
  const setLink = (index: number, patch: Partial<ProductLink>) => setForm((f) => ({ ...f, linkedProducts: f.linkedProducts.map((link, i) => i === index ? { ...link, ...patch } : link) }));
  const loadVariants = async (index: number, productId: string) => {
    setLink(index, { productId, variantId: undefined }); if (!productId) return;
    const data = await fetch(`/api/catalog/variants?productId=${productId}&limit=100`).then(json<List<Variant>>).catch(() => null); if (data) setVariants((current) => ({ ...current, [index]: data.items }));
  };
  const place = (event: MouseEvent<HTMLDivElement>) => {
    if (!placing || !form.linkedProducts[selectedLink]) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const sourceW = natural.width || form.width || bounds.width, sourceH = natural.height || form.height || bounds.height;
    const scale = Math.min(bounds.width / sourceW, bounds.height / sourceH), drawW = sourceW * scale, drawH = sourceH * scale;
    const left = (bounds.width - drawW) / 2, top = (bounds.height - drawH) / 2;
    const x = Math.round(Math.max(0, Math.min(100, ((event.clientX - bounds.left - left) / drawW) * 100)));
    const y = Math.round(Math.max(0, Math.min(100, ((event.clientY - bounds.top - top) / drawH) * 100)));
    setLink(selectedLink, { hotspotX: x, hotspotY: y }); setPlacing(false);
  };
  const validate = () => {
    const next: Record<string, string> = {};
    if (!validImageUrl(form.url)) next.url = "Use an HTTP(S) or root-relative image URL.";
    if (!form.alt.trim()) next.alt = "Accessible alt text is required.";
    if (form.width != null && (!Number.isInteger(form.width) || form.width <= 0)) next.width = "Use a positive whole number.";
    if (form.height != null && (!Number.isInteger(form.height) || form.height <= 0)) next.height = "Use a positive whole number.";
    form.linkedProducts.forEach((link, index) => { if (!link.productId) next[`link-${index}`] = "Choose a product."; if ((link.hotspotX === undefined) !== (link.hotspotY === undefined)) next[`hotspot-${index}`] = "Set both hotspot coordinates or clear both."; });
    setErrors(next); return !Object.keys(next).length;
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (!canWrite || saving || !validate()) return; setSaving(true); setError("");
    const payload = { ...form, url: form.url.trim(), alt: form.alt.trim(), width: form.width ?? null, height: form.height ?? null, linkedProducts: form.linkedProducts.map((link) => ({ ...link, label: link.label?.trim() || undefined, variantId: link.variantId || undefined })) };
    const endpoint = descriptor.id ? `/api/catalog/images/${descriptor.id}` : "/api/catalog/images";
    try { await fetch(endpoint, { method: descriptor.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).then(json); onSaved(descriptor.id ? "Image story revised." : "Image added to the contact sheet."); }
    catch (cause) { const problem = cause as Error & { status?: number }; auth(problem.status || 0); setError(problem.status === 403 ? "Your role cannot change image stories." : problem.message); }
    finally { setSaving(false); }
  };

  return <div className="editor-layer" onMouseDown={(e) => { if (e.currentTarget === e.target) close(); }}><aside ref={panelRef} className="story-editor" role="dialog" aria-modal="true" aria-labelledby="image-editor-title" onKeyDown={(e) => trapFocus(e, panelRef.current)}>
    <header className="editor-header"><div><p>Image story / {descriptor.mode}</p><h2 id="image-editor-title">{descriptor.mode === "create" ? "Register a frame" : "Compose the frame"}</h2></div><button onClick={close} aria-label="Close image editor"><X size={20} /></button></header>
    {loading ? <div className="editor-loading"><LoaderCircle className="spin" /><strong>Opening the latest frame…</strong></div> : <form onSubmit={save} noValidate><div className="story-editor__body">
      {error && <div className="editor-error" role="alert"><AlertTriangle size={16} />{error}</div>}
      <section className="story-preview-panel">
        <div className={`hotspot-preview ${placing ? "is-placing" : ""}`} onClick={place} aria-label={placing ? "Click image to place selected hotspot" : "Image preview"}>
          {form.url && validImageUrl(form.url) ? <img src={form.url} alt={form.alt || "Current image preview"} onLoad={(e) => setNatural({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} style={{ objectPosition: `${form.focalPointX}% ${form.focalPointY}%` }} /> : <div className="broken-image"><Images size={24} /><span>Enter a valid image URL</span></div>}
          {form.linkedProducts.map((link, index) => link.hotspotX !== undefined && link.hotspotY !== undefined && <button type="button" key={index} className={selectedLink === index ? "hotspot active" : "hotspot"} style={{ left: `${link.hotspotX}%`, top: `${link.hotspotY}%` }} onClick={(e) => { e.stopPropagation(); setSelectedLink(index); setPlacing(false); }} aria-label={`Select hotspot ${index + 1}`}>{index + 1}</button>)}
        </div>
        <div className="preview-caption"><span>{placing ? "Placement armed — choose a precise point" : "Hotspot canvas"}</span><small>Ordinary clicks never move a point</small></div>
      </section>

      <section className="story-form-panel">
        <EditorHeading index="01" eyebrow="Source" title="Frame & focus" />
        <div className="editor-grid">
          <Field label="Image URL" error={errors.url} wide><input ref={urlRef} value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://… or /media/…" /></Field>
          <Field label="Accessible alt text" error={errors.alt} wide><textarea value={form.alt} onChange={(e) => set("alt", e.target.value)} rows={3} /></Field>
          <Field label="Image kind"><select value={form.kind} onChange={(e) => set("kind", e.target.value as Kind)}>{kinds.map((value) => <option value={value} key={value}>{labelKind(value)}</option>)}</select></Field>
          <Field label="Visibility"><select value={String(form.isActive)} onChange={(e) => set("isActive", e.target.value === "true")}><option value="true">Active</option><option value="false">Inactive</option></select></Field>
          <Field label="Width" hint="Optional" error={errors.width}><input type="number" min="1" step="1" value={form.width ?? ""} onChange={(e) => set("width", e.target.value ? Number(e.target.value) : undefined)} /></Field>
          <Field label="Height" hint="Optional" error={errors.height}><input type="number" min="1" step="1" value={form.height ?? ""} onChange={(e) => set("height", e.target.value ? Number(e.target.value) : undefined)} /></Field>
          <Field label={`Focal X — ${form.focalPointX}%`}><input type="range" min="0" max="100" value={form.focalPointX} onChange={(e) => set("focalPointX", Number(e.target.value))} /></Field>
          <Field label={`Focal Y — ${form.focalPointY}%`}><input type="range" min="0" max="100" value={form.focalPointY} onChange={(e) => set("focalPointY", Number(e.target.value))} /></Field>
        </div>
        <p className="metadata-note">This library stores image metadata by URL. File uploading is not part of this phase.</p>

        <EditorHeading index="02" eyebrow="Commerce links" title="Make the frame shoppable" />
        <label className="product-lookup"><Search size={14} /><input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search real products to link…" /><span>{productLoading ? "Searching" : `${products.length} results`}</span></label>
        <div className="hotspot-links">{form.linkedProducts.map((link, index) => <article className={selectedLink === index ? "hotspot-link active" : "hotspot-link"} key={index} onClick={() => setSelectedLink(index)}>
          <header><span>{String(index + 1).padStart(2, "0")}</span><strong>Product link</strong><button type="button" onClick={() => { setForm((f) => ({ ...f, linkedProducts: f.linkedProducts.filter((_, i) => i !== index) })); setSelectedLink(0); }} aria-label={`Remove link ${index + 1}`}><Trash2 size={14} /></button></header>
          {errors[`link-${index}`] && <em>{errors[`link-${index}`]}</em>}
          <div className="editor-grid">
            <Field label="Product" wide><select value={link.productId} onChange={(e) => loadVariants(index, e.target.value)}><option value="">Choose product</option>{products.map((p) => <option key={p._id} value={p._id}>{p.name} / {p.slug}</option>)}</select></Field>
            <Field label="Variant" hint="Optional"><select value={link.variantId || ""} disabled={!link.productId} onChange={(e) => setLink(index, { variantId: e.target.value || undefined })}><option value="">Any variant</option>{(variants[index] || []).map((v) => <option value={v._id} key={v._id}>{v.sku}</option>)}</select></Field>
            <Field label="Label" hint="Optional"><input value={link.label || ""} onChange={(e) => setLink(index, { label: e.target.value })} maxLength={120} /></Field>
            <Field label="Order"><input type="number" step="1" value={link.sortOrder} onChange={(e) => setLink(index, { sortOrder: Number(e.target.value) })} /></Field>
            <Field label="Hotspot X" hint="0–100"><input type="number" min="0" max="100" value={link.hotspotX ?? ""} onChange={(e) => setLink(index, { hotspotX: e.target.value === "" ? undefined : Number(e.target.value) })} /></Field>
            <Field label="Hotspot Y" hint="0–100"><input type="number" min="0" max="100" value={link.hotspotY ?? ""} onChange={(e) => setLink(index, { hotspotY: e.target.value === "" ? undefined : Number(e.target.value) })} /></Field>
          </div>
          {errors[`hotspot-${index}`] && <em>{errors[`hotspot-${index}`]}</em>}
          <footer><button type="button" className={placing && selectedLink === index ? "placing" : ""} onClick={() => { setSelectedLink(index); setPlacing(true); }}><Crosshair size={14} />{placing && selectedLink === index ? "Choose point above" : "Place hotspot"}</button><button type="button" onClick={() => setLink(index, { hotspotX: undefined, hotspotY: undefined })}>Clear point</button></footer>
        </article>)}</div>
        <button type="button" className="add-link" onClick={() => { const index = form.linkedProducts.length; setForm((f) => ({ ...f, linkedProducts: [...f.linkedProducts, { productId: "", sortOrder: index }] })); setSelectedLink(index); }}><Plus size={14} />Add product link</button>
      </section>
    </div><footer className="editor-actions"><span>{dirty ? "Unsaved composition" : "Composition current"}</span><button type="button" onClick={close}>Cancel</button><button className="editor-save" disabled={saving || !canWrite}>{saving ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}{saving ? "Saving…" : "Save image story"}</button></footer></form>}
  </aside></div>;
}

function Field({ label, hint, error, wide, children }: { label: string; hint?: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <label className={`editor-field ${wide ? "editor-span-2" : ""}`}><span>{label}{hint && <small>{hint}</small>}</span>{children}{error && <em>{error}</em>}</label>; }
function EditorHeading({ index, eyebrow, title }: { index: string; eyebrow: string; title: string }) { return <header className="editor-subheading"><span>{index}</span><div><p>{eyebrow}</p><h3>{title}</h3></div></header>; }
function trapFocus(event: React.KeyboardEvent, panel: HTMLElement | null) { if (event.key !== "Tab" || !panel) return; const nodes = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')); if (!nodes.length) return; const first = nodes[0], last = nodes[nodes.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
function Permission() { return <section className="catalog-state catalog-state--permission"><AlertTriangle size={22} /><p>Catalog access</p><h2>Image stories are outside your current role.</h2><span>Ask an administrator for catalog viewing permission.</span></section>; }
function StudioState({ icon, title, detail, action, onAction }: { icon?: string; title: string; detail: string; action?: string; onAction: () => void }) { return <div className="catalog-state">{icon === "error" ? <AlertTriangle size={22} /> : <ImageOff size={22} />}<p>Image library</p><h2>{title}</h2><span>{detail}</span>{action && <button onClick={onAction}>{action}</button>}</div>; }
function ImageSkeleton() { return <div className="image-skeleton">{Array.from({ length: 6 }).map((_, i) => <i key={i} />)}</div>; }
