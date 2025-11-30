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

  // Update weight mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, weight, criteria, level1, level2, level3, level4 }: Partial<RubricCriteria> & { id: string }) => {
      return await apiRequest(`/api/rubrics/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ weight, criteria, level1, level2, level3, level4 }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rubrics", selectedProjectId] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/rubrics", selectedProjectId] });
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
        description: "Novo critério criado com sucesso. Você pode editá-lo agora.",
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

  const handleCriteriaChange = (id: string, newCriteria: string) => {
    // Debounce or save on blur could be better, but for now let's save on blur
    // We'll just update local state if we had one, but we are using the input directly.
    // Let's use onBlur to trigger save.
  };

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

    // Validate total doesn't exceed 100%
    if (newTotal > 100) {
      toast({
        title: "Peso inválido",
        description: `O total dos pesos seria ${newTotal}%. Não pode ultrapassar 100%.`,
        variant: "destructive",
      });
      // Reset to original value
      setEditingCriteria(prev => {
        const newState = { ...prev };
        delete newState[criteriaId];
        return newState;
      });
      return;
    }

    updateMutation.mutate({ id: criteriaId, weight: newWeight });
  };

  const handleWeightKeyDown = (e: React.KeyboardEvent, criteriaId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
      handleWeightBlur(criteriaId);
    }
  };

  const getTotalWeight = () => {
    return projectRubrics.reduce((sum, c) => {
      const editedWeight = editingCriteria[c.id]?.weight;
      return sum + (editedWeight !== undefined ? editedWeight : c.weight);
    }, 0);
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground" data-testid="heading-rubrics">Rubricas de Avaliação</h2>
          <p className="text-muted-foreground">Critérios para os projetos ativos.</p>
        </div>
        <ImportRubricModal />
      </div>

      {/* Project Selection */}
      {projects.length > 0 && (
        <div className="bg-card border border-card-border rounded-xl p-4">
          <label className="block text-sm font-semibold text-muted-foreground mb-2">Selecione um Projeto</label>
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground font-medium"
            data-testid="select-project"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title} - {project.subject}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-foreground">
              {selectedProject ? `Projeto: ${selectedProject.title}` : 'Nenhum projeto selecionado'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-primary font-semibold hover-elevate flex items-center gap-1"
              data-testid="button-add-criteria"
              onClick={() => createCriteriaMutation.mutate()}
              disabled={!selectedProjectId || createCriteriaMutation.isPending}
            >
              <Icon name="plus" size={16} />
              {createCriteriaMutation.isPending ? "Adicionando..." : "Adicionar Critério"}
            </Button>
          </div>

          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Critério</th>
                  <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Peso (%)</th>
                  <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Níveis de Desempenho</th>
                  <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-wider w-20">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projectRubrics.length > 0 ? (
                  projectRubrics.map((criteria, idx) => (
                    <tr key={criteria.id} className="hover-elevate" data-testid={`row-criteria-${criteria.id}`}>
                      <td className="px-6 py-6">
                        <input
                          type="text"
                          defaultValue={criteria.criteria}
                          className="font-semibold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none w-full transition-colors"
                          data-testid={`input-criteria-name-${criteria.id}`}
                          onBlur={(e) => {
                            if (e.target.value !== criteria.criteria) {
                              updateMutation.mutate({ id: criteria.id, criteria: e.target.value });
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={editingCriteria[criteria.id]?.weight ?? criteria.weight}
                            onChange={(e) => handleWeightChange(criteria.id, parseInt(e.target.value))}
                            onMouseUp={() => handleWeightBlur(criteria.id)}
                            onTouchEnd={() => handleWeightBlur(criteria.id)}
                            className="flex-1 cursor-pointer"
                            data-testid={`slider-weight-${criteria.id}`}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingCriteria[criteria.id]?.weight ?? criteria.weight}
                            onChange={(e) => handleWeightChange(criteria.id, parseInt(e.target.value) || 0)}
                            onBlur={() => handleWeightBlur(criteria.id)}
                            onKeyDown={(e) => handleWeightKeyDown(e, criteria.id)}
                            className="font-bold text-primary w-16 text-right bg-transparent border border-border rounded px-2 py-1"
                            data-testid={`input-weight-${criteria.id}`}
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex gap-2 overflow-x-auto hide-scroll max-w-[300px]">
                          {[criteria.level1, criteria.level2, criteria.level3, criteria.level4].map((level, levelIdx) => (
                            <span
                              key={levelIdx}
                              className="inline-block px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full whitespace-nowrap border border-border"
                              data-testid={`badge-level-${criteria.id}-${levelIdx}`}
                            >
                              {levelIdx + 1}. {level}
                            </span>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs h-6"
                          onClick={() => setEditingLevelsId(criteria.id)}
                        >
                          <Icon name="edit" size={12} className="mr-1" /> Editar Níveis
                        </Button>
                      </td>
                      <td className="px-6 py-6">
                        <button
                          className="text-muted-foreground hover:text-destructive transition p-2 rounded-full hover:bg-destructive/10"
                          data-testid={`button-delete-${criteria.id}`}
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este critério?")) {
                              deleteMutation.mutate(criteria.id);
                            }
                          }}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum critério de avaliação definido para este projeto.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Total de Pesos: <strong className={getTotalWeight() === 100 ? "text-green-600" : getTotalWeight() > 100 ? "text-destructive" : "text-foreground"}>{getTotalWeight()}%</strong>
              {getTotalWeight() !== 100 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (deve somar 100%)
                </span>
              )}
            </p>
            {getTotalWeight() === 100 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Icon name="check" size={16} />
                <span className="font-semibold">Pesos balanceados</span>
              </div>
            )}
          </div>
        </div>
      )
      }
    </div >
  );
}
