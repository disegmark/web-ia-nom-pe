import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/data/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Casos reales, novedades del producto y guías sobre agentes iA, automatización e integración de sistemas para empresas.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Ideas sobre inteligencia conectada"
        description="Casos reales, novedades de lo que construimos y guías prácticas sobre agentes iA, automatización e integración de sistemas."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <BlogExplorer posts={BLOG_POSTS} categories={BLOG_CATEGORIES} />
        </Container>
      </section>
    </>
  );
}
