"use client";

import {
  AlertTriangle,
  CalendarDays,
  Check,
  ImageIcon,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  DynamicFormErrorMapper,
  DynamicFormField,
  DynamicFileField,
  DynamicFormSchema,
  DynamicFormValues,
  PersianDateRangeValue,
} from "./types";
import {
  DataButton,
  DataInput,
  DataSelect,
  DataSwitch,
  DataTextarea,
  FloatingPanel,
} from "./primitives";

import {
  cx,
  getPathValue,
  isFieldFlag,
  resolveFieldSpan,
  setPathValue,
} from "./utils";
import {
  DateRangeValueLabel,
  DateValueLabel,
  PersianDatePicker,
} from "@/components/ui/PersianDatePicker";

export type DynamicFormProps<TValues extends DynamicFormValues> = {
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

export function DynamicForm<TValues extends DynamicFormValues>({
  schema,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "انصراف",
  mapError,
  disabled = false,
  className,
}: DynamicFormProps<TValues>) {
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const fieldsByName = useMemo(
    () => new Map(schema.fields.map((field) => [field.name, field])),
    [schema.fields],
  );

  const sections = useMemo(() => {
    if (schema.sections?.length) return schema.sections;
    return [
      {
        id: "main",
        title: "اطلاعات اصلی",
        fieldNames: schema.fields.map((field) => field.name),
      },
    ];
  }, [schema.fields, schema.sections]);

  function changeValue(name: string, nextValue: unknown) {
    setValues((current) => setPathValue(current, name, nextValue));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setFormError(null);
  }

  function validateClient(current: TValues) {
    const nextErrors: Record<string, string> = {};
    for (const field of schema.fields) {
      if (isFieldFlag(field.hidden, current, false)) continue;
      const value = getPathValue(current, field.name);
      const empty =
        value === null ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        (field.kind === "date-range" &&
          typeof value === "object" &&
          value !== null &&
          !(value as PersianDateRangeValue).from &&
          !(value as PersianDateRangeValue).to);

      if (field.required && empty) {
        nextErrors[field.name] = `${field.label} الزامی است.`;
        continue;
      }

      const error = field.validate?.(value, current);
      if (error) nextErrors[field.name] = error;
    }
    return nextErrors;
  }

  function focusFirstError(nextErrors: Record<string, string>) {
    const firstName = Object.keys(nextErrors)[0];
    if (!firstName) return;
    requestAnimationFrame(() => {
      const wrapper = formRef.current?.querySelector<HTMLElement>(
        `[data-field-name="${CSS.escape(firstName)}"]`,
      );
      const control = wrapper?.querySelector<HTMLElement>(
        "input, textarea, button, [tabindex]:not([tabindex='-1'])",
      );
      control?.focus();
      wrapper?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || disabled) return;

    let nextErrors = validateClient(values);
    if (!Object.keys(nextErrors).length && schema.validate) {
      nextErrors = await schema.validate(values);
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError("چند بخش نیاز به اصلاح دارد. موارد مشخص‌شده را بررسی کنید.");
      focusFirstError(nextErrors);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const mapped = mapError?.(error) ?? {
        message:
          error instanceof Error
            ? error.message
            : "ذخیره اطلاعات انجام نشد. دوباره تلاش کنید.",
      };
      setFormError(mapped.message ?? "ذخیره اطلاعات انجام نشد.");
      if (mapped.fieldErrors) {
        setErrors(mapped.fieldErrors);
        focusFirstError(mapped.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      dir="rtl"
      noValidate
      onSubmit={submit}
      className={cx("min-w-0 space-y-6 text-right", className)}
    >
      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-[var(--adt-danger)]/35 bg-[var(--adt-danger)]/[0.06] px-3 py-3 text-[10px] leading-5 text-[var(--adt-danger)]"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      {sections.map((section) => {
        if (isFieldFlag(section.hidden, values, false)) return null;

        const sectionFields = (
          section.fieldNames?.length
            ? section.fieldNames
                .map((name) => fieldsByName.get(name))
                .filter(Boolean)
            : schema.fields
        ) as DynamicFormField<TValues>[];

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
                <p className="mt-1 max-w-[760px] text-[9px] leading-5 text-[var(--adt-muted)]">
                  {section.description}
                </p>
              ) : null}
            </header>

            <div className="grid min-w-0 grid-cols-1 gap-4 p-4 md:grid-cols-2 sm:p-5">
              {sectionFields.map((field) => {
                if (isFieldFlag(field.hidden, values, false)) return null;
                return (
                  <div
                    key={field.name}
                    data-field-name={field.name}
                    className={cx("min-w-0", resolveFieldSpan(field.colSpan))}
                  >
                    <DynamicField
                      field={field}
                      values={values}
                      error={errors[field.name]}
                      setValue={(nextValue) =>
                        changeValue(field.name, nextValue)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="border-t border-[var(--adt-border)] bg-[var(--adt-surface-raised)] pt-4 md:sticky md:bottom-0 md:z-20 md:-mx-5 md:px-5 md:pb-1">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9px] leading-5 text-[var(--adt-muted)]">
            {submitting
              ? "در حال ذخیره اطلاعات…"
              : "قبل از ذخیره، اطلاعات اعتبارسنجی می‌شود."}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:min-w-[280px]">
            <DataButton
              tone="secondary"
              size="md"
              fullWidth
              disabled={submitting}
              onClick={onCancel}
            >
              {cancelLabel}
            </DataButton>
            <DataButton
              type="submit"
              tone="secondary"
              size="md"
              fullWidth
              loading={submitting}
              disabled={submitting || disabled}
              icon={<Check size={15} />}
            >
              {submitLabel}
            </DataButton>
          </div>
        </div>
      </div>
    </form>
  );
}

function DynamicField<TValues extends DynamicFormValues>({
  field,
  values,
  error,
  setValue,
}: {
  field: DynamicFormField<TValues>;
  values: TValues;
  error?: string;
  setValue: (value: unknown) => void;
}) {
  const value = getPathValue(values, field.name);
  const disabled = isFieldFlag(field.disabled, values, false);
  const readOnly = isFieldFlag(field.readOnly, values, false);
  const dir =
    typeof field.dir === "function" ? field.dir(values) : (field.dir ?? "rtl");

  if (field.kind === "input") {
    const formatted =
      field.format?.(value, values) ??
      (value === null || value === undefined ? "" : (value as string | number));

    return (
      <DataInput
        label={field.label}
        helperText={field.description ?? field.helperText}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        readOnly={readOnly}
        type={field.inputType ?? "text"}
        value={formatted}
        min={field.min}
        max={field.max}
        step={field.step}
        maxLength={field.maxLength}
        autoComplete={field.autoComplete}
        inputMode={field.inputMode}
        error={error}
        leadingIcon={field.leadingIcon}
        prefixText={field.prefixText}
        suffixText={field.suffixText}
        dir={dir}
        onChange={(event) => {
          const raw = event.target.value;
          const parsed = field.parse
            ? field.parse(raw, values)
            : field.inputType === "number"
              ? raw === ""
                ? null
                : Number(raw)
              : raw;
          setValue(parsed);
        }}
      />
    );
  }

  if (field.kind === "textarea") {
    const formatted =
      field.format?.(value, values) ??
      (value === null || value === undefined ? "" : String(value));
    return (
      <DataTextarea
        label={field.label}
        helperText={field.description ?? field.helperText}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        readOnly={readOnly}
        rows={field.rows ?? 5}
        maxLength={field.maxLength}
        value={formatted}
        error={error}
        dir={dir}
        onChange={(event) =>
          setValue(
            field.parse
              ? field.parse(event.target.value, values)
              : event.target.value,
          )
        }
      />
    );
  }

  if (field.kind === "select" || field.kind === "multi-select") {
    const formatted =
      field.format?.(value, values) ??
      (field.kind === "multi-select"
        ? Array.isArray(value)
          ? value.map(String)
          : []
        : value === null || value === undefined || value === ""
          ? null
          : String(value));

    return (
      <DataSelect
        label={field.label}
        helperText={field.description ?? field.helperText}
        placeholder={field.placeholder ?? "انتخاب کنید"}
        required={field.required}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        options={field.options}
        value={formatted}
        multiple={field.kind === "multi-select"}
        searchable={field.searchable ?? field.options.length > 8}
        clearable={field.clearable ?? !field.required}
        allowSelectAll={field.allowSelectAll}
        onChange={(nextValue) =>
          setValue(field.parse ? field.parse(nextValue, values) : nextValue)
        }
      />
    );
  }

  if (field.kind === "boolean") {
    return (
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--adt-text)]">
          <span>{field.label}</span>
          {field.required ? (
            <span className="text-[var(--adt-danger)]">*</span>
          ) : null}
        </div>
        <DataSwitch
          checked={Boolean(value)}
          onChange={setValue}
          label={
            Boolean(value)
              ? (field.onLabel ?? "فعال")
              : (field.offLabel ?? "غیرفعال")
          }
          description={field.description ?? field.helperText}
          disabled={disabled || readOnly}
        />
        {error ? (
          <p className="mt-1.5 text-[9px] text-[var(--adt-danger)]">{error}</p>
        ) : null}
      </div>
    );
  }

  if (field.kind === "date") {
    return (
      <PersianDateField
        label={field.label}
        helperText={field.description ?? field.helperText}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled || readOnly}
        error={error}
        value={typeof value === "string" ? value : null}
        minDate={field.minDate}
        maxDate={field.maxDate}
        onChange={setValue}
      />
    );
  }

  if (field.kind === "date-range") {
    const range =
      value && typeof value === "object"
        ? (value as PersianDateRangeValue)
        : { from: null, to: null };
    return (
      <PersianDateRangeField
        label={field.label}
        helperText={field.description ?? field.helperText}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled || readOnly}
        error={error}
        value={range}
        minDate={field.minDate}
        maxDate={field.maxDate}
        onChange={setValue}
      />
    );
  }

  if (field.kind === "file") {
    const formatted =
      field.format?.(value, values) ??
      (typeof value === "string" && value ? value : null);

    return (
      <FileUploadField
        field={field}
        values={values}
        value={formatted}
        error={error}
        disabled={disabled || readOnly}
        setValue={setValue}
      />
    );
  }

  if (field.kind === "custom") {
    return (
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--adt-text)]">
          <span>{field.label}</span>
          {field.required ? (
            <span className="text-[var(--adt-danger)]">*</span>
          ) : null}
        </div>
        {field.render({ value, values, setValue, error, disabled, readOnly })}
        {(field.description ?? field.helperText) ? (
          <p className="mt-1.5 text-[9px] leading-4 text-[var(--adt-muted)]">
            {field.description ?? field.helperText}
          </p>
        ) : null}
        {error ? (
          <p className="mt-1.5 text-[9px] text-[var(--adt-danger)]">{error}</p>
        ) : null}
      </div>
    );
  }

  return null;
}

function FileUploadField<TValues extends DynamicFormValues>({
  field,
  values,
  value,
  error,
  disabled,
  setValue,
}: {
  field: DynamicFileField<TValues>;
  values: TValues;
  value: string | null;
  error?: string;
  disabled: boolean;
  setValue: (value: unknown) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      xhrRef.current?.abort();
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const previewUrl = localPreview ?? value;
  const isImagePreview = field.preview !== "none";

  function chooseFile() {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }

  function clearValue() {
    if (disabled || uploading) return;
    setValue("");
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function cancelUpload() {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setUploading(false);
    setProgress(0);
    setLocalError("آپلود لغو شد.");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLocalError(null);
    if (field.maxSizeBytes && file.size > field.maxSizeBytes) {
      setLocalError(
        `حجم فایل باید کمتر از ${new Intl.NumberFormat("fa-IR").format(
          Math.ceil(field.maxSizeBytes / 1024 / 1024),
        )} مگابایت باشد.`,
      );
      event.target.value = "";
      return;
    }

    if (field.accept && file.type && !acceptsFile(field.accept, file)) {
      setLocalError("فرمت فایل انتخاب‌شده مجاز نیست.");
      event.target.value = "";
      return;
    }

    if (isImagePreview) {
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(URL.createObjectURL(file));
    }

    const formData = new FormData();
    formData.append(field.uploadFieldName ?? "file", file);
    const uploadUrl =
      typeof field.uploadUrl === "function"
        ? field.uploadUrl(values)
        : field.uploadUrl;

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    setUploading(true);
    setProgress(0);

    xhr.upload.onprogress = (progressEvent) => {
      if (!progressEvent.lengthComputable) return;
      setProgress(
        Math.max(
          1,
          Math.min(99, Math.round((progressEvent.loaded / progressEvent.total) * 100)),
        ),
      );
    };

    xhr.onload = () => {
      xhrRef.current = null;
      setUploading(false);
      if (xhr.status < 200 || xhr.status >= 300) {
        setProgress(0);
        setLocalError(readUploadError(xhr.responseText));
        return;
      }
      try {
        const response = xhr.responseText
          ? (JSON.parse(xhr.responseText) as unknown)
          : {};
        const nextValue = field.parseUploadResponse
          ? field.parseUploadResponse(response, values)
          : (response as { url?: string }).url;
        if (!nextValue || typeof nextValue !== "string") {
          setLocalError("پاسخ آپلود معتبر نیست.");
          setProgress(0);
          return;
        }
        setValue(nextValue);
        setProgress(100);
        window.setTimeout(() => setProgress(0), 700);
      } catch {
        setLocalError("پاسخ آپلود خوانده نشد.");
        setProgress(0);
      }
    };

    xhr.onerror = () => {
      xhrRef.current = null;
      setUploading(false);
      setProgress(0);
      setLocalError("آپلود انجام نشد. اتصال را بررسی کنید.");
    };

    xhr.onabort = () => {
      xhrRef.current = null;
      setUploading(false);
      setProgress(0);
    };

    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--adt-text)]">
        <span>{field.label}</span>
        {field.required ? (
          <span className="text-[var(--adt-danger)]">*</span>
        ) : null}
      </div>

      <div
        className={cx(
          "grid min-w-0 gap-3 rounded-[5px] border bg-[var(--adt-surface)] p-3",
          error || localError
            ? "border-[var(--adt-danger)]"
            : "border-[var(--adt-border)]",
        )}
      >
        <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
          <div
            aria-label="پیش‌نمایش فایل"
            className="grid aspect-square place-items-center overflow-hidden rounded-[6px] border border-[var(--adt-border)] bg-[var(--adt-surface-muted)] text-[var(--adt-muted)]"
            style={
              previewUrl && isImagePreview
                ? {
                    backgroundImage: `url("${previewUrl}")`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }
                : undefined
            }
          >
            {!previewUrl || !isImagePreview ? <ImageIcon size={22} /> : null}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-[var(--adt-text)]">
              {value ? value.split("/").pop() : "فایلی انتخاب نشده"}
            </p>
            {(field.description ?? field.helperText) ? (
              <p className="mt-1 text-[9px] leading-5 text-[var(--adt-muted)]">
                {field.description ?? field.helperText}
              </p>
            ) : null}

            {uploading || progress > 0 ? (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[8px] text-[var(--adt-muted)]">
                  <span>در حال آپلود</span>
                  <span>{new Intl.NumberFormat("fa-IR").format(progress)}٪</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--adt-border)]">
                  <span
                    className="block h-full rounded-full bg-[var(--adt-accent)] transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <DataButton
                tone="secondary"
                size="sm"
                icon={uploading ? <LoaderCircle size={14} /> : <Upload size={14} />}
                loading={uploading}
                disabled={disabled}
                onClick={chooseFile}
              >
                {field.buttonLabel ?? "انتخاب و آپلود"}
              </DataButton>
              {uploading ? (
                <DataButton tone="warning" size="sm" onClick={cancelUpload}>
                  {field.cancelLabel ?? "لغو آپلود"}
                </DataButton>
              ) : value ? (
                <DataButton
                  tone="ghost"
                  size="sm"
                  icon={<X size={13} />}
                  disabled={disabled}
                  onClick={clearValue}
                >
                  {field.removeLabel ?? "حذف فایل"}
                </DataButton>
              ) : null}
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={field.accept}
          className="sr-only"
          disabled={disabled || uploading}
          onChange={handleFileChange}
        />
      </div>

      {error || localError ? (
        <p className="mt-1.5 text-[9px] leading-4 text-[var(--adt-danger)]">
          {error ?? localError}
        </p>
      ) : null}
    </div>
  );
}

function acceptsFile(accept: string, file: File) {
  const rules = accept.split(",").map((item) => item.trim()).filter(Boolean);
  return rules.some((rule) => {
    if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule.toLowerCase());
    return file.type === rule;
  });
}

