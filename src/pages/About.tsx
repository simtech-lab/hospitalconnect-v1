import { AboutSection } from "@/components/site/AboutSection";
import { SitePage } from "@/components/site/SitePage";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function About() {
  const site = useQuery(api.content.getPublicSite);
  const info = site?.info ?? null;

  return (
    <SitePage
      info={info}
      eyebrow="About us"
      title="A government hospital, rooted in the Kwahu community."
      intro="Our profile, mission and vision are published by hospital administration for patients, staff and partners."
    >
      <AboutSection info={info} showHeading={false} />
    </SitePage>
  );
}
