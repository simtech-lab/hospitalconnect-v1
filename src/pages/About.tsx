import { AboutSection } from "@/components/site/AboutSection";
import { AppointmentForm } from "@/components/site/AppointmentForm";
import { SitePage } from "@/components/site/SitePage";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function About() {
  const site = useQuery(api.content.getPublicSite);
  const info = site?.info ?? null;
  const services = site?.services ?? [];

  return (
    <SitePage
      info={info}
      eyebrow="About us"
      title="A government hospital, rooted in the Kwahu community."
      intro="Our profile, mission and vision are published by hospital administration for patients, staff and partners. You can also request an appointment below."
    >
      <AboutSection info={info} showHeading={false} />
      <AppointmentForm services={services} info={info} />
    </SitePage>
  );
}
