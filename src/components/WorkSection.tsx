import {
  motionGalleryProjects,
  projectCategories,
  projects,
} from "@/src/data/projects";
import {
  getShowreel,
  withMediaAvailability,
} from "@/src/data/public-assets";
import { readMp4Duration } from "@/src/data/mp4-duration";
import Link from "next/link";
import { MotionGallery } from "./MotionGallery";
import "./work.css";

export function WorkSection() {
  const shortFormCategory = projectCategories[1];
  const shortFormProjects = projects
    .filter((project) => project.category === shortFormCategory)
    .sort((a, b) => a.order - b.order)
    .map((project) => ({
      ...withMediaAvailability(project),
      duration: readMp4Duration(project.videoSrc),
    }));

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
          <section className="short-form" aria-labelledby="category-1">
            <header className="short-form-header">
              <p className="editorial-label">{shortFormCategory}</p>
              <h2 id="category-1" className="work-title short-form-title">
                Talking-Head <em>stories</em>
              </h2>
              <p className="short-form-intro">
                Talking-head edits focused on clear communication, engaging captions,
                smart pacing, and storytelling.
              </p>
            </header>
            <MotionGallery projects={shortFormProjects} variant="short-form" />
          </section>
        </div>
      </div>
    </section>
  );
}
