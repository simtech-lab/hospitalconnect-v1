import { EventsSection } from "@/components/site/EventsSection";
import { SitePage } from "@/components/site/SitePage";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Events() {
  const site = useQuery(api.content.getPublicSite);
  const info = site?.info ?? null;
  const events = site?.events ?? [];

  return (
    <SitePage
      info={info}
      eyebrow="Events"
      title="Upcoming events at the hospital."
      intro="Outreach, screenings and community programmes. Every event is published by hospital administration."
    >
      <EventsSection events={events} showHeading={false} />
    </SitePage>
  );
}
