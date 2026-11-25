import { siteConfig } from "@/lib/siteConfig";

/**
 * FAQ content — "Website sections./Sixth section.png" (section 6, id="#faq").
 *
 * The design only supplies ONE answer (the discount question, which it shows
 * open by default). Every other answer, and the whole second tab, is a TODO
 * placeholder here and rendered as a clearly marked TODO in the UI — the client
 * rule is to never invent facts, prices or copy.
 */

export type FaqItem = {
  question: string;
  /** `null` = the client has not supplied this answer yet → rendered as a marked TODO. */
  answer: string | null;
};

export type FaqTab = {
  id: string;
  label: string;
  items: FaqItem[];
};

/** Rendered verbatim inside an opened row whose answer is missing. */
export const FAQ_TODO_ANSWER = "TODO(client): this answer has not been supplied yet.";

/** The design's second tab ("Zero to One") shows no content at all. */
export const FAQ_TODO_QUESTIONS = "TODO(client): the questions for this tab have not been supplied yet.";

export const faqTabs: FaqTab[] = [
  {
    id: "this-course",
    label: "This Course",
    items: [
      { question: "Do you provide class-records?", answer: null },
      {
        question: "Is there any discount?",
        answer:
          "Attend every class in your first two months, and your third month is FREE! Enroll now with the first month’s fee.",
      },
      { question: "Will you provide any certificates?", answer: null },
      { question: "Which platform will the classes be held on?", answer: null },
      { question: "What skills do I need to qualify for this course?", answer: null },
    ],
  },
  {
    id: "zero-to-one",
    label: "Zero to One",
    items: [{ question: FAQ_TODO_QUESTIONS, answer: null }],
  },
];

/** Row the design shows expanded (0-based, per tab). */
export const faqDefaultOpen: Record<string, number | null> = {
  "this-course": 1,
  "zero-to-one": null,
};

/** The small white card at the panel's bottom-left. */
export const faqCard = {
  heading: "Got more questions?",
  body: "Contact us anytime. We’re here to address your questions and curiosities.",
  cta: { label: "Ask Us", href: siteConfig.whatsappUrl },
};
