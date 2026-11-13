import { GallerySection } from "@/components/site/GallerySection";
import { SitePage } from "@/components/site/SitePage";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Gallery() {
  const site = useQuery(api.content.getPublicSite);
  const info = site?.info ?? null;
  const gallery = site?.gallery ?? [];

  return (
    <SitePage
      info={info}
      eyebrow="Event gallery"
      title="Life and care at our hospital."
      intro="Moments from our wards, clinics and community programmes, published by hospital administration."
    >
      <GallerySection items={gallery} showHeading={false} />
    </SitePage>
  );
}
