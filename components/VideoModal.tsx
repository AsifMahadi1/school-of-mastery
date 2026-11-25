"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Accessible video lightbox for the strip under the hero.
 *
 * - the iframe is created only after the click (nothing loads up front) and
 *   unmounted on close, which stops playback
 * - focus is trapped inside the dialog, `Esc` and a click outside close it,
 *   and focus returns to the card that opened it
 * - youtube-nocookie.com + autoplay, so the video starts immediately
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

type VideoModalProps = {
  youtubeId: string;
  title: string;
  onClose: () => void;
};

export default function VideoModal({ youtubeId, title, onClose }: VideoModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const inside = current instanceof Node && panel.contains(current);

      if (event.shiftKey && (!inside || current === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inside || current === last)) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const { overflow, paddingRight } = document.body.style;
    // Lock the page behind the dialog without shifting it (scrollbar width back).
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    closeRef.current?.focus();
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused?.focus();
    };
  }, [onKeyDown]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[min(1100px,92vw)]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="mb-3 ml-auto grid size-[clamp(36px,2.4vw,46px)] place-items-center rounded-full border border-white/30 text-white transition-colors hover:border-white/70 hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-[clamp(10px,1vw,20px)] bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="block h-full w-full border-0"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
