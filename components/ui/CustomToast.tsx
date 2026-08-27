"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { createPortal } from "react-dom";

/* ==========================================================================
   TYPES
============================================================================ */

export type ToastVariant = "success" | "error" | "info" | "warning" | "loading";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export type ToastAction = {
  label: string;

  onClick: () => void;
};

export type ToastInput = {
  id?: string;

  variant?: ToastVariant;

  title: string;

  description?: string;

  duration?: number;

  dismissible?: boolean;

  action?: ToastAction;
};

type ToastItem = Required<
  Pick<ToastInput, "id" | "variant" | "title" | "dismissible">
> &
  Pick<ToastInput, "description" | "action"> & {
    duration: number;

    visible: boolean;
  };

type ToastUpdate = Partial<Omit<ToastInput, "id">>;

type ToastOptions = Omit<ToastInput, "title" | "variant" | "id">;

type PromiseMessages<T> = {
  loading: string;

  success: string | ((data: T) => string);

  error: string | ((error: unknown) => string);
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;

  success: (title: string, options?: ToastOptions) => string;

  error: (title: string, options?: ToastOptions) => string;

  info: (title: string, options?: ToastOptions) => string;

  warning: (title: string, options?: ToastOptions) => string;

  loading: (title: string, options?: ToastOptions) => string;

  update: (id: string, input: ToastUpdate) => void;

  dismiss: (id: string) => void;

  dismissAll: () => void;

  promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>) => Promise<T>;
};

/* ==========================================================================
   CONTEXT
============================================================================ */

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/* ==========================================================================
   CONFIG
============================================================================ */

const DEFAULT_DURATION = 4200;

const EXIT_DURATION = 220;

const subscribeToClientReady = () => () => {};

const getClientReadySnapshot = () => true;

const getServerReadySnapshot = () => false;

function useClientReady() {
  return useSyncExternalStore(
    subscribeToClientReady,
    getClientReadySnapshot,
    getServerReadySnapshot,
  );
}

/* ==========================================================================
   PROVIDER
============================================================================ */

type ToastProviderProps = {
  children: ReactNode;

  position?: ToastPosition;

  maxToasts?: number;
};

