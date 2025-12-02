import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { ImportRubricModal } from "@/components/ImportRubricModal";
import type { RubricCriteria, ProjectWithTeacher } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TeacherRubrics() {
  const { toast } = useToast();

  // Fetch projects to allow selection
  const { data: projects = [] } = useQuery<ProjectWithTeacher[]>({
    queryKey: ['/api/projects'],
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingCriteria, setEditingCriteria] = useState<Record<string, Partial<RubricCriteria>>>({});

  // Set selectedProjectId once projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Fetch rubrics for selected project
  const { data: projectRubrics = [], isLoading } = useQuery<RubricCriteria[]>({
    queryKey: [`/api/rubrics/${selectedProjectId}`],
    enabled: !!selectedProjectId,
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const [editingLevelsId, setEditingLevelsId] = useState<string | null>(null);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<RubricCriteria> & { id: string }) => {
      return await apiRequest(`/api/rubrics/${id}`, {
        method: "PATCH",
        body: data, // Remove manual JSON.stringify - apiRequest handles it
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rubrics/${selectedProjectId}`] });
      setEditingLevelsId(null);
      toast({
        title: "Critério atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o critério.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/rubrics/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rubrics/${selectedProjectId}`] });
      toast({
        title: "Critério excluído",
        description: "O critério foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o critério.",
        variant: "destructive",
      });
    },
  });

  const createCriteriaMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) throw new Error('Selecione um projeto');
      return await apiRequest('/api/rubrics', {
        method: 'POST',
        body: {
          projectId: selectedProjectId,
          criteria: 'Novo Critério',
          weight: 10,
          level1: 'Insuficiente',
          level2: 'Regular',
          level3: 'Bom',
          level4: 'Excelente',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rubrics/${selectedProjectId}`] });
      toast({
        title: "Critério adicionado",
        description: "Novo critério criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar critério",
        description: error.message || "Não foi possível adicionar o critério.",
        variant: "destructive",
      });
    },
  });

  const handleWeightChange = (criteriaId: string, newWeight: number) => {
    setEditingCriteria(prev => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], weight: newWeight }
    }));
  };

  const handleWeightBlur = (criteriaId: string) => {
    const editedCriteria = editingCriteria[criteriaId];
    if (!editedCriteria || editedCriteria.weight === undefined) return;

    const newWeight = editedCriteria.weight;

    // Calculate total with new weight
    const newTotal = projectRubrics.reduce((sum, c) => {
      if (c.id === criteriaId) return sum + newWeight;
      const editedWeight = editingCriteria[c.id]?.weight;
      return sum + (editedWeight !== undefined ? editedWeight : c.weight);
    }, 0);

    if (newTotal > 100) {
      toast({
        title: "Peso inválido",
        description: `O total dos pesos seria ${newTotal}%. Não pode ultrapassar 100%.`,
        variant: "destructive",
      });
      // Reset local state
      setEditingCriteria(prev => {
        const newState = { ...prev };
        delete newState[criteriaId];
        return newState;
      });
      return;
    }

    updateMutation.mutate({ id: criteriaId, weight: newWeight });
  };

  const getTotalWeight = () => {
    return projectRubrics.reduce((sum, c) => {
      const editedWeight = editingCriteria[c.id]?.weight;
      return sum + (editedWeight !== undefined ? editedWeight : c.weight);
    }, 0);
  };

  return (
    <div className="animate-fade-in space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground" data-testid="heading-rubrics">Rubricas de Avaliação</h2>
          <p className="text-muted-foreground">Defina os critérios de avaliação e seus níveis de desempenho.</p>
        </div>
        <div className="flex gap-2">
          <ImportRubricModal />
          <Button
            onClick={() => createCriteriaMutation.mutate()}
            disabled={!selectedProjectId || createCriteriaMutation.isPending}
            data-testid="button-add-criteria"
          >
            <Icon name="plus" size={16} className="mr-2" />
            Adicionar Critério
          </Button>
        </div>
      </div>

      {/* Project Selection */}
      {projects.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Label className="mb-2 block">Selecione um Projeto</Label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              data-testid="select-project"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title} - {project.subject}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Total de Pesos:</span>
              <span className={`text-lg font-bold ${getTotalWeight() === 100 ? "text-green-600" : getTotalWeight() > 100 ? "text-destructive" : "text-orange-500"}`}>
                {getTotalWeight()}%
              </span>
            </div>
            {getTotalWeight() === 100 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Icon name="check" size={14} className="mr-1" /> Balanceado
              </Badge>
            )}
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Critério</TableHead>
                  <TableHead className="w-[150px]">Peso (%)</TableHead>
                  <TableHead>Níveis de Desempenho</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectRubrics.map((criteria) => (
                  <TableRow key={criteria.id}>
                    <TableCell className="font-medium">
                      <Input
                        key={criteria.criteria} // Força atualização se o valor externo mudar
                        defaultValue={criteria.criteria}
                        className="border-transparent hover:border-input focus:border-input px-2 h-8 font-medium"
                        onBlur={(e) => {
                          const newValue = e.target.value.trim();
                          if (newValue && newValue !== criteria.criteria) {
                            updateMutation.mutate({ id: criteria.id, criteria: newValue });
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editingCriteria[criteria.id]?.weight ?? criteria.weight}
                          onChange={(e) => handleWeightChange(criteria.id, parseInt(e.target.value) || 0)}
                          onBlur={() => handleWeightBlur(criteria.id)}
                          className="w-16 h-8"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-help
                              ${level === 1 ? 'bg-red-100 text-red-700' :
                                level === 2 ? 'bg-yellow-100 text-yellow-700' :
                                  level === 3 ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'}`}
                            title={criteria[`level${level}` as keyof RubricCriteria] as string}
                          >
                            {level}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 ml-2 text-xs"
                          onClick={() => setEditingLevelsId(criteria.id)}
                        >
                          <Icon name="edit" size={12} className="mr-1" />
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este critério?")) {
                            deleteMutation.mutate(criteria.id);
                          }
                        }}
                      >
                        <Icon name="trash" size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {projectRubrics.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Nenhum critério definido. Adicione um critério ou importe de outro projeto.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Edit Levels Modal */}
      <Dialog open={!!editingLevelsId} onOpenChange={(open) => !open && setEditingLevelsId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Níveis de Desempenho</DialogTitle>
            <DialogDescription>
              Detalhe o que é esperado do aluno em cada nível de desempenho.
            </DialogDescription>
          </DialogHeader>

          {editingLevelsId && (() => {
            const criteria = projectRubrics.find(c => c.id === editingLevelsId);
            if (!criteria) return null;

            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateMutation.mutate({
                    id: criteria.id,
                    criteria: formData.get('criteria') as string,
                    level1: formData.get('level1') as string,
                    level2: formData.get('level2') as string,
                    level3: formData.get('level3') as string,
                    level4: formData.get('level4') as string,
                  });
                }}
                className="space-y-6 py-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="criteria">Nome do Critério</Label>
                  <Input
                    id="criteria"
                    name="criteria"
                    defaultValue={criteria.criteria}
                    placeholder="Ex: Criatividade"
                  />
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="text-red-600 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">1</span>
                      Nível 1 - Insuficiente (25%)
                    </Label>
                    <Textarea
                      name="level1"
                      defaultValue={criteria.level1}
                      placeholder="Descrição para desempenho insuficiente..."
                      className="border-red-200 focus:border-red-400 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-yellow-600 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">2</span>
                      Nível 2 - Regular (50%)
                    </Label>
                    <Textarea
                      name="level2"
                      defaultValue={criteria.level2}
                      placeholder="Descrição para desempenho regular..."
                      className="border-yellow-200 focus:border-yellow-400 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-600 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
                      Nível 3 - Bom (75%)
                    </Label>
                    <Textarea
                      name="level3"
                      defaultValue={criteria.level3}
                      placeholder="Descrição para bom desempenho..."
                      className="border-blue-200 focus:border-blue-400 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-600 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">4</span>
                      Nível 4 - Excelente (100%)
                    </Label>
                    <Textarea
                      name="level4"
                      defaultValue={criteria.level4}
                      placeholder="Descrição para desempenho excelente..."
                      className="border-green-200 focus:border-green-400 min-h-[80px]"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingLevelsId(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
