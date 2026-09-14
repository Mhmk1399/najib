"use client";

import { createPortal } from "react-dom";
import { Check, ChevronDown, LoaderCircle, Search, X } from "lucide-react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type RefObject,
  type TextareaHTMLAttributes,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DataSelectOption } from "./types";
 
import { clamp, cx } from "./utils";
import { useAdminTheme, getAdminDataThemeVars, getAdminThemePalette } from "@/components/admin/useAdminTheme";

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

export type DataButtonTone =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "warning";

export type DataButtonSize = "sm" | "md" | "lg";

const BUTTON_TONE: Record<DataButtonTone, string> = {
  primary:
    "border-[var(--adt-text)] bg-[var(--adt-text)] text-[var(--adt-surface)] hover:opacity-90",
  secondary:
    "border-[var(--adt-border-strong)] bg-[var(--adt-surface)] text-[var(--adt-text)] hover:bg-[var(--adt-surface-muted)]",
  ghost:
    "border-transparent bg-transparent text-[var(--adt-muted)] hover:border-[var(--adt-border)] hover:bg-[var(--adt-surface-muted)] hover:text-[var(--adt-text)]",
  danger:
    "border-[var(--adt-danger)]/45 bg-[var(--adt-danger)]/[0.08] text-[var(--adt-danger)] hover:bg-[var(--adt-danger)]/[0.15]",
  warning:
    "border-[var(--adt-warning)]/45 bg-[var(--adt-warning)]/[0.08] text-[var(--adt-warning)] hover:bg-[var(--adt-warning)]/[0.15]",
};

const BUTTON_SIZE: Record<DataButtonSize, string> = {
  sm: "min-h-9 px-3 text-[10px]",
  md: "min-h-11 px-4 text-[11px]",
  lg: "min-h-12 px-5 text-[12px]",
};

export type DataButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: DataButtonTone;
  size?: DataButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  iconOnly?: boolean;
  fullWidth?: boolean;
};

