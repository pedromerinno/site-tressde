import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteMeta } from "@/lib/site-meta";

const DEFAULTS = {
  title: "TRESSDE® Imagine.",
  description:
    "Agência full-service para marcas que lideram a evolução do mercado.",
  favicon: "/favicon-tsd.svg",
  ogImage: "",
};

function ensureAbsoluteUrl(url: string, base: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const origin = typeof window !== "undefined" ? window.location.origin : base;
  return url.startsWith("/") ? `${origin}${url}` : `${origin}/${url}`;
}

export function SiteMeta() {
  const { data } = useQuery({
    queryKey: ["site-meta"],
    queryFn: getSiteMeta,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    const title = data?.site_name ?? DEFAULTS.title;
    const description = data?.site_description ?? DEFAULTS.description;
    const favicon = data?.favicon_url ?? DEFAULTS.favicon;
    const ogImageRaw = data?.og_image_url ?? DEFAULTS.ogImage;
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const ogImage = ogImageRaw ? ensureAbsoluteUrl(ogImageRaw, base) : "";

    document.title = title;

    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute("content", description);

    let linkIcon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!linkIcon) {
      linkIcon = document.createElement("link");
      linkIcon.rel = "icon";
      document.head.appendChild(linkIcon);
    }
    linkIcon.href = favicon.startsWith("http") ? favicon : (typeof window !== "undefined" ? ensureAbsoluteUrl(favicon, window.location.origin) : favicon);

    const setMeta = (attr: string, value: string, selector: string, prop: "property" | "name", propVal: string) => {
      if (!value) return;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(prop, propVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta("content", title, 'meta[property="og:title"]', "property", "og:title");
    setMeta("content", description, 'meta[property="og:description"]', "property", "og:description");
    setMeta("content", title, 'meta[property="og:site_name"]', "property", "og:site_name");
    if (ogImage) setMeta("content", ogImage, 'meta[property="og:image"]', "property", "og:image");
    setMeta("content", title, 'meta[name="twitter:title"]', "name", "twitter:title");
    setMeta("content", description, 'meta[name="twitter:description"]', "name", "twitter:description");
    if (ogImage) setMeta("content", ogImage, 'meta[name="twitter:image"]', "name", "twitter:image");
  }, [data]);

  return null;
}
