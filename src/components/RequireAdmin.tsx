import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <SiteLayout>
        <div className="container py-24 text-center text-muted-foreground">Verificando acesso…</div>
      </SiteLayout>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container py-24 max-w-lg text-center">
          <span className="gold-divider mb-4" />
          <h1 className="font-display text-3xl text-primary mb-3">Acesso negado</h1>
          <p className="text-muted-foreground">
            Sua conta foi reconhecida, mas não possui permissão de administrador. Entre em contato com a administração do Instituto para solicitar acesso.
          </p>
          <p className="text-xs text-muted-foreground mt-6">Seu ID de usuário: <code className="px-2 py-0.5 bg-muted rounded">{user.id}</code></p>
        </div>
      </SiteLayout>
    );
  }
  return <>{children}</>;
}
