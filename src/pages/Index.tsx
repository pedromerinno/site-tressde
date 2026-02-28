import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import {
  getStudioRevealDisplayItems,
  getPublicCases,
} from "@/lib/case-builder/queries";
import FloatingNavbar from "@/components/FloatingNavbar";
import StudioMediaReveal from "@/components/StudioMediaReveal";
import StudioSection from "@/components/StudioSection";
import PortfolioGrid from "@/components/PortfolioGrid";
import Footer from "@/components/Footer";
import PreloadScreen from "@/components/PreloadScreen";
import { CasesSectionProvider } from "@/contexts/CasesSectionContext";
import { ContactModalProvider } from "@/contexts/ContactModalContext";

const STALE = 2 * 60 * 1000;

const Index = () => {
  const [studioQuery, casesQuery] = useQueries({
    queries: [
      {
        queryKey: ["studio-reveal-display"],
        queryFn: getStudioRevealDisplayItems,
        staleTime: STALE,
      },
      {
        queryKey: ["cases", "public"],
        queryFn: getPublicCases,
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  const isLoading = studioQuery.isLoading || casesQuery.isLoading;
  const [showPreload, setShowPreload] = React.useState(true);

  // Dados em cache no mount: não mostra preload
  React.useLayoutEffect(() => {
    if (!isLoading) setShowPreload(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- só no mount

  return (
    <ContactModalProvider>
      <CasesSectionProvider>
        <main className="bg-background text-foreground min-h-screen flex flex-col">
          <FloatingNavbar />
          <div className="flex-1 flex flex-col min-h-0">
            <StudioMediaReveal />
            <StudioSection />
            <PortfolioGrid />
          </div>
          <Footer />
        </main>
        {showPreload && (
          <PreloadScreen
            isLoading={isLoading}
            onComplete={() => setShowPreload(false)}
          />
        )}
      </CasesSectionProvider>
    </ContactModalProvider>
  );
};

export default Index;
