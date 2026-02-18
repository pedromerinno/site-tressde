import * as React from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import MuxPlayer from "@mux/mux-player-react";
import {
  getStudioRevealDisplayItems,
  toPublicObjectUrl,
  type StudioRevealDisplayItem,
} from "@/lib/case-builder/queries";
import { OptimizedImage } from "@/components/ui/optimized-image";
import PortfolioHero from "@/components/PortfolioHero";
import { useTranslation } from "@/i18n";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_VH = 220;

function StudioRevealEmptyMessage() {
  const { t } = useTranslation();
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="px-4 md:px-6 text-center">
        <p className="text-muted-foreground">
          {t("studioRevealConfigure")}
        </p>
      </div>
    </section>
  );
}

export default function StudioMediaReveal() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const heroRef = React.useRef<HTMLDivElement>(null);
  const centerRef = React.useRef<HTMLDivElement>(null);
  const leftRef = React.useRef<HTMLDivElement>(null);
  const rightRef = React.useRef<HTMLDivElement>(null);
  const leftLabelRef = React.useRef<HTMLParagraphElement>(null);
  const centerLabelRef = React.useRef<HTMLParagraphElement>(null);
  const rightLabelRef = React.useRef<HTMLParagraphElement>(null);

  const { data: displayItems, isLoading: displayLoading } = useQuery({
    queryKey: ["studio-reveal-display"],
    queryFn: getStudioRevealDisplayItems,
    staleTime: 2 * 60 * 1000,
  });

  const featured: StudioRevealDisplayItem | undefined = displayItems?.[0];
  const leftCase: StudioRevealDisplayItem | undefined = displayItems?.[1];
  const rightCase: StudioRevealDisplayItem | undefined = displayItems?.[2];

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const hero = heroRef.current;
    const center = centerRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const leftLabel = leftLabelRef.current;
    const centerLabel = centerLabelRef.current;
    const rightLabel = rightLabelRef.current;

    if (!section || !viewport || !hero || !center || !featured) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Initial clip: big cinematic rectangle starting below the header
      const computeInitialClip = () => {
        const vW = viewport.clientWidth;
        const vH = viewport.clientHeight;
        const headerH = headerRef.current?.offsetHeight ?? vH * 0.08;
        const top = headerH + 8;
        const bottom = vH * 0.12;
        const side = vW * 0.025;
        return `inset(${top}px ${side}px ${bottom}px ${side}px round 12px)`;
      };

      // Final clip: matches center grid cell
      const computeFinalClip = () => {
        const hR = hero.getBoundingClientRect();
        const cR = center.getBoundingClientRect();
        return `inset(${cR.top - hR.top}px ${hR.right - cR.right}px ${hR.bottom - cR.bottom}px ${cR.left - hR.left}px round 12px)`;
      };

      gsap.set(hero, { autoAlpha: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 3.5,
          invalidateOnRefresh: true,
        },
      });

      // Hero: cinematic wide → clip to center cell (overshoot ida e volta)
      tl.fromTo(
        hero,
        { clipPath: computeInitialClip() },
        { clipPath: computeFinalClip(), duration: 0.85, ease: "back.inOut(1.4)" },
        0,
      );

      // Left card — scale + opacidade com overshoot
      if (left) {
        tl.fromTo(
          left,
          { autoAlpha: 0, scale: 0.82, xPercent: -6, transformOrigin: "center center" },
          { autoAlpha: 1, scale: 1, xPercent: 0, duration: 0.9, ease: "back.out(1.4)", transformOrigin: "center center" },
          0.1,
        );
      }

      // Right card — scale + opacidade com overshoot
      if (right) {
        tl.fromTo(
          right,
          { autoAlpha: 0, scale: 0.82, xPercent: 6, transformOrigin: "center center" },
          { autoAlpha: 1, scale: 1, xPercent: 0, duration: 0.9, ease: "back.out(1.4)", transformOrigin: "center center" },
          0.1,
        );
      }

      // Labels fade in
      [leftLabel, centerLabel, rightLabel].forEach((el) => {
        if (el) {
          tl.fromTo(
            el,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.9, ease: "sine.out" },
            0.1,
          );
        }
      });
    });

    return () => mm.revert();
  }, [displayItems, featured?.id]);

  if (displayLoading) {
    return (
      <section className="relative bg-background" style={{ height: `${SCROLL_VH}vh` }}>
        <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">
          {/* Header */}
          <div className="relative z-40 shrink-0">
            <PortfolioHero />
          </div>

          {/* Spacer */}
          <div className="min-h-0 flex-1 max-h-[28vh]" aria-hidden />

          {/* Cards skeleton */}
          <div className="flex shrink-0 items-center justify-center px-2 pb-8 md:px-4 pt-2">
            <div className="w-full max-w-[min(98vw,2200px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col items-start gap-2">
                    <div className="aspect-square w-full rounded-xl bg-muted animate-pulse" />
                    <div
                      className="h-4 rounded-md bg-muted/60 animate-pulse"
                      style={{ width: [72, 96, 56][i] }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!displayItems) {
    return (
      <StudioRevealEmptyMessage />
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-background" style={{ height: `${SCROLL_VH}vh` }}>
      <div ref={viewportRef} className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">
        {/* Header TRESSDE® — fica acima do overlay z-30 */}
        <div ref={headerRef} className="relative z-40 shrink-0">
          <PortfolioHero />
        </div>

        {/* Spacer — altura limitada para o grid ficar mais alto na viewport */}
        <div className="min-h-0 flex-1 max-h-[28vh]" aria-hidden />

        {/* Grid — abaixo do header */}
        <div className="flex shrink-0 items-center justify-center px-2 pb-8 md:px-4 pt-2">
          <div className="w-full max-w-[min(98vw,2200px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
              <div className="relative z-10 flex flex-col items-start gap-2">
                <div ref={leftRef} className="aspect-square w-full overflow-hidden rounded-xl">
                  {leftCase ? (
                    leftCase.slug ? (
                      <CaseLink item={leftCase}>
                        <MediaBlock item={leftCase} />
                      </CaseLink>
                    ) : (
                      <MediaBlock item={leftCase} />
                    )
                  ) : (
                    <div className="h-full w-full bg-muted rounded-xl" />
                  )}
                </div>
                <p ref={leftLabelRef} className="text-sm font-semibold text-foreground">
                  {leftCase?.categories?.[0]?.name ?? leftCase?.title ?? ""}
                </p>
              </div>

              <div className="relative z-20 flex flex-col items-start gap-2">
                <div
                  ref={centerRef}
                  className="aspect-square w-full overflow-hidden rounded-xl"
                  aria-hidden
                />
                <p ref={centerLabelRef} className="text-sm font-semibold text-foreground">
                  {featured?.categories?.[0]?.name ?? featured?.title ?? ""}
                </p>
              </div>

              <div className="relative z-10 flex flex-col items-start gap-2">
                <div ref={rightRef} className="aspect-square w-full overflow-hidden rounded-xl">
                  {rightCase ? (
                    rightCase.slug ? (
                      <CaseLink item={rightCase}>
                        <MediaBlock item={rightCase} />
                      </CaseLink>
                    ) : (
                      <MediaBlock item={rightCase} />
                    )
                  ) : (
                    <div className="h-full w-full bg-muted rounded-xl" />
                  )}
                </div>
                <p ref={rightLabelRef} className="text-sm font-semibold text-foreground">
                  {rightCase?.categories?.[0]?.name ?? rightCase?.title ?? ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero — overlay preenche viewport, clip-path molda de wide inicial ao quadrado final */}
        <div
          ref={heroRef}
          className="absolute inset-0 z-30 pointer-events-none invisible opacity-0 hidden md:block"
        >
          <MediaBlock item={featured} />
        </div>
      </div>
    </section>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function CaseLink({
  item,
  children,
}: {
  item: StudioRevealDisplayItem & { slug: string };
  children: React.ReactNode;
}) {
  return (
    <Link
      to={`/cases/${item.slug}`}
      className="relative block h-full w-full overflow-hidden rounded-xl cursor-case focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* pointer-events-none kills MuxPlayer shadow DOM event capture */}
      <div className="pointer-events-none">{children}</div>
      {/* Transparent overlay catches all mouse events + sets custom cursor */}
      <div className="absolute inset-0 z-[999] cursor-case" />
    </Link>
  );
}

function MediaBlock({ item }: { item: StudioRevealDisplayItem }) {
  const posterUrl =
    item.cover_poster_url ??
    (item.cover_image_url
      ? toPublicObjectUrl(item.cover_image_url, "case-covers")
      : item.cover_mux_playback_id
        ? `https://image.mux.com/${item.cover_mux_playback_id}/thumbnail.jpg?width=960&fit_mode=smartcrop&time=0`
        : null);

  if (item.cover_mux_playback_id) {
    return <LazyMuxVideo playbackId={item.cover_mux_playback_id} poster={posterUrl} />;
  }
  if (item.cover_video_url) {
    return <LazyNativeVideo src={item.cover_video_url} poster={posterUrl} />;
  }
  const imageSrc =
    item.cover_image_url
      ? toPublicObjectUrl(item.cover_image_url, "case-covers")
      : posterUrl;
  if (imageSrc) {
    return (
      <OptimizedImage
        src={imageSrc}
        alt={item.title}
        preset="card"
        widths={[800, 1000, 1200]}
        sizes="(max-width: 768px) 100vw, 33vw"
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="h-full w-full bg-gradient-to-br from-muted to-muted/60" />
  );
}

/** Observes when the element enters the viewport (with margin) and flips `isVisible` once. */
function useInView(rootMargin = "200px") {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, isVisible };
}

function LazyMuxVideo({ playbackId, poster }: { playbackId: string; poster: string | null }) {
  const { ref, isVisible } = useInView();

  return (
    <div ref={ref} className="mux-no-controls h-full w-full">
      {isVisible ? (
        <MuxPlayer
          playbackId={playbackId}
          poster={poster ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay
          className="h-full w-full object-cover"
        />
      ) : poster ? (
        <img src={poster} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-muted/40" />
      )}
    </div>
  );
}

function LazyNativeVideo({ src, poster }: { src: string; poster: string | null }) {
  const { ref, isVisible } = useInView();

  return (
    <div ref={ref} className="h-full w-full">
      {isVisible ? (
        <video
          src={src}
          poster={poster ?? undefined}
          muted
          loop
          playsInline
          autoPlay
          className="h-full w-full object-cover"
        />
      ) : poster ? (
        <img src={poster} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-muted/40" />
      )}
    </div>
  );
}
