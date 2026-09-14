# Najibzadeh Admin Dynamic Data Grid

**Version:** v3.2.1  
**Audience:** Frontend engineers working on the Najibzadeh Persian admin dashboard  
**Stack:** React / Next.js / TypeScript / TanStack React Query / Tailwind CSS / Lucide React  
**Primary direction:** RTL  
**Calendar UI:** Persian (Jalali)  
**API date format:** Gregorian ISO `YYYY-MM-DD`

---

## 1. Purpose

The Dynamic Data Grid is a reusable admin data-management system designed to handle many resource types without rebuilding tables, filters, CRUD dialogs, forms, mobile layouts, and cache logic for every admin page.

It is intended to support resources such as:

- Products
- Orders
- Customers
- Categories
- Inventory
- Discounts
- Users
- Returns
- Reports
- Any other record-based admin resource

The system is configuration-driven. A screen provides:

1. a data source,
2. column definitions,
3. optional search/filter configuration,
4. optional pagination and column-visibility configuration,
5. optional mobile card configuration,
6. optional CRUD configuration.

The grid owns the UI and interaction behavior around those definitions.

---

## 2. Main capabilities

The final v3.2.1 system includes:

- Generic TypeScript record support.
- Server-style pagination.
- React Query in-memory caching.
- Request cancellation via `AbortSignal`.
- Debounced search with IME-safe composition handling.
- Single-column sorting.
- Shift-click multi-column sorting.
- Configurable and persistent column visibility.
- Sticky desktop columns.
- Custom cell renderers.
- Desktop semantic table rendering.
- Dedicated mobile card rendering below the `md` breakpoint.
- Horizontal-only table overflow on desktop when required.
- No nested vertical table scroller; the admin page remains the vertical scroll owner.
- Draft-based filters that do not refetch the dataset until Apply is pressed.
- Lazy remote filter-option loading.
- Static and remote select filters.
- Multi-select filters.
- Boolean filters.
- Text filters.
- Numeric filters.
- Persian single-date filters.
- Persian date-range filters.
- Custom filters.
- Create modal.
- Edit modal.
- View modal.
- Delete confirmation modal.
- Extra row actions.
- Generic dynamic forms.
- Nested form values using dot paths.
- Conditional fields.
- Field-level validation.
- Schema-level validation.
- API/server field-error mapping.
- Persian single-date and date-range form controls.
- Generic record detail rendering.
- Accessible modal focus management.
- Mobile bottom-sheet behavior for floating controls.
- Admin dark/light theme synchronization.
- Portal-safe theme variables.
- Global RTL enforcement for the admin system.
- Optional local/in-memory data source helper.
- Backend metadata rendering through `renderMeta`.
- External table-state observation through `onStateChange`.

---

## 3. Dependencies

Install the runtime dependencies:

```bash
npm i @tanstack/react-query lucide-react
```

The final grid does **not** depend on the project's previous custom `Button`, `CustomInput`, or `CustomSelect` components.

All grid-specific controls are owned by the data-grid package itself.

---

## 4. File structure

```text
components/
  admin/
    dynamic-data-table/
      client-data-source.ts
      dynamic-data-table.tsx
      dynamic-filters.tsx
      dynamic-form.tsx
      dynamic-modal.tsx
      dynamic-record-view.tsx
      index.ts
      persian-date-picker.tsx
      primitives.tsx
      types.ts
      use-admin-theme.ts
      utils.ts

  providers/
    admin-query-provider.tsx

examples/
  components/
    data-grid-v3-showcase.tsx
```

### File responsibilities

| File | Responsibility |
| --- | --- |
| `dynamic-data-table.tsx` | Main orchestration layer: query, search, sort, columns, pagination, desktop/mobile rendering, CRUD wiring. |
| `dynamic-filters.tsx` | Filter rail, draft filter state, focused filter popovers, lazy filter-option queries. |
| `dynamic-form.tsx` | Generic create/edit form rendering and validation. |
| `dynamic-modal.tsx` | Portal-based accessible modal shell. |
| `dynamic-record-view.tsx` | Generic record detail rendering for View dialogs. |
| `persian-date-picker.tsx` | Jalali/Persian single and range calendar UI. |
| `primitives.tsx` | Grid-owned button, input, textarea, select, switch, filter chip, floating panel. |
| `types.ts` | Public TypeScript contracts. |
| `use-admin-theme.ts` | Reads AdminShell theme and defines grid theme tokens. |
| `utils.ts` | Dot-path helpers, stable stringify, filter compaction, formatting, clamping. |
| `client-data-source.ts` | Optional helper for local arrays/in-memory datasets. |
| `admin-query-provider.tsx` | React Query client and admin theme/RTL bridge. |

---

# 5. Required admin integration

The admin route group must be wrapped once with `AdminQueryProvider`.

```tsx
import { AdminQueryProvider } from "@/components/providers/admin-query-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminQueryProvider>
      {children}
    </AdminQueryProvider>
  );
}
```

`AdminQueryProvider` creates one `QueryClient` for the admin route group.

Its default React Query behavior is:

```ts
queries: {
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
},
mutations: {
  retry: 0,
}
```

This means query results remain fresh in memory until the browser is fully refreshed or the system explicitly invalidates them.

---

# 6. Theme architecture

## 6.1 Theme owner

The data grid does not create a theme context.

The AdminShell remains the theme source of truth:

```ts
document.documentElement.dataset.theme = "dark" | "light";
```

`useAdminTheme()` observes `html[data-theme]` through `useSyncExternalStore` and a `MutationObserver`.

```ts
const theme = useAdminTheme();
```

## 6.2 Theme tokens

The grid exposes a canonical admin palette through `ADMIN_DATA_THEME`.

Each theme contains:

```ts
type AdminDataThemePalette = {
  canvas: string;
  chrome: string;
  surface: string;
  surfaceRaised: string;
  surfaceMuted: string;
  text: string;
  muted: string;
  soft: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentStrong: string;
  danger: string;
  success: string;
  warning: string;
  info: string;
  overlay: string;
};
```

The `surfaceRaised` token is important for portaled UI such as:

- modals,
- selects,
- filter popovers,
- row-action menus,
- Persian calendars.

## 6.3 Portal-safe CSS variables

`AdminQueryProvider` writes the data-grid variables onto the root document so components rendered with `createPortal(..., document.body)` still receive the correct theme.

Variables include:

```text
--adt-canvas
--adt-chrome
--adt-surface
--adt-surface-raised
--adt-surface-muted
--adt-text
--adt-muted
--adt-soft
--adt-border
--adt-border-strong
--adt-accent
--adt-accent-strong
--adt-danger
--adt-success
--adt-warning
--adt-info
--adt-overlay
```

The provider also synchronizes:

```ts
body.style.backgroundColor
body.style.color
body.style.colorScheme
body.dataset.adminTheme
```

---

# 7. RTL contract

The final build is Persian-admin-first.

`AdminQueryProvider` explicitly sets:

