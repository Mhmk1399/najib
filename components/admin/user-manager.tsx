"use client";

import { useMemo } from "react";
import { Copy, Phone, UserRound } from "lucide-react";
import { DynamicDataTable } from "@/components/global/table/DynamicTable";
import type {
  DataSelectOption,
  DynamicColumn,
  DynamicFilterDefinition,
  DynamicFormSchema,
  DynamicTableResult,
} from "@/components/global/table/types";
import { useToast } from "@/components/ui/CustomToast";
import {
  USER_PERMISSION_OPTIONS,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  userPermissionLabel,
  userRoleLabel,
  userStatusLabel,
  type UserStatusValue,
} from "@/lib/shared/user-access";

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roles: string[];
  permissions: string[];
  allowedStoreIds: string[];
  status: UserStatusValue;
  preferredLocale: "fa" | "en" | "ar";
  lastLoginAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type UserFormValues = {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  roles: string[];
  permissions: string[];
  allowedStoreIdsText: string;
  status: UserStatusValue;
  preferredLocale: "fa" | "en" | "ar";
};

type UserFilters = Record<string, unknown> & {
  status?: string | null;
  role?: string | null;
};

type ApiError = Error & {
  fieldErrors?: Record<string, string>;
};

const roleOptions: DataSelectOption[] = USER_ROLE_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}));

const permissionOptions: DataSelectOption[] = USER_PERMISSION_OPTIONS.map(
  (item) => ({
    value: item.value,
    label: item.label,
  }),
);

const statusOptions: DataSelectOption[] = USER_STATUS_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}));

const localeOptions: DataSelectOption[] = [
  { value: "fa", label: "فارسی" },
  { value: "en", label: "انگلیسی" },
  { value: "ar", label: "عربی" },
];

const persianDigits = new Intl.NumberFormat("fa-IR", {
  useGrouping: false,
});

async function readApiError(response: Response): Promise<ApiError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const body = payload as {
    error?: string;
    details?: Array<{ path?: Array<string | number>; message?: string }>;
  } | null;
  const error = new Error(
    body?.error ?? "درخواست انجام نشد. دوباره تلاش کنید.",
  ) as ApiError;
  if (Array.isArray(body?.details)) {
    error.fieldErrors = Object.fromEntries(
      body.details
        .filter((issue) => issue.path?.length && issue.message)
        .map((issue) => [String(issue.path?.[0]), String(issue.message)]),
    );
  }
  return error;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw await readApiError(response);
  return (await response.json()) as T;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPersianDigits(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replace(/\d/g, (digit) =>
    persianDigits.format(Number(digit)),
  );
}

