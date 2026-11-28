"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { reviews } from "@/lib/reviews";

/**
 * Section 7's interactive half — the quote, the gold line with the sliding
 * notch, and the avatar row.
 *
 * Measured from "Website sections./Seventh section.png" at 1920 (the design
 * width): the notch line sits 7462 design-px below the section top, is 2px thick
 * gold with a 52px-wide V notch dipping 41px, and the avatars are 95px circles
 * spaced 119px apart. The mockup only draws the notch under ONE avatar, so its
 * x position is measured from the live DOM (ResizeObserver) instead of assumed —
 * that also keeps it correct at every viewport width.
 *
 * Behaviour: click/tap an avatar, ←/→/Home/End, or swipe the quote; autoplay
 * every 7s (paused on hover/focus, off-screen, hidden tab, or when the visitor
 * asks for reduced motion).
 */

const AUTOPLAY_MS = 7000;
const SWIPE_MIN = 40;

function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[74%] w-[74%] fill-[#9d9d9d]">
      <circle cx="12" cy="8.6" r="4.1" />
      <path d="M3.6 22.4c0-4.75 3.76-7.5 8.4-7.5s8.4 2.75 8.4 7.5z" />
    </svg>
  );
}

export default function ReviewsCarousel() {
  const uid = useId();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [notch, setNotch] = useState(0);
  const tabsRef = useRef<HTMLUListElement | null>(null);
  const blockRef = useRef<HTMLDivElement | null>(null);
  const touchX = useRef<number | null>(null);

  const count = reviews.length;
  const review = reviews[active];
  const pendingReview = review.quote.startsWith("TODO(client)");

  const go = useCallback(
    (index: number) => setActive(((index % count) + count) % count),
    [count],
  );

  /* ---- notch: follow the live avatar geometry ---- */
  useEffect(() => {
    const measure = () => {
      const row = tabsRef.current;
      const block = blockRef.current;
      if (!row || !block) return;
      const tab = row.querySelectorAll<HTMLElement>('[role="tab"]')[active];
      if (!tab) return;
      const b = block.getBoundingClientRect();
      const t = tab.getBoundingClientRect();
      setNotch(t.left + t.width / 2 - (b.left + b.width / 2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (blockRef.current) observer.observe(blockRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active]);

  /* ---- autoplay ---- */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused || offscreen || hidden) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [active, paused, offscreen, hidden, count]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (blockRef.current) observer.observe(blockRef.current);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, []);

  /* ---- keyboard on the avatar row ---- */
  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
    const current = target?.dataset.index !== undefined ? Number(target.dataset.index) : active;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (current + 1) % count;
    else if (event.key === "ArrowLeft") next = (current - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  /* ---- swipe (touch) ---- */
  const onTouchStart = (event: React.TouchEvent) => {
    touchX.current = event.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    if (start === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(dx) < SWIPE_MIN) return;
    go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      ref={blockRef}
      data-reveal
      className="reviews-notch relative mx-auto w-full max-w-[1281px] [--reveal-delay:120ms]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* quote + reviewer, faded on every change */}
      <div
        id={`${uid}-review`}
        role="tabpanel"
        aria-labelledby={`${uid}-avatar-${active}`}
        tabIndex={-1}
        className="fade-swap mx-auto mt-[clamp(24px,2.375vw,45.6px)] max-w-[clamp(300px,54.17vw,1040px)] text-center"
        key={active}
      >
        <p
          className={`font-body text-[clamp(16px,1.484vw,28.5px)] leading-[clamp(22px,1.6927vw,32.5px)] font-light text-white ${
            pendingReview ? "italic text-white/70" : ""
          }`}
        >
          “{review.quote}”
        </p>
        <p
          className={`mt-[clamp(16px,1.645vw,31.6px)] font-body text-[clamp(15px,1.458vw,28px)] leading-[clamp(20px,1.77vw,34px)] font-medium text-white ${
            pendingReview ? "italic font-normal text-white/70" : ""
          }`}
        >
          {review.name}
        </p>
        <p
          className={`font-body text-[clamp(14px,1.432vw,27.5px)] leading-[clamp(19px,1.72vw,33px)] font-light text-white ${
            pendingReview ? "italic text-white/70" : ""
          }`}
        >
          {review.location}
        </p>
      </div>

      {/* gold line 2 + the notch that points at the active avatar */}
      <div
        aria-hidden="true"
        className="relative mt-[clamp(26px,2.5vw,48px)] h-[clamp(20px,2.14vw,41px)]"
        style={{ "--notch": `${notch}px` } as React.CSSProperties}
      >
        <span
          className="absolute top-0 left-0 h-[2px] bg-gold"
          style={{ right: "calc(50% - (var(--notch-w) / 2) + var(--notch))" }}
        />
        <span
          className="absolute top-0 right-0 h-[2px] bg-gold"
          style={{ left: "calc(50% + (var(--notch-w) / 2) + var(--notch))" }}
        />
        <svg
          viewBox="0 0 52 41"
          preserveAspectRatio="none"
          className="absolute top-0 h-full text-gold"
          style={{ left: "calc(50% - (var(--notch-w) / 2) + var(--notch))", width: "var(--notch-w)" }}
        >
          <path
            d="M1 1 L26 40 L51 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* avatar row */}
      <ul
        ref={tabsRef}
        role="tablist"
        aria-label="Choose a student review"
        onKeyDown={onKeyDown}
        className="mt-[clamp(18px,1.69vw,32.5px)] flex flex-wrap justify-center gap-[clamp(10px,1.25vw,24px)]"
      >
        {reviews.map((item, index) => {
          const selected = index === active;
          return (
            <li key={index}>
              <button
                id={`${uid}-avatar-${index}`}
                role="tab"
                type="button"
                data-index={index}
                aria-selected={selected}
                aria-controls={`${uid}-review`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                aria-label={
                  item.name.startsWith("TODO(client)")
                    ? `Review ${index + 1} — content not supplied yet`
                    : `Review by ${item.name}, ${item.location}`
                }
                className={`grid size-[clamp(56px,4.95vw,95px)] place-items-center overflow-hidden rounded-full transition-colors duration-200 ${
                  selected
                    ? "border-[clamp(2px,0.16vw,3px)] border-gold bg-[#e5e5e5]"
                    : "bg-white hover:bg-white/80"
                }`}
              >
                {selected ? <AvatarPlaceholder /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