```html
<html dir="rtl">
<body dir="rtl">
```

The following components also set RTL locally where appropriate:

- `DynamicDataTable`
- `DynamicFilters`
- `DynamicForm`
- `DynamicModal`
- `DynamicRecordView`
- `FloatingPanel`
- `DataInput`
- `DataTextarea`
- `DataSelect`
- `DataSwitch`
- `FilterChip`
- Persian calendar UI

Most fields therefore need no direction configuration.

A form field can still explicitly provide `dir: "ltr"` when a specific data value genuinely requires LTR presentation, but the default is RTL.

---

# 8. Public exports

The package entry file exports:

```ts
export { DynamicDataTable } from "./dynamic-data-table";
export { DynamicModal } from "./dynamic-modal";
export { DynamicForm } from "./dynamic-form";
export { DynamicRecordView } from "./dynamic-record-view";

export {
  PersianDatePicker,
  formatPersianDate,
  formatPersianDateCompact,
} from "./persian-date-picker";

export {
  DataButton,
  DataInput,
  DataTextarea,
  DataSelect,
  DataSwitch,
  FloatingPanel,
  FilterChip,
} from "./primitives";

export { createClientDataSource } from "./client-data-source";
export { useAdminTheme, ADMIN_DATA_THEME } from "./use-admin-theme";
export type * from "./types";
```

Recommended import style:

```tsx
import {
  DynamicDataTable,
  type DynamicColumn,
  type DynamicFilterDefinition,
  type DynamicFormSchema,
} from "@/components/admin/dynamic-data-table";
```

---

# 9. Main component

## 9.1 Generic signature

```tsx
DynamicDataTable<
  TRecord,
  TCreateValues,
  TEditValues,
  TFilters
>
```

Example:

```tsx
<DynamicDataTable<
  Product,
  ProductCreateForm,
  ProductEditForm,
  ProductFilters
>
  {...props}
/>
```

## 9.2 `DynamicDataTableProps`

```ts
type DynamicDataTableProps<
  TRecord,
  TCreateValues extends DynamicFormValues = DynamicFormValues,
  TEditValues extends DynamicFormValues = DynamicFormValues,
  TFilters extends AnyRecord = AnyRecord,
> = {
  tableId: string;
  title: string;
  description?: string;
  eyebrow?: string;
  direction?: "rtl" | "ltr";
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
```

## 9.3 Main props reference

| Prop | Required | Purpose |
| --- | ---: | --- |
| `tableId` | Yes | Stable identifier used for local preferences such as column visibility. |
| `title` | Yes | Main table heading. |
| `description` | No | Supporting description under the title. |
| `eyebrow` | No | Small contextual label above the title. |
| `direction` | No | Table direction. Defaults to `rtl`. |
| `locale` | No | Formatting locale. Defaults to `fa-IR`. |
| `source` | Yes | Data loading contract. |
| `columns` | Yes | Desktop/mobile column configuration. |
| `getRowId` | Yes | Stable unique row key and CRUD ID resolver. |
| `getRowLabel` | No | Human-readable object name used in dialogs. |
| `search` | No | Search behavior. |
| `filters` | No | Filter definitions. |
| `initialFilters` | No | Initial committed filter object. |
| `pagination` | No | Page size and page-number behavior. |
| `columnVisibility` | No | Column selector and persistence behavior. |
| `mobile` | No | Mobile card presentation. |
| `crud` | No | Create/View/Edit/Delete/extra-action definitions. |
| `emptyState` | No | Custom empty/no-results copy. |
| `labels` | No | UI label overrides. |
| `renderMeta` | No | Renders `result.meta` returned by `fetchPage`. |
| `onStateChange` | No | Receives committed page/search/sort/filter state. Useful for external URL/state sync. |
| `className` | No | Additional class on the root grid section. |

---

# 10. Data source contract

## 10.1 `DynamicDataSource`

```ts
type DynamicDataSource<
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
```

### `queryKey`

Base React Query namespace for the resource.

Example:

```ts
queryKey: ["admin", "products"]
```

Do not include page/search/filter state in this base key. The grid appends that state automatically.

### `fetchPage`

Called whenever the committed dataset state changes.

It receives:

```ts
type DynamicTableRequest<TFilters> = {
  page: number;
  pageSize: number;
  search: string;
  sort: DynamicSortRule[];
  filters: TFilters;
  signal: AbortSignal;
};
```

Use `signal` in `fetch()` requests:

```ts
fetchPage: async ({ signal, ...request }) => {
  const response = await fetch("/api/admin/products", {
    signal,
  });
  // ...
}
```

This allows React Query to cancel obsolete requests.

### `fetchOne`

Optional detail loader used for **View** and **Edit** dialogs.

If omitted, the row object already present in the table is used as the detail record.

If provided, View/Edit detail queries use:

```text
[...source.queryKey, "detail", recordId]
```

Detail results use infinite stale/gc time and are shared between View and Edit for the same ID until invalidated or refreshed.

## 10.2 Result contract

```ts
type DynamicTableResult<TRecord> = {
  items: TRecord[];
  total: number;
  page?: number;
  pageSize?: number;
  pageCount?: number;
  meta?: unknown;
};
```

Only `items` and `total` are required.

If `pageCount` is omitted, the grid calculates it from `total / pageSize`.

`meta` is forwarded to `renderMeta`.

---

# 11. React Query cache behavior

The dataset query key is effectively:

```ts
[
  ...source.queryKey,
  "page",
  {
    page,
    pageSize,
    search: committedSearch,
    sort,
    filters: compactFilters(serializedCommittedFilters),
  },
]
```

Therefore each meaningful dataset state has its own cache entry.

Example:

```text
Page 1 -> request
Page 2 -> request
Page 1 -> memory cache, no request
```

The grid uses:

```ts
placeholderData: keepPreviousData
staleTime: Infinity
gcTime: Infinity
refetchOnWindowFocus: false
retry: 1
```

`keepPreviousData` keeps the current rows visible while a new page/state is being fetched instead of blanking the table.

## Manual refresh

The Refresh button runs:

```ts
tableQuery.refetch({ cancelRefetch: true })
```

It refreshes only the current dataset key.

## Mutation invalidation

After Create/Edit/Delete:

1. the full resource namespace is invalidated with `refetchType: "none"`,
2. only the currently active dataset key is immediately refetched,
3. inactive cached pages/details are left stale instead of causing a request fan-out.

This avoids fetching every cached page after one mutation.

---

# 12. Search

```ts
type DynamicSearchConfig = {
  enabled?: boolean;
  placeholder?: string;
  debounceMs?: number;
};
```

Default debounce:

```text
320 ms
```

The component keeps two values:

```text
searchInput       -> what the user is typing
committedSearch   -> what is part of the React Query key
```

The search also tracks input-method composition so an IME composition sequence does not commit partial text prematurely.

Whenever search becomes committed:

```text
page -> 1
query key -> changes
fetchPage -> executes or resolves from cache
```

Disable search completely with:

