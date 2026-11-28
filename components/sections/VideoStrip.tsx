"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import VideoModal from "@/components/VideoModal";
import { videos, type VideoItem } from "@/lib/videos";

/**
 * Section 1b — the auto-scrolling YouTube strip (id="videos"), directly under
 * the hero and before "What to expect from the course".
 *
 * Geometry sampled from the full-page mockup at 1920: a single row of five
 * 16:9 cards, 335×188 each, 22px gaps, the first card flush with the content
 * column's left edge (260px) and the fifth cut off by the right edge of the
 * viewport, on the black page background — no heading, no chrome.
 *
 * The row is a marquee: the cards live in a track that is duplicated enough
 * times to cover at least 2 viewports at any window width, and the track
 * translates by exactly one set width per loop, so the seam is invisible.
 * The duration is derived from the measured set width, so the speed stays
 * constant (SCROLL_SPEED_PX_PER_SECOND) whatever the card count, viewport
 * width or number of duplicates is.
 *
 * Pausing: hover, keyboard focus within the strip (both CSS), a touch/drag,
 * an open modal and an off-screen strip (both a data flag). Untouched it runs
 * forever, GPU-only (transform + linear + infinite).
 */

/** Marquee speed in px per second — the single value to tune (40–50 = slow). */
const SCROLL_SPEED_PX_PER_SECOND = 48;

/** Sets in the markup before the first measurement (SSR + first paint). */
const INITIAL_SETS = 4;

/** A short pause after a touch/drag is released, before the marquee resumes. */
const RESUME_DELAY_MS = 900;

/** The mockup's 16:9 card: 335px wide at 1920, ~78% of the viewport on phones. */
const CARD_WIDTH = "w-[78vw] shrink-0 sm:w-[clamp(280px,17.45vw,335px)]";
/** 22px at 1920 — the mockup's gap between the strip's cards. */
const CARD_GAP = "gap-[clamp(20px,1.15vw,22px)]";
/** Small radius, per the mockup. */
const CARD_RADIUS = "rounded-[clamp(8px,0.52vw,10px)]";

/** Drag that moves further than this (px) counts as a swipe, not a click. */
const DRAG_THRESHOLD = 6;

function PlayIcon() {
  return (
    <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
      <span className="grid size-[clamp(38px,2.6vw,50px)] place-items-center rounded-full bg-gold/95 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)] transition-transform duration-200 group-hover:scale-110">
        {/* same triangle as the hero's play control and the "Class Records" row */}
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[46%] w-[46%] translate-x-[4%] fill-charcoal">
          <path d="M7.5 4.8v14.4L19.2 12 7.5 4.8Z" />
        </svg>
      </span>
    </span>
  );
}

