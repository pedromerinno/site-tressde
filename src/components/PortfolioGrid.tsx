import * as React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";
import { getPublicCases, toPublicObjectUrl } from "@/lib/case-builder/queries";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { BlurhashCanvas } from "@/components/ui/blurhash-canvas";
import { useCasesSection, ALL_ID } from "@/contexts/CasesSectionContext";
import { useTranslation } from "@/i18n";

function PortfolioGrid() {
  const { activeCategory } = useCasesSection();
  const { t } = useTranslation();
  const { data: cases, isLoading, isError } = useQuery({
    queryKey: ["cases", "public"],
    queryFn: getPublicCases,
    staleTime: 5 * 60 * 1000,
  });

  const items = React.useMemo(() => {
    const list = cases ?? [];
    if (activeCategory === ALL_ID) return list;
    return list.filter((c) => c.categories.some((cat) => cat.id === activeCategory));
  }, [cases, activeCategory]);

  if (isLoading) {
    return (
      <section id="work" className="bg-background relative">
        <div id="work-bottom-sentinel" aria-hidden className="absolute bottom-0 left-0 right-0 h-px pointer-events-none" />
        <div className="px-6 md:px-10 lg:px-16 pt-4 md:pt-6 lg:pt-8 pb-28 md:pb-32 lg:pb-36">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-muted aspect-[4/3] animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="work" className="bg-background relative">
        <div id="work-bottom-sentinel" aria-hidden className="absolute bottom-0 left-0 right-0 h-px pointer-events-none" />
        <div className="px-6 md:px-10 lg:px-16 py-16 pb-28 md:pb-32 text-center">
          <p className="text-muted-foreground">
            {t("casesLoadError")}
          </p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    const isFilteredEmpty = (cases?.length ?? 0) > 0 && activeCategory !== ALL_ID;
    return (
      <section id="work" className="bg-background relative min-h-[70vh] flex flex-col justify-center">
        <div id="work-bottom-sentinel" aria-hidden className="absolute bottom-0 left-0 right-0 h-px pointer-events-none" />
        <div className="px-6 md:px-10 lg:px-16 py-24 pb-28 md:pb-32 text-center">
          <p className="text-muted-foreground">
            {isFilteredEmpty
              ? t("casesEmptyFilter")
              : t("casesEmpty")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="bg-background relative">
      <div id="work-bottom-sentinel" aria-hidden className="absolute bottom-0 left-0 right-0 h-px pointer-events-none" />
      <div className="px-6 md:px-10 lg:px-16 pt-4 md:pt-6 lg:pt-8 pb-28 md:pb-32 lg:pb-36">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
          {items.map((item, i) => (
            <CaseCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

type PublicItem = ReturnType<typeof getPublicCases> extends Promise<(infer T)[]> ? T : never;

// ── CaseCard ─────────────────────────────────────────────────────────

function CaseCard({ item, index }: { item: PublicItem; index: number }) {
  const { t } = useTranslation();
  const muxRef = React.useRef<any>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [hovered, setHovered] = React.useState(false);
  const [posterLoaded, setPosterLoaded] = React.useState(false);

  const hasVideo = Boolean(item.cover_mux_playback_id || item.cover_video_url);

  const posterUrl = item.cover_image_url
    ? toPublicObjectUrl(item.cover_image_url, "case-covers")
    : item.cover_mux_playback_id
      ? `https://image.mux.com/${item.cover_mux_playback_id}/thumbnail.jpg?width=960&fit_mode=smartcrop&time=0`
      : null;

  // Play / pause based on hover
  React.useEffect(() => {
    // For MuxPlayer
    const mux = muxRef.current;
    if (mux) {
      if (hovered) {
        mux.currentTime = 0;
        mux.play?.()?.catch?.(() => {});
      } else {
        mux.pause?.();
      }
      return;
    }
    // For plain <video>
    const video = videoRef.current;
    if (video) {
      if (hovered) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [hovered]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
      className="group cursor-case"
      onMouseEnter={() => hasVideo && setHovered(true)}
      onMouseLeave={() => hasVideo && setHovered(false)}
    >
      <Link
        to={`/cases/${item.slug || item.id}`}
        className="group/link relative flex rounded-xl overflow-hidden bg-gradient-to-b from-blue-900 via-blue-900 to-blue-950 aspect-[4/3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-case"
        aria-label={`${t("caseViewAria")} ${item.title}`}
      >
        {/* Capa */}
        <div className="absolute inset-0">
          {/* Blurhash placeholder */}
          {item.cover_blurhash && (
            <BlurhashCanvas
              hash={item.cover_blurhash}
              hidden={posterLoaded}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* Poster (always rendered as base layer) */}
          {posterUrl ? (
            <OptimizedImage
              src={posterUrl}
              alt=""
              preset="card"
              widths={[800, 1000, 1200, 1600, 2000]}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              onLoad={() => setPosterLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
          )}

          {/* Video layer – visible on hover */}
          {item.cover_mux_playback_id ? (
            <div
              className={[
                "mux-no-controls absolute inset-0 transition-opacity duration-300",
                hovered ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <MuxPlayer
                ref={muxRef}
                playbackId={item.cover_mux_playback_id}
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : item.cover_video_url ? (
            <video
              ref={videoRef}
              src={item.cover_video_url}
              muted
              loop
              playsInline
              preload="auto"
              className={[
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                hovered ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Overlay no hover: título 2/4, cliente 1/4, categoria 1/4, ícone inferior direito */}
        <div className="absolute inset-5 md:inset-6 z-10 grid grid-cols-4 gap-x-4 opacity-0 transition-opacity duration-300 group-hover/link:opacity-100">
          <div className="col-span-2 flex items-start">
            <h2 className="font-display text-lg md:text-xl font-semibold text-white leading-tight">
              {item.title}
            </h2>
          </div>
          <div className="col-span-1 flex items-start justify-center">
            <p className="text-sm text-white/90 truncate max-w-full" title={item.client_name ?? undefined}>
              {item.client_name ?? "—"}
            </p>
          </div>
          <div className="col-span-1 flex items-start justify-end">
            <p className="text-sm text-white/75 truncate max-w-full">
              {item.categories[0]?.name ?? "Work"}
            </p>
          </div>
        </div>

        {/* Ícone inferior direito — container sem borda */}
        <div
          className="absolute right-5 md:right-6 bottom-5 md:bottom-6 z-10 flex h-10 w-10 items-center justify-center text-white opacity-0 transition-opacity duration-300 group-hover/link:opacity-100"
          aria-hidden
        >
          <Plus className="h-5 w-5" />
        </div>
      </Link>
    </motion.article>
  );
}

export default PortfolioGrid;
