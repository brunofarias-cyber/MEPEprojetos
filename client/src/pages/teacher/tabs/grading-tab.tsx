import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/Icon";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Submission {
    id: string;
    studentId: string;
    projectId: string;
    type: 'file' | 'link';
    content: string;
    comment: string | null;
    submittedAt: string;
    grade: number | null;
    teacherFeedback: string | null;
}

interface Student {
    id: string;
    name: string;
    avatar: string | null;
}

interface GradingTabProps {
    projectId: string;
}

export function GradingTab({ projectId }: GradingTabProps) {
    const { toast } = useToast();
    const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
    const [grade, setGrade] = useState<string>("");
    const [feedback, setFeedback] = useState<string>("");

    const { data: submissions = [], isLoading: submissionsLoading } = useQuery<Submission[]>({
        queryKey: [`/api/projects/${projectId}/submissions`],
    });

    const { data: students = [] } = useQuery<Student[]>({
        queryKey: [`/api/projects/${projectId}/students`],
    });

    const gradeMutation = useMutation({
        mutationFn: async ({ id, grade, feedback }: { id: string; grade: number; feedback: string }) => {
            return await apiRequest(`/api/submissions/${id}/grade`, {
                method: "POST",
                body: JSON.stringify({ grade, feedback }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/submissions`] });
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/students`] });
            toast({
                title: "Avaliação salva",
                description: "A nota e o feedback foram registrados com sucesso.",
            });
            setSelectedSubmission(null);
            setGrade("");
            setFeedback("");
        },
        onError: (error: any) => {
            toast({
                title: "Erro ao avaliar",
                description: error.message || "Não foi possível salvar a avaliação.",
                variant: "destructive",
            });
        },
    });

    const aiAnalysisMutation = useMutation({
        mutationFn: async (submissionId: string) => {
            return await apiRequest(`/api/submissions/${submissionId}/analyze`, {
                method: "POST",
            });
        },
        onSuccess: (data: any) => {
            setGrade(data.grade.toString());
            setFeedback(data.feedback);
            toast({
                title: "Análise concluída",
                description: "Sugestão de nota e feedback gerada pela IA.",
            });
        },
        onError: () => {
            toast({
                title: "Erro na análise",
                description: "Não foi possível analisar a submissão com IA.",
                variant: "destructive",
            });
        },
    });

    const handleGradeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const gradeNum = parseInt(grade);
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
            toast({
                title: "Nota inválida",
                description: "A nota deve ser um número entre 0 e 100.",
                variant: "destructive",
            });
            return;
        }
        if (!selectedSubmission) {
            toast({
                title: "Erro",
                description: "Nenhuma submissão selecionada para avaliar.",
                variant: "destructive",
            });
            return;
        }
        gradeMutation.mutate({ id: selectedSubmission, grade: gradeNum, feedback });
    };

    const getStudent = (studentId: string) => students.find(s => s.id === studentId);

    if (submissionsLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const pendingSubmissions = submissions.filter(s => s.grade === null);
    const gradedSubmissions = submissions.filter(s => s.grade !== null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Submissões */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Entregas ({submissions.length})</CardTitle>
                        <CardDescription>Selecione para avaliar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                        {submissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma entrega ainda.</p>
                        ) : (
                            <>
                                {pendingSubmissions.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Pendentes</h4>
                                        <div className="space-y-2">
                                            {pendingSubmissions.map(submission => {
                                                const student = getStudent(submission.studentId);
                                                return (
                                                    <div
                                                        key={submission.id}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedSubmission === submission.id
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                            : 'border-border hover:border-primary/50'
                                                            }`}
                                                        onClick={() => {
                                                            setSelectedSubmission(submission.id);
                                                            setGrade("");
                                                            setFeedback("");
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarImage src={student?.avatar || undefined} />
                                                                <AvatarFallback>{student?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate">{student?.name || 'Aluno desconhecido'}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {new Date(submission.submittedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            {submission.type === 'link' ? (
                                                                <Icon name="link" size={14} className="text-muted-foreground" />
                                                            ) : (
                                                                <Icon name="file" size={14} className="text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {gradedSubmissions.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Avaliadas</h4>
                                        <div className="space-y-2">
                                            {gradedSubmissions.map(submission => {
                                                const student = getStudent(submission.studentId);
                                                return (
                                                    <div
                                                        key={submission.id}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-all opacity-75 hover:opacity-100 ${selectedSubmission === submission.id
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                            : 'border-border'
                                                            }`}
                                                        onClick={() => {
                                                            setSelectedSubmission(submission.id);
                                                            setGrade(submission.grade?.toString() || "");
                                                            setFeedback(submission.teacherFeedback || "");
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="w-8 h-8">
                                                                    <AvatarImage src={student?.avatar || undefined} />
                                                                    <AvatarFallback>{student?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium text-sm">{student?.name}</p>
                                                                    <p className="text-xs text-muted-foreground">Nota: {submission.grade}</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                <Icon name="check" size={12} className="mr-1" /> Avaliado
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Área de Avaliação */}
            <div className="lg:col-span-2">
                {selectedSubmission ? (
                    <Card className="h-full flex flex-col">
                        <CardHeader className="border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Avaliação da Entrega</CardTitle>
                                    <CardDescription>
                                        Aluno: {getStudent(submissions.find(s => s.id === selectedSubmission)?.studentId || '')?.name}
                                    </CardDescription>
                                </div>
                                {submissions.find(s => s.id === selectedSubmission)?.grade !== null && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                        Já avaliado
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-6 space-y-6">
                            {/* Conteúdo da Entrega */}
                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Icon name="file-text" size={16} /> Conteúdo Enviado
                                </h4>
                                {(() => {
                                    const sub = submissions.find(s => s.id === selectedSubmission);
                                    if (!sub) return null;
                                    return (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-muted-foreground">Tipo:</span>
                                                <span className="capitalize">{sub.type === 'link' ? 'Link Externo' : 'Arquivo'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-muted-foreground">Conteúdo:</span>
                                                <a
                                                    href={sub.content}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline flex items-center gap-1"
                                                >
                                                    {sub.content} <Icon name="external-link" size={12} />
                                                </a>
                                            </div>
                                            {sub.comment && (
                                                <div className="mt-3 pt-3 border-t border-border/50">
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Comentário do Aluno:</p>
                                                    <p className="text-sm italic text-foreground/80">"{sub.comment}"</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Formulário de Avaliação */}
                            <form onSubmit={handleGradeSubmit} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                                            onClick={() => aiAnalysisMutation.mutate(selectedSubmission)}
                                            disabled={aiAnalysisMutation.isPending}
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            {aiAnalysisMutation.isPending ? "Analisando..." : "Analisar com IA"}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-1">
                                            <label className="text-sm font-medium mb-1.5 block">Nota (0-100)</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={grade}
                                                onChange={(e) => setGrade(e.target.value)}
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Feedback</label>
                                    <Textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Escreva um feedback construtivo para o aluno..."
                                        className="min-h-[150px]"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={gradeMutation.isPending}>
                                        {gradeMutation.isPending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="check" size={16} className="mr-2" />
                                                Salvar Avaliação
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/10 p-12">
                        <Icon name="clipboard-check" size={64} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold mb-2">Nenhuma entrega selecionada</h3>
                        <p className="text-center max-w-xs">Selecione uma entrega da lista ao lado para visualizar o conteúdo e atribuir uma nota.</p>
                    </div>
                )
                }
            </div >
        </div >
    );
}