function readUploadError(responseText: string) {
  try {
    const parsed = JSON.parse(responseText) as { error?: string };
    return parsed.error ?? "آپلود فایل انجام نشد.";
  } catch {
    return "آپلود فایل انجام نشد.";
  }
}

function PersianDateField({
  label,
  helperText,
  placeholder,
  required,
  disabled,
  error,
  value,
  minDate,
  maxDate,
  onChange,
}: {
  label: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value: string | null;
  minDate?: string;
  maxDate?: string;
  onChange: (value: unknown) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--adt-text)]">
        {label}
        {required ? <span className="text-[var(--adt-danger)]">*</span> : null}
      </div>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cx(
          "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border bg-[var(--adt-surface)] px-3 text-right text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/20 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-[var(--adt-danger)]" : "border-[var(--adt-border)]",
        )}
      >
        <span
          className={
            value ? "text-[var(--adt-text)]" : "text-[var(--adt-soft)]"
          }
        >
          <DateValueLabel
            value={value}
            placeholder={placeholder ?? "انتخاب تاریخ"}
          />
        </span>
        <CalendarDays size={15} className="shrink-0 text-[var(--adt-muted)]" />
      </button>
      {error ? (
        <p className="mt-1.5 text-[9px] text-[var(--adt-danger)]">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-[9px] text-[var(--adt-muted)]">
          {helperText}
        </p>
      ) : null}
      <FloatingPanel
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        title={label}
        desktopWidth={390}
      >
        <PersianDatePicker
          mode="single"
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          onChange={onChange}
          onComplete={() => setOpen(false)}
        />
      </FloatingPanel>
    </div>
  );
}

