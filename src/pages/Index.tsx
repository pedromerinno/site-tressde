import FloatingNavbar from "@/components/FloatingNavbar";
import StudioMediaReveal from "@/components/StudioMediaReveal";
import StudioSection from "@/components/StudioSection";
import PortfolioGrid from "@/components/PortfolioGrid";
import Footer from "@/components/Footer";
import { CasesSectionProvider } from "@/contexts/CasesSectionContext";
import { ContactModalProvider } from "@/contexts/ContactModalContext";

const Index = () => {
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
      </CasesSectionProvider>
    </ContactModalProvider>
  );
};

export default Index;
