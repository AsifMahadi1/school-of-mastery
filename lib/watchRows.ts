/**
 * Section 4 (#watch) data — the three rows of "Watch more to make an informed
 * decision".
 *
 * The real YouTube links are NOT known yet (the thumbnails in the mockup are
 * placeholders), so every `thumb`, `url` and `playlistUrl` below is an empty
 * string on purpose — never invent video links.
 *
 *   thumb: ""  -> a flat grey 16:9 placeholder box is rendered
 *   url:   ""  -> the thumbnail is rendered as a non-interactive box (no link)
 *   playlistUrl: "" -> the ↗ arrow is rendered as a plain icon (no link)
 *
 * Fill in the three strings per entry and the element becomes a real link
 * (thumbnails + arrow open in a new tab with rel="noopener noreferrer").
 */

export type WatchVideo = {
  /** YouTube thumbnail image URL. Empty = grey placeholder. */
  thumb: string;
  /** YouTube video URL. Empty = not a link yet. */
  url: string;
};

export type WatchRow = {
  label: string;
  /** Icon inside the gold circle. "inline-play" = the inline play glyph (the icon set has no plain play icon). */
  icon: string;
  videos: [WatchVideo, WatchVideo];
  /** YouTube playlist URL opened by the ↗ arrow. */
  playlistUrl: string;
};

// TODO(client): replace "" with the real YouTube thumbnail/video/playlist links.
export const watchRows: WatchRow[] = [
  {
    label: "Class Records",
    icon: "inline-play",
    videos: [
      { thumb: "", url: "" },
      { thumb: "", url: "" },
    ],
    playlistUrl: "",
  },
  {
    label: "Students' Performance",
    icon: "/icons/presentation.png",
    videos: [
      { thumb: "", url: "" },
      { thumb: "", url: "" },
    ],
    playlistUrl: "",
  },
  {
    label: "Students' Review",
    icon: "/icons/star.png",
    videos: [
      { thumb: "", url: "" },
      { thumb: "", url: "" },
    ],
    playlistUrl: "",
  },
];
