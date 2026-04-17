import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";
import { useInstituteInfo } from "@/hooks/useInstituteInfo";

export function SiteFooter() {
  const { data: info } = useInstituteInfo();

  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent text-accent-foreground">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="font-display text-lg">{info?.name ?? "Instituto de Previdência"}</div>
          </div>
          <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-sm">
            {info?.short_description}
          </p>
        </div>

        <div>
          <h4 className="font-display text-base mb-4 text-accent">Navegação</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/" className="hover:text-accent transition-colors">Início</Link></li>
            <li><Link to="/sobre" className="hover:text-accent transition-colors">Sobre o Instituto</Link></li>
            <li><Link to="/noticias" className="hover:text-accent transition-colors">Notícias</Link></li>
            <li><Link to="/contato" className="hover:text-accent transition-colors">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base mb-4 text-accent">Contato</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            {info?.address && <li>{info.address}</li>}
            {info?.phone && <li>Tel: {info.phone}</li>}
            {info?.email && <li>E-mail: {info.email}</li>}
            {info?.business_hours && <li>{info.business_hours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container py-5 text-xs text-primary-foreground/60 flex flex-col sm:flex-row gap-2 justify-between">
          <span>© {new Date().getFullYear()} {info?.name}. Todos os direitos reservados.</span>
          <span>Portal institucional</span>
        </div>
      </div>
    </footer>
  );
}
