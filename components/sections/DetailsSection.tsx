import Image from "next/image";

/**
 * Section 3 — "Date, Time & Other Details" (id="#details").
 *
 * Layout follows "Website sections./third section.png":
 *   - a full-width light-grey rounded panel
 *   - the client's calendar photo standing on the panel's bottom-left corner,
 *     popping out above its top edge (never cropped or redrawn — the real image
 *     is placed with its own aspect ratio)
 *   - the script "When is" over the gold heading, above the panel on the right,
 *     left-aligned with the chip grid
 *   - a 2-column grid of white pill chips + the "dedicated learners." note
 *
 * Icons come from /public/icons (all black line art, placed in gold circles).
 * "09 to 11 PM" uses icons/alarm.png — the icon set has no plain clock, and the
 * mockup itself draws an alarm clock, so no custom SVG was needed.
 */

const details = [
  { label: "Fully Online", icon: "/icons/discord-icon-svgrepo-com.svg" },
  { label: "Sun to Wed", icon: "/icons/calendar.png" },
  { label: "01 Month", icon: "/icons/hourglass.png" },
  { label: "09 to 11 PM", icon: "/icons/alarm.png" },
  { label: "৳ 2,900/month", icon: "/icons/wallet.png" },
];

export default function DetailsSection() {
  return (
    <section
      id="details"
      aria-labelledby="details-heading"
      className="relative bg-black pt-[clamp(24px,1.72vw,33px)] pb-[clamp(80px,11.2vw,215px)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5">
        {/* Script + gold heading — above the panel, aligned with the chip grid */}
        <h2
          id="details-heading"
          className="font-display course-display mb-[clamp(26px,2.66vw,51px)] text-gold uppercase md:ml-[42.5%]"
        >
          <span
            aria-hidden="true"
            className="font-script course-script block text-white normal-case"
          >
            When is
          </span>
          DATE, TIME{" "}
          <br />
          &amp; OTHER DETAILS
        </h2>

        {/* Panel */}
        <div className="relative rounded-[clamp(24px,2.08vw,40px)] bg-panel px-5 pt-[clamp(36px,3.75vw,72px)] pb-[clamp(32px,3.23vw,62px)] md:pr-[clamp(24px,5.9vw,113px)] md:pl-[42.5%]">
          {/* Calendar photo: bottom-left, popping above the panel's top edge */}
          <div className="mx-auto mb-[clamp(20px,2vw,38px)] w-[72%] max-w-[360px] md:absolute md:bottom-0 md:left-0 md:mb-0 md:w-[43.3%] md:max-w-none">
            <Image
              src="/images/calendar.png"
              alt="Course calendar — January, classes run Sunday to Wednesday"
              width={1920}
              height={2000}
              sizes="(min-width: 768px) 43vw, 72vw"
              className="h-auto w-full"
            />
          </div>

          {/* Chips + note */}
          <ul className="grid grid-cols-1 gap-y-[clamp(18px,1.56vw,30px)] md:grid-cols-2 md:gap-x-[clamp(16px,1.25vw,24px)]">
            {details.map((item) => (
              <li
                key={item.label}
                className="flex h-[clamp(56px,3.6vw,69px)] items-center gap-[clamp(14px,1.46vw,28px)] rounded-full bg-white pr-4 pl-[clamp(5px,0.36vw,7px)]"
              >
                <span className="grid size-[clamp(46px,2.97vw,57px)] shrink-0 place-items-center rounded-full bg-gold">
                  <Image
                    src={item.icon}
                    alt=""
                    width={512}
                    height={512}
                    className="h-[62%] w-[62%] object-contain"
                  />
                </span>
                <span className="font-body text-[clamp(16px,1.25vw,24px)] leading-none font-normal text-[#1c1c1c]">
                  {item.label}
                </span>
              </li>
            ))}

            <li className="flex items-center">
              <p className="font-body text-[clamp(13.5px,0.83vw,16px)] leading-[1.35] text-[#333333]">
                One month isn&apos;t enough to master English. This course will
                continue for three months—only for{" "}
                <mark className="box-decoration-clone bg-gold px-[0.2em] text-[#1c1c1c]">
                  dedicated learners.
                </mark>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
