import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CaseCursorStyles } from "@/components/CaseCursorStyles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Servicos from "./pages/Servicos";
import CasePage from "./pages/Case";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminClients from "./pages/admin/AdminClients";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCases from "./pages/admin/AdminCases";
import CaseEditor from "./pages/admin/CaseEditor";
import CaseBuilder from "./pages/admin/CaseBuilder";
import CasePreview from "./pages/admin/CasePreview";
import AdminSite from "./pages/admin/AdminSite";
import { SiteMeta } from "@/components/SiteMeta";
import CookieBanner from "@/components/CookieBanner";
import { LanguageProvider } from "@/contexts/LanguageContext";

const queryClient = new QueryClient();

function scrollToTopSync() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

/** Nova rota sempre no topo: sem rolagem visível, sem restauração do browser. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (typeof window.history?.scrollRestoration === "string") {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    scrollToTopSync();
    const raf = requestAnimationFrame(() => scrollToTopSync());
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isPublic = !location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {isPublic && (
        <>
          <CookieBanner />
          <SiteMeta />
        </>
      )}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/cases/:slug" element={<CasePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="clientes" element={<AdminClients />} />
          <Route path="cases/novo" element={<CaseEditor />} />
          <Route path="cases/:id/builder" element={<CaseBuilder />} />
          <Route path="cases/:id/preview" element={<CasePreview />} />
          <Route path="cases/:id/editar" element={<Navigate to="../builder" replace />} />
          <Route path="cases" element={<AdminCases />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="configuracoes" element={<AdminSite />} />
          <Route path="site" element={<Navigate to="/admin/configuracoes" replace />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CaseCursorStyles />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
