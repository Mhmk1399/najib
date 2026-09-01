"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  lightTokens,
} from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

export type SelectOption = {
  value: string;

  label: string;

  description?: string;

  group?: string;

  badge?: string;

  icon?: ReactNode;

  keywords?: string[];

  disabled?: boolean;
};

export type CustomSelectSize =
  | "sm"
  | "md"
  | "lg";

export type CustomSelectTone =
  | "light"
  | "dark";

export type CustomSelectPlacement =
  | "bottom"
  | "top";

export type CustomSelectValue =
  | string
  | string[]
  | null;

type CustomSelectProps = {
  /* ------------------------------------------------------------------------
     CORE
  ------------------------------------------------------------------------- */

  id?: string;

  name?: string;

  options: SelectOption[];

  value?: CustomSelectValue;

  defaultValue?: CustomSelectValue;

  onChange?: (
    value: CustomSelectValue,
    selected:
      | SelectOption
      | SelectOption[]
      | null,
  ) => void;

  /* ------------------------------------------------------------------------
     MODE
  ------------------------------------------------------------------------- */

  multiple?: boolean;

  searchable?: boolean;

  clearable?: boolean;

  allowSelectAll?: boolean;

  closeOnSelect?: boolean;

  /* ------------------------------------------------------------------------
     STATES
  ------------------------------------------------------------------------- */

  disabled?: boolean;

  readOnly?: boolean;

  required?: boolean;

  loading?: boolean;

  /* ------------------------------------------------------------------------
     MESSAGES
  ------------------------------------------------------------------------- */

  label?: string;

  placeholder?: string;

  searchPlaceholder?: string;

  helperText?: string;

  error?: string;

  success?: string;

  emptyText?: string;

  /* ------------------------------------------------------------------------
     STYLE
  ------------------------------------------------------------------------- */

  size?: CustomSelectSize;

  tone?: CustomSelectTone;

  placement?: CustomSelectPlacement;

  fullWidth?: boolean;

  className?: string;

  triggerClassName?: string;

  menuClassName?: string;

  /* ------------------------------------------------------------------------
     MULTI
  ------------------------------------------------------------------------- */

  maxVisibleTags?: number;

  /* ------------------------------------------------------------------------
     MENU
  ------------------------------------------------------------------------- */

  maxMenuHeight?: number;

  /* ------------------------------------------------------------------------
     ACCESSIBILITY
  ------------------------------------------------------------------------- */

  ariaLabel?: string;
};

/* ==========================================================================
   STATIC STYLE MAPS

   هیچ Tailwind dynamic construction نداریم.
============================================================================ */

const SIZE_CLASSES: Record<
  CustomSelectSize,
  string
> = {
  sm: `
    min-h-10
    px-3

    text-[10px]
  `,

  md: `
    min-h-12
    px-4

    text-[11px]
  `,

  lg: `
    min-h-14
    px-5

    text-[12px]
  `,
};

const OPTION_SIZE_CLASSES: Record<
  CustomSelectSize,
  string
> = {
  sm: `
    min-h-10
    px-3
    py-2
  `,

  md: `
    min-h-12
    px-4
    py-2.5
  `,

  lg: `
    min-h-14
    px-5
    py-3
  `,
};

/* ==========================================================================
   UTILS
============================================================================ */

function cx(
  ...classes: Array<
    | string
    | false
    | null
    | undefined
  >
) {
  return classes
    .filter(Boolean)
    .join(" ");
}