```tsx
search={{ enabled: false }}
```

---

# 13. Sorting

## Column configuration

```ts
{
  id: "price",
  label: "Price",
  accessor: "price",
  sortable: true,
  sortKey: "price",
}
```

`sortKey` defaults to `column.id`.

Click cycle:

```text
none -> asc -> desc -> none
```

Normal click replaces the current sort list.

**Shift + click** preserves other active sort rules and adds/removes the selected column, enabling multi-sort.

`fetchPage` receives:

```ts
sort: [
  { id: "status", key: "status", direction: "asc" },
  { id: "price", key: "price", direction: "desc" },
]
```

Sorting resets the page to `1`.

---

# 14. Column definitions

```ts
type DynamicColumn<TRecord> = {
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
  align?: "start" | "center" | "end";
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
```

## Accessors

Dot path:

```ts
accessor: "supplier.name"
```

Function:

```ts
accessor: (product) => product.inventory.available
```

If `accessor` is omitted, the grid attempts to read `column.id` as a dot path.

## Custom cell

```tsx
cell: ({ record }) => (
  <StatusBadge status={record.status} />
)
```

## Visibility

```ts
defaultHidden: true
```

The column is initially hidden but may be enabled by the user.

```ts
lockVisibility: true
```

The column is kept visible and omitted from the visibility selector.

```ts
desktop: { hidden: true }
```

The column is never rendered in the desktop table.

```ts
mobile: { hidden: true }
```

The column is never rendered in mobile cards.

---

# 15. Column visibility

```ts
type DynamicColumnVisibilityConfig = {
  enabled?: boolean;
  persist?: boolean;
  storageKey?: string;
};
```

Example:

```tsx
columnVisibility={{
  enabled: true,
  persist: true,
  storageKey: "admin-products-columns",
}}
```

When persistence is enabled, selected column IDs are stored in `localStorage`.

Default storage key:

```text
najib-admin-table:{tableId}:columns
```

Corrupted or outdated saved preferences are ignored and the grid falls back to valid defaults.

---

# 16. Responsive rendering

The component has separate desktop and mobile renderers.

## Desktop

At `md` and above:

- semantic `<table>` markup,
- sticky header,
- optional sticky columns,
- row actions,
- horizontal overflow only when required,
- no dedicated vertical table scrollbar.

The AdminShell/page remains responsible for vertical scrolling.

## Mobile

Below `md`:

- no `<table>` is rendered,
- each record becomes a card,
- configured identity, subtitle, media, badge and fields are rendered,
- CRUD/extra actions remain available.

This avoids forcing users to horizontally pan a desktop table on a phone.

---

# 17. Mobile configuration

```ts
type DynamicMobileConfig<TRecord> = {
  title?: (record: TRecord) => ReactNode;
  subtitle?: (record: TRecord) => ReactNode;
  media?: (record: TRecord) => ReactNode;
  badge?: (record: TRecord) => ReactNode;
  fieldIds?: string[];
  maxFields?: number;
  cardClassName?: string;
};
```

Example:

```tsx
mobile={{
  title: (row) => row.name,
  subtitle: (row) => `${row.sku} · ${row.category}`,
  badge: (row) => <StatusBadge status={row.status} />,
  fieldIds: ["price", "stock", "status", "category"],
  maxFields: 4,
}}
```

Field order follows each column's mobile `priority` after the configured field pool is resolved.

Default maximum mobile fields:

```text
6
```

---

# 18. Pagination

```ts
type DynamicPaginationConfig = {
  initialPageSize?: number;
  pageSizeOptions?: number[];
  showPageNumbers?: boolean;
};
```

Default initial page size:

```text
15
```

Default page-size options:

```ts
[10, 15, 25, 50, 100]
```

Changing page size resets the current page to `1`.

Filtering, search and sorting also reset to page `1`.

If the current page becomes greater than the new page count, the grid clamps it to the last valid page.

After deleting the only record on a page and when `page > 1`, the grid moves back one page before refreshing.

---

# 19. Filters: design and data flow

Filters are intentionally **draft based**.

There are two filter states:

```text
draft filters      -> values currently edited in the filter UI
committed filters  -> values included in the dataset query key
```

Flow:

```text
Open filter
   ↓
Change one or many draft values
   ↓
No dataset request
   ↓
Press Apply Filters
   ↓
Draft becomes committed
   ↓
Page resets to 1
   ↓
React Query key changes once
   ↓
One dataset request (unless already cached)
```

This is specifically designed to prevent a resource with many filters from issuing a request for every filter interaction.

---

# 20. Filter configuration

## 20.1 Shared filter props

```ts
type DynamicFilterBase<TFilters, TRecord = unknown> = {
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
```

### `id`

Must match the filter-state property.

### `defaultValue`

Used by initial construction and Clear Filters.

### `badge`

Controls the short summary shown on the filter chip.

### `serialize`

Transforms the committed UI value before it is passed to `fetchPage` and before it is used in the dataset query key.

Example:

```ts
serialize: (value) =>
  value === "all" ? null : value
```

### `appliesTo`

The type currently exposes `appliesTo`, but **the v3.2.1 grid core does not consume it**. Treat it as reserved API surface unless you explicitly extend the implementation.

---

# 21. Filter types

The available kinds are:

```ts
"text"
"number"
"select"
"multi-select"
"boolean"
"date"
"date-range"
"custom"
```

## 21.1 Text filter

```ts
{
  id: "sku",
  kind: "text",
  label: "SKU",
  placeholder: "NV-1024",
  defaultValue: null,
}
```

## 21.2 Number filter

```ts
{
  id: "minStock",
  kind: "number",
  label: "Minimum stock",
  min: 0,
  max: 9999,
  defaultValue: null,
}
```

Additional props:

```ts
min?: number;
max?: number;
```

## 21.3 Select filter

```ts
{
  id: "status",
  kind: "select",
  label: "Status",
  options: STATUS_OPTIONS,
  defaultValue: null,
}
```

Selecting an item closes the filter popup immediately.

## 21.4 Multi-select filter

```ts
{
  id: "brands",
  kind: "multi-select",
  label: "Brand",
  options: BRAND_OPTIONS,
  searchable: true,
  allowSelectAll: true,
  defaultValue: [],
}
```

Multi-select remains open while values are toggled. The user closes/confirms the focused filter and later applies the entire draft filter set using the main Apply button.

## 21.5 Boolean filter

```ts
{
  id: "featured",
  kind: "boolean",
  label: "Featured product",
  trueLabel: "Featured only",
  falseLabel: "Not featured",
  defaultValue: null,
}
```

`null` means no boolean restriction.

## 21.6 Date filter

```ts
{
  id: "createdOn",
  kind: "date",
  label: "Created on",
  defaultValue: null,
  minDate: "2025-01-01",
  maxDate: "2027-12-31",
}
```

UI: Persian calendar.  
Stored value: Gregorian ISO date.

Example:

```ts
createdOn: "2026-09-14"
```

The calendar closes automatically after selection.

