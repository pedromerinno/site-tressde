import { supabase } from "@/lib/supabase/client";
import { getPrimaryCompany } from "@/lib/onmx/company";
import type { CaseBlock, DraftBlock } from "./types";

// ── Shared helpers (moved from AdminCases) ──────────────────────────

export type ClientOption = { id: string; name: string };
export type CategoryOption = { id: string; name: string };

export function toPublicObjectUrl(url: string, bucketId: string) {
  if (url.includes(`/storage/v1/object/public/${bucketId}/`)) return url;
  if (url.includes(`/storage/v1/object/${bucketId}/`)) {
    return url.replace(
      `/storage/v1/object/${bucketId}/`,
      `/storage/v1/object/public/${bucketId}/`,
    );
  }
  return url;
}

export async function getClients(): Promise<ClientOption[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("id,name")
    .order("name");
  if (error) throw error;
  return (data as ClientOption[]) ?? [];
}

export async function getPublicCaseCategories(): Promise<CategoryOption[]> {
  const company = await getPrimaryCompany();
  return getCategoriesForCompany(company.id);
}

export async function getCategoriesForCompany(
  companyId: string,
): Promise<CategoryOption[]> {
  const { data, error } = await supabase
    .from("case_category_companies")
    .select("case_categories(id,name)")
    .eq("company_id", companyId);
  if (error) throw error;
  const cats = (data as any[])
    ?.map((r) => r.case_categories)
    .filter(Boolean) as CategoryOption[] | undefined;
  const uniq = new Map<string, CategoryOption>();
  (cats ?? []).forEach((c) => uniq.set(c.id, c));
  return Array.from(uniq.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function uploadCover(
  caseId: string,
  file: File,
): Promise<string> {
  const safeName = file.name
    .replace(/[^a-z0-9.\-_]/gi, "-")
    .toLowerCase();
  const path = `covers/${caseId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("case-covers")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    throw new Error(
      uploadError.message.includes("row-level security") ||
        uploadError.message.includes("permission")
        ? "Permissão insuficiente no Storage para enviar arquivos no bucket case-covers."
        : uploadError.message,
    );
  }

  const { data } = supabase.storage.from("case-covers").getPublicUrl(path);
  const publicUrl = toPublicObjectUrl(data.publicUrl, "case-covers");

  const { data: updated, error: updateError } = await supabase
    .from("cases")
    .update({ cover_image_url: publicUrl })
    .eq("id", caseId)
    .select("cover_image_url")
    .single();

  if (updateError) {
    throw new Error(
      updateError.message.includes("row-level security") ||
        updateError.message.includes("permission")
        ? "Permissão insuficiente para salvar a capa no banco (tabela cases)."
        : updateError.message,
    );
  }

  if (!updated?.cover_image_url) {
    throw new Error(
      "Não foi possível salvar a capa no case (update não retornou cover_image_url).",
    );
  }

  return publicUrl;
}

// ── Case Blocks ─────────────────────────────────────────────────────

export async function getCaseBlocks(caseId: string): Promise<CaseBlock[]> {
  const { data, error } = await supabase
    .from("case_blocks")
    .select("*")
    .eq("case_id", caseId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as CaseBlock[]) ?? [];
}

export async function getPublicCaseBlocks(
  caseId: string,
): Promise<CaseBlock[]> {
  return getCaseBlocks(caseId);
}

/** Case detail by ID (any status), for admin preview. */
export type CaseDetailPreview = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  year: number | null;
  cover_image_url: string | null;
  page_background: string | null;
  services: string[] | null;
  client_name: string | null;
  categories: Array<{ id: string; name: string; slug?: string }>;
};

export type CaseMediaItem = {
  id: string;
  url: string;
  type: string;
  title: string | null;
  alt_text: string | null;
  sort_order: number | null;
};

export async function getCaseMedia(caseId: string): Promise<CaseMediaItem[]> {
  const { data, error } = await supabase
    .from("case_media")
    .select("id,url,type,title,alt_text,sort_order")
    .eq("case_id", caseId)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as CaseMediaItem[]) ?? [];
}

export async function getCaseByIdForPreview(
  caseId: string,
): Promise<CaseDetailPreview | null> {
  const { data, error } = await supabase
    .from("cases")
    .select(
      "id,title,slug,summary,year,cover_image_url,page_background,services,clients(name),case_category_cases(case_categories(id,name,slug))",
    )
    .eq("id", caseId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as any;
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
      (row.case_category_cases ?? [])
        ?.map((cc: any) => cc.case_categories)
        .filter(Boolean) ?? [],
  };
}

export async function saveCaseBlocks(
  caseId: string,
  drafts: DraftBlock[],
): Promise<void> {
  // 1) Fetch existing block IDs
  const { data: existing, error: fetchErr } = await supabase
    .from("case_blocks")
    .select("id")
    .eq("case_id", caseId);
  if (fetchErr) throw fetchErr;

  const existingIds = new Set((existing ?? []).map((b: any) => b.id));
  const keptIds = new Set(drafts.filter((d) => d.id).map((d) => d.id!));

  // 2) Delete removed blocks
  const toDelete = [...existingIds].filter((id) => !keptIds.has(id));
  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from("case_blocks")
      .delete()
      .in("id", toDelete);
    if (delErr) throw delErr;
  }

  // 3) Upsert all current blocks
  const rows = drafts.map((d, i) => ({
    ...(d.id ? { id: d.id } : {}),
    case_id: caseId,
    type: d.type,
    content: d.content,
    sort_order: i,
    updated_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const { error: upsertErr } = await supabase
      .from("case_blocks")
      .upsert(rows, { onConflict: "id" });
    if (upsertErr) throw upsertErr;
  }
}

export async function deleteBlock(blockId: string): Promise<void> {
  const { error } = await supabase
    .from("case_blocks")
    .delete()
    .eq("id", blockId);
  if (error) throw error;
}

export async function uploadBlockImage(
  caseId: string,
  file: File,
): Promise<string> {
  const safeName = file.name
    .replace(/[^a-z0-9.\-_]/gi, "-")
    .toLowerCase();
  const path = `blocks/${caseId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("case-covers")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("case-covers").getPublicUrl(path);
  return toPublicObjectUrl(data.publicUrl, "case-covers");
}

// ── Cases list (used by AdminCases) ─────────────────────────────────

export type CaseRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  year: number | null;
  cover_image_url: string | null;
  page_background: string | null;
  services: string[] | null;
  status: string | null;
  published_at: string | null;
  clients: { id: string; name: string } | null;
  categories: { id: string; name: string }[];
};

export async function getCases(): Promise<CaseRow[]> {
  const { data, error } = await supabase
    .from("cases")
    .select(
      "id,title,slug,summary,year,cover_image_url,page_background,services,status,published_at,clients(id,name),case_category_cases(case_categories(id,name))",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (
    (data as any[])?.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      year: row.year,
      cover_image_url: row.cover_image_url,
      page_background: row.page_background ?? null,
      services: row.services,
      status: row.status,
      published_at: row.published_at,
      clients: row.clients,
      categories: (row.case_category_cases ?? [])
        .map((cc: any) => cc.case_categories)
        .filter(Boolean),
    })) ?? []
  );
}

