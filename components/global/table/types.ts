import type { QueryKey } from "@tanstack/react-query";
import type { ReactNode } from "react";

export type AnyRecord = Record<string, unknown>;
export type AdminThemeName = "dark" | "light";
export type DataDirection = "rtl" | "ltr";
export type DataAlign = "start" | "center" | "end";
export type SortDirection = "asc" | "desc";

export type DataSelectOption = {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
    keywords?: string[];
    meta?: unknown;
};

export type DynamicSortRule = {
    id: string;
    key: string;
    direction: SortDirection;
};

export type PersianDateRangeValue = {
    from: string | null;
    to: string | null;
};

export type DynamicTableRequest<TFilters extends AnyRecord = AnyRecord> = {
    page: number;
    pageSize: number;
    search: string;
    sort: DynamicSortRule[];
    filters: TFilters;
    signal: AbortSignal;
};

export type DynamicTableResult<TRecord> = {
    items: TRecord[];
    total: number;
    page?: number;
    pageSize?: number;
    pageCount?: number;
    meta?: unknown;
};

export type DynamicDataSource<
    TRecord,
    TFilters extends AnyRecord = AnyRecord,
> = {
    queryKey: QueryKey;
    fetchPage: (
        request: DynamicTableRequest<TFilters>,
    ) => Promise<DynamicTableResult<TRecord>>;
    fetchOne?: (args: {
        id: string;
        record: TRecord;
        signal: AbortSignal;
    }) => Promise<TRecord>;
};

export type DynamicColumn<TRecord> = {
    id: string;
    label: string;
    header?: ReactNode;
    accessor?: string | ((record: TRecord) => unknown);
    cell?: (args: {
        value: unknown;
        record: TRecord;
        rowIndex: number;
    }) => ReactNode;
    sortable?: boolean;
    sortKey?: string;
    align?: DataAlign;
    width?: number | string;
    minWidth?: number | string;
    sticky?: "start" | "end";
    defaultHidden?: boolean;
    lockVisibility?: boolean;
    desktop?: {
        hidden?: boolean;
    };
    mobile?: {
        hidden?: boolean;
        label?: string;
        priority?: number;
        showLabel?: boolean;
        fullWidth?: boolean;
    };
    headerClassName?: string;
    cellClassName?: string;
};

export type DynamicMobileConfig<TRecord> = {
    title?: (record: TRecord) => ReactNode;
    subtitle?: (record: TRecord) => ReactNode;
    media?: (record: TRecord) => ReactNode;
    badge?: (record: TRecord) => ReactNode;
    fieldIds?: string[];
    maxFields?: number;
    cardClassName?: string;
};

export type DynamicFormValues = Record<string, unknown>;

export type DynamicFormFieldBase<TValues extends DynamicFormValues> = {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean | ((values: TValues) => boolean);
    hidden?: boolean | ((values: TValues) => boolean);
    readOnly?: boolean | ((values: TValues) => boolean);
    colSpan?: 1 | 2 | "full";
    dir?: DataDirection | ((values: TValues) => DataDirection);
    validate?: (
        value: unknown,
        values: TValues,
    ) => string | null | undefined;
};

export type DynamicInputType =
    | "text"
    | "password"
    | "email"
    | "number"
    | "tel"
    | "url"
    | "search";

export type DynamicInputField<TValues extends DynamicFormValues> =
    DynamicFormFieldBase<TValues> & {
        kind: "input";
        inputType?: DynamicInputType;
        min?: number;
        max?: number;
        step?: number;
        maxLength?: number;
        autoComplete?: string;
        inputMode?:
        | "none"
        | "text"
        | "tel"
        | "url"
        | "email"
        | "numeric"
        | "decimal"
        | "search";
        format?: (value: unknown, values: TValues) => string | number;
        parse?: (value: string, values: TValues) => unknown;
        leadingIcon?: ReactNode;
        prefixText?: string;
        suffixText?: string;
    };

