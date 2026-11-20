import {
  motionGalleryProjects,
  projectCategories,
  projects,
} from "@/src/data/projects";
import {
  getShowreel,
  hasPublicAsset,
  withMediaAvailability,
} from "@/src/data/public-assets";
import Link from "next/link";
import { MotionGallery } from "./MotionGallery";
import { ProjectCard } from "./ProjectCard";
import "./work.css";

export function WorkSection() {
  return (
    <section id="work" aria-labelledby="work-title" className="work-section">
      <div className="work-container">
        <header className="work-sectionHeader">
          <div data-page-enter>
            <p className="work-eyebrow editorial-label">Project index</p>
            <h1 id="work-title" className="work-title">
              Work in <em>motion.</em>
            </h1>
          </div>
          <nav
            className="work-index"
            aria-label="Jump to work category"
            data-page-enter
          >
            <Link href="#showreel" data-magnetic="">
              Showreel <span aria-hidden="true">↓</span>
            </Link>
            <Link href="#category-0" data-magnetic="">
              Motion Graphics <span aria-hidden="true">↓</span>
            </Link>
            <Link href="#category-1" data-magnetic="">
              Short-Form Editing <span aria-hidden="true">↓</span>
            </Link>
          </nav>
        </header>
        <div className="work-categories">
          <MotionGallery
            showreel={getShowreel()}
            projects={motionGalleryProjects.map(withMediaAvailability)}
          />
          {projectCategories.map((category, index) => {
            if (category === "Motion Graphics") return null;
            const entries = projects
              .filter((project) => project.category === category)
              .sort((a, b) => a.order - b.order);
            if (!entries.length) return null;
            return (
              <section key={category} aria-labelledby={`category-${index}`}>
                <header className="work-categoryHeader">
                  <span className="work-categoryIndex" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <h2 id={`category-${index}`}>{category}</h2>
                  <span className="work-categoryCount">
                    {String(entries.length).padStart(2, "0")}{" "}
                    {entries.length === 1 ? "PROJECT" : "PROJECTS"}
                  </span>
                </header>
                <div
                  className={
                    entries.length === 1
                      ? "work-grid work-singleProject"
                      : "work-grid"
                  }
                >
                  {entries.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      videoAvailable={hasPublicAsset(project.videoSrc)}
                      posterAvailable={hasPublicAsset(project.posterSrc)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
