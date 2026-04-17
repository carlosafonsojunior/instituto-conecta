import { SiteLayout } from "@/components/SiteLayout";
import { useInstituteInfo } from "@/hooks/useInstituteInfo";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useEffect } from "react";

const Contato = () => {
  const { data: info } = useInstituteInfo();

  useEffect(() => {
    document.title = "Contato | Instituto de Previdência";
  }, []);

  const items = [
    { icon: MapPin, label: "Endereço", value: info?.address },
    { icon: Phone, label: "Telefone", value: info?.phone },
    { icon: Mail, label: "E-mail", value: info?.email },
    { icon: Clock, label: "Atendimento", value: info?.business_hours },
  ];

  return (
    <SiteLayout>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">Fale conosco</span>
          <h1 className="font-display text-5xl md:text-6xl mt-4">Contato</h1>
          <p className="text-primary-foreground/75 mt-4 max-w-xl">
            Entre em contato com o Instituto pelos canais oficiais abaixo.
          </p>
        </div>
      </section>

      <section className="container py-16 max-w-3xl">
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((it) => it.value && (
            <div key={it.label} className="bg-card border border-border rounded-sm p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-accent-soft text-accent flex-shrink-0">
                  <it.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{it.label}</div>
                  <div className="font-medium text-foreground mt-1">{it.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Contato;
