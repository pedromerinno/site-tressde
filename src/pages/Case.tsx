import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { getPrimaryCompany } from "@/lib/core/company";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { ContactModalProvider, useContactModal, ContactPopover } from "@/contexts/ContactModalContext";
import { getPublicCaseBlocks } from "@/lib/case-builder/queries";
import type { VideoContent } from "@/lib/case-builder/types";
import { normalizeContainerContent } from "@/lib/case-builder/types";
import CaseBlocksRenderer from "@/components/case-blocks-public/CaseBlocksRenderer";
import PublicVideoBlock from "@/components/case-blocks-public/PublicVideoBlock";
import { useTranslation } from "@/i18n";

type CaseCategory = {
  id: string;
  name: string;
  slug: string;
};

type CaseDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  year: number | null;
  cover_image_url: string | null;
  page_background: string | null;
  services: string[] | null;
  client_name: string | null;
  categories: CaseCategory[];
  container_padding: number;
  container_radius: number;
  container_gap: number;
};

type CaseMediaItem = {
  id: string;
  url: string;
  type: string;
  title: string | null;
  alt_text: string | null;
  sort_order: number | null;
};

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  cover?: boolean;
};

type GalleryVideo = {
  id: string;
  content: VideoContent;
};

type GalleryItem = GalleryImage | GalleryVideo;

type ContainerMediaGrid = {
  id: string;
  columns: number;
  cols: GalleryItem[][];
};

function toPublicObjectUrl(url: string, bucketId: string) {
  if (url.includes(`/storage/v1/object/public/${bucketId}/`)) return url;
  if (url.includes(`/storage/v1/object/${bucketId}/`)) {
    return url.replace(
      `/storage/v1/object/${bucketId}/`,
      `/storage/v1/object/public/${bucketId}/`,
    );
  }
  return url;
}

function detectVideoProvider(url: string): VideoContent["provider"] {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/vimeo\.com/i.test(url)) return "vimeo";
  return "file";
}

