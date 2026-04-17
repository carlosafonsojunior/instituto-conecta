import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAdmin } from "@/components/RequireAdmin";
import Index from "./pages/Index.tsx";
import Sobre from "./pages/Sobre.tsx";
import Noticias from "./pages/Noticias.tsx";
import NoticiaDetalhe from "./pages/NoticiaDetalhe.tsx";
import Contato from "./pages/Contato.tsx";
import Auth from "./pages/Auth.tsx";
import AdminNoticias from "./pages/admin/AdminNoticias.tsx";
import AdminNoticiaForm from "./pages/admin/AdminNoticiaForm.tsx";
import AdminInstituto from "./pages/admin/AdminInstituto.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/noticias/:slug" element={<NoticiaDetalhe />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<RequireAdmin><AdminNoticias /></RequireAdmin>} />
            <Route path="/admin/noticias/nova" element={<RequireAdmin><AdminNoticiaForm /></RequireAdmin>} />
            <Route path="/admin/noticias/:id/editar" element={<RequireAdmin><AdminNoticiaForm /></RequireAdmin>} />
            <Route path="/admin/instituto" element={<RequireAdmin><AdminInstituto /></RequireAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
