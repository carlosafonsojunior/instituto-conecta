import { SiteLayout } from "@/components/SiteLayout";
import { useNewsList } from "@/hooks/useNews";
import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";

const Noticias = () => {
  const { data: news, isLoading } = useNewsList();

  useEffect(() => {
    document.title = "Notícias | Instituto de Previdência";
  }, []);

  return (
    <SiteLayout>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">Comunicação</span>
          <h1 className="font-display text-5xl md:text-6xl mt-4">Notícias</h1>
          <p className="text-primary-foreground/75 mt-4 max-w-xl">
            Acompanhe as últimas informações, comunicados e ações do Instituto.
          </p>
        </div>
      </section>

      <section className="container py-16">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : news && news.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <Link
                key={n.id}
                to={`/noticias/${n.slug}`}
                className="group bg-card border border-border rounded-sm overflow-hidden shadow-card hover:shadow-elegant transition-all"
              >
                <div className="aspect-[16/10] bg-muted overflow-hidden">
                  {n.cover_image_url ? (
                    <img src={n.cover_image_url} alt={n.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-full w-full bg-gradient-hero flex items-center justify-center">
                      <Landmark className="h-12 w-12 text-accent/60" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <time className="text-xs uppercase tracking-wider text-accent">
                    {format(new Date(n.published_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </time>
                  <h2 className="font-display text-xl text-primary mt-2 mb-2 leading-snug group-hover:text-accent transition-colors">
                    {n.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3">{n.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-20">Nenhuma notícia publicada ainda.</p>
        )}
      </section>
    </SiteLayout>
  );
};

export default Noticias;
