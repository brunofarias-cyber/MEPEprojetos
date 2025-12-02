import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface EventWithResponse {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  projectId: string | null;
  teacherId: string;
  responseStatus: 'pending' | 'accepted' | 'rejected';
  respondedAt: string | null;
  createdAt: string;
}

export default function StudentCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const studentId = user?.roleData?.id;

  const { data: events = [], isLoading } = useQuery<EventWithResponse[]>({
    queryKey: ['/api/events/student', studentId],
    enabled: !!studentId,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'accepted' | 'rejected' }) => {
      return await apiRequest(`/api/events/${eventId}/response`, {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          status,
        }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/student', studentId] });
      toast({
        title: variables.status === 'accepted' ? "Presença confirmada" : "Presença recusada",
        description: "Sua resposta foi registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar sua resposta.",
        variant: "destructive",
      });
    },
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Recusado</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <div className="animate-fade-in space-y-8" data-testid="page-student-calendar">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendário de Eventos</h1>
        <p className="text-muted-foreground">
          Acompanhe reuniões e confirme sua presença
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
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
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
                    <Card key={event.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold text-sm">{event.title}</div>
                            {getStatusBadge(event.responseStatus)}
                          </div>

                          {event.description && (
                            <p className="text-xs text-muted-foreground">{event.description}</p>
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
                          </div>

                          {event.responseStatus === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => respondMutation.mutate({ eventId: event.id, status: 'accepted' })}
                                disabled={respondMutation.isPending}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => respondMutation.mutate({ eventId: event.id, status: 'rejected' })}
                                disabled={respondMutation.isPending}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Recusar
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
