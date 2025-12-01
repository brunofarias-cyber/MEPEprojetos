import { useQuery } from "@tanstack/react-query";
import { ProjectCard } from "@/components/ProjectCard";
import type { ProjectWithTeacher } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function StudentProjects() {
  const { data: projects = [], isLoading } = useQuery<ProjectWithTeacher[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Todos os Projetos</h2>
          <p className="text-muted-foreground">Visualize todos os seus projetos e prazos.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-projects">
          Todos os Projetos
        </h2>
        <p className="text-muted-foreground">Visualize todos os seus projetos e prazos.</p>
      </div>

      {!Array.isArray(projects) || projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum projeto disponível
            </h3>
            <p className="text-muted-foreground text-center">
              Seus professores ainda não criaram projetos para você.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} showSubmitButton />
          ))}
        </div>
      )}
    </div>
  );
}
