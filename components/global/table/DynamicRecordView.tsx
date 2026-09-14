"use client";

import type { DynamicViewConfig, DynamicViewField } from "./types";
import { formatUnknown, getPathValue } from "./utils";

export type DynamicRecordViewProps<TRecord> = {
  record: TRecord;
  config: DynamicViewConfig<TRecord>;
  locale?: string;
};

export function DynamicRecordView<TRecord>({
  record,
  config,
  locale = "fa-IR",
}: DynamicRecordViewProps<TRecord>) {
  if (config.render) return <>{config.render(record)}</>;

  const fields: DynamicViewField<TRecord>[] = config.fields?.length
    ? config.fields
    : record && typeof record === "object"
      ? Object.keys(record as Record<string, unknown>).map((key) => ({
          id: key,
          label: key,
          accessor: key,
        }))
      : [];

  const fieldsById = new Map(fields.map((field) => [field.id, field] as const));
  const sections = config.sections?.length
    ? config.sections
    : [
        {
          id: "details",
          title: "جزئیات",
          fieldIds: fields.map((field) => field.id),
        },
      ];

  return (
    <div dir="rtl" className="min-w-0 space-y-5 text-right">
      {sections.map((section) => {
        const hidden =
          typeof section.hidden === "function"
            ? section.hidden(record)
            : section.hidden;
        if (hidden) return null;

        const sectionFields = (
          section.fieldIds?.length
            ? section.fieldIds.map((id) => fieldsById.get(id)).filter(Boolean)
            : fields
        ) as DynamicViewField<TRecord>[];

        return (
          <section
            key={section.id}
            className="min-w-0 border border-[var(--adt-border)] bg-[var(--adt-surface)]"
          >
            <header className="border-b border-[var(--adt-border)] px-4 py-3.5 sm:px-5">
              <h3 className="text-[12px] font-bold text-[var(--adt-text)] sm:text-[13px]">
                {section.title}
              </h3>
              {section.description ? (
                <p className="mt-1 text-[9px] leading-5 text-[var(--adt-muted)]">
                  {section.description}
                </p>
              ) : null}
            </header>

            <dl className="grid min-w-0 grid-cols-1 md:grid-cols-2">
              {sectionFields.map((field) => {
                const fieldHidden =
                  typeof field.hidden === "function"
                    ? field.hidden(record)
                    : field.hidden;
                if (fieldHidden) return null;

                const value =
                  typeof field.accessor === "function"
                    ? field.accessor(record)
                    : getPathValue(record, field.accessor ?? field.id);

                return (
                  <div
                    key={field.id}
                    className={`${
                      field.colSpan === 2 || field.colSpan === "full"
                        ? "md:col-span-2"
                        : "md:col-span-1"
                    } min-w-0 border-b border-[var(--adt-border)] px-4 py-4 last:border-b-0 md:border-l md:last:border-l-0`}
                  >
                    <dt className="text-[8px] font-semibold text-[var(--adt-muted)]">
                      {field.label}
                    </dt>
                    <dd className="mt-2 min-w-0 break-words text-[11px] leading-6 text-[var(--adt-text)]">
                      {field.render
                        ? field.render({ value, record })
                        : formatUnknown(value, locale)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
