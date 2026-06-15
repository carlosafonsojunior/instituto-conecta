import { Link } from "react-router-dom";
import { useInstituteInfo } from "@/hooks/useInstituteInfo";
import ipasmaLogo from "@/assets/ipasma-logo.png.asset.json";

export function SiteFooter() {
  const { data: info } = useInstituteInfo();

  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary-foreground/95 p-1">
              <img src={ipasmaLogo.url} alt="IPASMA" className="h-full w-full object-contain" />
            </div>
            <div className="font-display text-lg">{info?.name ?? "IPASMA"}</div>
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
            <li>
              <a
                href="https://wa.me/552737581758?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20o%20IPASMA."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#25D366] transition-colors"
              >
                WhatsApp: (27) 3758-1758
              </a>
            </li>
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
