import { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { Link } from "react-router-dom";
import { Landmark, Newspaper, Settings, LogOut, ExternalLink, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent text-accent-foreground">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-base">Painel Admin</div>
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Instituto</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/admin"
            end
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground transition"
            activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
          >
            <Newspaper className="h-4 w-4" /> Notícias
          </NavLink>
          <NavLink
            to="/admin/instituto"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground transition"
            activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
          >
            <Settings className="h-4 w-4" /> Informações do Instituto
          </NavLink>
          <NavLink
            to="/admin/senha"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground transition"
            activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
          >
            <KeyRound className="h-4 w-4" /> Alterar senha
          </NavLink>
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <Link to="/" className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-accent">
            <ExternalLink className="h-3 w-3" /> Ver site público
          </Link>
          <div className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</div>
          <Button onClick={signOut} variant="outline" size="sm" className="w-full bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between">
          <Link to="/admin" className="font-display">Painel Admin</Link>
          <Button onClick={signOut} variant="ghost" size="sm" className="text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