export function ToastProvider({
  children,

  position = "top-right",

  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const mounted = useClientReady();

  const timers = useRef<Map<string, number>>(new Map());

  /* ------------------------------------------------------------------------
     MOUNT
  ------------------------------------------------------------------------- */

  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      activeTimers.forEach((timer) => {
        clearTimeout(timer);
      });

      activeTimers.clear();
    };
  }, []);

  /* ------------------------------------------------------------------------
     REMOVE FINAL
  ------------------------------------------------------------------------- */

  const removeToast = useCallback((id: string) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);

      timers.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  /* ------------------------------------------------------------------------
     DISMISS
  ------------------------------------------------------------------------- */

  const dismiss = useCallback(
    (id: string) => {
      const timer = timers.current.get(id);

      if (timer) {
        clearTimeout(timer);

        timers.current.delete(id);
      }

      setToasts((current) =>
        current.map((toast) =>
          toast.id === id
            ? {
                ...toast,

                visible: false,
              }
            : toast,
        ),
      );

      window.setTimeout(() => {
        removeToast(id);
      }, EXIT_DURATION);
    },
    [removeToast],
  );

  /* ------------------------------------------------------------------------
     AUTO DISMISS
  ------------------------------------------------------------------------- */

  const scheduleDismiss = useCallback(
    (id: string, duration: number) => {
      const oldTimer = timers.current.get(id);

      if (oldTimer) {
        clearTimeout(oldTimer);
      }

      if (duration <= 0) {
        return;
      }

      const timer = window.setTimeout(() => {
        dismiss(id);
      }, duration);

      timers.current.set(id, timer);
    },
    [dismiss],
  );

  /* ------------------------------------------------------------------------
     ADD
  ------------------------------------------------------------------------- */

  const toast = useCallback(
    (input: ToastInput) => {
      const id = input.id ?? crypto.randomUUID();

      const variant = input.variant ?? "info";

      const duration =
        variant === "loading" ? 0 : (input.duration ?? DEFAULT_DURATION);

      const newToast: ToastItem = {
        id,

        variant,

        title: input.title,

        description: input.description,

        duration,

        dismissible: input.dismissible ?? variant !== "loading",

        action: input.action,

        visible: false,
      };

      setToasts((current) => {
        const existing = current.some((item) => item.id === id);

        if (existing) {
          return current.map((item) => (item.id === id ? newToast : item));
        }

        return [newToast, ...current].slice(0, maxToasts);
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setToasts((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    ...item,

                    visible: true,
                  }
                : item,
            ),
          );
        });
      });

      scheduleDismiss(id, duration);

      return id;
    },
    [maxToasts, scheduleDismiss],
  );

  /* ------------------------------------------------------------------------
     UPDATE
  ------------------------------------------------------------------------- */

  const update = useCallback(
    (id: string, input: ToastUpdate) => {
      let nextDuration = DEFAULT_DURATION;

      setToasts((current) =>
        current.map((item) => {
          if (item.id !== id) {
            return item;
          }

          const nextVariant = input.variant ?? item.variant;

          nextDuration =
            input.duration ??
            (nextVariant === "loading" ? 0 : DEFAULT_DURATION);

          return {
            ...item,

            ...input,

            variant: nextVariant,

            duration: nextDuration,

            dismissible: input.dismissible ?? nextVariant !== "loading",

            visible: true,
          };
        }),
      );

      scheduleDismiss(id, nextDuration);
    },
    [scheduleDismiss],
  );

  /* ------------------------------------------------------------------------
     HELPERS
  ------------------------------------------------------------------------- */

  const success = useCallback(
    (title: string, options: ToastOptions = {}) =>
      toast({
        ...options,

        title,

        variant: "success",
      }),
    [toast],
  );

  const error = useCallback(
    (title: string, options: ToastOptions = {}) =>
      toast({
        ...options,

        title,

        variant: "error",
      }),
    [toast],
  );

  const info = useCallback(
    (title: string, options: ToastOptions = {}) =>
      toast({
        ...options,

        title,

        variant: "info",
      }),
    [toast],
  );

  const warning = useCallback(
    (title: string, options: ToastOptions = {}) =>
      toast({
        ...options,

        title,

        variant: "warning",
      }),
    [toast],
  );

  const loading = useCallback(
    (title: string, options: ToastOptions = {}) =>
      toast({
        ...options,

        title,

        variant: "loading",

        duration: 0,
      }),
    [toast],
  );

  /* ------------------------------------------------------------------------
     DISMISS ALL
  ------------------------------------------------------------------------- */

  const dismissAll = useCallback(() => {
    toasts.forEach((item) => {
      dismiss(item.id);
    });
  }, [dismiss, toasts]);

  /* ------------------------------------------------------------------------
     PROMISE
  ------------------------------------------------------------------------- */

  const promise = useCallback(
    async <T,>(promiseInstance: Promise<T>, messages: PromiseMessages<T>) => {
      const id = loading(messages.loading);

      try {
        const data = await promiseInstance;

        const message =
          typeof messages.success === "function"
            ? messages.success(data)
            : messages.success;

        update(id, {
          variant: "success",

          title: message,

          duration: DEFAULT_DURATION,
        });

        return data;
      } catch (errorValue) {
        const message =
          typeof messages.error === "function"
            ? messages.error(errorValue)
            : messages.error;

        update(id, {
          variant: "error",

          title: message,

          duration: 6000,
        });

        throw errorValue;
      }
    },
    [loading, update],
  );

  /* ------------------------------------------------------------------------
     VALUE
  ------------------------------------------------------------------------- */

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,

      success,

      error,

      info,

      warning,

      loading,

      update,

      dismiss,

      dismissAll,

      promise,
    }),
    [
      toast,
      success,
      error,
      info,
      warning,
      loading,
      update,
      dismiss,
      dismissAll,
      promise,
    ],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {mounted &&
        createPortal(
          <ToastViewport
            toasts={toasts}
            position={position}
            dismiss={dismiss}
          />,

          document.body,
        )}
    </ToastContext.Provider>
  );
}

/* ==========================================================================
   HOOK
============================================================================ */

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}

/* ==========================================================================
   VIEWPORT
============================================================================ */

