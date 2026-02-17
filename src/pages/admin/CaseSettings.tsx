import * as React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import type { CaseRow } from "@/lib/case-builder/queries";
import CaseEditorPhase1 from "@/components/case-builder/CaseEditorPhase1";
import CaseEditorTopBar from "@/components/admin/CaseEditorTopBar";
import { toast } from "@/components/ui/sonner";

async function getCaseById(id: string): Promise<CaseRow | null> {
  const { data, error } = await supabase
    .from("cases")
    .select(
      "id,title,slug,summary,year,cover_image_url,page_background,services,status,published_at,clients(id,name),case_category_cases(case_categories(id,name))",
    )
    .eq("id", id)
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
    status: row.status,
    published_at: row.published_at,
    clients: row.clients,
    categories: (row.case_category_cases ?? [])
      .map((cc: any) => cc.case_categories)
      .filter(Boolean),
  };
}

export default function CaseSettings() {
  const { id } = useParams<{ id: string }>();
  const caseId = id!;
  const qc = useQueryClient();

  const formId = React.useId();

  const caseQuery = useQuery({
    queryKey: ["admin", "case", caseId],
    queryFn: () => getCaseById(caseId),
    enabled: Boolean(caseId),
    staleTime: 30 * 1000,
  });

  function handleSaved(savedId: string) {
    qc.invalidateQueries({ queryKey: ["admin", "cases"] });
    qc.invalidateQueries({ queryKey: ["admin", "case", savedId] });
  }

  const caseData = caseQuery.data ?? null;

  async function renameCaseTitle(nextTitle: string) {
    try {
      const { data, error } = await supabase
        .from("cases")
        .update({ title: nextTitle })
        .eq("id", caseId)
        .select("title")
        .maybeSingle();
      if (error) throw error;

      if (data?.title) {
        qc.setQueryData(["admin", "case", caseId], (prev: any) => {
          if (!prev) return prev;
          return { ...prev, title: data.title };
        });
      }

      await qc.invalidateQueries({ queryKey: ["admin", "case", caseId] });
      await qc.invalidateQueries({ queryKey: ["admin", "cases"] });
      toast.success("Título atualizado.");
    } catch (err: any) {
      toast.error(err?.message ?? "Não foi possível atualizar o título.");
      throw err;
    }
  }

  async function setClientId(nextClientId: string) {
    try {
      const { data, error } = await supabase
        .from("cases")
        .update({ client_id: nextClientId })
        .eq("id", caseId)
        .select("client_id,clients(id,name)")
        .maybeSingle();
      if (error) throw error;

      if (data?.clients) {
        qc.setQueryData(["admin", "case", caseId], (prev: any) => {
          if (!prev) return prev;
          return { ...prev, clients: data.clients };
        });
      }

      await qc.invalidateQueries({ queryKey: ["admin", "case", caseId] });
      await qc.invalidateQueries({ queryKey: ["admin", "cases"] });
      toast.success("Cliente atualizado.");
    } catch (err: any) {
      toast.error(err?.message ?? "Não foi possível atualizar o cliente.");
      throw err;
    }
  }

  async function setVisibility(next: "draft" | "published" | "restricted") {
    try {
      const payload =
        next === "draft"
          ? { status: "draft", published_at: null }
          : { status: next, published_at: new Date().toISOString() };

      const { data, error } = await supabase
        .from("cases")
        .update(payload)
        .eq("id", caseId)
        .select("status,published_at")
        .maybeSingle();
      if (error) throw error;

      // Optimistic cache update (instant badge refresh)
      if (data) {
        qc.setQueryData(["admin", "case", caseId], (prev: any) => {
          if (!prev) return prev;
          return { ...prev, status: data.status, published_at: data.published_at };
        });
      }

      await qc.invalidateQueries({ queryKey: ["admin", "case", caseId] });
      await qc.invalidateQueries({ queryKey: ["admin", "cases"] });

      const messages: Record<string, string> = {
        published: "Case agora está visível.",
        restricted: "Case agora é restrito (acesso com senha).",
        draft: "Case voltou para rascunho.",
      };
      toast.success(messages[next]);
    } catch (err: any) {
      toast.error(err?.message ?? "Não foi possível atualizar a visibilidade.");
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-black">
      <CaseEditorTopBar
        caseId={caseId}
        title={caseData?.title}
        slug={caseData?.slug}
        status={caseData?.status}
        client={caseData?.clients ?? null}
        onSetClientId={setClientId}
        centerLabel="Configurações básicas"
        onRenameTitle={renameCaseTitle}
        onSave={() => {
          const el = document.getElementById(formId) as HTMLFormElement | null;
          el?.requestSubmit();
        }}
        isSaving={false}
        onSetVisibility={setVisibility}
      />

      <div className="h-[calc(100vh-56px)] overflow-auto">
        <div className="px-6 md:px-10 lg:px-12 py-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              {caseQuery.isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
                </div>
              ) : (
                <CaseEditorPhase1
                  formId={formId}
                  caseData={caseData}
                  onSaved={handleSaved}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