function fullName(user: AdminUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

function splitStoreIds(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formPayload(values: UserFormValues, includePassword: boolean) {
  const payload: Record<string, unknown> = {
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone,
    roles: values.roles,
    permissions: values.permissions,
    allowedStoreIds: splitStoreIds(values.allowedStoreIdsText),
    status: values.status,
    preferredLocale: values.preferredLocale,
  };
  if (includePassword || values.password) payload.password = values.password;
  return payload;
}

function emptyUserForm(): UserFormValues {
  return {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    roles: ["customer"],
    permissions: [],
    allowedStoreIdsText: "",
    status: "active",
    preferredLocale: "fa",
  };
}

function userToForm(user: AdminUser): UserFormValues {
  return {
    email: user.email,
    password: "",
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    roles: user.roles,
    permissions: user.permissions,
    allowedStoreIdsText: user.allowedStoreIds.join(", "),
    status: user.status,
    preferredLocale: user.preferredLocale,
  };
}

function mapFormError(error: unknown) {
  const typed = error as ApiError;
  return {
    message: typed?.message ?? "ذخیره کاربر انجام نشد.",
    fieldErrors: typed?.fieldErrors,
  };
}

function buildUserSchema(edit: boolean): DynamicFormSchema<UserFormValues> {
  return {
    fields: [
      {
        kind: "input",
        inputType: "email",
        name: "email",
        label: "ایمیل",
        placeholder: "user@example.com",
        required: true,
        dir: "ltr",
        autoComplete: "email",
      },
      {
        kind: "input",
        inputType: "password",
        name: "password",
        label: edit ? "رمز عبور جدید" : "رمز عبور",
        placeholder: edit ? "برای عدم تغییر خالی بگذارید" : "حداقل ۱۲ کاراکتر",
        required: !edit,
        autoComplete: "new-password",
        validate: (value) => {
          const text = String(value ?? "");
          if (!edit && text.length < 12) return "رمز عبور باید حداقل ۱۲ کاراکتر باشد.";
          if (edit && text && text.length < 12) return "رمز عبور جدید باید حداقل ۱۲ کاراکتر باشد.";
          return null;
        },
      },
      {
        kind: "input",
        name: "firstName",
        label: "نام",
        required: true,
        autoComplete: "given-name",
      },
      {
        kind: "input",
        name: "lastName",
        label: "نام خانوادگی",
        required: true,
        autoComplete: "family-name",
      },
      {
        kind: "input",
        inputType: "tel",
        name: "phone",
        label: "شماره تماس",
        dir: "ltr",
        autoComplete: "tel",
      },
      {
        kind: "multi-select",
        name: "roles",
        label: "نقش‌ها",
        options: roleOptions,
        required: true,
        searchable: true,
        allowSelectAll: false,
      },
      {
        kind: "multi-select",
        name: "permissions",
        label: "دسترسی‌های اضافه",
        options: permissionOptions,
        searchable: true,
        allowSelectAll: true,
        helperText: "دسترسی‌های نقش به صورت خودکار محاسبه می‌شوند؛ این بخش فقط برای دسترسی اضافه است.",
      },
      {
        kind: "select",
        name: "status",
        label: "وضعیت",
        options: statusOptions,
        required: true,
      },
      {
        kind: "select",
        name: "preferredLocale",
        label: "زبان ترجیحی",
        options: localeOptions,
        required: true,
      },
      {
        kind: "input",
        name: "allowedStoreIdsText",
        label: "شناسه فروشگاه‌های مجاز",
        placeholder: "store-1, store-2",
        dir: "ltr",
        colSpan: "full",
        helperText: "چند شناسه را با ویرگول جدا کنید.",
      },
    ],
    sections: [
      {
        id: "identity",
        title: "هویت کاربر",
        fieldNames: ["email", "password", "firstName", "lastName", "phone"],
      },
      {
        id: "access",
        title: "نقش و دسترسی",
        description: "تغییر نقش و permission فقط برای حساب‌های مجاز به مدیریت کاربران فعال است.",
        fieldNames: ["roles", "permissions", "status", "preferredLocale", "allowedStoreIdsText"],
      },
    ],
  };
}

function StatusBadge({ status }: { status: UserStatusValue }) {
  const tone =
    status === "active"
      ? "border-[var(--adt-success)]/30 bg-[var(--adt-success)]/[0.06] text-[var(--adt-success)]"
      : status === "suspended" || status === "deleted"
        ? "border-[var(--adt-danger)]/30 bg-[var(--adt-danger)]/[0.06] text-[var(--adt-danger)]"
        : "border-[var(--adt-warning)]/30 bg-[var(--adt-warning)]/[0.06] text-[var(--adt-warning)]";
  return (
    <span className={`inline-flex border px-2 py-1 text-[8px] font-semibold ${tone}`}>
      {userStatusLabel(status)}
    </span>
  );
}

export function UserManager() {
  const toast = useToast();

  const columns = useMemo<DynamicColumn<AdminUser>[]>(
    () => [
      {
        id: "name",
        label: "کاربر",
        minWidth: 240,
        sticky: "start",
        lockVisibility: true,
        sortable: true,
        sortKey: "firstName",
        cell: ({ record }) => (
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] text-[var(--adt-accent-strong)]">
              <UserRound size={16} />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-[10px] font-bold">
                {fullName(record)}
              </strong>
              <span className="mt-0.5 block truncate text-[8px] text-[var(--adt-muted)] ltr:text-left">
                {record.email}
              </span>
            </span>
          </div>
        ),
        mobile: { priority: 1, showLabel: false },
      },
      {
        id: "roles",
        label: "نقش‌ها",
        minWidth: 190,
        accessor: "roles",
        cell: ({ record }) => record.roles.map(userRoleLabel).join("، "),
        mobile: { priority: 2 },
      },
      {
        id: "status",
        label: "وضعیت",
        accessor: "status",
        sortable: true,
        minWidth: 120,
        cell: ({ record }) => <StatusBadge status={record.status} />,
        mobile: { priority: 3 },
      },
      {
        id: "phone",
        label: "تماس",
        accessor: "phone",
        minWidth: 130,
        cell: ({ value }) => (
          <span dir="ltr" className="inline-block text-left">
            {formatPersianDigits(String(value || ""))}
          </span>
        ),
        mobile: { priority: 4 },
      },
      {
        id: "permissions",
        label: "دسترسی اضافه",
        minWidth: 220,
        defaultHidden: true,
        cell: ({ record }) =>
          record.permissions.length
            ? record.permissions.map(userPermissionLabel).join("، ")
            : "—",
        mobile: { hidden: true },
      },
      {
        id: "lastLoginAt",
        label: "آخرین ورود",
        accessor: "lastLoginAt",
        minWidth: 160,
        defaultHidden: true,
        cell: ({ record }) => formatDate(record.lastLoginAt),
        mobile: { hidden: true },
      },
      {
        id: "createdAt",
        label: "ساخته‌شده",
        accessor: "createdAt",
        sortable: true,
        minWidth: 160,
        defaultHidden: true,
        cell: ({ record }) => formatDate(record.createdAt),
        mobile: { hidden: true },
      },
    ],
    [],
  );

  const filters = useMemo<DynamicFilterDefinition<UserFilters, AdminUser>[]>(
    () => [
      {
        id: "status",
        kind: "select",
        label: "وضعیت",
        options: statusOptions,
        defaultValue: null,
        badge: (value) => (value ? userStatusLabel(String(value)) : null),
      },
      {
        id: "role",
        kind: "select",
        label: "نقش",
        options: roleOptions,
        defaultValue: null,
        searchable: true,
        badge: (value) => (value ? userRoleLabel(String(value)) : null),
      },
    ],
    [],
  );

  const createSchema = useMemo(() => buildUserSchema(false), []);
  const editSchema = useMemo(() => buildUserSchema(true), []);

  return (
    <div className="min-w-0 p-3 sm:p-4 lg:p-5">
      <DynamicDataTable<AdminUser, UserFormValues, UserFormValues, UserFilters>
        tableId="admin-users"
        eyebrow="STAFF ACCESS"
        title="مدیریت کاربران"
        description="همه حساب‌های مشتری و ادمین را از همین‌جا بسازید، ویرایش کنید و دسترسی‌ها را کنترل کنید."
        source={{
          queryKey: ["admin", "users"],
          fetchPage: async ({ page, pageSize, search, sort, filters: activeFilters, signal }) => {
            const params = new URLSearchParams({
              page: String(page),
              limit: String(pageSize),
            });
            if (search) params.set("search", search);
            if (activeFilters.status) params.set("status", String(activeFilters.status));
            if (activeFilters.role) params.set("role", String(activeFilters.role));
            if (sort[0]) {
              params.set("sortKey", sort[0].key);
              params.set("sortDirection", sort[0].direction);
            }
            return fetchJson<DynamicTableResult<AdminUser>>(
              `/api/admin/users?${params.toString()}`,
              { signal },
            );
          },
          fetchOne: async ({ id, signal }) =>
            fetchJson<AdminUser>(`/api/admin/users/${id}`, { signal }),
        }}
        columns={columns}
        getRowId={(record) => record.id}
        getRowLabel={fullName}
        search={{
          placeholder: "جستجو با نام، ایمیل یا شماره تماس...",
          debounceMs: 320,
        }}
        filters={filters}
        initialFilters={{ status: null, role: null }}
        pagination={{
          initialPageSize: 15,
          pageSizeOptions: [10, 15, 25, 50],
          showPageNumbers: true,
        }}
        columnVisibility={{
          enabled: true,
          persist: true,
          storageKey: "admin-users-columns",
        }}
        mobile={{
          title: fullName,
          subtitle: (record) => record.email,
          badge: (record) => <StatusBadge status={record.status} />,
          fieldIds: ["roles", "status", "phone"],
          maxFields: 4,
        }}
        crud={{
          create: {
            label: "کاربر جدید",
            title: "ساخت کاربر",
            description: "برای مشتری‌ها نقش Customer کافی است؛ برای ورود به پنل ادمین باید نقش یا permission مدیریتی داده شود.",
            schema: createSchema,
            initialValues: emptyUserForm,
            mutationFn: async ({ values }) =>
              fetchJson<AdminUser>("/api/admin/users", {
                method: "POST",
                body: JSON.stringify(formPayload(values, true)),
              }),
            mapError: mapFormError,
            onSuccess: (record) => {
              toast.success("کاربر ساخته شد", {
                description:
                  record && "email" in record
                    ? `حساب ${record.email} آماده استفاده است.`
                    : undefined,
              });
            },
          },
          edit: {
            title: (record) => `ویرایش ${fullName(record)}`,
            description: "اگر رمز عبور جدید نمی‌خواهید، فیلد رمز عبور را خالی بگذارید.",
            schema: editSchema,
            toInitialValues: userToForm,
            mutationFn: async ({ id, values }) =>
              fetchJson<AdminUser>(`/api/admin/users/${id}`, {
                method: "PATCH",
                body: JSON.stringify(formPayload(values, false)),
              }),
            mapError: mapFormError,
            onSuccess: (record) => {
              toast.success("تغییرات کاربر ذخیره شد", {
                description:
                  record && "email" in record
                    ? `اطلاعات ${record.email} به‌روزرسانی شد.`
                    : undefined,
              });
            },
          },
          view: {
            title: (record) => `مشاهده ${fullName(record)}`,
            fields: [
              { id: "email", label: "ایمیل", accessor: "email" },
              { id: "name", label: "نام", render: ({ record }) => fullName(record) },
              {
                id: "status",
                label: "وضعیت",
                render: ({ record }) => <StatusBadge status={record.status} />,
              },
              {
                id: "roles",
                label: "نقش‌ها",
                render: ({ record }) => record.roles.map(userRoleLabel).join("، "),
              },
              {
                id: "permissions",
                label: "دسترسی اضافه",
                colSpan: "full",
                render: ({ record }) =>
                  record.permissions.length
                    ? record.permissions.map(userPermissionLabel).join("، ")
                    : "—",
              },
              {
                id: "allowedStoreIds",
                label: "فروشگاه‌های مجاز",
                colSpan: "full",
                render: ({ record }) =>
                  record.allowedStoreIds.length
                    ? formatPersianDigits(record.allowedStoreIds.join(", "))
                    : "—",
              },
              {
                id: "lastLoginAt",
                label: "آخرین ورود",
                render: ({ record }) => formatDate(record.lastLoginAt),
              },
              {
                id: "createdAt",
                label: "ساخته‌شده",
                render: ({ record }) => formatDate(record.createdAt),
              },
            ],
            sections: [
              {
                id: "identity",
                title: "هویت",
                fieldIds: ["email", "name", "status"],
              },
              {
                id: "access",
                title: "دسترسی",
                fieldIds: ["roles", "permissions", "allowedStoreIds"],
              },
              {
                id: "activity",
                title: "فعالیت",
                fieldIds: ["lastLoginAt", "createdAt"],
              },
            ],
          },
          delete: {
            title: (record) => `حذف ${fullName(record)}`,
            description: (record) => (
              <>
                حساب <strong>{record.email}</strong> از لیست فعال خارج می‌شود و وضعیت آن
                به Deleted تغییر می‌کند. این عملیات برای حساب خودتان مجاز نیست.
              </>
            ),
            dangerLevel: "soft",
            confirmLabel: "حذف کاربر",
            mutationFn: async ({ id }) => {
              await fetchJson(`/api/admin/users/${id}`, { method: "DELETE" });
            },
            mapError: (error) =>
              error instanceof Error
                ? error.message
                : "حذف کاربر انجام نشد. دوباره تلاش کنید.",
            onSuccess: (record) => {
              toast.warning("کاربر حذف شد", {
                description: `${record.email} دیگر در لیست فعال نمایش داده نمی‌شود.`,
              });
            },
          },
          extraRowActions: [
            {
              id: "copy-email",
              label: "کپی ایمیل",
              icon: <Copy size={14} />,
              onClick: async (record) => {
                await navigator.clipboard.writeText(record.email);
                toast.info("ایمیل کپی شد", { description: record.email });
              },
            },
            {
              id: "copy-phone",
              label: "کپی شماره تماس",
              icon: <Phone size={14} />,
              hidden: (record) => !record.phone,
              onClick: async (record) => {
                await navigator.clipboard.writeText(record.phone);
                toast.info("شماره تماس کپی شد", {
                  description: formatPersianDigits(record.phone),
                });
              },
            },
          ],
        }}
        labels={{
          filters: "فیلتر کاربران",
          clearFilters: "پاک کردن فیلترها",
          applyFilters: "اعمال فیلترها",
          pendingFilters: "فیلتر فعال",
          columns: "ستون‌ها",
          create: "کاربر جدید",
          view: "مشاهده",
          edit: "ویرایش",
          delete: "حذف",
          actions: "عملیات",
          rowsPerPage: "تعداد در صفحه",
        }}
        emptyState={{
          title: "هنوز کاربری ثبت نشده",
          description: "اولین کاربر را بسازید تا دسترسی‌های فروشگاه قابل مدیریت شود.",
          filteredTitle: "کاربری با این شرایط پیدا نشد",
          filteredDescription: "عبارت جستجو یا فیلترهای انتخاب‌شده را تغییر دهید.",
        }}
      />
    </div>
  );
}