## 21.7 Date-range filter

```ts
{
  id: "createdRange",
  kind: "date-range",
  label: "Created range",
  defaultValue: {
    from: null,
    to: null,
  },
}
```

Value shape:

```ts
type PersianDateRangeValue = {
  from: string | null;
  to: string | null;
};
```

Example committed API value:

```ts
{
  from: "2026-09-01",
  to: "2026-09-30",
}
```

The popup closes after the second date is selected.

## 21.8 Custom filter

```ts
{
  id: "priceRange",
  kind: "custom",
  label: "Price range",
  defaultValue: {
    min: null,
    max: null,
  },
  render: ({ value, setValue, filters, close }) => {
    return <YourCustomFilter />;
  },
}
```

Custom filter render arguments:

```ts
{
  value: unknown;
  setValue: (value: unknown) => void;
  filters: TFilters;
  close: () => void;
}
```

---

# 22. Lazy remote filter options

Select/multi-select filters may provide `loadOptions` instead of static options.

```ts
{
  id: "category",
  kind: "select",
  label: "Category",

  loadOptions: async ({ signal, filters }) => {
    const response = await fetch("/api/admin/categories", {
      signal,
    });

    return response.json();
  },
}
```

Important behavior:

- `loadOptions` does not run when the table mounts.
- It does not run when an unrelated filter opens.
- The `FilterEditorPopover` only exists for the active filter.
- The query is enabled only when that active filter is a select/multi-select with `loadOptions`.
- Results are cached with infinite stale/gc time.

Default option query key:

```ts
[
  ...baseQueryKey,
  "filter-options",
  definition.id,
]
```

Override it with:

```ts
optionQueryKey?: (filters) => QueryKey
```

Use a custom option query key when option results depend on other draft filter values.

---

# 23. DataSelectOption

```ts
type DataSelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  keywords?: string[];
  meta?: unknown;
};
```

`keywords` are included in internal select/filter searching.

`meta` can carry application-specific metadata for external/custom usage.

---

# 24. Persian date picker

## Props

```ts
type PersianDatePickerProps = {
  mode?: "single" | "range";
  value?: string | null | PersianDateRangeValue;
  onChange: (
    value: string | null | PersianDateRangeValue,
  ) => void;
  onComplete?: () => void;
  minDate?: string;
  maxDate?: string;
  autoClose?: boolean;
  className?: string;
};
```

## Calendar behavior

- Persian month names.
- Persian numeric display.
- Saturday-first week layout.
- "Today" is resolved using `Asia/Tehran`.
- Persian/Gregorian conversion is based on browser `Intl.DateTimeFormat` with the Persian calendar.
- No third-party date package is required.
- API/storage values remain Gregorian ISO strings.
- `minDate` and `maxDate` compare ISO dates.
- Single mode calls `onComplete` after selection when `autoClose` is true.
- Range mode calls `onComplete` after both endpoints have been selected.

## Formatting helpers

```ts
formatPersianDate("2026-09-14")
```

Returns a long Persian-calendar representation.

```ts
formatPersianDateCompact("2026-09-14")
```

Returns a compact `YYYY/M/D` Persian-calendar representation using Persian digits.

---

# 25. CRUD configuration

```ts
type DynamicCrudConfig<
  TRecord,
  TCreateValues,
  TEditValues,
> = {
  create?: DynamicCreateConfig<TRecord, TCreateValues>;
  edit?: DynamicEditConfig<TRecord, TEditValues>;
  view?: DynamicViewConfig<TRecord>;
  delete?: DynamicDeleteConfig<TRecord>;
  extraRowActions?: DynamicExtraRowAction<TRecord>[];
};
```

Row actions are placed inside a compact action menu instead of exposing many buttons in every row.

---

# 26. Create configuration

```ts
type DynamicCreateConfig<TRecord, TCreateValues> = {
  enabled?: boolean;
  label?: string;
  title?: string;
  description?: string;
  schema: DynamicFormSchema<TCreateValues>;
  initialValues: TCreateValues | (() => TCreateValues);
  mutationFn: (args: {
    values: TCreateValues;
  }) => Promise<TRecord | void>;
  mapError?: DynamicFormErrorMapper;
  onSuccess?: (record: TRecord | void) => void;
};
```

Flow:

```text
Create button
 -> DynamicModal
 -> DynamicForm
 -> client/schema validation
 -> mutationFn
 -> onSuccess
 -> close modal
 -> invalidate resource namespace without fan-out
 -> refetch active dataset key
 -> success announcement
```

`initialValues` may be a function when a fresh object should be created for every modal opening.

---

# 27. Edit configuration

```ts
type DynamicEditConfig<TRecord, TEditValues> = {
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
  onSuccess?: (
    record: TRecord | void,
    original: TRecord,
  ) => void;
};
```

`enabled` may be conditional per record:

```ts
enabled: (record) => record.status !== "archived"
```

When `source.fetchOne` exists, Edit first resolves the cached/detail record before creating form values.

---

# 28. View configuration

```ts
type DynamicViewConfig<TRecord> = {
  enabled?: boolean | ((record: TRecord) => boolean);
  title?: string | ((record: TRecord) => string);
  description?: string;
  fields?: DynamicViewField<TRecord>[];
  sections?: DynamicViewSection<TRecord>[];
  render?: (record: TRecord) => ReactNode;
};
```

If `render` is supplied, it takes over the entire view body.

If `fields` are omitted, `DynamicRecordView` creates fields from the top-level keys of the record.

## View field

```ts
type DynamicViewField<TRecord> = {
  id: string;
  label: string;
  accessor?: string | ((record: TRecord) => unknown);
  render?: (args: {
    value: unknown;
    record: TRecord;
  }) => ReactNode;
  colSpan?: 1 | 2 | "full";
  hidden?: boolean | ((record: TRecord) => boolean);
};
```

## View section

```ts
type DynamicViewSection<TRecord> = {
  id: string;
  title: string;
  description?: string;
  fieldIds?: string[];
  hidden?: boolean | ((record: TRecord) => boolean);
};
```

---

# 29. Delete configuration

```ts
type DynamicDeleteConfig<TRecord> = {
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
```

Delete uses an `alertdialog` rather than the generic form modal.

Important behavior:

- default focus is placed on the cancel button,
- Escape/backdrop close is blocked while the mutation is pending,
- mutation errors remain visible inside the confirmation flow,
- `dangerLevel: "soft"` uses warning treatment and a default deactivation label,
- `dangerLevel: "hard"` uses destructive treatment.

---

# 30. Extra row actions

```ts
type DynamicExtraRowAction<TRecord> = {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (record: TRecord) => void | Promise<void>;
  hidden?: boolean | ((record: TRecord) => boolean);
  disabled?: boolean | ((record: TRecord) => boolean);
  tone?: "neutral" | "danger" | "warning" | "success";
};
```

Example:

```tsx
extraRowActions: [
  {
    id: "duplicate",
    label: "Duplicate",
    icon: <Copy size={14} />,
    onClick: async (record) => {
      await duplicateProduct(record.id);
    },
  },
]
```

