"use client";

import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { DataButton } from "@/components/global/table/primitives";

export type ListResponse<T> = { items: T[]; pagination: { page: number; limit: number; total: number; pages: number } };
export type LocalizedText = { fa?: string; en?: string; ar?: string };

export const faNumber = new Intl.NumberFormat("fa-IR");
export function localized(value?: LocalizedText) { return value?.fa || value?.en || value?.ar || "—"; }
export function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
export function money(value = 0, currency = "IRR") { return `${faNumber.format(value)} ${currency === "IRR" ? "ریال" : currency}`; }
export function itemCount(items: Array<{ quantity: number }> = []) { return items.reduce((sum, item) => sum + item.quantity, 0); }
export function isExpired(value?: string) { return Boolean(value && new Date(value).getTime() <= Date.now()); }

export async function adminApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store", credentials: "same-origin", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => null) as { error?: string; message?: string; details?: Array<{ message?: string; path?: string | Array<string | number> }> } | T | null;
  if (!response.ok) {
    const error = body as { error?: string; message?: string; details?: Array<{ message?: string; path?: string | Array<string | number> }> } | null;
    const rawHeadline = error?.error || error?.message || "درخواست انجام نشد.";
    const headline = rawHeadline === "Validation failed."
      ? "اعتبارسنجی ورودی ناموفق بود."
      : rawHeadline === "Internal server error."
        ? "خطای داخلی سرور رخ داد."
        : rawHeadline;
    const detail = error?.details?.map((issue) => `${Array.isArray(issue.path) ? issue.path.join(".") : issue.path || "ورودی"}: ${issue.message || "نامعتبر"}`).join("؛ ");
    throw new Error(detail ? `${headline} — ${detail}` : headline);
  }
  return body as T;
}

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "good" | "warn" | "danger" | "info" | "neutral" }) {
  const tones = { good: "border-[var(--adt-success)]/40 bg-[var(--adt-success)]/10 text-[var(--adt-success)]", warn: "border-[var(--adt-warning)]/40 bg-[var(--adt-warning)]/10 text-[var(--adt-warning)]", danger: "border-[var(--adt-danger)]/40 bg-[var(--adt-danger)]/10 text-[var(--adt-danger)]", info: "border-[var(--adt-info)]/40 bg-[var(--adt-info)]/10 text-[var(--adt-info)]", neutral: "border-[var(--adt-border-strong)] bg-[var(--adt-surface-muted)] text-[var(--adt-muted)]" };
  return <span className={`inline-flex min-h-7 items-center border px-2.5 text-[9px] font-bold ${tones[tone]}`}>{label}</span>;
}

export function OperationsHeader({ eyebrow, title, description, onRefresh, refreshing }: { eyebrow: string; title: string; description: string; onRefresh: () => void; refreshing: boolean }) {
  return <section className="relative overflow-hidden border border-[var(--adt-border)] bg-[var(--adt-surface)] px-4 py-5 sm:px-5"><div aria-hidden className="absolute inset-y-0 right-0 w-1 bg-[var(--adt-accent)]"/><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[9px] font-bold tracking-[0.08em] text-[var(--adt-accent-strong)]">{eyebrow}</p><h1 className="mt-2 text-[20px] font-extrabold sm:text-[24px]">{title}</h1><p className="mt-2 max-w-3xl text-[12px] leading-7 text-[var(--adt-muted)]">{description}</p></div><DataButton icon={<RefreshCw size={15}/>} onClick={onRefresh} loading={refreshing}>به‌روزرسانی داده‌ها</DataButton></div></section>;
}

export function Metrics({ children }: { children: ReactNode }) { return <section className="grid border border-[var(--adt-border)] bg-[var(--adt-surface)] sm:grid-cols-2 xl:grid-cols-4">{children}</section>; }
export function Metric({ icon, label, value, loading, error }: { icon: ReactNode; label: string; value?: number; loading: boolean; error: boolean }) { return <div className="flex min-h-24 items-center gap-3 border-b border-[var(--adt-border)] px-4 py-4 sm:border-l xl:border-b-0"><span className="grid size-10 place-items-center border border-[var(--adt-border-strong)] bg-[var(--adt-surface-muted)] text-[var(--adt-accent-strong)]">{icon}</span><span><small className="block text-[10px] text-[var(--adt-muted)]">{label}</small><strong className="mt-1 block text-[22px] tabular-nums">{loading ? "…" : error || value === undefined ? "—" : faNumber.format(value)}</strong></span></div>; }
export function ErrorBanner({ message }: { message: string | null }) { return message ? <div role="alert" className="border border-[var(--adt-danger)]/35 bg-[var(--adt-danger)]/[0.06] px-4 py-3 text-[10px] leading-6 text-[var(--adt-danger)]">{message}</div> : null; }
export function Info({ label, value, icon }: { label: string; value?: string; icon?: ReactNode }) { return <div className="min-w-0"><span className="flex items-center gap-2 text-[9px] text-[var(--adt-muted)]">{icon}{label}</span><strong dir="ltr" className="mt-1 block break-all text-left text-[9px] font-medium leading-5">{value || "—"}</strong></div>; }
export function Timeline({ label, value }: { label: string; value: string }) { return <div className="border-r-2 border-[var(--adt-accent)]/45 pr-3"><small className="block text-[9px] text-[var(--adt-muted)]">{label}</small><strong className="mt-1 block text-[10px] font-semibold">{value}</strong></div>; }
export function MoneyLine({ label, value, currency }: { label: string; value: number; currency: string }) { return <div className="bg-[var(--adt-surface-muted)] p-3"><small className="text-[9px] text-[var(--adt-muted)]">{label}</small><strong dir="ltr" className="mt-1 block text-left text-[11px] tabular-nums">{money(value, currency)}</strong></div>; }
export function DossierLoading({ label }: { label: string }) { return <div className="grid min-h-64 place-items-center text-[11px] text-[var(--adt-muted)]"><RefreshCw className="mb-3 animate-spin motion-reduce:animate-none" size={22}/><span>{label}</span></div>; }
export function DossierError({ error, retry }: { error: unknown; retry: () => void }) { return <div role="alert" className="border border-[var(--adt-danger)]/35 bg-[var(--adt-danger)]/[0.06] p-5 text-[11px] leading-6 text-[var(--adt-danger)]"><p>{error instanceof Error ? error.message : "اطلاعات دریافت نشد."}</p><DataButton className="mt-3" tone="danger" icon={<RefreshCw size={14}/>} onClick={retry}>تلاش دوباره</DataButton></div>; }
