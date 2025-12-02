import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, Clock, MapPin, User, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  projectId: string | null;
  teacherId: string;
  teacherName?: string;
  projectTitle?: string;
  createdAt: string;
}

interface ResponseSummary {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
}

export default function CoordinatorCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/all'],
  });

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
    const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
    return dateTimeA - dateTimeB;
  });

  // Get events for selected date
  const selectedDateEvents = sortedEvents.filter(event => {
    const eventDate = parseISO(event.date);
    return isSameDay(eventDate, selectedDate);
  });

  // Get dates with events for highlighting
  const datesWithEvents = Array.from(new Set(sortedEvents.map(e => e.date))).map(date => parseISO(date));

  // Calculate stats for selected date
  const todayStats = {
    total: selectedDateEvents.length,
    teachers: new Set(selectedDateEvents.map(e => e.teacherId)).size,
    projects: new Set(selectedDateEvents.filter(e => e.projectId).map(e => e.projectId)).size,
  };

  return (
    <div className="animate-fade-in space-y-8" data-testid="page-coordinator-calendar">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendário Geral</h1>
        <p className="text-muted-foreground">
          Visão completa de todos os eventos agendados
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando eventos...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(currentMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setCurrentMonth(today);
                      setSelectedDate(today);
                    }}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(currentMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{
                  hasEvents: datesWithEvents
                }}
                modifiersClassNames={{
                  hasEvents: "bg-primary/20 font-bold text-primary"
                }}
                className="rounded-md border"
                locale={ptBR}
              />
            </CardContent>
          </Card>

          {/* Events List for Selected Date */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total de Eventos</span>
                  <span className="font-bold">{todayStats.total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Professores</span>
                  <span className="font-bold">{todayStats.teachers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Projetos</span>
                  <span className="font-bold">{todayStats.projects}</span>
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Eventos do Dia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhum evento neste dia
                  </div>
                ) : (
                  selectedDateEvents.map((event) => {
                    const eventDate = new Date(`${event.date}T${event.time}`);

                    return (
                      <Card key={event.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="font-semibold text-sm">{event.title}</div>

                            {event.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {format(eventDate, "HH:mm")}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                              {event.teacherName && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <User className="w-3 h-3" />
                                  {event.teacherName}
                                </div>
                              )}
                              {event.projectTitle && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <TrendingUp className="w-3 h-3" />
                                  {event.projectTitle}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
