import FaqPanel from "@/components/FaqPanel";

/**
 * Section 6 — FAQ (id="#faq").
 *
 * Layout follows "Website sections./Sixth section.png": the white script
 * "Know more" hanging over the top-left of the gold two-line heading
 * "QUESTIONS / ASKED FREQUENTLY" (the mockup's typo "AKED" is fixed), then the
 * big light-grey panel that holds the tab pills, the question accordion and the
 * "Got more questions?" card.
 *
 * Measured at 1920 (the design width): heading 33px with a 40px baseline
 * distance, its two lines 389px and 651px wide (needs +0.02em tracking); the
 * script's ink is 188px wide and starts 76px left of the heading; the heading's
 * second line sits 56px above the panel's top edge. The panel is 1623px wide —
 * WIDER than the site's 1400px content column (111.5px of padding each side) —
 * so it gets its own wrapper (1440 + 2×111.5 = 1663 max width) instead of the
 * standard max-w-[1440px] container.
 *
 * The heading is aligned with the panel's QUESTION column (not with the panel's
 * left edge): `.faq-inset` = panel padding + card column + gap, the same maths
 * `.faq-cols` uses for the panel's inner grid.
 */
export default function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative bg-black pt-[clamp(60px,5.6vw,107.5px)] pb-[clamp(80px,11.2vw,215px)]"
    >
      <div className="mx-auto w-full max-w-[1663px] px-5">
        <h2
          id="faq-heading"
          data-reveal
          className="font-display section-display faq-inset text-gold uppercase"
        >
          <span
            aria-hidden="true"
            className="section-script block font-script text-white normal-case"
          >
            Know more
          </span>
          QUESTIONS
          <br />
          ASKED FREQUENTLY
        </h2>

        <FaqPanel />
      </div>
    </section>
  );
}
