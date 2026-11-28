"use client";

import { useId, useRef, useState } from "react";

import { faqCard, faqDefaultOpen, faqTabs, FAQ_TODO_ANSWER } from "@/lib/faq";

/**
 * Section 6's interactive part — the tab pills, the accordion and the
 * "Got more questions?" card, inside the light-grey panel.
 *
 * Layout numbers come from "Website sections./Sixth section.png" measured at
 * 1920 (the design width): panel 1623 wide with 111.5 inner padding, a 238px
 * card column, a 120px gap and a 1034px question column; the card is flush with
 * the panel's bottom-left corner, the pills start 152px under the panel's top.
 * `.faq-cols` / `.faq-inset` in globals.css carry the shared column maths.
 *
 * Rows keep the mockup's padding — including its two odd ones: the first row is
 * 16px tighter at the bottom and the last row 6px taller than the middle ones
 * (the design draws them that way; measured divider positions 6065 / 6241 /
 * 6328 / 6414 / 6507 in the 1920px template).
 */

/** The +/− toggle: a 13px cross at 1920; the vertical bar shrinks away when open. */
function ToggleGlyph({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 13 13"
      aria-hidden="true"
      className="size-[clamp(9px,0.68vw,13px)] shrink-0 fill-ink"
    >
      <rect x="0" y="5" width="13" height="3" />
      <rect
        x="5"
        y="0"
        width="3"
        height="13"
        className="origin-center transition-transform duration-300 motion-reduce:transition-none"
        style={{ transform: open ? "scaleY(0)" : "scaleY(1)" }}
      />
    </svg>
  );
}

type RowProps = {
  id: string;
  question: string;
  answer: string | null;
  open: boolean;
  onToggle: () => void;
};

