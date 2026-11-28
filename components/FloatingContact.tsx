import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The call / WhatsApp pair from the hero mockup. It is viewport-anchored
 * (`fixed`) rather than part of the hero's box, so it stays in the right-hand
 * corner while the page scrolls — margin, size and the desktop bottom offset
 * are still the mockup's values, and on phones it drops to the bottom-right
 * corner where a screen-anchored action button belongs. `z-40` keeps it above
 * the sections but below the navbar (`z-50`) and its mobile menu.
 *
 * Note: `globals.css` gives the hero's video controls a matching keep-out
 * padding (`.hero-controls`), because this pair is pinned to the viewport edge
 * while the controls are pinned to the max-1440px content edge.
 */
export default function FloatingContact() {
  return (
    <div className="fixed right-[clamp(14px,2.14vw,41px)] bottom-[clamp(18px,4vw,30px)] z-40 flex flex-col items-center gap-[clamp(8px,0.94vw,18px)] md:bottom-[clamp(64px,5.42vw,104px)]">
      <a
        href={siteConfig.phoneHref}
        aria-label={`Call ${siteConfig.phone}`}
        className="grid size-[clamp(38px,2.76vw,53px)] place-items-center rounded-full bg-gold transition-transform duration-200 hover:scale-105"
      >
        <Image
          src="/icons/phone-call.png"
          alt=""
          width={512}
          height={512}
          className="h-[71%] w-[71%] object-contain"
        />
      </a>
      <a
        href={siteConfig.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="grid size-[clamp(38px,2.76vw,53px)] place-items-center rounded-full bg-white transition-transform duration-200 hover:scale-105"
      >
        <Image
          src="/icons/whatsapp.png"
          alt=""
          width={512}
          height={512}
          className="h-[64%] w-[64%] object-contain"
        />
      </a>
    </div>
  );
}
