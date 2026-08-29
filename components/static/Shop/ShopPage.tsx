"use client";

import Image from "next/image";
import Link from "next/link";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/CustomToast";

import {
  COLOR_OPTIONS,
  MATERIAL_OPTIONS,
  SHOP_PRODUCTS,
  SIZE_OPTIONS,
  type ProductCategory,
  type ShopProduct as Product,
} from "@/data/fake-shop-products";

type SortOption = "new-arrivals" | "price-low" | "price-high" | "featured";

type ShopBanner = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imagePosition?: string;
  ctaText: string;
  ctaHref: string;
  theme: "dark" | "light";
  badge?: string;
};

type InterleavedItem =
  | { type: "product"; product: Product; index: number }
  | { type: "banner"; banner: ShopBanner };

type ProductChunk =
  | {
      kind: "products";
      items: { product: Product; index: number }[];
    }
  | { kind: "banner"; banner: ShopBanner };

const PRODUCTS = SHOP_PRODUCTS;

const SHOP_BANNERS: ShopBanner[] = [
  {
    id: "banner-aw-collection",
    title: "The Autumn/Winter\nCollection",
    subtitle: "Now Available",
    description:
      "Meticulously crafted pieces that define the season. Explore tailored silhouettes in the finest fabrics.",
    image: "/assets/images/banner.webp",
    imagePosition: "center 30%",
    ctaText: "Explore the Collection",
    ctaHref: "/collections/autumn-winter",
    theme: "dark",
    badge: "New Season",
  },
  {
    id: "banner-bespoke",
    title: "Made to\nMeasure",
    subtitle: "Bespoke Service",
    description:
      "Experience the art of personalized tailoring. Every stitch considered, every detail yours to define.",
    image: "/assets/images/banner.webp",
    imagePosition: "center 40%",
    ctaText: "Book a Consultation",
    ctaHref: "/bespoke",
    theme: "light",
    badge: "By Appointment",
  },
];

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "jackets", label: "Jackets" },
  { value: "knitwear", label: "Knitwear" },
  { value: "shirts", label: "Shirts" },
  { value: "trousers", label: "Trousers" },
  { value: "shoes", label: "Shoes" },
  { value: "bags", label: "Bags" },
  { value: "accessories", label: "Accessories" },
  { value: "fragrance", label: "Fragrance" },
];

