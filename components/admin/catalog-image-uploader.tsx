"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageOff, ImagePlus, LoaderCircle, RotateCcw, X } from "lucide-react";
import type { LocalizedText } from "@/lib/admin/localization";
import type { ImageObjectFit, ImageObjectPosition } from "@/lib/catalog/image-presentation";

export type CatalogImageKind = "product" | "category_banner" | "subcategory_banner" | "collection_banner" | "editorial" | "lookbook";
export type UploadedCatalogImage = { _id: string; url: string; alt: LocalizedText; kind: CatalogImageKind; objectFit?: ImageObjectFit; objectPosition?: ImageObjectPosition; isActive: boolean };

export function CatalogImagePreview({ image, className = "h-20 w-full", altText }: { image?: Pick<UploadedCatalogImage, "url" | "alt">; className?: string; altText?: string }) {
  return <CatalogImagePreviewState key={image?.url ?? "empty"} image={image} className={className} altText={altText} />;
}

function CatalogImagePreviewState({ image, className, altText }: { image?: Pick<UploadedCatalogImage, "url" | "alt">; className: string; altText?: string }) {
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  if (!image?.url) return <div className={`${className} grid place-items-center bg-[var(--adt-surface-muted)] text-[var(--adt-muted)]`}><ImageOff size={18} /><span className="sr-only">تصویر در دسترس نیست</span></div>;
  if (failed) return <div role="alert" className={`${className} grid place-items-center gap-1 bg-[var(--adt-warning)]/[.08] p-2 text-center text-[9px] leading-4 text-[var(--adt-text)]`}><ImageOff size={16} /><span>نمایش تصویر ممکن نیست؛ دسترسی عمومی Bucket را بررسی کنید.</span><button type="button" className="min-h-9 border border-[var(--adt-border-strong)] px-2 font-bold" onClick={() => { setFailed(false); setRetryKey((value) => value + 1); }}>تلاش دوباره برای نمایش</button></div>;
  const separator = image.url.includes("?") ? "&" : "?";
  return <img key={retryKey} src={retryKey ? `${image.url}${separator}preview=${retryKey}` : image.url} alt={altText ?? image.alt?.fa ?? "تصویر کاتالوگ"} loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} />;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function safeUploadError(status: number, message?: string) {
  if (status === 401) return "نشست ادمین منقضی شده است؛ دوباره وارد شوید.";
  if (status === 403) return "دسترسی آپلود تصویر برای حساب شما فعال نیست.";
  if (status === 413) return "حجم تصویر بیشتر از حد مجاز است.";
  if (status === 502) return "فضای ذخیره‌سازی فایل را نپذیرفت؛ تنظیمات Bucket را بررسی کنید.";
  if (status === 503) return "فضای ذخیره‌سازی آماده نیست؛ تنظیمات سرور را بررسی کنید.";
  if (status === 400) return message?.includes("5 MB") ? "حجم تصویر باید کمتر از ۵ مگابایت باشد." : "فایل یا اطلاعات تصویر معتبر نیست.";
  return status >= 500 ? "آپلود تصویر در سرور انجام نشد. دوباره تلاش کنید." : "آپلود تصویر انجام نشد.";
}

