import * as React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "@/i18n";

const STORAGE_KEY = "tressde-cookie-consent";

export default function CookieBanner() {
  const [accepted, setAccepted] = React.useState<boolean | null>(null);
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation();

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setAccepted(stored === "accepted");
    } catch {
      setAccepted(false);
    }
  }, []);

  const handleAccept = React.useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
      setAccepted(true);
    } catch {
      setAccepted(true);
    }
  }, []);

  if (accepted === null) return null;

  return (
    <AnimatePresence>
      {!accepted && (
        <motion.aside
          key="cookie-banner"
        role="alert"
        aria-live="polite"
        aria-label={t("cookiePolicy")}
        initial={reduceMotion ? false : { opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? false : { opacity: 0, y: -100 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 right-0 top-0 z-[100] flex justify-center px-4 py-4 sm:px-6"
      >
        <div className="flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-black/10 bg-black/70 px-5 py-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-sm leading-relaxed text-white">
            {t("cookieMessage")}{" "}
            <Link
              to="/politica-de-cookies"
              className="underline underline-offset-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#282828]"
            >
              {t("cookiePolicy")}
            </Link>
          </p>
          <button
            type="button"
            onClick={handleAccept}
            className="shrink-0 self-start rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#282828] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#282828] sm:self-center"
          >
            {t("cookieAccept")}
          </button>
        </div>
      </motion.aside>
      )}
    </AnimatePresence>
  );
}
