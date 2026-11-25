"use client";

import { useState } from "react";

import { aboutTabs, ABOUT_TODO } from "@/lib/about";

/**
 * The About card's pill tabs + body copy.
 *
 * Measured from "Website sections./Eighth and last season.png" at 1920: three
 * 212×42 pills with 26px gaps filling the card's 690px content column, and the
 * body 25px Jost Light on a 30px line grid whose first line starts 62px under
 * the pills.
 */
export default function AboutTabs() {
  const [selected, setSelected] = useState(0);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
    const current = target?.dataset.index !== undefined ? Number(target.dataset.index) : selected;
    const last = aboutTabs.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = current === last ? 0 : current + 1;
    else if (event.key === "ArrowLeft") next = current === 0 ? last : current - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    event.currentTarget
      .querySelectorAll<HTMLElement>('[role="tab"]')
      [next]?.focus();
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="About topics"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-[clamp(8px,1.35vw,26px)]"
      >
        {aboutTabs.map((item, index) => {
          const active = index === selected;
          return (
            <button
              key={item.id}
              id={`about-tab-${item.id}`}
              role="tab"
              type="button"
              data-index={index}
              aria-selected={active}
              aria-controls={`about-panel-${item.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(index)}
              className={`h-[clamp(34px,2.19vw,42px)] shrink-0 grow basis-[clamp(96px,6.6vw,130px)] rounded-full px-[clamp(14px,1.04vw,20px)] font-body text-[clamp(13px,1.15vw,22px)] leading-none font-normal transition-colors duration-200 ${
                active ? "bg-ink text-white" : "bg-white text-ink hover:bg-white/80"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {aboutTabs.map((item, index) => {
        if (index !== selected) {
          return (
            <div
              key={item.id}
              id={`about-panel-${item.id}`}
              role="tabpanel"
              aria-labelledby={`about-tab-${item.id}`}
              hidden
            />
          );
        }
        const pending = item.paragraphs[0] === ABOUT_TODO;
        return (
          <div
            key={item.id}
            id={`about-panel-${item.id}`}
            role="tabpanel"
            aria-labelledby={`about-tab-${item.id}`}
            tabIndex={0}
            className="fade-swap mt-[clamp(28px,3.23vw,62px)] space-y-[clamp(10px,0.94vw,18px)] focus-visible:outline-none"
          >
            {item.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`font-body text-[clamp(16px,1.3vw,25px)] leading-[clamp(20px,1.5625vw,30px)] font-light text-ink ${
                  pending ? "italic opacity-70" : ""
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        );
      })}
    </>
  );
}