Extra actions may be sync or async.

---

# 31. Dynamic forms

The same form engine is used by Create and Edit.

## `DynamicFormProps`

```ts
type DynamicFormProps<TValues> = {
  schema: DynamicFormSchema<TValues>;
  initialValues: TValues;
  onSubmit: (values: TValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  mapError?: DynamicFormErrorMapper;
  disabled?: boolean;
  className?: string;
};
```

Forms render one column on small screens and two columns from `md` upward.

The bottom action area becomes sticky on desktop so Save/Cancel remain reachable in long modal forms.

---

# 32. Form schema

```ts
type DynamicFormSchema<TValues> = {
  fields: DynamicFormField<TValues>[];
  sections?: DynamicFormSection<TValues>[];
  validate?: (
    values: TValues,
  ) =>
    | Record<string, string>
    | Promise<Record<string, string>>;
};
```

If `sections` are omitted, all fields are rendered in a default "Main information" section.

## Section

```ts
type DynamicFormSection<TValues> = {
  id: string;
  title: string;
  description?: string;
  fieldNames?: string[];
  hidden?: boolean | ((values: TValues) => boolean);
};
```

---

# 33. Shared form-field props

```ts
type DynamicFormFieldBase<TValues> = {
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
  dir?: "rtl" | "ltr" | ((values: TValues) => "rtl" | "ltr");
  validate?: (
    value: unknown,
    values: TValues,
  ) => string | null | undefined;
};
```

## Dot-path fields

`name` can be nested:

```ts
name: "supplier.email"
```

The form reads and writes nested values immutably using `getPathValue` and `setPathValue`.

Example value object:

```ts
{
  supplier: {
    email: "supplier@example.com",
  },
}
```

---

# 34. Input field

```ts
type DynamicInputField<TValues> = DynamicFormFieldBase<TValues> & {
  kind: "input";
  inputType?:
    | "text"
    | "password"
    | "email"
    | "number"
    | "tel"
    | "url"
    | "search";
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
```

For `inputType: "number"`, the default parser returns `number | null`.

---

# 35. Textarea field

```ts
type DynamicTextareaField<TValues> = DynamicFormFieldBase<TValues> & {
  kind: "textarea";
  rows?: number;
  maxLength?: number;
  format?: (value: unknown, values: TValues) => string;
  parse?: (value: string, values: TValues) => unknown;
};
```

---

# 36. Select and multi-select form fields

```ts
type DynamicSelectField<TValues> = DynamicFormFieldBase<TValues> & {
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
```

`searchable` defaults to true when there are more than eight options unless explicitly set.

---

# 37. Boolean form field

```ts
type DynamicBooleanField<TValues> = DynamicFormFieldBase<TValues> & {
  kind: "boolean";
  onLabel?: string;
  offLabel?: string;
};
```

Rendered using `DataSwitch`.

---

# 38. Date form field

```ts
type DynamicDateField<TValues> = DynamicFormFieldBase<TValues> & {
  kind: "date";
  minDate?: string;
  maxDate?: string;
  clearable?: boolean;
};
```

Value is expected to be:

```ts
string | null
```

The UI is Persian/Jalali; stored value is Gregorian ISO.

---

# 39. Date-range form field

```ts
type DynamicDateRangeField<TValues> = DynamicFormFieldBase<TValues> & {
  kind: "date-range";
  minDate?: string;
  maxDate?: string;
  clearable?: boolean;
};
```

Value:

```ts
{
  from: string | null;
  to: string | null;
}
```

---

# 40. Custom form field

```ts
type DynamicCustomField<TValues> = DynamicFormFieldBase<TValues> & {
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
```

Use this for application-specific controls such as:

- image uploaders,
- media selectors,
- color pickers,
- complex pricing controls,
- relation pickers,
- rich editors.

---

# 41. Form validation lifecycle

Submit sequence:

```text
1. Ignore hidden fields.
2. Validate required fields.
3. Run each field.validate.
4. If no field errors, run schema.validate.
5. If errors exist:
   - store errors,
   - show form-level error,
   - focus and scroll to the first invalid field.
6. If valid, call onSubmit.
7. If onSubmit throws, pass the error through mapError.
8. Map returned field errors back into the form.
```

## Server/API error mapper

```ts
type DynamicFormErrorResult = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

type DynamicFormErrorMapper = (
  error: unknown,
) => DynamicFormErrorResult;
```

Example:

```ts
mapError: (error) => ({
  message: "The product could not be saved.",
  fieldErrors: {
    sku: "This SKU already exists.",
  },
})
```

---

# 42. Dynamic modal

## Props

```ts
type DynamicModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  mobileFullscreen?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  busy?: boolean;
  role?: "dialog" | "alertdialog";
  initialFocusSelector?: string;
};
```

Default size:

```text
lg
```

Desktop max widths:

```text
sm -> 520px
md -> 680px
lg -> 860px
xl -> 1040px
```

## Modal behavior

- Portaled to `document.body`.
- Explicit RTL.
- Own theme variables and solid raised-surface background.
- Background is inert while modal is open.
- Body scrolling is locked.
- Scrollbar width is compensated to reduce layout shift.
- Keyboard focus is trapped inside the modal.
- Initial focus can be selected with `initialFocusSelector`.
- Focus returns to the previously focused element after close.
- Escape closes unless disabled or `busy`.
- Backdrop closes unless disabled or `busy`.
- Header and optional footer remain fixed while modal body scrolls.
- Horizontal overflow is hidden.
- By default, mobile dialogs occupy the full dynamic viewport height.

---

# 43. Dynamic record view

```ts
type DynamicRecordViewProps<TRecord> = {
  record: TRecord;
  config: DynamicViewConfig<TRecord>;
  locale?: string;
};
```

Behavior:

- `config.render` takes complete control when provided.
- Otherwise fields are rendered as a description-list style detail layout.
- Sections may selectively include field IDs.
- Field values may use dot paths or accessor functions.
- Field visibility may be conditional per record.
- `formatUnknown` is used for values without a custom renderer.

---

# 44. Grid-owned UI primitives

The system intentionally owns its controls to prevent external component constraints from breaking its layout/responsiveness.

## 44.1 `DataButton`

```ts
type DataButtonTone =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "warning";

type DataButtonSize = "sm" | "md" | "lg";

type DataButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: DataButtonTone;
  size?: DataButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  iconOnly?: boolean;
  fullWidth?: boolean;
};
```

Behavior:

- forwards native button props,
- `loading` disables the button and shows a spinner,
- supports icon-only buttons,
- preserves button size while loading,
- explicit focus-visible styling,
- disabled/busy semantics.

## 44.2 `DataInput`

```ts
type DataInputProps =
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
    label?: string;
    helperText?: string;
    error?: string;
    leadingIcon?: ReactNode;
    prefixText?: string;
    suffixText?: string;
    trailing?: ReactNode;
  };
```

