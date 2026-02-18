import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase/client";

type ContactModalContextValue = {
  /** @deprecated Use ContactPopover instead. Kept for compatibility. */
  openContactModal: () => void;
  /** @deprecated Use ContactPopover instead. Kept for compatibility. */
  closeContactModal: () => void;
};

const ContactModalContext = React.createContext<ContactModalContextValue | null>(null);

export function useContactModal(): ContactModalContextValue | null {
  return React.useContext(ContactModalContext);
}

const overshootTransition = { type: "spring" as const, stiffness: 260, damping: 18 };

function ContactFormContent({ onSuccess, idPrefix }: { onSuccess: () => void; idPrefix: string }) {
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
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-company`} className="sr-only">
            Empresa
          </label>
          <Input
            id={`${idPrefix}-company`}
            name="company"
            autoComplete="organization"
            placeholder="Nome da empresa"
            required
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-name`} className="sr-only">
            Nome
          </label>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            autoComplete="name"
            placeholder="Seu nome"
            required
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-role`} className="sr-only">
          Cargo
        </label>
        <Input
          id={`${idPrefix}-role`}
          name="role"
          autoComplete="organization-title"
          placeholder="Seu cargo"
          className="h-11 rounded-xl bg-muted/50 border-border"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-email`} className="sr-only">
            E-mail
          </label>
          <Input
            id={`${idPrefix}-email`}
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
          <label htmlFor={`${idPrefix}-whatsapp`} className="sr-only">
            WhatsApp
          </label>
          <Input
            id={`${idPrefix}-whatsapp`}
            type="tel"
            name="whatsapp"
            autoComplete="tel"
            inputMode="tel"
            placeholder="(11) 99999-9999"
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
      </div>
      <fieldset className="space-y-3">
        <legend className="block text-sm font-medium text-foreground">
          Preferência de canal
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <label
            htmlFor={`${idPrefix}-preference-email`}
            className="group relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-border bg-muted/30 py-3.5 px-4 text-sm font-medium text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
          >
            <input
              type="radio"
              id={`${idPrefix}-preference-email`}
              name="contactPreference"
              value="email"
              defaultChecked
              className="sr-only"
            />
            <span>E-mail</span>
            <Check className="h-4 w-4 shrink-0 opacity-0 group-has-[:checked]:opacity-100" aria-hidden />
          </label>
          <label
            htmlFor={`${idPrefix}-preference-whatsapp`}
            className="group relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-border bg-muted/30 py-3.5 px-4 text-sm font-medium text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
          >
            <input
              type="radio"
              id={`${idPrefix}-preference-whatsapp`}
              name="contactPreference"
              value="whatsapp"
              className="sr-only"
            />
            <span>WhatsApp</span>
            <Check className="h-4 w-4 shrink-0 opacity-0 group-has-[:checked]:opacity-100" aria-hidden />
          </label>
        </div>
      </fieldset>
      <div className="pt-3 flex flex-col items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 min-w-[12rem] w-fit rounded-2xl border-0 bg-primary px-8 font-display text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Agendar uma conversa"}
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground pt-1">
        Resposta em até 1 dia útil. Sem spam.
      </p>
    </form>
  );
}

export type ContactPopoverProps = {
  children: React.ReactNode;
};

/**
 * Dropdown "Falar com a TRESSDE®" que abre acima do botão com animação overshoot.
 * Deve ser usado dentro de ContactModalProvider.
 */
export function ContactPopover({ children }: ContactPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const idPrefix = React.useId().replace(/:/g, "-");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={12}
        align="center"
        className="w-[min(calc(100vw-2rem),30rem)] max-w-md rounded-2xl border-border/80 p-8 sm:p-10 shadow-xl data-[state=open]:animate-none data-[state=closed]:animate-none"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={overshootTransition}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-display font-semibold tracking-tight text-foreground">
              Falar com a TRESSDE®
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Converse com a TRESSDE e tenha um plano completo para comunicar, lançar e evoluir com consistência.
            </p>
          </div>
          <ContactFormContent idPrefix={idPrefix} onSuccess={() => setOpen(false)} />
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const openContactModal = React.useCallback(() => {}, []);
  const closeContactModal = React.useCallback(() => {}, []);

  const value = React.useMemo(
    () => ({ openContactModal, closeContactModal }),
    [openContactModal, closeContactModal],
  );

  return <ContactModalContext.Provider value={value}>{children}</ContactModalContext.Provider>;
}
