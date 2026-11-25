/**
 * "What to expect from the course" cards (#course).
 *
 * Add a card by appending one object — the row and the numbering render from
 * this array. Text is kept exactly as supplied in the brief.
 *
 * `glyph` renders a text glyph inside the gold circle (card 01 uses the
 * phonetic "æ"); `icon` points at a file in /public/icons.
 */
export type CourseCard = {
  number: string;
  title: string;
  description: string;
  glyph?: string;
  icon?: string;
};

export const courseCards: CourseCard[] = [
  {
    number: "01",
    title: "Pronunciation",
    description: "In-depth knowledge of the American accent.",
    glyph: "æ",
  },
  {
    number: "02",
    title: "Reading",
    description: "Read and speak with Clear American Pronunciation.",
    icon: "/icons/reading-book.png",
  },
  {
    number: "03",
    title: "Speaking",
    description: "Speak nonstop with full confidence, like it's Bengali.*",
    icon: "/icons/speak.png",
  },
  {
    number: "04",
    title: "Listening",
    description: "Fully understand native American English speakers.",
    icon: "/icons/listening.png",
  },
  {
    number: "05",
    title: "Catch the fish",
    description: "Learn how to learn from natives without courses.",
    icon: "/icons/fish.png",
  },
];

export default courseCards;
