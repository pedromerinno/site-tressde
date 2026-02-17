import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { getCases, getClients } from "@/lib/case-builder/queries";
import { getPrimaryCompany } from "@/lib/onmx/company";
import { toSlug } from "@/lib/onmx/slug";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminCases() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newCaseOpen, setNewCaseOpen] = React.useState(false);
  const [newCaseTitle, setNewCaseTitle] = React.useState("");
  const [newCaseClientId, setNewCaseClientId] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [caseToRemove, setCaseToRemove] = React.useState<{ id: string; title: string } | null>(null);

  const { data: company } = useQuery({
    queryKey: ["admin", "company"],
    queryFn: getPrimaryCompany,
    staleTime: 10 * 60 * 1000,
  });

  const { data: clients } = useQuery({
    queryKey: ["admin", "clients", "options"],
    queryFn: getClients,
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "cases"],
    queryFn: getCases,
    staleTime: 30 * 1000,
  });

  async function handleCreateAndOpenBuilder() {
    if (!company) return;
    const title = newCaseTitle.trim();
    if (!title) {
      toast({ title: "Informe o nome do case", variant: "destructive" });
      return;
    }
    if (!newCaseClientId) {
      toast({ title: "Selecione o cliente", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const slug = toSlug(title);
      const payload = {
        group_id: company.group_id,
        owner_company_id: company.id,
        client_id: newCaseClientId,
        title,
        slug,
        status: "draft",
      };
      const { data: inserted, error } = await supabase
        .from("cases")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      const caseId = inserted.id as string;
      await qc.invalidateQueries({ queryKey: ["admin", "cases"] });
      setNewCaseOpen(false);
      setNewCaseTitle("");
      setNewCaseClientId("");
      navigate(`/admin/cases/${caseId}/builder`);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message ?? "Não foi possível criar o case.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "cases"] });
      toast({ title: "Removido", description: "Case removido." });
    },
    onError: (err: any) => {
      toast({
        title: "Erro",
        description: err?.message ?? "Não foi possível remover.",
        variant: "destructive",
      });
    },
  });

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Cases</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie e publique novos cases com o construtor de blocos.
          </p>
        </div>

        <Button className="gap-2" onClick={() => setNewCaseOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo case
        </Button>
      </div>

      <Dialog open={newCaseOpen} onOpenChange={setNewCaseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo case</DialogTitle>
            <DialogDescription>
              Informe o nome e o cliente. Em seguida você será levado ao builder para montar o case.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do case</label>
              <input
                type="text"
                value={newCaseTitle}
                onChange={(e) => setNewCaseTitle(e.target.value)}
                placeholder="Ex.: Projeto X"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                aria-label="Nome do case"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <select
                value={newCaseClientId}
                onChange={(e) => setNewCaseClientId(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                aria-label="Cliente"
              >
                <option value="">Selecione…</option>
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewCaseOpen(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateAndOpenBuilder} disabled={creating}>
              {creating ? "Criando…" : "Criar e abrir builder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!caseToRemove} onOpenChange={(open) => !open && setCaseToRemove(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remover case</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o case &quot;{caseToRemove?.title ?? ""}&quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCaseToRemove(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (caseToRemove) {
                  remove.mutate(caseToRemove.id);
                  setCaseToRemove(null);
                }
              }}
              disabled={remove.isPending}
            >
              {remove.isPending ? "Removendo…" : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Carregando…" : `${data?.length ?? 0} cases`}
          </span>
        </div>

        <div className="divide-y divide-border">
          {(data ?? []).map((c) => (
            <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {c.clients?.name ?? "—"} ·{" "}
                  {c.status === "published"
                    ? "Publicado"
                    : c.status === "restricted"
                      ? "Restrito"
                      : "Rascunho"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/admin/cases/${c.id}/builder`)}
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCaseToRemove({ id: c.id, title: c.title })}
                  aria-label="Remover"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {!isLoading && (data?.length ?? 0) === 0 && (
            <div className="px-6 py-10 text-sm text-muted-foreground">Nenhum case cadastrado ainda.</div>
          )}
        </div>
      </div>
    </section>
  );
}
