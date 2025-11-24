import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, User, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface EventWithStats {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  projectId: string | null;
  teacherId: string;
  teacherName: string;
  statistics: {
    accepted: number;
    rejected: number;
    pending: number;
    total: number;
  };
  createdAt: string;
}

export default function CoordinatorCalendar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: events, isLoading } = useQuery<EventWithStats[]>({
    queryKey: ['/api/events/coordinator/all'],
  });

  const sortedEvents = events?.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  }) || [];

  const teachers = Array.from(new Set(sortedEvents.map(e => e.teacherName)));

  const filteredEvents = sortedEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeacher = filterTeacher === "all" || event.teacherName === filterTeacher;
    
    let matchesStatus = true;
    if (filterStatus === "pending") {
      matchesStatus = event.statistics.pending > 0;
    } else if (filterStatus === "accepted") {
      matchesStatus = event.statistics.accepted > 0;
    } else if (filterStatus === "rejected") {
      matchesStatus = event.statistics.rejected > 0;
    }

    return matchesSearch && matchesTeacher && matchesStatus;
  });

  const totalEvents = sortedEvents.length;
  const totalResponses = sortedEvents.reduce((sum, e) => sum + e.statistics.total, 0);
  const totalAccepted = sortedEvents.reduce((sum, e) => sum + e.statistics.accepted, 0);
  const totalPending = sortedEvents.reduce((sum, e) => sum + e.statistics.pending, 0);

  return (
    <div className="animate-fade-in space-y-8" data-testid="page-coordinator-calendar">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Calendário de Eventos</h2>
        <p className="text-muted-foreground">
          Acompanhe todos os eventos agendados pelos professores e suas taxas de participação
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Eventos</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-total-events">{totalEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Respostas Recebidas</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-total-responses">{totalResponses}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Confirmados</CardDescription>
            <CardTitle className="text-3xl text-green-600" data-testid="text-total-accepted">{totalAccepted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600" data-testid="text-total-pending">{totalPending}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar por título ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div>
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger data-testid="select-teacher-filter">
                  <SelectValue placeholder="Filtrar por professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os professores</SelectItem>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Com pendentes</SelectItem>
                  <SelectItem value="accepted">Com aceitos</SelectItem>
                  <SelectItem value="rejected">Com rejeitados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
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
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterTeacher !== "all" || filterStatus !== "all"
                ? "Tente ajustar os filtros de busca."
                : "Quando professores agendarem eventos, eles aparecerão aqui."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const eventDate = new Date(`${event.date}T${event.time}`);
            const isPast = eventDate < new Date();
            const acceptanceRate = event.statistics.total > 0 
              ? Math.round((event.statistics.accepted / event.statistics.total) * 100)
              : 0;
            
            return (
              <Card 
                key={event.id} 
                className="hover-elevate" 
                data-testid={`card-event-${event.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </CardTitle>
                      <CardDescription>
                        {event.description || 'Sem descrição'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" data-testid={`badge-teacher-${event.id}`}>
                        <User className="h-3 w-3 mr-1" />
                        {event.teacherName}
                      </Badge>
                      {isPast && (
                        <Badge variant="secondary">Encerrado</Badge>
                      )}
                    </div>
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

                  {/* Statistics */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Estatísticas de Participação</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Total</div>
                        <div className="text-lg font-bold" data-testid={`text-stat-total-${event.id}`}>
                          {event.statistics.total}
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                        <div className="text-xs text-green-700 dark:text-green-400 mb-1">Aceitos</div>
                        <div className="text-lg font-bold text-green-700 dark:text-green-400" data-testid={`text-stat-accepted-${event.id}`}>
                          {event.statistics.accepted}
                        </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
                        <div className="text-xs text-red-700 dark:text-red-400 mb-1">Rejeitados</div>
                        <div className="text-lg font-bold text-red-700 dark:text-red-400" data-testid={`text-stat-rejected-${event.id}`}>
                          {event.statistics.rejected}
                        </div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
                        <div className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">Pendentes</div>
                        <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400" data-testid={`text-stat-pending-${event.id}`}>
                          {event.statistics.pending}
                        </div>
                      </div>
                    </div>
                    {event.statistics.total > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">
                          Taxa de aceitação: <span className="font-semibold">{acceptanceRate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${acceptanceRate}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