function AccordionRow({ id, question, answer, open, onToggle }: RowProps) {
  const buttonId = `${id}-button`;
  const answerId = `${id}-answer`;
  const missing = answer === null;

  return (
    <li className="relative border-b border-[#b6b6b6] pt-[clamp(16px,1.2vw,23px)] pb-[clamp(16px,1.41vw,27px)] first:pb-[clamp(10px,0.78vw,15px)] last:pt-[clamp(18px,1.51vw,29px)]">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={answerId}
          onClick={onToggle}
          className="flex w-full items-center text-left font-body text-[clamp(17px,1.35vw,26px)] leading-[clamp(24px,1.875vw,36px)] font-normal text-ink"
        >
          <span>{question}</span>
        </button>
      </h3>

      {/* The mockup centres the toggle on the ROW (not on the question), so on the
       * open row it sits level with the answer's first line; pointer-events-none
       * keeps the whole row one click target. */}
      <span className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2">
        <ToggleGlyph open={open} />
      </span>

      {/* Height animation: grid-template-rows 0fr → 1fr (no max-height guessing). */}
      <div
        id={answerId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p
            className={`mt-[clamp(12px,1.22vw,23.5px)] max-w-[clamp(280px,40.6vw,780px)] pb-[clamp(0px,0.29vw,5.5px)] font-body text-[clamp(16px,1.3vw,25px)] leading-[clamp(20px,1.5625vw,30px)] font-light text-ink ${
              missing ? "italic opacity-70" : ""
            }`}
          >
            {answer ?? FAQ_TODO_ANSWER}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function FaqPanel() {
  const uid = useId();
  const [selected, setSelected] = useState(0);
  const [openRows, setOpenRows] = useState<Record<string, number | null>>(faqDefaultOpen);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tab = faqTabs[selected];
  const openIndex = openRows[tab.id] ?? null;

  const selectTab = (index: number) => {
    setSelected(index);
    tabRefs.current[index]?.focus();
  };

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = faqTabs.length - 1;
    // Navigate from the FOCUSED tab (roving tabindex), not from the selected one.
    const target = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
    const focused = target?.dataset.index !== undefined ? Number(target.dataset.index) : selected;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = focused === last ? 0 : focused + 1;
    else if (event.key === "ArrowLeft") next = focused === 0 ? last : focused - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    selectTab(next);
  };

  return (
    <div
      data-reveal
      className="faq-panel mt-[clamp(24px,2.45vw,47px)] bg-panel px-[clamp(20px,5.81vw,111.5px)] pt-[clamp(60px,7.92vw,152px)] pb-[clamp(60px,7.03vw,135px)]"
    >
      <div className="faq-cols">
        {/* Question column — first in the DOM so on mobile it sits above the card. */}
        <div className="md:col-start-2 md:row-start-1">
          <div
            role="tablist"
            aria-label="FAQ topics"
            onKeyDown={onTabKeyDown}
            className="flex flex-wrap gap-[clamp(12px,1.25vw,24px)]"
          >
            {faqTabs.map((item, index) => {
              const active = item.id === tab.id;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`${uid}-tab-${item.id}`}
                  role="tab"
                  type="button"
                  data-index={index}
                  aria-selected={active}
                  aria-controls={`${uid}-panel-${item.id}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setSelected(index)}
                  className={`inline-flex h-[clamp(34px,2.34vw,45px)] w-[clamp(110px,11.15vw,214px)] items-center justify-center rounded-full px-[clamp(8px,1.04vw,20px)] font-body text-[clamp(15px,1.35vw,26px)] leading-none transition-colors duration-200 ${
                    active ? "bg-ink text-white" : "bg-white text-ink hover:bg-white/85"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {faqTabs.map((item, index) => {
            if (index !== selected) {
              // Inactive panels stay in the DOM so aria-controls always resolves.
              return (
                <div
                  key={item.id}
                  id={`${uid}-panel-${item.id}`}
                  role="tabpanel"
                  aria-labelledby={`${uid}-tab-${item.id}`}
                  hidden
                />
              );
            }
            return (
              <div
                key={item.id}
                id={`${uid}-panel-${item.id}`}
                role="tabpanel"
                aria-labelledby={`${uid}-tab-${item.id}`}
                tabIndex={0}
                className="focus-visible:outline-none"
              >
                <ul className="mt-[clamp(12px,1.4vw,27px)]">
                  {item.items.map((row, rowIndex) => (
                    <AccordionRow
                      key={row.question}
                      id={`${uid}-${item.id}-row-${rowIndex}`}
                      question={row.question}
                      answer={row.answer}
                      open={openIndex === rowIndex}
                      onToggle={() =>
                        setOpenRows((previous) => ({
                          ...previous,
                          [item.id]: previous[item.id] === rowIndex ? null : rowIndex,
                        }))
                      }
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* "Got more questions?" card — panel's bottom-left on desktop, below the list on mobile. */}
        <div className="mx-auto mt-[clamp(24px,2.5vw,48px)] w-full max-w-[320px] md:col-start-1 md:row-start-1 md:mx-0 md:mt-0 md:max-w-none md:w-full md:self-end">
          <div className="rounded-[clamp(16px,1.04vw,20px)] bg-white px-[clamp(16px,1.15vw,22px)] pt-[clamp(20px,1.61vw,31px)] pb-[clamp(22px,1.72vw,33px)] text-center">
            <p className="font-body text-[clamp(14px,0.885vw,17px)] leading-[clamp(20px,1.25vw,24px)] font-medium text-ink">
              {faqCard.heading}
            </p>
            <p className="mt-[clamp(4px,0.31vw,6px)] font-body text-[clamp(14px,0.885vw,17px)] leading-[clamp(20px,1.25vw,24px)] font-light text-ink">
              {faqCard.body}
            </p>
            <a
              href={faqCard.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-[clamp(14px,1.2vw,23px)] flex h-[clamp(30px,1.82vw,35px)] w-full items-center justify-center rounded-full bg-gold font-body text-[clamp(15px,1.25vw,24px)] leading-none font-semibold text-ink transition-colors duration-200 hover:bg-gold-deep"
            >
              {faqCard.cta.label}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