export function CatalogImageUploader({ kind = "product", alt, compact = false, disabled = false, onPendingChange, onUploaded }: { kind?: CatalogImageKind; alt?: Partial<LocalizedText>; compact?: boolean; disabled?: boolean; onPendingChange?: (pending: boolean) => void; onUploaded: (image: UploadedCatalogImage) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<XMLHttpRequest | null>(null);
  const pendingChangeRef = useRef(onPendingChange);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [urlIssue, setUrlIssue] = useState<UploadedCatalogImage | null>(null);
  const preview = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => { pendingChangeRef.current = onPendingChange; }, [onPendingChange]);
  useEffect(() => () => { requestRef.current?.abort(); pendingChangeRef.current?.(false); }, []);

  function validate(next: File) {
    if (!ACCEPTED.includes(next.type)) return "فقط فایل JPG، PNG یا WebP قابل قبول است.";
    if (next.size > MAX_SIZE) return "حجم تصویر باید کمتر از ۵ مگابایت باشد.";
    return "";
  }

  function choose(next?: File) {
    if (!next || busy || disabled) return;
    const issue = validate(next);
    setError(issue);
    if (!issue) setFile(next);
    else if (inputRef.current) inputRef.current.value = "";
  }

  function upload() {
    if (!file || busy) return;
    setBusy(true); onPendingChange?.(true); setError(""); setUrlIssue(null); setProgress(0);
    const body = new FormData(); body.set("file", file);
    if (alt?.fa) body.set("altFa", alt.fa);
    if (alt?.en) body.set("altEn", alt.en);
    if (alt?.ar) body.set("altAr", alt.ar);
    const request = new XMLHttpRequest();
    requestRef.current = request;
    request.open("POST", `/api/admin/uploads/catalog-image?kind=${encodeURIComponent(kind)}`);
    request.upload.onprogress = (event) => event.lengthComputable && setProgress(Math.round(event.loaded / event.total * 100));
    request.onerror = () => { requestRef.current = null; setError("ارتباط با سرویس آپلود برقرار نشد. دوباره تلاش کنید."); setBusy(false); onPendingChange?.(false); };
    request.onload = () => {
      requestRef.current = null;
      setBusy(false); onPendingChange?.(false);
      let response: { image?: UploadedCatalogImage; error?: string; message?: string } = {};
      try { response = JSON.parse(request.responseText); } catch {}
      if (request.status < 200 || request.status >= 300 || !response.image) {
        setError(safeUploadError(request.status, response.error || response.message));
        return;
      }
      onUploaded(response.image);
      const probe = new Image();
      probe.onload = () => setUrlIssue(null);
      probe.onerror = () => setUrlIssue(response.image ?? null);
      probe.src = response.image.url;
      setFile(null); setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    };
    request.send(body);
  }

  return <div className="space-y-2" dir="rtl">
    <div onDragOver={(e) => { e.preventDefault(); if (!busy && !disabled) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files[0]); }} className={`relative flex ${compact ? "min-h-24" : "min-h-32"} flex-wrap items-center gap-3 border border-dashed p-3 transition ${disabled ? "opacity-55" : ""} ${dragging ? "border-[var(--adt-accent)] bg-[var(--adt-accent)]/[.07]" : "border-[var(--adt-border-strong)] bg-[var(--adt-surface-muted)]"}`}>
      {preview ? <img src={preview} alt="پیش‌نمایش فایل انتخاب‌شده" className="size-16 shrink-0 object-cover" /> : <span className="grid size-12 shrink-0 place-items-center border border-[var(--adt-border)] bg-[var(--adt-surface)] text-[var(--adt-accent-strong)]"><ImagePlus size={20} /></span>}
      <div className="min-w-0 flex-1"><strong className="block truncate text-[11px]">{file?.name || "تصویر را اینجا رها کنید"}</strong><span className="mt-1 block text-[9px] text-[var(--adt-muted)]">JPG، PNG یا WebP · حداکثر ۵ مگابایت</span>{busy ? <div className="mt-2 h-1 overflow-hidden bg-[var(--adt-border)]"><span className="block h-full bg-[var(--adt-accent)] transition-all" style={{ width: `${progress}%` }} /></div> : null}</div>
      <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => choose(e.target.files?.[0])} />
      <button type="button" disabled={busy || disabled} onClick={() => inputRef.current?.click()} className="min-h-11 border border-[var(--adt-border-strong)] bg-[var(--adt-surface)] px-3 text-[10px] font-bold outline-none hover:border-[var(--adt-accent)] focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/30 disabled:opacity-50">انتخاب فایل</button>
      {file ? <button type="button" aria-label="حذف فایل انتخاب‌شده" disabled={busy} onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }} className="grid size-11 place-items-center border border-[var(--adt-border)] text-[var(--adt-muted)]"><X size={14} /></button> : null}
    </div>
    {file ? <button type="button" disabled={busy} onClick={upload} className="flex min-h-10 w-full items-center justify-center gap-2 bg-[var(--adt-text)] px-4 text-[10px] font-bold text-[var(--adt-surface)] disabled:opacity-60">{busy ? <LoaderCircle className="animate-spin" size={14} /> : error ? <RotateCcw size={14} /> : <ImagePlus size={14} />}{busy ? `در حال آپلود ${progress}٪` : error ? "تلاش دوباره" : "آپلود و افزودن به کتابخانه"}</button> : null}
    {error ? <p role="alert" className="border-r-2 border-[var(--adt-danger)] px-3 py-2 text-[9px] text-[var(--adt-danger)]">{error}</p> : null}
    {urlIssue ? <div role="alert" className="border-r-2 border-[var(--adt-warning)] bg-[var(--adt-warning)]/[.06] px-3 py-2 text-[10px] leading-5 text-[var(--adt-text)]"><strong>تصویر آپلود شد، اما آدرس عمومی آن نمایش داده نشد.</strong><span className="block text-[var(--adt-muted)]">فایل را دوباره آپلود نکنید؛ دسترسی عمومی یا Public URL فضای ذخیره‌سازی را بررسی کنید.</span><button type="button" onClick={() => { const probe = new Image(); probe.onload = () => setUrlIssue(null); probe.onerror = () => setUrlIssue(urlIssue); probe.src = `${urlIssue.url}${urlIssue.url.includes("?") ? "&" : "?"}check=${Date.now()}`; }} className="mt-1 min-h-10 border border-[var(--adt-border-strong)] px-3 text-[9px] font-bold">بررسی دوباره نمایش</button></div> : null}
  </div>;
}
