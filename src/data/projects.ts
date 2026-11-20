export const projectCategories = [
  "Motion Graphics",
  "Short-Form Editing",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  videoSrc: string;
  posterSrc: string;
  posterAlt: string;
  type: string;
  role: string;
  software: readonly string[];
  description: string;
  order: number;
  homeFeaturedOrder?: number;
}

// Add media to public/videos and public/images, then add an entry here.
export const projects: readonly Project[] = [
  {
    id: "motion-01",
    title: "FLOW — SaaS Motion Design",
    category: "Motion Graphics",
    videoSrc: "/videos/motion-01.mp4",
    posterSrc: "/images/motion-01.webp",
    posterAlt: "A dark purple FLOW dashboard with a circular time tracker.",
    type: "Personal Concept Project",
    role: "Motion Design · Brand Animation",
    // Add software only after confirming it was used on this project.
    software: [],
    description:
      "A fictional SaaS brand exploring typography, fluid transitions, and product-focused motion.",
    order: 1,
    homeFeaturedOrder: 1,
  },
  {
    id: "short-01",
    title: "Understanding Autism",
    category: "Short-Form Editing",
    videoSrc: "/videos/short-01.mp4",
    posterSrc: "/images/short-01.webp",
    posterAlt: "The speaker looks into the camera in an outdoor setting.",
    type: "Personal Editing Project",
    role: "Short-Form Editing · Talking Head",
    software: [],
    description:
      "A talking-head edit focused on clear communication, readable captions, pacing, and storytelling.",
    order: 1,
  },
];

export type GalleryMedia = Pick<
  Project,
  "id" | "title" | "videoSrc" | "posterSrc" | "posterAlt" | "homeFeaturedOrder"
>;

export const featuredShowreel: GalleryMedia = {
  id: "showreel",
  title: "Showreel",
  videoSrc: "/videos/showreel.mp4",
  posterSrc: "/images/showreel.webp",
  posterAlt: "Featured showreel cover",
};

// Each pair is one Work gallery row. homeFeaturedOrder separately controls Home.
export const motionGalleryProjects: readonly GalleryMedia[] = [
  ...projects.filter((project) => project.category === "Motion Graphics"),
  {
    id: "motion-02",
    title: "Motion 02",
    videoSrc: "/videos/motion-02.mp4",
    posterSrc: "/images/motion-02.webp",
    posterAlt: "Still from Motion 02",
    homeFeaturedOrder: 2,
  },
  {
    id: "motion-03",
    title: "Motion 03",
    videoSrc: "/videos/motion-03.mp4",
    posterSrc: "/images/motion-03.webp",
    posterAlt: "Still from Motion 03",
    homeFeaturedOrder: 3,
  },
  {
    id: "motion-04",
    title: "Motion 04",
    videoSrc: "/videos/motion-04.mp4",
    posterSrc: "/images/motion-04.webp",
    posterAlt: "Still from Motion 04",
    homeFeaturedOrder: 4,
  },
  {
    id: "motion-05",
    title: "Motion 05",
    videoSrc: "/videos/motion-05.mp4",
    posterSrc: "/images/motion-05.webp",
    posterAlt: "Still from Motion 05",
  },
  {
    id: "motion-06",
    title: "Motion 06",
    videoSrc: "/videos/motion-06.mp4",
    posterSrc: "/images/motion-06.webp",
    posterAlt: "Still from Motion 06",
  },
];

export const homeFeaturedProjects = [
  featuredShowreel,
  ...motionGalleryProjects,
  ...projects.filter((project) => project.category !== "Motion Graphics"),
]
  .filter((project) => project.homeFeaturedOrder !== undefined)
  .sort((a, b) => (a.homeFeaturedOrder ?? 0) - (b.homeFeaturedOrder ?? 0));
