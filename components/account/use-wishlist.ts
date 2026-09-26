"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CommerceApiError,
  commerceFetch,
  currentPath,
  loginHref,
} from "@/lib/commerce/client";
import type { Locale } from "@/lib/i18n/config";

export const wishlistQueryKey = ["account", "wishlist"] as const;

export type WishlistItem = {
  id: string;
  slug: string;
  name: { fa?: string; en?: string; ar?: string };
  displayName: string;
  priceMinor: number;
  currency: string;
  image: {
    url: string;
    alt: string;
    objectPosition: string;
  } | null;
};

type WishlistResponse = { items: WishlistItem[] };

export function useWishlist(productId?: string, locale: Locale = "fa") {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [...wishlistQueryKey, locale],
    queryFn: ({ signal }) =>
      commerceFetch<WishlistResponse>(`/api/account/wishlist?locale=${locale}`, {
        signal,
      }),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      if (next) {
        return commerceFetch<{ productId: string; isFavorite: true }>(
          "/api/account/wishlist",
          {
            method: "POST",
            body: JSON.stringify({ productId: id }),
          },
        );
      }

      return commerceFetch<{ productId: string; isFavorite: false }>(
        `/api/account/wishlist/${id}`,
        { method: "DELETE" },
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
    },
  });

  const isFavorite = Boolean(query.data?.items.some((item) => item.id === productId));

  async function toggle() {
    const next = !isFavorite;
    try {
      const result = await mutation.mutateAsync({ id: productId ?? "", next });
      return result.isFavorite;
    } catch (error) {
      if (error instanceof CommerceApiError && error.status === 401) {
        window.location.assign(loginHref(currentPath()));
      }
      throw error;
    }
  }

  return {
    isFavorite,
    isLoading: query.isLoading,
    isPending: mutation.isPending,
    error: query.error,
    toggle,
  };
}
