"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { courseCards } from "@/lib/courseCards";

/**
 * Horizontally scrollable card row.
 * - native touch/trackpad scrolling + scroll-snap (CSS, see .course-scroller)
 * - mouse drag-to-scroll
 * - the row is cut at the content column's right edge (and flush with its left
 *   edge), so the last card is visibly cut off without running to the viewport
 *   edge — see .course-scroller
 */
export default function CourseCardRow() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0 });
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Touch and pens scroll natively; only the mouse needs a drag handler.
    if (event.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = { active: true, startX: event.clientX, startLeft: el.scrollLeft };
    setDragging(true);
    el.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || !drag.current.active) return;
    el.scrollLeft = drag.current.startLeft - (event.clientX - drag.current.startX);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || !drag.current.active) return;
    const moved = Math.abs(el.scrollLeft - drag.current.startLeft) > 4;
    drag.current.active = false;
    setDragging(false);
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);

    // Native touch scrolling snaps itself; a programmatic drag has to snap
    // explicitly. Candidates are the card starts, plus the end of the row so a
    // deliberately dragged-to-the-end position is not yanked back.
    if (moved) {
      const card = el.querySelector("li");
      const list = el.querySelector("ul");
      if (card && list) {
        const step =
          card.getBoundingClientRect().width +
          parseFloat(getComputedStyle(list).columnGap || "0");
        const max = Math.max(0, el.scrollWidth - el.clientWidth);
        const candidates: number[] = [];
        for (let x = 0; x <= max; x += step) candidates.push(x);
        candidates.push(max);
        const target = candidates.reduce(
          (best, candidate) =>
            Math.abs(candidate - el.scrollLeft) < Math.abs(best - el.scrollLeft) ? candidate : best,
          0,
        );
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollTo({ left: target, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }
  };

  return (
    <div
      ref={scrollerRef}
      role="region"
      aria-label="What to expect from the course — scrollable list of cards"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
      className={`course-scroller ${dragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
    >
      <ul className="flex items-stretch gap-[clamp(20px,1.2vw,23px)]">
        {courseCards.map((card) => (
          <li
            key={card.number}
            className="w-[clamp(280px,17.45vw,335px)] shrink-0 snap-start"
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
    </div>
  );
}
