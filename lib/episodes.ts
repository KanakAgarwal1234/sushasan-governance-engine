import type { EpisodeMeta } from "./types";

/**
 * Featured @SushasanThePodcast episodes. Client-safe: metadata only.
 * `aliases` lets clips/shorts of the same conversation resolve to the episode.
 */
export interface FeaturedEpisode extends EpisodeMeta {
  aliases: string[];
}

export const FEATURED_EPISODES: FeaturedEpisode[] = [
  {
    id: "anita-karwal",
    videoId: "zidabJy7ous",
    aliases: ["ZPaSqMywFYY", "AqmPGeShSYI"],
    url: "https://www.youtube.com/watch?v=zidabJy7ous",
    title: "Anita Karwal in conversation with Gaurav Goel",
    guest: "Anita Karwal, IAS (Retd.)",
    guestRole: "Former Secretary, School Education & Literacy, Government of India",
    sector: "School Education",
    season: "Season 1",
    topics: ["Working with PM Modi", "School data systems", "NEP 2020 rollout", "Centre–state delivery"],
  },
  {
    id: "rajesh-bhushan",
    videoId: "efnoXmLrCLo",
    aliases: [],
    url: "https://www.youtube.com/watch?v=efnoXmLrCLo",
    title: "Rajesh Bhushan in conversation with Gaurav Goel",
    guest: "Rajesh Bhushan, IAS (Retd.)",
    guestRole: "Former Union Health Secretary, Ministry of Health & Family Welfare",
    sector: "Public Health",
    season: "Sushasan",
    topics: ["COVID-19 command & control", "Vaccination at scale (CoWIN)", "Health data fragmentation", "Centre–state coordination"],
  },
  {
    id: "p-narahari",
    videoId: "YxxNbtiHmD0",
    aliases: [],
    url: "https://www.youtube.com/watch?v=YxxNbtiHmD0",
    title: "P. Narahari in conversation with Gaurav Goel",
    guest: "P. Narahari, IAS",
    guestRole: "Secretary MSME & Commissioner Industries, Madhya Pradesh; former Collector, Indore",
    sector: "Urban Sanitation & District Administration",
    season: "Season 2 · Sushasan on Campus, Ep. 1",
    topics: ["Swachh Indore", "Female foeticide & sex ratio", "Behaviour change at scale", "Supporting UPSC aspirants"],
  },
  {
    id: "ashish-dhawan",
    videoId: "xTiOH-ixAYs",
    aliases: ["W2scgyoVglk"],
    url: "https://www.youtube.com/watch?v=xTiOH-ixAYs",
    title: "Ashish Dhawan in conversation with Gaurav Goel",
    guest: "Ashish Dhawan",
    guestRole: "Founder & CEO, Central Square Foundation; Co-founder, ChrysCapital & Ashoka University",
    sector: "Foundational Learning & State Partnerships",
    season: "Season 1 · Episode 5",
    topics: ["Learning crisis & FLN", "Philanthropy as R&D for the state", "Structured pedagogy", "State system reform"],
  },
];

export function findEpisodeById(id: string | null | undefined): FeaturedEpisode | undefined {
  if (!id) return undefined;
  return FEATURED_EPISODES.find((e) => e.id === id);
}

export function findEpisodeByVideoId(videoId: string | null | undefined): FeaturedEpisode | undefined {
  if (!videoId) return undefined;
  return FEATURED_EPISODES.find((e) => e.videoId === videoId || e.aliases.includes(videoId));
}

export function thumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