export type DynamicTextareaField<TValues extends DynamicFormValues> =
    DynamicFormFieldBase<TValues> & {
        kind: "textarea";
        rows?: number;
        maxLength?: number;
        format?: (value: unknown, values: TValues) => string;
        parse?: (value: string, values: TValues) => unknown;
    };

export type DynamicSelectField<TValues extends DynamicFormValues> =
    DynamicFormFieldBase<TValues> & {
        kind: "select" | "multi-select";
        options: DataSelectOption[];
        searchable?: boolean;
        clearable?: boolean;
        allowSelectAll?: boolean;
        maxVisibleTags?: number;
        format?: (
            value: unknown,
            values: TValues,
        ) => string | string[] | null;
        parse?: (
            value: string | string[] | null,
            values: TValues,
        ) => unknown;
    };

export type DynamicBooleanField<TValues extends DynamicFormValues> =
    DynamicFormFieldBase<TValues> & {
        kind: "boolean";
        onLabel?: string;
        offLabel?: string;
    };

export type DynamicDateField<TValues extends DynamicFormValues> =
    DynamicFormFieldBase<TValues> & {
        kind: "date";
        minDate?: string;
        maxDate?: string;
        clearable?: boolean;
    };

export type DynamicDateRangeField<TValues extends DynamicFormValues> =
    DynamicFormFieldBase<TValues> & {
        kind: "date-range";
        minDate?: string;
        maxDate?: string;
        clearable?: boolean;
    };

export type DynamicCustomField<TValues extends DynamicFormValues> =
    DynamicFormFieldBase<TValues> & {
        kind: "custom";
        render: (args: {
            value: unknown;
            values: TValues;
            setValue: (value: unknown) => void;
            error?: string;
            disabled: boolean;
            readOnly: boolean;
        }) => ReactNode;
    };

export type DynamicFormField<TValues extends DynamicFormValues> =
    | DynamicInputField<TValues>
    | DynamicTextareaField<TValues>
    | DynamicSelectField<TValues>
    | DynamicBooleanField<TValues>
    | DynamicDateField<TValues>
    | DynamicDateRangeField<TValues>
    | DynamicCustomField<TValues>;

export type DynamicFormSection<TValues extends DynamicFormValues> = {
    id: string;
    title: string;
    description?: string;
    fieldNames?: string[];
    hidden?: boolean | ((values: TValues) => boolean);
};

export type DynamicFormSchema<TValues extends DynamicFormValues> = {
    fields: DynamicFormField<TValues>[];
    sections?: DynamicFormSection<TValues>[];
    validate?: (
        values: TValues,
    ) => Record<string, string> | Promise<Record<string, string>>;
};

export type DynamicFormErrorResult = {
    message?: string;
    fieldErrors?: Record<string, string>;
};

export type DynamicFormErrorMapper = (
    error: unknown,
) => DynamicFormErrorResult;

export type DynamicCreateConfig<
    TRecord,
    TCreateValues extends DynamicFormValues,
> = {
    enabled?: boolean;
    label?: string;
    title?: string;
    description?: string;
    schema: DynamicFormSchema<TCreateValues>;
    initialValues: TCreateValues | (() => TCreateValues);
    mutationFn: (args: { values: TCreateValues }) => Promise<TRecord | void>;
    mapError?: DynamicFormErrorMapper;
    onSuccess?: (record: TRecord | void) => void;
};

export type DynamicEditConfig<
    TRecord,
    TEditValues extends DynamicFormValues,
> = {
    enabled?: boolean | ((record: TRecord) => boolean);
    label?: string;
    title?: string | ((record: TRecord) => string);
    description?: string;
    schema: DynamicFormSchema<TEditValues>;
    toInitialValues: (record: TRecord) => TEditValues;
    mutationFn: (args: {
        id: string;
        record: TRecord;
        values: TEditValues;
    }) => Promise<TRecord | void>;
    mapError?: DynamicFormErrorMapper;
    onSuccess?: (record: TRecord | void, original: TRecord) => void;
};

