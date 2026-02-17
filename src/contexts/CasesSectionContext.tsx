import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicCaseCategories } from "@/lib/case-builder/queries";

const ALL_ID = "all";

type CasesSectionContextValue = {
  isInCasesSection: boolean;
  activeCategory: string;
  setActiveCategory: (id: string) => void;
  categories: { id: string; name: string }[];
};

const CasesSectionContext = React.createContext<CasesSectionContextValue | null>(null);

export function CasesSectionProvider({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = React.useState(ALL_ID);
  const [isInCasesSection, setIsInCasesSection] = React.useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["cases", "categories", "public"],
    queryFn: getPublicCaseCategories,
    staleTime: 10 * 60 * 1000,
  });

  React.useEffect(() => {
    const el = document.getElementById("work");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInCasesSection(entry?.isIntersecting ?? false);
      },
      {
        rootMargin: "10% 0px -30% 0px",
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const value: CasesSectionContextValue = {
    isInCasesSection,
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
