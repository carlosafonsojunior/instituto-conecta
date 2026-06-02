import { SiteLayout } from "@/components/SiteLayout";
import { useNewsBySlug } from "@/hooks/useNews";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";

const NoticiaDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: news, isLoading } = useNewsBySlug(slug);

  useEffect(() => {
    if (news) document.title = `${news.title} | Instituto de Previdência`;
  }, [news]);

  return (
    <SiteLayout>
      <article className="container py-12 max-w-3xl">
        <Link to="/noticias" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para notícias
        </Link>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : !news ? (
          <p className="text-muted-foreground">Notícia não encontrada.</p>
        ) : (
          <>
            <header className="mb-10 border-b border-border pb-8">
              <time className="text-xs uppercase tracking-[0.2em] text-accent">
                {format(new Date(news.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </time>
              <h1 className="font-display text-4xl md:text-5xl text-primary mt-4 leading-tight">{news.title}</h1>
              {news.excerpt && (
                <p className="text-lg text-muted-foreground mt-5 leading-relaxed">{news.excerpt}</p>
              )}
              {news.author_name && (
                <p className="text-sm text-foreground/70 mt-5">Por <span className="font-medium">{news.author_name}</span></p>
              )}
            </header>

            {news.cover_image_url && (
              <img src={news.cover_image_url} alt={news.title} className="w-full rounded-sm mb-10 shadow-card" />
            )}

            <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-primary prose-p:text-foreground/85 prose-p:leading-relaxed">
              {news.content.split(/\n\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {(news as any).attachment_url && (
              <a
                href={(news as any).attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-sm border border-border bg-card hover:bg-muted transition-colors text-sm font-medium text-primary"
              >
                <FileText className="h-4 w-4 text-accent" />
                Baixar documento anexo (PDF)
              </a>
            )}
          </>
        )}
      </article>
    </SiteLayout>
  );
};

export default NoticiaDetalhe;
