import * as React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCasesSection, ALL_ID } from "@/contexts/CasesSectionContext";
import { useContactModal, ContactPopover } from "@/contexts/ContactModalContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/i18n";

function useNavItems(): { label: string; href: string }[] {
  const { t } = useTranslation();
  return [
    { label: t("navHome"), href: "/" },
    { label: t("navWork"), href: "/#work" },
  ];
}

const SCROLL_THRESHOLD = 80;
const FLOATING_NAV_DEFAULT_BOTTOM = 28;
const FLOATING_NAV_GAP_ABOVE_FOOTER = 32;

function useStickyBottomAboveFooter() {
  const [bottom, setBottom] = React.useState(FLOATING_NAV_DEFAULT_BOTTOM);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const update = () => {
      const footer = document.getElementById("site-footer");
      if (!footer) {
        setBottom(FLOATING_NAV_DEFAULT_BOTTOM);
        return;
      }
      const rect = footer.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setBottom(window.innerHeight - rect.top + FLOATING_NAV_GAP_ABOVE_FOOTER);
      } else {
        setBottom(FLOATING_NAV_DEFAULT_BOTTOM);
      }
    };

    const onScrollOrResize = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return bottom;
}

function FloatingCategoryFilter() {
  const { activeCategory, setActiveCategory, categories } = useCasesSection();
  const reduceMotion = useReducedMotion();
  const stickyBottom = useStickyBottomAboveFooter();
  const { t } = useTranslation();

  const filterItems = [{ id: ALL_ID, label: t("filterAll") }, ...categories.map((c) => ({ id: c.id, label: c.name }))];

  const containerClass =
    "flex items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white/80 py-2 shadow-[0_14px_50px_rgba(0,0,0,0.14)] backdrop-blur-md overflow-x-auto scrollbar-hide w-fit max-w-[calc(100%-2.5rem)]";
  const innerClass = "flex items-center justify-center gap-1.5 px-8";

  const bottomStyle = { bottom: stickyBottom };

  if (reduceMotion) {
    return (
      <div className="fixed left-1/2 -translate-x-1/2 z-50" style={bottomStyle}>
        <div className={containerClass}>
          <div className={innerClass}>
          {filterItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveCategory(item.id)}
              aria-pressed={activeCategory === item.id}
              className={
                activeCategory === item.id
                  ? "shrink-0 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-body font-medium text-sm transition-colors"
                  : "shrink-0 px-3 py-1.5 rounded-full border border-transparent font-body font-medium text-sm text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {item.label}
            </button>
          ))}
          </div>
        </div>
      </div>
    );
  }

  const transition = { type: "spring" as const, stiffness: 380, damping: 28 };

  return (
    <motion.div
      key="floating-filter"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={transition}
      style={{ x: "-50%", ...bottomStyle }}
      className="fixed left-1/2 z-50 origin-center w-fit max-w-[calc(100%-2.5rem)]"
    >
      <div className={containerClass}>
        <div className={innerClass}>
        {filterItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveCategory(item.id)}
            aria-pressed={activeCategory === item.id}
            className={
              activeCategory === item.id
                ? "shrink-0 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-body font-medium text-sm transition-colors"
                : "shrink-0 px-3 py-1.5 rounded-full border border-transparent font-body font-medium text-sm text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {item.label}
          </button>
        ))}
        </div>
      </div>
    </motion.div>
  );
}

function FloatingNavbarContent() {
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = React.useState(false);
  const contactModal = useContactModal();
  const stickyBottom = useStickyBottomAboveFooter();
  const navItems = useNavItems();
  const { t } = useTranslation();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const widthStyle: React.CSSProperties = {
    width: scrolled ? "min(640px, calc(100% - 2.5rem))" : "min(980px, calc(100% - 2.5rem))",
    transition: "width 0.52s cubic-bezier(0.34, 1.56, 0.64, 1)",
  };
  const bottomStyle = { bottom: stickyBottom };

  const navContent = (
    <div className="flex items-center justify-between gap-4 rounded-full border border-black/10 bg-white/80 px-4 py-3 shadow-[0_14px_50px_rgba(0,0,0,0.14)] backdrop-blur-md md:px-5">
      <Link
        to="/"
        className="flex shrink-0 items-center gap-2 rounded-full px-2 py-1 font-display text-[15px] font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={t("ariaGoHome")}
      >
        TRESSDE®
      </Link>

      <nav aria-label={t("ariaMainNav")} className="hidden min-w-0 shrink md:block">
        <ul className="flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item.href}>
              {item.href === "/#contato" && contactModal ? (
                <ContactPopover>
                  <button
                    type="button"
                    className="rounded-full px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {item.label}
                  </button>
                </ContactPopover>
              ) : (
                <Link
                  to={item.href}
                  className="rounded-full px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <LanguageSelector
          variant="icon"
          triggerClassName="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/60 text-muted-foreground transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />

        {contactModal ? (
          <ContactPopover>
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("ctaTalkToTressde")}
            </button>
          </ContactPopover>
        ) : (
          <a
            href="#contato"
            className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("ctaTalkToTressde")}
          </a>
        )}
      </div>
    </div>
  );

  const transition = { type: "spring" as const, stiffness: 380, damping: 28 };

  return reduceMotion ? (
    <div
      key="floating-nav"
      className="fixed left-1/2 -translate-x-1/2 z-50"
      style={{ ...widthStyle, ...bottomStyle }}
    >
      {navContent}
    </div>
  ) : (
    <motion.div
      key="floating-nav"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={transition}
      style={{ x: "-50%", ...widthStyle, ...bottomStyle }}
      className="fixed left-1/2 z-50 origin-center"
    >
      {navContent}
    </motion.div>
  );
}

export default function FloatingNavbar() {
  const { showFilterChips } = useCasesSection();

  return (
    <AnimatePresence mode="wait">
      {showFilterChips ? (
        <FloatingCategoryFilter key="filter" />
      ) : (
        <FloatingNavbarContent key="nav" />
      )}
    </AnimatePresence>
  );
}