Native input props are supported, including `type`, `value`, `onChange`, `min`, `max`, `step`, `readOnly`, `disabled`, `autoComplete`, etc.

Default direction is RTL.

## 44.3 `DataTextarea`

```ts
type DataTextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    helperText?: string;
    error?: string;
  };
```

Default direction is RTL.

## 44.4 `DataSwitch`

```ts
{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}
```

Uses `role="switch"` and `aria-checked`.

## 44.5 `DataSelect`

```ts
type DataSelectProps = {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  options: DataSelectOption[];
  value: string | string[] | null;
  onChange: (
    value: string | string[] | null,
  ) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  allowSelectAll?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
};
```

Behavior:

- single or multiple selection,
- optional search,
- optional clear,
- optional select-all,
- disabled options,
- option descriptions,
- automatic mobile bottom sheet through `FloatingPanel`,
- desktop anchored popover.

## 44.6 `FloatingPanel`

```ts
type FloatingPanelProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  title?: string;
  children: ReactNode;
  desktopWidth?: number;
  minTriggerWidth?: boolean;
  className?: string;
};
```

Desktop:

- portaled anchored panel,
- automatically flips above the trigger when space below is insufficient,
- clamps itself inside viewport boundaries,
- repositions on resize/scroll.

Mobile (`max-width: 767px`):

- full-width bottom sheet,
- background overlay,
- body scroll lock,
- focuses first available control,
- safe-area bottom padding.

Both modes close on outside pointer interaction and Escape.

## 44.7 `FilterChip`

Additional props on top of native button props:

```ts
{
  label: string;
  summary?: string;
  active?: boolean;
  dirty?: boolean;
}
```

`summary` displays the current draft value.  
`active` marks the currently open filter.  
`dirty` shows that the filter differs from the committed dataset state.

---

# 45. Filter rail responsiveness

The filter system uses a horizontal chip rail rather than rendering every editor simultaneously.

This provides:

- compact layout on desktop,
- horizontal scrolling when many filters exist,
- no page-width expansion,
- one focused editor at a time,
- mobile-friendly filter sheets,
- clear distinction between draft and applied values.

The rail owns only horizontal overflow and uses Lenis prevention attributes so custom smooth scrolling does not interfere with it.

---

# 46. Row actions

Rows do not render all actions inline.

A compact three-dot action trigger opens a `FloatingPanel` containing only available actions for that record.

Availability is resolved from:

```ts
crud.view.enabled
crud.edit.enabled
crud.delete.enabled
extraRowAction.hidden
extraRowAction.disabled
```

`enabled` may be a boolean or a record predicate for View/Edit/Delete.

Extra-action visual tone supports:

```text
neutral
success
warning
danger
```

---

# 47. Empty, loading, error and background-fetch states

The data grid handles:

- first-load skeleton/loading state,
- fetch errors with Retry,
- empty dataset state,
- no-results state when constraints exist,
- background fetching without removing current rows,
- success/error/info announcements.

Announcements automatically disappear after approximately 4.2 seconds.

`keepPreviousData` is used during dataset transitions so the UI remains stable while another page or state loads.

---

# 48. Empty-state configuration

```ts
type DynamicEmptyStateConfig = {
  title?: string;
  description?: string;
  filteredTitle?: string;
  filteredDescription?: string;
};
```

The grid distinguishes between:

```text
empty resource
```

and:

```text
no results because search/filter/sort constraints are active
```

---

# 49. Labels

```ts
type DynamicTableLabels = {
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
```

The grid ships with Persian defaults.

### Current implementation note

`close`, `save`, and `noValue` are part of the public label type but are not currently consumed by the main `dynamic-data-table.tsx` rendering path in v3.2.1. They should be considered reserved/customization surface for future or extended usage.

---

# 50. `renderMeta`

A backend/data source can return metadata:

```ts
return {
  items,
  total,
  meta: {
    requestId,
    aggregatedTotals,
    cachePolicy,
  },
};
```

Then render it:

```tsx
renderMeta={(meta) => {
  const value = meta as ProductMeta;

  return (
    <div>
      Request: {value.requestId}
    </div>
  );
}}
```

The grid does not interpret `meta`; it only forwards it.

---

# 51. `onStateChange`

Called whenever committed table state changes:

```ts
onStateChange?.({
  page,
  pageSize,
  search: committedSearch,
  sort,
  filters: committedFilters,
});
```

Typical uses:

- analytics,
- debugging,
- external state inspection,
- syncing state to URL search parameters.

**URL synchronization is not built into v3.2.1.** If required, implement it in the parent using `onStateChange` plus initial prop/state hydration.

---

# 52. Local/in-memory data source

`createClientDataSource` can adapt a local array to the same grid interface.

```ts
const source = createClientDataSource<Product, ProductFilters>({
  queryKey: ["admin", "demo-products"],
  getData: () => products,
  searchableText: (record) =>
    `${record.name} ${record.sku}`,
  filterRecord: (record, filters) => {
    return true;
  },
});
```

It provides:

- search,
- filter callback,
- multi-rule sorting,
- pagination,
- React Query caching.

The helper is useful for prototypes, static admin tools, and client-only datasets. Real production APIs should generally implement `DynamicDataSource` directly.

---

# 53. Utility functions

`utils.ts` currently exports:

```text
cx
getPathValue
setPathValue
getColumnValue
isTruthyConfig
isFieldFlag
formatUnknown
isPersianDateRange
isEmptyFilterValue
compactFilters
pageCountFrom
resolveFieldSpan
stableStringify
clamp
```

Important helpers:

### `stableStringify`

Deterministically serializes nested values with sorted object keys. Used to compare filter draft state against committed state without depending on object-key insertion order.

### `isEmptyFilterValue`

Recognizes empty values including:

- `null`,
- `undefined`,
- empty string,
- empty arrays,
- empty Persian date ranges,
- nested objects whose values are all empty.

This prevents objects such as:

```ts
{ from: null, to: null }
```

from being incorrectly counted as active filters.

### `compactFilters`

Removes empty values before the filters are embedded in the React Query dataset key.

---

# 54. Prop and state flow map

This is the most important architecture map when extending the system.

