import Image from "next/image";

import BackToTop from "@/components/BackToTop";
import {
  footerContact,
  footerCopyright,
  footerSections,
  footerService,
  footerSocialIcons,
} from "@/lib/footer";

/**
 * Footer — the light-grey block under the About section.
 *
 * Layout follows "Website sections./Eighth and last season.png" measured at 1920:
 *   - the grey starts 80px BEHIND the About section's rounded bottom, so the
 *     block is pulled up by that radius and the black section sits on top of it;
 *   - three columns: "FREE SERVICE" (32.1% wide) at the left, "Contact Us" at
 *     42.4% and "Sections" at 68% of the 1400px content column, with the
 *     black-ringed back-to-top button at the far right (90%);
 *   - a 2px #a9a9a9 rule across the content width, then the centred copyright.
 *
 * The social URLs are still empty in lib/siteConfig.ts (client TODO), so those
 * items render as plain text — the wording, icons and layout stay as designed
 * instead of shipping dead links.
 */
function ListLink({ href, label, className }: { href: string; label: string; className: string }) {
  if (!href) {
    return (
      <span className={className} title="TODO(client): link not supplied yet">
        {label}
      </span>
    );
  }
  return (
    <a className={className} href={href}>
      {label}
    </a>
  );
}

export default function SiteFooter() {
  const linkClass =
    "font-body text-[clamp(15px,1.04vw,20px)] leading-[clamp(24px,1.82vw,35px)] font-normal text-ink";
  const headingClass =
    "font-body text-[clamp(22px,1.77vw,34px)] leading-[clamp(28px,2.19vw,42px)] font-normal text-ink";

  return (
    <footer
      aria-label="Site footer"
      className="relative -mt-[clamp(40px,4.17vw,80px)] bg-panel pt-[clamp(60px,7.42vw,142.5px)] pb-[clamp(24px,2.5vw,48px)] text-ink"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5">
        <div
          data-reveal
          className="flex flex-col gap-[clamp(28px,2.5vw,48px)] md:flex-row md:items-start md:gap-0"
        >
          {/* 1 — Free service */}
          <div className="md:w-[32.1%]">
            <h2 className="font-display footer-display text-ink uppercase">
              <span className="footer-script block font-script text-[#8a8a8a] normal-case">
                {footerService.script}
              </span>
              {footerService.heading}
            </h2>

            <p className="mt-[clamp(14px,1.35vw,26px)] max-w-[clamp(280px,20.3vw,390px)] font-body text-[clamp(15px,1.12vw,21.5px)] leading-[clamp(20px,1.46vw,28px)] font-light">
              {footerService.body}
            </p>

            <div className="mt-[clamp(14px,1.26vw,24px)] flex flex-wrap items-center justify-between gap-[clamp(12px,1.04vw,20px)]">
              {footerService.ctaHref ? (
                <a
                  href={footerService.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[clamp(30px,1.93vw,37px)] min-w-[clamp(120px,8.6vw,165px)] items-center justify-center rounded-full bg-gold px-[clamp(14px,1.04vw,20px)] font-body text-[clamp(15px,1.04vw,20px)] leading-none font-medium text-ink transition-colors duration-200 hover:bg-gold-deep"
                >
                  {footerService.ctaLabel}
                </a>
              ) : (
                <span
                  title="TODO(client): Discord invite link not supplied yet"
                  className="inline-flex h-[clamp(30px,1.93vw,37px)] min-w-[clamp(120px,8.6vw,165px)] items-center justify-center rounded-full bg-gold px-[clamp(14px,1.04vw,20px)] font-body text-[clamp(15px,1.04vw,20px)] leading-none font-medium text-ink"
                >
                  {footerService.ctaLabel}
                </span>
              )}

              <ul className="flex items-center gap-[clamp(10px,1.04vw,20px)]">
                {footerSocialIcons.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="grid size-[clamp(30px,1.93vw,37px)] place-items-center rounded-full bg-white transition-colors duration-200 hover:bg-white/80"
                      >
                        <Image src={item.icon} alt="" width={48} height={48} className={`${item.iconClass} object-contain`} />
                      </a>
                    ) : (
                      <span
                        title={`TODO(client): ${item.label} link not supplied yet`}
                        aria-label={`${item.label} — link not supplied yet`}
                        className="grid size-[clamp(30px,1.93vw,37px)] place-items-center rounded-full bg-white"
                      >
                        <Image src={item.icon} alt="" width={48} height={48} className={`${item.iconClass} object-contain`} />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2 — Contact us */}
          <div className="md:mt-[clamp(20px,1.7vw,32.5px)] md:ml-[10.4%] md:w-[11.6%]">
            <h3 className={headingClass}>{footerContact.heading}</h3>
            <ul className="mt-[clamp(8px,0.94vw,18px)]">
              {footerContact.items.map((item) => (
                <li key={item.label}>
                  <ListLink href={item.href} label={item.label} className={linkClass} />
                </li>
              ))}
            </ul>
          </div>

          {/* 3 — Sections */}
          <div className="md:mt-[clamp(20px,1.7vw,32.5px)] md:ml-[14%] md:w-[10%]">
            <h3 className={headingClass}>{footerSections.heading}</h3>
            <ul className="mt-[clamp(8px,0.94vw,18px)]">
              {footerSections.items.map((item) => (
                <li key={item.label}>
                  <a className={linkClass} href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <BackToTop className="md:mt-[clamp(50px,5.81vw,111.5px)] md:mr-[4.2%] md:ml-auto" />
        </div>

        <hr className="mt-[clamp(24px,2.29vw,44px)] border-t-2 border-[#a9a9a9]" />

        <p className="mt-[clamp(8px,0.68vw,13px)] text-center font-body text-[clamp(14px,1.11vw,21.25px)] leading-[clamp(20px,1.46vw,28px)] font-light">
          {footerCopyright}
        </p>
      </div>
    </footer>
  );
}
