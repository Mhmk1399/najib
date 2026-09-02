 
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

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

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
  | { kind: "products"; items: { product: Product; index: number }[] }
  | { kind: "banner"; banner: ShopBanner };

type CartActionState = "idle" | "adding" | "added";
type ProductPanelSide = "left" | "right";

/* ────────────────────────────────────────────────────────────
   CONSTANTS
   ──────────────────────────────────────────────────────────── */

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
];

const SORT_MENU_OPTIONS: {
  value: SortOption;
  label: string;
  shortLabel: string;
}[] = [
  { value: "new-arrivals", label: "New Arrivals", shortLabel: "New Arrivals" },
  { value: "featured", label: "Featured", shortLabel: "Featured" },
  { value: "price-low", label: "Price: Low to High", shortLabel: "Price Low" },
  {
    value: "price-high",
    label: "Price: High to Low",
    shortLabel: "Price High",
  },
];

/* ────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────── */

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getColorMeta(colorId: string) {
  return (
    COLOR_OPTIONS.find((c) => c.id === colorId) ?? {
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
  let cur: { product: Product; index: number }[] = [];
  content.forEach((item) => {
    if (item.type === "product") {
      cur.push({ product: item.product, index: item.index });
      return;
    }
    if (cur.length > 0) {
      chunks.push({ kind: "products", items: [...cur] });
      cur = [];
    }
    chunks.push({ kind: "banner", banner: item.banner });
  });
  if (cur.length > 0) chunks.push({ kind: "products", items: cur });
  return chunks;
}

function stopLenis() {
  // @ts-expect-error Lenis may be attached globally.
  const l = window.__lenis ?? window.lenis;
  if (l && typeof l.stop === "function") l.stop();
}

function startLenis() {
  // @ts-expect-error Lenis may be attached globally.
  const l = window.__lenis ?? window.lenis;
  if (l && typeof l.start === "function") l.start();
}

/* ────────────────────────────────────────────────────────────
   SHOP PAGE
   ──────────────────────────────────────────────────────────── */

export function ShopPage() {
  const [category, setCategory] = useState<ProductCategory>("all");
  const [sort, setSort] = useState<SortOption>("new-arrivals");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);
  const [desktopFilterPinned, setDesktopFilterPinned] = useState(false);

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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    stopLenis();
    return () => {
      document.body.style.overflow = prev;
      startLenis();
    };
  }, [mobileFiltersOpen]);

  const products = useMemo(() => {
    let r = [...PRODUCTS];
    if (category === "new-arrivals") r = r.filter((p) => p.isNew);
    else if (category !== "all") r = r.filter((p) => p.category === category);
    if (selectedSizes.length)
      r = r.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length)
      r = r.filter((p) => p.colors?.some((c) => selectedColors.includes(c)));
    if (selectedMaterials.length)
      r = r.filter((p) =>
        p.materials?.some((m) => selectedMaterials.includes(m.toLowerCase())),
      );
    r = r.filter((p) => p.price <= maxPrice);
    if (sort === "price-low") r.sort((a, b) => a.price - b.price);
    if (sort === "price-high") r.sort((a, b) => b.price - a.price);
    if (sort === "new-arrivals")
      r.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return r;
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
      const ins = BANNER_INSERTION_POINTS.find(
        (p) => p.afterIndex === index + 1,
      );
      if (!ins) return;
      const banner = SHOP_BANNERS.find((b) => b.id === ins.bannerId);
      if (banner) items.push({ type: "banner", banner });
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

  const desktopFilterExpanded = desktopFilterOpen || desktopFilterPinned;

  return (
    <main
      style={themeVars}
      className="min-h-screen bg-[var(--shop-bg)] text-[var(--shop-text)]"
    >
      {/* Navbar spacer */}
      <div
        aria-hidden="true"
        className="h-[72px] bg-[var(--shop-black)] md:h-[76px]"
      />

      {/* Mobile page header */}
      <div className="border-b border-[var(--shop-border)] bg-[var(--shop-bg)] px-5 pb-4 pt-7 lg:hidden">
        <div className="flex flex-col items-center justify-center">
          <p className="text-[6px] font-semibold uppercase tracking-[0.2em] text-[var(--shop-copper)]">
            Najibzadeh Collection
          </p>
          <h1 className="mt-2 font-serif text-[32px] font-normal leading-none tracking-[0.06em]">
            SHOP
          </h1>
          <span className="mt-2 pb-1 text-[9px] font-medium tracking-[0.08em] text-black/42">
            {products.length} {products.length === 1 ? "Item" : "Items"}
          </span>
        </div>
      </div>

      {/* Desktop */}
      <section className="relative mx-auto hidden min-h-[calc(100svh-76px)] max-w-[1920px] lg:block">
        <div className="w-full">
          <div className="px-8 pb-16 pt-8 xl:px-10">
            {/* Sticky command rail */}
            <div className="sticky top-[66px] z-[90] -mx-3 mb-6 px-3 py-2">
              <div className="relative flex min-h-[58px] items-center justify-between gap-4 border border-white/65 bg-transparent px-3 py-2 shadow-[0_14px_40px_-24px_rgba(11,11,11,0.34),inset_0_1px_0_rgba(255,255,255,0.82)] ring-1 ring-inset ring-black/[0.025]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.50) 0%, rgba(246,242,235,0.40) 52%, rgba(255,255,255,0.30) 100%)",
                    backdropFilter: "blur(24px) saturate(145%)",
                    WebkitBackdropFilter: "blur(24px) saturate(145%)",
                  }}
                />
                <div className="relative z-10 flex min-w-0 items-center gap-3">
                  <span className="shrink-0 pl-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--shop-black)]">
                    Shop All
                  </span>
                  <span aria-hidden="true" className="h-5 w-px bg-black/10" />
                  <DesktopFilterIsland
                    expanded={desktopFilterExpanded}
                    pinned={desktopFilterPinned}
                    onHoverOpen={() => setDesktopFilterOpen(true)}
                    onHoverClose={() => setDesktopFilterOpen(false)}
                    onTogglePin={() => setDesktopFilterPinned((v) => !v)}
                    category={category}
                    setCategory={setCategory}
                    selectedSizes={selectedSizes}
                    setSelectedSizes={setSelectedSizes}
                    selectedColors={selectedColors}
                    setSelectedColors={setSelectedColors}
                    selectedMaterials={selectedMaterials}
                    setSelectedMaterials={setSelectedMaterials}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    filterCount={filterCount}
                    resetFilters={resetFilters}
                  />
                </div>
                <div className="relative z-10">
                  <DesktopSortControl value={sort} onChange={setSort} />
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-black/8 to-transparent"
                />
              </div>
            </div>

            {products.length ? (
              <DesktopInterleavedGrid content={interleavedContent} />
            ) : (
              <EmptyProducts resetFilters={resetFilters} />
            )}
          </div>
        </div>
      </section>

      {/* Mobile sticky toolbar */}
      <div className="sticky top-[72px] z-[90] border-y border-white/55 bg-transparent px-3 py-2 shadow-[0_12px_28px_-24px_rgba(11,11,11,0.42)] lg:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.54) 0%, rgba(246,242,235,0.42) 100%)",
            backdropFilter: "blur(22px) saturate(145%)",
            WebkitBackdropFilter: "blur(22px) saturate(145%)",
          }}
        />
        <div className="relative z-10 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="group/mobile-filter relative flex h-11 min-w-0 items-center justify-center gap-2 overflow-hidden border border-white/70 bg-white/32 px-3 text-black shadow-[0_8px_22px_-16px_rgba(11,11,11,0.32),inset_0_1px_0_rgba(255,255,255,0.80)] ring-1 ring-inset ring-black/[0.025] backdrop-blur-[18px] transition-[background-color,border-color,transform,box-shadow] duration-200 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
          >
            <span className="grid size-6 shrink-0 place-items-center bg-black/[0.055] text-black/70">
              <FilterIcon />
            </span>
            <span className="text-[7px] font-semibold uppercase tracking-[0.14em]">
              Filters
            </span>
            {filterCount > 0 && (
              <span className="grid size-[18px] shrink-0 place-items-center bg-[var(--shop-copper)] text-[7px] font-bold tabular-nums text-white">
                {filterCount}
              </span>
            )}
            <span className="absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 bg-[var(--shop-copper)] transition-transform duration-300 group-active/mobile-filter:scale-x-100" />
          </button>
          <GlassSortControl
            value={sort}
            onChange={setSort}
            compact
            align="right"
          />
        </div>
      </div>

      {/* Mobile grid */}
      <div className="pb-6 lg:hidden">
        {products.length ? (
          <MobileInterleavedGrid content={interleavedContent} />
        ) : (
          <EmptyProducts resetFilters={resetFilters} />
        )}
      </div>

      {/* Mobile filter drawer */}
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

