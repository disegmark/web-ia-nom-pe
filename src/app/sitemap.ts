import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { BLOG_POSTS } from "@/data/blog";

const STATIC_ROUTES = [
  "",
  "/servicios",
  "/soluciones",
  "/agentes-ia",
  "/automatizacion",
  "/integraciones",
  "/demo",
  "/nosotros",
  "/contacto",
  "/blog",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: new Date(),
  }));

  const postEntries = BLOG_POSTS.map((post) => ({
    url: new URL(`/blog/${post.slug}`, SITE_URL).toString(),
    lastModified: new Date(post.date),
  }));

  return [...staticEntries, ...postEntries];
}
