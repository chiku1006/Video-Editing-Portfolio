"use client";

import { ArrowUpRight } from "lucide-react";
import type { SubmitEvent } from "react";
import { contact } from "@/src/data/site";

const projectTypes = [
  "Short-Form Editing",
  "Motion Graphics",
  "SaaS Animation",
  "Other",
];

export function HireForm() {
  function openDraft(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (field: string) => String(data.get(field) ?? "").trim();
    const subject = value("subject").replace(/[\r\n]/g, " ");
    const body = [
      `Name: ${value("name")}`,
      `Email: ${value("email")}`,
      `Project type: ${value("projectType")}`,
      "",
      value("message").replace(/\r?\n/g, "\r\n"),
    ].join("\r\n");
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form
      className="hire-form"
      onSubmit={openDraft}
      action={`mailto:${contact.email}`}
      method="post"
      encType="text/plain"
    >
      <div className="hire-fields">
        <label>
          <span className="editorial-label">Name</span>
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          <span className="editorial-label">Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span id="hire-project-type" className="editorial-label">
            Project type
          </span>
          <select
            name="projectType"
            aria-labelledby="hire-project-type"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select a project type
            </option>
            {projectTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="editorial-label">Subject</span>
          <input name="subject" required />
        </label>
        <label className="hire-message">
          <span className="editorial-label">Message</span>
          <textarea name="message" rows={5} required />
        </label>
      </div>
      <div className="hire-form-actions">
        <button
          className="studio-button studio-button-primary"
          data-magnetic=""
          type="submit"
          aria-describedby="hire-email-note"
        >
          Send Message <ArrowUpRight size={15} aria-hidden="true" />
        </button>
        <p id="hire-email-note">Opens a draft in your email application.</p>
      </div>
    </form>
  );
}
