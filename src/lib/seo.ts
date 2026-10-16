import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./constants";

type PageMetadataInput = {
  title: string;
  description?: string;
  path?: string;
};

export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "es_PE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
