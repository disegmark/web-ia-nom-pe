import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { StudioApp } from "@/components/studio/StudioApp";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Estudio creativo iA",
    description:
      "Crea avatares hiperrealistas que hablan, voces naturales o clonadas y videos largos escena por escena con inteligencia artificial.",
    path: "/studio",
  }),
  // Private tool behind an access key — keep it out of search results.
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return (
    <>
      <PageHero
        title="Estudio creativo iA"
        description="Avatares hiperrealistas que hablan, voces naturales o clonadas y videos largos escena por escena — todo en un solo lugar."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <StudioApp />
          <p className="mt-10 text-center text-xs leading-relaxed text-muted">
            Usa solo rostros y voces propios o con consentimiento expreso. Los contenidos generados con iA deben
            identificarse como tales al publicarse.
          </p>
        </Container>
      </section>
    </>
  );
}
