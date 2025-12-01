import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/Icon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Student, Team, RubricCriteria, Evaluation } from "@shared/schema";

interface EvaluationTabProps {
    projectId: string;
}

interface TeamWithMembers extends Team {
    members?: Student[];
}

export function EvaluationTab({ projectId }: EvaluationTabProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("teams");
    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [evaluationScores, setEvaluationScores] = useState<Record<string, number>>({});
    const [evaluationFeedback, setEvaluationFeedback] = useState("");

    // Queries
    const { data: students = [] } = useQuery<Student[]>({
        queryKey: [`/api/projects/${projectId}/students`],
    });

    const { data: teams = [] } = useQuery<Team[]>({
        queryKey: [`/api/projects/${projectId}/teams`],
    });

    const { data: rubrics = [] } = useQuery<RubricCriteria[]>({
        queryKey: [`/api/rubrics/${projectId}`],
    });

    // Mutations
    const createTeamMutation = useMutation({
        mutationFn: async (name: string) => {
            return await apiRequest("/api/teams", {
                method: "POST",
                body: JSON.stringify({ projectId, name }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/teams`] });
            setIsCreateTeamOpen(false);
            setNewTeamName("");
            toast({ title: "Equipe criada com sucesso" });
        },
    });

    const addMemberMutation = useMutation({
        mutationFn: async ({ teamId, studentId }: { teamId: string; studentId: string }) => {
            return await apiRequest(`/api/teams/${teamId}/members`, {
                method: "POST",
                body: JSON.stringify({ studentId }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/teams/${selectedTeamId}/members`] });
            toast({ title: "Aluno adicionado à equipe" });
        },
    });

    const saveEvaluationMutation = useMutation({
        mutationFn: async (data: any) => {
            return await apiRequest("/api/evaluations", {
                method: "POST",
                body: JSON.stringify({ ...data, projectId }),
            });
        },
        onSuccess: () => {
            toast({ title: "Avaliação salva com sucesso" });
            setEvaluationScores({});
            setEvaluationFeedback("");
            setSelectedTeamId(null);
            setSelectedStudentId(null);
        },
    });

    // Helper functions
    const handleCreateTeam = () => {
        if (!newTeamName.trim()) return;
        createTeamMutation.mutate(newTeamName);
    };

    const handleSaveEvaluation = () => {
        const scores = Object.entries(evaluationScores).map(([criteriaId, score]) => ({
            criteriaId,
            score,
        }));

        const totalScore = scores.reduce((acc, curr) => acc + curr.score, 0);

        saveEvaluationMutation.mutate({
            teamId: activeTab === "evaluate-teams" ? selectedTeamId : undefined,
            studentId: activeTab === "evaluate-students" ? selectedStudentId : undefined,
            totalScore,
            feedback: evaluationFeedback,
            scores,
        });
    };

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="teams">Gerenciar Equipes</TabsTrigger>
                    <TabsTrigger value="evaluate-teams">Avaliar Equipes</TabsTrigger>
                    <TabsTrigger value="evaluate-students">Avaliar Estudantes</TabsTrigger>
                </TabsList>

                {/* ABA: GERENCIAR EQUIPES */}
                <TabsContent value="teams" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Equipes do Projeto</h3>
                        <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Icon name="plus" className="mr-2 h-4 w-4" />
                                    Nova Equipe
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Criar Nova Equipe</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <Label>Nome da Equipe</Label>
                                    <Input
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        placeholder="Ex: Grupo Alpha"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateTeam}>Criar</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map((team) => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                students={students}
                                onAddMember={(studentId) => addMemberMutation.mutate({ teamId: team.id, studentId })}
                            />
                        ))}
                    </div>
                </TabsContent>

                {/* ABA: AVALIAR EQUIPES */}
                <TabsContent value="evaluate-teams" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selecionar Equipe</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {teams.map(team => (
                                        <div
                                            key={team.id}
                                            onClick={() => setSelectedTeamId(team.id)}
                                            className={`p-3 rounded-lg border cursor-pointer ${selectedTeamId === team.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                        >
                                            <p className="font-medium">{team.name}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            {selectedTeamId ? (
                                <EvaluationForm
                                    rubrics={rubrics}
                                    scores={evaluationScores}
                                    setScores={setEvaluationScores}
                                    feedback={evaluationFeedback}
                                    setFeedback={setEvaluationFeedback}
                                    onSave={handleSaveEvaluation}
                                    isLoading={saveEvaluationMutation.isPending}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
                                    Selecione uma equipe para avaliar
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* ABA: AVALIAR ESTUDANTES */}
                <TabsContent value="evaluate-students" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selecionar Estudante</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {students.map(student => (
                                        <div
                                            key={student.id}
                                            onClick={() => setSelectedStudentId(student.id)}
                                            className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 ${selectedStudentId === student.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={student.avatar || undefined} />
                                                <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            {selectedStudentId ? (
                                <EvaluationForm
                                    rubrics={rubrics}
                                    scores={evaluationScores}
                                    setScores={setEvaluationScores}
                                    feedback={evaluationFeedback}
                                    setFeedback={setEvaluationFeedback}
                                    onSave={handleSaveEvaluation}
                                    isLoading={saveEvaluationMutation.isPending}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
                                    Selecione um estudante para avaliar
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TeamCard({ team, students, onAddMember }: { team: Team, students: Student[], onAddMember: (id: string) => void }) {
    const { data: members = [] } = useQuery<Student[]>({
        queryKey: [`/api/teams/${team.id}/members`],
    });

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{team.name}</CardTitle>
                <CardDescription>{members.length} membros</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {members.map(member => (
                            <Badge key={member.id} variant="secondary">
                                {member.name}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Select onValueChange={onAddMember}>
                            <SelectTrigger className="h-8">
                                <SelectValue placeholder="Adicionar aluno..." />
                            </SelectTrigger>
                            <SelectContent>
                                {students
                                    .filter(s => !members.find(m => m.id === s.id))
                                    .map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface EvaluationFormProps {
    rubrics: RubricCriteria[];
    scores: Record<string, number>;
    setScores: (scores: Record<string, number>) => void;
    feedback: string;
    setFeedback: (feedback: string) => void;
    onSave: () => void;
    isLoading: boolean;
}

function EvaluationForm({ rubrics, scores, setScores, feedback, setFeedback, onSave, isLoading }: EvaluationFormProps) {
    const totalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Avaliação</CardTitle>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                        Total: {totalScore} pts
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {rubrics.map((rubric: RubricCriteria) => (
                    <div key={rubric.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                            <h4 className="font-medium">{rubric.criteria}</h4>
                            <span className="text-sm text-muted-foreground">Máx: {rubric.maxGrade || 10} pts</span>
                        </div>

                        <div className="flex gap-4 items-center">
                            <Input
                                type="number"
                                min="0"
                                max={rubric.maxGrade || 10}
                                value={scores[rubric.id] || ''}
                                onChange={(e) => setScores({ ...scores, [rubric.id]: Number(e.target.value) })}
                                className="w-24"
                            />
                            <div className="flex-1">
                                <input
                                    type="range"
                                    min="0"
                                    max={rubric.maxGrade || 10}
                                    step="0.5"
                                    value={scores[rubric.id] || 0}
                                    onChange={(e) => setScores({ ...scores, [rubric.id]: Number(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="space-y-2">
                    <Label>Feedback Geral</Label>
                    <Input
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Comentários sobre o desempenho..."
                    />
                </div>

                <Button onClick={onSave} disabled={isLoading} className="w-full">
                    {isLoading ? "Salvando..." : "Salvar Avaliação"}
                </Button>
            </CardContent>
        </Card>
    );
}
