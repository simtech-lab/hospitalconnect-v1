import { SitePage } from "@/components/site/SitePage";
import { TeamSection } from "@/components/site/TeamSection";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Team() {
  const site = useQuery(api.content.getPublicSite);
  const info = site?.info ?? null;
  const doctors = site?.doctors ?? [];
  const management = site?.management ?? [];

  return (
    <SitePage
      info={info}
      eyebrow="Our team"
      title="The team behind your care."
      intro="Meet the doctors and hospital leadership whose profiles are published by hospital administration."
    >
      <TeamSection doctors={doctors} management={management} showHeading={false} />
    </SitePage>
  );
}
