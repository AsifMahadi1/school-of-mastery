import Image from "next/image";

import { watchRows, type WatchVideo } from "@/lib/watchRows";

/**
 * Section 4 — "Watch more to make an informed decision" (id="#watch").
 *
 * Layout follows "Website sections./fourth section.png":
 *   - script "Watch more to" overlapping the gold heading "MAKE AN /
 *     INFORMED DECISION" (the mockup's typo "DECITION" is fixed)
 *   - three full-width rows separated by thin dark-gold dividers; each row is
 *     [gold circle icon] [label] [two 16:9 video thumbnails] [↗ arrow]
 *
 * The video thumbnails in the mockup are placeholders that are not in
 * `03. Icons` / `02. Images`, so they are rendered as flat grey 16:9 boxes
 * (never cropped from the screenshot). Their links, and the ↗ playlist links,
 * come from `lib/watchRows.ts` and become real anchors as soon as the client
 * supplies the URLs.
 *
 * Icons: presentation.png + star.png are the client's own files; the play
 * glyph for "Class Records" is an inline SVG (no plain play icon exists in the
 * icon set) and the ↗ arrow is the client's right-down.png used as a gold mask
 * (rotated to point up-right), so no glyph is redrawn.
 */

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[46%] w-[46%] fill-black">
      <path d="M7.5 4.8v14.4L19.2 12 7.5 4.8Z" />
    </svg>
  );
}

function ArrowGlyph() {
  return (
    <span
      aria-hidden="true"
      className="block size-full scale-y-[-1] bg-gold [mask-image:url('/icons/right-down.png')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/icons/right-down.png')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]"
    />
  );
}

function Thumbnail({
  video,
  label,
  index,
}: {
  video: WatchVideo;
  label: string;
  index: number;
}) {
  const box = (
    <span className="block aspect-video w-full overflow-hidden rounded-[clamp(4px,0.42vw,8px)] bg-[#4f4f4f] md:w-[clamp(120px,11.1vw,213px)]">
      {video.thumb ? (
        <Image
          src={video.thumb}
          alt=""
          width={1280}
          height={720}
          sizes="(min-width: 768px) 213px, 45vw"
          className="h-full w-full object-cover"
        />
      ) : null}
    </span>
  );

  if (!video.url) {
    return <span className="block flex-1 md:flex-none">{box}</span>;
  }

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — video ${index} (opens on YouTube)`}
      className="block flex-1 md:flex-none"
    >
      {box}
    </a>
  );
}

export default function WatchSection() {
  return (
    <section
      id="watch"
      aria-labelledby="watch-heading"
      className="relative bg-black pb-[clamp(60px,8.28vw,159px)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5">
        <h2 id="watch-heading" className="font-display course-display text-gold uppercase">
          <span
            aria-hidden="true"
            className="font-script course-script block text-white normal-case"
          >
            Watch more to
          </span>
          MAKE AN{" "}
          <br />
          INFORMED DECISION
        </h2>

        <ul className="mt-[clamp(24px,2.34vw,45px)]">
          {watchRows.map((row) => (
            <li
              key={row.label}
              className="group border-b border-gold/40 transition-colors duration-200 hover:bg-white/3"
            >
              <div className="flex flex-wrap items-center gap-x-[clamp(20px,3.13vw,60px)] gap-y-[clamp(16px,2.24vw,30px)] py-[clamp(28px,3.02vw,58px)] md:pr-[clamp(0px,6.2vw,119px)]">
                {/* Gold circular icon */}
                <span className="order-1 grid size-[clamp(46px,4.01vw,77px)] shrink-0 place-items-center rounded-full bg-gold md:-ml-[clamp(4px,0.885vw,17px)]">
                  {row.icon === "inline-play" ? (
                    <PlayGlyph />
                  ) : (
                    <Image
                      src={row.icon}
                      alt=""
                      width={512}
                      height={512}
                      className="h-[52%] w-[52%] object-contain"
                    />
                  )}
                </span>

                {/* Label */}
                <span className="order-2 flex-1 font-body text-[clamp(20px,2.19vw,42px)] leading-none text-white">
                  {row.label}
                </span>

                {/* Two 16:9 thumbnails */}
                <div className="order-4 flex w-full gap-[clamp(12px,2.26vw,27px)] md:order-3 md:w-auto">
                  {row.videos.map((video, i) => (
                    <Thumbnail key={i} video={video} label={row.label} index={i + 1} />
                  ))}
                </div>

                {/* ↗ arrow → playlist */}
                {row.playlistUrl ? (
                  <a
                    href={row.playlistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${row.label} — watch the full playlist (opens on YouTube)`}
                    className="order-3 size-[clamp(20px,1.46vw,28px)] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:order-4 md:ml-[clamp(0px,1.82vw,35px)]"
                  >
                    <ArrowGlyph />
                  </a>
                ) : (
                  <span className="order-3 size-[clamp(20px,1.46vw,28px)] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:order-4 md:ml-[clamp(0px,1.82vw,35px)]">
                    <ArrowGlyph />
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
