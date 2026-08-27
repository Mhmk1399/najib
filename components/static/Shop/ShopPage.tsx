"use client";

import Image from "next/image";
import Link from "next/link";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";
import { Button } from "@/components/ui/Button";

/* ==========================================================================
   TYPES
============================================================================ */

type ProductCategory =
  | "all"
  | "new-arrivals"
  | "jackets"
  | "knitwear"
  | "shirts"
  | "trousers"
  | "shoes"
  | "bags"
  | "accessories"
  | "fragrance";

type Product = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  href: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  category: ProductCategory;
  isNew?: boolean;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
};

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

/* ==========================================================================
   DATA
============================================================================ */

const PRODUCTS: Product[] = [
  {
    id: "signature-cashmere-jacket",
    title: "Signature Cut Cashmere Jacket",
    subtitle: "Burgundy",
    price: 4250,
    href: "/products/signature-cashmere-jacket",
    image: "/assets/images/banner.webp",
    imagePosition: "center 26%",
    category: "jackets",
    isNew: true,
    colors: ["burgundy", "black"],
    sizes: ["48", "50", "52", "54"],
    materials: ["cashmere", "wool"],
  },
  {
    id: "wholecut-oxford",
    title: "Wholecut Oxford",
    subtitle: "Dark Oxblood",
    price: 1180,
    href: "/products/wholecut-oxford",
    image: "/assets/images/banner.webp",
    category: "shoes",
    isNew: true,
    colors: ["burgundy", "black"],
    sizes: ["40", "41", "42", "43", "44"],
    materials: ["leather"],
  },
  {
    id: "noir-absolu",
    title: "Noir Absolu",
    subtitle: "Extrait de Parfum 100ml",
    price: 320,
    href: "/products/noir-absolu",
    image: "/assets/images/banner.webp",
    category: "fragrance",
    isNew: true,
  },
  {
    id: "cashmere-crewneck",
    title: "Cashmere Textured Crewneck",
    subtitle: "Charcoal",
    price: 890,
    href: "/products/cashmere-textured-crewneck",
    image: "/assets/images/banner.webp",
    category: "knitwear",
    colors: ["charcoal", "black", "cream"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cashmere"],
  },
  {
    id: "leather-weekender",
    title: "Signature Leather Weekender",
    subtitle: "Black",
    price: 2650,
    href: "/products/signature-leather-weekender",
    image: "/assets/images/banner.webp",
    category: "bags",
    colors: ["black"],
    materials: ["leather"],
  },
  {
    id: "rectangular-watch",
    title: "Classic Rectangular Watch",
    subtitle: "Steel / Black",
    price: 2950,
    href: "/products/classic-rectangular-watch",
    image: "/assets/images/banner.webp",
    category: "accessories",
    colors: ["black", "silver"],
    materials: ["steel", "leather"],
  },
  {
    id: "tailored-wool-trousers",
    title: "Tailored Wool Trousers",
    subtitle: "Navy",
    price: 780,
    href: "/products/tailored-wool-trousers",
    image: "/assets/images/banner.webp",
    category: "trousers",
    isNew: true,
    colors: ["navy", "black", "charcoal"],
    sizes: ["48", "50", "52", "54"],
    materials: ["wool"],
  },
  {
    id: "silk-dress-shirt",
    title: "Silk Blend Dress Shirt",
    subtitle: "Ivory",
    price: 650,
    href: "/products/silk-dress-shirt",
    image: "/assets/images/banner.webp",
    category: "shirts",
    colors: ["cream", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["silk", "cotton"],
  },
  {
    id: "double-breasted-blazer",
    title: "Double Breasted Blazer",
    subtitle: "Midnight Navy",
    price: 3800,
    href: "/products/double-breasted-blazer",
    image: "/assets/images/banner.webp",
    category: "jackets",
    isNew: true,
    colors: ["navy", "black"],
    sizes: ["48", "50", "52", "54"],
    materials: ["wool", "cashmere"],
  },
  {
    id: "leather-chelsea-boots",
    title: "Leather Chelsea Boots",
    subtitle: "Espresso Brown",
    price: 1350,
    href: "/products/leather-chelsea-boots",
    image: "/assets/images/banner.webp",
    category: "shoes",
    colors: ["brown", "black"],
    sizes: ["40", "41", "42", "43", "44"],
    materials: ["leather"],
  },
  {
    id: "cashmere-turtleneck",
    title: "Cashmere Turtleneck",
    subtitle: "Cream",
    price: 950,
    href: "/products/cashmere-turtleneck",
    image: "/assets/images/banner.webp",
    category: "knitwear",
    colors: ["cream", "charcoal", "navy"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cashmere"],
  },
  {
    id: "leather-document-case",
    title: "Leather Document Case",
    subtitle: "Cognac",
    price: 1480,
    href: "/products/leather-document-case",
    image: "/assets/images/banner.webp",
    category: "bags",
    colors: ["brown", "black"],
    materials: ["leather"],
  },
  {
    id: "structured-overcoat",
    title: "Structured Wool Overcoat",
    subtitle: "Charcoal Mélange",
    price: 4800,
    href: "/products/structured-overcoat",
    image: "/assets/images/banner.webp",
    category: "jackets",
    isNew: true,
    colors: ["charcoal", "navy", "black"],
    sizes: ["48", "50", "52", "54"],
    materials: ["wool", "cashmere"],
  },
  {
    id: "slim-leather-belt",
    title: "Slim Leather Belt",
    subtitle: "Black / Silver",
    price: 420,
    href: "/products/slim-leather-belt",
    image: "/assets/images/banner.webp",
    category: "accessories",
    colors: ["black", "brown"],
    materials: ["leather"],
  },
  {
    id: "cotton-poplin-shirt",
    title: "Cotton Poplin Shirt",
    subtitle: "White",
    price: 480,
    href: "/products/cotton-poplin-shirt",
    image: "/assets/images/banner.webp",
    category: "shirts",
    colors: ["cream", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton"],
  },
  {
    id: "oud-royal-fragrance",
    title: "Oud Royal",
    subtitle: "Eau de Parfum 75ml",
    price: 280,
    href: "/products/oud-royal",
    image: "/assets/images/banner.webp",
    category: "fragrance",
    isNew: true,
  },
  {
    id: "pleated-wool-trousers",
    title: "Pleated Wool Trousers",
    subtitle: "Slate Grey",
    price: 820,
    href: "/products/pleated-wool-trousers",
    image: "/assets/images/banner.webp",
    category: "trousers",
    colors: ["charcoal", "navy"],
    sizes: ["48", "50", "52", "54"],
    materials: ["wool"],
  },
  {
    id: "suede-loafers",
    title: "Suede Penny Loafers",
    subtitle: "Taupe",
    price: 980,
    href: "/products/suede-loafers",
    image: "/assets/images/banner.webp",
    category: "shoes",
    colors: ["brown", "navy"],
    sizes: ["40", "41", "42", "43", "44"],
    materials: ["leather"],
  },
  {
    id: "silk-pocket-square-set",
    title: "Silk Pocket Square Set",
    subtitle: "Bordeaux & Navy",
    price: 195,
    href: "/products/silk-pocket-square-set",
    image: "/assets/images/banner.webp",
    category: "accessories",
    colors: ["burgundy", "navy"],
    materials: ["silk"],
  },
  {
    id: "merino-zip-cardigan",
    title: "Merino Wool Zip Cardigan",
    subtitle: "Black",
    price: 720,
    href: "/products/merino-zip-cardigan",
    image: "/assets/images/banner.webp",
    category: "knitwear",
    colors: ["black", "charcoal", "navy"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["wool"],
  },
];

/* ==========================================================================
   BANNER DATA (future: from DB)
============================================================================ */

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

/* ==========================================================================
   FILTER DATA
============================================================================ */

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

const COLOR_OPTIONS = [
  { id: "burgundy", label: "Burgundy", value: "#4A161D" },
  { id: "black", label: "Black", value: "#111111" },
  { id: "charcoal", label: "Charcoal", value: "#606060" },
  { id: "navy", label: "Navy", value: "#182432" },
  { id: "brown", label: "Brown", value: "#50432B" },
  { id: "cream", label: "Cream", value: "#EFEDE7" },
  { id: "silver", label: "Silver", value: "#C0C0C0" },
];

const SIZE_OPTIONS = [
  "S",
  "M",
  "L",
  "XL",
  "40",
  "41",
  "42",
  "43",
  "44",
  "48",
  "50",
  "52",
  "54",
];

const MATERIAL_OPTIONS = [
  "Cashmere",
  "Wool",
  "Leather",
  "Cotton",
  "Silk",
  "Steel",
];

/* ==========================================================================
   HELPERS
============================================================================ */

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function activeFilterCount(
  category: ProductCategory,
  selectedSizes: string[],
  selectedColors: string[],
  selectedMaterials: string[],
  maxPrice: number,
) {
  let count = 0;
  if (category !== "all") count++;
  count += selectedSizes.length;
  count += selectedColors.length;
  count += selectedMaterials.length;
  if (maxPrice < 5000) count++;
  return count;
}

/* ==========================================================================
   LENIS HELPERS
============================================================================ */

function stopLenis() {
  // @ts-expect-error Lenis instance attached to window
  const lenis = window.__lenis ?? window.lenis;
  if (lenis && typeof lenis.stop === "function") lenis.stop();
}

function startLenis() {
  // @ts-expect-error Lenis instance attached to window
  const lenis = window.__lenis ?? window.lenis;
  if (lenis && typeof lenis.start === "function") lenis.start();
}

/* ==========================================================================
   INTERSTITIAL BANNER POSITIONS CONFIG
   ─ insertAfter: how many products before this banner appears
============================================================================ */

const BANNER_INSERTION_POINTS = [
  { afterIndex: 6, bannerId: "banner-aw-collection" },
  { afterIndex: 14, bannerId: "banner-bespoke" },
];

/* ==========================================================================
   PAGE
============================================================================ */

export function ShopPage() {
  const [category, setCategory] = useState<ProductCategory>("all");
  const [sort, setSort] = useState<SortOption>("new-arrivals");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);

  /* THEME VARS */
  const themeVars = {
    "--shop-bg": "#F6F2EB",
    "--shop-surface": brandColors.white.hex,
    "--shop-black": "#0B0B0B",
    "--shop-text": "#0B0B0B",
    "--shop-muted": lightTokens.textMuted,
    "--shop-soft": lightTokens.textSoft,
    "--shop-border": "#DDD8D0",
    "--shop-copper": brandColors.copper.hex,
    "--shop-scrollbar-thumb": `rgb(${brandColors.copper.rgb} / 0.66)`,
    "--shop-scrollbar-thumb-hover": `rgb(${brandColors.copper.rgb} / 0.9)`,
    "--shop-scrollbar-track": "rgb(11 11 11 / 0.07)",
  } as CSSProperties;

  /* BODY LOCK + LENIS */
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    stopLenis();
    return () => {
      document.body.style.overflow = prevOverflow;
      startLenis();
    };
  }, [mobileFiltersOpen]);

  /* FILTER */
  const products = useMemo(() => {
    let result = [...PRODUCTS];
    if (category === "new-arrivals") {
      result = result.filter((p) => p.isNew);
    } else if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (selectedSizes.length) {
      result = result.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s)),
      );
    }
    if (selectedColors.length) {
      result = result.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c)),
      );
    }
    if (selectedMaterials.length) {
      result = result.filter((p) =>
        p.materials?.some((m) => selectedMaterials.includes(m.toLowerCase())),
      );
    }
    result = result.filter((p) => p.price <= maxPrice);
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (sort === "new-arrivals")
      result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return result;
  }, [
    category,
    sort,
    selectedSizes,
    selectedColors,
    selectedMaterials,
    maxPrice,
  ]);

  /* BUILD INTERLEAVED PRODUCT + BANNER LIST */
  const interleavedContent = useMemo(() => {
    const items: Array<
      | { type: "product"; product: Product; index: number }
      | { type: "banner"; banner: ShopBanner }
    > = [];

    products.forEach((product, i) => {
      items.push({ type: "product", product, index: i });

      // Check if a banner should be inserted after this product
      const insertion = BANNER_INSERTION_POINTS.find(
        (bp) => bp.afterIndex === i + 1,
      );
      if (insertion) {
        const banner = SHOP_BANNERS.find((b) => b.id === insertion.bannerId);
        if (banner) {
          items.push({ type: "banner", banner });
        }
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
      {/* BLACK AREA BEHIND TRANSPARENT NAVBAR */}
      <div
        aria-hidden="true"
        className="h-[72px] bg-[var(--shop-black)] md:h-[76px]"
      />

      <section className="mx-auto w-full max-w-[1920px]">
        {/* ──────────────────────────────────────────────────────────────
            MOBILE HEADER
        ────────────────────────────────────────────────────────────── */}
        <div className="border-b border-[var(--shop-border)] bg-[var(--shop-bg)] px-5 pb-4 pt-7 lg:hidden">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-serif text-[32px] font-normal leading-none tracking-[0.06em] sm:text-[38px]">
              SHOP
            </h1>
            <span className="pb-1 text-[10px] font-medium tracking-[0.08em] text-black/45">
              {products.length} {products.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            DESKTOP LAYOUT
        ────────────────────────────────────────────────────────────── */}
        <div className="hidden min-h-[calc(100svh-76px)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
          {/* ════════════════════════════════════════════════════════════
              DESKTOP SIDEBAR
          ════════════════════════════════════════════════════════════ */}
          <aside className="border-r border-[var(--shop-border)] bg-[var(--shop-bg)]">
            <div
              data-lenis-prevent=""
              className="sticky top-[76px] flex max-h-[calc(100svh-76px)] flex-col overflow-y-auto overflow-x-hidden overscroll-contain px-7 py-8 [scrollbar-color:var(--shop-scrollbar-thumb)_var(--shop-scrollbar-track)] [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[var(--shop-scrollbar-track)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-[var(--shop-bg)] [&::-webkit-scrollbar-thumb]:bg-[var(--shop-scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--shop-scrollbar-thumb-hover)] xl:px-9"
            >
              {/* TITLE */}
              <h1 className="font-serif text-[40px] font-normal tracking-[0.06em] xl:text-[44px]">
                SHOP
              </h1>

              <span className="mt-6 block h-px w-full bg-[var(--shop-border)]" />

              {/* FILTER TITLE + RESET */}
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em]">
                    Filters
                  </span>
                  {filterCount > 0 && (
                    <span className="grid size-[18px] place-items-center rounded-full bg-[var(--shop-copper)] text-[8px] font-bold text-white">
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

              {/* CATEGORY */}
              <div className="mt-5 border-t border-[var(--shop-border)] pt-5">
                <DesktopAccordion title="Category" defaultOpen>
                  <div className="space-y-0.5">
                    {CATEGORIES.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setCategory(item.value)}
                        className={`flex min-h-[30px] w-full items-center gap-2.5 text-left text-[9px] font-medium uppercase tracking-[0.07em] transition-all duration-200 ${
                          category === item.value
                            ? "translate-x-1.5 text-[var(--shop-copper)]"
                            : "text-black/55 hover:translate-x-1.5 hover:text-black"
                        }`}
                      >
                        {category === item.value && (
                          <span className="inline-block h-px w-3 bg-[var(--shop-copper)]" />
                        )}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </DesktopAccordion>
              </div>

              {/* SIZE */}
              <DesktopAccordion title="Size">
                <SizeSelector
                  values={selectedSizes}
                  onChange={setSelectedSizes}
                />
              </DesktopAccordion>

              {/* COLOR */}
              <DesktopAccordion title="Color" defaultOpen>
                <ColorSelector
                  values={selectedColors}
                  onChange={setSelectedColors}
                />
              </DesktopAccordion>

              {/* MATERIAL */}
              <DesktopAccordion title="Material">
                <MaterialSelector
                  values={selectedMaterials}
                  onChange={setSelectedMaterials}
                />
              </DesktopAccordion>

              {/* PRICE */}
              <DesktopAccordion title="Price" defaultOpen>
                <PriceSelector value={maxPrice} onChange={setMaxPrice} />
              </DesktopAccordion>

              {/* CONCIERGE */}
              <div className="mt-8 border-t border-[var(--shop-border)] pt-7">
                <div className="bg-black/[0.028] p-5">
                  <p className="text-[8px] font-semibold uppercase leading-[1.8] tracking-[0.13em]">
                    Style is personal.
                    <br />
                    We are here to help.
                  </p>
                  <Link
                    href="/contact"
                    className="group mt-5 flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.12em] text-black/40 transition-colors hover:text-black"
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

          {/* ════════════════════════════════════════════════════════════
              DESKTOP PRODUCTS + BANNERS
          ════════════════════════════════════════════════════════════ */}
          <div className="min-w-0 px-5 pb-12 pt-8 xl:px-7">
            {/* TOOLBAR */}
            <div className="mb-6 flex min-h-10 items-center justify-between border-b border-[var(--shop-border)] pb-4">
              <span className="text-[10px] font-medium tracking-[0.08em] text-black/50">
                {products.length} {products.length === 1 ? "Item" : "Items"}
              </span>
              <SortSelect value={sort} onChange={setSort} dark={false} />
            </div>

            {/* INTERLEAVED GRID */}
            {products.length ? (
              <DesktopInterleavedGrid content={interleavedContent} />
            ) : (
              <EmptyProducts resetFilters={resetFilters} />
            )}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            MOBILE PRODUCTS + BANNERS
        ────────────────────────────────────────────────────────────── */}
        <div className="pb-[76px] lg:hidden">
          {products.length ? (
            <MobileInterleavedGrid content={interleavedContent} />
          ) : (
            <EmptyProducts resetFilters={resetFilters} />
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────────
            MOBILE STICKY FILTER BAR
        ────────────────────────────────────────────────────────────── */}
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="border-t border-black/10 bg-[var(--shop-bg)]/90 px-4 py-3 backdrop-blur-xl">
            <div className="flex gap-3">
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
                  <span className="ml-2 inline-flex size-[18px] items-center justify-center rounded-full bg-[var(--shop-copper)] text-[8px] font-bold text-white">
                    {filterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          MOBILE FILTER DRAWER
      ────────────────────────────────────────────────────────────── */}
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

/* ==========================================================================
   DESKTOP INTERLEAVED GRID
   ─ Renders products in a 2-col grid with full-width banners inserted
============================================================================ */

type InterleavedItem =
  | { type: "product"; product: Product; index: number }
  | { type: "banner"; banner: ShopBanner };

function DesktopInterleavedGrid({ content }: { content: InterleavedItem[] }) {
  const chunks: Array<
    | { kind: "products"; items: { product: Product; index: number }[] }
    | { kind: "banner"; banner: ShopBanner }
  > = [];

  let currentProducts: { product: Product; index: number }[] = [];

  content.forEach((item) => {
    if (item.type === "product") {
      currentProducts.push({ product: item.product, index: item.index });
    } else {
      // Flush current products
      if (currentProducts.length > 0) {
        chunks.push({ kind: "products", items: [...currentProducts] });
        currentProducts = [];
      }
      chunks.push({ kind: "banner", banner: item.banner });
    }
  });

  // Flush remaining products
  if (currentProducts.length > 0) {
    chunks.push({ kind: "products", items: currentProducts });
  }

  return (
    <div className="space-y-5">
      {chunks.map((chunk, chunkIdx) => {
        if (chunk.kind === "products") {
          return (
            <div
              key={`chunk-${chunkIdx}`}
              className="grid grid-cols-2 gap-4 xl:gap-5"
            >
              {chunk.items.map(({ product, index }) => (
                <DesktopProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
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

/* ==========================================================================
   MOBILE INTERLEAVED GRID
============================================================================ */

function MobileInterleavedGrid({ content }: { content: InterleavedItem[] }) {
  const chunks: Array<
    | { kind: "products"; items: { product: Product; index: number }[] }
    | { kind: "banner"; banner: ShopBanner }
  > = [];

  let currentProducts: { product: Product; index: number }[] = [];

  content.forEach((item) => {
    if (item.type === "product") {
      currentProducts.push({ product: item.product, index: item.index });
    } else {
      if (currentProducts.length > 0) {
        chunks.push({ kind: "products", items: [...currentProducts] });
        currentProducts = [];
      }
      chunks.push({ kind: "banner", banner: item.banner });
    }
  });

  if (currentProducts.length > 0) {
    chunks.push({ kind: "products", items: currentProducts });
  }

  return (
    <div>
      {chunks.map((chunk, chunkIdx) => {
        if (chunk.kind === "products") {
          return (
            <div
              key={`chunk-${chunkIdx}`}
              className="grid grid-cols-2 gap-px bg-[var(--shop-border)] sm:gap-[1px]"
            >
              {chunk.items.map(({ product, index }) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
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

/* ==========================================================================
   INTERSTITIAL BANNER — DESKTOP
============================================================================ */

function InterstitialBanner({ banner }: { banner: ShopBanner }) {
  const isDark = banner.theme === "dark";

  return (
    <div className="group relative overflow-hidden">
      <Link href={banner.ctaHref} className="block">
        <div className="relative aspect-[21/8] min-h-[320px] overflow-hidden xl:min-h-[380px]">
          {/* BG IMAGE */}
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            sizes="(max-width: 1920px) 100vw, 1610px"
            className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            style={{
              objectPosition: banner.imagePosition ?? "center",
            }}
          />

          {/* OVERLAY */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isDark
                ? "bg-gradient-to-r from-black/75 via-black/40 to-black/10"
                : "bg-gradient-to-r from-white/80 via-white/50 to-white/10"
            }`}
          />

          {/* CONTENT */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-[560px] px-10 xl:px-14">
              {/* BADGE */}
              {banner.badge && (
                <span
                  className={`mb-5 inline-block border px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.22em] ${
                    isDark
                      ? "border-[var(--shop-copper)] text-[var(--shop-copper)]"
                      : "border-[var(--shop-copper)] text-[var(--shop-copper)]"
                  }`}
                >
                  {banner.badge}
                </span>
              )}

              {/* SUBTITLE */}
              <p
                className={`text-[9px] font-semibold uppercase tracking-[0.2em] ${
                  isDark ? "text-white/50" : "text-black/40"
                }`}
              >
                {banner.subtitle}
              </p>

              {/* TITLE */}
              <h3
                className={`mt-3 font-serif text-[36px] font-normal leading-[1.1] tracking-[0.02em] xl:text-[42px] ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                {banner.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < banner.title.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h3>

              {/* DESCRIPTION */}
              <p
                className={`mt-4 max-w-[380px] text-[11px] leading-[1.8] xl:text-[12px] ${
                  isDark ? "text-white/55" : "text-black/50"
                }`}
              >
                {banner.description}
              </p>

              {/* CTA */}
              <div className="mt-7">
                <span
                  className={`inline-flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                    isDark
                      ? "text-white group-hover:text-[var(--shop-copper)]"
                      : "text-black group-hover:text-[var(--shop-copper)]"
                  }`}
                >
                  {banner.ctaText}
                  <span
                    className={`inline-block h-px w-8 transition-all duration-500 group-hover:w-12 ${
                      isDark
                        ? "bg-white/40 group-hover:bg-[var(--shop-copper)]"
                        : "bg-black/30 group-hover:bg-[var(--shop-copper)]"
                    }`}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* DECORATIVE CORNER */}
          <div
            className={`absolute bottom-5 right-5 size-12 border opacity-0 transition-all duration-500 group-hover:opacity-100 ${
              isDark ? "border-white/10" : "border-black/8"
            }`}
          />
        </div>
      </Link>
    </div>
  );
}

/* ==========================================================================
   INTERSTITIAL BANNER — MOBILE
============================================================================ */

function InterstitialBannerMobile({ banner }: { banner: ShopBanner }) {
  const isDark = banner.theme === "dark";

  return (
    <div className="relative overflow-hidden">
      <Link href={banner.ctaHref} className="block">
        <div className="relative aspect-[4/5] min-h-[420px] overflow-hidden sm:aspect-[3/4] sm:min-h-[480px]">
          {/* BG IMAGE */}
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: banner.imagePosition ?? "center",
            }}
          />

          {/* OVERLAY */}
          <div
            className={`absolute inset-0 ${
              isDark
                ? "bg-gradient-to-t from-black/80 via-black/30 to-black/10"
                : "bg-gradient-to-t from-white/85 via-white/40 to-white/15"
            }`}
          />

          {/* CONTENT */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-6 pb-8 sm:p-8 sm:pb-10">
              {/* BADGE */}
              {banner.badge && (
                <span
                  className={`mb-4 inline-block border px-2.5 py-1 text-[6px] font-bold uppercase tracking-[0.2em] sm:text-[7px] ${
                    isDark
                      ? "border-[var(--shop-copper)] text-[var(--shop-copper)]"
                      : "border-[var(--shop-copper)] text-[var(--shop-copper)]"
                  }`}
                >
                  {banner.badge}
                </span>
              )}

              {/* SUBTITLE */}
              <p
                className={`text-[8px] font-semibold uppercase tracking-[0.18em] sm:text-[9px] ${
                  isDark ? "text-white/45" : "text-black/35"
                }`}
              >
                {banner.subtitle}
              </p>

              {/* TITLE */}
              <h3
                className={`mt-2 font-serif text-[28px] font-normal leading-[1.15] tracking-[0.02em] sm:text-[34px] ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                {banner.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < banner.title.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h3>

              {/* DESCRIPTION */}
              <p
                className={`mt-3 max-w-[300px] text-[10px] leading-[1.7] sm:text-[11px] ${
                  isDark ? "text-white/50" : "text-black/45"
                }`}
              >
                {banner.description}
              </p>

              {/* CTA */}
              <div className="mt-5">
                <span
                  className={`inline-flex items-center gap-2.5 text-[8px] font-semibold uppercase tracking-[0.14em] sm:text-[9px] ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  {banner.ctaText}
                  <span
                    className={`inline-block h-px w-6 ${
                      isDark ? "bg-white/40" : "bg-black/30"
                    }`}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ==========================================================================
   DESKTOP PRODUCT CARD
============================================================================ */

function DesktopProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="group relative min-w-0 overflow-hidden bg-white transition-all duration-500 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={product.href} aria-label={product.title} className="block">
        {/* IMAGE */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#171717]">
          <Image
            src={product.image}
            alt={product.imageAlt ?? product.title}
            fill
            priority={priority}
            sizes="(max-width: 1279px) 50vw, 33vw"
            draggable={false}
            style={{ objectPosition: product.imagePosition ?? "center" }}
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />

          {/* OVERLAY GRADIENT */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* NEW BADGE */}
          {product.isNew && (
            <span className="absolute left-3 top-3 bg-[var(--shop-copper)] px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.18em] text-white">
              New
            </span>
          )}

          {/* QUICK ADD */}
          <span
            className={`absolute bottom-3 right-3 grid size-9 place-items-center border text-[15px] font-light backdrop-blur-md transition-all duration-300 ${
              hovered
                ? "translate-y-0 border-white bg-white text-black opacity-100"
                : "translate-y-2 border-white/30 bg-black/40 text-white opacity-0"
            }`}
          >
            +
          </span>
        </div>

        {/* INFO */}
        <div className="px-4 py-4">
          <h2 className="truncate text-[10px] font-semibold uppercase tracking-[0.06em] text-black">
            {product.title}
          </h2>
          <p className="mt-1.5 truncate text-[9px] font-medium uppercase tracking-[0.06em] text-black/40">
            {product.subtitle}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.02em] text-black">
              {money(product.price)}
            </span>
            {product.colors && product.colors.length > 1 && (
              <div className="flex gap-1">
                {product.colors.slice(0, 4).map((colorId) => {
                  const colorData = COLOR_OPTIONS.find((c) => c.id === colorId);
                  return colorData ? (
                    <span
                      key={colorId}
                      className="block size-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: colorData.value }}
                    />
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ==========================================================================
   MOBILE PRODUCT CARD
============================================================================ */

function MobileProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <article className="bg-white">
      <Link href={product.href} className="block">
        {/* IMAGE */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#171717]">
          <Image
            src={product.image}
            alt={product.imageAlt ?? product.title}
            fill
            priority={priority}
            sizes="50vw"
            draggable={false}
            className="object-cover"
            style={{ objectPosition: product.imagePosition ?? "center" }}
          />
          {product.isNew && (
            <span className="absolute left-2 top-2 bg-[var(--shop-copper)] px-2 py-0.5 text-[6px] font-bold uppercase tracking-[0.16em] text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[7px]">
              New
            </span>
          )}
        </div>

        {/* INFO */}
        <div className="p-3 sm:p-4">
          <h2 className="line-clamp-2 text-[9px] font-semibold uppercase leading-[1.5] tracking-[0.06em] text-black sm:text-[10px]">
            {product.title}
          </h2>
          <p className="mt-1 truncate text-[8px] font-medium uppercase tracking-[0.06em] text-black/40 sm:text-[9px]">
            {product.subtitle}
          </p>
          <span className="mt-2 block text-[9px] font-semibold text-black sm:text-[10px]">
            {money(product.price)}
          </span>
        </div>
      </Link>
    </article>
  );
}

/* ==========================================================================
   MOBILE FILTERS (Full-screen drawer with its own scroll)
============================================================================ */

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

  /* Prevent touch events from reaching Lenis */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;

    const preventPropagation = (e: Event) => {
      e.stopPropagation();
    };

    el.addEventListener("wheel", preventPropagation, { passive: false });
    el.addEventListener("touchstart", preventPropagation, { passive: true });
    el.addEventListener("touchmove", preventPropagation, { passive: false });

    return () => {
      el.removeEventListener("wheel", preventPropagation);
      el.removeEventListener("touchstart", preventPropagation);
      el.removeEventListener("touchmove", preventPropagation);
    };
  }, [open]);

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`fixed inset-0 z-[1199] bg-black/60 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* DRAWER */}
      <div
        className={`fixed inset-0 z-[1200] flex flex-col bg-[#0B0B0B] text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ touchAction: "none" }}
      >
        {/* HEADER */}
        <div className="flex h-16 flex-none items-center justify-between border-b border-white/10 px-5">
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="grid size-10 place-items-center text-white transition-opacity hover:opacity-70"
          >
            <CloseIcon />
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">
            Filter & Sort
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--shop-copper)] transition-opacity hover:opacity-80"
          >
            Clear
          </button>
        </div>

        {/* SCROLL BODY */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6"
          style={{ WebkitOverflowScrolling: "touch" }}
          data-lenis-prevent
        >
          {/* CATEGORY */}
          <MobileFilterBlock title="Category" defaultOpen>
            <div className="grid grid-cols-2 gap-2 pt-3">
              {CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={`min-h-11 border px-3 text-[8px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                    category === item.value
                      ? "border-[var(--shop-copper)] bg-[var(--shop-copper)]/10 text-white"
                      : "border-white/12 text-white/50 hover:border-white/30 hover:text-white/80"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </MobileFilterBlock>

          {/* SIZE */}
          <MobileFilterBlock title="Size">
            <SizeSelector
              values={selectedSizes}
              onChange={setSelectedSizes}
              dark
            />
          </MobileFilterBlock>

          {/* COLOR */}
          <MobileFilterBlock title="Color" defaultOpen>
            <ColorSelector
              values={selectedColors}
              onChange={setSelectedColors}
              dark
            />
          </MobileFilterBlock>

          {/* MATERIAL */}
          <MobileFilterBlock title="Material">
            <MaterialSelector
              values={selectedMaterials}
              onChange={setSelectedMaterials}
              dark
            />
          </MobileFilterBlock>

          {/* PRICE */}
          <MobileFilterBlock title="Price" defaultOpen>
            <PriceSelector value={maxPrice} onChange={setMaxPrice} dark />
          </MobileFilterBlock>

          {/* SORT */}
          <div className="flex min-h-[66px] items-center justify-between border-b border-white/10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/65">
              Sort By
            </span>
            <SortSelect value={sort} onChange={setSort} dark />
          </div>
        </div>

        {/* APPLY */}
        <div className="flex-none border-t border-white/10 bg-[#0B0B0B] p-4">
          <Button
            type="button"
            variant="copper"
            size="lg"
            fullWidth
            onClick={onClose}
          >
            View {resultCount} {resultCount === 1 ? "Item" : "Items"}
          </Button>
        </div>
      </div>
    </>
  );
}

/* ==========================================================================
   DESKTOP ACCORDION
============================================================================ */

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
        onClick={() => setOpen((c) => !c)}
        className="flex min-h-7 w-full items-center justify-between text-left"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
          {title}
        </span>
        <span
          className={`text-[12px] text-black/40 transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`}
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

/* ==========================================================================
   MOBILE FILTER BLOCK
============================================================================ */

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
        onClick={() => setOpen((c) => !c)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
          {title}
        </span>
        <span
          className={`text-[14px] font-light text-white/40 transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`}
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

/* ==========================================================================
   SIZE SELECTOR
============================================================================ */

function SizeSelector({
  values,
  onChange,
  dark = false,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  dark?: boolean;
}) {
  const toggle = (v: string) =>
    onChange(
      values.includes(v) ? values.filter((i) => i !== v) : [...values, v],
    );

  return (
    <div className="grid grid-cols-4 gap-2">
      {SIZE_OPTIONS.map((size) => {
        const selected = values.includes(size);
        return (
          <button
            key={size}
            type="button"
            onClick={() => toggle(size)}
            className={`min-h-9 border text-[9px] font-semibold transition-all duration-200 ${
              dark
                ? selected
                  ? "border-white bg-white text-black"
                  : "border-white/12 text-white/50 hover:border-white/35"
                : selected
                  ? "border-black bg-black text-white"
                  : "border-black/12 text-black/55 hover:border-black/40"
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   COLOR SELECTOR
============================================================================ */

function ColorSelector({
  values,
  onChange,
  dark = false,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  dark?: boolean;
}) {
  const toggle = (v: string) =>
    onChange(
      values.includes(v) ? values.filter((i) => i !== v) : [...values, v],
    );

  return (
    <div className="flex flex-wrap gap-3">
      {COLOR_OPTIONS.map((color) => {
        const selected = values.includes(color.id);
        return (
          <button
            key={color.id}
            type="button"
            aria-label={color.label}
            onClick={() => toggle(color.id)}
            className="group/color flex flex-col items-center gap-1.5"
          >
            <span
              className={`grid size-8 place-items-center border transition-all duration-200 ${
                selected
                  ? dark
                    ? "border-white shadow-[0_0_0_1px_white]"
                    : "border-black shadow-[0_0_0_1px_black]"
                  : dark
                    ? "border-white/15 group-hover/color:border-white/40"
                    : "border-black/12 group-hover/color:border-black/35"
              }`}
            >
              <span
                className="block size-5 rounded-[1px]"
                style={{ background: color.value }}
              />
            </span>
            <span
              className={`text-[7px] uppercase tracking-[0.06em] ${
                dark
                  ? selected
                    ? "text-white"
                    : "text-white/35"
                  : selected
                    ? "text-black"
                    : "text-black/35"
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

/* ==========================================================================
   MATERIAL SELECTOR
============================================================================ */

function MaterialSelector({
  values,
  onChange,
  dark = false,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  dark?: boolean;
}) {
  const toggle = (v: string) => {
    const n = v.toLowerCase();
    onChange(
      values.includes(n) ? values.filter((i) => i !== n) : [...values, n],
    );
  };

  return (
    <div className="space-y-1.5">
      {MATERIAL_OPTIONS.map((material) => {
        const selected = values.includes(material.toLowerCase());
        return (
          <button
            key={material}
            type="button"
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
              className={`text-[9px] font-medium uppercase tracking-[0.07em] ${
                dark
                  ? selected
                    ? "text-white"
                    : "text-white/50"
                  : selected
                    ? "text-black"
                    : "text-black/55"
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

/* ==========================================================================
   PRICE SELECTOR
============================================================================ */

function PriceSelector({
  value,
  onChange,
  dark = false,
}: {
  value: number;
  onChange: (v: number) => void;
  dark?: boolean;
}) {
  const percentage = ((value - 300) / (5000 - 300)) * 100;

  return (
    <div>
      <div className="flex justify-between text-[8px] font-semibold uppercase tracking-[0.08em]">
        <span className={dark ? "text-white/35" : "text-black/35"}>$0</span>
        <span className={dark ? "text-white/80" : "text-black/80"}>
          {money(value)}
        </span>
      </div>

      {/* CUSTOM RANGE */}
      <div className="relative mt-4 h-6">
        {/* TRACK BG */}
        <div
          className={`absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 ${
            dark ? "bg-white/12" : "bg-black/10"
          }`}
        />
        {/* TRACK FILL */}
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
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        {/* THUMB */}
        <div
          className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--shop-copper)] bg-white shadow-sm"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   SORT SELECT
============================================================================ */

function SortSelect({
  value,
  onChange,
  dark,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
  dark: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className={`cursor-pointer appearance-none bg-transparent py-2 pr-4 text-[9px] font-semibold uppercase tracking-[0.1em] outline-none ${
          dark ? "text-white/60" : "text-black/55"
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
          dark ? "text-white/40" : "text-black/35"
        }`}
      />
    </div>
  );
}

/* ==========================================================================
   EMPTY STATE
============================================================================ */

function EmptyProducts({ resetFilters }: { resetFilters: () => void }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 grid size-16 place-items-center rounded-full bg-black/[0.04]">
        <SearchIcon className="size-6 text-black/25" />
      </div>
      <p className="font-serif text-[34px] tracking-[-0.03em] text-black sm:text-[40px]">
        Nothing found
      </p>
      <p className="mt-3 max-w-[320px] text-[11px] leading-[1.7] text-black/45">
        Adjust your filters to discover more of the collection.
      </p>
      <button
        type="button"
        onClick={resetFilters}
        className="mt-7 border-b border-black pb-1 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-[var(--shop-copper)] hover:text-[var(--shop-copper)]"
      >
        Reset Filters
      </button>
    </div>
  );
}

/* ==========================================================================
   ICONS
============================================================================ */

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