function normalizeValue(
  value: CustomSelectValue,
  multiple: boolean,
) {
  if (multiple) {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return [value];
    }

    return [];
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

/* ==========================================================================
   COMPONENT
============================================================================ */

export function CustomSelect({
  id,

  name,

  options,

  value,

  defaultValue = null,

  onChange,

  multiple = false,

  searchable = false,

  clearable = false,

  allowSelectAll = false,

  closeOnSelect,

  disabled = false,

  readOnly = false,

  required = false,

  loading = false,

  label,

  placeholder = "Select an option",

  searchPlaceholder = "Search...",

  helperText,

  error,

  success,

  emptyText = "No options found",

  size = "md",

  tone = "light",

  placement = "bottom",

  fullWidth = true,

  className = "",

  triggerClassName = "",

  menuClassName = "",

  maxVisibleTags = 2,

  maxMenuHeight = 320,

  ariaLabel,
}: CustomSelectProps) {
  const generatedId =
    useId();

  const selectId =
    id ??
    `select-${generatedId}`;

  const listboxId =
    `${selectId}-listbox`;

  const wrapperRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const searchRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const optionRefs =
    useRef<
      Array<HTMLButtonElement | null>
    >([]);

  /* ------------------------------------------------------------------------
     STATE
  ------------------------------------------------------------------------- */

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(-1);

  const [
    internalValue,
    setInternalValue,
  ] =
    useState<CustomSelectValue>(
      defaultValue,
    );

  /* ------------------------------------------------------------------------
     CONTROLLED / UNCONTROLLED
  ------------------------------------------------------------------------- */

  const controlled =
    value !== undefined;

  const currentValue =
    controlled
      ? value
      : internalValue;

  const normalizedValue =
    normalizeValue(
      currentValue,
      multiple,
    );

  const selectedValues =
    multiple
      ? (normalizedValue as string[])
      : normalizedValue
        ? [
            normalizedValue as string,
          ]
        : [];

  /* ------------------------------------------------------------------------
     THEME
  ------------------------------------------------------------------------- */

  const themeVars =
    tone === "light"
      ? ({
          "--select-bg":
            "#FFFFFF",

          "--select-text":
            "#0B0B0B",

          "--select-muted":
            lightTokens.textMuted,

          "--select-soft":
            "#F7F7F7",

          "--select-hover":
            "#F3F3F3",

          "--select-border":
            lightTokens.border,

          "--select-border-strong":
            "#0B0B0B",

          "--select-disabled":
            "#F7F7F7",

          "--select-danger":
            lightTokens.destructive,

          "--select-success":
            "#35634A",
        } as CSSProperties)
      : ({
          "--select-bg":
            "#0B0B0B",

          "--select-text":
            "#FFFFFF",

          "--select-muted":
            "#A5A5A5",

          "--select-soft":
            "#151515",

          "--select-hover":
            "#1B1B1B",

          "--select-border":
            "#303030",

          "--select-border-strong":
            "#FFFFFF",

          "--select-disabled":
            "#111111",

          "--select-danger":
            "#E27368",

          "--select-success":
            "#7EB394",
        } as CSSProperties);

  /* ------------------------------------------------------------------------
     FILTER
  ------------------------------------------------------------------------- */

  const filteredOptions =
    useMemo(() => {
      if (!searchable) {
        return options;
      }

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return options;
      }

      return options.filter(
        (option) => {
          const haystack = [
            option.label,
            option.description,
            option.group,
            ...(option.keywords ??
              []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            query,
          );
        },
      );
    }, [
      options,
      search,
      searchable,
    ]);

  /* ------------------------------------------------------------------------
     SELECTED OPTIONS
  ------------------------------------------------------------------------- */

  const selectedOptions =
    useMemo(() => {
      return options.filter(
        (option) =>
          selectedValues.includes(
            option.value,
          ),
      );
    }, [
      options,
      selectedValues,
    ]);

  /* ------------------------------------------------------------------------
     GROUPING
  ------------------------------------------------------------------------- */

  const groupedOptions =
    useMemo(() => {
      const groups: Array<{
        name: string | null;

        options: SelectOption[];
      }> = [];

      filteredOptions.forEach(
        (option) => {
          const groupName =
            option.group ??
            null;

          const existing =
            groups.find(
              (group) =>
                group.name ===
                groupName,
            );

          if (existing) {
            existing.options.push(
              option,
            );

            return;
          }

          groups.push({
            name:
              groupName,

            options: [
              option,
            ],
          });
        },
      );

      return groups;
    }, [
      filteredOptions,
    ]);

  /* ------------------------------------------------------------------------
     EMIT
  ------------------------------------------------------------------------- */

  function emitValue(
    next: CustomSelectValue,
  ) {
    if (!controlled) {
      setInternalValue(
        next,
      );
    }

    if (!onChange) {
      return;
    }

    if (multiple) {
      const values =
        Array.isArray(next)
          ? next
          : [];

      const selected =
        options.filter(
          (option) =>
            values.includes(
              option.value,
            ),
        );

      onChange(
        values,
        selected,
      );

      return;
    }

    if (
      typeof next === "string"
    ) {
      const selected =
        options.find(
          (option) =>
            option.value ===
            next,
        ) ?? null;

      onChange(
        next,
        selected,
      );

      return;
    }

    onChange(
      null,
      null,
    );
  }

  /* ------------------------------------------------------------------------
     OPEN
  ------------------------------------------------------------------------- */

  function openMenu() {
    if (
      disabled ||
      readOnly ||
      loading
    ) {
      return;
    }

    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);

    setSearch("");

    setActiveIndex(-1);
  }

  function toggleMenu() {
    if (open) {
      closeMenu();

      return;
    }

    openMenu();
  }

  /* ------------------------------------------------------------------------
     SELECT
  ------------------------------------------------------------------------- */

  function selectOption(
    option: SelectOption,
  ) {
    if (
      option.disabled ||
      disabled ||
      readOnly
    ) {
      return;
    }

    if (multiple) {
      const values =
        selectedValues;

      const selected =
        values.includes(
          option.value,
        );

      const next =
        selected
          ? values.filter(
              (item) =>
                item !==
                option.value,
            )
          : [
              ...values,
              option.value,
            ];

      emitValue(next);

      if (
        closeOnSelect === true
      ) {
        closeMenu();
      }

      return;
    }

    emitValue(
      option.value,
    );

    if (
      closeOnSelect !== false
    ) {
      closeMenu();
    }
  }

  /* ------------------------------------------------------------------------
     CLEAR
  ------------------------------------------------------------------------- */

  function clearSelection() {
    if (
      disabled ||
      readOnly
    ) {
      return;
    }

    emitValue(
      multiple
        ? []
        : null,
    );

    setSearch("");
  }

  /* ------------------------------------------------------------------------
     REMOVE MULTI ITEM
  ------------------------------------------------------------------------- */

  function removeValue(
    itemValue: string,
  ) {
    if (
      !multiple ||
      disabled ||
      readOnly
    ) {
      return;
    }

    emitValue(
      selectedValues.filter(
        (item) =>
          item !== itemValue,
      ),
    );
  }

  /* ------------------------------------------------------------------------
     SELECT ALL
  ------------------------------------------------------------------------- */

  function selectAll() {
    if (!multiple) {
      return;
    }

    const selectable =
      filteredOptions
        .filter(
          (option) =>
            !option.disabled,
        )
        .map(
          (option) =>
            option.value,
        );

    const allSelected =
      selectable.every(
        (optionValue) =>
          selectedValues.includes(
            optionValue,
          ),
      );

    if (allSelected) {
      emitValue(
        selectedValues.filter(
          (value) =>
            !selectable.includes(
              value,
            ),
        ),
      );

      return;
    }

    emitValue(
      Array.from(
        new Set([
          ...selectedValues,
          ...selectable,
        ]),
      ),
    );
  }

  /* ------------------------------------------------------------------------
     CLICK OUTSIDE
  ------------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent,
    ) {
      if (
        !wrapperRef.current
      ) {
        return;
      }

      if (
        wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        return;
      }

      closeMenu();
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
    };
  }, [open]);

  /* ------------------------------------------------------------------------
     OPEN FOCUS
  ------------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (searchable) {
      requestAnimationFrame(
        () => {
          searchRef.current?.focus();
        },
      );

      return;
    }

    const firstSelectedIndex =
      filteredOptions.findIndex(
        (option) =>
          selectedValues.includes(
            option.value,
          ) &&
          !option.disabled,
      );

    const nextIndex =
      firstSelectedIndex >= 0
        ? firstSelectedIndex
        : filteredOptions.findIndex(
            (option) =>
              !option.disabled,
          );

    setActiveIndex(
      nextIndex,
    );
  }, [
    open,
    searchable,
  ]);

  /* ------------------------------------------------------------------------
     ACTIVE OPTION SCROLL
  ------------------------------------------------------------------------- */

  useEffect(() => {
    if (
      !open ||
      activeIndex < 0
    ) {
      return;
    }

    optionRefs.current[
      activeIndex
    ]?.scrollIntoView({
      block: "nearest",
    });
  }, [
    activeIndex,
    open,
  ]);

  /* ------------------------------------------------------------------------
     KEYBOARD
  ------------------------------------------------------------------------- */

  function moveActive(
    direction: 1 | -1,
  ) {
    if (
      !filteredOptions.length
    ) {
      return;
    }

    let next =
      activeIndex;

    for (
      let attempt = 0;
      attempt <
      filteredOptions.length;
      attempt++
    ) {
      next =
        next + direction;

      if (
        next <
        0
      ) {
        next =
          filteredOptions.length -
          1;
      }

      if (
        next >=
        filteredOptions.length
      ) {
        next = 0;
      }

      if (
        !filteredOptions[
          next
        ]?.disabled
      ) {
        setActiveIndex(
          next,
        );

        return;
      }
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (
      disabled ||
      readOnly
    ) {
      return;
    }

    if (
      !open &&
      (
        event.key ===
          "Enter" ||
        event.key ===
          " " ||
        event.key ===
          "ArrowDown"
      )
    ) {
      event.preventDefault();

      openMenu();

      return;
    }

    if (!open) {
      return;
    }

    switch (
      event.key
    ) {
      case "Escape": {
        event.preventDefault();

        closeMenu();

        break;
      }

      case "ArrowDown": {
        event.preventDefault();

        moveActive(1);

        break;
      }

      case "ArrowUp": {
        event.preventDefault();

        moveActive(-1);

        break;
      }

      case "Home": {
        event.preventDefault();

        const index =
          filteredOptions.findIndex(
            (option) =>
              !option.disabled,
          );

        setActiveIndex(
          index,
        );

        break;
      }

      case "End": {
        event.preventDefault();

        let index =
          filteredOptions.length -
          1;

        while (
          index >= 0 &&
          filteredOptions[
            index
          ]?.disabled
        ) {
          index--;
        }

        setActiveIndex(
          index,
        );

        break;
      }

      case "Enter": {
        if (
          activeIndex <
            0 ||
          !filteredOptions[
            activeIndex
          ]
        ) {
          return;
        }

        event.preventDefault();

        selectOption(
          filteredOptions[
            activeIndex
          ],
        );

        break;
      }

      case "Backspace": {
        if (
          !multiple ||
          search.length >
            0 ||
          !selectedValues.length
        ) {
          return;
        }

        const last =
          selectedValues[
            selectedValues.length -
              1
          ];

        if (last) {
          removeValue(last);
        }

        break;
      }
    }
  }

  /* ------------------------------------------------------------------------
     STATUS
  ------------------------------------------------------------------------- */

  const statusText =
    error ??
    success ??
    helperText;

  const statusTone =
    error
      ? "error"
      : success
        ? "success"
        : "helper";

  const hasSelection =
    selectedOptions.length >
    0;

  /* ------------------------------------------------------------------------
     VISIBLE TAGS
  ------------------------------------------------------------------------- */

  const visibleTags =
    multiple
      ? selectedOptions.slice(
          0,
          Math.max(
            1,
            maxVisibleTags,
          ),
        )
      : [];

  const hiddenTagCount =
    multiple
      ? Math.max(
          0,
          selectedOptions.length -
            visibleTags.length,
        )
      : 0;

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <div
      ref={wrapperRef}
      style={themeVars}
      onKeyDown={
        handleKeyDown
      }
      className={cx(
        "relative",

        fullWidth
          ? "w-full"
          : "w-fit",

        className,
      )}
    >
      {/* ================================================================
          LABEL
      ================================================================= */}

      {label && (
        <label
          htmlFor={
            selectId
          }
          className="
            mb-2

            flex
            items-center
            gap-1.5

            text-[8px]
            font-semibold

            uppercase
            tracking-[0.16em]

            text-[var(--select-text)]
          "
        >
          {label}

          {required && (
            <span
              aria-hidden="true"
              className="
                text-[var(--select-danger)]
              "
            >
              *
            </span>
          )}
        </label>
      )}

      {/* ================================================================
          HIDDEN FORM INPUTS
      ================================================================= */}

      {name &&
        (multiple ? (
          selectedValues.map(
            (selectedValue) => (
              <input
                key={
                  selectedValue
                }
                type="hidden"
                name={name}
                value={
                  selectedValue
                }
              />
            ),
          )
        ) : (
          <input
            type="hidden"
            name={name}
            value={
              selectedValues[
                0
              ] ?? ""
            }
            required={
              required
            }
          />
        ))}

      {/* ================================================================
          TRIGGER
      ================================================================= */}

      <div
        id={selectId}
        role="combobox"
        aria-label={
          ariaLabel ??
          label ??
          placeholder
        }
        aria-expanded={
          open
        }
        aria-controls={
          listboxId
        }
        aria-haspopup="listbox"
        aria-disabled={
          disabled
        }
        aria-readonly={
          readOnly
        }
        tabIndex={
          disabled
            ? -1
            : 0
        }
        onClick={
          toggleMenu
        }
        className={cx(
          `
            group/select

            relative

            flex

            cursor-pointer

            items-center

            gap-3

            border

            bg-[var(--select-bg)]
            text-[var(--select-text)]

            outline-none

            transition-[border-color,background-color,opacity]
            duration-200

            focus-visible:border-[var(--select-border-strong)]
          `,

          SIZE_CLASSES[
            size
          ],

          error
            ? `
              border-[var(--select-danger)]
            `
            : success
              ? `
                border-[var(--select-success)]
              `
              : open
                ? `
                  border-[var(--select-border-strong)]
                `
                : `
                  border-[var(--select-border)]
                `,

          disabled &&
            `
              cursor-not-allowed

              bg-[var(--select-disabled)]

              opacity-50
            `,

          readOnly &&
            `
              cursor-default

              opacity-75
            `,

          triggerClassName,
        )}
      >
        {/* ==============================================================
            VALUE
        =============================================================== */}

        <div
          className="
            flex

            min-w-0
            flex-1

            items-center

            gap-2
          "
        >
          {/* SINGLE */}

          {!multiple &&
            selectedOptions[0] && (
              <>
                {selectedOptions[
                  0
                ].icon && (
                  <span
                    className="
                      grid
                      size-5

                      shrink-0
                      place-items-center

                      text-[var(--select-muted)]
                    "
                  >
                    {
                      selectedOptions[
                        0
                      ].icon
                    }
                  </span>
                )}

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <p
                    className="
                      truncate

                      text-[var(--select-text)]
                    "
                  >
                    {
                      selectedOptions[
                        0
                      ].label
                    }
                  </p>
                </div>
              </>
            )}

          {/* MULTI */}

          {multiple &&
            hasSelection && (
              <div
                className="
                  flex
                  min-w-0

                  flex-wrap

                  items-center

                  gap-1.5
                "
              >
                {visibleTags.map(
                  (option) => (
                    <SelectedTag
                      key={
                        option.value
                      }
                      option={
                        option
                      }
                      onRemove={() =>
                        removeValue(
                          option.value,
                        )
                      }
                      disabled={
                        disabled ||
                        readOnly
                      }
                    />
                  ),
                )}

                {hiddenTagCount >
                  0 && (
                  <span
                    className="
                      flex
                      min-h-6

                      items-center

                      bg-[var(--select-soft)]

                      px-2

                      text-[8px]
                      font-semibold

                      text-[var(--select-muted)]
                    "
                  >
                    +
                    {
                      hiddenTagCount
                    }
                  </span>
                )}
              </div>
            )}

          {/* PLACEHOLDER */}

          {!hasSelection &&
            !loading && (
              <span
                className="
                  truncate

                  text-[var(--select-muted)]
                "
              >
                {
                  placeholder
                }
              </span>
            )}

          {/* LOADING */}

          {loading && (
            <span
              className="
                flex

                items-center
                gap-2

                text-[var(--select-muted)]
              "
            >
              <LoadingBars />

              Loading...
            </span>
          )}
        </div>

        {/* ==============================================================
            ACTIONS
        =============================================================== */}

        <div
          className="
            flex
            shrink-0

            items-center
            gap-1
          "
        >
          {clearable &&
            hasSelection &&
            !disabled &&
            !readOnly &&
            !loading && (
              <button
                type="button"
                aria-label="Clear selection"
                onClick={(
                  event,
                ) => {
                  event.stopPropagation();

                  clearSelection();
                }}
                className="
                  grid
                  size-8

                  place-items-center

                  text-[var(--select-muted)]

                  transition-colors

                  hover:text-[var(--select-text)]

                  focus-visible:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-[var(--select-border-strong)]
                "
              >
                <CloseIcon />
              </button>
            )}

          {!loading && (
            <span
              className={cx(
                `
                  grid
                  size-6

                  place-items-center

                  text-[var(--select-muted)]

                  transition-transform
                  duration-200
                `,

                open &&
                  "rotate-180",
              )}
            >
              <ChevronIcon />
            </span>
          )}
        </div>
      </div>

      {/* ================================================================
          STATUS
      ================================================================= */}

      {statusText && (
        <p
          className={cx(
            `
              mt-2

              text-[8px]

              leading-[1.5]
            `,

            statusTone ===
              "error"
              ? `
                text-[var(--select-danger)]
              `
              : statusTone ===
                  "success"
                ? `
                  text-[var(--select-success)]
                `
                : `
                  text-[var(--select-muted)]
                `,
          )}
        >
          {statusText}
        </p>
      )}

      {/* ================================================================
          MENU
      ================================================================= */}

      {open &&
        !disabled &&
        !readOnly &&
        !loading && (
          <div
            id={
              listboxId
            }
            role="listbox"
            aria-multiselectable={
              multiple ||
              undefined
            }
            className={cx(
              `
                absolute

                left-0

                z-[200]

                w-full

                overflow-hidden

                border
                border-[var(--select-border-strong)]

                bg-[var(--select-bg)]

                text-[var(--select-text)]

                shadow-[0_18px_50px_rgba(0,0,0,0.10)]
              `,

              placement ===
                "top"
                ? `
                  bottom-[calc(100%+6px)]
                `
                : `
                  top-[calc(100%+6px)]
                `,

              menuClassName,
            )}
          >
            {/* ==========================================================
                SEARCH
            =========================================================== */}

            {searchable && (
              <div
                className="
                  flex

                  items-center

                  gap-3

                  border-b
                  border-[var(--select-border)]

                  px-4
                "
              >
                <span
                  className="
                    shrink-0

                    text-[var(--select-muted)]
                  "
                >
                  <SearchIcon />
                </span>

                <input
                  ref={
                    searchRef
                  }
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) => {
                    setSearch(
                      event
                        .target
                        .value,
                    );

                    setActiveIndex(
                      -1,
                    );
                  }}
                  placeholder={
                    searchPlaceholder
                  }
                  className="
                    h-12
                    min-w-0
                    flex-1

                    border-0

                    bg-transparent

                    text-[11px]

                    text-[var(--select-text)]

                    outline-none

                    placeholder:text-[var(--select-muted)]
                  "
                />

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() =>
                      setSearch(
                        "",
                      )
                    }
                    className="
                      grid
                      size-8

                      place-items-center

                      text-[var(--select-muted)]

                      hover:text-[var(--select-text)]
                    "
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            )}

            {/* ==========================================================
                SELECT ALL
            =========================================================== */}

            {multiple &&
              allowSelectAll &&
              filteredOptions.length >
                0 && (
                <button
                  type="button"
                  onClick={
                    selectAll
                  }
                  className="
                    flex

                    min-h-11
                    w-full

                    items-center
                    justify-between

                    border-b
                    border-[var(--select-border)]

                    bg-[var(--select-soft)]

                    px-4

                    text-left

                    text-[8px]
                    font-semibold

                    uppercase
                    tracking-[0.14em]

                    text-[var(--select-muted)]

                    transition-colors

                    hover:text-[var(--select-text)]
                  "
                >
                  Select All

                  <span>
                    {
                      selectedValues.length
                    }
                    /
                    {
                      filteredOptions.filter(
                        (
                          option,
                        ) =>
                          !option.disabled,
                      ).length
                    }
                  </span>
                </button>
              )}

            {/* ==========================================================
                OPTIONS
            =========================================================== */}

            <div
              style={{
                maxHeight:
                  maxMenuHeight,
              }}
              className="
                overflow-y-auto

                overscroll-contain
              "
            >
              {!filteredOptions.length ? (
                <EmptyState
                  search={
                    search
                  }
                  text={
                    emptyText
                  }
                />
              ) : (
                groupedOptions.map(
                  (
                    group,
                    groupIndex,
                  ) => (
                    <div
                      key={
                        group.name ??
                        `ungrouped-${groupIndex}`
                      }
                    >
                      {/* GROUP */}

                      {group.name && (
                        <div
                          className="
                            sticky
                            top-0

                            z-10

                            border-b
                            border-[var(--select-border)]

                            bg-[var(--select-soft)]

                            px-4
                            py-2.5

                            text-[7px]
                            font-semibold

                            uppercase
                            tracking-[0.17em]

                            text-[var(--select-muted)]
                          "
                        >
                          {
                            group.name
                          }
                        </div>
                      )}

                      {group.options.map(
                        (
                          option,
                        ) => {
                          const realIndex =
                            filteredOptions.findIndex(
                              (
                                item,
                              ) =>
                                item.value ===
                                option.value,
                            );

                          const selected =
                            selectedValues.includes(
                              option.value,
                            );

                          const active =
                            realIndex ===
                            activeIndex;

                          return (
                            <button
                              ref={(
                                node,
                              ) => {
                                optionRefs.current[
                                  realIndex
                                ] =
                                  node;
                              }}
                              key={
                                option.value
                              }
                              type="button"
                              role="option"
                              aria-selected={
                                selected
                              }
                              disabled={
                                option.disabled
                              }
                              onMouseEnter={() =>
                                setActiveIndex(
                                  realIndex,
                                )
                              }
                              onClick={() =>
                                selectOption(
                                  option,
                                )
                              }
                              className={cx(
                                `
                                  group/option

                                  flex

                                  w-full

                                  items-center

                                  gap-3

                                  border-b
                                  border-[var(--select-border)]

                                  text-left

                                  transition-[background-color,opacity]
                                  duration-150

                                  last:border-b-0
                                `,

                                OPTION_SIZE_CLASSES[
                                  size
                                ],

                                active
                                  ? `
                                    bg-[var(--select-hover)]
                                  `
                                  : `
                                    bg-[var(--select-bg)]
                                  `,

                                option.disabled &&
                                  `
                                    cursor-not-allowed

                                    opacity-35
                                  `,
                              )}
                            >
                              {/* ICON */}

                              {option.icon && (
                                <span
                                  className="
                                    grid
                                    size-7

                                    shrink-0
                                    place-items-center

                                    text-[var(--select-muted)]
                                  "
                                >
                                  {
                                    option.icon
                                  }
                                </span>
                              )}

                              {/* CONTENT */}

                              <div
                                className="
                                  min-w-0
                                  flex-1
                                "
                              >
                                <div
                                  className="
                                    flex

                                    items-center

                                    gap-2
                                  "
                                >
                                  <span
                                    className={cx(
                                      `
                                        truncate

                                        text-[10px]

                                        transition-opacity
                                      `,

                                      selected
                                        ? `
                                          font-semibold

                                          text-[var(--select-text)]
                                        `
                                        : `
                                          text-[var(--select-text)]

                                          opacity-75

                                          group-hover/option:opacity-100
                                        `,
                                    )}
                                  >
                                    {
                                      option.label
                                    }
                                  </span>

                                  {option.badge && (
                                    <span
                                      className="
                                        shrink-0

                                        border
                                        border-[var(--select-border)]

                                        px-1.5
                                        py-0.5

                                        text-[6px]
                                        font-semibold

                                        uppercase
                                        tracking-[0.12em]

                                        text-[var(--select-muted)]
                                      "
                                    >
                                      {
                                        option.badge
                                      }
                                    </span>
                                  )}
                                </div>

                                {option.description && (
                                  <p
                                    className="
                                      mt-1

                                      line-clamp-1

                                      text-[8px]

                                      leading-[1.5]

                                      text-[var(--select-muted)]
                                    "
                                  >
                                    {
                                      option.description
                                    }
                                  </p>
                                )}
                              </div>

                              {/* SELECTED */}

                              <span
                                className={cx(
                                  `
                                    grid
                                    size-6

                                    shrink-0

                                    place-items-center

                                    transition-opacity
                                  `,

                                  selected
                                    ? `
                                      opacity-100

                                      text-[var(--select-text)]
                                    `
                                    : `
                                      opacity-0
                                    `,
                                )}
                              >
                                <CheckIcon />
                              </span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  ),
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}

/* ==========================================================================
   SELECTED TAG
============================================================================ */

function SelectedTag({
  option,

  onRemove,

  disabled,
}: {
  option: SelectOption;

  onRemove: () => void;

  disabled: boolean;
}) {
  return (
    <span
      className="
        flex

        min-h-7

        max-w-[180px]

        items-center

        gap-1.5

        bg-[var(--select-soft)]

        pl-2
      "
    >
      {option.icon && (
        <span
          className="
            grid
            size-4

            shrink-0
            place-items-center
          "
        >
          {option.icon}
        </span>
      )}

      <span
        className="
          truncate

          text-[8px]
          font-medium
        "
      >
        {option.label}
      </span>

      {!disabled && (
        <button
          type="button"
          aria-label={`Remove ${option.label}`}
          onClick={(
            event,
          ) => {
            event.stopPropagation();

            onRemove();
          }}
          className="
            grid
            size-7

            shrink-0
            place-items-center

            text-[var(--select-muted)]

            transition-colors

            hover:bg-[var(--select-text)]
            hover:text-[var(--select-bg)]
          "
        >
          <CloseIcon />
        </button>
      )}
    </span>
  );
}

/* ==========================================================================
   EMPTY
============================================================================ */

function EmptyState({
  search,

  text,
}: {
  search: string;

  text: string;
}) {
  return (
    <div
      className="
        px-6
        py-10

        text-center
      "
    >
      <SearchIcon />

      <p
        className="
          mt-3

          text-[9px]
          font-semibold

          text-[var(--select-text)]
        "
      >
        {text}
      </p>

      {search && (
        <p
          className="
            mt-1

            text-[8px]

            text-[var(--select-muted)]
          "
        >
          No results for
          &quot;{search}&quot;
        </p>
      )}
    </div>
  );
}

/* ==========================================================================
   LOADING
============================================================================ */

function LoadingBars() {
  return (
    <span
      aria-hidden="true"
      className="
        flex
        items-end

        gap-[2px]
      "
    >
      <span
        className="
          h-2
          w-px

          animate-pulse

          bg-current
        "
      />

      <span
        className="
          h-3
          w-px

          animate-pulse

          bg-current

          [animation-delay:120ms]
        "
      />

      <span
        className="
          h-1.5
          w-px

          animate-pulse

          bg-current

          [animation-delay:240ms]
        "
      />
    </span>
  );
}

/* ==========================================================================
   ICONS
============================================================================ */

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-3.5"
    >
      <path
        d="M3 6L8 11L13 6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-3.5"
    >
      <path
        d="M2.5 8L6.2 11.5L13.5 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-3"
    >
      <path
        d="M3 3L13 13M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="
        mx-auto

        size-4
      "
    >
      <circle
        cx="8"
        cy="8"
        r="5"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M12 12L16 16"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}