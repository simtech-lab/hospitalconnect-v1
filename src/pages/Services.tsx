import { ServicesSection } from "@/components/site/ServicesSection";
import { SitePage } from "@/components/site/SitePage";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Services() {
  const site = useQuery(api.content.getPublicSite);
  const info = site?.info ?? null;
  const services = site?.services ?? [];

  return (
    <SitePage
      info={info}
      eyebrow="Services"
      title="Care for every stage of life."
      intro="From everyday outpatient care to maternal health and community outreach, explore the clinical services published by hospital administration."
    >
      <ServicesSection services={services} showHeading={false} />
    </SitePage>
  );
}
