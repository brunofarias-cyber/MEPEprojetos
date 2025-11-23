import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import type { ProjectWithTeacher } from "@shared/schema";

export default function TeacherDashboard() {
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

  const stats = [
    { label: "Projetos Ativos", value: projects.filter(p => p.status === "Em Andamento").length, icon: "book", color: "text-blue-600 bg-blue-50" },
    { label: "Alunos Engajados", value: projects.reduce((sum, p) => sum + p.students, 0), icon: "users", color: "text-green-600 bg-green-50" },
    { label: "Entregas Pendentes", value: projects.filter(p => p.status === "Para Avaliação").length, icon: "clock", color: "text-purple-600 bg-purple-50" },
    { label: "Taxa de Conclusão", value: "85%", icon: "award", color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-dashboard">Visão Geral</h2>
        <p className="text-muted-foreground">Acompanhe o progresso dos seus projetos em tempo real.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card border border-card-border p-6 rounded-xl shadow-sm" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground" data-testid={`text-stat-value-${idx}`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <Icon name={stat.icon} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-foreground">Projetos em Andamento</h3>
          <CreateProjectModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