/* ═══════════════════════════════════════════════════════════
   DESKTOP FILTER ISLAND
   ═══════════════════════════════════════════════════════════ */

function DesktopFilterIsland({
  expanded,
  pinned,
  onHoverOpen,
  onHoverClose,
  onTogglePin,
  category,
  setCategory,
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  selectedMaterials,
  setSelectedMaterials,
  maxPrice,
  setMaxPrice,
  filterCount,
  resetFilters,
}: {
  expanded: boolean;
  pinned: boolean;
  onHoverOpen: () => void;
  onHoverClose: () => void;
  onTogglePin: () => void;
  category: ProductCategory;
  setCategory: (v: ProductCategory) => void;
  selectedSizes: string[];
  setSelectedSizes: (v: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (v: string[]) => void;
  selectedMaterials: string[];
  setSelectedMaterials: (v: string[]) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  filterCount: number;
  resetFilters: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hoverOpenTimer = useRef<number | null>(null);
  const hoverCloseTimer = useRef<number | null>(null);
  const popoverId = useId();

  function clearOpen() {
    if (hoverOpenTimer.current !== null) {
      window.clearTimeout(hoverOpenTimer.current);
      hoverOpenTimer.current = null;
    }
  }
  function clearClose() {
    if (hoverCloseTimer.current !== null) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  }
  function scheduleOpen() {
    clearClose();
    if (expanded || hoverOpenTimer.current !== null) return;
    hoverOpenTimer.current = window.setTimeout(() => {
      onHoverOpen();
      hoverOpenTimer.current = null;
    }, 115);
  }
  function scheduleClose() {
    if (pinned) return;
    clearOpen();
    clearClose();
    hoverCloseTimer.current = window.setTimeout(() => {
      onHoverClose();
      hoverCloseTimer.current = null;
    }, 230);
  }
  function closeFilter() {
    clearOpen();
    clearClose();
    if (pinned) onTogglePin();
    onHoverClose();
  }
  function togglePinned() {
    clearOpen();
    clearClose();
    if (pinned) {
      onTogglePin();
      onHoverClose();
      return;
    }
    onHoverOpen();
    onTogglePin();
  }

  useEffect(() => {
    if (!pinned) return;
    function onPD(e: PointerEvent) {
      const r = rootRef.current;
      if (!r || r.contains(e.target as Node)) return;
      closeFilter();
    }
    function onKD(e: KeyboardEvent) {
      if (e.key === "Escape") closeFilter();
    }
    document.addEventListener("pointerdown", onPD);
    window.addEventListener("keydown", onKD);
    return () => {
      document.removeEventListener("pointerdown", onPD);
      window.removeEventListener("keydown", onKD);
    };
  }, [pinned]);

  useEffect(
    () => () => {
      clearOpen();
      clearClose();
    },
    [],
  );

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={popoverId}
        onClick={togglePinned}
        onFocus={scheduleOpen}
        className={`group/filter relative flex h-10 items-center gap-2.5 overflow-hidden border px-3.5 text-left shadow-[0_9px_24px_-18px_rgba(11,11,11,0.34),inset_0_1px_0_rgba(255,255,255,0.74)] ring-1 ring-inset ring-black/[0.025] backdrop-blur-[18px] backdrop-saturate-150 transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--shop-bg)] ${
          expanded
            ? "border-white/20 bg-black/72 text-white shadow-[0_14px_34px_-18px_rgba(11,11,11,0.58),inset_0_1px_0_rgba(255,255,255,0.15)]"
            : "border-white/70 bg-white/28 text-black hover:-translate-y-px hover:border-white/90 hover:bg-white/46 hover:shadow-[0_14px_30px_-18px_rgba(11,11,11,0.30),inset_0_1px_0_rgba(255,255,255,0.92)]"
        }`}
      >
        <span
          className={`grid size-6 shrink-0 place-items-center border transition-colors ${
            expanded
              ? "border-white/10 bg-white/10 text-white"
              : "border-white/55 bg-white/34 text-black/72"
          }`}
        >
          <FilterIcon />
        </span>
        <span className="text-[8px] font-semibold uppercase tracking-[0.14em]">
          Filters
        </span>
        {filterCount > 0 && (
          <span
            className={`grid size-[18px] shrink-0 place-items-center text-[7px] font-bold tabular-nums ${
              expanded
                ? "bg-[var(--shop-copper)] text-white"
                : "bg-black/88 text-white"
            }`}
          >
            {filterCount}
          </span>
        )}
        <span
          className={`ml-0.5 transition-[color,transform] duration-300 ${
            expanded ? "rotate-180 text-white/55" : "rotate-0 text-black/42"
          }`}
        >
          <ChevronDownIcon className="size-3" />
        </span>
        <span
          aria-hidden="true"
          className={`absolute inset-x-3 bottom-0 h-px origin-left bg-[var(--shop-copper)] transition-transform duration-300 ${
            expanded
              ? "scale-x-100"
              : "scale-x-0 group-hover/filter:scale-x-100"
          }`}
        />
      </button>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-5 top-[calc(100%_+_6px)] z-[59] size-3 rotate-45 border-l border-t border-white/65 bg-[rgba(248,245,239,0.92)] ${
          expanded ? "visible" : "invisible"
        }`}
      />

      <div
        id={popoverId}
        role="region"
        aria-label="Product filters"
        aria-hidden={!expanded}
        className={`absolute left-0 top-[calc(100%_+_11px)] z-[60] w-[342px] max-w-[calc(100vw_-_5rem)] origin-top-left ${
          expanded ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden border border-white/75 shadow-[0_34px_80px_-24px_rgba(11,11,11,0.40),inset_0_1px_0_rgba(255,255,255,0.94)] ring-1 ring-inset ring-black/[0.055] ${
            expanded ? "opacity-100" : "opacity-[0.001]"
          }`}
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(246,242,235,0.66) 58%, rgba(255,255,255,0.60) 100%)",
            backdropFilter: "blur(42px) saturate(145%)",
            WebkitBackdropFilter: "blur(42px) saturate(145%)",
            willChange: "opacity, backdrop-filter",
          }}
        />
        <div className={expanded ? "visible" : "invisible"}>
          <div className="relative z-10 flex items-start justify-between border-b border-black/[0.09] bg-white/16 px-5 pb-4 pt-[18px]">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center border border-white/10 bg-black/88 text-white shadow-[0_8px_20px_-14px_rgba(11,11,11,0.60)]">
                <FilterIcon />
              </span>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-black">
                  Filters
                </p>
                <p className="mt-1 text-[6.5px] font-medium uppercase tracking-[0.10em] text-black/38">
                  {filterCount > 0
                    ? `${filterCount} active ${filterCount === 1 ? "filter" : "filters"}`
                    : "Refine the collection"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetFilters}
                disabled={filterCount === 0}
                className="min-h-8 px-2 text-[7px] font-semibold uppercase tracking-[0.12em] text-[var(--shop-copper)] transition-opacity hover:opacity-65 disabled:pointer-events-none disabled:opacity-25"
              >
                Clear all
              </button>
              <button
                type="button"
                aria-label="Close filters"
                onClick={closeFilter}
                className="grid size-8 place-items-center border border-white/70 bg-white/35 text-black/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-xl transition-[background-color,color,transform] hover:bg-black/88 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <div
            data-lenis-prevent=""
            className="relative z-10 max-h-[min(640px,calc(100svh_-_190px))] overflow-y-auto overscroll-contain px-5 py-2 [scrollbar-color:rgb(11_11_11_/_0.18)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-black/15 [&::-webkit-scrollbar-track]:bg-transparent"
          >
            <IslandAccordion title="Category" defaultOpen>
              <div className="space-y-0.5">
                {CATEGORIES.map((item) => {
                  const active = category === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={`group/category flex min-h-[32px] w-full items-center justify-between border px-2.5 text-left backdrop-blur-sm transition-[background-color,border-color,color,transform] duration-200 ${
                        active
                          ? "border-black/80 bg-black/86 text-white shadow-[0_8px_18px_-14px_rgba(11,11,11,0.65)]"
                          : "border-transparent bg-white/10 text-black/52 hover:translate-x-0.5 hover:border-white/65 hover:bg-white/32 hover:text-black"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 text-[8px] font-semibold uppercase tracking-[0.08em]">
                        <span
                          className={`block size-1 transition-colors ${
                            active
                              ? "bg-[var(--shop-copper)]"
                              : "bg-black/16 group-hover/category:bg-black/35"
                          }`}
                        />
                        {item.label}
                      </span>
                      {active && (
                        <CheckIcon className="size-2.5 text-white/70" />
                      )}
                    </button>
                  );
                })}
              </div>
            </IslandAccordion>
            <IslandAccordion title="Size">
              <SizeSelector
                values={selectedSizes}
                onChange={setSelectedSizes}
              />
            </IslandAccordion>
            <IslandAccordion title="Color" defaultOpen>
              <ColorSelector
                values={selectedColors}
                onChange={setSelectedColors}
              />
            </IslandAccordion>
            <IslandAccordion title="Material">
              <MaterialSelector
                values={selectedMaterials}
                onChange={setSelectedMaterials}
              />
            </IslandAccordion>
            <IslandAccordion title="Price" defaultOpen>
              <PriceSelector value={maxPrice} onChange={setMaxPrice} />
            </IslandAccordion>
          </div>
          <div className="relative z-10 flex items-center justify-between border-t border-black/[0.09] bg-white/20 px-5 py-3">
            <div className="flex items-center gap-2">
              <span
                className={`size-1.5 ${
                  pinned ? "bg-[var(--shop-copper)]" : "bg-black/18"
                }`}
              />
              <span className="text-[6.5px] font-semibold uppercase tracking-[0.11em] text-black/36">
                {pinned ? "Pinned open" : "Hover preview"}
              </span>
            </div>
            <span className="text-[6.5px] font-medium uppercase tracking-[0.1em] text-black/30">
              Click to {pinned ? "release" : "pin"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLASS SORT CONTROL
   ═══════════════════════════════════════════════════════════ */

function GlassSortControl({
  value,
  onChange,
  compact = false,
  dark = false,
  align = "right",
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
  compact?: boolean;
  dark?: boolean;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const current =
    SORT_MENU_OPTIONS.find((o) => o.value === value) ?? SORT_MENU_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    function onPD(e: PointerEvent) {
      const r = rootRef.current;
      if (!r || r.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKD(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPD);
    window.addEventListener("keydown", onKD);
    return () => {
      document.removeEventListener("pointerdown", onPD);
      window.removeEventListener("keydown", onKD);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`relative ${compact ? "min-w-0" : "min-w-[196px]"}`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`group/sort relative flex w-full items-center overflow-hidden border shadow-[0_9px_24px_-18px_rgba(11,11,11,0.34),inset_0_1px_0_rgba(255,255,255,0.74)] ring-1 ring-inset backdrop-blur-[18px] backdrop-saturate-150 transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 ${
          compact ? "h-11 gap-2 px-3" : "h-10 gap-3 px-3.5"
        } ${
          dark
            ? open
              ? "border-white/26 bg-white/16 text-white ring-white/[0.05] focus-visible:ring-white/25"
              : "border-white/16 bg-white/[0.08] text-white ring-white/[0.035] hover:border-white/28 hover:bg-white/[0.13] focus-visible:ring-white/20"
            : open
              ? "border-white/90 bg-white/50 text-black ring-black/[0.035] shadow-[0_14px_34px_-18px_rgba(11,11,11,0.32),inset_0_1px_0_rgba(255,255,255,0.95)] focus-visible:ring-black/15"
              : "border-white/70 bg-white/28 text-black ring-black/[0.025] hover:-translate-y-px hover:border-white/90 hover:bg-white/46 hover:shadow-[0_14px_30px_-18px_rgba(11,11,11,0.30),inset_0_1px_0_rgba(255,255,255,0.92)] focus-visible:ring-black/15"
        }`}
      >
        <span
          className={`grid size-6 shrink-0 place-items-center border ${
            dark
              ? "border-white/10 bg-white/[0.08] text-white/72"
              : "border-white/55 bg-white/34 text-black/68"
          }`}
        >
          <SortIcon />
        </span>
        <span className="min-w-0 flex-1 text-left">
          {!compact && (
            <span
              className={`block text-[5.5px] font-semibold uppercase tracking-[0.16em] ${
                dark ? "text-white/36" : "text-black/32"
              }`}
            >
              Sort by
            </span>
          )}
          <span
            className={`${compact ? "text-[7px]" : "mt-0.5 text-[7.5px]"} block truncate font-semibold uppercase tracking-[0.10em] ${
              dark ? "text-white/78" : "text-black/78"
            }`}
          >
            {compact ? current.shortLabel : current.label}
          </span>
        </span>
        <ChevronDownIcon
          className={`size-3 shrink-0 transition-transform duration-250 ${
            open ? "rotate-180" : "rotate-0"
          } ${dark ? "text-white/48" : "text-black/42"}`}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-x-3 bottom-0 h-px origin-left bg-[var(--shop-copper)] transition-transform duration-300 ${
            open ? "scale-x-100" : "scale-x-0 group-hover/sort:scale-x-100"
          }`}
        />
      </button>

      <div
        id={menuId}
        role="listbox"
        aria-label="Sort products"
        aria-hidden={!open}
        className={`absolute top-[calc(100%_+_8px)] z-[120] w-[228px] ${
          align === "right"
            ? "right-0 origin-top-right"
            : "left-0 origin-top-left"
        } ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden border shadow-[0_26px_62px_-22px_rgba(11,11,11,0.42),inset_0_1px_0_rgba(255,255,255,0.30)] ring-1 ring-inset ${
            dark
              ? "border-white/22 ring-white/[0.06]"
              : "border-white/82 ring-black/[0.055]"
          } ${open ? "opacity-100" : "opacity-[0.001]"}`}
          style={{
            background: dark
              ? "linear-gradient(145deg, rgba(19,19,19,0.76) 0%, rgba(6,6,6,0.72) 100%)"
              : "linear-gradient(145deg, rgba(255,255,255,0.74) 0%, rgba(246,242,235,0.68) 100%)",
            backdropFilter: "blur(42px) saturate(145%)",
            WebkitBackdropFilter: "blur(42px) saturate(145%)",
            willChange: "opacity, backdrop-filter",
          }}
        />
        <div
          className={`${open ? "visible" : "invisible"} relative z-10 ${
            dark ? "text-white" : "text-black"
          }`}
        >
          <div
            className={`border-b px-4 py-3 ${
              dark ? "border-white/10" : "border-black/[0.06]"
            }`}
          >
            <p
              className={`text-[6px] font-semibold uppercase tracking-[0.16em] ${
                dark ? "text-white/36" : "text-black/34"
              }`}
            >
              Sort collection
            </p>
          </div>
          <div className="p-1.5">
            {SORT_MENU_OPTIONS.map((opt) => {
              const sel = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`group/option flex min-h-10 w-full items-center justify-between border px-3 text-left transition-[background-color,border-color,color,transform] duration-180 ${
                    dark
                      ? sel
                        ? "border-white/18 bg-white/14 text-white"
                        : "border-transparent text-white/54 hover:translate-x-0.5 hover:border-white/10 hover:bg-white/[0.07] hover:text-white"
                      : sel
                        ? "border-black/80 bg-black/86 text-white"
                        : "border-transparent text-black/52 hover:translate-x-0.5 hover:border-white/70 hover:bg-white/34 hover:text-black"
                  }`}
                >
                  <span className="text-[7px] font-semibold uppercase tracking-[0.09em]">
                    {opt.label}
                  </span>
                  <span
                    className={`grid size-5 place-items-center border transition-colors ${
                      sel
                        ? "border-[var(--shop-copper)] bg-[var(--shop-copper)] text-white"
                        : dark
                          ? "border-white/10 text-transparent group-hover/option:border-white/24"
                          : "border-black/10 text-transparent group-hover/option:border-black/24"
                    }`}
                  >
                    <CheckIcon className="size-2.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopSortControl({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
}) {
  return <GlassSortControl value={value} onChange={onChange} align="right" />;
}

/* ═══════════════════════════════════════════════════════════
   ACCORDION
   ═══════════════════════════════════════════════════════════ */

function IslandAccordion({
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
    <div className="border-b border-black/8 py-3 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-7 w-full items-center justify-between text-left"
      >
        <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-black/80">
          {title}
        </span>
        <span
          className={`text-[13px] font-light text-black/40 transition-transform duration-300 ${
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
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP GRID
   ═══════════════════════════════════════════════════════════ */

function DesktopInterleavedGrid({ content }: { content: InterleavedItem[] }) {
  const chunks = useMemo(() => buildContentChunks(content), [content]);
  return (
    <div className="space-y-6">
      {chunks.map((chunk, ci) => {
        if (chunk.kind === "products") {
          return (
            <div
              key={`dp-${ci}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-1"
            >
              {chunk.items.map(({ product, index }, cardIndex) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  preload={index < 4}
                  panelSide={cardIndex % 2 === 0 ? "right" : "left"}
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

/* ═══════════════════════════════════════════════════════════
   MOBILE GRID (single-column, alternating panel side)
   ═══════════════════════════════════════════════════════════ */

function MobileInterleavedGrid({ content }: { content: InterleavedItem[] }) {
  const chunks = useMemo(() => buildContentChunks(content), [content]);
  return (
    <div>
      {chunks.map((chunk, ci) => {
        if (chunk.kind === "products") {
          return (
            <div
              key={`mp-${ci}`}
              className="grid grid-cols-1 gap-px bg-[var(--shop-border)]"
            >
              {chunk.items.map(({ product, index }, cardIndex) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  preload={index < 2}
                  compact
                  panelSide={cardIndex % 2 === 0 ? "right" : "left"}
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

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD — Optical Atelier Glass Object
   ═══════════════════════════════════════════════════════════ */

function ProductCard({
  product,
  preload = false,
  compact = false,
  panelSide = "right",
}: {
  product: Product;
  preload?: boolean;
  compact?: boolean;
  panelSide?: ProductPanelSide;
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
  const suppressClickUntilRef = useRef(0);

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
          id: `${product.id}-fb`,
          src: product.image,
          alt: product.imageAlt ?? product.title,
          position: product.imagePosition,
        },
      ];

  const colors = (product.colors ?? []).map(getColorMeta);

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selColorId, setSelColorId] = useState(colors[0]?.id ?? "");
  const [selSize, setSelSize] = useState("");
  const [hoverOpen, setHoverOpen] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [cartState, setCartState] = useState<CartActionState>("idle");
  const [panelHovered, setPanelHovered] = useState(false);

  const open = compact ? lockedOpen : hoverOpen || lockedOpen;
  const panelOnLeft = panelSide === "left";
  const activeImage = productImages[activeImgIdx] ?? productImages[0];
  const selectedColor = colors.find((c) => c.id === selColorId) ?? colors[0];
  const categoryLabel =
    CATEGORIES.find((c) => c.value === product.category)?.label ??
    String(product.category).replaceAll("-", " ");

  const prevIdx =
    (activeImgIdx - 1 + productImages.length) % productImages.length;
  const nextIdx = (activeImgIdx + 1) % productImages.length;
  const prevImage = productImages[prevIdx] ?? activeImage;
  const curPreviewImage = productImages[activeImgIdx] ?? activeImage;
  const nextImage = productImages[nextIdx] ?? activeImage;

  const canCycle = productImages.length > 1;
  const hiddenTab = open ? 0 : -1;
  const progressPct =
    productImages.length > 1
      ? ((activeImgIdx + 1) / productImages.length) * 100
      : 100;

  useLayoutEffect(() => {
    const track = previewTrackRef.current;
    if (!track) return;
    track.style.transition = "none";
    track.style.transform = "translate3d(-100%, 0, 0)";
    track.style.willChange = "";
    previewAnimatingRef.current = false;
  }, [activeImgIdx]);

  useEffect(
    () => () => {
      if (hoverOpenTimerRef.current !== null)
        window.clearTimeout(hoverOpenTimerRef.current);
      if (hoverCloseTimerRef.current !== null)
        window.clearTimeout(hoverCloseTimerRef.current);
      if (swipeFrameRef.current !== null)
        cancelAnimationFrame(swipeFrameRef.current);
      if (previewAnimationTimerRef.current !== null)
        window.clearTimeout(previewAnimationTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!lockedOpen) return;
    function onPD(e: PointerEvent) {
      const p = panelRef.current;
      if (!p || p.contains(e.target as Node)) return;
      setLockedOpen(false);
      if (!compact) setHoverOpen(false);
    }
    function onKD(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLockedOpen(false);
        setHoverOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPD);
    window.addEventListener("keydown", onKD);
    return () => {
      document.removeEventListener("pointerdown", onPD);
      window.removeEventListener("keydown", onKD);
    };
  }, [lockedOpen, compact]);

  function clearHoverOpen() {
    if (hoverOpenTimerRef.current !== null) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
  }
  function clearHoverClose() {
    if (hoverCloseTimerRef.current !== null) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }
  function scheduleHoverOpen() {
    if (
      compact ||
      lockedOpen ||
      performance.now() < hoverSuppressedUntilRef.current
    )
      return;
    clearHoverClose();
    clearHoverOpen();
    hoverOpenTimerRef.current = window.setTimeout(() => {
      setHoverOpen(true);
      hoverOpenTimerRef.current = null;
    }, 145);
  }
  function scheduleHoverClose() {
    if (compact || lockedOpen) return;
    clearHoverOpen();
    clearHoverClose();
    hoverCloseTimerRef.current = window.setTimeout(() => {
      setHoverOpen(false);
      hoverCloseTimerRef.current = null;
    }, 230);
  }
  function pinOrToggle() {
    clearHoverOpen();
    clearHoverClose();
    if (compact) {
      setLockedOpen((v) => !v);
      return;
    }
    if (lockedOpen) {
      setLockedOpen(false);
      setHoverOpen(false);
      hoverSuppressedUntilRef.current = performance.now() + 380;
      return;
    }
    setHoverOpen(false);
    setLockedOpen(true);
  }

  /* swipe helpers */
  function writeOffset(dx: number, anim = false) {
    const t = previewTrackRef.current;
    if (!t) return;
    const w = t.parentElement?.clientWidth ?? 1;
    const s = Math.max(-w * 0.96, Math.min(w * 0.96, dx));
    t.style.transition = anim
      ? "transform 320ms cubic-bezier(0.22,1,0.36,1)"
      : "none";
    t.style.transform = `translate3d(calc(-100% + ${s}px), 0, 0)`;
  }
  function scheduleOffset(dx: number) {
    pendingSwipeXRef.current = dx;
    if (swipeFrameRef.current !== null) return;
    swipeFrameRef.current = requestAnimationFrame(() => {
      swipeFrameRef.current = null;
      const p = pendingSwipeXRef.current;
      pendingSwipeXRef.current = null;
      if (p === null) return;
      writeOffset(p, false);
    });
  }
  function snapCenter() {
    const t = previewTrackRef.current;
    if (!t) return;
    t.style.transition = "transform 320ms cubic-bezier(0.22,1,0.36,1)";
    t.style.transform = "translate3d(-100%, 0, 0)";
  }
  function animateSlide(dir: -1 | 1) {
    if (!canCycle || previewAnimatingRef.current) return;
    const t = previewTrackRef.current;
    if (!t) return;
    previewAnimatingRef.current = true;
    if (previewAnimationTimerRef.current !== null)
      window.clearTimeout(previewAnimationTimerRef.current);
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.style.willChange = "transform";
    t.style.transition = rm
      ? "none"
      : "transform 320ms cubic-bezier(0.22,1,0.36,1)";
    t.style.transform =
      dir === 1 ? "translate3d(-200%, 0, 0)" : "translate3d(0%, 0, 0)";
    const commit = () => {
      if (!previewAnimatingRef.current) return;
      setActiveImgIdx(
        (c) => (c + dir + productImages.length) % productImages.length,
      );
    };
    if (rm) {
      requestAnimationFrame(commit);
      return;
    }
    previewAnimationTimerRef.current = window.setTimeout(() => {
      previewAnimationTimerRef.current = null;
      commit();
    }, 320);
  }
  function onPDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (previewAnimatingRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    swipeRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocityX: 0,
      moved: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const t = previewTrackRef.current;
    if (t) {
      t.style.transition = "none";
      t.style.willChange = "transform";
    }
  }
  function onPMove(e: ReactPointerEvent<HTMLButtonElement>) {
    const s = swipeRef.current;
    if (!s.active || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      e.preventDefault();
      s.moved = true;
    }
    if (!s.moved) return;
    const now = performance.now();
    const dt = Math.max(1, now - s.lastTime);
    s.velocityX = s.velocityX * 0.68 + ((e.clientX - s.lastX) / dt) * 0.32;
    s.lastX = e.clientX;
    s.lastTime = now;
    scheduleOffset(dx);
  }
  function onPUp(e: ReactPointerEvent<HTMLButtonElement>) {
    const s = swipeRef.current;
    if (!s.active || s.pointerId !== e.pointerId) return;
    s.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (swipeFrameRef.current !== null) {
      cancelAnimationFrame(swipeFrameRef.current);
      swipeFrameRef.current = null;
    }
    if (pendingSwipeXRef.current !== null) {
      writeOffset(pendingSwipeXRef.current, false);
      pendingSwipeXRef.current = null;
    }
    const dx = e.clientX - s.startX;
    const nav =
      canCycle &&
      s.moved &&
      (Math.abs(dx) > 34 || Math.abs(s.velocityX) > 0.48);
    if (s.moved) suppressClickUntilRef.current = performance.now() + 280;
    if (nav) {
      animateSlide(dx < 0 ? 1 : -1);
      return;
    }
    snapCenter();
    const t = previewTrackRef.current;
    if (t)
      window.setTimeout(() => {
        t.style.willChange = "";
      }, 340);
  }
  function onPCancel(e: ReactPointerEvent<HTMLButtonElement>) {
    swipeRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    snapCenter();
  }
  function handlePreviewClick() {
    if (performance.now() < suppressClickUntilRef.current) return;
    pinOrToggle();
  }
  function centerOption(el: HTMLElement) {
    const rail = el.closest(
      "[data-glass-option-rail]",
    ) as HTMLDivElement | null;
    if (!rail) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rr = rail.getBoundingClientRect();
    const or = el.getBoundingClientRect();
    const t =
      rail.scrollLeft +
      (or.left - rr.left) -
      (rail.clientWidth - or.width) / 2;
    rail.scrollTo({
      left: Math.max(0, t),
      behavior: rm ? "auto" : "smooth",
    });
  }
  function selectColor(cid: string, ci: number) {
    setSelColorId(cid);
    if (productImages[ci]) setActiveImgIdx(ci);
  }
  function toggleFav() {
    const n = !favorite;
    setFavorite(n);
    toast.info(n ? "Saved to wishlist" : "Removed from wishlist", {
      description: product.title,
    });
  }
  async function addToBag() {
    if (product.sizes?.length && !selSize) {
      setLockedOpen(true);
      toast.info("Select your size", {
        description: "Choose a size before adding this piece to your bag.",
      });
      return;
    }
    if (cartState !== "idle") return;
    setCartState("adding");
    try {
      await new Promise((r) => window.setTimeout(r, 520));
      setCartState("added");
      toast.success("Added to your bag", {
        description: [
          product.title,
          selectedColor?.label,
          selSize ? `Size ${selSize}` : undefined,
        ]
          .filter(Boolean)
          .join(" — "),
      });
      await new Promise((r) => window.setTimeout(r, 760));
      setCartState("idle");
      setLockedOpen(false);
      if (compact) setHoverOpen(false);
    } catch {
      setCartState("idle");
      toast.error("Unable to add item", {
        description: "Try adding the item again.",
      });
    }
  }

  /* Localized panel-side vignette */
  const vignetteGradient = panelOnLeft
    ? "radial-gradient(ellipse 70% 60% at 10% 85%, rgba(0,0,0,0.50) 0%, transparent 70%)"
    : "radial-gradient(ellipse 70% 60% at 90% 85%, rgba(0,0,0,0.50) 0%, transparent 70%)";

  const panelLifted = panelHovered && !open && !compact;

  return (
    <article
      className={`group/product relative isolate min-w-0 overflow-hidden bg-[#0B0B0B] [contain:paint] ${
        compact
          ? "aspect-[3/4]"
          : "aspect-[4/5] sm:aspect-[4/3] lg:aspect-[1.4/1]"
      }`}
    >
      {/* Main product image */}
      <Link
        href={product.href}
        aria-label={`View ${product.title}`}
        className="absolute inset-0 z-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      >
        <Image
          key={activeImage.src}
          src={activeImage.src}
          alt={activeImage.alt ?? product.imageAlt ?? product.title}
          fill
          preload={preload}
          sizes={compact ? "100vw" : "50vw"}
          draggable={false}
          style={{
            objectPosition:
              activeImage.position ?? product.imagePosition ?? "center",
          }}
          className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
        />
        {/* Bottom metadata gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.12)_62%,rgba(0,0,0,0.62)_100%)]"
        />
        {/* Localized panel-side vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: vignetteGradient }}
        />
      </Link>

      {/* Wishlist button */}
      <button
        type="button"
        aria-label={
          favorite
            ? `Remove ${product.title} from wishlist`
            : `Save ${product.title} to wishlist`
        }
        aria-pressed={favorite}
        onClick={toggleFav}
        className={`absolute z-30 grid place-items-center border border-white/20 bg-black/30 text-white backdrop-blur-md transition-[opacity,background-color,border-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
          open
            ? "pointer-events-none opacity-0"
            : compact
              ? "right-2.5 top-2.5 size-9 opacity-70 active:scale-95"
              : favorite
                ? "right-4 top-4 size-9 opacity-100"
                : "right-4 top-4 size-9 opacity-0 group-hover/product:opacity-70 hover:border-white/40 hover:bg-black/50 hover:opacity-100 focus-visible:opacity-100"
        }`}
      >
        <HeartIcon filled={favorite} />
      </button>

      {/* Product name + price (editorial composition) */}
      <div
        className={`pointer-events-none absolute z-10 transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        } ${
          compact
            ? panelOnLeft
              ? "bottom-5 left-[168px] right-4 text-right"
              : "bottom-5 left-4 right-[168px] text-left"
            : panelOnLeft
              ? "bottom-5 left-[230px] right-5 text-right md:bottom-6 md:left-[238px] md:right-6"
              : "bottom-5 left-5 right-[230px] text-left md:bottom-6 md:left-6 md:right-[238px]"
        }`}
      >
        <h2
          title={product.title}
          className={`font-semibold uppercase leading-tight text-white drop-shadow-md line-clamp-1 ${
            compact
              ? "text-[13px] tracking-[0.12em]"
              : "text-[12px] tracking-[0.15em] md:text-[12px]"
          }`}
        >
          {product.title}
        </h2>
        <div
          className={`mt-1.5 flex flex-col gap-1 ${
            panelOnLeft ? "items-end" : "items-start"
          }`}
        >
          <span
            className={`font-medium tabular-nums text-white/90 drop-shadow-sm ${
              compact ? "text-[12px]" : "text-[10px] md:text-[11px]"
            }`}
          >
            {money(product.price)}
          </span>
          <div
            className={`bg-[var(--shop-copper)] ${
              compact ? "mt-1 h-px w-4" : "mt-1.5 h-[1.5px] w-5"
            }`}
          />
        </div>
      </div>

      {/* ══════ OPTICAL ATELIER GLASS PANEL ══════ */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <div
          ref={panelRef}
          onMouseEnter={() => {
            setPanelHovered(true);
            scheduleHoverOpen();
          }}
          onMouseLeave={() => {
            setPanelHovered(false);
            scheduleHoverClose();
          }}
          onFocusCapture={() => {
            if (compact || lockedOpen) return;
            clearHoverOpen();
            clearHoverClose();
            setHoverOpen(true);
          }}
          onBlurCapture={(e) => {
            if (compact || lockedOpen) return;
            const nt = e.relatedTarget;
            if (!(nt instanceof Node) || !e.currentTarget.contains(nt))
              scheduleHoverClose();
          }}
          style={{
            /* ▸ Smoked glass body */
            background:
              "linear-gradient(145deg, rgba(14,14,14,0.62) 0%, rgba(8,8,8,0.74) 100%)",
            backdropFilter: "blur(22px) saturate(146%)",
            WebkitBackdropFilter: "blur(22px) saturate(146%)",
            /* ▸ Layered depth shadow */
            boxShadow: panelLifted || open
              ? "0 38px 92px -26px rgba(0,0,0,.94), 0 16px 36px -16px rgba(0,0,0,.84), inset 0 1px 0 rgba(255,255,255,.16)"
              : "0 36px 90px -26px rgba(0,0,0,.90), 0 14px 34px -16px rgba(0,0,0,.78), inset 0 1px 0 rgba(255,255,255,.12)",
            /* ▸ Structural 1px border, brighter on hover intent */
            border: panelLifted
              ? "1px solid rgba(255,255,255,0.20)"
              : "1px solid rgba(255,255,255,0.14)",
            /* ▸ Immediate hover feedback lift */
            transform: panelLifted ? "translateY(-2px)" : undefined,
          }}
          className={`pointer-events-auto absolute flex flex-col overflow-hidden text-white transform-gpu transition-[width,height,transform,box-shadow,border-color] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            panelOnLeft ? "origin-bottom-left" : "origin-bottom-right"
          } ${
            compact
              ? open
                ? panelOnLeft
                  ? "bottom-2 left-2 h-[min(420px,calc(100%_-_1rem))] w-[min(360px,calc(100%_-_1rem))]"
                  : "bottom-2 right-2 h-[min(420px,calc(100%_-_1rem))] w-[min(360px,calc(100%_-_1rem))]"
                : panelOnLeft
                  ? "bottom-3 left-3 h-[200px] max-h-[calc(100%_-_1.5rem)] w-[148px] max-w-[calc(100%_-_1.5rem)]"
                  : "bottom-3 right-3 h-[200px] max-h-[calc(100%_-_1.5rem)] w-[148px] max-w-[calc(100%_-_1.5rem)]"
              : open
                ? panelOnLeft
                  ? "bottom-5 left-4 h-[340px] max-h-[calc(100%_-_2rem)] w-[260px] max-w-[calc(100%_-_2rem)]"
                  : "bottom-5 right-4 h-[340px] max-h-[calc(100%_-_2rem)] w-[260px] max-w-[calc(100%_-_2rem)]"
                : panelOnLeft
                  ? "bottom-5 left-4 h-[228px] max-h-[calc(100%_-_2rem)] w-[206px] max-w-[calc(100%_-_2rem)]"
                  : "bottom-5 right-4 h-[228px] max-h-[calc(100%_-_2rem)] w-[206px] max-w-[calc(100%_-_2rem)]"
          }`}
        >
          {/* Optical edge highlights + copper locator */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
          >
            {/* Top-edge light catch (near anchor) */}
            <span
              className={`absolute top-0 h-px transition-[background-color,width] duration-200 ${
                panelOnLeft ? "left-0" : "right-0"
              } ${panelLifted ? "w-[42%] bg-white/60" : "w-[38%] bg-white/50"}`}
            />
            {/* Opposite darker edge */}
            <span
              className={`absolute top-0 h-px bg-black/30 ${
                panelOnLeft ? "right-0 w-[55%]" : "left-0 w-[55%]"
              }`}
            />
            {/* Copper locator — vertical + horizontal micro-line */}
            <span
              className={`absolute bottom-0 h-[28px] w-px bg-[var(--shop-copper)] ${
                panelOnLeft ? "left-0" : "right-0"
              }`}
            />
            <span
              className={`absolute bottom-0 h-px w-[18px] bg-[var(--shop-copper)] ${
                panelOnLeft ? "left-0" : "right-0"
              }`}
            />
            {/* Diagonal sheen */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_28%)]" />
          </div>

          {/* Preview image — hero of the panel */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={
              open
                ? "Close quick product options"
                : "Open quick product options"
            }
            onPointerDown={onPDown}
            onPointerMove={onPMove}
            onPointerUp={onPUp}
            onPointerCancel={onPCancel}
            onClick={handlePreviewClick}
            className={`group/preview relative z-10 block flex-none touch-pan-y select-none overflow-hidden border border-white/12 bg-black/20 text-left shadow-[0_12px_28px_-18px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.10)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white transition-[height,width,margin] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              compact
                ? open
                  ? "mx-2.5 mt-2.5 h-[180px] w-[calc(100%_-_1.25rem)]"
                  : "mx-2 mt-2 h-[120px] w-[calc(100%_-_1rem)]"
                : open
                  ? "mx-3 mt-3 h-[118px] w-[calc(100%_-_1.5rem)]"
                  : "mx-2 mt-2 h-[158px] w-[calc(100%_-_1rem)]"
            }`}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div
                ref={previewTrackRef}
                style={{ transform: "translate3d(-100%, 0, 0)" }}
                className="absolute inset-0 flex [backface-visibility:hidden]"
              >
                {[prevImage, curPreviewImage, nextImage].map((img, si) => (
                  <div
                    key={`${img.id}-${si}`}
                    className="relative h-full min-w-full shrink-0 overflow-hidden"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt ?? product.title}
                      fill
                      loading="lazy"
                      sizes={compact ? "(max-width:640px) 360px" : "260px"}
                      draggable={false}
                      style={{ objectPosition: img.position ?? "center" }}
                      className="pointer-events-none object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,rgba(0,0,0,0.24)_100%)]"
                    />
                  </div>
                ))}
              </div>
            </div>
            {!open && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10)_0%,transparent_42%)]"
              />
            )}
          </button>

          {/* CLOSED — MOBILE (Mini Lookbook Card) */}
          {compact && !open && (
            <button
              type="button"
              aria-label="Quick options"
              onClick={() => setLockedOpen(true)}
              className="relative z-10 flex min-h-0 flex-1 flex-col items-start justify-center gap-1 border-t border-white/8 px-3 text-left transition-colors active:bg-white/[0.04] focus-visible:outline-none focus-visible:bg-white/[0.04]"
            >
              <span className="text-[7px] font-semibold tabular-nums tracking-[0.12em] text-white/78">
                {String(activeImgIdx + 1).padStart(2, "0")}
                <span className="mx-1 text-white/20">/</span>
                {String(productImages.length).padStart(2, "0")}
              </span>
              <span className="max-w-full truncate text-[6.5px] font-semibold uppercase tracking-[0.14em] text-white/54">
                {categoryLabel}
              </span>
              <span className="text-[5.5px] font-semibold uppercase tracking-[0.16em] text-white/30">
                Quick options
              </span>
            </button>
          )}

          {/* CLOSED — DESKTOP */}
          {!compact && !open && (
            <div className="relative z-10 flex flex-1 items-center justify-between gap-3 px-3">
              <div className="min-w-0">
                <span className="block text-[6px] font-semibold tabular-nums tracking-[0.12em] text-white/68">
                  {String(activeImgIdx + 1).padStart(2, "0")}
                  <span className="mx-1 text-white/22">/</span>
                  {String(productImages.length).padStart(2, "0")}
                </span>
                <span className="mt-1 block max-w-[94px] truncate text-[5.5px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  {categoryLabel}
                </span>
              </div>
              <div className="flex items-center">
                <GlassIconButton
                  label="Previous image"
                  disabled={!canCycle}
                  onClick={() => animateSlide(-1)}
                  compact={false}
                >
                  <ArrowLeftIcon />
                </GlassIconButton>
                <GlassIconButton
                  label="Next image"
                  disabled={!canCycle}
                  onClick={() => animateSlide(1)}
                  compact={false}
                >
                  <ArrowRightSmallIcon />
                </GlassIconButton>
                <button
                  type="button"
                  aria-expanded={false}
                  aria-controls={panelId}
                  aria-label="Open quick product options"
                  onClick={pinOrToggle}
                  className="grid size-7 place-items-center text-white/50 transition-[background-color,color] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  <ChevronQuickIcon open={false} />
                </button>
              </div>
            </div>
          )}

          {/* OPEN — options and CTA */}
          <div
            id={panelId}
            aria-hidden={!open}
            className={`relative z-10 flex min-h-0  flex-1 flex-col transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              open
                ? "translate-y-0 opacity-100 delay-75"
                : "pointer-events-none translate-y-1 opacity-0"
            }`}
          >
            {/* Gallery progress rail */}
            <div
              className={`flex flex-none items-center gap-2.5 border-b border-white/8 ${
                compact ? "min-h-[40px] px-3" : "min-h-[34px] px-3"
              }`}
            >
              <span className="text-[6.5px] font-semibold tabular-nums tracking-[0.12em] text-white/58">
                {String(activeImgIdx + 1).padStart(2, "0")}
                <span className="mx-1 text-white/22">/</span>
                {String(productImages.length).padStart(2, "0")}
              </span>
              <div className="relative h-[1.5px] flex-1 bg-white/12">
                <div
                  className="absolute inset-y-0 left-0 bg-white/72 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center">
                <GlassIconButton
                  label="Previous image"
                  disabled={!canCycle}
                  onClick={() => animateSlide(-1)}
                  compact={compact}
                >
                  <ArrowLeftIcon />
                </GlassIconButton>
                <GlassIconButton
                  label="Next image"
                  disabled={!canCycle}
                  onClick={() => animateSlide(1)}
                  compact={compact}
                >
                  <ArrowRightSmallIcon />
                </GlassIconButton>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  aria-label="Close quick product options"
                  onClick={pinOrToggle}
                  className={`grid place-items-center text-white/50 transition-[background-color,color] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                    compact ? "size-[44px]" : "size-7"
                  }`}
                >
                  <ChevronQuickIcon open={open} />
                </button>
              </div>
            </div>

            {/* Color + Size */}
            <div
              className={`min-h-0 flex-1  ${
                compact ? "space-y-2 px-3 py-3.5" : "space-y-2.5 px-3 py-2.5"
              }`}
            >
              {colors.length > 0 && (
                <GlassOptionRail
                  label="Color"
                  compact={compact}
                  selectedLabel={selectedColor?.label}
                >
                  {colors.map((color, ci) => {
                    const active = selColorId === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        tabIndex={hiddenTab}
                        aria-label={`Select ${color.label}`}
                        aria-pressed={active}
                        onClick={(e) => {
                          selectColor(color.id, ci);
                          centerOption(e.currentTarget);
                        }}
                        className={`relative grid shrink-0 snap-center place-items-center border transition-[border-color,opacity,transform] duration-200 ${
                          compact ? "size-[34px]" : "size-7"
                        } ${
                          active
                            ? "border-white opacity-100"
                            : "border-white/14 opacity-50 hover:scale-[1.03] hover:border-white/40 hover:opacity-100"
                        }`}
                      >
                        <span
                          style={{ background: color.value }}
                          className={compact ? "block size-[20px]" : "block size-4"}
                        />
                        {active && (
                          <span className="absolute -bottom-[4px] left-1/2 h-[1.5px] w-3 -translate-x-1/2 bg-[var(--shop-copper)]" />
                        )}
                      </button>
                    );
                  })}
                </GlassOptionRail>
              )}
              {product.sizes && product.sizes.length > 0 && (
                <GlassOptionRail
                  label="Size"
                  compact={compact}
                  selectedLabel={selSize || undefined}
                >
                  {product.sizes.map((size) => {
                    const active = selSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        tabIndex={hiddenTab}
                        aria-label={`Select size ${size}`}
                        aria-pressed={active}
                        onClick={(e) => {
                          setSelSize(size);
                          centerOption(e.currentTarget);
                        }}
                        className={`shrink-0 snap-center border font-semibold transition-[background-color,border-color,color] duration-150 ${
                          compact
                            ? "min-h-[34px] min-w-[34px] px-3.5 text-[8px]"
                            : "min-h-7 px-2.5 text-[7px]"
                        } ${
                          active
                            ? "border-[var(--shop-copper)] bg-white/[0.08] text-white"
                            : "border-white/14 text-white/50 hover:border-white/42 hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </GlassOptionRail>
              )}
            </div>

            {/* CTA */}
            <div
              className={`flex-none border-t border-white/10 ${
                compact ? "p-3" : "p-3"
              }`}
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
                  <span className="inline-flex items-center gap-2">
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
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLASS ICON BUTTON
   ═══════════════════════════════════════════════════════════ */

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
      className={`grid place-items-center text-white/42 transition-[background-color,color] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-15 ${
        compact ? "size-[44px]" : "size-6"
      }`}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLASS OPTION RAIL (Color / Size)
   ═══════════════════════════════════════════════════════════ */

function GlassOptionRail({
  label,
  compact,
  children,
  selectedLabel,
}: {
  label: string;
  compact: boolean;
  children: ReactNode;
  selectedLabel?: string;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const measure = useCallback(() => {
    const r = railRef.current;
    if (!r) return;
    const ov = r.scrollWidth > r.clientWidth + 2;
    const max = Math.max(0, r.scrollWidth - r.clientWidth);
    setHasOverflow(ov);
    setCanPrev(ov && r.scrollLeft > 2);
    setCanNext(ov && r.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    const r = railRef.current;
    if (!r) return;
    let frame: number | null = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(r);
    r.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      ro.disconnect();
      r.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [measure]);

  function scroll(dir: -1 | 1) {
    const r = railRef.current;
    if (!r) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    r.scrollBy({
      left: dir * Math.max(compact ? 86 : 96, r.clientWidth * 0.72),
      behavior: rm ? "auto" : "smooth",
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {/* Heading row: label + selected value */}
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span
          className={`shrink-0 font-semibold uppercase tracking-[0.16em] text-white/44 ${
            compact ? "text-[6px]" : "text-[6px]"
          }`}
        >
          {label}
        </span>
        {selectedLabel && (
          <span
            className={`truncate font-semibold uppercase tracking-[0.10em] text-white/72 ${
              compact ? "text-[6.5px]" : "text-[6px]"
            }`}
          >
            {selectedLabel}
          </span>
        )}
      </div>

      {/* Rail row */}
      <div className="flex min-w-0 items-center gap-1.5">
        {hasOverflow && (
          <RailArrowButton
            label={`Previous ${label.toLowerCase()} options`}
            onClick={() => scroll(-1)}
            compact={compact}
            disabled={!canPrev}
          >
            <ArrowLeftIcon />
          </RailArrowButton>
        )}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-[rgba(14,14,14,0.92)] via-[rgba(14,14,14,0.42)] to-transparent transition-opacity duration-200 ${
              canPrev ? "opacity-100" : "opacity-0"
            }`}
          />
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-[rgba(14,14,14,0.92)] via-[rgba(14,14,14,0.42)] to-transparent transition-opacity duration-200 ${
              canNext ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            ref={railRef}
            data-glass-option-rail
            data-lenis-prevent
            className="flex min-w-0 snap-x snap-proximity items-center gap-1.5 overflow-x-auto overscroll-x-contain px-0.5 pb-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {children}
          </div>
        </div>
        {hasOverflow && (
          <RailArrowButton
            label={`Next ${label.toLowerCase()} options`}
            onClick={() => scroll(1)}
            compact={compact}
            disabled={!canNext}
          >
            <ArrowRightSmallIcon />
          </RailArrowButton>
        )}
      </div>
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
      className={`grid shrink-0 place-items-center border border-white/10 text-white/42 transition-[border-color,background-color,color,opacity] hover:border-white/24 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-20 ${
        compact ? "size-[36px]" : "size-5"
      }`}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOBILE FILTERS
   ═══════════════════════════════════════════════════════════ */

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
}: {
  open: boolean;
  onClose: () => void;
  category: ProductCategory;
  setCategory: (v: ProductCategory) => void;
  sort: SortOption;
  setSort: (v: SortOption) => void;
  selectedSizes: string[];
  setSelectedSizes: (v: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (v: string[]) => void;
  selectedMaterials: string[];
  setSelectedMaterials: (v: string[]) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  resetFilters: () => void;
  resultCount: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("wheel", stop, { passive: false });
    el.addEventListener("touchstart", stop, { passive: true });
    el.addEventListener("touchmove", stop, { passive: false });
    return () => {
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("touchmove", stop);
    };
  }, [open]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[1199] bg-black/28 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-hidden={!open}
        className={`fixed inset-x-2 bottom-2 top-[84px] z-[1200] flex flex-col lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden border border-white/18 shadow-[0_32px_90px_-24px_rgba(0,0,0,0.74),inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-inset ring-white/[0.04] ${
            open ? "opacity-100" : "opacity-[0.001]"
          }`}
          style={{
            background:
              "linear-gradient(155deg, rgba(24,24,24,0.78) 0%, rgba(7,7,7,0.73) 58%, rgba(16,16,16,0.70) 100%)",
            backdropFilter: "blur(38px) saturate(140%)",
            WebkitBackdropFilter: "blur(38px) saturate(140%)",
            willChange: "opacity, backdrop-filter",
          }}
        />
        <div
          className={`${open ? "visible" : "invisible"} relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden text-white`}
        >
          <div className="relative z-10 flex h-16 flex-none items-center justify-between border-b border-white/10 bg-white/[0.045] px-4">
            <button
              type="button"
              aria-label="Close filters"
              onClick={onClose}
              className="grid size-10 place-items-center border border-white/10 bg-white/[0.06] text-white/82 transition-[background-color,border-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              <CloseIcon />
            </button>
            <div className="text-center">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.21em]">
                Filters
              </span>
              <span className="mt-1 block text-[5.5px] font-semibold uppercase tracking-[0.12em] text-white/34">
                {resultCount} {resultCount === 1 ? "result" : "results"}
              </span>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-10 px-2 text-[7px] font-semibold uppercase tracking-[0.14em] text-[var(--shop-copper)] transition-opacity active:opacity-60"
            >
              Clear
            </button>
          </div>
          <div
            ref={scrollRef}
            data-lenis-prevent
            className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 [scrollbar-color:rgb(255_255_255_/_0.20)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/18 [&::-webkit-scrollbar-track]:bg-transparent"
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
                      className={`relative min-h-11 border px-3 text-[7px] font-semibold uppercase tracking-[0.08em] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md transition-[border-color,color,background-color,transform] active:scale-[0.985] ${
                        active
                          ? "border-white/76 bg-white/92 text-black"
                          : "border-white/10 bg-white/[0.045] text-white/52 hover:border-white/24 hover:bg-white/[0.08] hover:text-white/80"
                      }`}
                    >
                      {item.label}
                      {active && (
                        <span className="absolute bottom-1 left-1/2 h-px w-4 -translate-x-1/2 bg-[var(--shop-copper)]" />
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
            <div className="flex min-h-[82px] items-center justify-between gap-3 border-b border-white/7 py-3">
              <div>
                <span className="block text-[8px] font-semibold uppercase tracking-[0.15em] text-white/62">
                  Sort by
                </span>
                <span className="mt-1 block text-[5.5px] font-medium uppercase tracking-[0.1em] text-white/28">
                  Order the collection
                </span>
              </div>
              <div className="w-[168px] max-w-[58vw]">
                <GlassSortControl
                  value={sort}
                  onChange={setSort}
                  compact
                  dark
                  align="right"
                />
              </div>
            </div>
          </div>
          <div className="relative z-10 flex-none border-t border-white/10 bg-white/[0.045] p-3">
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
        </div>
      </aside>
    </>
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
    <div className="border-b border-white/5 py-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
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

/* ═══════════════════════════════════════════════════════════
   FILTER SELECTORS
   ═══════════════════════════════════════════════════════════ */

function SizeSelector({
  values,
  onChange,
  dark = false,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  dark?: boolean;
}) {
  function toggle(v: string) {
    onChange(
      values.includes(v) ? values.filter((i) => i !== v) : [...values, v],
    );
  }
  return (
    <div className="grid grid-cols-4 gap-2">
      {SIZE_OPTIONS.map((size) => {
        const sel = values.includes(size);
        return (
          <button
            key={size}
            type="button"
            aria-pressed={sel}
            onClick={() => toggle(size)}
            className={`min-h-9 border text-[8px] font-semibold transition-[background-color,border-color,color] ${
              dark
                ? sel
                  ? "border-white bg-white text-black"
                  : "border-white/10 text-white/48 hover:border-white/35 hover:bg-white/5 hover:text-white"
                : sel
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
  onChange: (v: string[]) => void;
  dark?: boolean;
}) {
  function toggle(v: string) {
    onChange(
      values.includes(v) ? values.filter((i) => i !== v) : [...values, v],
    );
  }
  return (
    <div className="flex flex-wrap gap-2.5">
      {COLOR_OPTIONS.map((color) => {
        const sel = values.includes(color.id);
        return (
          <button
            key={color.id}
            type="button"
            aria-label={color.label}
            aria-pressed={sel}
            onClick={() => toggle(color.id)}
            className="group/color flex flex-col items-center gap-1.5"
          >
            <span
              className={`relative grid size-8 place-items-center border transition-[border-color,opacity] ${
                sel
                  ? dark
                    ? "border-white"
                    : "border-black"
                  : dark
                    ? "border-white/10 group-hover/color:border-white/38"
                    : "border-black/12 group-hover/color:border-black/34"
              }`}
            >
              <span
                className="block size-5"
                style={{ background: color.value }}
              />
              {sel && (
                <span className="absolute -bottom-[4px] left-1/2 h-[1.5px] w-4 -translate-x-1/2 bg-[var(--shop-copper)]" />
              )}
            </span>
            <span
              className={`text-[6px] uppercase tracking-[0.06em] ${
                dark
                  ? sel
                    ? "text-white"
                    : "text-white/34"
                  : sel
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
  onChange: (v: string[]) => void;
  dark?: boolean;
}) {
  function toggle(v: string) {
    const n = v.toLowerCase();
    onChange(
      values.includes(n) ? values.filter((i) => i !== n) : [...values, n],
    );
  }
  return (
    <div className="space-y-1">
      {MATERIAL_OPTIONS.map((mat) => {
        const sel = values.includes(mat.toLowerCase());
        return (
          <button
            key={mat}
            type="button"
            aria-pressed={sel}
            onClick={() => toggle(mat)}
            className="group flex min-h-8 w-full items-center gap-3 text-left"
          >
            <span
              className={`grid size-[16px] flex-none place-items-center border transition-colors ${
                dark ? "border-white/20 group-hover:border-white/40" : "border-black/20"
              } ${sel ? (dark ? "border-white bg-white" : "bg-black") : ""}`}
            >
              {sel && (
                <CheckIcon
                  className={`size-2.5 ${dark ? "text-black" : "text-white"}`}
                />
              )}
            </span>
            <span
              className={`text-[8px] font-medium uppercase tracking-[0.07em] transition-colors ${
                dark
                  ? sel
                    ? "text-white"
                    : "text-white/48 group-hover:text-white/80"
                  : sel
                    ? "text-black"
                    : "text-black/52"
              }`}
            >
              {mat}
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
  onChange: (v: number) => void;
  dark?: boolean;
}) {
  const pct = ((value - 300) / (5000 - 300)) * 100;
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
            dark ? "bg-white/10" : "bg-black/10"
          }`}
        />
        <div
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-[var(--shop-copper)]"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={300}
          max={5000}
          step={100}
          value={value}
          aria-label="Maximum price"
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 border border-[var(--shop-copper)] bg-white"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════
   INTERSTITIAL BANNERS
   ═══════════════════════════════════════════════════════════ */

function InterstitialBanner({ banner }: { banner: ShopBanner }) {
  const isDark = banner.theme === "dark";
  return (
    <section className="group relative col-span-full overflow-hidden">
      <div className="relative aspect-[21/7] min-h-[300px] overflow-hidden xl:min-h-[360px]">
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
              {banner.title.split("\n").map((line, i) => (
                <span key={`${line}-${i}`}>
                  {line}
                  {i < banner.title.split("\n").length - 1 && <br />}
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
              <Button href={banner.ctaHref} variant="cream" size="md">
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
    <section className="relative col-span-full overflow-hidden">
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
              {banner.title.split("\n").map((line, i) => (
                <span key={`${line}-${i}`}>
                  {line}
                  {i < banner.title.split("\n").length - 1 && <br />}
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
              <Button href={banner.ctaHref} variant="cream" size="md">
                {banner.ctaText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════ */

function SortIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-4">
      <path d="M3 5H12" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3 9H10" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3 13H8" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M13.5 4V13M11.5 11L13.5 13L15.5 11"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
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
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
      className="size-[13px]"
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
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
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
 