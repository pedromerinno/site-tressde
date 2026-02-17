import FloatingNavbar from "@/components/FloatingNavbar";
import PortfolioHero from "@/components/PortfolioHero";
import StudioMediaReveal from "@/components/StudioMediaReveal";
import StudioSection from "@/components/StudioSection";
import PortfolioGrid from "@/components/PortfolioGrid";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { CasesSectionProvider } from "@/contexts/CasesSectionContext";

const Index = () => {
  return (
    <CasesSectionProvider>
      <main className="bg-background text-foreground min-h-screen">
        <FloatingNavbar />
      <PortfolioHero />
      <StudioMediaReveal />
      <StudioSection />
      <PortfolioGrid />
      <FinalCTA />
      <Footer />
    </main>
    </CasesSectionProvider>
  );
};

export default Index;
