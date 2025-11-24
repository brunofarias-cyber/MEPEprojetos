import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Project, Event, Teacher } from "@shared/schema";

const eventFormSchema = z.object({
  projectId: z.string().optional(),
  title: z.string().min(1, "Digite um título"),
  description: z.string().optional(),
  eventDate: z.string().min(1, "Selecione uma data"),
  eventTime: z.string().min(1, "Selecione um horário"),
  location: z.string().min(1, "Digite um local"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function TeacherCalendar() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const { data: teacher } = useQuery<Teacher>({
    queryKey: ["/api/me/teacher"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events/teacher", teacher?.id],
    enabled: !!teacher?.id,
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      projectId: "",
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      location: "",
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
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      return await apiRequest(`/api/events`, {
        method: "POST",
        body: JSON.stringify({
          teacherId: teacher?.id,
          projectId: data.projectId || null,
          title: data.title,
          description: data.description || "",
          date: data.eventDate,
          time: data.eventTime,
          location: data.location,
        }),
      });
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
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EventFormData }) => {
      return await apiRequest(`/api/events/${id}`, {
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
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o evento.",
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
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o evento.",
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
    });
  };

  const sortedEvents = [...events].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
    const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
    return dateTimeA - dateTimeB;
  });

  return (
    <div className="h-full overflow-auto p-8 space-y-6" data-testid="page-teacher-calendar">
      <div className="max-w-5xl mx-auto">
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
              <Button data-testid="button-create-event">
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
        ) : sortedEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground" data-testid="text-empty-state">
                Nenhuma reunião agendada ainda. Clique em "Nova Reunião" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event) => {
              const project = projects.find((p) => p.id === event.projectId);
              const eventDate = new Date(`${event.date}T${event.time}`);

              return (
                <Card key={event.id} className="hover-elevate" data-testid={`card-event-${event.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="mb-2" data-testid={`text-event-title-${event.id}`}>
                          {event.title}
                        </CardTitle>
                        {project && (
                          <div className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary mb-2" data-testid={`text-event-project-${event.id}`}>
                            {project.title}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span data-testid={`text-event-date-${event.id}`}>
                              {format(eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span data-testid={`text-event-time-${event.id}`}>
                              {format(eventDate, "HH:mm")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span data-testid={`text-event-location-${event.id}`}>
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Dialog
                          open={editingEvent?.id === event.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingEvent(null);
                              editForm.reset();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEdit(event)}
                              data-testid={`button-edit-event-${event.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
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

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(event.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-event-${event.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {event.description && (
                    <CardContent>
                      <p className="text-sm text-foreground whitespace-pre-wrap" data-testid={`text-event-description-${event.id}`}>
                        {event.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
