import Image from "next/image";
import CourseCardRow from "@/components/CourseCardRow";

/**
 * Section 2 — "What to expect from the course" (id="#course").
 *
 * Layout follows "Website sections./second section.png":
 *   [script "What" + gold heading]        [white "Get Started" pill + gold arrow]
 *   [horizontally scrollable row of white cards — the course modules]
 *
 * NOTE ON THE HERO OVERLAP: in the full-page mockup this card row sits below
 * the heading, ~526px under the hero's fold, and the grey boxes drawn at the
 * bottom of hero.png are a placeholder for this same row inside the hero frame.
 * A negative margin cannot put the row at the hero's bottom edge without
 * dragging the heading block (and the tagline/controls there) over the hero, so
 * the section flows normally. Flip the two blocks below if the "peeking"
 * arrangement is preferred instead.
 */
export default function CourseSection() {
  return (
    <section
      id="course"
      aria-labelledby="course-heading"
      className="relative bg-black pt-[clamp(80px,16.8vw,323px)] pb-[clamp(70px,11.2vw,215px)]"
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
