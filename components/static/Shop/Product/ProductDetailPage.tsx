"use client";

import Image from "next/image";
import Link from "next/link";

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";

import { CustomSelect, type SelectOption } from "@/components/ui/CustomSelect";

import { useToast } from "@/components/ui/CustomToast";

import { brandColors, lightTokens } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

export type ProductDetailImage = {
  id: string;

  src: string;

  alt?: string;

  position?: string;
};

export type ProductColorVariant = {
  id: string;

  name: string;

  code?: string;

  swatch: string;

  images: ProductDetailImage[];
};

export type ProductSizeOption = {
  value: string;

  label: string;

  disabled?: boolean;
};

export type ProductDetailSection = {
  id: string;

  title: string;

  paragraphs: string[];
};

export type RelatedProductItem = {
  id: string;

  slug: string;

  name: string;

  subtitle?: string;

  price: number;

  image: string;

  imageAlt?: string;
};

export type ProductDetailData = {
  id: string;

  slug: string;

  sku: string;

  name: string;

  eyebrow?: string;

  shortDescription?: string;

  price: number;

  currency?: string;

  colors: ProductColorVariant[];

  sizes?: ProductSizeOption[];

  sections: ProductDetailSection[];

  shippingNote?: string;

  relatedProducts?: RelatedProductItem[];
};

type ProductDetailPageProps = {
  product: ProductDetailData;
};

