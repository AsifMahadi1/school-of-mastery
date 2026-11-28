import Image from "next/image";
import CourseCardRow from "@/components/CourseCardRow";

/**
 * Section 2 — "What to expect from the course" (id="#course").
 *
 * Layout follows "Website sections./second section.png":
 *   [script "What" + gold heading]        [white "Get Started" pill + gold arrow]
 *   [horizontally scrollable row of white cards — the course modules]
 *
 * NOTE ON THE HERO OVERLAP: the five grey boxes drawn at the bottom of
 * hero.png are NOT these course cards — they are the video strip that now
 * owns that row (#videos, components/sections/VideoStrip.tsx). This section
 * follows the strip in normal flow and overlaps nothing, so the grey row
 * exists exactly once on the page.
 *
 * NOTE ON THE TOP PADDING: the mockup's gap between the strip's cards and this
 * section's first ink is 113px at 1920 (template y1268 → 1381, measured), but
 * the strip's own bottom padding AND this padding both applied, which rendered
 * 348px — a gap ~3x the design, which Boss flagged ('গ্যাপ তুলনামূলক একটু
 * বেশি'). The pair is now solved to land back on the mockup: strip pb 48px +
 * this padding (clamp max 88px) − the script's 23px negative leading = 113px.
 */
export default function CourseSection() {
  return (
    <section
      id="course"
      aria-labelledby="course-heading"
      className="relative bg-black pt-[clamp(44px,4.6vw,88px)] pb-[clamp(70px,11.2vw,215px)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5">
        <div className="flex flex-col items-start gap-[clamp(24px,3vw,40px)] lg:flex-row lg:items-end lg:gap-[clamp(60px,6.77vw,130px)]">
          <h2
            id="course-heading"
            className="font-display course-display text-gold uppercase"
          >
            <span
              aria-hidden="true"
              className="font-script course-script block text-white normal-case"
            >
              What
            </span>
            TO EXPECT{" "}
            <br />
            FROM THE COURSE
          </h2>

          <a
            href="#enroll"
            className="font-body inline-flex h-[clamp(40px,2.55vw,49px)] shrink-0 items-center gap-[clamp(8px,0.63vw,12px)] rounded-full bg-white pr-[clamp(5px,0.42vw,8px)] pl-[clamp(16px,1.2vw,23px)] text-[clamp(15px,1.25vw,24px)] leading-none font-medium text-charcoal transition-transform duration-200 hover:-translate-y-0.5"
          >
            Get Started
            <span className="grid size-[clamp(30px,2.08vw,40px)] place-items-center rounded-full bg-gold">
              <Image
                src="/icons/upward-trend.png"
                alt=""
                width={512}
                height={512}
                className="h-[52%] w-[52%] object-contain"
              />
            </span>
          </a>
        </div>
      </div>

      <div className="mt-[clamp(34px,3.44vw,66px)]">
        <CourseCardRow />
      </div>
    </section>
  );
}