export const DataButton = forwardRef<HTMLButtonElement, DataButtonProps>(
  function DataButton(
    {
      tone = "secondary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "start",
      iconOnly = false,
      fullWidth = false,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cx(
          "inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-[5px] border font-semibold outline-none transition-[background-color,border-color,color,opacity,transform] duration-150 focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/40 disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-px",
          BUTTON_TONE[tone],
          iconOnly
            ? size === "sm"
              ? "size-9 p-0"
              : size === "lg"
                ? "size-12 p-0"
                : "size-11 p-0"
            : BUTTON_SIZE[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <LoaderCircle
            size={15}
            className="shrink-0 animate-spin motion-reduce:animate-none"
          />
        ) : icon && iconPosition === "start" ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {!iconOnly ? <span className="truncate">{children}</span> : null}
        {!loading && icon && iconPosition === "end" ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
      </button>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

export type DataInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: ReactNode;
  prefixText?: string;
  suffixText?: string;
  trailing?: ReactNode;
};

export const DataInput = forwardRef<HTMLInputElement, DataInputProps>(
  function DataInput(
    {
      id,
      label,
      helperText,
      error,
      leadingIcon,
      prefixText,
      suffixText,
      trailing,
      required,
      className,
      dir = "rtl",
      ...props
    },
    ref,
  ) {
    const generated = useId();
    const inputId = id ?? `adt-input-${generated}`;
    const helpId = `${inputId}-help`;
    const errorId = `${inputId}-error`;

    return (
      <div dir="rtl" className={cx("min-w-0 text-right", className)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--adt-text)]"
          >
            <span>{label}</span>
            {required ? (
              <span className="text-[var(--adt-danger)]">*</span>
            ) : null}
          </label>
        ) : null}
        <div
          className={cx(
            "flex min-h-11 min-w-0 items-center gap-2 rounded-[5px] border bg-[var(--adt-surface)] px-3 transition-colors focus-within:border-[var(--adt-border-strong)] focus-within:ring-2 focus-within:ring-[var(--adt-accent)]/15",
            error ? "border-[var(--adt-danger)]" : "border-[var(--adt-border)]",
          )}
        >
          {leadingIcon ? (
            <span className="shrink-0 text-[var(--adt-muted)]">
              {leadingIcon}
            </span>
          ) : null}
          {prefixText ? (
            <span className="shrink-0 text-[9px] text-[var(--adt-muted)]">
              {prefixText}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            dir={dir}
            required={required}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? errorId : helperText ? helpId : undefined}
            className={cx(
              "h-11 min-w-0 flex-1 border-0 bg-transparent px-0 text-[11px] text-[var(--adt-text)] outline-none placeholder:text-[var(--adt-soft)] disabled:cursor-not-allowed disabled:opacity-50",
              dir === "ltr" ? "text-left" : "text-right",
            )}
            {...props}
          />
          {suffixText ? (
            <span className="shrink-0 text-[9px] text-[var(--adt-muted)]">
              {suffixText}
            </span>
          ) : null}
          {trailing ? <span className="shrink-0">{trailing}</span> : null}
        </div>
        {error ? (
          <p
            id={errorId}
            className="mt-1.5 text-[9px] leading-4 text-[var(--adt-danger)]"
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            id={helpId}
            className="mt-1.5 text-[9px] leading-4 text-[var(--adt-muted)]"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

export type DataTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const DataTextarea = forwardRef<HTMLTextAreaElement, DataTextareaProps>(
  function DataTextarea(
    {
      id,
      label,
      helperText,
      error,
      required,
      className,
      dir = "rtl",
      ...props
    },
    ref,
  ) {
    const generated = useId();
    const textareaId = id ?? `adt-textarea-${generated}`;
    const helpId = `${textareaId}-help`;
    const errorId = `${textareaId}-error`;

    return (
      <div dir="rtl" className={cx("min-w-0 text-right", className)}>
        {label ? (
          <label
            htmlFor={textareaId}
            className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--adt-text)]"
          >
            {label}
            {required ? (
              <span className="text-[var(--adt-danger)]">*</span>
            ) : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          dir={dir}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : helperText ? helpId : undefined}
          className={cx(
            "block min-h-[120px] w-full resize-none rounded-[5px] border bg-[var(--adt-surface)] px-3 py-3 text-[11px] leading-6 text-[var(--adt-text)] outline-none transition-colors placeholder:text-[var(--adt-soft)] focus:border-[var(--adt-border-strong)] focus:ring-2 focus:ring-[var(--adt-accent)]/15 disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-[var(--adt-danger)]" : "border-[var(--adt-border)]",
            dir === "ltr" ? "text-left" : "text-right",
          )}
          {...props}
        />
        {error ? (
          <p
            id={errorId}
            className="mt-1.5 text-[9px] leading-4 text-[var(--adt-danger)]"
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            id={helpId}
            className="mt-1.5 text-[9px] leading-4 text-[var(--adt-muted)]"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* Switch                                                                     */
/* -------------------------------------------------------------------------- */

export function DataSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      dir="rtl"
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-[5px] border px-3 text-right outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/25 disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-[var(--adt-border-strong)] bg-[var(--adt-surface-muted)]"
          : "border-[var(--adt-border)] bg-[var(--adt-surface)]",
      )}
    >
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold text-[var(--adt-text)]">
          {label}
        </span>
        {description ? (
          <span className="mt-1 block text-[8px] leading-4 text-[var(--adt-muted)]">
            {description}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked
            ? "border-[var(--adt-accent)] bg-[var(--adt-accent)]"
            : "border-[var(--adt-border-strong)] bg-[var(--adt-surface-raised)]",
        )}
      >
        <span
          className={cx(
            "absolute right-1 top-1/2 size-4 -translate-y-1/2 rounded-full bg-white transition-transform",
            checked ? "-translate-x-[20px]" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Floating panel                                                             */
/* -------------------------------------------------------------------------- */

export type FloatingPanelProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  title?: string;
  children: ReactNode;
  desktopWidth?: number;
  minTriggerWidth?: boolean;
  className?: string;
};

export function FloatingPanel({
  open,
  onClose,
  triggerRef,
  title,
  children,
  desktopWidth = 340,
  minTriggerWidth = true,
  className,
}: FloatingPanelProps) {
  const theme = useAdminTheme();
  const themeVars = useMemo(() => getAdminDataThemeVars(theme), [theme]);
  const palette = getAdminThemePalette(theme);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mobile, setMobile] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: desktopWidth,
  });

  useEffect(() => {
    if (!open) return;
    const media = window.matchMedia("(max-width: 767px)");
    const updateMedia = () => setMobile(media.matches);
    updateMedia();
    media.addEventListener?.("change", updateMedia);
    return () => media.removeEventListener?.("change", updateMedia);
  }, [open]);

  useEffect(() => {
    if (!open || mobile) return;

    function update() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const targetWidth = Math.min(desktopWidth, viewportWidth - 24);
      const width = minTriggerWidth
        ? Math.max(rect.width, targetWidth)
        : targetWidth;
      const finalWidth = Math.min(width, viewportWidth - 24);
      const preferredLeft = rect.right - finalWidth;
      const left = clamp(preferredLeft, 12, viewportWidth - finalWidth - 12);
      const panelHeight = panelRef.current?.offsetHeight ?? 360;
      const below = rect.bottom + 8;
      const top =
        below + panelHeight <= window.innerHeight - 12
          ? below
          : Math.max(12, rect.top - panelHeight - 8);
      setPosition({ top, left, width: finalWidth });
    }

    update();
    const frame = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [desktopWidth, minTriggerWidth, mobile, open, triggerRef]);

  useEffect(() => {
    if (!open || !mobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
      );
      (first ?? panelRef.current)?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobile, open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open, triggerRef]);

  if (!open || typeof document === "undefined") return null;

  if (mobile) {
    return createPortal(
      <div
        dir="rtl"
        style={{
          ...themeVars,
          backgroundColor: palette.overlay,
          color: palette.text,
        }}
        className="fixed inset-0 z-[1700] flex items-end bg-[var(--adt-overlay)] text-right text-[var(--adt-text)]"
        role="presentation"
      >
        <button
          type="button"
          aria-label="بستن"
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
        <div
          ref={panelRef}
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "انتخاب"}
          tabIndex={-1}
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          className={cx(
            "relative z-10 max-h-[min(82dvh,720px)] w-full overflow-y-auto overflow-x-hidden rounded-t-[12px] border-t border-[var(--adt-border-strong)] bg-[var(--adt-surface-raised)] text-right text-[var(--adt-text)] shadow-[0_-24px_70px_rgba(0,0,0,0.35)] [padding-bottom:max(16px,env(safe-area-inset-bottom))]",
            className,
          )}
          style={{
            backgroundColor: palette.surfaceRaised,
            color: palette.text,
          }}
        >
          <div className="sticky top-0 z-10 flex min-h-14 items-center justify-between gap-3 border-b border-[var(--adt-border)] bg-[var(--adt-surface-raised)] px-4">
            <strong className="text-[12px] font-bold text-[var(--adt-text)]">
              {title ?? "انتخاب"}
            </strong>
            <DataButton
              aria-label="بستن"
              icon={<X size={17} />}
              iconOnly
              size="sm"
              tone="ghost"
              onClick={onClose}
            />
          </div>
          {children}
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      ref={panelRef}
      dir="rtl"
      data-lenis-prevent
      data-lenis-prevent-wheel
      className={cx(
        "fixed z-[1700] max-h-[min(72vh,620px)] overflow-y-auto overflow-x-hidden rounded-[8px] border border-[var(--adt-border-strong)] bg-[var(--adt-surface-raised)] text-right text-[var(--adt-text)] shadow-[0_24px_70px_rgba(0,0,0,0.28)]",
        className,
      )}
      style={{
        ...themeVars,
        top: position.top,
        left: position.left,
        width: position.width,
        backgroundColor: palette.surfaceRaised,
        color: palette.text,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

export type DataSelectProps = {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  options: DataSelectOption[];
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  allowSelectAll?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
};

export function DataSelect({
  label,
  helperText,
  error,
  placeholder = "انتخاب کنید",
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  clearable = true,
  allowSelectAll = false,
  disabled,
  readOnly,
  required,
  className,
}: DataSelectProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === "string"
      ? [value]
      : [];

  function closeSelect() {
    setOpen(false);
    setSearch("");
  }

  const filtered = useMemo(() => {
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

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  const displayLabel = selectedOptions.length
    ? multiple
      ? selectedOptions.length === 1
        ? selectedOptions[0]?.label
        : `${new Intl.NumberFormat("fa-IR").format(selectedOptions.length)} انتخاب`
      : selectedOptions[0]?.label
    : placeholder;

  function toggleOption(option: DataSelectOption) {
    if (option.disabled) return;
    if (!multiple) {
      onChange(option.value);
      closeSelect();
      return;
    }
    const next = selectedValues.includes(option.value)
      ? selectedValues.filter((item) => item !== option.value)
      : [...selectedValues, option.value];
    onChange(next);
  }

  return (
    <div dir="rtl" className={cx("min-w-0 text-right", className)}>
      {label ? (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--adt-text)]">
          <span>{label}</span>
          {required ? (
            <span className="text-[var(--adt-danger)]">*</span>
          ) : null}
        </div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled || readOnly}
        onClick={() => open ? closeSelect() : setOpen(true)}
        className={cx(
          "flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-[5px] border bg-[var(--adt-surface)] px-3 text-right outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/20 disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[var(--adt-danger)]"
            : "border-[var(--adt-border)] hover:border-[var(--adt-border-strong)]",
        )}
      >
        <span
          className={cx(
            "min-w-0 flex-1 truncate text-[11px]",
            selectedOptions.length
              ? "text-[var(--adt-text)]"
              : "text-[var(--adt-soft)]",
          )}
        >
          {displayLabel}
        </span>
        <ChevronDown
          size={15}
          className={cx(
            "shrink-0 text-[var(--adt-muted)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {error ? (
        <p className="mt-1.5 text-[9px] leading-4 text-[var(--adt-danger)]">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-[9px] leading-4 text-[var(--adt-muted)]">
          {helperText}
        </p>
      ) : null}

      <FloatingPanel
        open={open}
        onClose={closeSelect}
        triggerRef={triggerRef}
        title={label ?? "انتخاب"}
        desktopWidth={360}
      >
        <div className="p-3">
          {searchable ? (
            <DataInput
              type="search"
              placeholder="جستجو در گزینه‌ها..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              leadingIcon={<Search size={15} />}
              autoFocus
            />
          ) : null}

          {multiple && allowSelectAll ? (
            <button
              type="button"
              onClick={() => {
                const enabledValues = filtered
                  .filter((item) => !item.disabled)
                  .map((item) => item.value);
                const allSelected = enabledValues.every((item) =>
                  selectedValues.includes(item),
                );
                onChange(
                  allSelected
                    ? selectedValues.filter(
                        (item) => !enabledValues.includes(item),
                      )
                    : Array.from(
                        new Set([...selectedValues, ...enabledValues]),
                      ),
                );
              }}
              className="mt-2 flex min-h-10 w-full cursor-pointer items-center justify-between border border-[var(--adt-border)] bg-[var(--adt-surface)] px-3 text-[10px] font-semibold text-[var(--adt-muted)] hover:text-[var(--adt-text)]"
            >
              <span>انتخاب همه</span>
              <span>
                {new Intl.NumberFormat("fa-IR").format(selectedValues.length)}
              </span>
            </button>
          ) : null}

          <div className="mt-2 max-h-[320px] overflow-y-auto border border-[var(--adt-border)]">
            {filtered.length ? (
              filtered.map((option) => {
                const selected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    disabled={option.disabled}
                    onClick={() => toggleOption(option)}
                    className={cx(
                      "flex min-h-11 w-full cursor-pointer items-center gap-3 border-b border-[var(--adt-border)] px-3 text-right last:border-b-0 hover:bg-[var(--adt-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40",
                      selected && "bg-[var(--adt-accent)]/[0.08]",
                    )}
                  >
                    {multiple ? (
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
                    {!multiple && selected ? (
                      <Check
                        size={14}
                        className="shrink-0 text-[var(--adt-accent-strong)]"
                      />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-[10px] text-[var(--adt-muted)]">
                گزینه‌ای پیدا نشد.
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            {clearable ? (
              <DataButton
                tone="ghost"
                size="sm"
                onClick={() => onChange(multiple ? [] : null)}
              >
                پاک کردن
              </DataButton>
            ) : (
              <span />
            )}
            <DataButton
              tone="secondary"
              size="sm"
              onClick={closeSelect}
            >
              بستن
            </DataButton>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Filter chip                                                                */
/* -------------------------------------------------------------------------- */

export const FilterChip = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
    summary?: string;
    active?: boolean;
    dirty?: boolean;
  }
>(function FilterChip(
  { label, summary, active, dirty, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      dir="rtl"
      type="button"
      className={cx(
        "inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-[8px] border px-3 text-[10px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--adt-accent)]/30",
        active
          ? "border-[var(--adt-accent)] bg-[var(--adt-accent)]/[0.10] text-[var(--adt-text)]"
          : summary
            ? "border-[var(--adt-border-strong)] bg-[var(--adt-surface-raised)] text-[var(--adt-text)]"
            : "border-[var(--adt-border)] bg-[var(--adt-surface-muted)] text-[var(--adt-muted)] hover:border-[var(--adt-border-strong)] hover:text-[var(--adt-text)]",
        dirty && "border-[var(--adt-warning)]/60",
        className,
      )}
      {...props}
    >
      <span>{label}</span>
      {summary ? (
        <span className="max-w-[150px] truncate font-normal text-[var(--adt-accent-strong)]">
          {summary}
        </span>
      ) : null}
      <ChevronDown
        size={13}
        className={cx("shrink-0 transition-transform", active && "rotate-180")}
      />
    </button>
  );
});
