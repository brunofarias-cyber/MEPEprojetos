import { Link } from "wouter";
import { Icon } from "./Icon";
import { Button } from "./ui/button";
import type { ProjectWithTeacher } from "@shared/schema";

interface ProjectCardProps {
  project: ProjectWithTeacher;
  onSubmit?: () => void;
  showSubmitButton?: boolean;
  showDetailsButton?: boolean;
}

export function ProjectCard({ project, onSubmit, showSubmitButton = false, showDetailsButton = true }: ProjectCardProps) {
  const getThemeColors = (theme: string) => {
    const themes = {
      green: 'from-green-500 to-emerald-500',
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      red: 'from-red-500 to-orange-500',
    };
    return themes[theme as keyof typeof themes] || themes.blue;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Planejamento': 'bg-blue-100 text-blue-700',
      'Em Andamento': 'bg-green-100 text-green-700',
      'Para Avaliação': 'bg-purple-100 text-purple-700',
      'Atrasado': 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || colors['Planejamento'];
  };

  return (
    <div className="bg-card border border-card-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all hover-elevate" data-testid={`card-project-${project.id}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-card-foreground mb-2" data-testid={`text-project-title-${project.id}`}>{project.title}</h3>
          <p className="text-sm text-muted-foreground" data-testid={`text-project-subject-${project.id}`}>{project.subject}</p>
        </div>
        <span className={`px-4 py-1 rounded-full text-xs font-bold ${getStatusColor(project.status)}`} data-testid={`badge-project-status-${project.id}`}>
          {project.status}
        </span>
      </div>

      <div className={`h-2 bg-muted rounded-full overflow-hidden mb-4`}>
        <div
          className={`h-full bg-gradient-to-r ${getThemeColors(project.theme)} rounded-full transition-all duration-1000`}
          style={{ width: `${project.progress}%` }}
          data-testid={`progress-bar-${project.id}`}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <Icon name="users" size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground" data-testid={`text-student-count-${project.id}`}>{project.students} Alunos</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="calendar" size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground" data-testid={`text-deadline-${project.id}`}>
            {project.nextDeadline ? new Date(project.nextDeadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
          </span>
        </div>
      </div>

      {project.deadlineLabel && (
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <p className="text-xs text-muted-foreground mb-1">Próxima Entrega</p>
          <p className="text-sm font-semibold text-foreground" data-testid={`text-deadline-label-${project.id}`}>{project.deadlineLabel}</p>
        </div>
      )}

      {showDetailsButton && !showSubmitButton && (
        <Link href={`/project/${project.id}`}>
          <a className="w-full">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              data-testid={`button-details-${project.id}`}
            >
              <Icon name="eye" size={18} />
              Ver Detalhes
            </Button>
          </a>
        </Link>
      )}

      {showSubmitButton && onSubmit && (
        <button
          onClick={onSubmit}
          data-testid={`button-submit-${project.id}`}
          className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-md"
        >
          <Icon name="upload" size={18} />
          Enviar Trabalho
        </button>
      )}

      {!showSubmitButton && !showDetailsButton && project.teacherName && (
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="book" size={16} className="text-primary" />
          </div>
          <span className="text-sm text-muted-foreground" data-testid={`text-teacher-${project.id}`}>Prof. {project.teacherName}</span>
        </div>
      )}
    </div>
  );
}
