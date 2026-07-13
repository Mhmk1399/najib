"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type {
  ProductFocusSliderClientProps,
  ProductSliderItem,
  ProductSliderObjectPosition,
} from "./product-focus-slider.types";

/* ── GSAP lazy loader ───────────────────────────────────────────────────── */

type SliderGsap = (typeof import("gsap"))["default"];
let sliderGsapPromise: Promise<SliderGsap> | null = null;

function loadSliderGsap() {
  if (!sliderGsapPromise) {
    sliderGsapPromise = import("gsap")
      .then((m) => m.default)
      .catch((e) => {
        sliderGsapPromise = null;
        if (process.env.NODE_ENV === "development")
          console.warn("[ProductFocusSlider] GSAP failed.", e);
        throw e;
      });
  }
  return sliderGsapPromise;
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

const OBJ_POS: Record<ProductSliderObjectPosition, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "center-left": "object-[35%_50%]",
  "center-right": "object-[65%_50%]",
};

function cn(...c: (string | false | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

type Dir = "next" | "prev" | null;

type Vis = {
  product: ProductSliderItem;
  key: string;
  pos: number; // -3…+3
  action: "prev" | "next" | "none";
};

/* ── icons ───────────────────────────────────────────────────────────────── */

function ChevronL() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronR() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function Arrow({ rtl }: { rtl: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        rtl && "rotate-180",
        "transition-transform duration-200 group-hover:translate-x-0.5",
      )}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── component ───────────────────────────────────────────────────────────── */

export function ProductFocusSliderClient({
  id,
  products,
  initialIndex,
  locale,
  enableSwipe,
}: ProductFocusSliderClientProps) {
  const [idx, setIdx] = useState(initialIndex);
  const [anim, setAnim] = useState(false);
  const [dir, setDir] = useState<Dir>(null);
  const [ann, setAnn] = useState("");
  const [mob, setMob] = useState(false);

  const rtl = locale === "fa";
  const n = products.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const detRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  const tlRef = useRef<ReturnType<SliderGsap["timeline"]> | null>(null);
  const gsapR = useRef<SliderGsap | null>(null);
  const obsRef = useRef<IntersectionObserver | null>(null);
  const lockRef = useRef(false);
  const seqRef = useRef(0);
  const mtRef = useRef(true);
  const reducedRef = useRef(false);
  const tmRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pxRef = useRef(0);
  const pyRef = useRef(0);
  const pactRef = useRef(false);
  const pswRef = useRef(false);

  const fr = cn(
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[#A94420] dark:focus-visible:ring-[#E18A68]",
    "focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
  );

  /* ── matchMedia ──────────────────────────────────────────────────────── */

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMob(mq.matches);
    const h = (e: MediaQueryListEvent) => setMob(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = mq.matches;
    const h = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches;
    };
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  /* ── GSAP loader ─────────────────────────────────────────────────────── */

  const loadG = useCallback(async () => {
    if (gsapR.current) return gsapR.current;
    if (reducedRef.current) return null;
    try {
      const g = await loadSliderGsap();
      if (!mtRef.current) return null;
      gsapR.current = g;
      return g;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (reducedRef.current) return;
    const el = rootRef.current;
    if (!el) return;
    let done = false;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting || done) return;
        done = true;
        obs.disconnect();
        void loadG();
      },
      { rootMargin: "400px 0px" },
    );
    obsRef.current = obs;
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadG]);

  /* ── layout ──────────────────────────────────────────────────────────── */

  const step = mob ? 240 : 430;

  const sc = useCallback(
    (p: number) => {
      if (mob) return p === 0 ? 1 : Math.abs(p) === 1 ? 0.84 : 0.62;
      return p === 0
        ? 1.18
        : Math.abs(p) === 1
          ? 0.8
          : Math.abs(p) === 2
            ? 0.62
            : 0.5;
    },
    [mob],
  );

  const op = useCallback(
    (p: number) => {
      if (mob) return p === 0 ? 1 : Math.abs(p) === 1 ? 0.48 : 0;
      return p === 0
        ? 1
        : Math.abs(p) === 1
          ? 0.58
          : Math.abs(p) === 2
            ? 0.22
            : 0;
    },
    [mob],
  );

  const zi = useCallback(
    (p: number) =>
      p === 0 ? 10 : Math.abs(p) === 1 ? 3 : Math.abs(p) === 2 ? 1 : 0,
    [],
  );

  const interact = useCallback(
    (p: number) => (mob ? Math.abs(p) <= 1 : Math.abs(p) <= 2),
    [mob],
  );

  /* ── visible products ────────────────────────────────────────────────── */

  const vis = useMemo((): Vis[] => {
    if (n === 0) return [];
    if (n === 1)
      return [
        {
          product: products[0],
          key: `${products[0].id}-s`,
          pos: 0,
          action: "none",
        },
      ];
    const L = n;
    const at = (off: number) => products[(((idx + off) % L) + L) % L];
    const k = (off: number) => `${at(off).id}-${off}`;

    // clickAction: anything except center (0) can trigger slide change
    const act = (off: number): Vis["action"] => {
      if (off === 0) return "none";
      return off < 0 ? "prev" : "next";
    };

    if (mob) {
      return [
        { product: at(-1), key: k(-1), pos: -1, action: "prev" },
        { product: at(0), key: k(0), pos: 0, action: "none" },
        { product: at(1), key: k(1), pos: 1, action: "next" },
      ];
    }

    const base: Vis[] = [
      { product: at(-2), key: k(-2), pos: -2, action: "prev" },
      { product: at(-1), key: k(-1), pos: -1, action: "prev" },
      { product: at(0), key: k(0), pos: 0, action: "none" },
      { product: at(1), key: k(1), pos: 1, action: "next" },
      { product: at(2), key: k(2), pos: 2, action: "next" },
    ];

    if (dir === "next") {
      base.push({ product: at(3), key: k(3), pos: 3, action: "none" });
    } else if (dir === "prev") {
      base.unshift({ product: at(-3), key: k(-3), pos: -3, action: "none" });
    }

    return base;
  }, [idx, mob, n, products, dir]);

  const center = useMemo(() => {
    const c = vis.find((v) => v.pos === 0);
    return c?.product ?? null;
  }, [vis]);

  /* ── GSAP transition ─────────────────────────────────────────────────── */

  useEffect(() => {
    if (!dir || n <= 1) return;
    let cancelled = false;
    const d = dir;
    const seq = ++seqRef.current;
    const ni = d === "next" ? (idx + 1) % n : (idx - 1 + n) % n;

    async function run() {
      const gsap = await loadG();
      if (cancelled || !mtRef.current || seqRef.current !== seq) return;

      if (!gsap || reducedRef.current) {
        tmRef.current = setTimeout(() => {
          if (!mtRef.current || cancelled) return;
          finish(ni);
        }, 10);
        return;
      }

      if (tlRef.current) tlRef.current.kill();

      const tl = gsap.timeline({
        defaults: { duration: 0.68, ease: "power3.inOut" },
        onComplete: () => {
          if (!mtRef.current || cancelled) return;
          finish(ni);
        },
      });
      tlRef.current = tl;

      // animate cards
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const cur = vis[i]?.pos ?? 0;
        const tgt = d === "next" ? cur - 1 : cur + 1;

        tl.to(
          card,
          {
            x: tgt * step,
            scale: sc(tgt),
            opacity: op(tgt),
            zIndex: zi(tgt),
          },
          i * 0.02,
        );
      });

      // fade out details
      if (detRef.current) {
        const items = detRef.current.querySelectorAll("[data-di]");
        tl.to(
          items,
          { y: -10, opacity: 0, duration: 0.22, ease: "power2.in" },
          0,
        );
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [dir, idx, loadG, n, op, sc, step, vis, zi]);

  function finish(ni: number) {
    setIdx(ni);
    setAnn(`${products[ni]?.title ?? ""}، محصول ${ni + 1} از ${n}`);
    setDir(null);
    setAnim(false);
    lockRef.current = false;

    // fade details back in after state update
    requestAnimationFrame(() => {
      if (!detRef.current) return;
      const items = detRef.current.querySelectorAll("[data-di]");
      items.forEach((el) => {
        const h = el as HTMLElement;
        h.style.opacity = "0";
        h.style.transform = "translateY(10px)";
      });

      requestAnimationFrame(() => {
        items.forEach((el, i) => {
          const h = el as HTMLElement;
          h.style.transition = `opacity 0.35s ease ${i * 0.05}s, transform 0.35s ease ${i * 0.05}s`;
          h.style.opacity = "1";
          h.style.transform = "translateY(0)";
        });

        // clean inline styles after animation
        setTimeout(() => {
          items.forEach((el) => {
            const h = el as HTMLElement;
            h.style.transition = "";
            h.style.opacity = "";
            h.style.transform = "";
          });
        }, 500);
      });
    });
  }

  /* ── navigation ──────────────────────────────────────────────────────── */

  const next = useCallback(() => {
    if (n <= 1 || anim || lockRef.current) return;
    setDir("next");
    setAnim(true);
    lockRef.current = true;
    void loadG();
  }, [anim, loadG, n]);

  const prev = useCallback(() => {
    if (n <= 1 || anim || lockRef.current) return;
    setDir("prev");
    setAnim(true);
    lockRef.current = true;
    void loadG();
  }, [anim, loadG, n]);

  const handleCardClick = useCallback(
    (action: Vis["action"]) => {
      if (pswRef.current) return;
      if (action === "prev") prev();
      else if (action === "next") next();
    },
    [next, prev],
  );

  /* ── keyboard ────────────────────────────────────────────────────────── */

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          rtl ? prev() : next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          rtl ? next() : prev();
          break;
      }
    },
    [next, prev, rtl],
  );

  /* ── swipe ───────────────────────────────────────────────────────────── */

  const onPD = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enableSwipe || n <= 1) return;
      pxRef.current = e.clientX;
      pyRef.current = e.clientY;
      pactRef.current = true;
      pswRef.current = false;
      try {
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      } catch {}
    },
    [enableSwipe, n],
  );

  const onPM = useCallback((e: React.PointerEvent) => {
    if (!pactRef.current) return;
    if (
      Math.abs(e.clientX - pxRef.current) > 10 ||
      Math.abs(e.clientY - pyRef.current) > 10
    )
      pswRef.current = true;
  }, []);

  const onPU = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pactRef.current) return;
      pactRef.current = false;
      const dx = e.clientX - pxRef.current;
      const dy = e.clientY - pyRef.current;
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {}
      if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 52) return;
      rtl ? (dx > 0 ? prev() : next()) : dx < 0 ? next() : prev();
    },
    [next, prev, rtl],
  );

  const onPC = useCallback(() => {
    pactRef.current = false;
  }, []);

  /* ── cleanup ─────────────────────────────────────────────────────────── */

  useEffect(
    () => () => {
      mtRef.current = false;
      tlRef.current?.kill();
      obsRef.current?.disconnect();
      if (tmRef.current) clearTimeout(tmRef.current);
    },
    [],
  );

  if (!center) return null;

  const multi = n > 1;

  return (
    <div ref={rootRef} dir={rtl ? "rtl" : "ltr"}>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ann}
      </div>

      <div className="mx-auto w-full max-w-[1180px] xl:max-w-[1280px]">
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden",
            "h-[340px] sm:h-[380px] lg:h-[440px] xl:h-[500px]",
          )}
        >
          {/* prev button */}
          {multi && (
            <button
              type="button"
              onClick={prev}
              disabled={anim}
              aria-label="محصول قبلی"
              onFocus={() => void loadG()}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-[40]",
                rtl
                  ? "right-1 sm:right-2 lg:right-0"
                  : "left-1 sm:left-2 lg:left-0",
                "flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11",
                "border border-[#DED8D1] dark:border-[#2C343C] bg-transparent",
                "text-[#231F20] dark:text-[#F8F5F0]",
                "hover:border-[#BDB5AD] dark:hover:border-[#46515B]",
                "transition-[border-color,opacity] duration-150",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                fr,
              )}
            >
              <ChevronR />
            </button>
          )}

          {/* next button */}
          {multi && (
            <button
              type="button"
              onClick={next}
              disabled={anim}
              aria-label="محصول بعدی"
              onFocus={() => void loadG()}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-[40]",
                rtl
                  ? "left-1 sm:left-2 lg:left-0"
                  : "right-1 sm:right-2 lg:right-0",
                "flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11",
                "border border-[#DED8D1] dark:border-[#2C343C] bg-transparent",
                "text-[#231F20] dark:text-[#F8F5F0]",
                "hover:border-[#BDB5AD] dark:hover:border-[#46515B]",
                "transition-[border-color,opacity] duration-150",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                fr,
              )}
            >
              <ChevronL />
            </button>
          )}

          {/* orbit area */}
          <div
            ref={orbitRef}
            onPointerDown={onPD}
            onPointerMove={onPM}
            onPointerUp={onPU}
            onPointerCancel={onPC}
            onKeyDown={onKey}
            className="relative w-full h-full flex items-center justify-center touch-pan-y select-none"
            tabIndex={0}
            role="group"
            aria-label="اسلایدر محصولات"
          >
            <ul
              role="list"
              className="relative w-full h-full flex items-center justify-center"
            >
              {vis.map((item, i) => {
                const p = item.product;
                const pos = item.pos;
                const isC = pos === 0;
                const tx = pos * step;
                const s = sc(pos);
                const o = op(pos);
                const z = zi(pos);
                const ia = interact(pos);
                const opc = OBJ_POS[p.objectPosition ?? "center"];

                const img = (
                  <figure className="relative w-full h-full m-0">
                    <div className="absolute inset-0">
                      <Image
                        src={p.image.src}
                        alt={p.image.alt}
                        fill
                        sizes="(max-width: 767px) 76vw, (max-width: 1279px) 34vw, 26vw"
                        quality={80}
                        loading="lazy"
                        draggable={false}
                        
                        className={cn(
                          "object-cover",
                          opc,
                          isC &&
                            "transition-transform duration-500 ease-out hover:scale-[1.02] motion-reduce:transform-none",
                        )}
                      />
                    </div>
                  </figure>
                );

                const cardClass = cn(
                  "block relative overflow-hidden rounded-sm",
                  "w-[68vw] max-w-[320px]",
                  "lg:w-[clamp(240px,22vw,360px)]",
                  "aspect-[3/4]",
                  "border border-black/10 dark:border-white/10",
                );

                return (
                  <li
                    key={item.key}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    aria-hidden={!ia && !isC ? "true" : undefined}
                    className="absolute will-change-transform"
                    style={{
                      transform: `translateX(${tx}px) scale(${s})`,
                      zIndex: z,
                      opacity: o,
                      transformOrigin: "center center",
                      pointerEvents: ia ? "auto" : "none",
                      cursor: item.action !== "none" ? "pointer" : "default",
                    }}
                  >
                    <article className="w-full h-full">
                      {item.action !== "none" ? (
                        <button
                          type="button"
                          onClick={() => handleCardClick(item.action)}
                          aria-label={`نمایش ${p.title}`}
                          className={cn(cardClass, "bg-transparent", fr)}
                        >
                          {img}
                        </button>
                      ) : (
                        <div className={cardClass}>{img}</div>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* ── details ──────────────────────────────────────────────────────── */}
      <div
        ref={detRef}
        className="mt-6 sm:mt-8 flex flex-col items-center text-center gap-1"
      >
        {center.englishTitle && (
          <span
            data-di
            className="text-xs uppercase tracking-[0.16em] text-[#6C6662] dark:text-[#B8B2AC] opacity-60"
            lang="en"
          >
            {center.englishTitle}
          </span>
        )}
        <h3
          data-di
          className="text-lg sm:text-xl lg:text-2xl font-normal text-[#231F20] dark:text-[#F8F5F0]"
        >
          {center.title}
        </h3>
        <p
          data-di
          className="text-sm sm:text-base tabular-nums text-[#6C6662] dark:text-[#B8B2AC]"
        >
          {center.priceText}
        </p>
        <div data-di className="mt-2">
          <Link
            href={center.href}
            prefetch={false}
            aria-label={`مشاهده ${center.title}`}
            className={cn(
              "group inline-flex items-center gap-2 min-h-[44px]",
              "text-[12px] tracking-[0.14em] uppercase",
              "text-[#231F20] dark:text-[#F8F5F0]",
              "border-b border-[#DED8D1] dark:border-[#2C343C] pb-1",
              "hover:border-[#A94420] dark:hover:border-[#E18A68]",
              "transition-[border-color] duration-200",
              fr,
            )}
          >
            <span>مشاهده محصول</span>
            <span className="text-[#A94420] dark:text-[#E18A68]">
              <Arrow rtl={rtl} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
