"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";

/** Spotlight geometry (design values at the 1920px design width). */
const SPOT_RADIUS = 170;
const SPOT_LERP = 0.18;

const HERO_VIDEO = "/videos/sim-racing.mp4";
const HERO_POSTER = "/images/hero-bg.jpg";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const manuallyPaused = useRef(false);
  const heroVisible = useRef(true);
  const dragging = useRef(false);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const paused = !playing;

  /* ------------------------------------------------------------------ *
   * 1. Autoplay with sound, with the one-time-gesture unmute fallback.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncMuted = () => setMuted(video.muted);
    const syncPlaying = () => setPlaying(!video.paused);
    const syncTime = () => {
      if (!dragging.current) setProgress(video.currentTime);
    };
    const syncDuration = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);

    video.addEventListener("volumechange", syncMuted);
    video.addEventListener("play", syncPlaying);
    video.addEventListener("pause", syncPlaying);
    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("loadedmetadata", syncDuration);
    video.addEventListener("durationchange", syncDuration);

    // Initialise from the element itself — the metadata may already be loaded
    // before React hydrates (duration would otherwise stay 0).
    syncMuted();
    syncPlaying();
    syncTime();
    syncDuration();

    let cleanupGesture: (() => void) | null = null;

    const start = async () => {
      // Try unmuted autoplay first — most browsers reject it (NotAllowedError).
      video.muted = false;
      try {
        await video.play();
        return;
      } catch {
        /* blocked: fall back to muted autoplay + first-gesture unmute */
      }

      video.muted = true;
      try {
        await video.play();
      } catch {
        /* autoplay fully blocked — the user can start it from the control */
      }

      const gestures: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchend"];
      const unmute = () => {
        video.muted = false;
        void video.play().catch(() => undefined);
        cleanupGesture?.();
      };
      cleanupGesture = () => {
        gestures.forEach((event) => window.removeEventListener(event, unmute));
        cleanupGesture = null;
      };
      gestures.forEach((event) => window.addEventListener(event, unmute, { passive: true }));
    };

    void start();

    return () => {
      video.removeEventListener("volumechange", syncMuted);
      video.removeEventListener("play", syncPlaying);
      video.removeEventListener("pause", syncPlaying);
      video.removeEventListener("timeupdate", syncTime);
      video.removeEventListener("loadedmetadata", syncDuration);
      video.removeEventListener("durationchange", syncDuration);
      cleanupGesture?.();
    };
  }, []);

  /* ------------------------------------------------------------------ *
   * 2. Pause off-screen / on a hidden tab, resume when it was not a
   *    deliberate user pause.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const resume = () => {
      if (manuallyPaused.current) return;
      if (document.visibilityState !== "visible") return;
      void video.play().catch(() => undefined);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        heroVisible.current = entry.isIntersecting;
        if (entry.isIntersecting) resume();
        else video.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(section);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") video.pause();
      else if (heroVisible.current) resume();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* ------------------------------------------------------------------ *
   * 3. Paused-thumbnail colour spotlight (hover / touch, lerp-smoothed).
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const section = sectionRef.current;
    const layer = spotRef.current;
    if (!section || !layer) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0, tracking: false };
    let frame = 0;

    const apply = () => {
      layer.style.setProperty("--spot-x", `${state.x.toFixed(1)}px`);
      layer.style.setProperty("--spot-y", `${state.y.toFixed(1)}px`);
      layer.style.setProperty("--spot-r", `${state.r.toFixed(1)}px`);
    };

    const step = () => {
      frame = 0;
      if (reduceMotion) {
        state.x = state.tx;
        state.y = state.ty;
        state.r = state.tr;
        apply();
        return;
      }
      const ease = (current: number, target: number) => current + (target - current) * SPOT_LERP;
      state.x = ease(state.x, state.tx);
      state.y = ease(state.y, state.ty);
      state.r = ease(state.r, state.tr);
      apply();
      const settled =
        Math.abs(state.tx - state.x) < 0.5 &&
        Math.abs(state.ty - state.y) < 0.5 &&
        Math.abs(state.tr - state.r) < 0.5;
      if (settled) {
        state.x = state.tx;
        state.y = state.ty;
        state.r = state.tr;
        apply();
      } else {
        frame = window.requestAnimationFrame(step);
      }
    };

    const kick = () => {
      if (frame === 0) frame = window.requestAnimationFrame(step);
    };

    const toLocal = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onPointerMove = (event: PointerEvent) => {
      const { x, y } = toLocal(event.clientX, event.clientY);
      if (!state.tracking) {
        // first contact: start under the pointer, grow the radius from 0
        state.x = x;
        state.y = y;
        state.tracking = true;
      }
      state.tx = x;
      state.ty = y;
      state.tr = SPOT_RADIUS;
      kick();
    };

    const hide = () => {
      state.tracking = false;
      state.tr = 0;
      kick();
    };

    const onPointerLeave = () => hide();
    const onPointerEnd = (event: PointerEvent) => {
      // Only the pen needs this: for touch the browser fires `pointercancel` the
      // moment it treats the drag as a page pan (the touch listeners below keep
      // tracking through it and `touchend` hides the circle), and a mouse
      // releases its button all the time without meaning to dismiss the circle.
      if (event.pointerType === "pen") hide();
    };

    /**
     * Touch is handled through touch events, not pointer events: the browser
     * fires `pointercancel` as soon as it decides a finger drag is a page pan,
     * which would kill the circle mid-gesture. Passive touch listeners keep
     * working while the page scrolls.
     */
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const { x, y } = toLocal(touch.clientX, touch.clientY);
      if (!state.tracking) {
        state.x = x;
        state.y = y;
        state.tracking = true;
      }
      state.tx = x;
      state.ty = y;
      state.tr = SPOT_RADIUS;
      kick();
    };

    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave);
    section.addEventListener("pointerup", onPointerEnd);
    section.addEventListener("pointercancel", onPointerEnd);
    section.addEventListener("touchmove", onTouchMove, { passive: true });
    section.addEventListener("touchend", hide, { passive: true });
    section.addEventListener("touchcancel", hide, { passive: true });

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      section.removeEventListener("pointerup", onPointerEnd);
      section.removeEventListener("pointercancel", onPointerEnd);
      section.removeEventListener("touchmove", onTouchMove);
      section.removeEventListener("touchend", hide);
      section.removeEventListener("touchcancel", hide);
    };
  }, []);

  /* ------------------------------------------------------------------ *
   * Controls
   * ------------------------------------------------------------------ */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      manuallyPaused.current = false;
      void video.play().catch(() => undefined);
    } else {
      manuallyPaused.current = true;
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted) void video.play().catch(() => undefined);
  }, []);

  const seekToRatio = useCallback((clientX: number) => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track || !Number.isFinite(video.duration)) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setProgress(video.currentTime);
  }, []);

  const pct = duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;

  /* Height: 82.3svh, not 100svh. In the mockups the hero frame's bottom third
   * belongs to the black gap + the video strip that follows it: hero.png puts
   * the strip's top edge at 1080/1313 of the first screen (= 82.3%), right
   * below the hero content (whose 93px bottom padding then reads as the gap
   * between the tagline pill and the strip, exactly as drawn). At 100svh the
   * strip would start below the fold instead of inside it. */
  return (
    <section
      id="welcome"
      ref={sectionRef}
      className="relative isolate h-[82.3svh] min-h-[560px] w-full overflow-hidden bg-black"
    >
      {/* Background video (design is black & white → CSS grayscale) */}
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-0 h-full w-full object-cover grayscale"
      />

      {/* Darkening + bottom gradient into the black page background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-black/25 to-black/60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[46%] bg-gradient-to-t from-black via-black/70 to-transparent"
      />

      {/* Paused thumbnail + colour spotlight (same image, two layers) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ${
          paused ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: `url(${HERO_POSTER})` }}
        />
        <div
          ref={spotRef}
          className="hero-spot absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_POSTER})` }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-5 pb-[clamp(56px,8.6vw,93px)]">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-0">
          {/* Heading + tagline pill (the pill matches the heading width) */}
          <div className="w-fit">
            <p className="font-body hero-kicker mb-[clamp(4px,0.63vw,12px)] leading-[1.15] font-light text-white">
              Welcome to
            </p>
            <h1 className="font-display hero-display leading-[1.15] text-white uppercase">
              THE SCHOOL
              <br />
              OF MASTERY
            </h1>
            <div className="mt-[clamp(4px,0.42vw,8px)] flex w-full min-h-[clamp(46px,3.07vw,59px)] items-center justify-center gap-[clamp(10px,1.35vw,26px)] rounded-full bg-gold px-4 py-2 lg:h-[clamp(46px,3.07vw,59px)] lg:py-0">
              <span className="font-body text-center text-[clamp(15px,1.82vw,35px)] leading-tight font-medium text-charcoal">
                {siteConfig.tagline}
              </span>
              <Image
                src="/icons/upward-trend.png"
                alt=""
                width={512}
                height={512}
                className="h-[clamp(24px,2.86vw,55px)] w-auto shrink-0 object-contain"
              />
            </div>
          </div>

          {/* Video controls — same row as the pill on desktop, below it on mobile.
              `.hero-controls` keeps them clear of the floating call/WhatsApp
              buttons between lg and 1640px (see globals.css). */}
          <div className="hero-controls flex items-center gap-[clamp(10px,1.3vw,25px)] lg:mb-[14px]">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute video" : "Mute video"}
              aria-pressed={!muted}
              className="grid place-items-center text-white transition-opacity hover:opacity-80"
            >
              <Image
                src="/icons/medium-volume.png"
                alt=""
                width={512}
                height={512}
                className="h-[clamp(19px,1.19vw,23px)] w-auto brightness-0 invert"
              />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause video" : "Play video"}
              className="grid h-[clamp(16px,0.99vw,19px)] w-[clamp(14px,0.89vw,17px)] place-items-center text-white transition-opacity hover:opacity-80"
            >
              <svg viewBox="0 0 17 19" aria-hidden="true" className="h-full w-full fill-current">
                {playing ? (
                  <path d="M0 0h6v19H0zM11 0h6v19h-6z" />
                ) : (
                  <path d="M0 0l17 9.5L0 19z" />
                )}
              </svg>
            </button>

            <div
              ref={trackRef}
              role="slider"
              tabIndex={0}
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration) || 0}
              aria-valuenow={Math.round(progress) || 0}
              aria-valuetext={`${formatTime(progress)} of ${formatTime(duration)}`}
              onPointerDown={(event) => {
                dragging.current = true;
                event.currentTarget.setPointerCapture(event.pointerId);
                seekToRatio(event.clientX);
              }}
              onPointerMove={(event) => {
                if (dragging.current) seekToRatio(event.clientX);
              }}
              onPointerUp={(event) => {
                dragging.current = false;
                event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onPointerCancel={() => {
                dragging.current = false;
              }}
              onKeyDown={(event) => {
                const video = videoRef.current;
                if (!video) return;
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  const step = event.key === "ArrowRight" ? 5 : -5;
                  video.currentTime = Math.min(
                    video.duration || 0,
                    Math.max(0, video.currentTime + step),
                  );
                  setProgress(video.currentTime);
                }
              }}
              className="flex h-[clamp(20px,1.3vw,25px)] w-[clamp(80px,8.65vw,166px)] cursor-pointer items-center"
            >
              <div className="relative h-[3px] w-full rounded-full bg-white/85">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={{ width: `${pct}%` }}
                />
                <span
                  className="absolute top-1/2 size-[clamp(9px,0.57vw,11px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                  style={{ left: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
