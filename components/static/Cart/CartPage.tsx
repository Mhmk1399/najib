"use client";

import Image from "next/image";
import Link from "next/link";

import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";

import { brandColors, lightTokens } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

/* ==========================================================================
   TYPES
============================================================================ */

export type CartItemData = {
  id: string;

  title: string;

  href: string;

  image: string;

  imageAlt?: string;

  imagePosition?: string;

  price: number;

  quantity: number;

  color?: string;

  description?: string;

  origin?: string;

  size?: string;

  sizeOptions?: string[];
};

type Recommendation = {
  id: string;

  title: string;

  subtitle?: string;

  href: string;

  image: string;

  imageAlt?: string;

  price: number;
};

/* ==========================================================================
   FAKE DATA

   بعداً این قسمت کامل از cart / database / API میاد.
============================================================================ */

const INITIAL_CART: CartItemData[] = [
  {
    id: "tuscan-wool-blazer",

    title: "Tuscan Wool Blazer",

    href: "/products/tuscan-wool-blazer",

    image: "/assets/images/banner.webp",

    imagePosition: "center",

    price: 2450,

    quantity: 1,

    color: "Burgundy",

    description: "100% Super 120's Wool",

    origin: "Made in Italy",

    size: "50 / L",

    sizeOptions: ["48 / M", "50 / L", "52 / XL", "54 / XXL"],
  },

  {
    id: "oxford-calf-leather",

    title: "Oxford 02 — Calf Leather",

    href: "/products/oxford-calf-leather",

    image: "/assets/images/banner.webp",

    imagePosition: "center",

    price: 890,

    quantity: 1,

    color: "Black",

    description: "Full-Grain Calf Leather",

    origin: "Made in Italy",

    size: "43 EU",

    sizeOptions: ["41 EU", "42 EU", "43 EU", "44 EU"],
  },

  {
    id: "noir-absolu",

    title: "Noir Absolu",

    href: "/products/noir-absolu",

    image: "/assets/images/banner.webp",

    imagePosition: "center",

    price: 295,

    quantity: 1,

    color: "Black",

    description: "Eau de Parfum",

    origin: "100 ml",
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "cashmere-crewneck",

    title: "Cashmere Crew Neck",

    subtitle: "Cream",

    href: "/products/cashmere-crewneck",

    image: "/assets/images/banner.webp",

    price: 690,
  },

  {
    id: "leather-weekender",

    title: "Leather Weekender",

    subtitle: "Black",

    href: "/products/leather-weekender",

    image: "/assets/images/banner.webp",

    price: 2650,
  },

  {
    id: "classic-watch",

    title: "Classic Rectangular Watch",

    subtitle: "Steel / Black",

    href: "/products/classic-watch",

    image: "/assets/images/banner.webp",

    price: 2950,
  },
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

/* ==========================================================================
   PAGE
============================================================================ */

export function CartPage() {
  const [cart, setCart] = useState<CartItemData[]>(INITIAL_CART);

  const [promoCode, setPromoCode] = useState("");

  const [giftNoteOpen, setGiftNoteOpen] = useState(false);

  const [giftNote, setGiftNote] = useState("");

  /* ------------------------------------------------------------------------
     THEME
  ------------------------------------------------------------------------- */

  const themeVars = {
    /*
     * Cream فقط background.
     */
    "--cart-bg": lightTokens.surfaceBrand,

    "--cart-surface": brandColors.white.hex,

    "--cart-surface-soft": "#FAF8F4",

    "--cart-black": "#0B0B0B",

    "--cart-text": "#0B0B0B",

    "--cart-muted": lightTokens.textMuted,

    "--cart-soft": lightTokens.textSoft,

    "--cart-border": "#DDD8D0",

    "--cart-border-strong": "#C9C2B8",

    /*
     * فقط micro-accent.
     */
    "--cart-copper": brandColors.copper.hex,
  } as CSSProperties;

  /* ------------------------------------------------------------------------
     TOTALS
  ------------------------------------------------------------------------- */

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,

      0,
    );
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,

      0,
    );
  }, [cart]);

  const delivery = 0;

  const estimatedTax = 0;

  const total = subtotal + delivery + estimatedTax;

  /* ------------------------------------------------------------------------
     ACTIONS
  ------------------------------------------------------------------------- */

  function incrementItem(id: string) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,

              quantity: Math.min(item.quantity + 1, 10),
            }
          : item,
      ),
    );
  }

  function decrementItem(id: string) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,

              quantity: Math.max(1, item.quantity - 1),
            }
          : item,
      ),
    );
  }

  function removeItem(id: string) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function updateSize(
    id: string,

    size: string,
  ) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,

              size,
            }
          : item,
      ),
    );
  }

  function handlePromo(event: FormEvent) {
    event.preventDefault();

    /*
     * بعداً:
     *
     * await validatePromoCode(...)
     */

    if (!promoCode.trim()) {
      return;
    }
  }

  /* ------------------------------------------------------------------------
     EMPTY
  ------------------------------------------------------------------------- */

  if (!cart.length) {
    return <EmptyCart themeVars={themeVars} />;
  }

  return (
    <main
      style={themeVars}
      className="
        min-h-screen

        bg-[var(--cart-bg)]
        text-[var(--cart-text)]
      "
    >
      {/* ===============================================================
          NAVBAR CONTRAST RAIL

          چون Navbar همیشه transparent + white است.
      ================================================================ */}

      <div
        aria-hidden="true"
        className="
          h-[72px]

          bg-[#0B0B0B]

          md:h-[76px]
        "
      />

      {/* ===============================================================
          MAIN
      ================================================================ */}

      <section
        className="
          mx-auto

          w-full
          max-w-[1720px]

          px-5

          pb-14

          sm:px-8

          lg:px-10
          lg:pb-20

          xl:px-14
        "
      >
        {/* =============================================================
            HERO / TITLE
        ============================================================== */}

        <header
          className="
            border-b
            border-[var(--cart-border)]

            pb-9
            pt-10

            sm:pb-12
            sm:pt-12

            lg:pb-14
            lg:pt-14
          "
        >
          <div
            className="
              flex

              items-end

              gap-5

              sm:gap-8

              lg:gap-10
            "
          >
            {/* =========================================================
                70PX CART ART
            ========================================================== */}

            <div
              className="
                shrink-0
              "
            >
              <ShoppingBagArtwork />
            </div>

            {/* =========================================================
                TITLE
            ========================================================== */}

            <div>
              <h1
                className="
                  font-serif

                  text-[clamp(3.1rem,10vw,5.8rem)]
                  font-normal

                  leading-[0.88]
                  tracking-[-0.06em]

                  text-[var(--cart-black)]
                "
              >
                Shopping Bag
              </h1>

              <p
                className="
                  mt-4

                  text-[7px]
                  font-semibold

                  uppercase
                  tracking-[0.17em]

                  text-[var(--cart-soft)]
                "
              >
                {itemCount} {itemCount === 1 ? "Item" : "Items"}
              </p>
            </div>
          </div>
        </header>

        {/* =============================================================
            DESKTOP COLUMN HEADERS
        ============================================================== */}

        <div
          className="
            mt-8

            hidden

            grid-cols-[minmax(0,1fr)_150px_140px_130px_48px]

            border-b
            border-[var(--cart-border)]

            pb-3

            lg:grid
          "
        >
          <ColumnLabel>Product</ColumnLabel>

          <ColumnLabel>Size</ColumnLabel>

          <ColumnLabel>Qty</ColumnLabel>

          <ColumnLabel>Total</ColumnLabel>

          <span />
        </div>

        {/* =============================================================
            CONTENT
        ============================================================== */}

        <div
          className="
            mt-0

            grid

            gap-10

            lg:grid-cols-[minmax(0,1fr)_360px]

            xl:grid-cols-[minmax(0,1fr)_390px]

            xl:gap-12
          "
        >
          {/* ===========================================================
              CART ITEMS
          ============================================================ */}

          <div
            className="
              min-w-0
            "
          >
            <div>
              {cart.map((item, index) => (
                <CartRow
                  key={item.id}
                  item={item}
                  priority={index < 2}
                  onIncrement={() => incrementItem(item.id)}
                  onDecrement={() => decrementItem(item.id)}
                  onRemove={() => removeItem(item.id)}
                  onSizeChange={(size) => updateSize(item.id, size)}
                />
              ))}
            </div>

            {/* =========================================================
                GIFT NOTE
            ========================================================== */}

            <GiftNote
              open={giftNoteOpen}
              setOpen={setGiftNoteOpen}
              value={giftNote}
              onChange={setGiftNote}
            />

            {/* =========================================================
                MOBILE ORDER SUMMARY
            ========================================================== */}

            <div
              className="
                mt-8

                lg:hidden
              "
            >
              <OrderSummary
                subtotal={subtotal}
                delivery={delivery}
                estimatedTax={estimatedTax}
                total={total}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                onPromoSubmit={handlePromo}
              />
            </div>

            {/* =========================================================
                RECOMMENDATIONS
            ========================================================== */}

            <Recommendations products={RECOMMENDATIONS} />
          </div>

          {/* ===========================================================
              DESKTOP ORDER SUMMARY
          ============================================================ */}

          <aside
            className="
              hidden

              lg:block
            "
          >
            <div
              className="
                sticky
                top-[100px]
              "
            >
              <OrderSummary
                subtotal={subtotal}
                delivery={delivery}
                estimatedTax={estimatedTax}
                total={total}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                onPromoSubmit={handlePromo}
              />
            </div>
          </aside>
        </div>

        {/* =============================================================
            SERVICES
        ============================================================== */}

        <CartBenefits />
      </section>
    </main>
  );
}

