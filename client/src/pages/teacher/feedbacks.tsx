import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MessageSquare, Send, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Project, Feedback, Teacher, Student } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const feedbackFormSchema = z.object({
  projectId: z.string().min(1, "Selecione um projeto"),
  studentId: z.string().optional(),
  comment: z.string().min(1, "Digite o feedback"),
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

export default function TeacherFeedback() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState("");

  const { data: teacher } = useQuery<Teacher>({
    queryKey: ["/api/me/teacher"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: feedbacks = [], isLoading: feedbacksLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedbacks/project", selectedProjectId],
    enabled: !!selectedProjectId,
  });

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      projectId: "",
      studentId: "all", // "all" for team feedback, specific ID for student
      comment: "",
    },
  });

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const firstProjectId = projects[0].id;
      setSelectedProjectId(firstProjectId);
      form.setValue("projectId", firstProjectId);
    }
  }, [projects, selectedProjectId, form]);

  const createMutation = useMutation({
    mutationFn: async (data: { teacherId: string; projectId: string; studentId?: string | null; comment: string }) => {
      return await apiRequest(`/api/feedbacks`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedbacks/project", selectedProjectId] });
      // Reset only the comment field, keep projectId selected
      form.reset({ projectId: selectedProjectId, studentId: "all", comment: "" });
      toast({
        title: "Feedback adicionado",
        description: "O feedback foi registrado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao criar feedback:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o feedback.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      return await apiRequest(`/api/feedbacks/${id}`, {
        method: "PATCH",
        body: { comment },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedbacks/project", selectedProjectId] });
      setEditingId(null);
      setEditingComment("");
      toast({
        title: "Feedback atualizado",
        description: "O feedback foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o feedback.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/feedbacks/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedbacks/project", selectedProjectId] });
      toast({
        title: "Feedback removido",
        description: "O feedback foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o feedback.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    if (!teacher) {
      toast({
        title: "Erro",
        description: "Informações do professor não disponíveis.",
        variant: "destructive",
      });
      return;
    }

    // Build payload, only include studentId if it's not "all"
    const payload: any = {
      teacherId: teacher.id,
      projectId: data.projectId,
      comment: data.comment,
    };

    // Only add studentId if it's not "all" (team feedback)
    if (data.studentId && data.studentId !== "all") {
      payload.studentId = data.studentId;
    }

    createMutation.mutate(payload);
  };

  const handleEditSubmit = (id: string) => {
    if (!editingComment.trim()) {
      toast({
        title: "Comentário vazio",
        description: "O comentário não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({ id, comment: editingComment });
  };

  const startEdit = (feedback: Feedback) => {
    setEditingId(feedback.id);
    setEditingComment(feedback.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingComment("");
  };

  return (
    <div className="h-full overflow-auto p-8 space-y-6" data-testid="page-teacher-feedbacks">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Feedbacks de Equipe
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Deixe comentários e orientações para as equipes dos projetos
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Novo Feedback
            </CardTitle>
            <CardDescription>
              Selecione um projeto e escreva um feedback para a equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projeto</FormLabel>
                      <Select value={field.value} onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedProjectId(value);
                      }}>
                        <FormControl>
                          <SelectTrigger data-testid="select-feedback-project">
                            <SelectValue placeholder="Selecione um projeto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinatário</FormLabel>
                      <Select value={field.value || "all"} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-feedback-student">
                            <SelectValue placeholder="Selecione o destinatário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Toda a Equipe</SelectItem>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentário</FormLabel>
                      <FormControl>
                        <Textarea
                          data-testid="input-feedback-comment"
                          placeholder="Digite seu feedback para a equipe..."
                          rows={4}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-feedback"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? "Enviando..." : "Enviar Feedback"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {selectedProjectId && (
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-feedbacks-title">Feedbacks Registrados</CardTitle>
              <CardDescription data-testid="text-feedbacks-count">
                {feedbacks.length === 0
                  ? "Nenhum feedback registrado ainda"
                  : `${feedbacks.length} feedback(s) para este projeto`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedbacksLoading ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-loading">
                  Carregando feedbacks...
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-empty-state">
                  Seja o primeiro a deixar um feedback para este projeto!
                </div>
              ) : (
                feedbacks.map((feedback) => {
                  const project = projects.find(p => p.id === feedback.projectId);
                  return (
                    <Card key={feedback.id} className="border-l-4 border-l-primary" data-testid={`card-feedback-${feedback.id}`}>
                      <CardContent className="pt-6">
                        {editingId === feedback.id ? (
                          <div className="space-y-4">
                            <Textarea
                              value={editingComment}
                              onChange={(e) => setEditingComment(e.target.value)}
                              rows={4}
                              className="resize-none"
                              data-testid={`input-edit-feedback-${feedback.id}`}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditSubmit(feedback.id)}
                                disabled={updateMutation.isPending || !editingComment.trim()}
                                data-testid={`button-save-feedback-${feedback.id}`}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {updateMutation.isPending ? "Salvando..." : "Salvar"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                data-testid={`button-cancel-edit-${feedback.id}`}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg mb-1" data-testid={`text-feedback-project-${feedback.id}`}>
                                  {project?.title}
                                </CardTitle>
                                <div className="flex gap-2 mb-2">
                                  <span className="text-sm text-muted-foreground" data-testid={`text-feedback-date-${feedback.id}`}>
                                    {format(new Date(feedback.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                  </span>
                                  {feedback.studentId ? (
                                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 rounded">
                                      Para: {students.find(s => s.id === feedback.studentId)?.name || "Aluno"}
                                    </span>
                                  ) : (
                                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 rounded">
                                      Para: Equipe
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => startEdit(feedback)}
                                  data-testid={`button-edit-feedback-${feedback.id}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteMutation.mutate(feedback.id)}
                                  disabled={deleteMutation.isPending}
                                  data-testid={`button-delete-feedback-${feedback.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap" data-testid={`text-feedback-comment-${feedback.id}`}>
                              {feedback.comment}
                            </p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
