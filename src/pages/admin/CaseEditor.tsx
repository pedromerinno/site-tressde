import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { type CaseRow } from "@/lib/case-builder/queries";
import CaseEditorPhase1 from "@/components/case-builder/CaseEditorPhase1";

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

export default function CaseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isNew = !id;

  const caseQuery = useQuery({
    queryKey: ["admin", "case", id],
    queryFn: () => getCaseById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  function handleSaved(savedId: string) {
    qc.invalidateQueries({ queryKey: ["admin", "cases"] });
    if (isNew) {
      navigate(`/admin/cases/${savedId}/builder`, { replace: true });
    } else {
      qc.invalidateQueries({ queryKey: ["admin", "case", id] });
    }
  }

  const caseData = caseQuery.data ?? null;
  const isEditing = !!id;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/cases">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {isNew ? "Novo case" : "Editar case"}
          </h1>
          {caseData && (
            <p className="text-sm text-muted-foreground">{caseData.title}</p>
          )}
        </div>
      </div>



      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        {caseQuery.isLoading && isEditing ? (
          <div className="space-y-4">
            <div className="h-10 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            <CaseEditorPhase1 caseData={caseData} onSaved={handleSaved} />
          </>
        )}
      </div>
    </section>
  );
}