/* ==========================================================================
   CART ROW
============================================================================ */

function CartRow({
  item,

  priority,

  onIncrement,

  onDecrement,

  onRemove,

  onSizeChange,
}: {
  item: CartItemData;

  priority: boolean;

  onIncrement: () => void;

  onDecrement: () => void;

  onRemove: () => void;

  onSizeChange: (size: string) => void;
}) {
  return (
    <article
      className="
        group

        grid

        border-b
        border-[var(--cart-border)]

        py-5

        sm:grid-cols-[160px_minmax(0,1fr)]
        sm:gap-6

        lg:grid-cols-[minmax(0,1fr)_150px_140px_130px_48px]

        lg:items-center
        lg:gap-0

        lg:py-0
      "
    >
      {/* =====================================================
          PRODUCT
      ====================================================== */}

      <div
        className="
          grid

          grid-cols-[110px_minmax(0,1fr)]

          gap-4

          sm:grid-cols-[160px_minmax(0,1fr)]

          lg:grid-cols-[180px_minmax(0,1fr)]

          lg:gap-6
          lg:py-5
        "
      >
        {/* IMAGE */}

        <Link
          href={item.href}
          className="
            relative

            aspect-[4/5]

            overflow-hidden

            bg-[#EEE9E1]
          "
        >
          <Image
            src={item.image}
            alt={item.imageAlt ?? item.title}
            fill
            priority={priority}
            sizes="
              (max-width: 639px) 110px,
              160px
            "
            draggable={false}
            style={{
              objectPosition: item.imagePosition ?? "center",
            }}
            className="
              object-cover

              transition-transform
              duration-[900ms]

              ease-[cubic-bezier(0.22,1,0.36,1)]

              group-hover:scale-[1.025]
            "
          />
        </Link>

        {/* INFO */}

        <div
          className="
            flex

            min-w-0

            flex-col
            justify-center
          "
        >
          <Link
            href={item.href}
            className="
              max-w-[340px]

              font-serif

              text-[19px]
              font-normal

              leading-[1.1]
              tracking-[-0.03em]

              text-black

              transition-opacity

              hover:opacity-55

              sm:text-[22px]
            "
          >
            {item.title}
          </Link>

          <div
            className="
              mt-3

              space-y-1

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.08em]

              text-black/42
            "
          >
            {item.color && <p>{item.color}</p>}

            {item.description && <p>{item.description}</p>}

            {item.origin && <p>{item.origin}</p>}
          </div>

          {/* MOBILE PRICE */}

          <p
            className="
              mt-4

              font-serif

              text-[16px]

              text-black

              lg:hidden
            "
          >
            {money(item.price * item.quantity)}
          </p>
        </div>
      </div>

      {/* =====================================================
          MOBILE CONTROLS
      ====================================================== */}

      <div
        className="
          mt-4

          flex

          items-end
          justify-between

          gap-4

          sm:col-span-2

          lg:hidden
        "
      >
        <div
          className="
            flex
            flex-wrap

            items-center

            gap-2
          "
        >
          {item.size && item.sizeOptions && (
            <SizeSelect
              value={item.size}
              options={item.sizeOptions}
              onChange={onSizeChange}
            />
          )}

          <QuantityControl
            value={item.quantity}
            decrement={onDecrement}
            increment={onIncrement}
          />
        </div>

        <TrashButton onClick={onRemove} />
      </div>

      {/* =====================================================
          DESKTOP SIZE
      ====================================================== */}

      <div
        className="
          hidden

          lg:block
        "
      >
        {item.size && item.sizeOptions ? (
          <SizeSelect
            value={item.size}
            options={item.sizeOptions}
            onChange={onSizeChange}
          />
        ) : (
          <span
            className="
              text-[9px]

              text-black/30
            "
          >
            —
          </span>
        )}
      </div>

      {/* =====================================================
          DESKTOP QTY
      ====================================================== */}

      <div
        className="
          hidden

          lg:block
        "
      >
        <QuantityControl
          value={item.quantity}
          decrement={onDecrement}
          increment={onIncrement}
        />
      </div>

      {/* =====================================================
          DESKTOP TOTAL
      ====================================================== */}

      <div
        className="
          hidden

          lg:block
        "
      >
        <p
          className="
            font-serif

            text-[18px]

            text-black
          "
        >
          {money(item.price * item.quantity)}
        </p>
      </div>

      {/* =====================================================
          DESKTOP DELETE
      ====================================================== */}

      <div
        className="
          hidden

          lg:flex
          lg:justify-end
        "
      >
        <TrashButton onClick={onRemove} />
      </div>
    </article>
  );
}

