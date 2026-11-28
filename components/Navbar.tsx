"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";

const SECTION_IDS = siteConfig.navLinks.map((link) => link.href.slice(1));

export default function Navbar() {
  const [active, setActive] = useState<string>(siteConfig.navLinks[0].href);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* Below the desktop breakpoint (xl) a subtle dark blurred bar keeps the
     links readable while scrolling. Desktop stays fully transparent at every
     scroll position — only the centre pill keeps its own blur. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll-spy: the most visible section wins. */
  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = "";
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(`#${best}`);
      },
      { rootMargin: "-20% 0px -30% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "max-xl:bg-black/60 max-xl:backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-5 py-3 pt-[clamp(14px,3.4vw,66px)] xl:grid xl:grid-cols-[1fr_auto_1fr] xl:pb-0">
        {/* Logo */}
        <a
          href="#welcome"
          aria-label={`${siteConfig.name} — back to top`}
          className="shrink-0 justify-self-start"
        >
          <Image
            src="/images/hero-logo.png"
            alt={siteConfig.name}
            width={500}
            height={100}
            priority
            className="h-[clamp(30px,2.63vw,50px)] w-auto 2xl:-ml-4"
          />
        </a>

        {/* Centre pill */}
        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex h-12 items-center rounded-full bg-black/45 px-[clamp(12px,2.1vw,40px)] backdrop-blur-md">
            {siteConfig.navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? "true" : undefined}
                    className={`block px-[clamp(8px,0.78vw,15px)] text-[clamp(14px,1.355vw,26px)] leading-none transition-colors ${
                      isActive
                        ? "font-medium text-white"
                        : "font-normal text-white/70 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Enroll + mobile toggle */}
        <div className="flex items-center gap-2 justify-self-end">
          <a
            href={siteConfig.enrollHref}
            className="font-body inline-flex h-[clamp(34px,2.5vw,48px)] items-center justify-center rounded-full bg-gold px-[clamp(14px,2.27vw,44px)] text-[clamp(13px,1.15vw,22px)] font-medium text-charcoal transition-colors hover:bg-gold-deep"
          >
            Enroll Now
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid size-[clamp(34px,2.5vw,44px)] place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-white/60 xl:hidden"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none">
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Full-width mobile menu */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="border-t border-white/10 bg-black/85 backdrop-blur-md xl:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto w-full max-w-[1440px] px-5 py-3">
          <ul className="flex flex-col">
            {siteConfig.navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-3 text-lg ${
                    active === link.href ? "font-medium text-white" : "font-light text-white/70"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
