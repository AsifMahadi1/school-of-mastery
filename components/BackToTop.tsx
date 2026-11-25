"use client";

/** Footer's "back to top" button — smooth-scrolls the window to the top. */
export default function BackToTop({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`grid size-[clamp(48px,3.85vw,74px)] shrink-0 place-items-center rounded-full border-2 border-ink text-ink transition-colors duration-200 hover:bg-ink/10 ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[38%] w-[38%]">
        <path
          d="M4 15.5 12 7.5l8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
