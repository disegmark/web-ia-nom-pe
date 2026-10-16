import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/animations/Reveal";
import { BLOG_POSTS } from "@/data/blog";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) return {};

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) notFound();

  return (
    <>
      <article className="border-b border-border py-16 sm:py-20">
        <Container className="max-w-3xl">
          <Reveal>
            <p className="text-xs text-muted">
              {new Date(post.date).toLocaleDateString("es-PE", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}{" "}
              · {post.readingTime}
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted">
              {post.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </Container>
      </article>

      <section className="py-20 sm:py-28">
        <Container>
          <CTA
            title="¿Listo para llevarlo a tu empresa?"
            description="Conversemos sobre cómo aplicar esto a tus procesos y objetivos concretos."
          />
        </Container>
      </section>
    </>
  );
}
