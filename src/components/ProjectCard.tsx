import type { Project } from "@/src/data/projects";
import { MotionGallery } from "./MotionGallery";
import "./work.css";

interface Props {
  project: Project;
  videoAvailable: boolean;
  posterAvailable: boolean;
}

export function ProjectCard({
  project,
  videoAvailable,
  posterAvailable,
}: Props) {
  const titleId = `${project.id}-title`;

  return (
    <article className="work-card work-card-portrait" aria-labelledby={titleId}>
      <MotionGallery
        variant="portrait"
        projects={[{ ...project, videoAvailable, posterAvailable }]}
      />
      <div className="work-cardDetails">
        <div>
          <p className="work-projectCategory">{project.category}</p>
          <h3 id={titleId}>{project.title}</h3>
          <p className="work-projectCopy">{project.description}</p>
        </div>
        <p className="work-projectType">{project.type}</p>
      </div>
    </article>
  );
}
