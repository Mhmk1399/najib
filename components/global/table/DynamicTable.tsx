"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileSpreadsheet,
  ImageDown,
  ListChecks,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DataButton, DataInput, DataSelect, FloatingPanel } from "./primitives";
import type {
  AnyRecord,
  DynamicColumn,
  DynamicCrudConfig,
  DynamicDataTableProps,
  DynamicFormValues,
  DynamicSortRule,
  DynamicTableLabels,
} from "./types";
import {
  compactFilters,
  cx,
  formatUnknown,
  getColumnValue,
  isEmptyFilterValue,
  isTruthyConfig,
  pageCountFrom,
  stableStringify,
} from "./utils";
import {
  useAdminTheme,
  getAdminDataThemeVars,
} from "@/components/admin/useAdminTheme";
import { DynamicFilters } from "./DynamicFilters";
import { DynamicForm } from "./DynamicForm";
import { DynamicModal } from "./DynamicModal";
import { DynamicRecordView } from "./DynamicRecordView";
import { exportTableToExcel, exportTableToImage } from "./table-export";

const DEFAULT_LABELS: Required<DynamicTableLabels> = {
  refresh: "بروزرسانی",
  refreshing: "در حال بروزرسانی",
  filters: "فیلترها",
  clearFilters: "پاک کردن",
  applyFilters: "اعمال فیلترها",
  pendingFilters: "اعمال شده",
  columns: "ستون‌ها",
  create: "ایجاد مورد جدید",
  view: "مشاهده",
  edit: "ویرایش",
  delete: "حذف",
  actions: "عملیات",
  previousPage: "صفحه قبل",
  nextPage: "صفحه بعد",
  rowsPerPage: "تعداد در صفحه",
  loading: "در حال دریافت اطلاعات",
  error: "دریافت اطلاعات انجام نشد",
  retry: "تلاش دوباره",
  close: "بستن",
  cancel: "انصراف",
  save: "ذخیره",
  createSave: "ایجاد",
  editSave: "ذخیره تغییرات",
  noValue: "—",
  selectRow: "انتخاب ردیف",
  selectAllRows: "انتخاب همه ردیف‌های این صفحه",
  selectedRows: "ردیف انتخاب شده",
  clearSelection: "پاک کردن انتخاب‌ها",
  exportExcel: "خروجی اکسل",
  exportImage: "خروجی تصویر",
  exportSuccess: "فایل خروجی با موفقیت آماده شد.",
  exportError: "ساخت فایل خروجی انجام نشد. دوباره تلاش کنید.",
};

type DialogState<TRecord> =
  | { type: "closed" }
  | { type: "create" }
  | { type: "view"; record: TRecord }
  | { type: "edit"; record: TRecord }
  | { type: "delete"; record: TRecord };

type Announcement = {
  tone: "success" | "error" | "info";
  message: string;
};

export function DynamicDataTable<
  TRecord,
  TCreateValues extends DynamicFormValues = DynamicFormValues,
  TEditValues extends DynamicFormValues = DynamicFormValues,
  TFilters extends AnyRecord = AnyRecord,