/* ==========================================================================
   SIZE SELECT
============================================================================ */

function SizeSelect({
  value,

  options,

  onChange,
}: {
  value: string;

  options: string[];

  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="
        h-10

        min-w-[105px]

        border
        border-[var(--cart-border-strong)]

        bg-transparent

        px-3

        text-[7px]
        font-semibold

        uppercase
        tracking-[0.08em]

        text-black

        outline-none

        transition-colors

        focus:border-black
      "
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

/* ==========================================================================
   QUANTITY
============================================================================ */

function QuantityControl({
  value,

  decrement,

  increment,
}: {
  value: number;

  decrement: () => void;

  increment: () => void;
}) {
  return (
    <div
      className="
        grid

        h-10

        grid-cols-[36px_42px_36px]

        border
        border-[var(--cart-border-strong)]
      "
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={decrement}
        className="
          text-sm

          text-black/45

          transition-colors

          hover:text-black
        "
      >
        −
      </button>

      <span
        className="
          grid
          place-items-center

          border-x
          border-[var(--cart-border)]

          text-[8px]
          font-semibold

          text-black
        "
      >
        {value}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        onClick={increment}
        className="
          text-sm

          text-black/45

          transition-colors

          hover:text-black
        "
      >
        +
      </button>
    </div>
  );
}

/* ==========================================================================
   TRASH
============================================================================ */

function TrashButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Remove item"
      onClick={onClick}
      className="
        group/trash

        grid
        size-10

        place-items-center

        text-black/40

        transition-[color,background-color]
        duration-200

        hover:bg-black
        hover:text-white

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-black
      "
    >
      <TrashIcon />
    </button>
  );
}