// ── Public portfolio (homepage) ─────────────────────────────────────

export type PublicCaseItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  year: number | null;
  cover_image_url: string | null;
  cover_video_url: string | null;
  cover_mux_playback_id: string | null;
  client_name: string | null;
  services: string[] | null;
  categories: Array<{ id: string; name: string; slug?: string }>;
};

/** Slot do Studio reveal: case ou mídia da biblioteca. title sobrescreve o rótulo exibido. */
export type StudioRevealSlot =
  | { type: "case"; case_id: string; title?: string }
  | {
      type: "media";
      media_type: "image" | "video";
      url: string;
      mux_playback_id?: string;
      poster_url?: string;
      title?: string;
    };

/** Lê os 3 slots (studio_reveal_slots ou fallback studio_reveal_case_ids). */
export async function getStudioRevealSlots(): Promise<
  [StudioRevealSlot, StudioRevealSlot, StudioRevealSlot] | null
> {
  const company = await getPrimaryCompany();
  const { data, error } = await supabase
    .from("companies")
    .select("studio_reveal_slots,studio_reveal_case_ids")
    .eq("id", company.id)
    .single();
  if (error) {
    if (error.code === "PGRST116" || String(error.message ?? "").toLowerCase().includes("column"))
      return null;
    throw error;
  }
  const row = data as {
    studio_reveal_slots?: StudioRevealSlot[] | null;
    studio_reveal_case_ids?: string[] | null;
  };
  const slots = row?.studio_reveal_slots;
  if (Array.isArray(slots) && slots.length === 3) {
    const a = slots[0], b = slots[1], c = slots[2];
    if (a && b && c) return [a, b, c];
  }
  const ids = row?.studio_reveal_case_ids;
  if (Array.isArray(ids) && ids.length === 3)
    return [
      { type: "case", case_id: ids[0] },
      { type: "case", case_id: ids[1] },
      { type: "case", case_id: ids[2] },
    ];
  return null;
}

