import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "@/i18n";

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
  const { t } = useTranslation();

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
      toast.error(t("contactToastFillRequired"));
      return;
    }

    if (contactPreference === "whatsapp" && !whatsapp) {
      toast.error(t("contactToastWhatsAppRequired"));
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

      toast.success(t("contactToastSuccess"));
      form.reset();
      onSuccess();
    } catch (err) {
      toast.error(t("contactToastError"));
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
            {t("contactCompany")}
          </label>
          <Input
            id={`${idPrefix}-company`}
            name="company"
            autoComplete="organization"
            placeholder={t("contactCompanyPlaceholder")}
            required
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-name`} className="sr-only">
            {t("contactName")}
          </label>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            autoComplete="name"
            placeholder={t("contactNamePlaceholder")}
            required
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-role`} className="sr-only">
          {t("contactRole")}
        </label>
        <Input
          id={`${idPrefix}-role`}
          name="role"
          autoComplete="organization-title"
          placeholder={t("contactRolePlaceholder")}
          className="h-11 rounded-xl bg-muted/50 border-border"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-email`} className="sr-only">
            {t("contactEmail")}
          </label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t("contactEmailPlaceholder")}
            required
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-whatsapp`} className="sr-only">
            {t("contactWhatsApp")}
          </label>
          <Input
            id={`${idPrefix}-whatsapp`}
            type="tel"
            name="whatsapp"
            autoComplete="tel"
            inputMode="tel"
            placeholder={t("contactWhatsAppPlaceholder")}
            className="h-11 rounded-xl bg-muted/50 border-border"
          />
        </div>
      </div>
      <fieldset className="space-y-3">
        <legend className="block text-sm font-medium text-foreground">
          {t("contactChannelPreference")}
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
            <span>{t("contactChannelEmail")}</span>
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
            <span>{t("contactChannelWhatsApp")}</span>
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
          {isSubmitting ? t("contactSubmitting") : t("contactSubmit")}
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground pt-1">
        {t("contactFooterNote")}
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
  const { t } = useTranslation();

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
              {t("contactTitle")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("contactIntro")}
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
