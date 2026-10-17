import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/animations/Reveal";
import { BLOG_POSTS, relatedPosts } from "@/data/blog";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { formatPostDate } from "@/lib/utils";
import type { BlogBlock } from "@/types";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) return {};

  const metadata = pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });

  return {
    ...metadata,
    keywords: post.tags,
    openGraph: { ...metadata.openGraph, type: "article", publishedTime: post.date, tags: post.tags },
  };
}

function Block({ block }: { block: BlogBlock }) {
  if (typeof block === "string") return <p>{block}</p>;
  if ("heading" in block) {
    return <h2 className="font-display pt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{block.heading}</h2>;
  }
  if ("list" in block) {
    return (
      <ul className="space-y-2.5 pl-1">
        {block.list.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="rounded-2xl border border-cyan/30 bg-primary/10 px-5 py-4 text-foreground">{block.note}</p>
  );
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) notFound();

  const related = relatedPosts(post.slug);
  const url = new URL(`/blog/${post.slug}`, SITE_URL).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    inLanguage: "es-PE",
    articleSection: post.category,
    keywords: post.tags.join(", "),
    url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <article className="border-b border-border py-16 sm:py-20">
        <Container className="max-w-3xl">
          <Reveal>
            <Link href="/blog" className="focus-ring inline-flex items-center gap-2 text-sm text-muted hover:text-cyan">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver al blog
            </Link>
            <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <span className="rounded-full border border-cyan/30 bg-primary/10 px-2.5 py-0.5 font-medium text-cyan">
                {post.category}
              </span>
              <span>
                {formatPostDate(post.date)} · {post.readingTime}
              </span>
            </p>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-foreground/80">{post.excerpt}</p>
            <div className="mt-10 space-y-5 text-base leading-relaxed text-muted">
              {post.content.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </div>

            {post.cta ? (
              <Link
                href={post.cta.href}
                className="focus-ring mt-10 inline-flex items-center gap-2 rounded-full border border-cyan/60 bg-primary/10 px-5 py-2.5 text-sm font-medium text-cyan transition-colors hover:bg-primary/20"
              >
                {post.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}

            <ul className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6" aria-label="Etiquetas">
              {post.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                  {tag}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </article>

      {related.length > 0 ? (
        <section className="border-b border-border py-16 sm:py-20">
          <Container>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Sigue leyendo</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.slug} delay={index * 0.05} className="h-full">
                  <Link
                    href={`/blog/${item.slug}`}
                    className="focus-ring group flex h-full flex-col rounded-2xl border border-border bg-background-elevated p-6 transition-colors hover:border-cyan/40"
                  >
                    <p className="text-xs text-muted">
                      {item.category} · {formatPostDate(item.date)}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-cyan">{item.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{item.excerpt}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

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
