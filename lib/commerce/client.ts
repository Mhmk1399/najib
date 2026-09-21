export const cartQueryKey = ["account", "cart"] as const;

const PENDING_CART_ITEM_KEY = "najib:pending-cart-item";
const PENDING_CART_ITEM_TTL_MS = 30 * 60 * 1000;

export type PendingCartItem = {
  variantId: string;
  quantity: number;
  createdAt: number;
};

export type CartItem = {
  id: string;
  variantId: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  productName: string;
  productSlug: string | null;
  sku: string;
  colorName: string;
  colorHex: string | null;
  sizeName: string;
  imageUrl: string | null;
  imageAlt: string;
  imagePosition: string;
};

export type AccountCart = {
  id: string;
  status: "active" | "checkout_started";
  currency: string;
  expiresAt: string;
  itemCount: number;
  subtotalMinor: number;
  checkout: {
    id: string;
    status: "reserved" | "payment_pending";
    expiresAt: string;
    paymentId: string | null;
  } | null;
  items: CartItem[];
};

export type Checkout = {
  id: string;
  cartId: string;
  storeId: string;
  cityId: string;
  currency: string;
  status: string;
  expiresAt: string;
  paymentId: string | null;
  itemCount: number;
  subtotalMinor: number;
  items: Array<{ variantId: string; quantity: number; unitPriceMinor: number }>;
};

export type Payment = {
  id: string;
  checkoutSessionId: string;
  provider: string;
  amountMinor: number;
  currency: string;
  status: string;
  orderId: string | null;
  errorCode: string | null;
  expiresAt: string;
};

export class CommerceApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "CommerceApiError";
  }
}

export async function commerceFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...Object.fromEntries(new Headers(init?.headers).entries()),
    },
  });
  const body = (await response.json().catch(() => null)) as
    | { error?: string; details?: unknown }
    | T
    | null;

  if (!response.ok) {
    const errorBody = body as { error?: string; details?: unknown } | null;
    throw new CommerceApiError(
      errorBody?.error || "ارتباط با فروشگاه ناموفق بود.",
      response.status,
      errorBody?.details,
    );
  }
  return body as T;
}

export function fetchAccountCart(signal?: AbortSignal) {
  return commerceFetch<AccountCart | null>("/api/account/cart", { signal });
}

export function loginHref(next: string) {
  return `/auth?mode=login&next=${encodeURIComponent(next)}`;
}

export function savePendingCartItem(variantId: string, quantity = 1) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    PENDING_CART_ITEM_KEY,
    JSON.stringify({ variantId, quantity, createdAt: Date.now() }),
  );
}

export function readPendingCartItem(): PendingCartItem | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PENDING_CART_ITEM_KEY);
    if (!raw) return null;

    const item = JSON.parse(raw) as Partial<PendingCartItem>;
    const valid =
      typeof item.variantId === "string" &&
      /^[a-f\d]{24}$/i.test(item.variantId) &&
      Number.isInteger(item.quantity) &&
      Number(item.quantity) > 0 &&
      typeof item.createdAt === "number" &&
      Date.now() - item.createdAt <= PENDING_CART_ITEM_TTL_MS;

    if (!valid) {
      clearPendingCartItem();
      return null;
    }

    return item as PendingCartItem;
  } catch {
    clearPendingCartItem();
    return null;
  }
}

export function clearPendingCartItem() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(PENDING_CART_ITEM_KEY);
  }
}

export function currentPath() {
  return `${window.location.pathname}${window.location.search}`;
}

export function formatMinor(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value / 100);
  } catch {
    return `${new Intl.NumberFormat("fa-IR").format(value / 100)} ${currency}`;
  }
}

export function localized(
  value: { fa?: string; en?: string; ar?: string } | null | undefined,
  fallback = "",
) {
  return value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback;
}