function PersianDateRangeField({
  label,
  helperText,
  placeholder,
  required,
  disabled,
  error,
  value,
  minDate,
  maxDate,
  onChange,
}: {
  label: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value: PersianDateRangeValue;
  minDate?: string;
  maxDate?: string;
  onChange: (value: unknown) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--adt-text)]">
        {label}
        {required ? <span className="text-[var(--adt-danger)]">*</span> : null}
      </div>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cx(
          "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border bg-[var(--adt-surface)] px-3 text-right text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/20 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-[var(--adt-danger)]" : "border-[var(--adt-border)]",
        )}
      >
        <span
          className={
            value.from || value.to
              ? "text-[var(--adt-text)]"
              : "text-[var(--adt-soft)]"
          }
        >
          <DateRangeValueLabel
            value={value}
            placeholder={placeholder ?? "انتخاب بازه تاریخ"}
          />
        </span>
        <CalendarDays size={15} className="shrink-0 text-[var(--adt-muted)]" />
      </button>
      {error ? (
        <p className="mt-1.5 text-[9px] text-[var(--adt-danger)]">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-[9px] text-[var(--adt-muted)]">
          {helperText}
        </p>
      ) : null}
      <FloatingPanel
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        title={label}
        desktopWidth={390}
      >
        <PersianDatePicker
          mode="range"
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          onChange={onChange}
          onComplete={() => setOpen(false)}
        />
      </FloatingPanel>
    </div>
  );
}
