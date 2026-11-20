import type { Metadata } from "next";
import { HireForm } from "@/components/hire-form";
import { PageMotion } from "@/components/page-motion";
import { contact } from "@/src/data/site";

export const metadata: Metadata = {
  title: "Hire Me",
  description:
    "Get in touch with Soumen Mandal about video editing and motion design projects.",
};

export default function HirePage() {
  return (
    <PageMotion className="editorial-page hire-page">
      <header className="editorial-header">
        <p className="editorial-eyebrow editorial-label" data-page-enter>
          Project inquiries
        </p>
        <h1 className="editorial-title" data-page-enter>
          Let&apos;s work <em>together.</em>
        </h1>
        <p className="editorial-lead" data-page-enter>
          Have a project in mind? Whether it&apos;s a short-form edit, motion
          graphics, or something a little different, I&apos;d love to hear about
          it.
        </p>
        <div className="hire-direct" data-page-enter>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <p className="availability">
            <span aria-hidden="true" /> Available for projects
          </p>
        </div>
      </header>
      <div className="hire-body" data-page-enter>
        <HireForm />
      </div>
    </PageMotion>
  );
}
