import { Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/i18n";

function PortfolioHero() {
  const { t } = useTranslation();
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
          <nav
            aria-label={t("ariaMainNav")}
            className="flex items-center gap-10 shrink-0"
          >
            <a
              href="#work"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              {t("navWork")}
            </a>
            <LanguageSelector variant="code" />
            <a
              href="#contato"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              {t("navContact")}
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default PortfolioHero;
