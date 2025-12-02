import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Icon } from "@/components/Icon";
import { ProjectCard } from "@/components/ProjectCard";
import { SubmitEvidenceModal } from "@/components/SubmitEvidenceModal";
import { UpcomingDeadlines } from "@/components/UpcomingDeadlines";
import type { ProjectWithTeacher } from "@shared/schema";

export default function StudentHome() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<ProjectWithTeacher | null>(null);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectWithTeacher[]>({
    queryKey: ['/api/projects'],
  });

  // Get student data from user's roleData
  const studentXp = user?.roleData?.xp || 0;
  const studentLevel = user?.roleData?.level || 1;

  const xpForNextLevel = studentLevel * 1000;
  const xpProgress = (studentXp % 1000) / 10;

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: { type: 'file' | 'link'; link?: string; comment: string }) => {
    console.log('Submission data:', data);
    setSelectedProject(null);
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header with XP */}
      <div className="bg-card border border-card-border p-8 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
              <Icon name="rocket" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="heading-student-home">Bem-vindo de volta!</h2>
              <p className="text-muted-foreground">Continue suas missões e acumule XP.</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-primary" data-testid="text-student-level">Nível {studentLevel}</span>
            </div>
            <div className="w-64">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span data-testid="text-current-xp">{studentXp} XP</span>
                <span data-testid="text-next-level-xp">{xpForNextLevel} XP</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${xpProgress}%` }}
                  data-testid="progress-xp"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines Widget */}
      <UpcomingDeadlines />

      {/* Projects Grid */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-6">Meus Projetos Ativos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              showSubmitButton
              onSubmit={() => setSelectedProject(project)}
            />
          ))}
        </div>
      </div>

      {/* Submit Modal */}
      {selectedProject && (
        <SubmitEvidenceModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
