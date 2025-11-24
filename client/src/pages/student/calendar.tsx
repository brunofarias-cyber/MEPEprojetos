import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Check, X } from "lucide-react";
import { format } from "date-fns";
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

  const studentId = user?.roleData?.id;

  const { data: events, isLoading } = useQuery<EventWithResponse[]>({
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
        title: variables.status === 'accepted' ? 'Evento aceito!' : 'Evento rejeitado',
        description: variables.status === 'accepted' 
          ? 'Você confirmou sua participação no evento.'
          : 'Você declinou o convite para este evento.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível responder ao evento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const sortedEvents = events?.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  }) || [];

  const handleResponse = (eventId: string, status: 'accepted' | 'rejected') => {
    respondMutation.mutate({ eventId, status });
  };

  return (
    <div className="animate-fade-in space-y-8" data-testid="page-student-calendar">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Calendário de Reuniões</h2>
        <p className="text-muted-foreground">
          Visualize e responda aos convites de reuniões presenciais dos seus projetos
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum evento agendado
            </h3>
            <p className="text-muted-foreground text-center">
              Quando seus professores agendarem reuniões, elas aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((event) => {
            const eventDate = new Date(`${event.date}T${event.time}`);
            const isPast = eventDate < new Date();
            
            return (
              <Card 
                key={event.id} 
                className="hover-elevate" 
                data-testid={`card-event-${event.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </CardTitle>
                      <CardDescription>
                        {event.description || 'Sem descrição'}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        event.responseStatus === 'accepted' ? 'default' :
                        event.responseStatus === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                      data-testid={`badge-status-${event.id}`}
                    >
                      {event.responseStatus === 'accepted' && 'Aceito'}
                      {event.responseStatus === 'rejected' && 'Rejeitado'}
                      {event.responseStatus === 'pending' && 'Pendente'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span data-testid={`text-event-date-${event.id}`}>
                        {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span data-testid={`text-event-time-${event.id}`}>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span data-testid={`text-event-location-${event.id}`}>{event.location}</span>
                    </div>
                  </div>

                  {!isPast && event.responseStatus === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleResponse(event.id, 'accepted')}
                        disabled={respondMutation.isPending}
                        className="flex-1"
                        data-testid={`button-accept-event-${event.id}`}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aceitar
                      </Button>
                      <Button
                        onClick={() => handleResponse(event.id, 'rejected')}
                        disabled={respondMutation.isPending}
                        variant="outline"
                        className="flex-1"
                        data-testid={`button-reject-event-${event.id}`}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}

                  {!isPast && event.responseStatus !== 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleResponse(event.id, event.responseStatus === 'accepted' ? 'rejected' : 'accepted')}
                        disabled={respondMutation.isPending}
                        variant="outline"
                        className="flex-1"
                        data-testid={`button-change-response-${event.id}`}
                      >
                        {event.responseStatus === 'accepted' ? 'Alterar para Rejeitado' : 'Alterar para Aceito'}
                      </Button>
                    </div>
                  )}

                  {isPast && (
                    <p className="text-sm text-muted-foreground italic pt-2">
                      Este evento já ocorreu
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