/* ==========================================================================
   ORDER SUMMARY
============================================================================ */

function OrderSummary({
  subtotal,

  delivery,

  estimatedTax,

  total,

  promoCode,

  setPromoCode,

  onPromoSubmit,
}: {
  subtotal: number;

  delivery: number;

  estimatedTax: number;

  total: number;

  promoCode: string;

  setPromoCode: (value: string) => void;

  onPromoSubmit: (event: FormEvent) => void;
}) {
  return (
    <section
      className="
        border
        border-[var(--cart-border-strong)]

        bg-[var(--cart-surface)]
      "
    >
      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          p-6

          xl:p-7
        "
      >
        <div
          className="
            mb-7

            flex
            items-center

            gap-3
          "
        >
          <span
            className="
              h-px
              w-5

              bg-[var(--cart-copper)]
            "
          />

          <h2
            className="
              font-serif

              text-[27px]
              font-normal

              tracking-[-0.035em]

              text-black
            "
          >
            Order Summary
          </h2>
        </div>

        <div
          className="
            space-y-5
          "
        >
          <SummaryRow label="Subtotal" value={money(subtotal)} />

          <SummaryRow
            label="Delivery"
            value={delivery === 0 ? "Complimentary" : money(delivery)}
          />

          <SummaryRow
            label="Estimated Tax"
            value={
              estimatedTax === 0
                ? "Calculated at checkout"
                : money(estimatedTax)
            }
          />
        </div>

        {/* =================================================
            TOTAL
        ================================================= */}

        <div
          className="
            mt-8

            flex

            items-end
            justify-between

            border-t
            border-[var(--cart-border)]

            pt-7
          "
        >
          <span
            className="
              font-serif

              text-[22px]

              text-black
            "
          >
            Total
          </span>

          <div
            className="
              flex
              items-end
              gap-3
            "
          >
            <span
              className="
                pb-1

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.15em]

                text-black/35
              "
            >
              USD
            </span>

            <span
              className="
                font-serif

                text-[32px]

                leading-none

                text-black
              "
            >
              {money(total)}
            </span>
          </div>
        </div>

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div
          className="
            mt-8

            space-y-2
          "
        >
          <Button
            href="/checkout"
            variant="black"
            size="lg"
            icon={<ArrowRightIcon />}
            fullWidth
          >
            Proceed to Checkout
          </Button>

          <button
            type="button"
            className="
              flex

              h-12
              w-full

              items-center
              justify-center

              gap-2

              border
              border-black/30

              bg-transparent

              text-[9px]
              font-medium

              text-black

              transition-[background-color,color,border-color]

              hover:border-black
              hover:bg-black
              hover:text-white
            "
          >
            Checkout with
            <AppleIcon />
            Pay
          </button>
        </div>

        {/* =================================================
            SECURE
        ================================================= */}

        <div
          className="
            mt-5

            flex
            items-center
            justify-center

            gap-2

            text-[6px]
            font-semibold

            uppercase
            tracking-[0.15em]

            text-black/35
          "
        >
          <LockIcon />
          Secure Checkout
        </div>
      </div>

      {/* =====================================================
          PROMO
      ====================================================== */}

      <form
        onSubmit={onPromoSubmit}
        className="
          flex

          border-t
          border-[var(--cart-border)]
        "
      >
        <input
          value={promoCode}
          onChange={(event) => setPromoCode(event.target.value)}
          placeholder="Enter promo code"
          className="
            h-12
            min-w-0

            flex-1

            bg-transparent

            px-5

            text-[8px]

            text-black

            outline-none

            placeholder:text-black/30
          "
        />

        <button
          type="submit"
          className="
            border-l
            border-[var(--cart-border)]

            px-5

            text-[7px]
            font-semibold

            uppercase
            tracking-[0.14em]

            text-black/50

            transition-colors

            hover:text-black
          "
        >
          Apply
        </button>
      </form>
    </section>
  );
}

