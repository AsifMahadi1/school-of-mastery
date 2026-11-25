/**
 * YouTube videos for the auto-scrolling strip under the hero (id="videos").
 *
 * Filled with the five most recent uploads from the client's own channel
 * (Mohammad Ali Siddiki — https://www.youtube.com/@mohammad.ali.siddiki,
 * channel UC9E9lO17iWNk5wH3Ugh0OJw). Titles are the channel's own, verbatim.
 *
 * A card shows its i.ytimg.com thumbnail and opens the modal only once
 * `youtubeId` is set; an empty id renders the mockup's plain grey placeholder
 * and is not clickable. Use the 11-character id from the watch URL
 * (https://www.youtube.com/watch?v=XXXXXXXXXXX) and never invent ids/titles.
 */
export type VideoItem = {
  id: string;
  /** YouTube video id — "" renders the grey placeholder card. */
  youtubeId: string;
  /** Video title, used as the modal's accessible name. */
  title: string;
};

export const videos: VideoItem[] = [
  {
    id: "video-1",
    youtubeId: "x37-OulG1E0",
    title:
      "Why is Speed Bad in Speaking English? Do This Instead, And You'll Speak Better English",
  },
  {
    id: "video-2",
    youtubeId: "FDJvdnaEQWQ",
    title: "No Course Can Teach You English Until You Do This",
  },
  {
    id: "video-3",
    youtubeId: "lWLWyPQ4Jpk",
    title: "English Courses Are Not Teaching You Real English. Let Me Explain",
  },
  {
    id: "video-4",
    youtubeId: "pONw-pNsjig",
    title: "Can't Remember Vocabs? Give Me 10 Minutes—You'll Never Forget Again",
  },
  {
    id: "video-5",
    youtubeId: "CkQQ1Kznhjg",
    title: "How Much English is Enough? When to Stop Learning English?",
  },
];

export default videos;
