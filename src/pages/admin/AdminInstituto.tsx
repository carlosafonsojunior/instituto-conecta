import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInstituteInfo } from "@/hooks/useInstituteInfo";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(200),
  short_description: z.string().trim().max(500).optional().or(z.literal("")),
  about: z.string().trim().max(5000).optional().or(z.literal("")),
  mission: z.string().trim().max(2000).optional().or(z.literal("")),
  vision: z.string().trim().max(2000).optional().or(z.literal("")),
  values_text: z.string().trim().max(2000).optional().or(z.literal("")),
  president_name: z.string().trim().max(200).optional().or(z.literal("")),
  cnpj: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  email: z.string().trim().max(200).optional().or(z.literal("")),
  business_hours: z.string().trim().max(200).optional().or(z.literal("")),
});

const AdminInstituto = () => {
  const { data: info, isLoading } = useInstituteInfo();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "Admin · Instituto"; }, []);
  useEffect(() => { if (info) setForm(info); }, [info]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form?.id) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("institute_info").update({
      name: form.name, short_description: form.short_description, about: form.about,
      mission: form.mission, vision: form.vision, values_text: form.values_text,
      president_name: form.president_name, cnpj: form.cnpj,
      address: form.address, phone: form.phone, email: form.email, business_hours: form.business_hours,
    }).eq("id", form.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Informações atualizadas");
    qc.invalidateQueries({ queryKey: ["institute_info"] });
  }

  if (isLoading || !form) {
    return <AdminLayout><div className="text-muted-foreground">Carregando…</div></AdminLayout>;
  }

  const field = (key: string, label: string, type: "input" | "textarea" = "input", rows = 4) => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      {type === "input" ? (
        <Input id={key} value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1.5" />
      ) : (
        <Textarea id={key} value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} rows={rows} className="mt-1.5" />
      )}
    </div>
  );

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl text-primary mb-2">Informações do Instituto</h1>
      <p className="text-muted-foreground text-sm mb-8">Edite os dados exibidos no site público.</p>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        <section className="bg-card border border-border rounded-sm p-8 shadow-card space-y-5">
          <h2 className="font-display text-xl text-primary">Identidade</h2>
          {field("name", "Nome do instituto")}
          {field("short_description", "Descrição curta (aparece no topo do site)", "textarea", 2)}
          {field("about", "Sobre o instituto", "textarea", 6)}
        </section>

        <section className="bg-card border border-border rounded-sm p-8 shadow-card space-y-5">
          <h2 className="font-display text-xl text-primary">Missão, Visão e Valores</h2>
          {field("mission", "Missão", "textarea", 3)}
          {field("vision", "Visão", "textarea", 3)}
          {field("values_text", "Valores", "textarea", 3)}
        </section>

        <section className="bg-card border border-border rounded-sm p-8 shadow-card space-y-5">
          <h2 className="font-display text-xl text-primary">Dados institucionais</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {field("president_name", "Presidente")}
            {field("cnpj", "CNPJ")}
          </div>
        </section>

        <section className="bg-card border border-border rounded-sm p-8 shadow-card space-y-5">
          <h2 className="font-display text-xl text-primary">Contato</h2>
          {field("address", "Endereço")}
          <div className="grid sm:grid-cols-2 gap-5">
            {field("phone", "Telefone")}
            {field("email", "E-mail")}
          </div>
          {field("business_hours", "Horário de atendimento")}
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminInstituto;
