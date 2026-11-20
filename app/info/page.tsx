import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { PageMotion } from "@/components/page-motion";
import { contact } from "@/src/data/site";

export const metadata: Metadata = {
  title: "Info",
  description:
    "About Soumen Mandal, a video editor and motion designer based in Kolkata, India.",
};

const stats = [
  { value: "2+", label: "Years experience" },
  { value: "30+", label: "Projects completed" },
  {
    value: "2",
    label: "Creative disciplines",
    description: "Video Editing and Motion Graphics",
  },
  { value: "∞", label: "Creative possibilities" },
];

const software = [
  { icon: "/icons/adobe-premiere-pro.svg", name: "Adobe Premiere Pro" },
  { icon: "/icons/adobe-after-effects.svg", name: "Adobe After Effects" },
  { icon: "/icons/adobe-photoshop.svg", name: "Adobe Photoshop" },
  { icon: "/icons/adobe-illustrator.svg", name: "Adobe Illustrator" },
];

export default function InfoPage() {
  return (
    <PageMotion className="editorial-page info-page">
      <div className="info-intro">
        <header className="editorial-header">
          <p className="editorial-eyebrow editorial-label" data-page-enter>
            Info / About
          </p>
          <h1 className="editorial-title" data-page-enter>
            Behind the <em>edit.</em>
          </h1>
        </header>
        <div className="info-copy" data-page-enter>
          <p>
            I&apos;m <strong>Soumen Mandal</strong>, a video editor and motion
            designer based in Kolkata, India. I love turning simple ideas into
            visuals that feel sharp, expressive, and worth watching.
          </p>
          <p>
            From fast-paced short-form edits to clean motion graphics and
            SaaS-inspired animations, I enjoy exploring rhythm, typography,
            storytelling, and the little details that make a project stand out.
          </p>
          <p>
            I&apos;m constantly experimenting, learning, and pushing my creative
            skills further. For me, every project is an opportunity to make
            something better than the last.
          </p>
        </div>
      </div>
      <div className="info-body">
        <dl className="info-stats" aria-label="Creative statistics">
          {stats.map(({ value, label, description }) => (
            <div className="info-stat" key={label} data-scroll-reveal>
              <dt className="editorial-label">{label}</dt>
              <dd className="info-stat-value">{value}</dd>
              {description && (
                <dd className="info-stat-detail sr-only">{description}</dd>
              )}
            </div>
          ))}
        </dl>
        <section
          className="info-tools"
          aria-labelledby="info-tools-title"
          data-scroll-reveal
        >
          <h2 id="info-tools-title">SOFTWARE &amp; TOOLS</h2>
          <ul className="info-tools-grid" role="list">
            {software.map(({ icon, name }) => (
              <li key={name} className="info-tool">
                <Image
                  className="info-tool-icon"
                  src={icon}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </section>
        <div className="info-personal">
          <aside
            className="identity-note"
            aria-labelledby="identity-title"
            data-scroll-reveal
          >
            <h2 id="identity-title" className="editorial-label">
              Soumen <span>/</span> Chiku
            </h2>
            <p>
              You might have spotted &apos;Designed by Chiku&apos; in some of my
              edits. Chiku is simply the name I create under — same person, same
              work, just a different signature.
            </p>
          </aside>
          <address className="info-contact" data-scroll-reveal>
            <a href={`mailto:${contact.email}`}>
              <Mail aria-hidden="true" size={16} />
              {contact.email}
            </a>
            <p>
              <MapPin aria-hidden="true" size={16} />
              {contact.location}
            </p>
            <p className="availability">
              <span aria-hidden="true" />
              Available for projects
            </p>
          </address>
        </div>
      </div>
      <section
        className="info-availability"
        aria-labelledby="info-availability-title"
        data-scroll-reveal
      >
        <h2 id="info-availability-title">
          CURRENTLY ACCEPTING <span>NEW PROJECTS</span>
        </h2>
        <p>
          Open to creative collaborations, short-form edits, motion graphics,
          and SaaS animations. Have an idea worth bringing to life? Let&apos;s
          make it happen.
        </p>
        <Link
          href="/hire"
          className="studio-button studio-button-primary"
          data-magnetic=""
        >
          Let&apos;s Talk <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </PageMotion>
  );
}
