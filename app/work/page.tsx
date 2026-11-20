import type { Metadata } from "next";
import { PageMotion } from "@/components/page-motion";
import { WorkSection } from "@/src/components/WorkSection";

export const metadata: Metadata = {
  title: "My Work",
  description:
    "Selected motion graphics and short-form video edits by Soumen Mandal.",
};

export default function WorkPage() {
  return (
    <PageMotion className="work-page">
      <WorkSection />
    </PageMotion>
  );
}
