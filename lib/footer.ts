import { siteConfig } from "@/lib/siteConfig";

/**
 * Footer content — the light-grey block under the About section.
 *
 * Every link comes from `lib/siteConfig.ts`. The client has not supplied the
 * social URLs yet (they are still empty strings there), so those items render as
 * plain text instead of dead links — the wording and the icons stay as designed.
 */

export const footerService = {
  script: "Get our",
  heading: "FREE SERVICE",
  body: "Practice English for free every week! Boost your speaking, pronunciation, listening, and reading with our free resources. Join us on Discord!",
  ctaLabel: "Join Now",
  ctaHref: siteConfig.discordUrl,
};

export const footerSocialIcons = [
  // The supplied icon files carry different amounts of built-in padding, so each
  // gets the scale that reproduces the design's ink size inside the 37px circle
  // (design inks: Discord 25×19, YouTube 24×17, Facebook 14×26).
  { label: "Discord", href: siteConfig.discordUrl, icon: "/icons/discord-icon-svgrepo-com.svg", iconClass: "h-[66%] w-[66%]" },
  { label: "YouTube", href: siteConfig.youtubeUrl, icon: "/icons/youtube.png", iconClass: "h-[64%] w-[64%]" },
  { label: "Facebook", href: siteConfig.facebookUrl, icon: "/icons/facebook.png", iconClass: "h-[90%] w-[90%]" },
];

export const footerContact = {
  heading: "Contact Us",
  items: [
    { label: siteConfig.phone, href: siteConfig.phoneHref },
    { label: "Facebook", href: siteConfig.facebookUrl },
    { label: "YouTube", href: siteConfig.youtubeUrl },
    { label: "Instagram", href: siteConfig.instagramUrl },
    { label: "Discord", href: siteConfig.discordUrl },
  ],
};

export const footerSections = {
  heading: "Sections",
  items: [
    { label: "Expected Results", href: "#course" },
    { label: "Course Details", href: "#details" },
    { label: "FAQ & More", href: "#faq" },
    { label: "Enroll Now", href: "#enroll" },
    { label: "Reviews", href: "#reviews" },
  ],
};

export const footerCopyright = "© All rights reserved by The School Of Mastery";
