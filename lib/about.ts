/**
 * Instructor-wide content — "Website sections./Eighth and last season.png"
 * (section 8 = About + footer).
 *
 * The design supplies the whole "Education" tab, the footer's headings, links and
 * copyright. The other two About tabs have no copy anywhere in the package, so
 * they carry a clearly marked TODO placeholder (client rule: never invent facts).
 */

export type AboutTab = {
  id: string;
  label: string;
  paragraphs: string[];
};

/** Rendered verbatim inside the tabs whose copy the client has not supplied. */
export const ABOUT_TODO = "TODO(client): this tab's content has not been supplied yet.";

export const aboutTabs: AboutTab[] = [
  {
    id: "education",
    label: "Education",
    paragraphs: [
      "Alongside my formal education, I developed a deep passion for learning English. I turned my passion for English into mastery through seven dedicated years of focused study in listening, speaking, reading, and writing, and pronunciation.",
      "I’ve also put in hundreds of hours practicing with learners from all over the world, and I’ve read hundreds of English books. It’s nearly been a decade—I don’t think I’ll stop any time soon...",
    ],
  },
  { id: "experience", label: "Experience", paragraphs: [ABOUT_TODO] },
  { id: "future-plan", label: "Future Plan", paragraphs: [ABOUT_TODO] },
];
