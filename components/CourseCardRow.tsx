"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { courseCards } from "@/lib/courseCards";

/**
 * Course card row — an auto-scrolling marquee (right→left), the same behaviour
 * as the video strip: the cards stream past, a card arriving from the right
 * fades in over the edge ramp, and once the last card has come on screen the row
 * is back at the start with no visible jump (the reset lives inside the loop —
 * the track translates by exactly one set width per cycle).
 *
 * Boss: 'কার্ডগুলো ডান থেকে বামে সোয়াইপ করে করে আসবে। শেষেরটা স্ক্রিনে চলে আসলে,
 * আবার শুরু থেকে শুরু হবে।'
 *
 * The mechanics live in globals.css (`.marquee*`): one set is measured,
 * duplicated enough times to cover two viewports, and the loop duration follows
 * from that width so the speed stays constant at any size. The row pauses on
 * hover, keyboard focus, drag and while off-screen, and with
 * prefers-reduced-motion it becomes a plain swipeable scroller instead.
 *
 * The row is also the scroll-reveal group, so it reveals every card (with its
 * stagger) when it arrives — including the ones clipped outside the viewport.
 */

/** Marquee speed in px per second — the single value to tune. */
const SPEED_PX_PER_SECOND = 44;

/** Sets in the markup before the first measurement (SSR + first paint). */
const INITIAL_SETS = 3;

/** Pause held after a drag is released, before the marquee resumes. */
const RESUME_DELAY_MS = 900;

export default function CourseCardRow() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0 });
  const resumeTimer = useRef<number | null>(null);

  const [sets, setSets] = useState(INITIAL_SETS);
  const [setWidth, setSetWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  /** The marquee is paused as long as any of these hold (CSS adds hover/focus). */
  const paused = offscreen || dragging || cooldown;
  const duration = setWidth > 0 ? setWidth / SPEED_PX_PER_SECOND : 0;

  /* ------------------------------------------------------------------ *
   * Reduced motion: no marquee at all, the row stays a native scroller.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /* ------------------------------------------------------------------ *
   * Measure one set (cards + their gaps) and keep enough duplicate sets to
   * cover the viewport twice over. The speed then follows from that width.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const firstSet = trackRef.current?.querySelector<HTMLElement>("[data-set]");
    if (!firstSet) return;

    const measure = () => {
      const gap = Number.parseFloat(getComputedStyle(firstSet).columnGap) || 0;
      const width = firstSet.offsetWidth + gap;
      if (width <= 0) return;
      setSetWidth(width);
      setSets(Math.max(2, Math.ceil((window.innerWidth * 2) / width) + 1));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ------------------------------------------------------------------ *
   * Pause while the row is off-screen (also saves the compositor).
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  /* ------------------------------------------------------------------ *
   * Drag: pause while held, resume a moment after release.
   * ------------------------------------------------------------------ */
  const scheduleResume = useCallback((delay = RESUME_DELAY_MS) => {
    if (resumeTimer.current !== null) window.clearTimeout(resumeTimer.current);
    setCooldown(true);
    resumeTimer.current = window.setTimeout(() => {
      resumeTimer.current = null;
      setCooldown(false);
    }, delay);
  }, []);

  useEffect(
    () => () => {
      if (resumeTimer.current !== null) window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return; // native scrolling owns the row in that case
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (resumeTimer.current !== null) {
        window.clearTimeout(resumeTimer.current);
        resumeTimer.current = null;
      }
      setCooldown(false);
      dragRef.current = { startX: event.clientX };
      setDragging(true);
    },
    [reducedMotion],
  );

  const endDrag = useCallback(() => {
    setDragging(false);
    setDragX(0);
    scheduleResume();
  }, [scheduleResume]);

  /* Pointer capture would swallow interactions on the cards, so the drag
   * listens on the window instead: it keeps working when the pointer leaves. */
  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      const dx = event.clientX - dragRef.current.startX;
      // left: up to one full set; right: a short rubber band past the start
      const limit = setWidth > 0 ? setWidth : 0;
      setDragX(Math.max(-limit, Math.min(dx, limit * 0.35)));
    };
    const onEnd = () => endDrag();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, [dragging, endDrag, setWidth]);

  const trackStyle = {
    "--marquee-set-width": `${setWidth}px`,
    "--marquee-duration": `${duration}s`,
  } as CSSProperties;

  return (
    <div
      ref={viewportRef}
      role="region"
      aria-label="What to expect from the course — auto-scrolling list of cards"
      tabIndex={0}
      data-reveal-group
      data-paused={paused ? "true" : undefined}
      onPointerDown={onPointerDown}
      className={`marquee marquee-column marquee-fade ${
        dragging ? "cursor-grabbing select-none" : "cursor-grab"
      }`}
    >
      <div
        ref={trackRef}
        data-run={setWidth > 0 ? "true" : undefined}
        style={trackStyle}
        className="marquee-track"
      >
        <div
          className="flex gap-[clamp(20px,1.2vw,23px)]"
          style={{
            transform: `translate3d(${dragX}px, 0, 0)`,
            transition: dragging ? "none" : "transform 400ms ease-out",
          }}
        >
          {Array.from({ length: sets }, (_, setIndex) => {
            const clone = setIndex > 0;
            return (
              <ul
                key={setIndex}
                data-set
                data-clone={clone ? "true" : undefined}
                aria-hidden={clone ? true : undefined}
                className="marquee-set flex items-stretch gap-[clamp(20px,1.2vw,23px)]"
              >
                {courseCards.map((card, index) => (
                  <li
                    key={card.number}
                    data-reveal
                    style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
                    className="w-[clamp(280px,17.45vw,335px)] shrink-0"
                  >
                    <article className="flex h-[clamp(300px,17.7vw,340px)] flex-col justify-between rounded-[clamp(16px,1.04vw,20px)] bg-white px-[clamp(24px,1.875vw,36px)] pt-[clamp(20px,1.35vw,26px)] pb-[clamp(34px,2.3vw,44px)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-14px_rgba(0,0,0,0.65)]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="grid size-[clamp(39px,2.45vw,47px)] shrink-0 place-items-center rounded-full bg-gold">
                          {card.glyph ? (
                            <span className="font-body text-[clamp(20px,1.25vw,24px)] leading-none font-medium text-charcoal">
                              {card.glyph}
                            </span>
                          ) : (
                            <Image
                              src={card.icon ?? ""}
                              alt=""
                              width={512}
                              height={512}
                              className="h-[62%] w-[62%] object-contain"
                            />
                          )}
                        </span>
                        <span className="font-body text-[clamp(11px,0.78vw,15px)] leading-none font-normal text-[#c7c7c7]">
                          {card.number}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-body text-[clamp(21px,1.6vw,31px)] leading-[1.15] font-bold text-charcoal">
                          {card.title}
                        </h3>
                        <p className="mt-[clamp(8px,0.62vw,12px)] font-body text-[clamp(15px,1.04vw,20px)] leading-[1.45] font-light text-[#4a4a4a]">
                          {card.description}
                        </p>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
      </div>
    </div>
  );
}
