"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PersianDateRangeValue } from "../global/table/types";
import { DataButton } from "../global/table/primitives";
import { cx } from "../global/table/utils";
 

const MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

const PERSIAN_PARTS_UTC = new Intl.DateTimeFormat(
  "en-US-u-ca-persian-nu-latn",
  {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
);

const PERSIAN_PARTS_TEHRAN = new Intl.DateTimeFormat(
  "en-US-u-ca-persian-nu-latn",
  {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
);

const FA_NUMBER = new Intl.NumberFormat("fa-IR", { useGrouping: false });

export type PersianDatePickerProps = {
  mode?: "single" | "range";
  value?: string | null | PersianDateRangeValue;
  onChange: (value: string | null | PersianDateRangeValue) => void;
  onComplete?: () => void;
  minDate?: string;
  maxDate?: string;
  autoClose?: boolean;
  className?: string;
};

type PersianParts = { year: number; month: number; day: number };

function partsFromFormatter(
  formatter: Intl.DateTimeFormat,
  date: Date,
): PersianParts {
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function persianPartsUtc(date: Date) {
  return partsFromFormatter(PERSIAN_PARTS_UTC, date);
}

function persianToday() {
  return partsFromFormatter(PERSIAN_PARTS_TEHRAN, new Date());
}

function addPersianMonths(year: number, month: number, delta: number) {
  const index = year * 12 + (month - 1) + delta;
  return {
    year: Math.floor(index / 12),
    month: (((index % 12) + 12) % 12) + 1,
  };
}

function approximateGregorianDate(year: number, month: number, day: number) {
  const offset =
    month <= 6
      ? (month - 1) * 31 + (day - 1)
      : 6 * 31 + (month - 7) * 30 + (day - 1);
  return new Date(Date.UTC(year + 621, 2, 20 + offset, 12, 0, 0));
}

function gregorianFromPersian(year: number, month: number, day: number) {
  const approximate = approximateGregorianDate(year, month, day);
  for (let delta = -4; delta <= 4; delta += 1) {
    const candidate = new Date(approximate.getTime() + delta * 86_400_000);
    const parts = persianPartsUtc(candidate);
    if (parts.year === year && parts.month === month && parts.day === day) {
      return candidate;
    }
  }

  // Very defensive fallback for unusual Intl implementations.
  for (let delta = -14; delta <= 14; delta += 1) {
    const candidate = new Date(approximate.getTime() + delta * 86_400_000);
    const parts = persianPartsUtc(candidate);
    if (parts.year === year && parts.month === month && parts.day === day) {
      return candidate;
    }
  }

  throw new Error(`Unable to resolve Persian date ${year}/${month}/${day}`);
}

function isoFromDate(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function dateFromIso(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function formatPersianDate(iso?: string | null) {
  if (!iso) return "";
  const date = dateFromIso(iso);
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatPersianDateCompact(iso?: string | null) {
  if (!iso) return "";
  const parts = persianPartsUtc(dateFromIso(iso));
  return `${FA_NUMBER.format(parts.year)}/${FA_NUMBER.format(parts.month)}/${FA_NUMBER.format(parts.day)}`;
}

function monthLength(year: number, month: number) {
  const first = gregorianFromPersian(year, month, 1);
  const next = addPersianMonths(year, month, 1);
  const nextFirst = gregorianFromPersian(next.year, next.month, 1);
  return Math.round((nextFirst.getTime() - first.getTime()) / 86_400_000);
}

function inBounds(iso: string, minDate?: string, maxDate?: string) {
  if (minDate && iso < minDate) return false;
  if (maxDate && iso > maxDate) return false;
  return true;
}

export function PersianDatePicker({
  mode = "single",
  value,
  onChange,
  onComplete,
  minDate,
  maxDate,
  autoClose = true,
  className,
}: PersianDatePickerProps) {
  const initialParts = useMemo(() => {
    const iso =
      typeof value === "string"
        ? value
        : value && typeof value === "object"
          ? (value.from ?? value.to)
          : null;
    return iso ? persianPartsUtc(dateFromIso(iso)) : persianToday();
  }, []); // Initial viewport intentionally stays stable while selecting a range.

  const [view, setView] = useState({
    year: initialParts.year,
    month: initialParts.month,
  });
  const [rangeDraft, setRangeDraft] = useState<PersianDateRangeValue>(() => {
    if (mode !== "range" || !value || typeof value === "string") {
      return { from: null, to: null };
    }
    return { from: value.from ?? null, to: value.to ?? null };
  });

  useEffect(() => {
    if (mode !== "range") return;
    if (!value || typeof value === "string") {
      setRangeDraft({ from: null, to: null });
      return;
    }
    setRangeDraft({ from: value.from ?? null, to: value.to ?? null });
  }, [mode, value]);

  const firstDate = useMemo(
    () => gregorianFromPersian(view.year, view.month, 1),
    [view.month, view.year],
  );
  const days = useMemo(
    () => monthLength(view.year, view.month),
    [view.month, view.year],
  );
  const startOffset = (firstDate.getUTCDay() + 1) % 7;
  const todayParts = persianToday();
  const todayIso = isoFromDate(
    gregorianFromPersian(todayParts.year, todayParts.month, todayParts.day),
  );

  const selectedSingle = typeof value === "string" ? value : null;
  const selectedRange =
    mode === "range" ? rangeDraft : { from: null, to: null };

  function changeMonth(delta: number) {
    setView((current) => addPersianMonths(current.year, current.month, delta));
  }

  function chooseDay(day: number) {
    const iso = isoFromDate(gregorianFromPersian(view.year, view.month, day));
    if (!inBounds(iso, minDate, maxDate)) return;

    if (mode === "single") {
      onChange(iso);
      if (autoClose) onComplete?.();
      return;
    }

    if (!selectedRange.from || selectedRange.to) {
      const next = { from: iso, to: null };
      setRangeDraft(next);
      onChange(next);
      return;
    }

    const ordered =
      iso < selectedRange.from
        ? { from: iso, to: selectedRange.from }
        : { from: selectedRange.from, to: iso };
    setRangeDraft(ordered);
    onChange(ordered);
    if (autoClose) onComplete?.();
  }

  function clear() {
    if (mode === "single") {
      onChange(null);
      return;
    }
    const next = { from: null, to: null };
    setRangeDraft(next);
    onChange(next);
  }

  function goToday() {
    setView({ year: todayParts.year, month: todayParts.month });
  }

  return (
    <div className={cx("w-full min-w-0 p-3 sm:p-4", className)} dir="rtl">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--adt-border)] pb-3">
        <DataButton
          aria-label="ماه بعد"
          icon={<ChevronRight size={16} />}
          iconOnly
          tone="ghost"
          size="sm"
          onClick={() => changeMonth(1)}
        />
        <div className="text-center">
          <strong className="block text-[12px] font-bold text-[var(--adt-text)]">
            {MONTH_NAMES[view.month - 1]} {FA_NUMBER.format(view.year)}
          </strong>
          <span className="mt-1 block text-[8px] text-[var(--adt-muted)]">
            {mode === "range"
              ? selectedRange.from && !selectedRange.to
                ? "تاریخ پایان را انتخاب کنید"
                : "بازه تاریخ را انتخاب کنید"
              : "یک تاریخ را انتخاب کنید"}
          </span>
        </div>
        <DataButton
          aria-label="ماه قبل"
          icon={<ChevronLeft size={16} />}
          iconOnly
          tone="ghost"
          size="sm"
          onClick={() => changeMonth(-1)}
        />
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1" aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="grid h-8 place-items-center text-[9px] font-semibold text-[var(--adt-muted)]"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-1"
        role="grid"
        aria-label="تقویم فارسی"
      >
        {Array.from({ length: startOffset }).map((_, index) => (
          <span key={`empty-${index}`} className="h-10 sm:h-11" />
        ))}

        {Array.from({ length: days }).map((_, index) => {
          const day = index + 1;
          const iso = isoFromDate(
            gregorianFromPersian(view.year, view.month, day),
          );
          const disabled = !inBounds(iso, minDate, maxDate);
          const isToday = iso === todayIso;
          const isSingle = mode === "single" && selectedSingle === iso;
          const isStart = mode === "range" && selectedRange.from === iso;
          const isEnd = mode === "range" && selectedRange.to === iso;
          const inRange =
            mode === "range" &&
            Boolean(selectedRange.from && selectedRange.to) &&
            iso >= (selectedRange.from ?? "") &&
            iso <= (selectedRange.to ?? "");

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              aria-selected={isSingle || isStart || isEnd || inRange}
              disabled={disabled}
              onClick={() => chooseDay(day)}
              className={cx(
                "relative grid h-10 min-w-0 cursor-pointer place-items-center border text-[10px] font-semibold outline-none transition-colors sm:h-11 focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/35 disabled:cursor-not-allowed disabled:opacity-25",
                isSingle || isStart || isEnd
                  ? "border-[var(--adt-accent)] bg-[var(--adt-accent)] text-white"
                  : inRange
                    ? "border-[var(--adt-accent)]/20 bg-[var(--adt-accent)]/[0.12] text-[var(--adt-text)]"
                    : "border-transparent text-[var(--adt-text)] hover:border-[var(--adt-border)] hover:bg-[var(--adt-surface-muted)]",
              )}
            >
              {FA_NUMBER.format(day)}
              {isToday && !isSingle && !isStart && !isEnd ? (
                <span className="absolute bottom-1 size-1 bg-[var(--adt-accent)]" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--adt-border)] pt-3">
        <div className="flex items-center gap-1.5">
          <DataButton
            tone="ghost"
            size="sm"
            icon={<CalendarDays size={14} />}
            onClick={goToday}
          >
            امروز
          </DataButton>
          <DataButton
            tone="ghost"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={clear}
          >
            پاک کردن
          </DataButton>
        </div>

        {mode === "range" && selectedRange.from ? (
          <div
            className="min-w-0 text-right text-[8px] leading-5 text-[var(--adt-muted)]"
            dir="rtl"
          >
            <span>{formatPersianDateCompact(selectedRange.from)}</span>
            <span className="mx-1">تا</span>
            <span>
              {selectedRange.to
                ? formatPersianDateCompact(selectedRange.to)
                : "…"}
            </span>
          </div>
        ) : selectedSingle ? (
          <span className="text-[8px] text-[var(--adt-muted)]">
            {formatPersianDateCompact(selectedSingle)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function DateValueLabel({
  value,
  placeholder = "انتخاب تاریخ",
}: {
  value?: string | null;
  placeholder?: string;
}) {
  return <>{value ? formatPersianDate(value) : placeholder}</>;
}

export function DateRangeValueLabel({
  value,
  placeholder = "انتخاب بازه",
}: {
  value?: PersianDateRangeValue | null;
  placeholder?: string;
}) {
  if (!value?.from && !value?.to) return <>{placeholder}</>;
  if (value.from && !value.to)
    return <>{formatPersianDateCompact(value.from)} تا …</>;
  return (
    <>
      {formatPersianDateCompact(value.from)} تا{" "}
      {formatPersianDateCompact(value.to)}
    </>
  );
}
