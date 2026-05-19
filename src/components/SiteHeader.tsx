import { NavLink } from "@/components/NavLink";
import { Link } from "react-router-dom";
import { Landmark, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Início", end: true },
  { to: "/sobre", label: "Sobre" },
  { to: "/noticias", label: "Notícias" },
  { to: "/agenda", label: "Agenda" },
  { to: "/contato", label: "Contato" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-sm">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold text-primary">Instituto de Previdência</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Regime Próprio</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className="px-4 py-2 text-sm font-medium text-foreground/75 hover:text-primary transition-colors"
              activeClassName="text-primary border-b-2 border-accent"
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="ml-3">
              <Link to="/admin">Painel Admin</Link>
            </Button>
          )}
          {!user && (
            <Button asChild variant="ghost" size="sm" className="ml-3">
              <Link to="/auth">Acesso restrito</Link>
            </Button>
          )}
        </nav>

        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container flex flex-col py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className="px-2 py-3 text-sm font-medium text-foreground/80"
                activeClassName="text-primary"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            {isAdmin ? (
              <Link to="/admin" className="px-2 py-3 text-sm font-medium text-accent" onClick={() => setOpen(false)}>
                Painel Admin
              </Link>
            ) : (
              !user && (
                <Link to="/auth" className="px-2 py-3 text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>
                  Acesso restrito
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