```text
Parent resource page
│
├─ source
│  ├─ queryKey
│  ├─ fetchPage
│  └─ fetchOne?
│
├─ columns
├─ search
├─ filters
├─ pagination
├─ columnVisibility
├─ mobile
├─ crud
├─ renderMeta
└─ onStateChange
       │
       ▼
DynamicDataTable
│
├─ React Query dataset query
│  └─ source.fetchPage(request)
│
├─ DynamicFilters
│  ├─ definitions = filters
│  ├─ committed = committedFilters
│  ├─ baseQueryKey = source.queryKey
│  ├─ onApply(next) -> DynamicDataTable.setCommittedFilters(next)
│  └─ onClear() -> rebuild initial filter state
│
├─ DesktopTable
│  ├─ visible columns
│  ├─ records
│  ├─ sort state
│  └─ CRUD row-action trigger
│
├─ MobileCards
│  ├─ mobile columns
│  ├─ mobile presentation callbacks
│  └─ same CRUD row-action trigger
│
├─ Pagination
│  ├─ page
│  ├─ pageSize
│  ├─ total
│  └─ pageCount
│
└─ CrudDialogs
   │
   ├─ View
   │  ├─ source.fetchOne? -> detail query
   │  └─ DynamicRecordView
   │
   ├─ Create
   │  └─ DynamicForm
   │     ├─ crud.create.schema
   │     ├─ crud.create.initialValues
   │     ├─ crud.create.mapError
   │     └─ crud.create.mutationFn
   │
   ├─ Edit
   │  ├─ source.fetchOne? -> detail query
   │  └─ DynamicForm
   │     ├─ crud.edit.schema
   │     ├─ crud.edit.toInitialValues
   │     ├─ crud.edit.mapError
   │     └─ crud.edit.mutationFn
   │
   └─ Delete
      ├─ DynamicModal(role="alertdialog")
      └─ crud.delete.mutationFn
```

---

# 55. Filter prop flow

```text
DynamicDataTable.filters
       │
       ▼
DynamicFilters.definitions
       │
       ├─ draft state
       ├─ active filter id
       └─ committed state comparison
              │
              ▼
       FilterEditorPopover
              │
              ├─ baseQueryKey
              ├─ active definition
              ├─ current draft filters
              └─ trigger ref
                     │
                     ├─ remote option query
                     │    └─ definition.loadOptions({ signal, filters })
                     │
                     └─ FilterEditor
                          ├─ setValue -> draft only
                          └─ close -> closes one editor

Main Apply button
       │
       ▼
onApply(draft)
       │
       ▼
DynamicDataTable.setCommittedFilters
       │
       ▼
Dataset query key changes once
```

---

# 56. CRUD prop flow

## Create

```text
crud.create
 ├─ label/title/description -> modal/header/buttons
 ├─ schema -> DynamicForm
 ├─ initialValues -> DynamicForm
 ├─ mapError -> DynamicForm
 ├─ mutationFn <- validated values
 └─ onSuccess <- mutation result
```

## Edit

```text
row
 -> source.fetchOne? 
 -> resolved record
 -> crud.edit.toInitialValues(record)
 -> DynamicForm
 -> crud.edit.mutationFn({ id, record, values })
 -> crud.edit.onSuccess(result, original)
```

## View

```text
row
 -> source.fetchOne?
 -> resolved record
 -> DynamicRecordView(config=crud.view)
```

## Delete

```text
row
 -> alert dialog
 -> crud.delete.mutationFn({ id, record })
 -> onSuccess
 -> cache invalidation/refetch
```

---

# 57. Minimal server-backed example

```tsx
"use client";

import {
  DynamicDataTable,
  type DynamicColumn,
  type DynamicFilterDefinition,
} from "@/components/admin/dynamic-data-table";

type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  status: "active" | "draft";
};

type ProductFilters = {
  status?: string | null;
};

const columns: DynamicColumn<Product>[] = [
  {
    id: "name",
    label: "Product",
    accessor: "name",
    sortable: true,
    sticky: "start",
    lockVisibility: true,
  },
  {
    id: "price",
    label: "Price",
    accessor: "price",
    sortable: true,
  },
  {
    id: "status",
    label: "Status",
    accessor: "status",
  },
];

const filters: DynamicFilterDefinition<ProductFilters, Product>[] = [
  {
    id: "status",
    kind: "select",
    label: "Status",
    defaultValue: null,
    options: [
      { value: "active", label: "Active" },
      { value: "draft", label: "Draft" },
    ],
  },
];

export function ProductsTable() {
  return (
    <DynamicDataTable<Product, Record<string, unknown>, Record<string, unknown>, ProductFilters>
      tableId="products"
      title="Products"
      source={{
        queryKey: ["admin", "products"],
        fetchPage: async ({ page, pageSize, search, sort, filters, signal }) => {
          const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            search,
            sort: JSON.stringify(sort),
            filters: JSON.stringify(filters),
          });

          const response = await fetch(`/api/admin/products?${params}`, {
            signal,
          });

          if (!response.ok) {
            throw new Error("Failed to load products");
          }

          return response.json();
        },
      }}
      columns={columns}
      getRowId={(record) => record.id}
      getRowLabel={(record) => record.name}
      search={{
        placeholder: "Search products...",
        debounceMs: 320,
      }}
      filters={filters}
      initialFilters={{ status: null }}
      pagination={{
        initialPageSize: 15,
        pageSizeOptions: [10, 15, 25, 50],
      }}
      mobile={{
        title: (record) => record.name,
        subtitle: (record) => record.sku,
        fieldIds: ["price", "status"],
      }}
    />
  );
}
```

---

# 58. Full CRUD configuration example

```tsx
crud={{
  create: {
    label: "New product",
    title: "Create product",
    schema: createSchema,
    initialValues: () => ({
      sku: "",
      name: "",
      status: "draft",
    }),
    mutationFn: async ({ values }) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw await createApiError(response);
      }

      return response.json();
    },
    mapError: mapProductError,
  },

  edit: {
    title: (record) => `Edit ${record.name}`,
    schema: editSchema,
    toInitialValues: productToForm,
    mutationFn: async ({ id, values }) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw await createApiError(response);
      }

      return response.json();
    },
    mapError: mapProductError,
  },

  view: {
    title: (record) => `View ${record.name}`,
    fields: [
      { id: "name", label: "Name", accessor: "name" },
      { id: "sku", label: "SKU", accessor: "sku" },
      { id: "status", label: "Status", accessor: "status" },
    ],
  },

  delete: {
    title: (record) => `Delete ${record.name}`,
    dangerLevel: "hard",
    mutationFn: async ({ id }) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }
    },
  },
}}
```

---

# 59. Recommended resource-page architecture

Keep each resource page thin.

Recommended structure:

```text
products/
  product-table.tsx
  product-columns.tsx       (optional)
  product-filters.tsx       (optional)
  product-form-schema.tsx   (optional)
  product-data-source.ts    (optional)
```

For a small resource, all configuration can live in one file.

For a large domain, separate configuration by responsibility while keeping the reusable data-grid core untouched.

---

# 60. Performance principles built into the system

## Query caching

Page/filter/search/sort states are independently cached.

## Lazy filter option queries

Remote option APIs are not loaded eagerly.

## Draft filters

Multiple filter edits are combined into one committed dataset transition.

## Request cancellation

Dataset/detail/filter-option requests receive `AbortSignal`.

## Previous-data retention

Rows remain visible while the next dataset state loads.

## No mutation request fan-out

Only the active dataset key is immediately refetched after a CRUD mutation.

## Mobile-specific renderer

Phones do not pay the usability cost of a wide desktop table.

---

# 61. Accessibility behavior

The system currently includes:

