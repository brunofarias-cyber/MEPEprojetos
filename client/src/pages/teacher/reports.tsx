import { Icon } from "@/components/Icon";
import type { BnccCompetency } from "@shared/schema";

interface TeacherReportsProps {
  competencies: BnccCompetency[];
}

export default function TeacherReports({ competencies }: TeacherReportsProps) {
  const mockCompetencies = [
    { name: "Pensamento Científico, Crítico e Criativo", progress: 90 },
    { name: "Repertório Cultural", progress: 65 },
    { name: "Comunicação", progress: 80 },
    { name: "Cultura Digital", progress: 100 },
    { name: "Trabalho e Projeto de Vida", progress: 45 },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-foreground" data-testid="heading-reports">Relatórios BNCC</h2>
          <p className="text-muted-foreground">Acompanhamento das competências desenvolvidas.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 shadow-md flex items-center gap-2 transition" data-testid="button-export-pdf">
          <Icon name="download" size={18} /> Exportar PDF
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-card-border p-6 rounded-2xl shadow-sm">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Cobertura Total</p>
          <p className="text-4xl font-extrabold text-primary mt-2" data-testid="text-coverage-total">85%</p>
          <p className="text-xs text-muted-foreground mt-1">das competências gerais trabalhadas.</p>
        </div>
        <div className="bg-card border border-card-border p-6 rounded-2xl shadow-sm">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Turma Destaque</p>
          <p className="text-xl font-bold text-foreground mt-3" data-testid="text-top-class">1º Ano A</p>
          <p className="text-xs text-green-600 font-bold mt-1">92% de aderência</p>
        </div>
        <div className="bg-card border border-card-border p-6 rounded-2xl shadow-sm">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Área de Foco</p>
          <p className="text-xl font-bold text-foreground mt-3" data-testid="text-focus-area">Ciências da Natureza</p>
          <p className="text-xs text-muted-foreground mt-1">3 Projetos ativos</p>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-lg text-foreground">Matriz de Competências (Gerais)</h3>
        </div>
        <div className="divide-y divide-border">
          {mockCompetencies.map((comp, idx) => (
            <div key={idx} className="p-6 hover-elevate transition" data-testid={`competency-${idx}`}>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-foreground text-sm" data-testid={`text-competency-name-${idx}`}>{comp.name}</span>
                <span className="font-bold text-primary text-sm" data-testid={`text-competency-progress-${idx}`}>{comp.progress}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${comp.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
