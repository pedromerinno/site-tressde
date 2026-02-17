import * as React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";
import { getPublicCases, toPublicObjectUrl } from "@/lib/case-builder/queries";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useCasesSection, ALL_ID } from "@/contexts/CasesSectionContext";

function PortfolioGrid() {
  const { activeCategory } = useCasesSection();
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
      <section id="work" className="bg-background">
        <div className="px-6 md:px-10 lg:px-16 pt-4 md:pt-6 lg:pt-8 pb-12 md:pb-16">
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
      <section id="work" className="bg-background">
        <div className="px-6 md:px-10 lg:px-16 py-16 text-center">
          <p className="text-muted-foreground">
            Não foi possível carregar os cases no momento.
          </p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    const isFilteredEmpty = (cases?.length ?? 0) > 0 && activeCategory !== ALL_ID;
    return (
      <section id="work" className="bg-background min-h-[70vh] flex flex-col justify-center">
        <div className="px-6 md:px-10 lg:px-16 py-24 text-center">
          <p className="text-muted-foreground">
            {isFilteredEmpty
              ? "Nenhum case encontrado para essa categoria."
              : "Nenhum case publicado ainda."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="bg-background">
      <div className="px-6 md:px-10 lg:px-16 pt-4 md:pt-6 lg:pt-8 pb-12 md:pb-16 lg:pb-20">
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
  const muxRef = React.useRef<any>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [hovered, setHovered] = React.useState(false);

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
        aria-label={`Ver case: ${item.title}`}
      >
        {/* Capa */}
        <div className="absolute inset-0">
          {/* Poster (always rendered as base layer) */}
          {posterUrl ? (
            <OptimizedImage
              src={posterUrl}
              alt=""
              preset="card"
              widths={[800, 1000, 1200, 1600, 2000]}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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

        {/* Top left: título + categoria (somente no hover) */}
        <div className="absolute left-5 md:left-6 top-5 md:top-6 z-10 text-left opacity-0 transition-opacity duration-300 group-hover/link:opacity-100">
          <h2 className="font-display text-lg md:text-xl font-semibold text-white leading-tight">
            {item.title}
          </h2>
          <p className="mt-1 text-sm text-white/85">
            {item.categories[0]?.name ?? "Work"}
          </p>
        </div>

        {/* Top right: ícone + (somente no hover) */}
        <div
          className="absolute right-5 md:right-6 top-5 md:top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white opacity-0 transition-opacity duration-300 group-hover/link:opacity-100 group-hover/link:border-white/50"
          aria-hidden
        >
          <Plus className="h-4 w-4" />
        </div>
      </Link>
    </motion.article>
  );
}

export default PortfolioGrid;
