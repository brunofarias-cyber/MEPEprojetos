import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { ImportRubricModal } from "@/components/ImportRubricModal";
import type { RubricCriteria, ProjectWithTeacher } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

  // Update weight mutation
  const updateWeightMutation = useMutation({
    mutationFn: async ({ criteriaId, weight }: { criteriaId: string; weight: number }) => {
      return apiRequest(`/api/rubrics/${criteriaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ weight }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rubrics/${selectedProjectId}`] });
      toast({
        title: "Peso atualizado",
        description: "O peso do critério foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o peso do critério.",
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
    if (editedCriteria?.weight !== undefined) {
      updateWeightMutation.mutate({ criteriaId, weight: editedCriteria.weight });
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
            <button className="text-sm text-primary font-semibold hover-elevate px-3 py-1.5 rounded-lg flex items-center gap-1" data-testid="button-add-criteria">
              <Icon name="plus" size={16} /> Adicionar Critério
            </button>
          </div>

          <div className="overflow-x-auto">
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
                          value={criteria.criteria} 
                          className="font-semibold text-foreground bg-transparent border-none outline-none w-full"
                          data-testid={`input-criteria-name-${criteria.id}`}
                          readOnly
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
                            className="font-bold text-primary w-16 text-right bg-transparent border border-border rounded px-2 py-1"
                            data-testid={`input-weight-${criteria.id}`}
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex gap-2 overflow-x-auto hide-scroll">
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
                      </td>
                      <td className="px-6 py-6">
                        <button className="text-muted-foreground hover:text-destructive transition" data-testid={`button-delete-${criteria.id}`}>
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
      )}
    </div>
  );
}
