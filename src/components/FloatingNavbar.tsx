import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe } from "lucide-react";
import { useCasesSection, ALL_ID } from "@/contexts/CasesSectionContext";
import { useContactModal } from "@/contexts/ContactModalContext";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Início", href: "#inicio" },
  { label: "Work", href: "#work" },
  { label: "Contato", href: "#contato" },
];

const SCROLL_THRESHOLD = 80;

function FloatingCategoryFilter() {
  const { activeCategory, setActiveCategory, categories } = useCasesSection();
  const reduceMotion = useReducedMotion();

  const filterItems = [{ id: ALL_ID, label: "Todos" }, ...categories.map((c) => ({ id: c.id, label: c.name }))];

  const containerClass =
    "flex items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white/80 py-2 shadow-[0_14px_50px_rgba(0,0,0,0.14)] backdrop-blur-md overflow-x-auto scrollbar-hide w-fit max-w-[calc(100%-2.5rem)]";
  const innerClass = "flex items-center justify-center gap-1.5 px-8";

  if (reduceMotion) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
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

  const springOvershoot = { type: "spring" as const, stiffness: 380, damping: 28 };

  return (
    <motion.div
      key="floating-filter"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      transition={springOvershoot}
      style={{ x: "-50%" }}
      className="fixed bottom-4 left-1/2 z-50 origin-center w-fit max-w-[calc(100%-2.5rem)]"
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

  const navContent = (
    <div className="flex items-center justify-between gap-4 rounded-full border border-black/10 bg-white/80 px-4 py-3 shadow-[0_14px_50px_rgba(0,0,0,0.14)] backdrop-blur-md md:px-5">
      <a
        href="#inicio"
        className="flex shrink-0 items-center gap-2 rounded-full px-2 py-1 font-display text-[15px] font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Ir para o início"
      >
        TRESSDE®
      </a>

      <nav aria-label="Navegação principal" className="hidden min-w-0 shrink md:block">
        <ul className="flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item.href}>
              {item.href === "#contato" && contactModal ? (
                <button
                  type="button"
                  onClick={contactModal.openContactModal}
                  className="rounded-full px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                </button>
              ) : (
                <a
                  href={item.href}
                  className="rounded-full px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/60 text-muted-foreground transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Mudar idioma"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
        </button>

        {contactModal ? (
          <button
            type="button"
            onClick={contactModal.openContactModal}
            className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Falar com a TRESSDE®
          </button>
        ) : (
          <a
            href="#contato"
            className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Falar com a TRESSDE®
          </a>
        )}
      </div>
    </div>
  );

  const springOvershoot = { type: "spring" as const, stiffness: 380, damping: 28 };

  return reduceMotion ? (
    <div
      key="floating-nav"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      style={widthStyle}
    >
      {navContent}
    </div>
  ) : (
    <motion.div
      key="floating-nav"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      transition={springOvershoot}
      style={{ x: "-50%", ...widthStyle }}
      className="fixed bottom-4 left-1/2 z-50 origin-center"
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

