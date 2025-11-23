import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import type { RubricCriteria, ProjectWithTeacher } from "@shared/schema";

export default function TeacherRubrics() {
  // Fetch projects to allow selection
  const { data: projects = [] } = useQuery<ProjectWithTeacher[]>({
    queryKey: ['/api/projects'],
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground" data-testid="heading-rubrics">Rubricas de Avaliação</h2>
          <p className="text-muted-foreground">Critérios para os projetos ativos.</p>
        </div>
        <button className="bg-background border border-primary/20 text-primary px-5 py-2.5 rounded-xl font-semibold hover-elevate flex items-center gap-2 transition shadow-sm" data-testid="button-import-rubric">
          <Icon name="upload" size={18} /> Importar Rubrica (Excel/CSV)
        </button>
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
                            value={criteria.weight}
                            className="flex-1"
                            data-testid={`slider-weight-${criteria.id}`}
                            disabled
                          />
                          <span className="font-bold text-primary w-12 text-right" data-testid={`text-weight-${criteria.id}`}>{criteria.weight}%</span>
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
              Total de Pesos: <strong className="text-foreground">{projectRubrics.reduce((sum, c) => sum + c.weight, 0)}%</strong>
            </p>
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 shadow-md flex items-center gap-2 transition" data-testid="button-save-rubric">
              <Icon name="check" size={18} /> Salvar Rubrica
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