function ToastViewport({
  toasts,

  position,

  dismiss,
}: {
  toasts: ToastItem[];

  position: ToastPosition;

  dismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className={`
        pointer-events-none

        fixed

        z-[9999]

        flex

        w-[calc(100%-24px)]
        max-w-[410px]

        flex-col

        gap-2

        max-sm:left-3
        max-sm:right-3
        max-sm:top-[84px]
        max-sm:w-auto

        ${
          position === "top-right"
            ? `
              right-5
              top-[92px]
            `
            : ""
        }

        ${
          position === "top-left"
            ? `
              left-5
              top-[92px]
            `
            : ""
        }

        ${
          position === "top-center"
            ? `
              left-1/2
              top-[92px]

              -translate-x-1/2
            `
            : ""
        }

        ${
          position === "bottom-right"
            ? `
              bottom-5
              right-5
            `
            : ""
        }

        ${
          position === "bottom-left"
            ? `
              bottom-5
              left-5
            `
            : ""
        }

        ${
          position === "bottom-center"
            ? `
              bottom-5
              left-1/2

              -translate-x-1/2
            `
            : ""
        }
      `}
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} dismiss={dismiss} />
      ))}
    </div>
  );
}

/* ==========================================================================
   TOAST CARD
============================================================================ */

function ToastCard({
  toast,

  dismiss,
}: {
  toast: ToastItem;

  dismiss: (id: string) => void;
}) {
  const meta = VARIANT_META[toast.variant];

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      className={`
    pointer-events-auto

    relative

    grid
    grid-cols-[50px_minmax(0,1fr)_auto]

    items-start

    overflow-hidden

    border

    shadow-[0_18px_45px_rgba(0,0,0,0.10)]

    transition-[opacity,transform,background-color,border-color]
    duration-200

    ease-[cubic-bezier(0.22,1,0.36,1)]

    ${meta.cardClass}

    ${
      toast.visible
        ? `
          translate-x-0
          opacity-100
        `
        : `
          translate-x-3
          opacity-0
        `
    }
  `}
    >
      {/* =====================================================
          STATE INDICATOR
      ====================================================== */}

      <div
        className="
    flex
    min-h-full

    items-start
    justify-center

    pt-4
    pl-2
  "
      >
        <span
          className={`
      grid
      size-8

      place-items-center

      ${meta.iconBoxClass}
      ${meta.iconClass}
    `}
        >
          <ToastIcon variant={toast.variant} />
        </span>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          min-w-0

          py-4

          pr-3
        "
      >
        <div
          className="
            flex

            items-center

            gap-2
          "
        >
          <p
            className="
              min-w-0

              text-[11px]
              font-semibold

              leading-[1.45]

              text-[#0B0B0B]
            "
          >
            {toast.title}
          </p>

          <span
            className={`
              shrink-0

              text-[6px]
              font-semibold

              uppercase
              tracking-[0.13em]

              ${meta.labelClass}
            `}
          >
            {meta.label}
          </span>
        </div>

        {toast.description && (
          <p
            className="
              mt-1.5

              text-[9px]

              leading-[1.6]

              text-[#77787B]
            "
          >
            {toast.description}
          </p>
        )}

        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();

              dismiss(toast.id);
            }}
            className="
              mt-3

              border-b
              border-black/30

              pb-0.5

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.14em]

              text-black

              transition-[border-color,opacity]

              hover:border-black

              hover:opacity-55

              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-black
            "
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* =====================================================
          CLOSE
      ====================================================== */}

      <div
        className="
          flex

          pt-2
          pr-2
        "
      >
        {toast.dismissible && (
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismiss(toast.id)}
            className="
              grid
              size-8

              place-items-center

              text-black/35

              transition-colors

              hover:text-black

              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-black
            "
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* =====================================================
          LEFT STATUS LINE
      ====================================================== */}

      <span
        aria-hidden="true"
        className={`
          absolute

          inset-y-0
          left-0

          w-[2px]

          ${meta.lineClass}
        `}
      />

      {/* =====================================================
          LOADING LINE
      ====================================================== */}

      {toast.variant === "loading" && (
        <span
          aria-hidden="true"
          className="
      absolute

      inset-x-0
      bottom-0

      h-[2px]

      overflow-hidden

      bg-black/10
    "
        >
          <span
            className="
        block

        h-full
        w-1/3

        animate-[toastLoading_1.1s_ease-in-out_infinite]

        bg-[#231F20]
      "
          />
        </span>
      )}
    </div>
  );
}

/* ==========================================================================
   VARIANT META
============================================================================ */

const VARIANT_META: Record<
  ToastVariant,
  {
    label: string;

    cardClass: string;

    iconBoxClass: string;

    iconClass: string;

    titleClass: string;

    descriptionClass: string;

    labelClass: string;

    lineClass: string;
  }
