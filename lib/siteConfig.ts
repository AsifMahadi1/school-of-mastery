/**
 * Site-wide constants — The School of Mastery.
 *
 * Anything the design does not show is left as an EMPTY STRING with a TODO and
 * rendered conditionally by the components (project rule: never invent real
 * facts, links, prices or reviews).
 */

export type NavLink = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: "The School of Mastery",
  tagline: "Refine Your English, Redefine Your life",

  /** Primary contact number (from the client brief). */
  phone: "+8801342622626",
  phoneHref: "tel:+8801342622626",

  /** TODO(client): confirm the exact WhatsApp destination. Derived from `phone` for now. */
  whatsappUrl: "https://wa.me/8801342622626",

  /**
   * Payment number shown in the enrollment card (from "fifth section.png"),
   * in the local format the design uses. The copy button copies this string.
   */
  paymentNumber: "01342622626",

  /** TODO(client): not supplied yet — the footer/contact section renders these only when set. */
  discordUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  instagramUrl: "",

  /** Navbar / footer anchors — ids must exist as section ids on the page. */
  navLinks: [
    { label: "Welcome", href: "#welcome" },
    { label: "Course", href: "#course" },
    { label: "About", href: "#about" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQs", href: "#faq" },
  ] as NavLink[],

  enrollHref: "#enroll",
} as const;

export default siteConfig;