- semantic desktop `<table>` markup,
- native buttons for actions,
- visible keyboard focus,
- `aria-sort` behavior on sortable headers,
- `role="switch"` and `aria-checked` on switches,
- dialog/alertdialog roles,
- focus trap inside modals,
- background `inert` during modal display,
- focus restoration after modal close,
- least-destructive initial focus for delete dialogs,
- Escape handling,
- disabled/busy button semantics,
- live announcements for mutation outcomes,
- no reliance on hover for core actions.

---

# 62. Lenis / scroll ownership

The data grid uses `data-lenis-prevent` attributes on owned internal scroll surfaces such as:

- horizontal table overflow,
- filter chip rail,
- floating panels,
- mobile sheets,
- modal body.

The table intentionally does **not** create a nested vertical desktop table scroller.

Expected hierarchy:

```text
AdminShell
  -> main workspace owns vertical page scrolling
      -> DynamicDataTable
          -> horizontal table overflow only
          -> local popover/modal/sheet scroll where necessary
```

---

# 63. Intentional boundaries / not built in

The following are not automatic core features in v3.2.1:

### URL search-parameter persistence

Use `onStateChange` and parent initialization if required.

### Bulk row selection / bulk actions

The grid currently provides row-level actions and column selection, but no generic selected-row/bulk-action state.

### Server permission enforcement

`enabled`/`hidden` callbacks are presentation controls only. The backend must still enforce authorization.

### Automatic API request shape

The grid gives `fetchPage` a typed request. Your resource layer decides how that request maps to REST, GraphQL, RPC, query parameters, or a request body.

### Optimistic mutations

CRUD currently performs the mutation and then invalidates/refetches. Optimistic updates are not enabled by default.

### Third-party date library

The Persian date picker intentionally uses browser `Intl` rather than Moment/Jalaali/date-fns-jalali/etc.

---

# 64. Common extension points

Use these before changing core internals:

| Need | Extension point |
| --- | --- |
| Custom table cell | `column.cell` |
| Derived column value | `column.accessor(record)` |
| Custom mobile title | `mobile.title` |
| Custom mobile badge | `mobile.badge` |
| Custom filter UI | `kind: "custom"` |
| Transform filter before API | `filter.serialize` |
| Lazy remote filter options | `filter.loadOptions` |
| Custom form control | `kind: "custom"` form field |
| Cross-field validation | `schema.validate` |
| Map server validation errors | `mapError` |
| Fully custom detail UI | `crud.view.render` |
| Per-row action availability | `enabled`, `hidden`, `disabled` predicates |
| Backend metadata | `renderMeta` |
| External table-state sync | `onStateChange` |

---

# 65. Troubleshooting

## `surfaceRaised` TypeScript error

If TypeScript says:

```text
Property 'surfaceRaised' does not exist...
```

an older `use-admin-theme.ts` is present.

The canonical palette type must include:

```ts
surfaceRaised: string;
```

and both dark/light themes must define it.

## Transparent modal/popover/calendar

Check that:

1. the latest `use-admin-theme.ts` exists,
2. `--adt-surface-raised` is produced by `getAdminDataThemeVars`,
3. `AdminQueryProvider` wraps the admin route group,
4. `DynamicModal` / `FloatingPanel` use the current v3.2.1 versions.

Portaled components also set explicit palette backgrounds as a fallback.

## Remote filter loads too early

Verify that the filter is rendered through the current `DynamicFilters` implementation. `loadOptions` should live on a select/multi-select definition and should not be manually called by the parent.

## Too many dataset requests while changing filters

Do not put draft filter state in the parent query key. Let `DynamicFilters` keep draft state internally and commit only through the grid's Apply button.

## Table causes nested vertical scrolling

Do not add a fixed/max height with vertical overflow around the desktop table. The current table surface intentionally owns horizontal overflow only.

---

# 66. Integration checklist

Before shipping a new resource table, verify:

- [ ] Admin route is wrapped by `AdminQueryProvider`.
- [ ] `source.queryKey` is stable and resource-specific.
- [ ] `fetchPage` uses the provided `AbortSignal`.
- [ ] `getRowId` returns a stable unique ID.
- [ ] Important identifier column is visible/locked where appropriate.
- [ ] Search placeholder describes searchable fields.
- [ ] Remote filter options use `loadOptions` rather than eager fetching.
- [ ] Filters have sensible `defaultValue`s.
- [ ] Date filters use ISO Gregorian values in data/API contracts.
- [ ] Mobile `title`, `subtitle`, `badge`, and `fieldIds` are intentional.
- [ ] Create/Edit schemas use dot paths consistently with their value shape.
- [ ] Required and cross-field validation are configured.
- [ ] API errors map back to form fields where possible.
- [ ] Delete behavior is classified as `soft` or `hard`.
- [ ] Backend authorization still protects every mutation.
- [ ] Column visibility persistence has a stable storage key if enabled.
- [ ] Empty/no-result copy is useful for the resource.
- [ ] View/Edit detail data uses `fetchOne` when list rows are incomplete.
- [ ] Table works at desktop and phone widths.
- [ ] Light and dark admin themes both render correctly.
- [ ] Portaled panels are opaque and RTL.

---

# 67. Recommended first production usage

For each resource, start with these pieces only:

```text
1. Record type
2. Filter type
3. Data source
4. Columns
5. Search
6. Pagination
7. Mobile config
```

Then add:

```text
8. Filters
9. View
10. Create/Edit schemas
11. Delete
12. Extra actions
```

This keeps the first integration easy to debug while preserving the same reusable core.

---

# 68. Version notes

## v3

- Rebuilt the UI primitives internally.
- Removed dependency on the project's earlier custom Button/Input/Select implementation.
- Added true mobile cards.
- Rebuilt filter UX around focused chips/popovers/sheets.
- Added Persian date/date-range controls.
- Removed nested desktop vertical table scrolling.

## v3.1

- Completed missing utility exports such as `stableStringify`, `clamp`, and `resolveFieldSpan`.

## v3.2

- Made portaled interfaces opaque and theme-safe.
- Strengthened explicit RTL handling across portals and internal controls.

## v3.2.1

- Added `surfaceRaised` to the explicit admin theme palette type.
- Explicitly typed `ADMIN_DATA_THEME` and `getAdminThemePalette` to prevent stale/inferred union issues.

---

# 69. Final architectural summary

The Dynamic Data Grid should be treated as an admin **resource-management framework**, not just a table component.

Its ownership boundaries are:

```text
Resource page owns:
- business types
- API calls
- column definitions
- filter definitions
- form schema
- domain-specific renderers/actions

Dynamic Data Grid owns:
- table/card rendering
- pagination state
- search commit behavior
- sort state
- filter draft/apply UX
- lazy filter option queries
- React Query dataset/detail caching
- CRUD dialogs
- generic form behavior
- modal accessibility
- responsive control layout
- Persian calendar UI
- theme/portal integration
- RTL admin behavior
```

That separation is the main reason the same system can be reused across many admin resources without duplicating table, filter, form, modal, responsive, and cache logic.