> = {
  success: {
    label: "Success",

    cardClass: `
      border-[#B8D9C0]
      bg-[#EDF7F0]
    `,

    iconBoxClass: `
      bg-[#D8EEDF]
    `,

    iconClass: `
      text-[#1F6A3A]
    `,

    titleClass: `
      text-[#174E2B]
    `,

    descriptionClass: `
      text-[#52715D]
    `,

    labelClass: `
      text-[#2B7545]
    `,

    lineClass: `
      bg-[#2E7D4C]
    `,
  },

  error: {
    label: "Error",

    cardClass: `
      border-[#E7B9B3]
      bg-[#FFF0EE]
    `,

    iconBoxClass: `
      bg-[#FADAD6]
    `,

    iconClass: `
      text-[#B9382F]
    `,

    titleClass: `
      text-[#8F2922]
    `,

    descriptionClass: `
      text-[#875954]
    `,

    labelClass: `
      text-[#B9382F]
    `,

    lineClass: `
      bg-[#C7483E]
    `,
  },

  warning: {
    label: "Notice",

    cardClass: `
      border-[#E6D09E]
      bg-[#FFF7E7]
    `,

    iconBoxClass: `
      bg-[#F7E8BC]
    `,

    iconClass: `
      text-[#9A6A14]
    `,

    titleClass: `
      text-[#745012]
    `,

    descriptionClass: `
      text-[#806C43]
    `,

    labelClass: `
      text-[#9A6A14]
    `,

    lineClass: `
      bg-[#B88325]
    `,
  },

  info: {
    label: "Info",

    cardClass: `
      border-[#B9CFE0]
      bg-[#EEF5FB]
    `,

    iconBoxClass: `
      bg-[#DCEAF5]
    `,

    iconClass: `
      text-[#2A638F]
    `,

    titleClass: `
      text-[#1F4F73]
    `,

    descriptionClass: `
      text-[#58758D]
    `,

    labelClass: `
      text-[#2A638F]
    `,

    lineClass: `
      bg-[#3D78A2]
    `,
  },

  loading: {
    label: "Loading",

    cardClass: `
      border-[#D8CFC2]
      bg-[#F6F1E9]
    `,

    iconBoxClass: `
      bg-[#E9E0D4]
    `,

    iconClass: `
      text-[#231F20]
    `,

    titleClass: `
      text-[#231F20]
    `,

    descriptionClass: `
      text-[#77787B]
    `,

    labelClass: `
      text-[#77787B]
    `,

    lineClass: `
      bg-[#231F20]
    `,
  },
};

/* ==========================================================================
   ICON SWITCH
============================================================================ */

function ToastIcon({ variant }: { variant: ToastVariant }) {
  switch (variant) {
    case "success":
      return <SuccessIcon />;

    case "error":
      return <ErrorIcon />;

    case "warning":
      return <WarningIcon />;

    case "loading":
      return <LoadingIcon />;

    default:
      return <InfoIcon />;
  }
}

/* ==========================================================================
   SUCCESS
============================================================================ */

function SuccessIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
      <path
        d="M3 10.5L7.2 14.5L17 4.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      <path d="M17 10A7 7 0 1 1 10 3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ==========================================================================
   ERROR
============================================================================ */

function ErrorIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.25" />

      <rect
        x="2.5"
        y="2.5"
        width="15"
        height="15"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

/* ==========================================================================
   INFO
============================================================================ */

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1" />

      <path d="M10 8V14" stroke="currentColor" strokeWidth="1.2" />

      <path d="M10 5.5H10.01" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* ==========================================================================
   WARNING
============================================================================ */

function WarningIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
      <path d="M10 2.5L18 17H2L10 2.5Z" stroke="currentColor" strokeWidth="1" />

      <path d="M10 7V11.5" stroke="currentColor" strokeWidth="1.2" />

      <path d="M10 14H10.01" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* ==========================================================================
   LOADING
============================================================================ */

function LoadingIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="
        size-5

        animate-spin

        motion-reduce:animate-none
      "
    >
      <path
        d="M10 2.5A7.5 7.5 0 1 1 4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.2"
      />

      <path
        d="M3.5 2.8L4.8 4.8L6.8 3.5"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

/* ==========================================================================
   CLOSE
============================================================================ */

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
