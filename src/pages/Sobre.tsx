import { SiteLayout } from "@/components/SiteLayout";
import { useInstituteInfo } from "@/hooks/useInstituteInfo";
import { useEffect } from "react";

const Sobre = () => {
  const { data: info, isLoading } = useInstituteInfo();

  useEffect(() => {
    document.title = "Sobre o Instituto | Previdência Própria";
  }, []);

  return (
    <SiteLayout>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">Institucional</span>
          <h1 className="font-display text-5xl md:text-6xl mt-4">Sobre o Instituto</h1>
        </div>
      </section>

      <section className="container py-16 max-w-4xl">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : info ? (
          <div className="space-y-12">
            <div>
              <span className="gold-divider mb-4" />
              <h2 className="font-display text-3xl text-primary mb-4">Quem somos</h2>
              <p className="text-foreground/85 leading-relaxed text-lg whitespace-pre-line">{info.about}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 bg-gradient-paper p-8 rounded-sm border border-border">
              {[
                { label: "Missão", text: info.mission },
                { label: "Visão", text: info.vision },
                { label: "Valores", text: info.values_text },
              ].map((b) => b.text && (
                <div key={b.label}>
                  <h3 className="font-display text-xl text-primary mb-3">{b.label}</h3>
                  <p className="text-foreground/80 leading-relaxed text-sm">{b.text}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 text-sm">
              {info.president_name && (
                <div className="border-l-2 border-accent pl-4">
                  <div className="text-muted-foreground uppercase text-xs tracking-wider">Presidência</div>
                  <div className="font-medium text-foreground mt-1">{info.president_name}</div>
                </div>
              )}
              {info.cnpj && (
                <div className="border-l-2 border-accent pl-4">
                  <div className="text-muted-foreground uppercase text-xs tracking-wider">CNPJ</div>
                  <div className="font-medium text-foreground mt-1">{info.cnpj}</div>
                </div>
              )}
              {info.address && (
                <div className="border-l-2 border-accent pl-4">
                  <div className="text-muted-foreground uppercase text-xs tracking-wider">Endereço</div>
                  <div className="font-medium text-foreground mt-1">{info.address}</div>
                </div>
              )}
              {info.business_hours && (
                <div className="border-l-2 border-accent pl-4">
                  <div className="text-muted-foreground uppercase text-xs tracking-wider">Atendimento</div>
                  <div className="font-medium text-foreground mt-1">{info.business_hours}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Informações ainda não cadastradas.</p>
        )}
      </section>
    </SiteLayout>
  );
};

export default Sobre;
