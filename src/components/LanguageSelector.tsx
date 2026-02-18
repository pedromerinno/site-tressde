import * as React from "react";
import { Globe } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useLanguage,
  type Locale,
  LOCALE_LABELS,
  LOCALE_CODES,
} from "@/contexts/LanguageContext";
import { useTranslation } from "@/i18n";

const LOCALES: Locale[] = ["pt", "en", "es"];

type LanguageSelectorProps = {
  /** "icon" = globe icon (navbar); "code" = PT/EN/ES text (header) */
  variant?: "icon" | "code";
  className?: string;
  triggerClassName?: string;
};

export function LanguageSelector({
  variant = "icon",
  className,
  triggerClassName,
}: LanguageSelectorProps) {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const handleSelect = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        className={
          triggerClassName ??
          "inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/60 text-muted-foreground transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        }
        aria-label={t("languageChoose")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
      </button>
    ) : (
      <button
        type="button"
        className={
          triggerClassName ??
          "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1 py-0.5 min-w-[2ch]"
        }
        aria-label={t("languageChoose")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {LOCALE_CODES[locale]}
      </button>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={variant === "icon" ? "end" : "center"}
        side={variant === "icon" ? "top" : "bottom"}
        sideOffset={8}
        className={className ?? "w-40 p-2"}
      >
        <ul
          role="listbox"
          aria-label={t("languageListLabel")}
          className="flex flex-col gap-0.5"
        >
          {LOCALES.map((loc) => (
            <li key={loc} role="option" aria-selected={locale === loc}>
              <button
                type="button"
                onClick={() => handleSelect(loc)}
                className={
                  "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors " +
                  (locale === loc
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted")
                }
              >
                {LOCALE_CODES[loc]} — {LOCALE_LABELS[loc]}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