/* ==========================================================================
   SUMMARY ROW
============================================================================ */

function SummaryRow({
  label,

  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div
      className="
        flex

        items-start
        justify-between

        gap-6

        text-[9px]
      "
    >
      <span
        className="
          text-black/48
        "
      >
        {label}
      </span>

      <span
        className="
          max-w-[150px]

          text-right

          text-black/75
        "
      >
        {value}
      </span>
    </div>
  );
}

/* ==========================================================================
   GIFT NOTE
============================================================================ */

function GiftNote({
  open,

  setOpen,

  value,

  onChange,
}: {
  open: boolean;

  setOpen: (value: boolean) => void;

  value: string;

  onChange: (value: string) => void;
}) {
  return (
    <div
      className="
        mt-7

        border
        border-[var(--cart-border-strong)]

        bg-white/40
      "
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="
          flex

          min-h-[64px]

          w-full

          items-center
          justify-between

          gap-4

          px-5

          text-left
        "
      >
        <span
          className="
            flex

            items-center
            gap-4
          "
        >
          <GiftIcon />

          <span
            className="
              font-serif

              text-[16px]

              text-black/75
            "
          >
            Add a gift note or special instructions
          </span>
        </span>

        <span
          className={`
            transition-transform
            duration-300

            ${open ? "rotate-90" : ""}
          `}
        >
          →
        </span>
      </button>

      {open && (
        <div
          className="
            border-t
            border-[var(--cart-border)]

            p-5
          "
        >
          <textarea
            rows={4}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Write your note..."
            className="
              w-full

              resize-none

              border
              border-[var(--cart-border)]

              bg-white/45

              p-4

              text-[10px]

              leading-[1.7]

              text-black

              outline-none

              placeholder:text-black/25

              focus:border-black
            "
          />
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   BENEFITS
============================================================================ */

function CartBenefits() {
  return (
    <div
      className="
        mt-14

        grid

        border-t
        border-[var(--cart-border)]

        pt-8

        sm:grid-cols-3

        lg:mt-16
        lg:pt-9
      "
    >
      <Benefit
        icon={<DeliveryIcon />}
        title="Complimentary Delivery"
        description="Enjoy complimentary delivery on selected orders."
      />

      <Benefit
        icon={<ReturnIcon />}
        title="Complimentary Returns"
        description="Complimentary returns within 30 days."
      />

      <Benefit
        icon={<ConciergeIcon />}
        title="Personal Shopping"
        description="Our client advisors are here to assist you."
      />
    </div>
  );
}

function Benefit({
  icon,

  title,

  description,
}: {
  icon: ReactNode;

  title: string;

  description: string;
}) {
  return (
    <div
      className="
        flex

        gap-4

        border-b
        border-[var(--cart-border)]

        px-1
        py-7

        sm:border-b-0
        sm:border-r
        sm:px-7

        sm:first:pl-0

        sm:last:border-r-0
        sm:last:pr-0
      "
    >
      {/* copper icon */}

      <span
        className="
          shrink-0

          text-[var(--cart-copper)]
        "
      >
        {icon}
      </span>

      <div>
        <p
          className="
            text-[8px]
            font-semibold

            uppercase
            tracking-[0.14em]

            text-[var(--cart-copper)]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-2

            max-w-[250px]

            text-[9px]

            leading-[1.7]

            text-[var(--cart-copper)]/75
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   RECOMMENDATIONS
============================================================================ */

function Recommendations({ products }: { products: Recommendation[] }) {
  return (
    <section
      className="
        mt-12
      "
    >
      <div
        className="
          mb-5

          flex
          items-end
          justify-between
        "
      >
        <div>
          <p
            className="
              mb-2

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.2em]

              text-[var(--cart-copper)]
            "
          >
            Curated for You
          </p>

          <h2
            className="
              font-serif

              text-[28px]

              tracking-[-0.04em]

              text-black
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

            text-black/40

            transition-colors

            hover:text-black

            sm:block
          "
        >
          View All
        </Link>
      </div>

      <div
        className="
          flex

          gap-3

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
          <RecommendationCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function RecommendationCard({ product }: { product: Recommendation }) {
  return (
    <Link
      href={product.href}
      className="
        group

        grid

        min-w-[82vw]

        shrink-0

        snap-start

        grid-cols-[110px_minmax(0,1fr)]

        border
        border-[var(--cart-border)]

        bg-white/40

        sm:min-w-[420px]

        md:min-w-0
      "
    >
      <div
        className="
          relative

          aspect-square

          overflow-hidden

          bg-[#EEE9E1]
        "
      >
        <Image
          src={product.image}
          alt={product.imageAlt ?? product.title}
          fill
          loading="lazy"
          sizes="110px"
          draggable={false}
          className="
            object-cover

            transition-transform
            duration-700

            group-hover:scale-[1.03]
          "
        />
      </div>

      <div
        className="
          flex
          min-w-0

          flex-col

          p-4
        "
      >
        <p
          className="
            font-serif

            text-[15px]

            leading-[1.15]

            text-black
          "
        >
          {product.title}
        </p>

        {product.subtitle && (
          <p
            className="
              mt-1.5

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.08em]

              text-black/35
            "
          >
            {product.subtitle}
          </p>
        )}

        <p
          className="
            mt-3

            text-[9px]
            font-semibold

            text-black
          "
        >
          {money(product.price)}
        </p>

        <span
          className="
            mt-auto

            flex
            items-center
            gap-2

            pt-4

            text-[6.5px]
            font-semibold

            uppercase
            tracking-[0.14em]

            text-black/35

            transition-colors

            group-hover:text-black
          "
        >
          View Product
          <span
            className="
              transition-transform

              group-hover:translate-x-1
            "
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/* ==========================================================================
   COLUMN LABEL
============================================================================ */

function ColumnLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="
        text-[6.5px]
        font-semibold

        uppercase
        tracking-[0.18em]

        text-black/35
      "
    >
      {children}
    </span>
  );
}

/* ==========================================================================
   EMPTY CART
============================================================================ */

function EmptyCart({ themeVars }: { themeVars: CSSProperties }) {
  return (
    <main
      style={themeVars}
      className="
        min-h-[100svh]

        bg-[var(--cart-bg)]

        text-black
      "
    >
      <div
        aria-hidden="true"
        className="
          h-[72px]

          bg-black

          md:h-[76px]
        "
      />

      <div
        className="
          flex

          min-h-[calc(100svh-76px)]

          items-center
          justify-center

          px-6

          text-center
        "
      >
        <div
          className="
            max-w-[560px]
          "
        >
          <div
            className="
              mx-auto

              w-fit
            "
          >
            <ShoppingBagArtwork />
          </div>

          <p
            className="
              mt-7

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.22em]

              text-[var(--cart-copper)]
            "
          >
            Your Selection
          </p>

          <h1
            className="
              mt-4

              font-serif

              text-[clamp(3rem,11vw,5.4rem)]

              leading-[0.92]
              tracking-[-0.055em]
            "
          >
            Your bag is empty.
          </h1>

          <p
            className="
              mx-auto
              mt-5

              max-w-[380px]

              text-[10px]

              leading-[1.8]

              text-[var(--cart-muted)]
            "
          >
            Discover pieces created with intention and add them to your
            Najibzadeh selection.
          </p>

          <div
            className="
              mx-auto
              mt-8

              max-w-[260px]
            "
          >
            <Button
              href="/shop"
              variant="black"
              size="lg"
              icon={<ArrowRightIcon />}
              fullWidth
            >
              Explore Collection
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ==========================================================================
   SHOPPING BAG ARTWORK

   تقریباً 70px
============================================================================ */

function ShoppingBagArtwork() {
  return (
    <svg
      viewBox="0 0 78 90"
      fill="none"
      aria-hidden="true"
      className="
        h-[70px]
        w-auto

        text-black/58

        sm:h-[78px]

        lg:h-[86px]
      "
    >
      {/* bag */}

      <path
        d="M12 29H66L70 82H8L12 29Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />

      {/* handles */}

      <path
        d="M24 34V22C24 11.5 30.2 6 39 6C47.8 6 54 11.5 54 22V34"
        stroke="currentColor"
        strokeWidth="1.2"
      />

      <path
        d="M28 29V22C28 14.5 32.3 10 39 10C45.7 10 50 14.5 50 22V29"
        stroke="currentColor"
        strokeWidth=".65"
        opacity=".45"
      />

      {/* decorative horizontal */}

      <path
        d="M16 39H62"
        stroke="currentColor"
        strokeWidth=".55"
        opacity=".28"
      />

      {/* N */}

      <path d="M29 63V47L49 65V48" stroke="currentColor" strokeWidth="1.1" />

      {/* copper micro detail */}

      <path
        d="M13 76H65"
        stroke="var(--cart-copper)"
        strokeWidth="1"
        opacity=".8"
      />
    </svg>
  );
}

/* ==========================================================================
   ICONS
============================================================================ */

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="size-[17px]"
    >
      <path d="M4.5 6H15.5" stroke="currentColor" strokeWidth="1" />

      <path d="M7 6V3.5H13V6" stroke="currentColor" strokeWidth="1" />

      <path d="M6 6L6.8 16H13.2L14 6" stroke="currentColor" strokeWidth="1" />

      <path
        d="M8.5 8.5V13.5M11.5 8.5V13.5"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="
        size-5

        text-black/55
      "
    >
      <path d="M4 9H20V20H4V9Z" stroke="currentColor" strokeWidth="1" />

      <path d="M12 9V20M3 6H21V10H3V6Z" stroke="currentColor" strokeWidth="1" />

      <path
        d="M12 6C9 6 7 5 7 3.5C7 2.3 9.3 2 12 6Z"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M12 6C15 6 17 5 17 3.5C17 2.3 14.7 2 12 6Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="
        size-7
      "
    >
      <path d="M3 7H17V19H3V7Z" stroke="currentColor" strokeWidth="1" />

      <path
        d="M17 11H22L25 15V19H17V11Z"
        stroke="currentColor"
        strokeWidth="1"
      />

      <circle cx="8" cy="21" r="2" stroke="currentColor" strokeWidth="1" />

      <circle cx="21" cy="21" r="2" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="
        size-7
      "
    >
      <path d="M7 8A9 9 0 1 1 6 18" stroke="currentColor" strokeWidth="1" />

      <path d="M7 3V8H12" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function ConciergeIcon() {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="
        size-7
      "
    >
      <path d="M4 21H24" stroke="currentColor" strokeWidth="1" />

      <path
        d="M6 21C6.8 14 9.7 10 14 10C18.3 10 21.2 14 22 21"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path d="M14 10V7" stroke="currentColor" strokeWidth="1" />

      <circle cx="14" cy="5" r="1.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M16.7 12.7c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.8-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.5 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.2 3.2-2.5 1-1.4 1.4-2.9 1.4-3-.1 0-3.2-1.2-3.2-4Z" />

      <path d="M14.2 5.3c.7-.9 1.2-2.1 1-3.3-1 .1-2.3.7-3 1.6-.7.8-1.2 2-.9 3.2 1.1.1 2.2-.6 2.9-1.5Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-3">
      <rect
        x="4"
        y="8"
        width="10"
        height="7"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M6.5 8V5.5C6.5 4 7.6 3 9 3C10.4 3 11.5 4 11.5 5.5V8"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
