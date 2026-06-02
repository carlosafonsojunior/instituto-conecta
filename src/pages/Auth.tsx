import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cpfToEmail, formatCpf, onlyDigits } from "@/lib/cpf";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    document.title = "Acesso restrito | IPASMA";
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = onlyDigits(cpf);
    if (digits.length !== 11) {
      toast.error("Informe um CPF válido (11 dígitos).");
      return;
    }
    if (!password) {
      toast.error("Informe a senha.");
      return;
    }
    setSigning(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: cpfToEmail(digits),
      password,
    });
    if (error) {
      toast.error("CPF ou senha inválidos.");
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
          <h1 className="font-display text-3xl text-primary mb-3 text-center">Acesso restrito</h1>
          <p className="text-muted-foreground text-sm mb-8 text-center">
            Área exclusiva para administradores cadastrados do IPASMA.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                inputMode="numeric"
                autoComplete="username"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                maxLength={14}
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
            Apenas CPFs cadastrados pelo IPASMA podem acessar o painel.
          </p>
        </form>
      </section>
    </SiteLayout>
  );
};

export default Auth;
