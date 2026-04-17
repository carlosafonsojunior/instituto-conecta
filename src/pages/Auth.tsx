import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    document.title = "Acesso restrito | Instituto";
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  async function signIn() {
    setSigning(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin",
    });
    if (error) {
      toast.error("Não foi possível entrar: " + error.message);
      setSigning(false);
    }
  }

  return (
    <SiteLayout>
      <section className="container py-24 max-w-md">
        <div className="bg-card border border-border rounded-sm shadow-elegant p-10 text-center">
          <span className="gold-divider mb-4" />
          <h1 className="font-display text-3xl text-primary mb-3">Acesso administrativo</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Esta área é restrita à administração do Instituto. Entre com sua conta autorizada para gerenciar o conteúdo.
          </p>
          <Button onClick={signIn} disabled={signing} size="lg" className="w-full">
            {signing ? "Entrando…" : "Entrar com Google"}
          </Button>
          <p className="text-xs text-muted-foreground mt-6">
            Apenas usuários autorizados terão acesso ao painel administrativo.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Auth;
