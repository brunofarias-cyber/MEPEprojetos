import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ProjectWithTeacher, RubricCriteria } from "@shared/schema";

interface ProjectDetailsModalProps {
  project: ProjectWithTeacher;
  children?: React.ReactNode;
}

export function ProjectDetailsModal({ project, children }: ProjectDetailsModalProps) {
  const { data: rubrics = [] } = useQuery<RubricCriteria[]>({
    queryKey: [`/api/rubrics/${project.id}`],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planejamento": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Em Andamento": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Para Avaliação": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "Concluído": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const stages = [
    { name: "Pesquisa", description: "Investigação e coleta de informações", completed: project.progress >= 25 },
    { name: "Prototipagem", description: "Desenvolvimento de protótipos e ideias", completed: project.progress >= 50 },
    { name: "Implementação", description: "Execução do projeto", completed: project.progress >= 75 },
    { name: "Apresentação", description: "Entrega e demonstração final", completed: project.progress >= 100 },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" data-testid={`button-details-${project.id}`}>
            <Icon name="eye" size={16} className="mr-2" />
            Ver Detalhes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {project.subject}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-foreground">Progresso do Projeto</h3>
              <span className="text-sm font-bold text-primary">{project.progress}%</span>
            </div>
            <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stages */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Etapas do Projeto</h3>
            <div className="space-y-3">
              {stages.map((stage, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    stage.completed 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                      : "bg-muted/50 border-border"
                  }`}
                  data-testid={`stage-${idx}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    stage.completed 
                      ? "bg-green-500 text-white" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {stage.completed ? (
                      <Icon name="check" size={18} />
                    ) : (
                      <span className="text-sm font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{stage.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rubrics */}
          {rubrics.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4">Critérios de Avaliação</h3>
              <div className="space-y-2">
                {rubrics.map((rubric) => (
                  <div 
                    key={rubric.id} 
                    className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border"
                    data-testid={`rubric-${rubric.id}`}
                  >
                    <span className="text-sm font-medium text-foreground">{rubric.criteria}</span>
                    <Badge variant="outline">{rubric.weight}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Próximo Prazo</p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                <Icon name="calendar" size={14} />
                {project.nextDeadline ? new Date(project.nextDeadline).toLocaleDateString('pt-BR') : 'Não definido'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Alunos Participantes</p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                <Icon name="users" size={14} />
                {project.students}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
