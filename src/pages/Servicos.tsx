import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import { ContactModalProvider, useContactModal, ContactPopover } from "@/contexts/ContactModalContext";
import { CasesSectionProvider } from "@/contexts/CasesSectionContext";
import { OptimizedImage } from "@/components/ui/optimized-image";
import MuxPlayer from "@mux/mux-player-react";
import { Sparkles, Film } from "lucide-react";
import {
  getStudioRevealDisplayItems,
  getPublicCases,
  toPublicObjectUrl,
  type StudioRevealDisplayItem,
} from "@/lib/case-builder/queries";
import { useTranslation } from "@/i18n";
import ClientLogosMarquee from "@/components/ClientLogosMarquee";
import { getSequenceFrameUrls } from "@/lib/sequence-frames";

gsap.registerPlugin(ScrollTrigger);

function getCaseCoverPosterUrl(item: StudioRevealDisplayItem): string | null {
  if (item.cover_poster_url) return item.cover_poster_url;
  if (item.cover_image_url)
    return toPublicObjectUrl(item.cover_image_url, "case-covers");
  if (item.cover_mux_playback_id)
    return `https://image.mux.com/${item.cover_mux_playback_id}/thumbnail.jpg?width=960&fit_mode=smartcrop&time=0`;
  return null;
}

// ─── Hero (capas de cases) ───────────────────────────────────────────────

