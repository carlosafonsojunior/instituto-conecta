import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminSenha() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível alterar a senha: " + error.message);
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success("Senha alterada com sucesso.");
  }

  return (
    <AdminLayout>
      <div className="max-w-lg">
        <span className="gold-divider mb-4" />
        <h1 className="font-display text-3xl text-primary mb-2">Alterar senha</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Defina uma nova senha para o seu acesso administrativo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-sm p-6">
          <div>
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando…" : "Alterar senha"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}