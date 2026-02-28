import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteMeta } from "@/lib/site-meta";
import { useTranslation } from "@/i18n";

const DEFAULTS = {
  favicon: "/favicon-tsd.svg",
  ogImage: "/img-social-tsd.jpg",
};

/** Converts hex (#RRGGBB) to HSL string for CSS: "H S% L%" */
function hexToHsl(hex: string): string | null {
  const cleaned = hex.replace(/^#/, "");
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;
  let r = parseInt(cleaned.slice(0, 2), 16) / 255;
  let g = parseInt(cleaned.slice(2, 4), 16) / 255;
  let b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function ensureAbsoluteUrl(url: string, base: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const origin = typeof window !== "undefined" ? window.location.origin : base;
  return url.startsWith("/") ? `${origin}${url}` : `${origin}/${url}`;
}

export function SiteMeta() {
  const { t } = useTranslation();
  const { data } = useQuery({
    queryKey: ["site-meta"],
    queryFn: getSiteMeta,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    const title = data?.site_name ?? t("metaTitleDefault");
    const description = data?.site_description ?? t("metaDescriptionDefault");
    const favicon = data?.favicon_url ?? DEFAULTS.favicon;
    const ogImageRaw = data?.og_image_url ?? DEFAULTS.ogImage;
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const ogImage = ogImageRaw ? ensureAbsoluteUrl(ogImageRaw, base) : "";

    const root = document.documentElement;
    const hex = data?.brand_color?.trim();
    if (hex) {
      const hsl = hexToHsl(hex);
      if (hsl) {
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--ring", hsl);
        root.style.setProperty("--sidebar-primary", hsl);
      }
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--sidebar-primary");
    }

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
  }, [data, t]);

  return null;
}