const BANNER_INSERTION_POINTS = [
  { afterIndex: 6, bannerId: "banner-aw-collection" },
  { afterIndex: 14, bannerId: "banner-bespoke" },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getColorMeta(colorId: string) {
  return (
    COLOR_OPTIONS.find((color) => color.id === colorId) ?? {
      id: colorId,
      label: colorId,
      value: "#111111",
    }
  );
}

function activeFilterCount(
  category: ProductCategory,
  selectedSizes: string[],
  selectedColors: string[],
  selectedMaterials: string[],
  maxPrice: number,
) {
  let count = 0;
  if (category !== "all") count += 1;
  count += selectedSizes.length;
  count += selectedColors.length;
  count += selectedMaterials.length;
  if (maxPrice < 5000) count += 1;
  return count;
}

function buildContentChunks(content: InterleavedItem[]): ProductChunk[] {
  const chunks: ProductChunk[] = [];
  let currentProducts: { product: Product; index: number }[] = [];

  content.forEach((item) => {
    if (item.type === "product") {
      currentProducts.push({ product: item.product, index: item.index });
      return;
    }

    if (currentProducts.length > 0) {
      chunks.push({ kind: "products", items: [...currentProducts] });
      currentProducts = [];
    }

    chunks.push({ kind: "banner", banner: item.banner });
  });

  if (currentProducts.length > 0) {
    chunks.push({ kind: "products", items: currentProducts });
  }

  return chunks;
}

function stopLenis() {
  // @ts-expect-error Lenis may be attached globally.
  const lenis = window.__lenis ?? window.lenis;
  if (lenis && typeof lenis.stop === "function") lenis.stop();
}

function startLenis() {
  // @ts-expect-error Lenis may be attached globally.
  const lenis = window.__lenis ?? window.lenis;
  if (lenis && typeof lenis.start === "function") lenis.start();
}

export function ShopPage() {
  const [category, setCategory] = useState<ProductCategory>("all");
  const [sort, setSort] = useState<SortOption>("new-arrivals");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);

  const themeVars = {
    "--shop-bg": "#F6F2EB",
    "--shop-surface": brandColors.white.hex,
    "--shop-black": "#0B0B0B",
    "--shop-text": "#0B0B0B",
    "--shop-muted": lightTokens.textMuted,
    "--shop-soft": lightTokens.textSoft,
    "--shop-border": "#DDD8D0",
    "--shop-copper": brandColors.copper.hex,
    "--shop-scrollbar-thumb": `rgb(${brandColors.copper.rgb} / 0.58)`,
    "--shop-scrollbar-thumb-hover": `rgb(${brandColors.copper.rgb} / 0.82)`,
    "--shop-scrollbar-track": "rgb(11 11 11 / 0.06)",
  } as CSSProperties;

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    stopLenis();

    return () => {
      document.body.style.overflow = previousOverflow;
      startLenis();
    };
  }, [mobileFiltersOpen]);

  const products = useMemo(() => {
    let result = [...PRODUCTS];

    if (category === "new-arrivals") {
      result = result.filter((product) => product.isNew);
    } else if (category !== "all") {
      result = result.filter((product) => product.category === category);
    }

    if (selectedSizes.length) {
      result = result.filter((product) =>
        product.sizes?.some((size) => selectedSizes.includes(size)),
      );
    }

    if (selectedColors.length) {
      result = result.filter((product) =>
        product.colors?.some((color) => selectedColors.includes(color)),
      );
    }

    if (selectedMaterials.length) {
      result = result.filter((product) =>
        product.materials?.some((material) =>
          selectedMaterials.includes(material.toLowerCase()),
        ),
      );
    }

    result = result.filter((product) => product.price <= maxPrice);

    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (sort === "new-arrivals") {
      result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }

    return result;
  }, [
    category,
    sort,
    selectedSizes,
    selectedColors,
    selectedMaterials,
    maxPrice,
  ]);

  const interleavedContent = useMemo(() => {
    const items: InterleavedItem[] = [];

    products.forEach((product, index) => {
      items.push({ type: "product", product, index });

      const insertion = BANNER_INSERTION_POINTS.find(
        (point) => point.afterIndex === index + 1,
      );

      if (!insertion) return;

      const banner = SHOP_BANNERS.find(
        (item) => item.id === insertion.bannerId,
      );

      if (banner) {
        items.push({ type: "banner", banner });
      }
    });

    return items;
  }, [products]);

  const resetFilters = useCallback(() => {
    setCategory("all");
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setMaxPrice(5000);
  }, []);

  const filterCount = activeFilterCount(
    category,
    selectedSizes,
    selectedColors,
    selectedMaterials,
    maxPrice,
  );

  return (
    <main
      style={themeVars}
      className="min-h-screen bg-[var(--shop-bg)] text-[var(--shop-text)]"
    >
      <div
        aria-hidden="true"
        className="h-[72px] bg-[var(--shop-black)] md:h-[76px]"
      />

      <section className="mx-auto w-full max-w-[1920px]">
        <div className="border-b border-[var(--shop-border)] bg-[var(--shop-bg)] px-5 pb-4 pt-7 lg:hidden">
          <div className="flex flex-col items-center justify-center">
            <p className="text-[6px] font-semibold uppercase tracking-[0.2em] text-[var(--shop-copper)]">
              Najibzadeh Collection
            </p>

            <h1 className="mt-2 font-serif text-[32px] font-normal leading-none tracking-[0.06em] sm:text-[38px]">
              SHOP
            </h1>

            <span className="mt-2 pb-1 text-[9px] font-medium tracking-[0.08em] text-black/42">
              {products.length} {products.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>

        <div className="hidden min-h-[calc(100svh-76px)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="border-r border-[var(--shop-border)] bg-[var(--shop-bg)]">
            <div
              data-lenis-prevent=""
              className="sticky top-[76px] flex max-h-[calc(100svh-76px)] flex-col overflow-y-auto overflow-x-hidden overscroll-contain px-7 py-8 [scrollbar-color:var(--shop-scrollbar-thumb)_var(--shop-scrollbar-track)] [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-[var(--shop-bg)] [&::-webkit-scrollbar-thumb]:bg-[var(--shop-scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--shop-scrollbar-thumb-hover)] [&::-webkit-scrollbar-track]:bg-[var(--shop-scrollbar-track)] xl:px-9"
            >
              <p className="text-[6px] font-semibold uppercase tracking-[0.2em] text-[var(--shop-copper)]">
                Najibzadeh Collection
              </p>

              <h1 className="mt-2 font-serif text-[40px] font-normal tracking-[0.06em] xl:text-[44px]">
                SHOP
              </h1>

              <span className="mt-6 block h-px w-full bg-[var(--shop-border)]" />

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em]">
                    Filters
                  </span>

                  {filterCount > 0 && (
                    <span className="grid size-[18px] place-items-center bg-black text-[8px] font-bold text-white">
                      {filterCount}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[8px] font-semibold uppercase tracking-[0.12em] text-black/40 transition-colors hover:text-black"
                >
                  Clear All
                </button>
              </div>

              <div className="mt-5 border-t border-[var(--shop-border)] pt-5">
                <DesktopAccordion title="Category" defaultOpen>
                  <div className="space-y-0.5">
                    {CATEGORIES.map((item) => {
                      const active = category === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setCategory(item.value)}
                          className={`flex min-h-[30px] w-full items-center gap-2.5 text-left text-[9px] font-medium uppercase tracking-[0.07em] transition-[transform,color] duration-200 ${
                            active
                              ? "translate-x-1.5 text-black"
                              : "text-black/50 hover:translate-x-1.5 hover:text-black"
                          }`}
                        >
                          <span
                            className={`inline-block h-px transition-[width,background-color] duration-200 ${
                              active
                                ? "w-3 bg-[var(--shop-copper)]"
                                : "w-0 bg-transparent"
                            }`}
                          />

                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </DesktopAccordion>
              </div>

              <DesktopAccordion title="Size">
                <SizeSelector
                  values={selectedSizes}
                  onChange={setSelectedSizes}
                />
              </DesktopAccordion>

              <DesktopAccordion title="Color" defaultOpen>
                <ColorSelector
                  values={selectedColors}
                  onChange={setSelectedColors}
                />
              </DesktopAccordion>

              <DesktopAccordion title="Material">
                <MaterialSelector
                  values={selectedMaterials}
                  onChange={setSelectedMaterials}
                />
              </DesktopAccordion>

              <DesktopAccordion title="Price" defaultOpen>
                <PriceSelector value={maxPrice} onChange={setMaxPrice} />
              </DesktopAccordion>

              <div className="mt-8 border-t border-[var(--shop-border)] pt-7">
                <div className="border border-black/[0.055] bg-white/28 p-5">
                  <p className="text-[7px] font-semibold uppercase leading-[1.8] tracking-[0.13em] text-black/75">
                    Style is personal.
                    <br />
                    We are here to help.
                  </p>

                  <Link
                    href="/contact"
                    className="group mt-5 flex items-center justify-between text-[7px] font-semibold uppercase tracking-[0.12em] text-black/40 transition-colors hover:text-black"
                  >
                    Contact Our Stylists
                    <span className="transition-transform group-hover:translate-x-1">
                      ↗
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 px-5 pb-12 pt-8 xl:px-7">
            <div className="mb-6 flex min-h-10 items-center justify-between border-b border-[var(--shop-border)] pb-4">
              <span className="text-[9px] font-medium tracking-[0.08em] text-black/45">
                {products.length} {products.length === 1 ? "Item" : "Items"}
              </span>

              <SortSelect value={sort} onChange={setSort} dark={false} />
            </div>

            {products.length ? (
              <DesktopInterleavedGrid content={interleavedContent} />
            ) : (
              <EmptyProducts resetFilters={resetFilters} />
            )}
          </div>
        </div>

        <div className="pb-[82px] lg:hidden">
          {products.length ? (
            <MobileInterleavedGrid content={interleavedContent} />
          ) : (
            <EmptyProducts resetFilters={resetFilters} />
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="border-t border-black/10 bg-[var(--shop-bg)]/92 px-4 py-3 backdrop-blur-xl">
            <Button
              type="button"
              variant="black"
              size="lg"
              fullWidth
              icon={<FilterIcon />}
              onClick={() => setMobileFiltersOpen(true)}
            >
              Filter & Sort
              {filterCount > 0 && (
                <span className="ml-2 inline-flex size-[18px] items-center justify-center bg-white text-[8px] font-bold text-black">
                  {filterCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </section>

      <MobileFilters
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        selectedMaterials={selectedMaterials}
        setSelectedMaterials={setSelectedMaterials}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        resetFilters={resetFilters}
        resultCount={products.length}
      />
    </main>
  );
}

function DesktopInterleavedGrid({ content }: { content: InterleavedItem[] }) {
  const chunks = useMemo(() => buildContentChunks(content), [content]);

  return (
    <div className="space-y-5">
      {chunks.map((chunk, chunkIndex) => {
        if (chunk.kind === "products") {
          return (
            <div
              key={`desktop-products-${chunkIndex}`}
              className="grid grid-cols-2 gap-4 xl:gap-5"
            >
              {chunk.items.map(({ product, index }) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  preload={index < 4}
                />
              ))}
            </div>
          );
        }

        return (
          <InterstitialBanner key={chunk.banner.id} banner={chunk.banner} />
        );
      })}
    </div>
  );
}

function MobileInterleavedGrid({ content }: { content: InterleavedItem[] }) {
  const chunks = useMemo(() => buildContentChunks(content), [content]);

  return (
    <div>
      {chunks.map((chunk, chunkIndex) => {
        if (chunk.kind === "products") {
          return (
            <div
              key={`mobile-products-${chunkIndex}`}
              className="grid grid-cols-2 gap-px bg-[var(--shop-border)]"
            >
              {chunk.items.map(({ product, index }) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  preload={index < 2}
                  compact
                />
              ))}
            </div>
          );
        }

        return (
          <InterstitialBannerMobile
            key={chunk.banner.id}
            banner={chunk.banner}
          />
        );
      })}
    </div>
  );
}

type CartActionState = "idle" | "adding" | "added";

/* ==========================================================================
   PRODUCT CARD V3

   Added:
   - hover intent + tap-to-pin
   - swipe image navigation with Pointer Events + RAF
   - intelligent option rails with true edge awareness
   - discreet wishlist control
   - add-to-bag Added state
   - lighter animation path: blur/shadow stay fixed; motion is focused on
     size + transform/opacity, and swipe avoids React renders per frame
============================================================================ */

function ProductCard({
  product,
  preload = false,
  compact = false,
}: {
  product: Product;
  preload?: boolean;
  compact?: boolean;
}) {
  const toast = useToast();
  const panelId = useId();

  const panelRef = useRef<HTMLDivElement | null>(null);

  const previewTrackRef = useRef<HTMLDivElement | null>(null);

  const previewAnimatingRef = useRef(false);

  const previewAnimationTimerRef = useRef<number | null>(null);

  const hoverOpenTimerRef = useRef<number | null>(null);

  const hoverCloseTimerRef = useRef<number | null>(null);

  const hoverSuppressedUntilRef = useRef(0);

  const swipeFrameRef = useRef<number | null>(null);

  const pendingSwipeXRef = useRef<number | null>(null);

  const suppressPreviewClickUntilRef = useRef(0);

  const swipeRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    moved: false,
  });

  const productImages = product.images?.length
    ? product.images
    : [
        {
          id: `${product.id}-fallback`,
          src: product.image,
          alt: product.imageAlt ?? product.title,
          position: product.imagePosition,
        },
      ];

  const colors = (product.colors ?? []).map(getColorMeta);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedColorId, setSelectedColorId] = useState(colors[0]?.id ?? "");

  const [selectedSize, setSelectedSize] = useState("");

  const [hoverOpen, setHoverOpen] = useState(false);

  const [lockedOpen, setLockedOpen] = useState(false);

  const [favorite, setFavorite] = useState(false);

  const [cartState, setCartState] = useState<CartActionState>("idle");

  const open = compact ? lockedOpen : hoverOpen || lockedOpen;

  const activeImage = productImages[activeImageIndex] ?? productImages[0];

  const selectedColor =
    colors.find((color) => color.id === selectedColorId) ?? colors[0];

  /*
   * With current fake data we use the next frame as the mini product preview.
   * Later this should become a variant-specific quickPreviewImage from DB.
   */
  const previewIndex = (activeImageIndex + 1) % productImages.length;

  const previousPreviewImage =
    productImages[
      (previewIndex - 1 + productImages.length) % productImages.length
    ] ?? activeImage;

  const currentPreviewImage = productImages[previewIndex] ?? activeImage;

  const nextPreviewImage =
    productImages[(previewIndex + 1) % productImages.length] ?? activeImage;

  useLayoutEffect(() => {
    const track = previewTrackRef.current;

    if (!track) {
      return;
    }

    /*
     * بعد از تغییر index سه عکس جدید render میشن.
     * قبل از paint، track رو بی‌صدا دوباره روی اسلاید وسط میذاریم.
     *
     * بنابراین user هیچ jump یا flash نمی‌بینه.
     */
    track.style.transition = "none";

    track.style.transform = "translate3d(-100%, 0, 0)";

    track.style.willChange = "";

    previewAnimatingRef.current = false;
  }, [activeImageIndex]);

  const canCycleImages = productImages.length > 1;

  const hiddenTabIndex = open ? 0 : -1;

  /* ------------------------------------------------------------------------
     CLEANUP
  ------------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (hoverOpenTimerRef.current !== null) {
        window.clearTimeout(hoverOpenTimerRef.current);
      }

      if (hoverCloseTimerRef.current !== null) {
        window.clearTimeout(hoverCloseTimerRef.current);
      }

      if (swipeFrameRef.current !== null) {
        cancelAnimationFrame(swipeFrameRef.current);
      }
    };
  }, []);

  /* ------------------------------------------------------------------------
     CLOSE PINNED PANEL ON OUTSIDE TAP / ESC
  ------------------------------------------------------------------------- */

  useEffect(() => {
    if (!lockedOpen) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      const panel = panelRef.current;

      if (!panel || panel.contains(event.target as Node)) {
        return;
      }

      setLockedOpen(false);

      if (!compact) {
        setHoverOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLockedOpen(false);
        setHoverOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);

      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lockedOpen, compact]);

  /* ------------------------------------------------------------------------
     SMART HOVER INTENT

     Open is intentionally delayed so simply crossing a grid does not cause
     several cards to flash open. Closing has a slightly longer grace period.
  ------------------------------------------------------------------------- */

  function clearHoverOpenTimer() {
    if (hoverOpenTimerRef.current === null) {
      return;
    }

    window.clearTimeout(hoverOpenTimerRef.current);

    hoverOpenTimerRef.current = null;
  }

  function clearHoverCloseTimer() {
    if (hoverCloseTimerRef.current === null) {
      return;
    }

    window.clearTimeout(hoverCloseTimerRef.current);

    hoverCloseTimerRef.current = null;
  }

  function scheduleHoverOpen() {
    if (
      compact ||
      lockedOpen ||
      performance.now() < hoverSuppressedUntilRef.current
    ) {
      return;
    }

    clearHoverCloseTimer();
    clearHoverOpenTimer();

    hoverOpenTimerRef.current = window.setTimeout(() => {
      setHoverOpen(true);

      hoverOpenTimerRef.current = null;
    }, 145);
  }

  function scheduleHoverClose() {
    if (compact || lockedOpen) {
      return;
    }

    clearHoverOpenTimer();
    clearHoverCloseTimer();

    hoverCloseTimerRef.current = window.setTimeout(() => {
      setHoverOpen(false);

      hoverCloseTimerRef.current = null;
    }, 230);
  }

  function pinOrTogglePanel() {
    clearHoverOpenTimer();
    clearHoverCloseTimer();

    if (compact) {
      setLockedOpen((current) => !current);

      return;
    }

    /*
     * A hover-open panel becomes pinned on click.
     * Clicking again while pinned explicitly closes it.
     */
    if (lockedOpen) {
      setLockedOpen(false);
      setHoverOpen(false);

      hoverSuppressedUntilRef.current = performance.now() + 380;

      return;
    }

    setHoverOpen(false);
    setLockedOpen(true);
  }

  /* ------------------------------------------------------------------------
     IMAGE NAVIGATION
  ------------------------------------------------------------------------- */

  function showPreviousImage() {
    if (!canCycleImages) {
      return;
    }

    setActiveImageIndex(
      (current) => (current - 1 + productImages.length) % productImages.length,
    );
  }

  function showNextImage() {
    if (!canCycleImages) {
      return;
    }

    setActiveImageIndex((current) => (current + 1) % productImages.length);
  }

  /* ------------------------------------------------------------------------
     PREVIEW SWIPE

     Pointer movement writes directly to the preview DOM through RAF.
     React is only updated after the gesture resolves to next/previous image.
  ------------------------------------------------------------------------- */

  /* ------------------------------------------------------------------------
   SEAMLESS PREVIEW CAROUSEL
------------------------------------------------------------------------- */

  function writePreviewOffset(deltaX: number, animated = false) {
    const track = previewTrackRef.current;

    if (!track) {
      return;
    }

    const viewport = track.parentElement;

    const width = viewport?.clientWidth ?? 1;

    /*
     * چون فقط previous/current/next داریم،
     * اجازه نمیدیم drag از یک اسلاید کامل بیشتر بشه.
     *
     * پس هیچ‌وقت فضای خالی دیده نمیشه.
     */
    const safeDelta = Math.max(
      -width * 0.96,

      Math.min(width * 0.96, deltaX),
    );

    track.style.transition = animated
      ? `
        transform
        320ms
        cubic-bezier(0.22, 1, 0.36, 1)
      `
      : "none";

    /*
     * -100% = تصویر وسط
     *
     * deltaX مثبت:
     * previous از چپ وارد میشه.
     *
     * deltaX منفی:
     * next از راست وارد میشه.
     */
    track.style.transform = `translate3d(
      calc(-100% + ${safeDelta}px),
      0,
      0
    )`;
  }

  function schedulePreviewOffset(deltaX: number) {
    pendingSwipeXRef.current = deltaX;

    if (swipeFrameRef.current !== null) {
      return;
    }

    swipeFrameRef.current = requestAnimationFrame(() => {
      swipeFrameRef.current = null;

      const pending = pendingSwipeXRef.current;

      pendingSwipeXRef.current = null;

      if (pending === null) {
        return;
      }

      writePreviewOffset(pending, false);
    });
  }

  function snapPreviewToCenter() {
    const track = previewTrackRef.current;

    if (!track) {
      return;
    }

    track.style.transition = `
    transform
    320ms
    cubic-bezier(0.22, 1, 0.36, 1)
  `;

    track.style.transform = "translate3d(-100%, 0, 0)";
  }

  /* ------------------------------------------------------------------------
   COMPLETE SLIDE

   direction:
   1  = next
   -1 = previous
------------------------------------------------------------------------- */

  function animatePreviewSlide(direction: -1 | 1) {
    if (!canCycleImages || previewAnimatingRef.current) {
      return;
    }

    const track = previewTrackRef.current;

    if (!track) {
      return;
    }

    previewAnimatingRef.current = true;

    if (previewAnimationTimerRef.current !== null) {
      window.clearTimeout(previewAnimationTimerRef.current);
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    track.style.willChange = "transform";

    track.style.transition = reducedMotion
      ? "none"
      : `
        transform
        320ms
        cubic-bezier(0.22, 1, 0.36, 1)
      `;

    /*
     * next:
     *
     * prev | current | next
     *                  ↑
     *               -200%
     *
     * previous:
     *
     * prev | current | next
     *  ↑
     *  0%
     */
    track.style.transform =
      direction === 1 ? "translate3d(-200%, 0, 0)" : "translate3d(0%, 0, 0)";

    const commit = () => {
      if (!previewAnimatingRef.current) {
        return;
      }

      setActiveImageIndex(
        (current) =>
          (current + direction + productImages.length) % productImages.length,
      );

      /*
       * useLayoutEffect بعد از این state update
       * قبل از paint track رو به -100% reset میکنه.
       */
    };

    if (reducedMotion) {
      requestAnimationFrame(commit);

      return;
    }

    previewAnimationTimerRef.current = window.setTimeout(() => {
      previewAnimationTimerRef.current = null;

      commit();
    }, 320);
  }

  /* ------------------------------------------------------------------------
   POINTER DOWN
------------------------------------------------------------------------- */

  function onPreviewPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (previewAnimatingRef.current) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const now = performance.now();

    swipeRef.current = {
      active: true,

      pointerId: event.pointerId,

      startX: event.clientX,

      startY: event.clientY,

      lastX: event.clientX,

      lastTime: now,

      velocityX: 0,

      moved: false,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      //
    }

    const track = previewTrackRef.current;

    if (track) {
      track.style.transition = "none";

      track.style.willChange = "transform";
    }
  }

  /* ------------------------------------------------------------------------
   POINTER MOVE
------------------------------------------------------------------------- */

  function onPreviewPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const swipe = swipeRef.current;

    if (!swipe.active || swipe.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - swipe.startX;

    const deltaY = event.clientY - swipe.startY;

    /*
     * vertical scroll موبایل نباید خراب بشه.
     */
    if (Math.abs(deltaX) > 7 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      event.preventDefault();

      swipe.moved = true;
    }

    if (!swipe.moved) {
      return;
    }

    const now = performance.now();

    const deltaTime = Math.max(
      1,

      now - swipe.lastTime,
    );

    const instantVelocity = (event.clientX - swipe.lastX) / deltaTime;

    swipe.velocityX = swipe.velocityX * 0.68 + instantVelocity * 0.32;

    swipe.lastX = event.clientX;

    swipe.lastTime = now;

    /*
     * اینجا دیگه یک عکس حرکت نمیکنه.
     *
     * کل track شامل:
     * previous/current/next
     * حرکت میکنه.
     */
    schedulePreviewOffset(deltaX);
  }

  /* ------------------------------------------------------------------------
   POINTER UP
------------------------------------------------------------------------- */

  function finishPreviewSwipe(event: ReactPointerEvent<HTMLButtonElement>) {
    const swipe = swipeRef.current;

    if (!swipe.active || swipe.pointerId !== event.pointerId) {
      return;
    }

    swipe.active = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      //
    }

    if (swipeFrameRef.current !== null) {
      cancelAnimationFrame(swipeFrameRef.current);

      swipeFrameRef.current = null;
    }

    /*
     * آخرین pointermove ممکنه هنوز داخل RAF باشه.
     * قبل از snap/slide همون رو flush میکنیم.
     */
    if (pendingSwipeXRef.current !== null) {
      writePreviewOffset(pendingSwipeXRef.current, false);

      pendingSwipeXRef.current = null;
    }

    const deltaX = event.clientX - swipe.startX;

    const shouldNavigate =
      canCycleImages &&
      swipe.moved &&
      (Math.abs(deltaX) > 34 || Math.abs(swipe.velocityX) > 0.48);

    if (swipe.moved) {
      suppressPreviewClickUntilRef.current = performance.now() + 280;
    }

    if (shouldNavigate) {
      animatePreviewSlide(deltaX < 0 ? 1 : -1);

      return;
    }

    snapPreviewToCenter();

    const track = previewTrackRef.current;

    if (track) {
      window.setTimeout(() => {
        track.style.willChange = "";
      }, 340);
    }
  }

  /* ------------------------------------------------------------------------
   CANCEL
------------------------------------------------------------------------- */

  function cancelPreviewSwipe(event: ReactPointerEvent<HTMLButtonElement>) {
    swipeRef.current.active = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      //
    }

    snapPreviewToCenter();
  }

  /* ------------------------------------------------------------------------
   CLICK / TAP
------------------------------------------------------------------------- */

  function handlePreviewClick() {
    if (performance.now() < suppressPreviewClickUntilRef.current) {
      return;
    }

    pinOrTogglePanel();
  }

  /* ------------------------------------------------------------------------
     COLOR + SIZE
  ------------------------------------------------------------------------- */

  function centerRailOption(element: HTMLElement) {
    const rail = element.closest(
      "[data-glass-option-rail]",
    ) as HTMLDivElement | null;

    if (!rail) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const railRect = rail.getBoundingClientRect();

    const optionRect = element.getBoundingClientRect();

    const target =
      rail.scrollLeft +
      (optionRect.left - railRect.left) -
      (rail.clientWidth - optionRect.width) / 2;

    rail.scrollTo({
      left: Math.max(0, target),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  function selectColor(colorId: string, colorIndex: number) {
    setSelectedColorId(colorId);

    /*
     * Fake-data bridge only.
     * DB variants should later provide exact color -> images mapping.
     */
    if (productImages[colorIndex]) {
      setActiveImageIndex(colorIndex);
    }
  }

  /* ------------------------------------------------------------------------
     WISHLIST
  ------------------------------------------------------------------------- */

  function toggleFavorite() {
    const next = !favorite;

    setFavorite(next);

    toast.info(next ? "Saved to wishlist" : "Removed from wishlist", {
      description: product.title,
    });
  }

  /* ------------------------------------------------------------------------
     ADD TO BAG MICRO STATE
  ------------------------------------------------------------------------- */

  async function addToBag() {
    if (product.sizes?.length && !selectedSize) {
      setLockedOpen(true);

      toast.info("Select your size", {
        description: "Choose a size before adding this piece to your bag.",
      });

      return;
    }

    if (cartState !== "idle") {
      return;
    }

    setCartState("adding");

    try {
      /*
       * FAKE REQUEST
       *
       * Replace later with:
       * await addToCart({
       *   productId: product.id,
       *   colorId: selectedColorId,
       *   size: selectedSize,
       *   quantity: 1,
       * });
       */
      await new Promise((resolve) => window.setTimeout(resolve, 520));

      setCartState("added");

      toast.success("Added to your bag", {
        description: [
          product.title,
          selectedColor?.label,
          selectedSize ? `Size ${selectedSize}` : undefined,
        ]
          .filter(Boolean)
          .join(" · "),
      });

      /*
       * Let the successful state be visible before returning to idle.
       * Mobile then collapses; desktop can remain open if the pointer
       * is intentionally still inside the panel.
       */
      await new Promise((resolve) => window.setTimeout(resolve, 760));

      setCartState("idle");

      setLockedOpen(false);

      if (compact) {
        setHoverOpen(false);
      }
    } catch {
      setCartState("idle");

      toast.error("Unable to add item", {
        description: "Try adding the item again.",
      });
    }
  }

  return (
    <article
      className="
        group/product
        relative
        min-w-0
        bg-white
      "
    >
      {/* ===============================================================
          MEDIA
      ================================================================ */}

      <div
        className="
          relative
          isolate
          aspect-[3/4]
          overflow-hidden
          bg-[#E9E5DE]
          [contain:paint]
        "
      >
        {/* MAIN PRODUCT IMAGE */}

        <Link
          href={product.href}
          aria-label={`View ${product.title}`}
          className="
            absolute
            inset-0
            z-0
            block
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-inset
            focus-visible:ring-white
          "
        >
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt ?? product.imageAlt ?? product.title}
            fill
            preload={preload}
            sizes={compact ? "50vw" : "(max-width: 1279px) 50vw, 33vw"}
            draggable={false}
            style={{
              objectPosition:
                activeImage.position ?? product.imagePosition ?? "center",
            }}
            className="
              object-cover
              transition-transform
              duration-[900ms]
              ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover/product:scale-[1.02]
              motion-reduce:transform-none
              motion-reduce:transition-none
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(0,0,0,0.01)_38%,rgba(0,0,0,0.20)_100%)]
            "
          />
        </Link>

        {/* NEW BADGE */}

        {product.isNew && (
          <span
            className={`
              absolute
              z-10
              border
              border-white/18
              bg-black/42
              font-semibold
              uppercase
              text-white
              backdrop-blur-[8px]

              ${
                compact
                  ? `
                    left-2
                    top-2
                    px-2
                    py-1.5
                    text-[5px]
                    tracking-[0.15em]
                  `
                  : `
                    left-4
                    top-4
                    px-3
                    py-2
                    text-[6px]
                    tracking-[0.18em]
                  `
              }
            `}
          >
            New
          </span>
        )}

        {/* DISCREET WISHLIST */}

        <button
          type="button"
          aria-label={
            favorite
              ? `Remove ${product.title} from wishlist`
              : `Save ${product.title} to wishlist`
          }
          aria-pressed={favorite}
          onClick={toggleFavorite}
          className={`
            absolute
            right-2
            top-2
            z-30
            grid
            place-items-center
            border
            border-white/14
            bg-black/28
            text-white
            backdrop-blur-[9px]
            transition-[opacity,background-color,border-color,transform]
            duration-200
            focus-visible:outline-none
            focus-visible:ring-1
            focus-visible:ring-white

            ${
              compact
                ? `
                  size-8
                  opacity-65
                  active:scale-[0.96]
                `
                : favorite
                  ? `
                    size-9
                    opacity-100
                  `
                  : `
                    size-9
                    opacity-0
                    group-hover/product:opacity-70
                    hover:border-white/30
                    hover:bg-black/44
                    hover:opacity-100
                    focus-visible:opacity-100
                  `
            }
          `}
        >
          <HeartIcon filled={favorite} />
        </button>

        {/* =============================================================
            SIGNATURE GLASS PANEL
        ============================================================== */}

        <div
          ref={panelRef}
          onMouseEnter={scheduleHoverOpen}
          onMouseLeave={scheduleHoverClose}
          onFocusCapture={() => {
            if (compact || lockedOpen) {
              return;
            }

            clearHoverOpenTimer();
            clearHoverCloseTimer();

            setHoverOpen(true);
          }}
          onBlurCapture={(event) => {
            if (compact || lockedOpen) {
              return;
            }

            const nextTarget = event.relatedTarget;

            if (
              !(nextTarget instanceof Node) ||
              !event.currentTarget.contains(nextTarget)
            ) {
              scheduleHoverClose();
            }
          }}
          className={`
            absolute
            z-20
            overflow-hidden
            border
            border-white/18
            bg-[linear-gradient(180deg,rgba(10,10,10,0.31)_0%,rgba(7,7,7,0.58)_100%)]
            text-white
            shadow-[0_16px_46px_rgba(0,0,0,0.26)]
            backdrop-blur-[14px]
            [backface-visibility:hidden]

            transition-[width,height,transform]
            duration-[460ms]
            ease-[cubic-bezier(0.22,1,0.36,1)]
            motion-reduce:transition-none

            ${
              compact
                ? open
                  ? `
                    inset-x-1.5
                    bottom-1.5
                    h-[248px]
                    w-auto
                    rounded-[20px]
                  `
                  : `
                    bottom-1.5
                    right-1.5
                    h-[132px]
                    w-[96px]
                    rounded-[20px]
                  `
                : open
                  ? `
                    right-5
                    top-1/2
                    h-[338px]
                    w-[228px]
                    -translate-y-1/2
                    rounded-[28px]
                  `
                  : `
                    right-5
                    top-1/2
                    h-[182px]
                    w-[164px]
                    -translate-y-1/2
                    rounded-[28px]
                  `
            }
          `}
        >
          {/* ===========================================================
              PREVIEW / CLOSED STAGE
          ============================================================ */}

          <div
            className={`
              relative
              z-10

              ${compact ? (open ? "p-2.5" : "p-2") : "p-3"}
            `}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={
                open
                  ? "Close quick product options"
                  : "Open quick product options"
              }
              onPointerDown={onPreviewPointerDown}
              onPointerMove={onPreviewPointerMove}
              onPointerUp={finishPreviewSwipe}
              onPointerCancel={cancelPreviewSwipe}
              onClick={handlePreviewClick}
              className={`
                group/preview
                relative
                block
                w-full
                touch-pan-y
                select-none
                overflow-hidden
                border
                border-white/10
                bg-white/5
                text-left
                focus-visible:outline-none
                focus-visible:ring-1
                focus-visible:ring-white

                ${
                  compact
                    ? open
                      ? `
                        h-[66px]
                        rounded-[14px]
                      `
                      : `
                        h-[92px]
                        rounded-[14px]
                      `
                    : open
                      ? `
                        h-[104px]
                        rounded-[20px]
                      `
                      : `
                        h-[116px]
                        rounded-[20px]
                      `
                }
              `}
            >
              <div
                className="
    absolute
    inset-0

    overflow-hidden
  "
              >
                <div
                  ref={previewTrackRef}
                  style={{
                    transform: "translate3d(-100%, 0, 0)",
                  }}
                  className="
      absolute
      inset-0

      flex

      [backface-visibility:hidden]
    "
                >
                  {[
                    previousPreviewImage,
                    currentPreviewImage,
                    nextPreviewImage,
                  ].map((image, slideIndex) => (
                    <div
                      key={`${image.id}-${slideIndex}`}
                      className="
            relative

            h-full
            min-w-full

            shrink-0

            overflow-hidden
          "
                    >
                      <Image
                        src={image.src}
                        alt={image.alt ?? product.title}
                        fill
                        loading="lazy"
                        sizes={compact ? "110px" : "220px"}
                        draggable={false}
                        style={{
                          objectPosition: image.position ?? "center",
                        }}
                        className="
              pointer-events-none

              object-cover
            "
                      />

                      <div
                        aria-hidden="true"
                        className="
              absolute
              inset-0

              bg-[linear-gradient(180deg,transparent_56%,rgba(0,0,0,0.18)_100%)]
            "
                      />
                    </div>
                  ))}
                </div>
              </div>
            </button>

            {/* MOBILE CLOSED: ONLY IMAGE + HINT */}

            {compact && !open && (
              <button
                type="button"
                aria-expanded={false}
                aria-controls={panelId}
                onClick={() => setLockedOpen(true)}
                className="
                    mt-2
                    block
                    w-full
                    text-center
                    text-[5px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-white/56
                    transition-colors
                    active:text-white
                    focus-visible:outline-none
                    focus-visible:text-white
                  "
              >
                Tap to more
              </button>
            )}

            {/* DESKTOP CLOSED + BOTH OPEN STATES */}

            {(!compact || open) && (
              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  gap-2
                "
              >
                <span
                  className="
                    text-[5.5px]
                    font-semibold
                    tabular-nums
                    tracking-[0.12em]
                    text-white/48
                  "
                >
                  {String(activeImageIndex + 1).padStart(2, "0")}

                  <span
                    className="
                      mx-1
                      text-white/20
                    "
                  >
                    /
                  </span>

                  {String(productImages.length).padStart(2, "0")}
                </span>

                <div
                  className="
                    flex
                    items-center
                  "
                >
                <GlassIconButton
  label="Previous image"
  disabled={
    !canCycleImages
  }
  onClick={() =>
    animatePreviewSlide(
      -1,
    )
  }
  compact={
    compact
  }
>
  <ArrowLeftIcon />
</GlassIconButton>

                 <GlassIconButton
  label="Next image"
  disabled={
    !canCycleImages
  }
  onClick={() =>
    animatePreviewSlide(
      1,
    )
  }
  compact={
    compact
  }
>
  <ArrowRightSmallIcon />
</GlassIconButton>

                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    aria-label={
                      open ? "Close quick options" : "Open quick options"
                    }
                    onClick={pinOrTogglePanel}
                    className={`
                      grid
                      place-items-center
                      text-white/48
                      transition-[background-color,color]
                      hover:bg-white/10
                      hover:text-white
                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-white

                      ${compact ? "size-6" : "size-7"}
                    `}
                  >
                    <ChevronQuickIcon open={open} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===========================================================
              EXPANDED SHOPPING CONTROLS
          ============================================================ */}

          <div
            id={panelId}
            aria-hidden={!open}
            className={`
              border-t
              border-white/10
              transition-[opacity,transform]
              duration-300
              ease-[cubic-bezier(0.22,1,0.36,1)]
              motion-reduce:transition-none

              ${
                compact
                  ? `
                    px-2.5
                    pb-2.5
                    pt-2
                  `
                  : `
                    px-3
                    pb-3
                    pt-2.5
                  `
              }

              ${
                open
                  ? `
                    translate-y-0
                    opacity-100
                  `
                  : `
                    pointer-events-none
                    translate-y-2
                    opacity-0
                  `
              }
            `}
          >
            {/* COLOR */}

            {colors.length > 0 && (
              <GlassOptionRail label="Color" compact={compact}>
                {colors.map((color, colorIndex) => {
                  const active = selectedColorId === color.id;

                  return (
                    <button
                      key={color.id}
                      type="button"
                      tabIndex={hiddenTabIndex}
                      aria-label={`Select ${color.label}`}
                      aria-pressed={active}
                      onClick={(event) => {
                        selectColor(color.id, colorIndex);

                        centerRailOption(event.currentTarget);
                      }}
                      className={`
                          relative
                          grid
                          shrink-0
                          snap-center
                          place-items-center
                          border
                          transition-[border-color,opacity,transform]
                          duration-200

                          ${compact ? "size-6" : "size-7"}

                          ${
                            active
                              ? `
                                border-white
                                opacity-100
                              `
                              : `
                                border-white/18
                                opacity-50
                                hover:scale-[1.03]
                                hover:border-white/45
                                hover:opacity-100
                              `
                          }
                        `}
                    >
                      <span
                        style={{
                          background: color.value,
                        }}
                        className={`block ${compact ? "size-3.5" : "size-4"}`}
                      />

                      {active && (
                        <span
                          className="
                              absolute
                              -bottom-[4px]
                              left-1/2
                              h-px
                              w-3
                              -translate-x-1/2
                              bg-[var(--shop-copper)]
                            "
                        />
                      )}
                    </button>
                  );
                })}
              </GlassOptionRail>
            )}

            {/* SIZE */}

            {product.sizes && product.sizes.length > 0 && (
              <div className={colors.length > 0 ? "mt-2" : ""}>
                <GlassOptionRail label="Size" compact={compact}>
                  {product.sizes.map((size) => {
                    const active = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        tabIndex={hiddenTabIndex}
                        aria-label={`Select size ${size}`}
                        aria-pressed={active}
                        onClick={(event) => {
                          setSelectedSize(size);

                          centerRailOption(event.currentTarget);
                        }}
                        className={`
                              shrink-0
                              snap-center
                              border
                              px-2
                              font-semibold
                              transition-[background-color,border-color,color]
                              duration-150

                              ${
                                compact
                                  ? `
                                    min-h-6
                                    text-[5px]
                                  `
                                  : `
                                    min-h-7
                                    text-[6px]
                                  `
                              }

                              ${
                                active
                                  ? `
                                    border-white
                                    bg-white
                                    text-black
                                  `
                                  : `
                                    border-white/14
                                    text-white/48
                                    hover:border-white/42
                                    hover:text-white
                                  `
                              }
                            `}
                      >
                        {size}
                      </button>
                    );
                  })}
                </GlassOptionRail>
              </div>
            )}

            {/* CTA */}

            <div
              className="
                mt-2.5
              "
            >
              <Button
                type="button"
                variant="cream"
                size="sm"
                fullWidth
                loading={cartState === "adding"}
                disabled={cartState !== "idle"}
                onClick={addToBag}
              >
                {cartState === "added" ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                    "
                  >
                    <AddedCheckIcon />
                    Added
                  </span>
                ) : (
                  "Add to Bag"
                )}
              </Button>

              <span className="sr-only" aria-live="polite">
                {cartState === "adding"
                  ? "Adding item to bag"
                  : cartState === "added"
                    ? "Item added to bag"
                    : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===============================================================
          PRODUCT META
      ================================================================ */}

      <Link
        href={product.href}
        aria-label={`View ${product.title} details`}
        className={`block bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black ${
          compact ? "p-3" : "px-4 py-4"
        }`}
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <div
            className="
              min-w-0
              flex-1
            "
          >
            <h2
              className={`font-semibold uppercase leading-[1.35] tracking-[0.055em] text-black ${
                compact ? "line-clamp-2 text-[8px]" : "truncate text-[10px]"
              }`}
            >
              {product.title}
            </h2>

            {product.subtitle && (
              <p
                className={`mt-1 truncate font-medium uppercase tracking-[0.07em] text-black/38 ${
                  compact ? "text-[6px]" : "text-[7.5px]"
                }`}
              >
                {product.subtitle}
              </p>
            )}
          </div>

          <span
            className={`shrink-0 font-semibold tabular-nums text-black ${
              compact ? "text-[8px]" : "text-[10px]"
            }`}
          >
            {money(product.price)}
          </span>
        </div>

        {!compact && colors.length > 1 && (
          <div
            className="
                mt-3
                flex
                items-center
                gap-1.5
              "
          >
            {colors.slice(0, 5).map((color) => (
              <span
                key={color.id}
                aria-label={color.label}
                className="
                        block
                        size-2.5
                        border
                        border-black/15
                      "
                style={{
                  background: color.value,
                }}
              />
            ))}

            {colors.length > 5 && (
              <span
                className="
                    text-[6px]
                    font-semibold
                    text-black/30
                  "
              >
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}
      </Link>
    </article>
  );
}

/* ==========================================================================
   GLASS PANEL ICON BUTTON
============================================================================ */

function GlassIconButton({
  label,
  disabled,
  onClick,
  compact,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  compact: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`
        grid
        place-items-center
        text-white/42
        transition-[background-color,color]
        hover:bg-white/10
        hover:text-white
        focus-visible:outline-none
        focus-visible:ring-1
        focus-visible:ring-white
        disabled:pointer-events-none
        disabled:opacity-15

        ${compact ? "size-6" : "size-7"}
      `}
    >
      {children}
    </button>
  );
}

/* ==========================================================================
   INTELLIGENT COLOR / SIZE RAIL

   - Detects real overflow instead of guessing from item count
   - Fades only the edge that actually contains more content
   - Arrow state mirrors current scroll position
   - Native horizontal scrolling remains available
   - Selected items can be centered by ProductCard
============================================================================ */

function GlassOptionRail({
  label,
  compact,
  children,
}: {
  label: string;
  compact: boolean;
  children: ReactNode;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const [canScrollPrevious, setCanScrollPrevious] = useState(false);

  const [canScrollNext, setCanScrollNext] = useState(false);

  const [hasOverflow, setHasOverflow] = useState(false);

  const measureRail = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const overflow = rail.scrollWidth > rail.clientWidth + 2;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);

    setHasOverflow(overflow);

    setCanScrollPrevious(overflow && rail.scrollLeft > 2);

    setCanScrollNext(overflow && rail.scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    let frame: number | null = null;

    const onScroll = () => {
      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;
        measureRail();
      });
    };

    const resizeObserver = new ResizeObserver(measureRail);

    resizeObserver.observe(rail);

    rail.addEventListener("scroll", onScroll, {
      passive: true,
    });

    measureRail();

    return () => {
      resizeObserver.disconnect();

      rail.removeEventListener("scroll", onScroll);

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [measureRail]);

  function scrollRail(direction: -1 | 1) {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const distance = Math.max(compact ? 74 : 96, rail.clientWidth * 0.72);

    rail.scrollBy({
      left: direction * distance,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <div
      className="
        flex
        min-w-0
        items-center
        gap-1.5
      "
    >
      <span
        className={`w-[34px] shrink-0 font-semibold uppercase tracking-[0.14em] text-white/36 ${
          compact ? "text-[4.5px]" : "text-[5px]"
        }`}
      >
        {label}
      </span>

      {hasOverflow && (
        <RailArrowButton
          label={`Previous ${label.toLowerCase()} options`}
          onClick={() => scrollRail(-1)}
          compact={compact}
          disabled={!canScrollPrevious}
        >
          <ArrowLeftIcon />
        </RailArrowButton>
      )}

      <div
        className="
          relative
          min-w-0
          flex-1
          overflow-hidden
        "
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute
            inset-y-0
            left-0
            z-10
            w-6
            bg-gradient-to-r
            from-black/76
            via-black/38
            to-transparent
            transition-opacity
            duration-200

            ${canScrollPrevious ? "opacity-100" : "opacity-0"}
          `}
        />

        <span
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute
            inset-y-0
            right-0
            z-10
            w-6
            bg-gradient-to-l
            from-black/76
            via-black/38
            to-transparent
            transition-opacity
            duration-200

            ${canScrollNext ? "opacity-100" : "opacity-0"}
          `}
        />

        <div
          ref={railRef}
          data-glass-option-rail
          data-lenis-prevent
          className="
            flex
            min-w-0
            snap-x
            snap-proximity
            items-center
            gap-1.5
            overflow-x-auto
            overscroll-x-contain
            px-0.5
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {children}
        </div>
      </div>

      {hasOverflow && (
        <RailArrowButton
          label={`Next ${label.toLowerCase()} options`}
          onClick={() => scrollRail(1)}
          compact={compact}
          disabled={!canScrollNext}
        >
          <ArrowRightSmallIcon />
        </RailArrowButton>
      )}
    </div>
  );
}

function RailArrowButton({
  label,
  onClick,
  compact,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  compact: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`
        grid
        shrink-0
        place-items-center
        border
        border-white/10
        text-white/42
        transition-[border-color,background-color,color,opacity]
        hover:border-white/24
        hover:bg-white/10
        hover:text-white
        focus-visible:outline-none
        focus-visible:ring-1
        focus-visible:ring-white
        disabled:pointer-events-none
        disabled:opacity-20

        ${compact ? "size-6" : "size-7"}
      `}
    >
      {children}
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
      className="
        size-[15px]
      "
    >
      <path
        d="M10 16.3L4 10.7C1.2 8.1 2.7 4 6.3 4C8 4 9.2 4.9 10 6C10.8 4.9 12 4 13.7 4C17.3 4 18.8 8.1 16 10.7L10 16.3Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function AddedCheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="
        size-3
      "
    >
      <path
        d="M3 8.2L6.4 11.2L13 4.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function InterstitialBanner({ banner }: { banner: ShopBanner }) {
  const isDark = banner.theme === "dark";

  return (
    <section className="group relative overflow-hidden">
      <div className="relative aspect-[21/8] min-h-[320px] overflow-hidden xl:min-h-[380px]">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          sizes="(max-width: 1920px) 100vw, 1610px"
          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
          style={{ objectPosition: banner.imagePosition ?? "center" }}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-r from-black/78 via-black/42 to-black/8"
              : "bg-gradient-to-r from-white/88 via-white/54 to-white/10"
          }`}
        />

        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[570px] px-10 xl:px-14">
            {banner.badge && (
              <div className="mb-5 flex items-center gap-3 text-[6px] font-semibold uppercase tracking-[0.2em] text-[var(--shop-copper)]">
                <span className="h-px w-6 bg-[var(--shop-copper)]" />
                {banner.badge}
              </div>
            )}

            <p
              className={`text-[8px] font-semibold uppercase tracking-[0.19em] ${
                isDark ? "text-white/48" : "text-black/40"
              }`}
            >
              {banner.subtitle}
            </p>

            <h3
              className={`mt-3 font-serif text-[38px] font-normal leading-[1.04] tracking-[-0.025em] xl:text-[46px] ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {banner.title.split("\n").map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < banner.title.split("\n").length - 1 && <br />}
                </span>
              ))}
            </h3>

            <p
              className={`mt-4 max-w-[390px] text-[10px] leading-[1.8] xl:text-[11px] ${
                isDark ? "text-white/54" : "text-black/48"
              }`}
            >
              {banner.description}
            </p>

            <div className="mt-7">
              <Button
                href={banner.ctaHref}
                variant={isDark ? "cream" : "cream"}
                size="md"
              >
                {banner.ctaText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InterstitialBannerMobile({ banner }: { banner: ShopBanner }) {
  const isDark = banner.theme === "dark";

  return (
    <section className="relative overflow-hidden">
      <div className="relative aspect-[4/5] min-h-[420px] overflow-hidden sm:aspect-[3/4] sm:min-h-[480px]">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: banner.imagePosition ?? "center" }}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-t from-black/82 via-black/28 to-black/8"
              : "bg-gradient-to-t from-white/90 via-white/38 to-white/12"
          }`}
        />

        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-6 pb-8 sm:p-8 sm:pb-10">
            {banner.badge && (
              <div className="mb-4 flex items-center gap-2 text-[6px] font-semibold uppercase tracking-[0.18em] text-[var(--shop-copper)]">
                <span className="h-px w-5 bg-[var(--shop-copper)]" />
                {banner.badge}
              </div>
            )}

            <p
              className={`text-[7px] font-semibold uppercase tracking-[0.17em] ${
                isDark ? "text-white/44" : "text-black/36"
              }`}
            >
              {banner.subtitle}
            </p>

            <h3
              className={`mt-2 font-serif text-[30px] font-normal leading-[1.06] tracking-[-0.02em] sm:text-[36px] ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {banner.title.split("\n").map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < banner.title.split("\n").length - 1 && <br />}
                </span>
              ))}
            </h3>

            <p
              className={`mt-3 max-w-[310px] text-[9px] leading-[1.75] sm:text-[10px] ${
                isDark ? "text-white/50" : "text-black/44"
              }`}
            >
              {banner.description}
            </p>

            <div className="mt-5">
              <Button
                href={banner.ctaHref}
                variant={isDark ? "cream" : "cream"}
                size="md"
              >
                {banner.ctaText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type MobileFiltersProps = {
  open: boolean;
  onClose: () => void;
  category: ProductCategory;
  setCategory: (value: ProductCategory) => void;
  sort: SortOption;
  setSort: (value: SortOption) => void;
  selectedSizes: string[];
  setSelectedSizes: (value: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (value: string[]) => void;
  selectedMaterials: string[];
  setSelectedMaterials: (value: string[]) => void;
  maxPrice: number;
  setMaxPrice: (value: number) => void;
  resetFilters: () => void;
  resultCount: number;
};

function MobileFilters({
  open,
  onClose,
  category,
  setCategory,
  sort,
  setSort,
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  selectedMaterials,
  setSelectedMaterials,
  maxPrice,
  setMaxPrice,
  resetFilters,
  resultCount,
}: MobileFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !open) return;

    const stopPropagation = (event: Event) => {
      event.stopPropagation();
    };

    element.addEventListener("wheel", stopPropagation, { passive: false });
    element.addEventListener("touchstart", stopPropagation, { passive: true });
    element.addEventListener("touchmove", stopPropagation, { passive: false });

    return () => {
      element.removeEventListener("wheel", stopPropagation);
      element.removeEventListener("touchstart", stopPropagation);
      element.removeEventListener("touchmove", stopPropagation);
    };
  }, [open]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[1199] bg-black/60 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!open}
        className={`fixed inset-0 z-[1200] flex flex-col bg-[#0B0B0B] text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden motion-reduce:transition-none ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex h-16 flex-none items-center justify-between border-b border-white/10 px-5">
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="grid size-10 place-items-center text-white transition-opacity hover:opacity-65"
          >
            <CloseIcon />
          </button>

          <span className="text-[9px] font-semibold uppercase tracking-[0.21em]">
            Filter & Sort
          </span>

          <button
            type="button"
            onClick={resetFilters}
            className="text-[7px] font-semibold uppercase tracking-[0.14em] text-white/42 transition-colors hover:text-white"
          >
            Clear
          </button>
        </div>

        <div
          ref={scrollRef}
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <MobileFilterBlock title="Category" defaultOpen>
            <div className="grid grid-cols-2 gap-2 pt-3">
              {CATEGORIES.map((item) => {
                const active = category === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value)}
                    className={`relative min-h-11 border px-3 text-[7px] font-semibold uppercase tracking-[0.08em] transition-[border-color,color,background-color] ${
                      active
                        ? "border-white bg-white text-black"
                        : "border-white/12 text-white/46 hover:border-white/28 hover:text-white/80"
                    }`}
                  >
                    {item.label}

                    {active && (
                      <span className="absolute bottom-0 left-0 h-px w-5 bg-[var(--shop-copper)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </MobileFilterBlock>

          <MobileFilterBlock title="Size">
            <SizeSelector
              values={selectedSizes}
              onChange={setSelectedSizes}
              dark
            />
          </MobileFilterBlock>

          <MobileFilterBlock title="Color" defaultOpen>
            <ColorSelector
              values={selectedColors}
              onChange={setSelectedColors}
              dark
            />
          </MobileFilterBlock>

          <MobileFilterBlock title="Material">
            <MaterialSelector
              values={selectedMaterials}
              onChange={setSelectedMaterials}
              dark
            />
          </MobileFilterBlock>

          <MobileFilterBlock title="Price" defaultOpen>
            <PriceSelector value={maxPrice} onChange={setMaxPrice} dark />
          </MobileFilterBlock>

          <div className="flex min-h-[66px] items-center justify-between border-b border-white/10">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/60">
              Sort By
            </span>

            <SortSelect value={sort} onChange={setSort} dark />
          </div>
        </div>

        <div className="flex-none border-t border-white/10 bg-[#0B0B0B] p-4">
          <Button
            type="button"
            variant="cream"
            size="lg"
            fullWidth
            onClick={onClose}
          >
            View {resultCount} {resultCount === 1 ? "Item" : "Items"}
          </Button>
        </div>
      </aside>
    </>
  );
}

function DesktopAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[var(--shop-border)] py-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-7 w-full items-center justify-between text-left"
      >
        <span className="text-[8px] font-semibold uppercase tracking-[0.14em]">
          {title}
        </span>

        <span
          className={`text-[12px] text-black/40 transition-transform duration-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MobileFilterBlock({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 py-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/66">
          {title}
        </span>

        <span
          className={`text-[14px] font-light text-white/40 transition-transform duration-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SizeSelector({
  values,
  onChange,
  dark = false,
}: {
  values: string[];
  onChange: (value: string[]) => void;
  dark?: boolean;
}) {
  function toggle(value: string) {
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {SIZE_OPTIONS.map((size) => {
        const selected = values.includes(size);

        return (
          <button
            key={size}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(size)}
            className={`min-h-9 border text-[8px] font-semibold transition-[background-color,border-color,color] ${
              dark
                ? selected
                  ? "border-white bg-white text-black"
                  : "border-white/12 text-white/48 hover:border-white/35 hover:text-white"
                : selected
                  ? "border-black bg-black text-white"
                  : "border-black/12 text-black/52 hover:border-black/38 hover:text-black"
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

function ColorSelector({
  values,
  onChange,
  dark = false,
}: {
  values: string[];
  onChange: (value: string[]) => void;
  dark?: boolean;
}) {
  function toggle(value: string) {
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {COLOR_OPTIONS.map((color) => {
        const selected = values.includes(color.id);

        return (
          <button
            key={color.id}
            type="button"
            aria-label={color.label}
            aria-pressed={selected}
            onClick={() => toggle(color.id)}
            className="group/color flex flex-col items-center gap-1.5"
          >
            <span
              className={`relative grid size-8 place-items-center border transition-[border-color,opacity] ${
                selected
                  ? dark
                    ? "border-white"
                    : "border-black"
                  : dark
                    ? "border-white/14 group-hover/color:border-white/38"
                    : "border-black/12 group-hover/color:border-black/34"
              }`}
            >
              <span
                className="block size-5"
                style={{ background: color.value }}
              />

              {selected && (
                <span className="absolute -bottom-[4px] left-1/2 h-px w-4 -translate-x-1/2 bg-[var(--shop-copper)]" />
              )}
            </span>

            <span
              className={`text-[6px] uppercase tracking-[0.06em] ${
                dark
                  ? selected
                    ? "text-white"
                    : "text-white/34"
                  : selected
                    ? "text-black"
                    : "text-black/34"
              }`}
            >
              {color.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MaterialSelector({
  values,
  onChange,
  dark = false,
}: {
  values: string[];
  onChange: (value: string[]) => void;
  dark?: boolean;
}) {
  function toggle(value: string) {
    const normalized = value.toLowerCase();

    onChange(
      values.includes(normalized)
        ? values.filter((item) => item !== normalized)
        : [...values, normalized],
    );
  }

  return (
    <div className="space-y-1.5">
      {MATERIAL_OPTIONS.map((material) => {
        const selected = values.includes(material.toLowerCase());

        return (
          <button
            key={material}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(material)}
            className="flex min-h-8 w-full items-center gap-3 text-left"
          >
            <span
              className={`grid size-[16px] flex-none place-items-center border transition-colors ${
                dark ? "border-white/25" : "border-black/20"
              } ${selected ? (dark ? "bg-white" : "bg-black") : ""}`}
            >
              {selected && (
                <CheckIcon
                  className={`size-2.5 ${dark ? "text-black" : "text-white"}`}
                />
              )}
            </span>

            <span
              className={`text-[8px] font-medium uppercase tracking-[0.07em] ${
                dark
                  ? selected
                    ? "text-white"
                    : "text-white/48"
                  : selected
                    ? "text-black"
                    : "text-black/52"
              }`}
            >
              {material}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PriceSelector({
  value,
  onChange,
  dark = false,
}: {
  value: number;
  onChange: (value: number) => void;
  dark?: boolean;
}) {
  const percentage = ((value - 300) / (5000 - 300)) * 100;

  return (
    <div>
      <div className="flex justify-between text-[7px] font-semibold uppercase tracking-[0.08em]">
        <span className={dark ? "text-white/34" : "text-black/34"}>$0</span>
        <span className={dark ? "text-white/78" : "text-black/78"}>
          {money(value)}
        </span>
      </div>

      <div className="relative mt-4 h-6">
        <div
          className={`absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 ${
            dark ? "bg-white/12" : "bg-black/10"
          }`}
        />

        <div
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-[var(--shop-copper)]"
          style={{ width: `${percentage}%` }}
        />

        <input
          type="range"
          min={300}
          max={5000}
          step={100}
          value={value}
          aria-label="Maximum price"
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 border border-[var(--shop-copper)] bg-white"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SortSelect({
  value,
  onChange,
  dark,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
  dark: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        aria-label="Sort products"
        onChange={(event) => onChange(event.target.value as SortOption)}
        className={`cursor-pointer appearance-none bg-transparent py-2 pr-4 text-[8px] font-semibold uppercase tracking-[0.1em] outline-none ${
          dark ? "text-white/58" : "text-black/52"
        }`}
      >
        <option value="new-arrivals" className="bg-white text-black">
          New Arrivals
        </option>
        <option value="featured" className="bg-white text-black">
          Featured
        </option>
        <option value="price-low" className="bg-white text-black">
          Price: Low → High
        </option>
        <option value="price-high" className="bg-white text-black">
          Price: High → Low
        </option>
      </select>

      <ChevronDownIcon
        className={`pointer-events-none absolute right-0 top-1/2 size-3 -translate-y-1/2 ${
          dark ? "text-white/38" : "text-black/34"
        }`}
      />
    </div>
  );
}

function EmptyProducts({ resetFilters }: { resetFilters: () => void }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 grid size-14 place-items-center border border-black/8">
        <SearchIcon className="size-5 text-black/28" />
      </div>

      <p className="font-serif text-[34px] tracking-[-0.03em] text-black sm:text-[40px]">
        Nothing found
      </p>

      <p className="mt-3 max-w-[320px] text-[10px] leading-[1.7] text-black/44">
        Adjust your filters to discover more of the collection.
      </p>

      <div className="mt-7">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={resetFilters}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-4">
      <path d="M2 5H16M2 13H16" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="5" r="1.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="13" r="1.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-5">
      <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
      <path
        d="M10.5 3L5.5 8L10.5 13"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function ArrowRightSmallIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
      <path
        d="M5.5 3L10.5 8L5.5 13"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function ChevronQuickIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`size-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        open ? "rotate-180" : "rotate-0"
      }`}
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