/* ==========================================================================
   COMPONENT
============================================================================ */

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const toast = useToast();

  const stageRef = useRef<HTMLElement | null>(null);

  const [selectedColorId, setSelectedColorId] = useState(
    product.colors[0]?.id ?? "",
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [sizeError, setSizeError] = useState<string | undefined>(undefined);

  const [addingToBag, setAddingToBag] = useState(false);

  const [favorite, setFavorite] = useState(false);

  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);

  const [mobileSheetVisible, setMobileSheetVisible] = useState(true);

  /* ------------------------------------------------------------------------
     THEME
  ------------------------------------------------------------------------- */

  const themeVars = {
    "--product-black": "#0B0B0B",

    "--product-white": brandColors.white.hex,

    "--product-cream": lightTokens.surfaceBrand,

    "--product-surface": lightTokens.surface,

    "--product-muted": lightTokens.textMuted,

    "--product-soft": lightTokens.textSoft,

    "--product-border": lightTokens.border,

    "--product-copper": brandColors.copper.hex,
  } as CSSProperties;

  /* ------------------------------------------------------------------------
     CURRENT COLOR
  ------------------------------------------------------------------------- */

  const selectedColor = useMemo(() => {
    return (
      product.colors.find((color) => color.id === selectedColorId) ??
      product.colors[0]
    );
  }, [product.colors, selectedColorId]);

  const images = selectedColor?.images ?? [];

  /* ------------------------------------------------------------------------
     SIZE OPTIONS
  ------------------------------------------------------------------------- */

  const sizeOptions = useMemo<SelectOption[]>(() => {
    return (
      product.sizes?.map((size) => ({
        value: size.value,

        label: size.label,

        disabled: size.disabled,
      })) ?? []
    );
  }, [product.sizes]);

  /* ------------------------------------------------------------------------
     MOBILE SHEET VISIBILITY

     وقتی Product Stage تمام می‌شود، sheet هم ناپدید می‌شود.
  ------------------------------------------------------------------------- */

  useEffect(() => {
    const node = stageRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setMobileSheetVisible(Boolean(entry?.isIntersecting));
      },
      {
        threshold: 0.01,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  /* ------------------------------------------------------------------------
     ZOOM BODY LOCK
  ------------------------------------------------------------------------- */

  useEffect(() => {
    if (zoomIndex === null) {
      return;
    }

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [zoomIndex]);

  /* ------------------------------------------------------------------------
     CHANGE COLOR
  ------------------------------------------------------------------------- */

  function selectColor(colorId: string) {
    setSelectedColorId(colorId);

    setZoomIndex(null);
  }

  /* ------------------------------------------------------------------------
     ADD TO BAG
  ------------------------------------------------------------------------- */

  async function addToBag() {
    if (product.sizes?.length && !selectedSize) {
      setSizeError("Please select your size.");

      setMobileSheetExpanded(true);

      toast.error("Select your size", {
        description: "Choose a size before adding this piece to your bag.",
      });

      return;
    }

    setSizeError(undefined);

    setAddingToBag(true);

    /*
     * FAKE REQUEST
     *
     * بعداً:
     *
     * await addProductToCart({
     *   productId: product.id,
     *   colorId: selectedColorId,
     *   size: selectedSize,
     *   quantity: 1,
     * });
     */

    await new Promise((resolve) => window.setTimeout(resolve, 650));

    setAddingToBag(false);

    toast.success("Added to your bag", {
      description: `${product.name}${selectedSize ? ` · ${selectedSize}` : ""}`,
    });
  }

  /* ------------------------------------------------------------------------
     FAVORITE
  ------------------------------------------------------------------------- */

  function toggleFavorite() {
    const next = !favorite;

    setFavorite(next);

    toast.info(next ? "Saved to your wishlist" : "Removed from wishlist");
  }

  /* ------------------------------------------------------------------------
     SHARE
  ------------------------------------------------------------------------- */

  async function shareProduct() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,

          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      toast.success("Link copied");
    } catch {
      /*
       * Share cancel هم ممکن است اینجا بیاید.
       */
    }
  }

  return (
    <main
      dir="ltr"
      style={themeVars}
      className="
        min-h-screen

        bg-[var(--product-cream)]
        text-[var(--product-black)]
      "
    >
      {/* ===============================================================
          NAVBAR CONTRAST

          Navbar فعلی transparent + white است.
      ================================================================ */}

      <div
        aria-hidden="true"
        className="
          h-[72px]

          bg-[var(--product-black)]

          md:h-[76px]
        "
      />

      {/* ===============================================================
          PRODUCT STAGE
      ================================================================ */}

      <section
        ref={stageRef}
        className="
          relative

          mx-auto

          w-full
          max-w-[1920px]

          lg:grid
          lg:grid-cols-[minmax(0,1.17fr)_minmax(430px,0.83fr)]
        "
      >
        {/* =============================================================
            GALLERY
        ============================================================== */}

        <ProductStackGallery
          productName={product.name}
          images={images}
          onZoom={setZoomIndex}
        />

        {/* =============================================================
            DESKTOP INFO
        ============================================================== */}

        <aside
          className="
            hidden

            bg-white

            lg:block
          "
        >
          <div
            className="
              sticky
              top-[96px]

              px-10
              py-10

              xl:px-14
              xl:py-12

              2xl:px-16
            "
          >
            <ProductPurchasePanel
              product={product}
              selectedColorId={selectedColorId}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              sizeOptions={sizeOptions}
              sizeError={sizeError}
              favorite={favorite}
              addingToBag={addingToBag}
              onColorChange={selectColor}
              onSizeChange={(value) => {
                setSelectedSize(value);

                setSizeError(undefined);
              }}
              onFavorite={toggleFavorite}
              onShare={shareProduct}
              onAddToBag={addToBag}
            />
          </div>
        </aside>

        {/* =============================================================
            MOBILE SPACER FOR BOTTOM SHEET
        ============================================================== */}

        <div
          aria-hidden="true"
          className="
            h-[180px]

            lg:hidden
          "
        />
      </section>

      {/* ===============================================================
          PRODUCT DETAILS
      ================================================================ */}

      <ProductDetailsSections sections={product.sections} />

      {/* ===============================================================
          RELATED PRODUCTS
      ================================================================ */}

      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <RelatedProductsSection products={product.relatedProducts} />
      )}

      {/* ===============================================================
          MOBILE BOTTOM SHEET
      ================================================================ */}

      {mobileSheetVisible && (
        <MobileProductSheet
          product={product}
          selectedColorId={selectedColorId}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          sizeOptions={sizeOptions}
          sizeError={sizeError}
          expanded={mobileSheetExpanded}
          favorite={favorite}
          addingToBag={addingToBag}
          onExpandedChange={setMobileSheetExpanded}
          onColorChange={selectColor}
          onSizeChange={(value) => {
            setSelectedSize(value);

            setSizeError(undefined);
          }}
          onFavorite={toggleFavorite}
          onShare={shareProduct}
          onAddToBag={addToBag}
        />
      )}

      {/* ===============================================================
          IMAGE ZOOM
      ================================================================ */}

      {zoomIndex !== null && images[zoomIndex] && (
        <ProductZoom
          image={images[zoomIndex]}
          index={zoomIndex}
          count={images.length}
          onClose={() => setZoomIndex(null)}
          onPrevious={() =>
            setZoomIndex((current) => {
              if (current === null) {
                return 0;
              }

              return (current - 1 + images.length) % images.length;
            })
          }
          onNext={() =>
            setZoomIndex((current) => {
              if (current === null) {
                return 0;
              }

              return (current + 1) % images.length;
            })
          }
        />
      )}
    </main>
  );
}

/* ==========================================================================
   DESKTOP + MOBILE STACKED GALLERY
============================================================================ */

