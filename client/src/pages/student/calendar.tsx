import { Icon } from "@/components/Icon";
import type { ProjectWithTeacher } from "@shared/schema";

interface StudentCalendarProps {
  projects: ProjectWithTeacher[];
}

export default function StudentCalendar({ projects }: StudentCalendarProps) {
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(a.nextDeadline || '').getTime() - new Date(b.nextDeadline || '').getTime()
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-calendar">Calendário de Entregas</h2>
        <p className="text-muted-foreground">Organize suas próximas entregas e não perca prazos.</p>
      </div>

      <div className="space-y-4">
        {sortedProjects.map((project) => (
          <div 
            key={project.id} 
            className="bg-card border border-card-border p-6 rounded-xl shadow-sm hover:shadow-md transition hover-elevate flex items-center gap-6"
            data-testid={`calendar-item-${project.id}`}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-primary" data-testid={`text-deadline-day-${project.id}`}>
                {new Date(project.nextDeadline || '').getDate()}
              </span>
              <span className="text-xs text-muted-foreground uppercase">
                {new Date(project.nextDeadline || '').toLocaleDateString('pt-BR', { month: 'short' })}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1" data-testid={`text-project-title-${project.id}`}>{project.title}</h3>
              <p className="text-sm text-muted-foreground" data-testid={`text-deadline-label-${project.id}`}>{project.deadlineLabel}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full text-xs font-bold ${
                project.status === 'Atrasado' 
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`} data-testid={`badge-status-${project.id}`}>
                {project.status === 'Atrasado' ? 'Atrasado' : 'No Prazo'}
              </div>
              <Icon name="calendar" size={20} className="text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
