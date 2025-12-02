import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Edit2, Trash2, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, isSameDay, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Project, Event, Teacher, Submission } from "@shared/schema";

const eventFormSchema = z.object({
  projectId: z.string().optional(),
  title: z.string().min(1, "Digite um título"),
  description: z.string().optional(),
  eventDate: z.string().min(1, "Selecione uma data"),
  eventTime: z.string().min(1, "Selecione um horário"),
  location: z.string().min(1, "Digite um local"),
  notifyStudents: z.boolean().default(false).optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function TeacherCalendar() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const { data: teacher, isLoading: isLoadingTeacher } = useQuery<Teacher>({
    queryKey: ["/api/me/teacher"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events/teacher", teacher?.id],
    enabled: !!teacher?.id,
  });

  // Combine events with project deadlines
  const combinedEvents = [
    ...events.map(e => ({ ...e, type: 'meeting' })),
    ...projects.filter(p => p.nextDeadline).map(p => {
      const deadlineDate = new Date(p.nextDeadline!);
      const isValidDate = !isNaN(deadlineDate.getTime());

      return {
        id: `deadline-${p.id}`,
        title: `Entrega: ${p.title}`,
        description: p.deadlineLabel || "Prazo de entrega do projeto",
        date: isValidDate ? deadlineDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: "23:59",
        location: "Online",
        projectId: p.id,
        type: 'deadline'
      };
    })
  ];

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      projectId: "",
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      location: "",
      notifyStudents: false,
    },
  });

  const editForm = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      projectId: "",
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      location: "",
      notifyStudents: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      if (!teacher?.id) throw new Error("Professor não identificado");

      const response = await apiRequest(`/api/events`, {
        method: "POST",
        body: JSON.stringify({
          teacherId: teacher.id,
          projectId: data.projectId || null,
          title: data.title,
          description: data.description || "",
          date: data.eventDate,
          time: data.eventTime,
          location: data.location,
        }),
      });

      if (data.notifyStudents) {
        try {
          await apiRequest(`/api/events/${response.id}/notify`, { method: "POST" });
          toast({
            title: "Notificações enviadas",
            description: "Os alunos do projeto foram notificados.",
          });
        } catch (error) {
          console.error("Erro ao enviar notificações:", error);
          toast({
            title: "Aviso",
            description: "Evento criado, mas houve erro ao notificar alunos.",
          });
        }
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/teacher", teacher?.id] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Evento criado",
        description: "A reunião foi agendada com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao criar evento:", error);
      toast({
        title: "Erro ao criar evento",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EventFormData }) => {
      const response = await apiRequest(`/api/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          projectId: data.projectId || null,
          title: data.title,
          description: data.description || "",
          date: data.eventDate,
          time: data.eventTime,
          location: data.location,
        }),
      });

      if (data.notifyStudents) {
        try {
          await apiRequest(`/api/events/${id}/notify`, { method: "POST" });
          toast({
            title: "Notificações enviadas",
            description: "Os alunos do projeto foram notificados.",
          });
        } catch (error) {
          console.error("Erro ao enviar notificações:", error);
          toast({
            title: "Aviso",
            description: "Evento atualizado, mas houve erro ao notificar alunos.",
          });
        }
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/teacher", teacher?.id] });
      setEditingEvent(null);
      editForm.reset();
      toast({
        title: "Evento atualizado",
        description: "A reunião foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar evento:", error);
      toast({
        title: "Erro ao atualizar evento",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/events/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/teacher", teacher?.id] });
      toast({
        title: "Evento removido",
        description: "A reunião foi cancelada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o evento.",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: EventFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: EventFormData) => {
    if (!editingEvent) return;
    updateMutation.mutate({ id: editingEvent.id, data });
  };

  const startEdit = (event: Event) => {
    setEditingEvent(event);
    editForm.reset({
      projectId: event.projectId || "",
      title: event.title,
      description: event.description || "",
      eventDate: event.date,
      eventTime: event.time,
      location: event.location,
      notifyStudents: false,
    });
  };

  const sortedEvents = [...combinedEvents].sort((a, b) => {
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

  return (
    <div className="h-full overflow-auto p-8 space-y-6" data-testid="page-teacher-calendar">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
              Calendário de Reuniões
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-description">
              Gerencie reuniões presenciais com as equipes
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-event" disabled={isLoadingTeacher || !teacher}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Reunião
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agendar Reunião Presencial</DialogTitle>
                <DialogDescription>
                  Marque uma reunião presencial com a equipe do projeto
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-event-title"
                            placeholder="Ex: Revisão do Protótipo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Projeto (opcional)</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-event-project">
                              <SelectValue placeholder="Selecione um projeto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Nenhum projeto</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data *</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-event-date"
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário *</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-event-time"
                              type="time"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local *</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-event-location"
                            placeholder="Ex: Sala 201, Laboratório de Informática"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            data-testid="input-event-description"
                            placeholder="Descreva o objetivo da reunião..."
                            rows={3}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notifyStudents"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Notificar Estudantes
                          </FormLabel>
                          <FormDescription>
                            Enviar uma notificação para os alunos do projeto selecionado.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateOpen(false);
                        form.reset();
                      }}
                      data-testid="button-cancel-create"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-event"
                    >
                      {createMutation.isPending ? "Criando..." : "Criar Reunião"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground" data-testid="text-loading">
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
                <Calendar
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
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhum evento neste dia
                  </div>
                ) : (
                  selectedDateEvents.map((event) => {
                    const project = projects.find((p) => p.id === event.projectId);
                    const eventDate = new Date(`${event.date}T${event.time}`);
                    const isDeadline = (event as any).type === 'deadline';

                    return (
                      <Card
                        key={event.id}
                        className={`${isDeadline ? 'border-l-4 border-l-orange-500 bg-orange-50/30' : 'cursor-pointer hover:shadow-md'} transition-all`}
                        onClick={() => {
                          if (!isDeadline) {
                            startEdit(event as Event);
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="font-semibold text-sm">{event.title}</div>
                            {project && (
                              <div className="inline-block px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                                {project.title}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {format(eventDate, "HH:mm")}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                            {!isDeadline && (
                              <div className="flex gap-1 pt-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(event as Event);
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMutation.mutate(event.id);
                                  }}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="w-3 h-3" />
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

        {/* Edit Dialog */}
        {editingEvent && (
          <Dialog
            open={!!editingEvent}
            onOpenChange={(open) => {
              if (!open) {
                setEditingEvent(null);
                editForm.reset();
              }
            }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Reunião</DialogTitle>
              </DialogHeader>

              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input data-testid="input-edit-event-title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Projeto</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um projeto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Nenhum projeto</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="eventTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="notifyStudents"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Notificar Estudantes
                          </FormLabel>
                          <FormDescription>
                            Enviar uma notificação para os alunos do projeto selecionado.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingEvent(null);
                        editForm.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      data-testid="button-update-event"
                    >
                      {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
