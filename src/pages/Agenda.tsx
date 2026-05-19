import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Trash2, Clock } from "lucide-react";

type Booking = {
  id: string;
  user_id: string;
  user_name: string;
  booking_date: string; // YYYY-MM-DD
  hour: number;
  note: string | null;
};

const WEEKDAYS = [
  { idx: 0, short: "Dom", label: "Domingo" },
  { idx: 1, short: "Seg", label: "Segunda" },
  { idx: 2, short: "Ter", label: "Terça" },
  { idx: 3, short: "Qua", label: "Quarta" },
  { idx: 4, short: "Qui", label: "Quinta" },
  { idx: 5, short: "Sex", label: "Sexta" },
  { idx: 6, short: "Sáb", label: "Sábado" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function fmtHour(h: number) {
  return `${pad(h)}:00`;
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Agenda() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [startHour, setStartHour] = useState<number>(9);
  const [endHour, setEndHour] = useState<number>(10);
  const [replicate, setReplicate] = useState(true);
  const [note, setNote] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (user) {
      const meta = (user.user_metadata || {}) as Record<string, string>;
      setDisplayName(meta.full_name || meta.name || user.email || "");
    }
  }, [user]);

  const monthStart = cursor;
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

  async function fetchBookings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("id, user_id, user_name, booking_date, hour, note")
      .gte("booking_date", ymd(monthStart))
      .lte("booking_date", ymd(monthEnd))
      .order("booking_date")
      .order("hour");
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao carregar agenda", description: error.message, variant: "destructive" });
      return;
    }
    setBookings((data || []) as Booking[]);
  }

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor.getFullYear(), cursor.getMonth()]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("bookings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchBookings();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor.getFullYear(), cursor.getMonth()]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const list = map.get(b.booking_date) || [];
      list.push(b);
      map.set(b.booking_date, list);
    }
    return map;
  }, [bookings]);

  const monthLabel = cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  function toggleWeekday(idx: number) {
    setSelectedWeekdays((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx].sort()
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ title: "Faça login para agendar", variant: "destructive" });
      return;
    }
    if (selectedWeekdays.length === 0) {
      toast({ title: "Selecione ao menos um dia da semana", variant: "destructive" });
      return;
    }
    if (endHour <= startHour) {
      toast({ title: "O horário final deve ser maior que o inicial", variant: "destructive" });
      return;
    }
    if (!displayName.trim()) {
      toast({ title: "Informe seu nome", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    // Build slots
    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);
    const rangeStart = cursor.getMonth() === startDay.getMonth() && cursor.getFullYear() === startDay.getFullYear()
      ? startDay
      : monthStart;
    const rangeEnd = replicate ? monthEnd : rangeStart;

    const rows: { user_id: string; user_name: string; booking_date: string; hour: number; note: string | null }[] = [];
    const d = new Date(rangeStart);
    while (d <= rangeEnd) {
      if (selectedWeekdays.includes(d.getDay())) {
        for (let h = startHour; h < endHour; h++) {
          rows.push({
            user_id: user.id,
            user_name: displayName.trim(),
            booking_date: ymd(d),
            hour: h,
            note: note.trim() || null,
          });
        }
      }
      d.setDate(d.getDate() + 1);
      if (!replicate) break;
    }

    if (rows.length === 0) {
      setSubmitting(false);
      toast({ title: "Nenhum slot disponível para os critérios selecionados", variant: "destructive" });
      return;
    }

    // Filter out conflicts client-side first (best-effort), then rely on DB unique constraint
    const conflictKeys = new Set(bookings.map((b) => `${b.booking_date}_${b.hour}`));
    const toInsert = rows.filter((r) => !conflictKeys.has(`${r.booking_date}_${r.hour}`));
    const skipped = rows.length - toInsert.length;

    let inserted = 0;
    if (toInsert.length > 0) {
      // Insert one-by-one to skip duplicates that slipped through
      for (const row of toInsert) {
        const { error } = await supabase.from("bookings").insert(row);
        if (!error) inserted++;
      }
    }

    setSubmitting(false);
    toast({
      title: "Agendamentos criados",
      description: `${inserted} slot(s) reservado(s)${skipped > 0 ? `, ${skipped} ignorado(s) por conflito` : ""}.`,
    });
    setNote("");
    fetchBookings();
  }

  async function handleDelete(id: string) {
    if (!confirm("Cancelar este agendamento?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao cancelar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Agendamento cancelado" });
    fetchBookings();
  }

  // Build calendar grid (weeks starting Sunday)
  const calendarCells = useMemo(() => {
    const firstWeekday = monthStart.getDay();
    const totalDays = monthEnd.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor, monthStart, monthEnd]);

  const todayKey = ymd(new Date());

  return (
    <SiteLayout>
      <section className="container py-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold text-primary">Agenda</h1>
          <p className="text-muted-foreground mt-2">
            Reserve horários em slots de 1 hora. Os agendamentos ficam visíveis para todos.
          </p>
        </div>

        {!authLoading && !user && (
          <Card className="mb-8 border-accent/40">
            <CardContent className="py-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm">Você precisa estar autenticado para criar um agendamento.</p>
              <Button asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Novo agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name">Seu nome</Label>
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Como deve aparecer na agenda"
                    disabled={!user}
                  />
                </div>

                <div>
                  <Label>Dias da semana</Label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {WEEKDAYS.map((w) => (
                      <label
                        key={w.idx}
                        className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedWeekdays.includes(w.idx)}
                          onCheckedChange={() => toggleWeekday(w.idx)}
                          disabled={!user}
                        />
                        <span className="text-xs">{w.short}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Início</Label>
                    <Select value={String(startHour)} onValueChange={(v) => setStartHour(Number(v))} disabled={!user}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {HOURS.slice(0, 23).map((h) => (
                          <SelectItem key={h} value={String(h)}>{fmtHour(h)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fim</Label>
                    <Select value={String(endHour)} onValueChange={(v) => setEndHour(Number(v))} disabled={!user}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {HOURS.slice(1).map((h) => (
                          <SelectItem key={h} value={String(h)}>{fmtHour(h)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  Serão criados slots de 1 hora entre o início e o fim.
                </p>

                <div className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <div className="text-sm font-medium">Replicar no mês</div>
                    <div className="text-xs text-muted-foreground">Aplica nos dias selecionados até o fim de {monthLabel}.</div>
                  </div>
                  <Switch checked={replicate} onCheckedChange={setReplicate} disabled={!user} />
                </div>

                <div>
                  <Label htmlFor="note">Observação (opcional)</Label>
                  <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} disabled={!user} />
                </div>

                <Button type="submit" className="w-full" disabled={!user || submitting}>
                  {submitting ? "Agendando..." : "Agendar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-display text-2xl text-primary capitalize">{monthLabel}</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
              {WEEKDAYS.map((w) => <div key={w.idx}>{w.short}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((d, i) => {
                if (!d) return <div key={i} className="min-h-[110px] rounded-md bg-muted/30" />;
                const key = ymd(d);
                const dayBookings = bookingsByDate.get(key) || [];
                const isToday = key === todayKey;
                return (
                  <div
                    key={i}
                    className={`min-h-[110px] rounded-md border p-1.5 flex flex-col gap-1 ${
                      isToday ? "border-accent bg-accent/5" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isToday ? "text-accent" : "text-foreground"}`}>
                        {d.getDate()}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">{dayBookings.length}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      {dayBookings.slice(0, 4).map((b) => {
                        const mine = user?.id === b.user_id;
                        const canDelete = mine || isAdmin;
                        return (
                          <div
                            key={b.id}
                            title={`${fmtHour(b.hour)} — ${b.user_name}${b.note ? ` (${b.note})` : ""}`}
                            className={`group flex items-center justify-between gap-1 rounded px-1 py-0.5 text-[10px] ${
                              mine ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"
                            }`}
                          >
                            <span className="flex items-center gap-1 truncate">
                              <Clock className="h-2.5 w-2.5 shrink-0" />
                              <span className="font-medium">{pad(b.hour)}h</span>
                              <span className="truncate opacity-80">{b.user_name}</span>
                            </span>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDelete(b.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Cancelar"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {dayBookings.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">+{dayBookings.length - 4} mais</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {loading && <p className="text-sm text-muted-foreground mt-3">Carregando...</p>}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}