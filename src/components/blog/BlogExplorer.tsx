"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { cn, formatPostDate } from "@/lib/utils";
import type { BlogCategory, BlogPost } from "@/types";

type Filter = BlogCategory | "Todos";

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <span className="rounded-full border border-cyan/30 bg-primary/10 px-2.5 py-0.5 font-medium text-cyan">
        {post.category}
      </span>
      <span>
        {formatPostDate(post.date)} · {post.readingTime}
      </span>
    </p>
  );
}

/** Blog index: the latest article featured on top, then a category-filterable grid. */
export function BlogExplorer({ posts, categories }: { posts: BlogPost[]; categories: BlogCategory[] }) {
  const [filter, setFilter] = useState<Filter>("Todos");
  const [featured, ...rest] = posts;
  const filters: Filter[] = ["Todos", ...categories.filter((category) => posts.some((p) => p.category === category))];
  const visible = filter === "Todos" ? rest : posts.filter((post) => post.category === filter);

  return (
    <div>
      {filter === "Todos" && featured ? (
        <Reveal>
          <Link
            href={`/blog/${featured.slug}`}
            className="focus-ring plate-glow-cyan group block rounded-3xl border border-border bg-background-elevated p-7 transition-colors hover:border-cyan/40 sm:p-10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan">Lo más reciente</p>
            <div className="mt-4">
              <PostMeta post={featured} />
            </div>
            <h2 className="font-display mt-4 max-w-3xl text-balance text-2xl font-semibold tracking-tight text-foreground group-hover:text-cyan sm:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{featured.excerpt}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyan">
              Leer artículo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </Reveal>
      ) : null}

      <div className={cn("flex flex-wrap gap-2", filter === "Todos" ? "mt-12" : "")} role="group" aria-label="Filtrar por categoría">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
            className={cn(
              "focus-ring rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              filter === item
                ? "border-cyan/60 bg-primary/10 text-cyan"
                : "border-border text-muted hover:border-cyan/40 hover:text-cyan",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post, index) => (
          <Reveal key={`${filter}-${post.slug}`} delay={Math.min(index, 5) * 0.05} className="h-full">
            <Link
              href={`/blog/${post.slug}`}
              className="focus-ring group flex h-full flex-col rounded-2xl border border-border bg-background-elevated p-6 transition-colors hover:border-cyan/40"
            >
              <PostMeta post={post} />
              <h2 className="mt-3 text-lg font-semibold text-foreground group-hover:text-cyan">{post.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