function ProductStackGallery({
  productName,

  images,

  onZoom,
}: {
  productName: string;

  images: ProductDetailImage[];

  onZoom: (index: number) => void;
}) {
  return (
    <div
      className="
        min-w-0

        bg-[var(--product-cream)]
      "
    >
      {images.map((image, index) => (
        <button
          key={image.id}
          type="button"
          aria-label={`View ${productName} image ${index + 1}`}
          onClick={() => onZoom(index)}
          className="
              group

              relative

              block

              w-full

              overflow-hidden

              border-b
              border-black/[0.05]

              bg-[#EEEAE3]

              text-left
            "
        >
          <div
            className="
                relative

                aspect-[4/5]

                w-full

                sm:aspect-[5/6]

                lg:aspect-[5/6]
              "
          >
            <Image
              src={image.src}
              alt={image.alt ?? `${productName} ${index + 1}`}
              fill
              preload={index < 2}
              sizes="
                  (max-width: 1023px) 100vw,
                  58vw
                "
              draggable={false}
              style={{
                objectPosition: image.position ?? "center",
              }}
              className="
                  object-cover

                  transition-transform
                  duration-[1100ms]

                  ease-[cubic-bezier(0.22,1,0.36,1)]

                  group-hover:scale-[1.012]
                "
            />
          </div>

          {/* INDEX */}

          <span
            className="
                absolute

                bottom-5
                left-5

                text-[7px]
                font-semibold

                tracking-[0.16em]

                text-black/35

                mix-blend-multiply

                lg:bottom-7
                lg:left-7
              "
          >
            {String(index + 1).padStart(2, "0")}/
            {String(images.length).padStart(2, "0")}
          </span>

          {/* ZOOM */}

          <span
            className="
                absolute

                bottom-5
                right-5

                grid
                size-10

                place-items-center

                bg-white/80

                text-black

                opacity-100

                backdrop-blur-md

                transition-[background-color,color]

                group-hover:bg-black
                group-hover:text-white

                lg:bottom-7
                lg:right-7
              "
          >
            <ZoomIcon />
          </span>
        </button>
      ))}
    </div>
  );
}

/* ==========================================================================
   PURCHASE PANEL
============================================================================ */

type PurchasePanelProps = {
  product: ProductDetailData;

  selectedColorId: string;

  selectedColor?: ProductColorVariant;

  selectedSize: string | null;

  sizeOptions: SelectOption[];

  sizeError?: string;

  favorite: boolean;

  addingToBag: boolean;

  onColorChange: (id: string) => void;

  onSizeChange: (value: string) => void;

  onFavorite: () => void;

  onShare: () => void;

  onAddToBag: () => void;
};

function ProductPurchasePanel({
  product,

  selectedColorId,

  selectedColor,

  selectedSize,

  sizeOptions,

  sizeError,

  favorite,

  addingToBag,

  onColorChange,

  onSizeChange,

  onFavorite,

  onShare,

  onAddToBag,
}: PurchasePanelProps) {
  return (
    <div
      className="
        mx-auto

        w-full
        max-w-[720px]
      "
    >
      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <div
        className="
          mb-9

          flex

          items-center
          gap-2

          text-[6.5px]
          font-semibold

          uppercase
          tracking-[0.15em]

          text-black/35
        "
      >
        <Link
          href="/shop"
          className="
            transition-colors

            hover:text-black
          "
        >
          Shop
        </Link>

        <span>/</span>

        <span>{product.eyebrow ?? "Collection"}</span>
      </div>

      {/* =====================================================
          SKU + ACTIONS
      ====================================================== */}

      <div
        className="
          flex

          items-center
          justify-between

          gap-6
        "
      >
        <span
          className="
            text-[7px]
            font-semibold

            uppercase
            tracking-[0.15em]

            text-[var(--product-muted)]
          "
        >
          SKU: {product.sku}
        </span>

        <div
          className="
            flex
            items-center
            gap-1
          "
        >
          <UtilityButton label="Share product" onClick={onShare}>
            <ShareIcon />
          </UtilityButton>

          <UtilityButton
            label={favorite ? "Remove from wishlist" : "Add to wishlist"}
            active={favorite}
            onClick={onFavorite}
          >
            <HeartIcon filled={favorite} />
          </UtilityButton>
        </div>
      </div>

      {/* =====================================================
          TITLE
      ====================================================== */}

      <h1
        className="
         

          max-w-[650px]

          font-serif

          text-2xl
          font-normal

          leading-[0.94]
          tracking-[-0.055em]

          text-black
        "
      >
        {product.name}
      </h1>

      {/* =====================================================
          PRICE
      ====================================================== */}

      <p
        className="
          mt-6

          font-serif

          text-[26px]
          font-normal

          tracking-[-0.025em]

          text-black
        "
      >
        {money(product.price, product.currency)}
      </p>

      {product.shortDescription && (
        <p
          className="
            mt-5

            max-w-[520px]

            text-[10px]

            leading-[1.8]

            text-[var(--product-muted)]
          "
        >
          {product.shortDescription}
        </p>
      )}

      {/* =====================================================
          COLOR
      ====================================================== */}

      <div
        className="
          mt-8

          border-t
          border-[var(--product-border)]

          pt-7
        "
      >
        <div
          className="
            flex

            items-center
            justify-between
          "
        >
          <p
            className="
              text-[7px]
              font-semibold

              uppercase
              tracking-[0.19em]

              text-black
            "
          >
            Color
          </p>

          <p
            className="
              text-[8px]

              text-[var(--product-muted)]
            "
          >
            {selectedColor?.name}

            {selectedColor?.code ? ` · ${selectedColor.code}` : ""}
          </p>
        </div>

        <div
          className="
            mt-5

            flex
            flex-wrap

            gap-3
          "
        >
          {product.colors.map((color) => {
            const active = selectedColorId === color.id;

            return (
              <button
                key={color.id}
                type="button"
                aria-label={`Select ${color.name}`}
                aria-pressed={active}
                onClick={() => onColorChange(color.id)}
                className={`
                    relative

                    grid
                    size-11

                    place-items-center

                    border

                    transition-[border-color,opacity]

                    ${
                      active
                        ? `
                          border-black
                        `
                        : `
                          border-black/15

                          opacity-60

                          hover:opacity-100
                        `
                    }
                  `}
              >
                <span
                  style={{
                    background: color.swatch,
                  }}
                  className="
                      block
                      size-7
                    "
                />

                {active && (
                  <span
                    className="
                        absolute

                        inset-x-1
                        -bottom-[5px]

                        h-px

                        bg-[var(--product-copper)]
                      "
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          SIZE
      ====================================================== */}

      {sizeOptions.length > 0 && (
        <div
          className="
            mt-8

            border-t
            border-[var(--product-border)]

            pt-7
          "
        >
          <div
            className="
              mb-4

              flex
              items-center
              justify-between
            "
          >
            <p
              className="
                text-[7px]
                font-semibold

                uppercase
                tracking-[0.19em]

                text-black
              "
            >
              Select Your Size
            </p>

            <button
              type="button"
              className="
                border-b
                border-black/25

                pb-1

                text-[6.5px]
                font-semibold

                uppercase
                tracking-[0.14em]

                text-black/45

                transition-colors

                hover:text-black
              "
            >
              Size Guide
            </button>
          </div>

          <CustomSelect
            value={selectedSize}
            options={sizeOptions}
            placeholder="Choose your size"
            size="lg"
            clearable
            error={sizeError}
            onChange={(value) => {
              onSizeChange(typeof value === "string" ? value : "");
            }}
          />
        </div>
      )}

      {/* =====================================================
          CTA
      ====================================================== */}

      <div
        className="
          mt-8
        "
      >
        <Button
          type="button"
          variant="black"
          size="xl"
          loading={addingToBag}
          disabled={addingToBag}
          fullWidth
          onClick={onAddToBag}
        >
          Add to Bag
        </Button>
      </div>

      {/* =====================================================
          SHIPPING NOTE
      ====================================================== */}

      <div
        className="
          mt-4

          flex

          items-start
          gap-3

          text-[7.5px]

          leading-[1.6]

          text-black/55
        "
      >
        <BoxIcon />

        <span>
          {product.shippingNote ??
            "Complimentary delivery and returns on selected orders."}
        </span>
      </div>

      {/* =====================================================
          SERVICES
      ====================================================== */}

      <div
        className="
          mt-8

          grid
          grid-cols-2

          border-t
          border-[var(--product-border)]

          pt-6
        "
      >
        <Link
          href="/stores"
          className="
            group/service

            flex

            items-center
            gap-3

            border-r
            border-[var(--product-border)]

            pr-5

            text-[7px]
            font-semibold

            uppercase
            tracking-[0.16em]

            text-black/55

            transition-colors

            hover:text-black
          "
        >
          <PinIcon />
          Find in Boutique
        </Link>

        <Link
          href="/contact"
          className="
            group/service

            flex

            items-center
            gap-3

            pl-6

            text-[7px]
            font-semibold

            uppercase
            tracking-[0.16em]

            text-black/55

            transition-colors

            hover:text-black
          "
        >
          <MailIcon />
          Client Services
        </Link>
      </div>
    </div>
  );
}

/* ==========================================================================
   MOBILE BOTTOM SHEET
============================================================================ */

const MOBILE_SHEET_DRAG_RANGE = 190;

const MOBILE_SHEET_SNAP_DISTANCE = 52;

const MOBILE_SHEET_DRAG_TOLERANCE = 6;

function getMobileSheetDrag(deltaY: number, expanded: boolean) {
  if (expanded) {
    return deltaY > 0
      ? Math.min(deltaY, MOBILE_SHEET_DRAG_RANGE)
      : Math.max(deltaY * 0.18, -18);
  }

  return deltaY < 0
    ? Math.max(deltaY, -MOBILE_SHEET_DRAG_RANGE)
    : Math.min(deltaY * 0.18, 18);
}

function getMobileSheetOpenProgress(
  expanded: boolean,
  dragging: boolean,
  dragY: number,
) {
  if (!dragging) {
    return expanded ? 1 : 0;
  }

  const rawProgress = expanded
    ? 1 - Math.max(dragY, 0) / MOBILE_SHEET_DRAG_RANGE
    : Math.max(-dragY, 0) / MOBILE_SHEET_DRAG_RANGE;

  return Math.min(1, Math.max(0, rawProgress));
}

function MobileProductSheet({
  product,

  selectedColorId,

  selectedColor,

  selectedSize,

  sizeOptions,

  sizeError,

  expanded,

  favorite,

  addingToBag,

  onExpandedChange,

  onColorChange,

  onSizeChange,

  onFavorite,

  onShare,

  onAddToBag,
}: PurchasePanelProps & {
  expanded: boolean;

  onExpandedChange: (value: boolean) => void;
}) {
  const expandedContentRef = useRef<HTMLDivElement | null>(null);

  const activePointerIdRef = useRef<number | null>(null);

  const dragStartYRef = useRef(0);

  const latestDragYRef = useRef(0);

  const didDragRef = useRef(false);

  const [expandedContentHeight, setExpandedContentHeight] = useState(0);

  const [dragY, setDragY] = useState(0);

  const [dragging, setDragging] = useState(false);

  const openProgress = getMobileSheetOpenProgress(expanded, dragging, dragY);

  const expandedContentHidden = openProgress === 0;

  const expandedContentStyle = {
    maxHeight:
      expandedContentHeight > 0
        ? `${expandedContentHeight * openProgress}px`
        : expanded
          ? undefined
          : "0px",
    opacity: openProgress,
  } as CSSProperties;

  useEffect(() => {
    const node = expandedContentRef.current;

    if (!node) {
      return;
    }

    const updateHeight = () => {
      setExpandedContentHeight(node.scrollHeight);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight);

      return () => {
        window.removeEventListener("resize", updateHeight);
      };
    }

    const observer = new ResizeObserver(updateHeight);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [
    product.colors.length,
    selectedColorId,
    selectedSize,
    sizeError,
    sizeOptions.length,
  ]);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    activePointerIdRef.current = event.pointerId;
    dragStartYRef.current = event.clientY;
    latestDragYRef.current = 0;
    didDragRef.current = false;

    setDragging(true);
    setDragY(0);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    const deltaY = event.clientY - dragStartYRef.current;

    if (Math.abs(deltaY) > MOBILE_SHEET_DRAG_TOLERANCE) {
      didDragRef.current = true;
    }

    const nextDragY = getMobileSheetDrag(deltaY, expanded);

    latestDragYRef.current = nextDragY;

    setDragY(nextDragY);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const finalDragY = latestDragYRef.current;

    if (expanded && finalDragY > MOBILE_SHEET_SNAP_DISTANCE) {
      onExpandedChange(false);
    }

    if (!expanded && finalDragY < -MOBILE_SHEET_SNAP_DISTANCE) {
      onExpandedChange(true);
    }

    activePointerIdRef.current = null;
    latestDragYRef.current = 0;

    setDragging(false);
    setDragY(0);

    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  };

  const handleToggleClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    if (didDragRef.current) {
      event.preventDefault();

      return;
    }

    onExpandedChange(!expanded);
  };

  return (
    <aside
      className="
        fixed

        inset-x-0
        bottom-0

        z-[90]

        border-t
        border-black/10

        bg-white/95

        shadow-[0_-12px_45px_rgba(0,0,0,0.10)]

        backdrop-blur-xl

        lg:hidden

        will-change-transform
      "
    >
      {/* =====================================================
          HANDLE
      ====================================================== */}

      <button
        type="button"
        aria-label={
          expanded
            ? "Collapse product information"
            : "Expand product information"
        }
        aria-expanded={expanded}
        aria-controls="mobile-product-sheet-options"
        onClick={handleToggleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        className={`
          flex

          h-9
          w-full

          items-center
          justify-center

          touch-none
          cursor-grab

          ${dragging ? "cursor-grabbing" : ""}
        `}
      >
        <span
          className={`
            block

            h-1
            w-11

            rounded-full

            bg-black/35

            transition-[width,background-color]
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]

            motion-reduce:transition-none

            ${expanded || dragging ? "w-14 bg-black/45" : ""}
          `}
        />
      </button>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div
        className="
          px-4
          pb-3
        "
      >
        <div
          className="
            flex

            items-start
            justify-between

            gap-5
          "
        >
          <div
            className="
              min-w-0
              flex-1
            "
          >
            <p
              className="
                text-[6px]
                font-semibold

                uppercase
                tracking-[0.15em]

                text-[var(--product-copper)]
              "
            >
              {product.eyebrow ?? "Najibzadeh"}
            </p>

            <h1
              className="
                mt-1.5

                truncate

                font-serif

                text-[21px]

                leading-none
                tracking-[-0.035em]

                text-black
              "
            >
              {product.name}
            </h1>
          </div>

          <div
            className="
              flex

              shrink-0

              items-start
              gap-1
            "
          >
            <p
              className="
                mr-1

                pt-1

                font-serif

                text-[18px]

                text-black
              "
            >
              {money(product.price, product.currency)}
            </p>

            <UtilityButton label="Share" onClick={onShare}>
              <ShareIcon />
            </UtilityButton>

            <UtilityButton
              label="Wishlist"
              active={favorite}
              onClick={onFavorite}
            >
              <HeartIcon filled={favorite} />
            </UtilityButton>
          </div>
        </div>

        {/* ===================================================
            EXPANDED
        ==================================================== */}

        <div
          id="mobile-product-sheet-options"
          style={expandedContentStyle}
          aria-hidden={expandedContentHidden}
          inert={expandedContentHidden ? true : undefined}
          className={`
            overflow-hidden

            ${
              dragging
                ? "transition-none"
                : `
                  transition-[max-height,opacity]
                  duration-[620ms]
                  ease-[cubic-bezier(0.22,1,0.36,1)]

                  motion-reduce:transition-none
                `
            }
          `}
        >
          <div
            ref={expandedContentRef}
            className="
                mt-5

                border-t
                border-[var(--product-border)]

                pt-5
              "
            >
            {/* COLOR */}

            <div
              className="
                  flex

                  items-center
                  justify-between
                "
            >
              <span
                className="
                    text-[7px]
                    font-semibold

                    uppercase
                    tracking-[0.16em]
                  "
              >
                Color
              </span>

              <span
                className="
                    text-[8px]

                    text-[var(--product-muted)]
                  "
              >
                {selectedColor?.name}
              </span>
            </div>

            <div
              className="
                  mt-3

                  flex
                  gap-2
                "
            >
              {product.colors.map((color) => {
                const active = color.id === selectedColorId;

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => onColorChange(color.id)}
                    className={`
                          grid
                          size-10

                          place-items-center

                          border

                          ${
                            active
                              ? `
                                border-black
                              `
                              : `
                                border-black/15
                              `
                          }
                        `}
                  >
                    <span
                      style={{
                        background: color.swatch,
                      }}
                      className="
                            size-6
                          "
                    />
                  </button>
                );
              })}
            </div>

            {/* SIZE */}

            {sizeOptions.length > 0 && (
              <div
                className="
                    mt-5
                  "
              >
                <CustomSelect
                  label="Size"
                  value={selectedSize}
                  options={sizeOptions}
                  size="md"
                  placeholder="Choose your size"
                  error={sizeError}
                  onChange={(value) =>
                    onSizeChange(typeof value === "string" ? value : "")
                  }
                />
              </div>
            )}

            {/* SERVICES */}

            <div
              className="
                  mt-5

                  grid
                  grid-cols-2

                  border-t
                  border-[var(--product-border)]

                  pt-4
                "
            >
              <Link
                href="/stores"
                className="
                    border-r
                    border-[var(--product-border)]

                    pr-3

                    text-[6.5px]
                    font-semibold

                    uppercase
                    tracking-[0.13em]

                    text-black/45
                  "
              >
                Find in Boutique
              </Link>

              <Link
                href="/contact"
                className="
                    pl-4

                    text-[6.5px]
                    font-semibold

                    uppercase
                    tracking-[0.13em]

                    text-black/45
                  "
              >
                Client Services
              </Link>
            </div>
          </div>
        </div>

        {/* ===================================================
            CTA
        ==================================================== */}

        <div
          className="
            mt-3

            pb-[env(safe-area-inset-bottom)]
          "
        >
          <Button
            type="button"
            variant="black"
            size="lg"
            fullWidth
            loading={addingToBag}
            disabled={addingToBag}
            onClick={onAddToBag}
          >
            Add to Bag
          </Button>
        </div>
      </div>
    </aside>
  );
}

/* ==========================================================================
   PRODUCT DETAILS
============================================================================ */

function ProductDetailsSections({
  sections,
}: {
  sections: ProductDetailSection[];
}) {
  return (
    <section
      className="
        bg-white

        px-5

        py-16

        sm:px-8
        sm:py-20

        lg:px-10
        lg:py-24

        xl:px-14
      "
    >
      <div
        className="
          mx-auto

          max-w-[1600px]
        "
      >
        {/* INTRO */}

        <div
          className="
            mb-10

            max-w-[700px]

            lg:mb-14
          "
        >
          <div
            className="
              flex

              items-center
              gap-3

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.22em]

              text-[var(--product-copper)]
            "
          >
            Product Notes
            <span
              className="
                h-px
                w-6

                bg-[var(--product-copper)]
              "
            />
          </div>

          <h2
            className="
              mt-5

              font-serif

              text-[clamp(2.8rem,8vw,5rem)]

              leading-[0.94]
              tracking-[-0.055em]

              text-black
            "
          >
            The details make
            <br />
            the difference.
          </h2>
        </div>

        {/* ACCORDIONS */}

        <div
          className="
            grid

            border-t
            border-[var(--product-border)]

            lg:grid-cols-2
            lg:gap-x-16
          "
        >
          {sections.map((section, index) => (
            <ProductAccordion
              key={section.id}
              section={section}
              defaultOpen={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   ACCORDION
============================================================================ */

function ProductAccordion({
  section,

  defaultOpen = false,
}: {
  section: ProductDetailSection;

  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="
        border-b
        border-[var(--product-border)]
      "
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="
          flex

          min-h-[72px]

          w-full

          items-center
          justify-between

          gap-6

          text-left
        "
      >
        <span
          className="
            text-[9px]
            font-semibold

            uppercase
            tracking-[0.16em]

            text-black
          "
        >
          {section.title}
        </span>

        <span
          className="
            text-[18px]
            font-light

            text-black/50
          "
        >
          {open ? "−" : "+"}
        </span>
      </button>

      <div
        className={`
          grid

          transition-[grid-template-rows]
          duration-300

          ${
            open
              ? `
                grid-rows-[1fr]
              `
              : `
                grid-rows-[0fr]
              `
          }
        `}
      >
        <div
          className="
            overflow-hidden
          "
        >
          <div
            className="
              space-y-4

              pb-8

              pr-6
            "
          >
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="
                    max-w-[650px]

                    text-[10px]

                    leading-[1.85]

                    text-[var(--product-muted)]

                    sm:text-[11px]
                  "
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   RELATED
============================================================================ */

function RelatedProductsSection({
  products,
}: {
  products: RelatedProductItem[];
}) {
  return (
    <section
      className="
        bg-[var(--product-cream)]

        px-5

        py-16

        sm:px-8
        sm:py-20

        lg:px-10
        lg:py-24

        xl:px-14
      "
    >
      <div
        className="
          mx-auto

          max-w-[1600px]
        "
      >
        <div
          className="
            mb-8

            flex

            items-end
            justify-between
          "
        >
          <div>
            <p
              className="
                text-[7px]
                font-semibold

                uppercase
                tracking-[0.2em]

                text-[var(--product-copper)]
              "
            >
              Selected for You
            </p>

            <h2
              className="
                mt-3

                font-serif

                text-[36px]

                tracking-[-0.045em]

                text-black

                sm:text-[46px]
              "
            >
              You may also like.
            </h2>
          </div>

          <Link
            href="/shop"
            className="
              hidden

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.15em]

              text-black/45

              transition-colors

              hover:text-black

              sm:block
            "
          >
            View Collection →
          </Link>
        </div>

        <div
          className="
            flex

            gap-2

            overflow-x-auto

            snap-x
            snap-mandatory

            [scrollbar-width:none]

            [&::-webkit-scrollbar]:hidden

            md:grid
            md:grid-cols-3
            md:overflow-visible
          "
        >
          {products.map((product) => (
            <RelatedProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedProductCard({ product }: { product: RelatedProductItem }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="
        group

        min-w-[82vw]

        shrink-0

        snap-start

        sm:min-w-[420px]

        md:min-w-0
      "
    >
      <div
        className="
          relative

          aspect-[4/5]

          overflow-hidden

          bg-[#EDE8E1]
        "
      >
        <Image
          src={product.image}
          alt={product.imageAlt ?? product.name}
          fill
          loading="lazy"
          sizes="
            (max-width: 767px) 82vw,
            33vw
          "
          className="
            object-cover

            transition-transform
            duration-[900ms]

            group-hover:scale-[1.025]
          "
        />
      </div>

      <div
        className="
          flex

          items-start
          justify-between

          gap-6

          pt-4
        "
      >
        <div>
          <p
            className="
              font-serif

              text-[18px]

              leading-[1.1]

              text-black
            "
          >
            {product.name}
          </p>

          {product.subtitle && (
            <p
              className="
                mt-1.5

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.1em]

                text-black/35
              "
            >
              {product.subtitle}
            </p>
          )}
        </div>

        <p
          className="
            shrink-0

            text-[9px]
            font-semibold

            text-black
          "
        >
          {money(product.price)}
        </p>
      </div>
    </Link>
  );
}

/* ==========================================================================
   ZOOM
============================================================================ */

function ProductZoom({
  image,

  index,

  count,

  onClose,

  onPrevious,

  onNext,
}: {
  image: ProductDetailImage;

  index: number;

  count: number;

  onClose: () => void;

  onPrevious: () => void;

  onNext: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
      className="
        fixed
        inset-0

        z-[1200]

        bg-[#0B0B0B]

        text-white
      "
    >
      {/* HEADER */}

      <div
        className="
          absolute

          inset-x-0
          top-0

          z-20

          flex

          h-[72px]

          items-center
          justify-between

          px-5

          sm:px-7
        "
      >
        <span
          className="
            text-[7px]
            font-semibold

            tracking-[0.16em]

            text-white/45
          "
        >
          {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
        </span>

        <button
          type="button"
          aria-label="Close image viewer"
          onClick={onClose}
          className="
            grid
            size-11

            place-items-center

            text-white/60

            transition-colors

            hover:text-white
          "
        >
          <CloseIcon />
        </button>
      </div>

      {/* IMAGE */}

      <div
        className="
          absolute

          inset-5

          top-[72px]
          bottom-[72px]

          sm:inset-x-12
        "
      >
        <Image
          src={image.src}
          alt={image.alt ?? "Product image"}
          fill
          priority
          sizes="100vw"
          className="
            object-contain
          "
        />
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={onPrevious}
            className="
              absolute

              left-4
              top-1/2

              z-30

              grid
              size-12

              -translate-y-1/2
              place-items-center

              border
              border-white/15

              text-white/55

              transition-[background-color,color]

              hover:bg-white
              hover:text-black

              sm:left-7
            "
          >
            ←
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={onNext}
            className="
              absolute

              right-4
              top-1/2

              z-30

              grid
              size-12

              -translate-y-1/2
              place-items-center

              border
              border-white/15

              text-white/55

              transition-[background-color,color]

              hover:bg-white
              hover:text-black

              sm:right-7
            "
          >
            →
          </button>
        </>
      )}
    </div>
  );
}

/* ==========================================================================
   UTILITY BUTTON
============================================================================ */

function UtilityButton({
  children,

  label,

  active = false,

  onClick,
}: {
  children: ReactNode;

  label: string;

  active?: boolean;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`
        grid
        size-10

        place-items-center

        transition-[background-color,color]

        ${
          active
            ? `
              bg-black

              text-white
            `
            : `
              text-black/55

              hover:bg-black
              hover:text-white
            `
        }
      `}
    >
      {children}
    </button>
  );
}

/* ==========================================================================
   MONEY
============================================================================ */

function money(
  value: number,

  currency = "USD",
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency,

    maximumFractionDigits: 0,
  }).format(value);
}

/* ==========================================================================
   ICONS
============================================================================ */

function ZoomIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1" />

      <path
        d="M12.5 12.5L17 17M8.5 6V11M6 8.5H11"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
      className="size-[18px]"
    >
      <path
        d="M10 16.5L3.7 10.6C0.6 7.7 2.3 3 6.3 3C8.1 3 9.3 4 10 5C10.7 4 11.9 3 13.7 3C17.7 3 19.4 7.7 16.3 10.6L10 16.5Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="size-[17px]"
    >
      <circle cx="5" cy="10" r="2" stroke="currentColor" strokeWidth="1" />

      <circle cx="15" cy="5" r="2" stroke="currentColor" strokeWidth="1" />

      <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1" />

      <path
        d="M6.8 9L13.2 6M6.8 11L13.2 14"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="
        mt-px
        size-4

        shrink-0
      "
    >
      <path
        d="M3 5.5L9 2.5L15 5.5V13L9 16L3 13V5.5Z"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M3 5.5L9 8.5L15 5.5M9 8.5V16"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M9 16C9 16 14 11.5 14 7.5C14 4.7 11.8 2.5 9 2.5C6.2 2.5 4 4.7 4 7.5C4 11.5 9 16 9 16Z"
        stroke="currentColor"
        strokeWidth="1"
      />

      <circle cx="9" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-4">
      <rect
        x="2.5"
        y="4"
        width="13"
        height="10"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path d="M3 5L9 10L15 5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-5">
      <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
