import type { ReactNode } from "react";

import type {
    AnyRecord,
    DynamicColumn,
    DynamicFormValues,
} from "./types";

export function cx(
    ...classes: Array<string | false | null | undefined>
) {
    return classes.filter(Boolean).join(" ");
}

export function resolveFieldSpan(
    span: 1 | 2 | "full" | undefined,
) {
    return span === 2 || span === "full"
        ? "md:col-span-2"
        : "md:col-span-1";
}

export function stableStringify(value: unknown): string {
    if (value === undefined) return "__undefined__";

    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(",")}]`;
    }

    return `{${Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
            ([key, item]) =>
                `${JSON.stringify(key)}:${stableStringify(item)}`,
        )
        .join(",")}}`;
}

export function clamp(
    value: number,
    min: number,
    max: number,
) {
    return Math.min(max, Math.max(min, value));
}

export function getPathValue(
    source: unknown,
    path?: string,
): unknown {
    if (!path) return undefined;

    return path.split(".").reduce<unknown>((value, key) => {
        if (
            value &&
            typeof value === "object" &&
            key in (value as Record<string, unknown>)
        ) {
            return (value as Record<string, unknown>)[key];
        }

        return undefined;
    }, source);
}

export function getColumnValue<TRecord>(
    column: DynamicColumn<TRecord>,
    record: TRecord,
) {
    if (typeof column.accessor === "function") {
        return column.accessor(record);
    }

    if (typeof column.accessor === "string") {
        return getPathValue(record, column.accessor);
    }

    return getPathValue(record, column.id);
}

export function setPathValue<TValues extends DynamicFormValues>(
    source: TValues,
    path: string,
    nextValue: unknown,
): TValues {
    const keys = path.split(".");
    const root = Array.isArray(source)
        ? [...source]
        : { ...source };

    let cursor = root as Record<string, unknown>;
    let originalCursor = source as Record<string, unknown>;

    keys.forEach((key, index) => {
        const isLast = index === keys.length - 1;

        if (isLast) {
            cursor[key] = nextValue;
            return;
        }

        const originalChild = originalCursor?.[key];
        const nextChild = Array.isArray(originalChild)
            ? [...originalChild]
            : originalChild && typeof originalChild === "object"
                ? { ...(originalChild as Record<string, unknown>) }
                : {};

        cursor[key] = nextChild;
        cursor = nextChild as Record<string, unknown>;
        originalCursor =
            originalChild && typeof originalChild === "object"
                ? (originalChild as Record<string, unknown>)
                : {};
    });

    return root as TValues;
}

export function isTruthyConfig<T>(
    value: boolean | ((record: T) => boolean) | undefined,
    record: T,
    fallback = true,
) {
    if (typeof value === "function") return value(record);
    if (typeof value === "boolean") return value;
    return fallback;
}

export function isFieldFlag<TValues extends DynamicFormValues>(
    value: boolean | ((values: TValues) => boolean) | undefined,
    values: TValues,
    fallback = false,
) {
    if (typeof value === "function") return value(values);
    if (typeof value === "boolean") return value;
    return fallback;
}

export function formatUnknown(value: unknown, locale = "fa-IR"): ReactNode {
    if (value === null || value === undefined || value === "") return "—";

    if (typeof value === "boolean") return value ? "بله" : "خیر";

    if (typeof value === "number") {
        return new Intl.NumberFormat(locale).format(value);
    }

    if (value instanceof Date) {
        return new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(value);
    }

    if (Array.isArray(value)) {
        return value.length ? value.map(String).join("، ") : "—";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
}

export function isEmptyFilterValue(value: unknown) {
    if (value === null || value === undefined || value === "") return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

export function compactFilters<TFilters extends AnyRecord>(
    filters: TFilters,
) {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => !isEmptyFilterValue(value)),
    ) as Partial<TFilters>;
}

export function pageCountFrom(total: number, pageSize: number) {
    return Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
}

export function resolveSpanClass(
    span: 1 | 2 | 3 | 4 | "full" | undefined,
) {
    switch (span) {
        case 2:
            return "md:col-span-2";
        case 3:
            return "md:col-span-3";
        case 4:
        case "full":
            return "md:col-span-4";
        default:
            return "md:col-span-1";
    }
}