>({
  tableId,
  title,
  description,
  eyebrow,
  direction = "rtl",
  locale = "fa-IR",
  source,
  columns,
  getRowId,
  getRowLabel,
  search,
  filters = [],
  initialFilters,
  pagination,
  columnVisibility,
  selection,
  exportOptions,
  mobile,
  crud,
  emptyState,
  labels: labelOverrides,
  renderMeta,
  onStateChange,
  className,
}: DynamicDataTableProps<TRecord, TCreateValues, TEditValues, TFilters>) {
  const theme = useAdminTheme();
  const themeVars = useMemo(() => getAdminDataThemeVars(theme), [theme]);
  const queryClient = useQueryClient();
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const tableRootRef = useRef<HTMLElement | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.initialPageSize ?? 15);
  const [searchInput, setSearchInput] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [composing, setComposing] = useState(false);
  const [sort, setSort] = useState<DynamicSortRule[]>([]);
  const [committedFilters, setCommittedFilters] = useState<TFilters>(() =>
    buildInitialFilters(initialFilters, filters),
  );
  const [dialog, setDialog] = useState<DialogState<TRecord>>({
    type: "closed",
  });
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [exportBusy, setExportBusy] = useState<"excel" | "image" | null>(
    null,
  );

  const columnSignature = columns
    .map(
      (column) =>
        `${column.id}:${column.defaultHidden ? 1 : 0}:${column.desktop?.hidden ? 1 : 0}:${column.lockVisibility ? 1 : 0}`,
    )
    .join("|");

  const defaultVisibleColumnIds = useMemo(
    () =>
      columns
        .filter((column) => !column.defaultHidden && !column.desktop?.hidden)
        .map((column) => column.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnSignature],
  );

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    defaultVisibleColumnIds,
  );
  const [columnPreferencesReady, setColumnPreferencesReady] = useState(
    !columnVisibility?.persist,
  );
  const columnStorageKey =
    columnVisibility?.storageKey ?? `najib-admin-table:${tableId}:columns`;

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!columnVisibility?.persist) {
        setVisibleColumnIds(defaultVisibleColumnIds);
        setColumnPreferencesReady(true);
        return;
      }
      setColumnPreferencesReady(false);
      try {
        const saved = localStorage.getItem(columnStorageKey);
        const parsed = saved ? JSON.parse(saved) as string[] : [];
        const valid = parsed.filter((id) => columns.some((column) => column.id === id));
        setVisibleColumnIds(valid.length ? valid : defaultVisibleColumnIds);
      } catch {
        setVisibleColumnIds(defaultVisibleColumnIds);
      } finally {
        setColumnPreferencesReady(true);
      }
    });
    return () => { cancelled = true; };
  }, [columnStorageKey, columnVisibility?.persist, columnSignature, columns, defaultVisibleColumnIds]);

  useEffect(() => {
    if (!columnVisibility?.persist || !columnPreferencesReady) return;
    localStorage.setItem(columnStorageKey, JSON.stringify(visibleColumnIds));
  }, [
    columnPreferencesReady,
    columnStorageKey,
    columnVisibility?.persist,
    visibleColumnIds,
  ]);

  useEffect(() => {
    if (search?.enabled === false || composing) return;
    const timeout = window.setTimeout(() => {
      setPage(1);
      setCommittedSearch(searchInput.trim());
    }, search?.debounceMs ?? 320);
    return () => window.clearTimeout(timeout);
  }, [composing, search?.debounceMs, search?.enabled, searchInput]);

  useEffect(() => {
    onStateChange?.({
      page,
      pageSize,
      search: committedSearch,
      sort,
      filters: committedFilters,
    });
  }, [committedFilters, committedSearch, onStateChange, page, pageSize, sort]);

  useEffect(() => {
    if (!announcement) return;
    const timeout = window.setTimeout(() => setAnnouncement(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [announcement]);

  const requestFilters = useMemo(() => {
    const next = { ...committedFilters } as TFilters;
    for (const definition of filters) {
      if (!definition.serialize) continue;
      next[definition.id] = definition.serialize(
        committedFilters[definition.id],
      ) as TFilters[typeof definition.id];
    }
    return next;
  }, [committedFilters, filters]);

  const queryKey = useMemo(
    () => [
      ...source.queryKey,
      "page",
      {
        page,
        pageSize,
        search: committedSearch,
        sort,
        filters: compactFilters(requestFilters),
      },
    ],
    [committedSearch, page, pageSize, requestFilters, sort, source.queryKey],
  );

  const tableQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      source.fetchPage({
        page,
        pageSize,
        search: committedSearch,
        sort,
        filters: requestFilters,
        signal,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const records = useMemo(
    () => tableQuery.data?.items ?? [],
    [tableQuery.data?.items],
  );
  const total = tableQuery.data?.total ?? 0;
  const selectionEnabled = selection?.enabled !== false;
  const selectionMode = selection?.mode ?? "multiple";
  const isRowSelectable = selection?.isRowSelectable;
  const selectableRecords = useMemo(
    () =>
      selectionEnabled
        ? records.filter((record) => isRowSelectable?.(record) !== false)
        : [],
    [isRowSelectable, records, selectionEnabled],
  );
  const selectedRowIdSet = useMemo(
    () => new Set(selectedRowIds),
    [selectedRowIds],
  );
  const selectedRecords = useMemo(
    () => records.filter((record) => selectedRowIdSet.has(getRowId(record))),
    [getRowId, records, selectedRowIdSet],
  );
  const activeSelectedRowIds = useMemo(
    () => selectedRecords.map(getRowId),
    [getRowId, selectedRecords],
  );
  const allPageRowsSelected =
    selectableRecords.length > 0 &&
    selectableRecords.every((record) => selectedRowIdSet.has(getRowId(record)));
  const somePageRowsSelected =
    !allPageRowsSelected &&
    selectableRecords.some((record) => selectedRowIdSet.has(getRowId(record)));
  const reportedPageCount =
    tableQuery.data?.pageCount ??
    pageCountFrom(total, tableQuery.data?.pageSize ?? pageSize);
  const totalPages = Number.isFinite(reportedPageCount)
    ? Math.max(1, Math.floor(reportedPageCount))
    : 1;

  useEffect(() => {
    if (tableQuery.isFetching || page <= totalPages) return;
    const frame = requestAnimationFrame(() => setPage(totalPages));
    return () => cancelAnimationFrame(frame);
  }, [page, tableQuery.isFetching, totalPages]);

  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (column) =>
          !column.desktop?.hidden && visibleColumnIds.includes(column.id),
      ),
    [columns, visibleColumnIds],
  );
  const exportColumns = useMemo(
    () =>
      (exportOptions?.includeHiddenColumns ? columns : visibleColumns).filter(
        (column) => column.exportable !== false,
      ),
    [columns, exportOptions?.includeHiddenColumns, visibleColumns],
  );

  const mobileColumns = useMemo(() => {
    const pool = columns.filter((column) => !column.mobile?.hidden);
    const requested = mobile?.fieldIds;
    const filtered = requested?.length
      ? requested
          .map((id) => pool.find((column) => column.id === id))
          .filter(Boolean)
      : pool.filter((column) => visibleColumnIds.includes(column.id));
    return (filtered as DynamicColumn<TRecord>[])
      .sort((a, b) => (a.mobile?.priority ?? 99) - (b.mobile?.priority ?? 99))
      .slice(0, mobile?.maxFields ?? 6);
  }, [columns, mobile?.fieldIds, mobile?.maxFields, visibleColumnIds]);

  const activeFilterCount = filters.reduce(
    (count, definition) =>
      count + (isEmptyFilterValue(committedFilters[definition.id]) ? 0 : 1),
    0,
  );
  const hasQueryConstraints =
    Boolean(committedSearch) || activeFilterCount > 0 || sort.length > 0;
  const hasRowActions = Boolean(
    crud?.view || crud?.edit || crud?.delete || crud?.extraRowActions?.length,
  );
  const canCreate = Boolean(crud?.create && crud.create.enabled !== false);
  const canExportExcel =
    exportOptions?.enabled !== false && exportOptions?.excel !== false;
  const canExportImage =
    exportOptions?.enabled !== false && exportOptions?.image !== false;

  function announce(message: string, tone: Announcement["tone"] = "success") {
    setAnnouncement({ message, tone });
  }

  function toggleRowSelection(record: TRecord) {
    if (!selectionEnabled || isRowSelectable?.(record) === false)
      return;
    const rowId = getRowId(record);
    if (selectedRowIdSet.has(rowId)) {
      setSelectedRowIds(activeSelectedRowIds.filter((id) => id !== rowId));
      return;
    }
    setSelectedRowIds(
      selectionMode === "single"
        ? [rowId]
        : [...activeSelectedRowIds, rowId],
    );
  }

  function toggleAllPageRows() {
    if (selectionMode !== "multiple") return;
    setSelectedRowIds(
      allPageRowsSelected ? [] : selectableRecords.map(getRowId),
    );
  }

  async function runExport(kind: "excel" | "image") {
    const exportRecords = selectedRecords.length ? selectedRecords : records;
    if (!exportRecords.length || !exportColumns.length || exportBusy) return;

    setExportBusy(kind);
    try {
      const args = {
        title,
        records: exportRecords,
        columns: exportColumns,
        displayedRows: readDisplayedTableRows(
          tableRootRef.current,
          exportRecords,
          exportColumns,
          getRowId,
        ),
        locale,
        direction,
        fileName: exportOptions?.fileName,
        sheetName: exportOptions?.sheetName,
        theme,
      };
      if (kind === "excel") await exportTableToExcel(args);
      else await exportTableToImage(args);
      announce(labels.exportSuccess);
    } catch (error) {
      console.error(`Dynamic table ${kind} export failed`, error);
      announce(labels.exportError, "error");
    } finally {
      setExportBusy(null);
    }
  }

  async function refresh() {
    await tableQuery.refetch({ cancelRefetch: true });
  }

  function applyFilters(next: TFilters) {
    setPage(1);
    setCommittedFilters(next);
  }

  function clearFilters() {
    setPage(1);
    setCommittedFilters(buildInitialFilters(initialFilters, filters));
  }

  function toggleSort(
    column: DynamicColumn<TRecord>,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    if (!column.sortable) return;
    const key = column.sortKey ?? column.id;
    const existing = sort.find((rule) => rule.id === column.id);
    const nextDirection =
      existing?.direction === "asc"
        ? "desc"
        : existing?.direction === "desc"
          ? null
          : "asc";

    const next = event.shiftKey
      ? sort.filter((rule) => rule.id !== column.id)
      : [];
    if (nextDirection)
      next.push({ id: column.id, key, direction: nextDirection });
    setPage(1);
    setSort(next);
  }

  function updateVisibleColumns(next: string[]) {
    const locked = columns
      .filter((column) => column.lockVisibility && !column.desktop?.hidden)
      .map((column) => column.id);
    const merged = Array.from(new Set([...locked, ...next]));
    if (merged.length) setVisibleColumnIds(merged);
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(total, page * pageSize);

  return (
    <section
      ref={tableRootRef}
      dir={direction}
      style={themeVars}
      className={cx(
        "min-w-0 w-full overflow-hidden border border-[var(--adt-border)] bg-[var(--adt-surface)] text-right text-[var(--adt-text)]",
        className,
      )}
    >
      <header className="border-b border-[var(--adt-border)] bg-[var(--adt-surface)]">
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <div className="mb-1.5 text-[8px] font-semibold text-[var(--adt-accent-strong)]">
                {eyebrow}
              </div>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-[18px] font-extrabold tracking-[-0.03em] sm:text-[20px]">
                {title}
              </h1>
              {tableQuery.data ? (
                <span className="text-[9px] tabular-nums text-[var(--adt-muted)]">
                  {new Intl.NumberFormat(locale).format(total)} مورد
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="mt-1.5 max-w-[760px] text-[10px] leading-5 text-[var(--adt-muted)]">
                {description}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
            <DataButton
              tone="secondary"
              size="md"
              icon={<RefreshCw size={15} />}
              loading={tableQuery.isFetching && !tableQuery.isLoading}
              onClick={refresh}
            >
              {tableQuery.isFetching && !tableQuery.isLoading
                ? labels.refreshing
                : labels.refresh}
            </DataButton>
            {canCreate ? (
              <DataButton
                tone="secondary"
                size="md"
                icon={<Plus size={15} />}
                onClick={() => setDialog({ type: "create" })}
              >
                {crud?.create?.label ?? labels.create}
              </DataButton>
            ) : null}
          </div>
        </div>

        <div className="grid min-w-0 gap-3 border-t border-[var(--adt-border)] px-4 py-3 sm:px-5 lg:grid-cols-[minmax(240px,560px)_auto] lg:items-center lg:justify-between">
          {search?.enabled === false ? (
            <span />
          ) : (
            <DataInput
              type="search"
              value={searchInput}
              placeholder={search?.placeholder ?? "جستجو در اطلاعات…"}
              leadingIcon={<Search size={15} />}
              aria-label="جستجو"
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={(event) => {
                setComposing(false);
                setSearchInput(event.currentTarget.value);
              }}
              onChange={(event) => setSearchInput(event.target.value)}
              trailing={
                searchInput ? (
                  <button
                    type="button"
                    aria-label="پاک کردن جستجو"
                    onClick={() => {
                      setSearchInput("");
                      setCommittedSearch("");
                      setPage(1);
                    }}
                    className="grid size-8 cursor-pointer place-items-center text-[var(--adt-muted)] hover:text-[var(--adt-text)]"
                  >
                    <X size={14} />
                  </button>
                ) : null
              }
            />
          )}

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            {selectionEnabled && selectedRecords.length ? (
              <div
                role="status"
                aria-live="polite"
                className="inline-flex min-h-9 items-center gap-2 border border-[var(--adt-accent)]/30 bg-[var(--adt-accent)]/[0.08] px-2.5 text-[10px] font-semibold text-[var(--adt-text)]"
              >
                <ListChecks
                  size={14}
                  className="text-[var(--adt-accent-strong)]"
                />
                <span className="tabular-nums">
                  {new Intl.NumberFormat(locale).format(selectedRecords.length)}{" "}
                  {labels.selectedRows}
                </span>
                <button
                  type="button"
                  aria-label={labels.clearSelection}
                  title={labels.clearSelection}
                  onClick={() => setSelectedRowIds([])}
                  className="grid size-7 cursor-pointer place-items-center text-[var(--adt-muted)] outline-none hover:text-[var(--adt-text)] focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/35"
                >
                  <X size={13} />
                </button>
              </div>
            ) : null}

            {canExportExcel ? (
              <DataButton
                tone="secondary"
                size="sm"
                icon={<FileSpreadsheet size={14} />}
                loading={exportBusy === "excel"}
                disabled={
                  !records.length || !exportColumns.length || Boolean(exportBusy)
                }
                title={
                  selectedRecords.length
                    ? `${labels.exportExcel} (${new Intl.NumberFormat(locale).format(selectedRecords.length)} ${labels.selectedRows})`
                    : `${labels.exportExcel} (صفحه جاری)`
                }
                onClick={() => void runExport("excel")}
              >
                {labels.exportExcel}
              </DataButton>
            ) : null}

            {canExportImage ? (
              <DataButton
                tone="secondary"
                size="sm"
                icon={<ImageDown size={14} />}
                loading={exportBusy === "image"}
                disabled={
                  !records.length || !exportColumns.length || Boolean(exportBusy)
                }
                title={
                  selectedRecords.length
                    ? `${labels.exportImage} (${new Intl.NumberFormat(locale).format(selectedRecords.length)} ${labels.selectedRows})`
                    : `${labels.exportImage} (صفحه جاری)`
                }
                onClick={() => void runExport("image")}
              >
                {labels.exportImage}
              </DataButton>
            ) : null}

            {columnVisibility?.enabled ? (
              <div className="w-full sm:w-[190px]">
                <DataSelect
                  placeholder={labels.columns}
                  options={columns
                    .filter(
                      (column) =>
                        !column.lockVisibility && !column.desktop?.hidden,
                    )
                    .map((column) => ({
                      value: column.id,
                      label: column.label,
                    }))}
                  value={visibleColumnIds.filter((id) =>
                    columns.some(
                      (column) => column.id === id && !column.lockVisibility,
                    ),
                  )}
                  multiple
                  searchable={columns.length > 9}
                  allowSelectAll
                  onChange={(value) => {
                    if (Array.isArray(value)) updateVisibleColumns(value);
                  }}
                />
              </div>
            ) : null}

            {hasQueryConstraints ? (
              <DataButton
                tone="ghost"
                size="sm"
                icon={<X size={13} />}
                onClick={() => {
                  setSearchInput("");
                  setCommittedSearch("");
                  setSort([]);
                  clearFilters();
                }}
              >
                پاک‌سازی همه
              </DataButton>
            ) : null}
          </div>
        </div>

        {filters.length ? (
          <DynamicFilters
            key={stableStringify(committedFilters)}
            definitions={filters}
            committed={committedFilters}
            onApply={applyFilters}
            onClear={clearFilters}
            baseQueryKey={source.queryKey}
            labels={{
              filters: labels.filters,
              apply: labels.applyFilters,
              clear: labels.clearFilters,
              pending: labels.pendingFilters,
            }}
          />
        ) : null}

        {announcement ? (
          <div
            role={announcement.tone === "error" ? "alert" : "status"}
            aria-live="polite"
            className={cx(
              "border-t px-4 py-2.5 text-[9px] sm:px-5",
              announcement.tone === "success"
                ? "border-[var(--adt-success)]/25 bg-[var(--adt-success)]/[0.05] text-[var(--adt-success)]"
                : announcement.tone === "error"
                  ? "border-[var(--adt-danger)]/25 bg-[var(--adt-danger)]/[0.05] text-[var(--adt-danger)]"
                  : "border-[var(--adt-info)]/25 bg-[var(--adt-info)]/[0.05] text-[var(--adt-info)]",
            )}
          >
            {announcement.message}
          </div>
        ) : null}
      </header>

      {renderMeta && tableQuery.data?.meta !== undefined ? (
        <div className="border-b border-[var(--adt-border)] px-4 py-3 sm:px-5">
          {renderMeta(tableQuery.data.meta)}
        </div>
      ) : null}

      <div className="hidden md:block">
        <DesktopTable
          columns={visibleColumns}
          records={records}
          getRowId={getRowId}
          getRowLabel={getRowLabel}
          selectionEnabled={selectionEnabled}
          selectionMode={selectionMode}
          isRowSelectable={isRowSelectable}
          selectedRowIds={selectedRowIdSet}
          hasSelectableRows={selectableRecords.length > 0}
          allPageRowsSelected={allPageRowsSelected}
          somePageRowsSelected={somePageRowsSelected}
          onToggleRow={toggleRowSelection}
          onToggleAllRows={toggleAllPageRows}
          sort={sort}
          onSort={toggleSort}
          hasRowActions={hasRowActions}
          crud={crud}
          openDialog={setDialog}
          locale={locale}
          loading={tableQuery.isLoading}
          fetching={tableQuery.isFetching}
          error={tableQuery.isError}
          onRetry={() => tableQuery.refetch()}
          labels={labels}
          announce={announce}
        />
      </div>

      <div className="md:hidden">
        <MobileCards
          records={records}
          columns={mobileColumns}
          mobile={mobile}
          getRowId={getRowId}
          getRowLabel={getRowLabel}
          selectionEnabled={selectionEnabled}
          isRowSelectable={isRowSelectable}
          selectedRowIds={selectedRowIdSet}
          onToggleRow={toggleRowSelection}
          crud={crud}
          openDialog={setDialog}
          locale={locale}
          loading={tableQuery.isLoading}
          error={tableQuery.isError}
          onRetry={() => tableQuery.refetch()}
          labels={labels}
          announce={announce}
        />
      </div>

      {!tableQuery.isLoading && !tableQuery.isError && records.length === 0 ? (
        <EmptyTableState
          filtered={hasQueryConstraints}
          emptyState={emptyState}
          canCreate={canCreate}
          onCreate={() => setDialog({ type: "create" })}
          onClear={() => {
            setSearchInput("");
            setCommittedSearch("");
            setSort([]);
            clearFilters();
          }}
        />
      ) : null}

      <footer className="border-t border-[var(--adt-border)] bg-[var(--adt-surface)] px-3 py-3 sm:px-5">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          pageCount={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          locale={locale}
          pageSizeOptions={pagination?.pageSizeOptions ?? [10, 15, 25, 50, 100]}
          showPageNumbers={pagination?.showPageNumbers !== false}
          labels={labels}
          onPageChange={setPage}
          onPageSizeChange={(next) => {
            setPage(1);
            setPageSize(next);
          }}
        />
      </footer>

      <CrudDialogs
        state={dialog}
        close={() => setDialog({ type: "closed" })}
        crud={crud}
        source={source}
        getRowId={getRowId}
        getRowLabel={getRowLabel}
        locale={locale}
        labels={labels}
        onMutated={async (kind) => {
          if (kind === "delete" && records.length === 1 && page > 1) {
            setPage((current) => Math.max(1, current - 1));
          }
          await queryClient.invalidateQueries({
            queryKey: source.queryKey,
            refetchType: "none",
          });
          await queryClient.refetchQueries({
            queryKey,
            exact: true,
            type: "active",
          });
          announce(
            kind === "create"
              ? "مورد جدید با موفقیت ایجاد شد."
              : kind === "edit"
                ? "تغییرات با موفقیت ذخیره شد."
                : "مورد انتخاب‌شده حذف شد.",
          );
        }}
        announce={announce}
      />
    </section>
  );
}

function SelectionCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      aria-checked={indeterminate ? "mixed" : checked}
      onChange={onChange}
      className="size-4 shrink-0 cursor-pointer accent-[var(--adt-accent-strong)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/40 disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
}

function DesktopTable<
  TRecord,
  TCreateValues extends DynamicFormValues,
  TEditValues extends DynamicFormValues,
>({
  columns,
  records,
  getRowId,
  getRowLabel,
  selectionEnabled,
  selectionMode,
  isRowSelectable,
  selectedRowIds,
  hasSelectableRows,
  allPageRowsSelected,
  somePageRowsSelected,
  onToggleRow,
  onToggleAllRows,
  sort,
  onSort,
  hasRowActions,
  crud,
  openDialog,
  locale,
  loading,
  fetching,
  error,
  onRetry,
  labels,
  announce,
}: {
  columns: DynamicColumn<TRecord>[];
  records: TRecord[];
  getRowId: (record: TRecord) => string;
  getRowLabel?: (record: TRecord) => string;
  selectionEnabled: boolean;
  selectionMode: "single" | "multiple";
  isRowSelectable?: (record: TRecord) => boolean;
  selectedRowIds: Set<string>;
  hasSelectableRows: boolean;
  allPageRowsSelected: boolean;
  somePageRowsSelected: boolean;
  onToggleRow: (record: TRecord) => void;
  onToggleAllRows: () => void;
  sort: DynamicSortRule[];
  onSort: (
    column: DynamicColumn<TRecord>,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  hasRowActions: boolean;
  crud?: DynamicCrudConfig<TRecord, TCreateValues, TEditValues>;
  openDialog: (state: DialogState<TRecord>) => void;
  locale: string;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  onRetry: () => void;
  labels: Required<DynamicTableLabels>;
  announce: (message: string, tone?: Announcement["tone"]) => void;
}) {
  if (error && !records.length)
    return <ErrorState onRetry={onRetry} labels={labels} />;

  return (
    <div className="relative min-w-0">
      <div
        data-lenis-prevent
        data-lenis-prevent-wheel
        className="min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-gutter:stable] [scrollbar-width:thin]"
      >
        <table className="w-full min-w-[860px] border-collapse">
          <caption className="sr-only">جدول اطلاعات مدیریت</caption>
          <thead className="bg-[var(--adt-surface-muted)] text-[var(--adt-muted)] text-base  text-right">
            <tr className="bg-[var(--adt-surface-muted)] ">
              {selectionEnabled ? (
                <th
                  scope="col"
                  className="sticky right-0 z-20 h-12 w-[48px] border-b border-l border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-2 text-center"
                >
                  {selectionMode === "multiple" ? (
                    <SelectionCheckbox
                      checked={allPageRowsSelected}
                      indeterminate={somePageRowsSelected}
                      disabled={!hasSelectableRows}
                      label={labels.selectAllRows}
                      onChange={onToggleAllRows}
                    />
                  ) : (
                    <span className="sr-only">{labels.selectRow}</span>
                  )}
                </th>
              ) : null}
              {columns.map((column) => {
                const activeSort = sort.find((rule) => rule.id === column.id);
                const sortIndex = sort.findIndex(
                  (rule) => rule.id === column.id,
                );
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={
                      activeSort
                        ? activeSort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    style={columnStyle(column)}
                    className={cx(
                      "h-12 border-b text-right border-l border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-3 text-[14px]! text-right! font-bold text-[var(--adt-muted)] last:border-l-0",
                      alignClass(column.align),
                      stickyColumnClass(
                        column.sticky,
                        true,
                        selectionEnabled,
                      ),
                      column.headerClassName,
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={(event) => onSort(column, event)}
                        className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 outline-none hover:text-[var(--adt-text)] focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/25"
                      >
                        <span>{column.header ?? column.label}</span>
                        {activeSort ? (
                          <span className="inline-flex items-center gap-1 text-[var(--adt-accent-strong)]">
                            {activeSort.direction === "asc" ? (
                              <ArrowUp size={11} />
                            ) : (
                              <ArrowDown size={11} />
                            )}
                            {sort.length > 1 ? (
                              <span className="text-[7px] tabular-nums">
                                {sortIndex + 1}
                              </span>
                            ) : null}
                          </span>
                        ) : null}
                      </button>
                    ) : (
                      (column.header ?? column.label)
                    )}
                  </th>
                );
              })}
              {hasRowActions ? (
                <th
                  scope="col"
                  className="sticky left-0 z-20 h-12 w-[72px] border-b border-r border-[var(--adt-border)] bg-[var(--adt-surface-muted)] px-2 text-right text-[14px]! font-bold text-[var(--adt-muted)]"
                >
                  {labels.actions}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <DesktopSkeleton
                columns={
                  columns.length +
                  (selectionEnabled ? 1 : 0) +
                  (hasRowActions ? 1 : 0)
                }
              />
            ) : (
              records.map((record, rowIndex) => {
                const rowId = getRowId(record);
                const selected = selectedRowIds.has(rowId);
                const selectable = isRowSelectable?.(record) !== false;
                return (
                  <tr
                    key={rowId}
                    data-export-row-id={rowId}
                    data-selected={selected || undefined}
                    className={cx(
                      "group border-b border-[var(--adt-border)] last:border-b-0 hover:bg-[var(--adt-surface-muted)]/65",
                      selected && "bg-[var(--adt-accent)]/[0.07]",
                    )}
                  >
                    {selectionEnabled ? (
                      <td className="sticky right-0 z-10 h-[58px] border-l border-[var(--adt-border)] bg-inherit px-2 text-center group-hover:bg-[var(--adt-surface-muted)]">
                        <SelectionCheckbox
                          checked={selected}
                          disabled={!selectable}
                          label={`${labels.selectRow}: ${getRowLabel?.(record) ?? rowId}`}
                          onChange={() => onToggleRow(record)}
                        />
                      </td>
                    ) : null}
                  {columns.map((column) => {
                    const value = getColumnValue(column, record);
                    return (
                      <td
                        key={column.id}
                        data-export-column-id={column.id}
                        style={columnStyle(column)}
                        className={cx(
                          "h-[58px] border-l border-[var(--adt-border)] bg-inherit px-3 text-[10px]! text-right! leading-5 text-[var(--adt-text)] group-hover:bg-[var(--adt-surface-muted)]/65 last:border-l-0",
                          alignClass(column.align),
                          stickyColumnClass(
                            column.sticky,
                            false,
                            selectionEnabled,
                          ),
                          column.cellClassName,
                        )}
                      >
                        {column.cell
                          ? column.cell({ value, record, rowIndex })
                          : formatUnknown(value, locale)}
                      </td>
                    );
                  })}
                  {hasRowActions ? (
                    <td className="sticky left-0 z-10 h-[58px] border-r border-[var(--adt-border)] bg-[var(--adt-surface)] px-2 group-hover:bg-[var(--adt-surface-muted)]">
                      <RowActionMenu
                        record={record}
                        crud={crud}
                        openDialog={openDialog}
                        labels={labels}
                        announce={announce}
                      />
                    </td>
                  ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {fetching && !loading ? (
        <div className="pointer-events-none absolute left-3 top-3 z-30">
          <span className="inline-flex items-center gap-2 border border-[var(--adt-border)] bg-[var(--adt-surface-raised)] px-3 py-2 text-[8px] text-[var(--adt-muted)] shadow-lg">
            <LoaderCircle size={12} className="animate-spin" />
            بروزرسانی اطلاعات
          </span>
        </div>
      ) : null}
    </div>
  );
}

function MobileCards<
  TRecord,
  TCreateValues extends DynamicFormValues,
  TEditValues extends DynamicFormValues,
>({
  records,
  columns,
  mobile,
  getRowId,
  getRowLabel,
  selectionEnabled,
  isRowSelectable,
  selectedRowIds,
  onToggleRow,
  crud,
  openDialog,
  locale,
  loading,
  error,
  onRetry,
  labels,
  announce,
}: {
  records: TRecord[];
  columns: DynamicColumn<TRecord>[];
  mobile?: DynamicDataTableProps<TRecord>["mobile"];
  getRowId: (record: TRecord) => string;
  getRowLabel?: (record: TRecord) => string;
  selectionEnabled: boolean;
  isRowSelectable?: (record: TRecord) => boolean;
  selectedRowIds: Set<string>;
  onToggleRow: (record: TRecord) => void;
  crud?: DynamicCrudConfig<TRecord, TCreateValues, TEditValues>;
  openDialog: (state: DialogState<TRecord>) => void;
  locale: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  labels: Required<DynamicTableLabels>;
  announce: (message: string, tone?: Announcement["tone"]) => void;
}) {
  if (error && !records.length)
    return <ErrorState onRetry={onRetry} labels={labels} />;
  if (loading) {
    return (
      <div className="grid gap-2 p-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[168px] animate-pulse border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-2 p-3 sm:grid-cols-2">
      {records.map((record) => {
        const rowId = getRowId(record);
        const selected = selectedRowIds.has(rowId);
        const selectable = isRowSelectable?.(record) !== false;
        const first = columns[0];
        const defaultTitle = first
          ? formatUnknown(getColumnValue(first, record), locale)
          : getRowId(record);
        return (
          <article
            key={rowId}
            data-selected={selected || undefined}
            className={cx(
              "min-w-0 border border-[var(--adt-border)] bg-[var(--adt-surface)]",
              selected &&
                "border-[var(--adt-accent)]/55 bg-[var(--adt-accent)]/[0.06]",
              mobile?.cardClassName,
            )}
          >
            <div className="flex min-w-0 items-start gap-3 border-b border-[var(--adt-border)] p-3.5">
              {selectionEnabled ? (
                <div className="mt-0.5 shrink-0">
                  <SelectionCheckbox
                    checked={selected}
                    disabled={!selectable}
                    label={`${labels.selectRow}: ${getRowLabel?.(record) ?? rowId}`}
                    onChange={() => onToggleRow(record)}
                  />
                </div>
              ) : null}
              {mobile?.media ? (
                <div className="shrink-0">{mobile.media(record)}</div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-[12px] font-bold text-[var(--adt-text)]">
                      {mobile?.title?.(record) ?? defaultTitle}
                    </h3>
                    {mobile?.subtitle ? (
                      <div className="mt-1 line-clamp-2 text-[9px] leading-4 text-[var(--adt-muted)]">
                        {mobile.subtitle(record)}
                      </div>
                    ) : null}
                  </div>
                  {mobile?.badge ? (
                    <div className="shrink-0">{mobile.badge(record)}</div>
                  ) : null}
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2">
              {columns.slice(mobile?.title ? 0 : 1).map((column) => {
                const value = getColumnValue(column, record);
                const full = column.mobile?.fullWidth;
                return (
                  <div
                    key={column.id}
                    className={cx(
                      "min-w-0 border-b border-l border-[var(--adt-border)] px-3 py-3 last:border-l-0",
                      full && "col-span-2",
                    )}
                  >
                    {column.mobile?.showLabel !== false ? (
                      <dt className="text-[7px] font-semibold text-[var(--adt-muted)]">
                        {column.mobile?.label ?? column.label}
                      </dt>
                    ) : null}
                    <dd className="mt-1.5 min-w-0 break-words text-[10px] leading-5 text-[var(--adt-text)]">
                      {column.cell
                        ? column.cell({ value, record, rowIndex: 0 })
                        : formatUnknown(value, locale)}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {crud?.view ||
            crud?.edit ||
            crud?.delete ||
            crud?.extraRowActions?.length ? (
              <div className="flex justify-end border-t border-[var(--adt-border)] p-2">
                <RowActionMenu
                  record={record}
                  crud={crud}
                  openDialog={openDialog}
                  labels={labels}
                  announce={announce}
                />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function RowActionMenu<
  TRecord,
  TCreateValues extends DynamicFormValues,
  TEditValues extends DynamicFormValues,
>({
  record,
  crud,
  openDialog,
  labels,
  announce,
}: {
  record: TRecord;
  crud?: DynamicCrudConfig<TRecord, TCreateValues, TEditValues>;
  openDialog: (state: DialogState<TRecord>) => void;
  labels: Required<DynamicTableLabels>;
  announce: (message: string, tone?: Announcement["tone"]) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const canView = Boolean(
    crud?.view && isTruthyConfig(crud.view.enabled, record),
  );
  const canEdit = Boolean(
    crud?.edit && isTruthyConfig(crud.edit.enabled, record),
  );
  const canDelete = Boolean(
    crud?.delete && isTruthyConfig(crud.delete.enabled, record),
  );
  const extra = (crud?.extraRowActions ?? []).filter(
    (action) => !isTruthyConfig(action.hidden, record, false),
  );

  return (
    <div className="flex justify-center">
      <DataButton
        ref={triggerRef}
        aria-label="عملیات ردیف"
        icon={<MoreHorizontal size={17} />}
        iconOnly
        tone="ghost"
        size="sm"
        onClick={() => setOpen((current) => !current)}
      />
      <FloatingPanel
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        title={labels.actions}
        desktopWidth={220}
      >
        <div className="p-2">
          {canView ? (
            <MenuAction
              icon={<Eye size={14} />}
              label={labels.view}
              onClick={() => {
                setOpen(false);
                openDialog({ type: "view", record });
              }}
            />
          ) : null}
          {canEdit ? (
            <MenuAction
              icon={<Edit3 size={14} />}
              label={crud?.edit?.label ?? labels.edit}
              onClick={() => {
                setOpen(false);
                openDialog({ type: "edit", record });
              }}
            />
          ) : null}
          {extra.map((action) => {
            const disabled = isTruthyConfig(action.disabled, record, false);
            return (
              <MenuAction
                key={action.id}
                icon={action.icon}
                label={action.label}
                tone={action.tone}
                disabled={disabled || busyAction === action.id}
                loading={busyAction === action.id}
                onClick={async () => {
                  setBusyAction(action.id);
                  try {
                    await action.onClick(record);
                    setOpen(false);
                  } catch (error) {
                    announce(
                      error instanceof Error
                        ? error.message
                        : "انجام این عملیات ممکن نشد. دوباره تلاش کنید.",
                      "error",
                    );
                  } finally {
                    setBusyAction(null);
                  }
                }}
              />
            );
          })}
          {canDelete ? (
            <>
              <div className="my-1 h-px bg-[var(--adt-border)]" />
              <MenuAction
                icon={<Trash2 size={14} />}
                label={labels.delete}
                tone="danger"
                onClick={() => {
                  setOpen(false);
                  openDialog({ type: "delete", record });
                }}
              />
            </>
          ) : null}
        </div>
      </FloatingPanel>
    </div>
  );
}

function MenuAction({
  icon,
  label,
  tone = "neutral",
  disabled,
  loading,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  tone?: "neutral" | "danger" | "warning" | "success";
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "flex min-h-10 w-full cursor-pointer items-center gap-3 px-3 text-right text-[10px] font-semibold outline-none hover:bg-[var(--adt-surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/25 disabled:cursor-not-allowed disabled:opacity-40",
        tone === "danger" && "text-[var(--adt-danger)]",
        tone === "warning" && "text-[var(--adt-warning)]",
        tone === "success" && "text-[var(--adt-success)]",
        tone === "neutral" && "text-[var(--adt-text)]",
      )}
    >
      <span className="grid size-5 shrink-0 place-items-center">
        {loading ? <LoaderCircle size={14} className="animate-spin" /> : icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function Pagination({
  page,
  pageSize,
  total,
  pageCount,
  rangeStart,
  rangeEnd,
  locale,
  pageSizeOptions,
  showPageNumbers,
  labels,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  rangeStart: number;
  rangeEnd: number;
  locale: string;
  pageSizeOptions: number[];
  showPageNumbers: boolean;
  labels: Required<DynamicTableLabels>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const formatter = new Intl.NumberFormat(locale);
  const pages = pageNumberWindow(page, pageCount);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] text-[var(--adt-muted)]">
        <span>
          {formatter.format(rangeStart)} تا {formatter.format(rangeEnd)} از{" "}
          {formatter.format(total)}
        </span>
        <div className="w-[150px]">
          <DataSelect
            placeholder={labels.rowsPerPage}
            options={pageSizeOptions.map((size) => ({
              value: String(size),
              label: `${formatter.format(size)} در صفحه`,
            }))}
            value={String(pageSize)}
            onChange={(value) => {
              if (typeof value === "string") onPageSizeChange(Number(value));
            }}
            clearable={false}
          />
        </div>
      </div>

      <nav
        aria-label="صفحه‌بندی"
        className="flex items-center justify-between gap-2 sm:justify-end"
      >
        <DataButton
          aria-label={labels.previousPage}
          icon={<ChevronRight size={15} />}
          iconOnly
          tone="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        />

        {showPageNumbers ? (
          <div className="hidden items-center gap-1 sm:flex">
            {pages.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="grid size-9 place-items-center text-[var(--adt-muted)]"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => onPageChange(item)}
                  className={cx(
                    "grid size-9 cursor-pointer place-items-center border text-[9px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/30",
                    item === page
                      ? "border-[var(--adt-text)] text-[var(--adt-surface)]"
                      : "border-[var(--adt-border)] bg-[var(--adt-surface)] text-[var(--adt-muted)] hover:border-[var(--adt-border-strong)] hover:text-[var(--adt-text)]",
                  )}
                >
                  {formatter.format(item)}
                </button>
              ),
            )}
          </div>
        ) : null}

        <span className="min-w-[72px] text-center text-[9px] text-[var(--adt-muted)] sm:hidden">
          {formatter.format(page)} / {formatter.format(pageCount)}
        </span>

        <DataButton
          aria-label={labels.nextPage}
          icon={<ChevronLeft size={15} />}
          iconOnly
          tone="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        />
      </nav>
    </div>
  );
}

function CrudDialogs<
  TRecord,
  TCreateValues extends DynamicFormValues,
  TEditValues extends DynamicFormValues,
>({
  state,
  close,
  crud,
  source,
  getRowId,
  getRowLabel,
  locale,
  labels,
  onMutated,
  announce,
}: {
  state: DialogState<TRecord>;
  close: () => void;
  crud?: DynamicCrudConfig<TRecord, TCreateValues, TEditValues>;
  source: {
    queryKey: readonly unknown[];
    fetchOne?: (args: {
      id: string;
      record: TRecord;
      signal: AbortSignal;
    }) => Promise<TRecord>;
  };
  getRowId: (record: TRecord) => string;
  getRowLabel?: (record: TRecord) => string;
  locale: string;
  labels: Required<DynamicTableLabels>;
  onMutated: (
    kind: "create" | "edit" | "delete",
    record?: TRecord,
  ) => Promise<void>;
  announce: (message: string, tone?: Announcement["tone"]) => void;
}) {
  const activeRecord =
    state.type === "view" || state.type === "edit" || state.type === "delete"
      ? state.record
      : null;
  const activeId = activeRecord ? getRowId(activeRecord) : "";

  const detailQuery = useQuery({
    queryKey: [...source.queryKey, "detail", activeId],
    queryFn: ({ signal }) => {
      if (!activeRecord) throw new Error("No active record");
      if (!source.fetchOne) return Promise.resolve(activeRecord);
      return source.fetchOne({ id: activeId, record: activeRecord, signal });
    },
    enabled: Boolean(
      activeRecord && (state.type === "view" || state.type === "edit"),
    ),
    initialData: source.fetchOne ? undefined : (activeRecord ?? undefined),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (values: TCreateValues) => {
      if (!crud?.create) throw new Error("Create is unavailable");
      return crud.create.mutationFn({ values });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (args: { record: TRecord; values: TEditValues }) => {
      if (!crud?.edit) throw new Error("Edit is unavailable");
      return crud.edit.mutationFn({
        id: getRowId(args.record),
        record: args.record,
        values: args.values,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (record: TRecord) => {
      if (!crud?.delete) throw new Error("Delete is unavailable");
      return crud.delete.mutationFn({ id: getRowId(record), record });
    },
  });

  if (!crud) return null;

  const resolvedRecord = (detailQuery.data ?? activeRecord) as TRecord | null;
  const rowLabel = activeRecord
    ? (getRowLabel?.(activeRecord) ?? getRowId(activeRecord))
    : "";

  return (
    <>
      {crud.create ? (
        <DynamicModal
          open={state.type === "create"}
          onClose={close}
          title={crud.create.title ?? crud.create.label ?? labels.create}
          description={crud.create.description}
          size="lg"
          busy={createMutation.isPending}
        >
          {state.type === "create" ? (
            <DynamicForm
              schema={crud.create.schema}
              initialValues={
                typeof crud.create.initialValues === "function"
                  ? crud.create.initialValues()
                  : crud.create.initialValues
              }
              submitLabel={labels.createSave}
              cancelLabel={labels.cancel}
              mapError={crud.create.mapError}
              onCancel={close}
              onSubmit={async (values) => {
                const result = await createMutation.mutateAsync(values);
                crud.create?.onSuccess?.(result);
                close();
                await onMutated("create", result as TRecord | undefined);
              }}
            />
          ) : null}
        </DynamicModal>
      ) : null}

      {crud.view ? (
        <DynamicModal
          open={state.type === "view"}
          onClose={close}
          title={
            state.type === "view"
              ? resolveText(crud.view.title, state.record, `مشاهده ${rowLabel}`)
              : "مشاهده"
          }
          description={crud.view.description}
          size="lg"
        >
          {state.type === "view" ? (
            <DetailGate query={detailQuery} labels={labels}>
              {resolvedRecord ? (
                <DynamicRecordView
                  record={resolvedRecord}
                  config={crud.view}
                  locale={locale}
                />
              ) : null}
            </DetailGate>
          ) : null}
        </DynamicModal>
      ) : null}

      {crud.edit ? (
        <DynamicModal
          open={state.type === "edit"}
          onClose={close}
          title={
            state.type === "edit"
              ? resolveText(
                  crud.edit.title,
                  state.record,
                  `${labels.edit} ${rowLabel}`,
                )
              : labels.edit
          }
          description={crud.edit.description}
          size="lg"
          closeOnBackdrop={false}
          busy={editMutation.isPending}
        >
          {state.type === "edit" ? (
            <DetailGate query={detailQuery} labels={labels}>
              {resolvedRecord ? (
                <DynamicForm
                  key={getRowId(resolvedRecord)}
                  schema={crud.edit.schema}
                  initialValues={crud.edit.toInitialValues(resolvedRecord)}
                  submitLabel={labels.editSave}
                  cancelLabel={labels.cancel}
                  mapError={crud.edit.mapError}
                  onCancel={close}
                  onSubmit={async (values) => {
                    const result = await editMutation.mutateAsync({
                      record: resolvedRecord,
                      values,
                    });
                    crud.edit?.onSuccess?.(result, resolvedRecord);
                    close();
                    await onMutated(
                      "edit",
                      (result ?? resolvedRecord) as TRecord,
                    );
                  }}
                />
              ) : null}
            </DetailGate>
          ) : null}
        </DynamicModal>
      ) : null}

      {crud.delete ? (
        <DynamicModal
          open={state.type === "delete"}
          onClose={() => {
            if (!deleteMutation.isPending) close();
          }}
          title={
            state.type === "delete"
              ? resolveText(crud.delete.title, state.record, `حذف ${rowLabel}`)
              : labels.delete
          }
          description="این عملیات نیاز به تایید شما دارد."
          size="sm"
          mobileFullscreen={false}
          role="alertdialog"
          busy={deleteMutation.isPending}
          initialFocusSelector="[data-adt-cancel-delete]"
          footer={
            state.type === "delete" ? (
              <div className="grid grid-cols-2 gap-2">
                <DataButton
                  data-adt-cancel-delete
                  tone="secondary"
                  size="md"
                  fullWidth
                  disabled={deleteMutation.isPending}
                  onClick={close}
                >
                  {crud.delete.cancelLabel ?? labels.cancel}
                </DataButton>
                <DataButton
                  tone={
                    crud.delete.dangerLevel === "soft" ? "warning" : "danger"
                  }
                  size="md"
                  fullWidth
                  loading={deleteMutation.isPending}
                  onClick={async () => {
                    if (state.type !== "delete") return;
                    try {
                      await deleteMutation.mutateAsync(state.record);
                      crud.delete?.onSuccess?.(state.record);
                      close();
                      await onMutated("delete", state.record);
                    } catch (error) {
                      announce(
                        crud.delete?.mapError?.(error) ??
                          (error instanceof Error
                            ? error.message
                            : "حذف انجام نشد. دوباره تلاش کنید."),
                        "error",
                      );
                    }
                  }}
                >
                  {crud.delete.confirmLabel ??
                    (crud.delete.dangerLevel === "soft"
                      ? "غیرفعال کردن"
                      : "حذف")}
                </DataButton>
              </div>
            ) : null
          }
        >
          {state.type === "delete" ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 border border-[var(--adt-danger)]/30 bg-[var(--adt-danger)]/[0.05] px-4 py-4">
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--adt-danger)]"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[var(--adt-text)]">
                    {rowLabel}
                  </p>
                  <div className="mt-1.5 text-[9px] leading-5 text-[var(--adt-muted)]">
                    {typeof crud.delete.description === "function"
                      ? crud.delete.description(state.record)
                      : (crud.delete.description ??
                        (crud.delete.dangerLevel === "soft"
                          ? "این مورد از لیست فعال خارج می‌شود و در صورت پشتیبانی API قابل بازگردانی است."
                          : "این حذف دائمی در نظر گرفته شده و بعد از تایید قابل بازگشت نیست."))}
                  </div>
                </div>
              </div>
              {deleteMutation.isError ? (
                <div
                  role="alert"
                  className="border border-[var(--adt-danger)]/30 px-3 py-3 text-[9px] leading-5 text-[var(--adt-danger)]"
                >
                  {crud.delete.mapError?.(deleteMutation.error) ??
                    (deleteMutation.error instanceof Error
                      ? deleteMutation.error.message
                      : "حذف انجام نشد. دوباره تلاش کنید.")}
                </div>
              ) : null}
            </div>
          ) : null}
        </DynamicModal>
      ) : null}
    </>
  );
}

function DetailGate({
  query,
  labels,
  children,
}: {
  query: {
    isLoading: boolean;
    isError: boolean;
    refetch: () => unknown;
  };
  labels: Required<DynamicTableLabels>;
  children: ReactNode;
}) {
  if (query.isLoading) {
    return (
      <div className="grid min-h-[240px] place-items-center text-[10px] text-[var(--adt-muted)]">
        <span className="inline-flex items-center gap-2">
          <LoaderCircle size={16} className="animate-spin" />
          {labels.loading}
        </span>
      </div>
    );
  }
  if (query.isError) {
    return (
      <ErrorState
        onRetry={() => void query.refetch()}
        labels={labels}
        compact
      />
    );
  }
  return <>{children}</>;
}

function ErrorState({
  onRetry,
  labels,
  compact = false,
}: {
  onRetry: () => void;
  labels: Required<DynamicTableLabels>;
  compact?: boolean;
}) {
  return (
    <div
      className={cx(
        "grid place-items-center px-5 text-center",
        compact ? "min-h-[220px]" : "min-h-[300px]",
      )}
    >
      <div>
        <AlertTriangle size={20} className="mx-auto text-[var(--adt-danger)]" />
        <p className="mt-3 text-[11px] font-bold text-[var(--adt-text)]">
          {labels.error}
        </p>
        <p className="mt-1 text-[9px] leading-5 text-[var(--adt-muted)]">
          اتصال یا پاسخ سرویس را بررسی کنید و دوباره تلاش کنید.
        </p>
        <DataButton
          tone="secondary"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          {labels.retry}
        </DataButton>
      </div>
    </div>
  );
}

function EmptyTableState({
  filtered,
  emptyState,
  canCreate,
  onCreate,
  onClear,
}: {
  filtered: boolean;
  emptyState?: DynamicDataTableProps<unknown>["emptyState"];
  canCreate: boolean;
  onCreate: () => void;
  onClear: () => void;
}) {
  return (
    <div className="grid min-h-[280px] place-items-center border-t border-[var(--adt-border)] px-5 text-center">
      <div className="max-w-[420px]">
        <p className="text-[12px] font-bold text-[var(--adt-text)]">
          {filtered
            ? (emptyState?.filteredTitle ?? "نتیجه‌ای پیدا نشد")
            : (emptyState?.title ?? "هنوز داده‌ای وجود ندارد")}
        </p>
        <p className="mt-2 text-[9px] leading-5 text-[var(--adt-muted)]">
          {filtered
            ? (emptyState?.filteredDescription ??
              "فیلتر یا عبارت جستجو را تغییر دهید.")
            : (emptyState?.description ??
              "اولین مورد را ایجاد کنید تا این لیست تکمیل شود.")}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {filtered ? (
            <DataButton tone="secondary" size="sm" onClick={onClear}>
              پاک‌سازی
            </DataButton>
          ) : canCreate ? (
            <DataButton
              tone="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={onCreate}
            >
              ایجاد مورد
            </DataButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DesktopSkeleton({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, row) => (
        <tr key={row} className="border-b border-[var(--adt-border)]">
          {Array.from({ length: columns }).map((__, column) => (
            <td
              key={column}
              className="h-[58px] border-l border-[var(--adt-border)] px-3 last:border-l-0"
            >
              <span className="block h-2.5 w-3/5 animate-pulse bg-[var(--adt-border-strong)] motion-reduce:animate-none" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function readDisplayedTableRows<TRecord>(
  root: HTMLElement | null,
  records: TRecord[],
  columns: DynamicColumn<TRecord>[],
  getRowId: (record: TRecord) => string,
) {
  if (!root) return undefined;

  const valuesByRowId = new Map<string, Map<string, string>>();
  root
    .querySelectorAll<HTMLTableRowElement>("tr[data-export-row-id]")
    .forEach((row) => {
      const rowId = row.dataset.exportRowId;
      if (!rowId) return;
      const values = new Map<string, string>();
      row
        .querySelectorAll<HTMLTableCellElement>("td[data-export-column-id]")
        .forEach((cell) => {
          const columnId = cell.dataset.exportColumnId;
          if (columnId) values.set(columnId, renderedCellText(cell));
        });
      valuesByRowId.set(rowId, values);
    });

  if (!valuesByRowId.size) return undefined;
  return records.map((record) => {
    const values = valuesByRowId.get(getRowId(record));
    return columns.map((column) => values?.get(column.id));
  });
}

function renderedCellText(cell: HTMLTableCellElement) {
  let output = "";

  function addBreak() {
    output = output.trimEnd();
    if (output && !output.endsWith("\n")) output += "\n";
  }

  function visit(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      output += (node.textContent ?? "").replace(/\s+/g, " ");
      return;
    }
    if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) return;

    if (node instanceof HTMLBRElement) {
      addBreak();
      return;
    }

    const style = window.getComputedStyle(node);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      node.getAttribute("aria-hidden") === "true" ||
      node.classList.contains("sr-only")
    ) {
      return;
    }
    const display = style.display;
    const separatesText =
      node !== cell &&
      (display === "block" ||
        display === "flex" ||
        display === "grid" ||
        display === "table" ||
        display === "list-item");
    if (separatesText) addBreak();
    node.childNodes.forEach(visit);
    if (separatesText) addBreak();
  }

  cell.childNodes.forEach(visit);
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function columnStyle<TRecord>(column: DynamicColumn<TRecord>): CSSProperties {
  return {
    width: column.width,
    minWidth: column.minWidth,
  };
}

function alignClass(align?: "start" | "center" | "end") {
  if (align === "center") return "text-center";
  if (align === "end") return "text-right";
  return "text-right";
}

function stickyColumnClass(
  sticky?: "start" | "end",
  header = false,
  hasSelectionColumn = false,
) {
  if (sticky === "start") {
    return cx(
      "sticky",
      hasSelectionColumn ? "right-12" : "right-0",
      header ? "z-20" : "z-10",
      "shadow-[-1px_0_0_var(--adt-border)]",
    );
  }
  if (sticky === "end") {
    return cx(
      "sticky left-0",
      header ? "z-20" : "z-10",
      "shadow-[1px_0_0_var(--adt-border)]",
    );
  }
  return "";
}

function pageNumberWindow(
  page: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) items.push("ellipsis");
  for (let current = start; current <= end; current += 1) items.push(current);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

function buildInitialFilters<TFilters extends AnyRecord, TRecord>(
  initialFilters: TFilters | undefined,
  definitions: DynamicDataTableProps<
    TRecord,
    DynamicFormValues,
    DynamicFormValues,
    TFilters
  >["filters"],
) {
  const base = { ...(initialFilters ?? {}) } as TFilters;
  const mutable = base as Record<string, unknown>;
  for (const definition of definitions ?? []) {
    if (!(definition.id in mutable))
      mutable[definition.id] = definition.defaultValue;
  }
  return base;
}

function resolveText<TRecord>(
  value: string | ((record: TRecord) => string) | undefined,
  record: TRecord,
  fallback: string,
) {
  return typeof value === "function" ? value(record) : (value ?? fallback);
}
