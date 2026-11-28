"use client";

import { useEffect } from "react";

/**
 * Site-wide scroll reveal.
 *
 * Every element carrying `data-reveal` starts hidden (opacity 0, nudged down a
 * little — see the `[data-reveal]` rules in globals.css) and is switched to
 * `data-shown="true"` the moment it crosses ~88% of the viewport height, which
 * runs the CSS transition. Everything is driven by two compositor-only
 * properties (opacity + transform), one shared observer, and reveal-once
 * semantics, so scrolling stays smooth no matter how fast the page is thrown.
 *
 * Delays for staggering a row of items come from the element's own
 * `--reveal-delay` (set inline where a group is rendered from a list).
 *
 * Accessibility: with `prefers-reduced-motion: reduce` nothing is hidden or
 * animated at all — the observer is never created and every target is marked
 * shown synchronously. A `<noscript>` rule in layout.tsx covers JS-off.
 */
export default function ScrollReveal() {
  useEffect(() => {
    /**
     * A `data-reveal-group` is an element whose own children carry the reveal
     * (e.g. the course card row: an `overflow-x: auto` scroller clips its later
     * cards out of the viewport, so those cards can never intersect on their
     * own and would stay invisible forever). Revealing the group reveals every
     * `[data-reveal]` inside it, keeping each child's own stagger delay.
     */
    const groups = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal-group]"));
    const inGroup = (el: HTMLElement) => groups.some((g) => g !== el && g.contains(el));
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (el) => !inGroup(el),
    );
    if (targets.length === 0 && groups.length === 0) return;

    /**
     * Reveal one element and, once its transition is over, drop the
     * `will-change` hint so the page does not keep dozens of layers alive.
     */
    const show = (el: HTMLElement) => {
      el.dataset.shown = "true";
      window.setTimeout(() => {
        el.dataset.revealed = "done";
      }, 1500);
    };

    const showGroup = (group: HTMLElement) => {
      group.querySelectorAll<HTMLElement>("[data-reveal]").forEach(show);
    };

    const reveal = (el: HTMLElement) => {
      if (el.hasAttribute("data-reveal-group")) showGroup(el);
      if (el.hasAttribute("data-reveal")) show(el);
    };

    // Reduced motion: show everything at once, no observer, no timers.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => {
        el.dataset.shown = "true";
        el.dataset.revealed = "done";
      });
      groups.forEach((group) => {
        group.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          el.dataset.shown = "true";
          el.dataset.revealed = "done";
        });
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      /* threshold 0 (not a ratio): an element taller than the viewport can
       * never reach a meaningful ratio. The POSITIVE bottom margin expands the
       * root, so a target starts animating while it is still just below the
       * fold: it is already mid-transition by the time its first pixel shows on
       * screen. That is the whole point — with a negative margin a target that
       * was already half visible on load (the marquee on a phone) stayed
       * invisible until the first extra scroll, leaving an empty slot
       * (Boss's report). Anything on screen — even partially — now counts as
       * intersecting at the observer's first callback. */
      { threshold: 0, rootMargin: "0px 0px 14% 0px" },
    );

    [...targets, ...groups].forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
