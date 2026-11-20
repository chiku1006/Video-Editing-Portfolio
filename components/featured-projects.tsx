import Link from "next/link";
import { MotionGallery } from "@/src/components/MotionGallery";
import { homeFeaturedProjects } from "@/src/data/projects";
import { hasPublicAsset } from "@/src/data/public-assets";
import { PageMotion } from "./page-motion";
import "./featured-projects.css";

export function FeaturedProjects() {
  const featured = homeFeaturedProjects
    .filter(({ videoSrc }) => hasPublicAsset(videoSrc))
    .slice(0, 4)
    .map((project) => ({
      ...project,
      videoAvailable: true,
      posterAvailable: hasPublicAsset(project.posterSrc),
    }));
  if (!featured.length) return null;

  return (
    <section
      id="featured-projects"
      className="featured-work"
      aria-labelledby="featured-title"
    >
      <PageMotion className="featured-inner">
        <header className="featured-header">
          <div>
            <p className="editorial-label featured-eyebrow" data-scroll-reveal>
              Selected Work
            </p>
            <h2
              id="featured-title"
              className="featured-title"
              data-scroll-reveal
            >
              Featured <em>projects</em>
            </h2>
            <p className="featured-description" data-scroll-reveal>
              A selection of video edits and motion projects, from concept to
              final cut.
            </p>
          </div>
          <div data-scroll-reveal>
            <Link className="featured-all" href="/work" data-magnetic="">
              View all work <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>
        <MotionGallery projects={featured} />
      </PageMotion>
    </section>
  );
}
