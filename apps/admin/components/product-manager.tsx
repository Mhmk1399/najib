"use client";

import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronDown, Edit3, FileText,
  Layers3, LoaderCircle, PackageOpen, Plus, RefreshCw, Search, SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CatalogSectionNav } from "@/components/catalog-section-nav";

type ProductStatus = "draft" | "active" | "archived";

type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  collectionIds: string[];
  basePriceMinor: number;
  currency: string;
  status: ProductStatus;
  material: string[];
  fit?: string | null;
  silhouette?: string | null;
  pattern?: string | null;
  seasons: string[];
  occasions: string[];
  styleTags: string[];
  updatedAt?: string;
};

type ReferenceItem = { _id: string; name: string; categoryId?: string };
type Pagination = { page: number; limit: number; total: number; pages: number };
type ListResponse<T> = { items: T[]; pagination: Pagination };
type ApiError = { error?: string; message?: string; details?: unknown };

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  collectionIds: string[];
  price: string;
  currency: string;
  status: ProductStatus;
  material: string;
  fit: string;
  silhouette: string;
  pattern: string;
  seasons: string;
  occasions: string;
  styleTags: string;
};

const emptyForm: ProductForm = {
  name: "", slug: "", description: "", categoryId: "", subcategoryId: "",
  collectionIds: [], price: "", currency: "USD", status: "draft", material: "",
  fit: "", silhouette: "", pattern: "", seasons: "", occasions: "", styleTags: "",
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
    material: (product.material || []).join(", "),
    fit: product.fit || "",
    silhouette: product.silhouette || "",
    pattern: product.pattern || "",
    seasons: (product.seasons || []).join(", "),
    occasions: (product.occasions || []).join(", "),
    styleTags: (product.styleTags || []).join(", "),
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

  const categoryNames = useMemo(() => new Map(categories.map((item) => [item._id, item.name])), [categories]);
  const subcategoryNames = useMemo(() => new Map(subcategories.map((item) => [item._id, item.name])), [subcategories]);
  const filteredSubcategories = useMemo(() => subcategories.filter((item) => !form.categoryId || item.categoryId === form.categoryId), [form.categoryId, subcategories]);
  const filtersActive = Boolean(searchDraft || status || categoryId);
  const dirty = editor !== null && JSON.stringify(form) !== JSON.stringify(initialForm);

  const clearFilters = () => { setSearchDraft(""); setSearch(""); setStatus(""); setCategoryId(""); setPage(1); };
  const announce = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2800); };

  const openCreate = () => {
    const next = { ...emptyForm, collectionIds: [] };
    setForm(next); setInitialForm(next); setSlugTouched(false); setFieldErrors({}); setSaveError(null);
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
    if (dirty && !window.confirm("Discard the unsaved changes to this product?")) return;
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
    setForm((current) => ({ ...current, name: value, slug: slugTouched ? current.slug : slugify(value) }));
    setFieldErrors((current) => { const next = { ...current }; delete next.name; delete next.slug; return next; });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Product name is required.";
    if (!form.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) next.slug = "Use a lowercase, hyphenated URL slug.";
    if (!form.description.trim()) next.description = "A product description is required.";
    if (!form.categoryId) next.categoryId = "Choose a category.";
    if (!form.subcategoryId) next.subcategoryId = "Choose a subcategory.";
    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price < 0) next.price = "Enter a valid non-negative price.";
    if (!/^[A-Za-z]{3}$/.test(form.currency)) next.currency = "Use a 3-letter currency code.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || !validate() || !editor) return;
    setSaving(true); setSaveError(null);
    const payload = {
      name: form.name.trim(), slug: form.slug.trim(), description: form.description.trim(),
      categoryId: form.categoryId, subcategoryId: form.subcategoryId, collectionIds: form.collectionIds,
      basePriceMinor: Math.round(Number(form.price) * 100), currency: form.currency.toUpperCase(), status: form.status,
      material: splitTags(form.material), fit: form.fit.trim() || null, silhouette: form.silhouette.trim() || null,
      pattern: form.pattern.trim() || null, seasons: splitTags(form.seasons), occasions: splitTags(form.occasions),
      styleTags: splitTags(form.styleTags).map((item) => item.toLowerCase()),
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
      announce(editor.mode === "create" ? "Product added to the atelier ledger." : "Product changes saved.");
    } catch (cause) {
      const statusCode = (cause as Error & { status?: number }).status || 0;
      handleAuthFailure(statusCode);
      if (statusCode !== 401) setSaveError(statusCode === 403 ? "You do not have permission to change catalog products." : (cause as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return <div className="catalog-workspace">
    {notice && <div className="toast" role="status"><Check size={14} />{notice}</div>}
    <CatalogSectionNav />
    <header className="catalog-masthead">
      <div className="catalog-title-block">
        <p><span>Commerce</span><i>/</i> Product ledger</p>
        <h1>Catalog, composed<br />with intention.</h1>
        <small>Shape every product story, price and placement from one working ledger.</small>
      </div>
      <div className="catalog-tally" aria-label={`${pagination.total} products`}><span>Registered pieces</span><strong>{String(pagination.total).padStart(2, "0")}</strong><small>Across all catalog states</small></div>
      {canWrite && <button className="catalog-add" onClick={openCreate} disabled={refsLoading}><Plus size={17} /><span>Add product</span><small>New folio</small></button>}
    </header>

    {!canRead || permissionDenied ? <PermissionState /> : <>
      <section className="catalog-controls" aria-label="Product filters">
        <label className="catalog-search"><Search size={17} /><span className="sr-only">Search products</span><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search name, slug or SKU" /></label>
        <div className="status-tabs" aria-label="Product status">
          {(["", "draft", "active", "archived"] as const).map((item) => <button key={item || "all"} className={status === item ? "active" : ""} onClick={() => { setStatus(item); setPage(1); }} aria-pressed={status === item}>{item || "All"}</button>)}
        </div>
        <label className="catalog-select"><Layers3 size={15} /><span className="sr-only">Filter by category</span><select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}><option value="">Every category</option>{categories.map((item) => <option value={item._id} key={item._id}>{item.name}</option>)}</select><ChevronDown size={14} /></label>
        {filtersActive && <button className="clear-filter" onClick={clearFilters}><X size={14} />Clear</button>}
        <button className="catalog-refresh" onClick={() => setRefreshKey((value) => value + 1)} aria-label="Refresh products" disabled={loading}><RefreshCw className={loading ? "spin" : ""} size={16} /></button>
      </section>

      <section className="ledger" aria-live="polite" aria-busy={loading}>
        <header className="ledger-head"><p><SlidersHorizontal size={14} />{filtersActive ? "Filtered register" : "Complete register"}</p><span>{pagination.total} {pagination.total === 1 ? "entry" : "entries"}</span></header>
        {loading ? <LedgerSkeleton /> : error ? <ErrorState message={error} onRetry={() => setRefreshKey((value) => value + 1)} /> : products.length === 0 ? <EmptyState filtered={filtersActive} canWrite={canWrite} onClear={clearFilters} onAdd={openCreate} /> : <>
          <div className="ledger-table-wrap"><table className="ledger-table"><thead><tr><th>Piece / identity</th><th>Taxonomy</th><th>Price</th><th>Status</th><th>Last revision</th>{canWrite && <th><span className="sr-only">Edit</span></th>}</tr></thead><tbody>{products.map((product) => <tr key={product._id}>
            <td><div className="product-identity"><span className="product-monogram" aria-hidden="true">{product.name.trim().slice(0, 2).toUpperCase() || "NZ"}</span><div><strong>{product.name}</strong><small>/{product.slug}</small></div></div></td>
            <td><strong className="taxonomy-name">{categoryNames.get(product.categoryId) || "Unmapped category"}</strong><small className="taxonomy-sub">{subcategoryNames.get(product.subcategoryId) || "Unmapped subcategory"}</small></td>
            <td><strong className="price-cell">{formatPrice(product.basePriceMinor, product.currency)}</strong><small>{product.currency}</small></td>
            <td><span className={`catalog-status catalog-status--${product.status}`}>{product.status}</span></td>
            <td><span className="revision-date">{formatDate(product.updatedAt)}</span></td>
            {canWrite && <td><button className="edit-product" onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`}><Edit3 size={15} /><span>Edit</span></button></td>}
          </tr>)}</tbody></table></div>
          <div className="ledger-mobile-list">{products.map((product) => <article className="product-card" key={product._id}>
            <header><span className="product-monogram" aria-hidden="true">{product.name.trim().slice(0, 2).toUpperCase() || "NZ"}</span><div><strong>{product.name}</strong><small>/{product.slug}</small></div><span className={`catalog-status catalog-status--${product.status}`}>{product.status}</span></header>
            <dl><div><dt>Collection path</dt><dd>{categoryNames.get(product.categoryId) || "Unmapped"} / {subcategoryNames.get(product.subcategoryId) || "Unmapped"}</dd></div><div><dt>Price</dt><dd>{formatPrice(product.basePriceMinor, product.currency)}</dd></div><div><dt>Revised</dt><dd>{formatDate(product.updatedAt)}</dd></div></dl>
            {canWrite && <button onClick={() => openEdit(product)}><Edit3 size={15} />Edit product</button>}
          </article>)}</div>
        </>}
        {!loading && !error && products.length > 0 && <footer className="ledger-pagination"><p>Page <strong>{pagination.page}</strong> of <strong>{Math.max(pagination.pages, 1)}</strong><span>·</span>{pagination.total} products</p><div><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={pagination.page <= 1}><ArrowLeft size={15} />Previous</button><button onClick={() => setPage((value) => Math.min(pagination.pages, value + 1))} disabled={pagination.page >= pagination.pages}>Next<ArrowRight size={15} /></button></div></footer>}
      </section>
    </>}

    {editor && <Editor
      editor={editor} form={form} categories={categories} subcategories={filteredSubcategories} collections={collections}
      fieldErrors={fieldErrors} saveError={saveError} loading={editorLoading} saving={saving} dirty={dirty}
      nameInputRef={nameInputRef} onClose={closeEditor} onSubmit={saveProduct} onName={updateName}
      onField={updateField} onSlugTouched={() => setSlugTouched(true)}
    />}
  </div>;
}

function PermissionState() {
  return <section className="catalog-state catalog-state--permission"><AlertTriangle size={22} /><p>Catalog access</p><h2>This ledger is outside your current role.</h2><span>Ask an administrator to add catalog viewing permission to your staff account.</span></section>;
}

function LedgerSkeleton() {
  return <div className="ledger-skeleton" role="status"><span className="sr-only">Loading products</span>{Array.from({ length: 6 }).map((_, index) => <div key={index}><i /><p><b /><small /></p><em /><em /><em /></div>)}</div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="catalog-state"><AlertTriangle size={22} /><p>Ledger unavailable</p><h2>We couldn’t retrieve the products.</h2><span>{message}</span><button onClick={onRetry}><RefreshCw size={15} />Try again</button></div>;
}

function EmptyState({ filtered, canWrite, onClear, onAdd }: { filtered: boolean; canWrite: boolean; onClear: () => void; onAdd: () => void }) {
  return <div className="catalog-state"><PackageOpen size={24} /><p>{filtered ? "No matching pieces" : "An empty register"}</p><h2>{filtered ? "Refine the search." : "The first product begins here."}</h2><span>{filtered ? "No real catalog records match these filters." : "Create a product once your category references are ready."}</span>{filtered ? <button onClick={onClear}><X size={15} />Clear filters</button> : canWrite && <button onClick={onAdd}><Plus size={15} />Add first product</button>}</div>;
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
};

function Editor({ editor, form, categories, subcategories, collections, fieldErrors, saveError, loading, saving, dirty, nameInputRef, onClose, onSubmit, onName, onField, onSlugTouched }: EditorProps) {
  const noTaxonomy = !categories.length || !subcategories.length;
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
      <header className="editor-header"><div><p>{editor.mode === "create" ? "New catalog folio" : "Product revision"}</p><h2 id="editor-title">{editor.mode === "create" ? "Compose a product" : "Refine the product"}</h2></div><button onClick={onClose} aria-label="Close product editor"><X size={20} /></button></header>
      {loading ? <div className="editor-loading"><LoaderCircle className="spin" size={23} /><strong>Opening the product folio…</strong><span>Retrieving the latest catalog record.</span></div> : <form onSubmit={onSubmit} noValidate>
        <div className="editor-scroll">
          <section className="product-folio" aria-label="Live product summary"><span className="folio-monogram">{form.name.trim().slice(0, 2).toUpperCase() || "NZ"}</span><div><small>Live identity folio</small><strong>{form.name || "Untitled piece"}</strong><p>/{form.slug || "product-slug"}</p></div><span className={`catalog-status catalog-status--${form.status}`}>{form.status}</span><footer><b>{form.price ? `${form.currency.toUpperCase()} ${form.price}` : "Price pending"}</b><i>{dirty ? "Unsaved revision" : "Folio current"}</i></footer></section>

          {saveError && <div className="editor-error" role="alert"><AlertTriangle size={16} /><span>{saveError}</span></div>}
          {noTaxonomy && <div className="reference-warning"><Layers3 size={17} /><p><strong>Category references are required.</strong><span>Create a category and subcategory before this product can be saved. No placeholder references will be invented.</span></p></div>}

          <EditorSection index="01" label="Identity" title="Name the piece">
            <div className="editor-grid">
              <Field label="Product name" required error={fieldErrors.name} className="editor-span-2"><input ref={nameInputRef} required value={form.name} onChange={(event) => onName(event.target.value)} placeholder="e.g. Atelier wool overcoat" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "error-product-name" : undefined} /></Field>
              <Field label="URL slug" required error={fieldErrors.slug} className="editor-span-2" hint="Auto-suggested, always editable"><div className="slug-input"><span>/</span><input required value={form.slug} onChange={(event) => { onSlugTouched(); onField("slug", slugify(event.target.value)); }} placeholder="atelier-wool-overcoat" aria-invalid={Boolean(fieldErrors.slug)} aria-describedby={fieldErrors.slug ? "error-url-slug" : undefined} /></div></Field>
              <Field label="Description" required error={fieldErrors.description} className="editor-span-2"><textarea required value={form.description} onChange={(event) => onField("description", event.target.value)} placeholder="Describe the construction, character and intended wear…" rows={5} aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? "error-description" : undefined} /></Field>
              <Field label="Catalog status"><select value={form.status} onChange={(event) => onField("status", event.target.value as ProductStatus)}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></Field>
            </div>
          </EditorSection>

          <EditorSection index="02" label="Merchandising" title="Place the piece">
            <div className="editor-grid">
              <Field label="Category" required error={fieldErrors.categoryId}><select required value={form.categoryId} onChange={(event) => { onField("categoryId", event.target.value); onField("subcategoryId", ""); }} aria-invalid={Boolean(fieldErrors.categoryId)} aria-describedby={fieldErrors.categoryId ? "error-category" : undefined}><option value="">Choose category</option>{categories.map((item) => <option value={item._id} key={item._id}>{item.name}</option>)}</select></Field>
              <Field label="Subcategory" required error={fieldErrors.subcategoryId}><select required value={form.subcategoryId} onChange={(event) => onField("subcategoryId", event.target.value)} disabled={!form.categoryId} aria-invalid={Boolean(fieldErrors.subcategoryId)} aria-describedby={fieldErrors.subcategoryId ? "error-subcategory" : undefined}><option value="">{form.categoryId ? "Choose subcategory" : "Choose category first"}</option>{subcategories.map((item) => <option value={item._id} key={item._id}>{item.name}</option>)}</select></Field>
              <fieldset className="collection-field editor-span-2"><legend>Collections <span>Optional</span></legend>{collections.length ? <div>{collections.map((item) => <label key={item._id}><input type="checkbox" checked={form.collectionIds.includes(item._id)} onChange={(event) => onField("collectionIds", event.target.checked ? [...form.collectionIds, item._id] : form.collectionIds.filter((id) => id !== item._id))} /><span><Check size={12} />{item.name}</span></label>)}</div> : <p>No collections are available yet.</p>}</fieldset>
            </div>
          </EditorSection>

          <EditorSection index="03" label="Pricing" title="Set the value">
            <div className="editor-grid editor-grid--pricing">
              <Field label="Display price" required error={fieldErrors.price} hint="Major units"><input required type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={(event) => onField("price", event.target.value)} placeholder="0.00" aria-invalid={Boolean(fieldErrors.price)} aria-describedby={fieldErrors.price ? "error-display-price" : undefined} /></Field>
              <Field label="Currency" required error={fieldErrors.currency} hint="ISO code"><input required value={form.currency} maxLength={3} onChange={(event) => onField("currency", event.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} placeholder="USD" aria-invalid={Boolean(fieldErrors.currency)} aria-describedby={fieldErrors.currency ? "error-currency" : undefined} /></Field>
            </div>
          </EditorSection>

          <EditorSection index="04" label="Product story" title="Define its character">
            <div className="editor-grid">
              <Field label="Materials" className="editor-span-2" hint="Comma separated"><input value={form.material} onChange={(event) => onField("material", event.target.value)} placeholder="Wool, cashmere, cupro" /></Field>
              <Field label="Fit"><input value={form.fit} onChange={(event) => onField("fit", event.target.value)} placeholder="Relaxed" /></Field>
              <Field label="Silhouette"><input value={form.silhouette} onChange={(event) => onField("silhouette", event.target.value)} placeholder="Longline" /></Field>
              <Field label="Pattern"><input value={form.pattern} onChange={(event) => onField("pattern", event.target.value)} placeholder="Solid" /></Field>
              <Field label="Seasons" hint="Comma separated"><input value={form.seasons} onChange={(event) => onField("seasons", event.target.value)} placeholder="Autumn, winter" /></Field>
              <Field label="Occasions" className="editor-span-2" hint="Comma separated"><input value={form.occasions} onChange={(event) => onField("occasions", event.target.value)} placeholder="Evening, formal, travel" /></Field>
              <Field label="Style tags" className="editor-span-2" hint="Comma separated"><input value={form.styleTags} onChange={(event) => onField("styleTags", event.target.value)} placeholder="Tailored, minimal, heritage" /></Field>
            </div>
          </EditorSection>

          <div className="next-phase-note"><FileText size={17} /><p><strong>Imagery &amp; variants come next.</strong><span>This folio saves product details only. Image stories, colors, sizes and stock are managed in the next catalog phase.</span></p></div>
        </div>
        <footer className="editor-actions"><span>{dirty ? "Unsaved changes" : "No pending changes"}</span><button type="button" onClick={onClose}>Cancel</button><button className="editor-save" type="submit" disabled={saving || noTaxonomy || !dirty}>{saving ? <><LoaderCircle className="spin" size={15} />Saving folio…</> : <><Check size={15} />{editor.mode === "create" ? "Add product" : "Save revision"}</>}</button></footer>
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