function CardFace({ item }: { item: VideoItem }) {
  if (!item.youtubeId) {
    // TODO(client): no YouTube id yet → flat grey 16:9 placeholder, not clickable.
    return <span aria-hidden="true" className="block size-full bg-placeholder" />;
  }

  return (
    <>
      <Image
        src={`https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
        alt=""
        fill
        sizes="(min-width: 640px) 335px, 78vw"
        className="object-cover"
      />
      <PlayIcon />
    </>
  );
}

export default function VideoStrip() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<number | null>(null);
  const dragRef = useRef({ startX: 0 });

  const [sets, setSets] = useState(INITIAL_SETS);
  const [setWidth, setSetWidth] = useState(0);
  const [offscreen, setOffscreen] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [active, setActive] = useState<{ item: VideoItem; index: number } | null>(null);

  /** The marquee is paused as long as any of these hold (CSS adds hover/focus). */
  const paused = offscreen || engaged || cooldown || active !== null;
  const duration = setWidth > 0 ? setWidth / SCROLL_SPEED_PX_PER_SECOND : 0;

  /* ---------------------------------------------------------------- *
   * Reduced motion: no marquee at all, the row becomes scrollable.
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /* ---------------------------------------------------------------- *
   * Measure one set (cards + their gaps) and keep enough duplicate sets
   * to cover the viewport twice over. The speed then follows from it.
   * ---------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------- *
   * Pause while the strip is off-screen (also saves the compositor).
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  /* ---------------------------------------------------------------- *
   * Touch / drag: pause while held, resume a moment after release.
   * ---------------------------------------------------------------- */
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
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (resumeTimer.current !== null) {
        window.clearTimeout(resumeTimer.current);
        resumeTimer.current = null;
      }
      setCooldown(false);
      dragRef.current = { startX: event.clientX };
      setEngaged(true);
      setDragging(true);
    },
    [reducedMotion],
  );

  const endDrag = useCallback(() => {
    setDragging(false);
    setDragX(0);
    setEngaged(false);
    scheduleResume();
  }, [scheduleResume]);

  /* Pointer capture would swallow the card clicks, so the drag listens on the
   * window instead: it keeps working when the pointer leaves the strip. */
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

  /* ---------------------------------------------------------------- *
   * Modal: pause/mute the hero video on open, restore it on close.
   * ---------------------------------------------------------------- */
  const heroState = useRef<{ muted: boolean; wasPlaying: boolean } | null>(null);

  const openVideo = useCallback((item: VideoItem, index: number) => {
    const hero = document.querySelector<HTMLVideoElement>("#welcome video");
    if (hero) {
      heroState.current = { muted: hero.muted, wasPlaying: !hero.paused };
      hero.pause();
      hero.muted = true;
    }
    setActive({ item, index });
  }, []);

  const closeVideo = useCallback(() => {
    setActive(null);
    const hero = document.querySelector<HTMLVideoElement>("#welcome video");
    const previous = heroState.current;
    heroState.current = null;
    if (hero && previous) {
      hero.muted = previous.muted;
      if (previous.wasPlaying) void hero.play().catch(() => undefined);
    }
  }, []);

  const onCardClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>, item: VideoItem, index: number) => {
      // A drag that ends on a card must not open it (keyboard clicks have detail 0).
      if (event.detail > 0 && Math.abs(event.clientX - dragRef.current.startX) > DRAG_THRESHOLD) {
        return;
      }
      openVideo(item, index);
    },
    [openVideo],
  );

  const trackStyle = {
    "--marquee-set-width": `${setWidth}px`,
    "--marquee-duration": `${duration}s`,
  } as CSSProperties;

  return (
    <section
      id="videos"
      aria-label="Videos"
      className="video-strip relative overflow-hidden bg-black pb-[clamp(40px,2.5vw,48px)]"
    >
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        data-reveal
        data-paused={paused ? "true" : undefined}
        className={`marquee marquee-column marquee-fade ${dragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
      >
        <div
          ref={trackRef}
          data-run={setWidth > 0 ? "true" : undefined}
          style={trackStyle}
          className="marquee-track"
        >
          <div
            className={`flex ${CARD_GAP}`}
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
                  className={`marquee-set flex ${CARD_GAP}`}
                >
                  {videos.map((item, index) => (
                    <li key={item.id} className={CARD_WIDTH}>
                      {!clone && item.youtubeId ? (
                        <button
                          type="button"
                          onClick={(event) => onCardClick(event, item, index)}
                          aria-label={`Play video ${index + 1}${item.title ? `: ${item.title}` : ""}`}
                          className={`group relative block aspect-video w-full overflow-hidden ${CARD_RADIUS} bg-placeholder transition-[transform,filter] duration-200 hover:-translate-y-1 hover:brightness-110`}
                        >
                          <CardFace item={item} />
                        </button>
                      ) : (
                        <div
                          className={`relative block aspect-video w-full overflow-hidden ${CARD_RADIUS} bg-placeholder`}
                        >
                          <CardFace item={item} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              );
            })}
          </div>
        </div>
      </div>

      {active ? (
        <VideoModal
          youtubeId={active.item.youtubeId}
          title={active.item.title || `Video ${active.index + 1}`}
          onClose={closeVideo}
        />
      ) : null}
    </section>
  );
}
