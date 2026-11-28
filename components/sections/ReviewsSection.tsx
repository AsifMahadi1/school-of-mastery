import ReviewsCarousel from "@/components/ReviewsCarousel";

/**
 * Section 7 — student reviews (id="#reviews").
 *
 * Layout follows "Website sections./Seventh section.png": the white script
 * "Our former" over the gold heading "STUDENTS' / REVIEWS & FEEDBACKS" (the
 * mockup's typo "STUDETNS'" is fixed), then a gold line broken in the middle by
 * three stars (the middle one bigger), the quote, the reviewer's name and
 * location, a second gold line whose notch points at the active avatar, and the
 * avatar row. `ReviewsCarousel` owns the quote/line2/avatars and the behaviour.
 *
 * Measured at 1920 (the design width): heading 33px with a 40px baseline
 * distance (the same lockup as the other sections); the line is 2px thick and
 * 1281px wide with a 199px break holding 39px side stars and a 52px middle star,
 * all three sharing their bottom edge with the line running through the side
 * stars' centres (62.5% of the star band); the quote is 28.5px Jost Light
 * wrapped at 1040px into three lines; the name 28px semibold; the location
 * 27.5px light.
 *
 * NOTE ON ALIGNMENT: in the mockup every centred element of this section (line,
 * stars, quote, name, avatars) sits ~60px RIGHT of the page axis — this section
 * alone, while sections 2–6 are centred. The block is therefore centred on the
 * page axis (Boss's brief says "centered") with the mockup's internal
 * relationships kept: the heading starts 116px inside the 1281px line and the
 * script hangs 76px left of the heading. Shift the whole block 60px right if the
 * mockup's absolute placement is wanted instead.
 */
function Star({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 95.1 90.45"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`fill-gold ${className ?? ""}`}
    >
      <path d="M47.55 0 L58.78 34.55 L95.1 34.55 L65.72 55.9 L76.94 90.45 L47.55 69.1 L18.16 90.45 L29.38 55.9 L0 34.55 L36.32 34.55 Z" />
    </svg>
  );
}

export default function ReviewsSection() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="relative bg-black pt-[clamp(40px,3.72vw,71.5px)] pb-[clamp(80px,11.2vw,215px)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5">
        <div className="mx-auto w-full max-w-[1281px]">
          <h2
            id="reviews-heading"
            data-reveal
            className="font-display section-display pl-[clamp(0px,6.04vw,116px)] text-gold uppercase"
          >
            <span
              aria-hidden="true"
              className="section-script block font-script text-white normal-case"
            >
              Our former
            </span>
            STUDENTS&rsquo;
            <br />
            REVIEWS &amp; FEEDBACKS
          </h2>

          {/* Gold line broken by three stars (middle one bigger, common bottom edge). */}
          <div className="relative mt-[clamp(28px,2.7vw,51.9px)]">
            <div className="mx-auto flex w-[clamp(130px,10.36vw,199px)] items-end justify-center gap-[clamp(2px,0.23vw,4.5px)]">
              <Star className="h-[clamp(24px,1.93vw,37px)] w-[clamp(26px,2.03vw,39px)]" />
              <Star className="h-[clamp(34px,2.71vw,52px)] w-[clamp(34px,2.71vw,52px)]" />
              <Star className="h-[clamp(24px,1.93vw,37px)] w-[clamp(26px,2.03vw,39px)]" />
            </div>
            <span
              aria-hidden="true"
              className="absolute top-[62.5%] left-0 h-[2px] -translate-y-1/2 bg-gold right-[calc(50%+clamp(65px,5.18vw,99.5px))]"
            />
            <span
              aria-hidden="true"
              className="absolute top-[62.5%] right-0 h-[2px] -translate-y-1/2 bg-gold left-[calc(50%+clamp(65px,5.18vw,99.5px))]"
            />
          </div>

          <ReviewsCarousel />
        </div>
      </div>
    </section>
  );
}
