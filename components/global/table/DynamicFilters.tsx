"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Filter,
  LoaderCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import type {
  AnyRecord,
  DataSelectOption,
  DynamicFilterDefinition,
  PersianDateRangeValue,
} from "./types";
import { DataButton, DataInput, FilterChip, FloatingPanel } from "./primitives";
 
import { cx, isEmptyFilterValue, stableStringify } from "./utils";
import { formatPersianDateCompact, PersianDatePicker } from "@/components/ui/PersianDatePicker";

export type DynamicFiltersProps<TFilters extends AnyRecord, TRecord> = {
  definitions: DynamicFilterDefinition<TFilters, TRecord>[];
  committed: TFilters;
  onApply: (filters: TFilters) => void;
  onClear: () => void;
  baseQueryKey: readonly unknown[];
  labels: {
    filters: string;
    apply: string;
    clear: string;
    pending?: string;
  };
};

export function DynamicFilters<TFilters extends AnyRecord, TRecord>({
  definitions,
  committed,
  onApply,
  onClear,
  baseQueryKey,
  labels,
}: DynamicFiltersProps<TFilters, TRecord>) {
  const visibleDefinitions = useMemo(
    () => definitions.filter((definition) => !definition.hidden),
    [definitions],
  );
  const [draft, setDraft] = useState<TFilters>(committed);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setDraft(committed);
  }, [committed]);

  if (!visibleDefinitions.length) return null;

  const dirty = stableStringify(draft) !== stableStringify(committed);
  const activeCount = visibleDefinitions.reduce(
    (count, definition) =>
      count + (isEmptyFilterValue(committed[definition.id]) ? 0 : 1),
    0,
  );
  const activeDefinition = visibleDefinitions.find(
    (definition) => definition.id === activeId,
  );

  function setFilterValue(id: string, value: unknown) {
    setDraft((current) => ({ ...current, [id]: value }));
  }

  function resetDraft() {
    const next = { ...draft } as TFilters;
    const mutable = next as Record<string, unknown>;
    for (const definition of visibleDefinitions) {
      mutable[definition.id] = definition.defaultValue;
    }
    setDraft(next);
  }

  function clearAndCommit() {
    resetDraft();
    onClear();
    setActiveId(null);
  }

  return (
    <div
      dir="rtl"
      className="border-t border-[var(--adt-border)] bg-[var(--adt-chrome)] px-3 py-3 text-right sm:px-4 lg:px-5"
    >
      <div className="flex min-w-0 flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-2 text-[10px] font-bold text-[var(--adt-text)]">
          <Filter size={15} className="text-[var(--adt-accent-strong)]" />
          <span>{labels.filters}:</span>
          {activeCount ? (
            <span className="grid min-w-5 place-items-center border border-[var(--adt-accent)]/40 bg-[var(--adt-accent)]/[0.08] px-1.5 py-0.5 text-[8px] tabular-nums text-[var(--adt-accent-strong)]">
              {new Intl.NumberFormat("fa-IR").format(activeCount)}
            </span>
          ) : null}
        </div>

        <div
          data-lenis-prevent
          data-lenis-prevent-wheel
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-gutter:stable] [scrollbar-width:thin]"
        >
          <div className="flex min-w-max items-center gap-2">
            {visibleDefinitions.map((definition) => {
              const value = draft[definition.id];
              const committedValue = committed[definition.id];
              const summary = filterSummary(definition, value);
              const filterDirty =
                stableStringify(value) !== stableStringify(committedValue);
              return (
                <FilterChip
                  key={definition.id}
                  label={definition.label}
                  summary={summary}
                  active={activeId === definition.id}
                  dirty={filterDirty}
                  onClick={(event) => {
                    activeTriggerRef.current = event.currentTarget;
                    setActiveId((current) =>
                      current === definition.id ? null : definition.id,
                    );
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <DataButton
            tone="ghost"
            size="sm"
            icon={<RotateCcw size={14} />}
            disabled={!dirty && activeCount === 0}
            onClick={clearAndCommit}
          >
            {labels.clear}
          </DataButton>
          <DataButton
            tone="danger"
            size="sm"
            icon={<SlidersHorizontal size={14} />}
            disabled={!dirty}
            onClick={() => {
              onApply(draft);
              setActiveId(null);
            }}
          >
            {dirty ? labels.apply : (labels.pending ?? "اعمال شده")}
          </DataButton>
        </div>
      </div>

      {activeDefinition ? (
        <FilterEditorPopover
          definition={activeDefinition}
          filters={draft}
          value={draft[activeDefinition.id]}
          setValue={(value) => setFilterValue(activeDefinition.id, value)}
          baseQueryKey={baseQueryKey}
          triggerRef={activeTriggerRef}
          close={() => setActiveId(null)}
        />
      ) : null}
    </div>
  );
}

function FilterEditorPopover<TFilters extends AnyRecord, TRecord>({
  definition,
  filters,
  value,
  setValue,
  baseQueryKey,
  triggerRef,
  close,
}: {
  definition: DynamicFilterDefinition<TFilters, TRecord>;
  filters: TFilters;
  value: unknown;
  setValue: (value: unknown) => void;
  baseQueryKey: readonly unknown[];
  triggerRef: RefObject<HTMLButtonElement | null>;
  close: () => void;
}) {
  const optionQuery = useQuery<DataSelectOption[]>({
    queryKey:
      definition.kind === "select" || definition.kind === "multi-select"
        ? (definition.optionQueryKey?.(filters) ?? [
            ...baseQueryKey,
            "filter-options",
            definition.id,
          ])
        : [...baseQueryKey, "filter-options", definition.id, "unused"],
    queryFn: ({ signal }) => {
      if (definition.kind !== "select" && definition.kind !== "multi-select") {
        return Promise.resolve([]);
      }
      if (!definition.loadOptions) {
        return Promise.resolve(definition.options ?? []);
      }
      return definition.loadOptions({ signal, filters });
    },
    enabled:
      (definition.kind === "select" || definition.kind === "multi-select") &&
      Boolean(definition.loadOptions),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return (
    <FloatingPanel
      open
      onClose={close}
      triggerRef={triggerRef}
      title={definition.label}
      desktopWidth={
        definition.kind === "date" || definition.kind === "date-range"
          ? 390
          : 360
      }
    >
      <div className="border-b border-[var(--adt-border)] px-4 py-3 md:hidden">
        {definition.description ? (
          <p className="text-[9px] leading-5 text-[var(--adt-muted)]">
            {definition.description}
          </p>
        ) : null}
      </div>
      <FilterEditor
        definition={definition}
        filters={filters}
        value={value}
        setValue={setValue}
        close={close}
        options={
          optionQuery.data ??
          (definition.kind === "select" || definition.kind === "multi-select"
            ? (definition.options ?? [])
            : [])
        }
        optionsLoading={optionQuery.isFetching && !optionQuery.data}
        optionsError={optionQuery.isError}
      />
    </FloatingPanel>
  );
}

function FilterEditor<TFilters extends AnyRecord, TRecord>({
  definition,
  filters,
  value,
  setValue,
  close,
  options,
  optionsLoading,
  optionsError,
}: {
  definition: DynamicFilterDefinition<TFilters, TRecord>;
  filters: TFilters;
  value: unknown;
  setValue: (value: unknown) => void;
  close: () => void;
  options: DataSelectOption[];
  optionsLoading: boolean;
  optionsError: boolean;
}) {
  const [search, setSearch] = useState("");
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      [option.label, option.description, ...(option.keywords ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [options, search]);

  if (definition.kind === "date") {
    return (
      <PersianDatePicker
        mode="single"
        value={typeof value === "string" ? value : null}
        minDate={definition.minDate}
        maxDate={definition.maxDate}
        onChange={setValue}
        onComplete={close}
      />
    );
  }

  if (definition.kind === "date-range") {
    const range =
      value && typeof value === "object"
        ? (value as PersianDateRangeValue)
        : { from: null, to: null };
    return (
      <PersianDatePicker
        mode="range"
        value={range}
        minDate={definition.minDate}
        maxDate={definition.maxDate}
        onChange={setValue}
        onComplete={close}
      />
    );
  }

  if (definition.kind === "select" || definition.kind === "multi-select") {
    const selectedValues =
      definition.kind === "multi-select"
        ? Array.isArray(value)
          ? value.map(String)
          : []
        : typeof value === "string"
          ? [value]
          : [];

    function toggle(option: DataSelectOption) {
      if (option.disabled) return;
      if (definition.kind === "select") {
        setValue(option.value);
        close();
        return;
      }
      const next = selectedValues.includes(option.value)
        ? selectedValues.filter((item) => item !== option.value)
        : [...selectedValues, option.value];
      setValue(next);
    }

    return (
      <div className="p-3 sm:p-4">
        {definition.description ? (
          <p className="mb-3 hidden text-[9px] leading-5 text-[var(--adt-muted)] md:block">
            {definition.description}
          </p>
        ) : null}

        {(definition.searchable ?? options.length > 8) ? (
          <DataInput
            type="search"
            placeholder="جستجو..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leadingIcon={<Search size={14} />}
            autoFocus
          />
        ) : null}

        {optionsLoading ? (
          <div className="grid min-h-[160px] place-items-center text-[10px] text-[var(--adt-muted)]">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={15} className="animate-spin" />
              در حال دریافت گزینه‌ها…
            </span>
          </div>
        ) : optionsError ? (
          <div className="mt-2 border border-[var(--adt-danger)]/30 bg-[var(--adt-danger)]/[0.05] px-3 py-4 text-[9px] leading-5 text-[var(--adt-danger)]">
            دریافت گزینه‌های این فیلتر انجام نشد. فیلتر را ببندید و دوباره باز
            کنید.
          </div>
        ) : (
          <div className="mt-2 max-h-[320px] overflow-y-auto border border-[var(--adt-border)]">
            {definition.kind === "multi-select" && definition.allowSelectAll ? (
              <button
                type="button"
                onClick={() => {
                  const enabled = filteredOptions
                    .filter((option) => !option.disabled)
                    .map((option) => option.value);
                  const all = enabled.every((item) =>
                    selectedValues.includes(item),
                  );
                  setValue(
                    all
                      ? selectedValues.filter((item) => !enabled.includes(item))
                      : Array.from(new Set([...selectedValues, ...enabled])),
                  );
                }}
                className="flex min-h-10 w-full cursor-pointer items-center justify-between border-b border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-3 text-[9px] font-semibold text-[var(--adt-muted)] hover:text-[var(--adt-text)]"
              >
                <span>انتخاب همه</span>
                <span>
                  {new Intl.NumberFormat("fa-IR").format(selectedValues.length)}
                </span>
              </button>
            ) : null}

            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const selected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => toggle(option)}
                    className={cx(
                      "flex min-h-11 w-full cursor-pointer items-center gap-3 border-b border-[var(--adt-border)] px-3 text-right last:border-b-0 hover:bg-[var(--adt-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40",
                      selected && "bg-[var(--adt-accent)]/[0.08]",
                    )}
                  >
                    {definition.kind === "multi-select" ? (
                      <span
                        className={cx(
                          "grid size-4 shrink-0 place-items-center border",
                          selected
                            ? "border-[var(--adt-accent)] bg-[var(--adt-accent)] text-white"
                            : "border-[var(--adt-border-strong)]",
                        )}
                      >
                        {selected ? <Check size={11} /> : null}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-semibold text-[var(--adt-text)]">
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="mt-0.5 block truncate text-[8px] text-[var(--adt-muted)]">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {definition.kind === "select" && selected ? (
                      <Check
                        size={14}
                        className="text-[var(--adt-accent-strong)]"
                      />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-[9px] text-[var(--adt-muted)]">
                گزینه‌ای پیدا نشد.
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <DataButton
            tone="ghost"
            size="sm"
            onClick={() =>
              setValue(definition.kind === "multi-select" ? [] : null)
            }
          >
            پاک کردن
          </DataButton>
          {definition.kind === "multi-select" ? (
            <DataButton tone="secondary" size="sm" onClick={close}>
              ثبت انتخاب
            </DataButton>
          ) : null}
        </div>
      </div>
    );
  }

  if (definition.kind === "boolean") {
    const current = typeof value === "boolean" ? value : null;
    return (
      <div className="p-3 sm:p-4">
        <div className="grid gap-2">
          {[
            { value: true, label: definition.trueLabel ?? "بله" },
            { value: false, label: definition.falseLabel ?? "خیر" },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                setValue(option.value);
                close();
              }}
              className={cx(
                "flex min-h-11 w-full cursor-pointer items-center justify-between border px-3 text-[10px] font-semibold",
                current === option.value
                  ? "border-[var(--adt-accent)] bg-[var(--adt-accent)]/[0.08] text-[var(--adt-text)]"
                  : "border-[var(--adt-border)] text-[var(--adt-muted)] hover:bg-[var(--adt-surface-muted)] hover:text-[var(--adt-text)]",
              )}
            >
              <span>{option.label}</span>
              {current === option.value ? <Check size={14} /> : null}
            </button>
          ))}
        </div>
        <DataButton
          tone="ghost"
          size="sm"
          className="mt-3"
          onClick={() => {
            setValue(null);
            close();
          }}
        >
          همه
        </DataButton>
      </div>
    );
  }

  if (definition.kind === "text" || definition.kind === "number") {
    const textValue =
      typeof value === "string" || typeof value === "number"
        ? String(value)
        : "";
    return (
      <div className="p-3 sm:p-4">
        <DataInput
          label={definition.label}
          type={definition.kind === "number" ? "number" : "text"}
          min={definition.kind === "number" ? definition.min : undefined}
          max={definition.kind === "number" ? definition.max : undefined}
          placeholder={definition.placeholder}
          value={textValue}
          autoFocus
          onChange={(event) =>
            setValue(
              definition.kind === "number"
                ? event.target.value === ""
                  ? null
                  : Number(event.target.value)
                : event.target.value,
            )
          }
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <DataButton tone="ghost" size="sm" onClick={() => setValue(null)}>
            پاک کردن
          </DataButton>
          <DataButton tone="secondary" size="sm" onClick={close}>
            ثبت مقدار
          </DataButton>
        </div>
      </div>
    );
  }

  if (definition.kind === "custom") {
    return (
      <div className="p-3 sm:p-4">
        {definition.render({ value, setValue, filters, close })}
      </div>
    );
  }

  return null;
}

function filterSummary<TFilters extends AnyRecord, TRecord>(
  definition: DynamicFilterDefinition<TFilters, TRecord>,
  value: unknown,
) {
  if (isEmptyFilterValue(value)) return undefined;
  const custom = definition.badge?.(value);
  if (custom) return custom;

  if (definition.kind === "date") {
    return typeof value === "string"
      ? formatPersianDateCompact(value)
      : undefined;
  }

  if (definition.kind === "date-range") {
    const range = value as PersianDateRangeValue;
    if (!range?.from && !range?.to) return undefined;
    return `${range.from ? formatPersianDateCompact(range.from) : "…"} - ${
      range.to ? formatPersianDateCompact(range.to) : "…"
    }`;
  }

  if (definition.kind === "boolean") {
    if (value === true) return definition.trueLabel ?? "بله";
    if (value === false) return definition.falseLabel ?? "خیر";
  }

  if (definition.kind === "multi-select" && Array.isArray(value)) {
    return `${new Intl.NumberFormat("fa-IR").format(value.length)} انتخاب`;
  }

  if (definition.kind === "select") {
    const option = definition.options?.find(
      (item) => item.value === String(value),
    );
    return option?.label ?? "انتخاب شده";
  }

  return String(value);
}
