import * as React from "react";
import MuxPlayer from "@mux/mux-player-react";
import type { VideoContent } from "@/lib/case-builder/types";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

const ASPECT_MAP: Record<string, string> = {
  "16/9": "aspect-video",
  "9/16": "aspect-[9/16]",
  "1/1": "aspect-square",
};

function getEmbedUrl(url: string, provider: string): string | null {
  if (provider === "youtube") {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }
  if (provider === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }
  return null;
}

type Props = {
  content: VideoContent;
  /** Na página single case: remove padding e usa preview blur em vez de preload */
  noSpacing?: boolean;
};

function getMuxBlurThumbnail(playbackId: string): string {
  return `https://image.mux.com/${playbackId}/thumbnail.webp?width=40&fit_mode=smartcrop&time=0`;
}

function clampPct(v: any, fallback = 100) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clampPx(v: any, fallback = 0, max = 200) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(max, Math.round(n)));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const v = hex.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(v)) return null;
  const r = parseInt(v.slice(1, 3), 16);
  const g = parseInt(v.slice(3, 5), 16);
  const b = parseInt(v.slice(5, 7), 16);
  return { r, g, b };
}

function VideoFrame({
  content,
  children,
  noSpacing,
}: {
  content: VideoContent;
  children: React.ReactNode;
  noSpacing?: boolean;
}) {
  const widthMobilePct = clampPct(content.widthMobilePct, 100);
  const widthDesktopPct = clampPct(content.widthDesktopPct, 100);

  const borderStyle = content.borderStyle ?? "none";
  const borderColor = (content.borderColor || "#000000").trim() || "#000000";
  const borderWidth = clampPx(content.borderWidth, 1, 24);
  const borderOpacity = clampPct(content.borderOpacity, 100);
  const radius = clampPx(content.radius, 0, 80);
  const padding = noSpacing
    ? { top: 0, bottom: 0, left: 0, right: 0 }
    : {
        top: clampPx(content.padding?.top, 0, 240),
        bottom: clampPx(content.padding?.bottom, 0, 240),
        left: clampPx(content.padding?.left, 0, 240),
        right: clampPx(content.padding?.right, 0, 240),
      };

  const rgb = hexToRgb(borderColor);
  const borderAlpha = borderOpacity / 100;
  const border =
    borderStyle === "solid" && borderWidth > 0 && rgb
      ? `${borderWidth}px solid rgba(${rgb.r},${rgb.g},${rgb.b},${borderAlpha.toFixed(3)})`
      : undefined;

  const needsCenter = widthMobilePct < 100 || widthDesktopPct < 100;

  return (
    <div
      className="w-full"
      style={{
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        paddingRight: padding.right,
      }}
    >
      <div
        className={cn("onmx-media-width", needsCenter ? "mx-auto" : "")}
        style={
          {
            ["--onmx-media-w-mobile" as any]: widthMobilePct,
            ["--onmx-media-w-desktop" as any]: widthDesktopPct,
          } as React.CSSProperties
        }
      >
        <div style={{ borderRadius: radius, border, overflow: radius > 0 ? "hidden" : undefined }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function VideoFallback({
  aspectClass,
  label,
  content,
  noSpacing,
}: {
  aspectClass: string;
  label: string;
  content: VideoContent;
  noSpacing?: boolean;
}) {
  const showPlaceholderBorder = (content.borderStyle ?? "none") !== "solid";
  return (
    <VideoFrame content={content} noSpacing={noSpacing}>
      <div
        className={cn(
          "w-full",
          "rounded-xl",
          showPlaceholderBorder ? "border border-dashed border-primary/35" : "",
          "bg-accent/20",
          "grid place-items-center",
          aspectClass,
        )}
        aria-label="Vídeo (placeholder)"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto h-10 w-10 rounded-full bg-white/70 ring-1 ring-black/5 grid place-items-center">
            <Play className="h-4 w-4 text-black/60" aria-hidden="true" />
          </div>
          <div className="text-sm font-medium text-black/50">{label}</div>
        </div>
      </div>
    </VideoFrame>
  );
}

export default function PublicVideoBlock({ content, noSpacing }: Props) {
  const aspect = ASPECT_MAP[content.aspect] ?? ASPECT_MAP["16/9"];
  const controls = content.controls ?? true;
  const autoPlay = content.autoplay ?? false;
  const loop = content.loop ?? false;

  // Fallback: show placeholder when empty or processing.
  const hasMux = content.provider === "mux";
  const hasPlayableMux = hasMux && Boolean(content.muxPlaybackId);
  const hasUrl = Boolean(content.url?.trim?.());

  if (!hasUrl && !hasPlayableMux) {
    return (
      <VideoFallback
        aspectClass={aspect}
        label={hasMux ? "Processando vídeo…" : "Vídeo"}
        content={content}
        noSpacing={noSpacing}
      />
    );
  }

  if (content.provider === "mux" && content.muxPlaybackId) {
    const ref = React.useRef<any>(null);
    const [blurVisible, setBlurVisible] = React.useState(true);
    const blurThumbnail = getMuxBlurThumbnail(content.muxPlaybackId);

    React.useEffect(() => {
      if (!autoPlay) return;
      const el = ref.current;
      if (!el?.play) return;
      Promise.resolve()
        .then(() => el.play())
        .catch(() => {});
    }, [autoPlay, content.muxPlaybackId]);

    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const onReady = () => setBlurVisible(false);
      el.addEventListener("loadeddata", onReady);
      el.addEventListener("playing", onReady);
      return () => {
        el.removeEventListener("loadeddata", onReady);
        el.removeEventListener("playing", onReady);
      };
    }, [content.muxPlaybackId]);

    const muxStyle = controls
      ? undefined
      : ({
          ["--controls" as any]: "none",
          ["--center-controls" as any]: "none",
          ["--top-controls" as any]: "none",
          ["--bottom-controls" as any]: "none",
        } as React.CSSProperties);

    return (
      <VideoFrame content={content} noSpacing={noSpacing}>
        <div className={cn("relative w-full", aspect)}>
          {/* Blur preview enquanto o vídeo carrega (Mux thumbnail LQIP) */}
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 z-10 transition-opacity duration-500 pointer-events-none",
              blurVisible ? "opacity-100" : "opacity-0",
            )}
          >
            <img
              src={blurThumbnail}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-150 blur-2xl"
            />
          </div>
          <div className={cn("relative", controls ? "w-full" : "w-full mux-no-controls")}>
            <MuxPlayer
              ref={ref}
              playbackId={content.muxPlaybackId}
              streamType="on-demand"
              preload="none"
              className={`w-full ${aspect}`}
              style={muxStyle}
              controls={controls}
              hideControls={!controls}
              autoPlay={autoPlay ? "muted" : undefined}
              muted={autoPlay || !controls}
              playsInline
              loop={loop}
            />
          </div>
        </div>
      </VideoFrame>
    );
  }

  if (content.provider === "file") {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);

    React.useEffect(() => {
      if (!autoPlay) return;
      const el = videoRef.current;
      if (!el) return;
      el.muted = true;
      el.play().catch(() => {});
    }, [autoPlay, content.url]);

    return (
      <VideoFrame content={content} noSpacing={noSpacing}>
        <video
          ref={videoRef}
          src={content.url}
          controls={controls}
          autoPlay={autoPlay}
          muted={autoPlay || !controls}
          playsInline
          loop={loop}
          preload="none"
          className={`w-full ${aspect}`}
        />
      </VideoFrame>
    );
  }

  const embedUrlBase = getEmbedUrl(content.url, content.provider);
  const embedUrl = (() => {
    if (!embedUrlBase) return null;

    const params = new URLSearchParams();
    if (autoPlay) {
      params.set("autoplay", "1");
      // browsers typically require muted autoplay
      params.set("mute", "1");
      params.set("muted", "1");
    }
    if (!controls) {
      params.set("controls", "0");
    }
    if (loop) {
      params.set("loop", "1");
    }

    // YouTube requires playlist=<id> for looping a single video
    if (content.provider === "youtube" && loop) {
      const idMatch = embedUrlBase.match(/\/embed\/([^?]+)/);
      const vid = idMatch?.[1];
      if (vid) params.set("playlist", vid);
    }

    const query = params.toString();
    return query ? `${embedUrlBase}?${query}` : embedUrlBase;
  })();
  if (!embedUrl) {
    return <VideoFallback aspectClass={aspect} label="Vídeo" content={content} noSpacing={noSpacing} />;
  }

  return (
    <VideoFrame content={content} noSpacing={noSpacing}>
      <div className={`relative ${aspect}`}>
        <iframe
          src={embedUrl}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </VideoFrame>
  );
}
