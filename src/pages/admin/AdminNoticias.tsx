import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useAllNewsAdmin } from "@/hooks/useNews";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const AdminNoticias = () => {
  const { data: news, isLoading } = useAllNewsAdmin();
  const qc = useQueryClient();
  const [toDelete, setToDelete] = useState<string | null>(null);

  useEffect(() => { document.title = "Admin · Notícias"; }, []);

  async function togglePublish(id: string, current: boolean) {
    const { error } = await supabase.from("news").update({ published: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(!current ? "Notícia publicada" : "Notícia despublicada");
    qc.invalidateQueries({ queryKey: ["news"] });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const { error } = await supabase.from("news").delete().eq("id", toDelete);
    if (error) return toast.error(error.message);
    toast.success("Notícia excluída");
    setToDelete(null);
    qc.invalidateQueries({ queryKey: ["news"] });
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-primary">Notícias</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie as notícias publicadas no portal.</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/admin/noticias/nova"><Plus className="h-4 w-4 mr-2" /> Nova notícia</Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Carregando…</div>
        ) : news && news.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Título</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Data</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {news.map((n) => (
                <tr key={n.id} className="border-t border-border hover:bg-muted/30 transition">
                  <td className="px-5 py-4">
                    <div className="font-medium text-foreground">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1">{n.excerpt}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    {format(new Date(n.published_at), "dd MMM yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-sm ${n.published ? "bg-accent-soft text-accent" : "bg-muted text-muted-foreground"}`}>
                      {n.published ? <><Eye className="h-3 w-3" /> Publicada</> : <><EyeOff className="h-3 w-3" /> Rascunho</>}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(n.id, n.published)}>
                      {n.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/admin/noticias/${n.id}/editar`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setToDelete(n.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            Nenhuma notícia ainda. <Link to="/admin/noticias/nova" className="text-accent hover:underline">Criar a primeira</Link>.
          </div>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir notícia?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminNoticias;
