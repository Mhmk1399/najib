export const cartQueryKey = ["account", "cart"] as const;

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
