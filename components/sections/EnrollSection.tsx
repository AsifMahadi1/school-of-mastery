import EnrollForm from "@/components/EnrollForm";

/**
 * Section 5 — enrollment (id="#enroll").
 *
 * Layout follows "Website sections./fifth section.png": the script "Ready to"
 * hanging just left of the gold two-line heading, then the light-grey
 * enrollment card. Both are centred as one 928px column, so the heading lines
 * up with the card's left edge exactly like the design.
 */
export default function EnrollSection() {
  return (
    <section
      id="enroll"
      aria-labelledby="enroll-heading"
      className="relative bg-black pb-[clamp(60px,12.86vw,247px)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5">
        <div className="mx-auto w-full max-w-[928px]">
          <h2 id="enroll-heading" className="font-display course-display text-gold uppercase">
            <span
              aria-hidden="true"
              className="-ml-[clamp(0px,4.06vw,78px)] block font-script text-[clamp(34px,3.39vw,65px)] leading-[1.1] text-white normal-case"
            >
              Ready to
            </span>
            ENROLL NOW IN{" "}
            <br />
            LEVEL UP ENGLISH COURSE
          </h2>

          <div className="mt-[clamp(30px,4.19vw,80px)]">
            <EnrollForm />
          </div>
        </div>
      </div>
    </section>
  );
}