function parseMuxPlaybackId(url: string): string | null {
  const m = url.match(/stream\.mux\.com\/([^/?#]+)\.m3u8/i);
  return m?.[1] ?? null;
}

async function getCaseBySlug(slug: string): Promise<CaseDetail> {
  const company = await getPrimaryCompany();

  const { data, error } = await supabase
    .from("cases")
    .select(
      "id,title,slug,summary,year,cover_image_url,page_background,services,status,published_at,container_padding,container_radius,container_gap,clients(name),case_category_cases(case_categories(id,name,slug))",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("owner_company_id", company.id)
    .not("published_at", "is", null)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Case not found."); // translated in UI

  const row = data as unknown as {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    year: number | null;
    cover_image_url: string | null;
    page_background: string | null;
    services: string[] | null;
    container_padding: number | null;
    container_radius: number | null;
    container_gap: number | null;
    clients: { name: string } | null;
    case_category_cases: Array<{ case_categories: CaseCategory | null }> | null;
  };

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    year: row.year,
    cover_image_url: row.cover_image_url,
    page_background: row.page_background ?? null,
    services: row.services,
    client_name: row.clients?.name ?? null,
    categories:
      row.case_category_cases
        ?.map((cc) => cc.case_categories)
        .filter(Boolean) as CaseCategory[] | undefined ?? [],
    container_padding: row.container_padding ?? 0,
    container_radius: row.container_radius ?? 0,
    container_gap: row.container_gap ?? 0,
  };
}

async function getCaseMedia(caseId: string): Promise<CaseMediaItem[]> {
  const { data, error } = await supabase
    .from("case_media")
    .select("id,url,type,title,alt_text,sort_order")
    .eq("case_id", caseId)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as CaseMediaItem[]) ?? [];
}

const FROM_CASE_PAGE_KEY = "tressde_from_case_page";

const caseCtaClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-4 rounded-full shadow-lg shadow-black/10 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export default function CasePage() {
  return (
    <ContactModalProvider>
      <CasePageContent />
    </ContactModalProvider>
  );
}

function CasePageContent() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const contactModal = useContactModal();
  const [dockMenu, setDockMenu] = React.useState(false);
  const dockSentinelRef = React.useRef<HTMLDivElement | null>(null);
  const [infoOpen, setInfoOpen] = React.useState(false);
  const infoButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const infoMenuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    try {
      if (typeof sessionStorage !== "undefined") sessionStorage.setItem(FROM_CASE_PAGE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const caseQuery = useQuery({
    queryKey: ["cases", "detail", slug],
    queryFn: () => getCaseBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const mediaQuery = useQuery({
    queryKey: ["cases", caseQuery.data?.id, "media"],
    queryFn: () => getCaseMedia(caseQuery.data!.id),
    enabled: !!caseQuery.data?.id,
    staleTime: 5 * 60 * 1000,
  });

  const blocksQuery = useQuery({
    queryKey: ["cases", caseQuery.data?.id, "blocks"],
    queryFn: () => getPublicCaseBlocks(caseQuery.data!.id),
    enabled: !!caseQuery.data?.id,
    staleTime: 5 * 60 * 1000,
  });

  const containerGrids = React.useMemo<ContainerMediaGrid[]>(() => {
    const blocks = blocksQuery.data ?? [];
    const out: ContainerMediaGrid[] = [];

    for (const block of blocks) {
      if (block.type !== "container") continue;
      const c = normalizeContainerContent(block.content as any);

      const cols = c.slots.map((items, colIdx) => {
        const outItems: GalleryItem[] = [];
        items.forEach((item, itemIdx) => {
          if (!item) return;
          if (item.type === "image") {
            const url = String((item as any)?.content?.url ?? "").trim();
            if (!url) return;
            const alt = String((item as any)?.content?.alt ?? "").trim();
            const cover = Boolean((item as any)?.content?.cover);
            outItems.push({
              id: `${block.id}-${colIdx}-${itemIdx}`,
              url,
              alt,
              cover,
            });
            return;
          }
          if (item.type === "video") {
            const content = (item as any)?.content as VideoContent | undefined;
            if (!content) return;
            const hasMux = content.provider === "mux" && Boolean(content.muxPlaybackId);
            const hasUrl = Boolean(String(content.url ?? "").trim());
            if (!hasMux && !hasUrl) return;
            outItems.push({
              id: `${block.id}-${colIdx}-${itemIdx}`,
              content,
            });
          }
        });
        return outItems;
      });

      const hasAny = cols.some((c) => c.length > 0);
      if (!hasAny) continue;

      out.push({ id: block.id, columns: c.columns, cols });
    }

    return out;
  }, [blocksQuery.data]);

  const fallbackMedia = React.useMemo<GalleryItem[]>(() => {
    const media = mediaQuery.data ?? [];
    return media
      .filter((m) => Boolean(String(m.url ?? "").trim()))
      .map((m) => {
        if (m.type === "video") {
          const muxPlaybackId = parseMuxPlaybackId(m.url);
          const provider: VideoContent["provider"] = muxPlaybackId
            ? "mux"
            : detectVideoProvider(m.url);

          const content: VideoContent = {
            url: m.url,
            provider,
            aspect: "16/9",
            muxPlaybackId: muxPlaybackId ?? undefined,
            controls: true,
            autoplay: false,
            loop: false,
          };

          return { id: m.id, content } satisfies GalleryVideo;
        }

        return {
          id: m.id,
          url: m.url,
          alt: m.alt_text ?? m.title ?? "",
        } satisfies GalleryImage;
      });
  }, [mediaQuery.data]);

  const hasContainerLayout = containerGrids.length > 0;
  const hasAnyMedia = hasContainerLayout || fallbackMedia.length > 0;

  React.useEffect(() => {
    if (!infoOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setInfoOpen(false);
    }

    function onPointerDown(e: MouseEvent | PointerEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (infoMenuRef.current?.contains(target)) return;
      if (infoButtonRef.current?.contains(target)) return;
      setInfoOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [infoOpen]);

  React.useEffect(() => {
    const el = dockSentinelRef.current;
    if (!el) return;

    // When the sentinel is visible near the bottom, dock the menu so it
    // stops before the footer (instead of overlapping it).
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setDockMenu(entry?.isIntersecting ?? false);
      },
      {
        root: null,
        threshold: 0,
        // account for menu height + bottom offset
        rootMargin: "0px 0px -96px 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerGrids.length, fallbackMedia.length, caseQuery.data?.id]);

  return (
    <main
      className="min-h-screen text-foreground"
      style={{
        backgroundColor:
          !caseQuery.isLoading && caseQuery.data?.page_background
            ? caseQuery.data.page_background
            : "hsl(var(--background))",
      }}
    >
      <section className="p-0">
        {/* Top-left dropdown */}
        <div className="fixed top-4 left-4 z-50">
          <div className="relative">
            <button
              ref={infoButtonRef}
              type="button"
              onClick={() => setInfoOpen((v) => !v)}
              className={[
                "h-11 w-11 rounded-full",
                "bg-black/40 text-white",
                "backdrop-blur-xl",
                "ring-1 ring-white/15",
                "shadow-lg shadow-black/20",
                "grid place-items-center",
                "transition-colors",
                "hover:bg-black/55",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              ].join(" ")}
              aria-label={t("caseOpenInfo")}
              aria-expanded={infoOpen}
            >
              <Plus
                className={[
                  "h-5 w-5 transition-transform",
                  infoOpen ? "rotate-45" : "rotate-0",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>

            {infoOpen ? (
              <div
                ref={infoMenuRef}
                role="dialog"
                aria-label={t("caseInfoDialogLabel")}
                className={[
                  "absolute left-0 mt-3 w-[min(380px,calc(100vw-2rem))]",
                  "rounded-2xl",
                  "bg-black/70 text-white",
                  "backdrop-blur-md",
                  "ring-1 ring-white/15",
                  "shadow-xl shadow-black/30",
                  "p-4",
                ].join(" ")}
              >
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-[11px] text-white/60">{t("caseLabelClient")}</div>
                    <div className="font-medium">
                      {caseQuery.data?.client_name ?? "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-white/60">{t("caseLabelProject")}</div>
                    <div className="font-medium">
                      {caseQuery.data?.title ?? "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-white/60">{t("caseLabelDescription")}</div>
                    <div className="text-white/90 leading-relaxed line-clamp-4">
                      {caseQuery.data?.summary ?? "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-white/60">{t("caseLabelYear")}</div>
                      <div className="font-medium tabular-nums">
                        {caseQuery.data?.year ? String(caseQuery.data.year) : "—"}
                      </div>
                    </div>
                    <div className="text-[11px] text-white/50">{t("caseEscToClose")}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative w-full pb-28">
          {caseQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 md:h-80 bg-muted animate-pulse" />
              ))}
            </div>
          ) : caseQuery.isError || !caseQuery.data ? (
            <div className="border border-border bg-card p-8 text-sm text-muted-foreground">
              {t("caseNotFound")}
            </div>
          ) : !hasAnyMedia ? (
            <div className="border border-border bg-card p-8 text-sm text-muted-foreground">
              {t("caseNoMedia")}
            </div>
          ) : (
            hasContainerLayout ? (
              <CaseBlocksRenderer
                blocks={blocksQuery.data ?? []}
                className="[&_img]:block [&_video]:block [&_mux-player]:block"
                layout={{
                  containerPadding: caseQuery.data.container_padding,
                  containerRadius: caseQuery.data.container_radius,
                  containerGap: caseQuery.data.container_gap,
                }}
              />
            ) : (
              <div className="space-y-4 [&_img]:block [&_video]:block [&_mux-player]:block">
                {fallbackMedia.map((item) =>
                  "url" in item ? (
                    <OptimizedImage
                      key={item.id}
                      src={item.url}
                      alt={item.alt}
                      preset="gallery"
                      widths={[640, 960, 1280, 1920]}
                      sizes="100vw"
                      className="w-full h-auto"
                    />
                  ) : (
                    <div key={item.id}>
                      <PublicVideoBlock content={item.content} />
                    </div>
                  ),
                )}
              </div>
            )
          )}

          {/* Dock sentinel (end of case content) */}
          <div ref={dockSentinelRef} className="h-1" />

          {/* Floating menu (fixed, docks at end) */}
          <div
            className={[
              dockMenu
                ? "absolute bottom-4 left-1/2 -translate-x-1/2"
                : "fixed bottom-4 left-1/2 -translate-x-1/2",
              "z-50 w-[min(520px,calc(100vw-2rem))] px-0 pointer-events-none",
            ].join(" ")}
          >
            <div className="pointer-events-auto flex items-center justify-center gap-2">
              <div className="rounded-full bg-background/80 backdrop-blur-md ring-1 ring-border/70 shadow-lg shadow-black/10 shrink-0">
                <Button
                  asChild
                  variant="ghost"
                  className="h-12 px-4 rounded-full hover:bg-black/[0.04]"
                >
                  <Link to="/#cases" aria-label={t("caseBackAria")}>
                    <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                    <span className="text-sm font-medium">{t("caseBack")}</span>
                  </Link>
                </Button>
              </div>

              <div className="min-w-0 max-w-[240px] sm:max-w-[280px] rounded-full bg-background/80 backdrop-blur-md ring-1 ring-border/70 shadow-lg shadow-black/10 shrink">
                <div className="h-12 px-4 flex items-center justify-center">
                  <span className="text-sm font-medium truncate text-center">
                    {caseQuery.data?.title ?? ""}
                  </span>
                </div>
              </div>

              {contactModal ? (
                <ContactPopover>
                  <button type="button" className={`${caseCtaClass} shrink-0`}>
                    {t("caseTalkToUs")}
                  </button>
                </ContactPopover>
              ) : (
                <Button asChild className="h-12 px-4 rounded-full shadow-lg shadow-black/10 shrink-0">
                  <Link to="/#contato">{t("caseTalkToUs")}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

