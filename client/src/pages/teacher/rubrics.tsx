import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { RubricCriteria } from "@shared/schema";

interface TeacherRubricsProps {
  rubrics: RubricCriteria[];
}

export default function TeacherRubrics({ rubrics }: TeacherRubricsProps) {
  const [criteriaList, setCriteriaList] = useState([
    { id: '1', criteria: "Investigação Científica", weight: 40, levels: ["Não apresentou dados.", "Dados superficiais.", "Dados relevantes e bem analisados.", "Análise profunda com fontes extras."] },
    { id: '2', criteria: "Trabalho em Equipe", weight: 30, levels: ["Conflitos constantes.", "Colaboração mínima.", "Boa divisão de tarefas.", "Sinergia e apoio mútuo."] },
    { id: '3', criteria: "Comunicação Oral", weight: 30, levels: ["Leitura de slides.", "Fala pouco clara.", "Boa oratória.", "Apresentação engajadora e profissional."] }
  ]);

  const handleWeightChange = (id: string, weight: number) => {
    setCriteriaList(prev => prev.map(c => c.id === id ? { ...c, weight } : c));
  };

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

      <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-foreground">Projeto: Horta Sustentável Urbana</h3>
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
              {criteriaList.map((criteria) => (
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
                        onChange={(e) => handleWeightChange(criteria.id, parseInt(e.target.value))}
                        className="flex-1"
                        data-testid={`slider-weight-${criteria.id}`}
                      />
                      <span className="font-bold text-primary w-12 text-right" data-testid={`text-weight-${criteria.id}`}>{criteria.weight}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex gap-2 overflow-x-auto hide-scroll">
                      {criteria.levels.map((level, idx) => (
                        <span 
                          key={idx} 
                          className="inline-block px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full whitespace-nowrap border border-border"
                          data-testid={`badge-level-${criteria.id}-${idx}`}
                        >
                          {idx + 1}. {level}
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Total de Pesos: <strong className="text-foreground">100%</strong></p>
          <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 shadow-md flex items-center gap-2 transition" data-testid="button-save-rubric">
            <Icon name="check" size={18} /> Salvar Rubrica
          </button>
        </div>
      </div>
    </div>
  );
}
