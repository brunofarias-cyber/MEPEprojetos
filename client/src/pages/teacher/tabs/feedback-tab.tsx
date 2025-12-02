import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/Icon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Feedback } from "@shared/schema";

interface Student {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
}

interface FeedbackWithStudent extends Feedback {
    studentName?: string;
}

interface FeedbackTabProps {
    projectId: string;
}

export function FeedbackTab({ projectId }: FeedbackTabProps) {
    const { toast } = useToast();
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState("");
    const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

    const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
        queryKey: [`/api/projects/${projectId}/students`],
    });

    const { data: feedbacks = [], isLoading: feedbacksLoading } = useQuery<FeedbackWithStudent[]>({
        queryKey: [`/api/feedbacks/project/${projectId}`],
    });

    const createFeedbackMutation = useMutation({
        mutationFn: async ({ studentId, comment }: { studentId: string; comment: string }) => {
            // Get teacher ID from current user
            const currentUser = await apiRequest('/api/auth/me');
            const teacher = await apiRequest(`/api/me/teacher`);

            return await apiRequest("/api/feedbacks", {
                method: "POST",
                body: JSON.stringify({
                    projectId,
                    teacherId: teacher.id,
                    studentId,
                    comment,
                }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/feedbacks/project/${projectId}`] });
            toast({
                title: "Feedback enviado",
                description: "O feedback foi salvo com sucesso.",
            });
            setFeedbackText("");
            setEditingFeedbackId(null);
        },
        onError: (error: any) => {
            toast({
                title: "Erro ao enviar feedback",
                description: error.message || "Não foi possível salvar o feedback.",
                variant: "destructive",
            });
        },
    });

    const updateFeedbackMutation = useMutation({
        mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
            return await apiRequest(`/api/feedbacks/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ comment }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/feedbacks/project/${projectId}`] });
            toast({
                title: "Feedback atualizado",
                description: "O feedback foi atualizado com sucesso.",
            });
            setFeedbackText("");
            setEditingFeedbackId(null);
        },
        onError: (error: any) => {
            toast({
                title: "Erro ao atualizar feedback",
                description: error.message || "Não foi possível atualizar o feedback.",
                variant: "destructive",
            });
        },
    });

    const deleteFeedbackMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiRequest(`/api/feedbacks/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/feedbacks/project/${projectId}`] });
            toast({
                title: "Feedback excluído",
                description: "O feedback foi removido com sucesso.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Erro ao excluir feedback",
                description: error.message || "Não foi possível excluir o feedback.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !feedbackText.trim()) {
            toast({
                title: "Campos obrigatórios",
                description: "Selecione um aluno e escreva o feedback.",
                variant: "destructive",
            });
            return;
        }

        if (editingFeedbackId) {
            updateFeedbackMutation.mutate({ id: editingFeedbackId, comment: feedbackText });
        } else {
            createFeedbackMutation.mutate({ studentId: selectedStudentId, comment: feedbackText });
        }
    };

    const getStudentFeedbacks = (studentId: string) => {
        return feedbacks.filter(f => f.studentId === studentId);
    };

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    const handleEditFeedback = (feedback: FeedbackWithStudent) => {
        setSelectedStudentId(feedback.studentId || null);
        setFeedbackText(feedback.comment);
        setEditingFeedbackId(feedback.id);
    };

    const handleCancelEdit = () => {
        setFeedbackText("");
        setEditingFeedbackId(null);
    };

    if (studentsLoading || feedbacksLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Alunos */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Alunos ({students.length})</CardTitle>
                        <CardDescription>Selecione para dar feedback</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                        {students.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhum aluno encontrado.
                            </p>
                        ) : (
                            students.map(student => {
                                const studentFeedbacks = getStudentFeedbacks(student.id);
                                const isSelected = selectedStudentId === student.id;

                                return (
                                    <div
                                        key={student.id}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                        onClick={() => {
                                            setSelectedStudentId(student.id);
                                            if (!editingFeedbackId) {
                                                setFeedbackText("");
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={student.avatar || undefined} />
                                                <AvatarFallback>
                                                    {student.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{student.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {student.email}
                                                </p>
                                            </div>
                                            {studentFeedbacks.length > 0 && (
                                                <Badge variant="outline" className="text-xs">
                                                    {studentFeedbacks.length}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Área de Feedback */}
            <div className="lg:col-span-2">
                {selectedStudent ? (
                    <div className="space-y-6">
                        {/* Formulário de Feedback */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Icon name="message-square" size={20} />
                                    {editingFeedbackId ? "Editar Feedback" : "Novo Feedback"}
                                </CardTitle>
                                <CardDescription>
                                    Feedback para: <strong>{selectedStudent.name}</strong>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">
                                            Mensagem de Feedback
                                        </label>
                                        <Textarea
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            placeholder="Escreva um feedback construtivo e personalizado para o aluno..."
                                            className="min-h-[150px]"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        {editingFeedbackId && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                            >
                                                Cancelar
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={
                                                createFeedbackMutation.isPending ||
                                                updateFeedbackMutation.isPending
                                            }
                                        >
                                            {createFeedbackMutation.isPending ||
                                                updateFeedbackMutation.isPending ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Icon name="send" size={16} className="mr-2" />
                                                    {editingFeedbackId ? "Atualizar" : "Enviar"} Feedback
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Histórico de Feedbacks */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Icon name="history" size={20} />
                                    Histórico de Feedbacks
                                </CardTitle>
                                <CardDescription>
                                    Feedbacks anteriores para {selectedStudent.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {getStudentFeedbacks(selectedStudent.id).length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Icon name="inbox" size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>Nenhum feedback registrado ainda.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {getStudentFeedbacks(selectedStudent.id).map((feedback) => (
                                            <div
                                                key={feedback.id}
                                                className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(feedback.createdAt).toLocaleString('pt-BR')}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2"
                                                            onClick={() => handleEditFeedback(feedback)}
                                                        >
                                                            <Icon name="edit" size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2 text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        "Tem certeza que deseja excluir este feedback?"
                                                                    )
                                                                ) {
                                                                    deleteFeedbackMutation.mutate(feedback.id);
                                                                }
                                                            }}
                                                        >
                                                            <Icon name="trash" size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                                    {feedback.comment}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/10 p-12">
                        <Icon name="user-check" size={64} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum aluno selecionado</h3>
                        <p className="text-center max-w-xs">
                            Selecione um aluno da lista ao lado para visualizar e adicionar feedbacks.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
