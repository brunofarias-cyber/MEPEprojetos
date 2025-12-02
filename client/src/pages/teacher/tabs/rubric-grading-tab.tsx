import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/Icon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RubricCriteria } from "@shared/schema";

interface Student {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
}

interface RubricScore {
    criteriaId: string;
    level: number; // 1-4
}

interface RubricGradingTabProps {
    projectId: string;
}

export function RubricGradingTab({ projectId }: RubricGradingTabProps) {
    const { toast } = useToast();
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState("");

    const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
        queryKey: [`/api/projects/${projectId}/students`],
    });

    const { data: rubrics = [], isLoading: rubricsLoading } = useQuery<RubricCriteria[]>({
        queryKey: [`/api/rubrics/${projectId}`],
    });

    const saveGradeMutation = useMutation({
        mutationFn: async ({
            studentId,
            grade,
            feedback,
        }: {
            studentId: string;
            grade: number;
            feedback: string;
        }) => {
            // Check if submission exists for this student in this project
            const submissions = await apiRequest(`/api/projects/${projectId}/submissions`);
            const existingSubmission = submissions.find(
                (s: any) => s.studentId === studentId
            );

            if (existingSubmission) {
                // Grade existing submission
                return await apiRequest(`/api/submissions/${existingSubmission.id}/grade`, {
                    method: "POST",
                    body: JSON.stringify({ grade, feedback }),
                });
            } else {
                // Create a new submission and grade it
                // This is for cases where student hasn't submitted yet but teacher wants to grade
                const newSubmission = await apiRequest("/api/submissions", {
                    method: "POST",
                    body: JSON.stringify({
                        projectId,
                        studentId,
                        type: "link",
                        content: "Avaliação por Rubrica",
                        comment: "Avaliado pelo professor usando rubricas",
                    }),
                });

                return await apiRequest(`/api/submissions/${newSubmission.id}/grade`, {
                    method: "POST",
                    body: JSON.stringify({ grade, feedback }),
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/submissions`] });
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/students`] });
            toast({
                title: "Avaliação salva",
                description: "A nota calculada por rubrica foi registrada com sucesso.",
            });
            setRubricScores({});
            setFeedback("");
            setSelectedStudentId(null);
        },
        onError: (error: any) => {
            toast({
                title: "Erro ao salvar avaliação",
                description: error.message || "Não foi possível salvar a avaliação.",
                variant: "destructive",
            });
        },
    });

    // Calculate final grade based on rubric scores
    const calculateGrade = (): number => {
        if (rubrics.length === 0) return 0;

        let totalScore = 0;
        let totalWeight = 0;

        rubrics.forEach((rubric) => {
            const level = rubricScores[rubric.id];
            if (level) {
                // Level 1=25%, Level 2=50%, Level 3=75%, Level 4=100%
                const levelPercentage = level * 25;
                totalScore += (levelPercentage * rubric.weight) / 100;
                totalWeight += rubric.weight;
            }
        });

        // If not all criteria are scored, return partial grade
        return totalWeight > 0 ? Math.round(totalScore) : 0;
    };

    const allCriteriaScored = rubrics.every((r) => rubricScores[r.id] !== undefined);
    const finalGrade = calculateGrade();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStudentId) {
            toast({
                title: "Nenhum aluno selecionado",
                description: "Selecione um aluno para avaliar.",
                variant: "destructive",
            });
            return;
        }

        if (!allCriteriaScored) {
            toast({
                title: "Avaliação incompleta",
                description: "Por favor, avalie todos os critérios antes de salvar.",
                variant: "destructive",
            });
            return;
        }

        const feedbackWithRubricDetails = `${feedback}\n\n--- Detalhes da Avaliação por Rubrica ---\n${rubrics
            .map((r) => {
                const level = rubricScores[r.id];
                const levelText = level === 1 ? r.level1 : level === 2 ? r.level2 : level === 3 ? r.level3 : r.level4;
                return `${r.criteria}: Nível ${level} - ${levelText}`;
            })
            .join("\n")}`;

        saveGradeMutation.mutate({
            studentId: selectedStudentId,
            grade: finalGrade,
            feedback: feedbackWithRubricDetails,
        });
    };

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1:
                return "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
            case 2:
                return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300";
            case 3:
                return "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
            case 4:
                return "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
            default:
                return "";
        }
    };

    if (studentsLoading || rubricsLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (rubrics.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <Icon name="alert-circle" size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma rubrica configurada</h3>
                    <p className="text-muted-foreground mb-4">
                        Configure as rubricas de avaliação antes de usar este recurso.
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = "/rubrics"}>
                        <Icon name="settings" size={16} className="mr-2" />
                        Ir para Rubricas
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Alunos */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Alunos ({students.length})</CardTitle>
                        <CardDescription>Selecione para avaliar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                        {students.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhum aluno encontrado.
                            </p>
                        ) : (
                            students.map((student) => {
                                const isSelected = selectedStudentId === student.id;

                                return (
                                    <div
                                        key={student.id}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                        onClick={() => {
                                            setSelectedStudentId(student.id);
                                            setRubricScores({});
                                            setFeedback("");
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
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Área de Avaliação */}
            <div className="lg:col-span-2">
                {selectedStudentId ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Critérios de Rubrica */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Icon name="clipboard-list" size={20} />
                                    Avaliação por Rubrica
                                </CardTitle>
                                <CardDescription>
                                    Avaliando:{" "}
                                    <strong>
                                        {students.find((s) => s.id === selectedStudentId)?.name}
                                    </strong>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {rubrics.map((rubric) => {
                                    const selectedLevel = rubricScores[rubric.id];

                                    return (
                                        <div
                                            key={rubric.id}
                                            className="border rounded-lg p-4 bg-muted/20"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-foreground">
                                                        {rubric.criteria}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Peso: {rubric.weight}%
                                                    </p>
                                                </div>
                                                {selectedLevel && (
                                                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(selectedLevel)}`}>
                                                        Nível {selectedLevel} ({selectedLevel * 25}%)
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {[1, 2, 3, 4].map((level) => {
                                                    const levelText =
                                                        level === 1
                                                            ? rubric.level1
                                                            : level === 2
                                                                ? rubric.level2
                                                                : level === 3
                                                                    ? rubric.level3
                                                                    : rubric.level4;
                                                    const isSelected = selectedLevel === level;

                                                    return (
                                                        <button
                                                            key={level}
                                                            type="button"
                                                            onClick={() =>
                                                                setRubricScores({
                                                                    ...rubricScores,
                                                                    [rubric.id]: level,
                                                                })
                                                            }
                                                            className={`text-left p-3 rounded-lg border-2 transition-all ${isSelected
                                                                ? getLevelColor(level) + " ring-2 ring-offset-2"
                                                                : "border-border hover:border-primary/50 bg-background"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span
                                                                    className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold ${level === 1
                                                                        ? "bg-red-500"
                                                                        : level === 2
                                                                            ? "bg-yellow-500"
                                                                            : level === 3
                                                                                ? "bg-blue-500"
                                                                                : "bg-green-500"
                                                                        }`}
                                                                >
                                                                    {level}
                                                                </span>
                                                                <span className="font-semibold text-xs">
                                                                    {level * 25}%
                                                                </span>
                                                            </div>
                                                            <p className="text-xs leading-relaxed">
                                                                {levelText}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Nota Final e Feedback */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Nota Final e Feedback</CardTitle>
                                        <CardDescription>
                                            Calculada automaticamente baseada nas rubricas
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Nota Final</p>
                                        <p className="text-4xl font-bold text-primary">{finalGrade}</p>
                                        {!allCriteriaScored && (
                                            <p className="text-xs text-destructive mt-1">
                                                Avalie todos os critérios
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">
                                        Feedback Adicional (opcional)
                                    </label>
                                    <Textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Adicione comentários adicionais sobre o desempenho do aluno..."
                                        className="min-h-[120px]"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={!allCriteriaScored || saveGradeMutation.isPending}
                                        size="lg"
                                    >
                                        {saveGradeMutation.isPending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="check" size={16} className="mr-2" />
                                                Salvar Avaliação ({finalGrade} pontos)
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/10 p-12">
                        <Icon name="clipboard-check" size={64} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum aluno selecionado</h3>
                        <p className="text-center max-w-xs">
                            Selecione um aluno da lista ao lado para avaliar usando as rubricas.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
