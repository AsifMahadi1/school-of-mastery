import Image from "next/image";

import AboutTabs from "@/components/AboutTabs";

/**
 * Section 8a — About the instructor (id="#about").
 *
 * Layout follows "Website sections./Eighth and last season.png":
 *   - white script "A little" over the gold two-line heading, aligned with the
 *     card's content column (the heading's left edge = the panel's content inset);
 *   - a wide light-grey card whose bottom edge carries the instructor's
 *     black-and-white cut-out photo, standing on it with the head/shoulders
 *     overflowing 384px above the card's top edge (the photo also hangs 47px
 *     left of the card, exactly like the Details section's calendar);
 *   - the black section ends on a big rounded bottom (80px) that the light-grey
 *     footer shows through — the footer is pulled up 80px behind it.
 *
 * Measured at 1920 (the design width): heading 33px / 40px baseline distance
 * (the site's standard lockup); card 1400×531 with a 42.4% content inset and
 * 8.2% right padding; photo 43.5% of the card's width (609×914, the asset's own
 * 2:3 aspect), 384px above the card and 47px outside its left edge.
 */
export default function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative z-10 rounded-b-[clamp(40px,4.17vw,80px)] bg-black pt-[clamp(60px,6.12vw,117.5px)] pb-[clamp(80px,12.55vw,241px)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5">
        <h2
          id="about-heading"
          data-reveal
          className="font-display section-display text-gold uppercase md:pl-[42.4%]"
        >
          <span
            aria-hidden="true"
            className="section-script block font-script text-white normal-case"
          >
            A little
          </span>
          ABOUT ME
          <br />
          &amp; MY JOURNEY
        </h2>

        <div
          data-reveal="panel"
          className="relative mt-[clamp(24px,2.14vw,41px)] rounded-[clamp(24px,2.08vw,40px)] bg-panel px-5 pt-[clamp(20px,2.24vw,43px)] pb-[clamp(60px,7.76vw,149px)] md:pr-[8.2%] md:pl-[42.4%]"
        >
          {/* Instructor photo: stands on the card's bottom, head over the top edge. */}
          <div
            data-reveal="photo"
            className="mx-auto mb-[clamp(20px,2vw,38px)] w-[72%] max-w-[360px] [--reveal-delay:140ms] md:absolute md:bottom-0 md:-left-[3.36%] md:mb-0 md:w-[43.5%] md:max-w-none"
          >
            <Image
              src="/images/about-me.png"
              alt="Black-and-white portrait of the course instructor, arms crossed"
              width={1024}
              height={1536}
              sizes="(min-width: 768px) 43vw, 72vw"
              className="h-auto w-full grayscale"
            />
          </div>

          <AboutTabs />
        </div>
      </div>
    </section>
  );
}
