import * as React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  translations,
  type TranslationKey,
  type Locale as I18nLocale,
} from "./translations";

const localeMap: Record<ReturnType<typeof useLanguage>["locale"], I18nLocale> = {
  pt: "pt",
  en: "en",
  es: "es",
};

export type { TranslationKey };

export function useTranslation() {
  const { locale } = useLanguage();
  const dict = translations[localeMap[locale]] ?? translations.pt;

  const t = React.useCallback(
    (key: TranslationKey): string => {
      return (dict as Record<TranslationKey, string>)[key] ?? (translations.pt as Record<TranslationKey, string>)[key] ?? key;
    },
    [dict],
  );

  return { t, locale };
}
