import { contact } from "@/src/data/site";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FooterSocials } from "./footer-socials";

export function SiteFooter() {
  return (
    <footer id="footer" className="site-footer">
      <div className="footer-frame">
        <div className="studio-footer-call">
          <h2>
            Let&apos;s make it <em>move.</em>
          </h2>
          <Link
            href="/hire"
            className="studio-footer-arrow"
            aria-label="Start a project"
            data-magnetic=""
          >
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <div className="footer-columns">
          <div>
            <p className="footer-name">Soumen.</p>
            <p>Video Editor · Motion Designer</p>
          </div>
          <div className="footer-connect">
            <h2 className="editorial-label">Connect</h2>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <p>{contact.location}</p>
            <p className="availability">
              <span aria-hidden="true" />
              Available for projects
            </p>
          </div>
          <div>
            <h2 className="editorial-label">Follow</h2>
            <FooterSocials />
          </div>
        </div>
        <p className="footer-copyright">
          © 2026 Soumen Mandal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
