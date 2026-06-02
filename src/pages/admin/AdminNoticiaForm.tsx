import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { slugify } from "@/lib/slug";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const newsSchema = z.object({
  title: z.string().trim().min(3, "Título muito curto").max(200),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  content: z.string().trim().min(10, "Conteúdo muito curto").max(20000),
  author_name: z.string().trim().max(120).optional().or(z.literal("")),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  attachment_url: z.string().url().optional().or(z.literal("")),
  published: z.boolean(),
});

const AdminNoticiaForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", author_name: "", cover_image_url: "", attachment_url: "", published: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    document.title = isEdit ? "Editar notícia" : "Nova notícia";
    if (isEdit) {
      supabase.from("news").select("*").eq("id", id!).maybeSingle().then(({ data, error }) => {
        if (error) toast.error(error.message);
        if (data) setForm({
          title: data.title, excerpt: data.excerpt ?? "", content: data.content,
          author_name: data.author_name ?? "", cover_image_url: data.cover_image_url ?? "",
          attachment_url: (data as any).attachment_url ?? "",
          published: data.published,
        });
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  async function uploadFile(file: File, kind: "image" | "pdf") {
    if (kind === "image") {
      const okType = /^image\/(jpe?g|png|webp)$/i.test(file.type);
      if (!okType) { toast.error("Envie uma imagem JPG, PNG ou WEBP."); return; }
      setUploading(true);
    } else {
      if (file.type !== "application/pdf") { toast.error("Envie um arquivo PDF."); return; }
      setUploadingPdf(true);
    }
    const ext = file.name.split(".").pop();
    const path = `${user?.id}/${kind}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("news-images").upload(path, file, {
      contentType: file.type,
    });
    if (error) {
      toast.error("Erro no upload: " + error.message);
      setUploading(false); setUploadingPdf(false);
      return;
    }
    const { data } = supabase.storage.from("news-images").getPublicUrl(path);
    if (kind === "image") {
      setForm((f) => ({ ...f, cover_image_url: data.publicUrl }));
      toast.success("Imagem enviada");
    } else {
      setForm((f) => ({ ...f, attachment_url: data.publicUrl }));
      toast.success("PDF enviado");
    }
    setUploading(false); setUploadingPdf(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = newsSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      author_name: form.author_name.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      attachment_url: form.attachment_url.trim() || null,
      published: form.published,
    };

    if (isEdit) {
      const { error } = await supabase.from("news").update(payload).eq("id", id!);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Notícia atualizada");
    } else {
      const baseSlug = slugify(form.title);
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      const { error } = await supabase.from("news").insert({
        ...payload, slug, created_by: user?.id, published_at: new Date().toISOString(),
      });
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Notícia publicada");
    }
    setSaving(false);
    navigate("/admin");
  }

  if (loading) {
    return <AdminLayout><div className="text-muted-foreground">Carregando…</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Link>
      <h1 className="font-display text-3xl text-primary mb-8">
        {isEdit ? "Editar notícia" : "Nova notícia"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 bg-card border border-border rounded-sm p-8 shadow-card">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="excerpt">Resumo</Label>
          <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} maxLength={300} rows={2} className="mt-1.5" placeholder="Breve descrição que aparece nas listagens" />
        </div>

        <div>
          <Label htmlFor="content">Conteúdo *</Label>
          <Textarea id="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={12} className="mt-1.5" placeholder="Separe parágrafos com linha em branco" />
        </div>

        <div>
          <Label htmlFor="author">Autor</Label>
          <Input id="author" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} maxLength={120} className="mt-1.5" />
        </div>

        <div>
          <Label>Imagem de capa (JPG, PNG ou WEBP)</Label>
          <div className="mt-1.5 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-background hover:bg-muted cursor-pointer text-sm">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Enviando…" : "Enviar imagem"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "image")} disabled={uploading} />
            </label>
            {form.cover_image_url && <span className="text-xs text-muted-foreground">Imagem carregada ✓</span>}
          </div>
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt="Capa" className="mt-3 max-h-40 rounded-sm border border-border" />
          )}
        </div>

        <div>
          <Label>Anexo em PDF (opcional)</Label>
          <div className="mt-1.5 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-background hover:bg-muted cursor-pointer text-sm">
              {uploadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploadingPdf ? "Enviando…" : "Enviar PDF"}
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "pdf")} disabled={uploadingPdf} />
            </label>
            {form.attachment_url && (
              <a href={form.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
                Abrir PDF anexado
              </a>
            )}
            {form.attachment_url && (
              <button type="button" onClick={() => setForm({ ...form, attachment_url: "" })} className="text-xs text-destructive hover:underline">
                Remover
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Switch id="published" checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
          <Label htmlFor="published" className="cursor-pointer">Publicada (visível no site)</Label>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin")}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Publicar"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminNoticiaForm;