/** Item exibido em um slot do Studio reveal (case ou mídia da biblioteca com mesma forma para render). */
export type StudioRevealDisplayItem = {
  id: string;
  title: string;
  slug: string | null;
  cover_image_url: string | null;
  cover_video_url: string | null;
  cover_mux_playback_id: string | null;
  cover_poster_url?: string | null;
  categories?: Array<{ id: string; name: string; slug?: string }>;
};

/** Resolve os 3 slots para itens prontos para exibir. Null = usar os 3 primeiros cases publicados. */
export async function getStudioRevealDisplayItems(): Promise<
  [StudioRevealDisplayItem, StudioRevealDisplayItem, StudioRevealDisplayItem] | null
> {
  const [slots, cases] = await Promise.all([
    getStudioRevealSlots(),
    getPublicCases(),
  ]);
  if (!slots) return null;
  const byId = new Map(cases.map((c) => [c.id, c]));
  const resolve = (slot: StudioRevealSlot, index: number): StudioRevealDisplayItem => {
    const customTitle = slot.title?.trim();
    if (slot.type === "case") {
      const c = byId.get(slot.case_id);
      if (c)
        return {
          id: c.id,
          title: customTitle || c.title,
          slug: c.slug,
          cover_image_url: c.cover_image_url,
          cover_video_url: c.cover_video_url,
          cover_mux_playback_id: c.cover_mux_playback_id,
          categories: c.categories,
        };
      return {
        id: `case-${slot.case_id}`,
        title: customTitle ?? "",
        slug: null,
        cover_image_url: null,
        cover_video_url: null,
        cover_mux_playback_id: null,
        categories: [],
      };
    }
    const poster =
      slot.mux_playback_id
        ? `https://image.mux.com/${slot.mux_playback_id}/thumbnail.jpg?width=960&fit_mode=smartcrop&time=0`
        : slot.poster_url ?? null;
    return {
      id: `media-${index}-${slot.url}`,
      title: customTitle || (slot.media_type === "video" ? "Vídeo" : "Imagem"),
      slug: null,
      cover_image_url: slot.media_type === "image" ? slot.url : null,
      cover_video_url: slot.media_type === "video" ? slot.url : null,
      cover_mux_playback_id: slot.mux_playback_id ?? null,
      cover_poster_url: poster ?? undefined,
      categories: [],
    };
  };
  return [
    resolve(slots[0], 0),
    resolve(slots[1], 1),
    resolve(slots[2], 2),
  ];
}

/** IDs dos 3 cases do Studio reveal (só quando todos os slots são case). Null = usar os 3 primeiros publicados. */
export async function getStudioRevealCaseIds(): Promise<[string, string, string] | null> {
  const slots = await getStudioRevealSlots();
  if (!slots) return null;
  if (
    slots[0].type !== "case" ||
    slots[1].type !== "case" ||
    slots[2].type !== "case"
  )
    return null;
  return [slots[0].case_id, slots[1].case_id, slots[2].case_id];
}

export async function getPublicCases(): Promise<PublicCaseItem[]> {
  const company = await getPrimaryCompany();

  const { data, error } = await supabase
    .from("cases")
    .select(
      "id,title,slug,summary,year,cover_image_url,cover_video_url,cover_mux_playback_id,services,status,published_at,clients(name),case_category_cases(case_categories(id,name,slug))",
    )
    .eq("status", "published")
    .eq("owner_company_id", company.id)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(24);

  if (error) throw error;

  return (
    (data as unknown as Array<{
      id: string;
      title: string;
      slug: string;
      summary: string | null;
      year: number | null;
      cover_image_url: string | null;
      cover_video_url: string | null;
      cover_mux_playback_id: string | null;
      services: string[] | null;
      clients: { name: string } | null;
      case_category_cases: Array<{ case_categories: PublicCaseItem["categories"][0] | null }> | null;
    }>)?.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      year: item.year,
      cover_image_url: item.cover_image_url,
      cover_video_url: item.cover_video_url ?? null,
      cover_mux_playback_id: item.cover_mux_playback_id ?? null,
      services: item.services,
      client_name: item.clients?.name ?? null,
      categories:
        item.case_category_cases
          ?.map((cc) => cc.case_categories)
          .filter(Boolean) ?? [],
    })) ?? []
  );
}
