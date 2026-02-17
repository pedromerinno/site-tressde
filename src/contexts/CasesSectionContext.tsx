import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicCaseCategories } from "@/lib/case-builder/queries";

const ALL_ID = "all";

const FROM_CASE_PAGE_KEY = "tressde_from_case_page";

type CasesSectionContextValue = {
  isInCasesSection: boolean;
  /** Quando true, mostra os filtros; quando false, mostra o menu (nav). Ao voltar da página do case, fica false até o usuário rolar até #work. */
  showFilterChips: boolean;
  activeCategory: string;
  setActiveCategory: (id: string) => void;
  categories: { id: string; name: string }[];
};

const CasesSectionContext = React.createContext<CasesSectionContextValue | null>(null);

export function CasesSectionProvider({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = React.useState(ALL_ID);
  const [isInCasesSection, setIsInCasesSection] = React.useState(false);
  const [forceShowNav, setForceShowNav] = React.useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["cases", "categories", "public"],
    queryFn: getPublicCaseCategories,
    staleTime: 10 * 60 * 1000,
  });

  // Ao montar na home, se veio da página de um case, forçar menu (não filtros) até o usuário rolar até #work.
  React.useEffect(() => {
    try {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(FROM_CASE_PAGE_KEY)) {
        sessionStorage.removeItem(FROM_CASE_PAGE_KEY);
        setForceShowNav(true);
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    const el = document.getElementById("work");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry?.isIntersecting ?? false;
        setIsInCasesSection(intersecting);
        if (intersecting) setForceShowNav(false);
      },
      {
        rootMargin: "10% 0px -30% 0px",
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showFilterChips = isInCasesSection && !forceShowNav;

  const value: CasesSectionContextValue = {
    isInCasesSection,
    showFilterChips,
    activeCategory,
    setActiveCategory,
    categories,
  };

  return (
    <CasesSectionContext.Provider value={value}>
      {children}
    </CasesSectionContext.Provider>
  );
}

export function useCasesSection() {
  const ctx = React.useContext(CasesSectionContext);
  if (!ctx) {
    throw new Error("useCasesSection must be used within CasesSectionProvider");
  }
  return ctx;
}

export { ALL_ID };
