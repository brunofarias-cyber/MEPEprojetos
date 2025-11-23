import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import type { ProjectWithTeacher } from "@shared/schema";

export default function CoordinatorKanban() {
  const { data: projects = [], isLoading } = useQuery<ProjectWithTeacher[]>({
    queryKey: ['/api/projects'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  const columns = [
    { id: 'Planejamento', title: 'Planejamento', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'Em Andamento', title: 'Em Andamento', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'Para Avaliação', title: 'Para Avaliação', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'Atrasado', title: 'Atrasado', color: 'bg-red-100 text-red-700 border-red-200' },
  ];

  const getProjectsByStatus = (status: string) => projects.filter(p => p.status === status);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-kanban">Kanban de Projetos</h2>
        <p className="text-muted-foreground">Visualize o status de todos os projetos da escola.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col" data-testid={`kanban-column-${column.id.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className={`${column.color} px-4 py-3 rounded-t-xl border flex items-center justify-between`}>
              <h3 className="font-bold text-sm uppercase tracking-wide">{column.title}</h3>
              <span className="font-bold text-sm" data-testid={`text-count-${column.id.toLowerCase().replace(/\s+/g, '-')}`}>
                {getProjectsByStatus(column.id).length}
              </span>
            </div>
            
            <div className="bg-muted/30 border border-t-0 border-border rounded-b-xl p-4 space-y-3 min-h-[400px]">
              {getProjectsByStatus(column.id).map((project) => (
                <div 
                  key={project.id} 
                  className="bg-card border border-card-border p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer hover-elevate"
                  data-testid={`kanban-card-${project.id}`}
                >
                  <h4 className="font-bold text-foreground mb-2 text-sm" data-testid={`text-kanban-title-${project.id}`}>
                    {project.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">{project.subject}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="users" size={12} />
                      <span>{project.students}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="book" size={12} />
                      <span>{project.teacherName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
