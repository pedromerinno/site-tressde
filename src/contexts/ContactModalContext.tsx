import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase/client";

type ContactModalContextValue = {
  openContactModal: () => void;
  closeContactModal: () => void;
};

const ContactModalContext = React.createContext<ContactModalContextValue | null>(null);

export function useContactModal(): ContactModalContextValue | null {
  return React.useContext(ContactModalContext);
}

function ContactFormModalContent({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    const data = new FormData(form);

    const prospectCompany = String(data.get("company") ?? "").trim();
    const name = String(data.get("name") ?? "").trim();
    const role = String(data.get("role") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const whatsapp = String(data.get("whatsapp") ?? "").trim();
    const contactPreference = String(data.get("contactPreference") ?? "email");

    if (!prospectCompany || !name || !email) {
      toast.error("Preencha Empresa, Nome e E-mail.");
      return;
    }

    if (contactPreference === "whatsapp" && !whatsapp) {
      toast.error("Informe seu WhatsApp para essa preferência.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        prospect_company: prospectCompany,
        name,
        role: role || null,
        email,
        whatsapp: whatsapp || null,
        contact_preference: contactPreference,
      });

      if (error) throw error;

      toast.success("Recebido. Vamos te chamar em até 1 dia útil.");
      form.reset();
      onSuccess();
    } catch (err) {
      toast.error("Não conseguimos enviar agora. Tente novamente em instantes.");
      // eslint-disable-next-line no-console
      console.error("[ContactModal] lead insert failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-modal-company" className="sr-only">
            Empresa
          </label>
          <Input
            id="contact-modal-company"
            name="company"
            autoComplete="organization"
            placeholder="Nome da empresa"
            required
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
        <div>
          <label htmlFor="contact-modal-name" className="sr-only">
            Nome
          </label>
          <Input
            id="contact-modal-name"
            name="name"
            autoComplete="name"
            placeholder="Seu nome"
            required
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-modal-role" className="sr-only">
          Cargo
        </label>
        <Input
          id="contact-modal-role"
          name="role"
          autoComplete="organization-title"
          placeholder="Seu cargo"
          className="h-11 rounded-xl bg-muted/50 border-border"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-modal-email" className="sr-only">
            E-mail
          </label>
          <Input
            id="contact-modal-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="voce@empresa.com"
            required
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
        <div>
          <label htmlFor="contact-modal-whatsapp" className="sr-only">
            WhatsApp
          </label>
          <Input
            id="contact-modal-whatsapp"
            type="tel"
            name="whatsapp"
            autoComplete="tel"
            inputMode="tel"
            placeholder="(11) 99999-9999"
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-modal-preference" className="sr-only">
          Preferência de contato
        </label>
        <select
          id="contact-modal-preference"
          name="contactPreference"
          defaultValue="email"
          className="h-11 w-full rounded-xl bg-muted/50 border border-border px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="email">E-mail</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-primary px-6 font-display text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Agendar uma conversa"}
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Resposta em até 1 dia útil. Sem spam.
      </p>
    </form>
  );
}

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const openContactModal = React.useCallback(() => setOpen(true), []);
  const closeContactModal = React.useCallback(() => setOpen(false), []);

  const value = React.useMemo(
    () => ({ openContactModal, closeContactModal }),
    [openContactModal, closeContactModal],
  );

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border/80 p-6 shadow-xl sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-semibold tracking-tight">
              Falar com a TRESSDE®
            </DialogTitle>
            <DialogDescription>
              Converse com a TRESSDE e tenha um plano completo para comunicar, lançar e evoluir com consistência.
            </DialogDescription>
          </DialogHeader>
          <ContactFormModalContent onSuccess={closeContactModal} />
        </DialogContent>
      </Dialog>
    </ContactModalContext.Provider>
  );
}
