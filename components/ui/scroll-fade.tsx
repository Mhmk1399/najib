"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type ScrollFadeProps = {
  children: ReactNode;
  className: string;
  ariaLabel: string;
  topClassName: string;
  bottomClassName: string;
  showAfterPixels?: number;
};

type ScrollState = {
  canScroll: boolean;
  showTop: boolean;
  showBottom: boolean;
};

const INITIAL_STATE: ScrollState = {
  canScroll: false,
  showTop: false,
  showBottom: false,
};

export function ScrollFade({
  children,
  className,
  ariaLabel,
  topClassName,
  bottomClassName,
  showAfterPixels = 2,
}: ScrollFadeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState(INITIAL_STATE);

  const syncScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const maxScrollTop = Math.max(
      0,
      element.scrollHeight - element.clientHeight,
    );
    const canScroll = maxScrollTop > showAfterPixels;
    const scrollTop = element.scrollTop;

    setScrollState({
      canScroll,
      showTop: canScroll && scrollTop > showAfterPixels,
      showBottom: canScroll && scrollTop < maxScrollTop - showAfterPixels,
    });
  }, [showAfterPixels]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => syncScrollState();
    const resizeObserver = new ResizeObserver(syncScrollState);
    const mutationObserver = new MutationObserver(syncScrollState);

    element.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    resizeObserver.observe(element);
    mutationObserver.observe(element, { childList: true, subtree: true });
    syncScrollState();

    return () => {
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [syncScrollState]);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className={`${topClassName} pointer-events-none absolute  inset-x-0 top-0 z-10 transition-opacity duration-200 ${
          scrollState.showTop ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={scrollRef}
        role="region"
        aria-label={ariaLabel}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        tabIndex={scrollState.canScroll ? 0 : undefined}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        className={className}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        className={`${bottomClassName} pointer-events-none absolute inset-x-0 bottom-0 z-10 transition-opacity duration-200 ${
          scrollState.showBottom ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
