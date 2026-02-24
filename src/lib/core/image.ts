const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

export type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: "origin" | "avif" | "webp";
  resize?: "cover" | "contain" | "fill";
};

export const IMAGE_PRESETS = {
  hero: { width: 1920, quality: 78 } as const,
  card: { width: 800, quality: 80 } as const,
  thumb: { width: 300, quality: 80 } as const,
  logo: { width: 280, quality: 85 } as const,
  lightbox: { quality: 82 } as const,
  gallery: { width: 600, quality: 80 } as const,
} satisfies Record<string, ImageTransformOptions>;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

function isAbsoluteUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

/**
 * Build a Supabase Image Transformation URL.
 *
 * For Supabase storage URLs: replaces `/object/` with `/render/image/`
 * and appends transform query params (width, height, quality, resize, format).
 *
 * Non-Supabase URLs and Mux thumbnails are returned unchanged.
 */
export function getOptimizedUrl(
  src: string,
  options: ImageTransformOptions = {},
): string {
  if (!SUPABASE_URL || !isAbsoluteUrl(src)) return src;
  if (src.includes("image.mux.com/")) return src;

  // Only transform Supabase storage URLs from our project
  const base = SUPABASE_URL.replace(/\/$/, "");
  if (!src.startsWith(base)) return src;

  // Replace /object/ with /render/image/ for transformation endpoint
  const objectMarker = "/storage/v1/object/";
  const renderMarker = "/storage/v1/render/image/";

  if (!src.includes(objectMarker)) return src;

  let transformed = src.replace(objectMarker, renderMarker);

  // Build query params
  const params = new URLSearchParams();
  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));
  if (options.quality) params.set("quality", String(options.quality));
  if (options.format) params.set("format", options.format);

  // Supabase default resize is "cover" which crops when only width is given.
  // Use "contain" to scale proportionally and let CSS object-fit handle framing.
  const resize = options.resize ?? (options.width && !options.height ? "contain" : undefined);
  if (resize) params.set("resize", resize);

  const qs = params.toString();
  if (qs) transformed += (transformed.includes("?") ? "&" : "?") + qs;

  return transformed;
}

/** @deprecated Use getOptimizedUrl instead */
export const getImageKitUrl = getOptimizedUrl;

export function getResponsiveSrcset(
  src: string,
  options: ImageTransformOptions = {},
  widths: number[] = [],
): string {
  if (!SUPABASE_URL || !isAbsoluteUrl(src) || widths.length === 0) return "";
  if (src.includes("image.mux.com/")) return "";

  return widths
    .map((w) => {
      const url = getOptimizedUrl(src, { ...options, width: w });
      return `${url} ${w}w`;
    })
    .join(", ");
}
