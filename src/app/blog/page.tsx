import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { BLOG_POSTS } from "@/data/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Artículos sobre agentes de IA, automatización e integración para empresas.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Ideas sobre inteligencia conectada"
        description="Artículos sobre agentes iA, automatización e integración de sistemas para empresas."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.05} className="h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  className="focus-ring group flex h-full flex-col rounded-2xl border border-border bg-background-elevated p-6 transition-colors hover:border-cyan/40"
                >
                  <p className="text-xs text-muted">
                    {new Date(post.date).toLocaleDateString("es-PE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}{" "}
                    · {post.readingTime}
                  </p>
                  <h2 className="mt-3 text-lg font-semibold text-foreground group-hover:text-cyan">
                    {post.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