export type DynamicViewField<TRecord> = {
    id: string;
    label: string;
    accessor?: string | ((record: TRecord) => unknown);
    render?: (args: { value: unknown; record: TRecord }) => ReactNode;
    colSpan?: 1 | 2 | "full";
    hidden?: boolean | ((record: TRecord) => boolean);
};

export type DynamicViewSection<TRecord> = {
    id: string;
    title: string;
    description?: string;
    fieldIds?: string[];
    hidden?: boolean | ((record: TRecord) => boolean);
};

export type DynamicViewConfig<TRecord> = {
    enabled?: boolean | ((record: TRecord) => boolean);
    title?: string | ((record: TRecord) => string);
    description?: string;
    fields?: DynamicViewField<TRecord>[];
    sections?: DynamicViewSection<TRecord>[];
    render?: (record: TRecord) => ReactNode;
};

export type DynamicDeleteConfig<TRecord> = {
    enabled?: boolean | ((record: TRecord) => boolean);
    title?: string | ((record: TRecord) => string);
    description?: string | ((record: TRecord) => ReactNode);
    confirmLabel?: string;
    cancelLabel?: string;
    mutationFn: (args: {
        id: string;
        record: TRecord;
    }) => Promise<void | unknown>;
    mapError?: (error: unknown) => string;
    onSuccess?: (record: TRecord) => void;
    dangerLevel?: "soft" | "hard";
};

export type DynamicExtraRowAction<TRecord> = {
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: (record: TRecord) => void | Promise<void>;
    hidden?: boolean | ((record: TRecord) => boolean);
    disabled?: boolean | ((record: TRecord) => boolean);
    tone?: "neutral" | "danger" | "warning" | "success";
};

export type DynamicCrudConfig<
    TRecord,
    TCreateValues extends DynamicFormValues,
    TEditValues extends DynamicFormValues,
> = {
    create?: DynamicCreateConfig<TRecord, TCreateValues>;
    edit?: DynamicEditConfig<TRecord, TEditValues>;
    view?: DynamicViewConfig<TRecord>;
    delete?: DynamicDeleteConfig<TRecord>;
    extraRowActions?: DynamicExtraRowAction<TRecord>[];
};

export type DynamicFilterLoadContext<TFilters extends AnyRecord> = {
    signal: AbortSignal;
    filters: TFilters;
};

export type DynamicFilterBase<
    TFilters extends AnyRecord,
    TRecord = unknown,
> = {
    id: keyof TFilters & string;
    label: string;
    description?: string;
    placeholder?: string;
    defaultValue?: unknown;
    hidden?: boolean;
    badge?: (value: unknown) => string | null;
    serialize?: (value: unknown) => unknown;
    appliesTo?: (record: TRecord) => boolean;
};

export type DynamicSelectFilter<
    TFilters extends AnyRecord,
    TRecord = unknown,
> = DynamicFilterBase<TFilters, TRecord> & {
    kind: "select" | "multi-select";
    options?: DataSelectOption[];
    loadOptions?: (
        context: DynamicFilterLoadContext<TFilters>,
    ) => Promise<DataSelectOption[]>;
    optionQueryKey?: (filters: TFilters) => QueryKey;
    searchable?: boolean;
    clearable?: boolean;
    allowSelectAll?: boolean;
};

export type DynamicInputFilter<
    TFilters extends AnyRecord,
    TRecord = unknown,
> = DynamicFilterBase<TFilters, TRecord> & {
    kind: "text" | "number";
    min?: number;
    max?: number;
};

export type DynamicBooleanFilter<
    TFilters extends AnyRecord,
    TRecord = unknown,
