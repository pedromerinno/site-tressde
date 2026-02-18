import { Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useContactModal, ContactPopover } from "@/contexts/ContactModalContext";
import { useTranslation } from "@/i18n";

const navLinkClass =
  "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full px-1 py-0.5";

function PortfolioHero() {
  const { t } = useTranslation();
  const contactModal = useContactModal();
  return (
    <header id="inicio" className="bg-background">
      <div className="px-6 md:px-10 lg:px-16 pt-8 md:pt-10 pb-10 md:pb-16">
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-12">
          <Link
            to="/"
            className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            aria-label={`TRESSDE — ${t("navHome")}`}
          >
            TRESSDE®
          </Link>
          <p className="text-center text-sm font-semibold text-muted-foreground md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:text-center">
            {t("heroTagline")}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-full bg-muted/80 px-5 py-2.5 backdrop-blur-sm">
              <LanguageSelector variant="iconAndCode" />
            </div>
            <nav
              aria-label={t("ariaMainNav")}
              className="flex items-center gap-8 rounded-full bg-muted/80 px-5 py-2.5 backdrop-blur-sm"
            >
              <a href="#work" className={navLinkClass}>
                {t("navWork")}
              </a>
              {contactModal ? (
                <ContactPopover>
                  <button type="button" className={navLinkClass}>
                    {t("navContact")}
                  </button>
                </ContactPopover>
              ) : (
                <a href="#contato" className={navLinkClass}>
                  {t("navContact")}
                </a>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default PortfolioHero;
