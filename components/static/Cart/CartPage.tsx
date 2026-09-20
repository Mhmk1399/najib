"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/CustomToast";
import {
  type AccountCart,
  cartQueryKey,
  CommerceApiError,
  commerceFetch,
  fetchAccountCart,
  formatMinor,
  loginHref,
} from "@/lib/commerce/client";

const FALLBACK_IMAGE = "/assets/images/banner.webp";

export function CartPage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: ({ signal }) => fetchAccountCart(signal),
    retry: (count, error) =>
      !(error instanceof CommerceApiError && error.status === 401) && count < 1,
  });

  const updateCart = (cart: AccountCart | null) => {
    queryClient.setQueryData(cartQueryKey, cart);
    void queryClient.invalidateQueries({ queryKey: ["account"] });
  };

  const reportMutationError = (title: string, error: unknown) => {
    if (error instanceof CommerceApiError && error.status === 401) {
      toast.info("نشست شما پایان یافته است", {
        description: "برای ادامه مدیریت سبد دوباره وارد حساب شوید.",
      });
      router.push(loginHref("/cart"));
      return;
    }
    toast.error(title, { description: messageFor(error) });
  };

  const quantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      commerceFetch<AccountCart>(`/api/account/cart/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: updateCart,
    onError: (error) => reportMutationError("تغییر تعداد انجام نشد", error),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      commerceFetch<AccountCart>(`/api/account/cart/items/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (cart) => {
      updateCart(cart);
      toast.success("کالا از سبد حذف شد");
    },
    onError: (error) => reportMutationError("حذف کالا انجام نشد", error),
  });

  const clearMutation = useMutation({
    mutationFn: () =>
      commerceFetch<AccountCart>("/api/account/cart", { method: "DELETE" }),
    onSuccess: (cart) => {
      updateCart(cart);
      toast.success("سبد خرید خالی شد");
    },
    onError: (error) => reportMutationError("خالی‌کردن سبد انجام نشد", error),
  });

  const signedOut =
    cartQuery.error instanceof CommerceApiError && cartQuery.error.status === 401;
  const cart = cartQuery.data;
  const locked = cart?.status === "checkout_started";

  return (
    <main dir="rtl" lang="fa" className="min-h-dvh bg-[#F6F2EB] pb-24 pt-28 text-[#0B0B0B] md:pt-32">
      <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <header className="border-b border-black/15 pb-8 md:flex md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-[#C15427]">انتخاب‌های شما</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">سبد خرید</h1>
          </div>
          {cart?.itemCount ? (
            <p className="mt-4 text-sm text-black/55 md:mt-0">
              {new Intl.NumberFormat("fa-IR").format(cart.itemCount)} کالا
            </p>
          ) : null}
        </header>

        {cartQuery.isPending ? <CartLoading /> : null}

        {signedOut ? (
          <StatePanel
            icon={<ShoppingBag className="size-6" />}
            title="برای دیدن سبد وارد حساب شوید"
            description="سبد خرید و رزرو موجودی به حساب شما متصل است تا انتخاب‌هایتان محفوظ بماند."
          >
            <Button href={loginHref("/cart")} variant="black" size="lg">ورود به حساب</Button>
          </StatePanel>
        ) : null}

        {cartQuery.isError && !signedOut ? (
          <StatePanel title="سبد خرید دریافت نشد" description={messageFor(cartQuery.error)}>
            <Button type="button" variant="outline" size="lg" onClick={() => void cartQuery.refetch()}>
              تلاش دوباره
            </Button>
          </StatePanel>
        ) : null}

        {!cartQuery.isPending && !cartQuery.isError && (!cart || !cart.items.length) ? (
          <StatePanel
            icon={<ShoppingBag className="size-6" />}
            title="سبد شما هنوز خالی است"
            description="از میان محصولات نجیب‌زاده، ترکیب دقیق رنگ و سایز خود را انتخاب کنید."
          >
            <Button href="/shop" variant="black" size="lg">مشاهده فروشگاه</Button>
          </StatePanel>
        ) : null}

        {cart?.items.length ? (
          <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
            <section aria-label="کالاهای سبد خرید">
              {locked ? (
                <div className="mb-7 border-r-2 border-[#C15427] bg-white px-5 py-4 text-sm leading-7">
                  موجودی این انتخاب‌ها در مرحله پرداخت رزرو شده است. برای تغییر سبد، ابتدا Checkout را لغو کنید.
                </div>
              ) : null}

              <div className="divide-y divide-black/15 border-y border-black/15">
                {cart.items.map((item) => {
                  const changing =
                    (quantityMutation.isPending && quantityMutation.variables?.id === item.id) ||
                    (removeMutation.isPending && removeMutation.variables === item.id);
                  return (
                    <article key={item.id} className="grid grid-cols-[108px_minmax(0,1fr)] gap-5 py-7 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:gap-7">
                      <Link href={item.productSlug ? `/shop/${item.productSlug}` : "/shop"} className="relative aspect-[3/4] overflow-hidden bg-[#E9E3DA]">
                        <Image
                          src={item.imageUrl || FALLBACK_IMAGE}
                          alt={item.imageAlt || item.productName}
                          fill
                          sizes="150px"
                          style={{ objectPosition: item.imagePosition || "center" }}
                          className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                        />
                      </Link>

                      <div className="min-w-0 py-1">
                        <p className="text-[9px] tracking-[0.1em] text-black/45">{item.sku}</p>
                        <Link href={item.productSlug ? `/shop/${item.productSlug}` : "/shop"} className="mt-2 block text-lg font-semibold leading-8 transition-colors hover:text-[#C15427]">
                          {item.productName}
                        </Link>
                        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-black/55">
                          <div className="flex items-center gap-2">
                            <dt>رنگ</dt>
                            <dd className="flex items-center gap-1.5 text-black/80">
                              {item.colorHex ? <span className="size-2.5 border border-black/15" style={{ backgroundColor: item.colorHex }} aria-hidden /> : null}
                              {item.colorName}
                            </dd>
                          </div>
                          <div className="flex gap-2"><dt>سایز</dt><dd className="text-black/80">{item.sizeName}</dd></div>
                        </dl>

                        <div className="mt-6 flex flex-wrap items-center gap-4">
                          <div className="flex h-11 items-center border border-black/20 bg-white">
                            <button type="button" aria-label={`کم کردن تعداد ${item.productName}`} disabled={locked || changing || item.quantity <= 1} onClick={() => quantityMutation.mutate({ id: item.id, quantity: item.quantity - 1 })} className="grid size-10 place-items-center transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                              <Minus className="size-3.5" />
                            </button>
                            <span className="min-w-10 text-center text-xs tabular-nums">{new Intl.NumberFormat("fa-IR").format(item.quantity)}</span>
                            <button type="button" aria-label={`زیاد کردن تعداد ${item.productName}`} disabled={locked || changing || item.quantity >= 99} onClick={() => quantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })} className="grid size-10 place-items-center transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <button type="button" disabled={locked || changing} onClick={() => removeMutation.mutate(item.id)} className="inline-flex min-h-11 items-center gap-2 text-xs text-black/50 underline-offset-4 transition-colors hover:text-[#A33A32] hover:underline disabled:opacity-30">
                            <Trash2 className="size-3.5" /> حذف
                          </button>
                        </div>
                      </div>

                      <p className="col-span-2 mt-1 text-left text-sm font-semibold tabular-nums sm:col-span-1 sm:mt-0 sm:py-1">
                        {formatMinor(item.lineTotalMinor, cart.currency)}
                      </p>
                    </article>
                  );
                })}
              </div>

              {!locked ? (
                <button type="button" disabled={clearMutation.isPending} onClick={() => clearMutation.mutate()} className="mt-5 min-h-11 text-xs text-black/50 underline underline-offset-4 transition-colors hover:text-[#A33A32] disabled:opacity-40">
                  {clearMutation.isPending ? "در حال خالی‌کردن…" : "خالی‌کردن سبد"}
                </button>
              ) : null}
            </section>

            <aside className="h-fit border-t-2 border-black bg-white p-6 lg:sticky lg:top-28 lg:p-8">
              <p className="text-[10px] font-semibold tracking-[0.1em] text-[#C15427]">خلاصه سفارش</p>
              <div className="mt-7 flex items-center justify-between border-b border-black/15 pb-5 text-sm">
                <span>جمع کالاها</span><strong className="tabular-nums">{formatMinor(cart.subtotalMinor, cart.currency)}</strong>
              </div>
              <div className="space-y-3 border-b border-black/15 py-5 text-xs leading-6 text-black/55">
                <p className="flex justify-between gap-4"><span>هزینه ارسال</span><span>در مرحله تحویل مشخص می‌شود</span></p>
                <p className="flex justify-between gap-4"><span>تخفیف و مالیات</span><span>فعلاً اعمال نمی‌شود</span></p>
              </div>
              <div className="flex items-center justify-between py-6">
                <span className="font-semibold">مبلغ کالاها</span><strong className="text-lg tabular-nums">{formatMinor(cart.subtotalMinor, cart.currency)}</strong>
              </div>
              <Button type="button" variant="black" size="xl" fullWidth onClick={() => router.push("/checkout")}>
                {locked ? "ادامه پرداخت" : "ادامه فرایند خرید"}
              </Button>
              <p className="mt-4 text-center text-[10px] leading-5 text-black/45">موجودی تنها پس از ورود به Checkout برای ۱۵ دقیقه رزرو می‌شود.</p>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function CartLoading() {
  return (
    <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_380px]" aria-label="در حال دریافت سبد">
      <div className="space-y-px">
        {[1, 2].map((item) => (
          <div key={item} className="flex gap-6 border-y border-black/10 py-7">
            <div className="aspect-[3/4] w-28 animate-pulse bg-black/10" />
            <div className="flex-1 space-y-4 pt-2"><div className="h-3 w-24 animate-pulse bg-black/10" /><div className="h-6 w-48 animate-pulse bg-black/10" /><div className="h-4 w-36 animate-pulse bg-black/10" /></div>
          </div>
        ))}
      </div>
      <div className="h-72 animate-pulse bg-white" />
    </div>
  );
}

function StatePanel({ icon, title, description, children }: { icon?: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center py-24 text-center">
      {icon ? <div className="mb-6 grid size-14 place-items-center border border-black/15">{icon}</div> : null}
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-4 max-w-md text-sm leading-7 text-black/55">{description}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : "لطفاً دوباره تلاش کنید.";
}