> = DynamicFilterBase<TFilters, TRecord> & {
    kind: "boolean";
    trueLabel?: string;
    falseLabel?: string;
};

export type DynamicDateFilter<
    TFilters extends AnyRecord,
    TRecord = unknown,
> = DynamicFilterBase<TFilters, TRecord> & {
    kind: "date";
    minDate?: string;
    maxDate?: string;
};

export type DynamicDateRangeFilter<
    TFilters extends AnyRecord,
    TRecord = unknown,
> = DynamicFilterBase<TFilters, TRecord> & {
    kind: "date-range";
    minDate?: string;
    maxDate?: string;
};

export type DynamicCustomFilter<
    TFilters extends AnyRecord,
    TRecord = unknown,
> = DynamicFilterBase<TFilters, TRecord> & {
    kind: "custom";
    render: (args: {
        value: unknown;
        setValue: (value: unknown) => void;
        filters: TFilters;
        close: () => void;
    }) => ReactNode;
};

export type DynamicFilterDefinition<
    TFilters extends AnyRecord,
    TRecord = unknown,
> =
    | DynamicSelectFilter<TFilters, TRecord>
    | DynamicInputFilter<TFilters, TRecord>
    | DynamicBooleanFilter<TFilters, TRecord>
    | DynamicDateFilter<TFilters, TRecord>
    | DynamicDateRangeFilter<TFilters, TRecord>
    | DynamicCustomFilter<TFilters, TRecord>;

export type DynamicSearchConfig = {
    enabled?: boolean;
    placeholder?: string;
    debounceMs?: number;
};

export type DynamicPaginationConfig = {
    initialPageSize?: number;
    pageSizeOptions?: number[];
    showPageNumbers?: boolean;
};

export type DynamicColumnVisibilityConfig = {
    enabled?: boolean;
    persist?: boolean;
    storageKey?: string;
};

export type DynamicEmptyStateConfig = {
    title?: string;
    description?: string;
    filteredTitle?: string;
    filteredDescription?: string;
};

export type DynamicTableLabels = {
    refresh?: string;
    refreshing?: string;
    filters?: string;
    clearFilters?: string;
    applyFilters?: string;
    pendingFilters?: string;
    columns?: string;
    create?: string;
    view?: string;
    edit?: string;
    delete?: string;
    actions?: string;
    previousPage?: string;
    nextPage?: string;
    rowsPerPage?: string;
    loading?: string;
    error?: string;
    retry?: string;
    close?: string;
    cancel?: string;
    save?: string;
    createSave?: string;
    editSave?: string;
    noValue?: string;
};

export type DynamicDataTableProps<
    TRecord,
    TCreateValues extends DynamicFormValues = DynamicFormValues,
    TEditValues extends DynamicFormValues = DynamicFormValues,
    TFilters extends AnyRecord = AnyRecord,
> = {
    tableId: string;
    title: string;
    description?: string;
    eyebrow?: string;
    direction?: DataDirection;
    locale?: string;
    source: DynamicDataSource<TRecord, TFilters>;
    columns: DynamicColumn<TRecord>[];
    getRowId: (record: TRecord) => string;
    getRowLabel?: (record: TRecord) => string;
    search?: DynamicSearchConfig;
    filters?: DynamicFilterDefinition<TFilters, TRecord>[];
    initialFilters?: TFilters;
    pagination?: DynamicPaginationConfig;
    columnVisibility?: DynamicColumnVisibilityConfig;
    mobile?: DynamicMobileConfig<TRecord>;
    crud?: DynamicCrudConfig<TRecord, TCreateValues, TEditValues>;
    emptyState?: DynamicEmptyStateConfig;
    labels?: DynamicTableLabels;
    renderMeta?: (meta: unknown) => ReactNode;
    onStateChange?: (state: {
        page: number;
        pageSize: number;
        search: string;
        sort: DynamicSortRule[];
        filters: TFilters;
    }) => void;
    className?: string;
};
