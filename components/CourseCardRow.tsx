"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { courseCards } from "@/lib/courseCards";

/**
 * Course card row — a STEPPED carousel: one card slides in, the row rests, then
 * the next card slides in. Once the last card has come on screen the row is
 * back at the start — the reset is instant and invisible, because shifting by
 * exactly one set width shows the identical picture.
 *
 * Boss: 'নতুন নতুন একটা স্ক্রিনে আসবে এবং থেমে যাবে, আবার আরেকটা আসবে' — so this is
 * NOT the continuous marquee the video strip uses, and the row keeps HARD edges
 * (no fade) inside the content column's bounds.
 *
 * Mechanics: one card width + gap is measured, enough duplicate sets are
 * rendered to cover the viewport twice over, and a timer advances one card per
 * STEP_MOVE_MS + STEP_HOLD_MS. The row rests while hovered or focused (so a card
 * can be read) and while off-screen (no wasted timers); with
 * prefers-reduced-motion it never advances and becomes a plain swipeable
 * scroller instead.
 *
 * The row is also the scroll-reveal group, so it reveals every card (with its
 * stagger) when it arrives — including the ones outside the viewport.
 */

/** How long one step takes to slide. */
const STEP_MOVE_MS = 750;
/** How long the row rests on a card before the next step. */
const STEP_HOLD_MS = 2600;
/** Soft landing for each step. */
const STEP_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
/** Sets in the markup before the first measurement (SSR + first paint). */
const INITIAL_SETS = 3;

export default function CourseCardRow() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [stepWidth, setStepWidth] = useState(0);
  const [sets, setSets] = useState(INITIAL_SETS);
  const [instant, setInstant] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const perSet = courseCards.length;
  const resting = offscreen || engaged || reducedMotion || stepWidth === 0;

  /* ------------------------------------------------------------------ *
   * Reduced motion: no stepping at all, the row stays a native scroller.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /* ------------------------------------------------------------------ *
   * Measure one step (card + gap) and keep enough duplicate sets to cover the
   * viewport twice over, so a step never runs out of cards on the right.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const set = track.querySelector<HTMLElement>("[data-set]");
      const card = track.querySelector<HTMLElement>("[data-set] > li");
      if (!set || !card) return;
      const gap = Number.parseFloat(getComputedStyle(set).columnGap) || 0;
      const width = card.offsetWidth + gap;
      const setWidth = set.offsetWidth + gap;
      if (width <= 0 || setWidth <= 0) return;
      setStepWidth(width);
      setSets(Math.max(2, Math.ceil((window.innerWidth * 2) / setWidth) + 1));
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
   * The step timer: one card per MOVE + HOLD, landing on card boundaries.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (resting) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current >= perSet ? current : current + 1));
    }, STEP_MOVE_MS + STEP_HOLD_MS);
    return () => window.clearInterval(timer);
  }, [resting, perSet]);

  /* ------------------------------------------------------------------ *
   * End of a set: jump back to the start with no transition — one set width
   * later the picture is identical, so nothing is seen.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (step !== perSet) return;
    const timer = window.setTimeout(() => {
      setInstant(true);
      setStep(0);
      // two frames: one to paint the un-transitioned jump, one to re-arm
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setInstant(false)));
    }, STEP_MOVE_MS + 60);
    return () => window.clearTimeout(timer);
  }, [step, perSet]);

  const trackStyle = {
    transform: `translate3d(${-(step * stepWidth)}px, 0, 0)`,
    transition:
      instant || reducedMotion || stepWidth === 0
        ? "none"
        : `transform ${STEP_MOVE_MS}ms ${STEP_EASE}`,
  } as CSSProperties;

  return (
    <div
      ref={viewportRef}
      role="region"
      aria-label="What to expect from the course — cards that step through automatically"
      tabIndex={0}
      data-reveal-group
      className="marquee marquee-column cursor-default"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={() => setEngaged(false)}
    >
      <div ref={trackRef} className="marquee-track" style={trackStyle}>
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
  );
}
