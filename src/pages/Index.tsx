import { SiteLayout } from "@/components/SiteLayout";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, FileText, Users, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstituteInfo } from "@/hooks/useInstituteInfo";
import { useNewsList } from "@/hooks/useNews";
import heroImage from "@/assets/hero-institute.jpg";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const { data: info } = useInstituteInfo();
  const { data: news } = useNewsList(3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImage}
            alt="Fachada institucional"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="container py-28 md:py-40 relative">
          <div className="max-w-2xl text-primary-foreground animate-fade-up">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent mb-6">
              <span className="gold-divider !bg-accent" /> Portal Institucional
            </span>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6">
              {info?.name ?? "Instituto de Previdência Própria"}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/85 leading-relaxed mb-8 max-w-xl">
              {info?.short_description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold">
                <Link to="/sobre">Conheça o Instituto <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent">
                <Link to="/noticias">Últimas notícias</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="gold-divider mb-4" />
          <h2 className="font-display text-4xl text-primary mb-4">Nosso compromisso</h2>
          <p className="text-muted-foreground leading-relaxed">
            Atuamos com responsabilidade na gestão dos recursos previdenciários dos servidores públicos.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Segurança", desc: "Gestão técnica e responsável dos recursos previdenciários, com supervisão constante." },
            { icon: FileText, title: "Transparência", desc: "Prestação de contas e acesso público às informações financeiras e atuariais." },
            { icon: Users, title: "Compromisso social", desc: "Atendimento humano aos servidores ativos, aposentados e pensionistas." },
          ].map((p) => (
            <div key={p.title} className="bg-card border border-border rounded-sm p-8 shadow-card hover:shadow-elegant transition-all">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-accent-soft text-accent mb-5">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl text-primary mb-3">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSÃO/VALORES */}
      {info && (
        <section className="bg-gradient-paper py-20 border-y border-border/60">
          <div className="container grid gap-12 md:grid-cols-3">
            {[
              { label: "Missão", text: info.mission },
              { label: "Visão", text: info.vision },
              { label: "Valores", text: info.values_text },
            ].map((b) => b.text && (
              <div key={b.label}>
                <span className="gold-divider mb-3" />
                <h3 className="font-display text-2xl text-primary mb-3">{b.label}</h3>
                <p className="text-foreground/80 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NOTÍCIAS */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="gold-divider mb-4" />
            <h2 className="font-display text-4xl text-primary">Últimas notícias</h2>
          </div>
          <Button asChild variant="ghost" className="text-primary">
            <Link to="/noticias">Ver todas <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {news?.map((n) => (
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
                <h3 className="font-display text-xl text-primary mt-2 mb-2 leading-snug group-hover:text-accent transition-colors">
                  {n.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{n.excerpt}</p>
              </div>
            </Link>
          ))}
          {news && news.length === 0 && (
            <p className="text-muted-foreground col-span-3 text-center py-12">Nenhuma notícia publicada ainda.</p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
