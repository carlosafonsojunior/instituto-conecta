import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    document.title = "Painel Admin | IPASMA";
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Informe o e-mail.");
      return;
    }
    if (!password) {
      toast.error("Informe a senha.");
      return;
    }
    setSigning(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      toast.error("E-mail ou senha inválidos.");
      setSigning(false);
    }
  }

  return (
    <SiteLayout>
      <section className="container py-24 max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-sm shadow-elegant p-10"
        >
          <span className="gold-divider mb-4" />
          <h1 className="font-display text-3xl text-primary mb-3 text-center">Painel Admin</h1>
          <p className="text-muted-foreground text-sm mb-8 text-center">
            Acesso restrito à equipe do IPASMA.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="ipasmant@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={signing} size="lg" className="w-full mt-8">
            {signing ? "Entrando…" : "Entrar"}
          </Button>
          <p className="text-xs text-muted-foreground mt-6 text-center">
            Apenas e-mails autorizados pelo IPASMA podem acessar o painel.
          </p>
        </form>
      </section>
    </SiteLayout>
  );
};

export default Auth;