function ServicosHero() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const bgRef = React.useRef<HTMLDivElement>(null);
  const headlineRef = React.useRef<HTMLHeadingElement>(null);
  const line1Ref = React.useRef<HTMLSpanElement>(null);
  const line2Ref = React.useRef<HTMLSpanElement>(null);
  const subRef = React.useRef<HTMLParagraphElement>(null);
  const taglineRef = React.useRef<HTMLParagraphElement>(null);
  const { t } = useTranslation();

  const { data: revealItems } = useQuery({
    queryKey: ["studio-reveal-display"],
    queryFn: getStudioRevealDisplayItems,
    staleTime: 2 * 60 * 1000,
  });

  const { data: publicCases } = useQuery({
    queryKey: ["cases", "public"],
    queryFn: getPublicCases,
    staleTime: 5 * 60 * 1000,
    enabled: revealItems == null,
  });

  const heroItems: StudioRevealDisplayItem[] = React.useMemo(() => {
    if (revealItems && revealItems.length === 3) return revealItems;
    if (publicCases && publicCases.length > 0) {
      return publicCases.slice(0, 3).map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        cover_image_url: c.cover_image_url,
        cover_video_url: c.cover_video_url,
        cover_mux_playback_id: c.cover_mux_playback_id,
        cover_poster_url: c.cover_mux_playback_id
          ? `https://image.mux.com/${c.cover_mux_playback_id}/thumbnail.jpg?width=960&fit_mode=smartcrop&time=0`
          : c.cover_image_url
            ? toPublicObjectUrl(c.cover_image_url, "case-covers")
            : null,
        categories: c.categories,
      }));
    }
    return [];
  }, [revealItems, publicCases]);

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const headline = headlineRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const sub = subRef.current;
    const tagline = taglineRef.current;
    if (!section || !headline) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set([line1, line2, sub, tagline].filter(Boolean), { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([line1, line2, sub, tagline].filter(Boolean), { opacity: 0, y: 28 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(line1, { opacity: 1, y: 0, duration: 0.65 }, 0.15)
        .to(line2, { opacity: 1, y: 0, duration: 0.6 }, 0.28)
        .to(sub, { opacity: 1, y: 0, duration: 0.5 }, 0.45)
        .to(tagline, { opacity: 1, y: 0, duration: 0.45 }, 0.55);

      if (bg) {
        gsap.to(bg, {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const showCaseCovers = heroItems.length > 0;

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] flex flex-col justify-end overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        {showCaseCovers ? (
          <div className="grid grid-cols-3 w-full h-full">
            {heroItems.map((item) => {
              const posterUrl = getCaseCoverPosterUrl(item);
              return (
                <div key={item.id} className="relative w-full h-full overflow-hidden">
                  {posterUrl ? (
                    <OptimizedImage
                      src={posterUrl}
                      alt=""
                      preset="hero"
                      priority
                      widths={[640, 960, 1280]}
                      sizes="33vw"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-muted" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <OptimizedImage
            src="/BG_onmx_02.jpg"
            alt=""
            preset="hero"
            priority
            widths={[960, 1440, 1920]}
            sizes="100vw"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" />
      </div>

      <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-32 md:pt-40 pb-20 md:pb-24">
        <p className="text-sm font-medium text-white/70 tracking-[0.12em] uppercase mb-6">
          {t("servicosLabel")}
        </p>
        <h1 ref={headlineRef} className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.06] text-white max-w-5xl">
          <span ref={line1Ref} className="block">{t("servicosHeroLine1")}</span>
          <span ref={line2Ref} className="block">{t("servicosHeroLine2")}</span>
        </h1>
        <p
          ref={subRef}
          className="mt-8 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed"
        >
          {t("servicosHeroSub")}
        </p>
        <p
          ref={taglineRef}
          className="mt-4 text-base md:text-lg text-white font-medium"
        >
          {t("servicosHeroTagline")}
        </p>
      </div>
    </section>
  );
}

// ─── Service block (01 — 3D Motion / 03 — AI) ─────────────────────────────

const CATEGORY_SLUG_3D = "3d-motion";
const CATEGORY_SLUG_VFX = "vfx";
const CATEGORY_SLUGS_AI: string[] = ["ai", "ia"];

type CaseForService = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  cover_video_url: string | null;
  cover_mux_playback_id: string | null;
  categories: Array<{ id: string; name: string; slug?: string }>;
};

type ServiceBlockProps = {
  number: string;
  title: string;
  subtitle?: string;
  body: React.ReactNode;
  bestFor: string[];
  deliverables: string[];
  ctaLabel: string;
  ctaHref: string;
  visualType: "3d" | "ai";
  caseItems?: CaseForService[];
  layout?: "image-left" | "image-right";
  videoCount?: 2 | 3;
};

function getCasePosterUrl(item: CaseForService): string | null {
  if (item.cover_mux_playback_id)
    return `https://image.mux.com/${item.cover_mux_playback_id}/thumbnail.jpg?width=960&fit_mode=smartcrop&time=0`;
  if (item.cover_image_url)
    return toPublicObjectUrl(item.cover_image_url, "case-covers");
  return null;
}

function hasVideo(item: CaseForService): boolean {
  return Boolean(item.cover_mux_playback_id || item.cover_video_url);
}

function CaseMedia({
  item,
  className,
  sizes,
  muted = true,
  loop = true,
  autoPlay = true,
}: {
  item: CaseForService;
  className?: string;
  sizes?: string;
  muted?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
}) {
  const posterUrl = getCasePosterUrl(item);

  if (item.cover_mux_playback_id) {
    return (
      <div className={`mux-no-controls relative overflow-hidden ${className ?? ""}`}>
        <MuxPlayer
          playbackId={item.cover_mux_playback_id}
          poster={posterUrl ?? undefined}
          muted={muted}
          loop={loop}
          playsInline
          autoPlay={autoPlay}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (item.cover_video_url) {
    return (
      <div className={`relative overflow-hidden ${className ?? ""}`}>
        <video
          src={item.cover_video_url}
          poster={posterUrl ?? undefined}
          muted={muted}
          loop={loop}
          playsInline
          autoPlay={autoPlay}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>
    );
  }

  return posterUrl ? (
    <OptimizedImage
      src={posterUrl}
      alt={item.title}
      preset="hero"
      widths={[960, 1280, 1600]}
      sizes={sizes ?? "100vw"}
      className={className}
    />
  ) : (
    <div className={className} />
  );
}

function ServiceBlock({
  number,
  title,
  subtitle,
  body,
  bestFor,
  deliverables,
  ctaLabel,
  ctaHref,
  visualType,
  caseItems = [],
  layout = "image-right",
  videoCount = 2,
}: ServiceBlockProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const visualRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLDivElement>(null);

  const hasCases = caseItems.length > 0;
  const displayCases = caseItems.slice(0, videoCount);

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const visual = visualRef.current;
    const img = imgRef.current;
    if (!section) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.set(content, { opacity: 0, y: 32 });
      gsap.set(visual, { opacity: 0, y: 48 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });
      tl.to(content, { opacity: 1, y: 0, duration: 0.8 })
        .to(visual, { opacity: 1, y: 0, duration: 0.9 }, "-=0.5");

      if (img) {
        gsap.to(img, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const contentBlock = (
    <div ref={contentRef} className="lg:w-[40%] shrink-0">
      <span className="text-xs font-medium text-primary/80 tracking-[0.2em] uppercase">
        {number}
      </span>
      <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.05]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-8 text-foreground/80 leading-relaxed max-w-lg">
        {body}
      </div>
      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-1 text-sm text-muted-foreground">
        {bestFor.concat(deliverables).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <Link
        to={ctaHref}
        className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {ctaLabel}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );

  const visualBlock = (
    <div ref={visualRef} className="relative flex-1 min-w-0 lg:min-w-[58%]">
      {hasCases && displayCases.length > 0 ? (
        videoCount === 3 ? (
          <div
            ref={imgRef}
            className="relative w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[480px]"
          >
            {displayCases.map((item, i) => (
              <Link
                key={item.id}
                to={`/cases/${item.slug}`}
                className={[
                  "group absolute block overflow-hidden rounded-xl transition-transform duration-500 ease-out hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  i === 0 && "left-0 top-0 w-[52%] sm:w-[54%] aspect-[16/10] z-10",
                  i === 1 && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[48%] sm:w-[50%] aspect-[16/10] z-20",
                  i === 2 && "right-0 bottom-0 w-[52%] sm:w-[54%] aspect-[16/10] z-10",
                ].join(" ")}
              >
                <div className="absolute inset-0">
                  {hasVideo(item) ? (
                    <CaseMedia
                      item={item}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      sizes="(min-width: 1024px) 25vw, 45vw"
                      autoPlay
                    />
                  ) : getCasePosterUrl(item) ? (
                    <OptimizedImage
                      src={getCasePosterUrl(item)!}
                      alt={item.title}
                      preset="hero"
                      widths={[640, 960, 1200]}
                      sizes="(min-width: 1024px) 25vw, 45vw"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            ref={imgRef}
            className="relative w-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] [perspective:1200px]"
          >
            {displayCases.map((item, i) => (
              <Link
                key={item.id}
                to={`/cases/${item.slug}`}
                className={[
                  "group absolute block overflow-hidden rounded-xl aspect-[16/10] transition-all duration-500 ease-out",
                  "hover:scale-[1.02] hover:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "w-[55%] sm:w-[52%]",
                  i === 0 &&
                    "left-0 top-0 z-10 origin-bottom-right [transform:rotateY(-8deg)_rotate(-2deg)] hover:[transform:rotateY(-4deg)_rotate(-1deg)_scale(1.02)]",
                  i === 1 &&
                    "right-0 bottom-0 z-0 origin-top-left [transform:rotateY(8deg)_rotate(2deg)] hover:[transform:rotateY(4deg)_rotate(1deg)_scale(1.02)]",
                ].join(" ")}
              >
                <div className="absolute inset-0">
                  {hasVideo(item) ? (
                    <CaseMedia
                      item={item}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      sizes="(min-width: 1024px) 28vw, 48vw"
                      autoPlay
                    />
                  ) : getCasePosterUrl(item) ? (
                    <OptimizedImage
                      src={getCasePosterUrl(item)!}
                      alt={item.title}
                      preset="hero"
                      widths={[640, 960]}
                      sizes="(min-width: 1024px) 28vw, 48vw"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div
          ref={imgRef}
          className={`relative aspect-[16/10] overflow-hidden rounded-xl ${visualType === "3d" ? "bg-gradient-to-br from-primary/15 to-accent/20" : "bg-gradient-to-br from-violet-500/10 to-primary/10"}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {visualType === "3d" ? (
              <Film className="h-20 w-20 text-primary/40" aria-hidden />
            ) : (
              <Sparkles className="h-20 w-20 text-violet-500/40" aria-hidden />
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section ref={sectionRef} className="overflow-hidden">
      <div className="px-6 md:px-10 lg:px-16 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-end gap-16 lg:gap-20">
          {layout === "image-left" ? (
            <>
              {visualBlock}
              {contentBlock}
            </>
          ) : (
            <>
              {contentBlock}
              {visualBlock}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Full-bleed showcase (seção de vídeo com padding e borda) ───────────────

function FullBleedShowcase({ caseItem }: { caseItem: CaseForService | undefined }) {
  return (
    <section className="relative w-full px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <div className="relative h-[50vh] min-h-[280px] max-h-[560px] w-full overflow-hidden rounded-2xl md:rounded-3xl border border-border/50 bg-muted/30">
        {caseItem ? (
          hasVideo(caseItem) ? (
            <CaseMedia
              item={caseItem}
              className="absolute inset-0 h-full w-full object-cover"
              sizes="100vw"
              autoPlay
            />
          ) : getCasePosterUrl(caseItem) ? (
            <OptimizedImage
              src={getCasePosterUrl(caseItem)!}
              alt=""
              preset="hero"
              widths={[1280, 1920]}
              sizes="100vw"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        )}
      </div>
    </section>
  );
}

// ─── Why TRESSDE (scroll-reveal; pilares + sequência public/sequence no scroll) ─

const PILLAR_COUNT = 4;

function WhyTressdeSection({ caseItems }: { caseItems: CaseForService[] }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const seqImgRef = React.useRef<HTMLImageElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const subRef = React.useRef<HTMLParagraphElement>(null);
  const pillarSlotRef = React.useRef<HTMLDivElement>(null);
  const pillRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const taglineRef = React.useRef<HTMLParagraphElement>(null);

  const { t } = useTranslation();
  const pillars = [
    t("servicosWhyPillar1"),
    t("servicosWhyPillar2"),
    t("servicosWhyPillar3"),
    t("servicosWhyPillar4"),
  ];

  const sequenceFrames = React.useMemo(() => getSequenceFrameUrls(), []);

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const sub = subRef.current;
    const slot = pillarSlotRef.current;
    const pills = pillRefs.current.filter(Boolean) as HTMLDivElement[];
    const tagline = taglineRef.current;
    const seqImg = seqImgRef.current;
    if (!section || !title || pills.length < 4) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.set([title, sub, slot, tagline], { opacity: 0, y: 32 });
      gsap.set(pills[0], { y: 0, opacity: 1 });
      gsap.set(pills.slice(1), { y: 48, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
        defaults: { ease: "power2.out" },
      });

      tl.to(title, { opacity: 1, y: 0, duration: 0.12 }, 0)
        .to(sub, { opacity: 1, y: 0, duration: 0.10 }, 0.10)
        .to(slot, { opacity: 1, y: 0, duration: 0.12 }, 0.22)
        .to(tagline, { opacity: 1, y: 0, duration: 0.10 }, 0.85);

      const d = 0.08;
      tl.to(pills[0], { y: -48, opacity: 0, duration: d }, 0.35);
      tl.to(pills[1], { y: 0, opacity: 1, duration: d }, 0.35);
      tl.to(pills[1], { y: -48, opacity: 0, duration: d }, 0.55);
      tl.to(pills[2], { y: 0, opacity: 1, duration: d }, 0.55);
      tl.to(pills[2], { y: -48, opacity: 0, duration: d }, 0.75);
      tl.to(pills[3], { y: 0, opacity: 1, duration: d }, 0.75);

      // Sequência public/sequence: progresso do scroll → índice do frame
      if (seqImg && sequenceFrames.length > 0) {
        let lastIdx = -1;
        tl.eventCallback("onUpdate", () => {
          const p = tl.progress();
          const idx = Math.min(
            Math.floor(p * sequenceFrames.length),
            sequenceFrames.length - 1,
          );
          if (idx !== lastIdx) {
            lastIdx = idx;
            seqImg.src = sequenceFrames[idx];
          }
        });
      }
    }, section);

    return () => ctx.revert();
  }, [sequenceFrames]); // eslint-disable-line react-hooks/exhaustive-deps

  const firstFrame = sequenceFrames[0] ?? "";

  return (
    <section ref={sectionRef} className="relative h-[100vh] overflow-hidden">
      <div className="absolute inset-0">
        {firstFrame ? (
          <img
            ref={seqImgRef}
            src={firstFrame}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        )}
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center px-6 md:px-10 lg:px-16 py-24 md:py-32">
        <div className="mx-auto max-w-4xl w-full text-center flex flex-col gap-10 md:gap-12">
          <h2
            ref={titleRef}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white"
          >
            {t("servicosWhyTitle")}
          </h2>
          <p
            ref={subRef}
            className="text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mx-auto"
          >
            {t("servicosWhySub")}
          </p>
          <div
            ref={pillarSlotRef}
            className="relative flex items-center justify-center overflow-hidden"
          >
            {/* Placeholder invisível para dar altura natural ao slot */}
            <div className="invisible rounded-full border border-white/30 py-4 px-6 md:py-5 md:px-8">
              <span className="text-xl md:text-2xl font-medium">{pillars[0]}</span>
            </div>
            {pillars.map((label, i) => (
              <div
                key={label}
                ref={(el) => { pillRefs.current[i] = el; }}
                className="absolute left-1/2 -translate-x-1/2 w-fit rounded-full border border-white/30 py-4 px-6 md:py-5 md:px-8 text-center"
              >
                <span className="text-xl md:text-2xl font-medium text-white/95 tracking-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p
            ref={taglineRef}
            className="text-xl md:text-2xl font-semibold text-white"
          >
            {t("servicosWhyTagline")}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Process (5 círculos sobrepostos, estilo Venn) ──────────────────────────

function ProcessSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const diagramRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const processSteps = [
    t("servicosProcessStep1"),
    t("servicosProcessStep2"),
    t("servicosProcessStep3"),
    t("servicosProcessStep4"),
    t("servicosProcessStep5"),
  ];

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const diagram = diagramRef.current;
    if (!section || !diagram) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const circles = diagram.querySelectorAll("[data-process-circle]");
    const ctx = gsap.context(() => {
      gsap.set(circles, { opacity: 0, scale: 0.85 });
      gsap.to(circles, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          toggleActions: "play none none none",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-background">
      <div className="px-6 md:px-10 lg:px-16 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            {t("servicosProcessTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("servicosProcessSub")}
          </p>
        </div>

        {/* 5 círculos — full width */}
        <div
          ref={diagramRef}
          className="mt-16 w-full flex flex-nowrap justify-center items-center overflow-x-auto overflow-y-visible py-8 scrollbar-hide min-h-[200px] sm:min-h-[230px] md:min-h-[260px] lg:min-h-[290px]"
          role="img"
          aria-label={processSteps.join(", ")}
        >
          {processSteps.map((step, i) => (
            <div
              key={step}
              data-process-circle
              className={[
"flex flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-muted/30 px-4 py-5 text-center",
                  "w-[170px] h-[170px] sm:w-[200px] sm:h-[200px] md:w-[230px] md:h-[230px] lg:w-[260px] lg:h-[260px]",
                  "text-sm sm:text-base md:text-lg font-semibold text-primary leading-tight",
                  i > 0 && "-ml-6 sm:-ml-8 md:-ml-10 lg:-ml-12",
              ].join(" ")}
            >
              <span className="max-w-[88%] break-words [word-break:break-word]">
                {step}
              </span>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <p className="mt-16 text-foreground/70 font-medium">
            {t("servicosProcessTagline")}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── 3D, VFX, IA — 3 cards lado a lado; hover expande, outros contraem; imagem no fundo ─

const SERVICOS_LEAD_CARD_BASE =
  "h-[380px] md:h-[440px] min-w-0 rounded-3xl overflow-hidden relative flex flex-col transition-[flex] duration-300 ease-out flex-[1_1_0%] hover:flex-[2_1_0%]";

// Imagens de fundo: coloque em public/ ou use URLs. Fallback = gradiente.
const SERVICOS_LEAD_BG = {
  "3d": "/images/servicos-lead-3d.jpg",
  vfx: "/images/servicos-lead-vfx.jpg",
  ai: "/images/servicos-lead-ai.jpg",
} as const;

function ServicosLeadCard({
  title,
  description,
  ctaLabel,
  ariaLabelId,
  bgKey,
  fallbackGradient,
  overlayGradient,
  ctaClassName,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ariaLabelId?: string;
  bgKey: keyof typeof SERVICOS_LEAD_BG;
  fallbackGradient: string;
  overlayGradient: string;
  ctaClassName: string;
}) {
  const bgUrl = SERVICOS_LEAD_BG[bgKey];
  const arrowSvg = (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );

  return (
    <div
      id={ariaLabelId}
      className={`${SERVICOS_LEAD_CARD_BASE} p-8 md:p-10`}
    >
      {/* Camada 1: gradiente de fallback (visível quando a imagem não carrega) */}
      <div className={`absolute inset-0 ${fallbackGradient}`} aria-hidden />
      {/* Camada 2: imagem de fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      {/* Camada 3: overlay para legibilidade do texto */}
      <div className={`absolute inset-0 ${overlayGradient}`} aria-hidden />
      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col h-full">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-4 text-base text-white/90 leading-relaxed max-w-xl line-clamp-3">
          {description}
        </p>
        <div className="mt-auto pt-8 flex items-end justify-end">
          <Link
            to="/#work"
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 ${ctaClassName}`}
            aria-label={ctaLabel}
          >
            <span className="sr-only">{ctaLabel}</span>
            {arrowSvg}
          </Link>
        </div>
      </div>
    </div>
  );
}

function VfxLeadSection() {
  const { t } = useTranslation();
  const sectionRef = React.useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="px-6 md:px-10 lg:px-16 py-16 md:py-24"
      aria-labelledby="servicos-lead-3d"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5">
          <ServicosLeadCard
            ariaLabelId="servicos-lead-3d"
            title={t("servicos3dTitle")}
            description={t("servicos3dBody1")}
            ctaLabel={t("servicos3dCta")}
            bgKey="3d"
            fallbackGradient="bg-gradient-to-br from-primary via-primary to-primary/90"
            overlayGradient="bg-gradient-to-t from-black/75 via-black/35 to-black/20"
            ctaClassName="bg-white text-primary"
          />
          <ServicosLeadCard
            title={t("servicosVfxTitle")}
            description={t("servicosVfxLeadDesc")}
            ctaLabel={t("servicosVfxCta")}
            bgKey="vfx"
            fallbackGradient="bg-gradient-to-br from-primary via-primary to-primary/90"
            overlayGradient="bg-gradient-to-t from-black/75 via-black/35 to-black/20"
            ctaClassName="bg-white text-primary"
          />
          <ServicosLeadCard
            title={t("servicosAiTitle")}
            description={t("servicosAiBody1")}
            ctaLabel={t("servicosAiCta")}
            bgKey="ai"
            fallbackGradient="bg-gradient-to-br from-primary via-primary to-primary/90"
            overlayGradient="bg-gradient-to-t from-black/75 via-black/35 to-black/20"
            ctaClassName="bg-white text-primary"
          />
        </div>
      </div>
    </section>
  );
}

// Posições e rotações das cápsulas de cases ao redor do CTA (estilo referência)
const CTA_CAPSULE_POSITIONS: Array<{ top: string; left: string; rotation: number; size: "sm" | "md" | "lg" }> = [
  { top: "10%", left: "14%", rotation: -10, size: "md" },
  { top: "12%", left: "50%", rotation: 4, size: "sm" },
  { top: "10%", left: "86%", rotation: 8, size: "md" },
  { top: "38%", left: "4%", rotation: -14, size: "lg" },
  { top: "38%", left: "96%", rotation: 12, size: "md" },
  { top: "52%", left: "6%", rotation: -6, size: "md" },
  { top: "52%", left: "94%", rotation: 6, size: "md" },
  { top: "66%", left: "4%", rotation: 10, size: "md" },
  { top: "66%", left: "96%", rotation: -11, size: "lg" },
  { top: "88%", left: "14%", rotation: 7, size: "md" },
  { top: "90%", left: "50%", rotation: -5, size: "sm" },
  { top: "88%", left: "86%", rotation: -8, size: "md" },
];

// ─── Final CTA (conteúdo central + cases em cápsulas ao redor) ─────────────

function ServicosCTA({ caseItems = [] }: { caseItems?: CaseForService[] }) {
  const contactModal = useContactModal();
  const sectionRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const capsulesToShow = caseItems.slice(0, CTA_CAPSULE_POSITIONS.length);
  const positions = CTA_CAPSULE_POSITIONS.slice(0, capsulesToShow.length);

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.set(content, { opacity: 0, y: 30 });
      gsap.to(content, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%", toggleActions: "play none none none" },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contato"
      ref={sectionRef}
      className="relative px-6 md:px-10 lg:px-16 py-24 md:py-32 min-h-[85vh] flex items-center justify-center overflow-visible"
    >
      {/* Cases em cápsulas ao redor (borda suave, rotação, sombra) */}
      {capsulesToShow.length > 0 && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 max-w-6xl mx-auto" aria-hidden>
            {capsulesToShow.map((item, i) => {
              const pos = positions[i];
              if (!pos) return null;
              const sizeClass =
                pos.size === "sm"
                  ? "w-16 h-16 md:w-20 md:h-20"
                  : pos.size === "lg"
                    ? "w-24 h-24 md:w-28 md:h-28"
                    : "w-20 h-20 md:w-24 md:h-24";
              const posterUrl = getCasePosterUrl(item);
              return (
                <Link
                  key={item.id}
                  to={`/cases/${item.slug}`}
                  className={`absolute overflow-hidden rounded-2xl border border-black/8 bg-background/80 transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${sizeClass}`}
                  style={{
                    top: pos.top,
                    left: pos.left,
                    transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
                  }}
                >
                  {posterUrl ? (
                    <OptimizedImage
                      src={posterUrl}
                      alt={item.title}
                      preset="thumb"
                      widths={[160, 224]}
                      sizes="(max-width: 768px) 80px, 112px"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Conteúdo central */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto max-w-2xl text-center bg-background/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none rounded-2xl md:rounded-none py-8 md:py-0 px-6 md:px-0"
      >
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
          {t("servicosCtaTitle")}
        </h2>
        <p className="mt-5 text-base text-muted-foreground leading-relaxed">
          {t("servicosCtaSub")}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {contactModal ? (
            <ContactPopover>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("servicosCtaButton")}
              </button>
            </ContactPopover>
          ) : (
            <a
              href="/#contato"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("servicosCtaButton")}
            </a>
          )}
          <a
            href="mailto:hello@tressde.com"
            className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            hello@tressde.com
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

function ServicosContent() {
  const { t } = useTranslation();
  const { data: publicCases = [] } = useQuery({
    queryKey: ["cases", "public"],
    queryFn: getPublicCases,
    staleTime: 5 * 60 * 1000,
  });

  const cases3d = React.useMemo(
    () =>
      publicCases
        .filter((c) => c.categories.some((cat) => cat.slug === CATEGORY_SLUG_3D))
        .slice(0, 3)
        .map((c): CaseForService => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          cover_image_url: c.cover_image_url,
          cover_video_url: c.cover_video_url ?? null,
          cover_mux_playback_id: c.cover_mux_playback_id,
          categories: c.categories,
        })),
    [publicCases],
  );

  const casesVfx = React.useMemo(
    () =>
      publicCases
        .filter((c) => c.categories.some((cat) => cat.slug === CATEGORY_SLUG_VFX))
        .slice(0, 2)
        .map((c): CaseForService => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          cover_image_url: c.cover_image_url,
          cover_video_url: c.cover_video_url ?? null,
          cover_mux_playback_id: c.cover_mux_playback_id,
          categories: c.categories,
        })),
    [publicCases],
  );

  const casesAI = React.useMemo(
    () =>
      publicCases
        .filter((c) => c.categories.some((cat) => cat.slug && CATEGORY_SLUGS_AI.includes(cat.slug)))
        .slice(0, 3)
        .map((c): CaseForService => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          cover_image_url: c.cover_image_url,
          cover_video_url: c.cover_video_url ?? null,
          cover_mux_playback_id: c.cover_mux_playback_id,
          categories: c.categories,
        })),
    [publicCases],
  );

  const fullBleedCase = cases3d[0] ?? casesVfx[0];
  const whyTressdeCase = casesAI[0];

  const ctaCaseItems = React.useMemo(() => {
    const seen = new Set<string>();
    const out: CaseForService[] = [];
    for (const c of [...cases3d, ...casesVfx, ...casesAI]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
    }
    return out.slice(0, 12);
  }, [cases3d, casesVfx, casesAI]);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <FloatingNavbar />
      <ServicosHero />

      <ClientLogosMarquee />

      <ServiceBlock
        number="01"
        title={t("servicos3dTitle")}
        body={
          <>
            <p className="mb-4">
              {t("servicos3dBody1")}
            </p>
          </>
        }
        bestFor={t("servicos3dBestFor").split(", ")}
        deliverables={t("servicos3dDeliverables").split(", ")}
        ctaLabel={t("servicos3dCta")}
        ctaHref="/#work"
        visualType="3d"
        caseItems={cases3d}
        videoCount={3}
      />

      <VfxLeadSection />

      <ServiceBlock
        number="02"
        title={t("servicosVfxTitle")}
        subtitle={t("servicosVfxSubtitle")}
        body={
          <>
            <p className="mb-4">
              {t("servicosVfxBody1")}
            </p>
            <p className="mb-4">
              {t("servicosVfxBody2")}
            </p>
          </>
        }
        bestFor={t("servicosVfxBestFor").split(", ")}
        deliverables={t("servicosVfxDeliverables").split(", ")}
        ctaLabel={t("servicosVfxCta")}
        ctaHref="/#work"
        visualType="3d"
        caseItems={casesVfx}
        videoCount={2}
      />

      <FullBleedShowcase caseItem={fullBleedCase} />

      <ServiceBlock
        number="03"
        title={t("servicosAiTitle")}
        subtitle={t("servicosAiSubtitle")}
        body={
          <>
            <p className="mb-4">
              {t("servicosAiBody1")}
            </p>
            <p className="mb-4">
              {t("servicosAiBody2")}
            </p>
            <p className="font-medium text-foreground">
              {t("servicosAiBody3")}
            </p>
          </>
        }
        bestFor={t("servicosAiBestFor").split(", ")}
        deliverables={t("servicosAiDeliverables").split(", ")}
        ctaLabel={t("servicosAiCta")}
        ctaHref="/#work"
        visualType="ai"
        caseItems={casesAI}
        layout="image-left"
        videoCount={3}
      />

      <WhyTressdeSection caseItems={ctaCaseItems.slice(0, PILLAR_COUNT).length ? ctaCaseItems.slice(0, PILLAR_COUNT) : [whyTressdeCase]} />
      <ProcessSection />
      <ServicosCTA caseItems={ctaCaseItems} />
      <Footer />
    </main>
  );
}

export default function Servicos() {
  return (
    <ContactModalProvider>
      <CasesSectionProvider>
        <ServicosContent />
      </CasesSectionProvider>
    </ContactModalProvider>
  );
}
