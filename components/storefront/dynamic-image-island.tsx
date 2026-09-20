  "use client";

  import Image from "next/image";
  import Link from "next/link";
  import { usePathname, useRouter } from "next/navigation";

  import {
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
  } from "react";
  import {
    ArrowLeft,
    ChevronUp,
    Loader2,
    Search,
    ShoppingBag,
    Sparkles,
    X,
  } from "lucide-react";
  import { useQuery, useQueryClient } from "@tanstack/react-query";

  import { dispatchImageStoryProductReveal } from "@/components/storefront/image-story-product-reveal";

  type LocalizedText = {
    fa?: string;
    en?: string;
    ar?: string;
  };

  type StoryImage = {
    id: string;
    url: string;
    alt?: LocalizedText;
    storyTitle?: LocalizedText;
    storyDescription?: LocalizedText;
    storyCtaLabel?: LocalizedText;
    storyProductLimit?: number;
    storyRevealEnabled?: boolean;
    objectFit?: string;
    objectPosition?: string;
    focalPointX?: number;
    focalPointY?: number;
  };

  type StoryProduct = {
    id: string;
    slug: string;
    name?: LocalizedText;
    href: string;
    priceMinor?: number;
    currency?: string;
    label?: LocalizedText;
    hotspotX?: number;
    hotspotY?: number;
    image?: StoryImage | null;
    colors?: Array<{ _id?: string; name?: LocalizedText; hex?: string }>;
    sizes?: Array<{ _id?: string; name?: LocalizedText; code?: string }>;
    tags?: string[];
  };

  type ImageStory = {
    id: string;
    kind: string;
    storyTitle?: LocalizedText;
    storyDescription?: LocalizedText;
    storyCtaLabel?: LocalizedText;
    image: StoryImage;
    linkedProducts: StoryProduct[];
    storyProductLimit?: number;
    storyRevealEnabled?: boolean;
  };

  type ImageStoriesPayload = {
    stories: ImageStory[];
  };

  type ObservedStoryTarget = {
    storyId?: string;
    storyUrl?: string;
    element?: HTMLElement;
  };

  const storyTargetSelector = "[data-image-story-id], [data-image-story-url]";
  const finePointerMediaQuery = "(hover: hover) and (pointer: fine)";

  const queryOptions = {
    staleTime: 12 * 60 * 60_000,
    gcTime: 24 * 60 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  } as const;

  const numberFormatter = new Intl.NumberFormat("fa-IR");
  const quickPrompts = ["کت رسمی", "استایل مهمانی", "عطر مردانه"];
  const glassSurface = "backdrop-blur-[32px] backdrop-saturate-[145%]";

  async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
    const response = await fetch(input, {
      ...init,
      headers: {
        Accept: "application/json",
        ...Object.fromEntries(new Headers(init?.headers).entries()),
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error ?? "دریافت پیشنهادهای تصویر ناموفق بود.");
    }

    return (await response.json()) as T;
  }

  function fa(value: LocalizedText | null | undefined, fallback = "") {
    return (
      value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback
    );
  }

  function normalizeUrl(value: string | null | undefined) {
    if (!value) return "";

    try {
      const url = new URL(value, window.location.origin);
      return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
    } catch {
      return value.split("?")[0]?.replace(/\/+$/, "") ?? "";
    }
  }

  function formatMoney(minor: number | undefined, currency: string | undefined) {
    if (typeof minor !== "number") return "";

    try {
      return new Intl.NumberFormat("fa-IR", {
        style: "currency",
        currency: currency || "IRR",
        maximumFractionDigits: 0,
      }).format(minor / 100);
    } catch {
      return `${numberFormatter.format(minor / 100)} ${currency ?? ""}`.trim();
    }
  }

  function imageFit(value: string | undefined): CSSProperties["objectFit"] {
    if (
      value === "contain" ||
      value === "cover" ||
      value === "fill" ||
      value === "none" ||
      value === "scale-down"
    ) {
      return value;
    }

    return "cover";
  }

  function getTargets() {
    return Array.from(
      document.querySelectorAll<HTMLElement>(storyTargetSelector),
    );
  }

  function targetPayload(element: HTMLElement): ObservedStoryTarget {
    return {
      storyId: element.dataset.imageStoryId,
      storyUrl: element.dataset.imageStoryUrl,
      element,
    };
  }

  function closestStoryTarget(target: EventTarget | null) {
    if (!(target instanceof Element)) return null;

    return target.closest<HTMLElement>(storyTargetSelector);
  }

  function targetScore(entry: IntersectionObserverEntry) {
    const rect = entry.boundingClientRect;
    const viewportMiddleY = window.innerHeight / 2;
    const viewportMiddleX = window.innerWidth / 2;
    const elementMiddleY = rect.top + rect.height / 2;
    const elementMiddleX = rect.left + rect.width / 2;
    const verticalDistance = Math.abs(viewportMiddleY - elementMiddleY);
    const horizontalDistance = Math.abs(viewportMiddleX - elementMiddleX);
    const verticalScore = Math.max(
      0,
      1 - verticalDistance / Math.max(window.innerHeight, 1),
    );
    const horizontalScore = Math.max(
      0,
      1 - horizontalDistance / Math.max(window.innerWidth, 1),
    );

    return (
      entry.intersectionRatio + verticalScore * 0.68 + horizontalScore * 0.32
    );
  }

  function nodeContainsStoryTarget(node: Node) {
    return (
      node instanceof HTMLElement &&
      (node.matches(storyTargetSelector) ||
        Boolean(node.querySelector(storyTargetSelector)))
    );
  }

  function useFinePointer() {
    const [finePointer, setFinePointer] = useState(false);

    useEffect(() => {
      const media = window.matchMedia(finePointerMediaQuery);
      const sync = () => setFinePointer(media.matches);

      sync();
      media.addEventListener("change", sync);

      return () => media.removeEventListener("change", sync);
    }, []);

    return finePointer;
  }

  function useKeyboardInset() {
    const [keyboardInset, setKeyboardInset] = useState(0);

    useEffect(() => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      let frame = 0;

      const sync = () => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          const nextInset = Math.max(
            0,
            window.innerHeight - viewport.height - viewport.offsetTop,
          );
          setKeyboardInset(Math.min(360, Math.round(nextInset)));
        });
      };

      sync();
      viewport.addEventListener("resize", sync);
      viewport.addEventListener("scroll", sync);
      window.addEventListener("resize", sync);

      return () => {
        window.cancelAnimationFrame(frame);
        viewport.removeEventListener("resize", sync);
        viewport.removeEventListener("scroll", sync);
        window.removeEventListener("resize", sync);
      };
    }, []);

    return keyboardInset;
  }

  export function DynamicImageIsland() {
    const islandRef = useRef<HTMLElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const missingStoryRef = useRef<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const panelId = `${useId().replace(/:/g, "")}-image-island-panel`;
    const finePointer = useFinePointer();
    const keyboardInset = useKeyboardInset();
    const [activeTarget, setActiveTarget] = useState<ObservedStoryTarget | null>(
      null,
    );
    const [hoverOpen, setHoverOpen] = useState(false);
    const [focusOpen, setFocusOpen] = useState(false);
    const [touchOpen, setTouchOpen] = useState(false);
    const [interactionPath, setInteractionPath] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    const enabled = !pathname?.startsWith("/admin");
    const storiesQuery = useQuery({
      queryKey: ["storefront", "image-stories"],
      queryFn: ({ signal }) =>
        fetchJson<ImageStoriesPayload>("/api/storefront/image-stories", {
          signal,
        }),
      enabled,
      ...queryOptions,
    });
    const {
      data: storiesData,
      isFetching: storiesFetching,
      isLoading: storiesLoading,
      refetch: refetchStories,
    } = storiesQuery;

    const storyMaps = useMemo(() => {
      const byId = new Map<string, ImageStory>();
      const byUrl = new Map<string, ImageStory>();

      for (const story of storiesData?.stories ?? []) {
        byId.set(story.id, story);
        byUrl.set(normalizeUrl(story.image.url), story);
      }

      return { byId, byUrl };
    }, [storiesData?.stories]);

    const activeStory = useMemo(() => {
      if (!activeTarget) return null;

      if (activeTarget.storyId) {
        const match = storyMaps.byId.get(activeTarget.storyId);
        if (match) return match;
      }

      return storyMaps.byUrl.get(normalizeUrl(activeTarget.storyUrl)) ?? null;
    }, [activeTarget, storyMaps.byId, storyMaps.byUrl]);
    const activeTargetKey = useMemo(() => {
      if (!activeTarget) return "";
      return activeTarget.storyId || normalizeUrl(activeTarget.storyUrl);
    }, [activeTarget]);

    useEffect(() => {
      if (activeStory) {
        missingStoryRef.current = null;
        return;
      }

      if (
        !enabled ||
        !activeTargetKey ||
        storiesFetching ||
        storiesLoading ||
        missingStoryRef.current === activeTargetKey
      ) {
        return;
      }

      missingStoryRef.current = activeTargetKey;
      void refetchStories();
    }, [
      activeStory,
      activeTargetKey,
      enabled,
      refetchStories,
      storiesFetching,
      storiesLoading,
    ]);

    useEffect(() => {
      if (!enabled || !storiesData?.stories.length) return;
      if (!("IntersectionObserver" in window)) return;

      const scores = new Map<Element, number>();
      let observer: IntersectionObserver | null = null;
      let frame = 0;
      let mutationFrame = 0;

      const updateActive = () => {
        if (touchOpen) return;
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          let bestElement: HTMLElement | null = null;
          let bestScore = 0.34;

          for (const [element, score] of scores) {
            if (!(element instanceof HTMLElement)) continue;
            if (score > bestScore) {
              bestElement = element;
              bestScore = score;
            }
          }

          setActiveTarget(bestElement ? targetPayload(bestElement) : null);
        });
      };

      const observeTargets = () => {
        observer?.disconnect();
        scores.clear();
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) {
                scores.delete(entry.target);
                continue;
              }

              scores.set(entry.target, targetScore(entry));
            }

            updateActive();
          },
          {
            root: null,
            rootMargin: "-18% 0px -34% 0px",
            threshold: [0.12, 0.3, 0.55, 0.78],
          },
        );

        const targets = getTargets();
        for (const target of targets) observer.observe(target);
        if (!targets.length) updateActive();
      };

      const scheduleObservation = () => {
        window.cancelAnimationFrame(mutationFrame);
        mutationFrame = window.requestAnimationFrame(observeTargets);
      };

      observeTargets();

      const mutationObserver = new MutationObserver((mutations) => {
        const needsRefresh = mutations.some((mutation) => {
          if (mutation.type === "attributes") return true;
          return Array.from(mutation.addedNodes).some(nodeContainsStoryTarget);
        });

        if (needsRefresh) scheduleObservation();
      });

      const observationRoot = document.querySelector("main") ?? document.body;
      mutationObserver.observe(observationRoot, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-image-story-id", "data-image-story-url"],
      });

      return () => {
        window.cancelAnimationFrame(frame);
        window.cancelAnimationFrame(mutationFrame);
        observer?.disconnect();
        mutationObserver.disconnect();
      };
    }, [enabled, pathname, storiesData?.stories.length, touchOpen]);

    useEffect(() => {
      if (!enabled || !storiesData?.stories.length) return;

      const activateHoveredTarget = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;

        const target = closestStoryTarget(event.target);
        if (!target) return;

        setActiveTarget(targetPayload(target));
      };

      const activateFocusedTarget = (event: FocusEvent) => {
        const target = closestStoryTarget(event.target);
        if (!target) return;

        setActiveTarget(targetPayload(target));
      };

      document.addEventListener("pointerover", activateHoveredTarget, {
        passive: true,
      });
      document.addEventListener("focusin", activateFocusedTarget);

      return () => {
        document.removeEventListener("pointerover", activateHoveredTarget);
        document.removeEventListener("focusin", activateFocusedTarget);
      };
    }, [enabled, storiesData?.stories.length]);

    const panelOpen =
      interactionPath === pathname &&
      (finePointer ? hoverOpen || focusOpen : touchOpen);
    const productLimit = Math.max(
      1,
      Math.min(
        6,
        activeStory?.storyProductLimit ??
          activeStory?.image.storyProductLimit ??
          3,
      ),
    );
    const products = activeStory?.linkedProducts.slice(0, productLimit) ?? [];
    const configuredTitle =
      activeStory?.storyTitle ?? activeStory?.image.storyTitle;
    const configuredDescription =
      activeStory?.storyDescription ?? activeStory?.image.storyDescription;
    const configuredCtaLabel =
      activeStory?.storyCtaLabel ?? activeStory?.image.storyCtaLabel;
    const activeTitle = activeStory
      ? fa(activeStory.image.alt, "انتخاب‌های این تصویر")
      : "دستیار انتخاب نجیب‌زاده";
    const activeKicker = activeStory
      ? "انتخاب‌های مرتبط"
      : "جست‌وجوی سریع فروشگاه";
    const activeDescription = activeStory
      ? "محصولات این تصویر را یک‌جا ببینید."
      : "آنچه می‌خواهید بپوشید را جست‌وجو کنید.";
    const storiesAreLoading = storiesLoading || storiesFetching;

    const closeIsland = () => {
      setHoverOpen(false);
      setFocusOpen(false);
      setTouchOpen(false);
      setInteractionPath(null);
    };

    useEffect(() => {
      if (!panelOpen) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;

        event.preventDefault();
        closeIsland();
        triggerRef.current?.blur();
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [panelOpen]);

    useEffect(() => {
      if (finePointer || !panelOpen) return;

      const onPointerDown = (event: PointerEvent) => {
        const target = event.target;
        if (!(target instanceof Node) || islandRef.current?.contains(target))
          return;
        closeIsland();
      };

      document.addEventListener("pointerdown", onPointerDown, true);
      return () =>
        document.removeEventListener("pointerdown", onPointerDown, true);
    }, [finePointer, panelOpen]);

    function toggleIsland() {
      if (finePointer) {
        if (panelOpen) {
          closeIsland();
          triggerRef.current?.blur();
        } else {
          setInteractionPath(pathname);
          setFocusOpen(true);
        }
        return;
      }

      if (panelOpen) {
        closeIsland();
        return;
      }

      setInteractionPath(pathname);
      setTouchOpen(true);
    }

    function handlePointerEnter(event: ReactPointerEvent<HTMLElement>) {
      if (event.pointerType !== "mouse" || !finePointer) return;

      setInteractionPath(pathname);
      setHoverOpen(true);
    }

    function handlePointerLeave(event: ReactPointerEvent<HTMLElement>) {
      if (event.pointerType === "mouse" && finePointer) setHoverOpen(false);
    }

    function submitSearch(value = query) {
      const clean = value.replace(/\s+/g, " ").trim();
      if (!clean) return;

      const params = new URLSearchParams({ search: clean });
      router.push(`/shop?${params.toString()}`);
      closeIsland();
    }

    function prefetchProduct(product: StoryProduct) {
      if (!product.slug) return;

      void queryClient.prefetchQuery({
        queryKey: ["storefront", "product-detail", product.slug],
        queryFn: ({ signal }) =>
          fetchJson(`/api/storefront/products/${product.slug}`, { signal }),
        ...queryOptions,
      });
    }

    function revealProduct(product: StoryProduct) {
      if (!activeStory) return;

      if (
        activeStory.storyRevealEnabled === false ||
        activeStory.image.storyRevealEnabled === false
      ) {
        router.push(product.href);
        closeIsland();
        return;
      }

      dispatchImageStoryProductReveal({
        storyId: activeStory.id,
        storyUrl: activeStory.image.url,
        sourceElement: activeTarget?.element,
        product: {
          id: product.id,
          slug: product.slug,
          href: product.href,
          name: product.name,
          label: product.label,
          image: product.image,
        },
      });
      closeIsland();
    }

    if (!enabled) return null;

    return (
      <aside
        dir="rtl"
        lang="fa"
        aria-label="دستیار انتخاب و پیشنهادهای تصویر"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+var(--image-island-keyboard-inset)+10px)] z-[80] flex justify-center px-2.5 sm:bottom-[calc(env(safe-area-inset-bottom)+var(--image-island-keyboard-inset)+16px)] sm:px-5"
        style={
          {
            "--image-island-keyboard-inset": `${keyboardInset}px`,
          } as CSSProperties
        }
      >
        <section
          ref={islandRef}
          data-island-state={panelOpen ? "open" : "collapsed"}
          aria-live="polite"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocusCapture={() => {
            if (!finePointer) return;
            setInteractionPath(pathname);
            setFocusOpen(true);
          }}
          onBlurCapture={(event) => {
            if (!finePointer) return;
            const nextTarget = event.relatedTarget;
            if (
              nextTarget instanceof Node &&
              event.currentTarget.contains(nextTarget)
            )
              return;
            setFocusOpen(false);
          }}
          className={`pointer-events-auto relative isolate origin-bottom overflow-hidden border text-white [text-rendering:geometricPrecision] ${glassSurface} shadow-[0_24px_90px_rgba(0,0,0,0.42),0_8px_28px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.16)] transition-[width,max-width,border-color,box-shadow,background-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            panelOpen
              ? "w-[calc(100vw-16px)] max-w-[560px] rounded-[26px] border-white/[0.26] bg-[#090807]/[0.88] sm:w-[560px] sm:rounded-[30px]"
              : "w-[min(90vw,392px)] max-w-[392px] rounded-[26px] border-white/[0.24] bg-[#090807]/[0.84] hover:border-[#D0AA86]/65 hover:shadow-[0_26px_92px_rgba(0,0,0,0.58),0_8px_30px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.22)] sm:rounded-[30px]"
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.075)_9%,rgba(8,7,6,0.26)_32%,rgba(6,5,4,0.62)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_-8%,rgba(255,255,255,0.20),transparent_27%),radial-gradient(circle_at_84%_2%,rgba(194,145,103,0.20),transparent_30%),radial-gradient(circle_at_50%_115%,rgba(0,0,0,0.42),transparent_44%)]"
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-7 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),rgba(183,131,90,0.9),rgba(255,255,255,0.3),transparent)] transition-opacity duration-500 ${
              panelOpen ? "opacity-95" : "opacity-55"
            }`}
          />

          {panelOpen ? (
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-2 z-20 h-[3px] w-11 -translate-x-1/2 rounded-full bg-white/24 sm:hidden"
            />
          ) : null}

          <div
            className={`relative z-10 flex items-center gap-2 px-2.5 ${
              panelOpen
                ? "min-h-[70px] pb-2.5 pt-4 sm:min-h-[74px] sm:p-3"
                : "min-h-[60px] py-1.5 sm:min-h-[64px]"
            }`}
          >
            <button
              ref={triggerRef}
              type="button"
              className={`group grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border transition-[border-color,background-color,color,transform,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/80 active:scale-[0.95] motion-reduce:transition-none ${
                panelOpen
                  ? "border-white/[0.18] bg-white/[0.08] text-white/74 hover:border-white/34 hover:bg-white/[0.12] hover:text-white"
                  : "border-[#B7835A]/50 bg-white/[0.055] text-[#E1BE98] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-[#D5B08D]/75 hover:bg-[#B7835A]/[0.15] hover:shadow-[0_0_0_1px_rgba(183,131,90,0.18)]"
              }`}
              aria-label={
                panelOpen ? "بستن دستیار انتخاب" : "باز کردن دستیار انتخاب"
              }
              title={panelOpen ? "بستن دستیار انتخاب" : "باز کردن دستیار انتخاب"}
              aria-expanded={panelOpen}
              aria-controls={panelId}
              onClick={toggleIsland}
            >
              {panelOpen ? (
                <X className="size-4" aria-hidden="true" />
              ) : storiesAreLoading ? (
                <span className="relative grid place-items-center">
                  <Sparkles
                    className="size-4 text-[#E1BE98]"
                    aria-hidden="true"
                  />
                  <Loader2
                    className="absolute size-4 animate-spin text-white/85"
                    aria-hidden="true"
                  />
                </span>
              ) : activeStory ? (
                <ChevronUp className="size-4" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              className="group min-w-0 flex-1 cursor-pointer rounded-[22px] px-1.5 py-1 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75"
              aria-label={
                panelOpen ? "بستن پنل پیشنهادها" : `باز کردن ${activeTitle}`
              }
              aria-expanded={panelOpen}
              aria-controls={panelId}
              onClick={toggleIsland}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[8px] font-medium leading-4 text-[#E1B994] [text-shadow:0_1px_10px_rgba(0,0,0,0.95)] sm:text-[8.5px]">
                    <span
                      className="h-px w-4 bg-[#D6AA82]/85"
                      aria-hidden="true"
                    />
                    {activeKicker}
                  </span>
                  <strong className="mt-0.5 block truncate text-[11px] font-semibold leading-5 text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.96)] sm:text-[12px]">
                    {fa(configuredTitle, activeTitle)}
                  </strong>
                  {panelOpen ? (
                    <span className="hidden truncate text-[9px] leading-4 text-white/82 [text-shadow:0_1px_10px_rgba(0,0,0,0.94)] sm:block">
                      {fa(configuredDescription, activeDescription)}
                    </span>
                  ) : null}
                </span>

                {products.length ? (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.18] bg-black/[0.32] py-1 pe-2 ps-1.5 text-[8px] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <span
                      aria-hidden="true"
                      className="flex items-center -space-x-2 space-x-reverse"
                    >
                      {products.slice(0, 2).map((product) => (
                        <span
                          key={product.id}
                          className="relative grid size-6 overflow-hidden rounded-full border border-[#171614] bg-white/[0.06]"
                        >
                          {product.image?.url ? (
                            <Image
                              src={product.image.url}
                              alt=""
                              fill
                              sizes="24px"
                              className="object-cover"
                              style={{
                                objectPosition:
                                  product.image.objectPosition ?? "center",
                              }}
                            />
                          ) : (
                            <ShoppingBag className="m-auto size-3 text-white/45" />
                          )}
                        </span>
                      ))}
                    </span>
                    <span className="tabular-nums">
                      {numberFormatter.format(products.length)} محصول
                    </span>
                  </span>
                ) : (
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/[0.18] bg-black/[0.34] text-white/82">
                    <Search className="size-3.5" aria-hidden="true" />
                  </span>
                )}
              </span>
            </button>
          </div>

          <div
            id={panelId}
            aria-hidden={!panelOpen}
            inert={!panelOpen}
            className={`relative z-10 grid transition-[grid-template-rows,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              panelOpen
                ? "grid-rows-[1fr] border-t border-white/[0.12]"
                : "grid-rows-[0fr] border-t border-transparent"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={`px-2.5 pb-2.5 pt-2 transition-[opacity,transform] duration-300 sm:px-3 sm:pb-3 sm:pt-2.5 ${
                  panelOpen
                    ? "translate-y-0 opacity-100 delay-75"
                    : "pointer-events-none translate-y-1 opacity-0"
                }`}
              >
                {activeStory ? (
                  <div className="grid gap-2.5 sm:grid-cols-[158px_minmax(0,1fr)] sm:gap-3">
                    <figure className="relative min-h-[132px] overflow-hidden rounded-[18px] border border-white/[0.18] bg-black/[0.34] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:min-h-[220px] sm:rounded-[20px]">
                      <Image
                        src={activeStory.image.url}
                        alt={fa(activeStory.image.alt, activeTitle)}
                        fill
                        sizes="150px"
                        className="object-cover"
                        style={{
                          objectFit: imageFit(activeStory.image.objectFit),
                          objectPosition:
                            activeStory.image.objectPosition ?? "center",
                        }}
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,rgba(0,0,0,0.62)_100%)]"
                      />
                      <span className="absolute inset-x-3 bottom-3 text-[8px] font-medium leading-4 text-white/70">
                        {numberFormatter.format(products.length)} انتخاب مرتبط
                      </span>
                    </figure>

                    <div className="min-w-0 overflow-hidden rounded-[20px] border border-white/[0.16] bg-black/[0.42] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-white/[0.12] px-3.5">
                        <span className="text-[9px] font-semibold text-white/94">
                          محصولات مرتبط
                        </span>
                        <span className="text-[8px] font-medium text-[#E3BC96]">
                          انتخاب برای پیش‌نمایش
                        </span>
                      </div>

                      {products.length ? (
                        <div className="max-h-[min(38vh,280px)] divide-y divide-white/[0.075] overflow-y-auto overscroll-contain sm:max-h-none sm:overflow-visible">
                          {products.map((product, index) => {
                            const title = fa(
                              product.label,
                              fa(product.name, product.slug),
                            );
                            const price = formatMoney(
                              product.priceMinor,
                              product.currency,
                            );

                            return (
                              <button
                                key={product.id}
                                type="button"
                                aria-label={`نمایش سریع ${title}`}
                                onPointerEnter={() => prefetchProduct(product)}
                                onFocus={() => prefetchProduct(product)}
                                onClick={() => revealProduct(product)}
                                style={{
                                  transitionDelay: panelOpen
                                    ? `${index * 45}ms`
                                    : "0ms",
                                }}
                                className="group flex min-h-[64px] w-full min-w-0 cursor-pointer items-center gap-2.5 px-3 py-2 text-right transition-[background-color,color,transform] duration-200 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#D2B08D]/75"
                              >
                                <span className="relative aspect-[4/5] w-10 shrink-0 overflow-hidden rounded-[7px] border border-white/[0.08] bg-white/[0.05]">
                                  {product.image?.url ? (
                                    <Image
                                      src={product.image.url}
                                      alt=""
                                      fill
                                      sizes="40px"
                                      className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
                                      style={{
                                        objectPosition:
                                          product.image.objectPosition ??
                                          "center",
                                      }}
                                    />
                                  ) : (
                                    <ShoppingBag className="m-auto mt-4 size-3.5 text-white/42" />
                                  )}
                                </span>

                                <span className="min-w-0 flex-1">
                                  <strong className="block truncate text-[10.5px] font-semibold leading-4 text-white/96 sm:text-[11px]">
                                    {title}
                                  </strong>
                                  {price ? (
                                    <span className="mt-0.5 block truncate text-[8.5px] leading-4 text-white/78">
                                      {price}
                                    </span>
                                  ) : null}
                                </span>

                                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.10] text-white/42 transition-[border-color,color,transform] duration-200 group-hover:-translate-x-0.5 group-hover:border-[#B7835A]/55 group-hover:text-[#D5B08D]">
                                  <ArrowLeft
                                    className="size-3"
                                    aria-hidden="true"
                                  />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex min-h-[108px] items-center justify-center px-4 text-center text-[10px] leading-5 text-white/82">
                          برای این تصویر هنوز محصولی ثبت نشده است.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2.5">
                    <form
                      noValidate
                      className="flex h-11 items-center gap-2 rounded-full border border-white/[0.14] bg-black/[0.44] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color,background-color,box-shadow] duration-300 focus-within:border-[#B7835A]/60 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_0_3px_rgba(183,131,90,0.07)] motion-reduce:transition-none"
                      role="search"
                      aria-label="جست‌وجوی محصولات"
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          event.nativeEvent.isComposing
                        ) {
                          event.preventDefault();
                        }
                      }}
                      onSubmit={(event) => {
                        event.preventDefault();
                        submitSearch();
                      }}
                    >
                      <Search
                        className="size-3.5 shrink-0 text-white/64"
                        aria-hidden="true"
                      />
                      <label className="sr-only" htmlFor={`${panelId}-search`}>
                        جست‌وجوی محصولات
                      </label>
                      <input
                        ref={searchInputRef}
                        id={`${panelId}-search`}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        autoComplete="off"
                        className="min-w-0 flex-1 bg-transparent text-right text-[10.5px] leading-6 text-white outline-none placeholder:text-white/72"
                        placeholder="جست‌وجوی محصولات مرتبط..."
                        enterKeyHint="search"
                      />
                      {query ? (
                        <button
                          type="button"
                          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border border-white/[0.10] text-white/45 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75"
                          aria-label="پاک کردن عبارت جست‌وجو"
                          title="پاک کردن جست‌وجو"
                          onClick={() => {
                            setQuery("");
                            searchInputRef.current?.focus();
                          }}
                        >
                          <X className="size-3" aria-hidden="true" />
                        </button>
                      ) : null}
                      <button
                        type="submit"
                        className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border border-[#B7835A]/50 text-[#D5B08D] transition-[border-color,background-color,color] hover:border-[#D5B08D]/75 hover:bg-[#B7835A]/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75"
                        aria-label="جست‌وجو در فروشگاه"
                        title="جست‌وجو در فروشگاه"
                      >
                        <ArrowLeft className="size-3" aria-hidden="true" />
                      </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-1.5 px-1">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          className="shrink-0 cursor-pointer rounded-full border border-white/[0.18] bg-black/[0.30] px-2.5 py-1.5 text-[8.5px] text-white/86 transition-[border-color,color,background-color] duration-200 hover:border-[#B7835A]/55 hover:bg-[#B7835A]/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75"
                          onClick={() => {
                            setQuery(prompt);
                            submitSearch(prompt);
                          }}
                        >
                          {prompt}
                        </button>
                      ))}
                      <Link
                        href="/shop"
                        onClick={closeIsland}
                        className="ms-auto inline-flex shrink-0 items-center gap-1 px-1.5 py-1.5 text-[8.5px] font-medium text-[#E1B994] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B08D]/75"
                      >
                        {fa(configuredCtaLabel, "همه محصولات")}
                        <ArrowLeft className="size-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </aside>
    );
  }
