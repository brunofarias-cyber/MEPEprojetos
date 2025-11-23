import { ProjectCard } from "@/components/ProjectCard";
import type { ProjectWithTeacher } from "@shared/schema";

interface StudentProjectsProps {
  projects: ProjectWithTeacher[];
}

export default function StudentProjects({ projects }: StudentProjectsProps) {
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-projects">Todos os Projetos</h2>
        <p className="text-muted-foreground">Visualize todos os seus projetos e prazos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} showSubmitButton />
        ))}
      </div>
    </div>
  );
}
