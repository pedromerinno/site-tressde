import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, Globe } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { getPrimaryCompany } from "@/lib/onmx/company";
import type { SiteMeta } from "@/lib/site-meta";
import {
  getPublicCases,
  getStudioRevealSlots,
  type StudioRevealSlot,
} from "@/lib/case-builder/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import MediaLibraryDialog from "@/components/case-builder/MediaLibraryDialog";
import { Film, ImageIcon } from "lucide-react";

type PositioningMediaType = "image" | "video";

type PositioningSettingsRow = {
  id: string;
  positioning_media_type: PositioningMediaType | null;
  positioning_media_url: string | null;
  positioning_media_poster_url: string | null;
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

function looksLikeMissingColumnError(err: any) {
  // Postgres undefined_column = 42703
  return err?.code === "42703" || String(err?.message ?? "").toLowerCase().includes("column");
}

const EMPTY_STUDIO_SLOT: StudioRevealSlot = { type: "case", case_id: "", title: "" };

async function getSiteMetaSettings(): Promise<SiteMeta | null> {
  const company = await getPrimaryCompany();
  const { data, error } = await supabase
    .from("companies")
    .select("site_name,site_description,favicon_url,og_image_url,brand_color")
    .eq("id", company.id)
    .single();
  if (error) {
    if (looksLikeMissingColumnError(error)) return null;
    throw error;
  }
  return (data as SiteMeta) ?? null;
}

async function getPositioningSettings(): Promise<PositioningSettingsRow | null> {
  const company = await getPrimaryCompany();

  const { data, error } = await supabase
    .from("companies")
    .select("id,positioning_media_type,positioning_media_url,positioning_media_poster_url")
    .eq("id", company.id)
    .single();

  if (error) {
    // If columns don't exist yet, the admin UI should still load and show instructions.
    if (looksLikeMissingColumnError(error)) return null;
    throw error;
  }

  return (data as PositioningSettingsRow) ?? null;
}

async function uploadToCaseCoversBucket(companyId: string, file: File, folder: string) {
  const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, "-").toLowerCase();
  const path = `site/${companyId}/${folder}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("case-covers")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("case-covers").getPublicUrl(path);
  return toPublicObjectUrl(data.publicUrl, "case-covers");
}

export default function AdminSite() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["admin", "company"],
    queryFn: getPrimaryCompany,
    staleTime: 10 * 60 * 1000,
  });

  const siteMetaQuery = useQuery({
    queryKey: ["admin", "site", "site-meta"],
    queryFn: getSiteMetaSettings,
    staleTime: 30 * 1000,
  });

  const settingsQuery = useQuery({
    queryKey: ["admin", "site", "positioning-media"],
    queryFn: getPositioningSettings,
    staleTime: 30 * 1000,
  });

  const { data: studioRevealSlots } = useQuery({
    queryKey: ["admin", "site", "studio-reveal-slots"],
    queryFn: getStudioRevealSlots,
    staleTime: 30 * 1000,
  });

  const { data: publicCases = [] } = useQuery({
    queryKey: ["cases", "public"],
    queryFn: getPublicCases,
    staleTime: 60 * 1000,
  });

  const [type, setType] = React.useState<PositioningMediaType>("image");
  const [url, setUrl] = React.useState("");
  const [posterUrl, setPosterUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [posterUploading, setPosterUploading] = React.useState(false);

  const [siteName, setSiteName] = React.useState("");
  const [siteDescription, setSiteDescription] = React.useState("");
  const [faviconUrl, setFaviconUrl] = React.useState("");
  const [ogImageUrl, setOgImageUrl] = React.useState("");
  const [brandColor, setBrandColor] = React.useState("");
  const [faviconUploading, setFaviconUploading] = React.useState(false);
  const [ogImageUploading, setOgImageUploading] = React.useState(false);

  const [studioReveal, setStudioReveal] = React.useState<
    [StudioRevealSlot, StudioRevealSlot, StudioRevealSlot]
  >([EMPTY_STUDIO_SLOT, EMPTY_STUDIO_SLOT, EMPTY_STUDIO_SLOT]);
  const [libraryOpenForSlot, setLibraryOpenForSlot] = React.useState<0 | 1 | 2 | null>(null);

  React.useEffect(() => {
    const s = siteMetaQuery.data;
    if (!s) return;
    setSiteName(s.site_name ?? "");
    setSiteDescription(s.site_description ?? "");
    setFaviconUrl(s.favicon_url ?? "");
    setOgImageUrl(s.og_image_url ?? "");
    setBrandColor(s.brand_color ?? "");
  }, [siteMetaQuery.data]);

  React.useEffect(() => {
    const s = settingsQuery.data;
    if (!s) return;
    setType((s.positioning_media_type ?? "image") as PositioningMediaType);
    setUrl(s.positioning_media_url ?? "");
    setPosterUrl(s.positioning_media_poster_url ?? "");
  }, [settingsQuery.data]);

  React.useEffect(() => {
    if (studioRevealSlots)
      setStudioReveal([studioRevealSlots[0], studioRevealSlots[1], studioRevealSlots[2]]);
    else setStudioReveal([EMPTY_STUDIO_SLOT, EMPTY_STUDIO_SLOT, EMPTY_STUDIO_SLOT]);
  }, [studioRevealSlots]);

  const saveSiteMeta = useMutation({
    mutationFn: async () => {
      if (!company?.id) throw new Error("Empresa não encontrada.");
      const payload = {
        site_name: siteName.trim() || null,
        site_description: siteDescription.trim() || null,
        favicon_url: faviconUrl.trim() || null,
        og_image_url: ogImageUrl.trim() || null,
        brand_color: brandColor.trim() || null,
      };
      const { error } = await supabase.from("companies").update(payload).eq("id", company.id);
      if (error) {
        if (looksLikeMissingColumnError(error)) {
          throw new Error("Campos de metadados ainda não existem. Rode supabase/migrations/20260217_site_meta.sql");
        }
        throw error;
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "site", "site-meta"] });
      await qc.invalidateQueries({ queryKey: ["site-meta"] });
      toast({ title: "Atualizado", description: "Metadados do site salvos." });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.message ?? "Não foi possível salvar.", variant: "destructive" });
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!company?.id) throw new Error("Empresa não encontrada.");

      const payload = {
        positioning_media_type: type,
        positioning_media_url: url.trim() || null,
        positioning_media_poster_url: type === "video" ? posterUrl.trim() || null : null,
      };

      const { error } = await supabase.from("companies").update(payload).eq("id", company.id);
      if (error) {
        if (looksLikeMissingColumnError(error)) {
          throw new Error(
            "Campos do Positioning ainda não existem no banco. Rode o SQL de migração (vou deixar no repo em `supabase/migrations/`).",
          );
        }
        throw error;
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "site", "positioning-media"] });
      toast({ title: "Atualizado", description: "Configuração do Positioning salva com sucesso." });
    },
  });

  const isSlotEmpty = (s: StudioRevealSlot) =>
    s.type === "case" && !s.case_id;
  const isSlotValid = (s: StudioRevealSlot) =>
    s.type === "case" ? Boolean(s.case_id) : Boolean(s.url);
  const allSlotsEmpty = studioReveal.every(isSlotEmpty);
  const allSlotsValid = studioReveal.every(isSlotValid);

  const saveStudioReveal = useMutation({
    mutationFn: async (slots: [StudioRevealSlot, StudioRevealSlot, StudioRevealSlot] | null) => {
      if (!company?.id) throw new Error("Empresa não encontrada.");
      const valid = (s: StudioRevealSlot) =>
        s.type === "case" ? Boolean(s.case_id) : Boolean(s.url);
      const payload =
        slots === null
          ? { studio_reveal_slots: null }
          : slots.every(valid)
            ? { studio_reveal_slots: slots }
            : null;
      if (payload === null && slots !== null)
        throw new Error("Preencha os 3 slots (case ou mídia da biblioteca).");
      const { error } = await supabase.from("companies").update(payload).eq("id", company.id);
      if (error) {
        if (looksLikeMissingColumnError(error)) {
          throw new Error(
            "Campo studio_reveal_slots ainda não existe. Rode a migração em supabase/migrations/20260216_studio_reveal_slots.sql",
          );
        }
        throw error;
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "site", "studio-reveal-slots"] });
      await qc.invalidateQueries({ queryKey: ["studio-reveal-display"] });
      await qc.invalidateQueries({ queryKey: ["cases", "public"] });
      toast({
        title: "Atualizado",
        description: "Studio reveal salvo.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erro",
        description: err?.message ?? "Não foi possível salvar.",
        variant: "destructive",
      });
    },
  });

  async function onUploadMedia(file: File) {
    if (!company?.id) return;
    setUploading(true);
    try {
      const nextUrl = await uploadToCaseCoversBucket(
        company.id,
        file,
        type === "video" ? "positioning-video" : "positioning-image",
      );
      setUrl(nextUrl);
      toast({ title: "Upload concluído", description: "Arquivo enviado com sucesso." });
    } catch (err: any) {
      toast({
        title: "Upload falhou",
        description: err?.message ?? "Não foi possível enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function onUploadFavicon(file: File) {
    if (!company?.id) return;
    setFaviconUploading(true);
    try {
      const nextUrl = await uploadToCaseCoversBucket(company.id, file, "favicon");
      setFaviconUrl(nextUrl);
      toast({ title: "Favicon enviado", description: "Upload concluído." });
    } catch (err: any) {
      toast({ title: "Upload falhou", description: err?.message ?? "Erro ao enviar.", variant: "destructive" });
    } finally {
      setFaviconUploading(false);
    }
  }

  async function onUploadOgImage(file: File) {
    if (!company?.id) return;
    setOgImageUploading(true);
    try {
      const nextUrl = await uploadToCaseCoversBucket(company.id, file, "og-image");
      setOgImageUrl(nextUrl);
      toast({ title: "Imagem enviada", description: "Use a URL absoluta para redes sociais." });
    } catch (err: any) {
      toast({ title: "Upload falhou", description: err?.message ?? "Erro ao enviar.", variant: "destructive" });
    } finally {
      setOgImageUploading(false);
    }
  }

  async function onUploadPoster(file: File) {
    if (!company?.id) return;
    setPosterUploading(true);
    try {
      const nextUrl = await uploadToCaseCoversBucket(company.id, file, "positioning-poster");
      setPosterUrl(nextUrl);
      toast({ title: "Poster atualizado", description: "Imagem enviada com sucesso." });
    } catch (err: any) {
      toast({
        title: "Upload falhou",
        description: err?.message ?? "Não foi possível enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setPosterUploading(false);
    }
  }

  const siteMetaMissingSchema = siteMetaQuery.data === null && !siteMetaQuery.isLoading && !siteMetaQuery.isError;
  const missingSchema = settingsQuery.data === null && !settingsQuery.isLoading && !settingsQuery.isError;
  const acceptMedia =
    type === "video"
      ? "video/mp4,video/webm,video/quicktime"
      : "image/png,image/jpeg,image/webp";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configurações do site e preferências gerais (single-company).
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-7">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="font-medium">Metadados do Site</div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Título, descrição, favicon e imagem para redes sociais (Open Graph, Twitter).
            </p>
          </div>
        </div>

        {siteMetaMissingSchema ? (
          <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground mb-6">
            Rode a migração <span className="font-mono font-medium">supabase/migrations/20260217_site_meta.sql</span> antes de editar.
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do site</label>
              <Input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Ex: TRESSDE®"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                placeholder="Breve descrição do site (SEO, redes sociais)"
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Favicon</label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/png,image/svg+xml,image/x-icon"
                    disabled={faviconUploading || !company?.id}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      e.target.value = "";
                      await onUploadFavicon(f);
                    }}
                  />
                </div>
                <Input
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="URL do favicon"
                  className="mt-1"
                />
                {faviconUrl ? (
                  <div className="flex items-center gap-2 mt-1">
                    <img src={faviconUrl} alt="" className="h-8 w-8 object-contain border rounded" />
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Imagem redes sociais (og:image)</label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={ogImageUploading || !company?.id}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      e.target.value = "";
                      await onUploadOgImage(f);
                    }}
                  />
                </div>
                <Input
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  placeholder="URL absoluta (ex: https://...)"
                  className="mt-1"
                />
                {ogImageUrl ? (
                  <div className="mt-1">
                    <img src={ogImageUrl} alt="" className="max-h-20 w-auto object-contain border rounded" />
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor da empresa</label>
                <p className="text-xs text-muted-foreground">
                  Cor principal do site (botões, footer, destaques). Deixe em branco para usar o azul padrão.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor && /^#[0-9A-Fa-f]{6}$/.test(brandColor) ? brandColor : "#0028F0"}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-input bg-background p-1"
                    aria-label="Selecionar cor"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#0028F0"
                    className="font-mono w-28"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => saveSiteMeta.mutate()} disabled={saveSiteMeta.isPending}>
                {saveSiteMeta.isPending ? "Salvando…" : "Salvar metadados"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="font-medium">Positioning · Background</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha uma imagem ou vídeo para o background dessa seção.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Bucket: <span className="font-medium">case-covers</span>
          </div>
        </div>

        {missingSchema ? (
          <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
            O banco ainda não tem os campos necessários. Rode a migração em{" "}
            <span className="font-medium">`supabase/migrations/20260213_positioning_media.sql`</span>.
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setType("image")}
                aria-pressed={type === "image"}
                className={
                  type === "image"
                    ? "px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                    : "px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                }
              >
                Imagem
              </button>
              <button
                type="button"
                onClick={() => setType("video")}
                aria-pressed={type === "video"}
                className={
                  type === "video"
                    ? "px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                    : "px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                }
              >
                Vídeo
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Arquivo (upload)</div>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <Input
                  type="file"
                  accept={acceptMedia}
                  disabled={uploading || companyLoading || !company?.id}
                  onChange={async (e) => {
                    const input = e.currentTarget;
                    const file = input.files?.[0];
                    if (!file) return;
                    input.value = "";
                    await onUploadMedia(file);
                  }}
                />
                <div className="text-xs text-muted-foreground md:w-[180px]">
                  {uploading ? "Enviando…" : "Upload automático"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Você também pode colar uma URL abaixo, se preferir.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">URL</div>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={type === "video" ? "https://… .mp4" : "https://… .jpg"}
              />
            </div>

            {type === "video" ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">Poster (opcional)</div>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={posterUploading || companyLoading || !company?.id}
                    onChange={async (e) => {
                      const input = e.currentTarget;
                      const file = input.files?.[0];
                      if (!file) return;
                      input.value = "";
                      await onUploadPoster(file);
                    }}
                  />
                  <div className="text-xs text-muted-foreground md:w-[180px]">
                    {posterUploading ? "Enviando…" : "Upload automático"}
                  </div>
                </div>

                <Input
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="URL do poster (opcional)"
                />
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUrl("");
                  setPosterUrl("");
                }}
              >
                Limpar
              </Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Preview</div>
            <div className="rounded-2xl border border-border overflow-hidden bg-muted">
              {type === "video" && url ? (
                <video
                  key={url}
                  className="w-full aspect-[16/10] object-cover"
                  src={url}
                  poster={posterUrl || undefined}
                  muted
                  playsInline
                  loop
                  controls
                />
              ) : url ? (
                <img src={url} alt="" className="w-full aspect-[16/10] object-cover" />
              ) : (
                <div className="w-full aspect-[16/10] grid place-items-center text-sm text-muted-foreground">
                  Nenhuma mídia selecionada.
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Dica: vídeos devem ser <span className="font-medium">muted + loop</span> para funcionar como background.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="font-medium">Studio · Reveal</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Central, esquerda e direita: escolha um case ou mídia da biblioteca (imagem/vídeo) para cada slot.
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {([0, 1, 2] as const).map((i) => {
            const slot = studioReveal[i];
            const labels = ["Central (hero)", "Esquerda", "Direita"];
            const slotTitle = slot.type === "case" ? slot.title ?? "" : slot.title ?? "";
            return (
              <div key={i} className="space-y-2">
                <label className="text-sm font-medium">{labels[i]}</label>
                <div className="space-y-1.5">
                  <Input
                    placeholder="Título (opcional)"
                    value={slotTitle}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStudioReveal((prev) => {
                        const next = [...prev] as [StudioRevealSlot, StudioRevealSlot, StudioRevealSlot];
                        const s = next[i];
                        next[i] = s.type === "case" ? { ...s, title: v } : { ...s, title: v };
                        return next;
                      });
                    }}
                    className="text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={slot.type === "case" ? "case" : "media"}
                    onChange={(e) => {
                      const mode = e.target.value as "case" | "media";
                      const t = slot.title ?? "";
                      setStudioReveal((prev) => {
                        const next = [...prev] as [StudioRevealSlot, StudioRevealSlot, StudioRevealSlot];
                        next[i] = mode === "case" ? { type: "case", case_id: "", title: t } : { type: "media", media_type: "image", url: "", title: t };
                        return next;
                      });
                    }}
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="case">Case</option>
                    <option value="media">Biblioteca</option>
                  </select>
                </div>
                {slot.type === "case" ? (
                  <select
                    value={slot.case_id}
                    onChange={(e) => {
                      setStudioReveal((prev) => {
                        const next = [...prev] as [StudioRevealSlot, StudioRevealSlot, StudioRevealSlot];
                        const s = next[i];
                        const t = s.type === "case" ? s.title ?? "" : "";
                        next[i] = { type: "case", case_id: e.target.value, title: t };
                        return next;
                      });
                    }}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">— Selecione</option>
                    {publicCases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setLibraryOpenForSlot(i)}
                    >
                      {slot.url ? (
                        <span className="flex items-center gap-2">
                          {slot.media_type === "video" ? (
                            <Film className="h-4 w-4" />
                          ) : (
                            <ImageIcon className="h-4 w-4" />
                          )}
                          {slot.media_type === "video" ? "Vídeo" : "Imagem"} selecionada
                        </span>
                      ) : (
                        "Escolher da biblioteca"
                      )}
                    </Button>
                    {slot.url ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={() => {
                          setStudioReveal((prev) => {
                            const next = [...prev] as [StudioRevealSlot, StudioRevealSlot, StudioRevealSlot];
                            const s = next[i];
                        next[i] = { type: "media", media_type: "image", url: "", title: s.type === "media" ? s.title ?? "" : "" };
                            return next;
                          });
                        }}
                      >
                        Limpar
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStudioReveal([EMPTY_STUDIO_SLOT, EMPTY_STUDIO_SLOT, EMPTY_STUDIO_SLOT]);
              saveStudioReveal.mutate(null);
            }}
            disabled={saveStudioReveal.isPending}
          >
            Usar ordem padrão
          </Button>
          <Button
            type="button"
            onClick={() => saveStudioReveal.mutate(studioReveal)}
            disabled={saveStudioReveal.isPending || !allSlotsValid}
          >
            {saveStudioReveal.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>

      <MediaLibraryDialog
        open={libraryOpenForSlot !== null}
        onOpenChange={(open) => !open && setLibraryOpenForSlot(null)}
        accept="all"
        onSelect={(selection) => {
          if (libraryOpenForSlot === null) return;
          const mediaType = selection.muxPlaybackId ? "video" : "image";
          setStudioReveal((prev) => {
            const next = [...prev] as [StudioRevealSlot, StudioRevealSlot, StudioRevealSlot];
                        const s = next[libraryOpenForSlot];
                        const t = s.type === "media" ? s.title ?? "" : "";
                        next[libraryOpenForSlot] = {
              type: "media",
              media_type: mediaType,
              url: selection.url,
              mux_playback_id: selection.muxPlaybackId,
              title: t,
            };
            return next;
          });
          setLibraryOpenForSlot(null);
        }}
      />

      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <UploadCloud className="h-4 w-4" />
        Os uploads usam a mesma infraestrutura de Storage já configurada para capas de cases.
      </div>
    </section>
  );
}

