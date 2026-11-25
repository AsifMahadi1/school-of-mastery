/**
 * Student reviews — "Website sections./Seventh section.png" (section 7, id="#reviews").
 *
 * The design supplies ONE review (quote + name + location) and no reviewer
 * photos; `03. Icons` / `02. Images` contain none either. Reviews #2–#5 are
 * clearly marked TODO placeholders (client rule: never invent facts or quotes),
 * and every avatar falls back to a generic placeholder instead of a cropped
 * screenshot.
 */

export type Review = {
  quote: string;
  name: string;
  location: string;
  /** Reviewer photo. `null` = not supplied → the avatar renders a generic placeholder. */
  avatar: string | null;
};

/** Marks a review whose content the client has not supplied yet. */
const pending = (index: number): Review => ({
  quote: `TODO(client): review ${index} has not been supplied yet.`,
  name: `TODO(client): reviewer ${index} name`,
  location: `TODO(client): location ${index}`,
  avatar: null,
});

export const reviews: Review[] = [
  {
    quote:
      "No doubt this is the best English course in Bangladesh. When I joined this course I didn’t know anything in English. Now I can speak fluently for hours without any problems and I am frequently complimented on my pronunciation and accent.",
    // The mockup prints "Moahmmad"; the client's name is spelled "Mohammad".
    name: "Noor Mohammad Siddiki",
    location: "Faridpur",
    avatar: null,
  },
  pending(2),
  pending(3),
  pending(4),
  pending(5),
];
